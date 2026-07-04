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

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return value;

  if (
    !trimmed.startsWith("[") &&
    !trimmed.startsWith("{") &&
    !trimmed.startsWith('"')
  ) {
    return value;
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (typeof parsed === "string") {
      const inner = parsed.trim();
      if (inner.startsWith("[") || inner.startsWith("{")) {
        return JSON.parse(inner);
      }
    }

    return parsed;
  } catch {
    return value;
  }
};

const normalizeArrayValue = (value) => {
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") return [parsed];
  return [];
};

const hasLedgerShape = (value) => {
  const parsed = parseMaybeJson(value);
  if (!parsed || typeof parsed !== "object") return false;

  return (
    parsed.glName !== undefined ||
    parsed.GlName !== undefined ||
    parsed.GLName !== undefined ||
    parsed.glData !== undefined ||
    parsed.GlData !== undefined ||
    parsed.GLData !== undefined
  );
};

const unwrapLedgerPayload = (value) => {
  const parsed = parseMaybeJson(value);

  if (Array.isArray(parsed)) return parsed;

  if (!parsed || typeof parsed !== "object") return [];

  if (Array.isArray(parsed.data)) return parsed.data;
  if (Array.isArray(parsed.recordset)) return parsed.recordset;
  if (Array.isArray(parsed.result)) return parsed.result;

  if (hasLedgerShape(parsed)) return [parsed];

  // ✅ SQL can sometimes return JSON in an unnamed/default column.
  // Check every property value and unwrap the first value that looks like
  // [{ glName: [...], glData: [...] }].
  for (const val of Object.values(parsed)) {
    const next = parseMaybeJson(val);

    if (Array.isArray(next)) {
      const found = next.find((x) => hasLedgerShape(x));
      if (found) return next;
    }

    if (hasLedgerShape(next)) return [next];

    if (next && typeof next === "object") {
      if (Array.isArray(next.data)) return next.data;
      if (Array.isArray(next.recordset)) return next.recordset;
      if (Array.isArray(next.result)) return next.result;
    }
  }

  return [parsed];
};

const normalizeLedgerBlocks = (ledgerData) => {
  const rawBlocks = unwrapLedgerPayload(ledgerData);

  return rawBlocks
    .map((item) => {
      const block = parseMaybeJson(item);
      if (!block || typeof block !== "object") return null;

      const glName = normalizeArrayValue(
        block.glName ?? block.GlName ?? block.GLName,
      );

      const glData = normalizeArrayValue(
        block.glData ?? block.GlData ?? block.GLData,
      );

      return {
        ...block,
        glName,
        glData,
      };
    })
    .filter((block) => {
      if (!block) return false;

      // ✅ IMPORTANT:
      // Earlier logic required glData.length > 0, so the complete table was
      // hidden when only opening/closing balance existed.
      // Keep the block when glName exists, even if glData is empty.
      return (
        (Array.isArray(block.glName) && block.glName.length > 0) ||
        (Array.isArray(block.glData) && block.glData.length > 0)
      );
    });
};

export default function LedgerDetailedReport({
  ledgerData,
  ledgerLocalForeignRadio,
  toggle,
}) {
  const blocks = normalizeLedgerBlocks(ledgerData);

  const isLocal = String(ledgerLocalForeignRadio || "L").toUpperCase() === "L";

  const handleVoucherRedirect = (row) => {
    if (!row?.menuId && !row?.recordId) return;

    const queryString = encodeURIComponent(
      JSON.stringify({
        id: row?.recordId,
        menuName: row?.menuId,
        isCopy: false,
        isView: false,
      }),
    );

    const url = `/invoiceControl/addEdit//${queryString}`;
    window.open(url, "_blank");
  };

  // const appBaseUrl =
  // typeof window !== "undefined"
  //   ? window.location.origin.replace(/\/$/, "")
  //   : "";

  if (!blocks.length) {
    return (
      <></>
      // <Paper
      //   sx={{
      //     boxShadow: "none",
      //     p: 2,
      //     backgroundColor: "var(--commonBg)",
      //     border: "1px solid var(--tableRowTextColor)",
      //   }}
      // >
      //   <Typography sx={{ color: "var(--tableRowTextColor)", fontSize: FONT }}>
      //     No Data Found
      //   </Typography>
      // </Paper>
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
        { key: "partyName", label: "Party Name", minWidth: 130 },
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
        { key: "partyName", label: "Party Name", minWidth: 130 },
        { key: "narration", label: "Narration", minWidth: 260 },

        // ✅ numeric cols
        { key: "debitAmountFc", label: "Dr", minWidth: 95, isNumeric: true },
        { key: "creditAmountFc", label: "Cr", minWidth: 95, isNumeric: true },
        { key: "__balance", label: "Balance", minWidth: 110, isNumeric: true },

        { key: "currencyCode", label: "Currency", minWidth: 80 },
      ];

  // columns: ... Narration (index 6), Dr (index 7), Cr (index 8), Balance (index 9), Currency (index 10)
  const DR_INDEX = 7;
  const CR_INDEX = 8;

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
              isLocal ? r?.creditAmountHC : r?.creditAmountFc,
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
                      "rgba(126,155,207,0.06)",
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
                    {rowsWithBalance.length > 0 ? (
                      rowsWithBalance.map((r, i) => (
                        <TableRow
                          key={r?.id ?? i}
                          sx={{
                            transition: "background-color 0.15s ease-in-out",
                            "&:hover": {
                              backgroundColor: "rgba(126,155,207,0.12)",
                            },
                          }}
                        >
                          <TableCell align="left">
                            {r?.voucherNo ? (
                              <span
                                onClick={() => handleVoucherRedirect(r)}
                                style={{
                                  cursor: "pointer",
                                  fontWeight: 500,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = "#1976d2";
                                  e.currentTarget.style.textDecoration =
                                    "underline";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = "inherit";
                                  e.currentTarget.style.textDecoration = "none";
                                }}
                              >
                                {r.voucherNo}
                              </span>
                            ) : (
                              ""
                            )}
                          </TableCell>
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
                              maxWidth: 180,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={r?.partyName || ""}
                          >
                            {r?.partyName || ""}
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
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          align="center"
                          sx={{
                            fontWeight: 700,
                            color: "var(--tableRowTextColor)",
                            backgroundColor: "rgba(126,155,207,0.04)",
                          }}
                        >
                          No transactions found for this ledger.
                        </TableCell>
                      </TableRow>
                    )}

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
                      "rgba(126,155,207,0.10)",
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
