/* eslint-disable */
import React, { forwardRef, useImperativeHandle } from "react";
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
    },
    ref
  ) => {
    if (!balanceSheetData || balanceSheetData.length === 0)
      return <div>No Data Found</div>;

    const rawData = balanceSheetData[0]?.glBalance || [];
    const isDetail = selectedRadio === "D";
    const isHorizontal = reportOrientation === "H";
    console.log("netProfit", balanceSheetData[0]?.netProfit);
    console.log("grossProfit", balanceSheetData[0]?.grossProfit);
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
    // ✅ ✅ ✅ D MODE → SINGLE EXACT TRIAL BALANCE TABLE
    // ==========================================================
    if (isDetail) {
      return (
        <BalanceDetailedGrid
          balanceSheetData={filteredData}
          netProfit={balanceSheetData[0]?.netProfit}
          selectedRadio="D"
          selectedRadioType="E"
          reportType={selectedRadioType}
          grossProfit={balanceSheetData[0]?.grossProfit}
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
    const groupByTB1Array = (data, type, selectedRadio, eliminateZero) => {
      const map = {};

      data.forEach((r) => {
        const key = r.tb1GroupName;
        let amt = Number(r.closingBalance || 0); // ✅ NO SIGN CHANGE HERE

        if (!map[key]) map[key] = 0;
        map[key] += amt;
      });

      return Object.entries(map)
        .filter(([_, amt]) => !eliminateZero || amt !== 0)
        .map(([name, amt]) => ({ name, amt }));
    };

    // S mode summary arrays
    const expenseArr = groupByTB1Array(
      leftData,
      leftType,
      selectedRadio,
      eliminateZero
    );

    const incomeArr = groupByTB1Array(
      rightData,
      rightType,
      selectedRadio,
      eliminateZero
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

    // ✅ Totals now respect all sign rules (Liability & Income flipped; Expense positive)
    const expenseTotal = expenseArr.reduce(
      (a, b) => a + (b.isGross ? 0 : Number(b.calcAmt ?? b.amt ?? 0)),
      0
    );

    const incomeTotal = incomeArr.reduce(
      (a, b) => a + (b.isGross ? 0 : Number(b.calcAmt ?? b.amt ?? 0)),
      0
    );

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
        <div className={styles.thinScrollBar} style={{ maxHeight: "80vh" }}>
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
                        //fontWeight: r.expIsGross ? "bold" : "normal", // ✅ BOLD   Akash
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
                        //fontWeight: r.expIsGross ? "bold" : "normal", // ✅ BOLD Akash
                        fontWeight: expenseArr[i]?.isBold ? "bold" : "normal",
                      }}
                    >
                      {r.expAmt !== "" ? fmt(Math.abs(r.expAmt)) : ""}
                    </TableCell>

                    <TableCell
                      sx={{
                        fontSize: FONT_L2,
                        //fontWeight: r.incIsGross ? "bold" : "normal", // ✅ BOLD  Akash
                        fontWeight: incomeArr[i]?.isBold ? "bold" : "normal",
                      }}
                    >
                      {r.incName}
                    </TableCell>

                    <TableCell
                      align="right"
                      sx={{
                        fontSize: FONT_L2,
                        //fontWeight: r.incIsGross ? "bold" : "normal", // ✅ BOLD Akash
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

                  <TableBody>
                    {/* ✅ ASSETS / EXPENSE */}
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
                      // ✅ FIX: Net Profit / Net Loss must display as POSITIVE in Liability
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
                                //fontWeight: r.isGross ? "bold" : "normal", // ✅ bold gross Akash
                                fontWeight:
                                  r.isGross || r.isNet ? "bold" : "normal", // ✅ Gross + Net bold
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
                                r.isGross || r.isNet ? "bold" : "normal", // ✅ Amount also bold
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

                    {/* ✅ INCOME / LIABILITY */}
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
                      // ✅ DISPLAY FIX ONLY (DO NOT TOUCH CALC)
                      const displayAmt =
                        r.name === "Net Profit" || r.name === "Net Loss"
                          ? Math.abs(r.amt) // ✅ remove minus ONLY for display
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
                                  r.isGross || r.isNet ? "bold" : "normal", // ✅ Gross + Net bold  Akash
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
                                r.isGross || r.isNet ? "bold" : "normal", // ✅ Amount also bold Akash
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
