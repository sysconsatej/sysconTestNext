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
  fetchCroPrintReportData,
} from "@/services/auth/FormControl.services";

// ✅ Hybrid layout helper (auto-size / can-grow / pagination)
import { layoutTemplateForData } from "@/helper/croReport_hybrid_helpers";

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
const MAX_SAFE_HTML_CHARS = 8_000_000;
const MAX_SAFE_PDF_PAGES = 50;

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

/* =========================================================
   TEMPLATE CONFIG HELPERS (paper/margin/attachment bands)
========================================================= */
function collectPageOverflowMessages(tpl) {
  const warnings = [];
  const pages = normalizePages(tpl);

  pages.forEach((pg, pageIndex) => {
    const pageH = Number(pg?.hMm || A4_H_MM);
    const els = Array.isArray(pg?.elements) ? pg.elements : [];

    els.forEach((el, elIndex) => {
      if (!el || el.hidden) return;

      const bottom = Number(el?.y || 0) + Number(el?.h || 0);
      if (bottom > pageH + 0.01) {
        warnings.push(
          `${pg?.name || `Page ${pageIndex + 1}`} - element ${
            el?.id || `#${elIndex + 1}`
          } overflows page height (${bottom.toFixed(2)}mm > ${pageH.toFixed(2)}mm)`,
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
// 1) Add near your style normalizers (above cssFromStyle is a good place)
function normalizeOpacity(v, fallback = 1) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(1, n));
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
      }))
      .filter((c) => c.key);
  }
  if (firstRowObj && typeof firstRowObj === "object") {
    return Object.keys(firstRowObj)
      .slice(0, 8)
      .map((k) => ({ key: k, label: k, align: "left", widthMm: null }));
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
    __repeatBaseId: el.id,
    repeatPrint: { header, body, columns: colsDef },
    repeat: { ...repeat, enabled: false },
  };

  const baseId = el.id || "repeatTable";
  const chunkId = `${baseId}__chunk_${chunkIndex}`;

  return { ...el, id: chunkId, __repeatBaseId: baseId, h, table: nextTable };
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

function applyRepeatTablesFlowToTemplate(tpl, data, opts = {}) {
  const debug = !!opts.debug;
  if (!tpl) return tpl;

  const paperMm = opts.paperMm || { w: A4_W_MM, h: A4_H_MM };
  const marginMm = opts.marginMm || { top: 0, bottom: 0 };

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
    const { bodyTop, bodyBottom } = getBodyBand(page);

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

      if (bottom > bodyBottom + 0.001) overflow.push(el);
      else stay.push(el);
    }

    page.elements = stay;

    let cursorY = bodyTop;
    const gap = 0.2;
    const moved = overflow.map((el) => {
      const ne = { ...el, y: cursorY };
      cursorY += Number(ne.h || 0) + gap;
      return ne;
    });

    if (debug && overflow.length) {
      dbgLog(debug, "[FLOW][OVERFLOW->NEXT]", {
        pageId: page.id,
        bodyTop,
        bodyBottom,
        moved: moved.map((m) => ({ id: m.id, y: m.y, h: m.h })),
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
        ensurePageObject(pages, pIndex + 1, page);
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
        ensurePageObject(pages, targetIdx, page);
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

    let overflow = paginateOverflowElementsOnPageBody(page);
    let nextPageIdx = pIndex + 1;

    while (overflow.length) {
      ensurePageObject(pages, nextPageIdx, page);
      pages[nextPageIdx].elements = [
        ...(pages[nextPageIdx].elements || []),
        ...overflow,
      ];
      overflow = paginateOverflowElementsOnPageBody(pages[nextPageIdx]);
      nextPageIdx += 1;
    }
  }

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

  const align = normalizeTextAlign(pickTextAlign(baseStyle) ?? "left");
  const vAlign = normalizeVAlign(pickVAlign(baseStyle) ?? "top");
  return renderCellInnerHtml({
    text: resolvedText ?? "",
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

    const txt = applyTokens(el.text || "", data, { keepMissingTokens: false });
    const safeTxt = isUnresolvedTokenString(txt) ? "" : txt;

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

export function renderTemplateHtml(tpl, data) {
  const paperMm = getPaperMmFromTpl(tpl);
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
          width:${paperMm.w}mm;
          height:${paperMm.h}mm;
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

  const pageCount = pageEls.length;
  const scale = pageCount > 20 ? 1.5 : 2;

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

    canvas.width = 1;
    canvas.height = 1;
  }

  pdf.save(filename);
}

/* =========================================================
   PAGE
========================================================= */

export default function BlReportPage() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("templateId");
  const jobId = searchParams.get("jobId");

  const DEBUG = useMemo(() => getDebugFlag(searchParams), [searchParams]);

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

        dbgLog(DEBUG, "[DEBUG] Template fetched:", parsed);
        setTpl(parsed);
      } catch (e) {
        setError(e?.message || "Failed to load template");
      }
    };

    fetchTemplate();
  }, [templateId, DEBUG]);

  useEffect(() => {
    const fetchBlData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!templateId || !jobId) {
          setError("Missing templateId or jobId in URL");
          return;
        }

        const req = { recordId: jobId };
        const blRes = await fetchCroPrintReportData(req);

        const blRow = blRes?.data?.[0];
        if (!blRow) throw new Error("BL not found");

        setData({ ...blRow, bl: blRow, bldata: blRow, tblBl: blRow });
        dbgLog(
          DEBUG,
          "[DEBUG] BL data fetched keys:",
          Object.keys(blRow || {}),
        );
      } catch (e) {
        setError(e?.message || "Failed to load BL data");
      } finally {
        setLoading(false);
      }
    };

    fetchBlData();
  }, [templateId, jobId, DEBUG]);

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

      // 🔧 NEW STEP
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

      const flowed = applyRepeatTablesFlowToTemplate(reflowed, data, {
        paperMm,
        marginMm: { top: 0, bottom: 0 },
        debug: DEBUG,
      });

      debugDumpPages(DEBUG, flowed, "After applyRepeatTablesFlowToTemplate");
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

  const html = useMemo(() => {
    if (!laidTpl || !data) return "";

    const pagesCount = Array.isArray(laidTpl?.pages) ? laidTpl.pages.length : 0;
    if (pagesCount > MAX_SAFE_RENDER_PAGES) return "";

    const built = renderTemplateHtml(laidTpl, data);
    if (built.length > MAX_SAFE_HTML_CHARS) {
      console.error("BL Report HTML too large:", built.length);
      return "";
    }

    return built;
  }, [laidTpl, data]);

  const renderBlockReason = useMemo(() => {
    if (!laidTpl) return "";

    const pagesCount = Array.isArray(laidTpl?.pages) ? laidTpl.pages.length : 0;
    if (pagesCount > MAX_SAFE_RENDER_PAGES) {
      return `Preview blocked because ${pagesCount} pages were generated, which exceeds the safe limit of ${MAX_SAFE_RENDER_PAGES}.`;
    }

    if (!html && !loading && !error) {
      return "Preview blocked because rendered HTML size exceeded the safe memory limit.";
    }

    return "";
  }, [laidTpl, html, loading, error]);

  const onPrint = async () => {
    try {
      if (!html || !hiddenFrameRef.current || renderBlockReason) return;
      await printViaHiddenIframe(html, hiddenFrameRef.current);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Print failed");
    }
  };

  useEffect(() => {
    if (!laidTpl) return;

    const blPagesDetails = buildBlPagesDetails(laidTpl);

    if (typeof window !== "undefined") {
      window.blPagesDetails = blPagesDetails;
      window.blLayoutWarnings = layoutMessages.warnings;
      window.blLayoutErrors = layoutMessages.errors;
    }

    console.log("Akash blPagesDetails", blPagesDetails);
  }, [laidTpl, layoutMessages]);

  const onDownloadPdf = async () => {
    try {
      const pageCount = Array.isArray(laidTpl?.pages)
        ? laidTpl.pages.length
        : 0;
      if (pageCount > MAX_SAFE_PDF_PAGES) {
        setError(
          `PDF export blocked because ${pageCount} pages were generated. Please reduce content or fix flow configuration.`,
        );
        return;
      }

      if (!html || !hiddenFrameRef.current || renderBlockReason) return;
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
          disabled={!html || loading || !!renderBlockReason}
          sx={{ height: 32, fontSize: 12, borderRadius: 1 }}
        >
          PRINT
        </Button>

        {/* <Button
          variant="outlined"
          startIcon={<DownloadRoundedIcon />}
          onClick={onDownloadPdf}
          disabled={!html || loading || !!renderBlockReason}
          sx={{ height: 32, fontSize: 12, borderRadius: 1 }}
        >
          DOWNLOAD PDF
        </Button> */}
      </Box>

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
