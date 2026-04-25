"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import { fetchReportData } from "@/services/auth/FormControl.services.js";
import React, { useEffect, useMemo, useRef, useState } from "react";
import "./rptCmc.css";
import Print from "@/components/Print/page";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;

import "@/public/style/reportTheme.css";
import { getUserDetails } from "@/helper/userDetails";
import { decrypt } from "@/helper/security";

const DEFAULT_ROWS_WITHOUT_FOOTER = 20;
const DEFAULT_ROWS_WITH_FOOTER = 16;

const paginateContainers = (
  containers = [],
  rowsWithoutFooter = DEFAULT_ROWS_WITHOUT_FOOTER,
  rowsWithFooter = DEFAULT_ROWS_WITH_FOOTER,
) => {
  const safeRowsWithoutFooter = Math.max(
    1,
    Number(rowsWithoutFooter) || DEFAULT_ROWS_WITHOUT_FOOTER,
  );

  const safeRowsWithFooter = Math.max(
    1,
    Math.min(
      safeRowsWithoutFooter,
      Number(rowsWithFooter) || DEFAULT_ROWS_WITH_FOOTER,
    ),
  );

  if (!Array.isArray(containers) || containers.length === 0) {
    return [
      {
        rows: [],
        startSerial: 1,
        pageNo: 1,
        totalPages: 1,
      },
    ];
  }

  const totalRows = containers.length;
  const pages = [];
  let cursor = 0;
  let pageNo = 1;

  while (cursor < totalRows) {
    const remaining = totalRows - cursor;

    // If remaining rows + footer can fit on this page,
    // this becomes the last page.
    if (remaining <= safeRowsWithFooter) {
      pages.push({
        rows: containers.slice(cursor),
        startSerial: cursor + 1,
        pageNo,
      });
      break;
    }

    // Otherwise fill current page with as many rows as possible
    // without footer. Leave at least 1 row for next page.
    const take = Math.min(safeRowsWithoutFooter, remaining - 1);

    pages.push({
      rows: containers.slice(cursor, cursor + take),
      startSerial: cursor + 1,
      pageNo,
    });

    cursor += take;
    pageNo += 1;
  }

  return pages.map((page) => ({
    ...page,
    totalPages: pages.length,
  }));
};

export default function RptIGM() {
  const { clientId } = getUserDetails();
  const { companyId } = getUserDetails();
  const enquiryModuleRefs = useRef([]);
  const measurementRefs = useRef({
    pageInner: null,
    header: null,
    thead: null,
    row: null,
    footer: null,
    pageNo: null,
  });

  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState([]);
  const [companyName, setCompanyName] = useState(null);

  const [layoutConfig, setLayoutConfig] = useState({
    rowsWithoutFooter: DEFAULT_ROWS_WITHOUT_FOOTER,
    rowsWithFooter: DEFAULT_ROWS_WITH_FOOTER,
    measured: false,
  });

  function formatDateToYMD(dateStr) {
    if (!dateStr) return ""; // Handles null, undefined, empty string

    const date = new Date(dateStr);

    if (isNaN(date)) return ""; // Handles invalid date strings

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`; // Returns "dd/mm/yyyy"
  }

  useEffect(() => {
    const storedReportIds = sessionStorage.getItem("selectedReportIds");
    if (storedReportIds) {
      let parsedReportIds = JSON.parse(storedReportIds);
      parsedReportIds = Array.isArray(parsedReportIds)
        ? parsedReportIds
        : ["CMC"];
      console.log("Retrieved Report IDs:", parsedReportIds);
      setReportIds(parsedReportIds);
    } else {
      console.log("No Report IDs found in sessionStorage");
      setReportIds(["CMC"]);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const id = localStorage.getItem("selectedCMCRecordId");
      const vesselId = localStorage.getItem("selectedVesselId");
      const voyageId = localStorage.getItem("selectedVoyageId");
      const podId = localStorage.getItem("selectedPodId");
      const selectedClientId = localStorage.getItem("selectedClientId");

      console.log("Selected CMC Record ID:", id);

      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");

          const filterCondition = {
            vesselId,
            voyageId,
            podId,
            clientId: selectedClientId || clientId,
            blId: id,
          };

          const response = await fetch(`${baseUrl}/Sql/api/Reports/cmcData`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": JSON.parse(token),
            },
            body: JSON.stringify(filterCondition),
          });

          if (!response.ok) throw new Error("Failed to fetch job data");

          const responseJson = await response.json();
          console.log("data", responseJson);
          setData(responseJson?.data?.length > 0 ? responseJson?.data : []);
          const storedUserData = localStorage.getItem("userData");
          if (storedUserData) {
            const decryptedData = decrypt(storedUserData);
            const userData = JSON.parse(decryptedData);
            console.log("userData", userData);
            const requestBodyCompany = {
              columns: "name",
              tableName: "tblCompany",
              whereCondition: `id = ${companyId}`,
              clientIdCondition: `status = 1 FOR JSON PATH`,
            };
            try {
              const cmData = await fetchReportData(requestBodyCompany);

              if (cmData && cmData.data && cmData.data.length > 0) {
                setCompanyName(cmData.data[0].name);
              } else {
                console.error("No data found");
              }
            } catch (error) {
              console.error("Error fetching data:", error);
            }
            // const companyNameValue = userData[0]?.companyName;
            // if (companyNameValue) {
            //   setCompanyName(companyNameValue);
            // }
          }
        } catch (error) {
          console.error("Error fetching job data:", error);
        }
      }
    };

    if (reportIds.length > 0) {
      fetchData();
    }
  }, [reportIds, clientId]);

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

  const containerList = Array.isArray(data?.[0]?.container)
    ? data[0].container
    : [];

  const totalContainers = containerList.length;

  const measurementSampleRow = containerList.find((item) => item) || {
    containerNo: "ABCD1234567",
    isoCode: "2270",
    type: "ISO",
    size: "20",
    loadEmpty: "",
    lineNo: "",
    location: "",
  };

  useEffect(() => {
    if (!data?.length) return;

    const calculateLayout = () => {
      const pageInner = measurementRefs.current.pageInner;
      const header = measurementRefs.current.header;
      const thead = measurementRefs.current.thead;
      const row = measurementRefs.current.row;
      const footer = measurementRefs.current.footer;
      const pageNo = measurementRefs.current.pageNo;

      if (!pageInner || !header || !thead || !row || !footer || !pageNo) return;

      const availableHeight = pageInner.clientHeight;
      const headerHeight = header.offsetHeight;
      const theadHeight = thead.offsetHeight;
      const rowHeight = row.offsetHeight || 1;
      const footerHeight = footer.offsetHeight;
      const pageNoHeight = pageNo.offsetHeight;
      const safetyBuffer = 8;

      const rowsWithoutFooter = Math.max(
        1,
        Math.floor(
          (availableHeight -
            headerHeight -
            theadHeight -
            pageNoHeight -
            safetyBuffer) /
          rowHeight,
        ),
      );

      const rowsWithFooter = Math.max(
        1,
        Math.floor(
          (availableHeight -
            headerHeight -
            theadHeight -
            footerHeight -
            pageNoHeight -
            safetyBuffer) /
          rowHeight,
        ),
      );

      setLayoutConfig((prev) => {
        if (
          prev.rowsWithoutFooter === rowsWithoutFooter &&
          prev.rowsWithFooter === rowsWithFooter &&
          prev.measured
        ) {
          return prev;
        }

        return {
          rowsWithoutFooter,
          rowsWithFooter: Math.min(rowsWithoutFooter, rowsWithFooter),
          measured: true,
        };
      });
    };

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        calculateLayout();
      });

      measurementRefs.current._raf2 = raf2;
    });

    const handleResize = () => {
      calculateLayout();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(raf1);
      if (measurementRefs.current._raf2) {
        cancelAnimationFrame(measurementRefs.current._raf2);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [data, totalContainers, companyName]);

  const cmcPages = useMemo(() => {
    return paginateContainers(
      containerList,
      layoutConfig.rowsWithoutFooter,
      layoutConfig.rowsWithFooter,
    );
  }, [
    containerList,
    layoutConfig.rowsWithoutFooter,
    layoutConfig.rowsWithFooter,
  ]);

  const printablePages = useMemo(() => {
    const pages = [];

    reportIds.forEach((reportId) => {
      if (reportId === "CMC") {
        cmcPages.forEach((page) => {
          pages.push({
            type: "CMC",
            key: `CMC-${page.pageNo}`,
            ...page,
          });
        });
      }
    });

    return pages;
  }, [reportIds, cmcPages]);

  const printableReportIds =
    printablePages.length > 0
      ? printablePages.map((page) => page.key)
      : reportIds.length > 0
        ? reportIds
        : ["CMC"];

  const CMC = ({ page }) => {
    const isLastPage = page.pageNo === page.totalPages;

    return (
      <div id={`CMC-${page.pageNo}`} className="mx-auto text-black">
        {/* <CompanyImgModule /> */}
        {/* <CMCHeaderSpace /> */}
        <CMCSecondaryHeader
          data={data}
          totalContainers={totalContainers}
          pageNo={page.pageNo}
          totalPages={page.totalPages}
        />
        <CMCContainerTable rows={page.rows} startSerial={page.startSerial} />
        {isLastPage && <CMCFooter totalContainers={totalContainers} />}
        {/* <div
          style={{
            width: "100%",
            textAlign: "right",
            paddingRight: "20px",
            marginTop: isLastPage ? "8px" : "12px",
            fontSize: "10px",
            color: "black",
          }}
        >
          Page {page.pageNo} of {page.totalPages}
        </div> */}
      </div>
    );
  };

  const CMCHeaderSpace = () => <div style={{ height: "130px" }}></div>;

  const CMCSecondaryHeader = ({
    data,
    totalContainers,
    pageNo,
    totalPages,
  }) => {
    return (
      <>
        <div style={{ width: "100%", height: "130px" }}></div>
        <div
          className="flex justify-between"
          style={{
            paddingLeft: "15px",
            paddingRight: "40px",
            marginTop: "20px",
          }}
        >
          <div>
            <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
              To,
            </p>
            <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
              Deputy Commissioner of Custom,
            </p>
            <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
              Container Cell,
            </p>
            <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
              Jawahar Custom House,
            </p>
            <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
              <u>{data?.[0]?.portName || ""}</u>
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <p
              style={{
                color: "black",
                fontSize: "10px",
                fontWeight: "bold",
                marginTop: "15px",
              }}
            >
              Date : {new Date().toLocaleDateString("en-GB")}
            </p>
            {/* <p
              style={{
                color: "black",
                fontSize: "10px",
                fontWeight: "bold",
                marginTop: "5px",
              }}
            >
              Page {pageNo} / {totalPages}
            </p> */}
          </div>
        </div>

        <p
          style={{
            color: "black",
            fontSize: "10px",
            fontWeight: "bold",
            paddingLeft: "15px",
            marginTop: "20px",
          }}
        >
          Dear Sir,
        </p>

        <div className="flex justify-center" style={{ marginTop: "20px" }}>
          <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
            Vessel {data?.[0]?.vslName || ""}
          </p>
          <p
            style={{
              color: "black",
              fontSize: "10px",
              fontWeight: "bold",
              marginLeft: "5px",
            }}
          >
            VOY - {data?.[0]?.voyageNo || ""}
          </p>
        </div>

        <div className="flex justify-center">
          <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
            IGM No. {data?.[0]?.igmNo || ""}
          </p>
          <p
            style={{
              color: "black",
              fontSize: "10px",
              fontWeight: "bold",
              marginLeft: "5px",
            }}
          >
            DTD. {formatDateToYMD(data?.[0]?.igmDate || "")}
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
            Bond No. {data?.[0]?.bondNo || ""}
          </p>
          <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
            <u>Movement of Loaded/ICD/Empty</u>
          </p>
        </div>

        <p
          style={{
            color: "black",
            fontSize: "10px",
            fontWeight: "bold",
            marginTop: "10px",
            width: "90%",
            marginLeft: "15px",
            lineHeight: "1.4",
          }}
        >
          We would kindly request you to grant us permission to move the
          Loaded/ICD/Empty {totalContainers} Cntr i.e. from CITPL port to
          CFS/CWC/ICD(ANY) & Import CFS for Movement of loaded Cntrs to our
          storage yard after Destuffing/Export Stuffing Cargo from any CFS
          CITPL.
        </p>
      </>
    );
  };

  const CMCContainerTable = ({
    rows,
    startSerial,
    theadRef = null,
    sampleRowRef = null,
  }) => {
    const thStyle = {
      border: "1px solid #000",
      padding: "2px",
      textAlign: "center",
      fontSize: "10px",
      color: "black",
      fontWeight: "bold",
      verticalAlign: "middle",
    };

    const tdStyle = {
      border: "1px solid #000",
      padding: "2px",
      textAlign: "center",
      fontSize: "10px",
      color: "black",
      verticalAlign: "middle",
      whiteSpace: "nowrap",
    };

    return (
      <div style={{ paddingLeft: "15px", paddingRight: "20px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #000",
            marginTop: "10px",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: "6%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "39%" }} />
          </colgroup>

          <thead ref={theadRef}>
            <tr>
              <th style={thStyle}>SR No</th>
              <th style={thStyle}>Container No.</th>
              <th style={thStyle}>Iso Code</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Size</th>
              <th style={thStyle}>Load/Empty</th>
              <th style={thStyle}>Line No.</th>
              <th style={thStyle}>Location</th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((item, index) => (
                <tr
                  key={`${item?.containerNo || "row"}-${startSerial + index}`}
                  ref={index === 0 ? sampleRowRef : null}
                >
                  <td style={tdStyle}>{startSerial + index}</td>
                  <td style={tdStyle}>{item?.containerNo || ""}</td>
                  <td style={tdStyle}>{item?.isoCode || ""}</td>
                  <td style={tdStyle}>{item?.type || ""}</td>
                  <td style={tdStyle}>{item?.size || ""}</td>
                  <td style={tdStyle}>
                    {item?.containerStatus || item?.containerStatus || ""}
                  </td>
                  <td style={tdStyle}>{item?.itemNo || ""}</td>
                  <td
                    style={{
                      ...tdStyle,
                      textAlign: "left",
                      whiteSpace: "normal",
                    }}
                  >
                    {item?.cfsName || ""}
                  </td>
                </tr>
              ))
            ) : (
              <tr ref={sampleRowRef}>
                <td style={tdStyle} colSpan={8}>
                  No container data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const CMCFooter = ({ totalContainers, footerRef = null }) => {
    return (
      <div ref={footerRef}>
        <div
          className="flex"
          style={{ marginTop: "10px", paddingLeft: "15px" }}
        >
          <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
            Total Containers :
          </p>
          <p style={{ color: "black", fontSize: "10px", marginLeft: "5px" }}>
            {totalContainers}
          </p>
        </div>

        <div style={{ marginTop: "10px", paddingLeft: "15px" }}>
          <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
            Thanking you,
          </p>
          <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
            Yours Faithfully,
          </p>
          <p
            style={{
              color: "black",
              fontSize: "10px",
              fontWeight: "bold",
              marginTop: "40px",
            }}
          >
            For {companyName}
          </p>
        </div>

        <div
          className="flex justify-between"
          style={{
            marginTop: "40px",
            paddingLeft: "15px",
            paddingRight: "40px",
          }}
        >
          <div>
            <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
              As Agents
            </p>
          </div>

          <div>
            <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
              Supdt. of Customs (CMFC)
            </p>
            <p style={{ color: "black", fontSize: "10px", fontWeight: "bold" }}>
              For AC / Dy. Commissioner of Customs (CMFC)
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main>
      <div className="mt-5">
        <Print
          enquiryModuleRefs={enquiryModuleRefs}
          reportIds={printableReportIds}
          printOrientation="portrait"
        />

        <div>
          {printablePages.map((page, index) => (
            <div
              key={page.key}
              ref={(el) => (enquiryModuleRefs.current[index] = el)}
              className={
                index < printablePages.length - 1
                  ? "report-spacing bg-white"
                  : "bg-white"
              }
              style={{
                width: "210mm",
                height: "297mm",
                margin: "auto",
                boxSizing: "border-box",
                padding: "5mm",
                display: "flex",
                flexDirection: "column",
                marginBottom: "22px",
                overflow: "hidden",
                pageBreakAfter:
                  index < printablePages.length - 1 ? "always" : "auto",
                breakAfter: index < printablePages.length - 1 ? "page" : "auto",
              }}
            >
              <div
                style={{
                  flex: 1,
                  width: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {page.type === "CMC" && <CMC page={page} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {data?.length > 0 && (
        <div
          style={{
            position: "absolute",
            left: "-20000px",
            top: 0,
            width: "210mm",
            height: "297mm",
            boxSizing: "border-box",
            padding: "5mm",
            visibility: "hidden",
            pointerEvents: "none",
            overflow: "hidden",
            background: "white",
          }}
        >
          <div
            ref={(el) => {
              measurementRefs.current.pageInner = el;
            }}
            style={{
              width: "100%",
              height: "100%",
              boxSizing: "border-box",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <div
              ref={(el) => {
                measurementRefs.current.header = el;
              }}
            >
              <CMCHeaderSpace />
              <CMCSecondaryHeader
                data={data}
                totalContainers={totalContainers}
                pageNo={1}
                totalPages={1}
              />
            </div>

            <CMCContainerTable
              rows={[measurementSampleRow]}
              startSerial={1}
              theadRef={(el) => {
                measurementRefs.current.thead = el;
              }}
              sampleRowRef={(el) => {
                measurementRefs.current.row = el;
              }}
            />

            <CMCFooter
              totalContainers={totalContainers}
              footerRef={(el) => {
                measurementRefs.current.footer = el;
              }}
            />

            <div
              ref={(el) => {
                measurementRefs.current.pageNo = el;
              }}
              style={{
                width: "100%",
                textAlign: "right",
                paddingRight: "20px",
                marginTop: "8px",
                fontSize: "10px",
                color: "black",
              }}
            >
              Page 1 of 1
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .black-text {
          color: black !important;
        }
      `}</style>
    </main>
  );
}
