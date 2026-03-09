/**
 * Hybrid Crystal-like layout helpers for BL Report
 * - Auto-size text + tables
 * - Grow "canGrow" sections + pushDown
 * - Split FLOW tables dynamically using template.canGrowColumns across pages like Crystal "band"
 *
 * IMPORTANT:
 * 1) When we set table.rowHUnit="mm", the renderer MUST treat rowH values as mm (do NOT re-normalize).
 * 2) layoutTemplateForData() must be called before rendering.
 */

const DEFAULT_PAGE_MARGIN_MM = { top: 5, right: 5, bottom: 5, left: 5 };

// a little extra breathing room so text never touches the paper bottom
const DEFAULT_SAFETY_BOTTOM_MM = 2;

// =========================================================
// DEBUG FLAGS (toggle as needed)
// =========================================================
globalThis.__BL_FLOW_DEBUG = true;
globalThis.__BL_REPEAT_DEBUG = true;
globalThis.__BL_NEIGHBOR_DEBUG = true;

// =========================================================
// Built-in measureTextMm (Canvas) ✅ bold-safe
// =========================================================
const MM_TO_PX = 96 / 25.4;

function normalizeFontWeight(fw) {
  if (fw == null || fw === "") return "400";
  const n = Number(fw);
  if (Number.isFinite(n)) return String(n);
  const s = String(fw).toLowerCase();
  if (s === "bold") return "700";
  if (s === "bolder") return "800";
  if (s === "normal") return "400";
  return s;
}

function normalizeFontStyle(fs) {
  const s = String(fs || "").toLowerCase();
  if (s === "italic" || s === "oblique") return s;
  return "normal";
}

function ptToPx(pt) {
  const n = Number(pt || 0) || 0;
  return (n * 96) / 72;
}

function normalizeCanGrowKey(k) {
  return String(k || "")
    .trim()
    .replace(/^\{\{/, "")
    .replace(/\}\}$/, "")
    .trim()
    .toLowerCase();
}

function getCanGrowColumnsSet(template) {
  const arr = Array.isArray(template?.canGrowColumns)
    ? template.canGrowColumns
    : [];
  return new Set(arr.map(normalizeCanGrowKey).filter(Boolean));
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function addWarningToObj(obj, message) {
  const next = { ...(obj || {}) };
  const arr = Array.isArray(next.__layoutWarnings)
    ? next.__layoutWarnings.slice()
    : [];
  arr.push(String(message || ""));
  next.__layoutWarnings = arr;
  return next;
}

function addErrorToObj(obj, message) {
  const next = { ...(obj || {}) };
  const arr = Array.isArray(next.__layoutErrors)
    ? next.__layoutErrors.slice()
    : [];
  arr.push(String(message || ""));
  next.__layoutErrors = arr;
  return next;
}

function warnLayout(debug, ...args) {
  if (debug) console.warn(...args);
}

function createDefaultMeasureTextMm() {
  if (typeof document === "undefined") {
    return ({ text }) => {
      const t = String(text || "");
      const lines = t.split("\n").length || 1;
      return Math.max(2, lines * 5);
    };
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  return function defaultMeasureTextMm({ text, widthMm, style }) {
    const s = style || {};

    const fontFamily = s.fontFamily || "Arial";
    const fontWeight = normalizeFontWeight(s.fontWeight);
    const fontStyle = normalizeFontStyle(s.fontStyle);

    const fontSizeRaw = Number(s.fontSize || 11);
    const fontSizePx =
      String(s.fontSizeUnit || "").toLowerCase() === "pt"
        ? ptToPx(fontSizeRaw)
        : fontSizeRaw;

    ctx.font = `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`;

    const lineHeight = Number(s.lineHeight || 1.2);
    const letterSpacing = Number(s.letterSpacing || 0);
    const pad = Number(s.padding ?? 0) || 0;

    const maxWidthPx = Math.max(1, Number(widthMm || 1) * MM_TO_PX - pad * 0.5);

    const raw = String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
    const lines = raw.split("\n");

    let wrappedCount = 0;

    for (const line of lines) {
      const words = line.split(/\s+/).filter(Boolean);
      if (!words.length) {
        wrappedCount += 1;
        continue;
      }

      let cur = words[0];
      for (let i = 1; i < words.length; i++) {
        const next = `${cur} ${words[i]}`;
        const w = ctx.measureText(next).width + next.length * letterSpacing;

        if (w <= maxWidthPx) cur = next;
        else {
          wrappedCount += 1;
          cur = words[i];
        }
      }
      wrappedCount += 1;
    }

    const linePx = fontSizePx * lineHeight;
    const heightPx = wrappedCount * linePx;

    return heightPx / MM_TO_PX + 0.6;
  };
}

const __defaultMeasureTextMm = createDefaultMeasureTextMm();

export function ensureHybridSections(template) {
  const pages = Array.isArray(template?.pages) ? template.pages : [];
  const mainId = pages[0]?.id || template?.pageId || "main";

  if (pages.length) {
    return {
      ...template,
      pages: pages.map((p) => ({
        ...p,
        sections: Array.isArray(p.sections) ? p.sections : [],
        elements: Array.isArray(p.elements)
          ? p.elements
          : Array.isArray(template?.elements)
            ? template.elements
            : [],
      })),
    };
  }

  return {
    ...template,
    pages: [
      {
        id: mainId,
        name: "Main",
        elements: Array.isArray(template?.elements) ? template.elements : [],
        groups: template?.groups || {},
        sections: [],
      },
    ],
  };
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* =========================================================
   Neighbour helpers
========================================================= */

function getNeighbourObj(el) {
  return (
    el?.neighbours || el?.neighbors || el?.neighbour || el?.neighbor || null
  );
}

function setNeighbourObj(el, n) {
  if (!el) return;
  delete el.neighbours;
  delete el.neighbour;
  delete el.neighbor;
  el.neighbors = n || null;
}

function normalizeNeighborId(id) {
  return id == null ? null : String(id);
}

function readNeighborIds(el) {
  const n = getNeighbourObj(el) || {};
  return {
    topId: normalizeNeighborId(n.topId ?? n.top),
    bottomId: normalizeNeighborId(
      n.bottomId ?? n.bottom ?? n.belowId ?? n.below,
    ),
    leftId: normalizeNeighborId(n.leftId ?? n.left),
    rightId: normalizeNeighborId(n.rightId ?? n.right),
  };
}

function writeNeighborIds(el, ids) {
  const n0 = getNeighbourObj(el) || {};
  const n = { ...n0 };

  if ("topId" in ids) n.topId = ids.topId;
  if ("bottomId" in ids) {
    n.bottomId = ids.bottomId;
    n.bottom = ids.bottomId;
    n.belowId = ids.bottomId;
    n.below = ids.bottomId;
  }
  if ("leftId" in ids) n.leftId = ids.leftId;
  if ("rightId" in ids) n.rightId = ids.rightId;

  setNeighbourObj(el, n);
}

function buildOriginalPosMap(elements) {
  const m = new Map();
  for (const e of elements || []) {
    if (!e?.id) continue;
    m.set(String(e.id), { y: Number(e.y || 0), h: Number(e.h || 0) });
  }
  return m;
}

function isSplitChunkEl(el) {
  return !!(
    el?.__flowBaseId ||
    el?.__repeatBaseId ||
    (typeof el?.id === "string" &&
      (String(el.id).includes("__flow_") || String(el.id).includes("__chunk_")))
  );
}

function compactDirectFollowersAfterChunkGrowth(
  elements,
  { maxIters = 50, debug = true } = {},
) {
  const els = Array.isArray(elements) ? elements : [];
  if (!els.length) return elements;

  const byId = new Map();
  for (const e of els) {
    if (e?.id) byId.set(String(e.id), e);
  }

  let changed = false;

  for (let iter = 0; iter < maxIters; iter++) {
    let did = false;

    for (const a of els) {
      if (!a?.id) continue;
      if (String(a?.type || "").toLowerCase() !== "table") continue;
      if (!isSplitChunkEl(a)) continue;

      const bottomId = readNeighborIds(a).bottomId;
      if (!bottomId) continue;

      const b = byId.get(String(bottomId));
      if (!b) continue;

      const band = String(b?.attachBand || "").toLowerCase();
      if (band === "header" || band === "footer") continue;

      const wantY = Number(a.y || 0) + Number(a.h || 0);
      const curY = Number(b.y || 0);

      if (Math.abs(curY - wantY) > 0.001) {
        b.y = wantY;
        did = true;

        if (debug) {
          console.log("[FOLLOWER-COMPACT]", {
            fromId: a.id,
            toId: b.id,
            oldY: curY,
            newY: wantY,
          });
        }
      }
    }

    if (!did) break;
    changed = true;
  }

  if (!changed) return elements;
  return els.map((e) =>
    e?.id && byId.has(String(e.id)) ? { ...byId.get(String(e.id)) } : e,
  );
}

/**
 * Apply vertical flow using neighbors, but allow chunks to inherit the base-id gap.
 */
function applyNeighbourVerticalFlow(
  elements,
  originalPosMap,
  { maxIters = 200 } = {},
) {
  const els = Array.isArray(elements) ? elements : [];
  if (!els.length) return elements;

  const byId = new Map();
  for (const e of els) if (e?.id) byId.set(String(e.id), e);

  const getOrigKey = (e) =>
    String(e?.__flowBaseId || e?.__repeatBaseId || e?.__baseId || e?.id || "");

  const edges = [];
  for (const e of els) {
    const ids = readNeighborIds(e);
    const bottomId = ids.bottomId;
    if (!bottomId) continue;

    const aId = String(e.id);
    const bId = String(bottomId);
    if (!byId.has(aId) || !byId.has(bId)) continue;

    const a0 = originalPosMap?.get(getOrigKey(e));
    const b0 = originalPosMap?.get(getOrigKey(byId.get(bId)));

    const gap0 = a0 && b0 ? Number(b0.y - (a0.y + a0.h)) : 0;
    edges.push({ aId, bId, gap0: Number.isFinite(gap0) ? gap0 : 0 });
  }

  if (!edges.length) return elements;

  const clampGap = (g) => (g > -0.5 ? g : 0);
  let changed = false;

  for (let iter = 0; iter < maxIters; iter++) {
    let did = false;

    for (const { aId, bId, gap0 } of edges) {
      const a = byId.get(aId);
      const b = byId.get(bId);
      if (!a || !b) continue;

      const wantTop = Number(a.y || 0) + Number(a.h || 0) + clampGap(gap0);
      const bY = Number(b.y || 0);

      if (bY < wantTop - 0.001) {
        b.y = wantTop;
        did = true;
      }
    }

    if (!did) break;
    changed = true;
  }

  if (!changed) return elements;
  return els.map((e) =>
    e?.id && byId.has(String(e.id)) ? { ...byId.get(String(e.id)) } : e,
  );
}

/* =========================================================
   Section helpers
========================================================= */

function resolveSectionRect(sec, pageWmm) {
  if (sec.kind === "band") {
    return {
      xMm: 0,
      yMm: Number(sec.yMm || 0),
      wMm: pageWmm,
      hMm: Number(sec.hMm || 0),
    };
  }
  return {
    xMm: Number(sec.xMm || 0),
    yMm: Number(sec.yMm || 0),
    wMm: Number(sec.wMm || pageWmm),
    hMm: Number(sec.hMm || 0),
  };
}

function elementsInSection(elements, sectionId) {
  return (elements || []).filter((e) => e?.sectionId === sectionId);
}

/* =========================================================
   Token helpers (case-insensitive)
========================================================= */

function getPropCI(base, key) {
  if (base == null) return undefined;
  if (Array.isArray(base) && /^\d+$/.test(key)) return base[Number(key)];
  if (typeof base !== "object") return undefined;

  if (Object.prototype.hasOwnProperty.call(base, key)) return base[key];

  const kLower = String(key).toLowerCase();
  const foundKey = Object.keys(base).find((k) => k.toLowerCase() === kLower);
  return foundKey ? base[foundKey] : undefined;
}

function getByPath(obj, path) {
  if (obj == null || path == null) return undefined;
  const p = String(path).trim();
  if (!p) return undefined;

  const parts = p
    .split(".")
    .map((s) => String(s).trim())
    .filter(Boolean);

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

  const candidates = [obj?.bl, obj?.bldata, obj?.tblBl, obj?.data, obj?.row];
  for (const c of candidates) {
    if (!c) continue;
    const v = tryFrom(c);
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

export function applyTokens(text, data, opts = {}) {
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

/* =========================================================
   Table helpers
========================================================= */

function normalizeCellKey(k) {
  return String(k || "").replace(/\s+/g, "");
}

function normCellKeyVariants(r, c) {
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
  const variants = normCellKeyVariants(r, c);
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

function normNL(s) {
  return String(s || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function normKey(k) {
  return String(k || "")
    .trim()
    .replace(/^\{\{/, "")
    .replace(/\}\}$/, "")
    .trim()
    .toLowerCase();
}

function findMergeAt(merges, r, c) {
  const ms = Array.isArray(merges) ? merges : [];
  for (const m of ms) {
    const r0 = Number(m.r0 ?? m.r ?? m.row ?? m.startRow ?? 0);
    const c0 = Number(m.c0 ?? m.c ?? m.col ?? m.startCol ?? 0);
    const rs = Number(m.rs ?? m.rowSpan ?? m.h ?? m.rows ?? 1);
    const cs = Number(m.cs ?? m.colSpan ?? m.w ?? m.cols ?? 1);
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

function resolveCellTextForMeasure({ el, tmeta, r, c, data }) {
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
  if (direct)
    return applyTokens(String(direct), data, { keepMissingTokens: false });

  if (bind) {
    const tokenKey =
      bind.columnKey ?? bind.key ?? bind.field ?? bind.fieldKey ?? bind.token;
    const path = bind.path;
    const label = bind.label;

    if (path) {
      const v = getByPath(data, path);
      if (v !== undefined && v !== null) return normNL(String(v));
    }
    if (tokenKey) {
      const tokenResolved = applyTokens(`{{${tokenKey}}}`, data, {
        keepMissingTokens: false,
      });
      if (tokenResolved && tokenResolved !== `{{${tokenKey}}}`)
        return tokenResolved;
    }
    if (label != null) return String(label);
  }

  return "";
}

function computeTableColMm(el) {
  const t = el.table || {};
  const cols = Number(t.cols || el.cols || 0);
  if (!cols) return [];

  const colW =
    Array.isArray(t.colW) && t.colW.length ? t.colW : Array(cols).fill(1);
  const totalW = colW.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
  const tableWmm = Number(el.w || 1);
  return colW.map((w) => ((Number(w) || 0) / totalW) * tableWmm);
}

function computeTableBaseRowMm(el) {
  const t = el.table || {};
  const rows = Number(t.rows || el.rows || 0);
  if (!rows) return [];

  const rowH =
    Array.isArray(t.rowH) && t.rowH.length ? t.rowH : Array(rows).fill(1);
  const tableHmm = Number(el.h || 0);
  const totalH = rowH.reduce((a, b) => a + (Number(b) || 0), 0) || 1;

  if (tableHmm > 0 && Math.abs(totalH - tableHmm) <= 0.5) {
    return rowH.map((x) => Number(x) || 0);
  }

  return tableHmm > 0
    ? rowH.map((h) => ((Number(h) || 0) / totalH) * tableHmm)
    : Array(rows).fill(8);
}

/* =========================================================
   Auto-size elements (mm)
========================================================= */

function isBold(fontWeight) {
  const fw = Number(fontWeight);
  if (Number.isFinite(fw)) return fw >= 600;
  const s = String(fontWeight || "").toLowerCase();
  return s === "bold" || s === "bolder";
}

function applyBoldMeasureTuning({ widthMm, measuredHmm, style }) {
  const bold = isBold(style?.fontWeight);
  if (!bold) return { widthMm, measuredHmm };

  const tunedWidth = Math.max(1, Number(widthMm || 1) * 0.975);
  const tunedHeight = Math.max(0, Number(measuredHmm || 0) * 1.05);
  return { widthMm: tunedWidth, measuredHmm: tunedHeight };
}

export function autoSizeTextElementMm(el, data, measureTextMm) {
  if (!el || el.type !== "text") return el;

  const wantsAuto =
    el.textMode === "auto" ||
    el.style?.canGrow === true ||
    el.style?.autoGrow === true ||
    el.canGrow === true;

  if (!wantsAuto) return el;

  const s = el.style || {};
  const minW = Number(el.minWidthMm ?? el.minW ?? 0) || 0;
  const maxW = Number(el.maxWidthMm ?? el.maxW ?? 0) || 0;
  const minH = Number(el.minHeightMm ?? el.minH ?? 0) || 0;
  const maxH = Number(el.maxHeightMm ?? el.maxH ?? 0) || 0;

  const mW = Number(el.w || 1);
  const wrapW = maxW > 0 ? Math.min(mW, maxW) : mW;
  const finalW = Math.max(minW || 0, wrapW);

  const measure =
    typeof measureTextMm === "function"
      ? measureTextMm
      : __defaultMeasureTextMm;

  let measuredHmm =
    Number(
      measure({
        text: String(el.text || ""),
        widthMm: finalW,
        style: s,
        data,
      }) || 0,
    ) || 0;

  const tuned = applyBoldMeasureTuning({
    widthMm: finalW,
    measuredHmm,
    style: s,
  });

  if (tuned.widthMm !== finalW) {
    measuredHmm =
      Number(
        measure({
          text: String(el.text || ""),
          widthMm: tuned.widthMm,
          style: s,
          data,
        }) || 0,
      ) || 0;

    measuredHmm = applyBoldMeasureTuning({
      widthMm: tuned.widthMm,
      measuredHmm,
      style: s,
    }).measuredHmm;
  } else {
    measuredHmm = tuned.measuredHmm;
  }

  let finalH = Math.max(Number(el.h || 0), measuredHmm, minH || 0);
  if (maxH > 0) finalH = Math.min(finalH, maxH);

  return { ...el, h: finalH, style: { ...s, canGrow: true } };
}

export function autoSizeTableMm(el, data, measureTextMm) {
  if (!el || el.type !== "table") return el;

  const tmeta = el.table || el.tbl || el.meta || {};
  const rows = Number(tmeta.rows || el.rows || 0);
  const cols = Number(tmeta.cols || el.cols || 0);
  if (!rows || !cols) return el;

  const merges = Array.isArray(tmeta.merges) ? tmeta.merges : [];
  const colMm = computeTableColMm(el);
  if (!colMm.length) return el;

  const baseRowMm = computeTableBaseRowMm(el);
  const rowHeightsMm = baseRowMm.slice();

  const measure =
    typeof measureTextMm === "function"
      ? measureTextMm
      : __defaultMeasureTextMm;

  const sumCols = (c0, cs) => {
    let s = 0;
    for (let i = 0; i < cs; i++) s += Number(colMm[c0 + i] || 0);
    return Math.max(1, s);
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isCoveredByMerge(merges, r, c)) continue;
      const m = findMergeAt(merges, r, c);
      const rs = m ? m.rs : 1;
      const cs = m ? m.cs : 1;

      const cellText = resolveCellTextForMeasure({ el, tmeta, r, c, data });
      if (!cellText) continue;

      const csx = pickFromMap(tmeta.cellStyle || {}, r, c) || {};
      const pad = csx.padding ?? tmeta.cellPadding ?? 6;

      const fs = csx.fontSize ?? tmeta.fontSize ?? el.style?.fontSize ?? 11;
      const fw =
        csx.fontWeight ?? tmeta.fontWeight ?? el.style?.fontWeight ?? 500;
      const align = csx.align ?? csx.textAlign ?? el.style?.align ?? "left";
      const lineHeight = csx.lineHeight ?? el.style?.lineHeight ?? 1.2;
      const letterSpacing = csx.letterSpacing ?? el.style?.letterSpacing ?? 0;

      const style = {
        fontFamily: el.style?.fontFamily,
        fontSize: fs,
        fontWeight: fw,
        align,
        padding: pad,
        lineHeight,
        letterSpacing,
      };

      const widthMmRaw = sumCols(c, cs);
      const tunedW = applyBoldMeasureTuning({
        widthMm: widthMmRaw,
        measuredHmm: 0,
        style,
      }).widthMm;

      let hMm =
        Number(
          measure({ text: cellText, widthMm: tunedW, style, data }) || 0,
        ) || 0;
      hMm = applyBoldMeasureTuning({
        widthMm: tunedW,
        measuredHmm: hMm,
        style,
      }).measuredHmm;

      const perRow = Math.max(0, hMm) / Math.max(1, rs);
      for (let rr = 0; rr < rs; rr++) {
        const ri = r + rr;
        if (ri < rowHeightsMm.length)
          rowHeightsMm[ri] = Math.max(rowHeightsMm[ri], perRow);
      }
    }
  }

  const totalHmmNew = rowHeightsMm.reduce((a, b) => a + (Number(b) || 0), 0);

  return {
    ...el,
    h: totalHmmNew > 0 ? totalHmmNew : el.h,
    style: { ...(el.style || {}), canGrow: true },
    table: {
      ...tmeta,
      rowHUnit: "mm",
      rowH: rowHeightsMm.map((x) => Number(x) || 0),
    },
  };
}

/* =========================================================
   FLOW Table Splitter (mm)
========================================================= */

function splitFlowTableElementMm(
  el,
  data,
  measureTextMm,
  usableTop,
  sliceHeightEff,
  canGrowColumnsSet,
  debug = true,
) {
  if (!el || el.type !== "table") return [el];

  if (!(canGrowColumnsSet instanceof Set) || canGrowColumnsSet.size === 0) {
    warnLayout(
      debug,
      "[BLReport] splitFlowTableElementMm skipped: no canGrowColumns configured",
      { id: el?.id },
    );
    return [el];
  }

  if (!Number.isFinite(Number(sliceHeightEff)) || Number(sliceHeightEff) <= 0) {
    warnLayout(
      debug,
      "[BLReport] splitFlowTableElementMm skipped: invalid sliceHeightEff",
      { id: el?.id, sliceHeightEff },
    );
    return [el];
  }

  const dbg = Boolean(
    debug || (typeof globalThis !== "undefined" && globalThis.__BL_FLOW_DEBUG),
  );

  const measure =
    typeof measureTextMm === "function"
      ? measureTextMm
      : __defaultMeasureTextMm;

  const t = el.table || {};
  const rows = Number(t.rows || el.rows || 0);
  const cols = Number(t.cols || el.cols || 0);
  if (!rows || !cols) return [el];

  const baseId = String(
    el.id || `flowTable_${Math.random().toString(16).slice(2)}`,
  );
  const bindings = t.bindings || {};
  const cellStyle = t.cellStyle || {};
  const merges = Array.isArray(t.merges) ? t.merges : [];

  const baseY = Math.max(Number(el.y || 0), Number(usableTop || 0));

  const normMerges = merges.map((m) => ({
    r0: Number(m.r0 ?? m.r ?? m.row ?? 0),
    c0: Number(m.c0 ?? m.c ?? m.col ?? 0),
    rs: Number(m.rs ?? m.rowSpan ?? m.h ?? 1),
    cs: Number(m.cs ?? m.colSpan ?? m.w ?? 1),
  }));

  const isCovered = (r, c) => {
    for (const m of normMerges) {
      if (r >= m.r0 && r < m.r0 + m.rs && c >= m.c0 && c < m.c0 + m.cs) {
        return !(r === m.r0 && c === m.c0);
      }
    }
    return false;
  };

  const findMergeAt2 = (r, c) => {
    for (const m of normMerges) {
      if (r >= m.r0 && r < m.r0 + m.rs && c >= m.c0 && c < m.c0 + m.cs) {
        return m;
      }
    }
    return null;
  };

  const colMm = computeTableColMm(el);
  if (!colMm?.length) return [el];

  let flowRow = -1;
  const flowCells = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (isCovered(r, c)) continue;

      const keyVariants = normCellKeyVariants(r, c);
      let b = null;
      for (const k of keyVariants) {
        if (bindings[k]) {
          b = bindings[k];
          break;
        }
      }

      let rawKey = b?.columnKey || b?.path || b?.key || b?.fieldname || "";
      let ck = normKey(rawKey);

      if (!canGrowColumnsSet.has(ck)) {
        const st = pickFromMap(cellStyle, r, c) || {};
        const cellVal = String(
          st.value ?? st.text ?? st.label ?? st.content ?? "",
        );
        const tokMatch = cellVal.match(/\{\{\s*([A-Za-z0-9_.]+)\s*\}\}/);
        if (tokMatch) {
          rawKey = tokMatch[1];
          ck = normKey(rawKey);
        }
      }

      if (canGrowColumnsSet.has(ck)) {
        const merge = findMergeAt2(r, c);
        flowRow = r;

        flowCells.push({
          r,
          c,
          rawKey,
          colKeyLower: ck,
          merge: merge ? { rs: merge.rs, cs: merge.cs } : { rs: 1, cs: 1 },
        });

        if (dbg) console.log("[FLOW-DETECT]", { baseId, r, c, key: ck });
      }
    }
    if (flowRow !== -1) break;
  }

  if (flowRow === -1 || !flowCells.length) {
    if (dbg) console.log("[FLOW] No FLOW row found", { baseId });
    return [el];
  }

  const pageBottomY = usableTop + sliceHeightEff;

  const baseRowMm = computeTableBaseRowMm(el);
  const sumBefore = (arr, idx) =>
    arr.slice(0, idx).reduce((a, b) => a + (Number(b) || 0), 0);

  const flowRowTopInTable = sumBefore(baseRowMm, flowRow);

  const availableHeight = pageBottomY - (baseY + flowRowTopInTable);
  const maxFlowRowH = Math.max(12, Math.min(availableHeight, sliceHeightEff));

  if (!Number.isFinite(maxFlowRowH) || maxFlowRowH <= 0) {
    warnLayout(
      debug,
      "[BLReport] splitFlowTableElementMm skipped: invalid maxFlowRowH",
      { id: el?.id, maxFlowRowH, availableHeight, sliceHeightEff },
    );
    return [el];
  }

  const cellRemain = {};
  for (const fc of flowCells) {
    const fullTextRaw =
      normNL(
        applyTokens(`{{${fc.rawKey}}}`, data, { keepMissingTokens: false }),
      ) ||
      normNL(
        applyTokens(`{{${fc.colKeyLower}}}`, data, {
          keepMissingTokens: false,
        }),
      ) ||
      "";

    const maybeTrim = String(fullTextRaw || "").trim();
    const isUnresolvedToken = /^\{\{[^}]+\}\}$/.test(maybeTrim);

    const lines = isUnresolvedToken
      ? []
      : String(fullTextRaw || "")
          .split("\n")
          .map((s) => String(s || "").trimEnd())
          .filter((s) => s.trim() !== "");

    cellRemain[`${fc.r},${fc.c}`] = lines;
  }

  const hasAnyFlowData = flowCells.some((fc) => {
    const arr = cellRemain[`${fc.r},${fc.c}`] || [];
    return arr.some((s) => String(s || "").trim() !== "");
  });

  if (!hasAnyFlowData) {
    const out = clone(el);
    out.table = out.table || {};
    out.table.cells = out.table.cells || {};
    for (const fc of flowCells) {
      out.table.cells[`${fc.r},${fc.c}`] = {
        ...(out.table.cells[`${fc.r},${fc.c}`] || {}),
        text: "",
      };
    }
    return [out];
  }

  const parts = [];
  let pageIndex = 0;

  while (Object.values(cellRemain).some((v) => v.length)) {
    const piece = clone(el);

    piece.__flowBaseId = baseId;
    piece.__baseId = baseId;
    piece.id = `${baseId}__flow_${pageIndex}`;

    piece.attachBand = "body";
    if (piece.band) delete piece.band;

    piece.y = baseY + pageIndex * sliceHeightEff;

    piece.table = piece.table || {};
    piece.table.rowHUnit = "mm";
    piece.table.rowH = baseRowMm.slice();

    let usedFlowHeightMm = 0;

    for (const fc of flowCells) {
      const key = `${fc.r},${fc.c}`;
      const remain = cellRemain[key] || [];
      const cs = Number(fc.merge?.cs || 1);

      let wMm = 0;
      for (let cc = fc.c; cc < fc.c + cs; cc++) wMm += colMm[cc] || 0;
      wMm = Math.max(1, wMm);

      const csx = pickFromMap(cellStyle, fc.r, fc.c) || {};
      const padPx =
        Number(csx.padding ?? t.cellPadding ?? el?.style?.padding ?? 6) || 0;
      const padMm = (padPx * 2) / MM_TO_PX;

      const style = {
        ...(el.style || {}),
        ...(csx || {}),
        padding: padPx,
      };

      const measureBlockHmm = (linesArr) => {
        const txt = Array.isArray(linesArr) ? linesArr.join("\n") : "";
        const textHmm =
          Number(
            measure({
              text: txt,
              widthMm: wMm,
              style,
              data,
            }),
          ) || 0;
        return Math.max(0, textHmm + padMm);
      };

      let lo = 1,
        hi = remain.length,
        best = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const h = measureBlockHmm(remain.slice(0, mid));

        if (h <= maxFlowRowH) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      if (best === 0 && maxFlowRowH > 14 && remain.length > 0) best = 1;

      const taken = remain.slice(0, best);
      cellRemain[key] = remain.slice(best);

      const contentHeightMm = measureBlockHmm(taken);
      usedFlowHeightMm = Math.max(usedFlowHeightMm, contentHeightMm);

      const cellKey = normCellKeyVariants(fc.r, fc.c)[0];

      piece.table.cellStyle = piece.table.cellStyle || {};
      piece.table.cellStyle[cellKey] = {
        ...(pickFromMap(cellStyle, fc.r, fc.c) || {}),
        value: taken.join("\n"),
      };

      piece.table.cells = piece.table.cells || {};
      piece.table.cells[cellKey] = { text: taken.join("\n") };

      piece.table.bindings = piece.table.bindings || {};
      normCellKeyVariants(fc.r, fc.c).forEach(
        (k) => delete piece.table.bindings[k],
      );
    }

    const isLastSlice = !Object.values(cellRemain).some((v) => v.length);

    piece.table.rowH[flowRow] = isLastSlice
      ? Math.max(usedFlowHeightMm, 12)
      : maxFlowRowH;

    if (!isLastSlice) {
      for (let rr = flowRow + 1; rr < piece.table.rowH.length; rr++) {
        piece.table.rowH[rr] = 0;
      }
    }

    piece.h = piece.table.rowH.reduce((a, b) => a + (Number(b) || 0), 0);

    parts.push(piece);
    pageIndex++;

    if (pageIndex > 500) {
      warnLayout(
        debug,
        "[BLReport] splitFlowTableElementMm emergency break after 500 chunks",
        { id: el?.id, baseId },
      );
      break;
    }
  }

  for (let i = 0; i < parts.length; i++) {
    const prev = parts[i - 1];
    const cur = parts[i];
    const next = parts[i + 1];

    const n = getNeighbourObj(cur) || {};
    const nn = { ...n };

    if (prev) nn.topId = prev.id;
    if (next) nn.bottomId = next.id;

    if (i === 0) {
      const origN = getNeighbourObj(el) || {};
      if (origN.topId) nn.topId = origN.topId;
    }

    if (i === parts.length - 1) {
      const origN = getNeighbourObj(el) || {};
      if (origN.bottomId) nn.bottomId = origN.bottomId;
    }

    cur.neighbors = nn;
    cur.neighbours = nn;
  }

  if (dbg) {
    console.log("[FLOW-RESULT]", {
      baseId,
      parts: parts.map((p) => p.id),
      baseY,
      sliceHeightEff,
    });
  }

  return parts.length ? parts : [el];
}

/* =========================================================
   REPEAT Table Splitter (mm)
========================================================= */

function isRepeatTableElementMm(el) {
  if (!el || String(el.type || "").toLowerCase() !== "table") return false;
  const t = el.table || {};
  const rep = t.repeat || {};
  return (
    rep.enabled === true &&
    !!rep.arrayPath &&
    Array.isArray(rep.columns) &&
    rep.columns.length > 0
  );
}

function resolveRepeatColumnsMm(repeat, firstRowObj) {
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

function buildRepeatChunkTableMm({ el, repeat, colsDef, rowsSlice }) {
  const header = colsDef.map((c) => String(c.label ?? c.key ?? ""));
  const body = rowsSlice.map((rowObj, idx) =>
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

  const headerH = Number(repeat?.headerHeightMm ?? 7) || 7;
  const rowH = Number(repeat?.rowHeightMm ?? 6) || 6;
  const h = headerH + body.length * rowH;

  const t = el.table || {};
  return {
    ...el,
    h,
    table: {
      ...t,
      repeatPrint: { header, body, columns: colsDef },
      repeat: { ...(repeat || {}), enabled: false },
    },
  };
}

function splitRepeatTableElementMm(
  el,
  data,
  usableTop,
  sliceHeightEff,
  debug = true,
) {
  if (!isRepeatTableElementMm(el)) return [el];

  const dbg = Boolean(
    debug ||
    (typeof globalThis !== "undefined" && globalThis.__BL_REPEAT_DEBUG),
  );

  const t = el.table || {};
  const repeat = t.repeat || {};

  const baseId = String(el.id || "");
  const baseNeighborIds = readNeighborIds(el);

  const arrVal = getByPath(data, String(repeat.arrayPath || ""));
  const arr = Array.isArray(arrVal) ? arrVal : [];

  const colsDef = resolveRepeatColumnsMm(repeat, arr[0]);
  if (!colsDef.length) return [el];

  const headerH = Number(repeat.headerHeightMm ?? 7) || 7;
  const rowH = Number(repeat.rowHeightMm ?? 6) || 6;

  const baseY = Math.max(Number(el.y || 0), Number(usableTop || 0));
  const sliceH = Math.max(1, Number(sliceHeightEff || 0));

  const availableFirst = usableTop + sliceH - baseY;
  const capFirst = Math.max(0, Math.floor((availableFirst - headerH) / rowH));

  if (dbg) {
    console.log("[REPEAT-SPLIT]", {
      id: baseId,
      y: Number(el.y || 0),
      baseY,
      usableTop,
      sliceH,
      headerH,
      rowH,
      rows: arr.length,
      capFirst,
    });
  }

  if (capFirst <= 0) {
    const moved = clone(el);
    moved.y = baseY + sliceH;
    return [moved];
  }

  const parts = [];
  let start = 0;
  let pageIndex = 0;

  while (start < arr.length) {
    const cap =
      pageIndex === 0
        ? capFirst
        : Math.max(1, Math.floor((sliceH - headerH) / rowH));
    const rowsSlice = arr.slice(start, start + cap);
    start += cap;

    const chunkEl = buildRepeatChunkTableMm({
      el: clone(el),
      repeat,
      colsDef,
      rowsSlice,
    });

    chunkEl.__repeatBaseId = baseId;
    chunkEl.__baseId = baseId;
    chunkEl.id = `${baseId}__chunk_${pageIndex}`;

    chunkEl.attachBand = "body";
    if (chunkEl.band) delete chunkEl.band;

    chunkEl.y = baseY + pageIndex * sliceH;

    parts.push(chunkEl);
    pageIndex += 1;

    if (pageIndex > 500) {
      warnLayout(
        debug,
        "[BLReport] splitRepeatTableElementMm emergency break after 500 chunks",
        { id: el?.id, baseId },
      );
      break;
    }
  }

  for (let i = 0; i < parts.length; i++) {
    const cur = parts[i];
    const prev = parts[i - 1];
    const next = parts[i + 1];

    const topId = prev ? prev.id : baseNeighborIds.topId;
    const bottomId = next ? next.id : baseNeighborIds.bottomId;

    writeNeighborIds(cur, {
      topId: topId || null,
      bottomId: bottomId || null,
      leftId: baseNeighborIds.leftId || null,
      rightId: baseNeighborIds.rightId || null,
    });
  }

  if (dbg)
    console.log(
      "[REPEAT-RESULT] baseId:",
      baseId,
      "parts:",
      parts.map((p) => p.id),
    );

  return parts.length ? parts : [el];
}

/* =========================================================
   Pagination bucketing
========================================================= */

function splitElementsByPage(elements, usableTop, usableHeightEff) {
  const pages = [];
  const sliceH = Math.max(1, Number(usableHeightEff || 0));
  const EPS = 0.001;

  for (const el of elements || []) {
    const y = Number(el?.y || 0);
    const idx = Math.max(0, Math.floor((y - usableTop + EPS) / sliceH));
    while (pages.length <= idx) pages.push([]);
    pages[idx].push(el);
  }

  for (const p of pages)
    p.sort((a, b) => Number(a?.z || 0) - Number(b?.z || 0));
  return pages;
}

/* =========================================================
   Attachment band detection + heights
========================================================= */

function tableHasFlowKey(el, canGrowColumnsSet) {
  if (!el || String(el.type || "").toLowerCase() !== "table") return false;
  if (!(canGrowColumnsSet instanceof Set) || canGrowColumnsSet.size === 0)
    return false;

  const t = el.table || {};
  const bindings = t.bindings || {};
  const cellStyle = t.cellStyle || {};

  const checkKey = (raw) => canGrowColumnsSet.has(normKey(raw));

  for (const k of Object.keys(bindings)) {
    const b = bindings[k] || {};
    const raw =
      b.columnKey ?? b.path ?? b.key ?? b.fieldname ?? b.fieldKey ?? b.token;
    if (raw && checkKey(raw)) return true;
  }

  for (const k of Object.keys(cellStyle)) {
    const st = cellStyle[k] || {};
    const cellVal = String(st.value ?? st.text ?? st.label ?? "");
    const m = cellVal.match(/\{\{\s*([A-Za-z0-9_.]+)\s*\}\}/);
    if (m && checkKey(m[1])) return true;
  }

  return false;
}

function deriveAttachBandsAndHeights(
  page,
  usableTop,
  usableHeightEff,
  canGrowColumnsSet,
) {
  const els = Array.isArray(page?.elements) ? page.elements : [];

  const hasBandMarkers = els.some((e) => {
    const b = String(e?.attachBand || "").toLowerCase();
    return b === "header" || b === "footer" || b === "body";
  });

  let attachHeaderMm = Number(page?.attachHeaderMm || 0) || 0;
  let attachFooterMm = Number(page?.attachFooterMm || 0) || 0;

  const pageBottom = usableTop + usableHeightEff;

  const MAX_HEADER_MM = 70;
  const MAX_FOOTER_MM = 70;

  const clamp = (v, max) => Math.max(0, Math.min(Number(v || 0) || 0, max));

  if (hasBandMarkers) {
    if (attachHeaderMm <= 0) {
      const headerBottom = els
        .filter((e) => String(e?.attachBand || "").toLowerCase() === "header")
        .reduce(
          (m, e) => Math.max(m, Number(e.y || 0) + Number(e.h || 0)),
          -Infinity,
        );

      if (Number.isFinite(headerBottom) && headerBottom > usableTop)
        attachHeaderMm = headerBottom - usableTop;
    }

    if (attachFooterMm <= 0) {
      const footerTop = els
        .filter((e) => String(e?.attachBand || "").toLowerCase() === "footer")
        .reduce((m, e) => Math.min(m, Number(e.y || 0)), Infinity);

      if (Number.isFinite(footerTop) && footerTop < pageBottom)
        attachFooterMm = pageBottom - footerTop;
    }
  } else {
    attachHeaderMm = clamp(attachHeaderMm, MAX_HEADER_MM);
    attachFooterMm = clamp(attachFooterMm, MAX_FOOTER_MM);

    if (
      attachHeaderMm <= 0 &&
      canGrowColumnsSet instanceof Set &&
      canGrowColumnsSet.size > 0
    ) {
      const flowTables = els.filter((e) =>
        tableHasFlowKey(e, canGrowColumnsSet),
      );
      const minFlowY = flowTables.reduce(
        (m, e) => Math.min(m, Number(e.y || 0)),
        Infinity,
      );
      if (Number.isFinite(minFlowY) && minFlowY > usableTop + 0.5)
        attachHeaderMm = minFlowY - usableTop;
    }
  }

  attachHeaderMm = clamp(attachHeaderMm, MAX_HEADER_MM);
  attachFooterMm = clamp(attachFooterMm, MAX_FOOTER_MM);

  return { hasBandMarkers, attachHeaderMm, attachFooterMm };
}

/* =========================================================
   Overlay + snapping helpers
========================================================= */

function bakeOverlayTextsIntoTables(page) {
  const els = Array.isArray(page?.elements) ? page.elements : [];
  if (!els.length) return page;

  const tables = els.filter((e) => e?.type === "table");
  if (!tables.length) return page;

  const remaining = [];
  const consumedTextIds = new Set();

  const getRowHeightsMm = (tblEl) => {
    const t = tblEl.table || {};
    if (t.rowHUnit === "mm" && Array.isArray(t.rowH) && t.rowH.length)
      return t.rowH.map((x) => Number(x) || 0);
    return computeTableBaseRowMm(tblEl);
  };

  const getColWidthsMm = (tblEl) => computeTableColMm(tblEl);

  const findCellAtPoint = (tblEl, px, py) => {
    const x0 = Number(tblEl.x || 0);
    const y0 = Number(tblEl.y || 0);
    const w = Number(tblEl.w || 0);
    const h = Number(tblEl.h || 0);

    if (px < x0 || px > x0 + w || py < y0 || py > y0 + h) return null;

    const colMm = getColWidthsMm(tblEl);
    const rowMm = getRowHeightsMm(tblEl);
    if (!colMm.length || !rowMm.length) return null;

    const relX = px - x0;
    const relY = py - y0;

    let c = 0,
      accX = 0;
    for (; c < colMm.length; c++) {
      accX += Number(colMm[c] || 0);
      if (relX <= accX + 0.001) break;
    }
    if (c >= colMm.length) c = colMm.length - 1;

    let r = 0,
      accY = 0;
    for (; r < rowMm.length; r++) {
      accY += Number(rowMm[r] || 0);
      if (relY <= accY + 0.001) break;
    }
    if (r >= rowMm.length) r = rowMm.length - 1;

    return { r, c };
  };

  for (const tbl of tables) {
    const tmeta = tbl.table || {};
    const nextTbl = clone(tbl);

    nextTbl.table = nextTbl.table || {};
    nextTbl.table.cells = nextTbl.table.cells || {};
    nextTbl.table.cellStyle = nextTbl.table.cellStyle || {};

    const overlayTexts = els.filter((e) => {
      if (!e || e.type !== "text") return false;
      if (consumedTextIds.has(e.id)) return false;

      const txt = String(e.text || "").trim();
      if (!txt) return false;

      if (/\{\{[^}]+\}\}/.test(txt)) return false;

      const cx = Number(e.x || 0) + Number(e.w || 0) / 2;
      const cy = Number(e.y || 0) + Number(e.h || 0) / 2;

      const cell = findCellAtPoint(nextTbl, cx, cy);
      if (!cell) return false;
      if (cell.r !== 0) return false;

      return true;
    });

    for (const te of overlayTexts) {
      const cx = Number(te.x || 0) + Number(te.w || 0) / 2;
      const cy = Number(te.y || 0) + Number(te.h || 0) / 2;
      const cell = findCellAtPoint(nextTbl, cx, cy);
      if (!cell) continue;

      const key = normCellKeyVariants(cell.r, cell.c)[0];

      nextTbl.table.cells[key] = { text: String(te.text || "") };
      nextTbl.table.cellStyle[key] = {
        ...(pickFromMap(tmeta.cellStyle || {}, cell.r, cell.c) || {}),
        value: String(te.text || ""),
      };

      consumedTextIds.add(te.id);
    }

    remaining.push(nextTbl);
  }

  for (const e of els) {
    if (!e) continue;
    if (e.type === "table") continue;
    if (e.type === "text" && consumedTextIds.has(e.id)) continue;
    remaining.push(e);
  }

  remaining.sort((a, b) => Number(a?.z || 0) - Number(b?.z || 0));
  return { ...page, elements: remaining };
}

function isHeaderFooterEl(el) {
  const band = String(el?.attachBand || "").toLowerCase();
  return band === "header" || band === "footer";
}

function snapTouchingTables(page, gapToleranceMm = 2) {
  const els = Array.isArray(page?.elements) ? page.elements : [];
  const tables = els.filter((e) => e?.type === "table");
  if (tables.length < 2) return page;

  const updated = els.map((e) => e);

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

  return { ...page, elements: updated };
}

function tightenHeaderBodyGap(page, { epsilon = 0.2 } = {}) {
  const els = Array.isArray(page?.elements) ? page.elements : [];
  if (!els.length) return page;

  const headerEls = els.filter(
    (e) => String(e?.attachBand || "").toLowerCase() === "header",
  );
  const bodyEls = els.filter(
    (e) => String(e?.attachBand || "").toLowerCase() === "body",
  );

  if (!headerEls.length || !bodyEls.length) return page;

  const headerBottom = headerEls.reduce(
    (m, e) => Math.max(m, Number(e.y || 0) + Number(e.h || 0)),
    -Infinity,
  );
  const bodyMinY = bodyEls.reduce(
    (m, e) => Math.min(m, Number(e.y || 0)),
    Infinity,
  );

  if (!Number.isFinite(headerBottom) || !Number.isFinite(bodyMinY)) return page;

  const gap = bodyMinY - headerBottom;
  if (gap <= epsilon) return page;

  const shiftUp = headerBottom - bodyMinY;
  const next = els.map((e) => {
    const band = String(e?.attachBand || "").toLowerCase();
    if (band !== "body") return e;
    return { ...e, y: Number(e.y || 0) + shiftUp };
  });

  return { ...page, elements: next };
}

/* =========================================================
   Force A4 sizing consistently
========================================================= */

function forceA4OnTemplateAndPages(tpl, paperMm) {
  const w = Number(paperMm?.w || 210);
  const h = Number(paperMm?.h || 297);

  const out = { ...tpl };
  out.paper = { ...(out.paper || {}), wMm: w, hMm: h, w, h };
  out.page = { ...(out.page || {}), wMm: w, hMm: h };

  if (Array.isArray(out.pages)) {
    out.pages = out.pages.map((p) => ({
      ...p,
      paper: { ...(p.paper || {}), wMm: w, hMm: h, w, h },
      page: { ...(p.page || {}), wMm: w, hMm: h },
    }));
  }

  return out;
}

/* =========================================================
   Neighbor rewrite + prune
========================================================= */

function buildChunkMap(elements) {
  const map = new Map();
  for (const e of elements || []) {
    const base = e?.__flowBaseId || e?.__repeatBaseId || null;
    if (!base || !e?.id) continue;
    const baseId = String(base);
    const rec = map.get(baseId) || { baseId, chunks: [] };
    rec.chunks.push(String(e.id));
    map.set(baseId, rec);
  }

  for (const rec of map.values()) {
    rec.chunks.sort((a, b) => {
      const ai = Number(String(a).split("_").pop());
      const bi = Number(String(b).split("_").pop());
      if (Number.isFinite(ai) && Number.isFinite(bi)) return ai - bi;
      return a.localeCompare(b);
    });
    rec.firstId = rec.chunks[0];
    rec.lastId = rec.chunks[rec.chunks.length - 1];
  }

  return map;
}

function rewriteNeighborRefsToChunks(elements, chunkMap, debugLabel) {
  const els = Array.isArray(elements) ? elements : [];
  if (!els.length || !chunkMap || chunkMap.size === 0) return els;

  const dbg = Boolean(globalThis.__BL_NEIGHBOR_DEBUG);
  let rewrites = 0;

  for (const e of els) {
    if (!e?.id) continue;

    const ids = readNeighborIds(e);
    const n2 = { ...ids };

    if (ids.topId && chunkMap.has(ids.topId)) {
      n2.topId = chunkMap.get(ids.topId).firstId || ids.topId;
      rewrites++;
    }
    if (ids.bottomId && chunkMap.has(ids.bottomId)) {
      n2.bottomId = chunkMap.get(ids.bottomId).lastId || ids.bottomId;
      rewrites++;
    }
    if (ids.leftId && chunkMap.has(ids.leftId)) {
      n2.leftId = chunkMap.get(ids.leftId).firstId || ids.leftId;
      rewrites++;
    }
    if (ids.rightId && chunkMap.has(ids.rightId)) {
      n2.rightId = chunkMap.get(ids.rightId).firstId || ids.rightId;
      rewrites++;
    }

    writeNeighborIds(e, n2);
  }

  if (dbg) {
    console.log(
      `🔧 [BLReport] Neighbor rewrite (${debugLabel}) rewrites=${rewrites}`,
    );
    console.log(
      "🔧 [BLReport] Chunk map:",
      Array.from(chunkMap.values()).map((x) => ({
        baseId: x.baseId,
        firstId: x.firstId,
        lastId: x.lastId,
        chunks: x.chunks,
      })),
    );
  }

  return els;
}

function pruneNeighborsNotInSamePage(elements, debugLabel) {
  const els = Array.isArray(elements) ? elements : [];
  if (!els.length) return els;

  const dbg = Boolean(globalThis.__BL_NEIGHBOR_DEBUG);
  const idsOnPage = new Set(
    els.map((e) => String(e?.id || "")).filter(Boolean),
  );

  let pruned = 0;

  for (const e of els) {
    if (!e?.id) continue;
    const ids = readNeighborIds(e);
    const n2 = { ...ids };

    const pruneIfMissing = (k) => {
      const v = n2[k];
      if (v && !idsOnPage.has(String(v))) {
        n2[k] = null;
        pruned++;
      }
    };

    pruneIfMissing("topId");
    pruneIfMissing("bottomId");
    pruneIfMissing("leftId");
    pruneIfMissing("rightId");

    writeNeighborIds(e, n2);
  }

  if (dbg)
    console.log(
      `🧹 [BLReport] Neighbor prune (${debugLabel}) pruned=${pruned}`,
    );

  return els;
}

/* =========================================================
   Layout (main API)
========================================================= */

export function layoutTemplateForData(
  template,
  data,
  {
    paperMm,
    marginMm = DEFAULT_PAGE_MARGIN_MM,
    headerEnabled = false,
    headerHeightMm = 0,
    measureTextMm,
    safetyBottomMm = DEFAULT_SAFETY_BOTTOM_MM,
    debug = true,
  } = {},
) {
  try {
    if (!paperMm) throw new Error("paperMm required");

    const measure =
      typeof measureTextMm === "function"
        ? measureTextMm
        : __defaultMeasureTextMm;

    let tpl = forceA4OnTemplateAndPages(
      ensureHybridSections(clone(template)),
      paperMm,
    );

    const canGrowColumnsSet = getCanGrowColumnsSet(tpl);
    const hasCanGrowColumns = canGrowColumnsSet.size > 0;

    if (!hasCanGrowColumns) {
      const msg =
        "No canGrowColumns selected. FLOW split is disabled; oversized can-grow tables may not paginate.";
      tpl = addWarningToObj(tpl, msg);
      warnLayout(debug, "[BLReport]", msg);
    }

    const usableTop = marginMm.top + (headerEnabled ? headerHeightMm : 0);
    const usableBottom = paperMm.h - marginMm.bottom;
    const usableHeight = usableBottom - usableTop;
    const usableHeightEff = Math.max(
      0,
      usableHeight - Math.max(0, Number(safetyBottomMm || 0) || 0),
    );
    const pageW = paperMm.w;

    if (debug) {
      console.log("[BLReport] layoutTemplateForData()");
      console.log("[BLReport] paperMm:", paperMm);
      console.log("[BLReport] marginMm:", marginMm);
      console.log(
        "[BLReport] usableTop:",
        usableTop,
        "usableHeight:",
        usableHeight,
      );
      console.log("[BLReport] safetyBottomMm:", safetyBottomMm);
      console.log("[BLReport] usableHeightEff:", usableHeightEff);
      console.log(
        "[BLReport] canGrowColumns:",
        Array.from(canGrowColumnsSet.values()),
      );
    }

    const outPages = [];
    let __attachNo = 0;

    for (const p of tpl.pages || []) {
      let page = clone(p);

      try {
        page.sections = Array.isArray(page.sections) ? page.sections : [];
        page.elements = Array.isArray(page.elements) ? page.elements : [];

        const __origPosMap = buildOriginalPosMap(page.elements);

        page.elements = page.elements.map((el) => {
          if (!el) return el;
          if (el.type === "text")
            return autoSizeTextElementMm(el, data, measure);
          if (el.type === "table") return autoSizeTableMm(el, data, measure);
          return el;
        });

        page.elements = bakeOverlayTextsIntoTables(page).elements;
        page.elements = snapTouchingTables(page, 5).elements;

        const sections = page.sections
          .slice()
          .sort((a, b) => (a.yMm || 0) - (b.yMm || 0));
        for (let i = 0; i < sections.length; i++) {
          const sec = sections[i];
          const rect = resolveSectionRect(sec, pageW);
          const els = elementsInSection(page.elements, sec.id);

          let used = 0;
          for (const el of els) {
            const bottom = Number(el.y || 0) + Number(el.h || 0) - rect.yMm;
            used = Math.max(used, bottom);
          }

          const baseH = Number(sec.hMm || 0);
          const newH = sec.canGrow ? Math.max(baseH, used) : baseH;
          const delta = newH - baseH;

          if (delta > 0) {
            sec.hMm = newH;

            if (sec.pushDown) {
              for (let j = i + 1; j < sections.length; j++)
                sections[j].yMm = Number(sections[j].yMm || 0) + delta;

              page.elements = page.elements.map((el) => {
                const y = Number(el.y || 0);
                if (y >= rect.yMm + baseH) return { ...el, y: y + delta };
                return el;
              });
            }
          }
        }
        page.sections = sections;

        page.elements = applyNeighbourVerticalFlow(page.elements, __origPosMap);

        const bandInfo = deriveAttachBandsAndHeights(
          page,
          usableTop,
          usableHeightEff,
          canGrowColumnsSet,
        );
        page.attachHeaderMm = bandInfo.attachHeaderMm;
        page.attachFooterMm = bandInfo.attachFooterMm;

        const expanded = [];

        const elsForExpand = (page.elements || [])
          .slice()
          .sort(
            (a, b) =>
              Number(a?.y || 0) - Number(b?.y || 0) ||
              Number(a?.z || 0) - Number(b?.z || 0),
          );

        const useBodySlice =
          bandInfo.attachHeaderMm > 0 || bandInfo.attachFooterMm > 0;

        const flowTop = useBodySlice
          ? usableTop + bandInfo.attachHeaderMm
          : usableTop;
        const flowSliceH = useBodySlice
          ? Math.max(
              0,
              usableHeightEff -
                bandInfo.attachHeaderMm -
                bandInfo.attachFooterMm,
            )
          : usableHeightEff;

        for (let i = 0; i < elsForExpand.length; i++) {
          const el = elsForExpand[i];

          if (el?.type !== "table") {
            expanded.push(el);
            continue;
          }

          let parts = null;

          if (isRepeatTableElementMm(el)) {
            parts = splitRepeatTableElementMm(
              el,
              data,
              flowTop,
              flowSliceH,
              debug,
            );
          } else if (hasCanGrowColumns) {
            parts = splitFlowTableElementMm(
              el,
              data,
              measure,
              flowTop,
              flowSliceH,
              canGrowColumnsSet,
              debug,
            );
          } else {
            parts = [el];

            const bodyTopCandidate =
              usableTop + Number(page.attachHeaderMm || 0);
            const bodyHeightCandidate = Math.max(
              0,
              usableHeightEff -
                Number(page.attachHeaderMm || 0) -
                Number(page.attachFooterMm || 0),
            );
            const bottom = Number(el.y || 0) + Number(el.h || 0);

            if (
              bodyHeightCandidate > 0 &&
              bottom > bodyTopCandidate + bodyHeightCandidate + 0.001
            ) {
              const warnMsg = `Table "${String(
                el.id || "",
              )}" exceeds printable body area, but no canGrowColumns are selected.`;
              page = addWarningToObj(page, warnMsg);
              warnLayout(debug, "[BLReport]", warnMsg);
            }
          }

          if (!Array.isArray(parts) || parts.length === 0) parts = [el];

          expanded.push(...parts);

          if (parts.length > 1 && flowSliceH > 0.01) {
            const eps = 0.001;

            const tableTop0 = Number(el.y || 0);
            const tableBottom0 = Number(el.y || 0) + Number(el.h || 0);

            const last = parts[parts.length - 1];
            const lastEnd = Number(last.y || 0) + Number(last.h || 0);

            const baseNeighborIds = readNeighborIds(el);
            const directBottomNeighborId = normalizeNeighborId(
              baseNeighborIds.bottomId,
            );

            if (debug) {
              console.log("[TABLE-SPLIT-REANCHOR]", {
                id: el?.id,
                tableTop0,
                tableBottom0,
                parts: parts.length,
                lastEnd,
                flowTop,
                flowSliceH,
                directBottomNeighborId,
              });
            }

            for (let j = i + 1; j < elsForExpand.length; j++) {
              const e2 = elsForExpand[j];
              if (!e2) continue;
              if (isHeaderFooterEl(e2)) continue;

              const yOld = Number(e2.y || 0);
              if (yOld + eps < tableTop0) continue;

              const e2BaseId = String(
                e2?.__flowBaseId ||
                  e2?.__repeatBaseId ||
                  e2?.__baseId ||
                  e2?.id ||
                  "",
              );

              const isDirectBottomNeighbor =
                !!directBottomNeighborId &&
                (String(e2?.id || "") === directBottomNeighborId ||
                  e2BaseId === directBottomNeighborId ||
                  readNeighborIds(e2).topId === String(el?.id || ""));

              const gapFromTableEnd = yOld - tableBottom0;
              const gapSafe = gapFromTableEnd > -0.5 ? gapFromTableEnd : 0;

              const yNew = isDirectBottomNeighbor ? lastEnd : lastEnd + gapSafe;

              if (debug && Math.abs(yNew - yOld) > 0.01) {
                console.log("[TABLE-SPLIT-MOVE]", {
                  movedId: e2.id,
                  yOld,
                  yNew,
                  isDirectBottomNeighbor,
                  gapFromTableEnd,
                  gapSafe,
                });
              }

              elsForExpand[j] = { ...e2, y: yNew };
            }
          }
        }

        page.elements = expanded;

        const chunkMap = buildChunkMap(page.elements);
        if (chunkMap.size)
          rewriteNeighborRefsToChunks(
            page.elements,
            chunkMap,
            page.name || page.id,
          );

        page.elements = applyNeighbourVerticalFlow(page.elements, __origPosMap);

        page.elements = compactDirectFollowersAfterChunkGrowth(page.elements, {
          debug,
        });

        page.elements = applyNeighbourVerticalFlow(page.elements, __origPosMap);
        page.elements = snapTouchingTables(page, 3).elements;

        const attachHeaderMm = Number(page.attachHeaderMm || 0);
        const attachFooterMm = Number(page.attachFooterMm || 0);

        const bodyTop = usableTop + attachHeaderMm;
        const bodyHeightEff = Math.max(
          0,
          usableHeightEff - attachHeaderMm - attachFooterMm,
        );

        if (!Number.isFinite(bodyHeightEff) || bodyHeightEff < 0) {
          page = addWarningToObj(
            page,
            `Invalid bodyHeightEff calculated for page "${page.name || page.id}".`,
          );
          outPages.push(page);
          continue;
        }

        const headerLimitY = usableTop + attachHeaderMm;
        const footerStartY = usableTop + usableHeightEff - attachFooterMm;

        const headerEls = [];
        const footerEls = [];
        let bodyEls = [];

        for (const el of page.elements || []) {
          if (!el) continue;
          const y = Number(el.y || 0);
          const h = Number(el.h || 0);
          const bottom = y + h;

          const band = String(el.attachBand || "").toLowerCase();

          if (bandInfo.hasBandMarkers) {
            if (band === "header") headerEls.push(el);
            else if (band === "footer") footerEls.push(el);
            else bodyEls.push({ ...el, attachBand: "body" });
          } else {
            const isHeader = attachHeaderMm > 0 && y < headerLimitY;
            const isFooter = attachFooterMm > 0 && bottom > footerStartY;

            if (isHeader) headerEls.push({ ...el, attachBand: "header" });
            else if (isFooter) footerEls.push({ ...el, attachBand: "footer" });
            else bodyEls.push({ ...el, attachBand: "body" });
          }
        }

        const maxBottomBody = bodyEls.reduce(
          (m, el) => Math.max(m, Number(el.y || 0) + Number(el.h || 0)),
          0,
        );

        if (debug) {
          console.log(
            "[BLReport] page:",
            page.name || page.id,
            "attachHeaderMm:",
            attachHeaderMm,
            "attachFooterMm:",
            attachFooterMm,
            "bodyTop:",
            bodyTop,
            "bodyHeightEff:",
            bodyHeightEff,
            "maxBottomBody:",
            maxBottomBody,
            "hasBandMarkers:",
            bandInfo.hasBandMarkers,
          );
        }

        if (maxBottomBody <= bodyTop + bodyHeightEff || bodyHeightEff <= 0) {
          pruneNeighborsNotInSamePage(
            page.elements,
            `${page.name || page.id} (single)`,
          );
          outPages.push(page);
          continue;
        }

        if (!hasCanGrowColumns) {
          page = addWarningToObj(
            page,
            `Content exceeds one printable page on "${page.name || page.id}", but canGrowColumns is empty, so flow pagination was skipped.`,
          );
          pruneNeighborsNotInSamePage(
            page.elements,
            `${page.name || page.id} (single-no-flow)`,
          );
          outPages.push(page);
          continue;
        }

        const bodySplits = splitElementsByPage(bodyEls, bodyTop, bodyHeightEff);

        const hasMeaningfulBody = (elements) => {
          const els = Array.isArray(elements) ? elements : [];
          return els.some((el) => {
            if (!el) return false;
            const b = String(el.attachBand || "").toLowerCase();
            if (b === "header" || b === "footer") return false;
            if (el.type === "text") return String(el.text || "").trim() !== "";
            if (el.type === "table") return true;
            return false;
          });
        };

        for (let pi = 0; pi < bodySplits.length; pi++) {
          const pe = clone(page);

          pe.id = pi === 0 ? page.id : `${page.id}_attach_${pi}`;
          pe.name = pi === 0 ? page.name : `Attachment ${++__attachNo}`;

          const pageOffset = pi * bodyHeightEff;

          const headerRepeat = headerEls.map((e) => clone(e));
          const footerRepeat = footerEls.map((e) => clone(e));

          const bodyThisPage = bodySplits[pi].map((el) => ({
            ...el,
            y: Number(el.y || 0) - pageOffset,
            attachBand: "body",
          }));

          pe.elements = [...headerRepeat, ...bodyThisPage, ...footerRepeat];

          pe.elements = tightenHeaderBodyGap(pe).elements;
          pe.elements = snapTouchingTables(pe, 3).elements;

          pe.elements = pruneNeighborsNotInSamePage(
            pe.elements,
            pe.name || pe.id,
          );

          if (pi > 0 && !hasMeaningfulBody(pe.elements)) continue;

          outPages.push(pe);
        }
      } catch (pageErr) {
        const msg = `Layout failed for page "${page?.name || page?.id || "unknown"}": ${
          pageErr?.message || String(pageErr)
        }`;
        warnLayout(debug, "[BLReport]", msg, pageErr);
        page = addErrorToObj(page, msg);
        outPages.push(page);
      }
    }

    let finalTpl = { ...tpl, pages: outPages };
    finalTpl = forceA4OnTemplateAndPages(finalTpl, paperMm);
    return finalTpl;
  } catch (err) {
    const msg = `layoutTemplateForData failed: ${err?.message || String(err)}`;
    warnLayout(debug, "[BLReport]", msg, err);

    let safeTpl = forceA4OnTemplateAndPages(
      ensureHybridSections(clone(template || {})),
      paperMm || { w: 210, h: 297 },
    );
    safeTpl = addErrorToObj(safeTpl, msg);
    return safeTpl;
  }
}

/* EOF_OK */
