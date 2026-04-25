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

const FONT_L1 = "11px";
const FONT_L2 = "10px";
const FONT_L3 = "9px";

const LEVEL1_ORDER = ["Liability", "Assets", "Income", "Expense"];
const INCOME_L2_ORDER = ["Direct Incomes", "Indirect Incomes"];
const EXPENSE_L2_ORDER = ["Direct Expenses", "Indirect Expenses"];

const getOrderedKeys = (obj, { level, rootKey }) => {
  const keys = Object.keys(obj || {});

  if (level === 0) {
    return [
      ...LEVEL1_ORDER.filter((k) => obj?.[k]),
      ...keys.filter((k) => !LEVEL1_ORDER.includes(k)),
    ];
  }

  if (level === 1 && rootKey === "Income") {
    return [
      ...INCOME_L2_ORDER.filter((k) => obj?.[k]),
      ...keys.filter((k) => !INCOME_L2_ORDER.includes(k)),
    ];
  }

  if (level === 1 && rootKey === "Expense") {
    return [
      ...EXPENSE_L2_ORDER.filter((k) => obj?.[k]),
      ...keys.filter((k) => !EXPENSE_L2_ORDER.includes(k)),
    ];
  }

  return keys;
};

const fmt = (num) => Number(num || 0).toFixed(2);

const splitAmount = (amt) => {
  if (amt > 0) return { dr: amt, cr: 0 };
  if (amt < 0) return { dr: 0, cr: Math.abs(amt) };
  return { dr: 0, cr: 0 };
};

const buildTree = (data, showAllLevels) => {
  const root = {};

  data.forEach((row) => {
    const open = splitAmount(row.openingBalance);
    const tran = splitAmount(row.transactionBalance);
    const close = splitAmount(row.closingBalance);

    const ledgerRow = {
      glId: row.glId,
      name: row.glName,
      OpeningDrAmt: open.dr,
      OpeningCrAmt: open.cr,
      TransactionDrAmt: tran.dr,
      TransactionCrAmt: tran.cr,
      ClosingDrAmt: close.dr,
      ClosingCrAmt: close.cr,
    };

    const rawLevels = showAllLevels
      ? [
          row.BalanceSheetName,
          row.tb1GroupName,
          row.tb2GroupName,
          row.tb3GroupName,
          row.tb4GroupName,
          row.glName,
        ]
      : [row.BalanceSheetName, row.tb1GroupName, row.glName];

    const levels = rawLevels.filter(
      (v) => v !== null && v !== undefined && v !== "",
    );

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

const handleGlClick = (glId) => {
  if (!glId) return;
  const url = `/dynamicReports?menuName=993&glId=${glId}`;
  window.open(url, "_blank");
};

const TrialBalanceGrid = forwardRef(
  ({ balanceSheetData, selectedRadio, selectedRadioType, toggle }, ref) => {
    const [hoveredGlId, setHoveredGlId] = React.useState(null);

    const safeData = Array.isArray(balanceSheetData) ? balanceSheetData : [];
    const hasData = safeData.length > 0;

    const isDetailMode = selectedRadio === "D";
    const tree = hasData ? buildTree(safeData, isDetailMode) : {};
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

    const sumNodeTotals = (node) => {
      let total = makeEmptyTotals();

      const walk = (n) => {
        total = addTotals(total, sumLevelTotals(n.__rows || []));
        Object.values(n.__children || {}).forEach(walk);
      };

      walk(node);
      return total;
    };

    const computeGrandTotal = () => {
      let total = makeEmptyTotals();
      Object.values(tree).forEach((node) => {
        total = addTotals(total, sumNodeTotals(node));
      });
      return total;
    };

    const grandTotal = computeGrandTotal();

    const exportToExcel = async () => {
      if (!hasData) {
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

      const exportTree = buildTree(safeData, isDetailMode);
      const orderedLevel1 = LEVEL1_ORDER.filter((k) => exportTree[k]);
      const exportColumns = getColumns(selectedRadio, selectedRadioType);

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
        exportColumns.map((c) =>
          c === "Ledger Name" ? "" : getColumnLabel(c),
        ),
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

      const renderExcelTree = (node, level = 0, rootKey = null) => {
        const orderedKeys = getOrderedKeys(node, { level, rootKey });

        orderedKeys.forEach((key) => {
          const value = node[key];
          const totals = sumNodeTotals(value);

          if (!isDetailMode && level > 1) return;

          const isLeaf =
            !value.__children || Object.keys(value.__children).length === 0;

          const isBold = isDetailMode ? !isLeaf : level === 0;

          const row = sheet.addRow([
            " ".repeat(level * 4) + key,
            ...exportColumns.slice(1).map(() => ""),
          ]);

          const style =
            level === 0
              ? STYLES.L1
              : isBold
                ? STYLES.L2_BOLD
                : STYLES.L2_NORMAL;

          row.getCell(1).style = style;

          exportColumns.slice(1).forEach((c, i) => {
            const cell = row.getCell(i + 2);
            setNumber(cell, totals[c]);
            cell.style = style;
          });

          applyBorderless(row);
          renderExcelTree(value.__children || {}, level + 1, rootKey || key);
        });
      };

      orderedLevel1.forEach((lvl1) => {
        renderExcelTree({ [lvl1]: exportTree[lvl1] }, 0);
      });

      const gRow = sheet.addRow([
        "Grand Total",
        ...exportColumns.slice(1).map(() => ""),
      ]);

      exportColumns.slice(1).forEach((c, i) => {
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

    const exportToPDF = async () => {
      if (!hasData) {
        alert("No data to export");
        return;
      }

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let logoBase64 = null;

      const storedUserData = localStorage.getItem("userData");
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

      const exportTree = buildTree(safeData, isDetailMode);
      const orderedLevel1 = LEVEL1_ORDER.filter((k) => exportTree[k]);
      const exportColumns = getColumns(selectedRadio, selectedRadioType);
      const bodyRows = [];

      const buildPdfRows = (node, level = 0, rootKey = null) => {
        const orderedKeys = getOrderedKeys(node, { level, rootKey });

        orderedKeys.forEach((key) => {
          const value = node[key];
          const totals = sumNodeTotals(value);

          if (!isDetailMode && level > 1) return;

          const isLeaf =
            !value.__children || Object.keys(value.__children).length === 0;

          const shouldBold = isDetailMode ? !isLeaf : level === 0;

          bodyRows.push([
            " ".repeat(level * 4) + key,
            ...exportColumns
              .slice(1)
              .map((c) => Number(totals[c] || 0).toFixed(2)),
            "__BOLD__:" + (shouldBold ? "1" : "0"),
          ]);

          buildPdfRows(value.__children || {}, level + 1, rootKey || key);
        });
      };

      orderedLevel1.forEach((lvl1) => {
        buildPdfRows({ [lvl1]: exportTree[lvl1] }, 0);
      });

      bodyRows.push([
        "Grand Total",
        ...exportColumns
          .slice(1)
          .map((c) => Number(grandTotal[c] || 0).toFixed(2)),
        "__BOLD__:1",
      ]);

      autoTable(doc, {
        startY: 38,
        margin: { top: 38, left: 5, right: 5 },
        head: [
          exportColumns.map((c) =>
            c === "Ledger Name" ? "" : getColumnLabel(c),
          ),
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

    useImperativeHandle(ref, () => ({
      exportToExcel,
      exportToPDF,
    }));

    if (!hasData) {
      return <div>No Data Found</div>;
    }

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
                const renderTree = (node, level = 0, rootKey = null) => {
                  const orderedKeys = getOrderedKeys(node, { level, rootKey });

                  return orderedKeys.map((key) => {
                    const value = node[key];
                    const totals = sumNodeTotals(value);

                    if (!isDetailMode && level > 1) return null;

                    const isLeaf =
                      !value.__children ||
                      Object.keys(value.__children).length === 0;

                    const glId = isLeaf ? value?.__rows?.[0]?.glId : null;
                    const isClickable = Boolean(isLeaf && glId);
                    const isHovered = isClickable && hoveredGlId === glId;
                    const isBold = isDetailMode ? !isLeaf : level === 0;

                    return (
                      <React.Fragment
                        key={`${key}-${level}-${glId ?? "group"}`}
                      >
                        <TableRow
                          onClick={() => {
                            if (isClickable) handleGlClick(glId);
                          }}
                          onMouseEnter={() => {
                            if (isClickable) setHoveredGlId(glId);
                          }}
                          onMouseLeave={() => {
                            if (isClickable) setHoveredGlId(null);
                          }}
                          sx={{
                            transition:
                              "background-color 0.15s ease-in-out, color 0.15s ease-in-out",
                            "&:hover": {
                              backgroundColor: "rgba(126,155,207,0.18)",
                              cursor: isClickable ? "pointer" : "default",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: isBold ? "bold" : "normal",
                            }}
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
                                color: isHovered
                                  ? "#1976d2"
                                  : "var(--tableRowTextColor)",
                                fontWeight: isBold ? "bold" : "normal",
                                textDecoration: "none",
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

                        {renderTree(
                          value.__children || {},
                          level + 1,
                          rootKey || key,
                        )}
                      </React.Fragment>
                    );
                  });
                };

                const topKeys = Object.keys(tree);
                const fixedKeys = ["Liability", "Assets", "Income", "Expense"];

                const orderedKeys = [
                  ...fixedKeys.filter((k) => tree[k]),
                  ...topKeys.filter((k) => !fixedKeys.includes(k)),
                ];

                return orderedKeys.map((k) => renderTree({ [k]: tree[k] }, 0));
              })()}

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

export default TrialBalanceGrid;
