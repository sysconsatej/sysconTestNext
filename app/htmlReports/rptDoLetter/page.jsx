"use client";
/* eslint-disable */
import React, { useEffect, useState, useMemo, useRef } from "react";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // kept as-is per your original code
const baseUrlSql = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports; // kept as-is per your original code
import { useSearchParams, usePathname } from "next/navigation";
import QRCode from "qrcode";
import { decrypt } from "@/helper/security";
import "jspdf-autotable";
import Print from "@/components/PrintDo/page";
import "@/public/style/reportTheme.css";
import { getUserDetails } from "@/helper/userDetails";
import "./rptDoLetter.css";
import moment from "moment";
import { encryptText, decryptText } from "@/helper/cryptoUrl";

export default function rptDoLetter() {
  // You had this variable; not used in your fetches, leaving fetch baseUrl unchanged intentionally
  const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;

  const searchParams = useSearchParams();
  const pathname = usePathname();

  // ----- RAW PARAMS (as provided in URL)
  const recordIdParam = searchParams.get("recordId"); // plain id (fallback)
  const ridParam = searchParams.get("rid"); // encrypted id (preferred)
  const reportId = searchParams.get("reportId");
  const reportName = searchParams.get("reportName");
  const displayButton = searchParams.get("hb");
  const isPublic = (pathname || "").includes("/htmlReports/rptDoLetter");

  // ----- STATE
  const [resolvedRecordId, setResolvedRecordId] = useState(null); // <- use this everywhere
  const [encRid, setEncRid] = useState(""); // for QR/link
  const [reportIds, setReportIds] = useState([]);
  const [doReportName, setDoReportName] = useState([]);
  const [data, setData] = useState([]);
  const [getDisplayButton, setDisplayButton] = useState(true);
  const [userName, setUserName] = useState(null);
  const enquiryModuleRefs = useRef([]);
  enquiryModuleRefs.current = []; // do not remove this line
  const { clientId } = getUserDetails();

  const chunkSize = 6;
  const deliveryOrderKenya = 12;
  const EmptyOffLoadingLetterSize = 6;
  const SealCuttingLetterSize = 14;
  const BondLetterSize = 12;
  const CMCLetterSize = 7;
  const EmptyContainerOffLoadingLetterSize = 22;
  const EmptyContainerReturnNotification = 20;
  const SaudiDeliveryOrderSize = 6;
  const [qrUrl, setQrUrl] = useState("");

  // DEMO token (kept from your code)
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjM5LCJ1c2VyTmFtZSI6InJvaGl0U0xTS0BzeXNjb25pbmZvdGVjaC5jb20iLCJpYXQiOjE3NjA0NDExMzgxNzUsIm51bWJlckZvcm1hdCI6ImMiLCJjbGllbnRDb2RlIjoiTkNMUCIsImNsaWVudElkIjoxNSwiZXhwIjoxNzYwNDQ4MzM4MTc1fQ.yrDgdnPff0MMVWU1tavzJeG1_Dx9pkBWkU12H0Jk47c";
  const fetchToken = localStorage.getItem("token");
  // IMPORTANT: use NEXT_PUBLIC_* so it exists on client
  const SECRET = process.env.NEXT_PUBLIC_AES_TOKEN || "fallback-secret";

  // ------------------------------------------------------------------
  // Seed localStorage token (your original behavior)
  useEffect(() => {
    if (fetchToken) return;
    try {
      {
        clientId === 15 && localStorage.setItem("token", JSON.stringify(token));
      }
    } catch { }
  }, []);

  // Hide print if hb=cfm (kept your original rule)
  useEffect(() => {
    if (displayButton === "cfm") {
      setDisplayButton(false);
    }
  }, [displayButton]);

  // ------------------------------------------------------------------
  // 1) Resolve record id from ?rid (decrypt) OR fallback to ?recordId
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (ridParam) {
          const id = await decryptText(ridParam, SECRET);
          if (!cancelled) setResolvedRecordId(id);
        } else if (recordIdParam) {
          if (!cancelled) setResolvedRecordId(recordIdParam);
        } else {
          if (!cancelled) setResolvedRecordId(null);
        }
      } catch (e) {
        console.error("Failed to decrypt rid:", e);
        if (!cancelled) setResolvedRecordId(recordIdParam ?? null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ridParam, recordIdParam, SECRET]);

  // 2) Compute encrypted rid whenever we have a resolved id (for QR/link)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!resolvedRecordId) {
        setEncRid("");
        return;
      }
      try {
        const e = await encryptText(String(resolvedRecordId), SECRET);
        if (!cancelled) setEncRid(e);
      } catch {
        if (!cancelled) setEncRid("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedRecordId, SECRET]);

  // ------------------------------------------------------------------
  // 3) Fetch DO data using resolvedRecordId (replaces your old recordId dependency)
  useEffect(() => {
    if (!resolvedRecordId) return;

    (async () => {
      try {
        const headers = { "Content-Type": "application/json" };

        // Only try token if NOT public
        if (!isPublic) {
          try {
            const tk = localStorage.getItem("token");
            if (tk) headers["x-access-token"] = JSON.parse(tk);
          } catch { }
        }

        const body = { id: resolvedRecordId }; // minimal for public route

        const res = await fetch(`${baseUrl}/Sql/api/Reports/blDataForDO`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`Fetch DO failed: ${res.status}`);
        const json = await res.json();
        setData(Array.isArray(json?.data) ? json.data : []);
        if (Array.isArray(json?.data) && json.data.length > 0) {
          const row = json.data[0] ?? {};
          const flag = (row.mblHblFlag ?? "").toUpperCase();

          const toArray = (v) => (Array.isArray(v) ? v : [v].filter(Boolean));

          const nameArr =
            flag === "HBL"
              ? [`${(row.hblNo ?? "").toString().trim() || ""}-Letters`]
              : flag === "MBL"
                ? [`${(row.mblNo ?? "").toString().trim() || ""}-Letters`]
                : toArray(reportIds);

          setDoReportName(nameArr);
        }
      } catch (e) {
        console.error("Error fetching DO data:", e);
        setData([]);
      }
    })();
  }, [resolvedRecordId, isPublic]);

  // ------------------------------------------------------------------
  // 4) QR/link: now send encrypted rid (not plain recordId). Keep hb=cfm as you had.
  const redirectUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const u = new URL(
      "/htmlReports/rptDoLetter",
      origin || "http://localhost:3001"
    );
    if (encRid) u.searchParams.set("rid", encRid); // 🔐 encrypted id
    if (reportId)
      u.searchParams.set("reportName", "Delivery_Order_verification");
    if (reportId) u.searchParams.set("hb", "cfm"); // keep your original flag
    return u.toString();
  }, [encRid, reportId, reportName]);

  // 5) Generate QR
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const url = await QRCode.toDataURL(redirectUrl, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 192,
        });
        if (active) setQrUrl(url);
      } catch (e) {
        console.error("QR generation failed:", e);
      }
    })();
    return () => {
      active = false;
    };
  }, [redirectUrl]);

  // ------------------------------------------------------------------
  // 6) Normalize reportIds (kept as-is, with +/underscore fixing)
  useEffect(() => {
    const normalize = (val) => {
      const str = String(val ?? "");
      const plusFixed = str.replace(/\+/g, " ");
      let decoded = plusFixed;
      try {
        decoded = decodeURIComponent(plusFixed);
      } catch {
        /* ignore */
      }
      return decoded.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    };

    const stored = sessionStorage.getItem("selectedReportIds");
    const fallback = normalize(reportName);
    const raw =
      stored && stored !== "null" && stored !== "undefined" ? stored : fallback;

    if (!raw) {
      console.log("No Report IDs found in sessionStorage or reportName");
      return;
    }

    let list;
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed)
        ? parsed.map(normalize)
        : [normalize(parsed)];
    } catch {
      list = [normalize(raw)];
    }

    const finalIds = [...new Set(list.filter(Boolean))];
    setReportIds(finalIds);
  }, [reportName]);

  // ------------------------------------------------------------------
  // 7) Your secondary fetch (token + clientId) after reportIds known.
  //    Uses resolvedRecordId instead of reading recordId again.
  useEffect(() => {
    const fetchdata = async () => {
      if (!resolvedRecordId) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        const requestBody = {
          id: resolvedRecordId,
          clientId: clientId,
        };
        const response = await fetch(`${baseUrl}/Sql/api/Reports/blDataForDO`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": JSON.parse(token),
          },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) throw new Error("Failed to fetch DO data");
        const data = await response.json();
        setData(Array.isArray(data?.data) ? data.data : []);

        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const decryptedData = decrypt(storedUserData);
          const userData = JSON.parse(decryptedData);
          setUserName(userData?.[0]?.name ?? null);
        }
      } catch (error) {
        console.error("Error fetching job data:", error);
      }
    };

    if (reportIds.length > 0) {
      fetchdata();
    }
  }, [reportIds, resolvedRecordId, clientId]);

  console.log("Do_Data", data);

  function formatDateToYMD(dateStr) {
    if (!dateStr) return ""; // Handles null, undefined, empty string

    const date = new Date(dateStr);

    if (isNaN(date)) return ""; // Handles invalid date strings

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`; // Returns "dd/mm/yyyy"
  }

  function formatDateToYMDMonths(dateStr) {
    if (!dateStr) return ""; // Handles null, undefined, empty string

    const date = new Date(dateStr);
    if (isNaN(date)) return ""; // Handles invalid date strings

    const day = String(date.getDate()).padStart(2, "0");

    // Month names
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()]; // 0-indexed

    const year = date.getFullYear();

    return `${day}-${month}-${year}`; // e.g. "12/Sep/2025"
  }

  const getValidTillDate = (jobDate, croValidDays) => {
    if (!jobDate || croValidDays == null) {
      console.warn("Missing jobDate or croValidDays");
      return "";
    }
    const days = parseInt(croValidDays);
    if (isNaN(days) || days === 0) {
      return moment(jobDate).format("DD/MM/YYYY"); // format for consistency
    }
    const momentDate = moment(jobDate); // no format string needed
    const finalDate = momentDate.add(days - 1, "days").format("DD/MM/YYYY");
    return finalDate;
  };

  const getValidTillDateNew = (jobDate, croValidDays) => {
    if (!jobDate || croValidDays == null) {
      console.warn("Missing jobDate or croValidDays");
      return "";
    }

    const days = parseInt(croValidDays, 10);
    const m = moment(jobDate);

    if (!m.isValid()) return "";

    // If days is invalid or 0, return same date in required format
    if (isNaN(days) || days === 0) {
      return m.format("DD-MMM-YYYY"); // e.g., 12-Nov-2025
    }

    return m.add(days - 1, "days").format("DD-MMM-YYYY");
  };

  const CompanyImgModule = () => {
    const storedUserData = localStorage.getItem("userData");
    let imageHeader = null;
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      imageHeader = userData[0]?.headerLogoPath;
    }
    return (
      <img
        src={imageHeader ? baseUrlNext + imageHeader : ""}
        style={{ width: "100%" }}
        alt="LOGO"
      />
    );
  };

  const CompanyImgFooterModule = () => {
    const storedUserData = localStorage.getItem("userData");
    let imageFooter = null;
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      imageFooter = userData[0]?.footerLogoPath;
    }
    return (
      <img
        src={imageFooter ? baseUrlNext + imageFooter : ""}
        style={{ width: "100%" }}
        alt="Footer"
      />
    );
  };

  const containers =
    data[0]?.tblBlContainer.map((item, i) => ({
      ...item,
      containerNoIndex: i,
    })) || [];
  const chunkArray = (arr, size) => {
    if (!Array.isArray(arr) || size <= 0) return [arr || []];
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };
  const chunks =
    chunkSize > 0 ? chunkArray(containers, chunkSize) : [containers];

  const deliveryOrderKenyaChunks =
    deliveryOrderKenya > 0
      ? chunkArray(containers, deliveryOrderKenya)
      : [containers];

  const EmptyOffLoadingLetterSizeChunks =
    EmptyOffLoadingLetterSize > 0
      ? chunkArray(containers, EmptyOffLoadingLetterSize)
      : [containers];

  const SealCuttingLetterSizeChunks =
    SealCuttingLetterSize > 0
      ? chunkArray(containers, SealCuttingLetterSize)
      : [containers];

  const BondLetterSizeChunks =
    BondLetterSize > 0 ? chunkArray(containers, BondLetterSize) : [containers];

  const CMCLetterSizeChunks =
    CMCLetterSize > 0 ? chunkArray(containers, CMCLetterSize) : [containers];

  const EmptyContainerOffLoadingLetterChunks =
    EmptyContainerOffLoadingLetterSize > 0
      ? chunkArray(containers, EmptyContainerOffLoadingLetterSize)
      : [containers];

  const EmptyContainerReturnNotificationChunks =
    EmptyContainerReturnNotification > 0
      ? chunkArray(containers, EmptyContainerReturnNotification)
      : [containers];

  const SaudiDeliveryOrderSizeChunks =
    SaudiDeliveryOrderSize > 0
      ? chunkArray(containers, SaudiDeliveryOrderSize)
      : [containers];

  // Calculate totals
  const totalGrossWt = containers.reduce(
    (sum, item) => sum + (parseFloat(item.grossWt) || 0),
    0
  );
  const totalPackages = containers.reduce(
    (sum, item) => sum + (parseFloat(item.noOfPackages) || 0),
    0
  );
  const weightUnit = containers[0]?.weightUnitCode || "";
  const packageUnit = containers[0]?.packageCode || "";

  const ImgSign = () => {

    return (
      <img
        src={baseUrlNext + "/uploads/sign1.jpg"}
        width="20%"
        height="15%"
      ></img>
    );
  };

  const DoLetter = (input, i) => {
    const containers = Array.isArray(input)
      ? input
      : Array.isArray(input?.containers)
        ? input.containers
        : []; // 👈 safe fallback

    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
        </div>
        {/* Header */}
        <div className="mx-auto text-black">
          <h1 className="text-black font-bold text-sm text-center underline">
            {data[0]?.destuffName
              ? `Delivery Order / ${data[0].destuffName}`
              : "Delivery Order"}
          </h1>
          <div className="flex items-end justify-end">
            <p
              className="text-black font-bold mr-2"
              style={{ fontSize: "10px" }}
            >
              D/O No:
            </p>
            <p
              className="text-black"
              style={{ fontSize: "10px", minWidth: "100px" }}
            >
              {data[0]?.doNo || ""}
            </p>
          </div>
          <div className="flex justify-between w-full">
            <div className="flex items-end justify-start w-[40%]">
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                To, <br />
                The Manager,
                <br />
                {data[0]?.nominatedArea || ""}
                <br />
                {data[0]?.nominatedAreaAddress || ""}
                <br />
              </p>
            </div>
            <div className="flex items-start justify-end">
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                Date :
              </p>
              <p
                className="text-black"
                style={{ fontSize: "10px", minWidth: "100px" }}
              >
                {formatDateToYMDMonths(data[0]?.doDate)}
              </p>
            </div>
          </div>
        </div>
        {/* Main Grid */}
        <table className="w-full table-fixed border border-black border-collapse mt-4">
          <tbody>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  VESSEL/VOY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  PORT/ICD ARR DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMDMonths(data[0]?.arrivalDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  PLACE OF ORIGIN :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.plr || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  LOAD PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pol || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  DISCH PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pod || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  FINAL DEST :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.fpd || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.blNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMDMonths(data[0]?.blDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.igmNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMDMonths(data[0]?.igmDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ITEM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.lineNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  DESTUFFING TYPE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.destuffName || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  CONSIGNEE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.consigneeText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.consigneeAddress || ""}
                  </span>
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  NOTIFY PARTY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.notifyPartyText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.notifyPartyAddress || ""}
                  </span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        {/* Short Description */}
        <p className="text-black mt-2" style={{ fontSize: "10px" }}>
          As per Consignees request please deliver to CHA{" "}
          {data[0]?.customBrokerName || ""}. The following packages. It is
          required to take a proper receipt for the same.
        </p>

        <table className="w-full mt-2 table-fixed border border-black border-collapse">
          <thead>
            <tr>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Container No.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Size/Type
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Status
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Gross Wt.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  No. of Packages
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Seal No.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  CBM
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Valid Date
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {containers.length > 0 &&
              containers.map((item, index) => (
                <tr key={index}>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal"
                      style={{ fontSize: "9px" }}
                    >
                      {item.containerNo || ""}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.size || "") + "/" + (item.type || "")}
                    </p>
                  </td>
                  <td className="w-1/8 border font-normal border-black p-1">
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {item.containerStatus || ""}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.grossWt || "") + " " + (item.weightUnitCode || "")}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {item.noOfPackages || ""} {item.packageCode || ""}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-right"
                      style={{ fontSize: "9px" }}
                    >
                      {item.customSealNo || ""}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal"
                      style={{ fontSize: "9px" }}
                    >
                      {item.volume || ""} {item.volumeUnitCode || ""}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal"
                      style={{ fontSize: "9px" }}
                    >
                      {/* {getValidTillDate(
                        data?.[0]?.arrivalDate,
                        data?.[0]?.destinationFreeDays
                      )} */}
                      {formatDateToYMDMonths(data?.[0]?.doValidDate)}
                    </p>
                  </td>
                </tr>
              ))}

            {/* Total Row */}
            <tr>
              <td
                colSpan={3}
                className="border border-black p-1 font-bold text-right"
                style={{ fontSize: "9px" }}
              >
                TOTAL
              </td>
              <td
                className="border border-black p-1 font-bold"
                style={{ fontSize: "9px" }}
              >
                {totalGrossWt.toFixed(2)} {weightUnit}
              </td>
              <td
                className="border border-black p-1 font-bold"
                style={{ fontSize: "9px" }}
              >
                {totalPackages} {packageUnit}
              </td>
              <td colSpan={3} className="border border-black p-1"></td>
            </tr>
          </tbody>
        </table>

        {/* No of Free Days */}
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "15%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              No of Free Days :
            </p>
          </div>
          <div style={{ width: "85%" }}>
            <p className="text-black" style={{ fontSize: "10px" }}>
              {data[0]?.destinationFreeDays || ""}
            </p>
          </div>
        </div>
        {/* Free Days Upto */}
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "15%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Free Days Upto :
            </p>
          </div>
          <div style={{ width: "85%" }}>
            <p className="text-black" style={{ fontSize: "10px" }}>
              {formatDateToYMDMonths(data[0]?.freeDaysUpto)}
            </p>
          </div>
        </div>
        {/* Description  */}
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "15%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Description :
            </p>
          </div>
          <div style={{ width: "85%" }}>
            <p className="text-black" style={{ fontSize: "10px" }}>
              {data[0]?.goodsDesc || ""}
            </p>
          </div>
        </div>
        {/* Other Details */}
        <div className="mt-2">
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            Dear Sir
          </p>
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            Please deliver the above mentioned container/s to the above
            mentioned consignee / notify.
          </p>
          <div className="flex mt-1" style={{ width: "100%" }}>
            <div style={{ width: "12%" }}>
              <p className="text-black font-bold" style={{ fontSize: "10px" }}>
                Marks & No. :
              </p>
            </div>
            <div style={{ width: "88%" }}>
              <p className="text-black" style={{ fontSize: "10px" }}>
                {data[0]?.marksNos || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <footer
          style={{
            bottom: "10px",
            width: "100%",
          }}
        >
          <div>
            <p
              className="text-black font-bold mt-2"
              style={{ fontSize: "10px" }}
            >
              Thanking You, For {data[0]?.company} <br /> As Agent
            </p>
            <p style={{ width: "80%", height: "100%" }}>
              <ImgSign />
            </p>

            {/* <p className="text-black mt-14" style={{ fontSize: "10px" }}>
            Issued By: admin
          </p> */}
            {/* <p className="text-black" style={{ fontSize: "10px" }}>
            Please note this is a computer-generated document, hence no
            signature and stamp required.
          </p> */}
          </div>
        </footer>
      </div>
    );
  };

  const SurveyLetter = (input, i) => {
    const containers = Array.isArray(input)
      ? input
      : Array.isArray(input?.containers)
        ? input.containers
        : []; // 👈 safe fallback

    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
        </div>
        {/* Header */}
        <div className="mx-auto text-black">
          <h1 className="text-black font-bold text-sm text-center underline">
            Survey Letter
          </h1>
          <div style={{ width: "100%" }} className="flex justify-between">
            <div
              style={{ width: "40%" }}
              className="flex items-end justify-start w-[40%]"
            >
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                To, <br />
                The Manager,
                <br />
                {data[0]?.surveyor || ""}
                <br />
                {data[0]?.surveyorAddress || ""}
                {/* M/s. Sai Marine Surveyors
                <br />
                Plot no.06, Sec.11, Behind Anchorage Bldg., NMSEZ Commercial
                Complex, 'C' Wing, 1st Floor, Off.No.105, Township,Navi Mumbai -
                400 707 Ctc : Mr. NIVRUTI 7387735043 / 022 6523 1850 / 5
                <br /> */}
              </p>
            </div>
            <div className="flex items-start justify-end">
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                Date :
              </p>
              <p
                className="text-black"
                style={{ fontSize: "10px", minWidth: "100px" }}
              >
                {formatDateToYMDMonths(data[0]?.doDate)}
              </p>
            </div>
          </div>
        </div>
        {/* Main Grid */}
        <table className="w-full table-fixed border border-black border-collapse mt-4">
          <tbody>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  VESSEL/VOY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ARRIVAL DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMDMonths(data[0]?.arrivalDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  PLACE OF ORIGIN :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.plr || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  LOAD PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pol || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  DISCH PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pod || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  FINAL DEST :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.fpd || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.blNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMDMonths(data[0]?.blDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.igmNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMDMonths(data[0]?.igmDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ITEM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.lineNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  TERMINAL :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.berthName || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  CONSIGNEE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.consigneeText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.consigneeAddress || ""}
                  </span>
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  NOTIFY PARTY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.notifyPartyText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.notifyPartyAddress || ""}
                  </span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        {/* Short Description */}
        <p className="text-black mt-2" style={{ fontSize: "10px" }}>
          Kindly arrange to survey the below container(s) prior to taking
          delivery of laden container(s) from {data[0]?.surveyor || ""} to check
          for the external condition of the container(s).
        </p>
        {/* Container Details Grid */}
        <table className="w-full mt-4 table-fixed border border-black border-collapse">
          <thead>
            <tr>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Container No.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Size/Type
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Status
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Gross Wt.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  No. of Packages
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Seal No.
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {containers.length > 0 &&
              containers.map((item, index) => (
                <tr key={index}>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal"
                      style={{ fontSize: "9px" }}
                    >
                      {item.containerNo || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.size || "") + "/" + (item.type || "")}
                    </p>
                  </th>
                  <th className="w-1/8 border font-normal border-black p-1">
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {item.containerStatus || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.grossWt || "") + "" + (item.weightUnitCode || "")}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {item.noOfPackages || ""} {item.packageCode || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-right"
                      style={{ fontSize: "9px" }}
                    >
                      {item.customSealNo || ""}
                    </p>
                  </th>
                </tr>
              ))}
          </tbody>
        </table>
        {/* Description  */}
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "15%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Description :
            </p>
          </div>
          <div style={{ width: "85%" }}>
            <p className="text-black" style={{ fontSize: "10px" }}>
              {data[0]?.goodsDesc || ""}
            </p>
          </div>
          {/* Marks & Nos: */}
        </div>
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "15%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Marks & Nos :
            </p>
          </div>
          <div style={{ width: "85%" }}>
            <p className="text-black" style={{ fontSize: "10px" }}>
              {data[0]?.marksNos || ""}
            </p>
          </div>
        </div>
        {/* Sticky Footer */}
        <footer
          style={{
            bottom: "10px",
            width: "100%",
          }}
        >
          <div>
            <p
              className="text-black font-bold mt-2"
              style={{ fontSize: "10px" }}
            >
              Thanking You, <br /> For {data[0]?.company}
            </p>
            <p style={{ width: "80%", height: "100%" }}>
              <ImgSign />
            </p>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Authorize Signatory
            </p>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              C.C TO M/s M/S {data[0]?.consignee}
            </p>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              C.C. Deport
            </p>
            {/* <p className="text-black mt-14" style={{ fontSize: "10px" }}>
            Issued By: admin
          </p> */}
          </div>
        </footer>
        {/* <div className="fixed bottom-0">
          <div className="mx-auto">
            <CompanyImgFooterModule />
          </div>
        </div> */}
      </div>
    );
  };

  const EmptyOffLoadingLetter = (containers) => (
    <div>
      <div className="mx-auto">
        <CompanyImgModule />
      </div>
      {/* Header */}
      <div className="mx-auto text-black">
        <h1 className="text-black font-bold text-sm text-center underline">
          <u>EMPTY OFF LOADING LETTER</u>
        </h1>
        <div className="flex items-end justify-end">
          <p
            className="text-black"
            style={{ fontSize: "10px", minWidth: "100px" }}
          ></p>
        </div>
        <div className="flex justify-between w-full">
          <div className="flex items-end justify-start w-[40%]">
            <p
              className="text-black font-bold mr-2"
              style={{ fontSize: "10px" }}
            >
              To, <br />
              The Manager, <br />
              {data[0]?.emptyDepot || ""}
              <br />
              {data[0]?.emptyDepotAddress || ""}
            </p>
          </div>
          <div className="flex items-start justify-end">
            <p
              className="text-black font-bold mr-2"
              style={{ fontSize: "10px" }}
            >
              Date :
            </p>
            <p
              className="text-black"
              style={{ fontSize: "10px", minWidth: "100px" }}
            >
              {formatDateToYMDMonths(data[0]?.doDate)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex mt-2" style={{ width: "100%" }}>
        <div style={{ width: "12%" }}>
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            Dear Sir,
          </p>
        </div>
      </div>
      <div className="flex mt-1" style={{ width: "100%" }}>
        <div>
          <p className="text-black" style={{ fontSize: "10px" }}>
            Please Accept the below mentioned Empty container(s).On account of
            <span className="text-black uppercase">{data[0]?.mlo || ""}</span>
          </p>
        </div>
      </div>
      {/* main Grid */}
      <table className="w-full table-fixed border border-black border-collapse mt-4">
        <tbody>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                VESSEL/VOY :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                PORT/ICD ARR DATE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {formatDateToYMDMonths(data[0]?.arrivalDate)}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                PLACE OF ORIGIN :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.plr || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                LOAD PORT :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.pol || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                DISCH PORT :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.pod || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                FINAL DEST :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.fpd || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                B/L NO. :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.blNo || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                B/L DATE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {formatDateToYMDMonths(data[0]?.blDate)}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                IGM NO. :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.igmNo || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                IGM DATE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {formatDateToYMDMonths(data[0]?.igmDate)}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                ITEM NO. :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.lineNo || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                DESTUFFING TYPE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.destuffName || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                CONSIGNEE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                <span>{data[0]?.consigneeText || ""}</span>
                <br />
                <span style={{ wordBreak: "break-word" }}>
                  {data[0]?.consigneeAddress || ""}
                </span>
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                NOTIFY PARTY :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                <span>{data[0]?.notifyPartyText || ""}</span>
                <br />
                <span style={{ wordBreak: "break-word" }}>
                  {data[0]?.notifyPartyAddress || ""}
                </span>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      {/* main Grid */}
      <div className="flex mt-1" style={{ width: "100%" }}>
        <div style={{ width: "12%" }}>
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            CHA Name :
          </p>
        </div>
        <div style={{ width: "88%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            {data[0]?.customBrokerName || ""}
          </p>
        </div>
      </div>
      <div className="flex mt-1" style={{ width: "100%" }}>
        <div style={{ width: "12%" }}>
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            PRINCIPAL :
          </p>
        </div>
        <div style={{ width: "88%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            {data[0]?.mlo || ""}
          </p>
        </div>
      </div>
      {/* Container Details Grid */}
      <table className="w-full mt-2 table-fixed border border-black border-collapse">
        <thead>
          <tr>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Container No.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Size/Type
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Status
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Off Hire Reference
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Valid Date
              </p>
            </th>
          </tr>
        </thead>
        <tbody>
          {containers?.length > 0 &&
            containers?.map((item, index) => (
              <tr key={index}>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal"
                    style={{ fontSize: "9px" }}
                  >
                    {item.containerNo || ""}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-left"
                    style={{ fontSize: "9px" }}
                  >
                    {(item.size || "") + "/" + (item.type || "")}
                  </p>
                </th>
                <th className="w-1/8 border font-normal border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {item.containerStatus || ""}
                  </p>
                </th>
                <th className="w-1/8 border font-normal border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}></p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal"
                    style={{ fontSize: "9px" }}
                  >
                    {formatDateToYMD(data?.[0]?.doValidDate)}
                  </p>
                </th>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="flex mt-2" style={{ width: "100%" }}>
        <div style={{ width: "10%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            Note :
          </p>
        </div>
        <div style={{ width: "98%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            Please do not offload the Container(s) if it comes after the
            Validity date mentioned against each Container and inform us of its
            arrival
          </p>
        </div>
      </div>

      <div className="flex mt-2" style={{ width: "100%" }}>
        <div style={{ width: "15%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            Description :
          </p>
        </div>
        <div style={{ width: "85%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            {data[0]?.description || ""}
          </p>
        </div>
      </div>

      {/* Sticky Footer */}
      <footer
        style={{
          bottom: "10px",
          width: "100%",
        }}
      >
        <div>
          <p className="text-black font-bold mt-2" style={{ fontSize: "10px" }}>
            Thanking You, <br />
            For {data[0]?.company} <br />
          </p>
          <p style={{ width: "80%", height: "100%" }}>
            <ImgSign />
          </p>
          {/* <p className="text-black mt-14" style={{ fontSize: "10px" }}>
            Issued By: admin
          </p> */}
          <p className="text-black" style={{ fontSize: "10px" }}>
            Please note this is a computer-generated document, hence no
            signature and stamp required.
          </p>
        </div>
      </footer>
    </div>
  );

  const GangLetter = () => (
    <div>
      <div className="mx-auto">
        <CompanyImgModule />
      </div>
      {/* Header */}
      <div className="mx-auto text-black">
        <h1 className="text-black font-bold text-sm text-center underline">
          Destuffing letter
        </h1>
        <div className="flex justify-between w-full">
          <div className="flex items-end justify-start">
            <p
              className="text-black font-bold mr-2"
              style={{ fontSize: "10px" }}
            >
              To, <br />
              The Manager, <br />
              {data[0]?.nominatedArea || ""}
            </p>
          </div>
          <div className="flex items-start justify-end">
            <p
              className="text-black font-bold mr-2"
              style={{ fontSize: "10px" }}
            >
              Date :
            </p>
            <p
              className="text-black"
              style={{ fontSize: "10px", minWidth: "100px" }}
            >
              {formatDateToYMDMonths(data[0]?.doDate)}
            </p>
          </div>
        </div>
      </div>
      {/* Main Grid */}
      <table className="w-full table-fixed border border-black border-collapse mt-4">
        <tbody>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                VESSEL/VOY :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                ARRIVAL DATE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.arrivalDate || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                PLACE OF ORIGIN :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.plr || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                LOAD PORT :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.pol || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                DISCH PORT :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.pod || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                FINAL DEST :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.fpd || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                B/L NO. :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.blNo || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                B/L DATE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {formatDateToYMDMonths(data[0]?.blDate)}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                IGM NO. :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.igmNo || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                IGM DATE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {formatDateToYMDMonths(data[0]?.igmDate)}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                ITEM NO. :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.lineNo || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                TERMINAL :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.berthName || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                CONSIGNEE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                <span>{data[0]?.consigneeText || ""}</span>
                <br />
                <span style={{ wordBreak: "break-word" }}>
                  {data[0]?.consigneeAddress || ""}
                </span>
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                NOTIFY PARTY :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                <span>{data[0]?.notifyPartyText || ""}</span>
                <br />
                <span style={{ wordBreak: "break-word" }}>
                  {data[0]?.notifyPartyAddress || ""}
                </span>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Short Description */}
      <p className="text-black mt-1" style={{ fontSize: "10px" }}>
        Dear Sir,
      </p>
      <p className="text-black mt-1" style={{ fontSize: "10px" }}>
        Kindly arrange to effect direct delivery of cargo from the container to
        Messers {data[0]?.customBrokerName || ""} or bearer{" "}
        {data[0]?.consignee || ""}
      </p>
      {/* Container Details Grid */}
      <table className="w-full mt-2 table-fixed border border-black border-collapse">
        <thead>
          <tr>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Container No.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Size/Type
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Status
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Gross Wt.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                No. of Packages
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Seal No.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Valid Date
              </p>
            </th>
          </tr>
        </thead>
        <tbody>
          {data[0]?.tblBlContainer?.length > 0 &&
            data[0]?.tblBlContainer?.map((item, index) => (
              <tr key={index}>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal"
                    style={{ fontSize: "9px" }}
                  >
                    {item.containerNo || ""}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-left"
                    style={{ fontSize: "9px" }}
                  >
                    {(item.size || "") + "/" + (item.type || "")}
                  </p>
                </th>
                <th className="w-1/8 border font-normal border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {item.containerStatus || ""}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-left"
                    style={{ fontSize: "9px" }}
                  >
                    {(item.grossWt || "") + "" + (item.weightUnitCode || "")}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-left"
                    style={{ fontSize: "9px" }}
                  >
                    {item.noOfPackages || ""} {item.packageCode || ""}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-right"
                    style={{ fontSize: "9px" }}
                  >
                    {item.customSealNo || ""}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-center"
                    style={{ fontSize: "9px" }}
                  >
                    {formatDateToYMDMonths(data?.[0]?.doValidDate)}
                  </p>
                </th>
              </tr>
            ))}
        </tbody>
      </table>
      {/* Description  */}
      <div className="flex mt-2" style={{ width: "100%" }}>
        <div style={{ width: "15%" }}>
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            Description :
          </p>
        </div>
        <div style={{ width: "85%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            {data[0]?.goodsDesc || ""}
          </p>
        </div>
        {/* Marks & Nos: */}
      </div>
      <div className="flex mt-2" style={{ width: "100%" }}>
        <div style={{ width: "12%" }}>
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            Thanking You,
          </p>
        </div>
      </div>
      <div className="flex mt-2" style={{ width: "100%" }}>
        <div style={{ width: "100%" }}>
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            For {data[0]?.company || ""}
          </p>
          <p style={{ width: "80%", height: "100%" }}>
            <ImgSign />
          </p>
        </div>
        {/* Marks & Nos: */}
      </div>
      {/* Sticky Footer */}
      <footer
        style={{
          bottom: "10px",
          width: "100%",
        }}
      >
        <div>
          <p
            className="text-black font-bold mt-20"
            style={{ fontSize: "10px" }}
          >
            Authorize Signatory
          </p>
        </div>
      </footer>
    </div>
  );

  const CMCLetter = (container) => {
    const containers = Array.isArray(container)
      ? container
      : Array.isArray(container)
        ? container
        : [];
    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
        </div>
        {/* Header */}
        <div className="mx-auto text-black">
          <h1 className="text-black font-bold text-sm text-center underline">
            <u>CMC Letter</u>
          </h1>
        </div>
        {/* Main Grid */}
        <table className="w-full table-fixed border border-black border-collapse mt-4">
          <tbody>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  VESSEL/VOY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ARRIVAL DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.arrivalDate || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  PLACE OF ORIGIN :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.plr || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  LOAD PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pol || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  DISCH PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pod || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  FINAL DEST :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.fpd || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.blNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMD(data[0]?.blDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.igmNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMD(data[0]?.igmDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ITEM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.lineNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p
                  className="text-black font-bold"
                  style={{ fontSize: "9px" }}
                ></p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}></p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  CONSIGNEE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.consigneeText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.consigneeAddress || ""}
                  </span>
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  NOTIFY PARTY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.notifyPartyText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.notifyPartyAddress || ""}
                  </span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mx-auto text-black mt-2">
          <div className="flex justify-between w-full">
            <div className="flex items-end justify-start">
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                To, <br />
                The Assistant Commisioner of Custom, <br />
                Container Cell <br />
                {data[0]?.podCode || ""} <br />
              </p>
            </div>
            <div className="flex items-start justify-end">
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                Date :
              </p>
              <p
                className="text-black"
                style={{ fontSize: "10px", minWidth: "100px" }}
              >
                {formatDateToYMD(data[0]?.doDate)}
              </p>
            </div>
          </div>
        </div>
        {/* Short Description */}
        <p className="text-black mt-5" style={{ fontSize: "10px" }}>
          Respected Sir,
        </p>
        <p className="text-black mt-5" style={{ fontSize: "10px" }}>
          The below mentioned consignee desires to take the import loaded
          container to their factory premises situated at factory for <br />{" "}
          destuffing the import consignment
        </p>
        <p className="text-black mt-5 font-bold" style={{ fontSize: "10px" }}>
          NAME OF THE CONSIGNEE : {data[0]?.consigneeText || ""}
        </p>
        <p className="text-black mt-1 font-bold" style={{ fontSize: "10px" }}>
          CHA : {data[0]?.switchAgent || ""}
        </p>
        {/* Container Details Grid */}
        <table className="w-full mt-2 table-fixed border border-black border-collapse">
          <thead>
            <tr>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Container No.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Size/Type
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Status
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Gross Wt.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  No. of Packages
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Seal No.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Valid Date
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {containers?.length > 0 &&
              containers?.map((item, index) => (
                <tr key={index}>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal"
                      style={{ fontSize: "9px" }}
                    >
                      {item.containerNo || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.size || "") + "/" + (item.type || "")}
                    </p>
                  </th>
                  <th className="w-1/8 border font-normal border-black p-1">
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {item.containerStatus || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.grossWt || "") + "" + (item.weightUnitCode || "")}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {item.noOfPackages || ""} {item.packageCode || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-right"
                      style={{ fontSize: "9px" }}
                    >
                      {item.customSealNo || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-center"
                      style={{ fontSize: "9px" }}
                    >
                      {formatDateToYMD(data?.[0]?.doValidDate)}
                    </p>
                  </th>
                </tr>
              ))}
          </tbody>
        </table>
        {/* Description  */}
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              We Kindly request to enter the above mentioned containers in our
              Bond Register No. S\43-CONT(B) NS/147/2013 After destuffing,
              please allow to store the above mentioned containers at our empty
              container yard.
            </p>
          </div>
          {/* Marks & Nos: */}
        </div>
        <div className="flex mt-5 font-bold" style={{ width: "100%" }}>
          <div style={{ width: "12%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Thanking You,
            </p>
          </div>
        </div>
        <div className="flex mt-1" style={{ width: "100%" }}>
          <div style={{ width: "100%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              For {data[0]?.company || ""}
            </p>
            <p style={{ width: "80%", height: "100%" }}>
              <ImgSign />
            </p>
          </div>
          {/* Marks & Nos: */}
        </div>
        {/* Sticky Footer */}
        <footer
          style={{
            bottom: "10px",
            width: "100%",
          }}
        >
          <div>
            <p
              className="text-black font-bold mt-20"
              style={{ fontSize: "10px" }}
            >
              Authorize Signatory
            </p>
          </div>
        </footer>
      </div>
    );
  };

  const CustomsExaminationOrder = () => (
    <div>
      <div className="mx-auto">
        <CompanyImgModule />
      </div>
      {/* Header */}
      <div className="mx-auto text-black">
        <h1 className="text-black font-bold text-sm text-center underline">
          Customs Examination Order
        </h1>
      </div>
      {/* Main Grid */}
      <table className="w-full table-fixed border border-black border-collapse mt-4">
        <tbody>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                VESSEL/VOY :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                ARRIVAL DATE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.arrivalDate || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                PLACE OF ORIGIN :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.plr || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                LOAD PORT :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.pol || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                DISCH PORT :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.pod || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                FINAL DEST :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.fpd || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                B/L NO. :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.blNo || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                B/L DATE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {formatDateToYMD(data[0]?.blDate)}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                IGM NO. :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.igmNo || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                IGM DATE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {formatDateToYMD(data[0]?.igmDate)}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                ITEM NO. :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.lineNo || ""}
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                TERMINAL :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                {data[0]?.berthName || ""}
              </p>
            </td>
          </tr>
          <tr>
            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                CONSIGNEE :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                <span>{data[0]?.consigneeText || ""}</span>
                <br />
                <span style={{ wordBreak: "break-word" }}>
                  {data[0]?.consigneeAddress || ""}
                </span>
              </p>
            </td>
            <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                NOTIFY PARTY :
              </p>
            </td>
            <td className="w-2/6 border-t border-b border-r border-black p-1">
              <p className="text-black" style={{ fontSize: "9px" }}>
                <span>{data[0]?.notifyPartyText || ""}</span>
                <br />
                <span style={{ wordBreak: "break-word" }}>
                  {data[0]?.notifyPartyAddress || ""}
                </span>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      {/* Container Details Grid */}
      <table className="w-full mt-4 table-fixed border border-black border-collapse">
        <thead>
          <tr>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Container No.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Size/Type
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Status
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Gross Wt.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                No. of Packages
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                Seal No.
              </p>
            </th>
          </tr>
        </thead>
        <tbody>
          {data[0]?.tblBlContainer?.length > 0 &&
            data[0]?.tblBlContainer?.map((item, index) => (
              <tr key={index}>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal"
                    style={{ fontSize: "9px" }}
                  >
                    {item.containerNo || ""}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-left"
                    style={{ fontSize: "9px" }}
                  >
                    {(item.size || "") + "/" + (item.type || "")}
                  </p>
                </th>
                <th className="w-1/8 border font-normal border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {item.containerStatus || ""}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-left"
                    style={{ fontSize: "9px" }}
                  >
                    {(item.grossWt || "") + "" + (item.weightUnitCode || "")}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-left"
                    style={{ fontSize: "9px" }}
                  >
                    {item.noOfPackages || ""} {item.packageCode || ""}
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-normal text-right"
                    style={{ fontSize: "9px" }}
                  >
                    {item.customSealNo || ""}
                  </p>
                </th>
              </tr>
            ))}
        </tbody>
      </table>
      {/* Description  */}
      <div className="flex mt-2" style={{ width: "100%" }}>
        <div style={{ width: "15%" }}>
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            Description :
          </p>
        </div>
        <div style={{ width: "85%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            {data[0]?.goodsDesc || ""}
          </p>
        </div>
        {/* Marks & Nos: */}
      </div>
      <div className="flex mt-2" style={{ width: "100%" }}>
        <div style={{ width: "15%" }}>
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            Marks & Nos :
          </p>
        </div>
        <div style={{ width: "85%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            {data[0]?.marksNos || ""}
          </p>
        </div>
      </div>
      {/* Sticky Footer */}
      <footer
        style={{
          bottom: "10px",
          width: "100%",
        }}
      >
        <div>
          <p className="text-black font-bold mt-2" style={{ fontSize: "10px" }}>
            Thanking You, <br /> For {data[0]?.company}
          </p>
          <p style={{ width: "80%", height: "100%" }}>
            <ImgSign />
          </p>
          <p className="text-black font-bold mt-1" style={{ fontSize: "10px" }}>
            Authorize Signatory
          </p>
          <p
            className="text-black font-bold uppercase"
            style={{ fontSize: "10px" }}
          >
            THIS DELIVERY ORDER AUTHORISES THE CONSIGNEE ONLY TO GET CARGO
            EXAMINED AND <br />
            APPRAISED BY THE CUSTOMS OFFICER AND CARGO CANNOT BE DELIVERED
            AGAINST THIS ORDER
          </p>
          {/* <p className="text-black mt-14" style={{ fontSize: "10px" }}>
            Issued By: admin
          </p> */}
        </div>
      </footer>
    </div>
  );

  const BondLetter = (container) => {
    const containers = Array.isArray(container)
      ? container
      : Array.isArray(container)
        ? container
        : [];

    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
        </div>
        {/* Header */}
        <div className="mx-auto text-black">
          <h1 className="text-black font-bold text-sm text-center">
            Bond Letter
          </h1>
          <div className="flex justify-between w-full">
            <div className="flex items-end justify-start">
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                To, <br />
                The Manager, <br />
                {data[0]?.nominatedArea || ""}
              </p>
            </div>
          </div>
        </div>
        {/* Main Grid */}
        <table className="w-full table-fixed border border-black border-collapse mt-4">
          <tbody>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  VESSEL/VOY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ARRIVAL DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.arrivalDate || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  PLACE OF ORIGIN :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.plr || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  LOAD PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pol || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  DISCH PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pod || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  FINAL DEST :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.fpd || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.blNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMD(data[0]?.blDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.igmNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMD(data[0]?.igmDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ITEM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.lineNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  TERMINAL :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.berthName || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  CONSIGNEE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.consigneeText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.consigneeAddress || ""}
                  </span>
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  NOTIFY PARTY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.notifyPartyText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.notifyPartyAddress || ""}
                  </span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        {/* Short Description */}
        <div className="mt-2">
          <p className="text-black font-bold" style={{ fontSize: "10px" }}>
            Dear Sir/Madam,
          </p>
          <p className="text-black font-bold mt-1" style={{ fontSize: "10px" }}>
            We kindly request you to permit M/s. M/S LILADHAR PASOO FORWARDERS
            PVT LTD to take Delivery of the following containers to factory for
            destuffing. The containers have arrived on the above mentioned
            vessel/voyage
          </p>
        </div>
        {/* Container Details Grid */}
        <table className="w-full mt-4 table-fixed border border-black border-collapse">
          <thead>
            <tr>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Container No.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Size/Type
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Status
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Gross Wt.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  No. of Packages
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Seal No.
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {containers.length > 0 &&
              containers.map((item, index) => (
                <tr key={index}>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal"
                      style={{ fontSize: "9px" }}
                    >
                      {item.containerNo || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.size || "") + "/" + (item.type || "")}
                    </p>
                  </th>
                  <th className="w-1/8 border font-normal border-black p-1">
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {item.containerStatus || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.grossWt || "") + "" + (item.weightUnitCode || "")}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {item.noOfPackages || ""} {item.packageCode || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-right"
                      style={{ fontSize: "9px" }}
                    >
                      {item.customSealNo || ""}
                    </p>
                  </th>
                </tr>
              ))}
          </tbody>
        </table>
        {/* Sticky Footer */}
        <footer
          style={{
            bottom: "10px",
            width: "100%",
          }}
        >
          <div>
            <p
              className="text-black font-bold mt-2"
              style={{ fontSize: "10px" }}
            >
              Thanking You, <br /> For {data[0]?.company}
            </p>
            <p style={{ width: "80%", height: "100%" }}>
              <ImgSign />
            </p>
            <p
              className="text-black mt-14 font-bold"
              style={{ fontSize: "10px" }}
            >
              Authorize Signatory
            </p>
            {/* <p className="text-black mt-14" style={{ fontSize: "10px" }}>
            Issued By: admin
          </p> */}
          </div>
        </footer>
      </div>
    );
  };

  const SealCuttingLetter = (container) => {
    const containers = Array.isArray(container)
      ? container
      : Array.isArray(container)
        ? container
        : [];
    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
        </div>
        {/* Header */}
        <div className="mx-auto text-black">
          <h1 className="text-black font-bold text-sm text-center underline">
            SEAL CUTTING LETTER
          </h1>
          <div className="flex justify-between w-full">
            <div className="flex items-end justify-start">
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                To, <br />
                The Manager, <br />
                {data[0]?.nominatedArea || ""}
              </p>
            </div>
            <div className="flex items-start justify-end">
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                Date :
              </p>
              <p
                className="text-black"
                style={{ fontSize: "10px", minWidth: "100px" }}
              >
                {formatDateToYMD(data[0]?.doDate)}
              </p>
            </div>
          </div>
        </div>
        {/* Main Grid */}
        <table className="w-full table-fixed border border-black border-collapse mt-4">
          <tbody>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  VESSEL/VOY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ARRIVAL DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.arrivalDate || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  PLACE OF ORIGIN :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.plr || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  LOAD PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pol || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  DISCH PORT :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pod || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  FINAL DEST :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.fpd || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.blNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMD(data[0]?.blDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.igmNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  IGM DATE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMD(data[0]?.igmDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ITEM NO. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.lineNo || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  TERMINAL :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.berthName || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  CONSIGNEE :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.consigneeText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.consigneeAddress || ""}
                  </span>
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1 align-top">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  NOTIFY PARTY :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  <span>{data[0]?.notifyPartyText || ""}</span>
                  <br />
                  <span style={{ wordBreak: "break-word" }}>
                    {data[0]?.notifyPartyAddress || ""}
                  </span>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
        {/* Short Description */}
        <p className="text-black mt-1" style={{ fontSize: "10px" }}>
          You are requested to kindly allow the seal cutting examination of
          below mentioned container(s) at{" "}
          <span style={{ fontSize: "10px" }} className="text-black">
            {data[0]?.terminalName || ""}
          </span>
        </p>
        {/* Container Details Grid */}
        <table className="w-full mt-2 table-fixed border border-black border-collapse">
          <thead>
            <tr>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Container No.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Size/Type
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Status
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Gross Wt.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  No. of Packages
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Seal No.
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {containers.length > 0 &&
              containers.map((item, index) => (
                <tr key={index}>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal"
                      style={{ fontSize: "9px" }}
                    >
                      {item.containerNo || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.size || "") + "/" + (item.type || "")}
                    </p>
                  </th>
                  <th className="w-1/8 border font-normal border-black p-1">
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {item.containerStatus || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.grossWt || "") + "" + (item.weightUnitCode || "")}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-left"
                      style={{ fontSize: "9px" }}
                    >
                      {item.noOfPackages || ""} {item.packageCode || ""}
                    </p>
                  </th>
                  <th className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-right"
                      style={{ fontSize: "9px" }}
                    >
                      {item.customSealNo || ""}
                    </p>
                  </th>
                </tr>
              ))}
          </tbody>
        </table>
        {/* Description  */}
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "8%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Valid Till :
            </p>
          </div>
          <div style={{ width: "92%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              {formatDateToYMD(data[0]?.doValidDate)}
            </p>
          </div>
          {/* Marks & Nos: */}
        </div>
        <div style={{ width: "100%" }}>
          <p className="text-black" style={{ fontSize: "10px" }}>
            NOTE : SEAL CUTTING VALID UPTO THE DATE MENTIONED ABOVE.DETENTION
            CHARGES WILL BE APPLICABLE AS PER TARIFF.
          </p>
        </div>
        <div className="flex mt-1" style={{ width: "100%" }}>
          <div style={{ width: "12%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Thanking You,
            </p>
          </div>
        </div>
        <div className="flex mt-1" style={{ width: "100%" }}>
          <div style={{ width: "100%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              For {data[0]?.company || ""}
            </p>
            <p style={{ width: "80%", height: "100%" }}>
              <ImgSign />
            </p>
          </div>
          {/* Marks & Nos: */}
        </div>
        {/* Sticky Footer */}
        <footer
          style={{
            bottom: "10px",
            width: "100%",
          }}
        >
          <div>
            <p
              className="text-black font-bold mt-20"
              style={{ fontSize: "10px" }}
            >
              Authorize Signatory
            </p>
          </div>
        </footer>
      </div>
    );
  };

  const NOCForConsoleParty = () => (
    <div>
      {/* Header */}
      <div className="flex text-black mt-20 justify-between">
        <div>
          <table>
            <tr>
              <td>
                <p className="text-black text-xs">To,</p>
              </td>
            </tr>
            <tr>
              <th>
                <p className="text-black font-bold text-xs">The Manager,</p>
              </th>
            </tr>
            <tr>
              <th>
                <p className="text-black font-bold text-xs">
                  {data[0]?.nominatedArea || ""}
                </p>
              </th>
            </tr>
          </table>
        </div>
        <div>
          <p className="text-black font-bold text-xs">
            Date : {formatDateToYMD(data[0]?.doDate)}
          </p>
        </div>
      </div>
      {/* Main Grid */}
      <div className="mt-16">
        <p className="text-black font-bold text-xs">Ref</p>
        <table className="ml-10">
          <tr>
            <td className="text-xs text-black">
              <span className="font-bold">Vessel: </span>{" "}
              {data[0]?.podVessel || ""} {data[0]?.podVoyage || ""}
            </td>
          </tr>
          <tr>
            <td className="text-xs text-black">
              <span className="font-bold">Container No:</span> 1 X 20'
              EFIU2540487
            </td>
          </tr>
          <tr>
            <td className="text-xs text-black">
              <span className="font-bold">IGM No:</span> {data[0]?.igmNo || ""}{" "}
              <span className="font-bold ml-10">Item No:</span>{" "}
              {data[0]?.lineNo || ""}{" "}
            </td>
          </tr>
          <tr>
            <td className="text-xs text-black">
              <span className="font-bold">C'nee: </span>{" "}
              {data[0]?.company || ""}
            </td>
          </tr>
        </table>
      </div>
      {/* Content */}
      <div>
        <p className="text-black font-bold text-sm underline text-center mt-10">
          NO OBJECTION CERTIFICATE
        </p>
        <p
          className="text-black text-xs mt-6"
          style={{ lineHeight: "20px", width: "80%" }}
        >
          With ref. to the above mentioned shipment, please note that we have
          filed the IGM in the name of consignee "{data[0]?.company || ""}".
          Subsequently the said consignee has filed the CONSOL igm to the
          customs.
          <br />
          In this regard, we hereby express our no objection to de-stuff the
          container at your CFS and also to delivery the cargo against
          presentation of "{data[0]?.company || ""}" delivery order. <br />
          <br />
          All charges in this regard will be on consignee's account only.
          <br />
          <br />
          Permission to de-stuff the unit is valid till{" "}
          {formatDateToYMD(data[0]?.doValidDate)} only.
          <br />
          <br />
          <p style={{ width: "80%", height: "100%" }}>
            <ImgSign />
          </p>
          Thanking You
          <br />
          For
        </p>
        <p className="text-black font-bold text-xs mt-16">As Agents</p>
      </div>
    </div>
  );

  const DoLetterKenya = (input) => {
    const containers = Array.isArray(input)
      ? input
      : Array.isArray(input?.containers)
        ? input.containers
        : [];

    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
        </div>

        <div className="flex" style={{ width: "100%" }}>
          <div style={{ width: "60%" }}>
            {/* Header */}
            <div className="mx-auto text-black">
              <div
                style={{ width: "100%" }}
                className="flex justify-between w-full"
              >
                <div
                  style={{ width: "40%" }}
                  className="flex items-end justify-start w-[40%]"
                >
                  <p
                    className="text-black font-bold mr-2"
                    style={{ fontSize: "10px" }}
                  >
                    To, <br />
                    KENYA PORTS AUTHORITY, KILINDINI
                    <br />
                    Mombasa Kenya
                  </p>
                </div>
              </div>
              <div>
                {/* ,fontFamily: "Verdana, Geneva, Tahoma, sans-serif " 
                font-verdana-force */}
                {/* style={{fontFamily: "Verdana, Geneva, Tahoma, sans-serif" }} */}
                <h1
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#000",
                    textDecoration: "underline",
                    textAlign: "right",
                    // optional:
                    // fontFamily: "Verdana, Geneva, Tahoma, sans-serif",
                  }}
                >
                  {data[0]?.destuffName
                    ? `Delivery Order / ${data[0].destuffName}`
                    : "Delivery Order"}
                </h1>
              </div>
            </div>
            <div className="w-full">
              <p className="text-black mt-2" style={{ fontSize: "10px" }}>
                The Delivery Order is issued to <b>{data[0]?.chaName}</b> as
                authorized by the consignee
              </p>
            </div>
          </div>
          <div
            style={{
              width: "20%",
              marginLeft: "auto", // pushes to the end if parent is flex
              display: "flex",
              justifyContent: "flex-end", // aligns content to the right inside
            }}
          >
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="DO QR"
                style={{ width: 100, height: 100 }}
              />
            ) : (
              <div
                className="bg-gray-200 animate-pulse"
                style={{ width: 100, height: 100 }}
              />
            )}
          </div>
        </div>

        {/* Main Grid */}
        <table className="w-full table-fixed border border-black border-collapse mt-2">
          <tbody>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Vessel :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.podVessel || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  B/L No. :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.blNo || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Voyage :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.podVoyage || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  D / O Number :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.doNo || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  ETA :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMD(data[0]?.arrivalDate)}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  D / O Date :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {formatDateToYMD(data[0]?.doDate)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  POL :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pol || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  D / O Validity Date :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {/* {formatDateToYMD(data[0]?.doValidDate)} */}
                  {getValidTillDate(data[0]?.doValidDate, 90)}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  POD :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.pod || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Manifest Number :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.igmNo || ""}
                </p>
              </td>
            </tr>
            <tr>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Destination :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {data[0]?.fpd || ""}
                </p>
              </td>
              <td className="w-1/6 border-t border-b border-l border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  User :
                </p>
              </td>
              <td className="w-2/6 border-t border-b border-r border-black p-1">
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {userName}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        {/* <div style={{ width: "100%" }} className="flex justify-between">
            <div
              style={{ width: "40%" }}
              className="flex items-end justify-start w-[40%]"
            >
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                CONSIGNEE NAME & ADDRESS:
                {data[0]?.consigneeText || ""}
                <br />
                {data[0]?.consigneeAddress || ""}
              </p>
            </div>
           
          </div> */}

        {/* <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "15%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              DO SecurityKey :
            </p>
          </div>
          <div style={{ width: "85%" }}>
            <p className="text-black" style={{ fontSize: "10px" }}>
              {data[0]?.doSecurityKey || ""}
            </p>
          </div>
        </div> */}

        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "15%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Consignee :
            </p>
          </div>
          <div style={{ width: "85%" }}>
            <p className="text-black" style={{ fontSize: "10px" }}>
              {data[0]?.consigneeText || ""}
              <br />
              {data[0]?.consigneeAddress || ""}
            </p>
          </div>
        </div>

        <table className="w-full mt-4 table-fixed border border-black border-collapse">
          <thead>
            <tr>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Container No.
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Size/Type
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Seal No.
                </p>
              </th>

              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Weight (KG)
                </p>
              </th>
              <th className="w-1/8 border border-black p-1">
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  CBM
                </p>
              </th>
            </tr>
          </thead>
          <tbody>
            {containers.length > 0 &&
              containers.map((item, index) => (
                <tr key={index}>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-center"
                      style={{ fontSize: "9px" }}
                    >
                      {item.containerNo || ""}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-center"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.size || "") + "/" + (item.type || "")}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-center"
                      style={{ fontSize: "9px" }}
                    >
                      {item.customSealNo || ""}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1">
                    <p
                      className="text-black font-normal text-center"
                      style={{ fontSize: "9px" }}
                    >
                      {(item.grossWt || "") + " " + (item.weightUnitCode || "")}
                    </p>
                  </td>
                  <td className="w-1/8 border border-black p-1 text-center">
                    <p
                      className="text-black font-normal"
                      style={{ fontSize: "9px" }}
                    >
                      {item.volume || ""} {item.volumeUnitCode || ""}
                    </p>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Description  */}
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "15%" }}>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Cargo Description :
            </p>
          </div>
          <div style={{ width: "85%" }}>
            <p className="text-black" style={{ fontSize: "10px" }}>
              {data[0]?.goodsDesc || ""}
            </p>
          </div>
        </div>
        {/* Footer */}
      </div>
    );
  };

  const EmptyContainerOffLoadingLetter = (container) => {
    const containers = Array.isArray(container)
      ? container
      : Array.isArray(container)
        ? container
        : [];
    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
        </div>
        {/* Header */}
        <div className="mx-auto text-black">
          <h1 className="text-black font-bold text-sm text-center underline">
            <u>EMPTY CONTAINER OFF LOADING LETTER</u>
          </h1>
          <div className="flex items-end justify-end">
            <p
              className="text-black"
              style={{ fontSize: "10px", minWidth: "100px" }}
            ></p>
          </div>
          <div className="flex justify-between w-full">
            <div className="flex items-end justify-start w-[40%]">
              <p
                className="text-black font-bold mr-2"
                style={{ fontSize: "10px" }}
              >
                To, <br />
                {data[0]?.emptyDepot || ""}
                <br />
                {data[0]?.emptyDepotAddress || ""}
              </p>
            </div>
          </div>
        </div>
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "12%" }}></div>
        </div>
        <div className="flex mt-1" style={{ width: "100%" }}>
          <div>
            <p className="text-black" style={{ fontSize: "10px" }}>
              Please Accept the following Empty container as per details given
              below.
              {/* <span className="text-black uppercase">{data[0]?.mlo || ""}</span> */}
            </p>
          </div>
        </div>
        <div className="flex mt-2" style={{ width: "100%" }}>
          <div style={{ width: "20%" }}>
            {/* <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Delivery Order Issued To :
            </p> */}
          </div>

          <div style={{ width: "80%" }}>
            {/* <p className="text-black" style={{ fontSize: "10px" }}>
              {data[0]?.mlo || ""}
            </p> */}
          </div>
        </div>
        <div className="mt-2" style={{ width: "100%" }}>
          <div style={{ width: "100%" }} className="flex ">
            <div style={{ width: "50%" }} className="w-full">
              {/* <p className="text-black" style={{ fontSize: "10px" }}>
                Issued to: {data[0]?.consigneeText}
              </p> */}
              <div className="flex items-center">
                <p
                  className="text-black font-bold"
                  style={{ fontSize: "10px" }}
                >
                  Clearing Agent: {data[0]?.chaName}
                </p>
                <p
                  className="text-black"
                  style={{ fontSize: "10px", marginLeft: "5px" }}
                >
                  {/* {data[0]?.customBrokerName || ""} */}
                </p>
              </div>
            </div>
            <div style={{ width: "50%" }} className="w-full flex">
              <div style={{ width: "20%" }}>
                <p
                  className="text-black font-bold"
                  style={{ fontSize: "10px" }}
                >
                  Consignee :
                </p>
              </div>
              <div style={{ width: "80%" }}>
                <p className="text-black" style={{ fontSize: "10px" }}>
                  {data[0]?.consigneeText || ""}
                  <br />
                  {data[0]?.consigneeAddress || ""}
                </p>
              </div>
            </div>
          </div>

          <table className="w-full mt-4 table-fixed border border-black border-collapse">
            <tbody>
              <tr>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Vessel :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {data[0]?.podVessel || ""}
                  </p>
                </td>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Date :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {formatDateToYMDMonths(data[0]?.doDate)}
                  </p>
                </td>
              </tr>

              <tr>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Voyage No :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {data[0]?.podVoyage || ""}
                  </p>
                </td>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    B/L No :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {data[0]?.mblNo || ""}
                  </p>
                </td>
              </tr>

              <tr>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Arrival (ATB) :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {formatDateToYMDMonths(data[0]?.arrivalDate)}
                  </p>
                </td>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Reference No :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {data[0]?.blNo || ""}
                  </p>
                </td>
              </tr>

              <tr>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Loading :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {data[0]?.pol || ""}
                  </p>
                </td>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Delivery Order No :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {data[0]?.doNo || ""}
                  </p>
                </td>
              </tr>

              <tr>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Discharge :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {data[0]?.pod || ""}
                  </p>
                </td>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    User :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {userName}
                  </p>
                </td>
              </tr>

              <tr>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Destination :
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {data[0]?.fpd || ""}
                  </p>
                </td>
                <td className="w-1/6 border-t border-b border-l border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    {/* User : */}
                  </p>
                </td>
                <td className="w-2/6 border-t border-b border-r border-black p-1">
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {/* {userName} */}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Container Details Grid tejas*/}
        <div className="mt-4" style={{ width: "100%" }}>
          <div>
            <p className="text-black font-bold" style={{ fontSize: "10px" }}>
              Remarks : The containers mentioned below have to be returned on or
              before validity date.
            </p>
          </div>
          <table className="w-full table-fixed border mt-4 border-black border-collapse">
            <thead>
              <tr>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Container No.
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Size/Type
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Free Days
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Start Date
                  </p>
                </th>
                <th className="w-1/8 border border-black p-1">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Validity Date
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              {containers?.length > 0 &&
                containers.map((item, index) => (
                  <tr key={index}>
                    <th className="w-1/8 border border-black p-1">
                      <p
                        className="text-black font-normal"
                        style={{ fontSize: "9px" }}
                      >
                        {item.containerNo || ""}
                      </p>
                    </th>
                    <th className="w-1/8 border border-black p-1">
                      <p
                        className="text-black font-normal "
                        style={{ fontSize: "9px" }}
                      >
                        {(item.size || "") + "/" + (item.type || "")}
                      </p>
                    </th>
                    <th className="w-1/8 border border-black p-1">
                      <p
                        className="text-black font-normal "
                        style={{ fontSize: "9px" }}
                      >
                        {item.destinationFreeDays || ""}
                      </p>
                    </th>
                    <th className="w-1/8 border border-black p-1">
                      <p
                        className="text-black font-normal"
                        style={{ fontSize: "9px" }}
                      >
                        {/* //{formatDateToYMD(data[0]?.arrivalDate)} */}
                        {formatDateToYMDMonths(item.dischargeDate)}
                      </p>
                    </th>

                    <th className="w-1/8 border border-black p-1">
                      <p
                        className="text-black font-normal"
                        style={{ fontSize: "9px" }}
                      >
                        {/* {getValidTillDateNew(
                          item?.dischargeDate,
                          item?.destinationFreeDays
                        )} */}
                        {item?.doValidityDate != null &&
                          String(item.doValidityDate).trim() !== ""
                          ? formatDateToYMDMonths(item?.doValidityDate)
                          : getValidTillDateNew(
                            item?.dischargeDate,
                            item?.destinationFreeDays
                          )}
                      </p>
                    </th>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  console.log("enquiryModuleRefs", enquiryModuleRefs);

  const EmptyContainerReturnNotificationRpt = (container) => {
    const containers = Array.isArray(container)
      ? container
      : Array.isArray(container)
        ? container
        : [];
    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
        </div>
        <div className=" w-full mx-auto text-black border-b border-dashed border-gray-800 pb-1">
          <h1 className="font-normal text-sm text-left">
            EMPTY CONTAINER RETURN NOTIFICATION
          </h1>
        </div>
        <table className="w-full mt-2 border-collapse text-xs">
          <tbody>
            <tr>
              <td className="p-1.5 font-light w-1/3 text-gray-800">B/L #</td>
              <td className="p-1.5 font-medium">: {data[0]?.blNo || ""}</td>
            </tr>
            <tr>
              <td className="p-1.5 font-light text-gray-800">CONSIGNEE NAME</td>
              <td className="p-1.5 font-normal">
                : {data[0]?.consigneeText || ""}
              </td>
            </tr>
            <tr>
              <td className="p-1.5 font-light text-gray-800">
                DISCHARGE VESSEL
              </td>
              <td className="p-1.5  font-normal">
                : {data[0]?.podVessel || ""}
                {" / "}
                {data[0]?.podVoyage || ""}
              </td>
            </tr>
            <tr>
              <td className="p-1.5 font-light text-gray-800">DISCHARGE DATE</td>
              <td className="p-1.5 font-normal">
                : {formatDateToYMDMonths(data[0]?.arrivalDate)}
              </td>
            </tr>
            <tr>
              <td className="p-1.5 font-light text-gray-800">
                MTY CONT. RETURN DEPO
              </td>
              <td className="p-1.5 font-normal">
                : TO BE CONFIRMED AS PER PORT GATE-OUT
              </td>
            </tr>
          </tbody>
        </table>
        {/* Container Details Grid tejasss*/}
        <div className="mt-2 w-full">
          <h1 className="font-normal text-sm text-left underline">
            CONTAINER DETAILS:
          </h1>
        </div>
        <div style={{ width: "100%" }} className="mt-1 text-xs">
          {/* Header Row */}
          <div
            style={{ width: "100%" }}
            className="flex py-2 border-t border-b border-dashed border-gray-800 font-normal"
          >
            <div style={{ width: "7%" }} className="border-r pr-1">
              SR. NO
            </div>
            <div style={{ width: "13%" }} className="border-r pr-1">
              CONTAINER #
            </div>
            <div
              style={{ width: "15%" }}
              className="border-r pr-1 text-center "
            >
              FREE TIME DAYS
            </div>
            <div style={{ width: "15%" }} className="border-r pr-1 text-center">
              F/T END DATE
            </div>
            <div style={{ width: "10%" }} className="border-r pr-1 text-center">
              TYPE
            </div>
            <div style={{ width: "5%" }} className="border-r pr-1 text-center">
              SIZE
            </div>
            <div style={{ width: "35%" }} className="pr-1 text-left">
              EXTENDED DATE / REMARKS
            </div>
          </div>

          {/* Data Rows */}
          {containers.length > 0 &&
            containers.map((item, index) => (
              <div
                key={index}
                style={{ width: "100%" }}
                className="flex border-b border-gray-200 py-1 font-medium"
              >
                <div style={{ width: "7%" }} className="border-r  text-center">
                  {item?.containerNoIndex + 1}
                </div>
                <div style={{ width: "13%" }} className="border-r ">
                  {item.containerNo || ""}
                </div>
                <div style={{ width: "15%" }} className="border-r  text-right">
                  {item.destinationFreeDays || ""}
                </div>
                <div style={{ width: "15%" }} className="border-r  text-center">
                  {getValidTillDateNew(
                    data[0]?.arrivalDate,
                    item?.destinationFreeDays
                  )}
                </div>
                <div style={{ width: "10%" }} className="border-r  text-center">
                  {item.type || ""}
                </div>
                <div style={{ width: "5%" }} className="border-r  text-center">
                  {item.size || ""}
                </div>
                <div style={{ width: "35%" }}>{formatDateToYMDMonths(data[0]?.doValidDate)}{" "}{item.remarks || ""}</div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const saudiDeliveryOrderRpt = () => {
    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
        </div>
        <div className="mx-auto text-black w-full">
          {/* Title */}
          <h1
            className="font-bold text-center pb-2"
            style={{ fontSize: "15px" }}
          >
            DELIVERY ORDER
          </h1>

          {/* DO Details Box */}
          <div
            className="border-2 border-blue-900 rounded-lg mt-1 flex justify-between text-sm"
            style={{ fontSize: "9px", width: "100%" }}
          >
            {/* Left Section */}
            <div className="text-left " style={{ width: "75%" }}>
              <p className="font-normal pb-1 pt-1 pl-2">
                DO Number:{" "}
                <span className="font-bold">{data[0]?.doNo || ""}</span>
              </p>
              <p className="font-normal  pb-1 pt-1 pl-2">
                Customs no:{" "}
                <span className="font-bold">{data[0]?.igmNo || ""}</span>
              </p>
            </div>

            {/* Right Section */}
            <div className="text-left " style={{ width: "25%" }}>
              <p className="font-normal pr-2 pt-1">
                Date:{" "}
                <span className="font-bold">
                  {formatDateToYMD(data[0]?.doDate)}
                </span>
              </p>
            </div>
          </div>
          {/* Below Section */}
          <div
            className="border-2 border-blue-900 rounded-lg mt-2 flex text-sm"
            style={{ fontSize: "9px" }}
          >
            {/* Left Section */}
            <div className="w-1/2 border-r-2 border-blue-900 p-2 space-y-1">
              <div className="flex border-b border-gray-200 py-1">
                <span className="w-20">Shipper:</span>
                <span className="font-bold">{data[0]?.shipperText || ""}</span>
              </div>
              <div className="flex border-b border-gray-200 py-1">
                <span className="w-20">Consignee:</span>
                <span className="font-bold">
                  {data[0]?.consigneeText || ""}
                </span>
              </div>
              <div className="flex border-b border-gray-200 py-1">
                <span className="w-20">Notify:</span>
                <span className="font-normal">
                  {data[0]?.notifyPartyText || ""}
                </span>
              </div>
              <div className="w-full flex border-b border-gray-200 py-1">
                <div style={{ width: "60%" }}>
                  <span>Vessel Name:</span>
                  <span className="font-normal ml-5">
                    {data[0]?.podVessel || ""}
                  </span>
                </div>
                <div style={{ width: "40%" }}>
                  <span>Voyage:</span>
                  <span className="font-normal ml-2">
                    {data[0]?.podVoyage || ""}
                  </span>
                </div>
              </div>
              {/* <div className="flex py-1">
                
              </div> */}
            </div>

            {/* Right Section */}
            <div className="w-1/2 p-2 space-y-1">
              <div className="flex border-b border-gray-200 py-1">
                <span className="w-28">Arrival Date:</span>
                <span className="font-normal">
                  {formatDateToYMDMonths(data[0]?.arrivalDate) || ""}
                </span>
              </div>
              <div className="flex border-b border-gray-200 py-1">
                <span className="w-28">Port of Loading:</span>
                <span className="font-bold">{data[0]?.pol || ""}</span>
              </div>
              <div className="flex border-b border-gray-200 py-1">
                <span className="w-28">Port of Discharge:</span>
                <span className="font-bold">{data[0]?.pod || ""}</span>
              </div>
              <div className="flex py-1">
                <span className="w-28">Port of Delivery:</span>
                <span className="font-bold">{data[0]?.pod || ""}</span>
              </div>
            </div>
          </div>
          {/* Table Part */}
          <div
            className="border-2 border-blue-900 rounded-lg mt-4 text-sm"
            style={{ fontSize: "9px" }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-blue-900 text-center font-bold">
                  <th className="border-r border-gray-200 py-1">
                    Bill of Lading
                  </th>
                  <th className="border-r border-gray-200 py-1">
                    Package Type
                  </th>
                  <th className="border-r border-gray-200 py-1">Quantity</th>
                  <th className="border-r border-gray-200 py-1">Weight</th>
                  <th className="py-1">Volume</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td className="border-r border-gray-200 font-bold py-1">
                    {data[0]?.blNo || ""}
                  </td>
                  <td className="border-r border-gray-200 py-1">
                    {data[0]?.package || ""}
                  </td>
                  <td className="border-r border-gray-200 py-1">
                    {data[0]?.noOfPackages || ""}
                  </td>
                  <td className="border-r border-gray-200 py-1">
                    {data[0]?.grossWt || ""}
                  </td>
                  <td className="py-1">{data[0]?.volume || ""}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Marks Section */}
          <div
            className="border-2 border-blue-900 rounded-lg mt-4 p-2 text-sm"
            style={{ fontSize: "9px" }}
          >
            <p>
              <span className="font-bold">Marks and Numbers: </span>{" "}
              {data[0]?.marksNos || ""}
            </p>
          </div>

          {/* Containers Section */}
          <div
            className="border-2 border-blue-900 rounded-lg mt-4 p-2 text-sm break-words"
            style={{ fontSize: "9px" }}
          >
            <p className="whitespace-normal">
              <span className="font-bold">Containers:</span>{" "}
              {data[0]?.containerNos || ""}
            </p>
          </div>

          {/* Goods Description Section */}
          <div
            className="border-2 border-blue-900 rounded-lg mt-4 p-2 text-sm"
            style={{ fontSize: "9px" }}
          >
            <p>
              <span className="font-bold">Goods Description:</span>{" "}
              {data[0]?.goodsDesc || ""}
            </p>
          </div>

          {/* Remarks Section */}
          <div
            className="border-2 border-blue-900 rounded-lg mt-4 p-2 text-sm"
            style={{ fontSize: "9px" }}
          >
            <p>
              <span className="font-bold">Remarks:</span>{" "}
              {data[0]?.remarks || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // CASE stays the same (your width 60–70% is fine). Only replace AuthorityLetter:

  const AuthorityLetter = () => {
    const row = (Array.isArray(data) ? data[0] : {}) || {};
    const v = (x, dash = " ") =>
      x === undefined || x === null || x === "" ? dash : String(x);

    const vesselVoy =
      row.vesselVoy ||
      `${row.vesselName || ""}${row.voyageNo ? ` / ${row.voyageNo}` : ""
        }`.trim();

    // shared classes
    const tblBase = "w-full table-auto text-[11px] text-black border-collapse";
    const tbodyBase =
      "[&>tr]:transition-colors [&>tr]:duration-150 [&>tr:hover]:bg-gray-100";
    const sectionBox = "border border-[#787878] rounded-md overflow-hidden";

    return (
      <main className="w-full">
        <div className="mx-auto">
          <CompanyImgModule />
        </div>
        {/* ===== Row 1: Status (L) + Vessel/ATB/Remarks (R) ===== */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Status box */}
          <section className={sectionBox}>
            <table className={tblBase}>
              <tbody className={tbodyBase}>
                <tr className="border-b border-[#787878] odd:bg-white even:bg-gray-50">
                  <td className="w-1/2 px-1 py-1 align-top font-semibold">
                    D/O Security Key:
                  </td>
                  <td className="px-1 py-1 font-semibold align-top">
                    {v(row.doSecurityKey || "")}
                  </td>
                </tr>
                <tr className="border-b border-[#787878] odd:bg-white even:bg-gray-50">
                  <td className="px-1 py-1 align-top font-semibold">D/O No:</td>
                  <td className="px-1 py-1 font-semibold tracking-wide align-top">
                    {v(row.doNo || "")}
                  </td>
                </tr>
                <tr className="odd:bg-white even:bg-gray-50">
                  <td className="px-1 py-1 align-top font-semibold">
                    D/O Validity:
                  </td>
                  <td className="px-1 py-1 font-semibold align-top">
                    {v(row.doDate || "")}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Vessel / ATB / Remarks */}
          <section className={sectionBox}>
            <table className={tblBase}>
              <tbody className={tbodyBase}>
                <tr className="border-b border-[#787878] odd:bg-white even:bg-gray-50">
                  <td className="w-[45%] px-1 py-1 border-r border-[#787878] align-top font-semibold">
                    Vessel name/ Voy:
                  </td>
                  <td className="px-1 py-1 font-medium align-top">
                    {data[0]?.podVessel || ""}
                    {" / "}
                    {data[0]?.podVoyage || ""}
                  </td>
                </tr>
                <tr className="border-b border-[#787878] odd:bg-white even:bg-gray-50">
                  <td className="px-1 py-1 border-r border-[#787878] align-top font-semibold">
                    ATA:
                  </td>
                  <td className="px-1 py-1 align-top">
                    {formatDateToYMD(data[0]?.arrivalDate)}
                  </td>
                </tr>
                {/* <tr className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 border-r border-[#787878] align-top font-semibold">
                    Remarks:
                  </td>
                  <td className="px-3 py-2 align-top">
                    {v(row.remarks || "")}
                  </td>
                </tr> */}
              </tbody>
            </table>
          </section>
        </div>

        {/* ===== Row 2: Issued To (full width) ===== */}
        <section className={`mt-4 ${sectionBox}`}>
          <div className="border-b border-[#787878] px-1 py-1 text-[11px] font-semibold">
            D/O issued to:
          </div>
          <table className={tblBase}>
            <tbody className={tbodyBase}>
              <tr className=" border-[#787878] odd:bg-white even:bg-gray-50">
                <div className="w-[30%]">
                  <td className="px-1 py-1 align-top  break-words break-all ">
                    {v(row?.chaName || "")}
                    <br />
                    {v(row.chaAddress || "")}
                  </td>
                </div>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ===== Row 3: B/L details ===== */}
        <section className={`mt-4 ${sectionBox}`}>
          <table className={tblBase}>
            <tbody className={tbodyBase}>
              <tr className="border-[#787878] odd:bg-white even:bg-gray-50">
                <td className="w-[30%] px-1 py-1 align-top font-semibold">
                  B/L Number:
                </td>
                <td className="px-1 py-1 font-semibold tracking-wide align-top">
                  {v(row.blNo || " ")}
                </td>
              </tr>
              {/* <tr className="border-b border-[#787878] odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 align-top font-semibold">
                  Port of Loading:
                </td>
                <td className="px-3 py-2 align-top">{v(row.pol || " ")}</td>
              </tr>
              <tr className="border-b border-[#787878] odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 align-top font-semibold">
                  Port of Discharge:
                </td>
                <td className="px-3 py-2 align-top">{v(row.pod || " ")}</td>
              </tr>
              <tr className="odd:bg-white even:bg-gray-50">
                <td className="px-3 py-2 align-top font-semibold">
                  Booking Ref:
                </td>
                <td className="px-3 py-2 align-top">{v(row.bookingRef)}</td>
              </tr> */}
            </tbody>
          </table>
        </section>

        {/* ===== Row 4: Container line ===== */}
        <section className={`mt-4 ${sectionBox}`}>
          <table className="w-full table-fixed text-[11px] text-black border-collapse">
            {/* Force exact column widths */}
            <colgroup>
              <col style={{ width: "25%" }} />
              <col style={{ width: "75%" }} />
            </colgroup>

            <tbody className="[&>tr]:transition-colors [&>tr]:duration-150 [&>tr:hover]:bg-gray-100">
              <tr className="odd:bg-white even:bg-gray-50">
                <td
                  className="
            px-1 py-1 align-top font-semibold
            border-r border-[#787878]
            whitespace-normal
            break-words break-all
            [overflow-wrap:anywhere] [word-break:anywhere] [hyphens:auto]
            leading-[1.25] min-w-0
          "
                >
                  Containers:
                </td>

                <td
                  className="
            px-1 py-1 align-top
            whitespace-normal
            break-words break-all
            [overflow-wrap:anywhere] [word-break:anywhere] [hyphens:auto]
            leading-[1.25] min-w-0
          "
                  /* extra inline safety for older engines */
                  style={{
                    wordBreak: "break-word", // legacy fallback
                    overflowWrap: "anywhere", // modern wrap
                    hyphens: "auto",
                  }}
                >
                  {v(row?.containerNos)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    );
  };

  return (
    <main>
      <div className="mt-5">
        {getDisplayButton && (
          <Print
            enquiryModuleRefs={enquiryModuleRefs}
            printOrientation="portrait"
            //reportIds={reportIds}
            reportIds={doReportName}
          />
        )}

        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Delivery Order":
              const deliveryOrder = Array.isArray(chunks)
                ? chunks.filter(Boolean)
                : [];
              return (
                <>
                  {(deliveryOrder.length > 0 ? deliveryOrder : [undefined]).map(
                    (container, i) => (
                      <>
                        <div
                          // key={reportId}
                          // ref={(el) => (enquiryModuleRefs.current[i] = el)}
                          key={reportId}
                          ref={(el) => enquiryModuleRefs.current.push(el)}
                          id="Delivery Order"
                          className={`relative bg-white shadow-lg black-text ${i < reportIds.length - 1 ? "report-spacing" : ""
                            }`}
                          style={{
                            width: "210mm",
                            minHeight: "297mm",
                            maxHeight: "297mm",
                            margin: "auto",
                            padding: "24px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                          }}
                        >
                          {/* Printable Content */}
                          <div
                            className="flex-grow p-4"
                            style={{ maxHeight: "260mm", minHeight: "260mm" }}
                          >
                            {DoLetter(container, i)}{" "}
                            {/* container may be undefined here */}
                          </div>
                          <div className="pl-4">
                            <div>
                              <CompanyImgFooterModule />
                            </div>
                          </div>

                          {/* Print fix style */}
                          <style jsx>{`
                            .black-text {
                              color: black !important;
                            }

                            @media print {
                              .report-spacing {
                                page-break-after: always;
                              }
                            }
                          `}</style>
                        </div>

                        <div className="bg-gray-300 h-2 no-print" />
                      </>
                    )
                  )}
                </>
              );
            case "Survey Letter":
              const surveyLetter = Array.isArray(chunks)
                ? chunks.filter(Boolean)
                : [];
              return (
                <>
                  {(surveyLetter.length > 0 ? surveyLetter : [undefined]).map(
                    (container, i) => (
                      <>
                        <div
                          key={reportId}
                          ref={(el) => enquiryModuleRefs.current.push(el)}
                          id="Survey Letter"
                          className={`relative bg-white shadow-lg black-text ${i < reportIds.length - 1 ? "report-spacing" : ""
                            }`}
                          style={{
                            width: "210mm",
                            minHeight: "297mm",
                            margin: "auto",
                            padding: "24px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            pageBreakAfter:
                              index < reportIds.length - 1 ? "always" : "auto",
                          }}
                        >
                          {/* Printable Content */}
                          <div
                            className="flex-grow p-4"
                            style={{ maxHeight: "275mm", minHeight: "275mm" }}
                          >
                            {SurveyLetter(container, i)}
                          </div>
                          <div className="pl-4">
                            <div>
                              <CompanyImgFooterModule />
                            </div>
                          </div>

                          {/* Print fix style */}
                          <style jsx>{`
                            .black-text {
                              color: black !important;
                            }

                            @media print {
                              .report-spacing {
                                page-break-after: always;
                              }
                            }
                          `}</style>
                        </div>
                        <div className="bg-gray-300 h-2 no-print" />
                      </>
                    )
                  )}
                </>
              );
            case "EMPTY OFF LOADING LETTER":
              const EmptyOffLoadingLetterData = Array.isArray(
                EmptyOffLoadingLetterSizeChunks
              )
                ? EmptyOffLoadingLetterSizeChunks.filter(Boolean)
                : [];
              return (
                <>
                  {(EmptyOffLoadingLetterData.length > 0
                    ? EmptyOffLoadingLetterData
                    : [undefined]
                  ).map((container, i) => (
                    <>
                      <div
                        // key={reportId}
                        // ref={(el) => (enquiryModuleRefs.current[index] = el)}
                        key={reportId}
                        ref={(el) => enquiryModuleRefs.current.push(el)}
                        id="EMPTY OFF LOADING LETTER"
                        className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                          }`}
                        style={{
                          width: "210mm",
                          minHeight: "297mm",
                          maxHeight: "297mm",
                          margin: "auto",
                          padding: "24px",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          pageBreakAfter:
                            index < reportIds.length - 1 ? "always" : "auto",
                        }}
                      >
                        {/* Printable Content */}
                        <div
                          className="flex-grow p-4"
                          style={{ maxHeight: "260mm", minHeight: "260mm" }}
                        >
                          {EmptyOffLoadingLetter(container)}
                        </div>
                        <div className="pl-4">
                          <div>
                            <CompanyImgFooterModule />
                          </div>
                        </div>

                        {/* Print fix style */}
                        <style jsx>{`
                          .black-text {
                            color: black !important;
                          }

                          @media print {
                            .report-spacing {
                              page-break-after: always;
                            }
                          }
                        `}</style>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </>
                  ))}
                </>
              );
            case "Destuffing letter":
              return (
                <>
                  <div
                    key={reportId}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="Destuffing letter"
                    className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      }`}
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                      margin: "auto",
                      padding: "24px",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      pageBreakAfter:
                        index < reportIds.length - 1 ? "always" : "auto",
                    }}
                  >
                    {/* Printable Content */}
                    <div
                      className="flex-grow p-4"
                      style={{ paddingBottom: "100px" }}
                    >
                      {GangLetter()}
                    </div>

                    {/* Print fix style */}
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }

                      @media print {
                        .report-spacing {
                          page-break-after: always;
                        }
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "CMC Letter":
              const CMCLetterData = Array.isArray(CMCLetterSizeChunks)
                ? CMCLetterSizeChunks.filter(Boolean)
                : [];
              return (
                <>
                  {(CMCLetterData.length > 0 ? CMCLetterData : [undefined]).map(
                    (container, i) => (
                      <>
                        <div
                          key={reportId}
                          ref={(el) => enquiryModuleRefs.current.push(el)}
                          id="CMC Letter"
                          className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                            }`}
                          style={{
                            width: "210mm",
                            minHeight: "297mm",
                            maxHeight: "297mm",
                            margin: "auto",
                            padding: "24px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            pageBreakAfter:
                              index < reportIds.length - 1 ? "always" : "auto",
                          }}
                        >
                          {/* Printable Content */}
                          <div
                            className="flex-grow p-4"
                            style={{ maxHeight: "275mm", minHeight: "275mm" }}
                          >
                            {CMCLetter(container)}
                          </div>
                          <div className="pl-4">
                            <div>
                              <CompanyImgFooterModule />
                            </div>
                          </div>

                          {/* Print fix style */}
                          <style jsx>{`
                            .black-text {
                              color: black !important;
                            }

                            @media print {
                              .report-spacing {
                                page-break-after: always;
                              }
                            }
                          `}</style>
                        </div>
                        <div className="bg-gray-300 h-2 no-print" />
                      </>
                    )
                  )}
                </>
              );
            case "Customs Examination Order":
              return (
                <>
                  <div
                    key={reportId}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="Customs Examination Order"
                    className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      }`}
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                      margin: "auto",
                      padding: "24px",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      pageBreakAfter:
                        index < reportIds.length - 1 ? "always" : "auto",
                    }}
                  >
                    {/* Printable Content */}
                    <div
                      className="flex-grow p-4"
                      style={{ paddingBottom: "100px" }}
                    >
                      {CustomsExaminationOrder()}
                    </div>

                    {/* Print fix style */}
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }

                      @media print {
                        .report-spacing {
                          page-break-after: always;
                        }
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Bond Letter":
              const BondLetterData = Array.isArray(BondLetterSizeChunks)
                ? BondLetterSizeChunks.filter(Boolean)
                : [];
              return (
                <>
                  {(BondLetterData.length > 0
                    ? BondLetterData
                    : [undefined]
                  ).map((container, i) => (
                    <>
                      <div
                        key={reportId}
                        ref={(el) => (enquiryModuleRefs.current[index] = el)}
                        id="Bond Letter"
                        className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                          }`}
                        style={{
                          width: "210mm",
                          minHeight: "297mm",
                          maxHeight: "297mm",
                          margin: "auto",
                          padding: "24px",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          pageBreakAfter:
                            index < reportIds.length - 1 ? "always" : "auto",
                        }}
                      >
                        {/* Printable Content */}
                        <div
                          className="flex-grow p-4"
                          style={{ maxHeight: "275mm", minHeight: "275mm" }}
                        >
                          {BondLetter(container)}
                        </div>
                        <div className="pl-4">
                          <div>
                            <CompanyImgFooterModule />
                          </div>
                        </div>

                        {/* Print fix style */}
                        <style jsx>{`
                          .black-text {
                            color: black !important;
                          }

                          @media print {
                            .report-spacing {
                              page-break-after: always;
                            }
                          }
                        `}</style>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </>
                  ))}
                </>
              );
            case "SEAL CUTTING LETTER":
              const SealCuttingLetterData = Array.isArray(
                SealCuttingLetterSizeChunks
              )
                ? SealCuttingLetterSizeChunks.filter(Boolean)
                : [];
              return (
                <>
                  {(SealCuttingLetterData.length > 0
                    ? SealCuttingLetterData
                    : [undefined]
                  ).map((container, i) => (
                    <>
                      <div
                        key={reportId}
                        ref={(el) => enquiryModuleRefs.current.push(el)}
                        id="SEAL CUTTING LETTER"
                        className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                          }`}
                        style={{
                          width: "210mm",
                          minHeight: "297mm",
                          margin: "auto",
                          padding: "24px",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          pageBreakAfter:
                            index < reportIds.length - 1 ? "always" : "auto",
                        }}
                      >
                        {/* Printable Content */}
                        <div
                          className="flex-grow p-4"
                          style={{ maxHeight: "275mm", minHeight: "275mm" }}
                        >
                          {SealCuttingLetter(container)}
                        </div>
                        <div className="pl-4">
                          <div>
                            <CompanyImgFooterModule />
                          </div>
                        </div>

                        {/* Print fix style */}
                        <style jsx>{`
                          .black-text {
                            color: black !important;
                          }

                          @media print {
                            .report-spacing {
                              page-break-after: always;
                            }
                          }
                        `}</style>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </>
                  ))}
                </>
              );
            case "NOC For Console Party":
              return (
                <>
                  <div
                    key={reportId}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="NOC For Console Party"
                    className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      }`}
                    style={{
                      width: "210mm",
                      minHeight: "297mm",
                      margin: "auto",
                      padding: "24px",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      pageBreakAfter:
                        index < reportIds.length - 1 ? "always" : "auto",
                    }}
                  >
                    {/* Printable Content */}
                    <div className="flex-grow p-4">{NOCForConsoleParty()}</div>

                    {/* Print fix style */}
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }

                      @media print {
                        .report-spacing {
                          page-break-after: always;
                        }
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Delivery Order Kenya":
              const area = (data?.[0]?.nominatedArea ?? "")
                .toString()
                .trim()
                .toLowerCase();
              const suppressNote =
                area === "port clearance" || area.includes("icd");
              return (
                <>
                  {(Array.isArray(deliveryOrderKenyaChunks) &&
                    deliveryOrderKenyaChunks.length
                    ? deliveryOrderKenyaChunks
                    : [undefined]
                  ).map((container, index) => (
                    <React.Fragment key={`${reportId}-${index}`}>
                      <div
                        key={reportId}
                        ref={(el) => enquiryModuleRefs.current.push(el)}
                        id="Delivery Order"
                        className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                          }`}
                        style={{
                          width: "210mm",
                          minHeight: "295mm",
                          maxHeight: "295mm",
                          margin: "auto",
                          padding: "24px",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                        }}
                      >
                        {/* Printable Content */}
                        <div
                          className="flex-grow p-4"
                          style={{
                            maxHeight: suppressNote ? "273mm" : "256mm",
                            minHeight: suppressNote ? "273mm" : "256mm",
                          }}
                        >
                          {DoLetterKenya(container)}{" "}
                          {/* container can be undefined; DoLetterKenya should normalize */}
                        </div>
                        <div className="pl-4 pr-4">
                          <div>
                            <p
                              className="text-black  w-full text-left"
                              style={{ fontSize: "10px" }}
                            >
                              This Delivery Order is issued subject to vessel’s
                              safe arrival and the Bill of Lading terms.{" "}
                              <span style={{ textTransform: "uppercase" }}>
                                {data[0]?.company || ""}
                              </span>{" "}
                              , as carrier’s agent, bears no liability for short
                              landing, delay, damage, or other carrier matters,
                              and no claims shall be made against it. Once
                              issued for cleared cargo, charges are
                              non-refundable. For uncleared cargo, withdrawal
                              may be allowed subject to detention/demurrage
                              settlement; paid charges remain non-refundable.
                            </p>
                          </div>
                          {!suppressNote && (
                            <div>
                              <p
                                className="text-black  w-full text-left pt-1"
                                style={{ fontSize: "10px" }}
                              >
                                <b>Note:</b> The carrier’s responsibility shall
                                terminate upon delivery of laden containers at
                                the port container yard (CY). Thereafter, all
                                activities including the movement of laden
                                containers from the port CY to the consignee’s
                                nominated Container Freight Station (CFS), cargo
                                delivery, and the return of empty containers to
                                the carrier’s nominated depot, shall be the sole
                                responsibility of the consignee.
                              </p>
                            </div>
                          )}
                        </div>
                        {/* Print fix style */}
                        <style jsx>{`
                          .black-text {
                            color: black !important;
                          }
                          @media print {
                            .report-spacing {
                              page-break-after: always;
                            }
                          }
                        `}</style>
                      </div>

                      <div className="bg-gray-300 h-2 no-print" />
                    </React.Fragment>
                  ))}
                </>
              );
            case "EMPTY CONTAINER OFF LOADING LETTER":
              const EmptyContainerOffLoadingLetterData = Array.isArray(
                EmptyContainerOffLoadingLetterChunks
              )
                ? EmptyContainerOffLoadingLetterChunks.filter(Boolean)
                : [];
              return (
                <>
                  {(EmptyContainerOffLoadingLetterData.length > 0
                    ? EmptyContainerOffLoadingLetterData
                    : [undefined]
                  ).map((container, i) => (
                    <>
                      <div
                        key={reportId}
                        ref={(el) => enquiryModuleRefs.current.push(el)}
                        id="EMPTY CONTAINER OFF LOADING LETTER"
                        className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                          }`}
                        style={{
                          width: "210mm",
                          minHeight: "297mm",
                          maxHeight: "297mm",
                          margin: "auto",
                          padding: "24px",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          pageBreakAfter:
                            index < reportIds.length - 1 ? "always" : "auto",
                        }}
                      >
                        {/* Printable Content */}
                        <div
                          className="flex-grow p-4"
                          style={{ maxHeight: "270mm", minHeight: "270mm" }}
                        >
                          {EmptyContainerOffLoadingLetter(container)}
                        </div>

                        <div className="pl-4">
                          <div>
                            <p
                              className="text-black w-full text-left"
                              style={{ fontSize: "10px" }}
                            >
                              This document is non-negotiable and for{" "}
                              <span className="font-bold">
                                KPA and Empty Depot reference only
                              </span>{" "}
                              – not valid for cargo release. <br />
                              Do not accept this Offloading Letter if manually
                              altered. <br />
                              Carriage to ICD Embakasi, Nairobi (whether TBL,
                              Merchant Haulage, or Client nomination) is subject
                              to Kenya Ports Authority terms. <br />
                              The carrier is not responsible for delays, truck
                              detention, demurrage, or incidental costs.
                            </p>
                          </div>
                        </div>

                        {/* Print fix style */}
                        <style jsx>{`
                          .black-text {
                            color: black !important;
                          }

                          @media print {
                            .report-spacing {
                              page-break-after: always;
                            }
                          }
                        `}</style>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </>
                  ))}
                </>
              );
            case "Empty Container Return Notification":
              const emptyContainerReturnNotificationData = Array.isArray(
                EmptyContainerReturnNotificationChunks
              )
                ? EmptyContainerReturnNotificationChunks.filter(Boolean)
                : [];
              return (
                <>
                  {(emptyContainerReturnNotificationData.length > 0
                    ? emptyContainerReturnNotificationData
                    : [undefined]
                  ).map((container, i) => (
                    <>
                      <div
                        key={reportId}
                        ref={(el) => enquiryModuleRefs.current.push(el)}
                        id="Empty Container Return Notification"
                        className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                          }`}
                        style={{
                          width: "210mm",
                          minHeight: "297mm",
                          maxHeight: "297mm",
                          margin: "auto",
                          padding: "24px",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                          position: "relative",
                          pageBreakAfter:
                            index < reportIds.length - 1 ? "always" : "auto",
                        }}
                      >
                        {/* Printable Content */}
                        <div
                          className="flex-grow p-4"
                          style={{ maxHeight: "242mm", minHeight: "242mm" }}
                        >
                          {EmptyContainerReturnNotificationRpt(container)}
                        </div>
                        <div className="w-full pl-4 pr-4">
                          <div>
                            <p
                              className=" underline font-normal border-t border-dashed border-gray-800"
                              style={{ color: "#ff3317", fontSize: "10px" }}
                            >
                              Note:
                            </p>
                            <p
                              className="text-justify font-normal mt-1"
                              style={{ color: "#ff3317", fontSize: "9px" }}
                            >
                              WITHIN THE FREE PERIOD, THE EMPTY CONTAINER MUST
                              BE RETURNED TO THE ADVISED DEPOT AS PER ABOVE
                              INSTRUCTION, CLEAN UNDAMAGED AND COMPLETELY FREE
                              OF CARGO RESIDUES, CHEMICALS, DANGEROUS GOODS
                              PLACARDS (IN ACCORDANCE WITH APPLICABLE
                              REGULATIONS), FUMIGATION LABELS, STOWAGE AIDS AND
                              LASHING ETC. FAILURE TO COMPLY WITH THIS
                              REQUIREMENT MAY RESULT IN ADDITIONAL COSTS FOR
                              ACCOUNT OF THE CARGO. CONTAINERS WILL NOT BE
                              ALLOWED TO GATE OUT AND GATE IN WITHOUT THIS
                              DOCUMENT. SO PLEASE KEEP IT ALONG WITH THE EIR.
                              CONTAINERS WILL NOT BE ACCEPTED INTO THE DEPOT /
                              TERMINAL AFTER THE ABOVE MENTIONED FREE TIME
                              EXPIRY DATE. PLEASE APPROACH OUR OFFICE FOR
                              EXTENSIONS BEFORE THE GATE IN OF THE ABOVE SAID
                              CONTAINERS. THIS DOCUMENT TO BE SHOWED AT
                              TERMINAL/DEPOT ALONG WITH EIR TO ALLOW CONTAINER
                              TO BE GATE IN / OUT.
                            </p>
                            <p
                              className=" font-normal underline mt-2"
                              style={{ color: "#0d23b3", fontSize: "10px" }}
                            >
                              Contact Details:
                            </p>
                            <div
                              className="w-full flex justify-between items-start"
                              style={{ color: "#0d23b3", fontSize: "9px" }}
                            >
                              {/* Left Side: Contact Table */}
                              <div className="w-1/2">
                                <table
                                  className="w-full text-left"
                                  style={{ fontSize: "10px" }}
                                >
                                  <tbody>
                                    <tr>
                                      <td className=" py-1 pr-2">
                                        Import Doc. Team
                                      </td>
                                      <td className="py-1 pr-2">
                                        <a href="mailto:csdimpjed@sea-lead.com">
                                          email: csdimpjed@sea-lead.com
                                        </a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              {/* Right Side: Logo Placeholder
                              <div className="w-1/4 flex items-center justify-center">
                                <div className="border border-dashed border-blue-600 h-24 w-full flex items-center justify-center text-center p-2">
                                  [Logo / Company Info Placeholder]
                                </div>
                              </div> */}
                            </div>
                          </div>
                        </div>

                        {/* Print fix style */}
                        <style jsx>{`
                          .black-text {
                            color: black !important;
                          }

                          @media print {
                            .report-spacing {
                              page-break-after: always;
                            }
                          }
                        `}</style>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </>
                  ))}
                </>
              );
            case "SAUDI DELIVERY ORDER":
              return (
                <>
                  <>
                    <div
                      key={reportId}
                      ref={(el) => enquiryModuleRefs.current.push(el)}
                      id="SAUDI DELIVERY ORDER"
                      className={`relative bg-white shadow-lg black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                        }`}
                      style={{
                        width: "210mm",
                        minHeight: "297mm",
                        maxHeight: "297mm",
                        margin: "auto",
                        padding: "24px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                        pageBreakAfter:
                          index < reportIds.length - 1 ? "always" : "auto",
                      }}
                    >
                      {/* Printable Content */}
                      <div
                        className="flex-grow p-4"
                        style={{ maxHeight: "255mm", minHeight: "255mm" }}
                      >
                        {saudiDeliveryOrderRpt()}
                      </div>
                      <div className="flex-grow p-4">
                        <div>
                          <CompanyImgFooterModule />
                        </div>
                      </div>

                      {/* Print fix style */}
                      <style jsx>{`
                        .black-text {
                          color: black !important;
                        }

                        @media print {
                          .report-spacing {
                            page-break-after: always;
                          }
                        }
                      `}</style>
                    </div>
                    <div className="bg-gray-300 h-2 no-print" />
                  </>
                </>
              );
            case "Delivery Order verification":
              return (
                <>
                  <React.Fragment key={`${reportId}-${index}`}>
                    <div
                      key={reportId}
                      ref={(el) => enquiryModuleRefs.current.push(el)}
                      id="Delivery Order verification"
                      className={`relative rounded-lg bg-[rgb(255,255,255)] text-black
    ring-1 ring-[#787878]/40
    shadow-[0_10px_30px_rgba(0,0,0,0.12)]
    hover:shadow-[0_16px_45px_rgba(0,0,0,0.18)]
    transition-shadow duration-200
    ${index < reportIds.length - 1 ? "report-spacing" : ""}`}
                      style={{
                        width: "70%",
                        margin: "32px auto",
                        padding: "18px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                      }}
                    >
                      <AuthorityLetter />
                      <style jsx>{`
                        /* Remove visual chrome in print */
                        @media print {
                          #Delivery\\ Order\\ verification {
                            width: 210mm;
                            min-height: 297mm;
                            max-height: 297mm;
                            padding: 16mm 14mm;
                            box-shadow: none !important;
                            -webkit-box-shadow: none !important;
                            filter: none !important;
                            border: 1px solid #000 !important; /* optional: keep crisp border in print */
                            ring: 0 !important;
                          }
                          .report-spacing {
                            page-break-after: always;
                          }
                        }
                        @media (max-width: 1024px) {
                          #Delivery\\ Order\\ verification {
                            width: 92%;
                          }
                        }
                      `}</style>
                    </div>
                  </React.Fragment>
                </>
              );
            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}
