"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import "./rptCargoManifest.css";
import Print from "@/components/Print/page";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
import "@/public/style/reportTheme.css";
import { getUserDetails } from "@/helper/userDetails";
import { decrypt } from "@/helper/security";

export default function RptIGM() {
  const { clientId } = getUserDetails();
  const enquiryModuleRefs = useRef([]);
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  const [companyName, setCompanyName] = useState(null);
  const [data, setData] = useState([]);

  const MAX_CONTAINERS_PER_PAGE_MAIN = 13;
  const MAX_CONTAINERS_PER_PAGE_ATTACH = 45;

  useEffect(() => {
    setReportIds(["Cargo Manifest Report"]);
    const storedReportIds = sessionStorage.getItem("selectedReportIds");
    if (storedReportIds) {
      let reportIds = JSON.parse(storedReportIds);
      reportIds = Array.isArray(reportIds) ? reportIds : [reportIds];
      setReportIds(["Cargo Manifest Report"]);
    } else {
      console.log("No Report IDs found in sessionStorage");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const id = searchParams.get("recordId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const filterCondition = { id: id };
          const response = await fetch(
            //`${baseUrl}/Sql/api/Reports/cargoManifestBldata`,
            `${baseUrl}/Sql/api/Reports/igmBlData`,
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
          const data = await response.json();
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

  console.log("Report data", data);

  // put this near the component top
  const renderMultiline = (txt) => {
    console.log("🚀 Original txt:", txt);

    if (!txt) return "";

    // Convert literal \n or /n to real newline
    const normalized = String(txt).replace(/\\n|\/n/g, "\n");
    console.log("✅ Normalized:", normalized);

    // Split and remove empty lines
    const parts = normalized.split("\n").filter((line) => line.trim() !== "");
    console.log("📜 Filtered parts:", parts);

    return parts.map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < parts.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const CargoManifestHeader = ({ data }) => {
    return (
      <>
        <div
          style={{ width: "100%", color: "black", fontSize: "8px" }}
          className="flex w-full p-1 pt-2 border-t border-black border-b"
        >
          {/* Left Block – 25% */}
          <div style={{ width: "25%" }} className="flex">
            <div style={{ width: "35%", fontSize: "8px" }}>
              <p className="text-black font-bold">PLACE OF ISSUE:</p>
            </div>
            <div style={{ width: "65%" }}>{data?.polName || ""}</div>
          </div>

          {/* Right Block – 75% */}
          <div style={{ width: "75%", fontSize: "8px" }} className="flex">
            <div style={{ width: "10%" }}>
              <p className="text-black font-bold">SLOT OWNER:</p>
            </div>
            <div style={{ width: "90%" }}>{data?.slotOwnerName || ""}</div>
          </div>
        </div>
        {/* new table 2 */}
        <div
          style={{ width: "100%", color: "black", fontSize: "8px" }}
          className="flex w-full border-black border-b min-h-[50px] max-h-[50px]"
        >
          {/* first part */}
          <div
            style={{ width: "26%", fontSize: "8px" }}
            className="border-black border-r pl-1"
          >
            <div className="pt-2">
              <p className="text-black font-bold">VESSEL / VOYAGE </p>
            </div>
            <div>
              <p className="text-black">
                {data?.polVessel || ""}
                {" / "}
                {data?.polVoyage || ""}
              </p>
            </div>
            <div style={{ width: "100%" }} className="flex">
              <div style={{ width: "20%" }}>
                <p className="font-bold">SAIL DATE</p>
              </div>
              <div style={{ width: "80%" }}>
                <p>{data?.sailDate || ""}</p>
              </div>
            </div>
          </div>
          {/* Second part */}
          <div
            style={{ width: "27%", fontSize: "8px" }}
            className="border-black border-r flex"
          >
            <div
              style={{ width: "50%" }}
              className="pt-2 pl-1 border-black border-r"
            >
              <div>
                <p className="text-black font-bold">PLACE OF RECEIPT </p>
              </div>
              <div>
                <p className="text-black">{data?.plr || ""}</p>
              </div>
            </div>
            <div style={{ width: "50%" }} className="pt-2 pl-1">
              <div>
                <p className="text-black font-bold">LOADING PORT </p>
              </div>
              <div>
                <p className="text-black">{data?.pol || ""}</p>
              </div>
            </div>
          </div>
          {/* Third part */}
          <div
            style={{ width: "30%", fontSize: "8px" }}
            className="border-black border-r flex"
          >
            <div
              style={{ width: "50%" }}
              className="pt-2 pl-1 border-black border-r"
            >
              <div>
                <p className="text-black font-bold">DISCHARGE PORT</p>
              </div>
              <div>
                <p className="text-black">{data?.pod || ""}</p>
              </div>
            </div>
            <div style={{ width: "50%" }} className="pt-2 pl-1">
              <div>
                <p className="text-black font-bold">FINAL DESTINATION</p>
              </div>
              <div>
                <p className="text-black">{data?.fpd || ""}</p>
              </div>
            </div>
          </div>
          {/* Fourth part */}
          <div style={{ width: "17%", fontSize: "8px" }} className="pt-2 pl-1">
            <div>
              <p className="text-black font-bold">NO. OF ORIGINAL B/L's</p>
            </div>
            <div>
              <p className="text-black text-center">3</p>
            </div>
          </div>
        </div>
        {/* new table 3 */}
      </>
    );
  };

  const CargoManifestMiddleGrid = ({ data }) => {
    return (
      <>
        <div
          style={{
            width: "100%",
            color: "black",
            fontSize: "8px",
            display: "flex",
            minHeight: "400px",
          }}
          className="border-black border-b"
        >
          {/* SHIPPER / CONSIGNEE / NOTIFY */}
          <div
            style={{ width: "26%" }}
            className="border-black border-r pl-1 pt-2"
          >
            <div>
              {/* SHIPPER */}
              <div className="pb-2">
                <p className="font-bold uppercase">SHIPPER</p>
                <p
                  className="pb-2 whitespace-pre-line pr-1"
                  style={{ fontSize: "8px" }}
                >
                  {data?.shipperName || ""}
                </p>
              </div>

              {/* CONSIGNEE */}
              <div className="pb-2">
                <p className="font-bold uppercase">CONSIGNEE</p>
                <p
                  className="pb-2 whitespace-pre-line pr-1"
                  style={{ fontSize: "8px" }}
                >
                  {data?.consigneeText || ""}
                  <br />
                  {data?.consigneeAddress || ""}
                </p>
              </div>

              {/* NOTIFY 1 */}
              <div className="pb-2">
                <p className="font-bold uppercase">NOTIFY 1</p>
                <p
                  className="whitespace-pre-line pr-1"
                  style={{ fontSize: "8px" }}
                >
                  {data?.notifyPartyName || ""}
                  <br />
                  {data?.notifyPartyAddress || ""}
                </p>
              </div>
            </div>
          </div>

          {/* NO. AND KIND OF PACKAGES + B/L NO. & DATE + MARKS & NUMBER */}
          <div style={{ width: "27%" }} className="border-black border-r">
            {/* TOP ROW */}
            <div className="flex border-black border-b text-black text-[9px]">
              {/* NO. AND KIND OF PACKAGES */}
              <div
                style={{ width: "50%" }}
                className="pl-1 border-black border-r pt-1"
              >
                <p className="font-bold uppercase">NO. AND KIND OF PACKAGES</p>
                <p>{data?.noOfPackages || ""} </p>
              </div>

              {/* B/L NO. & DATE */}
              <div style={{ width: "50%" }} className="pl-1 pt-1">
                <p className="font-bold uppercase">B/L NO. & DATE</p>
                <p>{data?.blNo || ""}</p>
                <p>{data?.blData || ""}</p>
              </div>
            </div>

            {/* MARKS & NUMBER */}
            <div className="pl-1 pt-1">
              <p className="font-bold uppercase">MARKS & NUMBER</p>
              <p>{data?.marksNos || ""}</p>
              {renderMultiline(data?.marksNos || data?.marksNos || "")}
            </div>
          </div>

          {/* DESCRIPTION OF GOODS */}
          <div style={{ width: "30%" }} className="border-black border-r pt-2">
            <p className="text-black text-center border-black border-b font-bold pb-1 uppercase">
              DESCRIPTION OF GOODS
            </p>
            <p className="text-black px-1 whitespace-pre-line">
              {renderMultiline(data?.goodsDesc || data?.goodsDesc || "")}
            </p>
          </div>

          {/* GROSS WT / NET WT */}
          <div
            style={{ width: "17%" }}
            className="border-black text-[9px] text-black"
          >
            {/* Header Row */}
            <div className="flex border-black text-center font-bold uppercase">
              <div
                style={{ width: "50%" }}
                className="border-r border-black border-b p-1"
              >
                GROSS WT
                <br />
                KGS
              </div>
              <div
                style={{ width: "50%" }}
                className="p-1 border-black border-b"
              >
                NET WT
                <br />
                KGS
              </div>
            </div>

            {/* Value Row */}
            <div className="flex border-b border-black text-center">
              <div
                style={{ width: "50%" }}
                className="border-r border-black  p-1"
              >
                {data?.grossWt || ""} {data?.grossWtUnitCode || ""}
              </div>
              <div style={{ width: "50%" }} className="p-1">
                {data?.netWt || ""}
              </div>
            </div>

            {/* Cargo Type */}
            <div className="p-1 border-b border-black">
              <p className="font-bold uppercase">Cargo Type</p>
              <p>{data?.cargoType || ""}</p>
            </div>
          </div>
        </div>
      </>
    );
  };

  const CargoManifestContainerGrid = ({ data }) => {
    return (
      <>
        <div className="flex" style={{ width: "100%" }}>
          <div style={{ width: "53%", borderRight: "1px solid black" }}>
            <table className="w-full">
              <thead>
                <tr>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    CONTAINER NO.
                  </th>
                  <th
                    className="p-1 border-b border-black  text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    Size / TYPE
                  </th>
                  <th
                    className="p-1 border-b border-black  text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    ISO Code
                  </th>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    SEAL NO.
                  </th>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    NET WT.
                  </th>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    TARE WT.
                  </th>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    GROSS WT.
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.tblBlContainer?.map((item, index) => (
                  <tr className="text-center">
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.containerNo || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.containerSize || ""}
                      {" / "}
                      {item?.ContainerType || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.isoCode || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.containerSealNo || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.netWt || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.tareWt || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.containerGrossWT || ""}{" "}
                      {item?.containerGrossWTUnit || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ width: "47%" }}>
            <p className="text-black"></p>
          </div>
        </div>
      </>
    );
  };

  const CargoManifestContainerAttachSheet = ({ data }) => {
    return (
      <>
        <div className="flex" style={{ width: "100%" }}>
          <div style={{ width: "53%", borderRight: "1px solid black" }}>
            <table className="w-full border-t border-black">
              <thead>
                <tr>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    CONTAINER NO.
                  </th>
                  <th
                    className="p-1 border-b border-black  text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    Size / TYPE
                  </th>
                  <th
                    className="p-1 border-b border-black  text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    ISO Code
                  </th>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    SEAL NO.
                  </th>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    NET WT.
                  </th>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    TARE WT.
                  </th>
                  <th
                    className="p-1 border-b border-black text-black font-bold"
                    style={{ fontSize: "8px" }}
                  >
                    GROSS WT.
                  </th>
                </tr>
              </thead>
              <tbody>
                {data?.tblBlContainer?.map((item, index) => (
                  <tr className="text-center">
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.containerNo || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.containerSize || ""}
                      {" / "}
                      {item?.ContainerType || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.isoCode || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.containerSealNo || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.netWt || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.tareWt || ""}
                    </td>
                    <td
                      className="border-b border-black text-black"
                      style={{ fontSize: "8px", padding: "2px" }}
                    >
                      {item?.containerGrossWT || ""}{" "}
                      {item?.containerGrossWTUnit || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ width: "47%" }}>
            <p className="text-black"></p>
          </div>
        </div>
      </>
    );
  };

  const chunkArray = (arr = [], size) => {
    if (!Array.isArray(arr) || size <= 0) return [];
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

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
            case "Cargo Manifest Report":
              return data.map((dataItem, dataIdx) => {
                const containersAll = Array.isArray(dataItem?.tblBlContainer)
                  ? dataItem.tblBlContainer
                  : [];

                // Main page keeps 14
                const firstChunk = containersAll.slice(
                  0,
                  MAX_CONTAINERS_PER_PAGE_MAIN
                );

                // Attach sheets get 20 each
                const restChunks = chunkArray(
                  containersAll.slice(MAX_CONTAINERS_PER_PAGE_MAIN),
                  MAX_CONTAINERS_PER_PAGE_ATTACH
                );

                return (
                  <React.Fragment key={`${dataItem.blNo || dataIdx}-wrap`}>
                    {/* MAIN PAGE */}
                    <div
                      ref={(el) => {
                        if (el) enquiryModuleRefs.current.push(el);
                      }}
                      className="bg-white shadow-md p-4 print:break-after-page relative mb-8"
                      style={{
                        width: "297mm",
                        height: "210mm",
                        boxSizing: "border-box",
                        display: "flex",
                        margin: "auto",
                        pageBreakAfter: "always",
                      }}
                    >
                      <div
                        className="border border-black h-full !w-full"
                        style={{ height: "100%" }}
                      >
                        <h1 className="text-center text-black font-bold text-lg tracking-wide">
                          CARGO MANIFEST
                        </h1>
                        <div>
                          <CargoManifestHeader data={dataItem} />
                          <CargoManifestMiddleGrid data={dataItem} />
                          <CargoManifestContainerGrid
                            data={{ ...dataItem, tblBlContainer: firstChunk }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* ATTACH SHEETS (20 rows each) */}
                    {restChunks.map((c, i) => (
                      <React.Fragment
                        key={`${dataItem.blNo || dataIdx}-att-wrap-${i}`}
                      >
                        <div className="bg-gray-300 h-2 no-print" />
                        <div
                          ref={(el) => {
                            if (el) enquiryModuleRefs.current.push(el);
                          }}
                          className="bg-white shadow-md p-4 print:break-after-page relative mb-8"
                          style={{
                            width: "297mm",
                            height: "210mm",
                            boxSizing: "border-box",
                            display: "flex",
                            margin: "auto",
                            pageBreakAfter: "always",
                          }}
                        >
                          <div
                            className="border border-black h-full !w-full"
                            style={{ height: "100%" }}
                          >
                            <h1 className="text-center text-black font-bold text-lg tracking-wide">
                              CARGO MANIFEST
                            </h1>

                            {/* If your AttachSheet already renders a full page, use it alone.
                   Otherwise, render the grid here, limited to 20 rows chunk `c`. */}
                            <CargoManifestContainerAttachSheet
                              data={{ ...dataItem, tblBlContainer: c }}
                            />
                            {/* Alternatively:
                <CargoManifestContainerGrid
                  data={{ ...dataItem, tblBlContainer: c }}
                /> */}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}

                    <div className="bg-gray-300 h-2 no-print" />
                  </React.Fragment>
                );
              });

            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}
