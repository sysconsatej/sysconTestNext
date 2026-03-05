// uploadInvoicePurchase.js
"use client";

/* =========================================================
   ✅ CONFIG
========================================================= */

const DEFAULT_FILE_NAME_ARRAY = [
  {
    key: "taxInvoiceNo",
    keyNamePossibility: ["Tax Invoice No", "Tax Invoice No."],
  },
  { key: "taxInvoiceDate", keyNamePossibility: ["Tax Invoice Date"] },
  { key: "taxInvoiceType", keyNamePossibility: ["Tax Invoice Type"] },
  { key: "clientNo", keyNamePossibility: ["Client No", "Client No."] },
  { key: "paymentTerms", keyNamePossibility: ["Payment Terms"] },
  { key: "poNo", keyNamePossibility: ["PO No", "P.O. No"] },
  { key: "ssrNo", keyNamePossibility: ["SSR No", "S.S.R No"] },
  { key: "gstn", keyNamePossibility: ["GSTN"] },
  { key: "vessel", keyNamePossibility: ["Vessel"] },
  { key: "ataAtd", keyNamePossibility: ["ATA/ATD", "ATA / ATD"] },
  { key: "govIrn", keyNamePossibility: ["GOV IRN", "IRN"] },
];

/**
 * ✅ Next.js-safe worker setup:
 * Put pdf.worker.min.mjs into /public/pdfjs/pdf.worker.min.mjs
 * Then use "/pdfjs/pdf.worker.min.mjs" as workerSrc.
 */
async function getPdfJs() {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");
  if (typeof window !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";
  }
  return pdfjsLib;
}

/* =========================================================
   ✅ MAIN
========================================================= */

export async function uploadInvoicePurchase(
  arrayBuffer,
  fileName = "",
  fileNameArray = DEFAULT_FILE_NAME_ARRAY
) {
  const pdfjsLib = await getPdfJs();
  let pdf = null;

  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

  function itemsToLines(items, pageNumber, yTol = 2.5) {
    const sorted = [...items].sort((a, b) => {
      const dy = b.y - a.y;
      if (Math.abs(dy) > yTol) return dy;
      return a.x - b.x;
    });

    const buckets = [];
    for (const it of sorted) {
      const txt = clean(it.str);
      if (!txt) continue;

      const y = it.y ?? 0;
      let bucket = buckets.find((b) => Math.abs(b.y - y) <= yTol);
      if (!bucket) {
        bucket = { pageNumber, y, parts: [] };
        buckets.push(bucket);
      }
      bucket.parts.push({ x: it.x ?? 0, t: txt });
    }

    const lines = buckets
      .map((b) => {
        b.parts.sort((p1, p2) => p1.x - p2.x);
        const text = clean(b.parts.map((p) => p.t).join(" "));
        return { pageNumber: b.pageNumber, y: b.y, text };
      })
      .filter((l) => l.text);

    lines.sort((a, b) => b.y - a.y);
    return lines;
  }

  try {
    pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const pages = [];
    const allLines = [];

    for (let p = 1; p <= pdf.numPages; p++) {
      const page = await pdf.getPage(p);
      const textContent = await page.getTextContent();

      const items = (textContent.items || []).map((it) => {
        const t = it.transform || [];
        return { str: it.str || "", x: t[4] ?? 0, y: t[5] ?? 0 };
      });

      const lines = itemsToLines(items, p, 2.5);
      pages.push({ pageNumber: p, lines, items });
      allLines.push(...lines);
    }

    const resultJson = {
      fileName,
      type: "pdf",
      numPages: pdf.numPages,
      pages,
      lines: allLines,
    };

    // ✅ HEADER EXTRACTION:
    // If your invoice header is always on the first page, keep this.
    // Otherwise, you can extend it to search multiple pages later.
    const headerResultJson = {
      ...resultJson,
      lines: resultJson.pages?.[0]?.lines || [],
    };

    const extractedHeader = extractDataFromInvoicePurchase(
      headerResultJson,
      fileNameArray
    );

    // ✅ CHARGES (multi-page) — Code | Description | Qty | Tariff | Ex.Rate | Amount in ₹
    let charges = extractChargesTableFromPdfPages(resultJson.pages, {
      headerSearchPages: pdf.numPages,
      yTol: 2.5,
      minRowConfidence: 3,
    });

    // ✅ Charges fallback (line-regex)
    if (!Array.isArray(charges) || charges.length === 0) {
      charges = extractChargesTableFromLines(resultJson.lines || []);
    }

    // ✅ Normalize charges no matter what path produced them
    charges = (charges || []).map(normalizeChargeRow);

    // ✅ CONTAINERS (multi-page) — Tariff Code | Container | Tariff | Ex.Rate | Ex.Date | Amount
    let containers = extractContainerTableFromPdfPages(resultJson.pages, {
      headerSearchPages: pdf.numPages,
      yTol: 2.5,
      minRowConfidence: 2,
    });

    // ✅ Container fallback (line-regex)
    if (!Array.isArray(containers) || containers.length === 0) {
      containers = extractContainerTableFromLines(resultJson.lines || []);
    }

    // ✅ Normalize containers
    containers = (containers || []).map(normalizeContainerRow);

    const finalOut = {
      ...extractedHeader,
      charges,
      containers,
    };

    console.log("FINAL_EXTRACTED_JSON", finalOut);
    return finalOut;
  } catch (err) {
    return {
      fileName,
      type: "pdf",
      error: String(err?.message || err || "PDF extract failed"),
      numPages: 0,
      pages: [],
      lines: [],
      extractedHeader: {},
      charges: [],
      containers: [],
    };
  } finally {
    try {
      await pdf?.destroy?.();
    } catch {}
  }
}

/* =========================================================
   ✅ COMMON HELPERS
========================================================= */

function _clean(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function _normalizeCurrency(s) {
  return _clean(s)
    .replace(/â‚¹/g, "₹")
    .replace(/\bRs\.?\b/gi, "₹")
    .replace(/\bINR\b/gi, "₹");
}

function _normForHeaderMatch(s) {
  return _clean(s)
    .toLowerCase()
    .replace(/[^\w.₹$]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   ✅ CHARGES NORMALIZER + EXTRACTORS
========================================================= */

function normalizeChargeRow(row) {
  const r = {
    code: _clean(row?.code),
    description: _clean(row?.description),
    qty: _clean(row?.qty),
    tariff: _normalizeCurrency(row?.tariff),
    exRate: _clean(row?.exRate),
    amount: _normalizeCurrency(row?.amount),
  };

  // Fix: tariff empty but exRate contains "₹ 6,640.35 1.00"
  if (!r.tariff && r.exRate) {
    const ex = _normalizeCurrency(r.exRate);
    const m = ex.match(/^₹\s*([\d,]+\.\d{2})\s+(\d+\.\d{2})$/);
    if (m) {
      r.tariff = `₹ ${m[1]}`.trim();
      r.exRate = m[2].trim();
    }
  }

  // qty should be numeric-like (keep as string)
  if (r.qty) r.qty = r.qty.replace(/[^\d.]/g, "");

  return r;
}

function extractChargesTableFromPdfPages(pages, opts = {}) {
  const { headerSearchPages = 10, yTol = 2.5, minRowConfidence = 3 } = opts;

  function itemsToRows(items, pageNumber, yTolLocal = yTol) {
    const mapped = (items || [])
      .map((it) => ({
        t: _clean(it.str),
        x: Number(it.x ?? 0),
        y: Number(it.y ?? 0),
        pageNumber,
      }))
      .filter((it) => it.t);

    mapped.sort((a, b) => {
      const dy = b.y - a.y;
      if (Math.abs(dy) > yTolLocal) return dy;
      return a.x - b.x;
    });

    const rows = [];
    for (const it of mapped) {
      let r = rows.find((row) => Math.abs(row.y - it.y) <= yTolLocal);
      if (!r) {
        r = { pageNumber, y: it.y, cells: [] };
        rows.push(r);
      }
      r.cells.push({ x: it.x, t: it.t });
    }

    for (const r of rows) r.cells.sort((a, b) => a.x - b.x);
    rows.sort((a, b) => b.y - a.y);
    return rows;
  }

  function rowText(row) {
    return _normForHeaderMatch(row.cells.map((c) => c.t).join(" "));
  }

  function findHeaderAndColumns(rows) {
    // Need at least code + description + (qty/tariff/amount somewhere)
    for (let i = 0; i < rows.length; i++) {
      const txt = rowText(rows[i]);
      const hasBasics =
        txt.includes("code") && (txt.includes("description") || txt.includes("desc"));
      const hasSomeNumbers =
        txt.includes("qty") || txt.includes("tariff") || txt.includes("amount");
      if (!hasBasics || !hasSomeNumbers) continue;

      const anchors = {
        code: null,
        description: null,
        qty: null,
        tariff: null,
        exRate: null,
        amount: null,
      };

      for (const c of rows[i].cells) {
        const ct = _normForHeaderMatch(c.t);

        if (!anchors.code && ct === "code") anchors.code = c.x;
        if (!anchors.description && ct.includes("description")) anchors.description = c.x;
        if (!anchors.qty && ct === "qty") anchors.qty = c.x;
        if (!anchors.tariff && ct === "tariff") anchors.tariff = c.x;
        if (!anchors.exRate && ct.includes("ex") && ct.includes("rate")) anchors.exRate = c.x;
        if (!anchors.amount && ct.includes("amount")) anchors.amount = c.x;
      }

      // Fallbacks
      if (anchors.code == null) {
        const hit = rows[i].cells.find((c) => _normForHeaderMatch(c.t).includes("code"));
        if (hit) anchors.code = hit.x;
      }
      if (anchors.description == null) {
        const hit = rows[i].cells.find((c) =>
          _normForHeaderMatch(c.t).includes("description")
        );
        if (hit) anchors.description = hit.x;
      }

      if (anchors.code == null || anchors.description == null) continue;

      // Infer missing anchors
      const codeX = anchors.code;
      const descX = anchors.description ?? codeX + 60;
      const qtyX = anchors.qty ?? descX + 180;
      const tariffX = anchors.tariff ?? qtyX + 50;
      const exRateX = anchors.exRate ?? tariffX + 70;
      const amountX = anchors.amount ?? exRateX + 60;

      const cols = [
        { key: "code", x: codeX },
        { key: "description", x: descX },
        { key: "qty", x: qtyX },
        { key: "tariff", x: tariffX },
        { key: "exRate", x: exRateX },
        { key: "amount", x: amountX },
      ].sort((a, b) => a.x - b.x);

      const seps = [];
      for (let k = 0; k < cols.length - 1; k++) {
        seps.push((cols[k].x + cols[k + 1].x) / 2);
      }

      function colForX(x) {
        let idx = 0;
        while (idx < seps.length && x > seps[idx]) idx++;
        return cols[Math.min(idx, cols.length - 1)].key;
      }

      return { headerIndex: i, colForX };
    }

    return null;
  }

  const allRowsByPage = (pages || []).map((p) => ({
    pageNumber: p.pageNumber,
    rows: itemsToRows(p.items || [], p.pageNumber, yTol),
  }));

  // Find header
  let headerInfo = null;
  let headerPageIdx = -1;

  for (let pi = 0; pi < Math.min(headerSearchPages, allRowsByPage.length); pi++) {
    const info = findHeaderAndColumns(allRowsByPage[pi].rows);
    if (info) {
      headerInfo = info;
      headerPageIdx = pi;
      break;
    }
  }

  if (!headerInfo) return [];

  const results = [];
  let started = false;
  let stop = false;

  for (let pi = headerPageIdx; pi < allRowsByPage.length && !stop; pi++) {
    const { rows } = allRowsByPage[pi];

    for (let ri = 0; ri < rows.length; ri++) {
      if (pi === headerPageIdx && ri <= headerInfo.headerIndex) continue;

      const r = rows[ri];

      const bucket = {
        code: [],
        description: [],
        qty: [],
        tariff: [],
        exRate: [],
        amount: [],
      };

      for (const c of r.cells) {
        const k = headerInfo.colForX(c.x);
        if (bucket[k]) bucket[k].push(c.t);
      }

      const rowObj = normalizeChargeRow({
        code: _clean(bucket.code.join(" ")),
        description: _clean(bucket.description.join(" ")),
        qty: _clean(bucket.qty.join(" ")),
        tariff: _clean(bucket.tariff.join(" ")),
        exRate: _clean(bucket.exRate.join(" ")),
        amount: _clean(bucket.amount.join(" ")),
      });

      const hasCodeLike = /^[A-Z]{2,}\d{2,}$/i.test(rowObj.code); // DSF20, TYF20 etc.
      const hasQtyLike = /^\d+(\.\d+)?$/.test(rowObj.qty);
      const hasTariffLike = /[\d,]+\.\d{2}/.test(rowObj.tariff);
      const hasAmountLike = /[\d,]+\.\d{2}/.test(rowObj.amount);
      const hasExRateLike = /^\d+(\.\d+)?$/.test(rowObj.exRate);

      const confidence =
        (hasCodeLike ? 1 : 0) +
        (rowObj.description ? 1 : 0) +
        (hasQtyLike ? 1 : 0) +
        (hasTariffLike ? 1 : 0) +
        (hasExRateLike ? 1 : 0) +
        (hasAmountLike ? 1 : 0);

      if (!started) {
        if (confidence >= minRowConfidence && hasCodeLike) started = true;
        else continue;
      }

      // Stop when leaving table
      if (confidence < 2) {
        const t = rowText(r);
        const looksLikeStop =
          t.includes("sub total") ||
          t.includes("subtotal") ||
          t.includes("grand total") ||
          t.includes("total") ||
          t.includes("cgst") ||
          t.includes("sgst") ||
          t.includes("igst") ||
          t.includes("hsn") ||
          t.includes("sac") ||
          t.includes("gstn") ||
          t.includes("invoice");
        if (looksLikeStop) {
          stop = true;
          break;
        }
        continue;
      }

      // Accept only meaningful rows
      if (!hasCodeLike || !rowObj.description || !hasAmountLike) continue;

      results.push(rowObj);
    }
  }

  // Deduplicate
  const seen = new Set();
  const out = [];
  for (const r of results) {
    const k = `${r.code}|${r.description}|${r.qty}|${r.tariff}|${r.exRate}|${r.amount}`;
    if (!r.code) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }

  return out;
}

// Regex fallback (works when PDF text lines are merged nicely)
function extractChargesTableFromLines(lines = []) {
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

  // Code  Desc...(greedy)  Qty  Tariff  ExRate  Amount
  // DSF20 DISCHARGE 20' FULL GENL GATE 25 ₹ 6,640.35 1.00 166,008.75
  const rowRe =
    /^\s*([A-Z]{2,}\d{2,})\s+(.+?)\s+(\d+(?:\.\d+)?)\s+₹?\s*([\d,]+\.\d{2})\s+(\d+(?:\.\d+)?)\s+₹?\s*([\d,]+\.\d{2})\s*$/;

  const out = [];
  const seen = new Set();

  for (const ln of lines) {
    const text = clean(ln?.text || "");
    if (!text) continue;

    const low = text.toLowerCase();
    if (low.includes("code") && low.includes("description") && low.includes("qty")) continue;

    const m = text.match(rowRe);
    if (!m) continue;

    const rowObj = normalizeChargeRow({
      code: clean(m[1]),
      description: clean(m[2]),
      qty: clean(m[3]),
      tariff: `₹ ${clean(m[4])}`,
      exRate: clean(m[5]),
      amount: clean(m[6]),
    });

    const k = `${rowObj.code}|${rowObj.description}|${rowObj.qty}|${rowObj.tariff}|${rowObj.exRate}|${rowObj.amount}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(rowObj);
  }

  return out;
}

/* =========================================================
   ✅ CONTAINER NORMALIZER + EXTRACTORS (your existing logic)
========================================================= */

function normalizeContainerRow(row) {
  const r = {
    tariffCode: _clean(row?.tariffCode),
    container: _clean(row?.container),
    tariff: _normalizeCurrency(row?.tariff),
    exRate: _normalizeCurrency(row?.exRate),
    exDate: _clean(row?.exDate),
    amount: _clean(row?.amount),
  };

  // If tariff empty but exRate looks like "₹ 6,640.35 1.00"
  if (!r.tariff && r.exRate) {
    const ex = _normalizeCurrency(r.exRate);

    const m = ex.match(/^₹\s*([\d,]+\.\d{2})\s+(\d+\.\d{2})$/);
    if (m) {
      r.tariff = `₹ ${m[1]}`.trim();
      r.exRate = m[2].trim();
      return r;
    }

    const m2 = ex.match(/^([\d,]+\.\d{2})\s+(\d+\.\d{2})$/);
    if (m2) {
      r.tariff = `${m2[1]}`.trim();
      r.exRate = m2[2].trim();
      return r;
    }

    const parts = ex.split(" ").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    if (/^\d+\.\d{2}$/.test(last) && parts.length >= 2) {
      r.exRate = last;
      const tariffPart = parts.slice(0, -1).join(" ").trim();
      r.tariff = tariffPart;
      return r;
    }
  }

  // If tariff contains both values and exRate empty
  if (r.tariff && !r.exRate) {
    const t = r.tariff;
    const m = t.match(/^₹\s*([\d,]+\.\d{2})\s+(\d+\.\d{2})$/);
    if (m) {
      r.tariff = `₹ ${m[1]}`.trim();
      r.exRate = m[2].trim();
      return r;
    }
  }

  return r;
}

function extractContainerTableFromPdfPages(pages, opts = {}) {
  const { headerSearchPages = 6, yTol = 2.5, minRowConfidence = 2 } = opts;

  function itemsToRows(items, pageNumber, yTolLocal = yTol) {
    const mapped = (items || [])
      .map((it) => ({
        t: _clean(it.str),
        x: Number(it.x ?? 0),
        y: Number(it.y ?? 0),
        pageNumber,
      }))
      .filter((it) => it.t);

    mapped.sort((a, b) => {
      const dy = b.y - a.y;
      if (Math.abs(dy) > yTolLocal) return dy;
      return a.x - b.x;
    });

    const rows = [];
    for (const it of mapped) {
      let r = rows.find((row) => Math.abs(row.y - it.y) <= yTolLocal);
      if (!r) {
        r = { pageNumber, y: it.y, cells: [] };
        rows.push(r);
      }
      r.cells.push({ x: it.x, t: it.t });
    }

    for (const r of rows) r.cells.sort((a, b) => a.x - b.x);
    rows.sort((a, b) => b.y - a.y);
    return rows;
  }

  function rowText(row) {
    return _normForHeaderMatch(row.cells.map((c) => c.t).join(" "));
  }

  function findHeaderAndColumns(rows) {
    const mustHaveAny = [["tariff", "code", "container"]];

    for (let i = 0; i < rows.length; i++) {
      const txt = rowText(rows[i]);
      const ok = mustHaveAny.some((arr) => arr.every((k) => txt.includes(k)));
      if (!ok) continue;

      const anchors = {
        tariffCode: null,
        container: null,
        tariff: null,
        exRate: null,
        exDate: null,
        amount: null,
      };

      for (const c of rows[i].cells) {
        const ct = _normForHeaderMatch(c.t);

        if (!anchors.tariffCode && ct.includes("tariff") && ct.includes("code"))
          anchors.tariffCode = c.x;

        if (!anchors.container && ct.includes("container"))
          anchors.container = c.x;

        if (!anchors.tariff && ct.includes("tariff")) anchors.tariff = c.x;

        if (!anchors.exRate && ct.includes("ex") && ct.includes("rate"))
          anchors.exRate = c.x;

        if (!anchors.exDate && ct.includes("date")) anchors.exDate = c.x;

        if (!anchors.amount && ct.includes("amount")) anchors.amount = c.x;
      }

      if (anchors.tariffCode == null) {
        const hit = rows[i].cells.find((c) => _normForHeaderMatch(c.t).includes("code"));
        if (hit) anchors.tariffCode = hit.x;
      }
      if (anchors.exDate == null) {
        const hit = rows[i].cells.find((c) => _normForHeaderMatch(c.t).includes("date"));
        if (hit) anchors.exDate = hit.x;
      }

      if (anchors.tariffCode == null || anchors.container == null) continue;

      const tariffX = anchors.tariff ?? anchors.container + 80;
      const exRateX = anchors.exRate ?? tariffX + 70;
      const exDateX = anchors.exDate ?? exRateX + 60;
      const amountX = anchors.amount ?? exDateX + 70;

      const cols = [
        { key: "tariffCode", x: anchors.tariffCode },
        { key: "container", x: anchors.container },
        { key: "tariff", x: tariffX },
        { key: "exRate", x: exRateX },
        { key: "exDate", x: exDateX },
        { key: "amount", x: amountX },
      ].sort((a, b) => a.x - b.x);

      const seps = [];
      for (let k = 0; k < cols.length - 1; k++) {
        seps.push((cols[k].x + cols[k + 1].x) / 2);
      }

      function colForX(x) {
        let idx = 0;
        while (idx < seps.length && x > seps[idx]) idx++;
        return cols[Math.min(idx, cols.length - 1)].key;
      }

      return { headerIndex: i, colForX };
    }

    return null;
  }

  const allRowsByPage = (pages || []).map((p) => ({
    pageNumber: p.pageNumber,
    rows: itemsToRows(p.items || [], p.pageNumber, yTol),
  }));

  let headerInfo = null;
  let headerPageIdx = -1;

  for (let pi = 0; pi < Math.min(headerSearchPages, allRowsByPage.length); pi++) {
    const info = findHeaderAndColumns(allRowsByPage[pi].rows);
    if (info) {
      headerInfo = info;
      headerPageIdx = pi;
      break;
    }
  }

  if (!headerInfo) return [];

  const results = [];
  let started = false;
  let stop = false;

  for (let pi = headerPageIdx; pi < allRowsByPage.length && !stop; pi++) {
    const { rows } = allRowsByPage[pi];

    for (let ri = 0; ri < rows.length; ri++) {
      if (pi === headerPageIdx && ri <= headerInfo.headerIndex) continue;

      const r = rows[ri];

      const bucket = {
        tariffCode: [],
        container: [],
        tariff: [],
        exRate: [],
        exDate: [],
        amount: [],
      };

      for (const c of r.cells) {
        const k = headerInfo.colForX(c.x);
        if (bucket[k]) bucket[k].push(c.t);
      }

      const rowObj = normalizeContainerRow({
        tariffCode: _clean(bucket.tariffCode.join(" ")),
        container: _clean(bucket.container.join(" ")),
        tariff: _clean(bucket.tariff.join(" ")),
        exRate: _clean(bucket.exRate.join(" ")),
        exDate: _clean(bucket.exDate.join(" ")),
        amount: _clean(bucket.amount.join(" ")),
      });

      const hasContainerLike = /^[A-Z]{3,4}\d{6,8}$/i.test(rowObj.container);
      const hasTariffCode = /^[A-Z0-9]{3,}$/i.test(rowObj.tariffCode);
      const hasDateLike =
        /\b\d{1,2}[-/][A-Z]{3}[-/]\d{4}\b/i.test(rowObj.exDate) ||
        /\b\d{4}-\d{2}-\d{2}\b/.test(rowObj.exDate);
      const hasAmountLike = /[0-9]/.test(rowObj.amount);

      const confidence =
        (hasTariffCode ? 1 : 0) +
        (hasContainerLike ? 1 : 0) +
        (hasDateLike ? 1 : 0) +
        (hasAmountLike ? 1 : 0);

      if (!started) {
        if (confidence >= minRowConfidence && hasContainerLike) started = true;
        else continue;
      }

      if (confidence < 2) {
        const t = rowText(r);
        const looksLikeOtherSection =
          t.includes("sub total") ||
          t.includes("subtotal") ||
          t.includes("grand total") ||
          t.includes("cgst") ||
          t.includes("sgst") ||
          t.includes("hsn") ||
          t.includes("sac");
        if (looksLikeOtherSection) {
          stop = true;
          break;
        }
        continue;
      }

      results.push(rowObj);
    }
  }

  const seen = new Set();
  const out = [];
  for (const r of results) {
    const k = `${r.tariffCode}|${r.container}|${r.exDate}|${r.amount}`;
    if (!r.container) continue;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }

  return out;
}

function extractContainerTableFromLines(lines = []) {
  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();

  const rowRe =
    /^\s*([A-Z0-9]{3,})\s+([A-Z]{3,4}\d{6,8})\s+₹?\s*([\d,]+\.\d{2})\s+(\d+\.\d{2})\s+(\d{1,2}-[A-Za-z]{3}-\d{4})\s+([\d,]+\.\d{2})\s*$/;

  const out = [];
  const seen = new Set();

  for (const ln of lines) {
    const text = clean(ln?.text || "");
    if (!text) continue;

    const low = text.toLowerCase();
    if (low.includes("tariff code") && low.includes("container") && low.includes("amount"))
      continue;

    const m = text.match(rowRe);
    if (!m) continue;

    const rowObj = normalizeContainerRow({
      tariffCode: clean(m[1]),
      container: clean(m[2]),
      tariff: `₹ ${clean(m[3])}`,
      exRate: clean(m[4]),
      exDate: clean(m[5]),
      amount: clean(m[6]),
    });

    const k = `${rowObj.tariffCode}|${rowObj.container}|${rowObj.exDate}|${rowObj.amount}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(rowObj);
  }

  return out;
}

/* =========================================================
   ✅ HEADER EXTRACTOR (your existing logic unchanged)
========================================================= */

function extractDataFromInvoicePurchase(resultJson, fileNameArray = []) {
  const lines = Array.isArray(resultJson?.lines) ? resultJson.lines : [];

  const clean = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const stopLabels = new Set();

  for (const cfg of fileNameArray) {
    const poss = cfg?.keyNamePossibility || cfg?.keyNamePossiblity || [];
    poss.forEach((p) => stopLabels.add(clean(p)));
  }

  [
    "PAN",
    "PAN No",
    "Cust. GSTN",
    "Cust GSTN",
    "Client No",
    "Client No.",
    "Tax Invoice Date",
    "Tax Invoice Type",
    "Payment Terms",
    "PO No",
    "P.O. No",
    "SSR No",
    "Vessel",
    "GOV IRN",
    "IRN",
    "ATA/ATD",
    "ATA / ATD",
  ].forEach((x) => stopLabels.add(x));

  const stopList = Array.from(stopLabels).sort((a, b) => b.length - a.length);

  function cutAtNextStop(value) {
    let v = clean(value);
    if (!v) return "";

    let cutPos = v.length;

    for (const s of stopList) {
      const re = new RegExp(`\\b${escapeRe(s)}\\b`, "i");
      const idx = v.search(re);
      if (idx > 0 && idx < cutPos) cutPos = idx;
    }

    v = clean(v.slice(0, cutPos));
    v = v.replace(/[:\-.,]+$/, "").trim();
    return v;
  }

  function findLineContaining(labelOptions) {
    const opts = (labelOptions || []).map(clean).filter(Boolean);
    for (const opt of opts) {
      const re = new RegExp(`\\b${escapeRe(opt)}\\b`, "i");
      const found = lines.find((ln) => re.test(ln.text));
      if (found) return { opt, line: found.text };
    }
    return { opt: "", line: "" };
  }

  function valueAfterLabel(line, matchedLabel) {
    const re1 = new RegExp(`${escapeRe(matchedLabel)}\\s*[:]\\s*(.+)$`, "i");
    const m1 = line.match(re1);
    if (m1?.[1]) return cutAtNextStop(m1[1]);

    const re2 = new RegExp(`${escapeRe(matchedLabel)}\\s+(.+)$`, "i");
    const m2 = line.match(re2);
    if (m2?.[1]) return cutAtNextStop(m2[1]);

    return "";
  }

  const out = {};

  for (const cfg of fileNameArray) {
    const key = cfg?.key;
    if (!key) continue;

    const possible = cfg?.keyNamePossibility || cfg?.keyNamePossiblity || [];

    const { opt, line } = findLineContaining(possible);
    if (!line || !opt) {
      out[key] = "";
      continue;
    }

    if (key === "clientNo") {
      const m = line.match(/Client\s*No\.?\s*:\s*([0-9]+)/i);
      out[key] = m?.[1] ? clean(m[1]) : valueAfterLabel(line, opt);
      continue;
    }

    if (key === "taxInvoiceNo") {
      const m = line.match(/Tax\s*Invoice\s*No\.?\s*:\s*([A-Z0-9\-\/]+)/i);
      out[key] = m?.[1] ? clean(m[1]) : valueAfterLabel(line, opt);
      continue;
    }

    out[key] = valueAfterLabel(line, opt);
  }

  return out;
}