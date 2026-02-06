/* eslint-disable */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Button, CircularProgress, Paper } from "@mui/material";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";

import {
  fetchReportData,
  fetchBlPrintReportData,
} from "@/services/auth/FormControl.services";

/* =========================================================
   TOKEN HELPERS
========================================================= */

function getByPath(obj, path) {
  if (!obj || !path) return "";
  const p = String(path).trim();
  if (!p) return "";

  if (!p.includes(".")) {
    const v = obj?.[p];
    return v == null ? "" : v;
  }

  const parts = p.split(".");
  let cur = obj;
  for (const k of parts) {
    if (cur == null) return "";
    cur = cur[k];
  }
  return cur == null ? "" : cur;
}

function applyTokens(text, data) {
  if (text == null) return "";
  return String(text).replace(/\{\{([^}]+)\}\}/g, (_, raw) => {
    const key = String(raw).trim();
    const v = getByPath(data, key);
    return v == null ? "" : String(v);
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

function vAlignToAlignItems(vAlign) {
  const v = String(vAlign || "").toLowerCase();
  if (v === "middle" || v === "center") return "center";
  if (v === "bottom" || v === "end") return "flex-end";
  return "flex-start";
}

/**
 * Typography (inner text only). No border/bg here (matches BL Creator).
 */
function cssFromStyle(s = {}) {
  const fontSize = Number(s.fontSize ?? 10);
  const fontFamily = s.fontFamily || "Arial, Helvetica, sans-serif";
  const fontWeight = s.fontWeight ?? 400;
  const color = s.color || "#111827";
  const textAlign = s.textAlign || "left";
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
   ELEMENT RENDERER (REPORT MODE)
========================================================= */

function renderElement(el, data) {
  if (!el || el.hidden) return "";

  // ---------- small helpers (kept inside so nothing else breaks) ----------
  const mm = (v) => `${Number(v || 0)}mm`;

  const escapeHtml = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const getByPath = (obj, path) => {
    if (!obj || !path) return undefined;
    const parts = String(path).split(".").filter(Boolean);
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  };

  // If your page already has applyTokens() that replaces {{...}} then this will use it.
  // If not, it will just keep text as-is (safe fallback).
  const applyTokensSafe = (text) => {
    try {
      if (typeof applyTokens === "function") return applyTokens(text, data);
    } catch (e) {}
    return text;
  };

  const vAlignToAlignItems = (v) => {
    const a = String(v || "top").toLowerCase();
    if (a === "middle" || a === "center") return "center";
    if (a === "bottom") return "flex-end";
    return "flex-start";
  };

  const hAlignToJustify = (textAlign) => {
    const a = String(textAlign || "left").toLowerCase();
    if (a === "center") return "center";
    if (a === "right" || a === "end") return "flex-end";
    return "flex-start";
  };

  // Minimal cssFromStyle fallback (uses yours if present)
  const cssFromStyleSafe = (styleObj) => {
    try {
      if (typeof cssFromStyle === "function") return cssFromStyle(styleObj);
    } catch (e) {}
    // fallback basic text css
    const s = styleObj || {};
    return `
      font-family:${s.fontFamily || "inherit"};
      font-size:${Number(s.fontSize || 11)}px;
      font-weight:${s.fontWeight || 400};
      font-style:${s.fontStyle || "normal"};
      color:${s.color || "#111827"};
      text-align:${s.align || s.textAlign || "left"};
      line-height:${s.lineHeight || "normal"};
      letter-spacing:${s.letterSpacing || "normal"};
      padding:${Number(s.padding || 0)}px;
    `;
  };

  // ---------- common geometry ----------
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

  // ---------- IMAGE ----------
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

  // ---------- TEXT ----------
  if (el.type === "text") {
    const bw = Number(s.borderWidth ?? 0);
    const border =
      bw > 0
        ? `${bw}px ${s.borderStyle || "solid"} ${s.borderColor || "#111827"}`
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

    const innerCss = `
      width:100%;
      max-height:100%;
      overflow:hidden;
      white-space:pre-wrap;
      word-break:break-word;
      ${cssFromStyleSafe({ ...s, bg: "transparent", borderWidth: 0 })}
    `;

    const txt = applyTokensSafe(el.text || "");
    return `<div style="${wrapCss}"><div style="${innerCss}">${escapeHtml(
      txt
    )}</div></div>`;
  }

  // ---------- BOX ----------
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

  // ---------- LINES ----------
  // ---------- ✅ LINES (robust) ----------
const t = String(el.type || "").toLowerCase();

// support many possible creator types
const isH =
  t === "lineh" ||
  t === "hline" ||
  t === "line_horizontal" ||
  t === "linehorizontal" ||
  (t === "line" && String(el.orientation || el.dir || "").toLowerCase().startsWith("h"));

const isV =
  t === "linev" ||
  t === "vline" ||
  t === "line_vertical" ||
  t === "linevertical" ||
  (t === "line" && String(el.orientation || el.dir || "").toLowerCase().startsWith("v"));

if (isH || isV) {
  const thickness =
    Number(s.thickness ?? s.strokeWidth ?? s.borderWidth ?? 1) || 1;

  const color = s.color || s.stroke || s.borderColor || "#111827";

  // Use border instead of background => matches creator & prints perfectly
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


  // ---------- ✅ TABLE (FIXED) ----------
  if (el.type === "table") {
    const t = el.table || el.tbl || el.meta || {};
    const rows = Number(t.rows || el.rows || 0);
    const cols = Number(t.cols || el.cols || 0);
    if (!rows || !cols) return "";

    const merges = Array.isArray(t.merges) ? t.merges : [];
    const bindings = t.bindings || {};
    const cellStyle = t.cellStyle || {};

    const colW =
      Array.isArray(t.colW) && t.colW.length ? t.colW : Array(cols).fill(100);
    const rowH =
      Array.isArray(t.rowH) && t.rowH.length ? t.rowH : Array(rows).fill(32);

    const widthMm = Number(el.w || 10);
    const heightMm = Number(el.h || 10);

    const totalW = colW.reduce((a, b) => a + (Number(b) || 0), 0) || 1;
    const totalH = rowH.reduce((a, b) => a + (Number(b) || 0), 0) || 1;

    const colMm = colW.map((w) => ((Number(w) || 0) / totalW) * widthMm);
    const rowMm = rowH.map((h) => ((Number(h) || 0) / totalH) * heightMm);

    const cellKey = (r, c) => `${r}-${c}`;

    const findMergeAt = (ms, r, c) => {
      for (const m of ms) {
        // support common merge formats
        const r0 = Number(m.r0 ?? m.r ?? m.row ?? m.startRow ?? 0);
        const c0 = Number(m.c0 ?? m.c ?? m.col ?? m.startCol ?? 0);
        const rs = Number(m.rs ?? m.rowSpan ?? m.h ?? m.rows ?? 1);
        const cs = Number(m.cs ?? m.colSpan ?? m.w ?? m.cols ?? 1);
        if (r >= r0 && r < r0 + rs && c >= c0 && c < c0 + cs) {
          return { r0, c0, rs, cs };
        }
      }
      return null;
    };

    const isCovered = (r, c) => {
      const m = findMergeAt(merges, r, c);
      if (!m) return false;
      return !(m.r0 === r && m.c0 === c);
    };

    const tableBorder =
      Number(t.borderWidth ?? 1) > 0
        ? `${t.borderWidth ?? 1}px solid ${t.borderColor || "#111827"}`
        : "none";

    // build cols
    const colgroupHtml = colMm
      .map((w) => `<col style="width:${w}mm">`)
      .join("");

    // build body
    let tbodyHtml = "";
    for (let r = 0; r < rows; r++) {
      let rowCells = "";
      for (let c = 0; c < cols; c++) {
        if (isCovered(r, c)) continue;

        const m = findMergeAt(merges, r, c);
        const rs = m ? m.rs : 1;
        const cs = m ? m.cs : 1;

        const k = cellKey(r, c);
        const bind = bindings[k]; // { columnKey / label / path ... }
        const csx = cellStyle[k] || {};

        // resolve cell text:
        let raw = "";
        if (bind) {
          // binding formats supported:
          // { columnKey:"shipper.name" } or { path:"shipper.name" } or { label:"..." }
          if (bind.label != null) raw = String(bind.label);
          else if (bind.path) {
            const v = getByPath(data, bind.path);
            raw = v == null ? "" : String(v);
          } else if (bind.columnKey) {
            // treat as token: {{columnKey}}
            raw = `{{${bind.columnKey}}}`;
          }
        }

        // fallback to any stored cell value (if you store it)
        if (!raw && csx.text != null) raw = String(csx.text);
        if (!raw && csx.value != null) raw = String(csx.value);

        const text = applyTokensSafe(raw);

        // styles
        const pad = csx.padding ?? t.cellPadding ?? 6;
        const bg = csx.bg ?? csx.background ?? "transparent";
        const color = csx.color ?? "#0f172a";
        const fs = csx.fontSize ?? t.fontSize ?? 11;
        const fw = csx.fontWeight ?? t.fontWeight ?? 600;
        const align = csx.align ?? csx.textAlign ?? "left";
        const vAlign = csx.vAlign ?? "top";
        const bc = csx.borderColor ?? t.gridColor ?? "#111827";
        const bw = csx.borderWidth ?? t.gridWidth ?? 1;

        const tdCss = `
          border:${bw}px solid ${bc};
          background:${bg};
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
          word-break:break-word;
          ${cssFromStyleSafe({
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
        `;

        rowCells += `<td rowspan="${rs}" colspan="${cs}" style="${tdCss}">
          <div style="${innerCss}">${escapeHtml(text)}</div>
        </td>`;
      }

      tbodyHtml += `<tr style="height:${rowMm[r]}mm">${rowCells}</tr>`;
    }

    // wrap table into positioned div (same as other elements)
    return `
      <div style="
        ${commonBox}
        border:${tableBorder};
        background:${t.bg || "#fff"};
        overflow:hidden;
      ">
        <table style="
          width:100%;
          height:100%;
          border-collapse:collapse;
          table-layout:fixed;
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
   MULTI-PAGE NORMALIZER
   Supports:
   - tpl.elements (single page)
   - tpl.pages[] (multi-page)
   - tpl.attachments[] (main + attachments)
   - el.pageIndex (optional)
========================================================= */

function normalizePages(tpl) {
  const defaultW = Number(tpl?.page?.wMm ?? tpl?.paper?.wMm ?? 210);
  const defaultH = Number(tpl?.page?.hMm ?? tpl?.paper?.hMm ?? 297);

  const hasPagesArray = Array.isArray(tpl?.pages) && tpl.pages.length > 0;
  if (hasPagesArray) {
    return tpl.pages.map((p, idx) => ({
      key: `p_${idx}`,
      wMm: Number(p?.page?.wMm ?? p?.paper?.wMm ?? defaultW),
      hMm: Number(p?.page?.hMm ?? p?.paper?.hMm ?? defaultH),
      elements: Array.isArray(p?.elements) ? p.elements : [],
      title: p?.title || "",
    }));
  }

  // attachments: main + attachment pages
  const mainElements = Array.isArray(tpl?.elements) ? tpl.elements : [];
  const attachments = Array.isArray(tpl?.attachments) ? tpl.attachments : [];

  // If user uses pageIndex on elements, split accordingly
  const hasPageIndex = mainElements.some((e) => e?.pageIndex != null);

  if (hasPageIndex) {
    const map = new Map();
    for (const el of mainElements) {
      const pi = Number(el?.pageIndex ?? 0);
      if (!map.has(pi)) map.set(pi, []);
      map.get(pi).push(el);
    }
    const indices = Array.from(map.keys()).sort((a, b) => a - b);
    return indices.map((pi) => ({
      key: `pi_${pi}`,
      wMm: defaultW,
      hMm: defaultH,
      elements: map.get(pi) || [],
      title: "",
    }));
  }

  const pages = [
    {
      key: "main",
      wMm: defaultW,
      hMm: defaultH,
      elements: mainElements,
      title: "Main",
    },
    ...attachments.map((a, idx) => ({
      key: `att_${idx}`,
      wMm: Number(a?.page?.wMm ?? a?.paper?.wMm ?? defaultW),
      hMm: Number(a?.page?.hMm ?? a?.paper?.hMm ?? defaultH),
      elements: Array.isArray(a?.elements) ? a.elements : [],
      title: a?.title || `Attachment ${idx + 1}`,
    })),
  ];

  // if no attachments and no pages array, still 1 page
  return pages;
}

/* =========================================================
   TEMPLATE -> FULL HTML DOCUMENT (MULTI PAGE)
========================================================= */

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
          width:${pg.wMm}mm;
          height:${pg.hMm}mm;
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
      /* show slight separation on screen (not in print) */
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

async function downloadPdfViaCanvas(html, iframeEl, filename = "BL_Report.pdf") {
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

  // higher = clearer (keep in sane bounds)
  const scale = Math.max(3, Math.min(4, window.devicePixelRatio || 3));

  const pdf = new jsPDF("p", "pt", "a4", true);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pageEls.length; i++) {
    const pageEl = pageEls[i];

    // Ensure current page is in view (helps some browsers)
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
   PAGE: /blReport?templateId=2&blId=123
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

  // 1) Fetch TEMPLATE
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

  // 2) Fetch BL DATA (SP)
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
          bl: blRow, // supports both {{blNo}} and {{bl.blNo}}
        });
      } catch (e) {
        setError(e?.message || "Failed to load BL data");
      } finally {
        setLoading(false);
      }
    };

    fetchBlData();
  }, [templateId, blId]);

  const html = useMemo(() => {
    if (!tpl || !data) return "";
    return renderTemplateHtml(tpl, data);
  }, [tpl, data]);

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
      {/* Hidden iframe used for print/pdf (no popup blockers) */}
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

      {/* Toolbar */}
      <Box
        className="toolbar"
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
          mb: 1,
        }}
      >
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
          // Preview all pages centered
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
