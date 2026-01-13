/* eslint-disable */
import React, { forwardRef, useImperativeHandle, useRef } from "react";

import {
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { decrypt } from "@/helper/security";
import BalanceDetailedGrid from "@/components/Accounting/BalanceDetailedGrid";
import styles from "@/app/app.module.css";

// ---------------------------------------------
const fmt = (num) => Number(num || 0).toFixed(2);

// ---------------------------------------------
// FONT SIZES (REQUIRED FOR S MODE STYLING)
// ---------------------------------------------
const FONT_L1 = "11px";
const FONT_L2 = "10px";
const FONT_L3 = "9px";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;

// ============================================================
// ⭐ COMPONENT
// ============================================================
const PNLGrid = forwardRef(
  (
    {
      balanceSheetData,
      selectedRadio, // S / D
      reportOrientation, // H / V
      eliminateZero,
      selectedRadioType, // B / P
      toggle,
    },
    ref
  ) => {
    if (!balanceSheetData || balanceSheetData.length === 0)
      return <div>No Data Found</div>;

    const rawData = balanceSheetData[0]?.glBalance || [];
    const isDetail = selectedRadio === "D";
    const isHorizontal = reportOrientation === "H";
    const gridRef = React.useRef(null);

    const innerGridRef = useRef(null); // ✅ this connects to BalanceDetailedGrid

    // ✅ EXPOSE METHODS TO PARENT
    useImperativeHandle(ref, () => ({
      exportToExcel: () => {
        if (selectedRadio === "D") {
          innerGridRef.current?.exportToExcel();
        } else {
          exportSModeExcel();
        }
      },

      exportToPDF: () => {
        if (selectedRadio === "D") {
          innerGridRef.current?.exportToPDF();
        } else {
          exportSModePDF();
        }
      },
    }));

    // ==========================================================
    // ✅ FILTER DATA BASED ON B / P (FOR BOTH S AND D)
    // ==========================================================
    const filteredData =
      selectedRadioType === "B"
        ? rawData.filter(
            (r) =>
              r.BalanceSheetName === "Assets" ||
              r.BalanceSheetName === "Liability"
          )
        : rawData.filter(
            (r) =>
              r.BalanceSheetName === "Income" ||
              r.BalanceSheetName === "Expense"
          );

    // ==========================================================
    // ✅ ✅ ✅ D MODE → SINGLE EXACT BALANCE SHEET TABLE
    // ==========================================================
    if (isDetail) {
      return (
        <BalanceDetailedGrid
          ref={innerGridRef} // ✅✅✅ CRITICAL FIX
          balanceSheetData={filteredData}
          netProfit={balanceSheetData[0]?.netProfit}
          selectedRadio="D"
          selectedRadioType="E"
          reportType={selectedRadioType}
          grossProfit={balanceSheetData[0]?.grossProfit}
          toggle={toggle}
        />
      );
    }

    // ==========================================================
    // ✅ ✅ ✅ S MODE → TWO FULL TABLES WITH FULL STYLING
    // ==========================================================
    const leftType = selectedRadioType === "B" ? "Liability" : "Expense";
    const rightType = selectedRadioType === "B" ? "Assets" : "Income";

    const leftData = rawData.filter((r) => r.BalanceSheetName === leftType);
    const rightData = rawData.filter((r) => r.BalanceSheetName === rightType);

    // ---- GROUP BY TB1
    const groupByTB1Array = (
      data,
      type,
      selectedRadio,
      eliminateZero,
      selectedRadioType
    ) => {
      const map = {};

      data.forEach((r, idx) => {
        const key = r.tb1GroupName;
        const amt = Number(r.closingBalance || 0);

        if (!map[key]) {
          map[key] = {
            amt: 0,
            grpType: r.tbGrouptype || "", // "D" = Direct, "I" = Indirect (as per your usage)
            firstIdx: idx, // keep natural order for tie-break
          };
        }

        map[key].amt += amt;

        // if grpType missing initially, try to fill from later rows
        if (!map[key].grpType && r.tbGrouptype)
          map[key].grpType = r.tbGrouptype;
      });

      let arr = Object.entries(map)
        .filter(([_, obj]) => !eliminateZero || obj.amt !== 0)
        .map(([name, obj]) => ({
          name,
          amt: obj.amt,
          grpType: obj.grpType, // ✅ keep it
          firstIdx: obj.firstIdx, // ✅ keep it
        }));

      // ✅ Sort ONLY for P type: Direct first, then Indirect
      // Income: Direct Incomes → Indirect Incomes
      // Expense: Direct Expenses → Indirect Expenses
      if (selectedRadioType === "P") {
        const order = { D: 0, I: 1 };

        arr.sort((a, b) => {
          const oa = order[a.grpType] ?? 99;
          const ob = order[b.grpType] ?? 99;

          if (oa !== ob) return oa - ob; // D before I
          return (a.firstIdx ?? 0) - (b.firstIdx ?? 0); // keep original sequence otherwise
        });
      }

      return arr;
    };

    // S mode summary arrays
    const expenseArr = groupByTB1Array(
      leftData,
      leftType,
      selectedRadio,
      eliminateZero,
      selectedRadioType
    );

    const incomeArr = groupByTB1Array(
      rightData,
      rightType,
      selectedRadio,
      eliminateZero,
      selectedRadioType
    );

    // ==========================================================
    // ✅ GROSS PROFIT (S MODE ONLY | EXPENSE & INCOME ONLY | BOLD | NO TOTAL)
    // ==========================================================
    if (selectedRadio === "S" && selectedRadioType === "P") {
      const grossProfit = Number(balanceSheetData[0]?.grossProfit || 0);

      if (!eliminateZero || grossProfit !== 0) {
        const isPositive = grossProfit > 0;

        const grossRow = {
          name: "Gross Profit",
          amt: Math.abs(grossProfit), // ✅ always positive for display
          isGross: true, // ✅ exclude from totals
          isBold: true, // ✅ bold row
        };

        // ✅ Find TB group having tbGrouptype === "D" (INSIDE P&L ONLY)
        const findInsertIndex = (arr, sourceType) => {
          const sourceRow = rawData.find(
            (r) => r.tbGrouptype === "D" && r.BalanceSheetName === sourceType
          );

          if (!sourceRow) return -1;

          return arr.findIndex((x) => x.name === sourceRow.tb1GroupName);
        };

        // ✅ POSITIVE → ONLY INCOME
        if (isPositive) {
          const insertIndex = findInsertIndex(incomeArr, "Income");

          if (insertIndex !== -1) {
            incomeArr.splice(insertIndex + 1, 0, grossRow);
          } else {
            incomeArr.push(grossRow);
          }
        }

        // ✅ NEGATIVE → ONLY EXPENSE
        if (!isPositive) {
          const insertIndex = findInsertIndex(expenseArr, "Expense");

          if (insertIndex !== -1) {
            expenseArr.splice(insertIndex + 1, 0, grossRow);
          } else {
            expenseArr.push(grossRow);
          }
        }
      }
    }

    // ==========================================================
    // ✅ NET PROFIT ADJUSTMENT (S MODE ONLY - FINAL FIX ✅)
    // ==========================================================
    const netProfit = Number(balanceSheetData[0]?.netProfit || 0);

    if (!eliminateZero || netProfit !== 0) {
      const isProfit = netProfit > 0;

      // const netRow = {
      //   name: isProfit ? "Net Loss" : "Net Profit",
      //   // ✅ ALWAYS STORE AS POSITIVE FOR DISPLAY
      //   amt: Math.abs(netProfit),
      // };

      const netRow = {
        name: isProfit ? "Net Loss" : "Net Profit",
        amt: Math.abs(netProfit),
        isBold: true, // ✅ ADD THIS
        isNet: true, // ✅ (optional but useful for safety)
      };

      if (isProfit) {
        // ✅ PROFIT → Assets & Income
        if (rightType === "Income") {
          incomeArr.push({ ...netRow, calcAmt: -Math.abs(netProfit) }); // flipped for total
        }
        if (rightType === "Assets") {
          incomeArr.push({ ...netRow, calcAmt: Math.abs(netProfit) }); // normal
        }
      } else {
        // ✅ LOSS → Liability & Expense
        if (leftType === "Liability") {
          expenseArr.push({ ...netRow, calcAmt: Math.abs(netProfit) }); // ✅ FIXED: POSITIVE FOR DISPLAY
        }
        if (leftType === "Expense") {
          expenseArr.push({ ...netRow, calcAmt: Math.abs(netProfit) });
        }
      }
    }

    if (selectedRadio === "S") {
      expenseArr.forEach((row) => {
        if (leftType === "Liability") row.amt = -row.amt;
        if (leftType === "Expense") row.amt = Math.abs(row.amt);
      });

      incomeArr.forEach((row) => {
        if (rightType === "Income") row.amt = -row.amt;
        // Assets unchanged
      });
    }

    // ✅ ZIP BOTH SIDES (TOP ALIGNED)
    const maxLen = Math.max(expenseArr.length, incomeArr.length);

    const rows = Array.from({ length: maxLen }).map((_, i) => ({
      expName: expenseArr[i]?.name || "",
      expAmt: expenseArr[i]?.amt ?? "",
      expIsGross: expenseArr[i]?.isGross || false, // ✅ NEW

      incName: incomeArr[i]?.name || "",
      incAmt: incomeArr[i]?.amt ?? "",
      incIsGross: incomeArr[i]?.isGross || false, // ✅ NEW
    }));

    const getBase64FromUrl = async (url) => {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(blob);
      });
    };

    // ✅ Totals now respect all sign rules (Liability & Income flipped; Expense positive)
    const expenseTotal = expenseArr.reduce(
      (a, b) => a + (b.isGross ? 0 : Number(b.calcAmt ?? b.amt ?? 0)),
      0
    );

    const incomeTotal = incomeArr.reduce(
      (a, b) => a + (b.isGross ? 0 : Number(b.calcAmt ?? b.amt ?? 0)),
      0
    );

    const exportSModeExcel = async () => {
      if (!balanceSheetData || balanceSheetData.length === 0) {
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

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("PNL Summary", {
        properties: { defaultRowHeight: 18 },
      });

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

      const HEADER_STYLE = {
        font: { bold: true, size: 11, color: { argb: "FFFFFF" } },
        alignment: { horizontal: "center" },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "7E9BCF" },
        },
        border: {},
      };

      const TOTAL_STYLE = {
        font: { bold: true, size: 11, color: { argb: "FFFFFF" } },
        fill: {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "7E9BCF" },
        },
        border: {},
      };

      const STYLES = {
        L2_BOLD: { font: { bold: true, size: 10 } },
        L2_NORMAL: { font: { bold: false, size: 10 } },
      };

      const setNumber = (cell, value) => {
        if (value === "" || value === null || value === undefined) {
          cell.value = "";
          cell.border = {};
          return;
        }
        cell.value = Number(value ?? 0);
        cell.numFmt = "0.00";
        cell.alignment = { horizontal: "right" };
        cell.border = {};
      };

      const applyBorderless = (row) => {
        row.eachCell((cell) => (cell.border = {}));
      };

      const addHeaderRow = (title) => {
        const r = sheet.addRow([title, "Amount"]);
        r.eachCell((cell) => Object.assign(cell, HEADER_STYLE));
        applyBorderless(r);
      };

      const addDataRow = (name, amount, bold = false) => {
        const row = sheet.addRow([name, amount !== "" ? Number(amount) : ""]);
        row.getCell(1).alignment = { horizontal: "left" };
        setNumber(row.getCell(2), amount !== "" ? amount : "");

        row.getCell(1).style = bold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;
        row.getCell(2).style = bold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;

        applyBorderless(row);
      };

      const addTotalLast = (label, value) => {
        const r = sheet.addRow([label, value]);
        r.eachCell((cell) => Object.assign(cell, TOTAL_STYLE));
        r.getCell(1).alignment = { horizontal: "left" };
        setNumber(r.getCell(2), value);
        applyBorderless(r);
      };

      // ===================== HORIZONTAL =====================
      if (reportOrientation === "H") {
        const headerRow = sheet.addRow([
          leftType,
          "Amount",
          rightType,
          "Amount",
        ]);
        headerRow.eachCell((cell) => Object.assign(cell, HEADER_STYLE));

        rows.forEach((r, i) => {
          const expBold =
            expenseArr[i]?.isBold ||
            expenseArr[i]?.isGross ||
            expenseArr[i]?.isNet;
          const incBold =
            incomeArr[i]?.isBold ||
            incomeArr[i]?.isGross ||
            incomeArr[i]?.isNet;

          const row = sheet.addRow([
            r.expName,
            r.expAmt !== "" ? Math.abs(r.expAmt) : "",
            r.incName,
            r.incAmt !== "" ? Math.abs(r.incAmt) : "",
          ]);

          row.getCell(1).alignment = { horizontal: "left" };
          row.getCell(3).alignment = { horizontal: "left" };

          setNumber(row.getCell(2), r.expAmt !== "" ? Math.abs(r.expAmt) : "");
          setNumber(row.getCell(4), r.incAmt !== "" ? Math.abs(r.incAmt) : "");

          row.getCell(1).style = expBold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;
          row.getCell(2).style = expBold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;
          row.getCell(3).style = incBold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;
          row.getCell(4).style = incBold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;

          applyBorderless(row);
        });

        const totalRow = sheet.addRow([
          "Total",
          expenseTotal,
          "Total",
          incomeTotal,
        ]);
        totalRow.eachCell((cell) => Object.assign(cell, TOTAL_STYLE));
        totalRow.getCell(1).alignment = { horizontal: "left" };
        totalRow.getCell(3).alignment = { horizontal: "left" };
        setNumber(totalRow.getCell(2), expenseTotal);
        setNumber(totalRow.getCell(4), incomeTotal);
      }

      // ===================== VERTICAL =====================
      else {
        // ✅✅✅ EXACT UI ORDER FOR: S + P + VERTICAL
        if (selectedRadio === "S" && selectedRadioType === "P") {
          // -----------------------------
          // ✅ EXACT UI SPLIT (same as your frontend)
          // -----------------------------
          const expDirect = expenseArr.filter(
            (r) => r.grpType === "D" && !r.isGross && !r.isNet
          );
          const expIndirect = expenseArr.filter(
            (r) => r.grpType !== "D" && !r.isGross && !r.isNet
          );

          const incDirect = incomeArr.filter(
            (r) => r.grpType === "D" && !r.isGross && !r.isNet
          );
          const incIndirect = incomeArr.filter(
            (r) => r.grpType !== "D" && !r.isGross && !r.isNet
          );

          const grossRow =
            expenseArr.find((r) => r.isGross) ||
            incomeArr.find((r) => r.isGross);

          const netRow =
            expenseArr.find((r) => r.isNet) || incomeArr.find((r) => r.isNet);

          // -----------------------------
          // ✅ UI-like styling helpers
          // -----------------------------
          // columns like UI: A = name, B = amount
          sheet.getColumn(1).width = 65;
          sheet.getColumn(2).width = 18;

          const UI_TOP_HEADER_STYLE = {
            font: { bold: true, size: 11, color: { argb: "FFFFFF" } },
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "7E9BCF" },
            },
            alignment: { vertical: "middle" },
          };

          const UI_TOTAL_STYLE = {
            font: { bold: true, size: 11, color: { argb: "FFFFFF" } },
            fill: {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "7E9BCF" },
            },
            alignment: { vertical: "middle" },
          };

          const UI_SECTION_STYLE = {
            font: { bold: true, size: 11, color: { argb: "000000" } },
            alignment: { horizontal: "left", vertical: "middle" },
          };

          const UI_ROW_NORMAL = {
            font: { bold: false, size: 10, color: { argb: "000000" } },
            alignment: { horizontal: "left", vertical: "middle", indent: 2 },
          };

          const UI_ROW_BOLD = {
            font: { bold: true, size: 10, color: { argb: "000000" } },
            alignment: { horizontal: "left", vertical: "middle", indent: 2 },
          };

          const UI_AMT_NORMAL = {
            font: { bold: false, size: 10, color: { argb: "000000" } },
            alignment: { horizontal: "right", vertical: "middle" },
            numFmt: "0.00",
          };

          const UI_AMT_BOLD = {
            font: { bold: true, size: 10, color: { argb: "000000" } },
            alignment: { horizontal: "right", vertical: "middle" },
            numFmt: "0.00",
          };

          const tableStartRow = sheet.lastRow ? sheet.lastRow.number + 1 : 1;

          const addTopHeaderBar = () => {
            const r = sheet.addRow(["", "Amount"]);
            // blue bar across both cells
            r.getCell(1).style = UI_TOP_HEADER_STYLE;
            r.getCell(2).style = UI_TOP_HEADER_STYLE;
            r.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
            r.getCell(2).alignment = {
              horizontal: "right",
              vertical: "middle",
            };
            applyBorderless(r);
          };

          const addSectionHeader = (title) => {
            const r = sheet.addRow([title, ""]);
            r.getCell(1).style = UI_SECTION_STYLE;
            r.getCell(2).style = {
              ...UI_SECTION_STYLE,
              alignment: { horizontal: "right" },
            };
            applyBorderless(r);
          };

          const addItemRow = (name, amt, bold = false) => {
            const r = sheet.addRow([name, amt === "" ? "" : Number(amt)]);
            r.getCell(1).style = bold ? UI_ROW_BOLD : UI_ROW_NORMAL;
            r.getCell(2).style = bold ? UI_AMT_BOLD : UI_AMT_NORMAL;

            // amount cell value + format
            setNumber(r.getCell(2), amt === "" ? "" : Number(amt));
            applyBorderless(r);
          };

          const addTotalBar = (label, value) => {
            const r = sheet.addRow([label, Number(value)]);
            r.getCell(1).style = UI_TOTAL_STYLE;
            r.getCell(2).style = UI_TOTAL_STYLE;

            r.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
            r.getCell(2).alignment = {
              horizontal: "right",
              vertical: "middle",
            };
            setNumber(r.getCell(2), Number(value));
            applyBorderless(r);
          };

          const applyOuterBorder = (fromRow, toRow) => {
            // thin black border around the whole table (A..B)
            for (let r = fromRow; r <= toRow; r++) {
              for (let c = 1; c <= 2; c++) {
                const cell = sheet.getRow(r).getCell(c);
                const border = {};

                if (r === fromRow)
                  border.top = { style: "thin", color: { argb: "000000" } };
                if (r === toRow)
                  border.bottom = { style: "thin", color: { argb: "000000" } };
                if (c === 1)
                  border.left = { style: "thin", color: { argb: "000000" } };
                if (c === 2)
                  border.right = { style: "thin", color: { argb: "000000" } };

                cell.border = { ...(cell.border || {}), ...border };
              }
            }
          };

          // -----------------------------
          // ✅ Build table EXACTLY like UI
          // -----------------------------
          addTopHeaderBar();

          // 1) Expense (Direct)
          addSectionHeader("Expense");
          expDirect.forEach((r) => addItemRow(r.name, Math.abs(r.amt), false));

          // 2) Income (Direct)
          addSectionHeader("Income");
          incDirect.forEach((r) => addItemRow(r.name, Math.abs(r.amt), false));

          // 3) Gross Profit (bold, no section header)
          if (grossRow) addItemRow(grossRow.name, Math.abs(grossRow.amt), true);

          // 4) Expense (Indirect)
          addSectionHeader("Expense");
          expIndirect.forEach((r) =>
            addItemRow(r.name, Math.abs(r.amt), false)
          );

          // 5) Income (Indirect)
          addSectionHeader("Income");
          incIndirect.forEach((r) =>
            addItemRow(r.name, Math.abs(r.amt), false)
          );

          // 6) Net Profit/Loss (bold)
          if (netRow) addItemRow(netRow.name, Math.abs(netRow.amt), true);

          // 7) Totals (blue bars at bottom)
          addTotalBar("Total Expense", Number(expenseTotal));
          addTotalBar("Total Income", Number(Math.abs(incomeTotal)));

          const tableEndRow = sheet.lastRow.number;

          // outer border like UI screenshot
          applyOuterBorder(tableStartRow, tableEndRow);
        } else {
          // ✅ OLD VERTICAL EXPORT (UNCHANGED)
          const leftHeader = sheet.addRow([leftType, "Amount"]);
          leftHeader.eachCell((cell) => Object.assign(cell, HEADER_STYLE));

          expenseArr.forEach((r) => {
            const bold = r.isBold || r.isGross || r.isNet;
            const row = sheet.addRow([r.name, Math.abs(r.amt)]);

            row.getCell(1).alignment = { horizontal: "left" };
            setNumber(row.getCell(2), Math.abs(r.amt));

            row.getCell(1).style = bold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;
            row.getCell(2).style = bold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;

            applyBorderless(row);
          });

          const totalLeft = sheet.addRow([`Total ${leftType}`, expenseTotal]);
          totalLeft.eachCell((cell) => Object.assign(cell, TOTAL_STYLE));
          totalLeft.getCell(1).alignment = { horizontal: "left" };
          setNumber(totalLeft.getCell(2), expenseTotal);

          sheet.addRow([]);

          const rightHeader = sheet.addRow([rightType, "Amount"]);
          rightHeader.eachCell((cell) => Object.assign(cell, HEADER_STYLE));

          incomeArr.forEach((r) => {
            const bold = r.isBold || r.isGross || r.isNet;
            const row = sheet.addRow([r.name, Math.abs(r.amt)]);

            row.getCell(1).alignment = { horizontal: "left" };
            setNumber(row.getCell(2), Math.abs(r.amt));

            row.getCell(1).style = bold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;
            row.getCell(2).style = bold ? STYLES.L2_BOLD : STYLES.L2_NORMAL;

            applyBorderless(row);
          });

          const totalRight = sheet.addRow([
            `Total ${rightType}`,
            Math.abs(incomeTotal),
          ]);
          totalRight.eachCell((cell) => Object.assign(cell, TOTAL_STYLE));
          totalRight.getCell(1).alignment = { horizontal: "left" };
          setNumber(totalRight.getCell(2), Math.abs(incomeTotal));
        }
      }

      sheet.columns.forEach((col) => {
        let max = 10;
        col.eachCell({ includeEmpty: true }, (cell) => {
          const v = cell.value ? cell.value.toString() : "";
          max = Math.max(max, v.length);
        });
        col.width = max + 3;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "PNL_Summary.xlsx");
    };

    const exportSModePDF = async () => {
      if (!balanceSheetData || balanceSheetData.length === 0) {
        alert("No data to export");
        return;
      }

      const doc = new jsPDF({
        orientation: reportOrientation === "H" ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

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

      // ===================== HORIZONTAL (unchanged) =====================
      if (reportOrientation === "H") {
        const bodyRows = [];

        rows.forEach((r, i) => {
          const expBold =
            expenseArr[i]?.isBold ||
            expenseArr[i]?.isGross ||
            expenseArr[i]?.isNet;

          const incBold =
            incomeArr[i]?.isBold ||
            incomeArr[i]?.isGross ||
            incomeArr[i]?.isNet;

          bodyRows.push([
            r.expName || "",
            r.expAmt !== "" ? Number(Math.abs(r.expAmt)).toFixed(2) : "",
            r.incName || "",
            r.incAmt !== "" ? Number(Math.abs(r.incAmt)).toFixed(2) : "",
            "__BOLD__:" + (expBold || incBold ? "1" : "0"),
          ]);
        });

        bodyRows.push([
          "Total",
          Number(expenseTotal).toFixed(2),
          "Total",
          Number(incomeTotal).toFixed(2),
          "__BOLD__:1",
        ]);

        autoTable(doc, {
          startY: 38,
          margin: { top: 38, left: 5, right: 5 },

          head: [[leftType, "Amount", rightType, "Amount"]],
          body: bodyRows.map((r) => r.slice(0, -1)),

          theme: "grid",

          styles: {
            fontSize: 7.2,
            cellPadding: 1.5,
            valign: "middle",
          },

          columnStyles: {
            0: { halign: "left" },
            1: { halign: "right" },
            2: { halign: "left" },
            3: { halign: "right" },
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

            const flag = rawRow[rawRow.length - 1];
            if (flag === "__BOLD__:1") {
              data.cell.styles.fontStyle = "bold";
            }
          },

          didDrawPage: drawHeader,
        });

        doc.save("PNL_Summary.pdf");
        return;
      }

      // ===================== VERTICAL =====================
      // ✅ SPECIAL UI ORDER ONLY FOR: S + P + VERTICAL
      if (selectedRadio === "S" && selectedRadioType === "P") {
        const bodyRows = [];
        const VERTICAL_HEADER = ["", "Amount"];

        // ✅ EXACT UI logic split
        const expDirect = expenseArr.filter(
          (r) => r.grpType === "D" && !r.isGross && !r.isNet
        );
        const expIndirect = expenseArr.filter(
          (r) => r.grpType !== "D" && !r.isGross && !r.isNet
        );

        const incDirect = incomeArr.filter(
          (r) => r.grpType === "D" && !r.isGross && !r.isNet
        );
        const incIndirect = incomeArr.filter(
          (r) => r.grpType !== "D" && !r.isGross && !r.isNet
        );

        const grossRow =
          expenseArr.find((r) => r.isGross) || incomeArr.find((r) => r.isGross);

        const netRow =
          expenseArr.find((r) => r.isNet) || incomeArr.find((r) => r.isNet);

        // flag helpers
        const pushHeader = (title) => bodyRows.push([title, "", "__SECTION__"]);
        const pushItem = (name, amt, bold = false) =>
          bodyRows.push([
            "   " + (name || ""), // ✅ indent like UI
            amt !== "" ? Number(Math.abs(amt)).toFixed(2) : "",
            "__ROW__:" + (bold ? "1" : "0"),
          ]);
        const pushTotal = (label, value) =>
          bodyRows.push([
            label,
            Number(Math.abs(value)).toFixed(2),
            "__TOTAL__",
          ]);

        // 1) Expense -> Direct
        pushHeader("Expense");
        expDirect.forEach((r) => pushItem(r.name, r.amt, false));

        // 2) Income -> Direct
        pushHeader("Income");
        incDirect.forEach((r) => pushItem(r.name, r.amt, false));

        // 3) Gross Profit (bold)
        if (grossRow) pushItem(grossRow.name, grossRow.amt, true);

        // 4) Expense -> Indirect
        pushHeader("Expense");
        expIndirect.forEach((r) => pushItem(r.name, r.amt, false));

        // 5) Income -> Indirect
        pushHeader("Income");
        incIndirect.forEach((r) => pushItem(r.name, r.amt, false));

        // 6) Net Profit/Loss (bold)
        if (netRow) pushItem(netRow.name, netRow.amt, true);

        // 7-8) Totals ONLY at last (blue)
        pushTotal("Total Expense", expenseTotal);
        pushTotal("Total Income", Math.abs(incomeTotal));

        autoTable(doc, {
          startY: 38,
          margin: { top: 38, left: 5, right: 5 },

          head: [VERTICAL_HEADER],
          body: bodyRows.map((r) => r.slice(0, -1)),

          theme: "grid",

          styles: {
            fontSize: 7.2,
            cellPadding: 1.5,
            valign: "middle",
          },

          columnStyles: {
            0: { halign: "left" },
            1: { halign: "right" },
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

            const flag = rawRow[rawRow.length - 1];

            // ✅ Section headers: bold (white like UI)
            if (flag === "__SECTION__") {
              data.cell.styles.fontStyle = "bold";
              // keep white background (do NOT paint blue)
              if (data.column.index === 1) {
                data.cell.text = ""; // Amount blank for section
              }
            }

            // ✅ Item bold rows (Gross/Net)
            if (flag.startsWith("__ROW__:")) {
              const isBold = flag.endsWith("1");
              if (isBold) data.cell.styles.fontStyle = "bold";
            }

            // ✅ Totals: blue bar like UI
            if (flag === "__TOTAL__") {
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.fillColor = [126, 155, 207];
              data.cell.styles.textColor = 255;
              data.cell.styles.halign =
                data.column.index === 0 ? "left" : "right";
            }
          },

          didDrawPage: drawHeader,
        });

        doc.save("PNL_Summary.pdf");
        return;
      }

      // ===================== OLD VERTICAL (unchanged) =====================
      {
        const VERTICAL_HEADER = ["", "Amount"];
        const bodyRows = [];

        // left
        bodyRows.push([leftType, "", "__HEADER__"]);
        expenseArr.forEach((r) => {
          const bold = r.isGross || r.isNet || r.isBold;
          bodyRows.push([
            r.name,
            Number(Math.abs(r.amt)).toFixed(2),
            "__BOLD__:" + (bold ? "1" : "0"),
          ]);
        });
        bodyRows.push([
          `Total ${leftType}`,
          Number(expenseTotal).toFixed(2),
          "__TOTAL__",
        ]);

        bodyRows.push(["", "", "__SPACER__"]);

        // right
        bodyRows.push([rightType, "", "__HEADER__"]);
        incomeArr.forEach((r) => {
          const bold = r.isGross || r.isNet || r.isBold;
          bodyRows.push([
            r.name,
            Number(Math.abs(r.amt)).toFixed(2),
            "__BOLD__:" + (bold ? "1" : "0"),
          ]);
        });
        bodyRows.push([
          `Total ${rightType}`,
          Number(Math.abs(incomeTotal)).toFixed(2),
          "__TOTAL__",
        ]);

        autoTable(doc, {
          startY: 38,
          margin: { top: 38, left: 5, right: 5 },

          head: [VERTICAL_HEADER],
          body: bodyRows.map((r) => r.slice(0, -1)),

          theme: "grid",

          styles: {
            fontSize: 7.2,
            cellPadding: 1.5,
            valign: "middle",
          },

          columnStyles: {
            0: { halign: "left" },
            1: { halign: "right" },
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

            const flag = rawRow[rawRow.length - 1];

            if (flag === "__BOLD__:1") data.cell.styles.fontStyle = "bold";

            if (flag === "__HEADER__" || flag === "__TOTAL__") {
              data.cell.styles.fontStyle = "bold";
              data.cell.styles.fillColor = [126, 155, 207];
              data.cell.styles.textColor = 255;
              data.cell.styles.halign =
                data.column.index === 0 ? "left" : "right";
            }

            if (flag === "__SPACER__") {
              data.cell.styles.fillColor = [255, 255, 255];
            }
          },

          didDrawPage: drawHeader,
        });

        doc.save("PNL_Summary.pdf");
      }
    };

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
          className={styles.thinScrollBar}
          style={{ maxHeight: toggle ? "60vh" : "80vh" }}
        >
          {/* ✅ HORIZONTAL → MERGED SUMMARY TABLE */}
          {isHorizontal ? (
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
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: FONT_L1,
                    }}
                  >
                    {leftType}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: FONT_L1,
                    }}
                  >
                    Amount
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: FONT_L1,
                    }}
                  >
                    {rightType}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: FONT_L1,
                    }}
                  >
                    Amount
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell
                      sx={{
                        fontSize: FONT_L2,
                        fontWeight:
                          r.expIsGross || r.expIsNet || expenseArr[i]?.isBold
                            ? "bold"
                            : "normal",
                      }}
                    >
                      {r.expName}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        fontSize: FONT_L2,
                        fontWeight: expenseArr[i]?.isBold ? "bold" : "normal",
                      }}
                    >
                      {r.expAmt !== "" ? fmt(Math.abs(r.expAmt)) : ""}
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: FONT_L2,
                        fontWeight: incomeArr[i]?.isBold ? "bold" : "normal",
                      }}
                    >
                      {r.incName}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        fontSize: FONT_L2,
                        fontWeight: incomeArr[i]?.isBold ? "bold" : "normal",
                      }}
                    >
                      {r.incAmt !== "" ? fmt(Math.abs(r.incAmt)) : ""}
                    </TableCell>
                  </TableRow>
                ))}

                <TableRow
                  sx={{
                    position: "sticky",
                    bottom: 0,
                    backgroundColor: "var(--tableHeaderBg)",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: FONT_L2,
                    }}
                  >
                    Total
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: FONT_L2,
                    }}
                  >
                    {fmt(expenseTotal)}
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: FONT_L2,
                    }}
                  >
                    Total
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "#FFF",
                      fontSize: FONT_L2,
                    }}
                  >
                    {fmt(incomeTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ) : (
            /* ✅ VERTICAL → EXACT D PATTERN USING BalanceDetailedGrid */
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
                className={styles.thinScrollBar}
                style={{ maxHeight: "80vh", overflowY: "auto" }}
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
                  {/* ✅ EXACT D MODE HEADER STYLE */}
                  <TableHead>
                    <TableRow
                      sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        backgroundColor: "var(--tableHeaderBg)",
                      }}
                    >
                      <TableCell
                        align="left"
                        sx={{
                          letterSpacing: "normal",
                          fontWeight: "bold",
                          color: "#FFF",
                          fontSize: FONT_L1,
                        }}
                      ></TableCell>

                      <TableCell
                        align="right"
                        sx={{
                          letterSpacing: "normal",
                          fontWeight: "bold",
                          color: "#FFF",
                          fontSize: FONT_L1,
                        }}
                      >
                        Amount
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  {/* ✅✅ UPDATED BODY */}
                  <TableBody>
                    {/* ✅ SPECIAL ORDER ONLY FOR: S + P + V */}
                    {selectedRadio === "S" && selectedRadioType === "P" ? (
                      (() => {
                        const expDirect = expenseArr.filter(
                          (r) => r.grpType === "D" && !r.isGross && !r.isNet
                        );
                        const expIndirect = expenseArr.filter(
                          (r) => r.grpType !== "D" && !r.isGross && !r.isNet
                        );

                        const incDirect = incomeArr.filter(
                          (r) => r.grpType === "D" && !r.isGross && !r.isNet
                        );
                        const incIndirect = incomeArr.filter(
                          (r) => r.grpType !== "D" && !r.isGross && !r.isNet
                        );

                        const grossRow =
                          expenseArr.find((r) => r.isGross) ||
                          incomeArr.find((r) => r.isGross);

                        const netRow =
                          expenseArr.find((r) => r.isNet) ||
                          incomeArr.find((r) => r.isNet);

                        const sectionHeader = (title, key) => (
                          <TableRow key={key}>
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                fontSize: FONT_L1,
                                color: "var(--tableRowTextColor)",
                              }}
                            >
                              {title}
                            </TableCell>
                            <TableCell align="right" />
                          </TableRow>
                        );

                        const renderRow = (r, key) => {
                          const displayAmt =
                            r.name === "Net Profit" ||
                            r.name === "Net Loss" ||
                            r.name === "Gross Profit"
                              ? Math.abs(r.amt)
                              : r.amt;

                          const bold = r.isGross || r.isNet || r.isBold;

                          return (
                            <TableRow
                              key={key}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(126,155,207,0.18)",
                                },
                              }}
                            >
                              <TableCell>
                                <Box
                                  sx={{
                                    ml: 3,
                                    fontSize: FONT_L2,
                                    color: "var(--tableRowTextColor)",
                                    fontWeight: bold ? "bold" : "normal",
                                  }}
                                >
                                  {r.name}
                                </Box>
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  fontSize: FONT_L2,
                                  color: "var(--tableRowTextColor)",
                                  fontWeight: bold ? "bold" : "normal",
                                }}
                              >
                                {fmt(displayAmt)}
                              </TableCell>
                            </TableRow>
                          );
                        };

                        const totalRow = (label, value, key) => (
                          <TableRow
                            key={key}
                            sx={{
                              backgroundColor: "var(--tableHeaderBg)",
                              position: "sticky",
                              bottom: 0,
                              zIndex: 3,
                            }}
                          >
                            <TableCell
                              sx={{
                                fontWeight: "bold",
                                color: "#FFF",
                                fontSize: FONT_L2,
                              }}
                            >
                              {label}
                            </TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                fontWeight: "bold",
                                color: "#FFF",
                                fontSize: FONT_L2,
                              }}
                            >
                              {fmt(value)}
                            </TableCell>
                          </TableRow>
                        );

                        return (
                          <>
                            {/* 1) Expense -> Direct */}
                            {sectionHeader("Expense", "SEC-EXP-D")}
                            {expDirect.map((r, i) =>
                              renderRow(r, `EXP-D-${i}`)
                            )}

                            {/* 2) Income -> Direct */}
                            {sectionHeader("Income", "SEC-INC-D")}
                            {incDirect.map((r, i) =>
                              renderRow(r, `INC-D-${i}`)
                            )}

                            {/* 3) Gross Profit */}
                            {grossRow ? renderRow(grossRow, "ROW-GROSS") : null}

                            {/* 4) Expense -> Indirect */}
                            {sectionHeader("Expense", "SEC-EXP-I")}
                            {expIndirect.map((r, i) =>
                              renderRow(r, `EXP-I-${i}`)
                            )}

                            {/* 6) Income -> Indirect */}
                            {sectionHeader("Income", "SEC-INC-I")}
                            {incIndirect.map((r, i) =>
                              renderRow(r, `INC-I-${i}`)
                            )}

                            {/* 7) Net Profit/Loss */}
                            {netRow ? renderRow(netRow, "ROW-NET") : null}

                            {/* 5) Total Expense */}
                            {totalRow("Total Expense", expenseTotal, "TOT-EXP")}

                            {/* 8) Total Income */}
                            {totalRow(
                              "Total Income",
                              Math.abs(incomeTotal),
                              "TOT-INC"
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <>
                        {/* ✅ OLD VERTICAL LAYOUT FOR ALL OTHER CASES */}
                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              fontSize: FONT_L1,
                              color: "var(--tableRowTextColor)",
                            }}
                          >
                            {leftType}
                          </TableCell>
                          <TableCell align="right" />
                        </TableRow>

                        {expenseArr.map((r, i) => {
                          const displayAmt =
                            r.name === "Net Profit" || r.name === "Net Loss"
                              ? Math.abs(r.amt)
                              : r.amt;

                          return (
                            <TableRow
                              key={`L-${i}`}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(126,155,207,0.18)",
                                },
                              }}
                            >
                              <TableCell>
                                <Box
                                  sx={{
                                    ml: 3,
                                    fontSize: FONT_L2,
                                    color: "var(--tableRowTextColor)",
                                    fontWeight:
                                      r.isGross || r.isNet ? "bold" : "normal",
                                  }}
                                >
                                  {r.name}
                                </Box>
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  fontSize: FONT_L2,
                                  color: "var(--tableRowTextColor)",
                                  fontWeight:
                                    r.isGross || r.isNet ? "bold" : "normal",
                                }}
                              >
                                {fmt(displayAmt)}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        <TableRow
                          sx={{
                            backgroundColor: "var(--tableHeaderBg)",
                            position: "sticky",
                            bottom: 0,
                            zIndex: 3,
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              color: "#FFF",
                              fontSize: FONT_L2,
                            }}
                          >
                            Total {leftType}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: "bold",
                              color: "#FFF",
                              fontSize: FONT_L2,
                            }}
                          >
                            {fmt(expenseTotal)}
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              fontSize: FONT_L1,
                              color: "var(--tableRowTextColor)",
                            }}
                          >
                            {rightType}
                          </TableCell>
                          <TableCell align="right" />
                        </TableRow>

                        {incomeArr.map((r, i) => {
                          const displayAmt =
                            r.name === "Net Profit" || r.name === "Net Loss"
                              ? Math.abs(r.amt)
                              : r.amt;

                          return (
                            <TableRow
                              key={`R-${i}`}
                              sx={{
                                "&:hover": {
                                  backgroundColor: "rgba(126,155,207,0.18)",
                                },
                              }}
                            >
                              <TableCell>
                                <Box
                                  sx={{
                                    ml: 3,
                                    fontSize: FONT_L2,
                                    color: "var(--tableRowTextColor)",
                                    fontWeight:
                                      r.isGross || r.isNet ? "bold" : "normal",
                                  }}
                                >
                                  {r.name}
                                </Box>
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  fontSize: FONT_L2,
                                  color: "var(--tableRowTextColor)",
                                  fontWeight:
                                    r.isGross || r.isNet ? "bold" : "normal",
                                }}
                              >
                                {fmt(displayAmt)}
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        <TableRow
                          sx={{
                            backgroundColor: "var(--tableHeaderBg)",
                            position: "sticky",
                            bottom: 0,
                            zIndex: 3,
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: "bold",
                              color: "#FFF",
                              fontSize: FONT_L2,
                            }}
                          >
                            Total {rightType}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              fontWeight: "bold",
                              color: "#FFF",
                              fontSize: FONT_L2,
                            }}
                          >
                            {fmt(Math.abs(incomeTotal))}
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Paper>
          )}
        </div>
      </Paper>
    );
  }
);

export default PNLGrid;
