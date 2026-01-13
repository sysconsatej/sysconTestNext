"use client";
/* eslint-disable */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { decrypt } from "@/helper/security";

/**
 * ✅ FULLY FIXED (Single-file)
 *
 * FIXES INCLUDED:
 * 1) ✅ Text element BG + Border now works (Canvas + Print)
 *    - Previously text render forced background:transparent & border:none (both in canvas + print)
 *    - Now text uses style.bg + style.borderWidth/borderColor/borderStyle + borderRadius
 *
 * 2) ✅ Print text positioning now matches canvas much better
 *    - Previously wrapper used flex justify/align but inner was 100% width/height => alignment ineffective / shifted
 *    - Now:
 *      - Wrapper: display:flex + vertical align ONLY
 *      - Inner: width:100%, height:auto, text-align handles horizontal alignment
 *    - Also padding/letterSpacing convert px -> pt in print so layout is consistent
 *
 * 3) ✅ Print/PDF still reliable (iframe + document.write + fonts/layout wait + onload race fallback)
 * 4) ✅ History correctness for drag/resize/rotate/table resize
 * 5) ✅ Text edit stability (single click edit without drag + double click)
 */

const LS_KEY = "blCreator.template.v2";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
/** ---------- Paper sizes (mm) ---------- */
const PAPER_SIZES = [
  { id: "A0", name: "A0", w: 841, h: 1189 },
  { id: "A1", name: "A1", w: 594, h: 841 },
  { id: "A2", name: "A2", w: 420, h: 594 },
  { id: "A3", name: "A3", w: 297, h: 420 },
  { id: "A4", name: "A4", w: 210, h: 297 },
  { id: "A5", name: "A5", w: 148, h: 210 },
  { id: "A6", name: "A6", w: 105, h: 148 },
  { id: "Letter", name: "Letter", w: 215.9, h: 279.4 },
  { id: "Legal", name: "Legal", w: 215.9, h: 355.6 },
  { id: "Tabloid", name: "Tabloid", w: 279.4, h: 431.8 },
];

/** mm to px at 96dpi */
const MM_TO_PX = 96 / 25.4; // ~3.7795

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const round2 = (n) => Math.round(n * 100) / 100;

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

/** ---------- Element defaults ---------- */
function makeElement(type, x, y) {
  const base = {
    id: uid(),
    type,
    x: round2(x),
    y: round2(y),
    w: 160,
    h: 40,
    rotate: 0,
    locked: false,
    hidden: false,
    groupId: null,
    z: Date.now(),
    style: {
      bg: "transparent",
      borderColor: "#111827",
      borderWidth: 1,
      borderStyle: "solid",
      borderRadius: 0,
      color: "#0f172a",
      fontSize: 12,
      fontWeight: 500,
      fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
      align: "left",
      vAlign: "top",
      padding: 6,
      lineHeight: 1.2,
      letterSpacing: 0,
    },
  };

  if (type === "text") {
    return {
      ...base,
      w: 220,
      h: 60,
      text: "Text",
      textMode: "fixed",
      maxWidthMm: 120,
      // default: text has NO border, NO bg unless user sets it
      style: {
        ...base.style,
        bg: "transparent",
        borderWidth: 0,
      },
    };
  }

  if (type === "box") {
    return {
      ...base,
      w: 220,
      h: 100,
      style: {
        ...base.style,
        bg: "#ffffff",
        borderColor: "#111827",
        borderWidth: 1,
      },
    };
  }

  if (type === "lineH") {
    return {
      ...base,
      w: 240,
      h: 8,
      style: {
        ...base.style,
        borderWidth: 0,
        bg: "transparent",
        stroke: "#111827",
        strokeWidth: 2,
      },
    };
  }

  if (type === "lineV") {
    return {
      ...base,
      w: 8,
      h: 200,
      style: {
        ...base.style,
        borderWidth: 0,
        bg: "transparent",
        stroke: "#111827",
        strokeWidth: 2,
      },
    };
  }

  if (type === "table") {
    const rows = 4;
    const cols = 5;

    // internal "px-like" weights for table layout
    const colW = Array(cols).fill(Math.floor(520 / cols));
    const rowH = Array(rows).fill(32);

    return {
      ...base,
      w: 520 / MM_TO_PX, // mm
      h: (rows * 32 + 2) / MM_TO_PX, // mm
      table: {
        rows,
        cols,
        colW,
        rowH,
        borderColor: "#111827",
        borderWidth: 1,
        gridColor: "#111827",
        gridWidth: 1,
        cellPadding: 6,
        fontSize: 11,
        header: false,
        bindings: {},
        cellStyle: {},
        merges: [],
        activeCell: null,
        range: null,
      },
      style: { ...base.style, borderWidth: 0, bg: "transparent", padding: 0 },
    };
  }

  return base;
}

/** ---------- Merge helpers ---------- */
function normalizeRange(a, b) {
  if (!a || !b) return null;
  const r0 = Math.min(a.r, b.r);
  const c0 = Math.min(a.c, b.c);
  const r1 = Math.max(a.r, b.r);
  const c1 = Math.max(a.c, b.c);
  return { r0, c0, r1, c1 };
}

function cellKey(r, c) {
  return `${r},${c}`;
}

function findMergeAt(merges, r, c) {
  for (const m of merges || []) {
    if (r >= m.r0 && r < m.r0 + m.rs && c >= m.c0 && c < m.c0 + m.cs) return m;
  }
  return null;
}

function isCellCoveredByAnotherMerge(merges, r, c) {
  const m = findMergeAt(merges, r, c);
  if (!m) return false;
  return !(m.r0 === r && m.c0 === c);
}

function canMergeRange(table, range) {
  if (!table || !range) return false;
  const { r0, c0, r1, c1 } = range;
  if (r0 === r1 && c0 === c1) return false;

  for (const m of table.merges || []) {
    const mr0 = m.r0,
      mc0 = m.c0,
      mr1 = m.r0 + m.rs - 1,
      mc1 = m.c0 + m.cs - 1;

    const overlap = !(r1 < mr0 || r0 > mr1 || c1 < mc0 || c0 > mc1);
    if (overlap) return false;
  }
  return true;
}

/** ---------- Snap + guides ---------- */
function buildSnapTargets(elements, selectedIds) {
  const targets = [];
  for (const el of elements) {
    if (selectedIds.has(el.id)) continue;
    if (el.hidden) continue;

    const left = el.x;
    const right = el.x + el.w;
    const top = el.y;
    const bottom = el.y + el.h;
    const cx = el.x + el.w / 2;
    const cy = el.y + el.h / 2;

    targets.push({ axis: "x", v: left, type: "edge" });
    targets.push({ axis: "x", v: right, type: "edge" });
    targets.push({ axis: "x", v: cx, type: "center" });

    targets.push({ axis: "y", v: top, type: "edge" });
    targets.push({ axis: "y", v: bottom, type: "edge" });
    targets.push({ axis: "y", v: cy, type: "center" });
  }
  return targets;
}

function snapValue(value, candidates, threshold) {
  let best = { snapped: value, delta: Infinity, guide: null };
  for (const c of candidates) {
    const d = Math.abs(value - c.v);
    if (d <= threshold && d < best.delta)
      best = { snapped: c.v, delta: d, guide: c };
  }
  return best;
}

/** ---------- Icons (inline SVG) ---------- */
function Icon({ name, size = 16 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (name === "cursor")
    return (
      <svg {...common}>
        <path {...stroke} d="M5 3l14 8-7 2-2 7-5-17z" />
      </svg>
    );
  if (name === "hand")
    return (
      <svg {...common}>
        <path {...stroke} d="M8 13V6a2 2 0 114 0v7" />
        <path {...stroke} d="M12 13V7a2 2 0 114 0v6" />
        <path
          {...stroke}
          d="M16 13V9a2 2 0 114 0v5a6 6 0 01-6 6H9a4 4 0 01-4-4v-3a2 2 0 114 0v0"
        />
      </svg>
    );
  if (name === "text")
    return (
      <svg {...common}>
        <path {...stroke} d="M4 6h16M9 6v14m6-14v14" />
      </svg>
    );
  if (name === "box")
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="14" rx="2" {...stroke} />
      </svg>
    );
  if (name === "lineH")
    return (
      <svg {...common}>
        <path {...stroke} d="M4 12h16" />
      </svg>
    );
  if (name === "lineV")
    return (
      <svg {...common}>
        <path {...stroke} d="M12 4v16" />
      </svg>
    );
  if (name === "table")
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="14" rx="2" {...stroke} />
        <path {...stroke} d="M4 10h16M9 5v14M15 5v14" />
      </svg>
    );
  if (name === "undo")
    return (
      <svg {...common}>
        <path {...stroke} d="M9 14l-4-4 4-4" />
        <path {...stroke} d="M5 10h9a5 5 0 110 10h-1" />
      </svg>
    );
  if (name === "redo")
    return (
      <svg {...common}>
        <path {...stroke} d="M15 14l4-4-4-4" />
        <path {...stroke} d="M19 10H10a5 5 0 100 10h1" />
      </svg>
    );
  if (name === "save")
    return (
      <svg {...common}>
        <path
          {...stroke}
          d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"
        />
        <path {...stroke} d="M17 21v-8H7v8" />
        <path {...stroke} d="M7 3v5h8" />
      </svg>
    );
  if (name === "folder")
    return (
      <svg {...common}>
        <path {...stroke} d="M3 6h6l2 2h10v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" />
      </svg>
    );
  if (name === "download")
    return (
      <svg {...common}>
        <path {...stroke} d="M12 3v12" />
        <path {...stroke} d="M7 10l5 5 5-5" />
        <path {...stroke} d="M5 21h14" />
      </svg>
    );
  if (name === "upload")
    return (
      <svg {...common}>
        <path {...stroke} d="M12 21V9" />
        <path {...stroke} d="M7 14l5-5 5 5" />
        <path {...stroke} d="M5 3h14" />
      </svg>
    );
  if (name === "print")
    return (
      <svg {...common}>
        <path {...stroke} d="M6 9V4h12v5" />
        <rect x="6" y="14" width="12" height="7" rx="2" {...stroke} />
        <path
          {...stroke}
          d="M6 12H5a3 3 0 01-3-3v0a3 3 0 013-3h14a3 3 0 013 3v0a3 3 0 01-3 3h-1"
        />
      </svg>
    );
  if (name === "db")
    return (
      <svg {...common}>
        <ellipse cx="12" cy="5" rx="7" ry="3" {...stroke} />
        <path {...stroke} d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
        <path {...stroke} d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
      </svg>
    );
  if (name === "trash")
    return (
      <svg {...common}>
        <path {...stroke} d="M4 7h16" />
        <path {...stroke} d="M10 11v6M14 11v6" />
        <path {...stroke} d="M6 7l1 14h10l1-14" />
        <path {...stroke} d="M9 7V4h6v3" />
      </svg>
    );
  if (name === "lock")
    return (
      <svg {...common}>
        <rect x="6" y="11" width="12" height="9" rx="2" {...stroke} />
        <path {...stroke} d="M8 11V8a4 4 0 018 0v3" />
      </svg>
    );
  if (name === "unlock")
    return (
      <svg {...common}>
        <rect x="6" y="11" width="12" height="9" rx="2" {...stroke} />
        <path {...stroke} d="M10 11V8a3 3 0 016 0" />
      </svg>
    );
  if (name === "group")
    return (
      <svg {...common}>
        <rect x="4" y="4" width="10" height="10" rx="2" {...stroke} />
        <rect x="10" y="10" width="10" height="10" rx="2" {...stroke} />
      </svg>
    );
  if (name === "ungroup")
    return (
      <svg {...common}>
        <rect x="4" y="4" width="10" height="10" rx="2" {...stroke} />
        <path {...stroke} d="M14 10h6v10h-10v-6" />
      </svg>
    );
  if (name === "front")
    return (
      <svg {...common}>
        <path {...stroke} d="M7 7h10v10H7z" />
        <path {...stroke} d="M5 5h10" />
        <path {...stroke} d="M5 5v10" />
      </svg>
    );
  if (name === "back")
    return (
      <svg {...common}>
        <path {...stroke} d="M7 7h10v10H7z" />
        <path {...stroke} d="M19 19H9" />
        <path {...stroke} d="M19 19V9" />
      </svg>
    );
  if (name === "alignLeft")
    return (
      <svg {...common}>
        <path {...stroke} d="M6 4v16" />
        <path {...stroke} d="M9 7h10M9 12h7M9 17h9" />
      </svg>
    );
  if (name === "alignCenter")
    return (
      <svg {...common}>
        <path {...stroke} d="M12 4v16" />
        <path {...stroke} d="M6 7h12M8 12h8M7 17h10" />
      </svg>
    );
  if (name === "alignRight")
    return (
      <svg {...common}>
        <path {...stroke} d="M18 4v16" />
        <path {...stroke} d="M6 7h9M9 12h9M7 17h11" />
      </svg>
    );
  if (name === "alignTop")
    return (
      <svg {...common}>
        <path {...stroke} d="M4 6h16" />
        <path {...stroke} d="M7 9v10M12 9v7M17 9v9" />
      </svg>
    );
  if (name === "alignMiddle")
    return (
      <svg {...common}>
        <path {...stroke} d="M4 12h16" />
        <path {...stroke} d="M7 6v12M12 8v8M17 7v10" />
      </svg>
    );
  if (name === "alignBottom")
    return (
      <svg {...common}>
        <path {...stroke} d="M4 18h16" />
        <path {...stroke} d="M7 6v9M12 9v6M17 7v8" />
      </svg>
    );
  if (name === "grid")
    return (
      <svg {...common}>
        <path {...stroke} d="M4 7h16M4 12h16M4 17h16M8 5v14M16 5v14" />
      </svg>
    );
  if (name === "ruler")
    return (
      <svg {...common}>
        <path {...stroke} d="M4 7h16v10H4z" />
        <path {...stroke} d="M8 7v4M12 7v2M16 7v4" />
      </svg>
    );
  if (name === "mag")
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6" {...stroke} />
        <path {...stroke} d="M20 20l-4-4" />
      </svg>
    );
  if (name === "rotate")
    return (
      <svg {...common}>
        <path {...stroke} d="M21 12a9 9 0 10-3 6.7" />
        <path {...stroke} d="M21 12v6h-6" />
      </svg>
    );
  if (name === "tabs")
    return (
      <svg {...common}>
        <path {...stroke} d="M4 6h7l2 2h7v10H4z" />
      </svg>
    );

  return null;
}

/** ---------- Print helpers ---------- */
const pxToPt = (px) => (Number(px || 0) * 72) / 96;

function escapeHtml(s = "") {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const mm = (v) => `${Number(v || 0)}mm`;

function vAlignToAlignItems(vAlign) {
  const va = (vAlign || "top").toLowerCase();
  if (va === "middle" || va === "center") return "center";
  if (va === "bottom") return "flex-end";
  return "flex-start";
}

function cssFromStyle(style = {}) {
  const fsPx = Number(style.fontSize ?? 12);
  const lh = style.lineHeight != null ? style.lineHeight : 1.15;

  const parts = [];
  if (style.fontFamily) parts.push(`font-family:${style.fontFamily};`);
  if (style.fontWeight != null) parts.push(`font-weight:${style.fontWeight};`);
  if (style.fontStyle) parts.push(`font-style:${style.fontStyle};`);
  if (style.textDecoration)
    parts.push(`text-decoration:${style.textDecoration};`);
  if (style.color) parts.push(`color:${style.color};`);

  parts.push(`font-size:${pxToPt(fsPx)}pt;`);
  parts.push(`line-height:${lh};`);

  if (style.letterSpacing != null)
    parts.push(`letter-spacing:${pxToPt(style.letterSpacing)}pt;`);

  if (style.padding != null)
    parts.push(`padding:${pxToPt(Number(style.padding))}pt;`);
  else parts.push(`padding:0pt;`);

  // background & border typically applied on outer frame for text,
  // but keep support for other uses.
  if (style.bg) parts.push(`background:${style.bg};`);

  const bw = style.borderWidth ?? 0;
  if (bw > 0) {
    const bs = style.borderStyle || "solid";
    const bc = style.borderColor || "#000";
    parts.push(`border:${bw}px ${bs} ${bc};`);
  } else {
    parts.push(`border:none;`);
  }

  const ta = (style.align || "left").toLowerCase();
  parts.push(`text-align:${ta};`);

  return parts.join("");
}

function templateToPrintableHTML({ wMm, hMm, elementsHtml, header }) {
  const showHeader = Boolean(
    header?.enabled && header?.src && header?.heightMm
  );

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>BL Print</title>
<style>
  @page { size:${wMm}mm ${hMm}mm; margin:0; }
  html, body {
    width:${wMm}mm;
    height:${hMm}mm;
    margin:0;
    padding:0;
    background:#fff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  * {
    box-sizing:border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .page {
    position: relative;
    width:${wMm}mm;
    height:${hMm}mm;
    overflow:hidden;
    background:#fff;
  }
</style>
</head>
<body>
  <div class="page">

    ${
      showHeader
        ? `
      <div style="
        position:absolute;
        top:0;
        left:0;
        width:${wMm}mm;
        height:${header.heightMm}mm;
        display:flex;
        align-items:center;
        justify-content:center;
        border-bottom:1px solid #e5e7eb;
      ">
        <img
          src="${header.src}"
          style="max-width:100%; max-height:100%; object-fit:contain;"
        />
      </div>
      `
        : ""
    }

    ${elementsHtml}

  </div>
</body>
</html>`;
}

function renderElementsToHtml(elements = []) {
  const sorted = [...(elements || [])]
    .filter((e) => !e.hidden)
    .sort((a, b) => (a.z || 0) - (b.z || 0));

  return sorted
    .map((el) => {
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
      `;

      if (el.type === "text") {
        // ✅ FIX: text border/bg MUST be applied in PRINT
        const bw = Number(s.borderWidth ?? 0);
        const border =
          bw > 0
            ? `${bw}px ${s.borderStyle || "solid"} ${
                s.borderColor || "#111827"
              }`
            : "none";

        const wrapCss =
          commonBox +
          `
            display:flex;
            align-items:${vAlignToAlignItems(s.vAlign)};
            overflow:hidden;
            background:${s.bg || "transparent"};
            border:${border};
            border-radius:${Number(s.borderRadius || 0)}px;
          `;

        // ✅ FIX: inner is NOT full height; horizontal alignment uses text-align
        const innerCss = `
          width:100%;
          max-height:100%;
          overflow:hidden;
          white-space:pre-wrap;
          word-break:break-word;
          ${cssFromStyle({
            ...s,
            bg: "transparent",
            borderWidth: 0,
          })}
        `;

        return `<div style="${wrapCss}"><div style="${innerCss}">${escapeHtml(
          el.text || ""
        )}</div></div>`;
      }

      if (el.type === "box") {
        const boxCss =
          commonBox +
          `
            background:${s.bg || "transparent"};
            border:${
              (s.borderWidth ?? 0) > 0
                ? `${s.borderWidth}px ${s.borderStyle || "solid"} ${
                    s.borderColor || "#000"
                  }`
                : "none"
            };
            border-radius:${Number(s.borderRadius || 0)}px;
          `;
        return `<div style="${boxCss}"></div>`;
      }

      if (el.type === "lineH" || el.type === "lineV") {
        const thickness = Number(s.strokeWidth || 1);
        const color = s.stroke || "#000";
        const lineCss =
          commonBox +
          `
            background:${color};
            border:none;
            ${
              el.type === "lineH"
                ? `height:${thickness}px;`
                : `width:${thickness}px;`
            }
          `;
        return `<div style="${lineCss}"></div>`;
      }

      if (el.type === "table") return renderTableToHtml(el);

      return "";
    })
    .join("");
}

function renderTableToHtml(el) {
  const t = el.table || {};
  const rows = Number(t.rows || 1);
  const cols = Number(t.cols || 1);
  const merges = Array.isArray(t.merges) ? t.merges : [];
  const bindings = t.bindings || {};
  const cellStyle = t.cellStyle || {};

  const colW =
    Array.isArray(t.colW) && t.colW.length ? t.colW : Array(cols).fill(100);
  const rowH =
    Array.isArray(t.rowH) && t.rowH.length ? t.rowH : Array(rows).fill(32);

  const totalW = colW.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
  const totalH = rowH.reduce((a, b) => a + (Number(b) || 0), 0) || 1;

  const colPct = colW.map((w) => ((Number(w) || 0) / totalW) * 100);
  const rowPct = rowH.map((h) => ((Number(h) || 0) / totalH) * 100);

  const left = `${Number(el.x || 0)}mm`;
  const top = `${Number(el.y || 0)}mm`;
  const width = `${Number(el.w || 10)}mm`;
  const height = `${Number(el.h || 10)}mm`;
  const rotate = Number(el.rotate || 0);

  const border = `${t.borderWidth ?? 1}px solid ${t.borderColor || "#111827"}`;

  function isCovered(r, c) {
    const m = findMergeAt(merges, r, c);
    if (!m) return false;
    return !(m.r0 === r && m.c0 === c);
  }

  const colgroupHtml = colPct.map((p) => `<col style="width:${p}%">`).join("");

  let tbodyHtml = "";
  for (let r = 0; r < rows; r++) {
    let rowCells = "";
    for (let c = 0; c < cols; c++) {
      if (isCovered(r, c)) continue;

      const m = findMergeAt(merges, r, c);
      const rs = m ? m.rs : 1;
      const cs = m ? m.cs : 1;

      const k = cellKey(r, c);
      const b = bindings[k];

      let label = "";
      if (b && b.label) label = b.label;
      else if (b && b.columnKey) label = `{{${b.columnKey}}}`;

      const csx = cellStyle[k] || {};
      const pad = csx.padding ?? t.cellPadding ?? 6;
      const bg = csx.bg ?? "#fff";
      const color = csx.color ?? "#0f172a";
      const fs = csx.fontSize ?? t.fontSize ?? 11;
      const fw = csx.fontWeight ?? 600;
      const align = csx.align ?? "left";
      const vAlign = csx.vAlign ?? "top";
      const bc = csx.borderColor ?? t.gridColor ?? "#111827";
      const bw = csx.borderWidth ?? t.gridWidth ?? 1;

      const outer = `
        border:${bw}px solid ${bc};
        box-sizing:border-box;
        overflow:hidden;
        background:${bg};
        display:flex;
        align-items:${vAlignToAlignItems(vAlign)};
      `;

      const inner = `
        width:100%;
        max-height:100%;
        box-sizing:border-box;
        ${cssFromStyle({
          fontFamily: el.style?.fontFamily,
          fontSize: fs,
          fontWeight: fw,
          color,
          align,
          vAlign,
          padding: pad,
          lineHeight: el.style?.lineHeight,
          letterSpacing: el.style?.letterSpacing,
          bg: "transparent",
          borderWidth: 0,
        })}
        background:transparent;
        border:none;
        white-space:pre-wrap;
        word-break:break-word;
      `;

      rowCells += `<td rowspan="${rs}" colspan="${cs}" style="${outer}"><div style="${inner}">${escapeHtml(
        label
      )}</div></td>`;
    }
    tbodyHtml += `<tr style="height:${rowPct[r]}%">${rowCells}</tr>`;
  }

  return `
    <div style="
      position:absolute;
      left:${left};
      top:${top};
      width:${width};
      height:${height};
      transform:${rotate ? `rotate(${rotate}deg)` : "none"};
      transform-origin:center center;
      border:${border};
      background:#fff;
      overflow:hidden;
      box-sizing:border-box;
    ">
      <table style="
        width:100%;
        height:100%;
        border-collapse:collapse;
        table-layout:fixed;
        font-size:${pxToPt(Number(t.fontSize || 11))}pt;
      ">
        <colgroup>${colgroupHtml}</colgroup>
        <tbody>${tbodyHtml}</tbody>
      </table>
    </div>
  `;
}

/** ---------- Main Page ---------- */
export default function BlCreatorPage() {
  const containerRef = useRef(null);
  const canvasStageRef = useRef(null);
  const canvasRef = useRef(null);
  const pageRef = useRef(null);

  // single-click edit support
  const pendingTextEditRef = useRef(null);
  const pointerMovedRef = useRef(false);
  const DRAG_THRESHOLD_PX = 4;

  // hidden measurer for auto-size text
  const measureRef = useRef(null);

  const [headerLogo, setHeaderLogo] = useState(null);

  // history for undo/redo
  const historyRef = useRef({ stack: [], idx: -1 });

  // interaction state
  const interactionRef = useRef({
    mode: null,
    start: null,
    startEls: null,
    handle: null,
    marquee: null,
    table: null,
    snap: null,
    rotate: null,
    pan: null,
    pendingId: null,
  });

  const [columns] = useState(() => [
    { key: "blNo", label: "BL No" },
    { key: "shipperName", label: "Shipper Name" },
    { key: "consigneeName", label: "Consignee Name" },
    { key: "notifyName", label: "Notify Party" },
    { key: "pol", label: "POL" },
    { key: "pod", label: "POD" },
    { key: "fpd", label: "FPD" },
    { key: "vessel", label: "Vessel" },
    { key: "voyage", label: "Voyage" },
    { key: "goodsDesc", label: "Goods Description" },
    { key: "marks", label: "Marks & Nos" },
    { key: "packages", label: "Packages" },
    { key: "grossWeight", label: "Gross Weight" },
  ]);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      let imageHeader = userData[0]?.headerLogoPath;
      if (imageHeader) {
        imageHeader = baseUrlNext + imageHeader;
      }
      setHeaderLogo(imageHeader);
    } else {
      setHeaderLogo(null);
    }
  }, []);

  console.log("Header Logo:", headerLogo);

  const [template, setTemplate] = useState(() => {
    const paper = PAPER_SIZES.find((p) => p.id === "A4") || PAPER_SIZES[4];
    return {
      id: uid(),
      name: "BL Template (Draft)",
      paper: { ...paper, orientation: "P" },
      margin: { t: 10, r: 10, b: 10, l: 10 },

      // ✅ NEW
      header: {
        enabled: true,
        heightMm: 22,
        logoSrc: "", // existing
        logo: {
          x: 6,
          y: 3,
          w: 32,
          h: 14,
        },
      },
      elements: [],
      groups: {},
    };
  });

  const templateRef = useRef(template);
  useEffect(() => {
    templateRef.current = template;
  }, [template]);

  // keep templateRef synced immediately when needed (pointermove)
  const setTemplateLive = (next) => {
    templateRef.current = next;
    setTemplate(next);
  };

  const [ui, setUi] = useState({
    scale: 1,
    showGrid: true,
    showRulers: true,
    snap: true,
    snapThreshold: 2.5,
  });

  const [leftTab, setLeftTab] = useState("elements");
  const [rightTab, setRightTab] = useState("inspect");

  const [activeTool, setActiveTool] = useState("select");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [hoverId, setHoverId] = useState(null);

  const selected = useMemo(() => {
    const set = selectedIds;
    return template.elements.filter((e) => set.has(e.id));
  }, [template.elements, selectedIds]);

  const primarySelected = selected.length
    ? selected[selected.length - 1]
    : null;

  // guides
  const [guides, setGuides] = useState({ x: null, y: null });

  /** ---------- Paper sizing ---------- */
  const paperMM = useMemo(() => {
    const p = template.paper;
    if (p.orientation === "L") return { w: p.h, h: p.w };
    return { w: p.w, h: p.h };
  }, [template.paper]);

  const paperPX = useMemo(() => {
    return {
      w: paperMM.w * MM_TO_PX * ui.scale,
      h: paperMM.h * MM_TO_PX * ui.scale,
    };
  }, [paperMM, ui.scale]);

  const HEADER_LOGO_ID = "__HEADER_LOGO__";
  const header = template.header || {};
  const logo = header.logo || { x: 6, y: 3, w: 32, h: 14 };

  /** ---------- History helpers ---------- */
  function pushHistory(next) {
    const h = historyRef.current;
    h.stack = h.stack.slice(0, h.idx + 1);
    h.stack.push(deepClone(next));
    h.idx++;
  }

  function commit(next) {
    setTemplateLive(next);
    pushHistory(next);
  }

  function undo() {
    const h = historyRef.current;
    if (h.idx <= 0) return;
    h.idx--;
    const prev = deepClone(h.stack[h.idx]);
    setTemplateLive(prev);
    setSelectedIds(new Set());
  }

  function redo() {
    const h = historyRef.current;
    if (h.idx >= h.stack.length - 1) return;
    h.idx++;
    const nxt = deepClone(h.stack[h.idx]);
    setTemplateLive(nxt);
    setSelectedIds(new Set());
  }

  useEffect(() => {
    const h = historyRef.current;
    if (h.idx === -1) pushHistory(template);
    // eslint-disable-next-line
  }, []);

  /** ---------- Toast ---------- */
  const [toastMsg, setToastMsg] = useState("");
  const toastTimer = useRef(null);
  function toast(msg) {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 1600);
  }

  /** ---------- Local Save/Load ---------- */
  function saveLocal() {
    localStorage.setItem(LS_KEY, JSON.stringify(templateRef.current));
    toast("Saved locally");
  }

  function loadLocal() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return toast("No local template found");
    try {
      const data = JSON.parse(raw);
      commit(data);
      toast("Loaded");
    } catch {
      toast("Load failed");
    }
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(templateRef.current, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(templateRef.current.name || "bl-template").replaceAll(
      " ",
      "_"
    )}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importJSONFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result || ""));
        commit(data);
        toast("Imported");
      } catch {
        toast("Import failed");
      }
    };
    reader.readAsText(file);
  }

  /** ---------- Selection helpers ---------- */
  function setOnlySelected(id) {
    setSelectedIds(new Set([id]));
  }
  function toggleSelected(id) {
    setSelectedIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function clearSelection() {
    setSelectedIds(new Set());
  }

  function bringToFront() {
    if (!selected.length) return;
    const next = deepClone(templateRef.current);
    const maxZ = Math.max(0, ...next.elements.map((e) => e.z || 0));
    for (const el of next.elements) {
      if (selectedIds.has(el.id) && !el.locked) el.z = maxZ + 1 + Math.random();
    }
    commit(next);
  }

  function sendToBack() {
    if (!selected.length) return;
    const next = deepClone(templateRef.current);
    const minZ = Math.min(0, ...next.elements.map((e) => e.z || 0));
    for (const el of next.elements) {
      if (selectedIds.has(el.id) && !el.locked) el.z = minZ - 1 - Math.random();
    }
    commit(next);
  }

  /** ---------- Group/Ungroup + Lock/Unlock ---------- */
  function groupSelected() {
    const ids = [...selectedIds];
    if (ids.length < 2) return toast("Select 2+ to group");
    const next = deepClone(templateRef.current);

    const gid = uid();
    next.groups = next.groups || {};
    next.groups[gid] = {
      id: gid,
      name: `Group ${Object.keys(next.groups).length + 1}`,
      childIds: ids,
    };

    for (const el of next.elements) if (ids.includes(el.id)) el.groupId = gid;
    commit(next);
    toast("Grouped");
  }

  function ungroupSelected() {
    const next = deepClone(templateRef.current);
    const gids = new Set();
    for (const el of next.elements)
      if (selectedIds.has(el.id) && el.groupId) gids.add(el.groupId);
    if (!gids.size) return toast("No group selected");

    for (const gid of gids) {
      const g = next.groups?.[gid];
      if (!g) continue;
      for (const el of next.elements) if (el.groupId === gid) el.groupId = null;
      delete next.groups[gid];
    }
    commit(next);
    toast("Ungrouped");
  }

  function toggleLockSelected(lockTo) {
    if (!selected.length) return;
    const next = deepClone(templateRef.current);
    for (const el of next.elements)
      if (selectedIds.has(el.id)) el.locked = lockTo ?? !el.locked;
    commit(next);
  }

  function deleteSelected() {
    if (!selected.length) return;
    const next = deepClone(templateRef.current);
    next.elements = next.elements.filter((e) => !selectedIds.has(e.id));

    for (const gid of Object.keys(next.groups || {})) {
      const still = next.elements.some((e) => e.groupId === gid);
      if (!still) delete next.groups[gid];
    }
    commit(next);
    clearSelection();
  }

  /** ---------- Drag from left panel into canvas ---------- */
  function onDragStartTool(e, toolType) {
    e.dataTransfer.setData("application/x-bltool", toolType);
    e.dataTransfer.effectAllowed = "copy";
  }

  function canvasPointMmFromClient(e) {
    const el = canvasRef.current;
    if (!el) return { x: 0, y: 0 };

    const rect = el.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;

    const xMm = xPx / (ui.scale * MM_TO_PX);
    const yMm = yPx / (ui.scale * MM_TO_PX);

    return { x: xMm, y: yMm };
  }

  function onCanvasDrop(e) {
    e.preventDefault();

    const toolType = e.dataTransfer.getData("application/x-bltool");
    if (!toolType) return;

    const { x: xMm, y: yMmRaw } = canvasPointMmFromClient(e);

    const elType =
      toolType === "Text"
        ? "text"
        : toolType === "LineH"
        ? "lineH"
        : toolType === "LineV"
        ? "lineV"
        : toolType === "Box"
        ? "box"
        : "table";

    const headerOffset = templateRef.current.header?.enabled
      ? templateRef.current.header.heightMm
      : 0;

    // ✅ y must respect header area
    const yMm = clamp(yMmRaw, headerOffset, paperMM.h - 10);
    const x = clamp(xMm, 0, paperMM.w - 10);

    const next = deepClone(templateRef.current);
    next.elements.push(makeElement(elType, x, yMm)); // ✅ only once
    commit(next);
  }

  /** ---------- Inline text edit ---------- */
  const [editingId, setEditingId] = useState(null);
  const [textDraft, setTextDraft] = useState("");
  const [textSel, setTextSel] = useState({ start: 0, end: 0 });
  const textAreaRef = useRef(null);

  // update template WITHOUT pushing history (smooth typing)
  function setTemplateSilent(mutator) {
    setTemplate((prev) => {
      const next = deepClone(prev);
      mutator(next);
      templateRef.current = next;
      return next;
    });
  }

  useEffect(() => {
    if (!editingId) return;
    const ta = textAreaRef.current;
    if (!ta) return;
    try {
      ta.setSelectionRange(textSel.start, textSel.end);
    } catch {}
  }, [textDraft, editingId, textSel]);

  /** ---------- Text measurer (auto-size) ---------- */
  function measureTextBoxPx({ text, style, maxWidthPx }) {
    const m = measureRef.current;
    if (!m) return { w: 160, h: 40 };

    const fs = style?.fontSize || 12;
    const fw = style?.fontWeight || 500;
    const ff = style?.fontFamily || "Inter, system-ui";
    const lh = style?.lineHeight ?? 1.2;
    const pad = style?.padding ?? 6;
    const align = style?.align || "left";
    const ls = style?.letterSpacing ?? 0;

    m.style.fontSize = fs + "px";
    m.style.fontWeight = String(fw);
    m.style.fontFamily = ff;
    m.style.lineHeight = String(lh);
    m.style.textAlign = align;
    m.style.letterSpacing = ls + "px";
    m.style.width = maxWidthPx ? maxWidthPx + "px" : "auto";
    m.style.padding = pad + "px";
    m.style.whiteSpace = "pre-wrap";
    m.style.wordBreak = "break-word";
    m.textContent = text || "";

    const rect = m.getBoundingClientRect();
    return { w: Math.ceil(rect.width), h: Math.ceil(rect.height) };
  }

  /** ---------- Move/Resize/Rotate helpers ---------- */
  function getPointerMM(e) {
    return canvasPointMmFromClient(e);
  }

  function selectedBoundsMm(elements, selSet) {
    const els = elements.filter(
      (x) => selSet.has(x.id) && !x.locked && !x.hidden
    );
    if (!els.length) return null;
    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const el of els) {
      x0 = Math.min(x0, el.x);
      y0 = Math.min(y0, el.y);
      x1 = Math.max(x1, el.x + el.w);
      y1 = Math.max(y1, el.y + el.h);
    }
    return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  function prepareSnapForSelection(selSet) {
    return {
      targets: buildSnapTargets(templateRef.current.elements, selSet),
      canvas: {
        x: [
          { axis: "x", v: 0, type: "edge" },
          { axis: "x", v: paperMM.w, type: "edge" },
          { axis: "x", v: paperMM.w / 2, type: "center" },
        ],
        y: [
          { axis: "y", v: 0, type: "edge" },
          { axis: "y", v: paperMM.h, type: "edge" },
          { axis: "y", v: paperMM.h / 2, type: "center" },
        ],
      },
    };
  }

  function startPan(e) {
    const stage = canvasStageRef.current;
    if (!stage) return;
    interactionRef.current.mode = "pan";
    interactionRef.current.pan = {
      x: e.clientX,
      y: e.clientY,
      sx: stage.scrollLeft,
      sy: stage.scrollTop,
    };
    e.preventDefault();
  }

  function startDragNow(e, id, selSetOverride) {
    interactionRef.current.mode = "drag";
    interactionRef.current.start = getPointerMM(e);
    interactionRef.current.startEls = deepClone(templateRef.current.elements);

    const selSet = selSetOverride || new Set(selectedIds);
    selSet.add(id);

    interactionRef.current.snap = prepareSnapForSelection(selSet);

    e.preventDefault();
    e.stopPropagation();
  }

  function startDrag(e, id) {
    if (activeTool === "hand") return startPan(e);

    const el = templateRef.current.elements.find((x) => x.id === id);
    if (!el || el.locked) return;

    if (!selectedIds.has(id) && !e.ctrlKey && !e.metaKey) setOnlySelected(id);
    else if ((e.ctrlKey || e.metaKey) && !selectedIds.has(id))
      toggleSelected(id);

    const isPlainClick = !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey;

    if (
      activeTool === "select" &&
      el.type === "text" &&
      !el.locked &&
      isPlainClick
    ) {
      pendingTextEditRef.current = {
        id: el.id,
        startClient: { x: e.clientX, y: e.clientY },
        startMm: getPointerMM(e),
      };
      pointerMovedRef.current = false;

      interactionRef.current.mode = "pending";
      interactionRef.current.pendingId = el.id;
      interactionRef.current.start = getPointerMM(e);
      interactionRef.current.startEls = deepClone(templateRef.current.elements);

      const selSet = new Set(selectedIds);
      selSet.add(id);
      interactionRef.current.snap = prepareSnapForSelection(selSet);

      e.preventDefault();
      e.stopPropagation();
      return;
    }

    startDragNow(e, id);
  }

  function startResize(e, id, handle) {
    const el = templateRef.current.elements.find((x) => x.id === id);
    if (!el || el.locked) return;

    if (!selectedIds.has(id)) setOnlySelected(id);

    interactionRef.current.mode = "resize";
    interactionRef.current.start = getPointerMM(e);
    interactionRef.current.startEls = deepClone(templateRef.current.elements);
    interactionRef.current.handle = handle;

    const selSet = new Set([id]);
    interactionRef.current.snap = prepareSnapForSelection(selSet);

    e.preventDefault();
    e.stopPropagation();
  }

  function startRotate(e, id) {
    const el = templateRef.current.elements.find((x) => x.id === id);
    if (!el || el.locked) return;

    if (!selectedIds.has(id)) setOnlySelected(id);

    const start = getPointerMM(e);
    const cx = el.x + el.w / 2;
    const cy = el.y + el.h / 2;
    const ang0 = (Math.atan2(start.y - cy, start.x - cx) * 180) / Math.PI;

    interactionRef.current.mode = "rotate";
    interactionRef.current.start = start;
    interactionRef.current.startEls = deepClone(templateRef.current.elements);
    interactionRef.current.rotate = {
      id,
      cx,
      cy,
      ang0,
      startRot: el.rotate || 0,
    };

    e.preventDefault();
    e.stopPropagation();
  }

  /** ---------- Marquee selection ---------- */
  function startMarquee(e) {
    if (activeTool === "hand") return startPan(e);
    if (e.target !== e.currentTarget) return; // ✅ safer

    const p = getPointerMM(e);
    interactionRef.current.mode = "marquee";
    interactionRef.current.start = p;
    interactionRef.current.marquee = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };

    if (!e.ctrlKey && !e.metaKey) clearSelection();
    e.preventDefault();
  }

  /** ---------- Table divider drag ---------- */
  function startTableColDrag(e, tableElId, colIdx) {
    const el = templateRef.current.elements.find((x) => x.id === tableElId);
    if (!el || el.locked || el.type !== "table") return;
    if (!selectedIds.has(el.id)) setOnlySelected(el.id);

    interactionRef.current.mode = "table-col";
    interactionRef.current.start = getPointerMM(e);
    interactionRef.current.startEls = deepClone(templateRef.current.elements);
    interactionRef.current.table = { id: tableElId, colIdx };
    e.preventDefault();
    e.stopPropagation();
  }

  function startTableRowDrag(e, tableElId, rowIdx) {
    const el = templateRef.current.elements.find((x) => x.id === tableElId);
    if (!el || el.locked || el.type !== "table") return;
    if (!selectedIds.has(el.id)) setOnlySelected(el.id);

    interactionRef.current.mode = "table-row";
    interactionRef.current.start = getPointerMM(e);
    interactionRef.current.startEls = deepClone(templateRef.current.elements);
    interactionRef.current.table = { id: tableElId, rowIdx };
    e.preventDefault();
    e.stopPropagation();
  }

  /** ---------- Global pointer move/up ---------- */
  useEffect(() => {
    function resetInteraction() {
      interactionRef.current.mode = null;
      interactionRef.current.start = null;
      interactionRef.current.startEls = null;
      interactionRef.current.handle = null;
      interactionRef.current.marquee = null;
      interactionRef.current.table = null;
      interactionRef.current.snap = null;
      interactionRef.current.rotate = null;
      interactionRef.current.pan = null;
      interactionRef.current.pendingId = null;
      setGuides({ x: null, y: null });
    }

    function onMove(e) {
      const mode = interactionRef.current.mode;
      if (!mode) return;

      if (mode === "pending") {
        const pending = pendingTextEditRef.current;
        if (!pending) return;

        const dxp = e.clientX - pending.startClient.x;
        const dyp = e.clientY - pending.startClient.y;
        const dist = Math.sqrt(dxp * dxp + dyp * dyp);

        if (dist >= DRAG_THRESHOLD_PX) {
          pointerMovedRef.current = true;
          interactionRef.current.mode = "drag";
        } else {
          return;
        }
      }

      const p = getPointerMM(e);
      const start = interactionRef.current.start;

      if (interactionRef.current.mode === "pan") {
        const stage = canvasStageRef.current;
        const pan = interactionRef.current.pan;
        if (!stage || !pan) return;
        const dx = e.clientX - pan.x;
        const dy = e.clientY - pan.y;
        stage.scrollLeft = pan.sx - dx;
        stage.scrollTop = pan.sy - dy;
        return;
      }

      if (interactionRef.current.mode === "marquee") {
        const m = interactionRef.current.marquee;
        m.x1 = p.x;
        m.y1 = p.y;
        interactionRef.current.marquee = m;

        const xMin = Math.min(m.x0, m.x1);
        const xMax = Math.max(m.x0, m.x1);
        const yMin = Math.min(m.y0, m.y1);
        const yMax = Math.max(m.y0, m.y1);

        const hit = new Set(selectedIds);
        for (const el of templateRef.current.elements) {
          if (el.hidden || el.locked) continue;
          const ex0 = el.x,
            ex1 = el.x + el.w,
            ey0 = el.y,
            ey1 = el.y + el.h;
          const overlap = !(
            ex1 < xMin ||
            ex0 > xMax ||
            ey1 < yMin ||
            ey0 > yMax
          );
          if (overlap) hit.add(el.id);
        }
        setSelectedIds(hit);
        return;
      }

      const dx = p.x - start.x;
      const dy = p.y - start.y;

      let guideX = null;
      let guideY = null;

      if (interactionRef.current.mode === "drag") {
        const startEls = interactionRef.current.startEls || [];
        const sel = new Set(selectedIds);

        const next = deepClone(templateRef.current);
        const startMap = new Map(startEls.map((x) => [x.id, x]));

        const bounds = selectedBoundsMm(startEls, sel);
        if (!bounds) return;

        let nx0 = bounds.x0 + dx;
        let ny0 = bounds.y0 + dy;
        let nx1 = bounds.x1 + dx;
        let ny1 = bounds.y1 + dy;
        const cx = (nx0 + nx1) / 2;
        const cy = (ny0 + ny1) / 2;

        if (ui.snap) {
          const snap = interactionRef.current.snap;
          const threshold = e.shiftKey ? 0.8 : ui.snapThreshold;

          const xCandidates = [
            ...(snap?.targets || []).filter((t) => t.axis === "x"),
            ...(snap?.canvas?.x || []),
          ];
          const yCandidates = [
            ...(snap?.targets || []).filter((t) => t.axis === "y"),
            ...(snap?.canvas?.y || []),
          ];

          const sLeft = snapValue(nx0, xCandidates, threshold);
          const sRight = snapValue(nx1, xCandidates, threshold);
          const sCenter = snapValue(cx, xCandidates, threshold);
          const bestX = [sLeft, sRight, sCenter].sort(
            (a, b) => a.delta - b.delta
          )[0];

          if (bestX.delta !== Infinity) {
            const target = bestX.snapped;
            if (bestX === sLeft) {
              const adj = target - nx0;
              nx0 += adj;
              nx1 += adj;
            } else if (bestX === sRight) {
              const adj = target - nx1;
              nx0 += adj;
              nx1 += adj;
            } else {
              const adj = target - cx;
              nx0 += adj;
              nx1 += adj;
            }
            guideX = target;
          }

          const sTop = snapValue(ny0, yCandidates, threshold);
          const sBottom = snapValue(ny1, yCandidates, threshold);
          const sCenterY = snapValue(cy, yCandidates, threshold);
          const bestY = [sTop, sBottom, sCenterY].sort(
            (a, b) => a.delta - b.delta
          )[0];

          if (bestY.delta !== Infinity) {
            const target = bestY.snapped;
            if (bestY === sTop) {
              const adj = target - ny0;
              ny0 += adj;
              ny1 += adj;
            } else if (bestY === sBottom) {
              const adj = target - ny1;
              ny0 += adj;
              ny1 += adj;
            } else {
              const adj = target - cy;
              ny0 += adj;
              ny1 += adj;
            }
            guideY = target;
          }
        }

        setGuides({ x: guideX, y: guideY });

        const finalDx = nx0 - bounds.x0;
        const finalDy = ny0 - bounds.y0;

        for (const el of next.elements) {
          if (!sel.has(el.id) || el.locked) continue;
          const s0 = startMap.get(el.id) || el;
          el.x = clamp(round2(s0.x + finalDx), 0, paperMM.w - 1);
          const headerOffset = templateRef.current.header?.enabled
            ? templateRef.current.header.heightMm
            : 0;

          el.y = clamp(round2(s0.y + finalDy), headerOffset, paperMM.h - 1);
        }

        setTemplateLive(next);
        return;
      }

      if (interactionRef.current.mode === "resize") {
        const id = [...selectedIds][0];
        const handle = interactionRef.current.handle;
        const startEls = interactionRef.current.startEls || [];
        const startEl = startEls.find((x) => x.id === id);
        if (!startEl) return;

        let x = startEl.x;
        let y = startEl.y;
        let w = startEl.w;
        let h = startEl.h;

        const minW = 8;
        const minH = 8;

        const isShift = e.shiftKey;
        const isText = startEl.type === "text";

        if (handle.includes("e")) w = clamp(startEl.w + dx, minW, paperMM.w);
        if (handle.includes("s")) h = clamp(startEl.h + dy, minH, paperMM.h);
        if (handle.includes("w")) {
          const newW = clamp(startEl.w - dx, minW, paperMM.w);
          x = startEl.x + (startEl.w - newW);
          w = newW;
        }
        if (handle.includes("n")) {
          const newH = clamp(startEl.h - dy, minH, paperMM.h);
          y = startEl.y + (startEl.h - newH);
          h = newH;
        }

        const next = deepClone(templateRef.current);
        const el = next.elements.find((xx) => xx.id === id);
        if (!el || el.locked) return;

        if (isShift && isText) {
          const sx = w / (startEl.w || 1);
          const sy = h / (startEl.h || 1);
          const scale = Math.max(0.2, Math.min(5, (sx + sy) / 2));
          const fs = el.style?.fontSize || 12;
          el.style.fontSize = Math.max(6, Math.round(fs * scale));
        }

        el.x = clamp(round2(x), 0, paperMM.w - 1);
        const headerOffset = templateRef.current.header?.enabled
          ? templateRef.current.header.heightMm
          : 0;

        el.y = clamp(round2(y), headerOffset, paperMM.h - 1);

        el.w = clamp(round2(w), 1, paperMM.w);
        el.h = clamp(round2(h), 1, paperMM.h);

        setTemplateLive(next);
        return;
      }

      if (interactionRef.current.mode === "rotate") {
        const rot = interactionRef.current.rotate;
        if (!rot) return;

        const { id, cx, cy, ang0, startRot } = rot;
        const ang = (Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI;
        let nextDeg = startRot + (ang - ang0);

        if (e.shiftKey) nextDeg = Math.round(nextDeg / 15) * 15;

        const next = deepClone(templateRef.current);
        const el = next.elements.find((x) => x.id === id);
        if (!el || el.locked) return;
        el.rotate = Math.round(nextDeg * 10) / 10;

        setTemplateLive(next);
        return;
      }

      // ✅ table resize independent of zoom (dx/dy are mm)
      if (interactionRef.current.mode === "table-col") {
        const { id, colIdx } = interactionRef.current.table || {};
        const startEls = interactionRef.current.startEls || [];
        const startEl = startEls.find((x) => x.id === id);
        if (!startEl) return;

        const next = deepClone(templateRef.current);
        const el = next.elements.find((x) => x.id === id);
        if (!el || el.type !== "table" || el.locked) return;

        const t = el.table;
        const minCol = 20;

        const deltaPx = dx * MM_TO_PX;
        t.colW[colIdx] = Math.max(
          minCol,
          (startEl.table.colW[colIdx] || 60) + deltaPx
        );

        const totalWpx = t.colW.reduce((a, b) => a + b, 0);
        el.w = Math.max(10, totalWpx / MM_TO_PX);

        setTemplateLive(next);
        return;
      }

      if (interactionRef.current.mode === "table-row") {
        const { id, rowIdx } = interactionRef.current.table || {};
        const startEls = interactionRef.current.startEls || [];
        const startEl = startEls.find((x) => x.id === id);
        if (!startEl) return;

        const next = deepClone(templateRef.current);
        const el = next.elements.find((x) => x.id === id);
        if (!el || el.type !== "table" || el.locked) return;

        const t = el.table;
        const minRow = 18;

        const deltaPx = dy * MM_TO_PX;
        t.rowH[rowIdx] = Math.max(
          minRow,
          (startEl.table.rowH[rowIdx] || 28) + deltaPx
        );

        const totalHpx = t.rowH.reduce((a, b) => a + b, 0) + 2;
        el.h = Math.max(10, totalHpx / MM_TO_PX);

        setTemplateLive(next);
        return;
      }
    }

    function onUp() {
      const mode = interactionRef.current.mode;
      if (!mode) return;

      if (mode === "pending") {
        const pending = pendingTextEditRef.current;
        const id = pending?.id;
        pendingTextEditRef.current = null;

        resetInteraction();

        if (!pointerMovedRef.current && id) {
          const el = templateRef.current.elements.find((x) => x.id === id);
          if (el && el.type === "text" && !el.locked) {
            setEditingId(id);
            setTextDraft(el.text || "");
            setTextSel({ start: 0, end: 0 });
          }
        }
        pointerMovedRef.current = false;
        return;
      }

      if (mode !== "marquee" && mode !== "pan")
        pushHistory(templateRef.current);

      resetInteraction();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    // eslint-disable-next-line
  }, [
    selectedIds,
    ui.snap,
    ui.snapThreshold,
    paperMM.w,
    paperMM.h,
    activeTool,
  ]);

  /** ---------- Keyboard shortcuts + spacebar pan ---------- */
  const [spaceDown, setSpaceDown] = useState(false);

  useEffect(() => {
    function onKeyDown(e) {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (e.code === "Space" && !spaceDown) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          setSpaceDown(true);
          setActiveTool("hand");
          e.preventDefault();
        }
      }

      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        mod &&
        (e.key.toLowerCase() === "y" ||
          (e.key.toLowerCase() === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return;
        deleteSelected();
      } else if (mod && e.key.toLowerCase() === "g") {
        e.preventDefault();
        groupSelected();
      } else if (mod && e.key.toLowerCase() === "u") {
        e.preventDefault();
        ungroupSelected();
      } else if (e.key === "Escape") {
        setEditingId(null);
        setActiveTool("select");
        setSpaceDown(false);
      }
    }

    function onKeyUp(e) {
      if (e.code === "Space") {
        setSpaceDown(false);
        setActiveTool("select");
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line
  }, [selectedIds, spaceDown]);

  /** ---------- Zoom with Ctrl+wheel ---------- */
  useEffect(() => {
    function onWheel(e) {
      const stage = canvasStageRef.current;
      if (!stage) return;
      if (!e.ctrlKey) return;
      e.preventDefault();

      const delta = e.deltaY > 0 ? -0.06 : 0.06;
      setUi((s) => ({
        ...s,
        scale: clamp(Math.round((s.scale + delta) * 100) / 100, 0.35, 2.0),
      }));
    }
    const stage = canvasStageRef.current;
    if (!stage) return;
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => stage.removeEventListener("wheel", onWheel);
  }, []);

  /** ---------- ✅ Print / Export PDF ---------- */
  function printTemplate() {
    try {
      const elementsHtml = renderElementsToHtml(templateRef.current.elements);

      const html = templateToPrintableHTML({
        wMm: paperMM.w,
        hMm: paperMM.h,
        elementsHtml,
        header: {
          enabled: templateRef.current.header?.enabled,
          heightMm: templateRef.current.header?.heightMm,
          src: headerLogo,
        },
      });

      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";

      const doPrint = async () => {
        const doc = iframe.contentDocument;
        if (!doc) return;

        try {
          if (doc.fonts?.ready) {
            await doc.fonts.ready;
          }

          await new Promise((r) => requestAnimationFrame(r));
          await new Promise((r) => setTimeout(r, 50));

          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error("Iframe print error:", e);
          toast("Print failed");
        } finally {
          setTimeout(() => {
            try {
              document.body.removeChild(iframe);
            } catch {}
          }, 1000);
        }
      };

      iframe.onload = () => setTimeout(doPrint, 30);

      document.body.appendChild(iframe);

      const doc = iframe.contentDocument;
      if (!doc) return;

      doc.open();
      doc.write(html);
      doc.close();

      // ✅ If onload doesn't fire, still print.
      setTimeout(() => {
        try {
          if (iframe.isConnected) doPrint();
        } catch {}
      }, 120);
    } catch (err) {
      console.error("Print failed:", err);
      toast("Print failed");
    }
  }

  function exportPDF() {
    printTemplate();
  }

  /** ---------- Alignment tools ---------- */
  function alignSelected(mode) {
    const ids = [...selectedIds];
    if (ids.length < 2) return toast("Select 2+ to align");

    const next = deepClone(templateRef.current);
    const items = next.elements.filter((e) => ids.includes(e.id) && !e.locked);
    if (!items.length) return;

    const left = Math.min(...items.map((e) => e.x));
    const right = Math.max(...items.map((e) => e.x + e.w));
    const top = Math.min(...items.map((e) => e.y));
    const bottom = Math.max(...items.map((e) => e.y + e.h));
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;

    for (const e of items) {
      if (mode === "left") e.x = left;
      if (mode === "right") e.x = right - e.w;
      if (mode === "top") e.y = top;
      if (mode === "bottom") e.y = bottom - e.h;
      if (mode === "centerX") e.x = cx - e.w / 2;
      if (mode === "centerY") e.y = cy - e.h / 2;
    }
    commit(next);
  }

  /** ---------- Inspector: update element fields ---------- */
  function updateEl(id, patch) {
    const next = deepClone(templateRef.current);
    const el = next.elements.find((x) => x.id === id);
    if (!el || el.locked) return;
    Object.assign(el, patch);
    commit(next);
  }

  function updateElStyle(id, patchStyle) {
    const next = deepClone(templateRef.current);
    const el = next.elements.find((x) => x.id === id);
    if (!el || el.locked) return;
    el.style = { ...(el.style || {}), ...(patchStyle || {}) };
    commit(next);
  }

  function updateTable(id, patch) {
    const next = deepClone(templateRef.current);
    const el = next.elements.find((x) => x.id === id);
    if (!el || el.type !== "table" || el.locked) return;
    el.table = { ...(el.table || {}), ...(patch || {}) };
    commit(next);
  }

  function updateTableCellStyle(id, cellK, patch) {
    const next = deepClone(templateRef.current);
    const el = next.elements.find((x) => x.id === id);
    if (!el || el.type !== "table" || el.locked) return;
    el.table.cellStyle = el.table.cellStyle || {};
    el.table.cellStyle[cellK] = {
      ...(el.table.cellStyle[cellK] || {}),
      ...(patch || {}),
    };
    commit(next);
  }

  /** ---------- Table: click cell + range + merge + bind ---------- */
  function tableCellClick(e, elId, r, c) {
    e.stopPropagation();
    const next = deepClone(templateRef.current);
    const el = next.elements.find((x) => x.id === elId);
    if (!el || el.type !== "table" || el.locked) return;

    setOnlySelected(elId);

    const t = el.table;
    const cell = { r, c };

    if (e.shiftKey && t.activeCell)
      t.range = normalizeRange(t.activeCell, cell);
    else t.range = null;

    t.activeCell = cell;

    commit(next);
  }

  function mergeSelectedCells() {
    if (!primarySelected || primarySelected.type !== "table") return;
    const t = primarySelected.table;
    if (!t?.range) return toast("Shift+Click another cell to select a range");
    if (!canMergeRange(t, t.range))
      return toast("Cannot merge: overlaps existing merge");

    const { r0, c0, r1, c1 } = t.range;
    const next = deepClone(templateRef.current);
    const el = next.elements.find((x) => x.id === primarySelected.id);
    if (!el || el.type !== "table") return;
    el.table.merges.push({ r0, c0, rs: r1 - r0 + 1, cs: c1 - c0 + 1 });
    el.table.range = null;
    commit(next);
    toast("Merged");
  }

  function unmergeCell() {
    if (!primarySelected || primarySelected.type !== "table") return;
    const t = primarySelected.table;
    if (!t?.activeCell) return;
    const { r, c } = t.activeCell;

    const next = deepClone(templateRef.current);
    const el = next.elements.find((x) => x.id === primarySelected.id);
    if (!el || el.type !== "table") return;

    const merges = el.table.merges || [];
    const m = findMergeAt(merges, r, c);
    if (!m) return toast("No merge at this cell");
    el.table.merges = merges.filter((x) => x !== m);
    commit(next);
    toast("Unmerged");
  }

  function bindActiveTableCellToColumn(col) {
    if (!primarySelected || primarySelected.type !== "table") return;
    const t = primarySelected.table;
    if (!t?.activeCell) return toast("Click a table cell first");
    const k = cellKey(t.activeCell.r, t.activeCell.c);
    const next = deepClone(templateRef.current);
    const el = next.elements.find((x) => x.id === primarySelected.id);
    if (!el || el.type !== "table") return;
    el.table.bindings = el.table.bindings || {};
    el.table.bindings[k] = { columnKey: col.key, label: col.label };
    commit(next);
    toast(`Bound to ${col.label}`);
  }

  /** ---------- Paper controls ---------- */
  function setPaper(id) {
    const p = PAPER_SIZES.find((x) => x.id === id);
    if (!p) return;
    const next = deepClone(templateRef.current);
    next.paper = { ...p, orientation: next.paper.orientation || "P" };
    commit(next);
  }

  function toggleOrientation() {
    const next = deepClone(templateRef.current);
    next.paper.orientation = next.paper.orientation === "P" ? "L" : "P";
    commit(next);
  }

  /** ---------- Sorted elements ---------- */
  const sortedElements = useMemo(() => {
    return [...template.elements].sort((a, b) => (a.z || 0) - (b.z || 0));
  }, [template.elements]);

  /** ---------- Marquee UI ---------- */
  const marquee = interactionRef.current.marquee;
  const marqueePx = useMemo(() => {
    if (!marquee) return null;
    const x0 = Math.min(marquee.x0, marquee.x1);
    const y0 = Math.min(marquee.y0, marquee.y1);
    const x1 = Math.max(marquee.x0, marquee.x1);
    const y1 = Math.max(marquee.y0, marquee.y1);
    return {
      left: x0 * MM_TO_PX * ui.scale,
      top: y0 * MM_TO_PX * ui.scale,
      width: (x1 - x0) * MM_TO_PX * ui.scale,
      height: (y1 - y0) * MM_TO_PX * ui.scale,
    };
  }, [marquee, ui.scale]);

  const guidePx = useMemo(() => {
    return {
      x: guides.x == null ? null : guides.x * MM_TO_PX * ui.scale,
      y: guides.y == null ? null : guides.y * MM_TO_PX * ui.scale,
    };
  }, [guides, ui.scale]);

  /** ---------- Layers list ---------- */
  const layerItems = useMemo(() => {
    return [...template.elements]
      .filter((e) => !e.hidden)
      .sort((a, b) => (b.z || 0) - (a.z || 0));
  }, [template.elements]);

  /** ---------- UI Components ---------- */
  function IconButton({ title, onClick, icon, danger, active }) {
    return (
      <button
        onClick={onClick}
        title={title}
        style={{
          ...styles.iconBtn,
          ...(danger ? styles.iconDanger : {}),
          ...(active ? styles.iconActive : {}),
        }}
      >
        <Icon name={icon} />
      </button>
    );
  }

  function ToolIcon({ name, icon, draggableType }) {
    return (
      <div
        draggable
        onDragStart={(e) => onDragStartTool(e, draggableType)}
        style={styles.toolIcon}
        title="Drag into canvas"
      >
        <Icon name={icon} />
        <div style={styles.toolIconLabel}>{name}</div>
      </div>
    );
  }

  function Tabs({ value, onChange, tabs }) {
    return (
      <div style={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              ...styles.tab,
              ...(value === t.id ? styles.tabActive : {}),
            }}
            title={t.title || t.label}
          >
            <Icon name={t.icon} size={15} />
            <span style={{ fontSize: 12, fontWeight: 800 }}>{t.label}</span>
          </button>
        ))}
      </div>
    );
  }

  /** ---------- Element renderer ---------- */
  function ElementView({ el }) {
    if (el.hidden) return null;

    const isSelected = selectedIds.has(el.id);
    const isHovered = hoverId === el.id;

    const left = el.x * MM_TO_PX * ui.scale;
    const top = el.y * MM_TO_PX * ui.scale;
    const width = el.w * MM_TO_PX * ui.scale;
    const height = el.h * MM_TO_PX * ui.scale;

    const baseBox = {
      position: "absolute",
      left,
      top,
      width,
      height,
      transform: `rotate(${el.rotate || 0}deg)`,
      transformOrigin: "center center",
      cursor: el.locked
        ? "not-allowed"
        : editingId === el.id
        ? "text"
        : activeTool === "hand"
        ? "grab"
        : "move",
      outline: isSelected
        ? "2px solid #2563eb"
        : isHovered
        ? "1px solid rgba(37,99,235,.55)"
        : "none",
      outlineOffset: 1,
      boxShadow: isSelected ? "0 0 0 3px rgba(37,99,235,.12)" : "none",
      zIndex: 10 + Math.floor(el.z || 0),
      userSelect: editingId === el.id ? "text" : "none",
    };

    const s = el.style || {};

    const selectionHandles =
      isSelected && !el.locked ? (
        <ResizeHandles id={el.id} w={width} h={height} />
      ) : null;

    const commonEvents = {
      onPointerDown: (e) => {
        if (editingId === el.id) return;
        startDrag(e, el.id);
      },
      onMouseEnter: () => setHoverId(el.id),
      onMouseLeave: () => setHoverId(null),
      onDoubleClick: (e) => {
        if (el.type !== "text") return;
        e.stopPropagation();
        if (el.locked) return;
        setEditingId(el.id);
        setTextDraft(el.text || "");
        setTextSel({ start: 0, end: 0 });
      },
    };

    if (el.type === "text") {
      // ✅ FIX: Apply border/bg for TEXT element in canvas
      const bw = Number(s.borderWidth ?? 0);
      const frameBorder =
        bw > 0
          ? `${bw}px ${s.borderStyle || "solid"} ${s.borderColor || "#111827"}`
          : "none";

      const frame = {
        width: "100%",
        height: "100%",
        background: s.bg || "transparent",
        border: frameBorder,
        borderRadius: (s.borderRadius || 0) * ui.scale,
        overflow: "hidden",
        display: "flex",
        alignItems:
          s.vAlign === "middle"
            ? "center"
            : s.vAlign === "bottom"
            ? "flex-end"
            : "flex-start",
      };

      const contentStyle = {
        width: "100%",
        maxHeight: "100%",
        boxSizing: "border-box",
        padding: (s.padding ?? 6) * ui.scale,
        color: s.color || "#0f172a",
        fontSize: (s.fontSize || 12) * ui.scale,
        fontWeight: s.fontWeight || 500,
        fontFamily: s.fontFamily || "Inter, system-ui",
        lineHeight: s.lineHeight ?? 1.2,
        letterSpacing: (s.letterSpacing ?? 0) * ui.scale,
        textAlign: s.align || "left",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        overflow: "hidden",
      };

      return (
        <div style={baseBox} {...commonEvents}>
          <div style={frame}>
            {editingId === el.id ? (
              <textarea
                ref={textAreaRef}
                autoFocus
                value={textDraft}
                onChange={(e) => {
                  const start = e.target.selectionStart ?? 0;
                  const end = e.target.selectionEnd ?? 0;
                  setTextDraft(e.target.value);
                  setTextSel({ start, end });

                  setTemplateSilent((next) => {
                    const te = next.elements.find((x) => x.id === el.id);
                    if (!te) return;
                    te.text = e.target.value;

                    if (te.textMode === "auto") {
                      const maxWpx =
                        (te.maxWidthMm || 120) * MM_TO_PX * ui.scale;
                      const { w, h } = measureTextBoxPx({
                        text: te.text,
                        style: te.style,
                        maxWidthPx: maxWpx,
                      });
                      const wMm = w / (MM_TO_PX * ui.scale);
                      const hMm = h / (MM_TO_PX * ui.scale);
                      te.w = clamp(round2(wMm), 12, paperMM.w);
                      te.h = clamp(round2(hMm), 8, paperMM.h);
                    }
                  });
                }}
                onSelect={(e) => {
                  const start = e.target.selectionStart ?? 0;
                  const end = e.target.selectionEnd ?? 0;
                  setTextSel({ start, end });
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    const next = deepClone(templateRef.current);
                    const te = next.elements.find((x) => x.id === el.id);
                    if (te) te.text = textDraft;
                    commit(next);
                    setEditingId(null);
                    toast("Text updated");
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    const original =
                      templateRef.current.elements.find((x) => x.id === el.id)
                        ?.text || "";
                    setTextDraft(original);
                    setEditingId(null);
                  }
                }}
                onBlur={() => {
                  const next = deepClone(templateRef.current);
                  const te = next.elements.find((x) => x.id === el.id);
                  if (te) te.text = textDraft;
                  commit(next);
                  setEditingId(null);
                }}
                style={{
                  ...contentStyle,
                  height: "100%",
                  minHeight: "100%",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  background: "transparent",
                }}
              />
            ) : (
              <div style={contentStyle}>{el.text}</div>
            )}
          </div>
          {selectionHandles}
        </div>
      );
    }

    if (el.type === "box") {
      const boxStyle = {
        background: s.bg || "transparent",
        border: `${s.borderWidth ?? 1}px ${s.borderStyle || "solid"} ${
          s.borderColor || "#111827"
        }`,
        borderRadius: (s.borderRadius || 0) * ui.scale,
        width: "100%",
        height: "100%",
      };
      return (
        <div style={baseBox} {...commonEvents}>
          <div style={boxStyle} />
          {selectionHandles}
        </div>
      );
    }

    if (el.type === "lineH") {
      const stroke = s.stroke || "#111827";
      const sw = (s.strokeWidth || 2) * ui.scale;
      return (
        <div style={baseBox} {...commonEvents}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "100%",
                height: sw,
                background: stroke,
                borderRadius: 999,
              }}
            />
          </div>
          {selectionHandles}
        </div>
      );
    }

    if (el.type === "lineV") {
      const stroke = s.stroke || "#111827";
      const sw = (s.strokeWidth || 2) * ui.scale;
      return (
        <div style={baseBox} {...commonEvents}>
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                height: "100%",
                width: sw,
                background: stroke,
                borderRadius: 999,
              }}
            />
          </div>
          {selectionHandles}
        </div>
      );
    }

    if (el.type === "table") {
      return (
        <div
          style={{
            ...baseBox,
            cursor: el.locked
              ? "not-allowed"
              : activeTool === "hand"
              ? "grab"
              : "move",
          }}
          {...commonEvents}
        >
          <TableView el={el} />
          {selectionHandles}
        </div>
      );
    }

    return null;
  }

  function ResizeHandles({ id, w, h }) {
    const size = 10;
    const half = size / 2;

    const handles = [
      { k: "nw", x: 0, y: 0 },
      { k: "n", x: w / 2, y: 0 },
      { k: "ne", x: w, y: 0 },
      { k: "e", x: w, y: h / 2 },
      { k: "se", x: w, y: h },
      { k: "s", x: w / 2, y: h },
      { k: "sw", x: 0, y: h },
      { k: "w", x: 0, y: h / 2 },
    ];

    return (
      <>
        <div
          onPointerDown={(e) => startRotate(e, id)}
          style={{
            position: "absolute",
            left: w / 2 - 7,
            top: -28,
            width: 14,
            height: 14,
            borderRadius: 999,
            border: "2px solid #2563eb",
            background: "#fff",
            cursor: "grab",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Rotate (Shift: snap 15°)"
        >
          <Icon name="rotate" size={12} />
        </div>
        <div
          style={{
            position: "absolute",
            left: w / 2,
            top: -14,
            width: 1,
            height: 14,
            background: "rgba(37,99,235,.5)",
          }}
        />

        {handles.map((p) => (
          <div
            key={p.k}
            onPointerDown={(e) => startResize(e, id, p.k)}
            style={{
              position: "absolute",
              left: p.x - half,
              top: p.y - half,
              width: size,
              height: size,
              background: "#fff",
              border: "2px solid #2563eb",
              borderRadius: 999,
              cursor:
                p.k === "n" || p.k === "s"
                  ? "ns-resize"
                  : p.k === "e" || p.k === "w"
                  ? "ew-resize"
                  : p.k === "ne" || p.k === "sw"
                  ? "nesw-resize"
                  : "nwse-resize",
              zIndex: 9999,
            }}
          />
        ))}
      </>
    );
  }

  function TableView({ el }) {
    const t = el.table;
    const rows = t.rows;
    const cols = t.cols;
    const merges = t.merges || [];
    const bindings = t.bindings || {};
    const cellStyle = t.cellStyle || {};
    const active = t.activeCell;
    const range = t.range;

    const totalW = t.colW.reduce((a, b) => a + b, 0) || 1;
    const totalH = t.rowH.reduce((a, b) => a + b, 0) || 1;
    const colPct = t.colW.map((w) => (w / totalW) * 100);
    const rowPct = t.rowH.map((h) => (h / totalH) * 100);

    const border = `${t.borderWidth ?? 1}px solid ${
      t.borderColor || "#111827"
    }`;

    const showCellSelected = (r, c) =>
      active && active.r === r && active.c === c;
    const inRange = (r, c) => {
      if (!range) return false;
      return r >= range.r0 && r <= range.r1 && c >= range.c0 && c <= range.c1;
    };

    const xOffsets = [];
    let acc = 0;
    for (let c = 0; c < cols; c++) {
      acc += colPct[c];
      xOffsets.push(acc);
    }
    const yOffsets = [];
    let accY = 0;
    for (let r = 0; r < rows; r++) {
      accY += rowPct[r];
      yOffsets.push(accY);
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          border,
          background: "#fff",
          position: "relative",
        }}
      >
        <table
          style={{
            width: "100%",
            height: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            fontSize: (t.fontSize || 11) * ui.scale,
          }}
        >
          <colgroup>
            {colPct.map((p, i) => (
              <col key={i} style={{ width: `${p}%` }} />
            ))}
          </colgroup>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} style={{ height: `${rowPct[r]}%` }}>
                {Array.from({ length: cols }).map((__, c) => {
                  if (isCellCoveredByAnotherMerge(merges, r, c)) return null;
                  const m = findMergeAt(merges, r, c);
                  const rs = m ? m.rs : 1;
                  const cs = m ? m.cs : 1;

                  const b = bindings[cellKey(r, c)];
                  const label = b?.label
                    ? b.label
                    : b?.columnKey
                    ? `{{${b.columnKey}}}`
                    : "";

                  const csx = cellStyle[cellKey(r, c)] || {};
                  const cellPad =
                    (csx.padding ?? t.cellPadding ?? 6) * ui.scale;
                  const cellBg =
                    csx.bg ?? (inRange(r, c) ? "rgba(37,99,235,.08)" : "#fff");
                  const cellColor = csx.color ?? "#0f172a";
                  const cellFs = (csx.fontSize ?? t.fontSize ?? 11) * ui.scale;
                  const cellFw = csx.fontWeight ?? 600;
                  const cellAlign = csx.align ?? "left";
                  const cellV = csx.vAlign ?? "top";
                  const cellBc = csx.borderColor ?? t.gridColor ?? "#111827";
                  const cellBw = csx.borderWidth ?? t.gridWidth ?? 1;

                  const selectedBorder = showCellSelected(r, c)
                    ? "2px solid #2563eb"
                    : `${cellBw}px solid ${cellBc}`;

                  return (
                    <td
                      key={c}
                      rowSpan={rs}
                      colSpan={cs}
                      onPointerDown={(e) => tableCellClick(e, el.id, r, c)}
                      style={{
                        border: selectedBorder,
                        padding: cellPad,
                        verticalAlign: cellV,
                        background: cellBg,
                        cursor: "cell",
                        userSelect: "none",
                        color: cellColor,
                        fontSize: cellFs,
                        fontWeight: cellFw,
                        textAlign: cellAlign,
                      }}
                    >
                      <div
                        style={{
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {label}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {!el.locked &&
          xOffsets.slice(0, -1).map((pct, idx) => (
            <div
              key={"c" + idx}
              onPointerDown={(e) => startTableColDrag(e, el.id, idx)}
              style={{
                position: "absolute",
                left: `${pct}%`,
                top: 0,
                height: "100%",
                width: 12,
                transform: "translateX(-6px)",
                cursor: "col-resize",
                zIndex: 50,
              }}
              title="Drag to resize column"
            />
          ))}

        {!el.locked &&
          yOffsets.slice(0, -1).map((pct, idx) => (
            <div
              key={"r" + idx}
              onPointerDown={(e) => startTableRowDrag(e, el.id, idx)}
              style={{
                position: "absolute",
                top: `${pct}%`,
                left: 0,
                width: "100%",
                height: 12,
                transform: "translateY(-6px)",
                cursor: "row-resize",
                zIndex: 50,
              }}
              title="Drag to resize row"
            />
          ))}
      </div>
    );
  }

  /** ---------- Bottom toolbar controls ---------- */
  function zoomIn() {
    setUi((s) => ({
      ...s,
      scale: clamp(Math.round((s.scale + 0.1) * 100) / 100, 0.35, 2.0),
    }));
  }
  function zoomOut() {
    setUi((s) => ({
      ...s,
      scale: clamp(Math.round((s.scale - 0.1) * 100) / 100, 0.35, 2.0),
    }));
  }
  function zoomReset() {
    setUi((s) => ({ ...s, scale: 1 }));
  }

  /** ---------- Render ---------- */
  return (
    <div ref={containerRef} style={styles.page}>
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

      <style jsx global>{`
        html,
        body {
          height: 100%;
          overflow: hidden;
        }
        @media print {
          .blc-ui,
          .blc-rulers,
          .blc-guides,
          .blc-grid,
          .blc-marquee,
          .blc-bottombar {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
        }
      `}</style>

      <div className="blc-ui" style={styles.topbar}>
        <div style={styles.brand}>
          <div style={styles.brandDot} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1 }}>
              BL Creator
            </div>
            <div style={{ fontSize: 11, opacity: 0.65, lineHeight: 1.1 }}>
              Figma-like • Print-ready
            </div>
          </div>

          <div style={styles.sep} />

          <select
            value={template.paper.id}
            onChange={(e) => setPaper(e.target.value)}
            style={styles.select}
          >
            {PAPER_SIZES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.w}×{p.h}mm)
              </option>
            ))}
          </select>

          <button
            onClick={toggleOrientation}
            style={styles.softBtn}
            title="Toggle orientation"
          >
            {template.paper.orientation === "P" ? "P" : "L"}
          </button>
        </div>

        <div style={styles.topActions}>
          <IconButton title="Undo (Ctrl+Z)" icon="undo" onClick={undo} />
          <IconButton title="Redo (Ctrl+Y)" icon="redo" onClick={redo} />

          <div style={styles.sep} />

          <IconButton
            title="Group (Ctrl+G)"
            icon="group"
            onClick={groupSelected}
          />
          <IconButton
            title="Ungroup (Ctrl+U)"
            icon="ungroup"
            onClick={ungroupSelected}
          />
          <IconButton
            title="Lock"
            icon="lock"
            onClick={() => toggleLockSelected(true)}
          />
          <IconButton
            title="Unlock"
            icon="unlock"
            onClick={() => toggleLockSelected(false)}
          />
          <IconButton
            title="Delete"
            icon="trash"
            danger
            onClick={deleteSelected}
          />

          <div style={styles.sep} />

          <IconButton title="Save (local)" icon="save" onClick={saveLocal} />
          <IconButton title="Load (local)" icon="folder" onClick={loadLocal} />
          <IconButton
            title="Export JSON"
            icon="download"
            onClick={exportJSON}
          />
          <label style={styles.iconBtn} title="Import JSON">
            <Icon name="upload" />
            <input
              type="file"
              accept="application/json"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJSONFile(f);
                e.target.value = "";
              }}
            />
          </label>
          <IconButton
            title="DB Fields (tab)"
            icon="db"
            onClick={() => setRightTab("fields")}
          />

          <div style={styles.sep} />

          <IconButton title="Print" icon="print" onClick={printTemplate} />
          <button
            onClick={exportPDF}
            style={styles.softBtn}
            title="PDF (print to PDF)"
          >
            PDF
          </button>
        </div>
      </div>

      <div style={styles.body}>
        <div className="blc-ui" style={styles.left}>
          <Tabs
            value={leftTab}
            onChange={setLeftTab}
            tabs={[
              { id: "elements", label: "Elements", icon: "tabs" },
              { id: "arrange", label: "Arrange", icon: "mag" },
            ]}
          />

          {leftTab === "elements" ? (
            <div style={styles.leftSection}>
              <div style={styles.toolsRow}>
                <ToolIcon name="Text" icon="text" draggableType="Text" />
                <ToolIcon name="Box" icon="box" draggableType="Box" />
                <ToolIcon name="H" icon="lineH" draggableType="LineH" />
                <ToolIcon name="V" icon="lineV" draggableType="LineV" />
                <ToolIcon name="Table" icon="table" draggableType="Table" />
              </div>

              <div style={styles.divider} />

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button
                  style={{
                    ...styles.pill,
                    ...(activeTool === "select" ? styles.pillActive : {}),
                  }}
                  onClick={() => setActiveTool("select")}
                  title="Select"
                >
                  <Icon name="cursor" />
                </button>
                <button
                  style={{
                    ...styles.pill,
                    ...(activeTool === "hand" ? styles.pillActive : {}),
                  }}
                  onClick={() => setActiveTool("hand")}
                  title="Hand (Space)"
                >
                  <Icon name="hand" />
                </button>
              </div>

              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  opacity: 0.7,
                  lineHeight: 1.2,
                }}
              >
                Tip: Single click text to edit (don’t drag). Double click also
                works.
              </div>
            </div>
          ) : (
            <div style={styles.leftSection}>
              <div style={styles.iconGrid}>
                <button
                  style={styles.iconPill}
                  title="Align Left"
                  onClick={() => alignSelected("left")}
                >
                  <Icon name="alignLeft" />
                </button>
                <button
                  style={styles.iconPill}
                  title="Center X"
                  onClick={() => alignSelected("centerX")}
                >
                  <Icon name="alignCenter" />
                </button>
                <button
                  style={styles.iconPill}
                  title="Align Right"
                  onClick={() => alignSelected("right")}
                >
                  <Icon name="alignRight" />
                </button>
                <button
                  style={styles.iconPill}
                  title="Align Top"
                  onClick={() => alignSelected("top")}
                >
                  <Icon name="alignTop" />
                </button>
                <button
                  style={styles.iconPill}
                  title="Center Y"
                  onClick={() => alignSelected("centerY")}
                >
                  <Icon name="alignMiddle" />
                </button>
                <button
                  style={styles.iconPill}
                  title="Align Bottom"
                  onClick={() => alignSelected("bottom")}
                >
                  <Icon name="alignBottom" />
                </button>

                <button
                  style={styles.iconPill}
                  title="Bring to Front"
                  onClick={bringToFront}
                >
                  <Icon name="front" />
                </button>
                <button
                  style={styles.iconPill}
                  title="Send to Back"
                  onClick={sendToBack}
                >
                  <Icon name="back" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={styles.center}>
          {ui.showRulers ? (
            <div className="blc-ui blc-rulers" style={styles.rulers}>
              <div style={styles.rulerTop}>
                <Ruler axis="x" mm={paperMM.w} scale={ui.scale} />
              </div>
              <div style={styles.rulerLeft}>
                <Ruler axis="y" mm={paperMM.h} scale={ui.scale} />
              </div>
            </div>
          ) : null}

          <div ref={canvasStageRef} style={styles.canvasStage}>
            <div
              ref={pageRef} // ✅ pageRef added
              className={ui.showGrid ? "blc-grid" : ""}
              style={{
                ...styles.canvas,
                width: paperPX.w,
                height: paperPX.h,
                background: "#fff",
                ...(ui.showGrid ? styles.gridBg : {}),
              }}
              onPointerDown={startMarquee}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onCanvasDrop}
              onClick={() => {
                if (editingId) return;
                clearSelection();
              }}
            >
              {(guidePx.x != null || guidePx.y != null) && (
                <div
                  className="blc-ui blc-guides"
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                  }}
                >
                  {guidePx.x != null && (
                    <div
                      style={{
                        position: "absolute",
                        left: guidePx.x,
                        top: 0,
                        bottom: 0,
                        width: 1,
                        background: "rgba(37,99,235,.65)",
                      }}
                    />
                  )}
                  {guidePx.y != null && (
                    <div
                      style={{
                        position: "absolute",
                        top: guidePx.y,
                        left: 0,
                        right: 0,
                        height: 1,
                        background: "rgba(37,99,235,.65)",
                      }}
                    />
                  )}
                </div>
              )}

              {template.header?.enabled && headerLogo && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: paperPX.w,
                    height: template.header.heightMm * MM_TO_PX * ui.scale,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fff",
                    borderBottom: "1px solid #e5e7eb",
                    zIndex: 2,
                    pointerEvents: "none", // ✅ IMPORTANT
                  }}
                >
                  <img
                    src={headerLogo}
                    alt="Header"
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}

              {sortedElements.map((el) => (
                <ElementView key={el.id} el={el} />
              ))}

              {marqueePx ? (
                <div
                  className="blc-ui blc-marquee"
                  style={{
                    position: "absolute",
                    ...marqueePx,
                    border: "1px dashed rgba(37,99,235,.9)",
                    background: "rgba(37,99,235,.08)",
                    pointerEvents: "none",
                  }}
                />
              ) : null}
            </div>
          </div>

          <div className="blc-ui blc-bottombar" style={styles.bottomBar}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <button
                style={styles.bottomBtn}
                title="Grid"
                onClick={() => setUi((s) => ({ ...s, showGrid: !s.showGrid }))}
              >
                <Icon name="grid" />
              </button>
              <button
                style={styles.bottomBtn}
                title="Rulers"
                onClick={() =>
                  setUi((s) => ({ ...s, showRulers: !s.showRulers }))
                }
              >
                <Icon name="ruler" />
              </button>
              <button
                style={styles.bottomBtn}
                title="Snap"
                onClick={() => setUi((s) => ({ ...s, snap: !s.snap }))}
              >
                <Icon name="mag" />
              </button>

              <div style={styles.bottomPill}>
                <span style={{ fontSize: 11, fontWeight: 900, opacity: 0.7 }}>
                  Zoom
                </span>
                <button
                  style={styles.bottomMini}
                  onClick={zoomOut}
                  title="Zoom out"
                >
                  –
                </button>
                <button
                  style={styles.bottomMini}
                  onClick={zoomReset}
                  title="Reset"
                >
                  {Math.round(ui.scale * 100)}%
                </button>
                <button
                  style={styles.bottomMini}
                  onClick={zoomIn}
                  title="Zoom in"
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.7 }}>
              {paperMM.w}×{paperMM.h}mm • {ui.snap ? "Snap" : "No snap"} •{" "}
              {activeTool === "hand" ? "Hand" : "Select"}
            </div>
          </div>
        </div>

        <div className="blc-ui" style={styles.right}>
          <Tabs
            value={rightTab}
            onChange={setRightTab}
            tabs={[
              { id: "inspect", label: "Inspect", icon: "mag" },
              { id: "layers", label: "Layers", icon: "tabs" },
              { id: "fields", label: "Fields", icon: "db" },
            ]}
          />

          {rightTab === "layers" ? (
            <div style={styles.panelBody}>
              <div style={styles.layers}>
                {layerItems.length === 0 ? (
                  <div style={{ fontSize: 12, opacity: 0.6 }}>No elements</div>
                ) : (
                  layerItems.map((el) => {
                    const isSel = selectedIds.has(el.id);
                    return (
                      <div
                        key={el.id}
                        style={{
                          ...styles.layerRow,
                          ...(isSel ? styles.layerRowSel : {}),
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (e.ctrlKey || e.metaKey) toggleSelected(el.id);
                          else setOnlySelected(el.id);
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            minWidth: 0,
                          }}
                        >
                          <span style={{ opacity: 0.85 }}>
                            <Icon
                              name={
                                el.type === "lineH"
                                  ? "lineH"
                                  : el.type === "lineV"
                                  ? "lineV"
                                  : el.type
                              }
                              size={16}
                            />
                          </span>
                          <div style={{ minWidth: 0 }}>
                            <div style={styles.layerTitle}>
                              {el.type.toUpperCase()}{" "}
                              <span style={{ opacity: 0.55, fontWeight: 700 }}>
                                #{el.id.slice(-4)}
                              </span>
                            </div>
                            <div style={styles.layerSub}>
                              {round2(el.x)}mm, {round2(el.y)}mm
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEl(el.id, { locked: !el.locked });
                          }}
                          style={styles.miniBtn}
                          title={el.locked ? "Unlock" : "Lock"}
                        >
                          <Icon
                            name={el.locked ? "lock" : "unlock"}
                            size={15}
                          />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {rightTab === "fields" ? (
            <div style={styles.panelBody}>
              <div style={styles.columns}>
                {columns.map((c) => (
                  <button
                    key={c.key}
                    style={styles.colBtn}
                    onClick={() => {
                      if (primarySelected?.type === "text") {
                        updateEl(primarySelected.id, {
                          text: `${primarySelected.text || ""} {{${c.key}}}`,
                        });
                        toast(`Inserted {{${c.key}}}`);
                        return;
                      }
                      if (primarySelected?.type === "table") {
                        bindActiveTableCellToColumn(c);
                        return;
                      }
                      toast("Select Text/Table");
                    }}
                    title="Text: insert • Table: bind active cell"
                  >
                    <div style={{ fontSize: 12, fontWeight: 900 }}>
                      {c.label}
                    </div>
                    <div
                      style={{ fontSize: 11, opacity: 0.7 }}
                    >{`{{${c.key}}}`}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {rightTab === "inspect" ? (
            <div style={styles.panelBody}>
              <div style={styles.inspector}>
                {!primarySelected ? (
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    Select an element to edit its properties.
                  </div>
                ) : (
                  <Inspector
                    el={primarySelected}
                    header={template.header}
                    onUpdateHeader={(patch) => {
                      const next = JSON.parse(
                        JSON.stringify(templateRef.current)
                      );
                      next.header = { ...(next.header || {}), ...patch };
                      commit(next);
                    }}
                    onPatch={(p) => updateEl(primarySelected.id, p)}
                    onStyle={(p) => updateElStyle(primarySelected.id, p)}
                    onTable={(p) => updateTable(primarySelected.id, p)}
                    onCellStyle={(cellK, p) =>
                      updateTableCellStyle(primarySelected.id, cellK, p)
                    }
                    columns={columns}
                    onBindCell={bindActiveTableCellToColumn}
                    onMerge={mergeSelectedCells}
                    onUnmerge={unmergeCell}
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {toastMsg ? <div style={styles.toast}>{toastMsg}</div> : null}
    </div>
  );
}

/** ---------- Inspector component ---------- */
function Inspector({
  el,
  header,
  onUpdateHeader,
  onPatch,
  onStyle,
  onTable,
  onCellStyle,
  columns,
  onBindCell,
  onMerge,
  onUnmerge,
}) {
  const s = el.style || {};
  const isTable = el.type === "table";
  const isLine = el.type === "lineH" || el.type === "lineV";
  const isText = el.type === "text";

  const t = el.table;
  const activeCellKey =
    isTable && t?.activeCell ? `${t.activeCell.r},${t.activeCell.c}` : null;
  const cellSX =
    (isTable && activeCellKey && t?.cellStyle?.[activeCellKey]) || {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={stylesKV.block}>
        <div style={stylesKV.row}>
          <KV label="X (mm)">
            <Num value={el.x} onChange={(v) => onPatch({ x: v })} />
          </KV>
          <KV label="Y (mm)">
            <Num value={el.y} onChange={(v) => onPatch({ y: v })} />
          </KV>
        </div>
        <div style={stylesKV.row}>
          <KV label="W (mm)">
            <Num value={el.w} onChange={(v) => onPatch({ w: v })} />
          </KV>
          <KV label="H (mm)">
            <Num value={el.h} onChange={(v) => onPatch({ h: v })} />
          </KV>
        </div>
        <div style={stylesKV.row}>
          <KV label="Rotate">
            <Num
              value={el.rotate || 0}
              step={1}
              onChange={(v) => onPatch({ rotate: v })}
            />
          </KV>
          <KV label="Radius">
            <Num
              value={s.borderRadius || 0}
              step={1}
              onChange={(v) => onStyle({ borderRadius: v })}
            />
          </KV>
        </div>
      </div>
      <div style={stylesKV.block}>
        <div style={stylesKV.title}>Header</div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          <input
            type="checkbox"
            checked={header?.enabled ?? true}
            onChange={(e) => {
              onUpdateHeader({ enabled: e.target.checked });
            }}
          />
          Show Header Image
        </label>

        {header?.enabled && (
          <div style={{ marginTop: 10 }}>
            <KV label="Height (mm)">
              <Num
                value={header?.heightMm ?? 25}
                step={1}
                min={10}
                max={60}
                onChange={(v) => onUpdateHeader({ heightMm: v })}
              />
            </KV>
          </div>
        )}
      </div>

      {isText ? (
        <div style={stylesKV.block}>
          <div style={stylesKV.title}>Text Mode</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onPatch({ textMode: "fixed" })}
              style={{
                ...stylesKV.chip,
                ...(el.textMode !== "auto" ? stylesKV.chipActive : {}),
              }}
            >
              Fixed
            </button>
            <button
              onClick={() => onPatch({ textMode: "auto" })}
              style={{
                ...stylesKV.chip,
                ...(el.textMode === "auto" ? stylesKV.chipActive : {}),
              }}
            >
              Auto-size
            </button>
          </div>
          {el.textMode === "auto" ? (
            <div
              style={{
                marginTop: 8,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <KV label="Max W (mm)">
                <Num
                  value={el.maxWidthMm ?? 120}
                  step={1}
                  min={20}
                  onChange={(v) => onPatch({ maxWidthMm: v })}
                />
              </KV>
              <div />
            </div>
          ) : null}
          <div style={{ marginTop: 8, fontSize: 11, opacity: 0.7 }}>
            Tip: single click to edit. Shift-resize scales font.
          </div>
        </div>
      ) : null}

      {!isLine ? (
        <div style={stylesKV.block}>
          <div style={stylesKV.title}>Style</div>
          <div style={stylesKV.row}>
            <KV label="Text">
              <Color
                value={s.color || "#0f172a"}
                onChange={(v) => onStyle({ color: v })}
              />
            </KV>
            <KV label="BG">
              <Color
                value={s.bg || "#ffffff"}
                onChange={(v) => onStyle({ bg: v })}
              />
            </KV>
          </div>
          <div style={stylesKV.row}>
            <KV label="Border">
              <Color
                value={s.borderColor || "#111827"}
                onChange={(v) => onStyle({ borderColor: v })}
              />
            </KV>
            <KV label="BW">
              <Num
                value={s.borderWidth ?? 1}
                step={1}
                onChange={(v) => onStyle({ borderWidth: v })}
              />
            </KV>
          </div>
          <div style={stylesKV.row}>
            <KV label="B Style">
              <select
                value={s.borderStyle || "solid"}
                onChange={(e) => onStyle({ borderStyle: e.target.value })}
                style={stylesKV.select}
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </KV>
            <KV label=" ">{/* spacer */}</KV>
          </div>
        </div>
      ) : null}

      {isLine ? (
        <div style={stylesKV.block}>
          <div style={stylesKV.title}>Line</div>
          <div style={stylesKV.row}>
            <KV label="Stroke">
              <Color
                value={s.stroke || "#111827"}
                onChange={(v) => onStyle({ stroke: v })}
              />
            </KV>
            <KV label="Width">
              <Num
                value={s.strokeWidth || 2}
                step={1}
                onChange={(v) => onStyle({ strokeWidth: v })}
              />
            </KV>
          </div>
        </div>
      ) : null}

      {!isLine ? (
        <div style={stylesKV.block}>
          <div style={stylesKV.title}>Typography</div>
          <div style={stylesKV.row}>
            <KV label="Size">
              <Num
                value={s.fontSize || 12}
                step={1}
                onChange={(v) => onStyle({ fontSize: v })}
              />
            </KV>
            <KV label="Weight">
              <select
                value={s.fontWeight || 500}
                onChange={(e) =>
                  onStyle({ fontWeight: Number(e.target.value) })
                }
                style={stylesKV.select}
              >
                {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </KV>
          </div>

          <div style={stylesKV.row}>
            <KV label="Align">
              <select
                value={s.align || "left"}
                onChange={(e) => onStyle({ align: e.target.value })}
                style={stylesKV.select}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </KV>
            <KV label="V Align">
              <select
                value={s.vAlign || "top"}
                onChange={(e) => onStyle({ vAlign: e.target.value })}
                style={stylesKV.select}
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </KV>
          </div>

          <div style={stylesKV.row}>
            <KV label="Padding">
              <Num
                value={s.padding ?? 6}
                step={1}
                onChange={(v) => onStyle({ padding: v })}
              />
            </KV>
            <KV label="Line H">
              <Num
                value={s.lineHeight ?? 1.2}
                step={0.05}
                onChange={(v) => onStyle({ lineHeight: v })}
              />
            </KV>
          </div>

          <div style={stylesKV.row}>
            <KV label="Letter Sp.">
              <Num
                value={s.letterSpacing ?? 0}
                step={0.2}
                onChange={(v) => onStyle({ letterSpacing: v })}
              />
            </KV>
            <KV label=" " />
          </div>
        </div>
      ) : null}

      {isTable ? (
        <div style={stylesKV.block}>
          <div style={stylesKV.title}>Table</div>

          <div style={stylesKV.row}>
            <KV label="Rows">
              <Num
                value={el.table.rows}
                step={1}
                min={1}
                onChange={(v) => {
                  const rows = Math.max(1, Math.floor(v));
                  const rowH = [...el.table.rowH];
                  while (rowH.length < rows) rowH.push(32);
                  while (rowH.length > rows) rowH.pop();
                  onTable({ rows, rowH });
                }}
              />
            </KV>
            <KV label="Cols">
              <Num
                value={el.table.cols}
                step={1}
                min={1}
                onChange={(v) => {
                  const cols = Math.max(1, Math.floor(v));
                  const colW = [...el.table.colW];
                  while (colW.length < cols) colW.push(90);
                  while (colW.length > cols) colW.pop();
                  onTable({ cols, colW });
                }}
              />
            </KV>
          </div>

          <div style={stylesKV.row}>
            <KV label="Border">
              <Color
                value={el.table.borderColor || "#111827"}
                onChange={(v) => onTable({ borderColor: v })}
              />
            </KV>
            <KV label="BW">
              <Num
                value={el.table.borderWidth ?? 1}
                step={1}
                onChange={(v) => onTable({ borderWidth: v })}
              />
            </KV>
          </div>

          <div style={stylesKV.row}>
            <KV label="Grid">
              <Color
                value={el.table.gridColor || "#111827"}
                onChange={(v) => onTable({ gridColor: v })}
              />
            </KV>
            <KV label="GW">
              <Num
                value={el.table.gridWidth ?? 1}
                step={1}
                onChange={(v) => onTable({ gridWidth: v })}
              />
            </KV>
          </div>

          <div style={stylesKV.row}>
            <KV label="Cell Pad">
              <Num
                value={el.table.cellPadding ?? 6}
                step={1}
                onChange={(v) => onTable({ cellPadding: v })}
              />
            </KV>
            <KV label="Font">
              <Num
                value={el.table.fontSize ?? 11}
                step={1}
                onChange={(v) => onTable({ fontSize: v })}
              />
            </KV>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={onMerge} style={stylesKV.actionBtn}>
              Merge
            </button>
            <button onClick={onUnmerge} style={stylesKV.actionBtn}>
              Unmerge
            </button>
          </div>

          <div
            style={{
              marginTop: 10,
              borderTop: "1px solid #e5e7eb",
              paddingTop: 10,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                opacity: 0.75,
                marginBottom: 8,
              }}
            >
              Cell
            </div>
            {!activeCellKey ? (
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                Click a cell to edit per-cell style.
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  <KV label="BG">
                    <Color
                      value={cellSX.bg || "#ffffff"}
                      onChange={(v) => onCellStyle(activeCellKey, { bg: v })}
                    />
                  </KV>
                  <KV label="Text">
                    <Color
                      value={cellSX.color || "#0f172a"}
                      onChange={(v) => onCellStyle(activeCellKey, { color: v })}
                    />
                  </KV>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <KV label="Pad">
                    <Num
                      value={cellSX.padding ?? el.table.cellPadding ?? 6}
                      step={1}
                      onChange={(v) =>
                        onCellStyle(activeCellKey, { padding: v })
                      }
                    />
                  </KV>
                  <KV label="Size">
                    <Num
                      value={cellSX.fontSize ?? el.table.fontSize ?? 11}
                      step={1}
                      onChange={(v) =>
                        onCellStyle(activeCellKey, { fontSize: v })
                      }
                    />
                  </KV>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <KV label="Border">
                    <Color
                      value={
                        cellSX.borderColor || el.table.gridColor || "#111827"
                      }
                      onChange={(v) =>
                        onCellStyle(activeCellKey, { borderColor: v })
                      }
                    />
                  </KV>
                  <KV label="BW">
                    <Num
                      value={cellSX.borderWidth ?? el.table.gridWidth ?? 1}
                      step={1}
                      onChange={(v) =>
                        onCellStyle(activeCellKey, { borderWidth: v })
                      }
                    />
                  </KV>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    marginTop: 10,
                  }}
                >
                  <KV label="Align">
                    <select
                      value={cellSX.align || "left"}
                      onChange={(e) =>
                        onCellStyle(activeCellKey, { align: e.target.value })
                      }
                      style={stylesKV.select}
                    >
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  </KV>
                  <KV label="V Align">
                    <select
                      value={cellSX.vAlign || "top"}
                      onChange={(e) =>
                        onCellStyle(activeCellKey, { vAlign: e.target.value })
                      }
                      style={stylesKV.select}
                    >
                      <option value="top">Top</option>
                      <option value="middle">Middle</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  </KV>
                </div>
              </>
            )}
          </div>

          <div
            style={{
              marginTop: 10,
              borderTop: "1px solid #e5e7eb",
              paddingTop: 10,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.75 }}>
              Bind cell
            </div>
            <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
              {columns.slice(0, 10).map((c) => (
                <button
                  key={c.key}
                  onClick={() => onBindCell(c)}
                  style={stylesKV.bindBtn}
                >
                  {c.label}{" "}
                  <span style={{ opacity: 0.7 }}>{`{{${c.key}}}`}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 6, opacity: 0.65, fontSize: 11 }}>
              Tip: click a cell, then click a column.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KV({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <div style={{ fontSize: 11, fontWeight: 900, opacity: 0.7 }}>{label}</div>
      {children}
    </div>
  );
}

function Num({ value, onChange, step = 0.5, min = -999999, max = 999999 }) {
  return (
    <input
      type="number"
      value={Number.isFinite(Number(value)) ? value : 0}
      step={step}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      style={stylesKV.input}
    />
  );
}

function Color({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        type="color"
        value={value || "#111827"}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={stylesKV.input}
      />
    </div>
  );
}

/** ---------- Ruler ---------- */
function Ruler({ axis, mm, scale }) {
  const ticks = [];
  for (let i = 0; i <= mm; i += 5) ticks.push(i);

  return (
    <div
      style={{
        position: "relative",
        width: axis === "x" ? mm * MM_TO_PX * scale : 36,
        height: axis === "x" ? 28 : mm * MM_TO_PX * scale,
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      {ticks.map((t) => {
        const major = t % 25 === 0;
        if (axis === "x") {
          const left = t * MM_TO_PX * scale;
          return (
            <div
              key={t}
              style={{ position: "absolute", left, top: 0, height: "100%" }}
            >
              <div
                style={{
                  width: 1,
                  height: major ? 18 : 10,
                  background: "#cbd5e1",
                }}
              />
              {major ? (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 2,
                    fontSize: 10,
                    color: "#64748b",
                  }}
                >
                  {t}
                </div>
              ) : null}
            </div>
          );
        }
        const top = t * MM_TO_PX * scale;
        return (
          <div
            key={t}
            style={{ position: "absolute", top, left: 0, width: "100%" }}
          >
            <div
              style={{
                height: 1,
                width: major ? 18 : 10,
                background: "#cbd5e1",
              }}
            />
            {major ? (
              <div
                style={{
                  position: "absolute",
                  left: 18,
                  top: -6,
                  fontSize: 10,
                  color: "#64748b",
                }}
              >
                {t}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** ---------- Styles ---------- */
const styles = {
  page: {
    height: "100vh",
    width: "100%",
    background: "#f6f7fb",
    color: "#0f172a",
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topbar: {
    height: 56,
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(255,255,255,.92)",
    borderBottom: "1px solid #e5e7eb",
    backdropFilter: "blur(10px)",
    flexShrink: 0,
  },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
  },
  sep: { width: 1, height: 28, background: "#e5e7eb", margin: "0 8px" },
  select: {
    height: 32,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "0 10px",
    fontSize: 12,
    fontWeight: 800,
    outline: "none",
  },
  softBtn: {
    height: 32,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "0 10px",
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  topActions: { display: "flex", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 34,
    height: 32,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  iconActive: {
    borderColor: "rgba(37,99,235,.45)",
    boxShadow: "0 0 0 3px rgba(37,99,235,.12)",
  },
  iconDanger: {
    borderColor: "#fecaca",
    color: "#b91c1c",
    background: "#fff5f5",
  },

  body: {
    display: "grid",
    gridTemplateColumns: "260px 1fr 360px",
    gap: 12,
    padding: 12,
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
  },

  left: {
    background: "rgba(255,255,255,.92)",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    overflow: "hidden",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  right: {
    background: "rgba(255,255,255,.92)",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    overflow: "hidden",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },

  tabs: {
    display: "flex",
    gap: 8,
    padding: 10,
    borderBottom: "1px solid #e5e7eb",
    background: "rgba(248,250,252,.75)",
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    fontWeight: 900,
  },
  tabActive: {
    borderColor: "rgba(37,99,235,.45)",
    boxShadow: "0 0 0 3px rgba(37,99,235,.12)",
  },

  leftSection: { padding: 12, minHeight: 0, overflow: "auto" },
  toolsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
  toolIcon: {
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    background: "#fff",
    padding: "12px 10px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "grab",
    userSelect: "none",
  },
  toolIconLabel: { fontSize: 12, fontWeight: 900, opacity: 0.8 },

  divider: { height: 1, background: "#e5e7eb", margin: "12px 0" },

  pill: {
    width: 40,
    height: 36,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  pillActive: {
    borderColor: "rgba(37,99,235,.45)",
    boxShadow: "0 0 0 3px rgba(37,99,235,.12)",
  },

  iconGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  iconPill: {
    height: 38,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  center: { position: "relative", minHeight: 0, overflow: "hidden" },

  rulers: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 },
  rulerTop: { position: "absolute", left: 36, top: 0, right: 0, height: 28 },
  rulerLeft: { position: "absolute", left: 0, top: 28, bottom: 0, width: 36 },

  canvasStage: {
    position: "absolute",
    inset: 0,
    overflow: "auto",
    borderRadius: 14,
    background:
      "linear-gradient(180deg, rgba(255,255,255,.75), rgba(255,255,255,.55))",
    border: "1px solid rgba(226,232,240,.9)",
  },
  canvas: {
    position: "relative",
    margin: 20,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 30px rgba(15,23,42,.08)",
    overflow: "hidden",
  },
  gridBg: {
    backgroundImage:
      "linear-gradient(to right, rgba(226,232,240,.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,232,240,.9) 1px, transparent 1px)",
    backgroundSize: "24px 24px",
  },

  bottomBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(226,232,240,.95)",
    background: "rgba(255,255,255,.88)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 12px",
    zIndex: 20,
  },
  bottomBtn: {
    width: 38,
    height: 34,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPill: {
    height: 34,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "0 8px",
    marginLeft: 6,
  },
  bottomMini: {
    height: 26,
    minWidth: 34,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 900,
    cursor: "pointer",
  },

  panelBody: { padding: 12, minHeight: 0, overflow: "auto" },
  inspector: { display: "flex", flexDirection: "column", gap: 12 },

  layers: { display: "flex", flexDirection: "column", gap: 8 },
  layerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    padding: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 12,
    cursor: "pointer",
  },
  layerRowSel: {
    borderColor: "rgba(37,99,235,.45)",
    boxShadow: "0 0 0 3px rgba(37,99,235,.10)",
  },
  layerTitle: {
    fontSize: 12,
    fontWeight: 900,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  layerSub: { fontSize: 11, opacity: 0.65, marginTop: 2 },

  miniBtn: {
    width: 34,
    height: 30,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },

  columns: { display: "grid", gap: 8 },
  colBtn: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 12,
    padding: 10,
    cursor: "pointer",
    textAlign: "left",
  },

  toast: {
    position: "fixed",
    left: "50%",
    bottom: 18,
    transform: "translateX(-50%)",
    background: "rgba(15,23,42,.92)",
    color: "#fff",
    borderRadius: 999,
    padding: "10px 14px",
    fontSize: 12,
    fontWeight: 900,
    boxShadow: "0 12px 26px rgba(15,23,42,.25)",
    zIndex: 99999,
  },
};

/** ---------- Inspector KV styles ---------- */
const stylesKV = {
  block: {
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 14,
    padding: 12,
  },
  title: { fontSize: 12, fontWeight: 900, marginBottom: 10, opacity: 0.8 },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 32,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: "0 10px",
    outline: "none",
    fontWeight: 800,
    fontSize: 12,
  },
  select: {
    width: "100%",
    height: 32,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: "0 10px",
    outline: "none",
    fontWeight: 900,
    fontSize: 12,
    background: "#fff",
  },
  chip: {
    height: 34,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    padding: "0 12px",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 12,
  },
  chipActive: {
    borderColor: "rgba(37,99,235,.45)",
    boxShadow: "0 0 0 3px rgba(37,99,235,.12)",
  },
  actionBtn: {
    height: 34,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "linear-gradient(180deg,#ffffff,#f8fafc)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 12,
    padding: "0 12px",
  },
  bindBtn: {
    width: "100%",
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 900,
  },
};
