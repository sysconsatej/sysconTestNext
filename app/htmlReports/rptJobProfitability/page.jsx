"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { useSearchParams } from "next/navigation";
import "./rptJobProfitability.css";
import "@/public/style/reportTheme.css";

import Print from "@/components/Print/page";
import { getUserDetails } from "@/helper/userDetails";
import { decrypt } from "@/helper/security";

export default function RptBlProfitability() {
  const { clientId } = getUserDetails();
  const searchParams = useSearchParams();

  const enquiryModuleRefs = useRef([]); // Print component uses this

  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState([]);
  console.log("akash", data);
  // refs for measuring
  const firstPageHeaderRef = useRef(null);
  const chargeHeaderRef = useRef(null);
  const invoiceHeaderRef = useRef(null);
  const chargeRowRefs = useRef([]); // each item = <tr> ref (flat list)
  const invoiceRowRefs = useRef([]); // each item = <tr> ref (flat list)

  const [pages, setPages] = useState([]); // [{pageNo, chargeRange?, invoiceRange?}]
  const [measureReady, setMeasureReady] = useState(false);

  // ---------- Helpers ----------
  const fmt2 = (v) => {
    const n = Number(v ?? 0);
    if (!Number.isFinite(n)) return "0.00";
    return n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const asText = (v) => (v === null || v === undefined ? "" : String(v));
  const wtUnit = (u) => (u ? String(u) : "");
  const pkgUnit = (p) => (p ? String(p) : "");

  const mmToPx = (mm) => (mm * 96) / 25.4; // 96dpi
  const PAGE_H = mmToPx(210); // A4 landscape height in px
  const PAGE_PADDING = 16;

  const chunkByHeight = (rowHeights, maxHeight) => {
    const out = [];
    let i = 0;
    while (i < rowHeights.length) {
      let used = 0;
      let start = i;

      while (i < rowHeights.length && used + rowHeights[i] <= maxHeight) {
        used += rowHeights[i];
        i++;
      }

      // if a single row is taller than page, force it alone
      if (i === start) i++;

      out.push([start, i]);
    }
    return out;
  };

  // ---------- Derived Data ----------
  const row = data?.[0] || {};
  const hbl0 = row?.hbl?.[0] || {};
  const hblList = row?.hbl || [];
  const containers = row?.container || [];
  const charges = row?.charge || [];
  const invoices = row?.invoice || [];

  const sumIncomeCharges = useMemo(
    () => charges.reduce((a, c) => a + Number(c?.Income ?? 0), 0),
    [charges]
  );
  const sumExpenseCharges = useMemo(
    () => charges.reduce((a, c) => a + Number(c?.Expense ?? 0), 0),
    [charges]
  );
  const totalProfitCharges = useMemo(
    () => sumIncomeCharges - sumExpenseCharges,
    [sumIncomeCharges, sumExpenseCharges]
  );

  // ---------- Effects ----------
  useEffect(() => {
    setReportIds(["Bl Profitability"]);
    const storedReportIds = sessionStorage.getItem("selectedReportIds");
    if (storedReportIds) {
      let r = JSON.parse(storedReportIds);
      r = Array.isArray(r) ? r : [r];
      setReportIds(["Bl Profitability"]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const id = searchParams.get("recordId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");

          const filterCondition = { recordId: id, clientId: clientId };
          const response = await fetch(
            `${baseUrl}/Sql/api/Reports/jobProfitability`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": JSON.parse(token),
              },
              body: JSON.stringify(filterCondition),
            }
          );

          if (!response.ok) throw new Error("Failed to fetch job data");

          const res = await response.json();
          setData(res?.data || []);
        } catch (error) {
          console.error("Error fetching job data:", error);
        }
      }
    };

    if (reportIds?.length > 0) fetchData();
  }, [reportIds]);

  // When data changes, reset refs + pages, then allow measurement pass
  useEffect(() => {
    chargeRowRefs.current = [];
    invoiceRowRefs.current = [];
    setPages([]);
    setMeasureReady(false);

    if (data?.length) {
      // wait a tick so hidden measurement render occurs
      requestAnimationFrame(() => setMeasureReady(true));
    }
  }, [data]);

  // ---------- Pagination Logic (runs after hidden measurement is ready) ----------
  useLayoutEffect(() => {
    if (!measureReady) return;
    if (!data?.length) return;

    // We need rows to exist in DOM once (hidden measurement render fills refs)
    const expectedChargeRows = charges.length * 2; // detail + total
    const expectedInvoiceRows = invoices.length * 2;

    // If empty charges/invoices it should still work
    if (
      expectedChargeRows > 0 &&
      chargeRowRefs.current.filter(Boolean).length < expectedChargeRows
    )
      return;
    if (
      expectedInvoiceRows > 0 &&
      invoiceRowRefs.current.filter(Boolean).length < expectedInvoiceRows
    )
      return;

    requestAnimationFrame(() => {
      const headerH =
        firstPageHeaderRef.current?.getBoundingClientRect().height || 0;

      const availablePage1 = PAGE_H - PAGE_PADDING * 2 - headerH;

      const chargeTheadH =
        chargeHeaderRef.current?.getBoundingClientRect().height || 0;
      const invoiceTheadH =
        invoiceHeaderRef.current?.getBoundingClientRect().height || 0;

      const chargeHeights = chargeRowRefs.current.map(
        (el) => el?.getBoundingClientRect().height || 0
      );
      const invoiceHeights = invoiceRowRefs.current.map(
        (el) => el?.getBoundingClientRect().height || 0
      );

      // Charges:
      const chargePagesPage1 = chunkByHeight(
        chargeHeights,
        Math.max(0, availablePage1 - chargeTheadH)
      );
      const fullPageForCharges = PAGE_H - PAGE_PADDING * 2 - chargeTheadH;

      const chargePagesFinal =
        chargePagesPage1.length <= 1
          ? chargePagesPage1
          : [
              chargePagesPage1[0],
              ...chunkByHeight(
                chargeHeights.slice(chargePagesPage1[0][1]),
                fullPageForCharges
              ).map(([s, e]) => [
                s + chargePagesPage1[0][1],
                e + chargePagesPage1[0][1],
              ]),
            ];

      // Invoices (start on new page):
      const fullPageForInvoices = PAGE_H - PAGE_PADDING * 2 - invoiceTheadH;
      const invoicePages = chunkByHeight(invoiceHeights, fullPageForInvoices);

      const built = [];

      // Page 1 always exists
      built.push({ pageNo: 1, chargeRange: chargePagesFinal?.[0] || null });

      // more charge pages
      for (let p = 1; p < (chargePagesFinal?.length || 0); p++) {
        built.push({
          pageNo: built.length + 1,
          chargeRange: chargePagesFinal[p],
        });
      }

      // invoice pages (start fresh after charges)
      for (let p = 0; p < (invoicePages?.length || 0); p++) {
        built.push({ pageNo: built.length + 1, invoiceRange: invoicePages[p] });
      }

      // If no charges and no invoices, still show just Page 1
      if (built.length === 0) built.push({ pageNo: 1 });

      setPages(built);
    });
  }, [measureReady, data, charges.length, invoices.length]);

  // ---------- Components ----------
  const CompanyImgModule = () => {
    const storedUserData = localStorage.getItem("userData");
    let imageHeader = null;
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      imageHeader = userData?.[0]?.headerLogoPath;
    }

    return (
      <img
        src={imageHeader ? baseUrlNext + imageHeader : ""}
        style={{ width: "100%" }}
        alt="LOGO"
      />
    );
  };

  // ✅ PAGE-1 Header (BL/HBL/Container)
  const HeaderBlock = () => {
    return (
      <>
        <CompanyImgModule />

        <div className="bg-gray-300 p-1 mt-2 mb-4">
          <p
            className="text-center text-black"
            style={{ fontSize: "11px", fontWeight: "bold" }}
          >
            BL Profitability
          </p>
        </div>

        <div className="bg-gray-300 p-1 mt-1 mb-2" style={{ width: "30%" }}>
          <p
            className="text-black"
            style={{ fontSize: "10px", fontWeight: "bold" }}
          >
            BL Details: {asText(row.blNo)}
          </p>
        </div>

        <table
          style={{ width: "100%", borderCollapse: "collapse", color: "black" }}
        >
          <tbody>
            <tr style={{ textAlign: "left" }}>
              <th
                className="border border-black font-bold"
                style={{ width: "10%", fontSize: "9px", paddingLeft: "5px" }}
              >
                Job No :
              </th>
              <th
                className="border border-black"
                style={{
                  width: "23%",
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.jobNo)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ width: "10%", fontSize: "9px", paddingLeft: "5px" }}
              >
                Job Date :
              </th>
              <th
                className="border border-black"
                style={{
                  width: "23%",
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.jobDate)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ width: "10%", fontSize: "9px", paddingLeft: "5px" }}
              >
                Commodity :
              </th>
              <th
                className="border border-black"
                style={{
                  width: "23%",
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.commodity)}
              </th>
            </tr>

            <tr style={{ textAlign: "left" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                MBL No :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.mblNo)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                MBL Date :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.mblDate)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                Shipper :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.shipper)}
              </th>
            </tr>

            <tr style={{ textAlign: "left" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                HBL No :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(hbl0.hblNo || row.blNo)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                HBL Date :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(hbl0.hblDate)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                Consignee :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.consignee)}
              </th>
            </tr>

            <tr style={{ textAlign: "left" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                PLR :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.plr)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                PLR Agent :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.plrAgent)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                Vessel :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.depVesselVoyage)}
              </th>
            </tr>

            <tr style={{ textAlign: "left" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                POL :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.pol)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                POL Agent :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.polAgent)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                Voyage :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.arrVesselVoyage)}
              </th>
            </tr>

            <tr style={{ textAlign: "left" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                POD :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.pod)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                POD Agent :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.podAgent)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                No of Package :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {fmt2(hbl0.noofPackages)} {pkgUnit(hbl0.packageType)}
              </th>
            </tr>

            <tr style={{ textAlign: "left" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                FPD :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.fpd)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                FPD Agent :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.fpdAgent)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                Net Weight :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {hbl0.hblNetWt
                  ? `${fmt2(hbl0.hblNetWt)} ${wtUnit(hbl0.wtUnit)}`
                  : wtUnit(hbl0.wtUnit)}
              </th>
            </tr>

            <tr style={{ textAlign: "left" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                Transshipment :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {asText(row.transPort1)}
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                Transshipment Agent :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              />
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px", paddingLeft: "5px" }}
              >
                Gross Weight :
              </th>
              <th
                className="border border-black"
                style={{
                  fontSize: "9px",
                  fontWeight: "normal",
                  paddingLeft: "5px",
                }}
              >
                {hbl0.hblGrossWt
                  ? `${fmt2(hbl0.hblGrossWt)} ${wtUnit(hbl0.wtUnit)}`
                  : ""}
              </th>
            </tr>
          </tbody>
        </table>

        {/* HBL Details */}
        <div className="bg-gray-300 p-1 mt-2 mb-2" style={{ width: "30%" }}>
          <p
            className="text-black"
            style={{ fontSize: "10px", fontWeight: "bold" }}
          >
            HBL Details :
          </p>
        </div>

        <table
          style={{
            width: "70%",
            borderCollapse: "collapse",
            marginTop: "6px",
            color: "black",
          }}
        >
          <thead>
            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                HBL No
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                HBL Date
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Shipper
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Consignee
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                No. of Packages
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Gross Wt
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Net Wt
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Volume
              </th>
            </tr>
          </thead>
          <tbody>
            {(hblList?.length ? hblList : data)?.map((h, idx) => (
              <tr key={idx} style={{ textAlign: "center" }}>
                <td className="border border-black" style={{ fontSize: "9px" }}>
                  {h?.hblNo || ""}
                </td>
                <td className="border border-black" style={{ fontSize: "9px" }}>
                  {h?.hblDate || ""}
                </td>
                <td
                  className="border border-black"
                  style={{ fontSize: "9px", paddingLeft: "5px" }}
                >
                  {h?.hblshipper || ""}
                </td>
                <td
                  className="border border-black"
                  style={{ fontSize: "9px", paddingLeft: "5px" }}
                >
                  {h?.hblconsignee || ""}
                </td>
                <td className="border border-black" style={{ fontSize: "9px" }}>
                  {fmt2(h?.noofPackages)}{" "}
                  {h?.packageType ? String(h.packageType) : ""}
                </td>
                <td className="border border-black" style={{ fontSize: "9px" }}>
                  {h?.hblGrossWt
                    ? `${fmt2(h.hblGrossWt)} ${
                        h?.wtUnit ? String(h.wtUnit) : ""
                      }`
                    : ""}
                </td>
                <td className="border border-black" style={{ fontSize: "9px" }}>
                  {h?.hblNetWt
                    ? `${fmt2(h.hblNetWt)} ${h?.wtUnit ? String(h.wtUnit) : ""}`
                    : h?.wtUnit
                    ? String(h.wtUnit)
                    : ""}
                </td>
                <td className="border border-black" style={{ fontSize: "9px" }}>
                  {h?.hblVolume !== null && h?.hblVolume !== undefined
                    ? `${fmt2(h.hblVolume)} ${
                        h?.volUnit ? String(h.volUnit) : ""
                      }`.trim()
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Container Details */}
        <div className="bg-gray-300 p-1 mt-2 mb-2" style={{ width: "30%" }}>
          <p
            className="text-black"
            style={{ fontSize: "10px", fontWeight: "bold" }}
          >
            Container Details :
          </p>
        </div>

        <table
          style={{
            width: "70%",
            borderCollapse: "collapse",
            marginTop: "6px",
            color: "black",
          }}
        >
          <thead>
            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                SN No
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Container No
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Size
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Type
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Gross Weight
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Net Weight
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Total No. of Packages
              </th>
            </tr>
          </thead>
          <tbody>
            {containers.length ? (
              containers.map((c, idx) => (
                <tr key={idx} style={{ textAlign: "center" }}>
                  <td
                    className="border border-black"
                    style={{ fontSize: "9px" }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    className="border border-black"
                    style={{ fontSize: "9px" }}
                  >
                    {asText(c.containerNo)}
                  </td>
                  <td
                    className="border border-black"
                    style={{ fontSize: "9px" }}
                  >
                    {asText(c.size)}
                  </td>
                  <td
                    className="border border-black"
                    style={{ fontSize: "9px" }}
                  >
                    {asText(c.type)}
                  </td>
                  <td
                    className="border border-black"
                    style={{ fontSize: "9px" }}
                  >
                    {c.grossWt ? `${fmt2(c.grossWt)} ${wtUnit(c.wtUnit)}` : ""}
                  </td>
                  <td
                    className="border border-black"
                    style={{ fontSize: "9px" }}
                  >
                    {c.netWt
                      ? `${fmt2(c.netWt)} ${wtUnit(c.wtUnit)}`
                      : wtUnit(c.wtUnit)}
                  </td>
                  <td
                    className="border border-black"
                    style={{ fontSize: "9px" }}
                  >
                    {fmt2(c.noofPackages)} {pkgUnit(c.packageType)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-black"
                  colSpan={7}
                  style={{ fontSize: "9px", textAlign: "center" }}
                >
                  No Containers
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </>
    );
  };

  function ChargeTableChunk({ charges, range }) {
    if (!range) return null;
    const [start, end] = range;

    const isNil = (v) => v === null || v === undefined || v === "";

    // ✅ display helper: null/undefined/"" => ""
    const showAmt = (v) => {
      if (isNil(v)) return "";
      const n = Number(v);
      if (!Number.isFinite(n)) return "";
      return fmt2(n);
    };

    // ✅ totals helper: null/invalid => 0 (ONLY for calculations)
    const toNum0 = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    // flatten rows: 2 rows per charge
    const flat = [];
    charges.forEach((c) => {
      flat.push({ type: "detail", c });
      flat.push({ type: "total", c });
    });

    const slice = flat.slice(start, end);

    // ✅ grand totals for all charges (shown only on last page)
    const sumIncomeCharges = charges.reduce((a, x) => a + toNum0(x?.Income), 0);
    const sumExpenseCharges = charges.reduce(
      (a, x) => a + toNum0(x?.Expense),
      0
    );
    const totalProfitCharges = sumIncomeCharges - sumExpenseCharges;

    const isLastChargePage = end >= charges.length * 2;

    return (
      <div>
        <div className="bg-gray-300 p-1 mt-2 mb-2" style={{ width: "30%" }}>
          <p style={{ fontSize: "10px", fontWeight: "bold", color: "black" }}>
            Charge Details :
          </p>
        </div>

        <table
          style={{ width: "70%", borderCollapse: "collapse", color: "black" }}
        >
          <thead>
            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                rowSpan={2}
                style={{ fontSize: "9px" }}
              >
                Name
              </th>
              <th
                className="border border-black font-bold"
                colSpan={2}
                style={{ fontSize: "9px" }}
              >
                Invoice
              </th>
              <th
                className="border border-black font-bold"
                colSpan={2}
                style={{ fontSize: "9px" }}
              >
                Amount
              </th>
              <th
                className="border border-black font-bold"
                rowSpan={2}
                style={{ fontSize: "9px" }}
              >
                Profit / Loss
              </th>
            </tr>
            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                No
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Date
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Income
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Expense
              </th>
            </tr>
          </thead>

          <tbody>
            {slice.map((r, i) => {
              const incN = toNum0(r.c?.Income);
              const expN = toNum0(r.c?.Expense);
              const plN = incN - expN;

              const incDisp = showAmt(r.c?.Income);
              const expDisp = showAmt(r.c?.Expense);

              // ✅ Profit/Loss display: blank if BOTH income & expense are blank
              const plDisp = incDisp === "" && expDisp === "" ? "" : fmt2(plN);

              if (r.type === "detail") {
                return (
                  <tr key={start + i}>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px", paddingLeft: 5 }}
                    >
                      {asText(r.c?.charge)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px", textAlign: "center" }}
                    >
                      {asText(r.c?.invoiceNo)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px", textAlign: "center" }}
                    >
                      {asText(r.c?.invoiceDate)}
                    </td>
                    <td
                      className="border border-black"
                      style={{
                        fontSize: "9px",
                        textAlign: "right",
                        paddingRight: 5,
                      }}
                    >
                      {incDisp}
                    </td>
                    <td
                      className="border border-black"
                      style={{
                        fontSize: "9px",
                        textAlign: "right",
                        paddingRight: 5,
                      }}
                    >
                      {expDisp}
                    </td>
                    <td
                      className="border border-black"
                      style={{
                        fontSize: "9px",
                        textAlign: "right",
                        paddingRight: 5,
                      }}
                    >
                      {/* {plDisp} */}
                    </td>
                  </tr>
                );
              }

              // total row per charge
              return (
                <tr key={start + i}>
                  <td
                    className="border border-black font-bold"
                    colSpan={3}
                    style={{
                      fontSize: "9px",
                      textAlign: "right",
                      paddingRight: 5,
                    }}
                  >
                    Total
                  </td>
                  <td
                    className="border border-black font-bold"
                    style={{
                      fontSize: "9px",
                      textAlign: "right",
                      paddingRight: 5,
                    }}
                  >
                    {incDisp}
                  </td>
                  <td
                    className="border border-black font-bold"
                    style={{
                      fontSize: "9px",
                      textAlign: "right",
                      paddingRight: 5,
                    }}
                  >
                    {expDisp}
                  </td>
                  <td
                    className="border border-black font-bold"
                    style={{
                      fontSize: "9px",
                      textAlign: "right",
                      paddingRight: 5,
                    }}
                  >
                    {plDisp}
                  </td>
                </tr>
              );
            })}

            {/* ✅ Grand Total only on last charge page */}
            {isLastChargePage && charges.length > 0 && (
              <tr>
                <td
                  className="border border-black font-bold"
                  colSpan={3}
                  style={{
                    fontSize: "9px",
                    textAlign: "right",
                    paddingRight: 5,
                  }}
                >
                  Grand Total
                </td>
                <td
                  className="border border-black font-bold"
                  style={{
                    fontSize: "9px",
                    textAlign: "right",
                    paddingRight: 5,
                  }}
                >
                  {fmt2(sumIncomeCharges)}
                </td>
                <td
                  className="border border-black font-bold"
                  style={{
                    fontSize: "9px",
                    textAlign: "right",
                    paddingRight: 5,
                  }}
                >
                  {fmt2(sumExpenseCharges)}
                </td>
                <td
                  className="border border-black font-bold"
                  style={{
                    fontSize: "9px",
                    textAlign: "right",
                    paddingRight: 5,
                  }}
                >
                  {fmt2(totalProfitCharges)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function InvoiceTableChunk({ invoices, range }) {
    if (!range) return null;
    const [start, end] = range;

    const slice = invoices.slice(start, end);

    const isNil = (v) => v === null || v === undefined || v === "";

    // ✅ display helper: null/undefined/"" => ""
    const showAmt = (v) => {
      if (isNil(v)) return "";
      const n = Number(v);
      if (!Number.isFinite(n)) return "";
      return fmt2(n);
    };

    // ✅ totals should still treat null as 0 (ONLY for totals)
    const toNum0 = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const totalIncomeAll = invoices.reduce((a, x) => a + toNum0(x?.income), 0);
    const totalExpenseAll = invoices.reduce(
      (a, x) => a + toNum0(x?.expense),
      0
    );
    const totalPLAll = totalIncomeAll - totalExpenseAll;

    const isLastInvoicePage = end >= invoices.length;

    return (
      <div>
        <div className="bg-gray-300 p-1 mt-2 mb-2" style={{ width: "30%" }}>
          <p style={{ fontSize: "10px", fontWeight: "bold", color: "black" }}>
            Invoice Details :
          </p>
        </div>

        <table
          style={{ width: "70%", borderCollapse: "collapse", color: "black" }}
        >
          <thead>
            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                colSpan={3}
                style={{ fontSize: "9px" }}
              >
                Invoice
              </th>
              <th
                className="border border-black font-bold"
                colSpan={2}
                style={{ fontSize: "9px" }}
              >
                Amount
              </th>
              <th
                className="border border-black font-bold"
                rowSpan={2}
                style={{ fontSize: "9px" }}
              >
                Profit / Loss
              </th>
            </tr>

            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                No
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Date
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Billing Party
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Income
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Expense
              </th>
            </tr>
          </thead>

          <tbody>
            {slice.map((inv, i) => {
              const incN = toNum0(inv?.income);
              const expN = toNum0(inv?.expense);
              const plN = incN - expN;

              const incDisp = showAmt(inv?.income);
              const expDisp = showAmt(inv?.expense);

              // ✅ Profit/Loss display: blank if BOTH income & expense are blank
              const plDisp = incDisp === "" && expDisp === "" ? "" : fmt2(plN);

              return (
                <tr key={start + i}>
                  <td
                    className="border border-black"
                    style={{ fontSize: "9px", textAlign: "center" }}
                  >
                    {asText(inv?.invoiceNo)}
                  </td>
                  <td
                    className="border border-black"
                    style={{ fontSize: "9px", textAlign: "center" }}
                  >
                    {asText(inv?.invoiceDate)}
                  </td>
                  <td
                    className="border border-black"
                    style={{
                      fontSize: "9px",
                      paddingLeft: "5px",
                      lineHeight: "12px",
                    }}
                  >
                    <div>
                      {charges?.[0]?.charge ? `${charges[0].charge}` : ""}
                    </div>
                    <div>{asText(inv?.billingParty)} - DR</div>
                  </td>

                  <td
                    className="border border-black"
                    style={{
                      fontSize: "9px",
                      textAlign: "right",
                      paddingRight: "5px",
                    }}
                  >
                    {incDisp}
                  </td>
                  <td
                    className="border border-black"
                    style={{
                      fontSize: "9px",
                      textAlign: "right",
                      paddingRight: "5px",
                    }}
                  >
                    {expDisp}
                  </td>
                  <td
                    className="border border-black"
                    style={{
                      fontSize: "9px",
                      textAlign: "right",
                      paddingRight: "5px",
                    }}
                  >
                    {/* {plDisp} */}
                  </td>
                </tr>
              );
            })}

            {/* ✅ Grand Total only on last invoice page */}
            {isLastInvoicePage && invoices.length > 0 && (
              <tr>
                <td
                  className="border border-black font-bold"
                  colSpan={3}
                  style={{
                    fontSize: "9px",
                    textAlign: "right",
                    paddingRight: "5px",
                  }}
                >
                  Grand Total
                </td>
                <td
                  className="border border-black font-bold"
                  style={{
                    fontSize: "9px",
                    textAlign: "right",
                    paddingRight: "5px",
                  }}
                >
                  {fmt2(totalIncomeAll)}
                </td>
                <td
                  className="border border-black font-bold"
                  style={{
                    fontSize: "9px",
                    textAlign: "right",
                    paddingRight: "5px",
                  }}
                >
                  {fmt2(totalExpenseAll)}
                </td>
                <td
                  className="border border-black font-bold"
                  style={{
                    fontSize: "9px",
                    textAlign: "right",
                    paddingRight: "5px",
                  }}
                >
                  {fmt2(totalPLAll)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  // ✅ Hidden measurement render (fills refs with real heights)
  const MeasurementLayer = () => {
    // flat rows counts
    const chargeFlatCount = charges.length * 2;
    const invoiceFlatCount = invoices.length * 2;

    return (
      <div
        style={{
          position: "absolute",
          left: "-99999px",
          top: 0,
          width: "297mm",
          padding: `${PAGE_PADDING}px`,
          boxSizing: "border-box",
          visibility: "hidden",
        }}
      >
        <div ref={firstPageHeaderRef}>
          <HeaderBlock />
        </div>

        {/* Charge measure table */}
        <table
          style={{ width: "70%", borderCollapse: "collapse", color: "black" }}
        >
          <thead ref={chargeHeaderRef}>
            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                rowSpan={2}
                style={{ fontSize: "9px" }}
              >
                Name
              </th>
              <th
                className="border border-black font-bold"
                colSpan={2}
                style={{ fontSize: "9px" }}
              >
                Invoice
              </th>
              <th
                className="border border-black font-bold"
                colSpan={2}
                style={{ fontSize: "9px" }}
              >
                Amount
              </th>
              <th
                className="border border-black font-bold"
                rowSpan={2}
                style={{ fontSize: "9px" }}
              >
                Profit / Loss
              </th>
            </tr>
            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                No
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Date
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Income
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Expense
              </th>
            </tr>
          </thead>
          <tbody>
            {chargeFlatCount === 0 ? (
              <tr ref={(el) => (chargeRowRefs.current[0] = el)}>
                <td
                  className="border border-black"
                  colSpan={6}
                  style={{ fontSize: "9px" }}
                >
                  {" "}
                </td>
              </tr>
            ) : (
              charges.flatMap((c, idx) => {
                const base = idx * 2;
                const inc = Number(c?.Income ?? 0);
                const exp = Number(c?.Expense ?? 0);
                const pl = inc - exp;

                return [
                  <tr
                    key={`c-d-${idx}`}
                    ref={(el) => (chargeRowRefs.current[base] = el)}
                  >
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {asText(c?.charge)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {asText(c?.invoiceNo)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {asText(c?.invoiceDate)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(inc)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(exp)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    />
                  </tr>,
                  <tr
                    key={`c-t-${idx}`}
                    ref={(el) => (chargeRowRefs.current[base + 1] = el)}
                  >
                    <td
                      className="border border-black"
                      colSpan={3}
                      style={{ fontSize: "9px" }}
                    >
                      Total
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(inc)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(exp)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(pl)}
                    </td>
                  </tr>,
                ];
              })
            )}
          </tbody>
        </table>

        {/* Invoice measure table */}
        <table
          style={{
            width: "70%",
            borderCollapse: "collapse",
            color: "black",
            marginTop: "10px",
          }}
        >
          <thead ref={invoiceHeaderRef}>
            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                colSpan={3}
                style={{ fontSize: "9px" }}
              >
                Invoice
              </th>
              <th
                className="border border-black font-bold"
                colSpan={2}
                style={{ fontSize: "9px" }}
              >
                Amount
              </th>
              <th
                className="border border-black font-bold"
                rowSpan={2}
                style={{ fontSize: "9px" }}
              >
                Profit / Loss
              </th>
            </tr>
            <tr style={{ textAlign: "center" }}>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                No
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Date
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Billing Party
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Income
              </th>
              <th
                className="border border-black font-bold"
                style={{ fontSize: "9px" }}
              >
                Expense
              </th>
            </tr>
          </thead>
          <tbody>
            {invoiceFlatCount === 0 ? (
              <tr ref={(el) => (invoiceRowRefs.current[0] = el)}>
                <td
                  className="border border-black"
                  colSpan={6}
                  style={{ fontSize: "9px" }}
                >
                  {" "}
                </td>
              </tr>
            ) : (
              invoices.flatMap((inv, idx) => {
                const base = idx * 2;
                const inc = Number(inv?.income ?? 0);
                const exp = Number(inv?.expense ?? 0);
                const pl = inc - exp;

                return [
                  <tr
                    key={`i-d-${idx}`}
                    ref={(el) => (invoiceRowRefs.current[base] = el)}
                  >
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {asText(inv?.invoiceNo)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {asText(inv?.invoiceDate)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {asText(inv?.billingParty)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(inc)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(exp)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    />
                  </tr>,
                  <tr
                    key={`i-t-${idx}`}
                    ref={(el) => (invoiceRowRefs.current[base + 1] = el)}
                  >
                    <td
                      className="border border-black"
                      colSpan={3}
                      style={{ fontSize: "9px" }}
                    >
                      Total
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(inc)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(exp)}
                    </td>
                    <td
                      className="border border-black"
                      style={{ fontSize: "9px" }}
                    >
                      {fmt2(pl)}
                    </td>
                  </tr>,
                ];
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ---------- UI ----------
  return (
    <main className="bg-gray-300 min-h-screen p-4">
      <Print
        enquiryModuleRefs={enquiryModuleRefs}
        reportIds={reportIds}
        printOrientation="landscape"
      />

      <div>
        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Bl Profitability":
              return (
                <div
                  key={reportId}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  className="w-full flex flex-col items-center gap-6"
                >
                  {/* ✅ Hidden measurement pass */}
                  {data?.length > 0 && <MeasurementLayer />}

                  {/* ✅ Visible paginated pages */}
                  {pages.map((p, pIdx) => (
                    <div
                      key={pIdx}
                      className="bg-white  print:shadow-none print:border-0"
                      style={{
                        width: "297mm",
                        height: "210mm",
                        padding: `${PAGE_PADDING}px`,
                        boxSizing: "border-box",
                        overflow: "hidden",
                      }}
                    >
                      {/* Page-1 header */}
                      {p.pageNo === 1 && <HeaderBlock />}

                      {/* Charges chunk */}
                      {p.chargeRange && (
                        <ChargeTableChunk
                          charges={charges}
                          range={p.chargeRange}
                        />
                      )}

                      {/* Invoices chunk */}
                      {p.invoiceRange && (
                        <InvoiceTableChunk
                          invoices={invoices}
                          range={p.invoiceRange}
                        />
                      )}
                    </div>
                  ))}
                </div>
              );

            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}
