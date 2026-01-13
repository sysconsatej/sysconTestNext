/* eslint-disable */
import React, { forwardRef, useImperativeHandle } from "react";
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
  if (amt > 0) return { dr: amt, cr: 0 };
  if (amt < 0) return { dr: 0, cr: Math.abs(amt) };
  return { dr: 0, cr: 0 };
};

// ✅ TOP LEVEL ORDER ONLY (D + P)
// Expense first, then Income, then Gross, then Net
const topOrder = {
  expense: 0,
  income: 1,
  "gross profit": 2,
  "gross loss": 2,
  "net profit": 3,
  "net loss": 3,
};

// ---------------------------------------------
// Build Level1 → Level2 → Level3 structure
// ---------------------------------------------
const buildTree = (data, showAllLevels) => {
  const root = {};

  data.forEach((row) => {
    const isSpecialRow =
      row.BalanceSheetName === "Net Profit" ||
      row.BalanceSheetName === "Net Loss" ||
      row.BalanceSheetName === "Gross Profit" ||
      row.BalanceSheetName === "Gross Loss";

    const open =
      row.OpeningDrAmt !== undefined
        ? { dr: row.OpeningDrAmt, cr: row.OpeningCrAmt }
        : splitAmount(row.openingBalance);

    const tran =
      row.TransactionDrAmt !== undefined
        ? { dr: row.TransactionDrAmt, cr: row.TransactionCrAmt }
        : splitAmount(row.transactionBalance);

    const close =
      row.ClosingDrAmt !== undefined
        ? { dr: row.ClosingDrAmt, cr: row.ClosingCrAmt }
        : splitAmount(row.closingBalance);

    // ✅ SINGLE ROW FOR NET + GROSS (NO CHILD)
    if (isSpecialRow) {
      if (!root[row.BalanceSheetName]) {
        root[row.BalanceSheetName] = {
          __rows: [
            {
              name: row.BalanceSheetName,
              OpeningDrAmt: open.dr,
              OpeningCrAmt: open.cr,
              TransactionDrAmt: tran.dr,
              TransactionCrAmt: tran.cr,
              ClosingDrAmt: close.dr,
              ClosingCrAmt: close.cr,
              isNet: row.isNet || false,
              isGross: row.isGross || false,
            },
          ],
          __children: {},
        };
      }
      return; // ✅ STOP TREE BUILD HERE
    }

    // ✅ NORMAL LEDs
    const displayName = row.glName;

    const ledgerRow = {
      name: displayName,
      OpeningDrAmt: open.dr,
      OpeningCrAmt: open.cr,
      TransactionDrAmt: tran.dr,
      TransactionCrAmt: tran.cr,
      ClosingDrAmt: close.dr,
      ClosingCrAmt: close.cr,
      isGross: row.isGross || false,
      isNet: row.isNet || false,
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

    const levels = rawLevels.filter(Boolean);

    let current = root;

    levels.forEach((level, idx) => {
      if (!current[level]) current[level] = { __rows: [], __children: {} };

      // ✅ capture Direct/Indirect only for Level-2 nodes (tb1GroupName)
      // Structure: Level-0 = BalanceSheetName, Level-1 = tb1GroupName
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

  // stable sort (keeps original order within same bucket)
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
// Sum totals (for normal row display)
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

  rows.forEach((r) => {
    totals.OpeningDrAmt += r.OpeningDrAmt;
    totals.OpeningCrAmt += r.OpeningCrAmt;
    totals.TransactionDrAmt += r.TransactionDrAmt;
    totals.TransactionCrAmt += r.TransactionCrAmt;
    totals.ClosingDrAmt += r.ClosingDrAmt;
    totals.ClosingCrAmt += r.ClosingCrAmt;
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

  rows.forEach((r) => {
    if (r.isGross) return;
    if (r.isNet) return;

    totals.OpeningDrAmt += r.OpeningDrAmt;
    totals.OpeningCrAmt += r.OpeningCrAmt;
    totals.TransactionDrAmt += r.TransactionDrAmt;
    totals.TransactionCrAmt += r.TransactionCrAmt;
    totals.ClosingDrAmt += r.ClosingDrAmt;
    totals.ClosingCrAmt += r.ClosingCrAmt;
  });

  return totals;
};

const getBase64FromUrl = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.readAsDataURL(blob);
  });
};

const getColumns = (selectedRadio, selectedRadioType) => {
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
  return col[selectedRadioType] || [];
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
      selectedRadio,
      selectedRadioType,
      netProfit,
      grossProfit,
      reportType,
      toggle,
    },
    ref
  ) => {
    console.log("toggle value in BDG:", toggle);
    if (!balanceSheetData || balanceSheetData.length === 0)
      return <div>No Data Found</div>;
    const isDetailMode = selectedRadio === "D";
    // ==========================================================
    // ✅ CREATE SAFE WORKING COPY WITH NET & GROSS INJECTED
    // ==========================================================
    const mergedData = React.useMemo(() => {
      const base = Array.isArray(balanceSheetData) ? [...balanceSheetData] : [];

      const netProfitValue = netProfit || 0;

      let cleaned = base.filter(
        (r) =>
          r.BalanceSheetName !== "Net Profit" &&
          r.BalanceSheetName !== "Net Loss" &&
          r.BalanceSheetName !== "Gross Profit" &&
          r.BalanceSheetName !== "Gross Loss"
      );

      // NET PROFIT / LOSS
      if (!isNaN(netProfitValue) && netProfitValue !== 0) {
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
        if (!isNaN(grossProfitValue) && grossProfitValue !== 0) {
          const insertAfterIndex = cleaned.findIndex(
            (r) => r.tbGrouptype === "D"
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

          if (insertAfterIndex !== -1) {
            cleaned.splice(insertAfterIndex + 1, 0, grossRow);
          } else {
            cleaned.push(grossRow);
          }
        }
      }

      return cleaned;
    }, [balanceSheetData, netProfit, selectedRadio, selectedRadioType]);

    const buildPnLDetailVerticalOrder = ({
      data = [],
      grossProfit = 0,
      netProfit = 0,
    }) => {
      const norm = (s = "") => String(s).toLowerCase();

      const isDirect = (r) =>
        r?.tbGrouptype === "D" || norm(r?.tb1GroupName).includes("direct");

      const isIndirect = (r) =>
        r?.tbGrouptype === "I" || norm(r?.tb1GroupName).includes("indirect");

      const expense = data.filter((r) => r.BalanceSheetName === "Expense");
      const income = data.filter((r) => r.BalanceSheetName === "Income");

      const expDirect = expense.filter((r) => isDirect(r));
      const expIndirect = expense.filter((r) => !isDirect(r));

      const incDirect = income.filter((r) => isDirect(r));
      const incIndirect = income.filter((r) => !isDirect(r));

      const rows = [];

      // ✅ Section helper
      const addSection = (title) => rows.push({ __TYPE__: "SECTION", title });

      const addRow = (r) => rows.push({ __TYPE__: "ROW", row: r });

      const addSpecial = (title, amount, key) =>
        rows.push({
          __TYPE__: "SPECIAL",
          title,
          amount: Math.abs(Number(amount || 0)),
          key,
        });

      // 1) Expense -> Direct
      addSection("Expense");
      expDirect.forEach(addRow);

      // 2) Income -> Direct
      addSection("Income");
      incDirect.forEach(addRow);

      // 3) Gross Profit
      if (Number(grossProfit || 0) !== 0) {
        addSpecial("Gross Profit", grossProfit, "GROSS");
      }

      // 4) Expense -> Indirect
      if (expIndirect.length > 0) {
        addSection("Expense");
        expIndirect.forEach(addRow);
      }

      // 5) Income -> Indirect
      if (incIndirect.length > 0) {
        addSection("Income");
        incIndirect.forEach(addRow);
      }

      // 6) Net row
      if (Number(netProfit || 0) !== 0) {
        addSpecial(netProfit > 0 ? "Net Loss" : "Net Profit", netProfit, "NET");
      }

      return rows;
    };

    const isPnLDetail =
      selectedRadio === "D" &&
      (reportType === "P" || selectedRadioType === "P");

    const pnlOrderedRows = isPnLDetail
      ? buildPnLDetailVerticalOrder({
          data: balanceSheetData,
          grossProfit,
          netProfit,
        })
      : null;

    // 🔹 build tree using 6 or 2 levels
    const tree = buildTree(mergedData, isDetailMode);

    const norm = (s = "") =>
      String(s).normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

    const isGrossKey = (k = "") => {
      const x = norm(k);
      return x === "gross profit" || x === "gross loss";
    };

    const isNetKey = (k = "") => {
      const x = norm(k);
      return x === "net profit" || x === "net loss";
    };

    const getSortedEntries = (node, level, parentKey) => {
      let entries = Object.entries(node || {});

      const isPnLDetailOrder = selectedRadio === "D" && reportType === "P";

      // ✅ TOP LEVEL ORDER for P&L DETAIL: Expense → Income → Gross → Net
      if (isPnLDetailOrder && level === 0) {
        entries = sortTopLevelPnL(entries);
        return entries;
      }

      // ✅ Level-1 sorting under Expense/Income: Direct first then Indirect
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

    const LEVEL1_ORDER = [
      "Assets",
      "Liability",
      "Expense",
      "Income",
      "Net Profit",
      "Net Loss",
      "Gross Profit",
      "Gross Loss",
    ];

    const columns = getColumns(selectedRadio, selectedRadioType);

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

    // for normal row display
    const sumNodeTotals = (node) => {
      let total = makeEmptyTotals();

      const walk = (n) => {
        total = addTotals(total, sumLevelTotals(n.__rows || []));
        Object.values(n.__children || {}).forEach(walk);
      };

      walk(node);
      return total;
    };

    // for grand total (exclude Gross / Net)
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

    const grandTotal = computeGrandTotal();

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

      const isDetailMode = selectedRadio === "D";
      const tree = buildTree(mergedData, isDetailMode);
      const columns = getColumns(selectedRadio, selectedRadioType);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Trial Balance", {
        properties: { defaultRowHeight: 18 },
      });

      // ----------------- HEADER LOGO -----------------
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

      // ----------------- TABLE HEADER -----------------
      const headerRow = sheet.addRow(
        columns.map((c) => (c === "Ledger Name" ? "" : getColumnLabel(c)))
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

      // ==========================================================
      // ✅ P&L DETAIL SEQUENCE (D + P)
      // Direct Expense → Direct Income → Gross → Indirect Expense → Indirect Income → Rest → Net
      // ==========================================================
      const isPnLDetailOrder = selectedRadio === "D" && reportType === "P";

      const norm = (s = "") =>
        String(s).normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

      const isGrossKey = (k = "") => {
        const x = norm(k);
        return x === "gross profit" || x === "gross loss";
      };

      const isNetKey = (k = "") => {
        const x = norm(k);
        return x === "net profit" || x === "net loss";
      };

      const writeNodeRow = (key, value, level = 0) => {
        const totals = sumNodeTotals(value);

        const isLeaf =
          !value.__children || Object.keys(value.__children).length === 0;

        const hasSpecialRow = (value.__rows || []).some(
          (r) => r.isGross || r.isNet
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
          ...columns.slice(1).map(() => ""),
        ]);

        row.getCell(1).style = style;

        columns.slice(1).forEach((c, i) => {
          const cell = row.getCell(i + 2);
          setNumber(cell, totals[c] || 0);
          cell.style = style;
        });

        applyBorderless(row);
      };

      const walkTreeExcel = (node, level = 0, parentKey = null) => {
        getSortedEntries(node, level, parentKey).forEach(([key, value]) => {
          if (!isDetailMode && level > 1) return;

          writeNodeRow(key, value, level);

          // recurse
          walkTreeExcel(value.__children || {}, level + 1, key);
        });
      };

      // ✅ pick Direct / Indirect TB1 groups inside Expense/Income
      const pickGroups = (parentKey, parentNode, wantDirect) => {
        const children = parentNode?.__children || {};
        let entries = getSortedEntries(children, 1, parentKey);

        if (wantDirect) {
          entries = entries.filter(([_, v]) => (v?.__grpType || "") === "D");
        } else {
          entries = entries.filter(([_, v]) => (v?.__grpType || "") !== "D");
        }

        return entries;
      };

      const walkEntry = ([k, v], level = 0, parentKey = null) => {
        if (!v) return;
        if (!isDetailMode && level > 1) return;

        writeNodeRow(k, v, level);
        getSortedEntries(v.__children || {}, level + 1, k).forEach((child) =>
          walkEntry(child, level + 1, k)
        );
      };

      if (!isPnLDetailOrder) {
        // ✅ OLD / NORMAL ORDER (unchanged)
        walkTreeExcel(tree, 0, null);
      } else {
        // ✅ NEW P&L DETAIL ORDER
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

        // 1) Direct Expense groups
        if (exp) {
          pickGroups("Expense", exp[1], true).forEach((e) =>
            walkEntry(e, 1, "Expense")
          );
        }

        // 2) Direct Income groups
        if (inc) {
          pickGroups("Income", inc[1], true).forEach((e) =>
            walkEntry(e, 1, "Income")
          );
        }

        // 3) Gross (single node)
        if (gross) walkEntry(gross, 0, "ROOT");

        // 4) Indirect Expense groups
        if (exp) {
          pickGroups("Expense", exp[1], false).forEach((e) =>
            walkEntry(e, 1, "Expense")
          );
        }

        // 5) Indirect Income groups
        if (inc) {
          pickGroups("Income", inc[1], false).forEach((e) =>
            walkEntry(e, 1, "Income")
          );
        }

        // 6) Rest ledgers
        rest.forEach((e) => walkEntry(e, 0, "ROOT"));

        // 7) Net (last)
        if (net) walkEntry(net, 0, "ROOT");
      }

      // ----------------- GRAND TOTAL (EXCLUDES GROSS / NET) -----------------
      const gRow = sheet.addRow([
        "Grand Total",
        ...columns.slice(1).map(() => ""),
      ]);

      columns.slice(1).forEach((c, i) => {
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

      // ----------------- AUTO WIDTH -----------------
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

    useImperativeHandle(ref, () => ({
      exportToExcel,
      exportToPDF,
    }));

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
      const isDetailMode = selectedRadio === "D";

      // ---------------- LOGO ----------------
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
        if (logoBase64) {
          doc.addImage(logoBase64, "PNG", 0, 0, pageWidth, 26);
        }
      };

      drawHeader();

      const tree = buildTree(mergedData, isDetailMode);
      const columns = getColumns(selectedRadio, selectedRadioType);

      // ✅ same helpers used in Excel ordering
      const norm = (s = "") =>
        String(s).normalize("NFKC").replace(/\s+/g, " ").trim().toLowerCase();

      const isGrossKey = (k = "") => {
        const x = norm(k);
        return x === "gross profit" || x === "gross loss";
      };

      const isNetKey = (k = "") => {
        const x = norm(k);
        return x === "net profit" || x === "net loss";
      };

      const isPnLDetailOrder = selectedRadio === "D" && reportType === "P";

      const bodyRows = [];

      const pushNodeRow = (key, value, level = 0) => {
        const totals = sumNodeTotals(value);

        if (!isDetailMode && level > 1) return;

        const isLeaf =
          !value.__children || Object.keys(value.__children).length === 0;

        const hasSpecialRow = (value.__rows || []).some(
          (r) => r.isGross || r.isNet
        );

        const shouldBold = hasSpecialRow
          ? true
          : isDetailMode
          ? !isLeaf
          : level === 0;

        bodyRows.push([
          " ".repeat(level * 4) + key,
          ...columns.slice(1).map((c) => Number(totals[c] || 0).toFixed(2)),
          "__BOLD__:" + (shouldBold ? "1" : "0"),
        ]);
      };

      const walkEntry = ([k, v], level = 0, parentKey = null) => {
        if (!v) return;

        pushNodeRow(k, v, level);

        // recurse children using your existing sorter
        getSortedEntries(v.__children || {}, level + 1, k).forEach((child) =>
          walkEntry(child, level + 1, k)
        );
      };

      const pickGroups = (parentKey, parentNode, wantDirect) => {
        const children = parentNode?.__children || {};
        let entries = getSortedEntries(children, 1, parentKey);

        if (wantDirect) {
          entries = entries.filter(([_, v]) => (v?.__grpType || "") === "D");
        } else {
          entries = entries.filter(([_, v]) => (v?.__grpType || "") !== "D");
        }

        return entries;
      };

      if (!isPnLDetailOrder) {
        // ✅ OLD / NORMAL ORDER (Assets, Liability, Expense, Income, Net...)
        const LEVEL1_ORDER = [
          "Assets",
          "Liability",
          "Expense",
          "Income",
          "Net Profit",
          "Net Loss",
        ];
        const orderedLevel1 = LEVEL1_ORDER.filter((k) => tree[k]);

        const buildPdfRows = (node, level = 0, parentKey = null) => {
          getSortedEntries(node, level, parentKey).forEach(([key, value]) => {
            pushNodeRow(key, value, level);
            buildPdfRows(value.__children || {}, level + 1, key);
          });
        };

        orderedLevel1.forEach((lvl1) =>
          buildPdfRows({ [lvl1]: tree[lvl1] }, 0)
        );
      } else {
        // ✅ NEW P&L DETAIL ORDER with proper LEVEL HEADINGS
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

        const pushSectionRow = (title) => {
          bodyRows.push([
            title,
            ...columns.slice(1).map(() => ""),
            "__SECTION__",
          ]);
        };

        // 1) DIRECT EXPENSES
        if (exp) {
          pushSectionRow("Expense");
          pickGroups("Expense", exp[1], true).forEach((e) =>
            walkEntry(e, 1, "Expense")
          );
        }

        // 2) DIRECT INCOMES
        if (inc) {
          pushSectionRow("Income");
          pickGroups("Income", inc[1], true).forEach((e) =>
            walkEntry(e, 1, "Income")
          );
        }

        // 3) GROSS PROFIT / LOSS
        if (gross) walkEntry(gross, 0, "ROOT");

        // 4) INDIRECT EXPENSES
        if (exp) {
          const expIndirect = pickGroups("Expense", exp[1], false);
          if (expIndirect.length) {
            pushSectionRow("Expense");
            expIndirect.forEach((e) => walkEntry(e, 1, "Expense"));
          }
        }

        // 5) INDIRECT INCOMES
        if (inc) {
          const incIndirect = pickGroups("Income", inc[1], false);
          if (incIndirect.length) {
            pushSectionRow("Income");
            incIndirect.forEach((e) => walkEntry(e, 1, "Income"));
          }
        }

        // 6) REST LEDGERS (optional)
        if (rest.length) {
          pushSectionRow("Others");
          rest.forEach((e) => walkEntry(e, 0, "ROOT"));
        }

        // 7) NET PROFIT / LOSS (LAST)
        if (net) walkEntry(net, 0, "ROOT");
      }

      // ✅ Grand Total (exclude Gross/Net already in grandTotal)
      bodyRows.push([
        "Grand Total",
        ...columns.slice(1).map((c) => Number(grandTotal[c] || 0).toFixed(2)),
        "__BOLD__:1",
      ]);

      autoTable(doc, {
        startY: 38,
        margin: { top: 38, left: 5, right: 5 },

        head: [
          columns.map((c) => (c === "Ledger Name" ? "" : getColumnLabel(c))),
        ],

        body: bodyRows.map((r) => r.slice(0, -1)),

        theme: "grid",

        styles: {
          fontSize: 7.2,
          cellPadding: 1.5,
          valign: "middle",
        },

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

          const boldFlag = rawRow[rawRow.length - 1];
          if (boldFlag === "__SECTION__") {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [126, 155, 207];
            data.cell.styles.textColor = 255;
            data.cell.styles.halign =
              data.column.index === 0 ? "left" : "right";
          }

          if (boldFlag === "__BOLD__:1") {
            data.cell.styles.fontStyle = "bold";
          }
        },

        didDrawPage: drawHeader,
      });

      doc.save("TrialBalance.pdf");
    };

    // ==========================================================
    // UI
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
                const norm = (s = "") =>
                  String(s)
                    .normalize("NFKC")
                    .replace(/\s+/g, " ")
                    .trim()
                    .toLowerCase();

                const isGrossKey = (k = "") => {
                  const x = norm(k);
                  return x === "gross profit" || x === "gross loss";
                };

                const isNetKey = (k = "") => {
                  const x = norm(k);
                  return x === "net profit" || x === "net loss";
                };

                const renderNode = (
                  key,
                  value,
                  level = 0,
                  parentKey = null
                ) => {
                  const totals = sumNodeTotals(value);

                  if (!isDetailMode && level > 1) return null;

                  const isLeaf =
                    !value.__children ||
                    Object.keys(value.__children).length === 0;

                  const isBold =
                    value.__rows?.[0]?.isGross || value.__rows?.[0]?.isNet
                      ? true
                      : isDetailMode
                      ? !isLeaf
                      : level === 0;

                  return (
                    <React.Fragment
                      key={`${parentKey || "ROOT"}-${key}-${level}`}
                    >
                      <TableRow
                        sx={{
                          transition: "background-color 0.15s ease-in-out",
                          "&:hover": {
                            backgroundColor: "rgba(126,155,207,0.18)",
                            cursor: "pointer",
                          },
                        }}
                      >
                        <TableCell
                          sx={{ fontWeight: isBold ? "bold" : "normal" }}
                        >
                          <Box
                            sx={{
                              ml: level * 3,
                              fontSize:
                                level === 0
                                  ? FONT_L1
                                  : level === 1
                                  ? FONT_L2
                                  : FONT_L3,
                              color: "var(--tableRowTextColor)",
                              fontWeight: isBold ? "bold" : "normal",
                            }}
                          >
                            {key}
                          </Box>
                        </TableCell>

                        {columns.slice(1).map((c, i) => (
                          <TableCell
                            key={i}
                            align="right"
                            sx={{
                              fontWeight: isBold ? "bold" : "normal",
                              fontSize:
                                level === 0
                                  ? FONT_L1
                                  : level === 1
                                  ? FONT_L2
                                  : FONT_L3,
                              color: "var(--tableRowTextColor)",
                            }}
                          >
                            {fmt(totals[c] || 0)}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Normal recursion for non-PnL order */}
                      {!isPnLDetailOrder &&
                        getSortedEntries(
                          value.__children || {},
                          level + 1,
                          key
                        ).map(([ck, cv]) => renderNode(ck, cv, level + 1, key))}
                    </React.Fragment>
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

                // ✅ Default behavior (your old renderTree)
                if (!isPnLDetailOrder) {
                  const renderTree = (node, level = 0, parentKey = null) => {
                    return getSortedEntries(node, level, parentKey).map(
                      ([key, value]) => (
                        <React.Fragment
                          key={`${parentKey || "ROOT"}-${key}-${level}`}
                        >
                          {renderNode(key, value, level, parentKey)}
                          {renderTree(value.__children || {}, level + 1, key)}
                        </React.Fragment>
                      )
                    );
                  };
                  return renderTree(tree);
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
                  const groups = getSortedEntries(children, 1, parentKey); // Direct first already

                  return wantDirect
                    ? groups.filter(([_, v]) => (v?.__grpType || "") === "D")
                    : groups.filter(([_, v]) => (v?.__grpType || "") !== "D");
                };

                const out = [];
                const walkAll = (nodeKey, nodeVal, level, parentKey) => {
                  out.push(renderNode(nodeKey, nodeVal, level, parentKey));
                  getSortedEntries(
                    nodeVal.__children || {},
                    level + 1,
                    nodeKey
                  ).forEach(([ck, cv]) => walkAll(ck, cv, level + 1, nodeKey));
                };

                // 1) Direct Expenses
                if (exp) {
                  out.push(renderSection("Expense", "SEC-EXP-D"));
                  pickGroups("Expense", exp[1], true).forEach(([k, v]) =>
                    walkAll(k, v, 1, "Expense")
                  );
                }

                // 2) Direct Incomes
                if (inc) {
                  out.push(renderSection("Income", "SEC-INC-D"));
                  pickGroups("Income", inc[1], true).forEach(([k, v]) =>
                    walkAll(k, v, 1, "Income")
                  );
                }

                // 3) Gross
                if (gross) out.push(renderNode(gross[0], gross[1], 0, "ROOT"));

                // 4) Indirect Expenses
                if (exp) {
                  const ind = pickGroups("Expense", exp[1], false);
                  if (ind.length)
                    out.push(renderSection("Expense", "SEC-EXP-I"));
                  ind.forEach(([k, v]) => walkAll(k, v, 1, "Expense"));
                }

                // 5) Indirect Incomes
                if (inc) {
                  const ind = pickGroups("Income", inc[1], false);
                  if (ind.length)
                    out.push(renderSection("Income", "SEC-INC-I"));
                  ind.forEach(([k, v]) => walkAll(k, v, 1, "Income"));
                }

                // 6) Rest ledgers
                rest.forEach(([k, v]) => walkAll(k, v, 0, "ROOT"));

                // 7) Net last
                if (net) out.push(renderNode(net[0], net[1], 0, "ROOT"));

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
  }
);

export default BalanceDetailedGrid;
