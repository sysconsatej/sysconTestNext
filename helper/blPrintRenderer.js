// ✅ COMPLETE UPDATED renderElement FUNCTION (drop-in)
// Assumes your file already has: MM_TO_PX, applyTokens(), getByPath() available.
// If you don't have getByPath/applyTokens, tell me and I’ll include those too.

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderElement(el, data) {
  const id = el?.id ?? Math.random().toString(36).slice(2);

  // ✅ tolerate different saved keys (x/xMm etc.)
  const x = Number(el?.x ?? el?.xMm ?? 0);
  const y = Number(el?.y ?? el?.yMm ?? 0);
  const w = Number(el?.w ?? el?.wMm ?? 20);
  const h = Number(el?.h ?? el?.hMm ?? 10);

  const type = el?.type || "text";
  const st = el?.style || {};

  // -------------------------------
  // ✅ BORDER: support multiple shapes
  // -------------------------------
  const borderColor =
    st?.borderColor ??
    st?.stroke ??
    el?.borderColor ??
    el?.stroke ??
    "#000";

  const borderWidthMmRaw =
    st?.borderWidthMm ??
    st?.strokeWidthMm ??
    el?.borderWidthMm ??
    el?.strokeWidthMm ??
    null;

  const borderWidthPxRaw =
    st?.borderWidth ??
    st?.strokeWidth ??
    el?.borderWidth ??
    el?.strokeWidth ??
    null;

  // If any border flag OR any border width exists => show border
  // Also give tiny default border if it's a textbox-like element.
  const hasAnyBorderFlag =
    st?.border === true ||
    st?.showBorder === true ||
    el?.border === true ||
    el?.showBorder === true ||
    borderWidthMmRaw != null ||
    borderWidthPxRaw != null ||
    type === "text" ||
    type === "textbox"; // safeguard

  const borderWidthMm = borderWidthMmRaw != null ? Number(borderWidthMmRaw) : null;
  const borderWidthPx = borderWidthPxRaw != null ? Number(borderWidthPxRaw) : null;

  const borderCss = hasAnyBorderFlag
    ? `border:${(borderWidthMm != null
        ? `${borderWidthMm}mm`
        : borderWidthPx != null
        ? `${borderWidthPx}px`
        : `0.3mm`)} solid ${borderColor};`
    : "";

  // -------------------------------
  // ✅ BACKGROUND
  // -------------------------------
  const bg =
    st?.background ??
    st?.backgroundColor ??
    st?.fill ??
    el?.background ??
    el?.fill ??
    "transparent";

  // -------------------------------
  // ✅ TEXT STYLE
  // -------------------------------
  const fontSize = Number(st?.fontSize ?? el?.fontSize ?? 10);
  const color = st?.color ?? el?.color ?? "#000";
  const align = st?.textAlign ?? el?.align ?? "left";
  const weight = st?.fontWeight ?? el?.fontWeight ?? 400;
  const family =
    st?.fontFamily ?? el?.fontFamily ?? "Arial, Helvetica, sans-serif";

  const lineHeight =
    st?.lineHeight ??
    el?.lineHeight ??
    Math.max(1.1, (fontSize + 2) / fontSize);

  const paddingMm = Number(st?.paddingMm ?? el?.paddingMm ?? 0.8);

  const commonStyle = `
    position:absolute;
    left:${x}mm; top:${y}mm;
    width:${w}mm; height:${h}mm;
    box-sizing:border-box;
  `;

  // -------------------------------
  // ✅ IMAGE
  // -------------------------------
  if (type === "image") {
    const src = el?.src || st?.src || "";
    return `
      <img
        data-elid="${id}"
        src="${src}"
        style="${commonStyle} object-fit:contain;"
        alt=""
      />
    `;
  }

  // -------------------------------
  // ✅ LINES
  // -------------------------------
  if (type === "lineH" || type === "lineV") {
    const thickness = Number(st?.strokeWidth ?? el?.strokeWidth ?? 0.3);
    const lineColor = st?.stroke ?? el?.stroke ?? "#000";
    const isH = type === "lineH";
    return `
      <div data-elid="${id}" style="
        ${commonStyle}
        background:${lineColor};
        ${isH ? `height:${thickness}mm;` : `width:${thickness}mm;`}
      "></div>
    `;
  }

  // -------------------------------
  // ✅ BOX / RECT / SHAPE (supports template variants)
  // -------------------------------
  if (type === "box" || type === "rect" || type === "shape") {
    const boxBorderColor =
      st?.borderColor ?? st?.stroke ?? el?.borderColor ?? el?.stroke ?? "#000";
    const boxBorderW =
      Number(st?.borderWidthMm ?? st?.strokeWidthMm ?? st?.strokeWidth ?? el?.strokeWidth ?? 0.3);

    const boxBg =
      st?.fill ??
      st?.backgroundColor ??
      el?.fill ??
      el?.background ??
      "transparent";

    return `
      <div data-elid="${id}" style="
        ${commonStyle}
        border:${boxBorderW}mm solid ${boxBorderColor};
        background:${boxBg};
      "></div>
    `;
  }

  // -------------------------------
  // ✅ TABLE
  // -------------------------------
  if (type === "table") {
    const rowsPath = el?.rowsBindingPath || st?.rowsBindingPath || "";
    const rows = Array.isArray(getByPath(data, rowsPath))
      ? getByPath(data, rowsPath)
      : [];

    const cols = Array.isArray(el?.columns) ? el.columns : [];

    const tbBorderColor = borderColor;
    const tbBorderW =
      borderWidthMm != null
        ? `${borderWidthMm}mm`
        : borderWidthPx != null
        ? `${borderWidthPx}px`
        : `0.2mm`;

    const fs = Number(st?.fontSize ?? el?.fontSize ?? 9);

    const headHtml = cols
      .map(
        (c) => `<th style="border:${tbBorderW} solid ${tbBorderColor}; padding:1mm; font-size:${fs}px; text-align:left;">
          ${escapeHtml(c?.header ?? "")}
        </th>`
      )
      .join("");

    const bodyHtml = rows
      .map((row) => {
        const tds = cols
          .map((c) => {
            const v = getByPath({ row, ...data }, c?.fieldPath || "");
            return `<td style="border:${tbBorderW} solid ${tbBorderColor}; padding:1mm; font-size:${fs}px;">
              ${escapeHtml(v == null ? "" : String(v))}
            </td>`;
          })
          .join("");
        return `<tr>${tds}</tr>`;
      })
      .join("");

    return `
      <div data-elid="${id}" style="${commonStyle}">
        <table style="width:100%; height:100%; border-collapse:collapse;">
          <thead><tr>${headHtml}</tr></thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
    `;
  }

  // -------------------------------
  // ✅ TEXT / TEXTBOX
  // -------------------------------
  // If element has bindingPath and text is empty -> fetch from data
  let rawText = st?.text ?? el?.text ?? "";

  if (
    (!rawText || String(rawText).trim() === "") &&
    (el?.bindingPath || st?.bindingPath)
  ) {
    const v = getByPath(data, el?.bindingPath || st?.bindingPath);
    rawText = v == null ? "" : String(v);
  }

  // token replacement (your system uses {{path}} style)
  const outText = applyTokens(rawText, data);

  // ✅ keep a blank cell visible (so textbox border shows)
  const safeText =
    outText && String(outText).trim() !== "" ? escapeHtml(outText) : "&nbsp;";

  return `
    <div data-elid="${id}" style="
      ${commonStyle}
      ${borderCss}
      background:${bg};
      padding:${paddingMm}mm;

      font-family:${family};
      font-size:${fontSize}px;
      color:${color};
      font-weight:${weight};
      line-height:${lineHeight};
      text-align:${align};

      white-space:pre-wrap;
      overflow:hidden;

      /* ✅ important for proper textbox layout */
      display:flex;
      align-items:flex-start;
      justify-content:flex-start;
    ">${safeText}</div>
  `;
}
