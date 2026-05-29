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
  const elements = Array.isArray(page?.elements) ? page.elements : [];

  const normalEls = [];
  const fixedBandEls = [];

  elements.forEach((el) => {
    const band = String(el?.attachBand || "").toLowerCase();

    // Header/Footer should not move with body content
    if (band === "header" || band === "footer") {
      fixedBandEls.push(el);
    } else {
      normalEls.push(el);
    }
  });

  const sorted = normalEls
    .map((el, index) => ({
      ...el,
      __sortIndex: index,
      _originalY: Number(el._originalY ?? el.y ?? 0),
      _originalHeight: Number(el._originalHeight ?? el.h ?? 0),
    }))
    .sort((a, b) => {
      const ay = Number(a._originalY ?? a.y ?? 0);
      const by = Number(b._originalY ?? b.y ?? 0);

      if (Math.abs(ay - by) > 0.25) return ay - by;

      return (
        Number(a.x || 0) - Number(b.x || 0) ||
        Number(a.z || 0) - Number(b.z || 0)
      );
    });

  // Group elements that start on the same Y line.
  // This prevents side-by-side elements from pushing each other.
  const groups = [];

  sorted.forEach((el) => {
    const y = Number(el._originalY ?? el.y ?? 0);
    const last = groups[groups.length - 1];

    if (!last || Math.abs(last.y - y) > 0.25) {
      groups.push({ y, elements: [el] });
    } else {
      last.elements.push(el);
    }
  });

  let shiftDown = 0;
  const reflowed = [];

  groups.forEach((group) => {
    let maxGrowthInGroup = 0;

    const movedGroup = group.elements.map((el) => {
      const originalY = Number(el._originalY ?? el.y ?? 0);
      const originalH = Number(el._originalHeight ?? el.h ?? 0);
      const newH = Number(el.h || 0);

      const growth = Math.max(0, newH - originalH);
      maxGrowthInGroup = Math.max(maxGrowthInGroup, growth);

      return {
        ...el,
        y: originalY + shiftDown,
      };
    });

    reflowed.push(...movedGroup);

    if (maxGrowthInGroup > 0.01) {
      shiftDown += maxGrowthInGroup;
    }
  });

  page.elements = [...fixedBandEls, ...reflowed].map((el) => {
    const { __sortIndex, ...clean } = el;
    return clean;
  });
}

function compactContinuationBodyRowsToTop(tpl, opts = {}) {
  if (!tpl || !Array.isArray(tpl.pages)) return tpl;

  const paperMm = opts.paperMm || getPaperMmFromTpl(tpl);
  const rowToleranceMm = 0.25;
  const thresholdMm = 4;
  const minGapMm = 0.25;
  const maxGapMm = 3;

  const compactElements = (elements, bodyTop, bodyBottom) => {
    const source = Array.isArray(elements) ? elements : [];
    const fixed = [];
    const body = [];

    source.forEach((el, order) => {
      if (!el) return;
      const band = String(el.attachBand || "body").toLowerCase();
      const item = { el, order };
      if (band === "header" || band === "footer") fixed.push(item);
      else body.push(item);
    });

    if (!body.length) return source;

    const minY = body.reduce(
      (mn, item) => Math.min(mn, Number(item.el?.y || 0)),
      Infinity,
    );

    if (!Number.isFinite(minY) || minY <= bodyTop + thresholdMm) return source;

    const sorted = body.slice().sort(
      (a, b) =>
        Number(a.el?.y || 0) - Number(b.el?.y || 0) ||
        Number(a.el?.x || 0) - Number(b.el?.x || 0) ||
        Number(a.el?.z || 0) - Number(b.el?.z || 0),
    );

    const groups = [];
    sorted.forEach((item) => {
      const y = Number(item.el?.y || 0);
      const last = groups[groups.length - 1];
      if (!last || Math.abs(last.y - y) > rowToleranceMm) {
        groups.push({ y, items: [item] });
      } else {
        last.items.push(item);
      }
    });

    const compacted = [];
    let cursorY = bodyTop;
    let prevOriginalBottom = null;

    groups.forEach((group) => {
      const groupTop = Number(group.y || 0);
      const groupBottom = group.items.reduce((mx, item) => {
        const y = Number(item.el?.y || 0);
        const h = Number(item.el?.h || 0);
        return Math.max(mx, y + h);
      }, groupTop);
      const groupHeight = Math.max(0, groupBottom - groupTop);

      let gap = 0;
      if (prevOriginalBottom != null) {
        const originalGap = groupTop - prevOriginalBottom;
        gap = Math.min(maxGapMm, Math.max(minGapMm, Number(originalGap || 0)));
      }

      if (
        compacted.length &&
        bodyBottom > bodyTop &&
        cursorY + gap + groupHeight > bodyBottom + 0.001
      ) {
        gap = 0;
      }

      cursorY += gap;

      group.items.forEach((item) => {
        compacted.push({
          ...item,
          el: {
            ...item.el,
            y: cursorY + (Number(item.el?.y || 0) - groupTop),
            __compactedToPageTop: true,
          },
        });
      });

      cursorY += groupHeight;
      prevOriginalBottom = groupBottom;
    });

    return [...fixed, ...compacted]
      .sort((a, b) => a.order - b.order)
      .map((item) => item.el);
  };

  const isContinuationPage = (page, pageIndex) => {
    const name = String(page?.name || page?.id || "").toLowerCase();
    return (
      pageIndex > 0 ||
      name.includes("attach") ||
      name.includes("continuation") ||
      page?.__isContinuationPage
    );
  };

  const getBodyBand = (page) => {
    const bodyTop = Number(page?.attachHeaderMm || 0) || 0;
    const bodyBottom =
      Number(paperMm?.h || A4_H_MM) - Number(page?.attachFooterMm || 0) - 3;
    return { bodyTop, bodyBottom };
  };

  const compactedTpl = {
    ...tpl,
    pages: tpl.pages.map((page, pageIndex) => {
      if (!isContinuationPage(page, pageIndex)) return page;

      const { bodyTop, bodyBottom } = getBodyBand(page);

      return {
        ...page,
        elements: compactElements(page.elements, bodyTop, bodyBottom),
      };
    }),
  };

  const getBodyElements = (page) =>
    (Array.isArray(page?.elements) ? page.elements : []).filter((el) => {
      const band = String(el?.attachBand || "body").toLowerCase();
      return band !== "header" && band !== "footer";
    });

  const getFixedElements = (page) =>
    (Array.isArray(page?.elements) ? page.elements : []).filter((el) => {
      const band = String(el?.attachBand || "body").toLowerCase();
      return band === "header" || band === "footer";
    });

  const hasBottomLinkIntoPage = (fromEls, toEls) => {
    const toIds = new Set(toEls.map((el) => String(el?.id || "")).filter(Boolean));
    if (!toIds.size) return false;

    return fromEls.some((el) => {
      const n = el?.neighbors || el?.neighbours || {};
      const candidates = [n.bottomId, n.bottom, n.belowId, n.below]
        .map((id) => (id == null ? "" : String(id)))
        .filter(Boolean);
      return candidates.some((id) => toIds.has(id));
    });
  };

  const moveBodyAfter = (nextBody, placeY) => {
    const minY = nextBody.reduce(
      (mn, el) => Math.min(mn, Number(el?.y || 0)),
      Infinity,
    );

    const fromY = Number.isFinite(minY) ? minY : 0;
    return nextBody.map((el) => ({
      ...el,
      y: Number(placeY || 0) + (Number(el?.y || 0) - fromY),
      attachBand: "body",
      __mergedFromContinuation: true,
    }));
  };

  const pages = compactedTpl.pages.map((page) => ({
    ...page,
    elements: Array.isArray(page?.elements) ? page.elements.slice() : [],
  }));

  for (let i = 1; i < pages.length; i++) {
    const current = pages[i];
    if (!isContinuationPage(current, i)) continue;

    const currentBody = getBodyElements(current);
    const currentFixed = getFixedElements(current);

    if (!currentBody.length && !currentFixed.length) {
      pages.splice(i, 1);
      i -= 1;
      continue;
    }

    if (!currentBody.length || currentFixed.length) continue;

    const previous = pages[i - 1];
    const previousBody = getBodyElements(previous);
    const { bodyTop, bodyBottom } = getBodyBand(previous);

    const previousBottom = previousBody.reduce((mx, el) => {
      const y = Number(el?.y || 0);
      const h = Number(el?.h || 0);
      return Math.max(mx, y + h);
    }, bodyTop);

    const currentMinY = currentBody.reduce(
      (mn, el) => Math.min(mn, Number(el?.y || 0)),
      Infinity,
    );
    const currentMaxBottom = currentBody.reduce((mx, el) => {
      const y = Number(el?.y || 0);
      const h = Number(el?.h || 0);
      return Math.max(mx, y + h);
    }, 0);
    const currentHeight =
      Number.isFinite(currentMinY) && currentMaxBottom > currentMinY
        ? currentMaxBottom - currentMinY
        : 0;

    const placeY = Math.max(bodyTop, previousBottom + minGapMm);
    if (placeY + currentHeight > bodyBottom + 0.001) continue;

    previous.elements = [
      ...getFixedElements(previous),
      ...previousBody,
      ...moveBodyAfter(currentBody, placeY),
    ];
    previous.elements = compactElements(previous.elements, bodyTop, bodyBottom);

    pages.splice(i, 1);
    i -= 1;
  }

  for (let i = 1; i < pages.length - 1; i++) {
    const current = pages[i];
    const next = pages[i + 1];
    if (!isContinuationPage(current, i) || !isContinuationPage(next, i + 1)) {
      continue;
    }

    const currentBody = getBodyElements(current);
    const nextBody = getBodyElements(next);
    if (!currentBody.length || !nextBody.length) continue;
    if (!hasBottomLinkIntoPage(currentBody, nextBody)) continue;

    const nextFixed = getFixedElements(next);
    if (nextFixed.length) continue;

    const { bodyTop, bodyBottom } = getBodyBand(current);
    const currentBottom = currentBody.reduce((mx, el) => {
      const y = Number(el?.y || 0);
      const h = Number(el?.h || 0);
      return Math.max(mx, y + h);
    }, bodyTop);

    const nextMinY = nextBody.reduce(
      (mn, el) => Math.min(mn, Number(el?.y || 0)),
      Infinity,
    );
    const nextMaxBottom = nextBody.reduce((mx, el) => {
      const y = Number(el?.y || 0);
      const h = Number(el?.h || 0);
      return Math.max(mx, y + h);
    }, 0);

    const nextHeight =
      Number.isFinite(nextMinY) && nextMaxBottom > nextMinY
        ? nextMaxBottom - nextMinY
        : 0;

    const placeY = currentBottom + minGapMm;
    if (placeY + nextHeight > bodyBottom + 0.001) continue;

    current.elements = [
      ...getFixedElements(current),
      ...currentBody,
      ...moveBodyAfter(nextBody, placeY),
    ];
    current.elements = compactElements(current.elements, bodyTop, bodyBottom);

    pages.splice(i + 1, 1);
    i -= 1;
  }

  return { ...compactedTpl, pages };
}

function markOriginalElementMetrics(tpl) {
  if (!tpl) return tpl;

  const cloned = JSON.parse(JSON.stringify(tpl));

  if (Array.isArray(cloned.pages)) {
    cloned.pages = cloned.pages.map((page) => ({
      ...page,
      elements: (page.elements || []).map((el) => ({
        ...el,
        _originalY: Number(el.y || 0),
        _originalHeight: Number(el.h || 0),
      })),
    }));
  } else {
    cloned.elements = (cloned.elements || []).map((el) => ({
      ...el,
      _originalY: Number(el.y || 0),
      _originalHeight: Number(el.h || 0),
    }));
  }

  return cloned;
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
    obj?.cro,
    obj?.crodata,
    obj?.tblCro,
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

function normalizeReportRecord(row) {
  if (!row || typeof row !== "object") return row;

  return {
    ...row,
    bl: row.bl ?? row,
    bldata: row.bldata ?? row,
    tblBl: row.tblBl ?? row,
    cro: row.cro ?? row,
    crodata: row.crodata ?? row,
    tblCro: row.tblCro ?? row,
    data: row.data ?? row,
    row,
    record: row.record ?? row,
  };
}

function normalizeReportRows(payload) {
  return normalizeApiRows(payload)
    .filter((row) => row && typeof row === "object")
    .map(normalizeReportRecord);
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
  const v = normalizeVAlign(vAlign);
  if (v === "middle") return "center";
  if (v === "bottom") return "flex-end";
  return "flex-start";
}
function hAlignToJustify(textAlign) {
  const a = normalizeTextAlign(textAlign);
  if (a === "center") return "center";
  if (a === "right") return "flex-end";
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
  return normalizeTextAlign(align);
}
function normalizeVAlign(v) {
  const raw = (v ?? "").toString().trim().toLowerCase();
  if (!raw) return "top";
  if (["middle", "center", "centre"].includes(raw)) return "middle";
  if (["bottom", "end", "flex-end"].includes(raw)) return "bottom";
  if (["top", "start", "flex-start"].includes(raw)) return "top";
  return "top";
}
function cssFromStyle(s = {}) {
  const fontSize = Number(s.fontSize ?? 10);
  const fontFamily = s.fontFamily || "Arial, Helvetica, sans-serif";
  const fontWeight = s.fontWeight ?? 400;
  const color = s.color || "#111827";
  const textAlign = normalizeTextAlign(pickTextAlign(s));
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
        ...p,
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
function pickRepeatColumnAlign(column, tmeta, mode = "body") {
  const modeAlignKey = mode === "header" ? "headerAlign" : "bodyAlign";
  const modeStyleKey = mode === "header" ? "headerStyle" : "bodyStyle";

  return normalizeTextAlign(
    pickTextAlign(column) ??
      column?.[modeAlignKey] ??
      tmeta?.[modeAlignKey] ??
      pickTextAlign(tmeta?.[modeStyleKey]) ??
      pickTextAlign(tmeta?.style) ??
      pickTextAlign(tmeta) ??
      "left",
  );
}
function pickRepeatColumnVAlign(column, tmeta, mode = "body") {
  const modeVAlignKey = mode === "header" ? "headerVAlign" : "bodyVAlign";
  const modeStyleKey = mode === "header" ? "headerStyle" : "bodyStyle";
  const fallback = mode === "header" ? "middle" : "top";

  return normalizeVAlign(
    pickVAlign(column) ??
      column?.[modeVAlignKey] ??
      tmeta?.[modeVAlignKey] ??
      pickVAlign(tmeta?.[modeStyleKey]) ??
      pickVAlign(tmeta?.style) ??
      pickVAlign(tmeta) ??
      fallback,
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
function cloneReportPlain(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return obj;
  }
}

function isReportFixedBandElement(el) {
  const band = String(el?.attachBand || "").toLowerCase();
  return band === "header" || band === "footer";
}

function makeContinuationPage(basePage, sequence, opts = {}) {
  const cloneBandElements = !!opts.cloneBandElements;

  const baseElements = Array.isArray(basePage?.elements)
    ? basePage.elements
    : [];

  const bandElements = cloneBandElements
    ? baseElements
        .filter((el) => isReportFixedBandElement(el))
        .map((el, idx) => ({
          ...cloneReportPlain(el),
          id: `${el?.id || "band"}__cont_${sequence}_${idx}`,
        }))
    : [];

  const safeBaseId = String(basePage?.id || basePage?.key || "page").replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );

  return {
    ...basePage,
    id: `${safeBaseId}_cont_${sequence}`,
    key: `${safeBaseId}_cont_${sequence}`,
    name: `${basePage?.name || "Page"} Continuation ${sequence}`,
    elements: bandElements,
    __isContinuationPage: true,
  };
}

function insertContinuationPageAfter(
  pages,
  afterIndex,
  basePage,
  sequence,
  opts = {},
) {
  const safeAfterIndex = Math.max(
    0,
    Math.min(Number(afterIndex || 0), Math.max(0, pages.length - 1)),
  );

  const newPage = makeContinuationPage(basePage, sequence, opts);
  pages.splice(safeAfterIndex + 1, 0, newPage);

  return {
    page: newPage,
    index: safeAfterIndex + 1,
  };
}

/**
 * Fixed flow:
 * - When table/following content overflows, insert a continuation page.
 * - Do not push overflow into the next designed template page.
 * - Re-pack overflowing elements sequentially from the top of the continuation page.
 *   This avoids the earlier bug where one line was placed on page 2 and the rest
 *   moved to page 3 because original absolute Y gaps were preserved.
 */
function applyRepeatTablesFlowToTemplate(tpl, data, opts = {}) {
  const debug = !!opts.debug;
  if (!tpl) return tpl;

  const paperMm = opts.paperMm || { w: A4_W_MM, h: A4_H_MM };
  const marginMm = opts.marginMm || { top: 0, bottom: 0 };

  // Keep a small safe area from the bottom so Chrome/PDF rounding does not
  // create extra pages or clip bottom text.
  const safetyBottomMm = Number(opts.safetyBottomMm ?? 3) || 3;

  let continuationCounter = 0;
  const nextContinuationSequence = () => {
    continuationCounter += 1;
    return continuationCounter;
  };

  const getBodyBand = (page) => {
    const attachHeaderMm = Number(page?.attachHeaderMm || 0);
    const attachFooterMm = Number(page?.attachFooterMm || 0);

    const bodyTop = Number(marginMm.top || 0) + attachHeaderMm;
    const bodyBottom =
      Number(paperMm.h || A4_H_MM) -
      Number(marginMm.bottom || 0) -
      attachFooterMm -
      safetyBottomMm;

    const bodyHeight = Math.max(0, bodyBottom - bodyTop);

    return {
      attachHeaderMm,
      attachFooterMm,
      bodyTop,
      bodyBottom,
      bodyHeight,
    };
  };

  const sortForFlow = (els) =>
    [...(els || [])].sort(
      (a, b) =>
        Number(a?.y || 0) - Number(b?.y || 0) ||
        Number(a?.x || 0) - Number(b?.x || 0) ||
        Number(a?.z || 0) - Number(b?.z || 0),
    );

  /**
   * Pack overflow elements from the top of continuation page.
   * Important: Do NOT preserve big original absolute Y gaps.
   * Keeping those gaps is what caused the bad result:
   * page 2 = only one line, page 3 = remaining labeling text.
   */
  const packOverflowElements = (overflow, targetPage) => {
    const { bodyTop, bodyBottom, bodyHeight } = getBodyBand(targetPage);
    const sortedOverflow = sortForFlow(overflow);

    const groups = [];
    const yToleranceMm = 0.25;

    sortedOverflow.forEach((el) => {
      const y = Number(el?.y || 0);
      const last = groups[groups.length - 1];

      if (!last || Math.abs(last.originalY - y) > yToleranceMm) {
        groups.push({
          originalY: y,
          elements: [el],
        });
      } else {
        last.elements.push(el);
      }
    });

    const packed = [];
    let cursorY = bodyTop;
    const gapMm = 0.25;

    groups.forEach((group) => {
      const groupEls = sortForFlow(group.elements);
      const maxH = groupEls.reduce((mx, el) => {
        const h = Math.max(0, Number(el?.h || 0));
        return Math.max(mx, h);
      }, 0);

      // If a group is taller than page body, cap non-splittable elements.
      // This prevents infinite continuation page creation.
      const safeGroupH =
        bodyHeight > 0 && maxH > bodyHeight ? Math.max(1, bodyHeight) : maxH;

      groupEls.forEach((el) => {
        const h = Math.max(0, Number(el?.h || 0));
        const safeH =
          bodyHeight > 0 && h > bodyHeight ? Math.max(1, bodyHeight) : h;

        packed.push({
          ...el,
          y: cursorY,
          h: safeH,
          __movedToContinuation: true,
        });
      });

      cursorY += safeGroupH + gapMm;
    });

    // If all elements were packed but still exceed the page, the outer overflow
    // loop will move the later elements to another continuation page.
    return packed.map((el) => {
      const bottom = Number(el.y || 0) + Number(el.h || 0);
      if (bottom <= bodyBottom + 0.01) return el;
      return el;
    });
  };

  /**
   * Moves overflow from sourcePageIndex into newly inserted continuation pages.
   *
   * insertAfterIndex controls where the new page is inserted. If a repeat table
   * already created continuation chunks, normal pushed-down content is inserted
   * after those chunks, not before them.
   */
  const moveOverflowToInsertedPages = (
    pages,
    sourcePageIndex,
    insertAfterIndex = sourcePageIndex,
  ) => {
    let checkIndex = sourcePageIndex;
    let anchorIndex = Math.max(sourcePageIndex, insertAfterIndex);
    let safety = 0;

    while (safety < 80) {
      safety += 1;

      const page = pages[checkIndex];
      if (!page) return anchorIndex;

      const { bodyBottom } = getBodyBand(page);

      const els = Array.isArray(page.elements) ? page.elements : [];
      const fixedItems = [];
      const flowItems = [];

      els.forEach((el, order) => {
        if (!el) return;

        const item = { el, order };
        if (isReportFixedBandElement(el)) fixedItems.push(item);
        else flowItems.push(item);
      });

      const sortedFlowItems = flowItems.slice().sort(
        (a, b) =>
          Number(a.el?.y || 0) - Number(b.el?.y || 0) ||
          Number(a.el?.x || 0) - Number(b.el?.x || 0) ||
          Number(a.el?.z || 0) - Number(b.el?.z || 0),
      );

      const rowGroups = [];
      const rowToleranceMm = 0.25;

      sortedFlowItems.forEach((item) => {
        const y = Number(item.el?.y || 0);
        const last = rowGroups[rowGroups.length - 1];

        if (!last || Math.abs(last.y - y) > rowToleranceMm) {
          rowGroups.push({ y, items: [item] });
        } else {
          last.items.push(item);
        }
      });

      const stayItems = [];
      const overflowItems = [];

      rowGroups.forEach((group) => {
        const groupBottom = group.items.reduce((mx, item) => {
          const y = Number(item.el?.y || 0);
          const h = Number(item.el?.h || 0);
          return Math.max(mx, y + h);
        }, -Infinity);

        if (groupBottom > bodyBottom + 0.01) {
          overflowItems.push(...group.items);
        } else {
          stayItems.push(...group.items);
        }
      });

      page.elements = [...fixedItems, ...stayItems]
        .sort((a, b) => a.order - b.order)
        .map((item) => item.el);

      const overflow = overflowItems
        .sort(
          (a, b) =>
            Number(a.el?.y || 0) - Number(b.el?.y || 0) ||
            Number(a.el?.x || 0) - Number(b.el?.x || 0) ||
            Number(a.el?.z || 0) - Number(b.el?.z || 0),
        )
        .map((item) => item.el);

      if (!overflow.length) {
        return anchorIndex;
      }

      const inserted = insertContinuationPageAfter(
        pages,
        anchorIndex,
        page,
        nextContinuationSequence(),
        {
          cloneBandElements: false,
        },
      );

      anchorIndex = inserted.index;

      const packed = packOverflowElements(overflow, inserted.page);
      inserted.page.elements = [...(inserted.page.elements || []), ...packed];

      if (debug) {
        dbgLog(debug, "[FLOW][OVERFLOW->CONTINUATION]", {
          fromPage: page.id,
          sourcePageIndex,
          insertedIndex: inserted.index,
          insertedPage: inserted.page.id,
          bodyBottom,
          moved: packed.map((m) => ({
            id: m.id,
            type: m.type,
            y: m.y,
            h: m.h,
            bottom: Number(m.y || 0) + Number(m.h || 0),
          })),
        });
      }

      // Now check the inserted page. If packed content still cannot fit,
      // the later elements move to another continuation page.
      checkIndex = inserted.index;
    }

    if (debug) {
      dbgLog(debug, "[FLOW][OVERFLOW-SAFETY-STOP]", {
        sourcePageIndex,
        insertAfterIndex,
      });
    }

    return anchorIndex;
  };

  const pages = normalizePages(tpl).map((p) => ({
    ...p,
    elements: (Array.isArray(p.elements) ? p.elements : []).map((e) => ({
      ...e,
    })),
  }));

  for (let pIndex = 0; pIndex < pages.length; pIndex++) {
    const page = pages[pIndex];

    let els = sortForFlow(page.elements);
    const rebuilt = [];

    // If repeat table chunks are inserted, pushed normal content should go
    // after the last inserted chunk page.
    let overflowInsertAnchorIndex = pIndex;

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

      const repeatMetrics = resolveRepeatTableMetricsMm(el, repeat, tmeta);
      const headerH = repeatMetrics.headerRowMm;
      const bodyH = repeatMetrics.bodyRowMm;

      const { bodyTop, bodyBottom, bodyHeight } = getBodyBand(page);

      const tableY = Number(el.y || bodyTop);
      const availableMm = bodyBottom - tableY;

      const maxBodyRowsHere = Math.max(
        0,
        Math.floor((availableMm - headerH) / bodyH),
      );

      if (debug) {
        dbgLog(debug, "[FLOW][REPEAT-TABLE]", {
          pageId: page.id,
          elId: el.id,
          y: el.y,
          bodyTop,
          bodyBottom,
          bodyHeight,
          availableMm,
          headerH,
          bodyH,
          maxBodyRowsHere,
          totalRows: arr.length,
        });
      }

      // Repeat table cannot fit even one row here. Move it whole to a
      // continuation page; when that page is processed it will split normally.
      if (maxBodyRowsHere <= 0) {
        const inserted = insertContinuationPageAfter(
          pages,
          overflowInsertAnchorIndex,
          page,
          nextContinuationSequence(),
          {
            cloneBandElements: false,
          },
        );

        overflowInsertAnchorIndex = inserted.index;

        const nb = getBodyBand(inserted.page);

        inserted.page.elements.push({
          ...el,
          y: nb.bodyTop,
        });

        if (debug) {
          dbgLog(debug, "[FLOW][MOVE-WHOLE-REPEAT-TABLE]", {
            fromPage: page.id,
            toPage: inserted.page.id,
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

          els[j] = {
            ...els[j],
            neighbors: nn,
          };
        }
      }

      const delta = Number(firstChunkEl.h || 0) - Number(el.h || 0);

      if (delta > 0.01) {
        for (let j = i + 1; j < els.length; j++) {
          if (isReportFixedBandElement(els[j])) continue;

          els[j] = {
            ...els[j],
            y: Number(els[j].y || 0) + delta,
          };
        }
      }

      for (let c = 1; c < chunks.length; c++) {
        const inserted = insertContinuationPageAfter(
          pages,
          overflowInsertAnchorIndex,
          page,
          nextContinuationSequence(),
          {
            cloneBandElements: false,
          },
        );

        overflowInsertAnchorIndex = inserted.index;

        const nb = getBodyBand(inserted.page);

        const chunkEl = buildRepeatPrintChunk({
          el: {
            ...el,
            y: nb.bodyTop,
          },
          repeat,
          colsDef,
          chunkRows: chunks[c],
          chunkIndex: c,
        });

        inserted.page.elements.push(chunkEl);

        if (debug) {
          dbgLog(debug, "[FLOW][REPEAT-CHUNK->CONTINUATION]", {
            baseId: el.id,
            chunkId: chunkEl.id,
            targetPage: inserted.page.id,
            rowsInChunk: chunks[c].length,
            y: chunkEl.y,
            h: chunkEl.h,
          });
        }
      }
    }

    page.elements = rebuilt;

    moveOverflowToInsertedPages(pages, pIndex, overflowInsertAnchorIndex);
  }

  return {
    ...tpl,
    pages,
  };
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
    const align = normalizeHAlign(pickTextAlign(s));
    const vAlign = normalizeVAlign(pickVAlign(s));
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
      align-items:${vAlignToAlignItems(vAlign)};
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
    ${cssFromStyle({
      ...s,
      textAlign: align,
      align,
      vAlign,
      verticalAlign: vAlign,
      bg: "transparent",
      borderWidth: 0,
    })}
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
          const align = pickRepeatColumnAlign(c, tmeta, "header");
          const vAlign = pickRepeatColumnVAlign(c, tmeta, "header");
          const tdCss = `
            border:${gridBW}px solid ${gridBC};
            background:${tmeta.headerBg || "#e5e7eb"};
            padding:0;
            vertical-align:${vAlign};
            overflow:hidden;
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
            const align = pickRepeatColumnAlign(c, tmeta, "body");
            const vAlign = pickRepeatColumnVAlign(c, tmeta, "body");
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
          const align = pickRepeatColumnAlign(c, tmeta, "header");
          const vAlign = pickRepeatColumnVAlign(c, tmeta, "header");
          const tdCss = `
            border:${gridBW}px solid ${gridBC};
            background:${tmeta.headerBg || "#e5e7eb"};
            padding:0;
            vertical-align:${vAlign};
            overflow:hidden;
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
            const align = pickRepeatColumnAlign(c, tmeta, "body");
            const vAlign = pickRepeatColumnVAlign(c, tmeta, "body");
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

  const isRenderableHtml = (html) => {
    const cleaned = String(html || "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, "")
      .trim();

    // Keep page if it has text OR actual rendered elements/images/tables/lines/boxes
    return (
      cleaned.length > 0 ||
      /<(img|table|svg|canvas)\b/i.test(html || "") ||
      /border-|border:|background:|background-color:/i.test(html || "")
    );
  };

  const pages = normalizePages(tpl)
    .map((pg, originalIndex) => {
      const elements = Array.isArray(pg.elements) ? pg.elements : [];
      const pageData = pg.__reportData || data;

      const body = elements
        .filter((e) => !e?.hidden)
        .sort((a, b) => (a?.z || 0) - (b?.z || 0))
        .map((el) => renderElement(el, pageData))
        .join("");

      return {
        ...pg,
        originalIndex,
        body,
      };
    })
    // ✅ removes actual blank page objects
    .filter((pg) => isRenderableHtml(pg.body));

  const pagesHtml = pages
    .map((pg, pageIndex) => {
      return `
        <div
          class="page"
          data-pageindex="${pageIndex}"
          data-original-pageindex="${pg.originalIndex}"
          data-reportindex="${pg.__reportIndex ?? ""}"
          data-reportpageindex="${pg.__reportPageIndex ?? ""}"
          id="__report_page__${pageIndex}"
          style="
            width:${paperMm.w}mm;
            height:${paperMm.h}mm;
          "
        >
          ${pg.body}
        </div>
      `;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>CRO Report</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    html,
    body {
      margin: 0;
      padding: 0;
      width: ${paperMm.w}mm;
      background: #ffffff;
    }

    body {
      overflow: visible;
    }

    .pagesRoot {
      width: ${paperMm.w}mm;
      margin: 0;
      padding: 0;
      display: block;
    }

    .page {
      position: relative;
      width: ${paperMm.w}mm;
      height: ${paperMm.h}mm;
      margin: 0;
      padding: 0;
      background: #ffffff;
      overflow: hidden;
      box-shadow: none;
    }

    @media screen {
      html,
      body {
        width: 100%;
        background: #f2f2f2;
      }

      .pagesRoot {
        width: 100%;
        padding: 8mm 0;
      }

      .page {
        margin: 0 auto 10mm auto;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.10);
      }
    }
@media print {
  html,
  body {
    width: ${paperMm.w}mm;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    overflow: visible !important;
  }

  .pagesRoot {
    width: ${paperMm.w}mm;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
  }

  .page {
    width: ${paperMm.w}mm !important;
    height: calc(${paperMm.h}mm - 0.5mm) !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    box-shadow: none !important;
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .page + .page {
    break-before: page;
    page-break-before: always;
  }

  .page:last-child {
    break-after: auto;
    page-break-after: auto;
  }
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
  const [dataRows, setDataRows] = useState([]);
  const [selectedReportIndex, setSelectedReportIndex] = useState(0);

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
        setDataRows([]);
        setSelectedReportIndex(0);

        if (!templateId || !jobId) {
          setError("Missing templateId or jobId in URL");
          return;
        }

        const req = { recordId: jobId };
        const blRes = await fetchCroPrintReportData(req);

        const rows = normalizeReportRows(blRes);
        if (!rows.length) throw new Error("CRO data not found");

        setDataRows(rows);
        dbgLog(
          DEBUG,
          "[DEBUG] CRO data fetched:",
          rows.length,
          "report(s)",
          Object.keys(rows[0] || {}),
        );
      } catch (e) {
        setDataRows([]);
        setError(e?.message || "Failed to load CRO data");
      } finally {
        setLoading(false);
      }
    };

    fetchBlData();
  }, [templateId, jobId, DEBUG]);

  function buildBlPagesDetails(tpl) {
    const pages = normalizePages(tpl);

    return pages.map((pg, pageIndex) => {
      const reportNo = Number(pg?.__reportNo || 1);
      const reportPageIndex = Number(pg?.__reportPageIndex ?? pageIndex);
      const basePageKey =
        reportPageIndex === 0
          ? `MainPage${reportPageIndex + 1}`
          : `AttachmentPage${reportPageIndex}`;
      const pageKey =
        Number(tpl?.__reportCount || 0) > 1
          ? `Report${reportNo}${basePageKey}`
          : basePageKey;

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
          reportNo,
          reportIndex: Math.max(0, reportNo - 1),
          reportPageIndex: reportPageIndex + 1,
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
    if (!tpl || !dataRows.length) return null;

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

      // Only process the selected report
      const recordData = dataRows[selectedReportIndex];
      const reportIndex = selectedReportIndex;
      if (!recordData) return null;

      const reportResults = [recordData].map((recordData, _reportIndex) => {
        dbgLog(DEBUG, "report:", reportIndex + 1, "of", dataRows.length);

      const baseTpl = markOriginalElementMetrics(tpl);

      const laid = layoutTemplateForData(baseTpl, recordData, {
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

      const grown = applyAutoGrowFixedTablesToTemplate(laid, recordData, {
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

      const flowed = applyRepeatTablesFlowToTemplate(reflowed, recordData, {
        paperMm,
        marginMm: { top: 0, bottom: 0 },
        safetyBottomMm: 3,
        debug: DEBUG,
      });

      debugDumpPages(DEBUG, flowed, "After applyRepeatTablesFlowToTemplate");
      debugNeighborGraph(DEBUG, flowed);
      debugAnalyzeTableSnapping(DEBUG, flowed, 3);

      let finalTpl = compactContinuationBodyRowsToTop(flowed, { paperMm });

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

      return { reportTpl: finalTpl, recordData, reportIndex };
      });

      const combinedPages = reportResults.flatMap(
        ({ reportTpl, recordData, reportIndex }) =>
          normalizePages(reportTpl).map((page, reportPageIndex) => {
            const sourcePageId = page?.id || `page_${reportPageIndex}`;
            const sourcePageName = page?.name || `Page ${reportPageIndex + 1}`;

            return {
              ...page,
              key: `${sourcePageId}__report_${reportIndex + 1}`,
              id: `${sourcePageId}__report_${reportIndex + 1}`,
              name: sourcePageName,
              __sourcePageId: sourcePageId,
              __sourcePageName: sourcePageName,
              __reportData: recordData,
              __reportIndex: reportIndex,
              __reportNo: reportIndex + 1,
              __reportPageIndex: reportPageIndex,
              __reportPageNo: reportPageIndex + 1,
            };
          }),
      );

      if (combinedPages.length > MAX_SAFE_RENDER_PAGES) {
        throw new Error(
          `Combined CRO layout generated ${combinedPages.length} pages across ${dataRows.length} report(s), which exceeds the safe limit of ${MAX_SAFE_RENDER_PAGES}.`,
        );
      }

      const rootWarnings = reportResults.flatMap((r) =>
        toStringArray(r.reportTpl?.__layoutWarnings).map(
          (msg) => `Report ${r.reportIndex + 1}: ${msg}`,
        ),
      );
      const rootErrors = reportResults.flatMap((r) =>
        toStringArray(r.reportTpl?.__layoutErrors).map(
          (msg) => `Report ${r.reportIndex + 1}: ${msg}`,
        ),
      );

      dbgGroupEnd(DEBUG);
      return {
        ...tpl,
        pages: combinedPages,
        __reportCount: dataRows.length,
        __layoutWarnings: [
          ...toStringArray(tpl?.__layoutWarnings),
          ...rootWarnings,
        ],
        __layoutErrors: [...toStringArray(tpl?.__layoutErrors), ...rootErrors],
      };
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
  }, [tpl, dataRows, selectedReportIndex, measureTextMm, DEBUG]);

  const layoutMessages = useMemo(
    () => collectLayoutMessages(laidTpl),
    [laidTpl],
  );

  const pageOverflowWarnings = useMemo(
    () => (laidTpl ? collectPageOverflowMessages(laidTpl) : []),
    [laidTpl],
  );

  const html = useMemo(() => {
    if (!laidTpl || !dataRows.length) return "";

    const pagesCount = Array.isArray(laidTpl?.pages) ? laidTpl.pages.length : 0;
    if (pagesCount > MAX_SAFE_RENDER_PAGES) return "";

    const selectedData = dataRows[selectedReportIndex];
    const built = renderTemplateHtml(laidTpl, selectedData || {});
    if (built.length > MAX_SAFE_HTML_CHARS) {
      console.error("CRO Report HTML too large:", built.length);
      return "";
    }

    return built;
  }, [laidTpl, dataRows, selectedReportIndex]);

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
      if (!html || !hiddenFrameRef.current || renderBlockReason) return;

      const pageCount = (html.match(/id="__report_page__/g) || []).length;

      if (pageCount > MAX_SAFE_PDF_PAGES) {
        throw new Error(
          `PDF blocked because ${pageCount} pages were generated, which exceeds the safe limit of ${MAX_SAFE_PDF_PAGES}.`,
        );
      }

      await downloadPdfViaCanvas(html, hiddenFrameRef.current, "CRO_Report.pdf");
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

      {/* Report Tabs - Show if multiple reports */}
      {dataRows.length > 1 && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, borderBottom: "1px solid #e0e0e0", pb: 1 }}>
          {dataRows.map((_, index) => (
            <Button
              key={`report-tab-${index}`}
              variant={selectedReportIndex === index ? "contained" : "outlined"}
              onClick={() => setSelectedReportIndex(index)}
              sx={{
                height: 36,
                fontSize: 12,
                borderRadius: 1,
                textTransform: "none",
              }}
            >
              Report {index + 1}
            </Button>
          ))}
        </Box>
      )}

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
              title="CRO Report"
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
