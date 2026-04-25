"use client";
/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { decrypt } from "@/helper/security";
import {
  fetchReportData,
  insertReportData,
} from "@/services/auth/FormControl.services.js";
import { getUserDetails } from "@/helper/userDetails";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Checkbox,
  ListItemText,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import "./styles.css";

const LS_KEY = "blCreator.template.v2";
const PAGE_CLIPBOARD_KEY = "blCreator.pageClipboard.v1";
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
const MM_TO_PX = 96 / 25.4;

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const round2 = (n) => Math.round(n * 100) / 100;

function deepClone(obj) {
  return obj ? JSON.parse(JSON.stringify(obj)) : obj;
}

// 2) add near deepClone()/helpers (module scope)
function clonePageWithFreshElementIds(page) {
  const src = deepClone(page || {});
  const idMap = {};

  const nextElements = (Array.isArray(src.elements) ? src.elements : []).map(
    (el, index) => {
      const oldId = String(el?.id ?? uid());
      const newId = uid();

      idMap[oldId] = newId;

      const nextEl = deepClone(el);
      nextEl.id = newId;
      nextEl.hidden = false;
      nextEl.z = Number(nextEl.z || 0) + index + 1 + Math.random();

      if (nextEl.type === "table" && nextEl.table) {
        nextEl.table.activeCell = null;
        nextEl.table.range = null;
      }

      return nextEl;
    },
  );

  nextElements.forEach((el) => {
    const n = el?.neighbors || {};
    el.neighbors = {
      topId: n.topId ? idMap[String(n.topId)] || null : null,
      bottomId: n.bottomId ? idMap[String(n.bottomId)] || null : null,
      leftId: n.leftId ? idMap[String(n.leftId)] || null : null,
      rightId: n.rightId ? idMap[String(n.rightId)] || null : null,
    };
  });

  return {
    ...src,
    id: uid(),
    elements: nextElements,
    groups: deepClone(src.groups || {}),
  };
}

function buildPageMaps(tpl) {
  const pages = normalizePages(tpl);
  const byId = new Map();

  pages.forEach((p, pageIndex) => {
    (p.elements || []).forEach((el) => {
      if (el?.id) byId.set(el.id, { el, pageIndex });
    });
  });

  return { pages, byId };
}

function applyNeighborConstraints(tpl, refTpl, iterations = 4) {
  if (!tpl || !refTpl) return tpl;

  const out = deepClone(tpl);

  const { pages: outPages, byId: outById } = buildPageMaps(out);
  const { byId: refById } = buildPageMaps(refTpl);

  const get = (id) => (id ? outById.get(id) : null);
  const getRef = (id) => (id ? refById.get(id) : null);

  const bottomOf = (el) => Number(el?.y || 0) + Number(el?.h || 0);
  const rightOf = (el) => Number(el?.x || 0) + Number(el?.w || 0);

  // gap computed from reference template so spacing remains identical to your design
  const gapTop = (refEl, refTop) =>
    Number(refEl?.y || 0) - (Number(refTop?.y || 0) + Number(refTop?.h || 0));

  const gapLeft = (refEl, refLeft) =>
    Number(refEl?.x || 0) - (Number(refLeft?.x || 0) + Number(refLeft?.w || 0));

  for (let pass = 0; pass < iterations; pass++) {
    // stable order: top->bottom, then z
    const all = [];
    outPages.forEach((p, pi) => {
      (p.elements || []).forEach((el) => {
        all.push({ el, pi });
      });
    });
    all.sort(
      (a, b) =>
        Number(a.el?.y || 0) - Number(b.el?.y || 0) ||
        Number(a.el?.z || 0) - Number(b.el?.z || 0),
    );

    for (const { el, pi } of all) {
      const nb = el?.neighbors || {};
      if (!nb) continue;

      const refRec = getRef(el.id);
      const refEl = refRec?.el;

      // --- TOP constraint: keep y attached to topId bottom + original gap ---
      if (nb.topId) {
        const topRec = get(nb.topId);
        const refTopRec = getRef(nb.topId);

        if (
          topRec &&
          refEl &&
          refTopRec &&
          topRec.pageIndex === pi &&
          refRec.pageIndex === refTopRec.pageIndex
        ) {
          const g = gapTop(refEl, refTopRec.el);
          el.y = bottomOf(topRec.el) + g;
        }
      }

      // --- LEFT constraint: keep x attached to leftId right + original gap ---
      if (nb.leftId) {
        const leftRec = get(nb.leftId);
        const refLeftRec = getRef(nb.leftId);

        if (
          leftRec &&
          refEl &&
          refLeftRec &&
          leftRec.pageIndex === pi &&
          refRec.pageIndex === refLeftRec.pageIndex
        ) {
          const g = gapLeft(refEl, refLeftRec.el);
          el.x = rightOf(leftRec.el) + g;
        }
      }

      // --- SPECIAL: stretch LINEV between topId and bottomId (keeps side borders attached)
      const t = String(el.type || "").toLowerCase();
      const isLineV = t === "linev" || t === "vline" || t === "line_vertical";
      const isLineH = t === "lineh" || t === "hline" || t === "line_horizontal";

      if (isLineV && nb.topId && nb.bottomId) {
        const topRec = get(nb.topId);
        const botRec = get(nb.bottomId);
        const refTopRec = getRef(nb.topId);
        const refBotRec = getRef(nb.bottomId);

        if (
          topRec &&
          botRec &&
          refEl &&
          refTopRec &&
          refBotRec &&
          topRec.pageIndex === pi &&
          botRec.pageIndex === pi &&
          refTopRec.pageIndex === refRec.pageIndex &&
          refBotRec.pageIndex === refRec.pageIndex
        ) {
          // preserve original offsets of the line endpoints
          const refTop = refTopRec.el;
          const refBot = refBotRec.el;

          const refLineTopGap = Number(refEl.y || 0) - Number(refTop.y || 0);
          const refLineBottomGap =
            Number(refBot.y || 0) +
            Number(refBot.h || 0) -
            (Number(refEl.y || 0) + Number(refEl.h || 0));

          const newY = Number(topRec.el.y || 0) + refLineTopGap;
          const newBottom = bottomOf(botRec.el) - refLineBottomGap;

          el.y = newY;
          el.h = Math.max(0.1, newBottom - newY);
        }
      }

      if (isLineH && nb.leftId && nb.rightId) {
        const leftRec = get(nb.leftId);
        const rightRec = get(nb.rightId);
        const refLeftRec = getRef(nb.leftId);
        const refRightRec = getRef(nb.rightId);

        if (
          leftRec &&
          rightRec &&
          refEl &&
          refLeftRec &&
          refRightRec &&
          leftRec.pageIndex === pi &&
          rightRec.pageIndex === pi &&
          refLeftRec.pageIndex === refRec.pageIndex &&
          refRightRec.pageIndex === refRec.pageIndex
        ) {
          const refLeft = refLeftRec.el;
          const refRight = refRightRec.el;

          const refLineLeftGap = Number(refEl.x || 0) - Number(refLeft.x || 0);
          const refLineRightGap =
            Number(refRight.x || 0) +
            Number(refRight.w || 0) -
            (Number(refEl.x || 0) + Number(refEl.w || 0));

          const newX = Number(leftRec.el.x || 0) + refLineLeftGap;
          const newRight = rightOf(rightRec.el) - refLineRightGap;

          el.x = newX;
          el.w = Math.max(0.1, newRight - newX);
        }
      }
    }
  }

  // write back updated pages -> template.pages
  // normalizePages() returns synthetic objects, so we update original template pages by id
  if (Array.isArray(out.pages)) {
    for (const p of out.pages) {
      const pNorm = outPages.find((pp) => pp.id === p.id) || null;
      if (pNorm) p.elements = pNorm.elements;
    }
  } else {
    out.elements = outPages[0]?.elements || out.elements;
  }

  return out;
}

/** ---------- Data Schema helpers (for repeating tables) ---------- */
function buildSchemaFromSample(sample) {
  // Accept BL payload as array or object
  const root = Array.isArray(sample) ? sample[0] : sample;
  const arrays = {};
  if (!root || typeof root !== "object") return { arrays };

  for (const [k, v] of Object.entries(root)) {
    if (Array.isArray(v) && v.length && v[0] && typeof v[0] === "object") {
      // Collect union keys from first N rows (helps when some rows miss fields)
      const limit = Math.min(v.length, 25);
      const keySet = new Set();
      for (let i = 0; i < limit; i++) {
        const row = v[i];
        if (row && typeof row === "object") {
          Object.keys(row).forEach((kk) => keySet.add(kk));
        }
      }
      arrays[k] = Array.from(keySet);
    }
  }
  return { arrays };
}

function safeParseJson(text) {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: e?.message || "Invalid JSON" };
  }
}

function normalizeCanGrowColumns(value) {
  if (!Array.isArray(value)) return [];

  const seen = new Set();
  return value
    .map((v) => String(v || "").trim())
    .filter(Boolean)
    .filter((v) => {
      const key = v.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/* =========================================================
   MULTI-PAGE HELPERS (Main + Attachments)
   Backward-compat: keep `template.elements` pointing to ACTIVE page elements.
========================================================= */

function getPages(tpl) {
  return Array.isArray(tpl?.pages) ? tpl.pages : [];
}

function ensurePages(tpl) {
  const pages = getPages(tpl);
  if (pages.length) return tpl;

  const mainId = uid();
  const elements = Array.isArray(tpl?.elements) ? tpl.elements : [];
  const groups = tpl?.groups || {};

  return {
    ...(tpl || {}),
    pages: [{ id: mainId, name: "Main", elements, groups }],
    elements,
    groups,
  };
}

/* =========================================================
   NEIGHBOR MAP (for report binding / flow positioning)
   - Adds el.neighbors { topId,bottomId,leftId,rightId }
   - Safe: does NOT change x/y/w/h; only metadata.
   - Computed per page (Main + Attachments) based on geometry overlap.
========================================================= */

function ensureElementNeighbors(el) {
  if (!el || typeof el !== "object") return el;
  if (el.neighbors && typeof el.neighbors === "object") return el;
  return {
    ...el,
    neighbors: { topId: null, bottomId: null, leftId: null, rightId: null },
  };
}

function overlapRatio1D(a0, a1, b0, b1) {
  const inter = Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
  const minLen = Math.max(0.0001, Math.min(a1 - a0, b1 - b0));
  return inter / minLen;
}

function computeNeighborsForElements(elements) {
  const els = (Array.isArray(elements) ? elements : [])
    .filter((e) => e && !e.hidden)
    .map((e) => ensureElementNeighbors(e));

  const byId = new Map();
  for (const e of els) {
    if (e.id != null) byId.set(String(e.id), e);
  }

  const pickAbove = (e) => {
    const ex0 = Number(e.x || 0),
      ex1 = ex0 + Number(e.w || 0);
    const ey0 = Number(e.y || 0);
    let best = null;
    let bestBottom = -Infinity;

    for (const o of els) {
      if (o === e) continue;
      const ox0 = Number(o.x || 0),
        ox1 = ox0 + Number(o.w || 0);
      const oy0 = Number(o.y || 0),
        oy1 = oy0 + Number(o.h || 0);

      // must be above (allow tiny epsilon)
      if (oy1 > ey0 + 0.2) continue;

      // must overlap horizontally at least a bit
      const ov = overlapRatio1D(ex0, ex1, ox0, ox1);
      if (ov < 0.15) continue;

      if (oy1 > bestBottom) {
        bestBottom = oy1;
        best = o;
      }
    }
    return best;
  };

  const pickBelow = (e) => {
    const ex0 = Number(e.x || 0),
      ex1 = ex0 + Number(e.w || 0);
    const ey1 = Number(e.y || 0) + Number(e.h || 0);
    let best = null;
    let bestTop = Infinity;

    for (const o of els) {
      if (o === e) continue;
      const ox0 = Number(o.x || 0),
        ox1 = ox0 + Number(o.w || 0);
      const oy0 = Number(o.y || 0);

      // must be below
      if (oy0 < ey1 - 0.2) continue;

      const ov = overlapRatio1D(ex0, ex1, ox0, ox1);
      if (ov < 0.15) continue;

      if (oy0 < bestTop) {
        bestTop = oy0;
        best = o;
      }
    }
    return best;
  };

  const pickLeft = (e) => {
    const ey0 = Number(e.y || 0),
      ey1 = ey0 + Number(e.h || 0);
    const ex0 = Number(e.x || 0);
    let best = null;
    let bestRight = -Infinity;

    for (const o of els) {
      if (o === e) continue;
      const oy0 = Number(o.y || 0),
        oy1 = oy0 + Number(o.h || 0);
      const ox1 = Number(o.x || 0) + Number(o.w || 0);

      if (ox1 > ex0 + 0.2) continue;

      const ov = overlapRatio1D(ey0, ey1, oy0, oy1);
      if (ov < 0.15) continue;

      if (ox1 > bestRight) {
        bestRight = ox1;
        best = o;
      }
    }
    return best;
  };

  const pickRight = (e) => {
    const ey0 = Number(e.y || 0),
      ey1 = ey0 + Number(e.h || 0);
    const ex1 = Number(e.x || 0) + Number(e.w || 0);
    let best = null;
    let bestLeft = Infinity;

    for (const o of els) {
      if (o === e) continue;
      const oy0 = Number(o.y || 0),
        oy1 = oy0 + Number(o.h || 0);
      const ox0 = Number(o.x || 0);

      if (ox0 < ex1 - 0.2) continue;

      const ov = overlapRatio1D(ey0, ey1, oy0, oy1);
      if (ov < 0.15) continue;

      if (ox0 < bestLeft) {
        bestLeft = ox0;
        best = o;
      }
    }
    return best;
  };

  const updated = els.map((e) => {
    const top = pickAbove(e);
    const bottom = pickBelow(e);
    const left = pickLeft(e);
    const right = pickRight(e);

    const nextNeighbors = {
      topId: top?.id ?? null,
      bottomId: bottom?.id ?? null,
      leftId: left?.id ?? null,
      rightId: right?.id ?? null,
    };

    // keep stable object refs where possible
    const prev = e.neighbors || {};
    const same =
      (prev.topId ?? null) === (nextNeighbors.topId ?? null) &&
      (prev.bottomId ?? null) === (nextNeighbors.bottomId ?? null) &&
      (prev.leftId ?? null) === (nextNeighbors.leftId ?? null) &&
      (prev.rightId ?? null) === (nextNeighbors.rightId ?? null);

    return same ? e : { ...e, neighbors: nextNeighbors };
  });

  return { updated, changed: updated.some((e, i) => e !== els[i]) };
}

function ensureNeighborsInTemplate(tpl) {
  const t = ensurePages(tpl);
  const pages = Array.isArray(t?.pages) ? t.pages : [];
  let changed = false;

  const nextPages = pages.map((p) => {
    const els = Array.isArray(p?.elements) ? p.elements : [];
    const { updated, changed: ch } = computeNeighborsForElements(els);
    if (ch) changed = true;
    return { ...p, elements: updated };
  });

  return changed ? { ...t, pages: nextPages } : t;
}

function templateHasMissingNeighbors(tpl) {
  const t = ensurePages(tpl);
  const pages = Array.isArray(t?.pages) ? t.pages : [];
  for (const p of pages) {
    const els = Array.isArray(p?.elements) ? p.elements : [];
    for (const el of els) {
      if (!el || el.hidden) continue;
      if (!el.neighbors || typeof el.neighbors !== "object") return true;
      const n = el.neighbors;
      if (
        !("topId" in n) ||
        !("bottomId" in n) ||
        !("leftId" in n) ||
        !("rightId" in n)
      )
        return true;
    }
  }
  return false;
}

function getActivePageIndex(tpl, pageId) {
  const pages = getPages(tpl);
  if (!pages.length) return -1;
  const id = pageId || pages[0].id;
  const idx = pages.findIndex((p) => p.id === id);
  return Math.max(0, idx === -1 ? 0 : idx);
}

function getActivePage(tpl, pageId) {
  const pages = getPages(tpl);
  if (!pages.length) return null;
  const idx = getActivePageIndex(tpl, pageId);
  return pages[idx] || pages[0];
}

function attachActiveElementsAlias(tpl, pageId) {
  const next = ensurePages(tpl);
  const pages = getPages(next);
  if (!pages.length) return next;

  const idx = getActivePageIndex(next, pageId);
  const p = pages[idx] || pages[0];

  const elements = Array.isArray(p?.elements) ? p.elements : [];
  const groups = p?.groups || {};

  return { ...next, elements, groups };
}

function syncActiveAliasesToPages(tpl, pageId) {
  const next = ensurePages(tpl);
  const pages = getPages(next);
  if (!pages.length) return next;

  const idx = getActivePageIndex(next, pageId);
  const cur = pages[idx] ||
    pages[0] || { id: uid(), name: "Main", elements: [], groups: {} };

  // If legacy code updated next.elements/next.groups (active-page aliases),
  // persist them back into the active page. Otherwise keep existing page data.
  const aliasEls = Array.isArray(next.elements)
    ? next.elements
    : Array.isArray(cur.elements)
      ? cur.elements
      : [];
  const aliasGroups = next.groups || cur.groups || {};

  const p = { ...cur, elements: aliasEls, groups: aliasGroups };
  const newPages = pages.slice();
  newPages[idx] = p;

  return { ...next, pages: newPages };
}

function updateActivePage(tpl, pageId, updaterFn) {
  let next = attachActiveElementsAlias(deepClone(tpl), pageId);

  const pages = getPages(next);
  const idx = getActivePageIndex(next, pageId);
  const p = deepClone(pages[idx] || pages[0]);

  const updated = updaterFn(p) || p;

  const newPages = pages.slice();
  newPages[idx] = updated;

  next = { ...next, pages: newPages };
  return attachActiveElementsAlias(next, updated.id);
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
    // Attachment band for repeating pages: body | header | footer
    attachBand: "body",
    z: Date.now(),
    style: {
      bg: "transparent",
      borderColor: "#111827",
      borderWidth: 1,
      borderStyle: "solid",
      borderRadius: 0,
      color: "#111827",
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

  if (type === "image") {
    return {
      ...base,
      w: 100,
      h: 50,
      src: "",
      fit: "contain",
      opacity: 1,
      style: {
        ...base.style,
        bg: "transparent",
        borderWidth: 0,
      },
    };
  }

  if (type === "text") {
    return {
      ...base,
      w: 49,
      h: 8,
      text: "Text",
      textMode: "fixed",
      maxWidthMm: 120,
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
      w: 100,
      h: 50,
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
      w: 80,
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
      h: 100,
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
        repeat: {
          enabled: false,
          arrayPath: "",
          headerRow: true,
          previewRows: 3,
          columns: [],
        },
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
function Icon({ name, size = 30 }) {
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

  if (name === "copy")
    return (
      <svg {...common}>
        <rect x="9" y="9" width="10" height="10" rx="2" {...stroke} />
        <path
          {...stroke}
          d="M7 15H6a2 2 0 01-2-2V6a2 2 0 012-2h7a2 2 0 012 2v1"
        />
      </svg>
    );

  if (name === "paste")
    return (
      <svg {...common}>
        <path {...stroke} d="M9 4h6" />
        <path {...stroke} d="M10 2h4a1 1 0 011 1v2H9V3a1 1 0 011-1z" />
        <path
          {...stroke}
          d="M8 5H7a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1"
        />
      </svg>
    );

  if (name === "image")
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2" {...stroke} />
        <circle cx="9" cy="10" r="1.5" {...stroke} />
        <path {...stroke} d="M21 15l-5-5-7 7" />
      </svg>
    );

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

function normalizeTextAlign(v) {
  const a = String(v ?? "")
    .toLowerCase()
    .trim();
  if (!a) return "left";
  if (["center", "centre", "middle"].includes(a)) return "center";
  if (["right", "end", "flex-end"].includes(a)) return "right";
  if (["left", "start", "flex-start"].includes(a)) return "left";
  if (["justify"].includes(a)) return "justify";
  return "left";
}

function normalizeVAlign(v) {
  const x = String(v ?? "")
    .toLowerCase()
    .trim();
  if (!x) return "top";
  if (["middle", "center", "centre"].includes(x)) return "middle";
  if (["bottom", "end", "flex-end"].includes(x)) return "bottom";
  return "top";
}

function vAlignToAlignItems(vAlign) {
  const va = normalizeVAlign(vAlign);
  if (va === "middle") return "center";
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
  if (style.bg) parts.push(`background:${style.bg};`);

  const bw = style.borderWidth ?? 0;
  if (bw > 0) {
    const bs = style.borderStyle || "solid";
    const bc = style.borderColor || "#000";
    parts.push(`border:${bw}px ${bs} ${bc};`);
  } else {
    parts.push(`border:none;`);
  }

  const ta = normalizeTextAlign(
    style.align ?? style.textAlign ?? style.hAlign ?? "left",
  );
  parts.push(`text-align:${ta};`);

  return parts.join("");
}

function templateToPrintableHTML({ wMm, hMm, elementsHtml, header }) {
  const showHeader = Boolean(
    header?.enabled && header?.src && header?.heightMm,
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
  table{border-collapse:collapse;table-layout:fixed;width:100%;}
  td,th{display:table-cell;vertical-align:top;white-space:pre-wrap;word-break:break-word;padding:0;margin:0;}
  table *{box-sizing:border-box;}
  td>div,th>div{display:flex;}
  tr{page-break-inside:avoid;}
  .page {
    position: relative;
    width:${wMm}mm;
    height:${hMm}mm;
    overflow:hidden;
    background:#fff;
  }
.page::after {
    content:"";
    position:absolute;
    left:0;
    right:0;
    bottom:0;
    border-bottom:1px solid #111;
    pointer-events:none;
  }
</style>
</head>
<body>
  <div class="page">

    ${showHeader
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

      if (el.type === "image") {
        return `
    <img
      src="${el.src}"
      style="
        ${commonBox}
        object-fit:${el.fit || "contain"};
        opacity:${el.opacity ?? 1};
        border:${(s.borderWidth ?? 0) > 0
            ? `${s.borderWidth}px ${s.borderStyle || "solid"} ${s.borderColor}`
            : "none"
          };
        border-radius:${Number(s.borderRadius || 0)}px;
      "
    />
  `;
      }

      if (el.type === "text") {
        // ✅ FIX: text border/bg MUST be applied in PRINT
        const textOpacity = clamp(Number(s.opacity ?? 1), 0, 1);
        const bw = Number(s.borderWidth ?? 0);
        const border =
          bw > 0
            ? `${bw}px ${s.borderStyle || "solid"} ${s.borderColor || "#111827"
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
  opacity:${textOpacity};
  ${cssFromStyle({
          ...s,
          bg: "transparent",
          borderWidth: 0,
        })}
`;

        return `<div style="${wrapCss}"><div style="${innerCss}">${escapeHtml(
          el.text || "",
        )}</div></div>`;
      }

      if (el.type === "box") {
        const boxCss =
          commonBox +
          `
            background:${s.bg || "transparent"};
            border:${(s.borderWidth ?? 0) > 0
            ? `${s.borderWidth}px ${s.borderStyle || "solid"} ${s.borderColor || "#000"
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
            ${el.type === "lineH"
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

  const left = `${Number(el.x || 0)}mm`;
  const top = `${Number(el.y || 0)}mm`;
  const widthMm = Number(el.w || 10);
  const rawHeightMm = Number(el.h || 10);
  const rowHUnit = String(t.rowHUnit || "").toLowerCase();
  const heightMm =
    rowHUnit === "mm"
      ? rowH.reduce((a, b) => a + (Number(b) || 0), 0) || rawHeightMm
      : rawHeightMm;
  const width = `${widthMm}mm`;
  const height = `${heightMm}mm`;
  const rotate = Number(el.rotate || 0);
  const borderW = t.borderWidth == null ? 0 : Number(t.borderWidth) || 0;
  const border =
    borderW > 0 ? `${borderW}px solid ${t.borderColor || "#111827"}` : "none";

  const colMm = colW.map((w) => ((Number(w) || 0) / totalW) * widthMm);
  const rowMm =
    rowHUnit === "mm"
      ? rowH.map((h) => Number(h) || 0)
      : rowH.map((h) => ((Number(h) || 0) / totalH) * heightMm);

  function isCovered(r, c) {
    const m = findMergeAt(merges, r, c);
    if (!m) return false;
    return !(m.r0 === r && m.c0 === c);
  }

  const colgroupHtml = colMm
    .map((mmw) => `<col style="width:${mmw}mm">`)
    .join("");
  let tbodyHtml = "";

  for (let r = 0; r < rows; r++) {
    let rowCells = "";
    for (let c = 0; c < cols; c++) {
      if (isCovered(r, c)) continue;

      const m = findMergeAt(merges, r, c);
      const rs = m ? m.rs : 1;
      const cs = m ? m.cs : 1;
      // const k = cellKey(r, c);
      // const b = bindings[k];

      // let label = "";
      // if (b && b.label) label = b.label;
      // else if (b && b.columnKey) label = `{{${b.columnKey}}}`;

      const k = cellKey(r, c);
      const b = bindings[k];

      // ✅ always show token, never label
      let label = "";
      if (b && b.columnKey) label = `{{${b.columnKey}}}`;

      const csx = cellStyle[k] || {};
      const pad = csx.padding ?? t.cellPadding ?? 6;
      const bg = csx.bg ?? "#fff";
      const color = csx.color ?? "#0f172a";
      const fs = csx.fontSize ?? t.fontSize ?? 11;
      const fw = csx.fontWeight ?? 600;

      // ✅ normalize alignment so values like "middle"/"centre"/"end" don't become invalid CSS
      const align = normalizeTextAlign(
        csx.align ?? csx.textAlign ?? csx.hAlign ?? t.align ?? "left",
      );
      const vAlign = normalizeVAlign(
        csx.vAlign ?? csx.verticalAlign ?? t.vAlign ?? "top",
      );

      const bc = csx.borderColor ?? t.gridColor ?? "#111827";
      const bw = csx.borderWidth ?? t.gridWidth ?? 1;

      const tdCss = `
        border:${bw}px solid ${bc};
        background:${bg};
        padding:0;
        vertical-align:${vAlign};
        overflow:hidden;
      `;

      // ✅ Two-wrapper approach:
      //    - outer flex handles vertical align
      //    - inner block handles horizontal align via text-align (reliable for plain text)
      const outerCss = `
        width:100%;
        height:100%;
        box-sizing:border-box;
        display:flex;
        align-items:${vAlignToAlignItems(vAlign)};
      `;

      const innerCss = `
        width:100%;
        box-sizing:border-box;
        white-space:pre-wrap;
        word-break:break-word;
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
      `;

      rowCells += `<td rowspan="${rs}" colspan="${cs}" style="${tdCss}"><div style="${outerCss}"><div style="${innerCss}">${escapeHtml(
        label,
      )}</div></div></td>`;
    }
    tbodyHtml += `<tr style="height:${rowMm[r]}mm">${rowCells}</tr>`;
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
        width:${width};
        height:${height};
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
  const searchParams = useSearchParams();
  const templateIdFromUrl = useMemo(() => {
    const v = searchParams.get("id");
    return v ? String(v) : "";
  }, [searchParams]);
  const containerRef = useRef(null);
  const canvasStageRef = useRef(null);
  const canvasRef = useRef(null);
  const pendingTextEditRef = useRef(null);
  const pointerMovedRef = useRef(false);
  const DRAG_THRESHOLD_PX = 4;
  const measureRef = useRef(null);
  const [headerLogo, setHeaderLogo] = useState(null);
  const historyRef = useRef({ stack: [], idx: -1 });
  const autoLoadedTemplateIdRef = useRef("");
  const clipboardRef = useRef({
    elements: [],
    pasteCount: 0,
  });
  const sizeClipboardRef = useRef({
    width: null,
    height: null,
  });
  const [blData, setBlData] = useState([]);
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
  const [storedTemplate, setStoredTemplate] = useState([]);
  const { clientId } = getUserDetails();
  const { companyId } = getUserDetails();
  const { userId } = getUserDetails();
  const [newTemplateName, setNewTemplateName] = useState("");
  const isEditMode = Boolean(templateIdFromUrl);
  const [editTemplateName, setEditTemplateName] = useState("");
  const [schemaModalOpen, setSchemaModalOpen] = useState(false);
  const [schemaJsonText, setSchemaJsonText] = useState("");
  const pageClipboardRef = useRef(null);
  const columns = useMemo(() => {
    const arr = Array.isArray(blData) ? blData : [];

    // keep first occurrence of each key (prevents duplicate column keys)
    const seen = new Set();
    return arr
      .filter((c) => c?.key && c?.label)
      .filter((c) => {
        if (seen.has(c.key)) return false;
        seen.add(c.key);
        return true;
      });
  }, [blData]);

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

  useEffect(() => {
    const fetchData = async () => {
      const requestBodyMenu = {
        columns: "af.fieldname as [key],af.label",
        tableName:
          "tblApiDefinition ad Left join tblApiFields af on af.apiDefinitionId = ad.id",
        whereCondition: `ad.apiName = 'CRO Creator'`,
        clientIdCondition: `af.status = 1 order by af.label FOR JSON PATH`,
      };
      try {
        const data = await fetchReportData(requestBodyMenu);
        console.log("Bl data:", data);
        if (data && data.data && data.data.length > 0) {
          setBlData(data.data);
        } else {
          console.error("No data found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [clientId]);

  useEffect(() => {
    const fetchBlPrintTemplateData = async () => {
      // If URL has no id, do not fetch/load any DB template
      if (!templateIdFromUrl) {
        setStoredTemplate([]);
        return;
      }
      const requestBodyMenu = {
        columns: "id,name,blPrintTemplateJson",
        tableName: "tblBlPrintTemplate",
        whereCondition: `clientId = ${clientId} and id = ${templateIdFromUrl}`,
        clientIdCondition: `status = 1 FOR JSON PATH`,
      };

      try {
        const data = await fetchReportData(requestBodyMenu);
        const rows = Array.isArray(data?.data) ? data.data : [];
        setStoredTemplate(rows);
      } catch (error) {
        console.error("Error fetching data:", error);
        setStoredTemplate([]); // ✅ keep it safe even on error
      }
    };

    fetchBlPrintTemplateData();
  }, [companyId, clientId, templateIdFromUrl]);

  // ✅ Edit mode: hydrate template name from fetched template record
  useEffect(() => {
    if (!templateIdFromUrl) {
      setEditTemplateName("");
      return;
    }
    if (!Array.isArray(storedTemplate) || storedTemplate.length === 0) return;
    const picked = storedTemplate.find(
      (t) => String(t.id) === String(templateIdFromUrl),
    );
    if (picked?.name) setEditTemplateName(String(picked.name));
  }, [templateIdFromUrl, storedTemplate]);

  //   }

  const [template, setTemplate] = useState(() => {
    const paper = PAPER_SIZES.find((p) => p.id === "A4") || PAPER_SIZES[4];

    const mainPageId = uid();

    return {
      id: uid(),
      name: "BL Template (Draft)",
      paper: { ...paper, orientation: "P" },
      margin: { t: 10, r: 10, b: 10, l: 10 },
      header: {
        enabled: false,
        heightMm: 25,
      },
      canGrowColumns: [],

      // ✅ NEW: pages (Main + Attachments)
      pages: [
        {
          id: mainPageId,
          name: "Main",
          elements: [],
          groups: {},
        },
      ],

      // optional: keep these for backward compat (old JSON)
      // (runtime aliases for active page)
      elements: [],
      groups: {},
    };
  });

  const templateRef = useRef(template);
  useEffect(() => {
    templateRef.current = template;
  }, [template]);

  const canGrowColumns = useMemo(
    () => normalizeCanGrowColumns(template?.canGrowColumns),
    [template?.canGrowColumns],
  );

  const canGrowColumnOptions = useMemo(
    () =>
      columns.map((c) => ({
        key: String(c.key || "").trim(),
        label: c.label || c.key || "",
      })),
    [columns],
  );

  const canGrowColumnLabelMap = useMemo(() => {
    const map = new Map();
    canGrowColumnOptions.forEach((opt) => {
      map.set(opt.key, opt.label);
    });
    return map;
  }, [canGrowColumnOptions]);

  function updateCanGrowColumns(nextValues) {
    const normalized = normalizeCanGrowColumns(nextValues);
    const next = {
      ...templateRef.current,
      canGrowColumns: normalized,
    };
    commit(next);
  }

  // keep templateRef synced immediately when needed (pointermove)
  const setTemplateLive = (next, pageIdOverride = null) => {
    const pid = pageIdOverride ?? activePageId;

    // keep active page aliases alive for legacy code paths
    const withPages = ensurePages(next);
    const persisted = syncActiveAliasesToPages(withPages, pid);
    const aliased = attachActiveElementsAlias(persisted, pid);

    templateRef.current = aliased;
    setTemplate(aliased);
  };

  const [ui, setUi] = useState({
    scale: 1,
    showGrid: true,
    showRulers: true,
    snap: true,
    snapThreshold: 2.5,
    extendMainTo2A4: false,
  });
  const [leftTab, setLeftTab] = useState("Assets");
  const [layerSearch, setLayerSearch] = useState("");
  const [rightTab, setRightTab] = useState("inspect");
  const [activeTool, setActiveTool] = useState("select");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [hoverId, setHoverId] = useState(null);

  const [activePageId, setActivePageId] = useState(() => null);

  const activePage = useMemo(
    () => getActivePage(ensurePages(template), activePageId),
    [template, activePageId],
  );

  const activeElements = activePage?.elements || [];

  const selected = useMemo(() => {
    const set = selectedIds;
    return activeElements.filter((e) => set.has(e.id));
  }, [activeElements, selectedIds]);

  const primarySelected = selected.length
    ? selected[selected.length - 1]
    : null;
  const [guides, setGuides] = useState({ x: null, y: null });

  /** ---------- Paper sizing ---------- */
  const paperMM = useMemo(() => {
    const p = template.paper;
    if (p.orientation === "L") return { w: p.h, h: p.w };
    return { w: p.w, h: p.h };
  }, [template.paper]);

  // Attachment page header/footer bands (mm)
  const isAttachmentPage = (activePage?.name || "Main") !== "Main";
  const attachBands = useMemo(() => {
    if (!isAttachmentPage) {
      return {
        headerMm: 0,
        footerMm: 0,
        bodyTopMm: 0,
        bodyBottomMm: paperMM.h,
      };
    }
    const headerMmRaw = Number(activePage?.attachHeaderMm ?? 25);
    const footerMmRaw = Number(activePage?.attachFooterMm ?? 25);
    const headerMm = Number.isFinite(headerMmRaw) ? headerMmRaw : 25;
    const footerMm = Number.isFinite(footerMmRaw) ? footerMmRaw : 25;
    const bodyTopMm = clamp(headerMm, 0, paperMM.h);
    const bodyBottomMmRaw = paperMM.h - clamp(footerMm, 0, paperMM.h);
    const bodyBottomMm = Math.max(
      bodyTopMm,
      clamp(bodyBottomMmRaw, 0, paperMM.h),
    );
    return { headerMm: bodyTopMm, footerMm, bodyTopMm, bodyBottomMm };
  }, [
    isAttachmentPage,
    activePage?.attachHeaderMm,
    activePage?.attachFooterMm,
    paperMM.h,
  ]);

  const editorPaperMM = useMemo(() => {
    if (!isAttachmentPage && ui.extendMainTo2A4) {
      return {
        w: paperMM.w,
        h: paperMM.h * 2,
      };
    }

    return {
      w: paperMM.w,
      h: paperMM.h,
    };
  }, [paperMM, isAttachmentPage, ui.extendMainTo2A4]);

  const paperPX = useMemo(() => {
    return {
      w: editorPaperMM.w * MM_TO_PX * ui.scale,
      h: editorPaperMM.h * MM_TO_PX * ui.scale,
    };
  }, [editorPaperMM, ui.scale]);

  const a4BreakYpx = useMemo(() => {
    if (isAttachmentPage || !ui.extendMainTo2A4) return null;
    return paperMM.h * MM_TO_PX * ui.scale;
  }, [isAttachmentPage, ui.extendMainTo2A4, paperMM.h, ui.scale]);

  /** ---------- History helpers ---------- */
  function pushHistory(next) {
    const h = historyRef.current;
    h.stack = h.stack.slice(0, h.idx + 1);
    h.stack.push(deepClone(next));
    h.idx++;
  }

  function commit(next) {
    const withPages = ensurePages(next);
    const pid = activePageId || withPages?.pages?.[0]?.id || null;

    // First: persist any runtime aliases (template.elements/groups) into the active page
    const persisted = syncActiveAliasesToPages(withPages, pid);

    // Then: re-hydrate runtime aliases from the active page so old code keeps working
    const hydrated = attachActiveElementsAlias(persisted, pid);

    // ✅ Ensure every element has neighbors metadata (non-destructive)
    const hydratedWithNeighbors = ensureNeighborsInTemplate(hydrated);

    setTemplateLive(hydratedWithNeighbors);
    pushHistory(hydratedWithNeighbors);

    // ✅ Auto-fix older saved templates (adds missing neighbors metadata)
    // This runs ONLY when the loaded DB template had no neighbors field.
    try {
      if (templateHasMissingNeighbors(persisted)) {
        const payloadFix = {
          TableName: "tblBlPrintTemplate",
          Record: {
            blPrintTemplateJson: JSON.stringify(hydratedWithNeighbors),
          },
          WhereCondition: `id = ${pid} and clientId = ${clientId}`,
        };

        // non-blocking; never break template load
        Promise.resolve(insertReportData(payloadFix))
          .then(() => {
            // keep local list in sync if present
            setStoredTemplate((prev) => {
              const arr = Array.isArray(prev) ? prev.slice() : [];
              const idx = arr.findIndex((t) => String(t.id) === String(pid));
              if (idx >= 0) {
                arr[idx] = {
                  ...arr[idx],
                  blPrintTemplateJson: payloadFix.Record.blPrintTemplateJson,
                };
                return arr;
              }
              return prev;
            });
          })
          .catch(() => { });
      }
    } catch { }
  }

  function switchToPage(nextPageId) {
    if (!nextPageId) return;

    // 1) persist current alias (template.elements/groups) into the CURRENT active page
    const cur = ensurePages(templateRef.current);
    const curPid = activePageId || cur.pages?.[0]?.id || null;
    const persisted = syncActiveAliasesToPages(cur, curPid);

    // 2) hydrate alias from the NEXT page into template.elements/groups
    const hydrated = attachActiveElementsAlias(persisted, nextPageId);

    // ✅ important: alias using the TARGET page id (not the old activePageId)
    setTemplateLive(hydrated, nextPageId);

    // ✅ update state
    setActivePageId(nextPageId);
    setSelectedIds(new Set());
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

  // (multi-page helpers are defined at module scope)
  useEffect(() => {
    const pages = getPages(templateRef.current);
    if (!pages.length) return;

    // ✅ ensure the ACTIVE alias (template.elements) always matches the active page
    if (!activePageId || !pages.some((p) => p.id === activePageId)) {
      // fallback to first page and hydrate aliases
      switchToPage(pages[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.pages, activePageId]);

  /** ---------- Local Save/Load ---------- */
  function saveLocal() {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify(ensurePages(templateRef.current)),
    );
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
    const data = ensurePages(templateRef.current);

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(data.name || "bl-template").replaceAll(" ", "_")}.json`;
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

  const makeId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now() + Math.random());

  const loadTemplate = (tpl) => {
    if (!tpl) return;

    const raw = typeof tpl === "string" ? JSON.parse(tpl) : tpl;

    // normalize full structure
    let next = {
      ...raw,
      header: raw?.header ?? { enabled: false, heightMm: 0 },
      canGrowColumns: normalizeCanGrowColumns(raw?.canGrowColumns),
      pages: Array.isArray(raw?.pages) ? raw.pages : null,
      elements: Array.isArray(raw?.elements) ? raw.elements : [],
      groups: raw?.groups || {},
    };

    // ✅ always ensure pages exist
    next = ensurePages(next);

    // ✅ ensure every element in every page has id (important!)
    next.pages = (next.pages || []).map((p) => ({
      ...p,
      elements: Array.isArray(p?.elements)
        ? p.elements.map((el) => ({ ...el, id: el?.id ?? makeId() }))
        : [],
      groups: p?.groups || {},
    }));

    // ✅ bind to first page always
    const firstPageId = next.pages?.[0]?.id;

    // clear interactions
    if (interactionRef.current) {
      interactionRef.current.mode = null;
      interactionRef.current.start = null;
      interactionRef.current.marquee = null;
    }
    clearSelection?.();

    // ✅ IMPORTANT: hydrate alias to first page so preview matches
    const hydrated = attachActiveElementsAlias(next, firstPageId);

    // ✅ commit as new template state (history)
    commit(hydrated);

    // ✅ switch active page correctly
    setActivePageId(firstPageId);
    setSelectedIds(new Set());
  };
  // ✅ Auto-load template directly from URL ?id=... (no dropdown)
  useEffect(() => {
    if (!templateIdFromUrl) return;
    if (!Array.isArray(storedTemplate) || storedTemplate.length === 0) return;

    // prevent repeated loads for same id
    if (autoLoadedTemplateIdRef.current === String(templateIdFromUrl)) return;

    const picked = storedTemplate.find(
      (t) => String(t.id) === String(templateIdFromUrl),
    );
    if (!picked) return;

    autoLoadedTemplateIdRef.current = String(templateIdFromUrl);

    try {
      const jsonStr = picked.blPrintTemplateJson;
      const tpl = typeof jsonStr === "string" ? JSON.parse(jsonStr) : jsonStr;
      loadTemplate(tpl);
    } catch (err) {
      console.warn("Template JSON invalid:", picked.blPrintTemplateJson, err);
    }
  }, [templateIdFromUrl, storedTemplate]);

  const getEmptyTemplate = () => ({
    id: crypto.randomUUID(),
    name: "Blank",
    paper: { id: "A4", name: "A4", w: 210, h: 297, orientation: "P" },
    margin: { t: 10, r: 10, b: 10, l: 10 },
    header: { enabled: false, heightMm: 20 },
    canGrowColumns: [],
    elements: [],
    groups: {},
  });

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

  // ✅ Select all (visible) elements
  function selectAllVisible() {
    const next = new Set(
      (templateRef.current.elements || [])
        .filter((e) => !e.hidden)
        .map((e) => e.id),
    );
    setSelectedIds(next);
    toast(next.size ? `Selected ${next.size} items` : "No elements to select");
  }

  // ✅ Select all (visible + unlocked) elements (optional convenience)
  function selectAllVisibleUnlocked() {
    const next = new Set(
      (templateRef.current.elements || [])
        .filter((e) => !e.hidden && !e.locked)
        .map((e) => e.id),
    );
    setSelectedIds(next);
    toast(next.size ? `Selected ${next.size} unlocked` : "No unlocked items");
  }

  // ✅ Apply style patch to ALL selected elements (works with multi-select)
  const applyStyleToSelection = React.useCallback(
    (stylePatch = {}) => {
      if (!stylePatch || typeof stylePatch !== "object") return;

      const selected =
        selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);
      if (!selected.size) return;

      const next = JSON.parse(JSON.stringify(templateRef.current));
      let changed = false;

      next.elements = (next.elements || []).map((el) => {
        if (!selected.has(el.id)) return el;
        if (el.locked) return el; // keep locked safe

        // ✅ Typography-only keys should apply only to text (and optionally table)
        const typographyKeys = new Set([
          "fontSize",
          "fontWeight",
          "align",
          "vAlign",
          "lineHeight",
          "letterSpacing",
        ]);

        const isTypographyPatch = Object.keys(stylePatch).some((k) =>
          typographyKeys.has(k),
        );

        if (isTypographyPatch && el.type !== "text") {
          return el;
        }

        const prev = el.style || {};
        const merged = { ...prev, ...stylePatch };
        const same = Object.keys(stylePatch).every(
          (k) => (prev?.[k] ?? null) === (merged?.[k] ?? null),
        );

        if (same) return el;

        changed = true;
        return { ...el, style: merged };
      });

      if (!changed) return;
      commit(next);
    },
    [selectedIds, commit],
  );

  const applyPatchToSelection = React.useCallback(
    (patch = {}) => {
      const selected =
        selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);
      if (!selected.size) return;

      const next = JSON.parse(JSON.stringify(templateRef.current));
      let changed = false;

      next.elements = (next.elements || []).map((el) => {
        if (!selected.has(el.id)) return el;
        if (el.locked) return el;
        changed = true;
        return { ...el, ...patch };
      });

      if (changed) commit(next);
    },
    [selectedIds, commit],
  );

  const getCommonStyleValue = React.useCallback(
    (key, fallback, onlyType = null) => {
      const selected =
        selectedIds instanceof Set ? selectedIds : new Set(selectedIds || []);
      if (!selected.size) return { value: String(fallback), mixed: false };

      let els = (templateRef.current?.elements || []).filter((e) =>
        selected.has(e.id),
      );
      if (onlyType) {
        els = els.filter((e) => e.type === onlyType);
      }
      if (!els.length) return { value: String(fallback), mixed: false };
      const values = els.map((e) => {
        const v = (e.style || {})[key];
        return String(v ?? fallback);
      });
      const first = values[0];
      const mixed = !values.every((v) => v === first);
      return { value: mixed ? "__MIXED__" : first, mixed };
    },
    [selectedIds],
  );

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

  function unGroupSelected() {
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

  // 4) inside BlCreatorPage(), add these helpers near copySelected()/pasteCopied()
  function writePageClipboard(page) {
    const safe = deepClone(page || null);
    pageClipboardRef.current = safe;

    try {
      localStorage.setItem(PAGE_CLIPBOARD_KEY, JSON.stringify(safe));
    } catch { }

    try {
      navigator.clipboard?.writeText("__BL_CREATOR_PAGE_COPY__");
    } catch { }
  }

  function readPageClipboard() {
    if (pageClipboardRef.current) return deepClone(pageClipboardRef.current);

    try {
      const raw = localStorage.getItem(PAGE_CLIPBOARD_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      pageClipboardRef.current = parsed;
      return deepClone(parsed);
    } catch {
      return null;
    }
  }

  function copyPage(pageId = activePageId) {
    const cur = ensurePages(templateRef.current);
    const idx = getActivePageIndex(cur, pageId);
    const page = cur.pages?.[idx];

    if (!page) return toast("No page to copy");

    writePageClipboard(page);
    toast(`Copied page: ${page.name || "Page"}`);
  }

  function pastePageInto(pageId = activePageId) {
    const copiedPage = readPageClipboard();
    if (!copiedPage) return toast("Copy a page first");

    const cur = ensurePages(templateRef.current);
    const idx = getActivePageIndex(cur, pageId);
    if (idx < 0) return toast("Target page not found");

    const targetPage = cur.pages?.[idx];
    if (!targetPage) return toast("Target page not found");

    const pasted = clonePageWithFreshElementIds(copiedPage);
    const next = deepClone(cur);

    const targetName = targetPage.name || pasted.name || "Page";
    const isMainTarget = String(targetName).trim().toLowerCase() === "main";

    next.pages[idx] = {
      ...targetPage, // keep destination slot identity
      ...pasted, // replace content/meta from copied page
      id: targetPage.id,
      name: targetName,
    };

    if (isMainTarget) {
      delete next.pages[idx].attachHeaderMm;
      delete next.pages[idx].attachFooterMm;
    } else {
      next.pages[idx].attachHeaderMm = Number(
        pasted.attachHeaderMm ?? targetPage.attachHeaderMm ?? 25,
      );
      next.pages[idx].attachFooterMm = Number(
        pasted.attachFooterMm ?? targetPage.attachFooterMm ?? 25,
      );
    }

    const hydrated = attachActiveElementsAlias(next, targetPage.id);
    commit(hydrated);
    switchToPage(targetPage.id);

    toast(`Pasted into ${targetName}`);
  }

  function copySelected() {
    const ids = [...selectedIds];
    if (!ids.length) return toast("Select element(s) to copy");

    const copied = (templateRef.current.elements || [])
      .filter((el) => ids.includes(el.id))
      .map((el) => deepClone(el));

    clipboardRef.current = {
      elements: copied,
      pasteCount: 0,
    };

    toast(`Copied ${copied.length} item${copied.length > 1 ? "s" : ""}`);
  }

  function pasteCopied() {
    const copied = clipboardRef.current?.elements || [];
    if (!copied.length) return toast("Nothing copied");

    const next = deepClone(templateRef.current);
    next.elements = Array.isArray(next.elements) ? next.elements : [];

    const step = 4;
    const pasteIndex = Number(clipboardRef.current.pasteCount || 0) + 1;
    const dx = step * pasteIndex;
    const dy = step * pasteIndex;

    const maxZ = Math.max(
      0,
      ...(next.elements || []).map((e) => Number(e.z || 0)),
    );
    const newIds = new Set();

    const clones = copied.map((src, index) => {
      const el = deepClone(src);

      el.id = uid();
      el.groupId = null;
      el.hidden = false;
      el.locked = false;
      el.z = maxZ + index + 1 + Math.random();

      el.neighbors = {
        topId: null,
        bottomId: null,
        leftId: null,
        rightId: null,
      };

      if (el.type === "table" && el.table) {
        el.table.activeCell = null;
        el.table.range = null;
      }

      el.x = clamp(
        round2(Number(el.x || 0) + dx),
        0,
        Math.max(0, paperMM.w - Number(el.w || 1)),
      );

      el.y = clampYByAttachBand(
        round2(Number(el.y || 0) + dy),
        Number(el.h || 1),
        el.attachBand || "body",
      );

      newIds.add(el.id);
      return el;
    });

    next.elements.push(...clones);
    clipboardRef.current.pasteCount = pasteIndex;

    commit(next);
    setSelectedIds(newIds);

    toast(`Pasted ${clones.length} item${clones.length > 1 ? "s" : ""}`);
  }

  function copySelectedWidth() {
    if (!primarySelected) return toast("Select one element to copy width");

    sizeClipboardRef.current.width = round2(Number(primarySelected.w || 0));
    toast(`Width copied: ${sizeClipboardRef.current.width} mm`);
  }

  function copySelectedHeight() {
    if (!primarySelected) return toast("Select one element to copy height");

    sizeClipboardRef.current.height = round2(Number(primarySelected.h || 0));
    toast(`Height copied: ${sizeClipboardRef.current.height} mm`);
  }

  function getMaxAllowedWidth(el) {
    return Math.max(0.1, paperMM.w - Number(el?.x || 0));
  }

  function getMaxAllowedHeight(el) {
    const y = Number(el?.y || 0);
    const band = String(el?.attachBand || "body").toLowerCase();

    if (!isAttachmentPage) {
      return Math.max(0.1, paperMM.h - y);
    }

    if (band === "header") {
      return Math.max(0.1, attachBands.headerMm - y);
    }

    if (band === "footer") {
      const footerTop = paperMM.h - attachBands.footerMm;
      return Math.max(0.1, paperMM.h - Math.max(y, footerTop));
    }

    return Math.max(0.1, attachBands.bodyBottomMm - y);
  }

  function pasteSelectedWidth() {
    const copiedWidth = Number(sizeClipboardRef.current.width);

    if (!Number.isFinite(copiedWidth) || copiedWidth <= 0) {
      return toast("Copy width first");
    }

    if (!selected.length) return toast("Select target element(s)");

    const next = deepClone(templateRef.current);
    let changed = 0;

    for (const el of next.elements || []) {
      if (!selectedIds.has(el.id) || el.locked) continue;

      const maxW = getMaxAllowedWidth(el);
      el.w = round2(clamp(copiedWidth, 0.1, maxW));
      changed++;
    }

    if (!changed) return toast("No editable target selected");

    commit(next);
    toast(`Width pasted to ${changed} item${changed > 1 ? "s" : ""}`);
  }

  function pasteSelectedHeight() {
    const copiedHeight = Number(sizeClipboardRef.current.height);

    if (!Number.isFinite(copiedHeight) || copiedHeight <= 0) {
      return toast("Copy height first");
    }

    if (!selected.length) return toast("Select target element(s)");

    const next = deepClone(templateRef.current);
    let changed = 0;

    for (const el of next.elements || []) {
      if (!selectedIds.has(el.id) || el.locked) continue;

      const maxH = getMaxAllowedHeight(el);
      el.h = round2(clamp(copiedHeight, 0.1, maxH));
      changed++;
    }

    if (!changed) return toast("No editable target selected");

    commit(next);
    toast(`Height pasted to ${changed} item${changed > 1 ? "s" : ""}`);
  }

  /** ---------- Drag from left panel into canvas ---------- */
  function onDragStartTool(e, toolType) {
    e.dataTransfer.setData("application/x-bltool", toolType);
    e.dataTransfer.effectAllowed = "copy";
  }

  function canvasPointMmFromClient(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
    const xMm = xPx / ui.scale / MM_TO_PX;
    const yMm = yPx / ui.scale / MM_TO_PX;
    return { x: xMm, y: yMm };
  }

  function onCanvasDrop(e) {
    try {
      e.preventDefault();
      e.stopPropagation();

      const dt = e.dataTransfer;

      // IMPORTANT: ToolIcon uses onDragStartTool -> "application/x-bltool"
      const raw =
        dt.getData("application/x-bltool") ||
        dt.getData("application/x-blcreator") ||
        dt.getData("text/plain") ||
        "";

      if (!raw) return;

      const mapType = (s) => {
        const t = String(s || "")
          .trim()
          .toLowerCase();
        if (t === "text") return "text";
        if (t === "box") return "box";
        if (t === "image") return "image";
        if (t === "table") return "table";
        if (t === "lineh" || t === "line_h" || t === "line-h" || t === "h")
          return "lineH";
        if (t === "linev" || t === "line_v" || t === "line-v" || t === "v")
          return "lineV";
        return null;
      };

      const elType = mapType(raw);
      if (!elType) return;

      // Use your existing helper (already in file)
      const pt = canvasPointMmFromClient(e);
      const headerOffset = templateRef.current?.header?.enabled
        ? Number(templateRef.current?.header?.heightMm || 0)
        : 0;

      const next = updateActivePage(
        templateRef.current,
        activePageId,
        (page) => {
          const els = Array.isArray(page.elements) ? page.elements : [];
          page.elements = [
            ...els,
            makeElement(
              elType,
              clamp(pt.x, 0, paperMM.w - 10),
              clamp(
                pt.y,
                headerOffset,
                (isAttachmentPage ? paperMM.h : editorPaperMM.h) - 10,
              ),
            ),
          ];
          return page;
        },
      );

      commit(next);
    } catch (err) {
      console.error("Drop failed:", err);
    }
  }

  /** ---------- Inline text edit ---------- */
  const [editingId, setEditingId] = useState(null);
  const [textDraft, setTextDraft] = useState("");
  const [textSel, setTextSel] = useState({ start: 0, end: 0 });
  const textAreaRef = useRef(null);

  // update template WITHOUT pushing history (smooth typing)
  function setTemplateSilent(mutator) {
    setTemplate((prev) => {
      let next = attachActiveElementsAlias(deepClone(prev), activePageId);
      mutator(next);
      next = syncActiveAliasesToPages(next, activePageId);
      next = attachActiveElementsAlias(next, activePageId);
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
    } catch { }
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
      (x) => selSet.has(x.id) && !x.locked && !x.hidden,
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

  function clampYByAttachBand(y, elH, band) {
    const safeElH = Number(elH || 1);

    // Main page can optionally extend to 2x A4 in editor only
    if (!isAttachmentPage) {
      return clamp(round2(y), 0, Math.max(0, editorPaperMM.h - safeElH));
    }

    const top = attachBands.bodyTopMm;
    const bottom = attachBands.bodyBottomMm;
    const safeBottom = Math.max(0, paperMM.h - safeElH);

    if (band === "header") {
      return clamp(round2(y), 0, Math.max(0, top - safeElH));
    }
    if (band === "footer") {
      return clamp(round2(y), bottom, Math.max(bottom, safeBottom));
    }

    return clamp(round2(y), top, Math.max(top, bottom - safeElH));
  }
  function prepareSnapForSelection(selSet) {
    return {
      targets: buildSnapTargets(templateRef.current.elements || [], selSet),
      canvas: {
        x: [
          { axis: "x", v: 0, type: "edge" },
          { axis: "x", v: paperMM.w, type: "edge" },
          { axis: "x", v: paperMM.w / 2, type: "center" },
        ],
        y: [
          { axis: "y", v: 0, type: "edge" },
          {
            axis: "y",
            v: isAttachmentPage ? paperMM.h : editorPaperMM.h,
            type: "edge",
          },
          {
            axis: "y",
            v: (isAttachmentPage ? paperMM.h : editorPaperMM.h) / 2,
            type: "center",
          },
          ...(isAttachmentPage && attachBands.bodyTopMm > 0
            ? [{ axis: "y", v: attachBands.bodyTopMm, type: "band" }]
            : []),
          ...(isAttachmentPage && attachBands.bodyBottomMm < paperMM.h
            ? [{ axis: "y", v: attachBands.bodyBottomMm, type: "band" }]
            : []),
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
    interactionRef.current.startEls = deepClone(
      templateRef.current.elements || [],
    );

    const selSet = selSetOverride || new Set(selectedIds);
    selSet.add(id);

    interactionRef.current.snap = prepareSnapForSelection(selSet);

    e.preventDefault();
    e.stopPropagation();
  }

  function startDrag(e, id) {
    if (activeTool === "hand") return startPan(e);

    const el = (templateRef.current.elements || []).find((x) => x.id === id);
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
      interactionRef.current.startEls = deepClone(
        templateRef.current.elements || [],
      );

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
    const el = (templateRef.current.elements || []).find((x) => x.id === id);
    if (!el || el.locked) return;

    if (!selectedIds.has(id)) setOnlySelected(id);

    interactionRef.current.mode = "resize";
    interactionRef.current.start = getPointerMM(e);
    interactionRef.current.startEls = deepClone(
      templateRef.current.elements || [],
    );
    interactionRef.current.handle = handle;

    const selSet = new Set([id]);
    interactionRef.current.snap = prepareSnapForSelection(selSet);

    e.preventDefault();
    e.stopPropagation();
  }

  function startRotate(e, id) {
    const el = (templateRef.current.elements || []).find((x) => x.id === id);
    if (!el || el.locked) return;
    if (!selectedIds.has(id)) setOnlySelected(id);
    const start = getPointerMM(e);
    const cx = el.x + el.w / 2;
    const cy = el.y + el.h / 2;
    const ang0 = (Math.atan2(start.y - cy, start.x - cx) * 180) / Math.PI;

    interactionRef.current.mode = "rotate";
    interactionRef.current.start = start;
    interactionRef.current.startEls = deepClone(
      templateRef.current.elements || [],
    );
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
    if (e.target !== canvasRef.current) return;

    // ---- Image drop handling (unchanged) ----
    if (e.dataTransfer?.files?.length) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          const { x, y } = canvasPointMmFromClient(e);
          const next = deepClone(templateRef.current);
          const el = makeElement("image", x, y);
          el.src = reader.result;
          next.elements.push(el);
          commit(next);
        };
        reader.readAsDataURL(file);
      }
    }

    const p = getPointerMM(e);

    // ✅ ENSURE interactionRef.current is always an object
    if (!interactionRef.current) {
      interactionRef.current = {
        mode: null,
        start: null,
        marquee: null,
        dragging: null,
        resizing: null,
        rotating: null,
        panning: null,
      };
    }
    if (!interactionRef.current) interactionRef.current = {};
    const ref = interactionRef.current;
    if (!ref) return;

    // ---- Start marquee safely ----
    ref.mode = "marquee";
    ref.start = p;
    ref.marquee = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };

    if (!e.ctrlKey && !e.metaKey) clearSelection();
    e.preventDefault();
  }

  function patchActivePageMeta(patch) {
    const cur = ensurePages(templateRef.current);
    const pid = activePageId || cur?.pages?.[0]?.id || null;
    if (!pid) return;
    const next = deepClone(cur);
    const idx = next.pages.findIndex((p) => p.id === pid);
    if (idx === -1) return;
    next.pages[idx] = { ...(next.pages[idx] || {}), ...(patch || {}) };
    commit(next);
  }

  function addAttachmentPage() {
    const next = deepClone(ensurePages(templateRef.current));
    const n = next.pages.length;
    const id = uid();

    next.pages.push({
      id,
      name: `Attachment ${n}`,
      elements: [],
      groups: {},
      // Attachment header/footer bands (mm)
      attachHeaderMm: 25,
      attachFooterMm: 25,
    });

    commit(next); // save structure
    switchToPage(id); // ✅ bind editor to new attachment page
    toast("Attachment added");
  }

  function deleteActiveAttachmentPage() {
    const next = deepClone(ensurePages(templateRef.current));
    if (!next.pages?.length || next.pages.length === 1)
      return toast("Can't delete Main page");

    const currentId = activePageId || next.pages[0].id;
    const idx = next.pages.findIndex((p) => p.id === currentId);
    if (idx <= 0) return toast("Can't delete Main page");

    next.pages.splice(idx, 1);
    commit(next);

    // ✅ switch to main after delete
    switchToPage(next.pages[0].id);

    toast("Attachment deleted");
  }

  function deleteActivePage() {
    const cur = ensurePages(templateRef.current);
    const pages = getPages(cur);

    if (pages.length <= 1) return toast("Main page can't be deleted");

    const idx = getActivePageIndex(cur, activePageId);
    const page = pages[idx];

    if (page?.name === "Main") return toast("Main page can't be deleted");

    const next = deepClone(cur);
    next.pages = pages.filter((p) => p.id !== page.id);

    // ✅ switch to Main after delete and hydrate aliases (so Main/Attachment don't mirror)
    const main = next.pages.find((p) => p.name === "Main") || next.pages[0];
    const hydrated = attachActiveElementsAlias(next, main.id);
    commit(hydrated);
    setActivePageId(main.id);
    setSelectedIds(new Set());
    toast("Attachment deleted");
  }

  // function switchToPage(nextPageId) {
  //   if (!nextPageId) return;

  //   // ✅ persist CURRENT active aliases (template.elements/groups) into the current page first
  //   const cur = ensurePages(templateRef.current);
  //   const curPid = activePageId || cur.pages?.[0]?.id || null;
  //   const persisted = syncActiveAliasesToPages(cur, curPid);

  //   // ✅ hydrate ACTIVE aliases from the target page
  //   const aliased = attachActiveElementsAlias(persisted, nextPageId);

  //   // reset selection/editing when switching
  //   setSelectedIds(new Set());
  //   setEditingId(null);

  //   // page switch should NOT be an undo step
  //   setTemplateLive(aliased);
  //   setActivePageId(nextPageId);
  // }

  function switchToPage(nextPageId) {
    if (!nextPageId) return;

    // ✅ persist CURRENT active aliases (template.elements/groups) into the current page first
    const cur = ensurePages(templateRef.current);
    const curPid = activePageId || cur.pages?.[0]?.id || null;
    const persisted = syncActiveAliasesToPages(cur, curPid);

    // ✅ hydrate ACTIVE aliases from the target page
    const aliased = attachActiveElementsAlias(persisted, nextPageId);

    // reset selection/editing when switching
    setSelectedIds(new Set());
    setEditingId(null);

    // ✅ important: alias using the TARGET page id (not the old activePageId)
    setTemplateLive(aliased, nextPageId);
    setActivePageId(nextPageId);
  }

  /** ---------- Table divider drag ---------- */
  function startTableColDrag(e, tableElId, colIdx) {
    const el = (templateRef.current.elements || []).find(
      (x) => x.id === tableElId,
    );
    if (!el || el.locked || el.type !== "table") return;
    if (!selectedIds.has(el.id)) setOnlySelected(el.id);

    interactionRef.current.mode = "table-col";
    interactionRef.current.start = getPointerMM(e);
    interactionRef.current.startEls = deepClone(
      templateRef.current.elements || [],
    );
    interactionRef.current.table = { id: tableElId, colIdx };
    e.preventDefault();
    e.stopPropagation();
  }

  function startTableRowDrag(e, tableElId, rowIdx) {
    const el = (templateRef.current.elements || []).find(
      (x) => x.id === tableElId,
    );
    if (!el || el.locked || el.type !== "table") return;
    if (!selectedIds.has(el.id)) setOnlySelected(el.id);

    interactionRef.current.mode = "table-row";
    interactionRef.current.start = getPointerMM(e);
    interactionRef.current.startEls = deepClone(
      templateRef.current.elements || [],
    );
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
      const mode = interactionRef.current?.mode;
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
        for (const el of templateRef.current.elements || []) {
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
            (a, b) => a.delta - b.delta,
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
            (a, b) => a.delta - b.delta,
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
          el.y = clampYByAttachBand(
            s0.y + finalDy,
            el.h,
            el.attachBand || "body",
          );
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

        const maxEditorH = isAttachmentPage ? paperMM.h : editorPaperMM.h;

        if (handle.includes("e")) w = clamp(startEl.w + dx, minW, paperMM.w);
        if (handle.includes("s")) h = clamp(startEl.h + dy, minH, maxEditorH);
        if (handle.includes("w")) {
          const newW = clamp(startEl.w - dx, minW, paperMM.w);
          x = startEl.x + (startEl.w - newW);
          w = newW;
        }
        if (handle.includes("n")) {
          const newH = clamp(startEl.h - dy, minH, maxEditorH);
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
        el.y = clampYByAttachBand(y, h, el.attachBand || "body");
        el.w = clamp(round2(w), 1, paperMM.w);
        el.h = clamp(round2(h), 1, maxEditorH);

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
          (startEl.table.colW[colIdx] || 60) + deltaPx,
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
          (startEl.table.rowH[rowIdx] || 28) + deltaPx,
        );
        const totalHpx = t.rowH.reduce((a, b) => a + b, 0) + 2;
        el.h = Math.max(10, totalHpx / MM_TO_PX);
        setTemplateLive(next);
        return;
      }
    }

    function onUp() {
      const mode = interactionRef.current?.mode;
      if (!mode) return;
      if (mode === "pending") {
        const pending = pendingTextEditRef.current;
        const id = pending?.id;
        pendingTextEditRef.current = null;
        resetInteraction();

        if (!pointerMovedRef.current && id) {
          const el = (templateRef.current.elements || []).find(
            (x) => x.id === id,
          );
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

  /** ---------- Keyboard shortcuts + spaceBar pan ---------- */
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

      // ✅ Ctrl/Cmd + A => Select All (only when NOT typing in inputs)
      if (mod && e.key.toLowerCase() === "a") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag === "input" || tag === "textarea") return; // don't hijack typing
        e.preventDefault();

        // Option: hold Shift to select only unlocked
        if (e.shiftKey) selectAllVisibleUnlocked();
        else selectAllVisible();

        return;
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
        unGroupSelected();
      } else if (e.key === "Escape") {
        setEditingId(null);
        setActiveTool("select");
        setSpaceDown(false);
      }

      if (mod && e.key.toLowerCase() === "c") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        const isTyping =
          tag === "input" ||
          tag === "textarea" ||
          document.activeElement?.isContentEditable;

        if (isTyping) return;

        e.preventDefault();
        e.stopPropagation();

        // clear any accidental browser text selection
        try {
          window.getSelection()?.removeAllRanges();
        } catch { }

        copySelected();
        return;
      }

      if (mod && e.key.toLowerCase() === "v") {
        const tag = document.activeElement?.tagName?.toLowerCase();
        const isTyping =
          tag === "input" ||
          tag === "textarea" ||
          document.activeElement?.isContentEditable;

        if (isTyping) return;

        e.preventDefault();
        e.stopPropagation();
        pasteCopied();
        return;
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

  useEffect(() => {
    function isTypingTarget() {
      const el = document.activeElement;
      const tag = el?.tagName?.toLowerCase();
      return tag === "input" || tag === "textarea" || el?.isContentEditable;
    }

    function onNativeCopy(e) {
      if (isTypingTarget()) return;

      if (!selectedIds || selectedIds.size === 0) return;

      e.preventDefault();
      e.stopPropagation();

      try {
        window.getSelection()?.removeAllRanges();
      } catch { }

      copySelected();

      // optional: put marker text in system clipboard
      // so browser does not copy random selected text
      try {
        e.clipboardData?.setData("text/plain", "__BL_CREATOR_ELEMENT_COPY__");
      } catch { }
    }

    function onNativeCut(e) {
      if (isTypingTarget()) return;

      if (!selectedIds || selectedIds.size === 0) return;

      e.preventDefault();
      e.stopPropagation();

      try {
        window.getSelection()?.removeAllRanges();
      } catch { }

      copySelected();
      deleteSelected();

      try {
        e.clipboardData?.setData("text/plain", "__BL_CREATOR_ELEMENT_CUT__");
      } catch { }
    }

    function onNativePaste(e) {
      if (isTypingTarget()) return;

      const hasCopied = !!clipboardRef.current?.elements?.length;
      if (!hasCopied) return;

      e.preventDefault();
      e.stopPropagation();
      pasteCopied();
    }

    window.addEventListener("copy", onNativeCopy);
    window.addEventListener("cut", onNativeCut);
    window.addEventListener("paste", onNativePaste);

    return () => {
      window.removeEventListener("copy", onNativeCopy);
      window.removeEventListener("cut", onNativeCut);
      window.removeEventListener("paste", onNativePaste);
    };
  }, [selectedIds]);

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
      const elementsHtml = renderElementsToHtml(
        templateRef.current.elements || [],
      );

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

      console.log("ak html", html);

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
            } catch { }
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
      setTimeout(() => {
        try {
          if (iframe.isConnected) doPrint();
        } catch { }
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

  function saveDataSchemaFromJson() {
    const parsed = safeParseJson(schemaJsonText || "");
    if (!parsed.ok) {
      toast(`Invalid JSON: ${parsed.error}`);
      return;
    }
    const schema = buildSchemaFromSample(parsed.value);
    const next = deepClone(templateRef.current);
    next.dataSchema = schema;
    commit(next);
    toast("Data schema saved");
    setSchemaModalOpen(false);
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

  // function bindActiveTableCellToColumn(col) {
  //   if (!primarySelected || primarySelected.type !== "table") return;
  //   const t = primarySelected.table;
  //   if (!t?.activeCell) return toast("Click a table cell first");
  //   const k = cellKey(t.activeCell.r, t.activeCell.c);
  //   const next = deepClone(templateRef.current);
  //   const el = next.elements.find((x) => x.id === primarySelected.id);
  //   if (!el || el.type !== "table") return;
  //   el.table.bindings = el.table.bindings || {};
  //   el.table.bindings[k] = { columnKey: col.key, label: col.label };
  //   commit(next);
  //   toast(`Bound to ${col.label}`);
  // }

  function bindActiveTableCellToColumn(col) {
    if (!primarySelected || primarySelected.type !== "table") return;
    const t = primarySelected.table;
    if (!t?.activeCell) return toast("Click a table cell first");

    const k = cellKey(t.activeCell.r, t.activeCell.c);
    const next = deepClone(templateRef.current);
    const el = next.elements.find((x) => x.id === primarySelected.id);
    if (!el || el.type !== "table") return;

    el.table.bindings = el.table.bindings || {};

    // ✅ store only the real field key; do NOT store label for rendering
    el.table.bindings[k] = { columnKey: col.key };

    commit(next);
    toast(`Bound to {{${col.key}}}`);
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
    const els = Array.isArray(activeElements) ? activeElements : [];
    return [...els].sort((a, b) => (a?.z || 0) - (b?.z || 0));
  }, [activeElements]);

  /** ---------- Marquee UI ---------- */
  const marquee = interactionRef.current?.marquee ?? null;

  const marqueePx = useMemo(() => {
    if (!marquee) return null;

    const x0 = Math.min(marquee.x0, marquee.x1);
    const y0 = Math.min(marquee.y0, marquee.y1);
    const x1 = Math.max(marquee.x0, marquee.x1);
    const y1 = Math.max(marquee.y0, marquee.y1);

    const scalePx = MM_TO_PX * ui.scale;

    return {
      left: x0 * scalePx,
      top: y0 * scalePx,
      width: (x1 - x0) * scalePx,
      height: (y1 - y0) * scalePx,
    };
  }, [marquee, ui.scale]);

  const guidePx = useMemo(() => {
    return {
      x: guides.x == null ? null : guides.x * MM_TO_PX * ui.scale,
      y: guides.y == null ? null : guides.y * MM_TO_PX * ui.scale,
    };
  }, [guides, ui.scale]);

  /** ---------- Layers list (ACTIVE PAGE) ---------- */
  const layerItems = useMemo(() => {
    const els = Array.isArray(activeElements) ? activeElements : [];
    return [...els]
      .filter((e) => !e?.hidden)
      .sort((a, b) => (b?.z || 0) - (a?.z || 0));
  }, [activeElements]);
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
        title={name}
      >
        <Icon name={icon} />
        {/* <div style={styles.toolIconLabel}>{name}</div> */}
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
            {/* <Icon name={t.icon} size={15} /> */}
            <span style={{ fontSize: 10, fontWeight: 800 }}>{t.label}</span>
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
      const textOpacity = clamp(Number(s.opacity ?? 1), 0, 1);
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
        opacity: textOpacity, // ✅ NEW
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
                      (templateRef.current.elements || []).find(
                        (x) => x.id === el.id,
                      )?.text || "";
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
                  opacity: textOpacity,
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

    if (el.type === "image") {
      const s = el.style || {};
      return (
        <div style={baseBox} {...commonEvents}>
          <img
            src={el.src}
            draggable={false}
            style={{
              width: "100%",
              height: "100%",
              objectFit: el.fit || "contain",
              opacity: el.opacity ?? 1,
              borderRadius: (s.borderRadius || 0) * ui.scale,
              border:
                (s.borderWidth ?? 0) > 0
                  ? `${s.borderWidth}px ${s.borderStyle || "solid"} ${s.borderColor || "#111827"
                  }`
                  : "none",
              background: s.bg || "transparent",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
          {selectionHandles}
        </div>
      );
    }

    if (el.type === "box") {
      const boxStyle = {
        background: s.bg || "transparent",
        border: `${s.borderWidth ?? 1}px ${s.borderStyle || "solid"} ${s.borderColor || "#111827"
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
            background: "rgba(2,6,23,.45)",
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
              background: "rgba(2,6,23,.45)",
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
    const border = `${t.borderWidth ?? 1}px solid ${t.borderColor || "#111827"
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
          background: "#ffffff",
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

                  const repeat = t.repeat || {};
                  const colsMeta = Array.isArray(repeat.columns)
                    ? repeat.columns
                    : [];
                  const isRepeat = !!repeat.enabled && colsMeta.length > 0;

                  const b = bindings[cellKey(r, c)];

                  // Label rules:
                  // - Normal table: show bound token for active cell binding
                  // - Repeat table: row 0 is header labels, rows 1..N show {{fieldKey}} placeholders
                  let label = "";
                  if (isRepeat) {
                    const cm = colsMeta[c];
                    if (r === 0) label = cm?.label ?? cm?.key ?? "";
                    else label = cm?.key ? `{{${cm.key}}}` : "";
                  } else {
                    // ✅ always show token, never label
                    label = b?.columnKey ? `{{${b.columnKey}}}` : "";
                  }

                  const csx = cellStyle[cellKey(r, c)] || {};
                  const cellPad =
                    (csx.padding ?? t.cellPadding ?? 6) * ui.scale;
                  const cellBg =
                    csx.bg ?? (inRange(r, c) ? "rgba(37,99,235,.08)" : "#fff");
                  const cellColor = csx.color ?? "#0f172a";
                  const cellFs = (csx.fontSize ?? t.fontSize ?? 11) * ui.scale;
                  const cellFw = csx.fontWeight ?? 600;
                  const cellAlign =
                    csx.align ??
                    (isRepeat ? colsMeta[c]?.align || "left" : "left");
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 12, fontWeight: 900, lineHeight: 1 }}>
              CRO Creator
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
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: isAttachmentPage ? "#94a3b8" : "#0f172a",
              userSelect: "none",
              cursor: isAttachmentPage ? "not-allowed" : "pointer",
              padding: "0 8px",
            }}
            title={
              isAttachmentPage
                ? "This option is only for Main page editor view"
                : "Extend Main page editor height to 2x A4"
            }
          >
            <input
              type="checkbox"
              disabled={isAttachmentPage}
              checked={!isAttachmentPage && ui.extendMainTo2A4}
              onChange={(e) =>
                setUi((s) => ({
                  ...s,
                  extendMainTo2A4: e.target.checked,
                }))
              }
            />
            2× A4 height
          </label>
        </div>

        <div style={styles.topActions}>
          <IconButton
            title="Copy (Ctrl+C)"
            icon="copy"
            onClick={copySelected}
          />
          <IconButton
            title="Paste (Ctrl+V)"
            icon="paste"
            onClick={pasteCopied}
          />

          <button
            onClick={copySelectedWidth}
            style={styles.softBtn}
            title="Copy Width"
          >
            CW
          </button>
          <button
            onClick={pasteSelectedWidth}
            style={styles.softBtn}
            title="Paste Width"
          >
            PW
          </button>
          <button
            onClick={copySelectedHeight}
            style={styles.softBtn}
            title="Copy Height"
          >
            CH
          </button>
          <button
            onClick={pasteSelectedHeight}
            style={styles.softBtn}
            title="Paste Height"
          >
            PH
          </button>
          <IconButton title="Undo (Ctrl+Z)" icon="undo" onClick={undo} />
          <IconButton title="Redo (Ctrl+Y)" icon="redo" onClick={redo} />
          {/* <IconButton
            title="Select All (Ctrl+A)"
            icon="mag"
            onClick={selectAllVisible}
          /> */}
          {/* <button
            onClick={selectAllVisibleUnlocked}
            style={styles.softBtn}
            title="Select All Unlocked (Ctrl+Shift+A)"
          >
            Select Unlocked
          </button> */}
          {/* <div style={styles.sep} /> */}

          <IconButton
            title="Group (Ctrl+G)"
            icon="group"
            onClick={groupSelected}
          />
          <IconButton
            title="Ungroup (Ctrl+U)"
            icon="ungroup"
            onClick={unGroupSelected}
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

          <IconButton title="Print" icon="print" onClick={printTemplate} />
          <div style={styles.sep} />
          {isEditMode ? (
            <>
              <TextField
                size="small"
                label="Template Name"
                value={editTemplateName}
                onChange={(e) => setEditTemplateName(e.target.value)}
                placeholder="Template name"
                InputLabelProps={{
                  shrink: true,
                  sx: { fontSize: 10 },
                }}
                sx={{
                  minWidth: 120,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    background: "#0f172a",
                    color: "#fff",
                    border: "1px solid rgba(255, 255, 255, 0.18)",
                    minHeight: 32,
                    fontSize: 11,
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "6px 10px",
                  },
                }}
              />
              <Button
                size="small"
                variant="contained"
                disabled={!editTemplateName.trim() || !templateIdFromUrl}
                onClick={async () => {
                  if (!templateIdFromUrl) return;
                  if (!editTemplateName.trim()) return;

                  const toSave0 = syncActiveAliasesToPages(
                    templateRef.current,
                    activePageId,
                  );
                  const toSave = ensureNeighborsInTemplate(toSave0);

                  const payload = {
                    TableName: "tblBlPrintTemplate",
                    Record: {
                      name: editTemplateName.trim(),
                      blPrintTemplateJson: JSON.stringify(toSave),
                      templateType: "cro",
                    },
                    WhereCondition: `id = ${templateIdFromUrl} and clientId = ${clientId}`,
                  };

                  try {
                    await insertReportData(payload);
                    toast("Template updated successfully");

                    // keep local copy in sync
                    setStoredTemplate((prev) => {
                      const arr = Array.isArray(prev) ? prev.slice() : [];
                      if (!arr.length) return prev;
                      const idx = arr.findIndex(
                        (t) => String(t.id) === String(templateIdFromUrl),
                      );
                      if (idx >= 0) {
                        arr[idx] = {
                          ...arr[idx],
                          name: editTemplateName.trim(),
                          blPrintTemplateJson:
                            payload.Record.blPrintTemplateJson,
                        };
                        return arr;
                      }
                      return prev;
                    });
                  } catch (err) {
                    console.error("Error updating template", err);
                    toast("Update failed");
                  }
                }}
                sx={{
                  height: 32,
                  ml: 1,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: 11,
                }}
              >
                Update
              </Button>
            </>
          ) : (
            <>
              <TextField
                size="small"
                label="New Template"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Enter template"
                InputLabelProps={{
                  shrink: true,
                  sx: { fontSize: 10 },
                }}
                sx={{
                  minWidth: 120,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    background: "rgba(255,255,255,.92)",
                    color: "#0f172a",
                    minHeight: 32,
                    fontSize: 11,
                  },
                  "& .MuiOutlinedInput-input": {
                    padding: "6px 10px",
                  },
                }}
              />
              <Button
                size="small"
                variant="contained"
                disabled={!newTemplateName.trim()}
                onClick={async () => {
                  if (!newTemplateName.trim()) return;

                  const toSave0 = syncActiveAliasesToPages(
                    templateRef.current,
                    activePageId,
                  );
                  const toSave = ensureNeighborsInTemplate(toSave0);

                  const payload = {
                    TableName: "tblBlPrintTemplate",
                    Record: {
                      name: newTemplateName.trim(),
                      blOfId: companyId,
                      clientId: clientId,
                      draftFinal: "D",
                      blPrintTemplateJson: JSON.stringify(toSave),
                      status: 1,
                      createdBy: userId,
                      templateType: "cro",
                    },
                    WhereCondition: null,
                  };

                  try {
                    await insertReportData(payload);
                    toast("Template saved successfully");
                    setNewTemplateName("");
                  } catch (err) {
                    console.error("Error saving template", err);
                    toast("Save failed");
                  }
                }}
                sx={{
                  height: 32,
                  ml: 1,
                  borderRadius: "10px",
                  textTransform: "none",
                  fontSize: 11,
                }}
              >
                Save
              </Button>
            </>
          )}

          {/* <IconButton
            title="DB Fields (tab)"
            icon="db"
            onClick={() => setRightTab("fields")}
          /> */}

          {/* <div style={styles.sep} /> */}
          {/* <button
            onClick={exportPDF}
            style={styles.softBtn}
            title="PDF (print to PDF)"
          >
            PDF
          </button> */}
        </div>
      </div>

      <div style={styles.body}>
        <div className="blc-ui" style={styles.left}>
          <Tabs
            value={leftTab}
            onChange={setLeftTab}
            tabs={[
              { id: "assets", label: "Assets", icon: "mag" },
              { id: "arrange", label: "Arrange", icon: "mag" },
            ]}
          />

          <div style={styles.leftSection}>
            {/* ✅ PAGES / ATTACHMENTS PANEL (always visible) */}
            <div
              style={{
                padding: 10,
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,.18)",
                background: "rgba(255,255,255,.02)",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                {/* <div style={{ fontWeight: 800, fontSize: 13 }}>Pages</div> */}

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={addAttachmentPage}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: "1px solid rgba(148,163,184,.28)",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                    title="Add Attachment Page"
                  >
                    Add Attachment Page
                  </button>

                  <button
                    type="button"
                    onClick={deleteActivePage}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 10,
                      border: "1px solid rgba(148,163,184,.28)",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                    title="Delete Active Attachment Page"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                {(template.pages || []).map((p) => {
                  const active = p.id === activePageId;

                  return (
                    <div
                      key={p.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto auto",
                        gap: 6,
                        alignItems: "stretch",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => switchToPage(p.id)}
                        style={{
                          textAlign: "left",
                          padding: "10px 10px",
                          borderRadius: 10,
                          border: active
                            ? "1px solid #2563eb"
                            : "1px solid rgba(148,163,184,0.28)",
                          background: active
                            ? "rgba(37,99,235,0.10)"
                            : "transparent",
                          color: active ? "#dbeafe" : "inherit",
                          cursor: "pointer",
                        }}
                        title={`Open ${p.name}`}
                      >
                        <div style={{ fontSize: 12, fontWeight: 800 }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: 10, opacity: 0.7 }}>
                          {(p.elements || []).length} item
                          {(p.elements || []).length !== 1 ? "s" : ""}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          copyPage(p.id);
                        }}
                        style={{
                          width: 36,
                          minWidth: 36,
                          borderRadius: 10,
                          border: "1px solid rgba(148,163,184,0.28)",
                          background: "transparent",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 36,
                        }}
                        title={`Copy ${p.name}`}
                      >
                        <Icon name="copy" size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          pastePageInto(p.id);
                        }}
                        style={{
                          width: 36,
                          minWidth: 36,
                          borderRadius: 10,
                          border: "1px solid rgba(148,163,184,0.28)",
                          background: "transparent",
                          cursor: "pointer",
                          display: "grid",
                          placeItems: "center",
                          fontSize: 36,
                        }}
                        title={`Paste into ${p.name}`}
                      >
                        <Icon name="paste" size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ✅ Your existing tab-based content */}
            {/* ✅ Left panel content */}
            {leftTab === "assets" ? (
              <>
                <div style={styles.toolsRow}>
                  <ToolIcon name="Text Box" icon="text" draggableType="Text" />
                  <ToolIcon name="Box" icon="box" draggableType="Box" />
                  <ToolIcon
                    name="Horizontal Line"
                    icon="lineH"
                    draggableType="LineH"
                  />
                  <ToolIcon
                    name="Vertical Line"
                    icon="lineV"
                    draggableType="LineV"
                  />
                  <ToolIcon name="Table" icon="table" draggableType="Table" />
                  <ToolIcon name="Image" icon="image" draggableType="Image" />
                </div>

                {/* <div style={styles.divider} /> */}

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  <button
                    type="button"
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
                    type="button"
                    style={{
                      ...styles.pill,
                      ...(activeTool === "hand" ? styles.pillActive : {}),
                    }}
                    onClick={() => setActiveTool("hand")}
                    title="Hand (Space)"
                  >
                    <Icon name="hand" />
                  </button>
                  <button
                    type="button"
                    style={styles.bottomBtn}
                    title="Grid"
                    onClick={() =>
                      setUi((s) => ({ ...s, showGrid: !s.showGrid }))
                    }
                  >
                    <Icon name="grid" />
                  </button>
                  <button
                    type="button"
                    style={styles.bottomBtn}
                    title="Rulers"
                    onClick={() =>
                      setUi((s) => ({ ...s, showRulers: !s.showRulers }))
                    }
                  >
                    <Icon name="ruler" />
                  </button>
                  <button
                    type="button"
                    style={styles.bottomBtn}
                    title="Snap"
                    onClick={() => setUi((s) => ({ ...s, snap: !s.snap }))}
                  >
                    <Icon name="mag" />
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.iconGrid}>
                <button
                  type="button"
                  style={styles.iconPill}
                  title="Align Left"
                  onClick={() => alignSelected("left")}
                >
                  <Icon name="alignLeft" />
                </button>
                <button
                  type="button"
                  style={styles.iconPill}
                  title="Center X"
                  onClick={() => alignSelected("centerX")}
                >
                  <Icon name="alignCenter" />
                </button>
                <button
                  type="button"
                  style={styles.iconPill}
                  title="Align Right"
                  onClick={() => alignSelected("right")}
                >
                  <Icon name="alignRight" />
                </button>
                <button
                  type="button"
                  style={styles.iconPill}
                  title="Align Top"
                  onClick={() => alignSelected("top")}
                >
                  <Icon name="alignTop" />
                </button>
                <button
                  type="button"
                  style={styles.iconPill}
                  title="Center Y"
                  onClick={() => alignSelected("centerY")}
                >
                  <Icon name="alignMiddle" />
                </button>
                <button
                  type="button"
                  style={styles.iconPill}
                  title="Align Bottom"
                  onClick={() => alignSelected("bottom")}
                >
                  <Icon name="alignBottom" />
                </button>
                <button
                  type="button"
                  style={styles.iconPill}
                  title="Bring to Front"
                  onClick={bringToFront}
                >
                  <Icon name="front" />
                </button>
                <button
                  type="button"
                  style={styles.iconPill}
                  title="Send to Back"
                  onClick={sendToBack}
                >
                  <Icon name="back" />
                </button>
                <button
                  type="button"
                  style={styles.bottomBtn}
                  title="Grid"
                  onClick={() =>
                    setUi((s) => ({ ...s, showGrid: !s.showGrid }))
                  }
                >
                  <Icon name="grid" />
                </button>
                <button
                  type="button"
                  style={styles.bottomBtn}
                  title="Rulers"
                  onClick={() =>
                    setUi((s) => ({ ...s, showRulers: !s.showRulers }))
                  }
                >
                  <Icon name="ruler" />
                </button>
                <button
                  type="button"
                  style={styles.bottomBtn}
                  title="Snap"
                  onClick={() => setUi((s) => ({ ...s, snap: !s.snap }))}
                >
                  <Icon name="mag" />
                </button>
              </div>
            )}
            <div style={styles.sidebarFooter}>
              {/* <div style={styles.sidebarFooterRow}> */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  type="button"
                  style={styles.bottomMini}
                  onClick={zoomOut}
                  title="Zoom out"
                >
                  −
                </button>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 12,
                    minWidth: 48,
                    textAlign: "center",
                  }}
                >
                  {Math.round(ui.scale * 100)}%
                </div>
                <button
                  type="button"
                  style={styles.bottomMini}
                  onClick={zoomIn}
                  title="Zoom in"
                >
                  +
                </button>
              </div>
              {/* </div> */}
            </div>
          </div>
        </div>

        <div style={styles.center}>
          {ui.showRulers ? (
            <div className="blc-ui blc-rulers" style={styles.rulers}>
              <div style={styles.rulerTop}>
                <Ruler axis="x" mm={paperMM.w} scale={ui.scale} />
              </div>
              <div style={styles.rulerLeft}>
                <Ruler
                  axis="y"
                  mm={isAttachmentPage ? paperMM.h : editorPaperMM.h}
                  scale={ui.scale}
                />
              </div>
            </div>
          ) : null}

          {!isAttachmentPage && ui.extendMainTo2A4 && a4BreakYpx != null && (
            <div
              className="blc-ui"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: a4BreakYpx,
                height: 0,
                borderTop: "1px dashed rgba(100,116,139,.55)",
                boxShadow: "0 0 0 1px rgba(255,255,255,.45)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: 8,
                  top: -18,
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(71,85,105,.85)",
                  background: "rgba(255,255,255,.9)",
                  padding: "2px 6px",
                  borderRadius: 6,
                }}
              >
                A4 ends here
              </div>
            </div>
          )}

          <div
            ref={canvasStageRef}
            className="thin-scrollbar"
            style={styles.canvasStage}
          >
            <div
              ref={canvasRef}
              className={ui.showGrid ? "blc-grid" : ""}
              style={{
                ...styles.canvas,
                width: paperPX.w,
                height: paperPX.h,
                background: "#ffffff",
                ...(ui.showGrid ? styles.gridBg : {}),
              }}
              onPointerDown={startMarquee}
              onDrop={onCanvasDrop}
              onDragOver={(e) => e.preventDefault()}
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

              {isAttachmentPage && (
                <div
                  className="blc-ui"
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                >
                  {/* Header band */}
                  {attachBands.headerMm > 0 && (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: "100%",
                          height: attachBands.headerMm * MM_TO_PX * ui.scale,
                          background: "rgba(2,6,23,.04)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: attachBands.headerMm * MM_TO_PX * ui.scale,
                          width: "100%",
                          height: 1,
                          background: "rgba(100,116,139,.45)",
                        }}
                      />
                    </>
                  )}

                  {/* Footer band */}
                  {attachBands.footerMm > 0 && (
                    <>
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: attachBands.bodyBottomMm * MM_TO_PX * ui.scale,
                          width: "100%",
                          height:
                            (paperMM.h - attachBands.bodyBottomMm) *
                            MM_TO_PX *
                            ui.scale,
                          background: "rgba(2,6,23,.04)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: attachBands.bodyBottomMm * MM_TO_PX * ui.scale,
                          width: "100%",
                          height: 1,
                          background: "rgba(100,116,139,.45)",
                        }}
                      />
                    </>
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
                    background: "rgba(2,6,23,.45)",
                    borderBottom: "1px solid rgba(148,163,184,.18)",
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
        </div>

        <div className="blc-ui thin-scrollbar" style={styles.right}>
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
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button style={styles.softBtn} onClick={selectAllVisible}>
                  Select All
                </button>
                <button style={styles.softBtn} onClick={clearSelection}>
                  Clear
                </button>
              </div>

              <div style={styles.layers}>
                {layerItems.length === 0 ? (
                  <div style={{ fontSize: 10, opacity: 0.6 }}>No elements</div>
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
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <button
                  style={stylesKV.actionBtn}
                  onClick={() => {
                    // Pre-fill with current schema JSON (optional)
                    const existing = templateRef.current?.dataSchema;
                    if (existing && Object.keys(existing || {}).length) {
                      setSchemaJsonText(JSON.stringify(existing, null, 2));
                    } else {
                      setSchemaJsonText("");
                    }
                    setSchemaModalOpen(true);
                  }}
                  title="Paste a sample BL JSON to detect arrays like tblBlContainer / tblBLCharge"
                >
                  Data Schema
                </button>
                <div style={{ fontSize: 9, opacity: 0.7 }}>
                  Used for repeating table rows from arrays.
                </div>
              </div> */}
              <div style={styles.columns}>
                {columns.map((c) => (
                  <button
                    key={c.key}
                    style={styles.colBtn}
                    className="flex justify-between"
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
                    <div style={{ fontSize: 9, fontWeight: 700 }}>
                      {c.label}
                    </div>
                    <div
                      style={{ fontSize: 9, opacity: 0.7 }}
                    >{`{{${c.key}}}`}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          {rightTab === "inspect" ? (
            <div style={styles.panelBody}>
              <div style={styles.inspector}>
                <div style={stylesKV.block}>
                  <div style={stylesKV.title}>Can Grow Columns</div>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Can Grow Columns"
                    value={canGrowColumns}
                    onChange={(e) => updateCanGrowColumns(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                      sx: { fontSize: 9 },
                    }}
                    SelectProps={{
                      multiple: true,
                      displayEmpty: true,
                      renderValue: (selected) => {
                        const arr = normalizeCanGrowColumns(selected);
                        if (!arr.length) return "Select fields";
                        return arr
                          .map((key) => canGrowColumnLabelMap.get(key) || key)
                          .join(", ");
                      },
                      MenuProps: {
                        disablePortal: false,
                        keepMounted: true,
                        sx: { zIndex: 200000 },
                        PaperProps: {
                          sx: {
                            maxHeight: 320,
                            width: 320,
                            zIndex: 200000,
                            "& .MuiMenuItem-root": {
                              fontSize: 9,
                              minHeight: 28,
                              paddingY: 0.25,
                            },
                            "& .MuiListItemText-primary": {
                              fontSize: 9,
                              lineHeight: 1.1,
                            },
                            "& .MuiListItemText-secondary": {
                              fontSize: 8,
                              lineHeight: 1.1,
                            },
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        background: "rgba(2,6,23,.45)",
                        border: "1px solid rgba(148,163,184,.18)",
                        color: "#fff",
                        minHeight: 36,
                        fontSize: 9,
                      },
                      "& .MuiSelect-select": {
                        padding: "8px 10px",
                        display: "flex",
                        alignItems: "center",
                        fontSize: 9,
                      },
                    }}
                  >
                    {canGrowColumnOptions.map((opt) => (
                      <MenuItem
                        key={opt.key}
                        value={opt.key}
                        sx={{
                          fontSize: 9,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <Checkbox
                          size="small"
                          checked={canGrowColumns.includes(opt.key)}
                          sx={{
                            padding: "2px",
                            "& .MuiSvgIcon-root": { fontSize: 14 },
                          }}
                        />

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 9,
                              width: "70%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {opt.label}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 8,
                              width: "30%",
                              whiteSpace: "nowrap",
                              textAlign: "left",
                              pl: 1,
                            }}
                          >
                            {opt.key}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                </div>
                {!primarySelected ? (
                  <div style={{ fontSize: 9, opacity: 0.7 }}>
                    Select an element to edit its properties.
                  </div>
                ) : (
                  <Inspector
                    el={primarySelected}
                    header={template.header}
                    isAttachmentPage={isAttachmentPage}
                    activePage={activePage}
                    attachBands={attachBands}
                    onUpdateActivePage={(patch) => patchActivePageMeta(patch)}
                    onUpdateHeader={(patch) => {
                      const next = JSON.parse(
                        JSON.stringify(templateRef.current),
                      );
                      next.header = { ...(next.header || {}), ...patch };
                      commit(next);
                    }}
                    onPatch={(p) => {
                      const selected =
                        selectedIds instanceof Set
                          ? selectedIds
                          : new Set(selectedIds || []);
                      if (selected.size > 1) applyPatchToSelection(p);
                      else updateEl(primarySelected.id, p);
                    }}
                    onStyle={(p) => {
                      const selected =
                        selectedIds instanceof Set
                          ? selectedIds
                          : new Set(selectedIds || []);
                      if (selected.size > 1) applyStyleToSelection(p);
                      else updateElStyle(primarySelected.id, p);
                    }}
                    onTable={(p) => updateTable(primarySelected.id, p)}
                    onCellStyle={(cellK, p) =>
                      updateTableCellStyle(primarySelected.id, cellK, p)
                    }
                    columns={columns}
                    onBindCell={bindActiveTableCellToColumn}
                    onMerge={mergeSelectedCells}
                    onUnmerge={unmergeCell}
                    getCommonStyleValue={getCommonStyleValue}
                    dataSchema={template?.dataSchema}
                  />
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {schemaModalOpen ? (
        <div
          onClick={() => setSchemaModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.45)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 12,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(920px, 96vw)",
              maxHeight: "90vh",
              background: "#fff",
              borderRadius: 16,
              padding: 14,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 950 }}>
                Data Schema (Paste Sample BL JSON)
              </div>
              <button
                onClick={() => setSchemaModalOpen(false)}
                style={styles.miniBtn}
                title="Close"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Paste a sample BL JSON (your API response). We will detect array
              fields (e.g. <b>tblBlContainer</b>, <b>tblBLCharge</b>) and their
              columns.
            </div>

            <textarea
              value={schemaJsonText}
              onChange={(e) => setSchemaJsonText(e.target.value)}
              placeholder='Paste JSON here... Example: [{"shipperText":"...","tblBlContainer":[{"containerNo":"..."}]}]'
              style={{
                width: "100%",
                minHeight: 260,
                resize: "vertical",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 10,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 12,
                lineHeight: 1.35,
              }}
            />

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}
            >
              <button
                onClick={() => setSchemaModalOpen(false)}
                style={{ ...stylesKV.actionBtn, background: "#f3f4f6" }}
              >
                Cancel
              </button>
              <button
                onClick={saveDataSchemaFromJson}
                style={stylesKV.actionBtn}
              >
                Save Schema
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toastMsg ? <div style={styles.toast}>{toastMsg}</div> : null}
    </div>
  );
}

/** ---------- Inspector component ---------- */
function Inspector({
  el,
  header,
  dataSchema,
  isAttachmentPage,
  activePage,
  attachBands,
  onUpdateActivePage,
  onUpdateHeader,
  onPatch,
  onStyle,
  getCommonStyleValue,
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
  const isImage = el.type === "image";

  const t = el.table;
  const activeCellKey =
    isTable && t?.activeCell ? `${t.activeCell.r},${t.activeCell.c}` : null;
  const cellSX =
    (isTable && activeCellKey && t?.cellStyle?.[activeCellKey]) || {};
  const [uiFontSize, setUiFontSize] = React.useState(
    String(el?.style?.fontSize ?? 10),
  );

  React.useEffect(() => {
    setUiFontSize(String(el?.style?.fontSize ?? 10));
  }, [el?.id, el?.style?.fontSize]);
  const uiFontSizeNum = (() => {
    const n = Number(String(uiFontSize || "").trim());
    return Number.isFinite(n) && n > 0 ? n : 10;
  })();
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
            checked={header?.enabled ?? false}
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

      {isAttachmentPage ? (
        <div style={stylesKV.block}>
          <div style={stylesKV.title}>Attachment Header / Footer</div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <KV label="Header H (mm)">
              <Num
                value={activePage?.attachHeaderMm ?? 25}
                step={1}
                min={0}
                onChange={(v) => onUpdateActivePage({ attachHeaderMm: v })}
              />
            </KV>
            <KV label="Footer H (mm)">
              <Num
                value={activePage?.attachFooterMm ?? 25}
                step={1}
                min={0}
                onChange={(v) => onUpdateActivePage({ attachFooterMm: v })}
              />
            </KV>
          </div>

          <div style={{ marginTop: 10 }}>
            <KV label="This element belongs to">
              <select
                value={el.attachBand || "body"}
                onChange={(e) => onPatch({ attachBand: e.target.value })}
                style={stylesKV.select}
              >
                <option value="body">Body</option>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
              </select>
            </KV>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6 }}>
              Header/Footer elements will be designed inside the shaded bands
              and can be repeated on generated attachment pages.
            </div>
          </div>
        </div>
      ) : null}

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
        </div>
      ) : null}

      {isImage && (
        <div style={stylesKV.block}>
          <div style={stylesKV.title}>Image</div>
          <KV label="Fit">
            <select
              value={el.fit || "contain"}
              onChange={(e) => onPatch({ fit: e.target.value })}
              style={stylesKV.select}
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
            </select>
          </KV>
          <KV label="Opacity">
            <Num
              value={el.opacity ?? 1}
              step={0.05}
              min={0}
              max={1}
              onChange={(v) => onPatch({ opacity: v })}
            />
          </KV>
          <button
            className="mt-2"
            style={stylesKV.actionBtn}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => onPatch({ src: r.result });
                r.readAsDataURL(f);
              };
              input.click();
            }}
          >
            Choose Image
          </button>
        </div>
      )}

      {!isLine ? (
        <>
          {/* ===================== Style (Color / BG / Border) ===================== */}
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
                  value={Number(s.borderWidth ?? 1)}
                  step={1}
                  min={0}
                  onChange={(v) => onStyle({ borderWidth: v })}
                />
              </KV>
            </div>
            <div style={stylesKV.row}>
              <KV label="B Style">
                {(() => {
                  const bs = getCommonStyleValue("borderStyle", "solid");
                  return (
                    <select
                      value={bs.mixed ? "" : bs.value}
                      onChange={(e) => onStyle({ borderStyle: e.target.value })}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={stylesKV.select}
                    >
                      {bs.mixed && <option value="">— Mixed —</option>}
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  );
                })()}
              </KV>
              <KV label=" " />
            </div>
          </div>

          {/* ===================== Typography (Font / Align etc.) ===================== */}
          <div style={stylesKV.block}>
            <div style={stylesKV.title}>Typography</div>
            <div style={stylesKV.row}>
              <KV label="Size">
                <Num
                  value={Number(s.fontSize ?? 12)}
                  step={1}
                  min={1}
                  onChange={(v) => onStyle({ fontSize: v })}
                />
              </KV>
              <KV label="Weight">
                {(() => {
                  const fw = getCommonStyleValue("fontWeight", 500, "text");
                  return (
                    <select
                      value={fw.value}
                      onChange={(e) => {
                        if (e.target.value === "__MIXED__") return;
                        onStyle({ fontWeight: Number(e.target.value) });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={stylesKV.select}
                    >
                      {fw.mixed && <option value="__MIXED__">— Mixed —</option>}
                      {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                        <option key={w} value={String(w)}>
                          {w}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </KV>
            </div>
            <div style={stylesKV.row}>
              <KV label="Align">
                {(() => {
                  const al = getCommonStyleValue("align", "left", "text");
                  return (
                    <select
                      value={al.value}
                      onChange={(e) => {
                        if (e.target.value === "__MIXED__") return;
                        onStyle({
                          align: e.target.value,
                          textAlign: e.target.value,
                        });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={stylesKV.select}
                    >
                      {al.mixed && <option value="__MIXED__">— Mixed —</option>}
                      <option value="left">Left</option>
                      <option value="center">Center</option>
                      <option value="right">Right</option>
                    </select>
                  );
                })()}
              </KV>
              <KV label="V Align">
                {(() => {
                  const va = getCommonStyleValue("vAlign", "top", "text");
                  return (
                    <select
                      value={va.value}
                      onChange={(e) => {
                        if (e.target.value === "__MIXED__") return;
                        onStyle({
                          vAlign: e.target.value,
                          verticalAlign: e.target.value,
                        });
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      style={stylesKV.select}
                    >
                      {va.mixed && <option value="__MIXED__">— Mixed —</option>}
                      <option value="top">Top</option>
                      <option value="middle">Middle</option>
                      <option value="bottom">Bottom</option>
                    </select>
                  );
                })()}
              </KV>
            </div>
            <div style={stylesKV.row}>
              <KV label="Padding">
                <Num
                  value={Number(s.padding ?? 1)}
                  step={1}
                  min={0}
                  onChange={(v) => onStyle({ padding: v })}
                />
              </KV>
              <KV label="Line H">
                <Num
                  value={Number(s.lineHeight ?? 1.2)}
                  step={0.05}
                  min={0}
                  onChange={(v) => onStyle({ lineHeight: v })}
                />
              </KV>
            </div>
            <div style={stylesKV.row}>
              <KV label="Letter Sp.">
                <Num
                  value={Number(s.letterSpacing ?? 0)}
                  step={0.2}
                  onChange={(v) => onStyle({ letterSpacing: v })}
                />
              </KV>
              <KV label="Opacity">
                <Num
                  value={Number(s.opacity ?? 1)}
                  step={0.05}
                  min={0}
                  max={1}
                  onChange={(v) => onStyle({ opacity: v })}
                />
              </KV>
            </div>
          </div>
        </>
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
      {isTable ? (
        <div style={stylesKV.block}>
          <div style={stylesKV.title}>Table</div>

          {/* Repeat rows from array (dynamic table) */}
          {(() => {
            const repeat = el.table?.repeat || {};
            const arraysObj = dataSchema?.arrays || {};
            const arrayKeys = Object.keys(arraysObj);

            // Fallback options if schema not defined yet
            //const fallbackKeys = ["tblJobContainer", "tblBLCharge", "tblBlPkg"];
            const fallbackKeys = ["tblJobContainer", "tblJobQty"];
            const options = Array.from(
              new Set([...(arrayKeys || []), ...fallbackKeys]),
            );

            const selectedCols = Array.isArray(repeat.columns)
              ? repeat.columns
              : [];
            const selectedKeys = new Set(selectedCols.map((c) => c.key));

            // Fallback columns so user can select even before saving schema
            const FALLBACK_ARRAY_FIELDS = {
              tblJobContainer: [
                "srNo",
                "containerNo",
                "capacity",
                "tareWt",
                "tareWtUnit",
                "tareWtAndUnit",
                "grossWt",
                "weightUnit",
                "grossWtAndUnit",
                //new Fields
                "equipmentType",
                "typeCode",
                "grossWtUnitCode",
                "grossWtNameAndCode",
                "odcLength",
                "odcWidth",
                "odcHeight",
                "odcUnit",
                "odcGuage",
                "refTemp",
                "refTempUnitCode",
                "ventilation",
                "typeCode",
                "humidity",
                "tankCapacity",
                "sizeType",
                "containerStatus",
              ],
              tblJobQty: [
                "equipmentType",
                "typeCode",
                "grossWtUnitCode",
                "grossWtNameAndCode",
                "odcLength",
                "odcWidth",
                "odcHeight",
                "odcUnit",
                "odcGuage",
                "refTemp",
                "refTempUnitCode",
                "ventilation",
                "typeCode",
                "humidity",
              ],
            };

            const fieldsForArray =
              repeat.arrayPath &&
                Array.isArray(arraysObj?.[repeat.arrayPath]) &&
                arraysObj[repeat.arrayPath].length
                ? arraysObj[repeat.arrayPath]
                : repeat.arrayPath &&
                  Array.isArray(FALLBACK_ARRAY_FIELDS[repeat.arrayPath])
                  ? FALLBACK_ARRAY_FIELDS[repeat.arrayPath]
                  : [];

            const ensureSizeFromSelected = (colsList) => {
              const colsCount = Math.max(1, colsList.length || 1);
              const rowsCount = Math.max(2, el.table?.rows || 2); // header + at least 1 preview row
              const colW = Array(colsCount).fill(
                Math.max(60, Math.floor(520 / colsCount)),
              );
              const rowH = [...(el.table?.rowH || [])];
              while (rowH.length < rowsCount) rowH.push(32);
              while (rowH.length > rowsCount) rowH.pop();
              onTable({ cols: colsCount, rows: rowsCount, colW, rowH });
            };

            const toggleField = (fieldKey) => {
              let colsList = [...selectedCols];
              if (selectedKeys.has(fieldKey)) {
                colsList = colsList.filter((c) => c.key !== fieldKey);
              } else {
                colsList.push({
                  key: fieldKey,
                  label: fieldKey,
                  align: "left",
                  widthMm: 30,
                });
              }
              onTable({ repeat: { ...repeat, columns: colsList } });
              ensureSizeFromSelected(colsList);
            };

            const setRepeatEnabled = (enabled) => {
              const nextRepeat = { ...repeat, enabled: !!enabled };
              // If enabling with empty arrayPath, pick first option
              if (nextRepeat.enabled && !nextRepeat.arrayPath) {
                nextRepeat.arrayPath = options[0] || "";
              }
              onTable({ repeat: nextRepeat });

              // Ensure cols/rows if enabled and columns already selected
              if (nextRepeat.enabled && (nextRepeat.columns || []).length) {
                ensureSizeFromSelected(nextRepeat.columns || []);
              }
            };

            const onChangeArray = (arrayPath) => {
              const nextRepeat = { ...repeat, arrayPath };
              const fields = arraysObj?.[arrayPath] || [];
              // if no columns selected yet, auto-pick first 5 fields
              if (
                !Array.isArray(nextRepeat.columns) ||
                !nextRepeat.columns.length
              ) {
                nextRepeat.columns = fields.slice(0, 5).map((f) => ({
                  key: f,
                  label: f,
                  align: "left",
                  widthMm: 30,
                }));
              }
              onTable({ repeat: nextRepeat });
              ensureSizeFromSelected(nextRepeat.columns || []);
            };

            return (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 10,
                  background: "#0f172a",
                }}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    marginBottom: 8,
                    color: "#fff",
                  }}
                >
                  Repeat Rows (Array)
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#fff",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={!!repeat.enabled}
                    onChange={(e) => setRepeatEnabled(e.target.checked)}
                  />
                  Enable repeating table
                </label>

                {repeat.enabled ? (
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      flexDirection: "column",
                      color: "#fff",
                      gap: 10,
                    }}
                  >
                    <KV label="Array Name">
                      <select
                        value={repeat.arrayPath || ""}
                        onChange={(e) => onChangeArray(e.target.value)}
                        style={stylesKV.select}
                      >
                        <option value="">-- select --</option>
                        {options.map((k) => (
                          <option key={k} value={k}>
                            {k}
                          </option>
                        ))}
                      </select>
                    </KV>

                    {repeat.arrayPath ? (
                      <>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            opacity: 0.75,
                            color: "#fff",
                          }}
                        >
                          Columns to show
                        </div>

                        {fieldsForArray?.length ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                            }}
                          >
                            {fieldsForArray.map((f) => (
                              <label
                                key={f}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  fontSize: 9,
                                  color: "#fff",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedKeys.has(f)}
                                  onChange={() => toggleField(f)}
                                />
                                {f}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, opacity: 0.7 }}>
                            No fields found for this array.
                            <div
                              style={{
                                marginTop: 6,
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  const k = window.prompt(
                                    "Enter column key (fieldname) to add:",
                                  );
                                  const key = (k || "").trim();
                                  if (!key) return;
                                  if (selectedKeys.has(key)) return;
                                  const nextCols = [
                                    ...selectedCols,
                                    {
                                      key,
                                      label: key,
                                      align: "left",
                                      widthMm: 30,
                                    },
                                  ];
                                  const nextRepeat = {
                                    ...repeat,
                                    columns: nextCols,
                                  };
                                  onTable({ repeat: nextRepeat });
                                  ensureSizeFromSelected(nextCols);
                                }}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  border: "1px solid #d1d5db",
                                  background: "#0f172a",
                                  cursor: "pointer",
                                  fontWeight: 900,
                                  fontSize: 12,
                                }}
                              >
                                + Add column manually
                              </button>
                              <button
                                type="button"
                                onClick={() => setSchemaModalOpen(true)}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  border: "1px solid #d1d5db",
                                  background: "#fff",
                                  cursor: "pointer",
                                  fontWeight: 900,
                                  fontSize: 12,
                                }}
                              >
                                Open Data Schema
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedCols.length ? (
                          <div style={{ marginTop: 10 }}>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 900,
                                opacity: 0.75,
                                marginBottom: 6,
                              }}
                            >
                              Selected column settings
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                              }}
                            >
                              {selectedCols.map((col, idx) => (
                                <div
                                  key={col.key + idx}
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                      "90px 70px 50px 34px 34px",
                                    gap: 8,
                                    alignItems: "center",
                                    fontSize: 9,
                                    color: "#fff",
                                    background: "#0f172a",
                                    borderRadius: 8,
                                  }}
                                >
                                  <input
                                    value={col.label ?? col.key}
                                    onChange={(e) => {
                                      const nextCols = [...selectedCols];
                                      nextCols[idx] = {
                                        ...nextCols[idx],
                                        label: e.target.value,
                                      };
                                      onTable({
                                        repeat: {
                                          ...repeat,
                                          columns: nextCols,
                                        },
                                      });
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "6px 8px",
                                      border: "1px solid #e5e7eb",
                                      background: "#0f172a",
                                      color: "#fff",
                                      borderRadius: 8,
                                      fontSize: 9,
                                    }}
                                    placeholder="Header label"
                                  />

                                  <select
                                    value={col.align || "left"}
                                    onChange={(e) => {
                                      const nextCols = [...selectedCols];
                                      nextCols[idx] = {
                                        ...nextCols[idx],
                                        align: e.target.value,
                                      };
                                      onTable({
                                        repeat: {
                                          ...repeat,
                                          columns: nextCols,
                                        },
                                      });
                                    }}
                                    style={stylesKV.select}
                                  >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                  </select>

                                  <input
                                    type="number"
                                    value={Number(col.widthMm ?? 30)}
                                    onChange={(e) => {
                                      const nextCols = [...selectedCols];
                                      nextCols[idx] = {
                                        ...nextCols[idx],
                                        widthMm: Number(e.target.value || 0),
                                      };
                                      onTable({
                                        repeat: {
                                          ...repeat,
                                          columns: nextCols,
                                        },
                                      });
                                    }}
                                    style={{
                                      width: "100%",
                                      padding: "6px 8px",
                                      border: "1px solid #e5e7eb",
                                      background: "#0f172a",
                                      color: "#fff",
                                      borderRadius: 8,
                                      fontSize: 9,
                                    }}
                                    title="Preferred width (mm) for report layout"
                                  />

                                  <button
                                    style={styles.miniBtn}
                                    title="Move up"
                                    onClick={() => {
                                      if (idx === 0) return;
                                      const nextCols = [...selectedCols];
                                      const tmp = nextCols[idx - 1];
                                      nextCols[idx - 1] = nextCols[idx];
                                      nextCols[idx] = tmp;
                                      onTable({
                                        repeat: {
                                          ...repeat,
                                          columns: nextCols,
                                        },
                                      });
                                    }}
                                  >
                                    ↑
                                  </button>
                                  <button
                                    style={styles.miniBtn}
                                    title="Move down"
                                    onClick={() => {
                                      if (idx === selectedCols.length - 1)
                                        return;
                                      const nextCols = [...selectedCols];
                                      const tmp = nextCols[idx + 1];
                                      nextCols[idx + 1] = nextCols[idx];
                                      nextCols[idx] = tmp;
                                      onTable({
                                        repeat: {
                                          ...repeat,
                                          columns: nextCols,
                                        },
                                      });
                                    }}
                                  >
                                    ↓
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })()}

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
  const [draft, setDraft] = React.useState(
    value === null || value === undefined ? "" : String(value),
  );

  // ✅ keep input in sync when external value changes (selection/style changes)
  React.useEffect(() => {
    setDraft(value === null || value === undefined ? "" : String(value));
  }, [value]);

  const commit = () => {
    const raw = String(draft).trim();
    if (raw === "") {
      setDraft(value === null || value === undefined ? "" : String(value));
      return;
    }

    let n = Number(raw);
    if (!Number.isFinite(n)) {
      setDraft(value === null || value === undefined ? "" : String(value));
      return;
    }
    if (n < min) n = min;
    if (n > max) n = max;
    setDraft(String(n));
    onChange(n);
  };

  return (
    <input
      type="number"
      value={draft}
      step={step}
      min={min}
      max={max}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setDraft(value === null || value === undefined ? "" : String(value));
          e.currentTarget.blur();
        }
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={stylesKV.num}
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
        background: "#0f172a",
        border: "1px solid rgba(148,163,184,.18)",
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
                  height: major ? 10 : 5,
                  background: "#cbd5e1",
                }}
              />
              {major ? (
                <div
                  style={{
                    position: "absolute",
                    top: 16,
                    left: 2,
                    fontSize: 8,
                    color: "#fff",
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
                width: major ? 10 : 5,
                background: "#cbd5e1",
              }}
            />
            {major ? (
              <div
                style={{
                  position: "absolute",
                  left: 18,
                  top: -6,
                  fontSize: 9,
                  color: "#fff",
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
    background: "#0b1220",
    color: "#e5e7eb",
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
    background: "rgba(17,24,39,.98)",
    borderBottom: "1px solid rgba(148,163,184,.18)",
    backdropFilter: "blur(10px)",
    flexShrink: 0,
    fontSize: 40,
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
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    color: "#e5e7eb",
    WebkitTextFillColor: "#e5e7eb",
    padding: "0 10px",
    fontSize: 9,
    fontWeight: 500,
    outline: "none",
  },
  softBtn: {
    height: 32,
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
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
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
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
    background: "rgba(17,24,39,.98)",
    border: "1px solid rgba(148,163,184,.18)",
    borderRadius: 14,
    overflow: "hidden",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  right: {
    background: "rgba(17,24,39,.98)",
    border: "1px solid rgba(148,163,184,.18)",
    borderRadius: 14,
    overflow: "hidden",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  },
  tabs: {
    display: "flex",
    gap: 6,
    padding: 8,
    borderBottom: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
  },
  tab: {
    flex: 1,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
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
  leftSection: { padding: 8, minHeight: 0, overflow: "auto" },
  sidebarFooter: { padding: 12 },
  sidebarFooterRow: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    justifyContent: "space-between",
  },

  toolsRow: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 2 },
  toolIcon: {
    border: "1px solid rgba(148,163,184,.18)",
    borderRadius: 14,
    background: "rgba(2,6,23,.45)",
    padding: "8px 8px",
    display: "flex",
    alignItems: "center",
    gap: 2,
    cursor: "grab",
    userSelect: "none",
    fontSize: 40,
  },
  toolIconLabel: { fontSize: 12, fontWeight: 900, opacity: 0.8 },
  divider: { height: 1, background: "#e5e7eb", margin: "12px 0" },
  pill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 30,
  },
  pillActive: {
    borderColor: "rgba(37,99,235,.45)",
    boxShadow: "0 0 0 3px rgba(37,99,235,.12)",
  },
  iconGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  iconPill: {
    height: 36,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 30,
  },
  center: { position: "relative", minHeight: 0, overflow: "hidden" },
  rulers: { position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 },
  rulerTop: { position: "absolute", left: 20, top: 0, right: 0, height: 8 },
  rulerLeft: { position: "absolute", left: 0, top: 28, bottom: 0, width: 8 },
  canvasStage: {
    position: "absolute",
    inset: 0,
    overflow: "auto",
    borderRadius: 14,
    background: "#0f172a",
  },
  canvas: {
    position: "relative",
    margin: 20,
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,.18)",
    boxShadow: "0 10px 30px rgba(15,23,42,.08)",
    overflow: "hidden",
  },
  gridBg: {
    backgroundImage:
      "linear-gradient(to right, rgba(226,232,240,.9) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,232,240,.9) 1px, transparent 1px)",
    backgroundSize: "24px 24px",
  },
  bottomBar: {
    display: "none",
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
    fontSize: 30,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomPill: {
    height: 34,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
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
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    fontWeight: 900,
    cursor: "pointer",
  },

  panelBody: { padding: 4, minHeight: 0, overflow: "auto" },
  inspector: { display: "flex", flexDirection: "column", gap: 8 },

  layers: { display: "flex", flexDirection: "column", gap: 8 },
  layerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: 8,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    borderRadius: 12,
    cursor: "pointer",
  },
  layerRowSel: {
    borderColor: "rgba(37,99,235,.45)",
    boxShadow: "0 0 0 3px rgba(37,99,235,.10)",
  },
  layerTitle: {
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  layerSub: { fontSize: 11, opacity: 0.65, marginTop: 2 },

  miniBtn: {
    width: 34,
    height: 30,
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
  },

  columns: { display: "grid", gap: 4 },
  colBtn: {
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
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
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    borderRadius: 14,
    padding: 8,
  },
  title: { fontSize: 9, fontWeight: 900, marginBottom: 10, opacity: 0.8 },
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
    border: "1px solid rgba(148,163,184,.18)",
    padding: "0 10px",
    outline: "none",
    fontWeight: 800,
    fontSize: 9,
    background: "rgba(2,6,23,.45)",
    color: "var(--text, #e5e7eb)",
    WebkitTextFillColor: "var(--text, #e5e7eb)",
  },
  num: {
    width: "100%",
    height: 32,
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,.18)",
    padding: "0 10px",
    outline: "none",
    fontWeight: 800,
    fontSize: 9,
    background: "rgba(2,6,23,.45)",
    color: "var(--text, #e5e7eb)",
    WebkitTextFillColor: "var(--text, #e5e7eb)",
  },

  select: {
    width: "100%",
    height: 32,
    borderRadius: 10,
    border: "1px solid rgba(148,163,184,.18)",
    padding: "0 10px",
    outline: "none",
    fontWeight: 900,
    fontSize: 9,
    background: "rgba(2,6,23,.45)",
  },
  chip: {
    height: 34,
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
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
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 11,
    padding: "0 12px",
  },
  bindBtn: {
    width: "100%",
    padding: "10px 10px",
    borderRadius: 12,
    border: "1px solid rgba(148,163,184,.18)",
    background: "rgba(2,6,23,.45)",
    textAlign: "left",
    cursor: "pointer",
    fontSize: 9,
    fontWeight: 900,
  },
};
