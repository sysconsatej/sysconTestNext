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

      if (idx === levels.length - 1) {
        current[level].__rows.push(ledgerRow);
      }

      current = current[level].__children;
    });
  });

  return root;
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
    },
    ref
  ) => {
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
              grossProfitValue < 0 ? "Gross Loss" : "Gross Profit",
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

    // 🔹 build tree using 6 or 2 levels
    const tree = buildTree(mergedData, isDetailMode);

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
    const orderedLevel1 = LEVEL1_ORDER.filter((k) => tree[k]);

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
      const orderedLevel1 = LEVEL1_ORDER.filter((k) => tree[k]);
      const columns = getColumns(selectedRadio, selectedRadioType);

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Trial Balance", {
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
        const num = Number(value ?? 0);
        cell.value = num;
        cell.numFmt = "0.00";
        cell.alignment = { horizontal: "right" };
        cell.border = {};
      };

      const applyBorderless = (row) => {
        row.eachCell((cell) => (cell.border = {}));
      };

      const renderExcelTree = (node, level = 0) => {
        Object.entries(node).forEach(([key, value]) => {
          const totals = sumNodeTotals(value);

          if (!isDetailMode && level > 1) return;

          const isLeaf =
            !value.__children || Object.keys(value.__children).length === 0;

          // ✅ BOLD Gross / Net rows explicitly
          const isBold =
            value.__rows?.[0]?.isGross || value.__rows?.[0]?.isNet
              ? true
              : isDetailMode
              ? !isLeaf
              : level === 0;

          const row = sheet.addRow([
            " ".repeat(level * 4) + key,
            ...columns.slice(1).map(() => ""),
          ]);

          const style =
            level === 0
              ? STYLES.L1
              : isBold
              ? STYLES.L2_BOLD
              : STYLES.L2_NORMAL;

          row.getCell(1).style = style;

          columns.slice(1).forEach((c, i) => {
            const cell = row.getCell(i + 2);
            setNumber(cell, totals[c]);
            cell.style = style;
          });

          applyBorderless(row);

          renderExcelTree(value.__children || {}, level + 1);
        });
      };

      orderedLevel1.forEach((lvl1) => {
        const rootNode = tree[lvl1];
        renderExcelTree({ [lvl1]: rootNode }, 0);
      });

      const gRow = sheet.addRow([
        "Grand Total",
        ...columns.slice(1).map(() => ""),
      ]);

      columns.slice(1).forEach((c, i) => {
        const cell = gRow.getCell(i + 2);
        setNumber(cell, grandTotal[c]);
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
      const orderedLevel1 = LEVEL1_ORDER.filter((k) => tree[k]);
      const columns = getColumns(selectedRadio, selectedRadioType);

      const bodyRows = [];

      const buildPdfRows = (node, level = 0) => {
        Object.entries(node).forEach(([key, value]) => {
          const totals = sumNodeTotals(value);

          if (!isDetailMode && level > 1) return;

          const isLeaf =
            !value.__children || Object.keys(value.__children).length === 0;

          // ✅ BOLD Gross / Net rows explicitly
          const shouldBold =
            value.__rows?.[0]?.isGross || value.__rows?.[0]?.isNet
              ? true
              : isDetailMode
              ? !isLeaf
              : level === 0;

          bodyRows.push([
            " ".repeat(level * 4) + key,
            ...columns.slice(1).map((c) => Number(totals[c] || 0).toFixed(2)),
            "__BOLD__:" + (shouldBold ? "1" : "0"),
          ]);

          buildPdfRows(value.__children || {}, level + 1);
        });
      };

      orderedLevel1.forEach((lvl1) => {
        buildPdfRows({ [lvl1]: tree[lvl1] }, 0);
      });

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
          if (boldFlag === "__BOLD__:1") {
            data.cell.styles.fontStyle = "bold";
          }
        },

        didDrawPage: () => {
          drawHeader();
        },
      });

      doc.save("TrialBalance.pdf");
    };

    console.log("NET PROFIT RAW:", balanceSheetData?.[0]?.netProfit);
    console.log("MERGED DATA LAST ROW:", mergedData[mergedData.length - 1]);
    console.log("TREE HAS NET PROFIT:", tree["Net Profit"]);

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
                const renderTree = (node, level = 0) => {
                  return Object.entries(node).map(([key, value]) => {
                    const totals = sumNodeTotals(value);

                    if (!isDetailMode && level > 1) return null;

                    const isLeaf =
                      !value.__children ||
                      Object.keys(value.__children).length === 0;

                    // ✅ BOLD Gross / Net rows explicitly
                    const isBold =
                      value.__rows?.[0]?.isGross || value.__rows?.[0]?.isNet
                        ? true
                        : isDetailMode
                        ? !isLeaf
                        : level === 0;

                    return (
                      <React.Fragment key={key}>
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

                        {renderTree(value.__children || {}, level + 1)}
                      </React.Fragment>
                    );
                  });
                };

                return renderTree(tree);
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
