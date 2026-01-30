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

  // flat token {{blNo}} => obj.blNo
  if (!p.includes(".")) {
    const v = obj?.[p];
    return v == null ? "" : v;
  }

  // nested token {{bl.blNo}} => obj.bl.blNo
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
   Border rules MUST match BL Creator:
   - border only if s.borderWidth > 0
   - background uses s.bg
========================================================= */

function renderElement(el, data) {
  const id = el?.id ?? Math.random().toString(36).slice(2);
  const s = el?.style || {};

  const x = Number(el?.x ?? el?.xMm ?? 0);
  const y = Number(el?.y ?? el?.yMm ?? 0);
  const w = Number(el?.w ?? el?.wMm ?? 20);
  const h = Number(el?.h ?? el?.hMm ?? 10);
  const rotate = Number(el?.rotate || 0);

  const commonBox = `
    position:absolute;
    left:${x}mm;
    top:${y}mm;
    width:${w}mm;
    height:${h}mm;
    transform:${rotate ? `rotate(${rotate}deg)` : "none"};
    transform-origin:center center;
    box-sizing:border-box;
  `;

  // ✅ exact border logic like BL Creator
  const bw = Number(s.borderWidth ?? 0);
  const borderCss =
    bw > 0
      ? `${bw}px ${s.borderStyle || "solid"} ${s.borderColor || "#000"}`
      : "none";

  // ✅ editor uses bg
  const bg = s.bg || "transparent";

  // ---------- IMAGE ----------
  if (el?.type === "image") {
    return `
      <img data-elid="${id}" src="${el?.src || ""}" style="
        ${commonBox}
        object-fit:${el?.fit || "contain"};
        opacity:${el?.opacity ?? 1};
        border:${borderCss};
        border-radius:${Number(s.borderRadius || 0)}px;
        display:block;
      " alt="" />
    `;
  }

  // ---------- TEXT ----------
  if (el?.type === "text") {
    const wrapCss =
      commonBox +
      `
        display:flex;
        align-items:${vAlignToAlignItems(s.vAlign)};
        overflow:hidden;
        background:${bg};
        border:${borderCss};
        border-radius:${Number(s.borderRadius || 0)}px;
      `;

    const text = applyTokens(el?.text || "", data);

    const innerCss = `
      width:100%;
      max-height:100%;
      overflow:hidden;
      white-space:pre-wrap;
      word-break:break-word;
      background:transparent;
      border:none;
      box-sizing:border-box;
      ${cssFromStyle({ ...s, borderWidth: 0 })}
    `;

    return `
      <div data-elid="${id}" style="${wrapCss}">
        <div style="${innerCss}">${escapeHtml(text)}</div>
      </div>
    `;
  }

  // ---------- BOX ----------
  if (el?.type === "box") {
    return `
      <div data-elid="${id}" style="
        ${commonBox}
        background:${bg};
        border:${borderCss};
        border-radius:${Number(s.borderRadius || 0)}px;
      "></div>
    `;
  }

  // ✅ ---------- LINES (PRINT/PDF SAFE) ----------
  // Use border-top / border-left instead of background for consistent printing
  if (el?.type === "lineH") {
    const thickness = Number(s.strokeWidth || 1);
    const color = s.stroke || "#000";
    return `
      <div data-elid="${id}" style="
        ${commonBox}
        height:0;
        border-top:${thickness}px solid ${color};
      "></div>
    `;
  }

  if (el?.type === "lineV") {
    const thickness = Number(s.strokeWidth || 1);
    const color = s.stroke || "#000";
    return `
      <div data-elid="${id}" style="
        ${commonBox}
        width:0;
        border-left:${thickness}px solid ${color};
      "></div>
    `;
  }

  // table (optional)
  if (el?.type === "table") return "";

  return "";
}

/* =========================================================
   TEMPLATE -> FULL HTML DOCUMENT
========================================================= */

export function renderTemplateHtml(tpl, data) {
  const pageW = Number(tpl?.page?.wMm ?? tpl?.paper?.wMm ?? 210);
  const pageH = Number(tpl?.page?.hMm ?? tpl?.paper?.hMm ?? 297);

  const elements = Array.isArray(tpl?.elements) ? tpl.elements : [];

  const body = elements
    .filter((e) => !e?.hidden)
    .sort((a, b) => (a?.z || 0) - (b?.z || 0))
    .map((el) => renderElement(el, data))
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

    /* page */
    .page{
      position:relative;
      width:${pageW}mm;
      height:${pageH}mm;
      background:#fff;
      overflow:hidden;
    }

    @media print {
      body { background:#fff; }
    }
  </style>
</head>
<body>
  <div class="page" id="__report_page__">
    ${body}
  </div>
</body>
</html>`;
}

/* =========================================================
   HIDDEN IFRAME UTIL (NO about:blank POPUP ISSUES)
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

  // small layout tick
  await new Promise((r) => setTimeout(r, 200));

  iframeEl.contentWindow.focus();
  iframeEl.contentWindow.print();
}

async function downloadPdfViaCanvas(html, iframeEl, filename = "BL_Report.pdf") {
  // lazy imports (client only)
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const doc = iframeEl.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  await waitForAssets(doc);
  await new Promise((r) => setTimeout(r, 200));

  const pageEl = doc.getElementById("__report_page__");
  if (!pageEl) throw new Error("Report page not found in iframe");

  // ✅ Higher scale => clearer text
  const scale = Math.max(3, Math.min(4, window.devicePixelRatio || 3));

  const canvas = await html2canvas(pageEl, {
    scale,
    backgroundColor: "#ffffff",
    useCORS: true,
    allowTaint: true,
    logging: false,
  });

  // A4 in pt
  const pdf = new jsPDF("p", "pt", "a4", true);

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgData = canvas.toDataURL("image/png", 1.0);

  // fit image to A4
  const imgW = canvas.width;
  const imgH = canvas.height;

  const ratio = Math.min(pageWidth / imgW, pageHeight / imgH);
  const drawW = imgW * ratio;
  const drawH = imgH * ratio;

  const x = (pageWidth - drawW) / 2;
  const y = (pageHeight - drawH) / 2;

  pdf.addImage(imgData, "PNG", x, y, drawW, drawH, undefined, "FAST");
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

  // hidden iframe for printing / pdf generation (no popup)
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

        // supports both {{blNo}} and {{bl.blNo}}
        setData({
          ...blRow,
          bl: blRow,
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
          // ✅ Center-aligned preview
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
