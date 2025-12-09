"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import "./rptIGM.css";
import Print from "@/components/Print/page";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
import "@/public/style/reportTheme.css";
import { applyTheme } from "@/utils";
import { getUserDetails } from "@/helper/userDetails";
import { decrypt } from "@/helper/security";

export default function RptIGM() {
  const { clientId } = getUserDetails();
  const enquiryModuleRefs = useRef([]);
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState([]);
  const [igmBlData, setIgmBlData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const rowRefsByGroup = useRef({});
  const [paginatedChunks, setPaginatedChunks] = useState([]);
  const [companyName, setCompanyName] = useState(null);

  useEffect(() => {
    setReportIds(["Import General Manifest"]);
    const storedReportIds = sessionStorage.getItem("selectedReportIds");
    if (storedReportIds) {
      let reportIds = JSON.parse(storedReportIds);
      reportIds = Array.isArray(reportIds) ? reportIds : [reportIds];
      setReportIds(["Import General Manifest"]);
    } else {
      console.log("No Report IDs found in sessionStorage");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const id = searchParams.get("recordId");
      console.log(id);
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const filterCondition = { id: id };
          const response = await fetch(`${baseUrl}/Sql/api/Reports/igmBlData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": JSON.parse(token),
            },
            body: JSON.stringify(filterCondition),
          });
          if (!response.ok) throw new Error("Failed to fetch job data");
          const data = await response.json();
          console.log("Test Cargo", data.data[0]);
          setData(data.data);
          const storedUserData = localStorage.getItem("userData");
          if (storedUserData) {
            const decryptedData = decrypt(storedUserData);
            const userData = JSON.parse(decryptedData);
            const companyName = userData[0]?.companyName;
            if (companyName) {
              setCompanyName(companyName);
            }
          }
        } catch (error) {
          console.error("Error fetching job data:", error);
        }
      }
    };
    if (reportIds.length > 0) {
      fetchData();
    }
  }, [reportIds]);

  function formatDateToYMD(dateStr) {
    if (!dateStr) return ""; // Handles null, undefined, empty string

    const date = new Date(dateStr);

    if (isNaN(date)) return ""; // Handles invalid date strings

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`; // Returns "dd/mm/yyyy"
  }
  console.log("sortedData", sortedData);

  const ImportGeneralManifest = ({ data, index }) => {
    return (
      <>
        {/* Title Section */}
        <div>
          <h1 className="text-center text-black font-bold text-sm">
            IMPORT GENERAL MANIFEST
          </h1>
          <h2 className="text-center text-black font-bold text-sm ">
            CARGO DECLARATION
          </h2>
          <div className="flex w-full">
            <div style={{ width: "52%" }}>
              <h2 className="text-black font-bold text-sm text-right">
                FORM III
              </h2>
            </div>
            <div style={{ width: "48%" }}>
              <p className="text-black text-xs text-right pr-5">
                Page {index + 1}
              </p>
            </div>
          </div>
          <p className="text-center text-black text-xs mt-2">
            See Regulation 3 and 4{" "}
          </p>
        </div>
        {/* Parent Section */}
        <div
          className="flex mt-2"
          style={{ width: "100%", color: "black", fontSize: "9px" }}
        >
          <div style={{ width: "32%" }}>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold ">
                  Name of the Shipping Line:
                </p>
              </div>
              <div style={{ width: "60%" }}>{data[0]?.shippingLine || ""}</div>
            </div>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold text-[9px]">
                  1. Name of the Ship :
                </p>
              </div>
              <div style={{ width: "60%" }}>
                {data[0]?.VesselVoyageName || ""}
              </div>
            </div>
            <div className="flex mb-2">
              <div className="text-[9px]" style={{ width: "40%" }}>
                <p className="text-black font-bold text-[9px]">
                  3. Nationality of Ship :{" "}
                </p>
              </div>
              <div className="text-[9px]" style={{ width: "60%" }}></div>
            </div>
          </div>
          <div style={{ width: "32%" }}>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold ">Name of the Agent :</p>
              </div>
              <div style={{ width: "60%" }}>{companyName || ""}</div>
            </div>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold ">
                  2. Port where report is made :
                </p>
              </div>
              <div style={{ width: "60%" }}>{data[0]?.pod || ""}</div>
            </div>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold">4. Name of the Master :</p>
              </div>
              <div style={{ width: "60%" }}></div>
            </div>
          </div>
          <div style={{ width: "19%" }}>
            <div className="flex mt-6">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold">5 Port of Loading :</p>
              </div>
              <div style={{ width: "60%" }}>
                <p className="text-black">{data[0]?.pol || ""}</p>
              </div>
            </div>
          </div>
          <div style={{ width: "17%" }}>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold">IGM No.:</p>
              </div>
              <div style={{ width: "60%" }}>{data[0]?.igmNo || ""}</div>
            </div>
            <div className="flex mb-2">
              <div style={{ width: "40%" }}>
                <p className="text-black font-bold ">IGM Date:</p>
              </div>
              <div style={{ width: "60%" }}>
                {formatDateToYMD(data[0]?.igmDate)}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const ImportGeneralManifestGrid = ({
    sortedData,
    groupedHeaderName,
    groupKey,
    rowRefsByGroup,
    hideHeaderData,
  }) => {
    if (!rowRefsByGroup.current[groupKey]) {
      rowRefsByGroup.current[groupKey] = [];
    }

    return (
      <>
        {/* Header Row */}
        <div
          className="flex mt-2 border-black border-t border-b border-l border-r"
          style={{ width: "100%", color: "black", fontSize: "8px" }}
        >
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            6.Line No
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            7. B/L No. and Date
          </div>
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            8. No.and Nature of Packages
          </div>
          <div className="border-black border-r p-1" style={{ width: "15%" }}>
            9. Marks and Numbers
          </div>
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            10. Gross Wt. (Kgs.)
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            11. Description of goods
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            12. Name of Consignee/Importer, If different
          </div>
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            13. Date of presentation of bill of entry
          </div>
          <div className="border-black border-r p-1" style={{ width: "5%" }}>
            14. Name of Custom House Agents
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            15. Rotation No.: Cash/Deposit W.R.N
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            16. No. of Packages on which duty colld or warehoused
          </div>
          <div className="border-black border-r p-1" style={{ width: "10%" }}>
            17. Year: (To be filled by Port Trust) No. of packages discharged
          </div>
          <div className="p-1" style={{ width: "5%" }}>
            18. Remarks
          </div>
        </div>

        {/* Summary Info */}
        {groupedHeaderName && (
          <>
            <div
              className="text-center mt-1 mb-1 font-bold"
              style={{ fontSize: "8px" }}
            >
              <p className="text-black">
                {groupedHeaderName.movementCarrier} CARGO FROM{" "}
                {groupedHeaderName.plrName} TO {groupedHeaderName.fpdName} VIA{" "}
                {/* {groupedHeaderName.fpdName} */}
                {data[0]?.pod || ""}
              </p>
              <p className="text-black">
                EX VESSEL {data[0]?.polVessel} VOYAGE {data[0]?.polVoyage}
              </p>
            </div>
            <hr className="hrRow border-black border-bold" />
          </>
        )}

        {/* Table Body Rows */}
        {sortedData.map((item, index) => (
          <React.Fragment key={index}>
            {!hideHeaderData && (
              <div
                ref={(el) => (rowRefsByGroup.current[groupKey][index] = el)}
                className="flex"
                style={{ fontSize: "9px", color: "black" }}
              >
                <div className="p-1 wordBreak" style={{ width: "5%" }}>
                  <div className="wordBreak">
                    <p className="wordBreak" style={{ fontSize: "8px" }}>
                      {item.movementCarrier || ""}
                      <br />
                      <br />
                      {item.lineNo || ""}
                    </p>
                  </div>
                </div>
                <div className="p-1 wordBreak" style={{ width: "10%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.blNo || ""}
                    <br /> {formatDateToYMD(item.blData)}
                  </p>
                </div>
                <div className="p-1 wordBreak" style={{ width: "5%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.noOfPackages || ""} <br />{" "}
                    {item.commodityTypeName || ""}
                  </p>
                </div>
                <div className="p-1 wordBreak" style={{ width: "15%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.marksNos || ""}
                  </p>
                </div>
                <div className="p-1" style={{ width: "5%" }}>
                  {item.grossWt || ""}
                </div>
                <div className="p-1" style={{ width: "25%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.goodsDesc || ""}
                  </p>
                </div>
                <div className="p-1" style={{ width: "35%" }}>
                  <div className="wordBreak">
                    <p className="wordBreak" style={{ fontSize: "8px" }}>
                      {item.consigneeText || ""}
                      {item.consigneeAddress || ""}
                    </p>
                  </div>
                  <div className="mt-2 wordBreak">
                    <p className="wordBreak" style={{ fontSize: "8px" }}>
                      {item.notifyPartyName || ""}
                      {item.notifyPartyAddress || ""}
                    </p>
                  </div>
                </div>
                <div className="p-1" style={{ width: "5%" }}>
                  <p className="wordBreak" style={{ fontSize: "8px" }}>
                    {item.remarks || ""}
                  </p>
                </div>
              </div>
            )}
            {item.tblBlContainer?.length > 0 &&
              item.tblBlContainer.map((containerItem, containerIndex) => (
                <div
                  key={containerIndex}
                  className="flex"
                  style={{ fontSize: "8px", color: "black", width: "30%" }}
                >
                  <div style={{ width: "18%" }}>
                    {containerItem.containerNo || ""}
                  </div>
                  <div style={{ width: "6%" }}>
                    {containerItem.containerSize || ""}
                  </div>
                  <div style={{ width: "13%" }}>
                    {containerItem.containerStatusName || ""}
                  </div>
                  <div style={{ width: "20%" }}>
                    {containerItem.containerSealNo || ""}
                  </div>
                  <div style={{ width: "10%" }}>
                    {containerItem.noOfPackagesAndPackageType || ""}
                  </div>
                </div>
              ))}
          </React.Fragment>
        ))}
      </>
    );
  };

  const ImportGeneralManifestFooter = ({ sortedData }) => {
    return (
      <>
        <div className="mt-6 mb-2" style={{ fontSize: "9px", width: "70%" }}>
          <p className="text-black" style={{ fontSize: "9px" }}>
            We hereby ceritify that Item List are on account of our principals.
            We, as agents are responsible for the cargo manifested under the
            above items and will be liable for any penalty or other dues in case
            of any shortland / survey shortages. We ceritify that all items
            indicated on this hard copy of IGM have been fully represented in
            the magnetic medium.
          </p>
        </div>
        <div className="flex mt-4">
          <p className="text-black" style={{ fontSize: "9px" }}>
            To be filled by Customs house
          </p>
          <p className="text-black ml-8" style={{ fontSize: "9px" }}>
            Date and Signature by the Master, authorized agent
          </p>
        </div>
        <div>
          <p className="text-black mt-4" style={{ fontSize: "9px" }}>
            For {companyName || ""}
          </p>
        </div>
        <div>
          <p className="text-black mt-15" style={{ fontSize: "9px" }}>
            As Agents
          </p>
        </div>
      </>
    );
  };
  // Constants used throughout for pagination calculation
  const PAGE_HEIGHT = 791; // virtual full page height
  const HEADER_HEIGHT = 140; // header space
  const FOOTER_HEIGHT = 90; // footer space (when visible)
  const DEFAULT_ROW_HEIGHT = 55; // base row height
  const CONTAINER_ROW_HEIGHT = 20; // each container row height
  const PAGE_SAFETY_MARGIN = 40; // extra safety so nothing overflows

  function groupSortedBlData(sortedData) {
    // --- helpers ---
    const carrierRank = (v) => {
      const s = String(v ?? "")
        .trim()
        .toUpperCase();
      if (s === "LOCAL") return 0;
      if (s === "SMTP") return 1;
      if (s === "TP") return 2;
      if (s === "") return 3; // empty last
      return 4; // anything else after empty
    };

    const text = (v) => String(v ?? "");

    const toNum = (v) => {
      if (v == null || v === "") return Infinity;
      const n = Number(String(v).replace(/,/g, "").trim());
      return Number.isFinite(n) ? n : Infinity;
    };

    const getPLR = (o) => o.plrName ?? o.plr ?? "";
    const getFPD = (o) => o.fpdName ?? o.fpd ?? "";

    console.log("🔹 Input data:", sortedData);

    // >>> Correct comparator: carrier → PLR → FPD → lineNo <<<
    const arr = [...(sortedData || [])].sort((a, b) => {
      const r1 =
        carrierRank(a.movementCarrier) - carrierRank(b.movementCarrier);

      const r2 = text(getPLR(a)).localeCompare(text(getPLR(b)), undefined, {
        sensitivity: "base",
      });

      const r3 = text(getFPD(a)).localeCompare(text(getFPD(b)), undefined, {
        sensitivity: "base",
      });

      const r4 = toNum(a.lineNo) - toNum(b.lineNo); // now last

      const total = r1 || r2 || r3 || r4;

      console.log(
        "⚖️ Compare (carrier → PLR → FPD → lineNo):",
        {
          aLine: a.lineNo,
          bLine: b.lineNo,
          aPlr: getPLR(a),
          bPlr: getPLR(b),
          aFpd: getFPD(a),
          bFpd: getFPD(b),
        },
        { r1_carrier: r1, r2_plr: r2, r3_fpd: r3, r4_lineNo: r4, total }
      );

      return total;
    });

    console.log(
      "✅ After sort:",
      arr.map((x) => ({
        lineNo: x.lineNo,
        plr: getPLR(x),
        fpd: getFPD(x),
        carrier: x.movementCarrier,
      }))
    );

    // --- grouping ---
    const groups = [];
    let currentGroupKey = null;
    let currentGroup = [];

    for (const item of arr) {
      const groupKey = [
        item.movementCarrier || "",
        getPLR(item),
        getFPD(item),
      ].join("|||");

      console.log("➡️ Processing item:", {
        lineNo: item.lineNo,
        groupKey,
      });

      if (groupKey !== currentGroupKey) {
        if (currentGroup.length > 0) {
          console.log(
            "📦 Pushing group:",
            currentGroupKey,
            "size:",
            currentGroup.length
          );
          groups.push({
            movementCarrier: currentGroup[0].movementCarrier || "",
            plrName: getPLR(currentGroup[0]),
            fpdName: getFPD(currentGroup[0]),
            VesselVoyageName: currentGroup[0].VesselVoyageName || "",
            igmNo: currentGroup[0].igmNo ?? "",
            igmDate: currentGroup[0].igmDate ?? "",
            lineNo: currentGroup[0].lineNo ?? "",
            records: currentGroup,
          });
        }
        currentGroupKey = groupKey;
        currentGroup = [item];
      } else {
        currentGroup.push(item);
      }
    }

    if (currentGroup.length > 0) {
      console.log(
        "📦 Pushing last group:",
        currentGroupKey,
        "size:",
        currentGroup.length
      );
      groups.push({
        movementCarrier: currentGroup[0].movementCarrier || "",
        plrName: getPLR(currentGroup[0]),
        fpdName: getFPD(currentGroup[0]),
        VesselVoyageName: currentGroup[0].VesselVoyageName || "",
        igmNo: currentGroup[0].igmNo ?? "",
        igmDate: currentGroup[0].igmDate ?? "",
        lineNo: currentGroup[0].lineNo ?? "",
        records: currentGroup,
      });
    }

    console.log("🏁 Final groups:", groups);
    return groups;
  }

  console.log("sortedData", sortedData);

  function estimateRecordHeight(record) {
    const goodsDescLines = Math.ceil((record.goodsDesc?.length || 0) / 45);
    const marksLines = Math.ceil((record.marksNos?.length || 0) / 60);
    const consigneeLines = Math.ceil(
      ((record.consigneeText?.length || 0) +
        (record.consigneeAddress || "").length) /
        70
    );

    const containerHeight =
      (record.tblBlContainer?.length || 0) * CONTAINER_ROW_HEIGHT;

    // a bit more conservative line height now
    const textHeight = (goodsDescLines + marksLines + consigneeLines) * 13;

    return DEFAULT_ROW_HEIGHT + textHeight + containerHeight;
  }

  function chunkRecordsByHeight(
    records,
    rowRefsByGroup = {},
    groupKey = "",
    showFooterOnLastChunk = true
  ) {
    const chunks = [];
    let currentChunk = [];
    let currentHeight = 0;

    const calcBodyHeight = (isLastChunk = false) =>
      PAGE_HEIGHT -
      HEADER_HEIGHT -
      (isLastChunk && showFooterOnLastChunk ? FOOTER_HEIGHT : 0) -
      PAGE_SAFETY_MARGIN; // 👈 safety so nothing touches bottom

    const estimatedHeights = records.map(estimateRecordHeight);
    let index = 0;

    while (index < records.length) {
      const record = records[index];
      const estimatedHeight = estimatedHeights[index];
      const isLastRecord = index === records.length - 1;
      const isEmptyChunk = currentChunk.length === 0;
      const pageBodyHeight = calcBodyHeight(isLastRecord && isEmptyChunk);

      // If record is too tall, split containers
      if (estimatedHeight > pageBodyHeight) {
        const containerCount = record.tblBlContainer?.length || 0;
        const usableHeight = pageBodyHeight;

        // 🛠️ Increase maxContainersPerPage by ensuring full height is utilized
        const maxContainersPerPage = Math.floor(
          (usableHeight - DEFAULT_ROW_HEIGHT - 30) / CONTAINER_ROW_HEIGHT
        );

        const totalChunks = Math.ceil(containerCount / maxContainersPerPage);

        for (let i = 0; i < totalChunks; i++) {
          const slicedContainers = record.tblBlContainer.slice(
            i * maxContainersPerPage,
            (i + 1) * maxContainersPerPage
          );

          const partialRecord = {
            ...record,
            tblBlContainer: slicedContainers,
            isSplit: true,
            hideHeader: i > 0,
            hideHeaderData: i > 0,
            splitIndex: i + 1,
            splitTotal: totalChunks,
          };

          chunks.push([partialRecord]);
        }

        index++;
        continue;
      }

      // If record fits in current page
      if (currentHeight + estimatedHeight <= pageBodyHeight) {
        currentChunk.push(record);
        currentHeight += estimatedHeight;
        index++;
      } else {
        // Finish current page
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }
        currentChunk = [];
        currentHeight = 0;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  useEffect(() => {
    if (data?.length > 0) {
      const grouped = groupSortedBlData(data);

      console.log("✅ Grouped sortedData:", grouped);
      console.log(`🔢 Total Groups: ${grouped.length}`);

      grouped.forEach((g, i) => {
        const key = `${g.movementCarrier || ""} | ${g.plrName || ""} → ${
          g.fpdName || ""
        }`;
        console.log(`📦 Group ${i + 1}: ${key} - ${g.records.length} records`);
      });

      setSortedData(grouped);
    }
  }, [data]);

  useEffect(() => {
    if (!sortedData.length) {
      setPaginatedChunks([]);
      return;
    }

    const newChunks = [];

    sortedData.forEach((group) => {
      const groupKey = [
        group.movementCarrier || "",
        group.plrName || "",
        group.fpdName || "",
      ].join("|||");

      const recordChunks = chunkRecordsByHeight(
        group.records || [],
        rowRefsByGroup,
        groupKey,
        true // showFooterOnLastChunk (for height calc only)
      );

      recordChunks.forEach((chunk, index) => {
        const isLastChunkOfGroup = index === recordChunks.length - 1;

        newChunks.push({
          movementCarrier: group.movementCarrier,
          plrName: group.plrName,
          fpdName: group.fpdName,
          groupKey,
          chunkIndex: index,
          isLastChunkOfGroup, // still keep if you need it for debug
          isLastCarrierChunk: false, // we'll fill this in below
          records: chunk,
        });
      });
    });

    // 🔹 Mark the last page for each movementCarrier
    const lastIndexByCarrier = {};
    newChunks.forEach((chunk, idx) => {
      const carrier = chunk.movementCarrier || "";
      lastIndexByCarrier[carrier] = idx; // last occurrence wins
    });

    Object.entries(lastIndexByCarrier).forEach(([carrier, lastIdx]) => {
      if (newChunks[lastIdx]) {
        newChunks[lastIdx].isLastCarrierChunk = true;
      }
    });

    setPaginatedChunks(newChunks);
  }, [sortedData]);

  console.log("sortedData", sortedData);
  console.log("paginatedChunks", paginatedChunks);
  console.log("sortedData", sortedData);

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
            case "Import General Manifest":
              const PAGE_HEIGHT_PX = 650;
              const headerHeight = 160;
              const footerHeight = 120;
              const rowBaseHeight = 70;
              const CONTAINER_ROW_HEIGHT = 20;

              function estimateRecordHeight(record) {
                const goodsDescLines = Math.ceil(
                  (record.goodsDesc?.length || 0) / 40
                );
                const marksLines = Math.ceil(
                  (record.marksNos?.length || 0) / 50
                );
                const consigneeLines = Math.ceil(
                  ((record.consigneeText?.length || 0) +
                    (record.consigneeAddress?.length || 0)) /
                    60
                );
                const containerLines =
                  (record.tblBlContainer?.length || 0) * CONTAINER_ROW_HEIGHT;
                const textHeight =
                  (goodsDescLines + marksLines + consigneeLines) * 15;
                return DEFAULT_ROW_HEIGHT + textHeight + containerLines;
              }

              const chunks = [];

              sortedData.forEach((groupItem) => {
                const { movementCarrier, plrName, fpdName, records } =
                  groupItem;
                const groupKey = [
                  movementCarrier || "",
                  plrName || "",
                  fpdName || "",
                ].join("|||");

                // ✅ Ensure records is an array
                if (!Array.isArray(records)) {
                  console.warn(
                    "Skipping groupItem due to invalid records array:",
                    groupItem
                  );
                  return;
                }

                let currentHeight = 0;
                let pageRecords = [];

                records.forEach((record) => {
                  const containerCount = record.tblBlContainer?.length || 0;
                  const totalRowHeight = estimateRecordHeight(record);

                  // 🔁 Case: Record too tall for a single page → split containers
                  if (
                    totalRowHeight >
                    PAGE_HEIGHT_PX - headerHeight - footerHeight
                  ) {
                    const maxContainersPerPage = Math.floor(
                      (PAGE_HEIGHT_PX -
                        headerHeight -
                        footerHeight -
                        rowBaseHeight) /
                        CONTAINER_ROW_HEIGHT
                    );
                    const totalChunks = Math.ceil(
                      containerCount / maxContainersPerPage
                    );

                    for (let i = 0; i < totalChunks; i++) {
                      const slicedContainers =
                        record.tblBlContainer?.slice(
                          i * maxContainersPerPage,
                          (i + 1) * maxContainersPerPage
                        ) || [];

                      const partialRecord = {
                        ...record,
                        tblBlContainer: slicedContainers,
                        isSplit: true,
                        hideHeader: i > 0,
                        hideHeaderData: i > 0,
                        splitIndex: i + 1,
                        splitTotal: totalChunks,
                      };

                      chunks.push({
                        groupKey,
                        movementCarrier,
                        plrName,
                        fpdName,
                        records: [partialRecord],
                      });
                    }
                  } else {
                    // 🔁 Case: Accumulate records by total height until page full
                    if (
                      currentHeight + totalRowHeight >
                      PAGE_HEIGHT_PX - headerHeight - footerHeight
                    ) {
                      // Push current chunk and reset
                      chunks.push({
                        groupKey,
                        movementCarrier,
                        plrName,
                        fpdName,
                        records: pageRecords,
                      });
                      currentHeight = totalRowHeight;
                      pageRecords = [record];
                    } else {
                      pageRecords.push(record);
                      currentHeight += totalRowHeight;
                    }
                  }
                });

                // ✅ Push remaining pageRecords if any
                if (pageRecords.length > 0) {
                  chunks.push({
                    groupKey,
                    movementCarrier,
                    plrName,
                    fpdName,
                    records: pageRecords,
                  });
                }
              });

              // Log grouped sorted data
              console.log("📊 Sorted Data (grouped):");
              sortedData.forEach((group, i) => {
                const key = `${group.movementCarrier || ""} | ${
                  group.plrName || ""
                } → ${group.fpdName || ""}`;
                console.log(`🧩 Group ${i + 1}: ${key}`);
                console.log(`  └─ Records: ${group.records.length}`);
              });

              // Log paginated chunks
              console.log("📄 Paginated Chunks:");
              paginatedChunks.forEach((chunk, i) => {
                const key = `${chunk.groupKey || ""}`;
                console.log(`📃 Page ${i + 1} [Group: ${key}]`);
                console.log(`  └─ Records: ${chunk.records.length}`);
                console.log(
                  `  └─ isLastChunkOfGroup: ${chunk.isLastChunkOfGroup}`
                );
              });

              return (
                <>
                  <div className="flex flex-col items-center gap-4 bg-gray-300 min-h-screen">
                    {chunks.map((group, chunkIndex) => {
                      const isLastChunkOfGroup =
                        chunkIndex ===
                        chunks.reduce((lastIdx, g, idx) => {
                          return g.groupKey === group.groupKey ? idx : lastIdx;
                        }, -1);

                      if (!paginatedChunks.length) return null;

                      return (
                        <>
                          <div className="flex flex-col items-center gap-4 bg-gray-300 min-h-screen">
                            {paginatedChunks.map((group, chunkIndex) => {
                              const {
                                groupKey,
                                movementCarrier,
                                plrName,
                                fpdName,
                                records,
                                isLastCarrierChunk, // 👈 use carrier-level flag
                              } = group;

                              return (
                                <React.Fragment key={`page-${chunkIndex}`}>
                                  <div
                                    ref={(el) =>
                                      (enquiryModuleRefs.current[chunkIndex] =
                                        el)
                                    }
                                    className="bg-white shadow-md p-4 border border-gray-300 print:break-after-page relative mb-8"
                                    style={{
                                      width: "297mm",
                                      height: "210mm",
                                      boxSizing: "border-box",
                                      display: "flex",
                                      flexDirection: "column",
                                      margin: "auto",
                                      overflow: "hidden",
                                      pageBreakAfter: "always",
                                    }}
                                  >
                                    {/* Header */}
                                    <ImportGeneralManifest
                                      data={records}
                                      index={chunkIndex}
                                    />

                                    {/* Detail grid */}
                                    <ImportGeneralManifestGrid
                                      sortedData={records}
                                      groupedHeaderName={{
                                        movementCarrier,
                                        plrName,
                                        fpdName,
                                      }}
                                      groupKey={groupKey}
                                      rowRefsByGroup={rowRefsByGroup}
                                      hideHeaderData={
                                        records[0]?.hideHeaderData
                                      }
                                    />

                                    {/* Footer only on last page of that movementCarrier (LOCAL block, TP block, etc.) */}
                                    {isLastCarrierChunk && (
                                      <ImportGeneralManifestFooter
                                        sortedData={records}
                                      />
                                    )}
                                  </div>

                                  {/* small gap between pages in on-screen view */}
                                  <div className="bg-gray-300 h-2 no-print" />
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </>
                      );
                    })}
                  </div>
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
