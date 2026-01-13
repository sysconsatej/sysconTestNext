/* eslint-disable */

/**
 * PRINT HELPERS (Exact canvas -> print)
 * - mm-based page
 * - zero margins
 * - renders elements using raw template mm coordinates
 * - uses hidden iframe (srcdoc) and waits for load/fonts/layout before printing
 *
 * Usage:
 *   import { printTemplateExact } from "@/helper/printTemplate";
 *   printTemplateExact(template);
 */

// ---- Default paper sizes (mm) ----
const PAPER_PRESETS = {
  A4_PORTRAIT: { w: 210, h: 297 },
  A4_LANDSCAPE: { w: 297, h: 210 },
  LETTER_PORTRAIT: { w: 216, h: 279 },
  LETTER_LANDSCAPE: { w: 279, h: 216 },
};

// ----------- SAFE GETTERS -----------
export function getPaperMmFromTemplate(template) {
  const preset =
    template?.paper?.preset ||
    template?.paperPreset ||
    template?.paperSizeId ||
    template?.paperId ||
    "A4_PORTRAIT";

  const presetMm = PAPER_PRESETS[preset] || PAPER_PRESETS.A4_PORTRAIT;

  const w =
    Number(template?.paper?.wMm) ||
    Number(template?.paperWmm) ||
    Number(template?.paperWidthMm) ||
    Number(template?.pageWmm) ||
    Number(template?.pageWidthMm) ||
    presetMm.w;

  const h =
    Number(template?.paper?.hMm) ||
    Number(template?.paperHmm) ||
    Number(template?.paperHeightMm) ||
    Number(template?.pageHmm) ||
    Number(template?.pageHeightMm) ||
    presetMm.h;

  return { wMm: w, hMm: h };
}

function escHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// 96dpi px -> pt (more stable in print)
function pxToPt(px) {
  return (Number(px || 0) * 72) / 96;
}

function normAlign(a) {
  const v = String(a || "left").toLowerCase();
  return v === "centre" ? "center" : v;
}
function normVAlign(v) {
  const s = String(v || "top").toLowerCase();
  if (s === "middle") return "center";
  return s;
}
function justifyFromAlign(align) {
  const a = normAlign(align);
  if (a === "right") return "flex-end";
  if (a === "center") return "center";
  return "flex-start";
}
function itemsFromVAlign(vAlign) {
  const v = normVAlign(vAlign);
  if (v === "bottom") return "flex-end";
  if (v === "center") return "center";
  return "flex-start";
}

function cssTextStyle(el) {
  const fontSizePx = Number(el.fontSize ?? el.style?.fontSize ?? 10);
  const fontFamily = el.fontFamily || el.style?.fontFamily || "";
  const fontWeight = el.fontWeight ?? el.style?.fontWeight ?? 600;
  const color = el.color ?? el.style?.color ?? "#000";

  const fontStyle = el.fontStyle ?? el.style?.fontStyle ?? "";
  const textDecoration = el.textDecoration ?? el.style?.textDecoration ?? "";
  const letterSpacing = el.letterSpacing ?? el.style?.letterSpacing;
  const lineHeight = el.lineHeight ?? el.style?.lineHeight ?? 1.1;

  const align = normAlign(el.textAlign ?? el.style?.textAlign ?? "left");

  const parts = [];
  if (fontFamily) parts.push(`font-family:${fontFamily};`);
  parts.push(`font-size:${pxToPt(fontSizePx)}pt;`);
  if (fontWeight != null) parts.push(`font-weight:${fontWeight};`);
  if (fontStyle) parts.push(`font-style:${fontStyle};`);
  if (textDecoration) parts.push(`text-decoration:${textDecoration};`);
  if (color) parts.push(`color:${color};`);
  parts.push(`line-height:${lineHeight};`);
  if (letterSpacing != null)
    parts.push(`letter-spacing:${Number(letterSpacing)}px;`);
  parts.push(`text-align:${align};`);

  return parts.join("");
}

function elementBaseStyle(el) {
  const x = Number(el.x ?? el.left ?? 0);
  const y = Number(el.y ?? el.top ?? 0);
  const w = Number(el.w ?? el.width ?? 10);
  const h = Number(el.h ?? el.height ?? 10);
  const rotate = Number(el.rotate ?? el.rotation ?? 0);

  return [
    `left:${x}mm`,
    `top:${y}mm`,
    `width:${w}mm`,
    `height:${h}mm`,
    `position:absolute`,
    `box-sizing:border-box`,
    `transform:${rotate ? `rotate(${rotate}deg)` : "none"}`,
    `transform-origin: top left`,
  ].join(";");
}

// ----------- ELEMENT RENDERERS (mm absolute) -----------
function elementToHTML(el) {
  if (!el) return "";

  const id = el.id ?? "";
  const type = el.type ?? el.kind ?? "unknown";
  const baseStyle = elementBaseStyle(el);

  const stroke = el.stroke ?? el.borderColor ?? "#000";
  const strokeW = Number(el.strokeW ?? el.borderWidth ?? 0.2);
  const fill = el.fill ?? el.bg ?? "transparent";

  const hasBorder =
    el.border === true ||
    el.hasBorder === true ||
    (el.borderWidth != null && Number(el.borderWidth) > 0) ||
    (el.strokeW != null && Number(el.strokeW) > 0);

  if (type === "text") {
    const text = escHtml(el.text ?? el.value ?? "");
    const align = normAlign(el.textAlign ?? el.style?.textAlign ?? "left");
    const vAlign = normVAlign(
      el.vAlign ?? el.verticalAlign ?? el.style?.verticalAlign ?? "top"
    );
    const paddingMm = Number(el.paddingMm ?? el.style?.paddingMm ?? 0);

    return `
<div class="el el-text" data-id="${escHtml(id)}"
  style="${baseStyle};
    background:${fill};
    ${hasBorder ? `border:${strokeW}mm solid ${stroke};` : "border:none;"}
    padding:${paddingMm}mm;
    overflow:hidden;

    display:flex;
    justify-content:${justifyFromAlign(align)};
    align-items:${itemsFromVAlign(vAlign)};
  ">
  <div class="el-text-inner"
    style="
      width:100%;
      box-sizing:border-box;
      white-space:pre-wrap;
      word-break:break-word;
      ${cssTextStyle(el)}
    "
  >${text}</div>
</div>`;
  }

  if (type === "box" || type === "rect") {
    return `
<div class="el el-box" data-id="${escHtml(id)}"
  style="${baseStyle};
    border:${strokeW}mm solid ${stroke};
    background:${fill};
  "></div>`;
  }

  if (type === "lineH") {
    const t = Math.max(strokeW, 0.2);
    return `
<div class="el el-line-h" data-id="${escHtml(id)}"
  style="${baseStyle};
    height:${t}mm;
    background:${stroke};
  "></div>`;
  }

  if (type === "lineV") {
    const t = Math.max(strokeW, 0.2);
    return `
<div class="el el-line-v" data-id="${escHtml(id)}"
  style="${baseStyle};
    width:${t}mm;
    background:${stroke};
  "></div>`;
  }

  if (type === "table") {
    const rows = Number(el.rows ?? 2);
    const cols = Number(el.cols ?? 2);

    const cellBorder = `${strokeW}mm solid ${stroke}`;
    const align = normAlign(el.textAlign ?? "left");
    const vAlign = normVAlign(el.vAlign ?? "top");
    const fontSizePx = Number(el.fontSize ?? 10);

    const tableHTML = `
<table style="border-collapse:collapse;width:100%;height:100%;table-layout:fixed;">
  ${Array.from({ length: rows })
    .map(
      () => `
    <tr>
      ${Array.from({ length: cols })
        .map(
          () => `
        <td style="
          border:${cellBorder};
          padding:1mm;
          overflow:hidden;

          display:flex;
          justify-content:${justifyFromAlign(align)};
          align-items:${itemsFromVAlign(vAlign)};

          font-size:${pxToPt(fontSizePx)}pt;
          line-height:${el.lineHeight ?? 1.1};
        "></td>`
        )
        .join("")}
    </tr>`
    )
    .join("")}
</table>`;

    return `
<div class="el el-table" data-id="${escHtml(id)}"
  style="${baseStyle};
    background:${fill};
    overflow:hidden;
  ">
  ${tableHTML}
</div>`;
  }

  return `
<div class="el el-unknown" data-id="${escHtml(id)}"
  style="${baseStyle};
    border:${strokeW}mm dashed ${stroke};
    background:transparent;
    font-size:${pxToPt(10)}pt;
    color:#999;
    display:flex;
    align-items:center;
    justify-content:center;
  ">
  ${escHtml(type)}
</div>`;
}

function buildElementsHTML(template) {
  const list = template?.elements || template?.items || template?.nodes || [];
  if (!Array.isArray(list)) return "";

  return list
    .filter((el) => !el?.hidden && !el?.isGuide && !el?.isRuler)
    .map(elementToHTML)
    .join("\n");
}

// ----------- PRINT HTML BUILDER -----------
// ✅ templateToPrintableHTML.js
export function templateToPrintableHTML(template, paper, opts = {}) {
  const {
    showTextBorders = true, // ✅ force text border in print
    printScale = 1, // keep 1 for real mm output
  } = opts;

  const w = paper?.w ?? template?.paper?.w ?? 210;
  const h = paper?.h ?? template?.paper?.h ?? 297;

  const esc = (s = "") =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const mm = (n) => `${Number(n || 0)}mm`;

  const getRotate = (el) => {
    const r = Number(el?.rot || 0);
    return r ? ` rotate(${r}deg)` : "";
  };

  const baseBox = (el) => {
    const x = Number(el?.x || 0);
    const y = Number(el?.y || 0);
    const ew = Number(el?.w || 0);
    const eh = Number(el?.h || 0);

    // ✅ IMPORTANT: use mm in print (not px), and make it border-box
    return `
      position:absolute;
      left:${mm(x)};
      top:${mm(y)};
      width:${mm(ew)};
      height:${mm(eh)};
      box-sizing:border-box;
      transform-origin: top left;
      transform: scale(${printScale})${getRotate(el)};
    `;
  };

  const styleToCss = (st = {}) => {
    // your element style object -> css
    const fontSize = st?.fontSize ? `${st.fontSize}pt` : "10pt";
    const fontFamily = st?.fontFamily || "Arial, sans-serif";
    const fontWeight = st?.bold ? "700" : st?.fontWeight || "400";
    const fontStyle = st?.italic ? "italic" : "normal";
    const textDecoration = st?.underline ? "underline" : "none";
    const textAlign = st?.align || "left";
    const lineHeight = st?.lineHeight ? String(st.lineHeight) : "1.2";
    const color = st?.color || "#000";

    return `
      font-size:${fontSize};
      font-family:${fontFamily};
      font-weight:${fontWeight};
      font-style:${fontStyle};
      text-decoration:${textDecoration};
      text-align:${textAlign};
      line-height:${lineHeight};
      color:${color};
    `;
  };

  const renderText = (el) => {
    const st = el?.style || {};
    const borderCss = showTextBorders
      ? `border:${st?.borderWidthMm ?? 0.2}mm solid ${
          st?.borderColor ?? "#000"
        };`
      : st?.border
      ? `border:${st.border};`
      : "";

    const pad = st?.paddingMm ?? 0; // keep 0 if you want exact top-left baseline feel

    // ✅ Use pre-wrap so line breaks match
    // ✅ Use border-box so border doesn't shift layout
    return `
      <div class="el text"
        style="${baseBox(el)}
          ${styleToCss(st)}
          ${borderCss}
          padding:${mm(pad)};
          background:transparent;
          white-space:pre-wrap;
          overflow:hidden;
        "
      >${esc(el?.text || "")}</div>
    `;
  };

  const renderBox = (el) => {
    const st = el?.style || {};
    const bw = st?.borderWidthMm ?? 0.2;
    const bc = st?.borderColor ?? "#000";
    const bg = st?.fill ?? "transparent";
    return `
      <div class="el box"
        style="${baseBox(el)}
          border:${bw}mm solid ${bc};
          background:${bg};
        "
      ></div>
    `;
  };

  const renderLineH = (el) => {
    const st = el?.style || {};
    const t = st?.thicknessMm ?? 0.3;
    const c = st?.color ?? "#000";
    return `
      <div class="el lineh"
        style="${baseBox(el)}
          height:${mm(t)};
          background:${c};
        "
      ></div>
    `;
  };

  const renderLineV = (el) => {
    const st = el?.style || {};
    const t = st?.thicknessMm ?? 0.3;
    const c = st?.color ?? "#000";
    return `
      <div class="el linev"
        style="${baseBox(el)}
          width:${mm(t)};
          background:${c};
        "
      ></div>
    `;
  };

  const renderTable = (el) => {
    const st = el?.style || {};
    const rows = Number(el?.rows || 2);
    const cols = Number(el?.cols || 2);

    const grid = el?.grid || []; // expect [{r,c,text,style,rowSpan,colSpan,hidden}]
    const bw = st?.borderWidthMm ?? 0.2;
    const bc = st?.borderColor ?? "#000";

    // build matrix for spans/hidden
    const cellKey = (r, c) => `${r}:${c}`;
    const byKey = new Map();
    for (const cell of grid) byKey.set(cellKey(cell.r, cell.c), cell);

    let html = `<table style="width:100%;height:100%;border-collapse:collapse;table-layout:fixed;">`;

    for (let r = 0; r < rows; r++) {
      html += "<tr>";
      for (let c = 0; c < cols; c++) {
        const cell = byKey.get(cellKey(r, c)) || { r, c, text: "" };
        if (cell.hidden) continue;

        const rs = Number(cell.rowSpan || 1);
        const cs = Number(cell.colSpan || 1);
        const cst = cell.style || {};

        html += `
          <td
            ${rs > 1 ? `rowspan="${rs}"` : ""}
            ${cs > 1 ? `colspan="${cs}"` : ""}
            style="
              border:${bw}mm solid ${bc};
              padding:${mm(cst.paddingMm ?? 0.6)};
              vertical-align:${cst.vAlign || "top"};
              ${styleToCss(cst)}
              white-space:pre-wrap;
              overflow:hidden;
            "
          >${esc(cell.text || "")}</td>
        `;
      }
      html += "</tr>";
    }

    html += "</table>";

    return `
      <div class="el table"
        style="${baseBox(el)}
          border:${bw}mm solid ${bc};
          background:transparent;
        "
      >${html}</div>
    `;
  };

  const renderElement = (el) => {
    switch (el?.type) {
      case "text":
        return renderText(el);
      case "box":
        return renderBox(el);
      case "lineH":
        return renderLineH(el);
      case "lineV":
        return renderLineV(el);
      case "table":
        return renderTable(el);
      default:
        return "";
    }
  };

  const elements = Array.isArray(template?.elements) ? template.elements : [];

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Print</title>

  <style>
    /* ✅ page size MUST be mm for exact match */
    @page {
      size: ${w}mm ${h}mm;
      margin: 0;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: ${w}mm;
      height: ${h}mm;
      background: white;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    * { box-sizing: border-box; }

    .page {
      position: relative;
      width: ${w}mm;
      height: ${h}mm;
      overflow: hidden;
      background: #fff;
    }

    /* ✅ IMPORTANT: prevents browser “text reflow” differences */
    .el {
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
    }
  </style>
</head>

<body>
  <div class="page">
    ${elements.map(renderElement).join("\n")}
  </div>
</body>
</html>`;
}

// ----------- IFRAME PRINT (reliable) -----------
function getOrCreatePrintIframe() {
  let iframe = document.getElementById("bl-print-iframe");
  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = "bl-print-iframe";

    // ✅ DO NOT keep 0x0 — Chrome sometimes prints blank
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.border = "0";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    iframe.setAttribute("aria-hidden", "true");

    document.body.appendChild(iframe);
  }
  return iframe;
}

function raf2(win) {
  return new Promise((resolve) => {
    win.requestAnimationFrame(() => {
      win.requestAnimationFrame(() => resolve());
    });
  });
}

function waitForFonts(win) {
  try {
    const d = win?.document;
    if (d && d.fonts && typeof d.fonts.ready?.then === "function") {
      return d.fonts.ready.catch(() => null);
    }
  } catch {}
  return Promise.resolve();
}

function waitForImages(doc) {
  try {
    const imgs = Array.from(doc?.images || []);
    if (!imgs.length) return Promise.resolve();
    return Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) return resolve();
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );
  } catch {
    return Promise.resolve();
  }
}

function openWindowFallback(html) {
  try {
    const w = window.open("", "_blank");
    if (!w) return false;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    // allow layout
    setTimeout(() => {
      try {
        w.print();
      } catch {}
    }, 250);
    return true;
  } catch {
    return false;
  }
}

export function printTemplateExact(template) {
  if (typeof window === "undefined") return;

  if (!template) {
    console.error("printTemplateExact: template is undefined/null");
    return;
  }
  console.log(
    "PRINT elements count:",
    (template?.elements || template?.items || template?.nodes || []).length
  );

  const html = templateToPrintableHTML(template);

  const iframe = getOrCreatePrintIframe();

  // ✅ Use srcdoc for reliable render
  let didLoad = false;

  const cleanup = () => {
    iframe.onload = null;
  };

  const doPrint = async () => {
    const win = iframe.contentWindow;
    const doc = win?.document;
    if (!win || !doc) {
      cleanup();
      // fallback
      openWindowFallback(html);
      return;
    }

    try {
      // Wait for layout, fonts, images
      await waitForFonts(win);
      await waitForImages(doc);
      await raf2(win);
      await new Promise((r) => setTimeout(r, 60));

      win.focus();
      win.print();
    } catch (e) {
      console.error("printTemplateExact: print failed", e);
      // fallback
      openWindowFallback(html);
    } finally {
      cleanup();
    }
  };

  iframe.onload = () => {
    didLoad = true;
    doPrint();
  };

  // assign after onload to avoid missing it
  iframe.srcdoc = html;

  // Fallback if load doesn't fire
  setTimeout(() => {
    if (!didLoad) doPrint();
  }, 400);
}
