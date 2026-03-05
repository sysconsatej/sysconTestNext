"use client";
/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCodeLib from "qrcode"; // ✅ npm i qrcode
import JsBarcode from "jsbarcode"; // ✅ npm i jsbarcode
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function MultiQrPrint({
  items = [],
  columns = 2,
  pageTitle = "Warehouse Print",
  qrIdField = "id",

  // ✅ "Q" = QR, "B" = Barcode
  codeType = "Q", // "Q" | "B"

  // UI layout
  cardHeight = 240,
  cardPadding = 10,
  gap = 12,
  qrScale = 1.0,
  showLabel = false,

  // payload controls
  removeDropdownKeys = true,
  removeNullValues = true,
  keepOnlyKeys = null, // e.g. ["id","whTransactionId","itemId","qty"]

  // ✅ Barcode tuning (bigger)
  barcodeBarWidth = 3,
  barcodeBarHeight = 160,
  barcodeCanvasW = 1400, // higher = sharper + bigger
  barcodeCanvasH = 420,
}) {
  const printRef = useRef(null);
  const gridRef = useRef(null);
  const iframeRef = useRef(null);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [codeSize, setCodeSize] = useState(200);

  const arr = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  // ✅ FULL OBJECT payload (QR) / compact payload (Barcode)
  const codeItems = useMemo(() => {
    const type = String(codeType || "Q").toUpperCase() === "B" ? "B" : "Q";

    return arr
      .filter((row) => row && typeof row === "object")
      .map((row, idx) => {
        const id =
          row?.[qrIdField] ?? row?.id ?? row?.Id ?? row?.ID ?? idx + 1;

        const cleaned = sanitizePayload(row, {
          removeDropdown: removeDropdownKeys,
          removeNulls: removeNullValues,
          keepOnlyKeys,
        });

        const payload =
          type === "Q"
            ? `WQR1:${JSON.stringify(cleaned)}`
            : makeBarcodeValue(id, qrIdField);

        return { id, payload, label: String(id), type };
      });
  }, [
    arr,
    qrIdField,
    removeDropdownKeys,
    removeNullValues,
    keepOnlyKeys,
    codeType,
  ]);

  const disabled = !codeItems.length;

  // ✅ compute render size from card width & height
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const w = el.clientWidth || 0;
      const cols = Math.max(1, Number(columns) || 2);
      const colW = (w - gap * (cols - 1)) / cols;

      const labelH = showLabel ? 24 : 0;
      const innerW = colW - cardPadding * 2;
      const innerH = cardHeight - cardPadding * 2 - labelH;

      const s = Math.max(160, Math.floor(Math.min(innerW, innerH) * qrScale));
      setCodeSize(s);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [columns, gap, cardPadding, cardHeight, showLabel, qrScale]);

  // ✅ IFRAME PRINT (ERP-safe)
  async function handlePrint() {
    const el = printRef.current;
    if (!el || disabled || printing) return;

    setPrinting(true);
    try {
      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;
      const win = iframe?.contentWindow;
      if (!doc || !win) return;

      const cols = Math.max(1, Number(columns) || 2);

      const printCss = `
        <style>
          @page { size: A4 portrait; margin: 8mm; }
          html, body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #111; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

          .codeCard { break-inside: avoid; page-break-inside: avoid; }
          .codeGrid {
            display: grid !important;
            grid-template-columns: repeat(${cols}, 1fr) !important;
            gap: 6mm !important;
          }
          img { display: block; }
          .noPrint { display: none !important; }
        </style>
      `;

      doc.open();
      doc.write(`
        <html>
          <head>
            <title>${escapeHtml(pageTitle)}</title>
            ${printCss}
          </head>
          <body>
            ${el.outerHTML}
          </body>
        </html>
      `);
      doc.close();

      await waitForMedia(doc);
      await wait(30);

      win.focus();
      win.print();
    } finally {
      setTimeout(() => setPrinting(false), 400);
    }
  }

  async function handleDownloadPdf() {
    const el = printRef.current;
    if (!el) return;

    setPdfLoading(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const imgW = pageW;
      const imgH = (canvas.height * imgW) / canvas.width;

      if (imgH <= pageH) {
        pdf.addImage(imgData, "PNG", 0, 0, imgW, imgH);
      } else {
        let y = 0;
        let remaining = imgH;

        pdf.addImage(imgData, "PNG", 0, y, imgW, imgH);
        remaining -= pageH;

        while (remaining > 0) {
          pdf.addPage();
          y -= pageH;
          pdf.addImage(imgData, "PNG", 0, y, imgW, imgH);
          remaining -= pageH;
        }
      }

      pdf.save(`${pageTitle.replace(/\s+/g, "_")}.pdf`);
    } finally {
      setPdfLoading(false);
    }
  }

  const typeLabel =
    String(codeType || "Q").toUpperCase() === "B" ? "Barcode" : "QR";

  return (
    <div style={wrap}>
      <iframe ref={iframeRef} title="print-frame" style={iframeStyle} />

      <div style={topBar} className="noPrint">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={badge}>{typeLabel === "QR" ? "QR" : "BC"}</div>
          <div>
            <div style={title}>{pageTitle}</div>
            <div style={metaLine}>
              Total: <b>{codeItems.length}</b>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={handlePrint}
            style={{ ...btn, ...(disabled || printing ? btnDisabled : null) }}
            disabled={disabled || printing}
          >
            {printing ? "Printing..." : "Print"}
          </button>

          <button
            onClick={handleDownloadPdf}
            style={{ ...btnGhost, ...(disabled ? btnDisabled : null) }}
            disabled={disabled || pdfLoading}
          >
            {pdfLoading ? "Preparing..." : "Download PDF"}
          </button>
        </div>
      </div>

      <div ref={printRef} style={printArea}>
        <div style={printTitle}>
          {pageTitle}{" "}
          <span style={{ fontWeight: 600, opacity: 0.7 }}>({typeLabel})</span>
        </div>
        <div style={printMeta}>Generated: {new Date().toLocaleString()}</div>

        <div
          ref={gridRef}
          className="codeGrid"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(
              1,
              Number(columns) || 2
            )}, 1fr)`,
            gap,
          }}
        >
          {codeItems.map((it, idx) => (
            <div
              key={`${it.id}-${idx}`}
              className="codeCard"
              style={{
                ...card,
                height: cardHeight,
                padding: cardPadding,
              }}
            >
              {it.type === "B" ? (
                // ✅ BARCODE as IMG (big + scalable + prints perfectly)
                <div
                  style={{
                    width: "100%",
                    height: Math.min(190, cardHeight - (showLabel ? 44 : 24)),
                    display: "block",
                  }}
                >
                  <BarcodeImg
                    value={it.payload}
                    targetWidth={barcodeCanvasW}
                    targetHeight={barcodeCanvasH}
                    barWidth={barcodeBarWidth}
                    barHeight={barcodeBarHeight}
                  />
                </div>
              ) : (
                <QrImg value={it.payload} size={codeSize} />
              )}

              {showLabel ? <div style={label}>{it.label}</div> : null}
            </div>
          ))}
        </div>

        {!codeItems.length ? (
          <div style={empty}>No printable items found.</div>
        ) : null}
      </div>
    </div>
  );
}

/** ✅ QR as IMG */
function QrImg({ value, size }) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = await QRCodeLib.toDataURL(value, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: size,
        });
        if (alive) setSrc(url);
      } catch (e) {
        if (alive) setSrc("");
        console.error("QR generation failed:", e);
      }
    })();
    return () => {
      alive = false;
    };
  }, [value, size]);

  if (!src) return <LoadingBox size={size} text="QR..." />;

  return (
    <img
      src={src}
      alt="qr"
      style={{
        width: size,
        height: size,
        display: "block",
        background: "#fff",
        borderRadius: 10,
      }}
    />
  );
}

/** ✅ BARCODE as IMG via Canvas (fixes "tiny barcode" issue everywhere) */
function BarcodeImg({
  value,
  targetWidth = 1400,
  targetHeight = 420,
  barWidth = 3,
  barHeight = 160,
  margin = 0,
}) {
  const [src, setSrc] = useState("");

  useEffect(() => {
    let alive = true;

    try {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      JsBarcode(canvas, String(value), {
        format: "CODE128",
        displayValue: false,
        margin,
        width: barWidth,
        height: barHeight,
      });

      const url = canvas.toDataURL("image/png");
      if (alive) setSrc(url);
    } catch (e) {
      console.error("Barcode generation failed:", e);
      if (alive) setSrc("");
    }

    return () => {
      alive = false;
    };
  }, [value, targetWidth, targetHeight, barWidth, barHeight, margin]);

  if (!src) return <LoadingBox size={220} text="BAR..." />;

  return (
    <img
      src={src}
      alt="barcode"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
        background: "#fff",
        borderRadius: 10,
      }}
    />
  );
}

function LoadingBox({ size, text }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        fontSize: 12,
        opacity: 0.7,
        background: "#fff",
        borderRadius: 10,
        border: "1px solid rgba(15,23,42,0.08)",
      }}
    >
      {text}
    </div>
  );
}

/** ✅ payload sanitizer */
function sanitizePayload(obj, opts = {}) {
  const { removeDropdown = true, removeNulls = true, keepOnlyKeys = null } =
    opts;

  const out = {};
  const source = obj || {};
  const keys =
    Array.isArray(keepOnlyKeys) && keepOnlyKeys.length
      ? keepOnlyKeys
      : Object.keys(source);

  for (const k of keys) {
    if (!Object.prototype.hasOwnProperty.call(source, k)) continue;
    if (removeDropdown && String(k).toLowerCase().endsWith("dropdown")) continue;

    const v = source[k];
    if (removeNulls && (v === null || v === undefined || v === "")) continue;

    if (
      typeof v === "string" ||
      typeof v === "number" ||
      typeof v === "boolean"
    ) {
      out[k] = v;
    } else {
      try {
        out[k] = JSON.stringify(v);
      } catch {
        // ignore
      }
    }
  }
  return out;
}

/** ✅ barcode value MUST be short */
function makeBarcodeValue(id, idField) {
  return `W${String(idField).slice(0, 3).toUpperCase()}:${String(id)}`;
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function waitForMedia(doc) {
  const imgs = Array.from(doc.images || []);
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    imgs.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Styles */
const iframeStyle = {
  position: "fixed",
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  border: 0,
  opacity: 0,
  pointerEvents: "none",
};

const wrap = { padding: 12, background: "#f6f7fb" };

const topBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: 12,
  borderRadius: 14,
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.10)",
  boxShadow: "0 10px 22px rgba(2,6,23,0.06)",
};

const badge = {
  width: 30,
  height: 30,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  fontWeight: 900,
  fontSize: 12,
  background: "linear-gradient(135deg, #111827, #334155)",
  color: "#fff",
};

const title = { fontSize: 13, fontWeight: 900, color: "#0f172a" };
const metaLine = { fontSize: 11, color: "#64748b", marginTop: 2 };

const btn = {
  height: 34,
  padding: "0 12px",
  borderRadius: 12,
  border: "1px solid rgba(2,6,23,0.10)",
  background: "linear-gradient(135deg, #0f172a, #334155)",
  color: "#fff",
  fontWeight: 800,
  fontSize: 12,
  cursor: "pointer",
};

const btnGhost = {
  height: 34,
  padding: "0 12px",
  borderRadius: 12,
  border: "1px solid rgba(2,6,23,0.12)",
  background: "#fff",
  color: "#0f172a",
  fontWeight: 800,
  fontSize: 12,
  cursor: "pointer",
};

const btnDisabled = { opacity: 0.45, cursor: "not-allowed" };

const printArea = {
  marginTop: 10,
  padding: 12,
  borderRadius: 14,
  background: "#fff",
  border: "1px solid rgba(15,23,42,0.10)",
  boxShadow: "0 10px 22px rgba(2,6,23,0.06)",
};

const printTitle = { fontSize: 13, fontWeight: 900, marginBottom: 4 };
const printMeta = { fontSize: 10, color: "#64748b", marginBottom: 10 };

const card = {
  border: "1px solid rgba(15,23,42,0.12)",
  borderRadius: 14,
  background: "#fff",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
};

const label = { fontSize: 11, fontWeight: 800, color: "#0f172a" };

const empty = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  border: "1px dashed rgba(15,23,42,0.22)",
  color: "#64748b",
  fontSize: 11,
};
