/* eslint-disable */
"use client";

import React from "react";
import {
  Paper,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider,
} from "@mui/material";

import styles from "@/app/app.module.css";

const FONT = "10px";

const fmt = (v) => {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const toNum = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(String(v).replace(/,/g, ""));
  return Number.isNaN(n) ? 0 : n;
};

const fmtDate = (d) => {
  if (!d) return "";
  const s = String(d).slice(0, 10);
  if (s === "1900-01-01") return "";
  const dt = new Date(s);
  if (Number.isNaN(dt.getTime())) return s;
  return dt.toLocaleDateString("en-GB");
};

export default function LedgerDetailedReport({
  ledgerData,
  ledgerLocalForeignRadio,
  toggle,
}) {
  const raw = Array.isArray(ledgerData) ? ledgerData : [];
  const blocks = raw.filter((b) => Array.isArray(b?.glData) && b.glData.length);

  const isLocal = String(ledgerLocalForeignRadio || "L").toUpperCase() === "L";

  if (!blocks.length) {
    return (
      <Paper
        sx={{
          boxShadow: "none",
          p: 2,
          backgroundColor: "var(--commonBg)",
          border: "1px solid var(--tableRowTextColor)",
        }}
      >
        <Typography sx={{ color: "var(--tableRowTextColor)", fontSize: FONT }}>
          No Data Found
        </Typography>
      </Paper>
    );
  }

  // ✅ columns (Currency in BOTH)
  const columns = isLocal
    ? [
        { key: "voucherNo", label: "Voucher No", minWidth: 110 },
        { key: "voucherDate", label: "Voucher Date", minWidth: 95 },
        { key: "voucherType", label: "Voucher Type", minWidth: 130 },
        { key: "referenceNo", label: "Reference No", minWidth: 110 },
        { key: "referenceDate", label: "Reference Date", minWidth: 105 },
        { key: "narration", label: "Narration", minWidth: 260 },

        // ✅ numeric cols
        { key: "debitAmountHC", label: "Dr", minWidth: 95, isNumeric: true },
        { key: "creditAmountHC", label: "Cr", minWidth: 95, isNumeric: true },
        { key: "__balance", label: "Balance", minWidth: 110, isNumeric: true },

        { key: "currencyCode", label: "Currency", minWidth: 80 },
      ]
    : [
        { key: "voucherNo", label: "Voucher No", minWidth: 110 },
        { key: "voucherDate", label: "Voucher Date", minWidth: 95 },
        { key: "voucherType", label: "Voucher Type", minWidth: 130 },
        { key: "referenceNo", label: "Reference No", minWidth: 110 },
        { key: "referenceDate", label: "Reference Date", minWidth: 105 },
        { key: "narration", label: "Narration", minWidth: 260 },

        // ✅ numeric cols
        { key: "debitAmountFc", label: "Dr", minWidth: 95, isNumeric: true },
        { key: "creditAmountFc", label: "Cr", minWidth: 95, isNumeric: true },
        { key: "__balance", label: "Balance", minWidth: 110, isNumeric: true },

        { key: "currencyCode", label: "Currency", minWidth: 80 },
      ];

  // columns: ... Narration (index 5), Dr (index 6), Cr (index 7), Balance (index 8), Currency (index 9)
  const DR_INDEX = 6;
  const CR_INDEX = 7;

  // ✅ helper to render Opening/Closing row aligned under Dr/Cr
  const renderOCRow = (label, amount, bg) => {
    const amt = toNum(amount);
    const isCr = amt < 0;

    const leftSpan = isCr ? CR_INDEX : DR_INDEX;
    const blanksAfter = columns.length - (leftSpan + 1);

    const displayText = isCr ? `${fmt(Math.abs(amt))} Cr` : `${fmt(amt)} Dr`;

    return (
      <TableRow sx={{ backgroundColor: bg }}>
        <TableCell colSpan={leftSpan} align="left" sx={{ fontWeight: 700 }}>
          {label}
        </TableCell>

        <TableCell align="right" sx={{ fontWeight: 700 }}>
          {displayText}
        </TableCell>

        {Array.from({ length: blanksAfter }).map((_, i) => (
          <TableCell key={i} />
        ))}
      </TableRow>
    );
  };

  return (
    <Paper
      sx={{
        boxShadow: "none",
        backgroundColor: "var(--commonBg)",
        maxHeight: toggle ? "60vh" : "80vh",
        overflowY: "auto",
      }}
      className={`${styles.thinScrollBar}`}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 1 }}>
        {blocks.map((block, idx) => {
          const glInfo = Array.isArray(block?.glName) ? block.glName[0] : null;
          const rows = Array.isArray(block?.glData) ? block.glData : [];

          const glTitle = glInfo?.glName || `Ledger ${idx + 1}`;

          const openingHC = toNum(glInfo?.openingBalanceHC);
          const openingFC = toNum(glInfo?.openingBalanceFC);

          const closingHC_fromData = glInfo?.closingBalanceHC;
          const closingFC_fromData = glInfo?.closingBalanceFC;

          const openingValue = isLocal ? openingHC : openingFC;

          // ✅ running balance
          let running = openingValue;

          const rowsWithBalance = rows.map((r) => {
            const debit = toNum(isLocal ? r?.debitAmountHC : r?.debitAmountFc);
            const credit = toNum(
              isLocal ? r?.creditAmountHC : r?.creditAmountFc
            );
            running = running + debit - credit;
            return { ...r, __balance: running };
          });

          const closingComputed = running;

          const closingValue = isLocal
            ? toNum(closingHC_fromData ?? closingComputed)
            : toNum(closingFC_fromData ?? closingComputed);

          // ✅ totals (include opening into Dr/Cr depending on where opening falls)
          const openingIsCr = toNum(openingValue) < 0;
          const openingAbs = Math.abs(toNum(openingValue));

          const rowsTotalDr = rowsWithBalance.reduce((sum, r) => {
            const v = toNum(isLocal ? r?.debitAmountHC : r?.debitAmountFc);
            return sum + v;
          }, 0);

          const rowsTotalCr = rowsWithBalance.reduce((sum, r) => {
            const v = toNum(isLocal ? r?.creditAmountHC : r?.creditAmountFc);
            return sum + v;
          }, 0);

          const totalDr = rowsTotalDr + (openingIsCr ? 0 : openingAbs);
          const totalCr = rowsTotalCr + (openingIsCr ? openingAbs : 0);

          // Balance total = final running (closingComputed)
          const totalBalance = closingComputed;

          return (
            <Paper
              key={glInfo?.id ?? idx}
              sx={{
                boxShadow: "none",
                overflow: "hidden",
                backgroundColor: "var(--commonBg)",
                border: "1px solid var(--tableRowTextColor)",
              }}
            >
              {/* ✅ Center Ledger Heading */}
              <Box
                sx={{
                  px: 1.2,
                  py: 0.8,
                  backgroundColor: "rgba(126,155,207,0.12)",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "var(--tableRowTextColor)",
                    fontSize: FONT,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={glTitle}
                >
                  Ledger Name : {glTitle}
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{ overflowX: "auto" }}
                className={`${styles.thinScrollBar}`}
              >
                <Table
                  size="small"
                  sx={{
                    minWidth: 1240,
                    borderCollapse: "collapse",
                    backgroundColor: "var(--commonBg)",
                    "& td, & th": {
                      border: "none !important",
                      padding: "4px 6px !important",
                      fontSize: FONT,
                      color: "var(--tableRowTextColor)",
                      lineHeight: 1.2,
                    },
                  }}
                >
                  <TableHead>
                    {/* ✅ OPENING ROW */}
                    {renderOCRow(
                      "Opening",
                      openingValue,
                      "rgba(126,155,207,0.06)"
                    )}

                    {/* ✅ COLUMN HEADINGS: Left except numeric Right */}
                    <TableRow
                      sx={{
                        backgroundColor: "var(--tableHeaderBg)",
                        "& th": { color: "#FFF", fontWeight: "bold" },
                      }}
                    >
                      {columns.map((c) => (
                        <TableCell
                          key={c.key}
                          align={c.isNumeric ? "right" : "left"}
                          sx={{
                            fontSize: FONT,
                            minWidth: c.minWidth,
                            whiteSpace: "nowrap",
                            textAlign: c.isNumeric ? "right" : "left",
                          }}
                        >
                          {c.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {rowsWithBalance.map((r, i) => (
                      <TableRow
                        key={r?.id ?? i}
                        sx={{
                          transition: "background-color 0.15s ease-in-out",
                          "&:hover": {
                            backgroundColor: "rgba(126,155,207,0.12)",
                          },
                        }}
                      >
                        <TableCell align="left">{r?.voucherNo || ""}</TableCell>
                        <TableCell align="left">
                          {fmtDate(r?.voucherDate)}
                        </TableCell>
                        <TableCell align="left">
                          {r?.voucherType || ""}
                        </TableCell>
                        <TableCell align="left">
                          {r?.referenceNo || ""}
                        </TableCell>
                        <TableCell align="left">
                          {fmtDate(r?.referenceDate)}
                        </TableCell>

                        <TableCell
                          align="left"
                          sx={{
                            maxWidth: 360,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={r?.narration || ""}
                        >
                          {r?.narration || ""}
                        </TableCell>

                        {isLocal ? (
                          <>
                            <TableCell align="right">
                              {fmt(r?.debitAmountHC)}
                            </TableCell>
                            <TableCell align="right">
                              {fmt(r?.creditAmountHC)}
                            </TableCell>
                            <TableCell align="right">
                              {fmt(r?.__balance)}
                            </TableCell>
                            <TableCell align="left">
                              {r?.currencyCode || ""}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell align="right">
                              {fmt(r?.debitAmountFc)}
                            </TableCell>
                            <TableCell align="right">
                              {fmt(r?.creditAmountFc)}
                            </TableCell>
                            <TableCell align="right">
                              {fmt(r?.__balance)}
                            </TableCell>
                            <TableCell align="left">
                              {r?.currencyCode || ""}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}

                    {/* ✅ TOTAL ROW (ABOVE CLOSING) */}
                    <TableRow
                      sx={{ backgroundColor: "rgba(126,155,207,0.16)" }}
                    >
                      {/* "Total" label up to Narration column */}
                      <TableCell
                        colSpan={DR_INDEX}
                        align="left"
                        sx={{ fontWeight: 800 }}
                      >
                        Total
                      </TableCell>

                      {/* Dr total */}
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {fmt(totalDr)}
                      </TableCell>

                      {/* Cr total */}
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {fmt(totalCr)}
                      </TableCell>

                      {/* Balance total */}
                      <TableCell align="right" sx={{ fontWeight: 800 }}>
                        {fmt(totalBalance)}
                      </TableCell>

                      {/* Currency blank */}
                      <TableCell />
                    </TableRow>

                    {/* ✅ CLOSING ROW (LAST) */}
                    {renderOCRow(
                      "Closing",
                      closingValue,
                      "rgba(126,155,207,0.10)"
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}
