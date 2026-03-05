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
import { Box, Button, CircularProgress, Paper } from "@mui/material";
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

// ✅ FORCE A4 ALWAYS (match Creator)
const A4_W_MM = 210;
const A4_H_MM = 297;

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
  const { keepMissingTokens = false } = opts || {};
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
    return norm(String(v));
  });
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
   FIXED TABLE AUTO-GROW (Crystal-like)
   - For non-repeat tables (normal grid tables)
   - Auto measures bound cell text and expands row heights
   - Pushes down following elements; moves overflow to next pages
========================================================= */

function isRepeatTableEl(el) {
  const tmeta = el?.table || el?.tbl || el?.meta || {};
  const repeat = tmeta?.repeat || {};
  return !!repeat?.enabled && !!repeat?.arrayPath;
}

function normalizePagesOverflow(pages, paperMm, marginMm) {
  const top = Number(marginMm?.top || 0);
  const bottom = Number(marginMm?.bottom || 0);
  const maxY = Number(paperMm?.h || A4_H_MM) - bottom;

  const out = pages.map((p) => ({ ...p, elements: [...(p.elements || [])] }));

  for (let pi = 0; pi < out.length; pi++) {
    const page = out[pi];
    const els = [...(page.elements || [])].sort(
      (a, b) => Number(a.y) - Number(b.y) || (a.z || 0) - (b.z || 0),
    );

    const keep = [];
    const move = [];

    for (const el of els) {
      const y = Number(el?.y || 0);
      const h = Number(el?.h || 0);
      if (y + h > maxY + 0.01 && y > top + 0.01) move.push(el);
      else keep.push(el);
    }

    page.elements = keep;

    if (move.length) {
      // ensure next page
      if (!out[pi + 1]) {
        out.push({
          ...page,
          id: `${page?.id || "page"}_auto_${pi + 1}`,
          name: `${page?.name || "Page"} (${pi + 2})`,
          elements: [],
        });
      }
      const next = out[pi + 1];
      // stack moved elements from top in same relative order
      let cursorY = top;
      const moved = move.map((e) => {
        const ne = { ...e, y: cursorY };
        cursorY += Number(e?.h || 0) + 0.1;
        return ne;
      });
      next.elements = [...(next.elements || []), ...moved];
    }
  }

  return out;
}

function applyAutoGrowFixedTablesToTemplate(template, data, opts) {
  const paperMm = opts?.paperMm || { w: A4_W_MM, h: A4_H_MM };
  const marginMm = opts?.marginMm || { top: 0, bottom: 0 };
  const measureTextMm = opts?.measureTextMm;
  if (!template || !Array.isArray(template?.pages) || !measureTextMm)
    return template;

  // ✅ local cell-key resolver (Creator may store keys as "r_c", "r,c", "r, c", "r-c", etc.)
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
      if (isRepeatTableEl(el)) continue; // handled elsewhere

      const tmeta = el.table || el.tbl || el.meta || {};
      const rows = Number(tmeta.rows || el.rows || 0);
      const cols = Number(tmeta.cols || el.cols || 0);
      if (!rows || !cols) continue;

      const bindings = tmeta.bindings || tmeta.binding || {};

      // Heuristic: auto-grow only if a bound cell has tokens or table explicitly marked.
      let looksVariable = !!tmeta.autoGrow;
      if (!looksVariable) {
        for (const k of Object.keys(bindings || {})) {
          const v = String(bindings?.[k] ?? "");
          if (v.includes("{{") && v.includes("}}")) {
            looksVariable = true;
            break;
          }
        }
      }
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
          // bindSpec can be a token string like "{{x}}" or an object like { path, key/columnKey/token, label }
          let tokenText = "";
          if (typeof bindSpec === "string") {
            tokenText = bindSpec;
          } else if (bindSpec && typeof bindSpec === "object") {
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
          const resolved = applyTokens(tokenText, data, {
            keepMissingTokens: false,
          });
          const safe = isUnresolvedTokenString(resolved) ? "" : resolved;
          if (!safe) continue;

          const measured = measureTextMm({
            text: safe,
            widthMm: Math.max(1, Number(colMm[c] || 1)),
            style: {
              ...(el.style || {}),
              ...(tmeta.style || {}),
              fontSize: tmeta.fontSize ?? el?.style?.fontSize ?? 11,
              fontFamily:
                (tmeta.style && tmeta.style.fontFamily) ||
                el?.style?.fontFamily,
              fontWeight:
                (tmeta.style && tmeta.style.fontWeight) ||
                el?.style?.fontWeight,
              lineHeight:
                (tmeta.style && tmeta.style.lineHeight) ||
                el?.style?.lineHeight,
              padding: cellPad,
            },
            data,
          });

          // include vertical padding (top+bottom)
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

  // NOTE: Do NOT paginate/stack here. We only grow fixed tables and push-down.
  // Full pagination is handled later (repeat-table flow + final overflow pass) to preserve sequence.
  return { ...template, pages };
}

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
  // sometimes stored as flex-like values
  if (raw === "flex-start") return "left";
  if (raw === "flex-end") return "right";
  return "left";
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

/* =========================================================
   TABLE CELL RENDER HELPERS (BL Creator compatible)
   - Outer wrapper handles vertical alignment
   - Inner wrapper handles horizontal text-align (reliable in HTML tables)
   - Supports cell value being a nested text-element object: { type:"text", text, style }
========================================================= */

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

  // outer: vertical alignment only
  const outerCss = `
    width:100%;
    height:100%;
    box-sizing:border-box;
    display:flex;
    align-items:${vAlignToAlignItems(vAlign)};
    overflow:hidden;
  `;

  // inner: horizontal alignment via text-align (reliable)
  const innerCss = `
    width:100%;
    max-height:100%;
    overflow:hidden;
    box-sizing:border-box;
    white-space:pre-wrap;
    word-break:break-word;
    text-align:${align};
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
  // If creator stored a nested element object inside the cell, honor its style (especially align)
  if (isElementLike(cell) && String(cell.type).toLowerCase() === "text") {
    const cellStyle = {
      ...(baseStyle || {}),
      ...(cell.style || {}),
      ...(cell.css || {}),
    };
    const align = normalizeTextAlign(pickTextAlign(cellStyle) ?? "left");
    const vAlign = normalizeVAlign(pickVAlign(cellStyle) ?? "top");

    const rawText = cell.text ?? cell.value ?? cell.label ?? resolvedText ?? "";

    const resolved = applyTokens(String(rawText), data || {}, {
      keepMissingTokens: false,
    });
    const safe = isUnresolvedTokenString(resolved) ? "" : resolved;

    return renderCellInnerHtml({
      text: safe,
      sMerged: cellStyle,
      align,
      vAlign,
    });
  }

  // Default: render resolved text using the computed style
  const align = normalizeTextAlign(pickTextAlign(baseStyle) ?? "left");
  const vAlign = normalizeVAlign(pickVAlign(baseStyle) ?? "top");
  return renderCellInnerHtml({
    text: resolvedText ?? "",
    sMerged: baseStyle || {},
    align,
    vAlign,
  });
}

function normalizePages(tpl) {
  if (Array.isArray(tpl?.pages) && tpl.pages.length > 0) {
    return tpl.pages.map((p, idx) => ({
      key: p?.id || `p_${idx}`,
      name: p?.name || `Page ${idx + 1}`,
      wMm: A4_W_MM,
      hMm: A4_H_MM,
      // ✅ keep attachment bands if present (produced by hybrid layout helper)
      attachHeaderMm: Number(p?.attachHeaderMm || 0),
      attachFooterMm: Number(p?.attachFooterMm || 0),
      elements: Array.isArray(p?.elements) ? p.elements : [],
    }));
  }

  return [
    {
      key: "main",
      name: "Main",
      wMm: A4_W_MM,
      hMm: A4_H_MM,
      attachHeaderMm: Number(tpl?.attachHeaderMm || 0),
      attachFooterMm: Number(tpl?.attachFooterMm || 0),
      elements: Array.isArray(tpl?.elements) ? tpl.elements : [],
    },
  ];
}

/* =========================================================
   TABLE RESOLUTION (binding aware)
========================================================= */

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

function resolveCellTextForRender({ tmeta, r, c, data }) {
  const merges = Array.isArray(tmeta?.merges) ? tmeta.merges : [];
  if (isCoveredByMerge(merges, r, c)) return "";

  const bindings = tmeta.bindings || tmeta.binding || {};
  const cellStyle = tmeta.cellStyle || tmeta.cellStyles || {};
  const cells = tmeta.cells || tmeta.cell || tmeta.data || {};

  const bind = pickFromMap(bindings, r, c);
  const csx = pickFromMap(cellStyle, r, c) || {};
  const cell = pickFromMap(cells, r, c);

  const direct =
    (cell && (cell.text ?? cell.value ?? cell.label)) ??
    csx.text ??
    csx.value ??
    csx.label ??
    "";

  if (direct) {
    const resolved = applyTokens(String(direct), data, {
      keepMissingTokens: false,
    });
    return isUnresolvedTokenString(resolved) ? "" : resolved;
  }

  if (bind) {
    const tokenKey =
      bind.columnKey ?? bind.key ?? bind.field ?? bind.fieldKey ?? bind.token;
    const path = bind.path;
    const label = bind.label;

    if (path) {
      const v = getByPath(data, path);
      if (v !== undefined && v !== null)
        return String(v).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    }

    if (tokenKey) {
      const tokenResolved = applyTokens(`{{${tokenKey}}}`, data, {
        keepMissingTokens: false,
      });
      if (tokenResolved && !isUnresolvedTokenString(tokenResolved))
        return tokenResolved;
    }

    if (label != null) return String(label);
  }

  return "";
}

/* =========================================================
   TABLE STYLE HELPERS
   - Creator may store align keys with different names (align/textAlign/text_alignment...)
========================================================= */

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

/* =========================================================
   ELEMENT RENDERER (REPORT MODE)
========================================================= */

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
      ${cssFromStyle({ ...s, align, bg: "transparent", borderWidth: 0 })}
    `;

    const txt = applyTokens(el.text || "", data, { keepMissingTokens: false });
    const safeTxt = isUnresolvedTokenString(txt) ? "" : txt;

    return `<div style="${wrapCss}"><div style="${innerCss}">${escapeHtml(
      safeTxt,
    )}</div></div>`;
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

    // ✅ Chunked repeat-table printing (flow across pages)
    // When applyRepeatTablesFlowToTemplate() runs, it injects repeatPrint with header/body.
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

      const colsCount = Math.max(1, colsDef.length);

      const widthMm = Number(el.w || 10);
      const heightMm = Number(el.h || 10);

      const explicitSum = colsDef.reduce(
        (s, c) => s + (Number(c.widthMm) || 0),
        0,
      );
      const autoW = explicitSum > 0 ? 0 : widthMm / colsCount;
      const colMm = colsDef.map((c) =>
        (Number(c.widthMm) || 0) > 0 ? Number(c.widthMm) : autoW,
      );

      const headerH = Number(repeat?.headerHeightMm ?? 7) || 7;
      const bodyH = Number(repeat?.rowHeightMm ?? 6) || 6;

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
          return `<td style="${tdCss}"><div style="${innerCss}">${escapeHtml(
            String(c.label ?? c.key ?? ""),
          )}</div></td>`;
        })
        .join("");

      let bodyRowsHtml = "";
      for (let r = 0; r < repeatPrint.body.length; r++) {
        const rowArr = repeatPrint.body[r] || [];
        const cells = colsDef
          .map((c, ci) => {
            const align = normalizeTextAlign(c.align || "left");
            const vAlign = "top";
            const txt = rowArr[ci] == null ? "" : String(rowArr[ci]);

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

            return `<td style="${tdCss}"><div style="${innerCss}">${escapeHtml(
              txt,
            )}</div></td>`;
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

    // ✅ Repeating table (array) rendering for report/print preview
    // Renders header + as many rows as can fit in the table height.
    // If more rows exist than fit, last row shows "…".
    if (repeatEnabled) {
      const array = getByPath(data, String(repeat.arrayPath)) || [];
      const arr = Array.isArray(array) ? array : [];

      // columns preference: repeat.columns -> keys from first row
      const repeatColsRaw = Array.isArray(repeat.columns) ? repeat.columns : [];
      const colsDef = repeatColsRaw.length
        ? repeatColsRaw
        : (arr[0] && typeof arr[0] === "object" ? Object.keys(arr[0]) : [])
            .slice(0, 8)
            .map((k) => ({
              key: k,
              label: k,
              align: "left",
              widthMm: null,
            }));

      const colsCount = Math.max(1, colsDef.length);

      const widthMm = Number(el.w || 10);
      const heightMm = Number(el.h || 10);

      // Column widths in mm
      const explicitSum = colsDef.reduce(
        (s, c) => s + (Number(c.widthMm) || 0),
        0,
      );
      const autoW = explicitSum > 0 ? 0 : widthMm / colsCount;
      const colMm = colsDef.map((c) =>
        (Number(c.widthMm) || 0) > 0 ? Number(c.widthMm) : autoW,
      );

      // Row heights
      const headerH = Number(repeat.headerHeightMm ?? 7) || 7;
      const bodyH = Number(repeat.rowHeightMm ?? 6) || 6;

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
            const val = getByPath(rowObj, String(c.key || "")); // supports nested keys
            const txt =
              val == null
                ? ""
                : typeof val === "object"
                  ? JSON.stringify(val)
                  : String(val);

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
        bodyRowsHtml += `<tr style="height:${bodyH}mm"><td colspan="${colsCount}" style="${tdCss}"><div style="${innerCss}">…</div></td></tr>`;
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

    // ✅ IMPORTANT: outer border on TABLE (not wrapper div) to avoid clipping / missing border lines
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
        const cell =
          pickFromMap(tmeta.cells || tmeta.cell || tmeta.data || {}, r, c) ||
          null;
        const cellInlineStyle = (cell && (cell.style || cell.css)) || {};

        // Prefer cell-specific style -> cellStyle map -> table style -> element style
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

        // ✅ grid defaults (fallback to OUTER border color/width if grid not provided)
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
        overflow:visible; /* ✅ don't clip borders */
      ">
        <table style="
          width:100%;
          height:100%;
          border-collapse:collapse;
          table-layout:fixed;
          box-sizing:border-box;
          border:${tableBorder}; /* ✅ outer border here */
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
   ✅ FORCE A4 SIZE (210mm x 297mm)
========================================================= */

/* =========================================================
   REPEAT TABLE FLOW (array tables across pages)
   - Expands table rows based on data length (not creator rows)
   - Splits across pages and pushes following elements
   - Produces chunk elements with table.repeatPrint { header, body, columns }
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
      }));
  }
  return [];
}

function buildRepeatPrintChunk({ el, repeat, colsDef, chunkRows }) {
  const header = colsDef.map((c) => String(c.label ?? c.key ?? ""));
  const body = chunkRows.map((rowObj, idx) =>
    colsDef.map((c) => {
      if (c.key === "__index__") return String(idx + 1);
      const v = getByPath(rowObj || {}, String(c.key || ""));
      if (v == null) return "";
      if (typeof v === "object") {
        try {
          return JSON.stringify(v);
        } catch {
          return String(v);
        }
      }
      return String(v);
    }),
  );

  const headerH = Number(repeat.headerHeightMm ?? 7) || 7;
  const bodyH = Number(repeat.rowHeightMm ?? 6) || 6;
  const h = headerH + body.length * bodyH;

  const tmeta = el.table || el.tbl || el.meta || {};
  const nextTable = {
    ...tmeta,
    // mark as chunk table so renderer uses this instead of fixed grid/ellipsis
    repeatPrint: { header, body, columns: colsDef },
    // disable repeat on chunks to avoid recursion
    repeat: { ...repeat, enabled: false },
  };

  return {
    ...el,
    h,
    table: nextTable,
  };
}

function ensurePageObject(pages, idx, basePage) {
  while (pages.length <= idx) {
    pages.push({
      ...basePage,
      id: `${basePage?.id || "page"}_auto_${idx}`,
      name: `${basePage?.name || "Page"} ${idx + 1}`,
      elements: [],
    });
  }
}

function paginateOverflowElementsOnPage(
  page,
  pageHeightMm,
  marginTopMm = 0,
  marginBottomMm = 0,
) {
  // Move elements whose bottom exceeds the page to the next page,
  // and STACK them from marginTop in the SAME relative order.
  // This preserves "table after table" sequencing (Crystal-like).
  const maxY = pageHeightMm - marginBottomMm;
  const els = Array.isArray(page?.elements) ? page.elements : [];
  const stay = [];
  const overflow = [];

  // keep stable order (the caller already sorts when needed)
  for (const el of els) {
    const bottom = Number(el?.y || 0) + Number(el?.h || 0);
    if (bottom > maxY + 0.001) overflow.push(el);
    else stay.push(el);
  }

  page.elements = stay;

  // stack overflow items from top margin
  let cursorY = Number(marginTopMm || 0);
  const gap = 0.1; // mm
  const moved = overflow.map((el) => {
    const ne = { ...el, y: cursorY };
    cursorY += Number(el?.h || 0) + gap;
    return ne;
  });

  return moved;
}

function applyRepeatTablesFlowToTemplate(tpl, data, opts = {}) {
  if (!tpl) return tpl;
  const paperMm = opts.paperMm || { w: A4_W_MM, h: A4_H_MM };
  const marginMm = opts.marginMm || { top: 0, bottom: 0 };

  // ✅ BODY band helpers (important for Attachment pages)
  // Attachment pages may reserve footer/header bands (attachHeaderMm/attachFooterMm)
  // and only the BODY band should be used for repeat-table pagination + push-down.
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
    if (bodyHeight <= 0) return [];

    const els = Array.isArray(page.elements) ? page.elements : [];
    const stay = [];
    const overflow = [];

    // Keep stable order
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

      // Only paginate elements that start inside BODY and overflow past bodyBottom.
      if (y >= bodyTop - 0.001 && bottom > bodyBottom + 0.001)
        overflow.push(el);
      else stay.push(el);
    }

    page.elements = stay;

    // Shift overflow up by exactly one BODY height (not full page height)
    return overflow.map((el) => ({
      ...el,
      y: Math.max(bodyTop, Number(el.y || 0) - bodyHeight),
    }));
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
    // process in top->bottom order then z
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
        // fallback to old renderer behavior if no columns
        rebuilt.push(el);
        continue;
      }

      const headerH = Number(repeat.headerHeightMm ?? 7) || 7;
      const bodyH = Number(repeat.rowHeightMm ?? 6) || 6;

      const { bodyTop, bodyBottom, bodyHeight } = getBodyBand(page);

      // available body rows on this page starting from el.y
      const availableMm = bodyBottom - Number(el.y || 0);
      const maxBodyRowsHere = Math.max(
        0,
        Math.floor((availableMm - headerH) / bodyH),
      );

      if (maxBodyRowsHere <= 0) {
        // move the table to next page (place at BODY top to preserve sequence)
        ensurePageObject(pages, pIndex + 1, page);
        const nb = getBodyBand(pages[pIndex + 1]);
        pages[pIndex + 1].elements.push({ ...el, y: nb.bodyTop });
        continue;
      }

      const chunks = [];
      let start = 0;
      while (start < arr.length) {
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

      // first chunk in current page
      const firstChunkEl = buildRepeatPrintChunk({
        el,
        repeat,
        colsDef,
        chunkRows: chunks[0],
      });
      rebuilt.push(firstChunkEl);

      // push down subsequent elements on this page by delta height
      const delta = Number(firstChunkEl.h || 0) - Number(el.h || 0);
      if (delta > 0) {
        for (let j = i + 1; j < els.length; j++) {
          els[j] = { ...els[j], y: Number(els[j].y || 0) + delta };
        }
      }

      // remaining chunks to next pages
      for (let c = 1; c < chunks.length; c++) {
        const targetIdx = pIndex + c;
        ensurePageObject(pages, targetIdx, page);
        const nb = getBodyBand(pages[targetIdx]);
        const chunkEl = buildRepeatPrintChunk({
          el: { ...el, y: nb.bodyTop },
          repeat,
          colsDef,
          chunkRows: chunks[c],
        });
        pages[targetIdx].elements.push(chunkEl);
      }
    }

    page.elements = rebuilt;

    // After expanding, move any overflow elements to next pages (repeat until stable)
    // ✅ paginate within BODY band (respects attachment footer/header)
    let overflow = paginateOverflowElementsOnPageBody(page);
    let nextPageIdx = pIndex + 1;
    while (overflow.length) {
      ensurePageObject(pages, nextPageIdx, page);
      pages[nextPageIdx].elements = [
        ...(pages[nextPageIdx].elements || []),
        ...overflow,
      ];
      // check overflow again on that next page
      overflow = paginateOverflowElementsOnPageBody(pages[nextPageIdx]);
      nextPageIdx += 1;
    }
  }

  return { ...tpl, pages };
}

export function renderTemplateHtml(tpl, data) {
  const pages = normalizePages(tpl);

  const pagesHtml = pages
    .map((pg, pageIndex) => {
      const elements = Array.isArray(pg.elements) ? pg.elements : [];
      const body = elements
        .filter((e) => !e?.hidden)
        .sort((a, b) => (a?.z || 0) - (b?.z || 0))
        .map((el) => renderElement(el, data))
        .join("");

      return `
        <div class="page" data-pageindex="${pageIndex}" id="__report_page__${pageIndex}" style="
          width:${A4_W_MM}mm;
          height:${A4_H_MM}mm;
        ">
          ${body}
        </div>
      `;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>BL Report</title>
  <style>
    @page { size: A4; margin: 0; }

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
    }

    @media screen {
      body { background:#f2f2f2; }
      .pagesRoot{ padding: 8mm 0; }
      .page{
        margin: 0 auto 10mm auto;
        box-shadow: 0 8px 22px rgba(0,0,0,0.10);
      }
    }

    @media print {
      body { background:#fff; }
      .pagesRoot{ padding:0; }
      .page{
        margin:0;
        box-shadow:none;
        page-break-after: always;
      }
      .page:last-child{ page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="pagesRoot" id="__pages_root__">
    ${pagesHtml}
  </div>
</body>
</html>`;
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

async function printViaHiddenIframe(html, iframeEl) {
  if (!iframeEl?.contentWindow) return;

  const doc = iframeEl.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  await waitForAssets(doc);
  await new Promise((r) => setTimeout(r, 200));

  iframeEl.contentWindow.focus();
  iframeEl.contentWindow.print();
}

async function downloadPdfViaCanvas(
  html,
  iframeEl,
  filename = "BL_Report.pdf",
) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  if (!iframeEl?.contentWindow) throw new Error("Hidden iframe not ready");

  const doc = iframeEl.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  await waitForAssets(doc);
  await new Promise((r) => setTimeout(r, 250));

  const pagesRoot = doc.getElementById("__pages_root__");
  if (!pagesRoot) throw new Error("Pages root not found in iframe");

  const pageEls = Array.from(
    pagesRoot.querySelectorAll('[id^="__report_page__"]'),
  );
  if (!pageEls.length) throw new Error("No pages found to export");

  const scale = Math.max(3, Math.min(4, window.devicePixelRatio || 3));

  const pdf = new jsPDF("p", "pt", "a4", true);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageEls.length; i++) {
    const pageEl = pageEls[i];

    try {
      pageEl.scrollIntoView({ block: "start" });
    } catch {}

    const canvas = await html2canvas(pageEl, {
      scale,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    const imgW = canvas.width;
    const imgH = canvas.height;

    const ratio = Math.min(pageWidth / imgW, pageHeight / imgH);
    const drawW = imgW * ratio;
    const drawH = imgH * ratio;

    const x = (pageWidth - drawW) / 2;
    const y = (pageHeight - drawH) / 2;

    if (i > 0) pdf.addPage("a4", "p");
    pdf.addImage(imgData, "PNG", x, y, drawW, drawH, undefined, "FAST");
  }

  pdf.save(filename);
}

/* =========================================================
   PAGE
========================================================= */

export default function BlReportPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const blId = searchParams.get("blId");

  const [tpl, setTpl] = useState(null);
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hiddenFrameRef = useRef(null);
  const measureRef = useRef(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        if (!templateId) return;

        const reqTpl = {
          columns: "id,name,blPrintTemplateJson",
          tableName: "tblBlPrintTemplate",
          whereCondition: `id='${templateId}'`,
          clientIdCondition: `status=1 FOR JSON PATH`,
        };

        const tplRes = await fetchReportData(reqTpl);
        const row = tplRes?.data?.[0];
        if (!row) throw new Error("Template not found");

        const parsed =
          typeof row.blPrintTemplateJson === "string"
            ? JSON.parse(row.blPrintTemplateJson)
            : row.blPrintTemplateJson;

        setTpl(parsed);
      } catch (e) {
        setError(e?.message || "Failed to load template");
      }
    };

    fetchTemplate();
  }, [templateId]);

  useEffect(() => {
    const fetchBlData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!templateId || !blId) {
          setError("Missing templateId or blId in URL");
          return;
        }

        const req = { recordId: blId };
        const blRes = await fetchBlPrintReportData(req);

        const blRow = blRes?.data?.[0];
        if (!blRow) throw new Error("BL not found");

        setData({
          ...blRow,
          bl: blRow,
          bldata: blRow,
          tblBl: blRow,
        });
      } catch (e) {
        setError(e?.message || "Failed to load BL data");
      } finally {
        setLoading(false);
      }
    };

    fetchBlData();
  }, [templateId, blId]);

  // ✅ DOM measurer: same behavior as renderer (missing tokens => "")
  const measureTextMm = useCallback(({ text, widthMm, style, data: mData }) => {
    const el = measureRef.current;
    if (!el) return 0;

    const resolved = applyTokens(text || "", mData || {}, {
      keepMissingTokens: false,
    });

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

    el.textContent = isUnresolvedTokenString(resolved) ? "" : resolved;

    const rect = el.getBoundingClientRect();
    const hPx = rect.height;
    el.textContent = "";

    const hMm = hPx / MM_TO_PX;
    return Math.ceil(hMm * 100) / 100;
  }, []);

  const laidTpl = useMemo(() => {
    if (!tpl || !data) return null;

    const paperMm = { w: A4_W_MM, h: A4_H_MM };

    try {
      const laid = layoutTemplateForData(tpl, data, {
        paperMm,
        marginMm: { top: 0, left: 0, right: 0, bottom: 0 },
        headerEnabled: !!tpl?.header?.enabled,
        headerHeightMm: Number(tpl?.header?.heightMm || 0),
        safetyBottomMm: 2,
        measureTextMm,
        debug: false,
      });
      // ✅ Crystal-like: auto-grow fixed tables (cell tokens) and push-down following elements
      const grown = applyAutoGrowFixedTablesToTemplate(laid, data, {
        paperMm,
        marginMm: { top: 0, bottom: 0 },
        measureTextMm,
      });

      // ✅ Expand repeat tables based on data length and split across pages
      return applyRepeatTablesFlowToTemplate(grown, data, {
        paperMm,
        marginMm: { top: 0, bottom: 0 },
      });
    } catch (e) {
      console.error("layoutTemplateForData failed:", e);
      return tpl;
    }
  }, [tpl, data, measureTextMm]);

  const html = useMemo(() => {
    if (!laidTpl || !data) return "";
    return renderTemplateHtml(laidTpl, data);
  }, [laidTpl, data]);

  const onPrint = async () => {
    try {
      if (!html || !hiddenFrameRef.current) return;
      await printViaHiddenIframe(html, hiddenFrameRef.current);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Print failed");
    }
  };

  const onDownloadPdf = async () => {
    try {
      if (!html || !hiddenFrameRef.current) return;
      await downloadPdfViaCanvas(html, hiddenFrameRef.current, "BL_Report.pdf");
    } catch (e) {
      console.error(e);
      setError(e?.message || "PDF download failed");
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
          right: 0,
          bottom: 0,
          width: 0,
          height: 0,
          border: 0,
          opacity: 0,
          pointerEvents: "none",
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 1 }}>
        <Button
          variant="contained"
          startIcon={<PrintRoundedIcon />}
          onClick={onPrint}
          disabled={!html || loading}
          sx={{ height: 32, fontSize: 12, borderRadius: 1 }}
        >
          PRINT
        </Button>

        <Button
          variant="outlined"
          startIcon={<DownloadRoundedIcon />}
          onClick={onDownloadPdf}
          disabled={!html || loading}
          sx={{ height: 32, fontSize: 12, borderRadius: 1 }}
        >
          DOWNLOAD PDF
        </Button>
      </Box>

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
              overflow: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              py: 2,
            }}
          >
            <iframe
              title="BL Report"
              srcDoc={html}
              style={{
                width: "min(980px, 100%)",
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
