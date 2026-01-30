/* eslint-disable */
"use client";

import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { decrypt } from "@/helper/security";
import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";

import styles from "@/app/app.module.css";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;

// ---------------------------------------------
const FONT_L1 = "11px";
const FONT_L2 = "10px";
const FONT_L3 = "9px";

// Format number
const fmt = (num) => Number(num || 0).toFixed(2);

// Split amount into DR/CR
const splitAmount = (amt) => {
  const v = Number(amt || 0);
  if (v > 0) return { dr: v, cr: 0 };
  if (v < 0) return { dr: 0, cr: Math.abs(v) };
  return { dr: 0, cr: 0 };
};

// ---------------------------------------------
// Helpers (sorting / normalize)
// ---------------------------------------------
const norm = (s = "") =>
  String(s).normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

const sortTopLevelPnL = (entries) => {
  const order = {
    expense: 0,
    income: 1,
    "gross profit": 2,
    "gross loss": 2,
    "net profit": 3,
    "net loss": 3,
  };

  // stable sort
  return entries
    .map((e, idx) => ({ e, idx }))
    .sort((a, b) => {
      const ka = norm(a.e[0]);
      const kb = norm(b.e[0]);
      const oa = order[ka] ?? 99;
      const ob = order[kb] ?? 99;
      if (oa !== ob) return oa - ob;
      return a.idx - b.idx;
    })
    .map((x) => x.e);
};

// ---------------------------------------------
// Build tree (dedup-safe)
// showAllLevels = true => 6 levels
// showAllLevels = false => 3 levels
// ---------------------------------------------
const buildTree = (data, showAllLevels) => {
  const root = {};

  (Array.isArray(data) ? data : []).forEach((row) => {
    const bsName = row?.BalanceSheetName;

    const isSpecialRow =
      bsName === "Net Profit" ||
      bsName === "Net Loss" ||
      bsName === "Gross Profit" ||
      bsName === "Gross Loss";

    const open =
      row.OpeningDrAmt !== undefined
        ? {
            dr: Number(row.OpeningDrAmt || 0),
            cr: Number(row.OpeningCrAmt || 0),
          }
        : splitAmount(row.openingBalance);

    const tran =
      row.TransactionDrAmt !== undefined
        ? {
            dr: Number(row.TransactionDrAmt || 0),
            cr: Number(row.TransactionCrAmt || 0),
          }
        : splitAmount(row.transactionBalance);

    const close =
      row.ClosingDrAmt !== undefined
        ? {
            dr: Number(row.ClosingDrAmt || 0),
            cr: Number(row.ClosingCrAmt || 0),
          }
        : splitAmount(row.closingBalance);

    // ✅ SINGLE ROW FOR NET + GROSS (NO CHILD)
    if (isSpecialRow) {
      if (!root[bsName]) {
        root[bsName] = { __rows: [], __children: {} };
      }
      root[bsName].__rows.push({
        name: bsName,
        OpeningDrAmt: open.dr,
        OpeningCrAmt: open.cr,
        TransactionDrAmt: tran.dr,
        TransactionCrAmt: tran.cr,
        ClosingDrAmt: close.dr,
        ClosingCrAmt: close.cr,
        isNet: !!row.isNet,
        isGross: !!row.isGross,
      });
      return;
    }

    // ✅ NORMAL LEDGER ROW
    const displayName = row?.glName || "";

    const ledgerRow = {
      name: displayName,
      OpeningDrAmt: open.dr,
      OpeningCrAmt: open.cr,
      TransactionDrAmt: tran.dr,
      TransactionCrAmt: tran.cr,
      ClosingDrAmt: close.dr,
      ClosingCrAmt: close.cr,
      isGross: !!row.isGross,
      isNet: !!row.isNet,
    };

    const rawLevels = showAllLevels
      ? [
          row.BalanceSheetName,
          row.tb1GroupName,
          row.tb2GroupName,
          row.tb3GroupName,
          row.tb4GroupName,
          displayName,
        ]
      : [row.BalanceSheetName, row.tb1GroupName, displayName];

    // ✅ IMPORTANT: drop blanks to avoid empty-node loops
    const levels = rawLevels.filter((x) => String(x || "").trim() !== "");

    let current = root;

    levels.forEach((level, idx) => {
      if (!current[level]) current[level] = { __rows: [], __children: {} };

      // capture Direct/Indirect only for Level-1 nodes (tb1GroupName under BS)
      if (idx === 1 && current[level].__grpType == null) {
        current[level].__grpType = row.tbGrouptype || ""; // "D" or "I"
      }

      if (idx === levels.length - 1) {
        current[level].__rows.push(ledgerRow);
      }

      current = current[level].__children;
    });
  });

  return root;
};

// ---------------------------------------------
// Sum totals (normal row display)
// ---------------------------------------------
const sumLevelTotals = (rows) => {
  const totals = {
    OpeningDrAmt: 0,
    OpeningCrAmt: 0,
    TransactionDrAmt: 0,
    TransactionCrAmt: 0,
    ClosingDrAmt: 0,
    ClosingCrAmt: 0,
  };

  (rows || []).forEach((r) => {
    totals.OpeningDrAmt += Number(r.OpeningDrAmt || 0);
    totals.OpeningCrAmt += Number(r.OpeningCrAmt || 0);
    totals.TransactionDrAmt += Number(r.TransactionDrAmt || 0);
    totals.TransactionCrAmt += Number(r.TransactionCrAmt || 0);
    totals.ClosingDrAmt += Number(r.ClosingDrAmt || 0);
    totals.ClosingCrAmt += Number(r.ClosingCrAmt || 0);
  });

  return totals;
};

// for GRAND TOTAL – exclude Gross / Net
const sumLevelTotalsForGrand = (rows) => {
  const totals = {
    OpeningDrAmt: 0,
    OpeningCrAmt: 0,
    TransactionDrAmt: 0,
    TransactionCrAmt: 0,
    ClosingDrAmt: 0,
    ClosingCrAmt: 0,
  };

  (rows || []).forEach((r) => {
    if (r?.isGross) return;
    if (r?.isNet) return;

    totals.OpeningDrAmt += Number(r.OpeningDrAmt || 0);
    totals.OpeningCrAmt += Number(r.OpeningCrAmt || 0);
    totals.TransactionDrAmt += Number(r.TransactionDrAmt || 0);
    totals.TransactionCrAmt += Number(r.TransactionCrAmt || 0);
    totals.ClosingDrAmt += Number(r.ClosingDrAmt || 0);
    totals.ClosingCrAmt += Number(r.ClosingCrAmt || 0);
  });

  return totals;
};

const getBase64FromUrl = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(",")[1]);
    reader.readAsDataURL(blob);
  });
};

const getColumns = (_selectedRadio, selectedRadioType) => {
  const col = {
    O: ["Ledger Name", "OpeningDrAmt", "OpeningCrAmt"],
    C: ["Ledger Name", "ClosingDrAmt", "ClosingCrAmt"],
    E: [
      "Ledger Name",
      "OpeningDrAmt",
      "OpeningCrAmt",
      "TransactionDrAmt",
      "TransactionCrAmt",
      "ClosingDrAmt",
      "ClosingCrAmt",
    ],
  };
  return col[selectedRadioType] || col.E;
};

const getColumnLabel = (key) => {
  const map = {
    OpeningDrAmt: "Opening Dr",
    OpeningCrAmt: "Opening Cr",
    TransactionDrAmt: "Transaction Dr",
    TransactionCrAmt: "Transaction Cr",
    ClosingDrAmt: "Closing Dr",
    ClosingCrAmt: "Closing Cr",
  };
  return map[key] || key;
};

// ============================================================
// ⭐ COMPONENT WITH FORWARD REF
// ============================================================
const BalanceDetailedGrid = forwardRef(
  (
    {
      balanceSheetData,
      selectedRadio, // "S" or "D"
      selectedRadioType, // "E" / "O" / "C"
      netProfit,
      grossProfit,
      reportType, // "P" or "B"
      toggle,
    },
    ref,
  ) => {
    if (!balanceSheetData || balanceSheetData.length === 0)
      return <div>No Data Found</div>;

    const isDetailMode = selectedRadio === "D";

    // ==========================================================
    // ✅ CREATE SAFE WORKING COPY WITH NET & GROSS INJECTED
    // ==========================================================
    const mergedData = useMemo(() => {
      const base = Array.isArray(balanceSheetData) ? [...balanceSheetData] : [];

      // Remove any existing injected rows (safety)
      let cleaned = base.filter(
        (r) =>
          r?.BalanceSheetName !== "Net Profit" &&
          r?.BalanceSheetName !== "Net Loss" &&
          r?.BalanceSheetName !== "Gross Profit" &&
          r?.BalanceSheetName !== "Gross Loss",
      );

      const netProfitValue = Number(netProfit || 0);

      // NET PROFIT / LOSS
      if (!Number.isNaN(netProfitValue) && netProfitValue !== 0) {
        cleaned.push({
          glName: null,
          BalanceSheetName: netProfitValue < 0 ? "Net Profit" : "Net Loss",
          tb1GroupName: null,
          tb2GroupName: null,
          tb3GroupName: null,
          tb4GroupName: null,
          openingBalance: 0,
          transactionBalance: netProfitValue,
          closingBalance: netProfitValue,
          isNet: true,
        });
      }

      // GROSS PROFIT / LOSS – only for D + P
      if (selectedRadio === "D" && reportType === "P") {
        const grossProfitValue = Number(grossProfit || 0);

        if (!Number.isNaN(grossProfitValue) && grossProfitValue !== 0) {
          const insertAfterIndex = cleaned.findIndex(
            (r) => r?.tbGrouptype === "D",
          );

          const grossRow = {
            glName: "Gross",
            BalanceSheetName:
              grossProfitValue < 0 ? "Gross Profit" : "Gross Loss",
            tb1GroupName: null,
            tb2GroupName: null,
            tb3GroupName: null,
            tb4GroupName: null,
            OpeningDrAmt: 0,
            OpeningCrAmt: 0,
            TransactionDrAmt: grossProfitValue > 0 ? grossProfitValue : 0,
            TransactionCrAmt:
              grossProfitValue < 0 ? Math.abs(grossProfitValue) : 0,
            ClosingDrAmt: grossProfitValue > 0 ? grossProfitValue : 0,
            ClosingCrAmt: grossProfitValue < 0 ? Math.abs(grossProfitValue) : 0,
            isGross: true,
          };

          if (insertAfterIndex !== -1)
            cleaned.splice(insertAfterIndex + 1, 0, grossRow);
          else cleaned.push(grossRow);
        }
      }

      return cleaned;
    }, [balanceSheetData, netProfit, grossProfit, selectedRadio, reportType]);

    // 🔹 build tree using 6 or 2 levels
    const tree = useMemo(
      () => buildTree(mergedData, isDetailMode),
      [mergedData, isDetailMode],
    );

    const isGrossKey = (k = "") => {
      const x = norm(k);
      return x === "gross profit" || x === "gross loss";
    };

    const isNetKey = (k = "") => {
      const x = norm(k);
      return x === "net profit" || x === "net loss";
    };

    // ✅ SORTER (kept same logic, but reused for UI + exports)
    const getSortedEntries = (node, level, parentKey) => {
      let entries = Object.entries(node || {});
      const isPnLDetailOrder = selectedRadio === "D" && reportType === "P";

      // TOP LEVEL ORDER (P&L D)
      if (isPnLDetailOrder && level === 0) {
        return sortTopLevelPnL(entries);
      }

      // Level-1 under Expense/Income: Direct then Indirect
      if (
        reportType === "P" &&
        level === 1 &&
        (parentKey === "Income" || parentKey === "Expense")
      ) {
        const order = { D: 0, I: 1 };
        return entries.sort((a, b) => {
          const ga = order[a[1]?.__grpType] ?? 99;
          const gb = order[b[1]?.__grpType] ?? 99;
          if (ga !== gb) return ga - gb;
          return a[0].localeCompare(b[0]);
        });
      }

      return entries;
    };

    const columns = useMemo(
      () => getColumns(selectedRadio, selectedRadioType),
      [selectedRadio, selectedRadioType],
    );

    const makeEmptyTotals = () => ({
      OpeningDrAmt: 0,
      OpeningCrAmt: 0,
      TransactionDrAmt: 0,
      TransactionCrAmt: 0,
      ClosingDrAmt: 0,
      ClosingCrAmt: 0,
    });

    const addTotals = (a, b) => ({
      OpeningDrAmt: a.OpeningDrAmt + b.OpeningDrAmt,
      OpeningCrAmt: a.OpeningCrAmt + b.OpeningCrAmt,
      TransactionDrAmt: a.TransactionDrAmt + b.TransactionDrAmt,
      TransactionCrAmt: a.TransactionCrAmt + b.TransactionCrAmt,
      ClosingDrAmt: a.ClosingDrAmt + b.ClosingDrAmt,
      ClosingCrAmt: a.ClosingCrAmt + b.ClosingCrAmt,
    });

    // Sum totals for a node (includes all descendants)
    const sumNodeTotals = (node) => {
      let total = makeEmptyTotals();

      const walk = (n) => {
        total = addTotals(total, sumLevelTotals(n.__rows || []));
        Object.values(n.__children || {}).forEach(walk);
      };

      walk(node);
      return total;
    };

    // Sum totals for grand (excludes Gross/Net)
    const sumNodeTotalsForGrandNode = (node) => {
      let total = makeEmptyTotals();

      const walk = (n) => {
        total = addTotals(total, sumLevelTotalsForGrand(n.__rows || []));
        Object.values(n.__children || {}).forEach(walk);
      };

      walk(node);
      return total;
    };

    const computeGrandTotal = () => {
      let total = makeEmptyTotals();
      Object.values(tree).forEach((node) => {
        total = addTotals(total, sumNodeTotalsForGrandNode(node));
      });
      return total;
    };

    const grandTotal = useMemo(() => computeGrandTotal(), [tree]);

    // ==========================================================
    // ✅ FIX: UI REPEATING ISSUE
    // Root cause in your code:
    // - renderTree() recursed children
    // - renderNode() ALSO recursed children
    // That printed the same branches twice.
    //
    // ✅ Now: renderNodeRow() renders ONLY the single row.
    // Recursion happens ONLY in renderTree()/walkAll().
    // ==========================================================

    const renderNodeRow = (key, value, level = 0, parentKey = null) => {
      const totals = sumNodeTotals(value);

      if (!isDetailMode && level > 1) return null;

      const isLeaf =
        !value.__children || Object.keys(value.__children).length === 0;

      const hasSpecial = (value.__rows || []).some(
        (r) => r?.isGross || r?.isNet,
      );

      const isBold = hasSpecial ? true : isDetailMode ? !isLeaf : level === 0;

      return (
        <TableRow
          key={`${parentKey || "ROOT"}-${key}-${level}`}
          sx={{
            transition: "background-color 0.15s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(126,155,207,0.18)",
              cursor: "pointer",
            },
          }}
        >
          <TableCell sx={{ fontWeight: isBold ? "bold" : "normal" }}>
            <Box
              sx={{
                ml: level * 3,
                fontSize:
                  level === 0 ? FONT_L1 : level === 1 ? FONT_L2 : FONT_L3,
                color: "var(--tableRowTextColor)",
                fontWeight: isBold ? "bold" : "normal",
              }}
            >
              {key}
            </Box>
          </TableCell>

          {columns.slice(1).map((c, i) => (
            <TableCell
              key={`${key}-${c}-${i}`}
              align="right"
              sx={{
                fontWeight: isBold ? "bold" : "normal",
                fontSize:
                  level === 0 ? FONT_L1 : level === 1 ? FONT_L2 : FONT_L3,
                color: "var(--tableRowTextColor)",
              }}
            >
              {fmt(totals[c] || 0)}
            </TableCell>
          ))}
        </TableRow>
      );
    };

    const renderSection = (title, key) => (
      <TableRow key={key}>
        <TableCell sx={{ fontWeight: "bold", fontSize: FONT_L1 }}>
          {title}
        </TableCell>
        {columns.slice(1).map((_, i) => (
          <TableCell key={i} align="right" />
        ))}
      </TableRow>
    );

    // ==========================================================
    // ⭐ EXPORT TO EXCEL
    // ==========================================================
    const exportToExcel = async () => {
      if (!mergedData || mergedData.length === 0) {
        alert("No data to export");
        return;
      }

      const storedUserData = localStorage.getItem("userData");
      let imageHeader = null;

      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        imageHeader = userData?.[0]?.headerLogoPath
          ? baseUrlNext + userData[0].headerLogoPath
          : null;
      }

      let logoBase64 = null;
      if (imageHeader) logoBase64 = await getBase64FromUrl(imageHeader);

      const localTree = buildTree(mergedData, isDetailMode);
      const localColumns = getColumns(selectedRadio, selectedRadioType);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Trial Balance", {
        properties: { defaultRowHeight: 18 },
      });

      // HEADER LOGO
      if (logoBase64) {
        const imageId = workbook.addImage({
          base64: logoBase64,
          extension: "png",
        });
        sheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          br: { col: 6, row: 4 },
          editAs: "oneCell",
        });
      }

      sheet.addRow([]);
      sheet.addRow([]);

      // TABLE HEADER
      const headerRow = sheet.addRow(
        localColumns.map((c) => (c === "Ledger Name" ? "" : getColumnLabel(c))),
      );

      headerRow.eachCell((cell) => {
        cell.font = { bold: true, size: 11, color: { argb: "FFFFFF" } };
        cell.alignment = { horizontal: "center" };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "7E9BCF" },
        };
        cell.border = {};
      });

      const STYLES = {
        L1: { font: { bold: true, size: 11 } },
        L2_BOLD: { font: { bold: true, size: 10 } },
        L2_NORMAL: { font: { bold: false, size: 10 } },
        L3: { font: { bold: false, size: 9 } },
      };

      const setNumber = (cell, value) => {
        if (value === "" || value === null || value === undefined) {
          cell.value = "";
          cell.border = {};
          return;
        }
        const num = Number(value ?? 0);
        cell.value = num;
        cell.numFmt = "0.00";
        cell.alignment = { horizontal: "right" };
        cell.border = {};
      };

      const applyBorderless = (row) =>
        row.eachCell((cell) => (cell.border = {}));

      const writeNodeRow = (key, value, level = 0) => {
        const totals = sumNodeTotals(value);

        const isLeaf =
          !value.__children || Object.keys(value.__children).length === 0;
        const hasSpecialRow = (value.__rows || []).some(
          (r) => r.isGross || r.isNet,
        );

        const isBold = hasSpecialRow
          ? true
          : isDetailMode
            ? !isLeaf
            : level === 0;

        const style =
          level === 0 ? STYLES.L1 : isBold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;

        const row = sheet.addRow([
          " ".repeat(level * 4) + key,
          ...localColumns.slice(1).map(() => ""),
        ]);

        row.getCell(1).style = style;

        localColumns.slice(1).forEach((c, i) => {
          const cell = row.getCell(i + 2);
          setNumber(cell, totals[c] || 0);
          cell.style = style;
        });

        applyBorderless(row);
      };

      const walkEntryExcel = ([k, v], level = 0, parentKey = null) => {
        if (!v) return;
        if (!isDetailMode && level > 1) return;

        writeNodeRow(k, v, level);

        getSortedEntries(v.__children || {}, level + 1, k).forEach((child) =>
          walkEntryExcel(child, level + 1, k),
        );
      };

      const pickGroups = (parentKey, parentNode, wantDirect) => {
        const children = parentNode?.__children || {};
        let entries = getSortedEntries(children, 1, parentKey);

        if (wantDirect)
          entries = entries.filter(([_, vv]) => (vv?.__grpType || "") === "D");
        else
          entries = entries.filter(([_, vv]) => (vv?.__grpType || "") !== "D");

        return entries;
      };

      const isPnLDetailOrder = selectedRadio === "D" && reportType === "P";

      if (!isPnLDetailOrder) {
        // Normal order
        getSortedEntries(localTree, 0, null).forEach((e) =>
          walkEntryExcel(e, 0, null),
        );
      } else {
        // P&L detail order
        const entries0 = Object.entries(localTree || {});
        const exp = entries0.find(([k]) => norm(k) === "expense");
        const inc = entries0.find(([k]) => norm(k) === "income");
        const gross = entries0.find(([k]) => isGrossKey(k));
        const net = entries0.find(([k]) => isNetKey(k));

        const rest = entries0.filter(([k]) => {
          const x = norm(k);
          if (x === "expense" || x === "income") return false;
          if (isGrossKey(k) || isNetKey(k)) return false;
          return true;
        });

        // Direct Expense groups
        if (exp)
          pickGroups("Expense", exp[1], true).forEach((e) =>
            walkEntryExcel(e, 1, "Expense"),
          );
        // Direct Income groups
        if (inc)
          pickGroups("Income", inc[1], true).forEach((e) =>
            walkEntryExcel(e, 1, "Income"),
          );
        // Gross
        if (gross) walkEntryExcel(gross, 0, "ROOT");
        // Indirect Expense groups
        if (exp)
          pickGroups("Expense", exp[1], false).forEach((e) =>
            walkEntryExcel(e, 1, "Expense"),
          );
        // Indirect Income groups
        if (inc)
          pickGroups("Income", inc[1], false).forEach((e) =>
            walkEntryExcel(e, 1, "Income"),
          );
        // Rest
        rest.forEach((e) => walkEntryExcel(e, 0, "ROOT"));
        // Net last
        if (net) walkEntryExcel(net, 0, "ROOT");
      }

      // GRAND TOTAL (excludes Gross/Net)
      const gRow = sheet.addRow([
        "Grand Total",
        ...localColumns.slice(1).map(() => ""),
      ]);

      localColumns.slice(1).forEach((c, i) => {
        const cell = gRow.getCell(i + 2);
        setNumber(cell, grandTotal[c] || 0);
      });

      gRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "7E9BCF" },
        };
        cell.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
        cell.border = {};
      });

      // AUTO WIDTH
      sheet.columns.forEach((col) => {
        let max = 10;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const v = cell.value ? cell.value.toString() : "";
          max = Math.max(max, v.length);
        });
        col.width = max + 3;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "TrialBalance.xlsx");
    };

    // ==========================================================
    // ⭐ EXPORT TO PDF
    // ==========================================================
    const exportToPDF = async () => {
      if (!mergedData || mergedData.length === 0) {
        alert("No data to export");
        return;
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();

      // LOGO
      const storedUserData = localStorage.getItem("userData");
      let logoBase64 = null;

      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        if (userData?.[0]?.headerLogoPath) {
          const imageUrl = baseUrlNext + userData[0].headerLogoPath;
          logoBase64 = await getBase64FromUrl(imageUrl);
        }
      }

      const drawHeader = () => {
        if (logoBase64) doc.addImage(logoBase64, "PNG", 0, 0, pageWidth, 26);
      };

      drawHeader();

      const localTree = buildTree(mergedData, isDetailMode);
      const localColumns = getColumns(selectedRadio, selectedRadioType);
      const isPnLDetailOrder = selectedRadio === "D" && reportType === "P";

      const bodyRows = [];

      const pushNodeRow = (key, value, level = 0) => {
        if (!isDetailMode && level > 1) return;

        const totals = sumNodeTotals(value);
        const isLeaf =
          !value.__children || Object.keys(value.__children).length === 0;
        const hasSpecialRow = (value.__rows || []).some(
          (r) => r.isGross || r.isNet,
        );
        const shouldBold = hasSpecialRow
          ? true
          : isDetailMode
            ? !isLeaf
            : level === 0;

        bodyRows.push([
          " ".repeat(level * 4) + key,
          ...localColumns
            .slice(1)
            .map((c) => Number(totals[c] || 0).toFixed(2)),
          "__BOLD__:" + (shouldBold ? "1" : "0"),
        ]);
      };

      const walkEntryPdf = ([k, v], level = 0) => {
        if (!v) return;
        pushNodeRow(k, v, level);
        getSortedEntries(v.__children || {}, level + 1, k).forEach((child) =>
          walkEntryPdf(child, level + 1),
        );
      };

      const pickGroups = (parentKey, parentNode, wantDirect) => {
        const children = parentNode?.__children || {};
        let entries = getSortedEntries(children, 1, parentKey);

        if (wantDirect)
          entries = entries.filter(([_, vv]) => (vv?.__grpType || "") === "D");
        else
          entries = entries.filter(([_, vv]) => (vv?.__grpType || "") !== "D");

        return entries;
      };

      const pushSectionRow = (title) => {
        bodyRows.push([
          title,
          ...localColumns.slice(1).map(() => ""),
          "__SECTION__",
        ]);
      };

      if (!isPnLDetailOrder) {
        // Normal order
        getSortedEntries(localTree, 0, null).forEach((e) => walkEntryPdf(e, 0));
      } else {
        // P&L detail order with headings
        const entries0 = Object.entries(localTree || {});
        const exp = entries0.find(([k]) => norm(k) === "expense");
        const inc = entries0.find(([k]) => norm(k) === "income");
        const gross = entries0.find(([k]) => isGrossKey(k));
        const net = entries0.find(([k]) => isNetKey(k));

        const rest = entries0.filter(([k]) => {
          const x = norm(k);
          if (x === "expense" || x === "income") return false;
          if (isGrossKey(k) || isNetKey(k)) return false;
          return true;
        });

        if (exp) {
          pushSectionRow("Expense");
          pickGroups("Expense", exp[1], true).forEach((e) =>
            walkEntryPdf(e, 1),
          );
        }

        if (inc) {
          pushSectionRow("Income");
          pickGroups("Income", inc[1], true).forEach((e) => walkEntryPdf(e, 1));
        }

        if (gross) walkEntryPdf(gross, 0);

        if (exp) {
          const ind = pickGroups("Expense", exp[1], false);
          if (ind.length) {
            pushSectionRow("Expense");
            ind.forEach((e) => walkEntryPdf(e, 1));
          }
        }

        if (inc) {
          const ind = pickGroups("Income", inc[1], false);
          if (ind.length) {
            pushSectionRow("Income");
            ind.forEach((e) => walkEntryPdf(e, 1));
          }
        }

        if (rest.length) {
          pushSectionRow("Others");
          rest.forEach((e) => walkEntryPdf(e, 0));
        }

        if (net) walkEntryPdf(net, 0);
      }

      // Grand Total (exclude gross/net)
      bodyRows.push([
        "Grand Total",
        ...localColumns
          .slice(1)
          .map((c) => Number(grandTotal[c] || 0).toFixed(2)),
        "__BOLD__:1",
      ]);

      autoTable(doc, {
        startY: 38,
        margin: { top: 38, left: 5, right: 5 },
        head: [
          localColumns.map((c) =>
            c === "Ledger Name" ? "" : getColumnLabel(c),
          ),
        ],
        body: bodyRows.map((r) => r.slice(0, -1)),
        theme: "grid",
        styles: { fontSize: 7.2, cellPadding: 1.5, valign: "middle" },
        headStyles: {
          fillColor: [126, 155, 207],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          fontSize: 7.6,
        },
        didParseCell: (data) => {
          const rawRow = bodyRows[data.row.index];
          if (!rawRow) return;

          const flag = rawRow[rawRow.length - 1];

          if (flag === "__SECTION__") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [126, 155, 207];
            data.cell.styles.textColor = 255;
            data.cell.styles.halign =
              data.column.index === 0 ? "left" : "right";
          }

          if (flag === "__BOLD__:1") data.cell.styles.fontStyle = "bold";
        },
        didDrawPage: drawHeader,
      });

      doc.save("TrialBalance.pdf");
    };

    useImperativeHandle(ref, () => ({
      exportToExcel,
      exportToPDF,
    }));

    // ==========================================================
    // UI RENDER
    // ==========================================================
    return (
      <Paper
        sx={{
          boxShadow: "none",
          overflowX: "auto",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          backgroundColor: "var(--commonBg)",
          border: "1px solid var(--tableRowTextColor)",
        }}
      >
        <div
          className={`${styles.thinScrollBar}`}
          style={{ maxHeight: toggle ? "60vh" : "80vh", overflowY: "auto" }}
        >
          <Table
            size="small"
            sx={{
              borderCollapse: "collapse",
              backgroundColor: "var(--commonBg)",
              "& td, & th": {
                border: "none !important",
                padding: "3px 6px !important",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backgroundColor: "var(--tableHeaderBg)",
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col}
                    align={col === "Ledger Name" ? "left" : "right"}
                    sx={{
                      letterSpacing: "normal",
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: FONT_L1,
                    }}
                  >
                    {col === "Ledger Name" ? "" : getColumnLabel(col)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {(() => {
                const isPnLDetailOrder =
                  selectedRadio === "D" && reportType === "P";

                // ✅ normal full recursion (single recursion, no double-print)
                const renderTree = (node, level = 0, parentKey = null) => {
                  return getSortedEntries(node, level, parentKey).flatMap(
                    ([key, value]) => {
                      const rows = [];
                      const rowEl = renderNodeRow(key, value, level, parentKey);
                      if (rowEl) rows.push(rowEl);

                      // recurse only here (NOT inside renderNodeRow)
                      if (isDetailMode || level < 2) {
                        rows.push(
                          ...renderTree(value.__children || {}, level + 1, key),
                        );
                      }
                      return rows;
                    },
                  );
                };

                // ✅ Default behavior
                if (!isPnLDetailOrder) {
                  return renderTree(tree, 0, null);
                }

                // ✅ PnL Detail custom order:
                const entries0 = Object.entries(tree || {});
                const exp = entries0.find(([k]) => norm(k) === "expense");
                const inc = entries0.find(([k]) => norm(k) === "income");
                const gross = entries0.find(([k]) => isGrossKey(k));
                const net = entries0.find(([k]) => isNetKey(k));

                const rest = entries0.filter(([k]) => {
                  const x = norm(k);
                  if (x === "expense" || x === "income") return false;
                  if (isGrossKey(k) || isNetKey(k)) return false;
                  return true;
                });

                const pickGroups = (parentKey, parentNode, wantDirect) => {
                  const children = parentNode?.__children || {};
                  const groups = getSortedEntries(children, 1, parentKey);
                  return wantDirect
                    ? groups.filter(([_, v]) => (v?.__grpType || "") === "D")
                    : groups.filter(([_, v]) => (v?.__grpType || "") !== "D");
                };

                const out = [];

                const walkAll = ([k, v], level = 0, parentKey = null) => {
                  const rowEl = renderNodeRow(k, v, level, parentKey);
                  if (rowEl) out.push(rowEl);
                  getSortedEntries(v.__children || {}, level + 1, k).forEach(
                    (child) => walkAll(child, level + 1, k),
                  );
                };

                // 1) Direct Expenses
                if (exp) {
                  out.push(renderSection("Expense", "SEC-EXP-D"));
                  pickGroups("Expense", exp[1], true).forEach((e) =>
                    walkAll(e, 1, "Expense"),
                  );
                }

                // 2) Direct Incomes
                if (inc) {
                  out.push(renderSection("Income", "SEC-INC-D"));
                  pickGroups("Income", inc[1], true).forEach((e) =>
                    walkAll(e, 1, "Income"),
                  );
                }

                // 3) Gross
                if (gross) walkAll(gross, 0, "ROOT");

                // 4) Indirect Expenses
                if (exp) {
                  const ind = pickGroups("Expense", exp[1], false);
                  if (ind.length)
                    out.push(renderSection("Expense", "SEC-EXP-I"));
                  ind.forEach((e) => walkAll(e, 1, "Expense"));
                }

                // 5) Indirect Incomes
                if (inc) {
                  const ind = pickGroups("Income", inc[1], false);
                  if (ind.length)
                    out.push(renderSection("Income", "SEC-INC-I"));
                  ind.forEach((e) => walkAll(e, 1, "Income"));
                }

                // 6) Rest
                rest.forEach((e) => walkAll(e, 0, "ROOT"));

                // 7) Net last
                if (net) walkAll(net, 0, "ROOT");

                return out;
              })()}

              {/* ✅ GRAND TOTAL */}
              <TableRow
                sx={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 3,
                  backgroundColor: "var(--tableHeaderBg)",
                }}
              >
                <TableCell sx={{ fontWeight: "bold", color: "#FFF" }}>
                  Grand Total
                </TableCell>

                {columns.slice(1).map((c, i) => (
                  <TableCell
                    key={i}
                    align="right"
                    sx={{ fontWeight: "bold", color: "#FFF" }}
                  >
                    {fmt(grandTotal[c])}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Paper>
    );
  },
);

BalanceDetailedGrid.displayName = "BalanceDetailedGrid";
export default BalanceDetailedGrid;
