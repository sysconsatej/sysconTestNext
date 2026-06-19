"use client";
/* eslint-disable */

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import {
  fetchReportData,
  fetchBlPrintReportData,
} from "@/services/auth/FormControl.services";

// ✅ Hybrid layout helper (auto-size / can-grow / pagination)
import { layoutTemplateForData } from "@/helper/blReport_hybrid_helpers";

/* =========================================================
   CONSTANTS
========================================================= */

const MM_TO_PX = 96 / 25.4;

function pxToMm(px) {
  return (Number(px || 0) || 0) / MM_TO_PX;
}

function resolveRepeatTableMetricsMm(el, repeat, tmeta) {
  const t = tmeta || el?.table || el?.tbl || el?.meta || {};

  const headerBaseMm = Number(repeat?.headerHeightMm ?? 7) || 7;
  const bodyBaseMm = Number(repeat?.rowHeightMm ?? 6) || 6;

  const outerBW = Math.max(0, Number(t?.borderWidth ?? 1) || 0);
  const gridBW = Math.max(0, Number(t?.gridWidth ?? outerBW) || 0);
  const borderMm = Math.max(0, pxToMm(gridBW));

  const headerRowMm = headerBaseMm + borderMm;
  const bodyRowMm = bodyBaseMm + borderMm;

  return {
    headerBaseMm,
    bodyBaseMm,
    borderMm,
    headerRowMm,
    bodyRowMm,
  };
}

// ✅ default fallback A4
const A4_W_MM = 210;
const A4_H_MM = 297;

// ✅ safety guards for preview / pdf memory usage
const MAX_SAFE_RENDER_PAGES = 100;
const MAX_SAFE_HTML_CHARS = 8_000_000; // legacy full-html guard; streamed preview does not keep this in React state
const MAX_SAFE_PDF_PAGES = 50;

// ✅ large-template handling
// Do not use iframe srcDoc for big reports. Render pages into iframe in small chunks.
const PREVIEW_RENDER_CHUNK_PAGES = 1;
const PRINT_RENDER_CHUNK_PAGES = 3;
const PDF_RENDER_CHUNK_PAGES = 1;
const MAX_SAFE_TEMPLATE_JSON_CHARS = 25_000_000;

// ✅ OOM fix with continuous preview:
// Keep pages visually one-after-another, but lazily mount page DOM only near
// the viewport. This gives normal scrolling preview without loading every page
// into Chrome memory at once. Print/PDF still render all pages on demand.
const PREVIEW_WINDOW_PAGES = 1; // legacy fallback
const PREVIEW_LAZY_BUFFER_PAGES = 1;
const MAX_SINGLE_PAGE_RENDER_HEIGHT_MM = 2500;

// ✅ print/pdf page-break safety
// Chrome can create an extra blank sheet if a page is only a fraction of a mm
// taller than A4. Treat tiny overflow as normal A4 height.
const PAGE_HEIGHT_EPSILON_MM = 0.75;
const PRINT_SLICE_EPSILON_MM = 0.75;

// ✅ Physical A4 split margins
// When one logical/template page becomes taller than A4, we slice it into real
// A4 pages. These margins keep continuation pages from starting/ending exactly
// on the page edge, which fixes the hard cut visible between attachment pages.
// First slice keeps top at 0mm so designed templates/front pages stay aligned.
const PHYSICAL_SPLIT_TOP_MARGIN_MM = 8;
const PHYSICAL_SPLIT_BOTTOM_MARGIN_MM = 8;
const PREVIEW_PAGE_GAP_MM = 14;

/* =========================================================
   DEBUG TOGGLES
   - enable by: ?debug=1 in URL OR localStorage.DEBUG_BL_REPORT=1
========================================================= */

function getDebugFlag(searchParams) {
  try {
    const qp = searchParams?.get("debug");
    if (qp === "1" || qp === "true") return true;
  } catch {}
  try {
    const ls =
      typeof window !== "undefined"
        ? window.localStorage?.getItem("DEBUG_BL_REPORT")
        : null;
    if (ls === "1" || ls === "true") return true;
  } catch {}
  return false;
}

function dbgLog(enabled, ...args) {
  if (!enabled) return;
  // eslint-disable-next-line no-console
  console.log(...args);
}

function applyVerticalReflowToPage(page) {
  const els = [...(page.elements || [])].sort(
    (a, b) => Number(a.y) - Number(b.y),
  );

  for (let i = 0; i < els.length; i++) {
    const el = els[i];

    const originalH = Number(el._originalHeight ?? el.h);
    const newH = Number(el.h);

    const delta = newH - originalH;

    if (delta > 0.01) {
      for (let j = i + 1; j < els.length; j++) {
        els[j] = {
          ...els[j],
          y: Number(els[j].y || 0) + delta,
        };
      }
    }

    els[i] = {
      ...els[i],
      _originalHeight: newH,
    };
  }

  page.elements = els;
}

function dbgGroup(enabled, title) {
  if (!enabled) return;
  // eslint-disable-next-line no-console
  console.group(title);
}
function dbgGroupEnd(enabled) {
  if (!enabled) return;
  // eslint-disable-next-line no-console
  console.groupEnd();
}

function nextBrowserFrame() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.requestAnimationFrame) {
      window.requestAnimationFrame(() => resolve());
      return;
    }
    setTimeout(resolve, 0);
  });
}

async function safeTemplateJsonParse(value) {
  if (value == null || value === "") return null;

  if (typeof value !== "string") return value;

  // Do not block large templates only because of character length.
  // The previous size guard caused tpl to stay null and showed
  // "Template is not loaded yet" for large but valid templates.
  let text = String(value).trim().replace(/^﻿/, "");
  if (!text) return null;

  await nextBrowserFrame();

  let parsed = JSON.parse(text);

  // Sometimes APIs return JSON as a quoted JSON string. Handle that safely.
  if (typeof parsed === "string") {
    const inner = parsed.trim().replace(/^﻿/, "");
    if (inner.startsWith("{") || inner.startsWith("[")) {
      await nextBrowserFrame();
      parsed = JSON.parse(inner);
    }
  }

  return parsed;
}

function normalizeApiRows(payload) {
  const raw = payload?.data ?? payload?.recordset ?? payload?.result ?? payload;

  if (Array.isArray(raw)) {
    if (raw.length === 1 && Array.isArray(raw[0])) return raw[0];
    return raw;
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
    } catch {}
    return [];
  }

  if (raw && typeof raw === "object") return [raw];
  return [];
}

function pickTemplateJson(row) {
  if (!row || typeof row !== "object") return null;

  const directKeys = [
    "blPrintTemplateJson",
    "BlPrintTemplateJson",
    "BLPrintTemplateJson",
    "blprinttemplatejson",
    "templateJson",
    "TemplateJson",
    "json",
  ];

  for (const key of directKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      return row[key];
    }
  }

  const foundKey = Object.keys(row).find(
    (k) => String(k).toLowerCase() === "blprinttemplatejson",
  );
  return foundKey ? row[foundKey] : null;
}

function getSearchParamAny(searchParams, names) {
  for (const name of names) {
    const v = searchParams?.get?.(name);
    if (v !== null && v !== undefined && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return null;
}

function getTemplateStats(tpl) {
  const pages = normalizePages(tpl || {});
  let elementCount = 0;
  let tableCount = 0;
  let imageCount = 0;
  let repeatTableCount = 0;

  pages.forEach((p) => {
    const els = Array.isArray(p?.elements) ? p.elements : [];
    elementCount += els.length;
    els.forEach((el) => {
      if (el?.type === "table") {
        tableCount += 1;
        if (isRepeatTableElement(el) || isRepeatTableEl(el))
          repeatTableCount += 1;
      }
      if (el?.type === "image") imageCount += 1;
    });
  });

  return {
    pageCount: pages.length,
    elementCount,
    tableCount,
    imageCount,
    repeatTableCount,
  };
}

/* =========================================================
   TEMPLATE CONFIG HELPERS (paper/margin/attachment bands)
========================================================= */
function collectPageOverflowMessages(tpl) {
  const warnings = [];
  const pages = normalizePages(tpl);

  pages.forEach((pg, pageIndex) => {
    const paperH = Number(pg?.hMm || A4_H_MM);
    const pageH = getPageRenderHeightMm(pg, {
      h: paperH,
      w: pg?.wMm || A4_W_MM,
    });
    const els = Array.isArray(pg?.elements) ? pg.elements : [];

    els.forEach((el, elIndex) => {
      if (!el || el.hidden) return;

      const bottom = Number(el?.y || 0) + Number(el?.h || 0);
      if (bottom > pageH + 0.01) {
        warnings.push(
          `${pg?.name || `Page ${pageIndex + 1}`} - element ${
            el?.id || `#${elIndex + 1}`
          } overflows extended page height (${bottom.toFixed(2)}mm > ${pageH.toFixed(2)}mm)`,
        );
      }
    });
  });

  return Array.from(new Set(warnings));
}

function getPaperMmFromTpl(tpl) {
  const w =
    Number(tpl?.paper?.w ?? tpl?.paper?.width ?? tpl?.w ?? A4_W_MM) || A4_W_MM;
  const h =
    Number(tpl?.paper?.h ?? tpl?.paper?.height ?? tpl?.h ?? A4_H_MM) || A4_H_MM;
  return { w, h };
}

function getMarginMmFromTpl(tpl) {
  const m = tpl?.margin || tpl?.margins || {};
  return {
    top: Number(m.top ?? m.t ?? 0) || 0,
    right: Number(m.right ?? m.r ?? 0) || 0,
    bottom: Number(m.bottom ?? m.b ?? 0) || 0,
    left: Number(m.left ?? m.l ?? 0) || 0,
  };
}

function inferAttachBandsMm(elements, paperMm) {
  const els = Array.isArray(elements) ? elements : [];

  const headerEls = els.filter(
    (e) => String(e?.attachBand || "").toLowerCase() === "header",
  );
  const footerEls = els.filter(
    (e) => String(e?.attachBand || "").toLowerCase() === "footer",
  );

  let attachHeaderMm = 0;
  if (headerEls.length) {
    attachHeaderMm = headerEls.reduce((mx, e) => {
      const bottom = Number(e?.y || 0) + Number(e?.h || 0);
      return Math.max(mx, bottom);
    }, 0);
  }

  let attachFooterMm = 0;
  if (footerEls.length) {
    const minY = footerEls.reduce(
      (mn, e) => Math.min(mn, Number(e?.y || 0)),
      Number(paperMm?.h || A4_H_MM),
    );
    attachFooterMm = Math.max(
      0,
      Number(paperMm?.h || A4_H_MM) - Number(minY || 0),
    );
  }

  return { attachHeaderMm, attachFooterMm };
}

/* =========================================================
   TOKEN HELPERS (robust, case-insensitive)
   ✅ REPORT behavior: missing tokens => ""
========================================================= */

function isUnresolvedTokenString(s) {
  const t = String(s ?? "").trim();
  return /^\{\{[^}]+\}\}$/.test(t);
}

function getByPath(obj, path) {
  if (obj == null || path == null) return undefined;

  const p = String(path).trim();
  if (!p) return undefined;

  const parts = p
    .split(".")
    .map((s) => String(s).trim())
    .filter(Boolean);

  const getPropCI = (base, key) => {
    if (base == null) return undefined;
    if (Array.isArray(base) && /^\d+$/.test(key)) return base[Number(key)];
    if (typeof base !== "object") return undefined;

    if (Object.prototype.hasOwnProperty.call(base, key)) return base[key];

    const kLower = String(key).toLowerCase();
    const foundKey = Object.keys(base).find((k) => k.toLowerCase() === kLower);
    return foundKey ? base[foundKey] : undefined;
  };

  const tryFrom = (base) => {
    let cur = base;
    for (const k of parts) {
      cur = getPropCI(cur, k);
      if (cur === undefined || cur === null) return undefined;
    }
    return cur;
  };

  const direct = tryFrom(obj);
  if (direct !== undefined && direct !== null) return direct;

  const candidates = [
    obj?.bl,
    obj?.bldata,
    obj?.tblBl,
    obj?.data,
    obj?.result,
    obj?.row,
    obj?.record,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const v = tryFrom(c);
    if (v !== undefined && v !== null) return v;
  }

  return undefined;
}

function applyTokens(text, data, opts = {}) {
  const { keepMissingTokens = false, formatValue } = opts || {};
  if (text == null) return "";

  return String(text).replace(/\{\{([^}]+)\}\}/g, (full, raw) => {
    const key = String(raw).trim();
    const v = getByPath(data, key);

    if (v === undefined || v === null) return keepMissingTokens ? full : "";

    const norm = (s) => String(s).replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    if (Array.isArray(v)) return norm(v.join(", "));
    if (typeof v === "object") {
      try {
        return norm(JSON.stringify(v));
      } catch {
        return norm(String(v));
      }
    }

    const next = typeof formatValue === "function" ? formatValue(v, key) : v;
    return norm(String(next));
  });
}

function parseLooseBoolean(v) {
  if (v === true || v === false) return v;
  if (typeof v === "number") {
    if (v === 1) return true;
    if (v === 0) return false;
  }

  const s = String(v ?? "").trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return null;
}

function readBooleanFlag(data, names) {
  for (const name of names || []) {
    const v = getByPath(data, name);
    const parsed = parseLooseBoolean(v);
    if (parsed !== null) return parsed;
  }
  return null;
}

function shouldGenerateAttachmentSheets(data) {
  const isAttachSheet = readBooleanFlag(data, [
    "isAttachSheet",
    "is_attach_sheet",
    "IsAttachSheet",
    "IS_ATTACH_SHEET",
  ]);
  const isContainerGrid = readBooleanFlag(data, [
    "isContainerGrid",
    "is_container_grid",
    "IsContainerGrid",
    "IS_CONTAINER_GRID",
  ]);

  return !(isAttachSheet === false && isContainerGrid === false);
}

function normalizeDecimalPlaces(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(8, Math.trunc(n)));
}

function toPlainNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const cleaned = raw.replace(/,/g, "");
  if (!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(cleaned)) return null;

  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function formatNumericValue(value, decimalPlaces) {
  const dp = normalizeDecimalPlaces(decimalPlaces);
  if (dp === null) return value == null ? "" : String(value);

  const n = toPlainNumber(value);
  if (n === null) return value == null ? "" : String(value);

  return n.toFixed(dp);
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function pad2(n) {
  return String(Number(n || 0)).padStart(2, "0");
}

function normalizeDateStyle(style = {}) {
  return {
    mode: String(style.dateFormatMode || "simple").toLowerCase(),
    order: String(style.dateOrder || "DMY").toUpperCase(),
    sep: style.dateSeparator == null ? "/" : String(style.dateSeparator),
    pattern: String(style.datePattern || "DD/MM/YYYY"),
    inputOrder: String(style.dateInputOrder || "DMY").toUpperCase(),
    invalid: String(style.dateInvalidFallback || "raw").toLowerCase(),
    monthCase: String(style.dateMonthCase || "title").toLowerCase(),
    useUTC: !!style.dateUseUTC,
  };
}

function applyMonthCase(txt, monthCase) {
  if (monthCase === "upper") return String(txt).toUpperCase();
  if (monthCase === "lower") return String(txt).toLowerCase();
  return String(txt);
}

function parseDateParts(raw, opts = {}) {
  if (raw == null || raw === "") return { ok: false };

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    const d = raw;
    const y = opts.useUTC ? d.getUTCFullYear() : d.getFullYear();
    const m = (opts.useUTC ? d.getUTCMonth() : d.getMonth()) + 1;
    const day = opts.useUTC ? d.getUTCDate() : d.getDate();
    const hh = opts.useUTC ? d.getUTCHours() : d.getHours();
    const mm = opts.useUTC ? d.getUTCMinutes() : d.getMinutes();
    const ss = opts.useUTC ? d.getUTCSeconds() : d.getSeconds();
    const wd = opts.useUTC ? d.getUTCDay() : d.getDay();

    return {
      ok: true,
      parts: {
        year: y,
        month: m,
        day,
        hours: hh,
        minutes: mm,
        seconds: ss,
        weekday: wd,
      },
    };
  }

  if (typeof raw === "number" && Number.isFinite(raw)) {
    const ms = raw < 1e12 ? raw * 1000 : raw;
    return parseDateParts(new Date(ms), opts);
  }

  const s = String(raw).trim();
  if (!s) return { ok: false };

  let m = s.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s](\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?(?:\.\d+)?(?:Z)?$/i,
  );
  if (m) {
    const year = Number(m[1]);
    const month = Number(m[2]);
    const day = Number(m[3]);
    const hours = Number(m[4] || 0);
    const minutes = Number(m[5] || 0);
    const seconds = Number(m[6] || 0);
    const d = new Date(year, month - 1, day, hours, minutes, seconds);

    return {
      ok: true,
      parts: {
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
        weekday: d.getDay(),
      },
    };
  }

  m = s.match(
    /^(\d{1,4})([\/.\- ])(\d{1,2})\2(\d{1,4})(?:[T\s](\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/i,
  );
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[3]);
    const c = Number(m[4]);
    const hours = Number(m[5] || 0);
    const minutes = Number(m[6] || 0);
    const seconds = Number(m[7] || 0);

    let year, month, day;
    const inputOrder = String(opts.inputOrder || "DMY").toUpperCase();

    if (inputOrder === "DMY") {
      day = a;
      month = b;
      year = c;
    } else if (inputOrder === "MDY") {
      month = a;
      day = b;
      year = c;
    } else {
      year = a;
      month = b;
      day = c;
    }

    if (year < 100) year += year >= 70 ? 1900 : 2000;

    const d = new Date(year, month - 1, day, hours, minutes, seconds);

    return {
      ok: true,
      parts: {
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
        weekday: d.getDay(),
      },
    };
  }

  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return parseDateParts(d, opts);
  }

  return { ok: false };
}

function buildSimplePattern(order = "DMY", sep = "/") {
  const map = {
    DMY: ["DD", "MM", "YYYY"],
    MDY: ["MM", "DD", "YYYY"],
    YMD: ["YYYY", "MM", "DD"],
  };
  return (map[String(order).toUpperCase()] || map.DMY).join(sep);
}

function formatPattern(parts, pattern, monthCase = "title") {
  const year = Number(parts.year || 0);
  const month = Number(parts.month || 0);
  const day = Number(parts.day || 0);
  const hours = Number(parts.hours || 0);
  const minutes = Number(parts.minutes || 0);
  const seconds = Number(parts.seconds || 0);
  const weekday = Number(parts.weekday || 0);

  const MMM = applyMonthCase(MONTHS_SHORT[month - 1] || "", monthCase);
  const MMMM = applyMonthCase(MONTHS_LONG[month - 1] || "", monthCase);

  const tokens = {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MMMM,
    MMM,
    MM: pad2(month),
    M: String(month),
    DD: pad2(day),
    D: String(day),
    dddd: DAYS_LONG[weekday] || "",
    ddd: DAYS_SHORT[weekday] || "",
    HH: pad2(hours),
    H: String(hours),
    hh: pad2(hours % 12 || 12),
    h: String(hours % 12 || 12),
    mm: pad2(minutes),
    m: String(minutes),
    ss: pad2(seconds),
    s: String(seconds),
    A: hours >= 12 ? "PM" : "AM",
    a: hours >= 12 ? "pm" : "am",
  };

  return String(pattern)
    .replaceAll("dddd", "\u0001")
    .replaceAll("ddd", "\u0002")
    .replaceAll("MMMM", "\u0003")
    .replaceAll("MMM", "\u0004")
    .replaceAll("YYYY", "\u0005")
    .replaceAll("YY", "\u0006")
    .replaceAll("DD", "\u0007")
    .replaceAll("D", "\u0008")
    .replaceAll("MM", "\u0009")
    .replaceAll("M", "\u000A")
    .replaceAll("HH", "\u000B")
    .replaceAll("H", "\u000C")
    .replaceAll("hh", "\u000D")
    .replaceAll("h", "\u000E")
    .replaceAll("mm", "\u000F")
    .replaceAll("m", "\u0010")
    .replaceAll("ss", "\u0011")
    .replaceAll("s", "\u0012")
    .replaceAll("A", "\u0013")
    .replaceAll("a", "\u0014")
    .replaceAll("\u0001", tokens.dddd)
    .replaceAll("\u0002", tokens.ddd)
    .replaceAll("\u0003", tokens.MMMM)
    .replaceAll("\u0004", tokens.MMM)
    .replaceAll("\u0005", tokens.YYYY)
    .replaceAll("\u0006", tokens.YY)
    .replaceAll("\u0007", tokens.DD)
    .replaceAll("\u0008", tokens.D)
    .replaceAll("\u0009", tokens.MM)
    .replaceAll("\u000A", tokens.M)
    .replaceAll("\u000B", tokens.HH)
    .replaceAll("\u000C", tokens.H)
    .replaceAll("\u000D", tokens.hh)
    .replaceAll("\u000E", tokens.h)
    .replaceAll("\u000F", tokens.mm)
    .replaceAll("\u0010", tokens.m)
    .replaceAll("\u0011", tokens.ss)
    .replaceAll("\u0012", tokens.s)
    .replaceAll("\u0013", tokens.A)
    .replaceAll("\u0014", tokens.a);
}

function formatDateValue(raw, style = {}) {
  const opts = normalizeDateStyle(style);
  const parsed = parseDateParts(raw, opts);

  if (!parsed.ok) {
    return opts.invalid === "blank" ? "" : String(raw ?? "");
  }

  const pattern =
    opts.mode === "custom"
      ? opts.pattern
      : buildSimplePattern(opts.order, opts.sep);

  return formatPattern(parsed.parts, pattern, opts.monthCase);
}

function formatValueByStyle(value, style = {}, key = "") {
  const s = style || {};
  const valueType = String(s.valueType || "").toLowerCase();

  if (
    valueType === "date" ||
    s.dateFormatMode ||
    s.datePattern ||
    s.dateOrder
  ) {
    return formatDateValue(value, s);
  }

  if (valueType === "number" || s.decimalPlaces != null) {
    return formatNumericValue(value, s.decimalPlaces);
  }

  return value == null ? "" : String(value);
}

function hasTokenSyntax(text) {
  return /\{\{[^}]+\}\}/.test(String(text || ""));
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   LAYOUT MESSAGE HELPERS
========================================================= */

function toStringArray(v) {
  return Array.isArray(v)
    ? v.map((x) => String(x || "").trim()).filter(Boolean)
    : [];
}

function collectLayoutMessages(tpl) {
  const warnings = [];
  const errors = [];

  if (!tpl || typeof tpl !== "object") return { warnings, errors };

  warnings.push(...toStringArray(tpl.__layoutWarnings));
  errors.push(...toStringArray(tpl.__layoutErrors));

  const pages = Array.isArray(tpl.pages) ? tpl.pages : [];
  pages.forEach((p, idx) => {
    const pageLabel = p?.name || p?.id || `Page ${idx + 1}`;

    toStringArray(p?.__layoutWarnings).forEach((msg) => {
      warnings.push(`${pageLabel}: ${msg}`);
    });

    toStringArray(p?.__layoutErrors).forEach((msg) => {
      errors.push(`${pageLabel}: ${msg}`);
    });
  });

  return {
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
  };
}

/* =========================================================
   FIXED TABLE AUTO-GROW (Crystal-like)
========================================================= */

function isRepeatTableEl(el) {
  const tmeta = el?.table || el?.tbl || el?.meta || {};
  const repeat = tmeta?.repeat || {};
  return !!repeat?.enabled && !!repeat?.arrayPath;
}

function applyAutoGrowFixedTablesToTemplate(template, data, opts) {
  const measureTextMm = opts?.measureTextMm;
  if (!template || !Array.isArray(template?.pages) || !measureTextMm)
    return template;

  const _normCellKey = (k) => String(k || "").replace(/\s+/g, "");
  const _cellKeyVariants = (r, c) => [
    `${r}_${c}`,
    `${r},${c}`,
    `${r}, ${c}`,
    `${r}-${c}`,
    `${r}:${c}`,
    `${r}|${c}`,
  ];
  const _pickFromMap = (map, r, c) => {
    if (!map) return undefined;
    const variants = _cellKeyVariants(r, c);
    for (const k of variants) {
      const nk = _normCellKey(k);
      if (Object.prototype.hasOwnProperty.call(map, nk)) return map[nk];
      if (Object.prototype.hasOwnProperty.call(map, k)) return map[k];
    }
    const target = _normCellKey(`${r},${c}`);
    for (const kk of Object.keys(map)) {
      if (_normCellKey(kk) === target) return map[kk];
    }
    return undefined;
  };

  const pages = template.pages.map((p) => ({
    ...p,
    elements: (p.elements || []).map((e) => ({ ...e })),
  }));

  for (let pi = 0; pi < pages.length; pi++) {
    const page = pages[pi];
    const els = [...(page.elements || [])].sort(
      (a, b) => Number(a.y) - Number(b.y) || (a.z || 0) - (b.z || 0),
    );

    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (el?.type !== "table") continue;
      if (isRepeatTableEl(el)) continue;

      const tmeta = el.table || el.tbl || el.meta || {};
      const rows = Number(tmeta.rows || el.rows || 0);
      const cols = Number(tmeta.cols || el.cols || 0);
      if (!rows || !cols) continue;

      const bindings = tmeta.bindings || tmeta.binding || {};

      let looksVariable = !!tmeta.autoGrow;
      if (
        !looksVariable &&
        bindings &&
        typeof bindings === "object" &&
        Object.keys(bindings).length > 0
      )
        looksVariable = true;

      if (!looksVariable) continue;

      const colW =
        Array.isArray(tmeta.colW) && tmeta.colW.length
          ? tmeta.colW
          : Array(cols).fill(100);
      const rowH =
        Array.isArray(tmeta.rowH) && tmeta.rowH.length
          ? tmeta.rowH
          : Array(rows).fill(32);

      const widthMm = Number(el.w || 10);
      const heightMm = Number(el.h || 10);

      const totalW = colW.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
      const totalH = rowH.reduce((a, b) => a + (Number(b) || 0), 0) || 1;

      const isRowHAlreadyMm =
        String(tmeta.rowHUnit || "").toLowerCase() === "mm";
      const isColWAlreadyMm = Math.abs(totalW - widthMm) < 1.5;

      const colMm = isColWAlreadyMm
        ? colW.map((w) => Number(w) || 0)
        : colW.map((w) => ((Number(w) || 0) / totalW) * widthMm);
      const rowMmBase = isRowHAlreadyMm
        ? rowH.map((h) => Number(h) || 0)
        : rowH.map((h) => ((Number(h) || 0) / totalH) * heightMm);

      const cellPad = Number(tmeta.cellPadding ?? el?.style?.padding ?? 6);
      const newRowMm = [...rowMmBase];

      for (let r = 0; r < rows; r++) {
        let maxH = newRowMm[r] || 0;

        for (let c = 0; c < cols; c++) {
          const bindSpec = _pickFromMap(bindings, r, c);

          let tokenText = "";
          if (typeof bindSpec === "string") tokenText = bindSpec;
          else if (bindSpec && typeof bindSpec === "object") {
            if (bindSpec.path) {
              const v = getByPath(data, String(bindSpec.path));
              tokenText = v == null ? "" : String(v);
            } else {
              const tokenKey =
                bindSpec.columnKey ??
                bindSpec.key ??
                bindSpec.field ??
                bindSpec.fieldKey ??
                bindSpec.token;
              if (tokenKey) tokenText = `{{${tokenKey}}}`;
              else if (bindSpec.label != null)
                tokenText = String(bindSpec.label);
            }
          }

          if (!tokenText) {
            const cellObj = _pickFromMap(
              tmeta.cells || tmeta.cell || tmeta.data || {},
              r,
              c,
            );
            const direct =
              (cellObj && (cellObj.text ?? cellObj.value ?? cellObj.label)) ??
              "";
            if (direct) tokenText = String(direct);
          }

          if (!tokenText) continue;

          const csx =
            _pickFromMap(tmeta.cellStyle || tmeta.cellStyles || {}, r, c) || {};

          const mergedStyle = {
            ...(el.style || {}),
            ...(tmeta.style || {}),
            ...csx,
            fontSize: tmeta.fontSize ?? el?.style?.fontSize ?? 11,
            fontFamily:
              (tmeta.style && tmeta.style.fontFamily) || el?.style?.fontFamily,
            fontWeight:
              (tmeta.style && tmeta.style.fontWeight) || el?.style?.fontWeight,
            lineHeight:
              (tmeta.style && tmeta.style.lineHeight) || el?.style?.lineHeight,
            padding: cellPad,
            decimalPlaces: normalizeDecimalPlaces(
              csx.decimalPlaces ?? tmeta.decimalPlaces,
            ),
          };

          const resolved = hasTokenSyntax(tokenText)
            ? applyTokens(tokenText, data, {
                keepMissingTokens: false,
                formatValue: (v, key) =>
                  formatValueByStyle(v, mergedStyle, key),
              })
            : formatValueByStyle(tokenText, mergedStyle);

          const safe = isUnresolvedTokenString(resolved)
            ? ""
            : String(resolved || "");
          if (!safe) continue;

          const measured = measureTextMm({
            text: safe,
            widthMm: Math.max(1, Number(colMm[c] || 1)),
            style: mergedStyle,
            data,
          });

          const padMm = (cellPad * 2) / MM_TO_PX;
          const need = Math.max(0, measured + padMm);
          if (need > maxH) maxH = need;
        }

        newRowMm[r] = maxH;
      }

      const newH = newRowMm.reduce((a, b) => a + (Number(b) || 0), 0) || el.h;
      const delta = newH - Number(el.h || 0);

      if (delta > 0.01) {
        el.h = newH;
        el.table = {
          ...(el.table || {}),
          rowH: newRowMm,
          rowHUnit: "mm",
          autoGrow: true,
        };

        for (let j = i + 1; j < els.length; j++) {
          els[j] = { ...els[j], y: Number(els[j].y || 0) + delta };
        }
      }
    }

    page.elements = els;
  }

  return { ...template, pages };
}

/* =========================================================
   ALIGN / STYLE NORMALIZERS
========================================================= */

function vAlignToAlignItems(vAlign) {
  const v = String(vAlign || "").toLowerCase();
  if (v === "middle" || v === "center") return "center";
  if (v === "bottom" || v === "end") return "flex-end";
  return "flex-start";
}
function hAlignToJustify(textAlign) {
  const a = String(textAlign || "left").toLowerCase();
  if (a === "center") return "center";
  if (a === "right" || a === "end") return "flex-end";
  return "flex-start";
}
function normalizeTextAlign(v) {
  const raw = (v ?? "").toString().trim().toLowerCase();
  if (!raw) return "left";
  if (raw === "start") return "left";
  if (raw === "end") return "right";
  if (raw === "centre") return "center";
  if (raw === "middle") return "center";
  if (["left", "right", "center", "justify"].includes(raw)) return raw;
  if (raw === "flex-start") return "left";
  if (raw === "flex-end") return "right";
  return "left";
}
function normalizeOpacity(v, fallback = 1) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(1, n));
}
function normalizeHAlign(align) {
  const a = String(align ?? "left")
    .trim()
    .toLowerCase();
  if (a === "centre") return "center";
  if (a === "start") return "left";
  if (a === "end") return "right";
  if (a === "middle") return "center";
  if (a === "justify") return "justify";
  if (a === "center" || a === "right" || a === "left") return a;
  return "left";
}
function normalizeVAlign(v) {
  const raw = (v ?? "").toString().trim().toLowerCase();
  if (!raw) return "top";
  if (raw === "middle") return "middle";
  if (raw === "center") return "middle";
  if (["top", "middle", "bottom"].includes(raw)) return raw;
  return "top";
}
function cssFromStyle(s = {}) {
  const fontSize = Number(s.fontSize ?? 10);
  const fontFamily = s.fontFamily || "Arial, Helvetica, sans-serif";
  const fontWeight = s.fontWeight ?? 400;
  const color = s.color || "#111827";
  const textAlign = normalizeTextAlign(
    s.textAlign ??
      s.align ??
      s.hAlign ??
      s.text_alignment ??
      s.textalign ??
      s.textAlignValue,
  );
  const lineHeight = s.lineHeight ?? 1.2;

  const letterSpacing =
    s.letterSpacing != null ? `${Number(s.letterSpacing)}px` : "normal";
  const italic = s.italic ? "italic" : "normal";
  const underline = s.underline ? "underline" : "none";

  const padding =
    s.padding != null
      ? `${Number(s.padding)}px`
      : s.paddingMm != null
        ? `${Number(s.paddingMm)}mm`
        : "0px";

  return `
    font-family:${fontFamily};
    font-size:${fontSize}px;
    font-weight:${fontWeight};
    font-style:${italic};
    text-decoration:${underline};
    color:${color};
    text-align:${textAlign};
    line-height:${lineHeight};
    letter-spacing:${letterSpacing};
    padding:${padding};
  `;
}

/* =========================================================
   MULTI-PAGE NORMALIZER
========================================================= */

function normalizePages(tpl) {
  const paperMm = getPaperMmFromTpl(tpl);

  if (Array.isArray(tpl?.pages) && tpl.pages.length > 0) {
    return tpl.pages.map((p, idx) => {
      const elements = Array.isArray(p?.elements) ? p.elements : [];
      const inferred = inferAttachBandsMm(elements, paperMm);

      return {
        key: p?.id || `p_${idx}`,
        id: p?.id || `p_${idx}`,
        name: p?.name || `Page ${idx + 1}`,
        wMm: paperMm.w,
        hMm: paperMm.h,
        attachHeaderMm: Number(
          p?.attachHeaderMm ?? inferred.attachHeaderMm ?? 0,
        ),
        attachFooterMm: Number(
          p?.attachFooterMm ?? inferred.attachFooterMm ?? 0,
        ),
        elements,
      };
    });
  }

  const rootEls = Array.isArray(tpl?.elements) ? tpl.elements : [];
  const inferred = inferAttachBandsMm(rootEls, paperMm);

  return [
    {
      key: "main",
      id: "main",
      name: "Main",
      wMm: paperMm.w,
      hMm: paperMm.h,
      attachHeaderMm: Number(
        tpl?.attachHeaderMm ?? inferred.attachHeaderMm ?? 0,
      ),
      attachFooterMm: Number(
        tpl?.attachFooterMm ?? inferred.attachFooterMm ?? 0,
      ),
      elements: rootEls,
    },
  ];
}

/* =========================================================
   DEBUG HELPERS
========================================================= */

function debugDumpPages(debug, tpl, label) {
  if (!debug || !tpl) return;
  const pages = normalizePages(tpl);
  dbgGroup(debug, `🧾 [BLReport DEBUG] ${label} | pages=${pages.length}`);
  pages.forEach((p, i) => {
    const els = (p.elements || [])
      .slice()
      .sort((a, b) => Number(a.y || 0) - Number(b.y || 0));
    const tables = els.filter((e) => e?.type === "table");
    const lines = els.filter((e) =>
      String(e?.type || "")
        .toLowerCase()
        .includes("line"),
    );
    dbgLog(
      debug,
      `Page#${i + 1} id=${p.id} name=${p.name} attachHeaderMm=${p.attachHeaderMm} attachFooterMm=${p.attachFooterMm} els=${els.length} tables=${tables.length} lines=${lines.length}`,
    );
    tables.slice(0, 20).forEach((t) => {
      dbgLog(debug, "  table:", {
        id: t.id,
        x: t.x,
        y: t.y,
        w: t.w,
        h: t.h,
        neighbors: t.neighbors,
      });
    });
  });
  dbgGroupEnd(debug);
}

function debugAnalyzeTableSnapping(
  debug,
  tpl,
  gapTolMm = 3,
  overlapRatio = 0.6,
) {
  if (!debug || !tpl) return;

  const pages = normalizePages(tpl);
  dbgGroup(debug, `🧷 [BLReport DEBUG] Snap analysis (gapTol=${gapTolMm}mm)`);
  pages.forEach((p, pi) => {
    const els = (p.elements || [])
      .slice()
      .sort((a, b) => Number(a.y || 0) - Number(b.y || 0));
    const tables = els.filter((e) => e?.type === "table");
    if (tables.length < 2) return;

    for (let i = 0; i < tables.length; i++) {
      const a = tables[i];
      const aBottom = Number(a.y || 0) + Number(a.h || 0);

      let best = null;
      for (let j = 0; j < tables.length; j++) {
        if (j === i) continue;
        const b = tables[j];
        const gap = Number(b.y || 0) - aBottom;
        if (gap < -0.001) continue;
        if (best == null || gap < best.gap) best = { b, gap };
      }
      if (!best) continue;

      const b = best.b;
      const gap = best.gap;

      const aX = Number(a.x || 0),
        aW = Number(a.w || 0);
      const bX = Number(b.x || 0),
        bW = Number(b.w || 0);

      const overlap = Math.min(aX + aW, bX + bW) - Math.max(aX, bX);
      const minW = Math.min(aW, bW) || 1;
      const okOverlap = overlap >= minW * overlapRatio;

      if (gap <= gapTolMm && okOverlap) {
        dbgLog(debug, `Page#${pi + 1} SNAP-CANDIDATE a=${a.id} -> b=${b.id}`, {
          aBottom,
          bY: b.y,
          gap,
          overlap,
          aRect: { x: aX, w: aW, y: a.y, h: a.h },
          bRect: { x: bX, w: bW, y: b.y, h: b.h },
        });
      }
    }
  });
  dbgGroupEnd(debug);
}

function debugNeighborGraph(debug, tpl) {
  if (!debug || !tpl) return;
  const pages = normalizePages(tpl);

  dbgGroup(debug, "🔗 [BLReport DEBUG] Neighbors audit");
  pages.forEach((p, pi) => {
    const byId = new Map();
    (p.elements || []).forEach((e) => e?.id && byId.set(e.id, e));

    (p.elements || [])
      .filter((e) => e?.neighbors)
      .slice(0, 200)
      .forEach((e) => {
        const n = e.neighbors || {};
        const refs = ["topId", "bottomId", "leftId", "rightId"]
          .filter((k) => n[k])
          .map((k) => ({ k, id: n[k], exists: byId.has(n[k]) }));

        if (refs.some((r) => r.exists === false)) {
          dbgLog(
            debug,
            `Page#${pi + 1} element=${e.id} has broken neighbor refs`,
            refs,
          );
        }
      });
  });
  dbgGroupEnd(debug);
}

/* =========================================================
   OPTIONAL SNAP PASS
========================================================= */

const APPLY_SNAP_TOUCHING_TABLES = false;

function snapTouchingTables(tpl, gapToleranceMm = 2) {
  const out = JSON.parse(JSON.stringify(tpl));
  const pages = normalizePages(out);

  pages.forEach((p) => {
    const els = Array.isArray(p.elements) ? p.elements : [];
    const tables = els.filter((e) => e?.type === "table");
    if (tables.length < 2) return;

    const updated = els.slice();

    for (let i = 0; i < tables.length; i++) {
      for (let j = 0; j < tables.length; j++) {
        if (i === j) continue;

        const a = tables[i];
        const b = tables[j];

        const aX = Number(a.x || 0),
          aY = Number(a.y || 0);
        const aW = Number(a.w || 0),
          aH = Number(a.h || 0);
        const bX = Number(b.x || 0),
          bY = Number(b.y || 0);
        const bW = Number(b.w || 0);

        const aBottom = aY + aH;

        const gap = bY - aBottom;
        if (gap < 0 || gap > gapToleranceMm) continue;

        const overlap = Math.min(aX + aW, bX + bW) - Math.max(aX, bX);
        if (overlap < Math.min(aW, bW) * 0.6) continue;

        const snappedY = aBottom;
        if (Math.abs(snappedY - bY) > 0.001) {
          const idx = updated.findIndex((x) => x?.id === b.id);
          if (idx >= 0) updated[idx] = { ...b, y: snappedY };
        }
      }
    }

    if (Array.isArray(out.pages)) {
      const realPage = out.pages.find((pp) => (pp?.id || "") === p.id);
      if (realPage) realPage.elements = updated;
    } else {
      out.elements = updated;
    }
  });

  return out;
}

/* =========================================================
   REPEAT TABLE FLOW (array tables across pages)
========================================================= */

function isRepeatTableElement(el) {
  const tmeta = el?.table || el?.tbl || el?.meta || {};
  const repeat = tmeta?.repeat || {};
  return (
    el?.type === "table" &&
    repeat?.enabled === true &&
    !!repeat?.arrayPath &&
    Array.isArray(repeat?.columns) &&
    repeat.columns.length > 0
  );
}

function resolveRepeatTableColumns(repeat, firstRowObj) {
  const colsRaw = Array.isArray(repeat?.columns) ? repeat.columns : [];

  if (colsRaw.length) {
    return colsRaw
      .map((c) => ({
        key: String(c?.key ?? "").trim(),
        label: c?.label ?? c?.key ?? "",
        align: c?.align ?? "left",
        widthMm: c?.widthMm ?? null,
        decimalPlaces: c?.decimalPlaces ?? null,
        valueType: c?.valueType ?? null,
        dateFormatMode: c?.dateFormatMode ?? null,
        dateOrder: c?.dateOrder ?? null,
        dateSeparator: c?.dateSeparator ?? null,
        datePattern: c?.datePattern ?? null,
        dateInputOrder: c?.dateInputOrder ?? null,
        dateInvalidFallback: c?.dateInvalidFallback ?? null,
        dateMonthCase: c?.dateMonthCase ?? null,
        dateUseUTC: !!c?.dateUseUTC,
      }))
      .filter((c) => c.key);
  }

  if (firstRowObj && typeof firstRowObj === "object") {
    return Object.keys(firstRowObj)
      .slice(0, 8)
      .map((k) => ({
        key: k,
        label: k,
        align: "left",
        widthMm: null,
        decimalPlaces: null,
        valueType: null,
      }));
  }

  return [];
}

function buildRepeatPrintChunk({
  el,
  repeat,
  colsDef,
  chunkRows,
  chunkIndex = 0,
}) {
  const header = colsDef.map((c) => String(c.label ?? c.key ?? ""));
  const body = chunkRows.map((rowObj, idx) =>
    colsDef.map((c) => {
      if (c.key === "__index__") return idx + 1;
      return getByPath(rowObj || {}, String(c.key || ""));
    }),
  );

  const headerH = Number(repeat.headerHeightMm ?? 7) || 7;
  const bodyH = Number(repeat.rowHeightMm ?? 6) || 6;
  const h = headerH + body.length * bodyH;

  const tmeta = el.table || el.tbl || el.meta || {};
  const nextTable = {
    ...tmeta,
    __repeatBaseId: el.id,
    repeatPrint: { header, body, columns: colsDef },
    repeat: { ...repeat, enabled: false },
  };

  const baseId = el.id || "repeatTable";
  const chunkId = `${baseId}__chunk_${chunkIndex}`;

  return { ...el, id: chunkId, __repeatBaseId: baseId, h, table: nextTable };
}

function ensurePageObject(
  pages,
  idx,
  basePage,
  maxPages = MAX_SAFE_RENDER_PAGES,
) {
  if (idx >= maxPages) return false;

  while (pages.length <= idx) {
    if (pages.length >= maxPages) return false;

    pages.push({
      ...basePage,
      id: `${basePage?.id || "page"}_auto_${pages.length}`,
      name: `${basePage?.name || "Page"} ${pages.length + 1}`,
      elements: [],
    });
  }

  return true;
}

function applyRepeatTablesFlowToTemplate(tpl, data, opts = {}) {
  const debug = !!opts.debug;
  if (!tpl) return tpl;

  const paperMm = opts.paperMm || { w: A4_W_MM, h: A4_H_MM };
  const marginMm = opts.marginMm || { top: 0, bottom: 0 };
  const allowAttachmentSheets =
    opts.allowAttachmentSheets ?? shouldGenerateAttachmentSheets(data);
  const maxPages = allowAttachmentSheets
    ? Math.max(1, Number(opts.maxPages || MAX_SAFE_RENDER_PAGES))
    : 1;
  const flowWarnings = [];
  const flowErrors = [];

  const getBodyBand = (page) => {
    const attachHeaderMm = Number(page?.attachHeaderMm || 0);
    const attachFooterMm = Number(page?.attachFooterMm || 0);
    const bodyTop = Number(marginMm.top || 0) + attachHeaderMm;
    const bodyBottom =
      Number(paperMm.h || A4_H_MM) -
      Number(marginMm.bottom || 0) -
      attachFooterMm;
    const bodyHeight = Math.max(0, bodyBottom - bodyTop);
    return { attachHeaderMm, attachFooterMm, bodyTop, bodyBottom, bodyHeight };
  };

  const paginateOverflowElementsOnPageBody = (page) => {
    const { bodyTop, bodyBottom, bodyHeight } = getBodyBand(page);

    const els = Array.isArray(page.elements) ? page.elements : [];
    const stay = [];
    const overflow = [];

    for (const el of els) {
      if (!el) continue;

      const band = String(el.attachBand || "").toLowerCase();
      if (band === "header" || band === "footer") {
        stay.push(el);
        continue;
      }

      const y = Number(el.y || 0);
      const h = Number(el.h || 0);
      const bottom = y + h;

      // Important OOM guard:
      // If one element is taller than the printable body area, moving it to the
      // next page will never make it fit. The old loop kept creating pages until
      // Chrome crashed. Pin it on the current page and warn instead.
      if (el.__overflowPinned || h > bodyHeight + 0.001) {
        const pinned = {
          ...el,
          y: Math.max(bodyTop, y),
          __overflowPinned: true,
        };
        stay.push(pinned);
        if (bottom > bodyBottom + 0.001 || h > bodyHeight + 0.001) {
          // flowWarnings.push(
          //   `${page?.name || page?.id || "Page"}: element ${el?.id || ""} is taller than available page body; it was pinned and will be rendered/printed as an extended page to prevent endless pagination.`,
          // );
        }
        continue;
      }

      if (bottom > bodyBottom + 0.001) overflow.push(el);
      else stay.push(el);
    }

    page.elements = stay;

    let cursorY = bodyTop;
    const gap = 0.2;
    const moved = [];
    for (const el of overflow) {
      const h = Number(el.h || 0);
      const tooTall = h > bodyHeight + 0.001;
      const ne = {
        ...el,
        y: cursorY,
        __overflowPinned: tooTall || el.__overflowPinned,
      };
      cursorY += h + gap;
      moved.push(ne);
    }

    if (debug && overflow.length) {
      dbgLog(debug, "[FLOW][OVERFLOW->NEXT]", {
        pageId: page.id,
        bodyTop,
        bodyBottom,
        moved: moved.map((m) => ({
          id: m.id,
          y: m.y,
          h: m.h,
          pinned: !!m.__overflowPinned,
        })),
      });
    }

    return moved;
  };

  const pages = normalizePages(tpl).map((p) => ({
    ...p,
    elements: (Array.isArray(p.elements) ? p.elements : []).map((e) => ({
      ...e,
    })),
  }));

  for (let pIndex = 0; pIndex < pages.length; pIndex++) {
    const page = pages[pIndex];

    let els = Array.isArray(page.elements) ? page.elements : [];
    els = [...els].sort(
      (a, b) =>
        Number(a.y || 0) - Number(b.y || 0) ||
        Number(a.z || 0) - Number(b.z || 0),
    );

    const rebuilt = [];
    for (let i = 0; i < els.length; i++) {
      const el = els[i];

      if (!isRepeatTableElement(el)) {
        rebuilt.push(el);
        continue;
      }

      const tmeta = el.table || el.tbl || el.meta || {};
      const repeat = tmeta.repeat || {};
      const arrVal = getByPath(data, String(repeat.arrayPath || ""));
      const arr = Array.isArray(arrVal) ? arrVal : [];

      const colsDef = resolveRepeatTableColumns(repeat, arr[0]);
      if (!colsDef.length) {
        rebuilt.push(el);
        continue;
      }

      const headerH = Number(repeat.headerHeightMm ?? 7) || 7;
      const bodyH = Number(repeat.rowHeightMm ?? 6) || 6;

      const { bodyTop, bodyBottom, bodyHeight } = getBodyBand(page);

      const availableMm = bodyBottom - Number(el.y || 0);
      const maxBodyRowsHere = Math.max(
        0,
        Math.floor((availableMm - headerH) / bodyH),
      );

      if (debug) {
        dbgLog(debug, "[FLOW][REPEAT]", {
          pageId: page.id,
          elId: el.id,
          y: el.y,
          h: el.h,
          bodyTop,
          bodyBottom,
          availableMm,
          headerH,
          bodyH,
          maxBodyRowsHere,
          totalRows: arr.length,
        });
      }

      if (maxBodyRowsHere <= 0) {
        if (!allowAttachmentSheets) {
          rebuilt.push({ ...el, __overflowPinned: true });
          continue;
        }

        if (!ensurePageObject(pages, pIndex + 1, page, maxPages)) {
          flowErrors.push(
            `Repeat table ${el?.id || ""} cannot be moved because generated pages exceeded safe limit (${maxPages}).`,
          );
          rebuilt.push({ ...el, __overflowPinned: true });
          continue;
        }

        const nb = getBodyBand(pages[pIndex + 1]);
        pages[pIndex + 1].elements.push({ ...el, y: nb.bodyTop });

        if (debug) {
          dbgLog(debug, "[FLOW][MOVE-WHOLE-TABLE]", {
            fromPage: page.id,
            toPage: pages[pIndex + 1].id,
            elId: el.id,
            newY: nb.bodyTop,
          });
        }
        continue;
      }

      const chunks = [];
      let start = 0;
      const maxMorePagesForThisTable = allowAttachmentSheets
        ? Math.max(1, maxPages - pIndex)
        : 1;
      while (start < arr.length) {
        if (chunks.length >= maxMorePagesForThisTable) {
          if (allowAttachmentSheets) {
            flowErrors.push(
              `Repeat table ${el?.id || ""} has too many rows (${arr.length}) and was stopped at safe page limit (${maxPages}).`,
            );
          }
          break;
        }

        const cap =
          chunks.length === 0
            ? maxBodyRowsHere
            : Math.max(
                1,
                Math.floor((Math.max(0, bodyHeight) - headerH) / bodyH),
              );
        chunks.push(arr.slice(start, start + cap));
        start += cap;
      }
      if (!chunks.length) chunks.push([]);

      const originalRepeatId = el?.id;

      const firstChunkEl = buildRepeatPrintChunk({
        el,
        repeat,
        colsDef,
        chunkRows: chunks[0],
        chunkIndex: 0,
      });

      rebuilt.push(firstChunkEl);

      if (originalRepeatId) {
        const newId = firstChunkEl.id;
        for (let j = i + 1; j < els.length; j++) {
          const n = els[j]?.neighbors;
          if (!n) continue;

          const nn = { ...n };
          if (nn.topId === originalRepeatId) nn.topId = newId;
          if (nn.bottomId === originalRepeatId) nn.bottomId = newId;
          if (nn.leftId === originalRepeatId) nn.leftId = newId;
          if (nn.rightId === originalRepeatId) nn.rightId = newId;

          els[j] = { ...els[j], neighbors: nn };
        }
      }

      const delta = Number(firstChunkEl.h || 0) - Number(el.h || 0);
      if (delta > 0) {
        for (let j = i + 1; j < els.length; j++) {
          els[j] = { ...els[j], y: Number(els[j].y || 0) + delta };
        }
      }

      for (let c = 1; c < chunks.length; c++) {
        const targetIdx = pIndex + c;
        if (!ensurePageObject(pages, targetIdx, page, maxPages)) {
          flowErrors.push(
            `Repeat table ${el?.id || ""} stopped because generated pages exceeded safe limit (${maxPages}).`,
          );
          break;
        }
        const nb = getBodyBand(pages[targetIdx]);

        const chunkEl = buildRepeatPrintChunk({
          el: { ...el, y: nb.bodyTop },
          repeat,
          colsDef,
          chunkRows: chunks[c],
          chunkIndex: c,
        });

        pages[targetIdx].elements.push(chunkEl);

        if (debug) {
          dbgLog(debug, "[FLOW][CHUNK->PAGE]", {
            baseId: el.id,
            chunkId: chunkEl.id,
            targetPage: pages[targetIdx].id,
            y: chunkEl.y,
            h: chunkEl.h,
            rowsInChunk: chunks[c].length,
          });
        }
      }
    }

    page.elements = rebuilt;

    if (!allowAttachmentSheets) {
      page.__disableAttachmentSheets = true;
      continue;
    }

    let overflow = paginateOverflowElementsOnPageBody(page);
    let nextPageIdx = pIndex + 1;

    let overflowSafetyCounter = 0;
    while (overflow.length) {
      overflowSafetyCounter += 1;

      if (nextPageIdx >= maxPages || overflowSafetyCounter > maxPages) {
        flowErrors.push(
          `Pagination stopped because overflow elements exceeded safe page limit (${maxPages}). Please reduce element height or check repeat table settings.`,
        );
        break;
      }

      if (!ensurePageObject(pages, nextPageIdx, page, maxPages)) {
        flowErrors.push(
          `Pagination stopped because generated pages exceeded safe limit (${maxPages}).`,
        );
        break;
      }

      pages[nextPageIdx].elements = [
        ...(pages[nextPageIdx].elements || []),
        ...overflow,
      ];

      const beforeIds = overflow
        .map(
          (x) =>
            `${x?.id || ""}:${Number(x?.y || 0)}:${Number(x?.h || 0)}:${!!x?.__overflowPinned}`,
        )
        .join("|");
      overflow = paginateOverflowElementsOnPageBody(pages[nextPageIdx]);
      const afterIds = overflow
        .map(
          (x) =>
            `${x?.id || ""}:${Number(x?.y || 0)}:${Number(x?.h || 0)}:${!!x?.__overflowPinned}`,
        )
        .join("|");

      if (beforeIds && beforeIds === afterIds) {
        flowErrors.push(
          `Pagination stopped because overflow elements are not changing between pages. This prevents browser out-of-memory crash.`,
        );
        break;
      }

      nextPageIdx += 1;
    }
  }

  const finalPages = allowAttachmentSheets
    ? pages
    : pages.slice(0, 1).map((p) => ({
        ...p,
        __disableAttachmentSheets: true,
      }));

  return {
    ...tpl,
    pages: finalPages,
    __layoutWarnings: [
      ...toStringArray(tpl?.__layoutWarnings),
      ...Array.from(new Set(flowWarnings)),
    ],
    __layoutErrors: [
      ...toStringArray(tpl?.__layoutErrors),
      ...Array.from(new Set(flowErrors)),
    ],
  };
}


/* =========================================================
   POST FLOW FIX: repeat table must follow its TOP neighbor
   ---------------------------------------------------------
   Why this exists:
   - layoutTemplateForData / auto-grow / repeat-flow can convert a repeat table
     id from "abc" to "abc__chunk_0" and sometimes the repeat table keeps an
     older shifted Y.
   - In Creator JSON, the container repeat table has topId = the title text.
     Therefore after the goods table grows, the container table must be placed
     exactly after the title using the original JSON gap.
========================================================= */

function stripGeneratedSuffix(id) {
  return String(id || "")
    .replace(/__chunk_\d+$/i, "")
    .replace(/__flow_\d+$/i, "")
    .replace(/__auto_\d+$/i, "");
}

function collectOriginalElementsFromTemplate(sourceTpl) {
  const map = new Map();

  const addEls = (els) => {
    (Array.isArray(els) ? els : []).forEach((el) => {
      if (!el || !el.id) return;
      if (!map.has(el.id)) map.set(el.id, el);
    });
  };

  addEls(sourceTpl?.elements);

  if (Array.isArray(sourceTpl?.pages)) {
    sourceTpl.pages.forEach((p) => addEls(p?.elements));
  }

  return map;
}

function getOriginalIdForElement(el) {
  return (
    el?.__repeatBaseId ||
    el?.__flowBaseId ||
    el?.__baseId ||
    el?.table?.__repeatBaseId ||
    stripGeneratedSuffix(el?.id)
  );
}

function findCurrentElementByOriginalId(elements, originalId) {
  if (!originalId) return null;

  const els = Array.isArray(elements) ? elements : [];

  const exact = els.find((el) => el?.id === originalId);
  if (exact) return exact;

  return (
    els.find((el) => getOriginalIdForElement(el) === originalId) ||
    els.find((el) => String(el?.id || "").startsWith(`${originalId}__`)) ||
    null
  );
}

function isFirstRepeatChunkElement(el) {
  const id = String(el?.id || "");
  if (!el) return false;

  const hasRepeatBase = !!(
    el.__repeatBaseId ||
    el.table?.__repeatBaseId ||
    /__chunk_\d+$/i.test(id)
  );

  if (!hasRepeatBase) return false;

  const m = id.match(/__chunk_(\d+)$/i);
  if (m && Number(m[1]) !== 0) return false;

  return true;
}

function enforceRepeatTablesFollowTopNeighbor(tpl, sourceTpl, opts = {}) {
  if (!tpl || !Array.isArray(tpl?.pages)) return tpl;

  const debug = !!opts.debug;
  const originalMap = collectOriginalElementsFromTemplate(sourceTpl || {});

  const pages = tpl.pages.map((page) => {
    const elements = (Array.isArray(page?.elements) ? page.elements : []).map(
      (el) => ({ ...el }),
    );

    let changed = false;

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (!isFirstRepeatChunkElement(el)) continue;

      const originalId = getOriginalIdForElement(el);
      const originalEl = originalMap.get(originalId);
      if (!originalEl) continue;

      const originalRepeat = originalEl?.table?.repeat || originalEl?.tbl?.repeat || originalEl?.meta?.repeat || {};
      if (!originalRepeat?.enabled) continue;

      const topId =
        originalEl?.neighbors?.topId ||
        originalEl?.neighbors?.aboveId ||
        originalEl?.neighbors?.top ||
        originalEl?.neighbors?.above;

      if (!topId) continue;

      const originalTopEl = originalMap.get(topId);
      const currentTopEl = findCurrentElementByOriginalId(elements, topId);
      if (!originalTopEl || !currentTopEl) continue;

      const originalGap =
        Number(originalEl.y || 0) -
        (Number(originalTopEl.y || 0) + Number(originalTopEl.h || 0));

      // If Creator had touching elements, keep them touching. Never create a
      // negative overlap unless the Creator JSON itself had one.
      const safeGap = Number.isFinite(originalGap) ? Math.max(0, originalGap) : 0;
      const nextY =
        Number(currentTopEl.y || 0) + Number(currentTopEl.h || 0) + safeGap;

      if (Number.isFinite(nextY) && Math.abs(Number(el.y || 0) - nextY) > 0.01) {
        if (debug) {
          dbgLog(debug, "[ATTACHMENT/FOLLOW-TOP] repeat table Y corrected", {
            pageId: page?.id,
            tableId: el.id,
            originalId,
            topId,
            oldY: el.y,
            newY: nextY,
            originalGap: safeGap,
            currentTopY: currentTopEl.y,
            currentTopH: currentTopEl.h,
          });
        }

        elements[i] = { ...el, y: nextY };
        changed = true;
      }
    }

    return changed ? { ...page, elements } : page;
  });

  return { ...tpl, pages };
}

/* =========================================================
   ELEMENT RENDERER (REPORT MODE)
========================================================= */

function computeColMmScaledToFill(widthMm, colsDef) {
  const n = Math.max(1, colsDef?.length || 0);
  const explicitSum = (colsDef || []).reduce(
    (s, c) => s + (Number(c?.widthMm) || 0),
    0,
  );

  if (explicitSum > 0) {
    const scale = widthMm / explicitSum;
    return (colsDef || []).map((c) => (Number(c?.widthMm) || 0) * scale);
  }
  return Array(n).fill(widthMm / n);
}

function normalizeCellKey(k) {
  return String(k || "").replace(/\s+/g, "");
}
function cellKeyVariants(r, c) {
  return [
    `${r},${c}`,
    `${r}, ${c}`,
    `${r}-${c}`,
    `${r}:${c}`,
    `${r}|${c}`,
    `${r}_${c}`,
  ];
}
function pickFromMap(map, r, c) {
  if (!map) return undefined;
  const variants = cellKeyVariants(r, c);
  for (const k of variants) {
    const nk = normalizeCellKey(k);
    if (Object.prototype.hasOwnProperty.call(map, nk)) return map[nk];
    if (Object.prototype.hasOwnProperty.call(map, k)) return map[k];
  }
  const target = normalizeCellKey(`${r},${c}`);
  for (const kk of Object.keys(map)) {
    if (normalizeCellKey(kk) === target) return map[kk];
  }
  return undefined;
}
function findMergeAt(merges, r, c) {
  const ms = Array.isArray(merges) ? merges : [];
  for (const m of ms) {
    const r0 = Number(m.r0 ?? m.r ?? 0);
    const c0 = Number(m.c0 ?? m.c ?? 0);
    const rs = Number(m.rs ?? m.rowSpan ?? 1);
    const cs = Number(m.cs ?? m.colSpan ?? 1);
    if (r >= r0 && r < r0 + rs && c >= c0 && c < c0 + cs)
      return { r0, c0, rs, cs };
  }
  return null;
}
function isCoveredByMerge(merges, r, c) {
  const m = findMergeAt(merges, r, c);
  if (!m) return false;
  return !(m.r0 === r && m.c0 === c);
}
function pickTextAlign(obj) {
  if (!obj) return undefined;
  return (
    obj.textAlign ??
    obj.align ??
    obj.hAlign ??
    obj.text_alignment ??
    obj.textalign ??
    obj.textAlignValue ??
    obj.horizontalAlign ??
    obj.horizontalAlignment
  );
}
function pickVAlign(obj) {
  if (!obj) return undefined;
  return (
    obj.vAlign ??
    obj.verticalAlign ??
    obj.valign ??
    obj.vertical_alignment ??
    obj.verticalAlignment
  );
}
function resolveCellTextForRender({ tmeta, r, c, data }) {
  const merges = Array.isArray(tmeta?.merges) ? tmeta.merges : [];
  if (isCoveredByMerge(merges, r, c)) return "";

  const bindings = tmeta.bindings || tmeta.binding || {};
  const cellStyle = tmeta.cellStyle || tmeta.cellStyles || {};
  const cells = tmeta.cells || tmeta.cell || tmeta.data || {};

  const bind = pickFromMap(bindings, r, c);
  const csx = pickFromMap(cellStyle, r, c) || {};
  const cell = pickFromMap(cells, r, c);

  const mergedStyle = {
    ...(tmeta.style || {}),
    ...csx,
    decimalPlaces: normalizeDecimalPlaces(
      csx.decimalPlaces ?? tmeta.decimalPlaces,
    ),
  };

  const direct =
    (cell && (cell.text ?? cell.value ?? cell.label)) ??
    csx.text ??
    csx.value ??
    csx.label ??
    "";

  if (direct) {
    if (hasTokenSyntax(direct)) {
      const resolved = applyTokens(String(direct), data, {
        keepMissingTokens: false,
        formatValue: (v, key) => formatValueByStyle(v, mergedStyle, key),
      });
      return isUnresolvedTokenString(resolved) ? "" : String(resolved || "");
    }
    return String(formatValueByStyle(direct, mergedStyle));
  }

  if (bind) {
    const tokenKey =
      bind.columnKey ?? bind.key ?? bind.field ?? bind.fieldKey ?? bind.token;
    const path = bind.path;
    const label = bind.label;

    if (path) {
      const v = getByPath(data, path);
      if (v !== undefined && v !== null) {
        return String(formatValueByStyle(v, mergedStyle));
      }
    }

    if (tokenKey) {
      const tokenResolved = applyTokens(`{{${tokenKey}}}`, data, {
        keepMissingTokens: false,
        formatValue: (v, key) => formatValueByStyle(v, mergedStyle, key),
      });

      if (tokenResolved && !isUnresolvedTokenString(tokenResolved)) {
        return String(tokenResolved);
      }
    }

    if (label != null) return String(formatValueByStyle(label, mergedStyle));
  }

  return "";
}

function isElementLike(v) {
  return (
    v &&
    typeof v === "object" &&
    typeof v.type === "string" &&
    ["text", "image", "box", "lineh", "linev", "line", "table"].includes(
      String(v.type).toLowerCase(),
    )
  );
}

function renderCellInnerHtml({
  text = "",
  sMerged = {},
  align = "left",
  vAlign = "top",
}) {
  const pad = sMerged.padding ?? 0;
  const textOpacity = normalizeOpacity(sMerged.opacity, 1);

  const outerCss = `
    width:100%;
    height:100%;
    box-sizing:border-box;
    display:flex;
    align-items:${vAlignToAlignItems(vAlign)};
    overflow:hidden;
  `;

  const innerCss = `
    width:100%;
    max-height:100%;
    overflow:hidden;
    box-sizing:border-box;
    white-space:pre-wrap;
    word-break:break-word;
    text-align:${align};
    opacity:${textOpacity};
    ${cssFromStyle({
      ...sMerged,
      textAlign: align,
      align,
      vAlign,
      verticalAlign: vAlign,
      padding: pad,
      bg: "transparent",
      borderWidth: 0,
    })}
  `;

  return `<div style="${outerCss}"><div style="${innerCss}">${escapeHtml(text)}</div></div>`;
}

function renderCellContentHtml({ cell, resolvedText, baseStyle, data }) {
  if (isElementLike(cell) && String(cell.type).toLowerCase() === "text") {
    const cellStyle = {
      ...(baseStyle || {}),
      ...(cell.style || {}),
      ...(cell.css || {}),
    };

    const align = normalizeTextAlign(pickTextAlign(cellStyle) ?? "left");
    const vAlign = normalizeVAlign(pickVAlign(cellStyle) ?? "top");

    const rawText = cell.text ?? cell.value ?? cell.label ?? resolvedText ?? "";

    const resolved = hasTokenSyntax(rawText)
      ? applyTokens(String(rawText), data || {}, {
          keepMissingTokens: false,
          formatValue: (v, key) => formatValueByStyle(v, cellStyle, key),
        })
      : formatValueByStyle(rawText, cellStyle);

    const safe = isUnresolvedTokenString(resolved)
      ? ""
      : String(resolved || "");

    return renderCellInnerHtml({
      text: safe,
      sMerged: cellStyle,
      align,
      vAlign,
    });
  }

  const align = normalizeTextAlign(pickTextAlign(baseStyle) ?? "left");
  const vAlign = normalizeVAlign(pickVAlign(baseStyle) ?? "top");

  return renderCellInnerHtml({
    text: String(formatValueByStyle(resolvedText ?? "", baseStyle || {})),
    sMerged: baseStyle || {},
    align,
    vAlign,
  });
}

function renderElement(el, data) {
  if (!el || el.hidden) return "";

  const mm = (v) => `${Number(v || 0)}mm`;

  const s = el.style || {};
  const left = mm(el.x);
  const top = mm(el.y);
  const width = mm(el.w);
  const height = mm(el.h);
  const rotate = Number(el.rotate || 0);

  const commonBox = `
    position:absolute;
    left:${left};
    top:${top};
    width:${width};
    height:${height};
    transform:${rotate ? `rotate(${rotate}deg)` : "none"};
    transform-origin:center center;
    box-sizing:border-box;
  `;

  if (el.type === "image") {
    const bw = Number(s.borderWidth ?? 0);
    const border =
      bw > 0
        ? `${bw}px ${s.borderStyle || "solid"} ${s.borderColor || "#111827"}`
        : "none";
    return `
      <img
        src="${el.src || ""}"
        style="
          ${commonBox}
          object-fit:${el.fit || "contain"};
          opacity:${el.opacity ?? 1};
          border:${border};
          border-radius:${Number(s.borderRadius || 0)}px;
        "
      />
    `;
  }

  if (el.type === "text") {
    const align = normalizeHAlign(s.align ?? s.textAlign ?? s.hAlign);
    const textOpacity = normalizeOpacity(s.opacity, 1);

    const bw = Number(s.borderWidth ?? 0);
    const border =
      bw > 0
        ? `${bw}px ${s.borderStyle || "solid"} ${s.borderColor || "#111827"}`
        : "none";

    const wrapCss =
      commonBox +
      `
        display:flex;
        align-items:${vAlignToAlignItems(normalizeVAlign(s.vAlign ?? s.verticalAlign))};
        overflow:hidden;
        background:${s.bg || "transparent"};
        border:${border};
        border-radius:${Number(s.borderRadius || 0)}px;
      `;

    const innerCss = `
      width:100%;
      max-height:100%;
      overflow:hidden;
      white-space:pre-wrap;
      text-align:${align};
      word-break:break-word;
      opacity:${textOpacity};
      ${cssFromStyle({ ...s, align, bg: "transparent", borderWidth: 0 })}
    `;

    const textStyle = {
      ...s,
      decimalPlaces: normalizeDecimalPlaces(s.decimalPlaces),
    };

    const rawText = el.text || "";
    const txt = hasTokenSyntax(rawText)
      ? applyTokens(rawText, data, {
          keepMissingTokens: false,
          formatValue: (v, key) => formatValueByStyle(v, textStyle, key),
        })
      : formatValueByStyle(rawText, textStyle);

    const safeTxt = isUnresolvedTokenString(txt) ? "" : String(txt || "");

    return `<div style="${wrapCss}"><div style="${innerCss}">${escapeHtml(safeTxt)}</div></div>`;
  }

  if (el.type === "box") {
    const bw = Number(s.borderWidth ?? 0);
    const border =
      bw > 0
        ? `${bw}px ${s.borderStyle || "solid"} ${s.borderColor || "#000"}`
        : "none";
    const boxCss =
      commonBox +
      `
        background:${s.bg || "transparent"};
        border:${border};
        border-radius:${Number(s.borderRadius || 0)}px;
      `;
    return `<div style="${boxCss}"></div>`;
  }

  const t = String(el.type || "").toLowerCase();
  const isH =
    t === "lineh" ||
    t === "hline" ||
    t === "line_horizontal" ||
    t === "linehorizontal" ||
    (t === "line" &&
      String(el.orientation || el.dir || "")
        .toLowerCase()
        .startsWith("h"));

  const isV =
    t === "linev" ||
    t === "vline" ||
    t === "line_vertical" ||
    t === "linevertical" ||
    (t === "line" &&
      String(el.orientation || el.dir || "")
        .toLowerCase()
        .startsWith("v"));

  if (isH || isV) {
    const thickness =
      Number(s.thickness ?? s.strokeWidth ?? s.borderWidth ?? 1) || 1;
    const color = s.color || s.stroke || s.borderColor || "#111827";
    const lineCss =
      commonBox +
      `
        background:transparent;
        border:none;
        ${isH ? `height:0; border-top:${thickness}px solid ${color};` : ""}
        ${isV ? `width:0; border-left:${thickness}px solid ${color};` : ""}
        opacity:${el.opacity ?? 1};
      `;
    return `<div style="${lineCss}"></div>`;
  }

  if (el.type === "table") {
    const tmeta = el.table || el.tbl || el.meta || {};
    const repeat = tmeta.repeat || {};
    const repeatEnabled = !!repeat.enabled && !!repeat.arrayPath;
    const repeatPrint = tmeta.repeatPrint;

    if (
      repeatPrint &&
      Array.isArray(repeatPrint.header) &&
      Array.isArray(repeatPrint.body)
    ) {
      const colsDef =
        Array.isArray(repeatPrint.columns) && repeatPrint.columns.length
          ? repeatPrint.columns
          : repeatPrint.header.map((h) => ({
              key: String(h || ""),
              label: String(h || ""),
              align: "left",
              widthMm: null,
            }));

      const widthMm = Number(el.w || 10);
      const heightMm = Number(el.h || 10);

      const colMm = computeColMmScaledToFill(widthMm, colsDef);

      const repeatMetrics = resolveRepeatTableMetricsMm(el, repeat, tmeta);
      const headerH = repeatMetrics.headerRowMm;
      const bodyH = repeatMetrics.bodyRowMm;

      const outerBW = Number(tmeta.borderWidth ?? 1) || 1;
      const outerBC = tmeta.borderColor || "#111827";
      const tableBorder =
        outerBW > 0 ? `${outerBW}px solid ${outerBC}` : "none";

      const gridBC = tmeta.gridColor || outerBC;
      const gridBW = Number(tmeta.gridWidth ?? outerBW) || 1;

      const colgroupHtml = colMm
        .map((w) => `<col style="width:${w}mm">`)
        .join("");

      const headerRow = colsDef
        .map((c) => {
          const align = normalizeTextAlign(c.align || "left");
          const tdCss = `
            border:${gridBW}px solid ${gridBC};
            background:${tmeta.headerBg || "#e5e7eb"};
            padding:0;
            overflow:hidden;
          `;
          const innerCss = `
            width:100%;
            height:100%;
            box-sizing:border-box;
            display:flex;
            align-items:center;
            justify-content:${hAlignToJustify(align)};
            white-space:pre-wrap;
            text-align:${align};
            font-weight:${tmeta.headerFontWeight ?? 700};
            ${cssFromStyle({
              fontFamily:
                (tmeta.style && tmeta.style.fontFamily) ||
                (el.style && el.style.fontFamily),
              fontSize: tmeta.headerFontSize ?? tmeta.fontSize ?? 11,
              fontWeight: tmeta.headerFontWeight ?? 700,
              color: tmeta.headerColor || "#0f172a",
              textAlign: align,
              padding: tmeta.cellPadding ?? 6,
              bg: "transparent",
              borderWidth: 0,
            })}
          `;
          return `<td style="${tdCss}"><div style="${innerCss}">${escapeHtml(String(c.label ?? c.key ?? ""))}</div></td>`;
        })
        .join("");

      let bodyRowsHtml = "";
      for (let r = 0; r < repeatPrint.body.length; r++) {
        const rowArr = repeatPrint.body[r] || [];
        const cells = colsDef
          .map((c, ci) => {
            const align = normalizeTextAlign(c.align || "left");
            const vAlign = "top";
            const colStyle = {
              ...c,
              decimalPlaces: normalizeDecimalPlaces(
                c?.decimalPlaces ?? tmeta.decimalPlaces,
              ),
            };

            const rawVal = rowArr[ci];
            const txt =
              rawVal == null
                ? ""
                : typeof rawVal === "object"
                  ? (() => {
                      try {
                        return JSON.stringify(rawVal);
                      } catch {
                        return String(rawVal);
                      }
                    })()
                  : String(formatValueByStyle(rawVal, colStyle));

            const tdCss = `
              border:${gridBW}px solid ${gridBC};
              background:${tmeta.bodyBg || "transparent"};
              padding:0;
              vertical-align:${vAlign};
              overflow:hidden;
              box-sizing:border-box;
            `;
            const innerCss = `
              width:100%;
              height:100%;
              box-sizing:border-box;
              display:flex;
              align-items:${vAlignToAlignItems(vAlign)};
              justify-content:${hAlignToJustify(align)};
              white-space:pre-wrap;
              text-align:${align};
              ${cssFromStyle({
                fontFamily:
                  (tmeta.style && tmeta.style.fontFamily) ||
                  (el.style && el.style.fontFamily),
                fontSize: tmeta.bodyFontSize ?? tmeta.fontSize ?? 11,
                fontWeight: tmeta.bodyFontWeight ?? 400,
                color: tmeta.bodyColor || "#0f172a",
                textAlign: align,
                padding: tmeta.cellPadding ?? 6,
                bg: "transparent",
                borderWidth: 0,
              })}
            `;
            return `<td style="${tdCss}"><div style="${innerCss}">${escapeHtml(txt)}</div></td>`;
          })
          .join("");

        bodyRowsHtml += `<tr style="height:${bodyH}mm">${cells}</tr>`;
      }

      return `
        <div style="
          ${commonBox}
          background:${tmeta.bg || "#fff"};
          overflow:visible;
        ">
          <table style="
            width:100%;
            height:${heightMm}mm;
            border-collapse:collapse;
            table-layout:fixed;
            box-sizing:border-box;
            border:${tableBorder};
          ">
            <colgroup>${colgroupHtml}</colgroup>
            <tbody>
              <tr style="height:${headerH}mm">${headerRow}</tr>
              ${bodyRowsHtml}
            </tbody>
          </table>
        </div>
      `;
    }

    if (repeatEnabled) {
      const array = getByPath(data, String(repeat.arrayPath)) || [];
      const arr = Array.isArray(array) ? array : [];

      const repeatColsRaw = Array.isArray(repeat.columns) ? repeat.columns : [];
      const colsDef = repeatColsRaw.length
        ? repeatColsRaw
        : (arr[0] && typeof arr[0] === "object" ? Object.keys(arr[0]) : [])
            .slice(0, 8)
            .map((k) => ({ key: k, label: k, align: "left", widthMm: null }));

      const widthMm = Number(el.w || 10);
      const heightMm = Number(el.h || 10);
      const colMm = computeColMmScaledToFill(widthMm, colsDef);

      const repeatMetrics = resolveRepeatTableMetricsMm(el, repeat, tmeta);
      const headerH = repeatMetrics.headerRowMm;
      const bodyH = repeatMetrics.bodyRowMm;

      const maxBodyRows = Math.max(0, Math.floor((heightMm - headerH) / bodyH));
      const willEllipsis = arr.length > maxBodyRows;
      const takeRows = willEllipsis
        ? Math.max(0, maxBodyRows - 1)
        : maxBodyRows;

      const outerBW = Number(tmeta.borderWidth ?? 1) || 1;
      const outerBC = tmeta.borderColor || "#111827";
      const tableBorder =
        outerBW > 0 ? `${outerBW}px solid ${outerBC}` : "none";

      const gridBC = tmeta.gridColor || outerBC;
      const gridBW = Number(tmeta.gridWidth ?? outerBW) || 1;

      const colgroupHtml = colMm
        .map((w) => `<col style="width:${w}mm">`)
        .join("");

      const headerRow = colsDef
        .map((c) => {
          const align = normalizeTextAlign(c.align || "left");
          const tdCss = `
            border:${gridBW}px solid ${gridBC};
            background:${tmeta.headerBg || "#e5e7eb"};
            padding:0;
            overflow:hidden;
          `;
          const innerCss = `
            width:100%;
            height:100%;
            box-sizing:border-box;
            display:flex;
            align-items:center;
            justify-content:${hAlignToJustify(align)};
            white-space:pre-wrap;
            text-align:${align};
            font-weight:${tmeta.headerFontWeight ?? 700};
            ${cssFromStyle({
              fontFamily:
                (tmeta.style && tmeta.style.fontFamily) ||
                (el.style && el.style.fontFamily),
              fontSize: tmeta.headerFontSize ?? tmeta.fontSize ?? 11,
              fontWeight: tmeta.headerFontWeight ?? 700,
              color: tmeta.headerColor || "#0f172a",
              textAlign: align,
              padding: tmeta.cellPadding ?? 6,
              bg: "transparent",
              borderWidth: 0,
            })}
          `;
          return `<td style="${tdCss}"><div style="${innerCss}">${escapeHtml(String(c.label ?? c.key ?? ""))}</div></td>`;
        })
        .join("");

      let bodyRowsHtml = "";
      for (let i = 0; i < takeRows; i++) {
        const rowObj = arr[i] || {};
        const rowCells = colsDef
          .map((c) => {
            const align = normalizeTextAlign(c.align || "left");
            const vAlign = "top";
            const val = getByPath(rowObj, String(c.key || ""));
            const colStyle = {
              ...c,
              decimalPlaces: normalizeDecimalPlaces(
                c?.decimalPlaces ?? tmeta.decimalPlaces,
              ),
            };

            const txt =
              val == null
                ? ""
                : typeof val === "object"
                  ? (() => {
                      try {
                        return JSON.stringify(val);
                      } catch {
                        return String(val);
                      }
                    })()
                  : String(formatValueByStyle(val, colStyle));

            const tdCss = `
              border:${gridBW}px solid ${gridBC};
              background:${tmeta.bodyBg || "transparent"};
              padding:0;
              vertical-align:${vAlign};
              overflow:hidden;
              box-sizing:border-box;
            `;
            const innerCss = `
              width:100%;
              height:100%;
              box-sizing:border-box;
              display:flex;
              align-items:${vAlignToAlignItems(vAlign)};
              justify-content:${hAlignToJustify(align)};
              white-space:pre-wrap;
              text-align:${align};
              word-break:break-word;
              ${cssFromStyle({
                fontFamily:
                  (tmeta.style && tmeta.style.fontFamily) ||
                  (el.style && el.style.fontFamily),
                fontSize: tmeta.fontSize ?? 11,
                fontWeight: tmeta.fontWeight ?? 600,
                color:
                  (tmeta.style && tmeta.style.color) ||
                  (el.style && el.style.color) ||
                  "#0f172a",
                textAlign: align,
                padding: tmeta.cellPadding ?? 6,
                bg: "transparent",
                borderWidth: 0,
              })}
            `;
            return `<td style="${tdCss}"><div style="${innerCss}">${escapeHtml(txt)}</div></td>`;
          })
          .join("");

        bodyRowsHtml += `<tr style="height:${bodyH}mm">${rowCells}</tr>`;
      }

      if (willEllipsis && maxBodyRows > 0) {
        const tdCss = `
          border:${gridBW}px solid ${gridBC};
          background:${tmeta.bodyBg || "transparent"};
          padding:0;
          overflow:hidden;
        `;
        const innerCss = `
          width:100%;
          height:100%;
          box-sizing:border-box;
          display:flex;
          align-items:center;
          justify-content:flex-end;
          white-space:nowrap;
          font-weight:700;
          padding:${Number(tmeta.cellPadding ?? 6)}px;
        `;
        bodyRowsHtml += `<tr style="height:${bodyH}mm"><td colspan="${colsDef.length}" style="${tdCss}"><div style="${innerCss}">…</div></td></tr>`;
      }

      return `
        <div style="
          ${commonBox}
          background:${tmeta.bg || "#fff"};
          overflow:visible;
        ">
          <table style="
            width:100%;
            height:100%;
            border-collapse:collapse;
            table-layout:fixed;
            box-sizing:border-box;
            border:${tableBorder};
          ">
            <colgroup>${colgroupHtml}</colgroup>
            <tbody>
              <tr style="height:${headerH}mm">${headerRow}</tr>
              ${bodyRowsHtml}
            </tbody>
          </table>
        </div>
      `;
    }

    const rows = Number(tmeta.rows || el.rows || 0);
    const cols = Number(tmeta.cols || el.cols || 0);
    if (!rows || !cols) return "";

    const merges = Array.isArray(tmeta.merges) ? tmeta.merges : [];
    const cellStyle = tmeta.cellStyle || tmeta.cellStyles || {};
    const bindings = tmeta.bindings || tmeta.binding || {};

    const colW =
      Array.isArray(tmeta.colW) && tmeta.colW.length
        ? tmeta.colW
        : Array(cols).fill(100);
    const rowH =
      Array.isArray(tmeta.rowH) && tmeta.rowH.length
        ? tmeta.rowH
        : Array(rows).fill(32);

    const widthMm = Number(el.w || 10);
    const heightMm = Number(el.h || 10);

    const totalW = colW.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
    const totalH = rowH.reduce((a, b) => a + (Number(b) || 0), 0) || 1;

    const isRowHAlreadyMm = String(tmeta.rowHUnit || "").toLowerCase() === "mm";
    const isColWAlreadyMm = Math.abs(totalW - widthMm) < 1.5;

    const colMm = isColWAlreadyMm
      ? colW.map((w) => Number(w) || 0)
      : colW.map((w) => ((Number(w) || 0) / totalW) * widthMm);
    const rowMm = isRowHAlreadyMm
      ? rowH.map((h) => Number(h) || 0)
      : rowH.map((h) => ((Number(h) || 0) / totalH) * heightMm);

    const outerBW = Number(tmeta.borderWidth ?? 1) || 1;
    const outerBC = tmeta.borderColor || "#111827";
    const tableBorder = outerBW > 0 ? `${outerBW}px solid ${outerBC}` : "none";

    const colgroupHtml = colMm
      .map((w) => `<col style="width:${w}mm">`)
      .join("");

    let tbodyHtml = "";
    for (let r = 0; r < rows; r++) {
      let rowCells = "";
      for (let c = 0; c < cols; c++) {
        if (isCoveredByMerge(merges, r, c)) continue;

        const m = findMergeAt(merges, r, c);
        const rs = m ? m.rs : 1;
        const cs = m ? m.cs : 1;

        const csx = pickFromMap(cellStyle, r, c) || {};
        const decimalPlaces = normalizeDecimalPlaces(
          csx.decimalPlaces ?? tmeta.decimalPlaces,
        );
        const cell =
          pickFromMap(tmeta.cells || tmeta.cell || tmeta.data || {}, r, c) ||
          null;
        const cellInlineStyle = (cell && (cell.style || cell.css)) || {};

        const sMerged = {
          ...(el.style || {}),
          ...(tmeta.style || {}),
          ...(csx || {}),
          ...(csx && (csx.style || csx.css) ? csx.style || csx.css : {}),
          ...(cellInlineStyle || {}),
          ...(cellInlineStyle && (cellInlineStyle.style || cellInlineStyle.css)
            ? cellInlineStyle.style || cellInlineStyle.css
            : {}),
        };

        const pad = sMerged.padding ?? tmeta.cellPadding ?? 6;
        const bg = sMerged.bg ?? sMerged.background ?? "transparent";
        const color = sMerged.color ?? "#0f172a";
        const fs = sMerged.fontSize ?? tmeta.fontSize ?? 11;
        const fw = sMerged.fontWeight ?? tmeta.fontWeight ?? 600;

        const align = normalizeTextAlign(pickTextAlign(sMerged) ?? "left");
        const vAlign = normalizeVAlign(pickVAlign(sMerged) ?? "top");

        const bc = sMerged.borderColor ?? tmeta.gridColor ?? outerBC;
        const bw =
          Number(sMerged.borderWidth ?? tmeta.gridWidth ?? outerBW) || 1;

        const tdCss = `
          border:${bw}px solid ${bc};
          background:${bg};
          padding:0;
          vertical-align:${vAlign};
          overflow:hidden;
          box-sizing:border-box;
        `;

        const resolved = resolveCellTextForRender({
          tmeta: { ...tmeta, cellStyle, bindings },
          r,
          c,
          data,
        });

        const contentHtml = renderCellContentHtml({
          cell,
          resolvedText: resolved,
          baseStyle: {
            ...sMerged,
            fontFamily: sMerged.fontFamily,
            fontSize: fs,
            fontWeight: fw,
            color,
            padding: pad,
            lineHeight: sMerged.lineHeight,
            letterSpacing: sMerged.letterSpacing,
            decimalPlaces,
          },
          data,
        });

        rowCells += `<td rowspan="${rs}" colspan="${cs}" style="${tdCss}">${contentHtml}</td>`;
      }

      tbodyHtml += `<tr style="height:${rowMm[r]}mm">${rowCells}</tr>`;
    }

    return `
      <div style="
        ${commonBox}
        background:${tmeta.bg || "#fff"};
        overflow:visible;
      ">
        <table style="
          width:100%;
          height:100%;
          border-collapse:collapse;
          table-layout:fixed;
          box-sizing:border-box;
          border:${tableBorder};
        ">
          <colgroup>${colgroupHtml}</colgroup>
          <tbody>${tbodyHtml}</tbody>
        </table>
      </div>
    `;
  }

  return "";
}

/* =========================================================
   TEMPLATE -> FULL HTML DOCUMENT (MULTI PAGE)
========================================================= */

function getPageRenderHeightMm(pg, paperMm) {
  const baseH = Number(paperMm?.h || A4_H_MM) || A4_H_MM;
  if (pg?.__disableAttachmentSheets) return baseH;

  const els = Array.isArray(pg?.elements) ? pg.elements : [];

  const maxBottom = els.reduce((mx, el) => {
    if (!el || el.hidden) return mx;
    const y = Number(el?.y || 0) || 0;
    const h = Number(el?.h || 0) || 0;
    return Math.max(mx, y + h);
  }, baseH);

  // ✅ Important PDF/print fix:
  // Previously we added +0.5mm even when the content ended exactly at A4 height.
  // Chrome can treat 297.5mm as "page 1 + tiny page 2", which generates a blank
  // PDF page. Keep normal A4 pages exactly A4 unless there is real overflow.
  if (maxBottom <= baseH + PAGE_HEIGHT_EPSILON_MM) return baseH;

  // If one fixed element grows beyond A4 (for example, a long description table),
  // preview it as an extended page. Print/PDF uses physical A4 slices below.
  return Math.min(
    MAX_SINGLE_PAGE_RENDER_HEIGHT_MM,
    Math.ceil((maxBottom + 0.5) * 100) / 100,
  );
}

function renderPageBodyHtml(pg, data) {
  const elements = Array.isArray(pg?.elements) ? pg.elements : [];
  return elements
    .filter((e) => !e?.hidden)
    .sort((a, b) => (a?.z || 0) - (b?.z || 0))
    .map((el) => renderElement(el, data))
    .join("");
}

function renderPageHtml(pg, pageIndex, paperMm, data) {
  const body = renderPageBodyHtml(pg, data);
  const pageHeightMm = getPageRenderHeightMm(pg, paperMm);
  const baseH = Number(paperMm.h || A4_H_MM) || A4_H_MM;
  const isExtended = pageHeightMm > baseH + PAGE_HEIGHT_EPSILON_MM;

  return `
    <div
      class="page"
      data-pageindex="${pageIndex}"
      data-extended-page="${isExtended ? "1" : "0"}"
      id="__report_page__${pageIndex}"
      style="
        width:${paperMm.w}mm;
        height:${pageHeightMm}mm;
        overflow:${isExtended ? "visible" : "hidden"};
      "
    >
      ${body}
    </div>
  `;
}

function getPhysicalSliceMetrics(pg, paperMm) {
  const fullH = getPageRenderHeightMm(pg, paperMm);
  const paperH = Number(paperMm?.h || A4_H_MM) || A4_H_MM;

  if (fullH <= paperH + PRINT_SLICE_EPSILON_MM) {
    return {
      fullH,
      paperH,
      isSplit: false,
      slices: [
        {
          sliceIndex: 0,
          offsetMm: 0,
          topMarginMm: 0,
          bottomMarginMm: 0,
          visibleHeightMm: paperH,
        },
      ],
    };
  }

  const topMargin = Math.max(0, Number(PHYSICAL_SPLIT_TOP_MARGIN_MM) || 0);
  const bottomMargin = Math.max(
    0,
    Number(PHYSICAL_SPLIT_BOTTOM_MARGIN_MM) || 0,
  );

  // Keep enough printable height even if somebody increases margins later.
  const firstVisible = Math.max(20, paperH - bottomMargin);
  const nextVisible = Math.max(20, paperH - topMargin - bottomMargin);

  const slices = [];
  let offset = 0;
  let sliceIndex = 0;
  const maxSlices = MAX_SAFE_RENDER_PAGES;

  while (offset < fullH - PRINT_SLICE_EPSILON_MM && sliceIndex < maxSlices) {
    const isFirst = sliceIndex === 0;
    const topMarginMm = isFirst ? 0 : topMargin;
    const visibleHeightMm = isFirst ? firstVisible : nextVisible;

    slices.push({
      sliceIndex,
      offsetMm: offset,
      topMarginMm,
      bottomMarginMm: bottomMargin,
      visibleHeightMm,
    });

    offset += visibleHeightMm;
    sliceIndex += 1;
  }

  return {
    fullH,
    paperH,
    isSplit: true,
    slices: slices.length
      ? slices
      : [
          {
            sliceIndex: 0,
            offsetMm: 0,
            topMarginMm: 0,
            bottomMarginMm: 0,
            visibleHeightMm: paperH,
          },
        ],
  };
}

function getPhysicalSliceCount(pg, paperMm) {
  return getPhysicalSliceMetrics(pg, paperMm).slices.length;
}

function getPhysicalPageCount(tpl) {
  const paperMm = getPaperMmFromTpl(tpl);
  const pages = normalizePages(tpl);
  return pages.reduce((sum, pg) => sum + getPhysicalSliceCount(pg, paperMm), 0);
}

// ✅ Build the real printable A4 page list.
// Important: a template can have 2 logical pages, but one logical page may be
// taller than A4 after auto-grow. Preview, print and PDF must all use this same
// physical A4 plan so the UI count matches the generated PDF count.
function buildPhysicalPagePlan(tpl) {
  const paperMm = getPaperMmFromTpl(tpl);
  const pages = normalizePages(tpl);
  const plan = [];

  pages.forEach((pg, pageIndex) => {
    const metrics = getPhysicalSliceMetrics(pg, paperMm);
    metrics.slices.forEach((slice) => {
      plan.push({
        pg,
        pageIndex,
        sliceIndex: slice.sliceIndex,
        sliceCount: metrics.slices.length,
        physicalIndex: plan.length,
        slice,
      });
    });
  });

  return { paperMm, pages, plan };
}

// ✅ When a logical page/table is sliced into multiple physical A4 pages,
// Chrome only crops the DOM. That means a table continued on the next page can
// show vertical borders but no closing horizontal border at the cut point.
// Add only table cut-boundary lines (not a full A4 page border).
function renderSplitTableBoundaryLinesHtml(pg, slice, paperMm) {
  const elements = Array.isArray(pg?.elements) ? pg.elements : [];
  const paperW = Number(paperMm?.w || A4_W_MM) || A4_W_MM;
  const paperH = Number(paperMm?.h || A4_H_MM) || A4_H_MM;

  const offsetMm = Math.max(0, Number(slice?.offsetMm || 0));
  const topMarginMm = Math.max(0, Number(slice?.topMarginMm || 0));
  const visibleHeightMm = Math.max(1, Number(slice?.visibleHeightMm || paperH));

  const contentTopMm = offsetMm;
  const contentBottomMm = offsetMm + visibleHeightMm;
  const viewportTopMm = topMarginMm;
  const viewportBottomMm = Math.min(paperH, topMarginMm + visibleHeightMm);

  const lineHtml = [];

  elements.forEach((el) => {
    if (!el || el.hidden) return;
    if (String(el?.type || "").toLowerCase() !== "table") return;

    const x = Math.max(0, Number(el.x || 0) || 0);
    const wRaw = Math.max(0, Number(el.w || 0) || 0);
    const w = Math.max(0, Math.min(wRaw, paperW - x));
    if (w <= 0) return;

    const y = Number(el.y || 0) || 0;
    const h = Number(el.h || 0) || 0;
    const bottom = y + h;
    if (h <= 0) return;

    const tmeta = el.table || el.tbl || el.meta || {};
    const bw = Math.max(
      1,
      Number(
        tmeta.borderWidth ?? tmeta.gridWidth ?? el?.style?.borderWidth ?? 1,
      ) || 1,
    );
    const bc =
      tmeta.borderColor ||
      tmeta.gridColor ||
      el?.style?.borderColor ||
      "#111827";

    const common = `
      position:absolute;
      left:${x}mm;
      width:${w}mm;
      height:0;
      border-top:${bw}px solid ${bc};
      pointer-events:none;
      z-index:2147483646;
      box-sizing:border-box;
    `;

    // Close the table at the bottom of this A4 slice if it continues below.
    if (y < contentBottomMm - 0.01 && bottom > contentBottomMm + 0.01) {
      lineHtml.push(
        `<div class="tableCutBorder tableCutBorderBottom" style="${common} top:${viewportBottomMm}mm;"></div>`,
      );
    }

    // Restart/close the table at the top of continuation A4 slices.
    if (y < contentTopMm - 0.01 && bottom > contentTopMm + 0.01) {
      lineHtml.push(
        `<div class="tableCutBorder tableCutBorderTop" style="${common} top:${viewportTopMm}mm;"></div>`,
      );
    }
  });

  return lineHtml.join("");
}

function renderPhysicalPageHtml(
  pg,
  pageIndex,
  sliceIndex,
  physicalIndex,
  paperMm,
  data,
  sliceInfo = null,
) {
  const body = renderPageBodyHtml(pg, data);
  const metrics = getPhysicalSliceMetrics(pg, paperMm);
  const fallbackSlice = metrics.slices[sliceIndex] ||
    metrics.slices[0] || {
      offsetMm: 0,
      topMarginMm: 0,
      bottomMarginMm: 0,
      visibleHeightMm: Number(paperMm.h || A4_H_MM) || A4_H_MM,
    };
  const slice = sliceInfo || fallbackSlice;
  const fullHeightMm = metrics.fullH;
  const paperH = Number(paperMm.h || A4_H_MM) || A4_H_MM;
  const topMarginMm = Math.max(0, Number(slice.topMarginMm || 0));
  const bottomMarginMm = Math.max(0, Number(slice.bottomMarginMm || 0));
  const visibleHeightMm = Math.max(
    1,
    Math.min(paperH, Number(slice.visibleHeightMm || paperH)),
  );
  const offsetMm = Math.max(0, Number(slice.offsetMm || 0));
  const sliceCount = metrics.slices.length;
  const boundaryLinesHtml = renderSplitTableBoundaryLinesHtml(
    pg,
    slice,
    paperMm,
  );

  return `
    <div
      class="page physicalPage"
      data-pageindex="${pageIndex}"
      data-sliceindex="${sliceIndex}"
      data-slicecount="${sliceCount}"
      data-physicalindex="${physicalIndex}"
      data-extended-page="0"
      id="__report_page__${physicalIndex}"
      style="
        width:${paperMm.w}mm;
        height:${paperH}mm;
        overflow:hidden;
      "
    >
      <div
        class="pageSliceViewport"
        style="
          position:absolute;
          left:0;
          top:${topMarginMm}mm;
          width:${paperMm.w}mm;
          height:${visibleHeightMm}mm;
          overflow:hidden;
        "
      >
        <div
          class="pageSliceInner"
          style="
            position:absolute;
            left:0;
            top:-${offsetMm}mm;
            width:${paperMm.w}mm;
            height:${fullHeightMm}mm;
          "
        >
          ${body}
        </div>
      </div>
      ${boundaryLinesHtml}
      ${bottomMarginMm > 0 ? `<div class="pageSliceBottomMargin" style="position:absolute;left:0;right:0;bottom:0;height:${bottomMarginMm}mm;background:#fff;z-index:1;"></div>` : ""}
    </div>
  `;
}

function renderPrintablePagesHtml(tpl, data) {
  const { paperMm, plan } = buildPhysicalPagePlan(tpl);

  return plan
    .map((item) =>
      renderPhysicalPageHtml(
        item.pg,
        item.pageIndex,
        item.sliceIndex,
        item.physicalIndex,
        paperMm,
        data,
        item.slice,
      ),
    )
    .join("");
}

function renderTemplateHtmlStart(tpl, title = "BL Report") {
  const paperMm = getPaperMmFromTpl(tpl);
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: ${paperMm.w}mm ${paperMm.h}mm; margin: 0; }

    *{
      box-sizing:border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html, body { margin:0; padding:0; }
    body { background:#ffffff; }

    .pagesRoot{
      width:100%;
      display:flex;
      flex-direction:column;
      gap:0;
    }

    .page{
      position:relative;
      background:#fff;
      overflow:hidden;
      box-shadow: 0 0 0 rgba(0,0,0,0);
      contain: layout paint style;
    }

    /* ✅ Do not draw a full A4 page border here.
       Only table-cut closing borders are drawn when a table is split across
       physical A4 pages. */

    .pageSlot{
      position:relative;
      margin:0 auto ${PREVIEW_PAGE_GAP_MM}mm auto;
      background:#fff;
      box-shadow:0 8px 22px rgba(0,0,0,0.10);
      overflow:hidden;
    }
    .pageSlot > .page{
      margin:0 !important;
      box-shadow:none !important;
    }
    .pageSliceViewport{
      background:#fff;
    }
    .tableCutBorder{
      background:transparent;
    }
    .physicalPreviewSlot{
      page-break-after: always;
      break-after: page;
    }
    .page[data-extended-page="1"]{
      overflow:visible !important;
    }
    .pagePlaceholder{
      position:absolute;
      inset:0;
      display:flex;
      align-items:center;
      justify-content:center;
      color:#64748b;
      font-family:Arial,Helvetica,sans-serif;
      font-size:12px;
      background:linear-gradient(135deg,#ffffff,#f8fafc);
      border:1px dashed rgba(100,116,139,.35);
    }

    @media screen {
      body { background:#f2f2f2; }
      .pagesRoot{ padding: 8mm 0 ${PREVIEW_PAGE_GAP_MM}mm 0; }
      .page{
        margin: 0 auto 10mm auto;
        box-shadow: 0 8px 22px rgba(0,0,0,0.10);
      }
    }

    @media print {
      html, body {
        width:${paperMm.w}mm;
        min-height:${paperMm.h}mm;
        background:#fff;
        overflow:visible;
      }
      .pagesRoot{
        display:block !important;
        padding:0 !important;
        margin:0 !important;
        gap:0 !important;
      }
      .page{
        margin:0 !important;
        box-shadow:none !important;
        break-after: page;
        page-break-after: always;
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .page:last-child{
        break-after: auto;
        page-break-after: auto;
      }
    }
  </style>
</head>
<body>
  <div class="pagesRoot" id="__pages_root__">`;
}

function renderTemplateHtmlEnd() {
  return `
  </div>
</body>
</html>`;
}

export function renderTemplateHtml(tpl, data) {
  const paperMm = getPaperMmFromTpl(tpl);
  const pages = normalizePages(tpl);

  const pagesHtml = pages
    .map((pg, pageIndex) => renderPageHtml(pg, pageIndex, paperMm, data))
    .join("");

  return `${renderTemplateHtmlStart(tpl)}${pagesHtml}${renderTemplateHtmlEnd()}`;
}

function writeIframeMessage(iframeEl, title = "BL Report", message = "") {
  try {
    if (!iframeEl?.contentWindow) return;
    const doc = iframeEl.contentWindow.document;
    doc.open();
    doc.write(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    html,body{margin:0;padding:0;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;color:#334155;}
    .box{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;text-align:center;}
    .card{background:#fff;border:1px solid rgba(15,23,42,.12);border-radius:10px;padding:18px 20px;box-shadow:0 8px 24px rgba(15,23,42,.08);max-width:560px;}
    .title{font-size:14px;font-weight:700;margin-bottom:6px;color:#0f172a;}
    .msg{font-size:12px;line-height:1.55;white-space:pre-wrap;}
  </style>
</head>
<body>
  <div class="box"><div class="card"><div class="title">${escapeHtml(title)}</div><div class="msg">${escapeHtml(message)}</div></div></div>
</body>
</html>`);
    doc.close();
  } catch {}
}

async function renderTemplateToIframe(tpl, data, iframeEl, opts = {}) {
  if (!iframeEl?.contentWindow) throw new Error("Iframe is not ready");

  const pages = normalizePages(tpl);
  const paperMm = getPaperMmFromTpl(tpl);
  const usePhysicalPages = !!opts.physicalPages;
  const total = usePhysicalPages ? getPhysicalPageCount(tpl) : pages.length;
  const chunkPages = Math.max(
    1,
    Number(opts.chunkPages || PREVIEW_RENDER_CHUNK_PAGES),
  );
  const isCancelled =
    typeof opts.isCancelled === "function" ? opts.isCancelled : () => false;

  if (total > MAX_SAFE_RENDER_PAGES) {
    throw new Error(
      `Render blocked because ${total} physical page(s) were generated, which exceeds the safe limit of ${MAX_SAFE_RENDER_PAGES}.`,
    );
  }

  const doc = iframeEl.contentWindow.document;

  // Write only the shell first. Pages are appended in batches so the browser does not
  // allocate one huge HTML string through React state/srcDoc.
  doc.open();
  doc.write(`${renderTemplateHtmlStart(tpl)}${renderTemplateHtmlEnd()}`);
  doc.close();

  const root = doc.getElementById("__pages_root__");
  if (!root) throw new Error("Preview root not found");

  if (usePhysicalPages) {
    const { plan } = buildPhysicalPagePlan(tpl);

    for (let physicalIndex = 0; physicalIndex < plan.length; physicalIndex++) {
      if (isCancelled()) {
        return { cancelled: true, pageCount: physicalIndex, total };
      }

      const item = plan[physicalIndex];
      const pageHtml = renderPhysicalPageHtml(
        item.pg,
        item.pageIndex,
        item.sliceIndex,
        item.physicalIndex,
        paperMm,
        data,
        item.slice,
      );
      root.insertAdjacentHTML("beforeend", pageHtml);

      if (typeof opts.onProgress === "function") {
        opts.onProgress({ done: physicalIndex + 1, total });
      }

      if ((physicalIndex + 1) % chunkPages === 0) {
        await nextBrowserFrame();
      }
    }

    if (isCancelled()) return { cancelled: true, pageCount: total, total };

    await waitForAssets(doc);
    return { cancelled: false, pageCount: total, total };
  }

  for (let i = 0; i < pages.length; i++) {
    if (isCancelled()) return { cancelled: true, pageCount: i, total };

    const pageHtml = renderPageHtml(pages[i], i, paperMm, data);
    root.insertAdjacentHTML("beforeend", pageHtml);

    if (typeof opts.onProgress === "function") {
      opts.onProgress({ done: i + 1, total });
    }

    if ((i + 1) % chunkPages === 0) {
      await nextBrowserFrame();
    }
  }

  if (isCancelled()) return { cancelled: true, pageCount: total, total };

  await waitForAssets(doc);
  return { cancelled: false, pageCount: total, total };
}

async function renderPreviewWindowToIframe(tpl, data, iframeEl, opts = {}) {
  if (!iframeEl?.contentWindow) throw new Error("Iframe is not ready");

  const pages = normalizePages(tpl);
  const paperMm = getPaperMmFromTpl(tpl);
  const total = pages.length;
  const windowPages = Math.max(
    1,
    Number(opts.windowPages || PREVIEW_WINDOW_PAGES),
  );
  const requestedIndex = Number(opts.pageIndex || 0);
  const safeIndex = Math.max(0, Math.min(total - 1, requestedIndex));
  const start = safeIndex;
  const end = Math.min(total, start + windowPages);
  const isCancelled =
    typeof opts.isCancelled === "function" ? opts.isCancelled : () => false;

  const doc = iframeEl.contentWindow.document;

  // Full reset releases previous preview page DOM/images from memory.
  doc.open();
  doc.write(`${renderTemplateHtmlStart(tpl)}${renderTemplateHtmlEnd()}`);
  doc.close();

  const root = doc.getElementById("__pages_root__");
  if (!root) throw new Error("Preview root not found");

  for (let i = start; i < end; i++) {
    if (isCancelled()) return { cancelled: true, pageCount: i - start, total };

    const pageHtml = renderPageHtml(pages[i], i, paperMm, data);
    root.insertAdjacentHTML("beforeend", pageHtml);

    if (typeof opts.onProgress === "function") {
      opts.onProgress({ done: i + 1, total, pageIndex: i });
    }

    await nextBrowserFrame();
  }

  if (isCancelled()) return { cancelled: true, pageCount: end - start, total };

  await waitForAssets(doc);
  return {
    cancelled: false,
    pageCount: end - start,
    total,
    pageIndex: safeIndex,
  };
}

async function renderContinuousLazyPreviewToIframe(
  tpl,
  data,
  iframeEl,
  opts = {},
) {
  if (!iframeEl?.contentWindow) throw new Error("Iframe is not ready");

  const { paperMm, plan } = buildPhysicalPagePlan(tpl);
  const total = plan.length;
  const bufferPages = Math.max(
    0,
    Number(opts.bufferPages ?? PREVIEW_LAZY_BUFFER_PAGES),
  );
  const isCancelled =
    typeof opts.isCancelled === "function" ? opts.isCancelled : () => false;

  if (total > MAX_SAFE_RENDER_PAGES) {
    throw new Error(
      `Preview blocked because ${total} physical A4 page(s) were generated, which exceeds the safe limit of ${MAX_SAFE_RENDER_PAGES}.`,
    );
  }

  const win = iframeEl.contentWindow;
  const doc = win.document;

  // Clean previous same-origin listeners before replacing the iframe document.
  try {
    if (typeof iframeEl.__blPreviewCleanup === "function") {
      iframeEl.__blPreviewCleanup();
    }
  } catch {}
  iframeEl.__blPreviewCleanup = null;

  doc.open();
  doc.write(`${renderTemplateHtmlStart(tpl)}${renderTemplateHtmlEnd()}`);
  doc.close();

  const root = doc.getElementById("__pages_root__");
  if (!root) throw new Error("Preview root not found");

  // ✅ Preview uses the same physical A4 pages used by print/PDF.
  // This fixes the old mismatch where UI showed only 2 logical pages while
  // PDF generated 3 A4 pages because an attachment page was taller than A4.
  const slotsHtml = plan
    .map((item) => {
      const logicalLabel =
        item.sliceCount > 1
          ? `Template page ${item.pageIndex + 1}, slice ${item.sliceIndex + 1}/${item.sliceCount}`
          : `Template page ${item.pageIndex + 1}`;

      return `
        <div
          class="pageSlot physicalPreviewSlot"
          data-lazy-page-index="${item.physicalIndex}"
          style="width:${paperMm.w}mm;height:${paperMm.h}mm;"
        >
          <div class="pagePlaceholder">
            A4 Page ${item.physicalIndex + 1} / ${total}<br />
            <span style="font-size:11px;color:#94a3b8;">${escapeHtml(logicalLabel)}</span>
          </div>
        </div>
      `;
    })
    .join("");

  root.insertAdjacentHTML("beforeend", slotsHtml);

  const slots = Array.from(root.querySelectorAll("[data-lazy-page-index]"));
  const rendered = new Set();
  let raf = 0;
  let disposed = false;

  const placeholderHtml = (physicalIndex) => {
    const item = plan[physicalIndex];
    const logicalLabel = item
      ? item.sliceCount > 1
        ? `Template page ${item.pageIndex + 1}, slice ${item.sliceIndex + 1}/${item.sliceCount}`
        : `Template page ${item.pageIndex + 1}`
      : "";

    return `<div class="pagePlaceholder">A4 Page ${physicalIndex + 1} / ${total}<br /><span style="font-size:11px;color:#94a3b8;">${escapeHtml(logicalLabel)}</span></div>`;
  };

  const renderPageIntoSlot = (physicalIndex) => {
    if (disposed || isCancelled()) return;
    if (physicalIndex < 0 || physicalIndex >= total) return;
    if (rendered.has(physicalIndex)) return;

    const item = plan[physicalIndex];
    const slot = slots[physicalIndex];
    if (!item || !slot) return;

    slot.innerHTML = renderPhysicalPageHtml(
      item.pg,
      item.pageIndex,
      item.sliceIndex,
      item.physicalIndex,
      paperMm,
      data,
      item.slice,
    );
    rendered.add(physicalIndex);

    if (typeof opts.onProgress === "function") {
      opts.onProgress({ done: rendered.size, total, pageIndex: physicalIndex });
    }
  };

  const unloadPageFromSlot = (physicalIndex) => {
    if (disposed || isCancelled()) return;
    if (!rendered.has(physicalIndex)) return;

    const slot = slots[physicalIndex];
    if (!slot) return;

    slot.innerHTML = placeholderHtml(physicalIndex);
    rendered.delete(physicalIndex);
  };

  const updateVisiblePages = () => {
    raf = 0;
    if (disposed || isCancelled()) return;

    const viewportH = Math.max(
      1,
      Number(win.innerHeight || doc.documentElement.clientHeight || 800),
    );
    const renderTop = -viewportH * bufferPages;
    const renderBottom = viewportH * (1 + bufferPages);
    const unloadTop = -viewportH * (bufferPages + 1.5);
    const unloadBottom = viewportH * (bufferPages + 2.5);

    slots.forEach((slot, idx) => {
      const rect = slot.getBoundingClientRect();
      const near = rect.bottom >= renderTop && rect.top <= renderBottom;
      const far = rect.bottom < unloadTop || rect.top > unloadBottom;

      if (near) renderPageIntoSlot(idx);
      else if (far) unloadPageFromSlot(idx);
    });
  };

  const scheduleUpdate = () => {
    if (raf || disposed || isCancelled()) return;
    raf = win.requestAnimationFrame(updateVisiblePages);
  };

  win.addEventListener("scroll", scheduleUpdate, { passive: true });
  win.addEventListener("resize", scheduleUpdate, { passive: true });

  iframeEl.__blPreviewCleanup = () => {
    disposed = true;
    try {
      if (raf) win.cancelAnimationFrame(raf);
    } catch {}
    try {
      win.removeEventListener("scroll", scheduleUpdate);
      win.removeEventListener("resize", scheduleUpdate);
    } catch {}
  };

  await nextBrowserFrame();
  updateVisiblePages();
  await nextBrowserFrame();

  // Wait only for the currently mounted page assets. More pages load lazily as
  // the user scrolls, but every preview slot already has exact A4 height.
  await waitForAssets(doc);

  return { cancelled: false, pageCount: rendered.size, total };
}

/* =========================================================
   HIDDEN IFRAME UTIL
========================================================= */

async function waitForAssets(doc) {
  try {
    if (doc?.fonts?.ready) await doc.fonts.ready;
  } catch {}
  try {
    const imgs = Array.from(doc.images || []);
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise((res) => {
            if (img.complete) return res();
            img.onload = () => res();
            img.onerror = () => res();
          }),
      ),
    );
  } catch {}
}

async function printViaHiddenIframe(tpl, data, iframeEl, opts = {}) {
  if (!iframeEl?.contentWindow) return;

  await renderTemplateToIframe(tpl, data, iframeEl, {
    chunkPages: PRINT_RENDER_CHUNK_PAGES,
    physicalPages: true,
    onProgress: opts.onProgress,
  });

  const doc = iframeEl.contentWindow.document;
  await waitForAssets(doc);
  await new Promise((r) => setTimeout(r, 200));

  iframeEl.contentWindow.focus();
  iframeEl.contentWindow.print();
}

async function downloadPdfViaCanvas(
  tpl,
  data,
  iframeEl,
  filename = "BL_Report.pdf",
  opts = {},
) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  if (!iframeEl?.contentWindow) throw new Error("Hidden iframe not ready");

  await renderTemplateToIframe(tpl, data, iframeEl, {
    chunkPages: PDF_RENDER_CHUNK_PAGES,
    physicalPages: true,
    onProgress: opts.onProgress,
  });

  const doc = iframeEl.contentWindow.document;
  await waitForAssets(doc);
  await new Promise((r) => setTimeout(r, 250));

  const pagesRoot = doc.getElementById("__pages_root__");
  if (!pagesRoot) throw new Error("Pages root not found in iframe");

  const pageEls = Array.from(
    pagesRoot.querySelectorAll('[id^="__report_page__"]'),
  );
  if (!pageEls.length) throw new Error("No pages found to export");

  const pageCount = pageEls.length;
  if (pageCount > MAX_SAFE_PDF_PAGES) {
    throw new Error(
      `PDF export blocked because ${pageCount} physical pages were generated. Please reduce content or export in smaller batches.`,
    );
  }

  const scale = pageCount > 20 ? 1.25 : 1.75;

  const pdf = new jsPDF("p", "pt", "a4", true);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageEls.length; i++) {
    const pageEl = pageEls[i];

    try {
      pageEl.scrollIntoView({ block: "start" });
    } catch {}

    if (typeof opts.onProgress === "function") {
      opts.onProgress({ done: i + 1, total: pageEls.length, phase: "pdf" });
    }

    const canvas = await html2canvas(pageEl, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
      removeContainer: true,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.92);

    const imgW = canvas.width;
    const imgH = canvas.height;

    const ratio = Math.min(pageWidth / imgW, pageHeight / imgH);
    const drawW = imgW * ratio;
    const drawH = imgH * ratio;

    const x = (pageWidth - drawW) / 2;
    const y = (pageHeight - drawH) / 2;

    if (i > 0) pdf.addPage("a4", "p");
    pdf.addImage(imgData, "JPEG", x, y, drawW, drawH, undefined, "FAST");

    canvas.width = 1;
    canvas.height = 1;
    await nextBrowserFrame();
  }

  pdf.save(filename);
}

/* =========================================================
   PAGE
========================================================= */

export default function BlReportPage() {
  const searchParams = useSearchParams();
  const templateId = getSearchParamAny(searchParams, [
    "templateId",
    "templateID",
    "template",
  ]);
  const blId = getSearchParamAny(searchParams, [
    "blId",
    "blID",
    "recordId",
    "recordID",
    "jobId",
  ]);
  const originalTypeParam = searchParams.get("originalType");

  const originalType =
    originalTypeParam &&
    originalTypeParam !== "null" &&
    originalTypeParam !== "undefined"
      ? originalTypeParam
      : null;

  const DEBUG = useMemo(() => getDebugFlag(searchParams), [searchParams]);

  const [tpl, setTpl] = useState(null);
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewProgress, setPreviewProgress] = useState({ done: 0, total: 0 });
  const [previewPageIndex, setPreviewPageIndex] = useState(0);
  const [actionBusy, setActionBusy] = useState("");

  const previewFrameRef = useRef(null);
  const hiddenFrameRef = useRef(null);
  const measureRef = useRef(null);
  const previewJobRef = useRef(0);

  useEffect(() => {
    let active = true;

    const loadReport = async () => {
      setLoading(true);
      setError("");
      setPreviewError("");
      setPreviewProgress({ done: 0, total: 0 });
      setPreviewPageIndex(0);
      setTpl(null);
      setData(null);

      try {
        if (!templateId || !blId) {
          throw new Error(
            `Missing ${!templateId ? "templateId" : ""}${!templateId && !blId ? " and " : ""}${!blId ? "blId" : ""} in URL`,
          );
        }

        const reqTpl = {
          columns: "id,name,blPrintTemplateJson",
          tableName: "tblBlPrintTemplate",
          whereCondition: `id='${templateId}'`,
          clientIdCondition: `status=1 FOR JSON PATH`,
        };

        const [tplResult, blResult] = await Promise.allSettled([
          fetchReportData(reqTpl),
          fetchBlPrintReportData({ recordId: blId }),
        ]);

        if (!active) return;

        if (tplResult.status === "rejected") {
          throw new Error(
            tplResult.reason?.message || "Failed to fetch template",
          );
        }

        if (blResult.status === "rejected") {
          throw new Error(
            blResult.reason?.message || "Failed to fetch BL data",
          );
        }

        const tplRows = normalizeApiRows(tplResult.value);
        const tplRow = tplRows?.[0];
        if (!tplRow) throw new Error("Template not found");

        const templateJson = pickTemplateJson(tplRow);
        if (!templateJson) {
          throw new Error(
            "Template JSON not found in tblBlPrintTemplate.blPrintTemplateJson",
          );
        }

        const parsedTpl = await safeTemplateJsonParse(templateJson);
        if (!parsedTpl || typeof parsedTpl !== "object") {
          throw new Error("Template JSON is empty or invalid");
        }

        const blRows = normalizeApiRows(blResult.value);
        const blRowBase =
          Number(blResult.value?.count || 0) > 0 ? blRows?.[0] : blRows?.[0];

        if (!blRowBase) throw new Error("BL not found");

        const blRow = {
          ...blRowBase,
          blOriginalType: getOriginalType(originalType, blRowBase),
        };

        if (!active) return;

        dbgLog(
          DEBUG,
          "[DEBUG] Template fetched summary:",
          getTemplateStats(parsedTpl),
        );
        dbgLog(
          DEBUG,
          "[DEBUG] BL data fetched keys:",
          Object.keys(blRow || {}),
        );

        setTpl(parsedTpl);
        setData({ ...blRow, bl: blRow, bldata: blRow, tblBl: blRow });
      } catch (e) {
        if (!active) return;
        console.error("BL report load failed:", e);
        setError(e?.message || "Failed to load BL report");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReport();

    return () => {
      active = false;
    };
  }, [templateId, blId, DEBUG, originalType]);

  function getOriginalType(originalType, data) {
    if (data?.blStatus === "DRAFT") {
      return data?.blStatus || null;
    }

    if (
      originalType === null ||
      originalType === undefined ||
      originalType === "" ||
      originalType === "null" ||
      originalType === "undefined"
    ) {
      return data?.blType || null;
    }

    const originalTypeOptions = [
      { label: "NON NEGOTIABLE", value: "nonNegotiable" },
      { label: "FIRST ORIGINAL", value: "firstOriginal" },
      { label: "SECOND ORIGINAL", value: "secondOriginal" },
      { label: "Third ORIGINAL", value: "thirdOriginal" },
    ];

    return (
      originalTypeOptions.find((x) => x.value === originalType)?.label || null
    );
  }

  function buildBlPagesDetails(tpl) {
    const pages = normalizePages(tpl);

    return pages.map((pg, pageIndex) => {
      const pageKey =
        pageIndex === 0
          ? `MainPage${pageIndex + 1}`
          : `AttachmentPage${pageIndex}`;

      const elements = (Array.isArray(pg?.elements) ? pg.elements : [])
        .filter((el) => !el?.hidden)
        .slice()
        .sort(
          (a, b) =>
            Number(a?.y || 0) - Number(b?.y || 0) ||
            Number(a?.z || 0) - Number(b?.z || 0),
        )
        .map((el, elementIndex) => {
          const y = Number(el?.y || 0);
          const h = Number(el?.h || 0);
          const x = Number(el?.x || 0);
          const w = Number(el?.w || 0);

          return {
            elementIndex: elementIndex + 1,
            id: el?.id || null,
            type: el?.type || null,
            sectionId: el?.sectionId || null,
            attachBand: el?.attachBand || null,
            xMm: x,
            yMm: y,
            wMm: w,
            hMm: h,
            rightMm: x + w,
            bottomMm: y + h,
            z: Number(el?.z || 0),
            rotate: Number(el?.rotate || 0),
            neighbors: el?.neighbors || el?.neighbours || null,
          };
        });

      const usedTopMm = elements.length
        ? Math.min(...elements.map((e) => Number(e.yMm || 0)))
        : 0;

      const usedBottomMm = elements.length
        ? Math.max(...elements.map((e) => Number(e.bottomMm || 0)))
        : 0;

      const usedHeightMm = Math.max(0, usedBottomMm - usedTopMm);

      return {
        [pageKey]: {
          pageIndex: pageIndex + 1,
          pageId: pg?.id || null,
          pageName: pg?.name || null,
          pageWidthMm: Number(pg?.wMm || A4_W_MM),
          pageHeightMm: Number(pg?.hMm || A4_H_MM),
          elementCount: elements.length,
          usedTopMm,
          usedBottomMm,
          usedHeightMm,
          layoutWarnings: toStringArray(pg?.__layoutWarnings),
          layoutErrors: toStringArray(pg?.__layoutErrors),
          elements,
        },
      };
    });
  }

  const measureTextMm = useCallback(({ text, widthMm, style, data: mData }) => {
    const el = measureRef.current;
    if (!el) return 0;

    const mergedStyle = {
      ...(style || {}),
      decimalPlaces: normalizeDecimalPlaces(style?.decimalPlaces),
    };

    const rawText = text || "";
    const resolved = hasTokenSyntax(rawText)
      ? applyTokens(rawText, mData || {}, {
          keepMissingTokens: false,
          formatValue: (v, key) => formatValueByStyle(v, mergedStyle, key),
        })
      : formatValueByStyle(rawText, mergedStyle);

    const displayText = isUnresolvedTokenString(resolved)
      ? ""
      : String(resolved || "");

    const s = style || {};
    const paddingPx = s.padding != null ? Number(s.padding) : 0;
    const widthPx = Math.max(1, Number(widthMm || 1) * MM_TO_PX);

    el.style.width = `${widthPx}px`;
    el.style.fontFamily = s.fontFamily || "Arial, Helvetica, sans-serif";
    el.style.fontSize = `${Number(s.fontSize ?? 11)}px`;
    el.style.fontWeight = String(s.fontWeight ?? 400);
    el.style.fontStyle = s.italic ? "italic" : "normal";
    el.style.letterSpacing =
      s.letterSpacing != null ? `${Number(s.letterSpacing)}px` : "normal";
    el.style.lineHeight = String(s.lineHeight ?? 1.2);
    el.style.padding = `${paddingPx}px`;
    el.style.whiteSpace = "pre-wrap";
    el.style.wordBreak = "break-word";

    el.textContent = displayText;

    const rect = el.getBoundingClientRect();
    const hPx = rect.height;
    el.textContent = "";

    const hMm = hPx / MM_TO_PX;
    return Math.ceil(hMm * 100) / 100;
  }, []);

  const laidTpl = useMemo(() => {
    if (!tpl || !data) return null;

    const paperMm = getPaperMmFromTpl(tpl);

    try {
      dbgGroup(DEBUG, "🧱 [BLReport DEBUG] Pipeline");

      dbgLog(
        DEBUG,
        "paperMm:",
        paperMm,
        "marginMm(from tpl):",
        getMarginMmFromTpl(tpl),
      );

      const laid = layoutTemplateForData(tpl, data, {
        paperMm,
        marginMm: { top: 0, left: 0, right: 0, bottom: 0 },
        headerEnabled: !!tpl?.header?.enabled,
        headerHeightMm: Number(tpl?.header?.heightMm || 0),
        safetyBottomMm: 2,
        measureTextMm,
        debug: DEBUG,
      });

      debugDumpPages(DEBUG, laid, "After layoutTemplateForData");

      const pageCount1 = Array.isArray(laid?.pages) ? laid.pages.length : 0;
      if (pageCount1 > MAX_SAFE_RENDER_PAGES) {
        throw new Error(
          `Layout generated ${pageCount1} pages, which exceeds the safe limit of ${MAX_SAFE_RENDER_PAGES}. Please check canGrowColumns / repeat table flow data.`,
        );
      }

      const grown = applyAutoGrowFixedTablesToTemplate(laid, data, {
        paperMm,
        marginMm: { top: 0, bottom: 0 },
        measureTextMm,
      });

      const reflowed = {
        ...grown,
        pages: (grown.pages || []).map((p) => {
          const cp = { ...p, elements: [...(p.elements || [])] };
          applyVerticalReflowToPage(cp);
          return cp;
        }),
      };

      debugDumpPages(DEBUG, grown, "After applyAutoGrowFixedTablesToTemplate");

      const pageCount2 = Array.isArray(grown?.pages) ? grown.pages.length : 0;
      if (pageCount2 > MAX_SAFE_RENDER_PAGES) {
        throw new Error(
          `Auto-grow stage generated ${pageCount2} pages, which exceeds the safe limit of ${MAX_SAFE_RENDER_PAGES}.`,
        );
      }

      const flowedRaw = applyRepeatTablesFlowToTemplate(reflowed, data, {
        paperMm,
        marginMm: { top: 0, bottom: 0 },
        debug: DEBUG,
      });

      debugDumpPages(DEBUG, flowedRaw, "After applyRepeatTablesFlowToTemplate");

      const flowed = enforceRepeatTablesFollowTopNeighbor(flowedRaw, tpl, {
        debug: DEBUG,
      });

      debugDumpPages(DEBUG, flowed, "After enforceRepeatTablesFollowTopNeighbor");
      debugNeighborGraph(DEBUG, flowed);
      debugAnalyzeTableSnapping(DEBUG, flowed, 3);

      let finalTpl = flowed;

      const finalPageCount = Array.isArray(finalTpl?.pages)
        ? finalTpl.pages.length
        : 0;
      if (finalPageCount > MAX_SAFE_RENDER_PAGES) {
        throw new Error(
          `Final layout generated ${finalPageCount} pages, which exceeds the safe limit of ${MAX_SAFE_RENDER_PAGES}.`,
        );
      }

      if (APPLY_SNAP_TOUCHING_TABLES) {
        finalTpl = snapTouchingTables(finalTpl, 2);
        debugDumpPages(DEBUG, finalTpl, "After snapTouchingTables(APPLIED)");
        debugAnalyzeTableSnapping(DEBUG, finalTpl, 3);
      } else {
        dbgLog(
          DEBUG,
          "snapTouchingTables is NOT applied (only analysis logs are shown).",
        );
      }

      dbgGroupEnd(DEBUG);
      return finalTpl;
    } catch (e) {
      dbgGroupEnd(DEBUG);
      console.error("layout pipeline failed:", e);

      return {
        ...(tpl || {}),
        __layoutErrors: [
          ...toStringArray(tpl?.__layoutErrors),
          e?.message || "Layout pipeline failed",
        ],
      };
    }
  }, [tpl, data, measureTextMm, DEBUG]);

  const layoutMessages = useMemo(
    () => collectLayoutMessages(laidTpl),
    [laidTpl],
  );

  const pageOverflowWarnings = useMemo(
    () => (laidTpl ? collectPageOverflowMessages(laidTpl) : []),
    [laidTpl],
  );

  const templateStats = useMemo(
    () => (tpl ? getTemplateStats(tpl) : null),
    [tpl],
  );

  const logicalPageCount = useMemo(
    () => (Array.isArray(laidTpl?.pages) ? laidTpl.pages.length : 0),
    [laidTpl],
  );

  const physicalPageCount = useMemo(
    () => (laidTpl ? getPhysicalPageCount(laidTpl) : 0),
    [laidTpl],
  );

  useEffect(() => {
    setPreviewPageIndex(0);
  }, [templateId, blId, physicalPageCount]);

  const canGoPrevPreview = previewPageIndex > 0;
  const canGoNextPreview =
    physicalPageCount > 0 && previewPageIndex < physicalPageCount - 1;

  const renderBlockReason = useMemo(() => {
    if (loading || error) return "";

    if (!tpl) return "Template is not loaded yet.";
    if (!data) return "BL data is not loaded yet.";
    if (!laidTpl) return "Layout is not ready yet.";
    if (physicalPageCount > MAX_SAFE_RENDER_PAGES) {
      return `Preview blocked because ${physicalPageCount} A4 page(s) were generated, which exceeds the safe limit of ${MAX_SAFE_RENDER_PAGES}.`;
    }

    return "";
  }, [tpl, data, laidTpl, loading, error, physicalPageCount]);

  useEffect(() => {
    const iframe = previewFrameRef.current;
    const jobId = previewJobRef.current + 1;
    previewJobRef.current = jobId;

    setPreviewError("");

    if (!iframe) return;

    if (loading) {
      writeIframeMessage(iframe, "BL Report", "Loading template and BL data…");
      return;
    }

    if (error) {
      writeIframeMessage(iframe, "BL Report", error);
      return;
    }

    if (renderBlockReason) {
      writeIframeMessage(iframe, "Preview blocked", renderBlockReason);
      return;
    }

    if (!laidTpl || !data) {
      writeIframeMessage(iframe, "BL Report", "Preview is not ready yet.");
      return;
    }

    let cancelled = false;
    setPreviewBusy(true);
    setPreviewProgress({ done: 0, total: physicalPageCount || 0 });
    writeIframeMessage(iframe, "BL Report", "Preparing preview…");

    const run = async () => {
      try {
        await renderContinuousLazyPreviewToIframe(laidTpl, data, iframe, {
          bufferPages: PREVIEW_LAZY_BUFFER_PAGES,
          isCancelled: () => cancelled || previewJobRef.current !== jobId,
          onProgress: ({ done, total }) => {
            if (cancelled || previewJobRef.current !== jobId) return;
            setPreviewProgress({ done, total });
          },
        });
      } catch (e) {
        if (!cancelled && previewJobRef.current === jobId) {
          console.error("Preview render failed:", e);
          const msg = e?.message || "Preview render failed";
          setPreviewError(msg);
          writeIframeMessage(iframe, "Preview failed", msg);
        }
      } finally {
        if (!cancelled && previewJobRef.current === jobId) {
          setPreviewBusy(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [laidTpl, data, loading, error, renderBlockReason, physicalPageCount]);

  const onPrint = async () => {
    try {
      if (!laidTpl || !data || !hiddenFrameRef.current || renderBlockReason)
        return;
      setError("");
      setActionBusy("print");
      await printViaHiddenIframe(laidTpl, data, hiddenFrameRef.current, {
        onProgress: ({ done, total }) => setPreviewProgress({ done, total }),
      });
    } catch (e) {
      console.error(e);
      setError(e?.message || "Print failed");
    } finally {
      setActionBusy("");
    }
  };

  useEffect(() => {
    if (!laidTpl || !DEBUG) return;

    const blPagesDetails = buildBlPagesDetails(laidTpl);

    if (typeof window !== "undefined") {
      window.blPagesDetails = blPagesDetails;
      window.blLayoutWarnings = layoutMessages.warnings;
      window.blLayoutErrors = layoutMessages.errors;
    }

    console.log("Akash blPagesDetails", blPagesDetails);
  }, [laidTpl, layoutMessages, DEBUG]);

  const onDownloadPdf = async () => {
    try {
      const pageCount = laidTpl ? getPhysicalPageCount(laidTpl) : 0;
      if (pageCount > MAX_SAFE_PDF_PAGES) {
        setError(
          `PDF export blocked because ${pageCount} physical pages were generated. Please reduce content or fix flow configuration.`,
        );
        return;
      }

      if (!laidTpl || !data || !hiddenFrameRef.current || renderBlockReason)
        return;
      setError("");
      setActionBusy("pdf");
      await downloadPdfViaCanvas(
        laidTpl,
        data,
        hiddenFrameRef.current,
        "BL_Report.pdf",
        {
          onProgress: ({ done, total }) => setPreviewProgress({ done, total }),
        },
      );
    } catch (e) {
      console.error(e);
      setError(e?.message || "PDF download failed");
    } finally {
      setActionBusy("");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <div
        ref={measureRef}
        style={{
          position: "fixed",
          left: -99999,
          top: -99999,
          visibility: "hidden",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          padding: 0,
          margin: 0,
        }}
      />

      <iframe
        ref={hiddenFrameRef}
        title="hidden-render"
        style={{
          position: "fixed",
          left: "-10000px",
          top: 0,
          width: "210mm",
          height: "297mm",
          border: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
          mb: 1,
          flexWrap: "wrap",
          width: "100%",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<PrintRoundedIcon />}
            onClick={onPrint}
            disabled={
              !laidTpl ||
              !data ||
              loading ||
              !!renderBlockReason ||
              !!actionBusy
            }
            sx={{ height: 32, fontSize: 12, borderRadius: 1 }}
          >
            PRINT
          </Button>

          {/* <Button
      variant="outlined"
      startIcon={<DownloadRoundedIcon />}
      onClick={onDownloadPdf}
      disabled={!laidTpl || !data || loading || !!renderBlockReason || !!actionBusy}
      sx={{ height: 32, fontSize: 12, borderRadius: 1 }}
    >
      DOWNLOAD PDF
    </Button> */}
        </Box>
      </Box>
      {/* DEBUG */}
      {/* {(previewBusy || actionBusy || templateStats) && !loading && (
        <Alert severity={previewError ? "error" : "info"} sx={{ mb: 1 }}>
          {previewError
            ? previewError
            : actionBusy === "print"
              ? `Preparing print${previewProgress.total ? ` (${previewProgress.done}/${previewProgress.total})` : ""}…`
              : actionBusy === "pdf"
                ? `Preparing PDF${previewProgress.total ? ` (${previewProgress.done}/${previewProgress.total})` : ""}…`
                : previewBusy
                  ? `Rendering preview${previewProgress.total ? ` (${previewProgress.done}/${previewProgress.total})` : "…"}…`
                  : `Template loaded: ${logicalPageCount || 0} logical page(s), ${physicalPageCount || 0} A4 page(s), ${templateStats?.elementCount || 0} element(s), ${templateStats?.tableCount || 0} table(s). Preview uses the same A4 page division as Print/PDF, with safe split margins, table-cut closing borders, and renders lazily while scrolling.`}
        </Alert>
      )} */}

      {!!error && !loading && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      {!!renderBlockReason && !loading && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {renderBlockReason}
        </Alert>
      )}

      {!!layoutMessages.errors.length && !loading && (
        <Stack spacing={1} sx={{ mb: 1 }}>
          {layoutMessages.errors.map((msg, idx) => (
            <Alert
              key={`layout-error-${idx}`}
              severity="error"
              variant="filled"
            >
              {msg}
            </Alert>
          ))}
        </Stack>
      )}

      {!!layoutMessages.warnings.length &&
        !layoutMessages.errors.length &&
        !loading && (
          <Stack spacing={1} sx={{ mb: 1 }}>
            {layoutMessages.warnings.map((msg, idx) => (
              <Alert key={`layout-warn-${idx}`} severity="warning">
                {msg}
              </Alert>
            ))}
          </Stack>
        )}

      {!!pageOverflowWarnings.length && !loading && (
        <Stack spacing={1} sx={{ mb: 1 }}>
          {pageOverflowWarnings.map((msg, idx) => (
            <Alert key={`page-overflow-${idx}`} severity="warning">
              {msg}
            </Alert>
          ))}
        </Stack>
      )}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid rgba(0,0,0,0.10)",
          borderRadius: 1,
          overflow: "hidden",
          background: "#f2f2f2",
        }}
      >
        {loading ? (
          <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={18} /> Loading…
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, color: "crimson" }}>{error}</Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "86vh",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              py: 0,
              position: "relative",
            }}
          >
            {previewBusy && (
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1,
                  bgcolor: "rgba(255,255,255,0.92)",
                  boxShadow: "0 6px 18px rgba(15,23,42,0.14)",
                  fontSize: 12,
                }}
              >
                <CircularProgress size={14} />
                Rendering preview{" "}
                {previewProgress.total
                  ? `${previewProgress.done}/${previewProgress.total}`
                  : "…"}
              </Box>
            )}

            <iframe
              ref={previewFrameRef}
              title="BL Report"
              style={{
                width: "100%",
                height: "100%",
                border: 0,
                background: "#f2f2f2",
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
