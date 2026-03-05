/**
 * Hybrid Crystal-like layout helpers for BL Report
 * - Auto-size text + tables
 * - Grow "canGrow" sections + pushDown
 * - Split FLOW tables (goodsDescDetailsAttach / marksAndNosDetailsAttach) across pages like Crystal "band"
 *
 * IMPORTANT:
 * 1) When we set table.rowHUnit="mm", the renderer MUST treat rowH values as mm (do NOT re-normalize).
 * 2) layoutTemplateForData() must be called before rendering.
 */

const DEFAULT_PAGE_MARGIN_MM = { top: 5, right: 5, bottom: 5, left: 5 };

// FLOW keys which can become very large and must spill to new pages
const FLOW_KEYS = new Set([
  "goodsdescdetailsattach",
  "marksandnosdetailsattach",
]);

// a little extra breathing room so text never touches the paper bottom
const DEFAULT_SAFETY_BOTTOM_MM = 2;
globalThis.__BL_FLOW_DEBUG = true;

/* =========================================================
   Built-in measureTextMm (Canvas) ✅ bold-safe
   - If your app's measureTextMm doesn't include fontWeight in ctx.font,
     bold will wrap differently in real render vs measurement.
========================================================= */

const MM_TO_PX = 96 / 25.4;

function normalizeFontWeight(fw) {
  if (fw == null || fw === "") return "400";
  const n = Number(fw);
  if (Number.isFinite(n)) return String(n);
  const s = String(fw).toLowerCase();
  if (s === "bold") return "700";
  if (s === "bolder") return "800";
  if (s === "normal") return "400";
  return s; // allow "600", etc
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

function createDefaultMeasureTextMm() {
  // If running SSR, we can't measure
  if (typeof document === "undefined") {
    return ({ text, widthMm }) => {
      // fallback rough estimate
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

    // fontSize is stored as CSS px in BL Creator; allow explicit pt via style.fontSizeUnit="pt"
    const fontSizePx =
      String(s.fontSizeUnit || "").toLowerCase() === "pt"
        ? ptToPx(fontSizeRaw)
        : fontSizeRaw;

    // ✅ CRITICAL: include weight + style
    ctx.font = `${fontStyle} ${fontWeight} ${fontSizePx}px ${fontFamily}`;

    const lineHeight = Number(s.lineHeight || 1.2);
    const letterSpacing = Number(s.letterSpacing || 0);

    // padding provided by table logic may be "px-ish"; treat gently
    const pad = Number(s.padding ?? 0) || 0;

    // widthMm -> px, subtract a small padding influence
    const maxWidthPx = Math.max(1, Number(widthMm || 1) * MM_TO_PX - pad * 0.5);

    const raw = String(text || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
    const lines = raw.split("\n");

    let wrappedCount = 0;

    for (const line of lines) {
      const words = line.split(/\s+/).filter(Boolean);

      // blank line
      if (!words.length) {
        wrappedCount += 1;
        continue;
      }

      let cur = words[0];
      for (let i = 1; i < words.length; i++) {
        const next = `${cur} ${words[i]}`;
        const w = ctx.measureText(next).width + next.length * letterSpacing;

        if (w <= maxWidthPx) {
          cur = next;
        } else {
          wrappedCount += 1;
          cur = words[i];
        }
      }
      wrappedCount += 1;
    }

    const linePx = fontSizePx * lineHeight;
    const heightPx = wrappedCount * linePx;

    // px -> mm, add small safety
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
   Token helpers (case-insensitive path)
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

    // ✅ For report rendering & measurement, missing tokens behave like empty text (prevents row-height shifts).
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

  return {
    ...el,
    h: finalH,
    style: { ...s, canGrow: true },
  };
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
        if (ri < rowHeightsMm.length) {
          rowHeightsMm[ri] = Math.max(rowHeightsMm[ri], perRow);
        }
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
  debug = true,
) {
  if (!el || el.type !== "table") return [el];
  console.log("=========== inside splitFlowTableElementMm");

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

  const bindings = t.bindings || {};
  const cellStyle = t.cellStyle || {};
  const merges = Array.isArray(t.merges) ? t.merges : [];

  // ✅ Anchor to top of current slice (important for attachment y=0 templates)
  const baseY = Math.max(Number(el.y || 0), Number(usableTop || 0));

  /* ---------- normalize merges ---------- */
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

  /* ---------- detect FLOW row ---------- */
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

      if (!FLOW_KEYS.has(ck)) {
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

      if (FLOW_KEYS.has(ck)) {
        const merge = findMergeAt2(r, c);
        flowRow = r;

        flowCells.push({
          r,
          c,
          rawKey,
          colKeyLower: ck,
          merge: merge ? { rs: merge.rs, cs: merge.cs } : { rs: 1, cs: 1 },
        });

        if (dbg) console.log("[FLOW-DETECT]", { r, c, key: ck });
      }
    }
    if (flowRow !== -1) break;
  }

  if (flowRow === -1 || !flowCells.length) {
    if (dbg) console.log("[FLOW] No FLOW row found");
    return [el];
  }

  const pageBottomY = usableTop + sliceHeightEff;

  const baseRowMm = computeTableBaseRowMm(el);

  const sumBefore = (arr, idx) =>
    arr.slice(0, idx).reduce((a, b) => a + (Number(b) || 0), 0);

  const flowRowTopInTable = sumBefore(baseRowMm, flowRow);

  const availableHeight = pageBottomY - (baseY + flowRowTopInTable);
  const maxFlowRowH = Math.max(12, Math.min(availableHeight, sliceHeightEff));

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
      const cellKey = `${fc.r},${fc.c}`;
      out.table.cells[cellKey] = {
        ...(out.table.cells[cellKey] || {}),
        text: "",
      };
    }

    return [out];
  }

  const parts = [];
  let pageIndex = 0;

  while (true) {
    if (!Object.values(cellRemain).some((v) => v.length)) break;

    const piece = clone(el);
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

      const style = {
        ...(el.style || {}),
        ...(pickFromMap(cellStyle, fc.r, fc.c) || {}),
        padding: 0,
      };

      let lo = 1,
        hi = remain.length,
        best = 0;

      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const h =
          Number(
            measure({
              text: remain.slice(0, mid).join("\n"),
              widthMm: wMm,
              style,
              data,
            }),
          ) || 0;

        if (h <= maxFlowRowH) {
          best = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }

      if (best === 0 && maxFlowRowH > 14 && remain.length > 0) best = 1;

      const taken = remain.slice(0, best);
      const rest = remain.slice(best);
      cellRemain[key] = rest;

      const contentHeightMm =
        measure({
          text: taken.join("\n"),
          widthMm: wMm,
          style,
          data,
        }) || 0;

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

      if (piece.table.cellStyle) {
        for (const k of Object.keys(piece.table.cellStyle)) {
          const m = String(k).match(/^(\d+)\s*[,:\-|_]\s*(\d+)$/);
          if (!m) continue;
          const r = Number(m[1]);
          if (r > flowRow) delete piece.table.cellStyle[k];
        }
      }

      if (piece.table.cells) {
        for (const k of Object.keys(piece.table.cells)) {
          const m = String(k).match(/^(\d+)\s*[,:\-|_]\s*(\d+)$/);
          if (!m) continue;
          const r = Number(m[1]);
          if (r > flowRow) delete piece.table.cells[k];
        }
      }
    }

    piece.h = piece.table.rowH.reduce((a, b) => a + (Number(b) || 0), 0);
    parts.push(piece);
    pageIndex++;
  }

  if (dbg) console.log("[FLOW-RESULT] total parts:", parts.length);
  console.log("----------- closed splitFlowTableElementMm");

  return parts.length ? parts : [el];
}

/* =========================================================
   REPEAT Table Splitter (mm)
   - For tables with t.repeat.enabled + arrayPath + columns
   - Expands rows for full data and splits across attachment/body slices
   - Produces chunk elements with table.repeatPrint { header, body, columns }
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
      repeat: { ...(repeat || {}), enabled: false }, // disable for chunks
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

  const arrVal = getByPath(data, String(repeat.arrayPath || ""));
  const arr = Array.isArray(arrVal) ? arrVal : [];

  const colsDef = resolveRepeatColumnsMm(repeat, arr[0]);
  if (!colsDef.length) return [el];

  const headerH = Number(repeat.headerHeightMm ?? 7) || 7;
  const rowH = Number(repeat.rowHeightMm ?? 6) || 6;

  // Anchor to top of current slice (important for attachment y=0 templates)
  const baseY = Math.max(Number(el.y || 0), Number(usableTop || 0));
  const sliceH = Math.max(1, Number(sliceHeightEff || 0));

  // How many body rows can fit on first slice from current y?
  const availableFirst = usableTop + sliceH - baseY;
  const capFirst = Math.max(0, Math.floor((availableFirst - headerH) / rowH));

  if (dbg) {
    console.log("[REPEAT-SPLIT]", {
      id: el.id,
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

  // If nothing fits, move the whole table to next slice
  if (capFirst <= 0) {
    const moved = clone(el);
    moved.y = baseY + sliceH; // next slice start
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

    chunkEl.attachBand = "body";
    if (chunkEl.band) delete chunkEl.band;

    chunkEl.y = baseY + pageIndex * sliceH;
    parts.push(chunkEl);
    pageIndex += 1;
  }

  return parts.length ? parts : [el];
}

/* =========================================================
   Pagination bucketing
========================================================= */

function splitElementsByPage(elements, usableTop, usableHeightEff) {
  const pages = [];
  const sliceH = Math.max(1, Number(usableHeightEff || 0));
  const EPS = 0.001; // mm

  for (const el of elements || []) {
    const y = Number(el?.y || 0);
    const idx = Math.max(0, Math.floor((y - usableTop + EPS) / sliceH));
    while (pages.length <= idx) pages.push([]);
    pages[idx].push(el);
  }

  for (const p of pages) {
    p.sort((a, b) => Number(a?.z || 0) - Number(b?.z || 0));
  }

  return pages;
}

/* =========================================================
   Attachment band detection + heights
========================================================= */

function tableHasFlowKey(el) {
  if (!el || String(el.type || "").toLowerCase() !== "table") return false;

  const t = el.table || {};
  const bindings = t.bindings || {};
  const cellStyle = t.cellStyle || {};

  const checkKey = (raw) => {
    const k = normKey(raw);
    return FLOW_KEYS.has(k);
  };

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

function deriveAttachBandsAndHeights(page, usableTop, usableHeightEff) {
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

      if (Number.isFinite(headerBottom) && headerBottom > usableTop) {
        attachHeaderMm = headerBottom - usableTop;
      }
    }

    if (attachFooterMm <= 0) {
      const footerTop = els
        .filter((e) => String(e?.attachBand || "").toLowerCase() === "footer")
        .reduce((m, e) => Math.min(m, Number(e.y || 0)), Infinity);

      if (Number.isFinite(footerTop) && footerTop < pageBottom) {
        attachFooterMm = pageBottom - footerTop;
      }
    }
  } else {
    attachHeaderMm = clamp(attachHeaderMm, MAX_HEADER_MM);
    attachFooterMm = clamp(attachFooterMm, MAX_FOOTER_MM);

    if (attachHeaderMm <= 0) {
      const flowTables = els.filter((e) => tableHasFlowKey(e));
      const minFlowY = flowTables.reduce(
        (m, e) => Math.min(m, Number(e.y || 0)),
        Infinity,
      );

      if (Number.isFinite(minFlowY) && minFlowY > usableTop + 0.5) {
        attachHeaderMm = minFlowY - usableTop;
      }
    }

    if (attachHeaderMm <= 0) {
      const TOP_SCAN_MM = 80;

      const headerCandidates = els.filter((e) => {
        if (!e) return false;
        const y = Number(e.y || 0);
        const h = Number(e.h || 0);
        const bottom = y + h;

        if (!(y >= usableTop - 2 && y <= usableTop + TOP_SCAN_MM)) return false;
        if (h > TOP_SCAN_MM) return false;
        if (bottom > usableTop + TOP_SCAN_MM + 1) return false;
        return true;
      });

      const headerBottom = headerCandidates.reduce(
        (m, e) => Math.max(m, Number(e.y || 0) + Number(e.h || 0)),
        -Infinity,
      );

      if (Number.isFinite(headerBottom) && headerBottom > usableTop) {
        attachHeaderMm = headerBottom - usableTop;
      }
    }

    if (attachFooterMm <= 0) {
      const BOTTOM_SCAN_MM = 45;
      const footerCandidates = els.filter((e) => {
        if (!e) return false;
        if (String(e.type || "").toLowerCase() !== "text") return false;
        const txt = String(e.text || "").trim();
        if (!txt) return false;

        const y = Number(e.y || 0);
        const h = Number(e.h || 0);
        const bottom = y + h;

        return bottom >= pageBottom - BOTTOM_SCAN_MM;
      });

      const footerTop = footerCandidates.reduce(
        (m, e) => Math.min(m, Number(e.y || 0)),
        Infinity,
      );

      if (Number.isFinite(footerTop) && footerTop < pageBottom) {
        attachFooterMm = pageBottom - footerTop;
      }
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
    if (t.rowHUnit === "mm" && Array.isArray(t.rowH) && t.rowH.length) {
      return t.rowH.map((x) => Number(x) || 0);
    }
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
      const bW = Number(b.w || 0),
        bH = Number(b.h || 0);

      const aBottom = aY + aH;

      const gap = bY - aBottom;
      if (gap < 0 || gap > gapToleranceMm) continue;

      const overlap = Math.min(aX + aW, bX + bW) - Math.max(aX, bX);
      if (overlap < Math.min(aW, bW) * 0.6) continue;

      const snappedY = aBottom;
      if (snappedY !== bY) {
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
   Force A4 sizing consistently (creator vs preview)
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
  if (!paperMm) throw new Error("paperMm required");

  // ✅ Always use a bold-safe measure function
  const measure =
    typeof measureTextMm === "function"
      ? measureTextMm
      : __defaultMeasureTextMm;

  // ✅ Force A4 sizing in layout output so preview matches Creator (210x297mm)
  const tpl = forceA4OnTemplateAndPages(
    ensureHybridSections(clone(template)),
    paperMm,
  );

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
  }

  const outPages = [];
  let __attachNo = 0;

  for (const p of tpl.pages || []) {
    const page = clone(p);
    page.sections = Array.isArray(page.sections) ? page.sections : [];
    page.elements = Array.isArray(page.elements) ? page.elements : [];

    // ✅ Force A4 size on every produced page object
    page.paper = {
      ...(page.paper || {}),
      wMm: paperMm.w,
      hMm: paperMm.h,
      w: paperMm.w,
      h: paperMm.h,
    };
    page.page = { ...(page.page || {}), wMm: paperMm.w, hMm: paperMm.h };

    // 1) autosize elements
    page.elements = page.elements.map((el) => {
      if (!el) return el;
      if (el.type === "text") return autoSizeTextElementMm(el, data, measure);
      if (el.type === "table") return autoSizeTableMm(el, data, measure);
      return el;
    });

    page.elements = bakeOverlayTextsIntoTables(page).elements;
    page.elements = snapTouchingTables(page, 5).elements;

    // 2) grow sections + pushDown
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
          for (let j = i + 1; j < sections.length; j++) {
            sections[j].yMm = Number(sections[j].yMm || 0) + delta;
          }

          page.elements = page.elements.map((el) => {
            const y = Number(el.y || 0);
            if (y >= rect.yMm + baseH) return { ...el, y: y + delta };
            return el;
          });
        }
      }
    }

    page.sections = sections;

    // derive bands + heights
    const bandInfo = deriveAttachBandsAndHeights(
      page,
      usableTop,
      usableHeightEff,
    );
    page.attachHeaderMm = bandInfo.attachHeaderMm;
    page.attachFooterMm = bandInfo.attachFooterMm;

    // 3) Expand FLOW + REPEAT tables
    //    ✅ IMPORTANT: when a table splits into multiple slices, all following BODY elements
    //    must be pushed down by (partsCount-1)*sliceHeight so that they appear AFTER the
    //    table finishes (table-2 follows table-1 across attachment pages).
    const expanded = [];

    // Work on a y-sorted copy so "following" means visually below.
    const elsForExpand = (page.elements || [])
      .slice()
      .sort(
        (a, b) =>
          Number(a?.y || 0) - Number(b?.y || 0) ||
          Number(a?.z || 0) - Number(b?.z || 0),
      );

    const isHeaderFooterEl = (e) => {
      if (!e) return false;
      const band = String(e.attachBand || "").toLowerCase();
      if (band === "header" || band === "footer") return true;

      if (bandInfo.hasBandMarkers) return false;

      const y = Number(e.y || 0);
      const h = Number(e.h || 0);
      const bottom = y + h;

      const headerLimitY = usableTop + Number(bandInfo.attachHeaderMm || 0);
      const footerStartY =
        usableTop + usableHeightEff - Number(bandInfo.attachFooterMm || 0);

      if (Number(bandInfo.attachHeaderMm || 0) > 0 && y < headerLimitY)
        return true;
      if (Number(bandInfo.attachFooterMm || 0) > 0 && bottom > footerStartY)
        return true;

      return false;
    };

    for (let i = 0; i < elsForExpand.length; i++) {
      const el = elsForExpand[i];

      if (el?.type !== "table") {
        expanded.push(el);
        continue;
      }

      const useBodySlice =
        bandInfo.attachHeaderMm > 0 || bandInfo.attachFooterMm > 0;

      const flowTop = useBodySlice
        ? usableTop + bandInfo.attachHeaderMm
        : usableTop;

      const flowSliceH = useBodySlice
        ? Math.max(
            0,
            usableHeightEff - bandInfo.attachHeaderMm - bandInfo.attachFooterMm,
          )
        : usableHeightEff;

      let parts = null;

      if (isRepeatTableElementMm(el)) {
        parts = splitRepeatTableElementMm(el, data, flowTop, flowSliceH, debug);
      } else {
        parts = splitFlowTableElementMm(
          el,
          data,
          measure,
          flowTop,
          flowSliceH,
          debug,
        );
      }

      // Default fallback
      if (!Array.isArray(parts) || parts.length === 0) parts = [el];

      expanded.push(...parts);

      // ✅ Push down following BODY elements when the table produces multiple parts
      if (parts.length > 1 && flowSliceH > 0.01) {
        const pushMm = (parts.length - 1) * flowSliceH;

        const baseY = Math.max(Number(el.y || 0), Number(flowTop || 0));

        if (debug) {
          console.log("[TABLE-SPLIT-PUSHDOWN]", {
            id: el?.id,
            y: Number(el?.y || 0),
            baseY,
            parts: parts.length,
            flowTop,
            flowSliceH,
            pushMm,
          });
        }

        for (let j = i + 1; j < elsForExpand.length; j++) {
          const e2 = elsForExpand[j];
          if (!e2) continue;

          // Don't move header/footer elements (they must repeat at fixed positions)
          if (isHeaderFooterEl(e2)) continue;

          const y2 = Number(e2.y || 0);

          // Only shift elements that are at/after the table's start (i.e., below in visual flow)
          if (y2 + 0.001 >= baseY) {
            elsForExpand[j] = { ...e2, y: y2 + pushMm };
          }
        }
      }
    }

    page.elements = expanded;

    page.elements = snapTouchingTables(page, 3).elements;

    // 4) paginate overflow into attachment pages
    const attachHeaderMm = Number(page.attachHeaderMm || 0);
    const attachFooterMm = Number(page.attachFooterMm || 0);

    const pageTopY = usableTop;
    const pageBottomY = usableTop + usableHeightEff;

    const headerLimitY = pageTopY + attachHeaderMm;
    const footerStartY = pageBottomY - attachFooterMm;

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

    const bodyTop = pageTopY + attachHeaderMm;
    const bodyHeightEff = Math.max(
      0,
      usableHeightEff - attachHeaderMm - attachFooterMm,
    );

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

      // ✅ enforce A4 on attachments too
      pe.paper = {
        ...(pe.paper || {}),
        wMm: paperMm.w,
        hMm: paperMm.h,
        w: paperMm.w,
        h: paperMm.h,
      };
      pe.page = { ...(pe.page || {}), wMm: paperMm.w, hMm: paperMm.h };

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

      if (pi > 0 && !hasMeaningfulBody(pe.elements)) continue;

      outPages.push(pe);
    }
  }

  const finalTpl = { ...tpl, pages: outPages };

  // final enforce A4
  return forceA4OnTemplateAndPages(finalTpl, paperMm);
}

/* EOF_OK */
