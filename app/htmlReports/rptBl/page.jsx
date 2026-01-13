"use client";
/* eslint-disable */
import React, { useEffect, useState, useMemo, useRef } from "react";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import "./reportStyles.css";
import { decrypt } from "@/helper/security";
import "jspdf-autotable"; // Import AutoTable plugin
import { applyTheme } from "@/utils";
import "@/public/style/reportTheme.css";
import Print from "@/components/Print/page";
import { fetchReportData } from "@/services/auth/FormControl.services";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
import { getUserDetails } from "@/helper/userDetails";

function rptAirwayBill() {
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  // const [data, setReportData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [Cargodata, setCargodata] = useState([]);
  const [bldata, setBldata] = useState([]);
  const [CompanyHeader, setCompanyHeader] = useState("");
  const [ImageUrl, setImageUrl] = useState("");
  const enquiryModuleRefs = useRef([]);
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [html2pdf, setHtml2pdf] = useState(null);
  const { clientId } = getUserDetails();
  const [companyName, setCompanyName] = useState(null);

  const blIterationLength = 10;
  const copies = [
    "ORIGINAL 3 (FOR SHIPPER)",
    "COPY 9 (FOR AGENT)",
    "ORIGINAL 1 (FOR ISSUING CARRIER)",
    "ORIGINAL 2 (FOR CONSIGNEE)",
    "COPY NO. 4 (DELIVERY RECEIPT)",
    "COPY 5 (FOR AIRPORT OF DESTINATION)",
    "COPY 6 (FOR THIRD CARRIER)",
    "COPY 7 (FOR SECOND CARRIER)",
    "COPY 8 (FOR FIRST CARRIER)",
    "COPY 10 (EXTRA COPY FOR CARRIER)",
  ];

  const shouldRenderSecondPage = useEffect(() => {
    const loadHtml2pdf = async () => {
      const module = await import("html2pdf.js");
      setHtml2pdf(() => module.default);
    };

    loadHtml2pdf();
  }, []);

  useEffect(() => {
    const storedReportIds = sessionStorage.getItem("selectedReportIds");
    if (storedReportIds) {
      let reportIds = JSON.parse(storedReportIds);
      reportIds = Array.isArray(reportIds) ? reportIds : [reportIds];
      console.log("Retrieved Report IDs:", reportIds);
      setReportIds(reportIds);
    } else {
      console.log("No Report IDs found in sessionStorage");
    }
  }, []);

  useEffect(() => {
    const fetchdata = async () => {
      const id = searchParams.get("recordId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const requestBody = {
            filterCondition: `${id}`,
          };
          const response = await fetch(
            `${baseUrl}/Sql/api/Reports/airwaybill`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": JSON.parse(token),
              },
              body: JSON.stringify(requestBody),
            }
          );
          if (!response.ok) throw new Error("Failed to fetch Airway Bill data");
          const data = await response.json();
          console.log("Test AirwayBill", data.data[0]);
          setReportData(data.data[0]);
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
          console.error("Error fetching Airway Bill data:", error);
        }
      }
    };
    if (reportIds.length > 0) {
      fetchdata();
    }
  }, [reportIds]);

  useEffect(() => {
    const fetchdata = async () => {
      const id = searchParams.get("recordId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const requestBody = {
            filterCondition: `${id}`,
          };
          const response = await fetch(`${baseUrl}/Sql/api/Reports/blconsole`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": JSON.parse(token),
            },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) throw new Error("Failed to fetch Cargo data");
          const data = await response.json();
          console.log("Test Cargo", data.data[0]);
          setCargodata(data.data[0]);
        } catch (error) {
          console.error("Error fetching Cargo data:", error);
        }
      }
    };
    if (reportIds.length > 0) {
      fetchdata();
    }
  }, [reportIds]);

  useEffect(() => {
    const fetchdata = async () => {
      const id = searchParams.get("recordId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const requestBody = {
            filterCondition: `${id}`,
          };
          const response = await fetch(`${baseUrl}/Sql/api/Reports/bl`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": JSON.parse(token),
            },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) throw new Error("Failed to fetch BL data");
          const data = await response.json();
          setBldata(data.data[0]);
          console.log("Test BL", data.data[0]);
        } catch (error) {
          console.error("Error fetching BL data:", error);
        }
      }
    };
    if (reportIds.length > 0) {
      fetchdata();
    }
  }, [reportIds]);

  useEffect(() => {
    const fetchTermsAndConditionsData = async () => {
      const menuReportId = searchParams.get("reportId");
      if (menuReportId) {
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const decryptedData = decrypt(storedUserData);
          const userData = JSON.parse(decryptedData);
          const clientId = userData[0].clientId;

          const requestBody = {
            columns: "termsCondition",
            tableName: "tblTermsCondition",
            whereCondition: `reportsId = ${menuReportId} and status = 1`,
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH`,
          };

          const data = await fetchReportData(requestBody);
          if (data && data?.data?.length > 0) {
            setTermsAndConditions(data?.data[0]?.termsCondition || "");
          } else {
            //setTermsAndConditions(terms);
          }
        }
      }
    };

    fetchTermsAndConditionsData();
  }, [reportIds]);

  useEffect(() => {
    const fetchHeader = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const headerLogoPath = userData[0]?.headerLogoPath;
        if (headerLogoPath) {
          setImageUrl(headerLogoPath);
        }
      }
    };
    fetchHeader();
  }, [CompanyHeader]);

  function trimWordsOnCount(text = "", limit = 0, options = {}) {
    const { ellipsis = "...", charFallback = 0 } = options;

    if (!text || !Number.isFinite(limit) || limit <= 0) return "";

    // Normalize whitespace
    const clean = String(text).replace(/\s+/g, " ").trim();
    if (!clean) return "";

    // Split into words (by spaces)
    const words = clean.split(" ");

    // If it's one giant token (e.g., "aaaaaaaa...") and you want a hard cap:
    if (words.length === 1 && charFallback > 0) {
      return clean.length > charFallback
        ? clean.slice(0, charFallback) + ellipsis
        : clean;
    }

    if (words.length <= limit) return clean;

    return words.slice(0, limit).join(" ") + ellipsis;
  }

  function trimByWordCount(text, wordCount) {
    if (!text || typeof text !== "string") return "";
    if (!wordCount || wordCount <= 0) return "";

    // Split by whitespace, filter out empty strings (handles multiple spaces)
    const words = text.trim().split(/\s+/).filter(Boolean);

    // Slice first 'wordCount' words and join back
    return words.slice(0, wordCount).join(" ");
  }

  function trimByWordCountBySup(text, wordCount) {
    if (!text || typeof text !== "string") return "";
    if (!wordCount || wordCount <= 0) return "";

    // normalize line breaks:
    // Windows: \r\n  | old mac: \r  -> \n
    const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Split by whitespace but keep newlines as tokens so we don't lose them
    const tokens = normalized
      .trim()
      .split(/(\n)|\s+/) // capture '\n' as a token
      .filter((t) => t && t !== ""); // remove empty tokens

    let wordUsed = 0;
    const out = [];

    for (const t of tokens) {
      if (t === "\n") {
        out.push("\n"); // keep line break
        continue;
      }
      if (wordUsed >= wordCount) break;
      out.push(t);
      wordUsed++;
    }

    // clean spaces around newlines
    return out
      .join(" ")
      .replace(/ \n /g, "\n")
      .replace(/ \n/g, "\n")
      .replace(/\n /g, "\n")
      .trim();
  }

  const AirwayBillPrintCharge = () => {
    console.log("data", reportData);
    return (
      <div>
        <div
          className="mx-auto pl-2 pr-2 pt-2"
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 5 }}>
              <h2 className="text-black pl-1 font-semibold text-left">
                {reportData?.blPort}
              </h2>
            </div>
            <div style={{ flex: 5 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              border: "1px solid black",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
              }}
            >
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Shipper's Name & Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Shipper's Account No
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shipper} <br />
                      {reportData?.shipperAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0px 0px 0px",
                }}
              />
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Consignee's Name and Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Consignee's Account Number
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.consignee} <br />
                      {reportData?.consigneeAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "2px 0 2px 0",
                }}
              />
              <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "5px",
                    paddingLeft: "5px",
                  }}
                >
                  Issuing Carriers Agent Name and City
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    marginTop: "2px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.polAgentName}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  margin: "0px 0px 0px 0px",
                }}
              />

              {/* Left Section */}
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  className="h-auto"
                  style={{
                    display: "flex",
                  }}
                >
                  {/* Left Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        minHeight: "30px",
                        maxHeight: "30px",
                        borderRight: "1px solid black",
                      }}
                    >
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Agent's IATA Code
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        {reportData?.agentsIATACode}
                      </p>
                    </div>
                  </div>
                  {/* Right Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Account No.
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        {reportData?.accountNo}
                      </p>
                    </div>
                  </div>
                </div>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid black",
                    height: "2px",
                    margin: "0px 0px 0px 0px",
                  }}
                />
                <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      marginTop: "2px",
                      paddingRight: "10px",
                      paddingLeft: "5px",
                      width: "100%",
                    }}
                  >
                    Airport of departure(Addr.of First Carrier) and Requested
                    Routing
                  </p>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "9px",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                      marginTop: "2px",
                      paddingBottom: "5px",
                      width: "100%",
                      fontWeight: "bold",
                    }}
                  >
                    {reportData?.pol}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                minHeight: "70px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "10px",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  width: "100%",
                  marginTop: "2px",
                  fontWeight: "bold",
                }}
              >
                <div className=" pl-1">
                  <div className="text-black">
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "bold",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.blType}
                    </p>
                    <p style={{ fontSize: "10px" }}>(Air Consignment note)</p>
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "10px ",
                        paddingTop: "3px",
                        paddingBottom: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </p>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0 5px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "5px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  Copies 1,2 and 3 of this Air Waybill are originals and have
                  the same valid
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "75px",
                  maxHeight: "75px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "7px",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    width: "100%",
                  }}
                >
                  It is agreed that the goods declared herein are accepted in
                  apparent good order and condition (except as noted) for
                  carriage SUBJECT TO CONDITIONS OF CONTRACT ON THE REVERSE HER
                  OF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD
                  OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRART INSTRUCTIONS ARE
                  GIVEN HEREON BY THE SHIPPER AND SHIPPER AGREES THAT THE
                  SHIPMENT MAY BE CARRIED VIA INTERMEDIATE STOPPING PLACES WHICH
                  THE CARRIER DEEMS APPROPRIATE. THE SHIPPER'S ATTENTION IS
                  DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF
                  LIABILITY.Shipper may increase such limitation of liability by
                  declaring a higher values for carriage and paying a
                  supplemental charge if required
                </p>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "13px 0 2px 0",
                }}
              />
              <div
                style={{
                  minHeight: "100px",
                  maxHeight: "100px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Accounting Information {reportData?.freightPrepaidCollect}
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.notifyPartyNameAndAddress}
                </p>
              </div>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.trPort1}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                By First Carrier
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.shippingLineCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Routing and Dest
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              ></p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.trPort2}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.trPort1Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.trPort3}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5.1%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.trPort2Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Currency
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                INR
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal text-center"
                style={{
                  fontSize: "7px",
                }}
              >
                CHGS Code
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.chgsCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  WT/VAL
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  Other
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                      fontWeight: "bold",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Carriage
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.nvd}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Customs
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.nvc}
              </p>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "50%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Airport of Destination
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.pod}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "50.2%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Abhishek
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.preCarriage || ""}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "35%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Amount of Insurance
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                XXX
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "65%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                INSURANCE- If carrier offers insurance, and such insurance is
                requested in accordance with the conditions there of, indicate
                amount to be insured in figures in box marked "Amount of
                Insurance".
              </p>
            </div>
          </div>

          {/* Handling Information: Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "50px",
              maxHeight: "50px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex-1",
                  width: "100%",
                  maxHeight: "50px",
                  minHeight: "50px",
                  position: "relative",
                }}
              >
                <div
                  className="text-left"
                  style={{
                    maxHeight: "20px",
                    minHeight: "20px",
                    height: "20px",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      paddingLeft: "5px",
                      width: "95%",
                      fontWeight: "bold",
                    }}
                  >
                    Handling Information: PLEASE INFORM CONSIGNEE IMMEDIATELY ON
                    ARRIVAL OF CARGO.
                    {reportData?.marksAndNoActual}
                  </p>
                </div>
                <div className="text-center flex justify-end absolute bottom-0 right-0">
                  <span
                    className="pl-1 border-t border-black border-l "
                    style={{
                      fontSize: "9px",
                      paddingTop: "3px",
                      paddingBottom: "2px",
                      width: "50px",
                    }}
                  >
                    SCI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Eight-Section Division */}
          {/* First row with content */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderBottom: "1px solid black",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              maxHeight: "40px",
              minHeight: "40px",
            }}
          >
            {/* Section 1: No of Pieces RCP */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                No of Pieces RCP
              </p>
            </div>

            {/* Section 2: Gross Weight */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Gross Weight
              </p>
            </div>

            {/* Section 3: kg lb */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                kg lb
              </p>
            </div>

            {/* Section 4: Rate Class & Commodity Item No */}
            <div
              style={{
                flexBasis: "15%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <div>
                <p
                  className="text-black font-normal w-full"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "left",
                  }}
                >
                  Rate Class
                </p>
              </div>
              <div>
                <div>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "10%",
                    }}
                  >
                    {" "}
                  </p>
                </div>
                <div
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "center",
                    width: "82%",
                    borderLeft: "1px solid black",
                    borderTop: "1px solid black",
                    float: "right",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "82%",
                    }}
                  >
                    Commodity Item No
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Chargeable weight */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Chargeable weight
              </p>
            </div>

            {/* Section 6: Rate & Charge */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                position: "relative",
                height: "40px", // adjust as needed
                width: "100%",
              }}
            >
              {/* Diagonal Line */}
              <svg style={{ position: "absolute", top: 0, left: 0, right: 60 }}>
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="0"
                  stroke="black"
                  strokeWidth="1"
                />
              </svg>

              {/* "Rate" - Top Left */}
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "16px",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: "8px",
                }}
              >
                Rate
              </div>

              {/* "Charge" - Bottom Right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "6px",
                  fontWeight: "bold",
                  fontSize: "8px",
                  color: "black",
                }}
              >
                Charge
              </div>
            </div>

            {/* Section 7: Total */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Total
              </p>
            </div>

            {/* Section 8: Nature and Quantity of Goods (incl.Dimensions of Volume) */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Nature and Quantity of Goods (incl.Dimensions of Volume)
              </p>
            </div>
          </div>

          {/* Second row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "215px",
              maxHeight: "215px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.goodsDescDetails}
              </p>
            </div>
          </div>

          {/* Third row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "15px",
              maxHeight: "15px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                K/Q
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                }}
              >
                {reportData?.GoodsDescription}
              </p>
            </div>
          </div>

          {/* Footer Division Section */}
          <div
            className="flex"
            style={{
              border: "1px solid black",
              height: "323px",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
                width: "40%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Weight Charge
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.preWeightCharge}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.collWeightCharge}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Valuation Charg
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      TAX
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Agent
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueAgent}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueAgent}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Carrier
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueCarrier}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueCarrier}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "30px solid lightgrey",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.preTotal}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.collTotal}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Currency Conversion Rate
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      CC Charge in Dest Currency
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      For Carrier's Use Only at Destination
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Charge at Destination
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                width: "60%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "108px",
                  maxHeight: "108px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "5px",
                    paddingLeft: "10px",
                    paddingTop: "5PX",
                    width: "100%",
                    paddingBottom: "2px",
                  }}
                >
                  Other Charges
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.otherCharge}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "90px",
                  maxHeight: "90px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  I hereby Certify that the particulars on the face here of are
                  correct and that insofar as any part of the consignment
                  contains dangerous goods. I hereby Certify that the contentd
                  of this consignment are fully and accurately described above
                  by proper shipping name and are classified, packaged, marked
                  and labeled, and in proper condition for carriage by air
                  according to the applicable dangerous Goods Regulations.
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                ></p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "1px",
                    width: "100%",
                    paddingBottom: "1px",
                  }}
                >
                  Signature of Shipper or his Agent
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "55px",
                  maxHeight: "55px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "35px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.blIssueDate}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.blIssuePlaceText}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        fontWeight: "bold",
                      }}
                    >
                      As Agent For Carrier {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Executed on (date)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      at (place)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Signature of Issuing Carrier or its Agent
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "40%",
                      borderRight: "1px solid black",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                        borderBottom: "1px solid black",
                      }}
                    >
                      Total Collect Charges
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 5 }}>
              <h2 className="text-black pl-1 font-semibold text-left"></h2>
            </div>
            <div style={{ flex: 2 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>
        </div>

        {/* Attachment Section */}
        {shouldRenderSecondPage && (
          <div
            id="second-page"
            className="mx-auto p-2"
            style={{ width: "100%", height: "auto" }}
          >
            <h2 className="text-black text-lg pb-2 font-semibold text-center">
              ATTACHED SHEET
            </h2>
            {/* B/L No Section */}
            <div
              className="flex"
              style={{ border: "1px solid black", height: "30px" }}
            >
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  B/L No : {reportData?.blNo}
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Vessel Name : {reportData?.oceanVessel?.Name}
                  <span className="ms-2">{reportData?.voyageNo?.Name}</span>
                </p>
              </div>
            </div>
            {/* Description of goods */}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                height: "30px",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Marks & Nos.
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Description of goods
                </p>
              </div>
            </div>
            {/* Description of goods Data*/}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                minHeight: "70px !important",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                ></p>
              </div>
              <div
                style={{
                  flex: "40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.descOfGoodsDetaislAttach}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const rptAirwayBillPrintCharge = () => (
    <div>
      <div id="156" className="mx-auto text-black">
        <AirwayBillPrintCharge data={reportData} />
      </div>
    </div>
  );

  console.log("bldata", bldata);
  const rptSeawayBillOfLadingDraft = () => (
    <div className="pr-2 pl-2">
      <div id="156" className="mx-auto text-black mt-1">
        <p className="text-black text-xs font-bold text-right">DRAFT</p>
        <div
          className="mx-auto mt-1 border border-black"
          style={{ height: "280mm" }}
        >
          {/* Header Section - 1 */}
          <div
            className="flex border-b border-black"
            style={{ height: "33%", minHeight: "33%" }}
          >
            <div
              className="border-r border-black"
              style={{ height: "100%", width: "50%" }}
            >
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Consignor/Shipper
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.shipperName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.shipperAddress}
                  </p>
                </div>
              </div>
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Consignee if To Order so indicate
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.consigneeName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.consigneeAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
              <div className="border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Notify Address(No claim shall attach for failure to notify)
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.notifyPartyName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.notifyPartyAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
            </div>
            {/* New Section - 2 */}
            <div style={{ height: "100%", width: "50%" }}>
              <div className="p-2">
                <div className="flex">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "10px" }}
                  >
                    BILL OF LADING NUMBER :
                  </p>
                  <p className="text-black ml-2" style={{ fontSize: "10px" }}>
                    {bldata?.hblNo}
                  </p>
                </div>
                <div className="flex">
                  <p
                    className="text-black font-bold mr-2"
                    style={{ fontSize: "10px" }}
                  >
                    SHIPPING REF NUMBER :
                  </p>
                  <p className="text-black ml-2" style={{ fontSize: "10px" }}>
                    {bldata?.jobNo}
                  </p>
                </div>
              </div>
              <div
                style={{
                  height: "44%",
                  minHeight: "44% !important",
                  maxHeight: "44% !important",
                  display: "flex", // ✅ enables flexbox
                  justifyContent: "center", // ✅ centers horizontally
                  alignItems: "center", // ✅ centers vertically
                }}
              >
                <img
                  style={{
                    height: "110%",
                    minHeight: "110% !important",
                    maxHeight: "110% !important",
                    width: "90%",
                  }}
                  src={`${baseUrlNext}/uploads/1752843752950-03_SAR%20Logo%20PNG.png`}
                  alt="LOGO"
                />
              </div>
              <div style={{ height: "45%", minHeight: "45%" }}>
                <p
                  className="text-black p-2 mt-2 font-bold"
                  style={{ fontSize: "8px" }}
                >
                  Excess Value Declaration: Refer to Clause 11 (4)&(5) on
                  revenue side 'RECEIVED by the Carrier the Goods as specified
                  above in apparent good order unless otherwise stated, to be
                  transported to such place as agreed, authorized o subject to
                  all the terms and conditions appearing on the front and
                  reverse of this B The particulars given above as stated by the
                  shipper and the weight, measure, quantity and the value of
                  Goods are unknown to the carrier. <br /> In WITNESS whereof
                  one (1) original Bill of Lading has been signed if not
                  otherwise being accomplished the other(s),if any, to be void,
                  if required by the Carrier one (1) must be surrendered duly
                  endorsed in exchange for the Goods or delivery order.
                </p>
              </div>
            </div>
          </div>
          {/* Header Section - 2 */}
          <div
            className="flex border-b border-black"
            style={{ height: "10%", minHeight: "10%" }}
          >
            <div
              className="border-r border-black flex"
              style={{ width: "50%" }}
            >
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Pre- Carriage by{" "}
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.preCarriage}
                  </p>
                </div>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Ocean Vessel Voyage Number
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.polVessel} / {bldata?.polVoyage}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "33%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Discharge
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.pod}
                  </p>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place of Receipt
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.plr}
                  </p>
                </div>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Lading
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.pol}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "33%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place Of Delivery
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.fpd}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div
                className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                style={{ height: "66%" }}
              >
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Delivery Agency:
                </p>
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {bldata?.fpdAgent}
                </p>
                <p
                  className="text-black"
                  style={{ fontSize: "8px", width: "95%" }}
                >
                  {bldata?.fpdAgentAddressName}
                </p>
              </div>
              <div className="flex" style={{ height: "34%" }}>
                <div
                  className="border-r border-black pt-1 pb-1 pl-2 pr-2 "
                  style={{ width: "50%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Mode / Means of Transport
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.preCarriage}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2 " style={{ width: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Route/Place of Transhipment
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}></p>
                </div>
              </div>
            </div>
          </div>
          {/* Grid 1 */}

          <div style={{ height: "26%", maxHeight: "26%" }}>
            <table
              className="text-left"
              style={{ width: "100%", fontSize: "9px" }}
            >
              <tr className="border-b border-black" style={{ width: "100%" }}>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "25%" }}>
                  Marks and Number
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "15%" }}>
                  No.of PKGS / CNTRS.
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "40%" }}>
                  Description of Packages and Goods
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "10%" }}>
                  Gross Weight
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "10%" }}>
                  Measurement
                </th>
              </tr>
              <tr>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px", height: "240px" }}
                >
                  <p className="text-left">{bldata?.marksAndNosDetails}</p>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.noOfPackages} {bldata?.packagesCode}
                  </pre>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 text-left"
                  style={{ fontSize: "9px", height: "240px" }}
                >
                  <div className="flex flex-col justify-evenly h-full">
                    <div className="h-3/5">
                      <p className="text-left align-top">
                        {bldata?.goodsDescDetails}
                      </p>
                    </div>
                    <div className="h-2/5">
                      <p
                        style={{ fontSize: "9px" }}
                        className="text-left align-top"
                      >
                        {trimByWordCount(bldata?.blClause, 50)}
                      </p>
                    </div>
                  </div>
                </td>

                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.grossWt} {bldata?.weightUnit}
                  </pre>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.volume} {bldata?.volumeUnitName}
                  </pre>
                </td>
              </tr>
            </table>
          </div>
          {/* Grid 2 */}
          <div style={{ height: "3%", minHeight: "3%", maxHeight: "3%" }}>
            <table style={{ width: "100%", fontSize: "9px" }}>
              <tr className="border-b border-t border-black">
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    Tank NOS.
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    TYPE
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    C. SEAL NO
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    S. SEAL NO
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "10%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    NT. WT
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    Tare Weight
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "10%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    GR. WT
                  </p>
                </th>
              </tr>
              {bldata?.tblBlContainer?.slice(0, 2).map((item, index) => (
                <tr key={index}>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.containerNumber}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.sizeType}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.customSealNo}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.agentSealNo}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.netWt}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.tareWt}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.grossWtAndUnit}</pre>
                  </td>
                </tr>
              ))}
            </table>
          </div>
          {/* Grid 3 */}
          <div className="mt-6" style={{ height: "14%", minHeight: "14%" }}>
            <div>
              <p
                className="text-left pt-1 pb-1 pl-1 pr-1  border-t border-black"
                style={{ fontSize: "9px" }}
              >
                Excess Value Declaration
              </p>
            </div>
            <table style={{ width: "100%", fontSize: "9px" }}>
              <tr className="border-b border-t border-black">
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "16%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Total Freight & Charges
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "16%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Prepaid / Collect
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Local free time for Tank
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Discharge free time for Tank
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Origin Detention (daily)
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "17%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Destination Detention (daily)
                  </p>
                </th>
              </tr>
              <tr className="border-b border-black">
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "16%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.totalFreightAndCharges}
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "16%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.freightPrepaidCollect}
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.originFreeDays} Days
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.destinationFreeDays} Days
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.demurrageCurrency} {bldata?.originDemurrageRate}
                  </p>
                </td>
                <td className="pt-1 pb-1 pl-1 pr-1" style={{ width: "17%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.demurrageCurrency}{" "}
                    {bldata?.destinationDemurrageRate}
                  </p>
                </td>
              </tr>
            </table>
            <table style={{ width: "100%", fontSize: "9px" }}>
              <tr className="border-b border-black">
                <th className="pt-1 pb-1 pl-1 pr-1" colSpan={4}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Particular above furnished by consignor/shipper
                  </p>
                </th>
              </tr>
              <tr className="border-b border-t border-black">
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight & Charges Amount
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight Payable Location
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    No.of original MTD(s)
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "25%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Place and Date of issue
                  </p>
                </th>
              </tr>
              <tr className="border-b border-black">
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight as Arranged
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.freightpayableAtText}
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.noOfBl}
                  </p>
                </td>
                <td className="pt-1 pb-1 pl-1 pr-1" style={{ width: "25%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.blIssuePlaceText} {formatDate(bldata?.blIssueDate)}
                  </p>
                </td>
              </tr>
            </table>
          </div>
          {/* Footer */}
          <div className="flex" style={{ height: "11.6%", minHeight: "11.6%" }}>
            <div className="border-r border-black p-1" style={{ width: "75%" }}>
              <div
                className="flex w-full mt-1"
                style={{
                  fontSize: "9px",
                  height: "42px",
                  minHeight: "42px",
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    lineHeight: "12px",
                    overflow: "hidden",
                    wordBreak: "break-all", // or: overflowWrap: 'anywhere'
                  }}
                >
                  <b>Other Particulars (if any):</b>{" "}
                  {trimWordsOnCount(bldata?.remarks, 50)} {/* ✅ works */}
                </p>
              </div>
              {/* <p className="text-left mt-1" style={{ fontSize: "10px" }}>
                
              </p> */}
              <p className="text-left mt-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">Note: </span>The Merchant's
                attention is called to the fact that according to Clauses10,11
                and 12 of this Bill of Loading,the liability of the Carrier is,
                in most cases, limited in respect of loss of or damage to the
                goods and delay. <br />
                LAW AND JURISDICTION CLAUSE: The Contract evidence by or
                contained in this Bill of Lading shall be governed by the law of
                India and any claim or dispute arising hereunder or in
                connection herewith shall (without prejudice to the Carrier's
                right to commence proceedings in any other jurisdiction)be
                subject to the jurisdiction of the Courts of Singapore.
              </p>
            </div>
            <div className=" p-1" style={{ width: "25%" }}>
              <p className="text-left font-bold" style={{ fontSize: "8px" }}>
                Signed for{" "}
                {clientId == 13
                  ? "SAR LOGISOLUTIONS PTE. LTD."
                  : { companyName }}
              </p>
              <p className="text-left font-bold" style={{ fontSize: "8px" }}>
                By
              </p>
              <img
                src={`${baseUrlNext}/uploads/SARSign.png`}
                style={{ width: "200px", height: "80px" }}
              />
              <p
                className="text-left font-bold mt-1"
                style={{ fontSize: "8px" }}
              >
                Authorised Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const rptSeawayBillOfLading = () => (
    <div className="pr-2 pl-2">
      <div id="156" className="mx-auto text-black mt-1">
        <p className="text-black text-xs font-bold text-right">
          {bldata?.blType}
        </p>
        <div
          className="mx-auto mt-1 border border-black"
          style={{ height: "280mm" }}
        >
          {/* Header Section - 1 */}
          <div
            className="flex border-b border-black"
            style={{ height: "33%", minHeight: "33%" }}
          >
            <div
              className="border-r border-black"
              style={{ height: "100%", width: "50%" }}
            >
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Consignor/Shipper
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.shipperName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.shipperAddress}
                  </p>
                </div>
              </div>
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Consignee if To Order so indicate
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.consigneeName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.consigneeAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
              <div className="border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Notify Address(No claim shall attach for failure to notify)
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.notifyPartyName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.notifyPartyAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
            </div>
            <div style={{ height: "100%", width: "50%" }}>
              <div className="p-2">
                <div className="flex">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "10px" }}
                  >
                    BILL OF LADING NUMBER :
                  </p>
                  <p className="text-black ml-2" style={{ fontSize: "10px" }}>
                    {bldata?.hblNo}
                  </p>
                </div>
                <div className="flex">
                  <p
                    className="text-black font-bold mr-2"
                    style={{ fontSize: "10px" }}
                  >
                    SHIPPING REF NUMBER :
                  </p>
                  <p className="text-black ml-2" style={{ fontSize: "10px" }}>
                    {bldata?.jobNo}
                  </p>
                </div>
              </div>
              <div
                style={{
                  height: "44%",
                  minHeight: "44% !important",
                  maxHeight: "44% !important",
                  display: "flex", // ✅ enables flexbox
                  justifyContent: "center", // ✅ centers horizontally
                  alignItems: "center", // ✅ centers vertically
                }}
              >
                <img
                  style={{
                    height: "110%",
                    minHeight: "110% !important",
                    maxHeight: "110% !important",
                    width: "90%",
                  }}
                  src={`${baseUrlNext}/uploads/1752843752950-03_SAR%20Logo%20PNG.png`}
                  alt="LOGO"
                />
              </div>
              <div style={{ height: "45%", minHeight: "45%" }}>
                <p
                  className="text-black p-2 mt-2 font-bold"
                  style={{ fontSize: "8px" }}
                >
                  Excess Value Declaration: Refer to Clause 11 (4)&(5) on
                  revenue side 'RECEIVED by the Carrier the Goods as specified
                  above in apparent good order unless otherwise stated, to be
                  transported to such place as agreed, authorized o subject to
                  all the terms and conditions appearing on the front and
                  reverse of this B The particulars given above as stated by the
                  shipper and the weight, measure, quantity and the value of
                  Goods are unknown to the carrier. <br /> In WITNESS whereof
                  one (1) original Bill of Lading has been signed if not
                  otherwise being accomplished the other(s),if any, to be void,
                  if required by the Carrier one (1) must be surrendered duly
                  endorsed in exchange for the Goods or delivery order.
                </p>
              </div>
            </div>
          </div>
          {/* Header Section - 2 */}
          <div
            className="flex border-b border-black"
            style={{ height: "10%", minHeight: "10%" }}
          >
            <div
              className="border-r border-black flex"
              style={{ width: "50%" }}
            >
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Pre- Carriage by{" "}
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.preCarriage}
                  </p>
                </div>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Ocean Vessel Voyage Number
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.polVessel} / {bldata?.polVoyage}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "33%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Discharge
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.pod}
                  </p>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place of Receipt
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.plr}
                  </p>
                </div>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Lading
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.pol}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "33%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place Of Delivery
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.fpd}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div
                className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                style={{ height: "66%" }}
              >
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Delivery Agency:
                </p>
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {bldata?.fpdAgent}
                </p>
                <p
                  className="text-black"
                  style={{ fontSize: "8px", width: "95%" }}
                >
                  {bldata?.fpdAgentAddressName}
                </p>
              </div>
              <div className="flex" style={{ height: "34%" }}>
                <div
                  className="border-r border-black pt-1 pb-1 pl-2 pr-2 "
                  style={{ width: "50%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Mode / Means of Transport
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.preCarriage}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2 " style={{ width: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Route/Place of Transhipment
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}></p>
                </div>
              </div>
            </div>
          </div>
          {/* Grid 1 */}

          <div style={{ height: "26%", maxHeight: "26%" }}>
            <table
              className="text-left"
              style={{ width: "100%", fontSize: "9px" }}
            >
              <tr className="border-b border-black" style={{ width: "100%" }}>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "25%" }}>
                  Marks and Number
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "15%" }}>
                  No.of PKGS / CNTRS.
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "40%" }}>
                  Description of Packages and Goods
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "10%" }}>
                  Gross Weight
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "10%" }}>
                  Measurement
                </th>
              </tr>
              <tr>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px", height: "240px" }}
                >
                  <p className="text-left">{bldata?.marksAndNosDetails}</p>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.noOfPackages} {bldata?.packagesCode}
                  </pre>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 text-left"
                  style={{ fontSize: "9px", height: "240px" }}
                >
                  <div className="flex flex-col justify-evenly h-full">
                    <div className="h-3/5">
                      <p className="text-left align-top">
                        {bldata?.goodsDescDetails}
                      </p>
                    </div>
                    <div className="h-2/5">
                      <p
                        style={{ fontSize: "9px" }}
                        className="text-left align-top"
                      >
                        {trimByWordCount(bldata?.blClause, 50)}
                      </p>
                    </div>
                  </div>
                </td>

                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.grossWt} {bldata?.weightUnit}
                  </pre>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.volume} {bldata?.volumeUnitName}
                  </pre>
                </td>
              </tr>
            </table>
          </div>
          {/* Grid 2 */}
          <div style={{ height: "3%", minHeight: "3%" }}>
            <table style={{ width: "100%", fontSize: "9px" }}>
              <tr className="border-b border-t border-black">
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    Tank NOS.
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    TYPE
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    C. SEAL NO
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    S. SEAL NO
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "10%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    NT. WT
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "15%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    Tare Weight
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "10%" }}>
                  <p className="text-left" style={{ fontSize: "9px" }}>
                    GR. WT
                  </p>
                </th>
              </tr>
              {bldata?.tblBlContainer?.slice(0, 2).map((item, index) => (
                <tr key={index}>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.containerNumber}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.sizeType}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.customSealNo}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.agentSealNo}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.netWt}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.tareWt}</pre>
                  </td>
                  <td className="pl-1 pr-1 pb-1" style={{ fontSize: "9px" }}>
                    <pre className="text-left">{item?.grossWtAndUnit}</pre>
                  </td>
                </tr>
              ))}
            </table>
          </div>
          {/* Grid 3 */}
          <div className="mt-6" style={{ height: "14%", minHeight: "14%" }}>
            <div>
              <p
                className="text-left pt-1 pb-1 pl-1 pr-1  border-t border-black"
                style={{ fontSize: "9px" }}
              >
                Excess Value Declaration
              </p>
            </div>
            <table style={{ width: "100%", fontSize: "9px" }}>
              <tr className="border-b border-t border-black">
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "16%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Total Freight & Charges
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "16%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Prepaid / Collect
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Local free time for Tank
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Discharge free time for Tank
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Origin Detention (daily)
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "17%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Destination Detention (daily)
                  </p>
                </th>
              </tr>
              <tr className="border-b border-black">
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "16%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.totalFreightAndCharges}
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "16%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.freightPrepaidCollect}
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.originFreeDays} Days
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.destinationFreeDays} Days
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "17%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.demurrageCurrency} {bldata?.originDemurrageRate}
                  </p>
                </td>
                <td className="pt-1 pb-1 pl-1 pr-1" style={{ width: "17%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.demurrageCurrency}{" "}
                    {bldata?.destinationDemurrageRate}
                  </p>
                </td>
              </tr>
            </table>
            <table style={{ width: "100%", fontSize: "9px" }}>
              <tr className="border-b border-black">
                <th className="pt-1 pb-1 pl-1 pr-1" colSpan={4}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Particular above furnished by consignor/shipper
                  </p>
                </th>
              </tr>
              <tr className="border-b border-t border-black">
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight & Charges Amount
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight Payable Location
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    No.of original MTD(s)
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "25%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Place and Date of issue
                  </p>
                </th>
              </tr>
              <tr className="border-b border-black">
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight as Arranged
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.freightpayableAtText}
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.noOfBl}
                  </p>
                </td>
                <td className="pt-1 pb-1 pl-1 pr-1" style={{ width: "25%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.blIssuePlaceText} {formatDate(bldata?.blIssueDate)}
                  </p>
                </td>
              </tr>
            </table>
          </div>
          {/* Footer */}
          <div className="flex" style={{ height: "11.6%", minHeight: "11.6%" }}>
            <div className="border-r border-black p-1" style={{ width: "75%" }}>
              <div
                className="flex w-full mt-1"
                style={{
                  fontSize: "9px",
                  height: "42px",
                  minHeight: "42px",
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    lineHeight: "12px",
                    overflow: "hidden",
                    wordBreak: "break-all", // or: overflowWrap: 'anywhere'
                  }}
                >
                  <b>Other Particulars (if any):</b>{" "}
                  {trimWordsOnCount(bldata?.remarks, 50)} {/* ✅ works */}
                </p>
              </div>
              {/* <p className="text-left mt-1" style={{ fontSize: "10px" }}>
                
              </p> */}
              <p className="text-left mt-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">Note: </span>The Merchant's
                attention is called to the fact that according to Clauses10,11
                and 12 of this Bill of Loading,the liability of the Carrier is,
                in most cases, limited in respect of loss of or damage to the
                goods and delay. <br />
                LAW AND JURISDICTION CLAUSE: The Contract evidence by or
                contained in this Bill of Lading shall be governed by the law of
                India and any claim or dispute arising hereunder or in
                connection herewith shall (without prejudice to the Carrier's
                right to commence proceedings in any other jurisdiction)be
                subject to the jurisdiction of the Courts of Singapore.
              </p>
            </div>
            <div className=" p-1" style={{ width: "25%" }}>
              <p className="text-left font-bold" style={{ fontSize: "8px" }}>
                Signed for{" "}
                {clientId == 13
                  ? "SAR LOGISOLUTIONS PTE. LTD."
                  : { companyName }}
              </p>
              <p className="text-left font-bold" style={{ fontSize: "8px" }}>
                By
              </p>
              <img
                src={`${baseUrlNext}/uploads/SARSign.png`}
                style={{ width: "200px", height: "80px" }}
              />
              <p
                className="text-left font-bold mt-1"
                style={{ fontSize: "8px" }}
              >
                Authorised Signatory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const AirwayBillPrintChargeCopies = ({ index }) => {
    console.log("data", reportData);
    console.log("index - ", index);
    return (
      <div>
        <div
          className="mx-auto pl-2 pr-2 pt-2"
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 5 }}>
              <h2 className="text-black pl-1 font-semibold text-left">
                {reportData?.blPort}
              </h2>
            </div>
            <div style={{ flex: 5 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              border: "1px solid black",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
              }}
            >
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Shipper's Name & Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Shipper's Account No
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shipper} <br />
                      {reportData?.shipperAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0px 0px 0px",
                }}
              />
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Consignee's Name and Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Consignee's Account Number
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.consignee} <br />
                      {reportData?.consigneeAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "2px 0 2px 0",
                }}
              />
              <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "5px",
                    paddingLeft: "5px",
                  }}
                >
                  Issuing Carriers Agent Name and City
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    marginTop: "2px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.polAgentName}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  margin: "0px 0px 0px 0px",
                }}
              />

              {/* Left Section */}
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  className="h-auto"
                  style={{
                    display: "flex",
                  }}
                >
                  {/* Left Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        minHeight: "30px",
                        maxHeight: "30px",
                        borderRight: "1px solid black",
                      }}
                    >
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Agent's IATA Code
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                        }}
                      >
                        {reportData?.agentsIATACode}
                      </p>
                    </div>
                  </div>
                  {/* Right Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Account No.
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                        }}
                      >
                        {reportData?.accountNo}
                      </p>
                    </div>
                  </div>
                </div>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid black",
                    height: "2px",
                    margin: "0px 0px 0px 0px",
                  }}
                />
                <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      marginTop: "2px",
                      paddingRight: "10px",
                      paddingLeft: "5px",
                      width: "100%",
                    }}
                  >
                    Airport of departure(Addr.of First Carrier) and Requested
                    Routing
                  </p>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "9px",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                      marginTop: "2px",
                      paddingBottom: "5px",
                      width: "100%",
                    }}
                  >
                    {reportData?.pol}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                minHeight: "70px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "10px",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  width: "100%",
                  marginTop: "2px",
                  fontWeight: "bold",
                }}
              >
                <div className=" pl-1">
                  <div className="text-black">
                    <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {reportData?.blType}
                    </p>
                    <p style={{ fontSize: "10px" }}>(Air Consignment note)</p>
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "10px ",
                        paddingTop: "3px",
                        paddingBottom: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </p>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0 5px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "5px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  Copies 1,2 and 3 of this Air Waybill are originals and have
                  the same valid
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "75px",
                  maxHeight: "75px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "7px",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    width: "100%",
                  }}
                >
                  It is agreed that the goods declared herein are accepted in
                  apparent good order and condition (except as noted) for
                  carriage SUBJECT TO CONDITIONS OF CONTRACT ON THE REVERSE HER
                  OF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD
                  OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRART INSTRUCTIONS ARE
                  GIVEN HEREON BY THE SHIPPER AND SHIPPER AGREES THAT THE
                  SHIPMENT MAY BE CARRIED VIA INTERMEDIATE STOPPING PLACES WHICH
                  THE CARRIER DEEMS APPROPRIATE. THE SHIPPER'S ATTENTION IS
                  DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF
                  LIABILITY.Shipper may increase such limitation of liability by
                  declaring a higher values for carriage and paying a
                  supplemental charge if required
                </p>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "13px 0 2px 0",
                }}
              />
              <div
                style={{
                  minHeight: "100px",
                  maxHeight: "100px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                  }}
                >
                  Accounting Information {reportData?.freightPrepaidCollect}
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    paddingBottom: "5px",
                  }}
                >
                  {reportData?.notifyPartyNameAndAddress}
                </p>
              </div>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort1}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                By First Carrier
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.shippingLineCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Routing and Dest
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              ></p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort2}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort1Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort3}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5.1%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort2Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Currency
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                INR
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal text-center"
                style={{
                  fontSize: "7px",
                }}
              >
                CHGS Code
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.chgsCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  WT/VAL
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  Other
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Carriage
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.nvd}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Customs
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.nvc}
              </p>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "50%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Airport of Destination
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.pod}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "50.2%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Abhishek
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.preCarriage || ""}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "35%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Amount of Insurance
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                XXX
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "65%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                INSURANCE- If carrier offers insurance, and such insurance is
                requested in accordance with the conditions there of, indicate
                amount to be insured in figures in box marked "Amount of
                Insurance".
              </p>
            </div>
          </div>

          {/* Handling Information: Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "50px",
              maxHeight: "50px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex-1",
                  width: "100%",
                  maxHeight: "50px",
                  minHeight: "50px",
                  position: "relative",
                }}
              >
                <div
                  className="text-left"
                  style={{
                    maxHeight: "20px",
                    minHeight: "20px",
                    height: "20px",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      paddingLeft: "5px",
                      width: "95%",
                    }}
                  >
                    Handling Information: PLEASE INFORM CONSIGNEE IMMEDIATELY ON
                    ARRIVAL OF CARGO.
                    {reportData?.marksAndNoActual}
                  </p>
                </div>
                <div className="text-center flex justify-end absolute bottom-0 right-0">
                  <span
                    className="pl-1 border-t border-black border-l "
                    style={{
                      fontSize: "9px",
                      paddingTop: "3px",
                      paddingBottom: "2px",
                      width: "50px",
                    }}
                  >
                    SCI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Eight-Section Division */}
          {/* First row with content */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderBottom: "1px solid black",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              maxHeight: "40px",
              minHeight: "40px",
            }}
          >
            {/* Section 1: No of Pieces RCP */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                No of Pieces RCP
              </p>
            </div>

            {/* Section 2: Gross Weight */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Gross Weight
              </p>
            </div>

            {/* Section 3: kg lb */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                kg lb
              </p>
            </div>

            {/* Section 4: Rate Class & Commodity Item No */}
            <div
              style={{
                flexBasis: "15%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <div>
                <p
                  className="text-black font-normal w-full"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "left",
                  }}
                >
                  Rate Class
                </p>
              </div>
              <div>
                <div>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "10%",
                    }}
                  >
                    {" "}
                  </p>
                </div>
                <div
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "center",
                    width: "82%",
                    borderLeft: "1px solid black",
                    borderTop: "1px solid black",
                    float: "right",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "82%",
                    }}
                  >
                    Commodity Item No
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Chargeable weight */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Chargeable weight
              </p>
            </div>

            {/* Section 6: Rate & Charge */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                position: "relative",
                height: "40px", // adjust as needed
                width: "100%",
              }}
            >
              {/* Diagonal Line */}
              <svg style={{ position: "absolute", top: 0, left: 0, right: 60 }}>
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="0"
                  stroke="black"
                  strokeWidth="1"
                />
              </svg>

              {/* "Rate" - Top Left */}
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "16px",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: "8px",
                }}
              >
                Rate
              </div>

              {/* "Charge" - Bottom Right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "6px",
                  fontWeight: "bold",
                  fontSize: "8px",
                  color: "black",
                }}
              >
                Charge
              </div>
            </div>

            {/* Section 7: Total */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Total
              </p>
            </div>

            {/* Section 8: Nature and Quantity of Goods (incl.Dimensions of Volume) */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Nature and Quantity of Goods (incl.Dimensions of Volume)
              </p>
            </div>
          </div>

          {/* Second row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "215px",
              maxHeight: "215px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>
          </div>

          {/* Third row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "15px",
              maxHeight: "15px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                K/Q
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.GoodsDescription}
              </p>
            </div>
          </div>

          {/* Footer Division Section */}
          <div
            className="flex"
            style={{
              border: "1px solid black",
              height: "323px",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
                width: "40%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Weight Charge
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preWeightCharge}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collWeightCharge}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Valuation Charg
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      TAX
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Agent
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueAgent}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueAgent}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Carrier
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueCarrier}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueCarrier}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "30px solid lightgrey",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotal}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotal}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Currency Conversion Rate
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      CC Charge in Dest Currency
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      For Carrier's Use Only at Destination
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Charge at Destination
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                width: "60%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "108px",
                  maxHeight: "108px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "5px",
                    paddingLeft: "10px",
                    paddingTop: "5PX",
                    width: "100%",
                    paddingBottom: "2px",
                  }}
                >
                  Other Charges
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.otherCharge}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "90px",
                  maxHeight: "90px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  I hereby Certify that the particulars on the face here of are
                  correct and that insofar as any part of the consignment
                  contains dangerous goods. I hereby Certify that the contentd
                  of this consignment are fully and accurately described above
                  by proper shipping name and are classified, packaged, marked
                  and labeled, and in proper condition for carriage by air
                  according to the applicable dangerous Goods Regulations.
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                ></p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "1px",
                    width: "100%",
                    paddingBottom: "1px",
                  }}
                >
                  Signature of Shipper or his Agent
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "55px",
                  maxHeight: "55px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "35px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      {reportData?.blIssueDate}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      {reportData?.blIssuePlaceText}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      As Agent For Carrier {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Executed on (date)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      at (place)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Signature of Issuing Carrier or its Agent
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "40%",
                      borderRight: "1px solid black",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                        borderBottom: "1px solid black",
                      }}
                    >
                      Total Collect Charges
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 3 }}>
              <h5 className="text-black pl-1 font-semibold text-center">
                {copies[index]}
              </h5>
            </div>

            <div style={{ flex: 2 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>
        </div>

        {/* Attachment Section */}
        {shouldRenderSecondPage && (
          <div
            id="second-page"
            className="mx-auto p-2"
            style={{ width: "100%", height: "auto" }}
          >
            <h2 className="text-black text-lg pb-2 font-semibold text-center">
              ATTACHED SHEET
            </h2>
            {/* B/L No Section */}
            <div
              className="flex"
              style={{ border: "1px solid black", height: "30px" }}
            >
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  B/L No : {reportData?.blNo}
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Vessel Name : {reportData?.oceanVessel?.Name}
                  <span className="ms-2">{reportData?.voyageNo?.Name}</span>
                </p>
              </div>
            </div>
            {/* Description of goods */}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                height: "30px",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Marks & Nos.
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Description of goods
                </p>
              </div>
            </div>
            {/* Description of goods Data*/}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                minHeight: "70px !important",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                ></p>
              </div>
              <div
                style={{
                  flex: "40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  {reportData?.descOfGoodsDetaislAttach}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const rptAirwayBillPrintChargeCopies = (index) => {
    return (
      <div>
        <div id="157" className="mx-auto text-black page-break">
          <AirwayBillPrintChargeCopies index={index} />
        </div>
      </div>
    );
  };

  const AirwayBillPrintAsAgreed = () => {
    console.log("data", reportData);
    return (
      <div>
        <div
          className="mx-auto pl-2 pr-2 pt-2"
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 5 }}>
              <h2 className="text-black pl-1 font-semibold text-left">
                {reportData?.blPort}
              </h2>
            </div>
            <div style={{ flex: 5 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              border: "1px solid black",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
              }}
            >
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Shipper's Name & Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Shipper's Account No
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shipper} <br />
                      {reportData?.shipperAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0px 0px 0px",
                }}
              />
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Consignee's Name and Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Consignee's Account Number
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.consignee} <br />
                      {reportData?.consigneeAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "2px 0 2px 0",
                }}
              />
              <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "5px",
                    paddingLeft: "5px",
                  }}
                >
                  Issuing Carriers Agent Name and City
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    marginTop: "2px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.polAgentName}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  margin: "0px 0px 0px 0px",
                }}
              />

              {/* Left Section */}
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  className="h-auto"
                  style={{
                    display: "flex",
                  }}
                >
                  {/* Left Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        minHeight: "30px",
                        maxHeight: "30px",
                        borderRight: "1px solid black",
                      }}
                    >
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Agent's IATA Code
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                        }}
                      >
                        {reportData?.agentsIATACode}
                      </p>
                    </div>
                  </div>
                  {/* Right Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Account No.
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                        }}
                      >
                        {reportData?.accountNo}
                      </p>
                    </div>
                  </div>
                </div>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid black",
                    height: "2px",
                    margin: "0px 0px 0px 0px",
                  }}
                />
                <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      marginTop: "2px",
                      paddingRight: "10px",
                      paddingLeft: "5px",
                      width: "100%",
                    }}
                  >
                    Airport of departure(Addr.of First Carrier) and Requested
                    Routing
                  </p>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "9px",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                      marginTop: "2px",
                      paddingBottom: "5px",
                      width: "100%",
                    }}
                  >
                    {reportData?.pol}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                minHeight: "70px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "10px",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  width: "100%",
                  marginTop: "2px",
                  fontWeight: "bold",
                }}
              >
                <div className=" pl-1">
                  <div className="text-black">
                    <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {reportData?.blType}
                    </p>
                    <p style={{ fontSize: "10px" }}>(Air Consignment note)</p>
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "10px ",
                        paddingTop: "3px",
                        paddingBottom: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </p>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0 5px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "5px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  Copies 1,2 and 3 of this Air Waybill are originals and have
                  the same valid
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "75px",
                  maxHeight: "75px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "7px",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    width: "100%",
                  }}
                >
                  It is agreed that the goods declared herein are accepted in
                  apparent good order and condition (except as noted) for
                  carriage SUBJECT TO CONDITIONS OF CONTRACT ON THE REVERSE HER
                  OF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD
                  OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRART INSTRUCTIONS ARE
                  GIVEN HEREON BY THE SHIPPER AND SHIPPER AGREES THAT THE
                  SHIPMENT MAY BE CARRIED VIA INTERMEDIATE STOPPING PLACES WHICH
                  THE CARRIER DEEMS APPROPRIATE. THE SHIPPER'S ATTENTION IS
                  DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF
                  LIABILITY.Shipper may increase such limitation of liability by
                  declaring a higher values for carriage and paying a
                  supplemental charge if required
                </p>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "13px 0 2px 0",
                }}
              />
              <div
                style={{
                  minHeight: "100px",
                  maxHeight: "100px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                  }}
                >
                  Accounting Information {reportData?.freightPrepaidCollect}
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    paddingBottom: "5px",
                  }}
                >
                  {reportData?.notifyPartyNameAndAddress}
                </p>
              </div>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort1}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                By First Carrier
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.shippingLineCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Routing and Dest
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              ></p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort2}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort1Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort3}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5.1%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort2Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Currency
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                INR
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal text-center"
                style={{
                  fontSize: "7px",
                }}
              >
                CHGS Code
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.chgsCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  WT/VAL
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  Other
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Carriage
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.nvd}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Customs
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.nvc}
              </p>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "50%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Airport of Destination
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.pod}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "50.2%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Abhishek
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.preCarriage || ""}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "35%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Amount of Insurance
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                XXX
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "65%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                INSURANCE- If carrier offers insurance, and such insurance is
                requested in accordance with the conditions there of, indicate
                amount to be insured in figures in box marked "Amount of
                Insurance".
              </p>
            </div>
          </div>

          {/* Handling Information: Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "50px",
              maxHeight: "50px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex-1",
                  width: "100%",
                  maxHeight: "50px",
                  minHeight: "50px",
                  position: "relative",
                }}
              >
                <div
                  className="text-left"
                  style={{
                    maxHeight: "20px",
                    minHeight: "20px",
                    height: "20px",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      paddingLeft: "5px",
                      width: "95%",
                    }}
                  >
                    Handling Information: PLEASE INFORM CONSIGNEE IMMEDIATELY ON
                    ARRIVAL OF CARGO.
                    {reportData?.marksAndNoActual}
                  </p>
                </div>
                <div className="text-center flex justify-end absolute bottom-0 right-0">
                  <span
                    className="pl-1 border-t border-black border-l "
                    style={{
                      fontSize: "9px",
                      paddingTop: "3px",
                      paddingBottom: "2px",
                      width: "50px",
                    }}
                  >
                    SCI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Eight-Section Division */}
          {/* First row with content */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderBottom: "1px solid black",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              maxHeight: "40px",
              minHeight: "40px",
            }}
          >
            {/* Section 1: No of Pieces RCP */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                No of Pieces RCP
              </p>
            </div>

            {/* Section 2: Gross Weight */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Gross Weight
              </p>
            </div>

            {/* Section 3: kg lb */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                kg lb
              </p>
            </div>

            {/* Section 4: Rate Class & Commodity Item No */}
            <div
              style={{
                flexBasis: "15%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <div>
                <p
                  className="text-black font-normal w-full"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "left",
                  }}
                >
                  Rate Class
                </p>
              </div>
              <div>
                <div>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "10%",
                    }}
                  >
                    {" "}
                  </p>
                </div>
                <div
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "center",
                    width: "82%",
                    borderLeft: "1px solid black",
                    borderTop: "1px solid black",
                    float: "right",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "82%",
                    }}
                  >
                    Commodity Item No
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Chargeable weight */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Chargeable weight
              </p>
            </div>

            {/* Section 6: Rate & Charge */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                position: "relative",
                height: "40px", // adjust as needed
                width: "100%",
              }}
            >
              {/* Diagonal Line */}
              <svg style={{ position: "absolute", top: 0, left: 0, right: 60 }}>
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="0"
                  stroke="black"
                  strokeWidth="1"
                />
              </svg>

              {/* "Rate" - Top Left */}
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "16px",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: "8px",
                }}
              >
                Rate
              </div>

              {/* "Charge" - Bottom Right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "6px",
                  fontWeight: "bold",
                  fontSize: "8px",
                  color: "black",
                }}
              >
                Charge
              </div>
            </div>

            {/* Section 7: Total */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Total
              </p>
            </div>

            {/* Section 8: Nature and Quantity of Goods (incl.Dimensions of Volume) */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Nature and Quantity of Goods (incl.Dimensions of Volume)
              </p>
            </div>
          </div>

          {/* Second row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "215px",
              maxHeight: "215px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal text-center text-bold"
                style={{
                  fontSize: "8px",
                }}
              >
                AS AGREED
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal text-center text-bold"
                style={{
                  fontSize: "8px",
                }}
              >
                AS AGREED
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>
          </div>

          {/* Third row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "15px",
              maxHeight: "15px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                K/Q
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal text-center text-bold"
                style={{
                  fontSize: "8px",
                }}
              >
                AS AGREED
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.GoodsDescription}
              </p>
            </div>
          </div>

          {/* Footer Division Section */}
          <div
            className="flex"
            style={{
              border: "1px solid black",
              height: "323px",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
                width: "40%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Weight Charge
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preWeightCharge}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collWeightCharge}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Valuation Charg
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      TAX
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Agent
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueAgent}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueAgent}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Carrier
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueCarrier}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueCarrier}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "30px solid lightgrey",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotal}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotal}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Currency Conversion Rate
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      CC Charge in Dest Currency
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      For Carrier's Use Only at Destination
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Charge at Destination
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                width: "60%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "108px",
                  maxHeight: "108px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "5px",
                    paddingLeft: "10px",
                    paddingTop: "5PX",
                    width: "100%",
                    paddingBottom: "2px",
                  }}
                >
                  Other Charges
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.otherCharge}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "90px",
                  maxHeight: "90px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  I hereby Certify that the particulars on the face here of are
                  correct and that insofar as any part of the consignment
                  contains dangerous goods. I hereby Certify that the contentd
                  of this consignment are fully and accurately described above
                  by proper shipping name and are classified, packaged, marked
                  and labeled, and in proper condition for carriage by air
                  according to the applicable dangerous Goods Regulations.
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                ></p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "1px",
                    width: "100%",
                    paddingBottom: "1px",
                  }}
                >
                  Signature of Shipper or his Agent
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "55px",
                  maxHeight: "55px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "35px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      {reportData?.blIssueDate}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      {reportData?.blIssuePlaceText}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      As Agent For Carrier {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Executed on (date)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      at (place)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Signature of Issuing Carrier or its Agent
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "40%",
                      borderRight: "1px solid black",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                        borderBottom: "1px solid black",
                      }}
                    >
                      Total Collect Charges
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 5 }}>
              <h2 className="text-black pl-1 font-semibold text-left"></h2>
            </div>
            <div style={{ flex: 2 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>
        </div>

        {/* Attachment Section */}
        {shouldRenderSecondPage && (
          <div
            id="second-page"
            className="mx-auto p-2"
            style={{ width: "100%", height: "auto" }}
          >
            <h2 className="text-black text-lg pb-2 font-semibold text-center">
              ATTACHED SHEET
            </h2>
            {/* B/L No Section */}
            <div
              className="flex"
              style={{ border: "1px solid black", height: "30px" }}
            >
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  B/L No : {reportData?.blNo}
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Vessel Name : {reportData?.oceanVessel?.Name}
                  <span className="ms-2">{reportData?.voyageNo?.Name}</span>
                </p>
              </div>
            </div>
            {/* Description of goods */}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                height: "30px",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Marks & Nos.
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Description of goods
                </p>
              </div>
            </div>
            {/* Description of goods Data*/}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                minHeight: "70px !important",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                ></p>
              </div>
              <div
                style={{
                  flex: "40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  {reportData?.descOfGoodsDetaislAttach}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const rptAirwayBillPrintAsAgreed = () => (
    <div>
      <div id="158" className="mx-auto text-black">
        <AirwayBillPrintAsAgreed data={reportData} />
      </div>
    </div>
  );

  const AirwayBillPrintASAgreedCopies = ({ index }) => {
    console.log("data", reportData);
    console.log("index - ", index);
    return (
      <div>
        <div
          className="mx-auto pl-2 pr-2 pt-2"
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 5 }}>
              <h2 className="text-black pl-1 font-semibold text-left">
                {reportData?.blPort}
              </h2>
            </div>
            <div style={{ flex: 5 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              border: "1px solid black",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
              }}
            >
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Shipper's Name & Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Shipper's Account No
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shipper} <br />
                      {reportData?.shipperAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0px 0px 0px",
                }}
              />
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Consignee's Name and Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Consignee's Account Number
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.consignee} <br />
                      {reportData?.consigneeAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "2px 0 2px 0",
                }}
              />
              <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "5px",
                    paddingLeft: "5px",
                  }}
                >
                  Issuing Carriers Agent Name and City
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    marginTop: "2px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.polAgentName}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  margin: "0px 0px 0px 0px",
                }}
              />

              {/* Left Section */}
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  className="h-auto"
                  style={{
                    display: "flex",
                  }}
                >
                  {/* Left Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        minHeight: "30px",
                        maxHeight: "30px",
                        borderRight: "1px solid black",
                      }}
                    >
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Agent's IATA Code
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                        }}
                      >
                        {reportData?.agentsIATACode}
                      </p>
                    </div>
                  </div>
                  {/* Right Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Account No.
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                        }}
                      >
                        {reportData?.accountNo}
                      </p>
                    </div>
                  </div>
                </div>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid black",
                    height: "2px",
                    margin: "0px 0px 0px 0px",
                  }}
                />
                <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      marginTop: "2px",
                      paddingRight: "10px",
                      paddingLeft: "5px",
                      width: "100%",
                    }}
                  >
                    Airport of departure(Addr.of First Carrier) and Requested
                    Routing
                  </p>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "9px",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                      marginTop: "2px",
                      paddingBottom: "5px",
                      width: "100%",
                    }}
                  >
                    {reportData?.pol}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                minHeight: "70px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "10px",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  width: "100%",
                  marginTop: "2px",
                  fontWeight: "bold",
                }}
              >
                <div className=" pl-1">
                  <div className="text-black">
                    <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {reportData?.blType}
                    </p>
                    <p style={{ fontSize: "10px" }}>(Air Consignment note)</p>
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "10px ",
                        paddingTop: "3px",
                        paddingBottom: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </p>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0 5px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "5px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  Copies 1,2 and 3 of this Air Waybill are originals and have
                  the same valid
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "75px",
                  maxHeight: "75px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "7px",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    width: "100%",
                  }}
                >
                  It is agreed that the goods declared herein are accepted in
                  apparent good order and condition (except as noted) for
                  carriage SUBJECT TO CONDITIONS OF CONTRACT ON THE REVERSE HER
                  OF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD
                  OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRART INSTRUCTIONS ARE
                  GIVEN HEREON BY THE SHIPPER AND SHIPPER AGREES THAT THE
                  SHIPMENT MAY BE CARRIED VIA INTERMEDIATE STOPPING PLACES WHICH
                  THE CARRIER DEEMS APPROPRIATE. THE SHIPPER'S ATTENTION IS
                  DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF
                  LIABILITY.Shipper may increase such limitation of liability by
                  declaring a higher values for carriage and paying a
                  supplemental charge if required
                </p>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "13px 0 2px 0",
                }}
              />
              <div
                style={{
                  minHeight: "100px",
                  maxHeight: "100px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                  }}
                >
                  Accounting Information {reportData?.freightPrepaidCollect}
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    paddingBottom: "5px",
                  }}
                >
                  {reportData?.notifyPartyNameAndAddress}
                </p>
              </div>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort1}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                By First Carrier
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.shippingLineCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Routing and Dest
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              ></p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort2}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort1Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort3}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5.1%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort2Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Currency
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                INR
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal text-center"
                style={{
                  fontSize: "7px",
                }}
              >
                CHGS Code
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.chgsCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  WT/VAL
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  Other
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Carriage
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.nvd}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Customs
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.nvc}
              </p>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "50%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Airport of Destination
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.pod}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "50.2%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Abhishek
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.preCarriage || ""}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "35%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Amount of Insurance
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                XXX
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "65%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                INSURANCE- If carrier offers insurance, and such insurance is
                requested in accordance with the conditions there of, indicate
                amount to be insured in figures in box marked "Amount of
                Insurance".
              </p>
            </div>
          </div>

          {/* Handling Information: Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "50px",
              maxHeight: "50px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex-1",
                  width: "100%",
                  maxHeight: "50px",
                  minHeight: "50px",
                  position: "relative",
                }}
              >
                <div
                  className="text-left"
                  style={{
                    maxHeight: "20px",
                    minHeight: "20px",
                    height: "20px",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      paddingLeft: "5px",
                      width: "95%",
                    }}
                  >
                    Handling Information: PLEASE INFORM CONSIGNEE IMMEDIATELY ON
                    ARRIVAL OF CARGO.
                    {reportData?.marksAndNoActual}
                  </p>
                </div>
                <div className="text-center flex justify-end absolute bottom-0 right-0">
                  <span
                    className="pl-1 border-t border-black border-l "
                    style={{
                      fontSize: "9px",
                      paddingTop: "3px",
                      paddingBottom: "2px",
                      width: "50px",
                    }}
                  >
                    SCI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Eight-Section Division */}
          {/* First row with content */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderBottom: "1px solid black",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              maxHeight: "40px",
              minHeight: "40px",
            }}
          >
            {/* Section 1: No of Pieces RCP */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                No of Pieces RCP
              </p>
            </div>

            {/* Section 2: Gross Weight */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Gross Weight
              </p>
            </div>

            {/* Section 3: kg lb */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                kg lb
              </p>
            </div>

            {/* Section 4: Rate Class & Commodity Item No */}
            <div
              style={{
                flexBasis: "15%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <div>
                <p
                  className="text-black font-normal w-full"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "left",
                  }}
                >
                  Rate Class
                </p>
              </div>
              <div>
                <div>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "10%",
                    }}
                  >
                    {" "}
                  </p>
                </div>
                <div
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "center",
                    width: "82%",
                    borderLeft: "1px solid black",
                    borderTop: "1px solid black",
                    float: "right",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "82%",
                    }}
                  >
                    Commodity Item No
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Chargeable weight */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Chargeable weight
              </p>
            </div>

            {/* Section 6: Rate & Charge */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                position: "relative",
                height: "40px", // adjust as needed
                width: "100%",
              }}
            >
              {/* Diagonal Line */}
              <svg style={{ position: "absolute", top: 0, left: 0, right: 60 }}>
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="0"
                  stroke="black"
                  strokeWidth="1"
                />
              </svg>

              {/* "Rate" - Top Left */}
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "16px",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: "8px",
                }}
              >
                Rate
              </div>

              {/* "Charge" - Bottom Right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "6px",
                  fontWeight: "bold",
                  fontSize: "8px",
                  color: "black",
                }}
              >
                Charge
              </div>
            </div>

            {/* Section 7: Total */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Total
              </p>
            </div>

            {/* Section 8: Nature and Quantity of Goods (incl.Dimensions of Volume) */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Nature and Quantity of Goods (incl.Dimensions of Volume)
              </p>
            </div>
          </div>

          {/* Second row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "215px",
              maxHeight: "215px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                AS AGREED
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                AS AGREED
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>
          </div>

          {/* Third row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "15px",
              maxHeight: "15px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                K/Q
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                AS AGREED
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.GoodsDescription}
              </p>
            </div>
          </div>

          {/* Footer Division Section */}
          <div
            className="flex"
            style={{
              border: "1px solid black",
              height: "323px",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
                width: "40%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Weight Charge
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preWeightCharge}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collWeightCharge}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Valuation Charg
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      TAX
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Agent
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueAgent}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueAgent}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Carrier
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueCarrier}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueCarrier}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "30px solid lightgrey",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotal}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotal}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Currency Conversion Rate
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      CC Charge in Dest Currency
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      For Carrier's Use Only at Destination
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Charge at Destination
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                width: "60%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "108px",
                  maxHeight: "108px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "5px",
                    paddingLeft: "10px",
                    paddingTop: "5PX",
                    width: "100%",
                    paddingBottom: "2px",
                  }}
                >
                  Other Charges
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.otherCharge}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "90px",
                  maxHeight: "90px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  I hereby Certify that the particulars on the face here of are
                  correct and that insofar as any part of the consignment
                  contains dangerous goods. I hereby Certify that the contentd
                  of this consignment are fully and accurately described above
                  by proper shipping name and are classified, packaged, marked
                  and labeled, and in proper condition for carriage by air
                  according to the applicable dangerous Goods Regulations.
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                ></p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "1px",
                    width: "100%",
                    paddingBottom: "1px",
                  }}
                >
                  Signature of Shipper or his Agent
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "55px",
                  maxHeight: "55px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "35px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      {reportData?.blIssueDate}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      {reportData?.blIssuePlaceText}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      As Agent For Carrier {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Executed on (date)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      at (place)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Signature of Issuing Carrier or its Agent
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "40%",
                      borderRight: "1px solid black",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                        borderBottom: "1px solid black",
                      }}
                    >
                      Total Collect Charges
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 3 }}>
              <h5 className="text-black pl-1 font-semibold text-center">
                {copies[index]}
              </h5>
            </div>

            <div style={{ flex: 2 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>
        </div>

        {/* Attachment Section */}
        {shouldRenderSecondPage && (
          <div
            id="second-page"
            className="mx-auto p-2"
            style={{ width: "100%", height: "auto" }}
          >
            <h2 className="text-black text-lg pb-2 font-semibold text-center">
              ATTACHED SHEET
            </h2>
            {/* B/L No Section */}
            <div
              className="flex"
              style={{ border: "1px solid black", height: "30px" }}
            >
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  B/L No : {reportData?.blNo}
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Vessel Name : {reportData?.oceanVessel?.Name}
                  <span className="ms-2">{reportData?.voyageNo?.Name}</span>
                </p>
              </div>
            </div>
            {/* Description of goods */}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                height: "30px",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Marks & Nos.
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Description of goods
                </p>
              </div>
            </div>
            {/* Description of goods Data*/}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                minHeight: "70px !important",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                ></p>
              </div>
              <div
                style={{
                  flex: "40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  {reportData?.descOfGoodsDetaislAttach}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const rptAirwayBillPrintASAgreedCopies = (index) => {
    return (
      <div>
        <div id="159" className="mx-auto text-black page-break">
          <AirwayBillPrintASAgreedCopies index={index} />
        </div>
      </div>
    );
  };

  const AirwayBillPrintShipperCopy = () => {
    console.log("data", reportData);
    return (
      <div>
        <div
          className="mx-auto pl-2 pr-2 pt-2"
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 5 }}>
              <h2 className="text-black pl-1 font-semibold text-left">
                {reportData?.blPort}
              </h2>
            </div>
            <div style={{ flex: 5 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              border: "1px solid black",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
              }}
            >
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Shipper's Name & Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Shipper's Account No
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shipper} <br />
                      {reportData?.shipperAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0px 0px 0px",
                }}
              />
              <div style={{ minHeight: "90px" }}>
                <div
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    width: "100%",
                  }}
                >
                  <div className="flex">
                    <div style={{ width: "60%" }}>
                      <span className="p-1" style={{ fontSize: "8px" }}>
                        Consignee's Name and Address
                      </span>
                      :{" "}
                    </div>
                    <div
                      style={{ width: "40%" }}
                      className="text-left border-b border-black border-l"
                    >
                      <span
                        className="pl-1"
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Consignee's Account Number
                      </span>
                    </div>
                  </div>
                  <div>
                    <p
                      className="text-black font-normal"
                      style={{
                        fontSize: "9px",
                        marginTop: "2px",
                        paddingRight: "10px",
                        paddingLeft: "5px",
                        paddingBottom: "5px",
                        // width: "50%",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.consignee} <br />
                      {reportData?.consigneeAddress}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "2px 0 2px 0",
                }}
              />
              <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "5px",
                    paddingLeft: "5px",
                  }}
                >
                  Issuing Carriers Agent Name and City
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    marginTop: "2px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.polAgentName}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  margin: "0px 0px 0px 0px",
                }}
              />

              {/* Left Section */}
              <div
                style={{
                  flex: 1,
                }}
              >
                <div
                  className="h-auto"
                  style={{
                    display: "flex",
                  }}
                >
                  {/* Left Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        minHeight: "30px",
                        maxHeight: "30px",
                        borderRight: "1px solid black",
                      }}
                    >
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Agent's IATA Code
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                        }}
                      >
                        {reportData?.agentsIATACode}
                      </p>
                    </div>
                  </div>
                  {/* Right Section */}
                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "8px",
                          paddingRight: "10px",
                          paddingLeft: "5px",
                        }}
                      >
                        Account No.
                      </p>
                      <p
                        className="text-black font-normal"
                        style={{
                          fontSize: "9px",
                          marginTop: "5px",
                          paddingRight: "10px",
                          paddingLeft: "10px",
                          paddingBottom: "5px",
                        }}
                      >
                        {reportData?.accountNo}
                      </p>
                    </div>
                  </div>
                </div>
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid black",
                    height: "2px",
                    margin: "0px 0px 0px 0px",
                  }}
                />
                <div style={{ minHeight: "30px", maxHeight: "30px" }}>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      marginTop: "2px",
                      paddingRight: "10px",
                      paddingLeft: "5px",
                      width: "100%",
                    }}
                  >
                    Airport of departure(Addr.of First Carrier) and Requested
                    Routing
                  </p>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "9px",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                      marginTop: "2px",
                      paddingBottom: "5px",
                      width: "100%",
                    }}
                  >
                    {reportData?.pol}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                minHeight: "70px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "10px",
                  paddingRight: "10px",
                  paddingLeft: "5px",
                  width: "100%",
                  marginTop: "2px",
                  fontWeight: "bold",
                }}
              >
                <div className=" pl-1">
                  <div className="text-black">
                    <p style={{ fontSize: "14px", fontWeight: "bold" }}>
                      {reportData?.blType}
                    </p>
                    <p style={{ fontSize: "10px" }}>(Air Consignment note)</p>
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "10px ",
                        paddingTop: "3px",
                        paddingBottom: "15px",
                        fontWeight: "bold",
                      }}
                    >
                      {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </p>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0 5px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "5px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  Copies 1,2 and 3 of this Air Waybill are originals and have
                  the same valid
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "75px",
                  maxHeight: "75px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "7px",
                    paddingRight: "8px",
                    paddingLeft: "8px",
                    width: "100%",
                  }}
                >
                  It is agreed that the goods declared herein are accepted in
                  apparent good order and condition (except as noted) for
                  carriage SUBJECT TO CONDITIONS OF CONTRACT ON THE REVERSE HER
                  OF. ALL GOODS MAY BE CARRIED BY ANY OTHER MEANS INCLUDING ROAD
                  OR ANY OTHER CARRIER UNLESS SPECIFIC CONTRART INSTRUCTIONS ARE
                  GIVEN HEREON BY THE SHIPPER AND SHIPPER AGREES THAT THE
                  SHIPMENT MAY BE CARRIED VIA INTERMEDIATE STOPPING PLACES WHICH
                  THE CARRIER DEEMS APPROPRIATE. THE SHIPPER'S ATTENTION IS
                  DRAWN TO THE NOTICE CONCERNING CARRIER'S LIMITATION OF
                  LIABILITY.Shipper may increase such limitation of liability by
                  declaring a higher values for carriage and paying a
                  supplemental charge if required
                </p>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "13px 0 2px 0",
                }}
              />
              <div
                style={{
                  minHeight: "100px",
                  maxHeight: "100px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                  }}
                >
                  Accounting Information {reportData?.freightPrepaidCollect}
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    paddingBottom: "5px",
                  }}
                >
                  {reportData?.notifyPartyNameAndAddress}
                </p>
              </div>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort1}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                By First Carrier
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.shippingLineCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Routing and Dest
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              ></p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort2}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort1Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                TO
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort3}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "5.1%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                BY
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.trPort2Agent}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Currency
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                INR
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "6%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal text-center"
                style={{
                  fontSize: "7px",
                }}
              >
                CHGS Code
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.chgsCode}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  WT/VAL
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "7%",
                borderRight: "1px solid black",
              }}
            >
              <div>
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    borderBottom: "1px solid black",
                  }}
                >
                  Other
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                    borderRight: "1px solid black",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    PP
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.PP}
                  </p>
                </div>
                <div
                  style={{
                    width: "50%",
                    alignItems: "center",
                  }}
                >
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "7px",
                    }}
                  >
                    COLL
                  </p>
                  <p
                    className="text-black font-normal text-center"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {reportData?.COLL}
                  </p>
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Carriage
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.nvd}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "12%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                Declared Value for Customs
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.nvc}
              </p>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "35px",
              maxHeight: "35px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "50%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Airport of Destination
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.pod}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "50.2%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Abhishek
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                {reportData?.preCarriage || ""}
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "35%",
                borderRight: "1px solid black",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                  paddingLeft: "5px",
                }}
              >
                Amount of Insurance
              </p>
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "9px",
                  marginTop: "5px",
                  paddingLeft: "10px",
                  paddingBottom: "5px",
                }}
              >
                XXX
              </p>
            </div>
            <div
              style={{
                display: "flex-1",
                width: "65%",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingLeft: "5px",
                }}
              >
                INSURANCE- If carrier offers insurance, and such insurance is
                requested in accordance with the conditions there of, indicate
                amount to be insured in figures in box marked "Amount of
                Insurance".
              </p>
            </div>
          </div>

          {/* Handling Information: Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
              minHeight: "50px",
              maxHeight: "50px",
            }}
          >
            <div
              style={{
                display: "flex-1",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex-1",
                  width: "100%",
                  maxHeight: "50px",
                  minHeight: "50px",
                  position: "relative",
                }}
              >
                <div
                  className="text-left"
                  style={{
                    maxHeight: "20px",
                    minHeight: "20px",
                    height: "20px",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontSize: "8px",
                      paddingLeft: "5px",
                      width: "95%",
                    }}
                  >
                    Handling Information: PLEASE INFORM CONSIGNEE IMMEDIATELY ON
                    ARRIVAL OF CARGO.
                    {reportData?.marksAndNoActual}
                  </p>
                </div>
                <div className="text-center flex justify-end absolute bottom-0 right-0">
                  <span
                    className="pl-1 border-t border-black border-l "
                    style={{
                      fontSize: "9px",
                      paddingTop: "3px",
                      paddingBottom: "2px",
                      width: "50px",
                    }}
                  >
                    SCI
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Eight-Section Division */}
          {/* First row with content */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderBottom: "1px solid black",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              maxHeight: "40px",
              minHeight: "40px",
            }}
          >
            {/* Section 1: No of Pieces RCP */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                No of Pieces RCP
              </p>
            </div>

            {/* Section 2: Gross Weight */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Gross Weight
              </p>
            </div>

            {/* Section 3: kg lb */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                kg lb
              </p>
            </div>

            {/* Section 4: Rate Class & Commodity Item No */}
            <div
              style={{
                flexBasis: "15%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <div>
                <p
                  className="text-black font-normal w-full"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "left",
                  }}
                >
                  Rate Class
                </p>
              </div>
              <div>
                <div>
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "10%",
                    }}
                  >
                    {" "}
                  </p>
                </div>
                <div
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "8px",
                    textAlign: "center",
                    width: "82%",
                    borderLeft: "1px solid black",
                    borderTop: "1px solid black",
                    float: "right",
                  }}
                >
                  <p
                    className="text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
                      width: "82%",
                    }}
                  >
                    Commodity Item No
                  </p>
                </div>
              </div>
            </div>

            {/* Section 5: Chargeable weight */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Chargeable weight
              </p>
            </div>

            {/* Section 6: Rate & Charge */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                position: "relative",
                height: "40px", // adjust as needed
                width: "100%",
              }}
            >
              {/* Diagonal Line */}
              <svg style={{ position: "absolute", top: 0, left: 0, right: 60 }}>
                <line
                  x1="0"
                  y1="100%"
                  x2="100%"
                  y2="0"
                  stroke="black"
                  strokeWidth="1"
                />
              </svg>

              {/* "Rate" - Top Left */}
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "16px",
                  fontWeight: "bold",
                  color: "black",
                  fontSize: "8px",
                }}
              >
                Rate
              </div>

              {/* "Charge" - Bottom Right */}
              <div
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "6px",
                  fontWeight: "bold",
                  fontSize: "8px",
                  color: "black",
                }}
              >
                Charge
              </div>
            </div>

            {/* Section 7: Total */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Total
              </p>
            </div>

            {/* Section 8: Nature and Quantity of Goods (incl.Dimensions of Volume) */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "8px",
                  textAlign: "center",
                }}
              >
                Nature and Quantity of Goods (incl.Dimensions of Volume)
              </p>
            </div>
          </div>

          {/* Second row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "215px",
              maxHeight: "215px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.containerDetail}
              </p>
            </div>
          </div>

          {/* Third row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "15px",
              maxHeight: "15px",
            }}
          >
            {/* Section 1: No of Pieces RCP Content */}
            <div
              style={{
                flexBasis: "5%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 2: Gross Weight Content */}
            <div
              style={{
                flexBasis: "12%",
                borderRight: "1px solid black",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 3: kg lb Content */}
            <div
              style={{
                flexBasis: "3%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                K/Q
              </p>
            </div>

            {/* Section 4: Rate Class Content */}
            <div
              style={{
                flexBasis: "2.8%",
                borderRight: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 5: Commodity Item No Content */}
            <div
              style={{
                flexBasis: "12.2%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 6: Chargeable weight Content Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 7: Rate & Charge Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 8: Total Content */}
            <div
              style={{
                flexBasis: "10%",
                borderRight: "5px solid lightGrey",
                borderTop: "1px solid black",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {""}
              </p>
            </div>

            {/* Section 9: Nature and Quantity of Goods (incl.Dimensions of Volume) Content */}
            <div
              style={{
                flexBasis: "35%",
                padding: "2px",
              }}
            >
              <p
                className="text-black font-normal"
                style={{
                  fontSize: "8px",
                }}
              >
                {reportData?.GoodsDescription}
              </p>
            </div>
          </div>

          {/* Footer Division Section */}
          <div
            className="flex"
            style={{
              border: "1px solid black",
              height: "323px",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
                width: "40%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Weight Charge
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preWeightChargeSell}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collWeightChargeSell}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Valuation Charg
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      TAX
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Agent
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "5px solid lightgrey",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueAgentSell}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueAgentSell}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Other Charges Due Carrier
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "25%",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotalOtherChargesDueCarrierSell}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotalOtherChargesDueCarrierSell}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "30px solid lightgrey",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Prepaid
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Total Collect
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    >
                      {reportData?.preTotalSell}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    >
                      {reportData?.collTotalSell}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Currency Conversion Rate
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      CC Charge in Dest Currency
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      For Carrier's Use Only at Destination
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "50%",
                      paddingRight: "15px",
                      paddingLeft: "15px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                        borderRight: "1px solid Black",
                        borderLeft: "1px solid Black",
                        borderBottom: "1px solid Black",
                      }}
                    >
                      Charge at Destination
                    </p>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                      borderRight: "1px solid black",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                      }}
                    ></p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "50%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div
              style={{
                flex: 1,
                width: "60%",
              }}
            >
              <div
                style={{
                  flex: 1,
                  minHeight: "108px",
                  maxHeight: "108px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "5px",
                    paddingLeft: "10px",
                    paddingTop: "5PX",
                    width: "100%",
                    paddingBottom: "2px",
                  }}
                >
                  Other Charges
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  {reportData?.otherChargeSell}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "90px",
                  maxHeight: "90px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    width: "100%",
                    paddingBottom: "5px",
                  }}
                >
                  I hereby Certify that the particulars on the face here of are
                  correct and that insofar as any part of the consignment
                  contains dangerous goods. I hereby Certify that the contentd
                  of this consignment are fully and accurately described above
                  by proper shipping name and are classified, packaged, marked
                  and labeled, and in proper condition for carriage by air
                  according to the applicable dangerous Goods Regulations.
                </p>
                <p
                  className="text-black font-normal"
                  style={{
                    fontSize: "9px",
                    marginTop: "2px",
                    paddingRight: "10px",
                    paddingLeft: "5px",
                    paddingBottom: "5px",
                    fontWeight: "bold",
                  }}
                ></p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "2px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <p
                  className="text-black font-normal text-center"
                  style={{
                    fontSize: "8px",
                    fontWeight: "bold",
                    paddingRight: "10px",
                    paddingLeft: "1px",
                    width: "100%",
                    paddingBottom: "1px",
                  }}
                >
                  Signature of Shipper or his Agent
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "55px",
                  maxHeight: "55px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "35px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      {reportData?.blIssueDate}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      {reportData?.blIssuePlaceText}
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      As Agent For Carrier {reportData?.shippingLine}
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "1px 0 2px 0",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "15px",
                  maxHeight: "15px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "15px",
                    maxHeight: "15px",
                    paddingTop: "1px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Executed on (date)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "20%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      at (place)
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "15px",
                      maxHeight: "15px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-left"
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                        paddingBottom: "1px",
                      }}
                    >
                      Signature of Issuing Carrier or its Agent
                    </p>
                  </div>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                }}
              />
              <div
                style={{
                  flex: 1,
                  minHeight: "21px",
                  maxHeight: "21px",
                }}
              >
                <div
                  className="flex"
                  style={{
                    minHeight: "21px",
                    maxHeight: "21px",
                  }}
                >
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "40%",
                      borderRight: "1px solid black",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "1px",
                        paddingLeft: "1px",
                        minHeight: "15px",
                        maxHeight: "15px",
                        borderLeft: "1px solid black",
                        borderRight: "1px solid black",
                        borderBottom: "1px solid black",
                      }}
                    >
                      Total Collect Charges
                    </p>
                  </div>
                  <div
                    style={{
                      minHeight: "21px",
                      maxHeight: "21px",
                      width: "60%",
                    }}
                  >
                    <p
                      className="text-black font-normal text-center "
                      style={{
                        fontSize: "8px",
                        fontWeight: "bold",
                        paddingRight: "10px",
                        paddingLeft: "1px",
                      }}
                    ></p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div className="text-left" style={{ flex: 3 }}>
              <h5 className="text-black pl-1 font-semibold text-center">
                AWB Shipper Copy
              </h5>
            </div>
            <div style={{ flex: 2 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {reportData?.blNos}
              </h2>
            </div>
          </div>
        </div>

        {/* Attachment Section */}
        {shouldRenderSecondPage && (
          <div
            id="second-page"
            className="mx-auto p-2"
            style={{ width: "100%", height: "auto" }}
          >
            <h2 className="text-black text-lg pb-2 font-semibold text-center">
              ATTACHED SHEET
            </h2>
            {/* B/L No Section */}
            <div
              className="flex"
              style={{ border: "1px solid black", height: "30px" }}
            >
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  B/L No : {reportData?.blNo}
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Vessel Name : {reportData?.oceanVessel?.Name}
                  <span className="ms-2">{reportData?.voyageNo?.Name}</span>
                </p>
              </div>
            </div>
            {/* Description of goods */}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                height: "30px",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Marks & Nos.
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Description of goods
                </p>
              </div>
            </div>
            {/* Description of goods Data*/}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                minHeight: "70px !important",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                ></p>
              </div>
              <div
                style={{
                  flex: "40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  {reportData?.descOfGoodsDetaislAttach}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  const rptAirwayBillPrintShipperCopy = () => (
    <div>
      <div id="160" className="mx-auto text-black">
        <AirwayBillPrintShipperCopy data={reportData} />
      </div>
    </div>
  );

  const AirCargoMainfest = ({ index }) => {
    console.log("data", Cargodata);
    console.log("index - ", index);
    return (
      <div>
        <div
          className="mx-auto pl-2 pr-2 pt-2"
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            <div style={{ flex: 5 }}>
              <h2 className="text-black pr-1 font-semibold text-right ">
                {Cargodata?.blNo}
              </h2>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const rptAirCargoMainfest = (index) => {
    return (
      <div>
        <div id="161" className="mx-auto text-black page-break">
          <AirCargoMainfest index={index} />
        </div>
      </div>
    );
  };

  const BlPrint = ({ bldata }) => {
    console.log("=>>", bldata);
    return (
      <div className="!text-black">
        <div
          className="mx-auto pl-2 pr-2 pt-2"
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
            className="mx-auto"
          >
            {/* 80% width */}
            <div style={{ width: "70%" }}>
              <h2 className="!text-black text-lg pb-2 font-semibold text-right">
                MULTI MODAL TRANSPORT DOCUMENT
              </h2>
            </div>

            {/* 20% width */}
            <div style={{ width: "30%" }}>
              <h2 className="!text-black text-md pb-2 font-semibold text-right uppercase">
                {bldata && bldata.blStatus === "D"
                  ? "Draft"
                  : bldata && bldata.blTypeName}
              </h2>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              border: "1px solid black",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
              }}
            >
              <div style={{ minHeight: "90px" }}>
                <p
                  className="!text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                  }}
                >
                  Consignor/Shipper
                </p>
                <p
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    paddingBottom: "5px",
                    width: "100%",
                  }}
                >
                  {bldata && bldata.shipperName} <br />
                  {bldata && bldata.shipperAddress}
                </p>
              </div>

              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0px 0px 0px",
                }}
              />
              <div style={{ minHeight: "90px" }}>
                <p
                  className="!text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                  }}
                >
                  Consignee (If 'Order' So indicate)
                </p>
                <p
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    marginTop: "5px",
                    paddingBottom: "5px",
                    width: "100%",
                  }}
                >
                  {bldata && bldata.consigneeName} <br />
                  {bldata && bldata.consigneeAddress}
                </p>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0 8px 0",
                }}
              />
              <div style={{ minHeight: "90px" }}>
                <p
                  className="!text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                  }}
                >
                  Notify Party(No Claim Shall Attach For Failure To Notify)
                </p>
                <p
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    marginTop: "5px",
                    paddingBottom: "5px",
                    width: "100%",
                  }}
                >
                  {bldata && bldata.notifyPartyName} <br />
                  {bldata && bldata.notifyPartyAddress}
                </p>
              </div>
            </div>
            {/* Right Section */}
            <div
              style={{
                flex: 1,
                fontSize: "9px",
                width: "100%",
                marginTop: "5px",
                marginBottom: "5px",
              }}
            >
              <div
                className="flex justify-center items-center  pl-2"
                style={{
                  paddingRight: "10px",
                  paddingLeft: "10px",
                }}
              >
                <div style={{ width: "20%" }}>
                  <span style={{ fontWeight: "bold", fontSize: "10px" }}>
                    BL Number
                  </span>
                  :{" "}
                </div>
                <div style={{ width: "80%" }} className="text-center">
                  <span
                    style={{
                      fontWeight: "bold",
                      paddingRight: "30px",
                      fontSize: "10px",
                    }}
                  >
                    {bldata && bldata.blNo}
                  </span>
                </div>
              </div>
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "5px 0 8px 0",
                }}
              />
              {/* Logo with controlled size */}
              <img
                src={
                  clientId === 6
                    ? "http://94.136.187.170:5016/api/images/NCLP/PaceBlImg20250430094138883.JPG"
                    : ""
                }
                alt="img"
                className="mx-auto mb-4 w-2/3 mt-2 p-4"
                style={{
                  minHeight: "157px",
                  maxHeight: "157px",
                  width: "auto",
                  height: "157px",
                }}
              />
              <hr
                style={{
                  border: "none",
                  borderTop: "1px solid black",
                  height: "1px",
                  margin: "8px 0 2px 0",
                }}
              />
              <p
                className="!text-black font-normal"
                style={{
                  fontSize: "7px",
                  paddingRight: "8px",
                  paddingLeft: "8px",
                  width: "100%",
                }}
              >
                Taken in charge in apparently good condition herein at the place
                of receipt for transport and delivery as mentioned above, unless
                otherwise state. The MTO in accordance with the provision
                contained in the MTD undertakes to perform or to procure the
                performance of the multimodal transport from the place at which
                the goods are taken in charge, to the place designated for
                delivery and assumes responsibility for such transport.
                <br />
                <br />
                Once of the MTD(s) must be surrendered, duly endorsed in
                exchange for the goods. In witness where of the original MTD all
                of this tenure and date have been signed in the number indicated
                below one of which being accomplished the other(s) to be void.
              </p>
            </div>
          </div>

          {/* New Division Section */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              borderBottom: "1px solid black",
            }}
          >
            {/* Left Section */}
            <div
              style={{
                flex: 1,
                borderRight: "1px solid black",
              }}
            >
              <div
                className="h-auto"
                style={{
                  display: "flex",
                }}
              >
                {/* Left Section */}
                <div
                  style={{
                    flex: 1,
                    borderRight: "1px solid black",
                  }}
                >
                  <div style={{ minHeight: "36px" }}>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontWeight: "bold",
                        fontSize: "9px",
                        marginTop: "5px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                      }}
                    >
                      Pre-Carriage By
                    </p>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontSize: "8px",
                        marginTop: "5px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                        paddingBottom: "5px",
                      }}
                    >
                      {bldata && bldata.preCarriage}
                    </p>
                  </div>

                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid black",
                      height: "1px",
                      margin: "5px 0px 0px 0px",
                    }}
                  />
                  <div style={{ minHeight: "36px" }}>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontWeight: "bold",
                        fontSize: "9px",
                        marginTop: "5px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                      }}
                    >
                      Ocean Vessel & Voyage No
                    </p>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontSize: "8px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                        marginTop: "5px",
                        paddingBottom: "5px",
                      }}
                    >
                      {bldata && bldata.polVesselText} /{" "}
                      {bldata && bldata.polVoyageText}
                    </p>
                  </div>
                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid black",
                      height: "1px",
                      margin: "5px 0 8px 0",
                    }}
                  />
                  <div style={{ minHeight: "36px" }}>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontWeight: "bold",
                        fontSize: "9px",
                        marginTop: "5px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                      }}
                    >
                      Place of Discharge
                    </p>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontSize: "8px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                        marginTop: "5px",
                        paddingBottom: "5px",
                      }}
                    >
                      {bldata && bldata.fpdName}
                    </p>
                  </div>
                </div>
                {/* Right Section */}
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <div style={{ minHeight: "36px" }}>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontWeight: "bold",
                        fontSize: "9px",
                        marginTop: "5px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                      }}
                    >
                      Port of Receipt
                    </p>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontSize: "8px",
                        marginTop: "5px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                        paddingBottom: "5px",
                      }}
                    >
                      {bldata && bldata.plrName}
                    </p>
                  </div>

                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid black",
                      height: "1px",
                      margin: "5px 0px 0px 0px",
                    }}
                  />
                  <div style={{ minHeight: "36px" }}>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontWeight: "bold",
                        fontSize: "9px",
                        marginTop: "5px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                      }}
                    >
                      Place of Loading
                    </p>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontSize: "8px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                        marginTop: "5px",
                        paddingBottom: "5px",
                      }}
                    >
                      {bldata && bldata.polName}
                    </p>
                  </div>
                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid black",
                      height: "1px",
                      margin: "5px 0 8px 0",
                    }}
                  />
                  <div style={{ minHeight: "36px" }}>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontWeight: "bold",
                        fontSize: "9px",
                        marginTop: "5px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                      }}
                    >
                      Place of Delivery
                    </p>
                    <p
                      className="!text-black font-normal"
                      style={{
                        fontSize: "8px",
                        paddingRight: "10px",
                        paddingLeft: "10px",
                        marginTop: "5px",
                        paddingBottom: "5px",
                      }}
                    >
                      {bldata && bldata.podName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Section */}
            <div
              style={{
                flex: 1,
              }}
            >
              {/* New Division Section */}

              {/* First Column */}
              <div
                className="border-b border-black"
                style={{ minHeight: "89px" }}
              >
                <p
                  className="!text-black font-normal "
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    marginTop: "5px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                  }}
                >
                  Delivery Agent Destination
                </p>
                <p
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    paddingRight: "10px",
                    paddingLeft: "10px",
                    marginTop: "5px",
                    paddingBottom: "5px",
                    width: "100%",
                  }}
                >
                  {bldata && bldata.notifyPartyName} <br />
                  {bldata && bldata.notifyPartyAddress}
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  minHeight: "45px",
                }}
              >
                {/* Second Column */}
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <p
                    className="!text-black"
                    style={{
                      fontWeight: "bold",
                      fontSize: "9px",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                      marginTop: "5px",
                      paddingBottom: "5px",
                    }}
                  >
                    Modes Means of Transport
                  </p>
                  <p
                    className="!text-black font-normal pl-3"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {bldata && bldata.transportMode}
                  </p>
                </div>

                {/* Third Column */}
                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <p
                    className="!text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "9px",
                      paddingRight: "10px",
                      paddingLeft: "10px",
                      marginTop: "5px",
                      paddingBottom: "5px",
                    }}
                  >
                    Route/Place of Transshipment (if any)
                  </p>
                  <p
                    className="!text-black font-normal"
                    style={{
                      fontSize: "8px",
                    }}
                  >
                    {/* Insert Route Here */}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Five-Section Division */}
          {/* First row with content */}
          <div
            className="h-auto"
            style={{
              display: "flex",
              borderBottom: "1px solid black",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
            }}
          >
            {/* Section 1: Container No(s) */}
            <div
              style={{
                flexBasis: "14%",
                padding: "10px",
              }}
            >
              <p
                className="!text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "9px",
                  textAlign: "center",
                }}
              >
                Container No(s)
              </p>
            </div>

            {/* Section 2: Marks and No(s) */}
            <div
              style={{
                flexBasis: "14%",
                padding: "10px",
              }}
            >
              <p
                className="!text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "9px",
                  textAlign: "center",
                }}
              >
                Marks and No. (s)
              </p>
            </div>

            {/* Section 3: No. of Pkgs., Kinds of Pkgs., General Description of Goods */}
            <div
              style={{
                flexBasis: "44%",
                padding: "10px",
              }}
            >
              <p
                className="!text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "9px",
                  textAlign: "center",
                }}
              >
                No. of Pkgs., Kinds of Pkgs., General Description of Goods
              </p>
            </div>

            {/* Section 4: Gross Weight */}
            <div
              style={{
                flexBasis: "16%",
                padding: "10px",
                textAlign: "center",
              }}
            >
              <p
                className="!text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "9px",
                }}
              >
                Gross Weight (Kgs)
              </p>
            </div>

            {/* Section 5: Measurement */}
            <div
              style={{
                flexBasis: "12%",
                padding: "10px",
              }}
            >
              <p
                className="!text-black font-normal"
                style={{
                  fontWeight: "bold",
                  fontSize: "9px",
                  textAlign: "center",
                }}
              >
                Measurement
              </p>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "330px",
              width: "190mm",
            }}
          >
            {bldata && bldata.blStatus === "D" && (
              <p className="text-black opacity-20 font-bold text-7xl">DRAFT</p>
            )}
          </div>
          {/* Second row with content */}
          <div
            style={{
              display: "flex",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
              minHeight: "330px",
            }}
          >
            {/* Section 1: Container No(s) Content */}
            <div
              style={{
                flexBasis: "14%",
                maxWidth: "14%",
                padding: "10px",
              }}
            >
              <pre
                className="!text-black font-normal"
                style={{
                  fontSize: "9px",
                  width: "100%",
                  whiteSpace: "pre-wrap", // allow wrapping
                  overflowWrap: "break-word", // break long words
                  wordBreak: "break-word", // ensure aggressive breaking
                  margin: 0,
                }}
              >
                {bldata && bldata.containerDetails}
              </pre>
            </div>

            {/* Section 2: Marks and No(s) Content */}
            <div
              style={{
                flexBasis: "14%",
                maxWidth: "14%",
                padding: "10px",
              }}
            >
              <pre
                className="!text-black font-normal"
                style={{
                  fontSize: "9px",
                  width: "100%",
                  whiteSpace: "pre-wrap", // allow wrapping
                  overflowWrap: "break-word", // break long words
                  wordBreak: "break-word", // ensure aggressive breaking
                  margin: 0,
                }}
              >
                {bldata && bldata.marksAndNosDetails}
              </pre>
            </div>

            {/* Section 3: No. of Pkgs., Kinds of Pkgs., General Description of Goods */}
            <div
              style={{
                flexBasis: "44%",
                maxWidth: "44%",
                padding: "10px",
              }}
            >
              <pre
                className="!text-black font-normal"
                style={{
                  fontSize: "9px",
                  width: "100%",
                  whiteSpace: "pre-wrap", // allow wrapping
                  overflowWrap: "break-word", // break long words
                  wordBreak: "break-word", // ensure aggressive breaking
                  margin: 0,
                }}
              >
                {bldata && bldata.goodsDescDetails}
              </pre>
            </div>

            {/* Section 4: Gross Weight Content */}
            <div
              style={{
                flexBasis: "16%",
                maxWidth: "16%",
                padding: "10px",
              }}
            >
              <pre
                className="!text-black font-normal"
                style={{
                  fontSize: "9px",
                  width: "100%",
                  whiteSpace: "pre-wrap", // allow wrapping
                  overflowWrap: "break-word", // break long words
                  wordBreak: "break-word", // ensure aggressive breaking
                  margin: 0,
                }}
              >
                Gross Weight:
                <br />
                {bldata && bldata.cargoWt} {bldata && bldata.weightUnit}
                <br />
                <br />
                Net Weight:
                <br />
                {bldata && bldata.volume} {bldata && bldata.weightUnit} <br />
                <br />
                {/* {bldata?.shippedOnboardDate} */}
              </pre>
            </div>

            {/* Section 5: Measurement Content */}
            <div
              style={{
                flexBasis: "12%",
                maxWidth: "12%",
                padding: "10px",
              }}
            >
              <pre
                className="!text-black font-normal"
                style={{
                  fontSize: "9px",
                  width: "100%",
                  whiteSpace: "pre-wrap", // allow wrapping
                  overflowWrap: "break-word", // break long words
                  wordBreak: "break-word", // ensure aggressive breaking
                  margin: 0,
                }}
              >
                {bldata && bldata.volume} {bldata && bldata.volumeUnitName}{" "}
              </pre>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              borderBottom: "1px solid black",
              borderLeft: "1px solid black",
              borderRight: "1px solid black",
            }}
          >
            {bldata && bldata.blStatus === "F" && (
              <div
                className="font-bold text-right pr-10"
                style={{ fontSize: "15px" }}
              >
                <p>SEAWAY B /L</p>
              </div>
            )}
            <div className="text-center" style={{ fontSize: "9px" }}>
              <p>Particulars above furnished by consignee/consignor</p>
            </div>
          </div>
        </div>
        <div
          className="flex justify-between ml-2 mr-2 border-b border-l border-r border-black"
          style={{ fontSize: "9px", minHeight: "40px" }}
        >
          <div className="flex-1 p-2">
            <p className="font-bold">Freight Charges</p>
            <p className="mt-1">{bldata?.freightPrepaidCollect}</p>
          </div>
          <div className="flex-1 border-l border-black p-2">
            <p className="font-bold">Freight Payable at</p>
            <p className="mt-1">{bldata && bldata.freightpayableAtText}</p>
          </div>
          <div className="flex-1 border-l border-black p-2">
            <p className="font-bold">Number of Original MTDs</p>
            <p className="mt-1">{bldata?.noOfBl}</p>
          </div>
          <div className="flex-1 border-l border-black p-2">
            <p className="font-bold">Place and Date of Issue</p>
            <p className="mt-1">
              {bldata?.blIssuePlaceText} {bldata?.blIssueDate}
            </p>
          </div>
        </div>
        <div
          className="flex border-b border-l border-r border-black ml-2 mr-2"
          style={{ minHeight: "150px", fontSize: "9px" }}
        >
          <div className="w-3/4">
            <p className="p-2">Other Particulars (if any) </p>
            <p className="p-2 mt-20">
              Weight and measurement of the container not to be included{" "}
            </p>
          </div>
          <div className="border-l border-black w-1/4">
            <p className="p-2 font-bold w-full text-center">
              For {""} {bldata && bldata.companyName}
            </p>
            <p className="p-2 mt-20 width-full text-right">
              Authorized Signatory
            </p>
          </div>
        </div>

        {shouldRenderSecondPage && (
          <div
            id="second-page"
            className="mx-auto p-2"
            style={{ width: "100%", height: "auto" }}
          >
            <h2 className="!text-black text-lg pb-2 font-semibold text-center">
              ATTACHED SHEET
            </h2>
            {/* B/L No Section */}
            <div
              className="flex"
              style={{ border: "1px solid black", height: "30px" }}
            >
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="!text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  B/L No : {bldata?.blNo}
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 50%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="!text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Vessel Name : {bldata?.oceanVessel?.Name}
                  <span className="ms-2">{bldata?.voyageNo?.Name}</span>
                </p>
              </div>
            </div>
            {/* Description of goods */}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                height: "30px",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="!text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Marks & Nos.
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="!text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  Description of goods
                </p>
              </div>
            </div>
            {/* Description of goods Data*/}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                minHeight: "70px ",
              }}
            >
              <div
                style={{
                  flex: "0 0 40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                  borderRight: "1px solid black",
                }}
              >
                <p
                  className="!text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                ></p>
              </div>
              <div
                style={{
                  flex: "40%",
                  paddingBottom: "10px",
                  paddingLeft: "10px",
                  paddingRight: "10px",
                }}
              >
                <p
                  className="!text-black font-normal"
                  style={{
                    fontWeight: "bold",
                    fontSize: "9px",
                    paddingLeft: "10px",
                  }}
                >
                  {bldata?.descOfGoodsDetaislAttach}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const BlAttachmentPrint = ({
    bldata,
    containerLines = [],
    marksLines = [],
    goodsLines = [],
  }) => {
    return (
      <>
        <div>
          <p
            className="!text-black text-lg font-bold text-center uppercase"
            style={{ fontSize: "10px" }}
          >
            Attached Sheet
          </p>
        </div>

        {/* header row */}
        <div className="flex border-t border-l border-r border-black mt-2 mr-2 ml-2 text-center !text-black">
          {["BL Number", "Vessel Name", "Voyage"].map((label) => (
            <div
              key={label}
              className="flex-1 uppercase"
              style={
                label !== "BL Number" ? { borderLeft: "1px solid black" } : {}
              }
            >
              <p
                className="pt-1 pb-1 pl-1"
                style={{ fontWeight: "bold", fontSize: "9px" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* data row */}
        <div
          className="flex border-b border-l border-r border-black mr-2 ml-2 text-center"
          style={{ height: "20px" }}
        >
          <div className="flex-1 uppercase">
            <p
              className="pt-1 pb-1 pl-1 !text-black"
              style={{ fontSize: "9px" }}
            >
              {bldata?.hblNo || ""}
            </p>
          </div>
          <div className="flex-1 uppercase border-l border-black">
            <p
              className="pt-1 pb-1 pl-1 !text-black"
              style={{ fontSize: "9px" }}
            >
              {bldata?.podVesselText || ""}
            </p>
          </div>
          <div className="flex-1 uppercase border-l border-black">
            <p
              className="pt-1 pb-1 pl-1 !text-black"
              style={{ fontSize: "9px" }}
            >
              {bldata?.podVoyageText || ""}
            </p>
          </div>
        </div>

        {(marksLines.length || goodsLines.length) && (
          <>
            {/* section headers */}
            <div
              className="h-auto ml-2 mr-2 flex"
              style={{
                borderBottom: "1px solid black",
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
              }}
            >
              {[
                { label: "Marks and No. (s)", basis: "50%" },
                {
                  label:
                    "No. of Pkgs., Kinds of Pkgs., General Description of Goods",
                  basis: "50%",
                },
              ].map(({ label, basis }) => (
                <div key={label} style={{ flexBasis: basis, padding: "5px" }}>
                  <p
                    className="!text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "left",
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* single content row */}
            <div
              className="ml-2 mr-2 flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                minHeight: "200px",
                maxHeight: "auto",
              }}
            >
              {/* Container lines */}
              {/* <div style={{ flexBasis: "14%", padding: "5px" }}>
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {containerLines.join("\n")}
                </pre>
              </div> */}
              {/* Marks lines */}
              <div
                style={{
                  flexBasis: "50%",
                  padding: "5px",
                  marginBottom: "20px",
                }}
              >
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {marksLines.join("\n")}
                </pre>
              </div>
              {/* Goods lines */}
              <div
                style={{
                  flexBasis: "50%",
                  padding: "5px",
                  marginBottom: "20px",
                }}
              >
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {goodsLines.join("\n")}
                </pre>
              </div>
              {/* Gross weight */}
              {/* <div
                style={{
                  flexBasis: "22%",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {bldata?.[0]?.cargoWt || ""} {bldata?.[0]?.weightUnit || ""} /{" "}
                  {bldata?.[0]?.noOfPackages || ""} {bldata?.[0]?.package || ""}
                </pre>
              </div> */}
            </div>
          </>
        )}
      </>
    );
  };

  const BlAttachmentPrintSBX = ({
    bldata,
    containerLines = [],
    marksLines = [],
    goodsLines = [],
  }) => {
    return (
      <div className="pt-2 pl-2 pr-2">
        <div>
          <p
            className="border-t border-l border-r border-black font-bold text-center uppercase"
            style={{ fontSize: "10px", color: "black" }}
          >
            Attached Sheet
          </p>
        </div>

        {/* header row */}
        <div
          style={{ fontSize: "10px", width: "100%" }}
          className="!text-black  border-t border-l border-r border-black flex "
        >
          <div
            style={{ fontSize: "10px", width: "50%" }}
            className="!text-black font-bold ml-8 border-black flex "
          >
            <p>B/l NO : {bldata?.blNo}</p>
          </div>
          <div
            style={{ fontSize: "10px", width: "50%" }}
            className="!text-black font-bold ml-8 border-black flex"
          >
            <p>
              vessel Name : {bldata?.polVessel} {bldata?.polVoyage}
            </p>
          </div>
        </div>

        {/* data row */}
        <div
          className="flex border-b border-l border-r border-t border-black text-left"
          style={{ height: "20px" }}
        >
          <div className="flex-1 uppercase">
            <p
              className="pt-1 pb-1 text-center pl-1 !text-black "
              style={{ fontWeight: "bold", fontSize: "9px" }}
            >
              {bldata?.hblNo || "CONTAINER NOS/SEAL/MARKS & NOS"}
            </p>
          </div>
          <div className="flex-1 text-center uppercase border-0 border-black">
            <p
              className="pt-1 pb-1 text-center pl-1 !text-black"
              style={{ fontWeight: "bold", fontSize: "9px" }}
            >
              {bldata?.polVessel || "Description of Goods"}
            </p>
          </div>
        </div>

        {(marksLines.length || goodsLines.length) && (
          <>
            {/* section headers */}
            {/* <div
              className="h-5 flex"
              style={{
                borderBottom: "1px solid black",
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
              }}
            >
              {[
                { label: "  ", basis: "50%" },
                {
                  label:
                    "  ",
                  basis: "50%",
                },
              ].map(({ label, basis }) => (
                <div key={label} style={{ flexBasis: basis, padding: "5px" }}>
                  <p
                    className="!text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "left",
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div> */}

            {/* single content row */}
            <div
              className="flex"
              style={{
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
                borderBottom: "1px solid black",
                minHeight: "200px",
                maxHeight: "auto",
              }}
            >
              {/* Container lines */}
              {/* <div style={{ flexBasis: "14%", padding: "5px" }}>
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {containerLines.join("\n")}
                </pre>
              </div> */}
              {/* Marks lines */}
              <div
                style={{
                  flexBasis: "50%",
                  marginBottom: "20px",
                }}
              >
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "9px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {marksLines.join("\n")}
                </pre>
              </div>
              {/* Goods lines */}
              <div
                style={{
                  flexBasis: "50%",
                  padding: "5px",
                  marginBottom: "20px",
                }}
              >
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "9px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {goodsLines.join("\n")}
                </pre>
              </div>
              {/* Gross weight */}
              {/* <div
                style={{
                  flexBasis: "22%",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {bldata?.[0]?.cargoWt || ""} {bldata?.[0]?.weightUnit || ""} /{" "}
                  {bldata?.[0]?.noOfPackages || ""} {bldata?.[0]?.package || ""}
                </pre>
              </div> */}
            </div>
          </>
        )}
      </div>
    );
  };

  const BlAttachmentPrintSBXNoLines = ({
    bldata,
    containerLines = [],
    marksLines = [],
    goodsLines = [],
  }) => {
    return (
      <div className="pt-2 pl-2 pr-2">
        <div>
          <p
            className="font-bold text-center uppercase"
            style={{ fontSize: "10px", color: "black" }}
          >
            Attached Sheet
          </p>
        </div>

        {/* header row */}
        <div
          style={{ fontSize: "10px", width: "100%" }}
          className="!text-black flex "
        >
          <div
            style={{ fontSize: "10px", width: "50%" }}
            className="!text-black font-bold ml-8  flex "
          >
            <p>B/l NO : {bldata?.blNo}</p>
          </div>
          <div
            style={{ fontSize: "10px", width: "50%" }}
            className="!text-black font-bold ml-8  flex"
          >
            <p>
              vessel Name : {bldata?.polVessel} {bldata?.polVoyage}
            </p>
          </div>
        </div>

        {/* data row */}
        <div className="flex  text-left" style={{ height: "20px" }}>
          <div className="flex-1 uppercase">
            <p
              className="pt-1 pb-1 text-center pl-1 !text-black "
              style={{ fontWeight: "bold", fontSize: "9px" }}
            >
              {bldata?.hblNo || "CONTAINER NOS/SEAL/MARKS & NOS"}
            </p>
          </div>
          <div className="flex-1 text-center uppercase ">
            <p
              className="pt-1 pb-1 text-center pl-1 !text-black"
              style={{ fontWeight: "bold", fontSize: "9px" }}
            >
              {bldata?.polVessel || "Description of Goods"}
            </p>
          </div>
        </div>

        {(marksLines.length || goodsLines.length) && (
          <>
            {/* section headers */}
            {/* <div
              className="h-5 flex"
              style={{
                borderBottom: "1px solid black",
                borderLeft: "1px solid black",
                borderRight: "1px solid black",
              }}
            >
              {[
                { label: "  ", basis: "50%" },
                {
                  label:
                    "  ",
                  basis: "50%",
                },
              ].map(({ label, basis }) => (
                <div key={label} style={{ flexBasis: basis, padding: "5px" }}>
                  <p
                    className="!text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "left",
                    }}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div> */}

            {/* single content row */}
            <div
              className="flex"
              style={{
                minHeight: "200px",
                maxHeight: "auto",
              }}
            >
              {/* Container lines */}
              {/* <div style={{ flexBasis: "14%", padding: "5px" }}>
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {containerLines.join("\n")}
                </pre>
              </div> */}
              {/* Marks lines */}
              <div
                style={{
                  flexBasis: "50%",
                  marginBottom: "20px",
                }}
              >
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {marksLines.join("\n")}
                </pre>
              </div>
              {/* Goods lines */}
              <div
                style={{
                  flexBasis: "50%",
                  padding: "5px",
                  marginBottom: "20px",
                }}
              >
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {goodsLines.join("\n")}
                </pre>
              </div>
              {/* Gross weight */}
              {/* <div
                style={{
                  flexBasis: "22%",
                  padding: "5px",
                  textAlign: "center",
                }}
              >
                <pre
                  className="!text-black font-normal"
                  style={{
                    fontSize: "8px",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {bldata?.[0]?.cargoWt || ""} {bldata?.[0]?.weightUnit || ""} /{" "}
                  {bldata?.[0]?.noOfPackages || ""} {bldata?.[0]?.package || ""}
                </pre>
              </div> */}
            </div>
          </>
        )}
      </div>
    );
  };

  console.log(
    "trimByWordCountBySup",
    trimByWordCountBySup(bldata?.blClause, 50)
  );

  const rptBillOfLadingSBX = () => (
    <div className="pr-2 pl-2">
      <div id="156" className="mx-auto text-black mt-1">
        <div
          className="flex border-t border-l border-r border-black"
          style={{ width: "100%" }}
        >
          <div style={{ width: "90%" }}>
            <p
              className="text-black text-xs font-bold pt-1 ml-10 pb-1"
              style={{ textAlign: "center" }}
            >
              MULTI-MODAL TRANSPORT DOCUMENT
            </p>
          </div>
          <div style={{ width: "10%" }}>
            <p className="text-black text-xs font-bold text-right p-1">
              {bldata?.blType}
            </p>
          </div>
        </div>
        <div
          className="mx-auto border border-black"
          style={{ height: "280mm" }}
        >
          {/* Header Section - 1 */}
          <div
            className="flex border-b border-black"
            style={{ height: "33%", minHeight: "33%" }}
          >
            <div
              className="border-r border-black"
              style={{ height: "100%", width: "50%" }}
            >
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Shipper (Name & Full Style Address)
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.shipperName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.shipperAddress}
                  </p>
                </div>
              </div>
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Consignee (Name & Full Style Address)
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.consigneeName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.consigneeAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
              <div className="border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Notify (Name & Full Style Address)
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.notifyPartyName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.notifyPartyAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
            </div>
            <div style={{ height: "100%", width: "50%" }}>
              <div
                className="p-2 border-b border-black"
                style={{ height: "10%" }}
              >
                <div className="flex" style={{ width: "100%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "10px", width: "20%" }}
                  >
                    MTD NO.:
                  </p>
                  <p
                    className="text-black  ml-2  text-center"
                    style={{ fontSize: "10px", width: "80%" }}
                  >
                    {bldata?.blNo}
                  </p>
                </div>
              </div>
              <div style={{ height: "50%" }}>
                <div className="pl-6" style={{ height: "60%" }}>
                  <img
                    src="https://api.artinshipping.com/sql-api/uploads/sbximg.png"
                    alt="kanhaiya"
                    style={{
                      maxWidth: "93%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div style={{ height: "40%", minHeight: "40%" }}>
                  <p
                    className="text-black pl-8  text-left leading-tight"
                    style={{ fontSize: "11px", margin: 0 }}
                  >
                    <span className="font-bold ">
                      MTO Registration No. MTO/DGS/3033/MAR/2026
                    </span>
                    <br />
                    <span className="font-bold ">Regd Off: </span>Office No.6,
                    Plot No.56, Great Eastern Summit
                    <br />
                    &apos;A&apos; Wing Soc. Ltd., Sector 15, CBD Belapur, Navi
                    Mumbai - 400614
                    <br />
                    <span className="font-bold ">Tel</span>: 022 - 41234044 |{" "}
                    <span className="font-bold ">Email</span>:
                    selva@smartboxxcontainer.com
                  </p>
                </div>
              </div>

              <div
                className="border-t border-black"
                style={{ height: "32%", minHeight: "32%" }}
              >
                <p
                  className="text-black p-2 font-bold"
                  style={{ fontSize: "8px" }}
                >
                  For Delivery of Goods please apply to :
                </p>
                <p
                  className="text-black p-2 font-bold"
                  style={{ fontSize: "8px" }}
                >
                  {bldata?.fpdAgent}
                  <br></br>
                  {bldata?.fpdAgentAddressName}
                </p>
              </div>
              <div
                className="border-t border-black"
                style={{ height: "8%", minHeight: "6%" }}
              >
                <p
                  className="text-black p-1 font-bold"
                  style={{ fontSize: "8px" }}
                >
                  No. of Original MTD : {bldata?.noOfBl}
                </p>
              </div>
            </div>
          </div>
          {/* Header Section - 2 */}
          <div
            className="flex border-b border-black"
            style={{ height: "6%", minHeight: "6%" }}
          >
            <div
              className="border-r border-black flex"
              style={{ width: "50%" }}
            >
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "50%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place & Date of Receipt
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.plr}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Vessel/Voyage
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.polVessel} {bldata?.polVoyage}
                  </p>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "50%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port of Loading
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.polName}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Mode of Transportation
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.preCarriage}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex" style={{ width: "50%" }}>
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "50%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port of Discharge{" "}
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.pod}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Freight Payable at:
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata && bldata.freightpayableAtText}
                  </p>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "50%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port of Transhipment
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}></p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place of Delivery:
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.fpd}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Grid 1 */}

          <div style={{ height: "41%", maxHeight: "41%" }}>
            <table
              className="text-left"
              style={{ width: "100%", fontSize: "9px" }}
            >
              <tr className="border-b border-black">
                <th
                  scope="col"
                  className="pt-1 pb-1 pl-2 pr-2 text-left align-top border-r border-black"
                  style={{ width: "25%" }}
                >
                  Container No(s) <br />
                  Seal / Marks & <br />
                  Number
                </th>

                <th
                  scope="col"
                  className="pt-1 pb-1 pl-2 pr-2 text-left align-top border-r border-black"
                  style={{ width: "13%" }}
                >
                  Number of <br />
                  Packages
                </th>

                <th
                  scope="col"
                  className="pt-1 pb-1 pl-2 pr-2 text-left align-top border-r border-black"
                  style={{ width: "37%" }}
                >
                  Particulars Furnished by Merchant <br />
                  (Description of goods)
                </th>

                <th
                  scope="col"
                  className="pt-1 pb-1 pl-2 pr-2 text-left align-top border-r border-black"
                  style={{ width: "15%" }}
                >
                  Gross Weight
                </th>

                <th
                  scope="col"
                  className="pt-1 pb-1 pl-2 pr-2 text-left align-top"
                  style={{ width: "10%" }}
                >
                  Measurement
                </th>
              </tr>

              <tr>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left whitespace-pre-wrap break-words border-r border-black"
                  style={{ fontSize: "9px", height: "240px" }}
                >
                  <pre className="text-left">
                    {bldata?.marksAndNosDetails || bldata?.marksNos || ""}
                  </pre>
                  {Array.isArray(bldata?.tblBlContainer) && (
                    <>
                      {bldata.tblBlContainer.length <= 4 ? (
                        // Case: 4 or fewer containers
                        bldata.tblBlContainer.slice(0, 4).map((c, idx) => (
                          <div key={idx} className="leading-tight mt-2">
                            <div>
                              {c?.containerNo ?? ""}
                              {c?.sizeType ? ` ${c.sizeType}` : ""}
                              {c?.agentSealNo ?? ""} {c?.customSealNo ?? ""}
                            </div>
                            <div>PKG: {c?.package ?? ""}</div>
                            <div>GW: {c?.grossWt ?? ""}</div>
                            <div>NW: {c?.netWt ?? ""}</div>
                            {/* <div>CBM: {c?.tareWt ?? ""}</div> */}
                          </div>
                        ))
                      ) : (
                        // Case: more than 4 containers – show alternative content
                        <div
                          className="text-black font-bold mt-2"
                          style={{ fontSize: "9px" }}
                        >
                          {/* Replace this line with your custom display as per the attached sheet */}
                          CONTAINER DETAILS ATTACHED AS PER AS PER ANNEXURE .
                        </div>
                      )}
                    </>
                  )}
                </td>

                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-center border-r border-black"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-center">
                    {bldata?.noOfPackages} {bldata?.packagesCode}
                  </pre>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 text-left border-r border-black"
                  style={{ fontSize: "9px", height: "385px" }}
                >
                  <div className="flex flex-col " style={{ height: "100%" }}>
                    {/* Top 60% */}
                    <div style={{ height: "60%" }}>
                      <p className="text-left align-top">
                        {bldata?.goodsDescDetails}
                        <br />
                        {"SHIPPER'S LOAD/STOW AND / COUNT"}
                      </p>
                    </div>

                    {/* Bottom 40% */}
                    <div
                      className="text-left"
                      style={{ maxWidth: "100%", width: "100%" }}
                    >
                      <pre
                        className="text-left whitespace-pre-wrap break-words m-0"
                        style={{
                          fontSize: "9px",
                          maxWidth: "100%",
                          width: "100%",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        {trimByWordCountBySup(bldata?.blClause, 50)}
                      </pre>
                    </div>
                  </div>
                </td>

                <td
                  className="pt-1 pb-1 pl-2 pr-2 text-left border-r border-black"
                  style={{ fontSize: "9px", height: "385px" }}
                >
                  <div className="flex flex-col justify-evenly h-full ">
                    <div>
                      <pre className="text-left">
                        Gross Weight<br></br>
                        {bldata?.grossWt} {bldata?.weightUnit}
                      </pre>
                    </div>
                    <div className="h-2/5">
                      <pre className="text-left">{bldata?.containerStatus}</pre>
                      <pre className="text-left mt-4">
                        FREIGHT: {bldata?.freightPrepaidCollect}
                      </pre>
                    </div>
                  </div>
                </td>
                {/* 
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left border-r border-black "
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.grossWt} {bldata?.weightUnit}

                  </pre>
                  <div className="h-3/5">
                    <pre className="text-left mt=8">
                      {bldata?.containerStatus}
                    </pre>
                  </div>

                </td> */}
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.volumeWt} {bldata?.volumeUnitName}
                  </pre>
                </td>
              </tr>
            </table>
          </div>
          {/* I'M here */}
          <div
            className="border-t border-black flex"
            style={{ height: "20%", maxHeight: "20%" }}
          >
            <div className="border-r border-black" style={{ width: "50%" }}>
              <div className="border-b border-black" style={{ height: "50%" }}>
                <p
                  style={{ fontSize: "9px", fontWeight: "bold" }}
                  className="text-left align-top p-2"
                >
                  Freight Details, Charges etc.
                </p>
              </div>
              <div style={{ height: "50%" }}>
                <div>
                  <p
                    style={{ fontSize: "9px", fontWeight: "bold" }}
                    className="text-left align-top p-2"
                  >
                    Shipped on board the Vessel :
                  </p>
                </div>
                <div className="flex mt-14">
                  <div>
                    <p
                      style={{ fontSize: "9px", fontWeight: "bold" }}
                      className="text-left align-top pl-2"
                    >
                      Date :
                    </p>
                  </div>
                  <div
                    className="border-b border-black border-dashed"
                    style={{ width: "30%" }}
                  ></div>
                </div>
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div className="border-b border-black" style={{ height: "50%" }}>
                <div>
                  <p
                    style={{ fontSize: "8px", fontWeight: "bold" }}
                    className="text-left align-top p-2"
                  >
                    In witness of the contract herein the above stated number of
                    originals have been issued on which being accomplished the
                    other(s) to be void.{" "}
                  </p>
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      textAlign: "right",
                    }}
                    className="text-right align-top pr-2"
                  >
                    For {bldata?.company}
                  </p>
                </div>
                <div className="flex mt-6">
                  <div>
                    <p
                      style={{ fontSize: "9px", fontWeight: "bold" }}
                      className="text-left align-top pl-2"
                    >
                      Place and Date of issue
                    </p>
                  </div>
                  <div
                    className="border-b border-black border-dashed"
                    style={{ width: "30%" }}
                  ></div>
                  <div>
                    <p
                      style={{ fontSize: "9px", fontWeight: "bold" }}
                      className="text-left align-top pl-2 ml-2"
                    >
                      (Authorised Signatory)
                    </p>
                  </div>
                </div>
              </div>
              <div style={{ height: "50%" }}>
                <p
                  style={{ fontSize: "7px", fontWeight: "bold" }}
                  className="text-left align-top p-2"
                >
                  Taken in charge in apparently good condition herein at the
                  place of receipt for transport & delivery as mentioned above
                  unless otherwise stated . The MTO in accordance with the
                  provision contained in the MTD undertakes to perform or to
                  procure the performance of the multimodal transport from the
                  place at which the goods are taken in charge, to the place
                  designated for delivery & assume responsibility for such
                  transport. <br />
                  <br /> in One of the MTD (S) must be surrendered, duly
                  endorsed in exchange for the goods in witness where of the
                  original MTD all of this tenor & date have signed in the
                  number indicated below one of which being accomplished the
                  other(s) to be void.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const rptBillOfLadingPrintSBX = () => (
    <div className="pr-2 pl-2">
      <div id="156" className="mx-auto text-black mt-1">
        <div className="flex " style={{ width: "100%" }}>
          <div style={{ width: "90%" }}>
            <p
              className="text-black text-xs font-bold pt-1 ml-10 pb-1"
              style={{ textAlign: "center" }}
            ></p>
          </div>
          <div style={{ width: "10%" }}>
            <p className="text-black text-xs font-bold text-right p-1">
              {/* {bldata?.blType} */}
            </p>
          </div>
        </div>
        <div className="mx-auto" style={{ height: "280mm" }}>
          {/* Header Section - 1 */}
          <div className="flex " style={{ height: "40%", minHeight: "40%" }}>
            <div className="" style={{ height: "100%", width: "50%" }}>
              <div className="" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p className="text-black mt-6" style={{ fontSize: "9px" }}>
                    {bldata?.shipperName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.shipperAddress}
                  </p>
                </div>
              </div>
              <div className="" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p className="text-black mt-6" style={{ fontSize: "9px" }}>
                    {bldata?.consigneeName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.consigneeAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
              <div className="" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p className="text-black mt-6" style={{ fontSize: "9px" }}>
                    {bldata?.notifyPartyName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.notifyPartyAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
            </div>
            <div
              style={{
                height: "100%",
                width: "50%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Top BL No row */}
              <div
                className="p-2"
                style={{ height: "10%", display: "flex", alignItems: "center" }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* left block (20%) */}
                  <div
                    style={{
                      width: "20%",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#000",
                    }}
                  >
                    {/* label if needed */}
                  </div>

                  {/* value block (80%) */}
                  <div
                    style={{
                      width: "80%",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#000",
                      textAlign: "center",
                    }}
                  >
                    {bldata?.blNo}
                  </div>
                </div>
              </div>

              {/* Middle empty/image area */}
              <div style={{ height: "50%" }}>
                {/* keep your commented image block here */}
              </div>

              {/* Agent block */}
              <div style={{ height: "32%", minHeight: "32%", padding: "8px" }}>
                <div
                  style={{
                    fontSize: "8px",
                    fontWeight: 700,
                    color: "#000",
                    lineHeight: "1.2",
                  }}
                >
                  {/* For Delivery of Goods please apply to : */}
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "8px",
                    fontWeight: 700,
                    color: "#000",
                    lineHeight: "1.2",
                  }}
                >
                  {bldata?.fpdAgent}
                  <br />
                  {bldata?.fpdAgentAddressName}
                </div>
              </div>

              {/* Bottom No of BL row */}
              <div
                className="text-center"
                style={{ height: "8%", minHeight: "6%" }}
              >
                <p
                  className="text-black p-1 font-bold"
                  style={{ fontSize: "8px" }}
                >
                  {bldata?.noOfBl}
                </p>
              </div>
            </div>
          </div>
          {/* Header Section - 2 */}
          <div className="flex " style={{ height: "6%", minHeight: "6%" }}>
            <div className=" flex" style={{ width: "50%" }}>
              <div className="" style={{ width: "50%" }}>
                <div className=" pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p className="text-black mt-2" style={{ fontSize: "9px" }}>
                    {bldata?.plr}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p className="text-black mt-4" style={{ fontSize: "9px" }}>
                    {bldata?.polVessel} {bldata?.polVoyage}
                  </p>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <div className=" pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p className="text-black mt-2" style={{ fontSize: "9px" }}>
                    {bldata?.polName}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p className="text-black" style={{ fontSize: "9px" }}></p>
                </div>
              </div>
            </div>
            <div className="flex" style={{ width: "50%" }}>
              <div className="" style={{ width: "50%" }}>
                <div className=" pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    {" "}
                  </p>
                  <p className="text-black mt-2" style={{ fontSize: "9px" }}>
                    {bldata?.pod}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p className="text-black" style={{ fontSize: "9px" }}></p>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <div className=" pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p className="text-black" style={{ fontSize: "9px" }}></p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  ></p>
                  <p
                    className="text-black ml-7 mt-4"
                    style={{ fontSize: "9px" }}
                  >
                    {bldata?.fpd}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Grid 1 */}

          <div style={{ height: "35%", maxHeight: "35%" }}>
            <table
              className="text-left"
              style={{ width: "100%", fontSize: "9px" }}
            >
              <tr className="" style={{ width: "100%" }}>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 "
                  style={{ width: "15.5%" }}
                ></th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 "
                  style={{ width: "17%" }}
                ></th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 "
                  style={{ width: "37.5%" }}
                ></th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 "
                  style={{ width: "20%" }}
                ></th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2"
                  style={{ width: "10%" }}
                ></th>
              </tr>
              <tr>
                <td
                  className="pt-4 pb-1 pl-2 pr-2 align-top text-left whitespace-pre-wrap break-words "
                  style={{ fontSize: "9px", height: "240px" }}
                >
                  <pre className="text-left mt-12">
                    {bldata?.marksAndNosDetails || bldata?.marksNos || ""}
                  </pre>
                  {Array.isArray(bldata?.tblBlContainer) && (
                    <>
                      {bldata.tblBlContainer.length <= 4 ? (
                        // Case: 4 or fewer containers
                        bldata.tblBlContainer.slice(0, 4).map((c, idx) => (
                          <div key={idx} className="leading-tight mt-2">
                            <div>
                              {c?.containerNo ?? ""}
                              <br></br>
                              {c?.sizeType ? ` ${c.sizeType}` : ""}
                              <br></br>
                              {c?.agentSealNo ?? ""} {c?.customSealNo ?? ""}
                            </div>
                            <div>PKG: {c?.package ?? ""}</div>
                            <div>GW: {c?.grossWt ?? ""}</div>
                            <div>NW: {c?.netWt ?? ""}</div>
                            {/* <div>CBM: {c?.tareWt ?? ""}</div> */}
                          </div>
                        ))
                      ) : (
                        // Case: more than 4 containers – show alternative content
                        <div
                          className="text-black font-bold mt-2 "
                          style={{ fontSize: "9px" }}
                        >
                          {/* Replace this line with your custom display as per the attached sheet */}
                        </div>
                      )}
                    </>
                  )}
                </td>

                <td
                  className=" align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <div className="mt-20 text-left">
                    {bldata?.noOfPackages} {bldata?.packagesCode}
                  </div>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 text-left "
                  style={{ fontSize: "9px", height: "385px" }}
                >
                  <div className="flex flex-col justify-evenly h-full ">
                    <div className="" style={{ height: "60%" }}>
                      <p className="text-left align-top mt-12">
                        {bldata?.goodsDescDetails} <br />{" "}
                        {"SHIPPER'S LOAD/STOW AND / COUNT"}
                      </p>
                    </div>
                    <div
                      className="text-left"
                      style={{ maxWidth: "100%", width: "100%" }}
                    >
                      <pre
                        className="text-left whitespace-pre-wrap break-words m-0"
                        style={{
                          fontSize: "9px",
                          maxWidth: "100%",
                          width: "100%",
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        {trimByWordCountBySup(bldata?.blClause, 50)}
                      </pre>
                    </div>
                  </div>
                </td>

                <td
                  className="pt-1 pb-1 pl-2 pr-2  text-left "
                  style={{ fontSize: "8.5px", height: "385px" }}
                >
                  <div className="flex flex-col justify-evenly h-full ml-7">
                    <div>
                      <pre className="text-left">
                        Gross Weight<br></br>
                        {bldata?.grossWt} {bldata?.weightUnit}
                      </pre>
                    </div>
                    <div className="h-2/5">
                      <pre className="text-left">{bldata?.containerStatus}</pre>
                      <pre className="text-left mt-4">
                        FREIGHT: {bldata?.freightPrepaidCollect}
                      </pre>
                    </div>
                  </div>
                </td>
                {/* 
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left border-r border-black "
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.grossWt} {bldata?.weightUnit}

                  </pre>
                  <div className="h-3/5">
                    <pre className="text-left mt=8">
                      {bldata?.containerStatus}
                    </pre>
                  </div>

                </td> */}
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.volumeWt} {bldata?.volumeUnitName}
                  </pre>
                </td>
              </tr>
            </table>
          </div>
          {/* I'M here */}
          <div className="flex" style={{ height: "19%", maxHeight: "19%" }}>
            <div className="" style={{ width: "50%" }}>
              <div className="" style={{ height: "50%" }}>
                <p
                  style={{ fontSize: "9px", fontWeight: "bold" }}
                  className="text-left align-top p-2"
                >
                  {/* Freight Details, Charges etc. */}
                </p>
              </div>
              <div style={{ height: "50%" }}>
                <div>
                  <p
                    style={{ fontSize: "9px", fontWeight: "bold" }}
                    className="text-left align-top p-2"
                  >
                    {/* Shipped on board the Vessel : */}
                  </p>
                </div>
                <div className="flex mt-14">
                  <div>
                    <p
                      style={{ fontSize: "9px", fontWeight: "bold" }}
                      className="text-left align-top pl-2"
                    >
                      {/* Date : */}
                    </p>
                  </div>
                  <div className="border-dashed" style={{ width: "30%" }}></div>
                </div>
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div className="" style={{ height: "50%" }}>
                <div>
                  {/* <p
                    style={{ fontSize: "8px", fontWeight: "bold" }}
                    className="text-left align-top p-2"
                  >
                    In witness of the contract herein the above stated number of
                    originals have been issued on which being accomplished the
                    other(s) to be void.{" "}
                  </p> */}
                </div>
                <div>
                  {/* <p
                    style={{
                      fontSize: "10px",
                      fontWeight: "bold",
                      textAlign: "right",
                    }}
                    className="text-right align-top pr-2"
                  >
                    For {bldata?.company}
                  </p> */}
                </div>
                <div className="flex mt-6">
                  {/* <div>
                    <p
                      style={{ fontSize: "9px", fontWeight: "bold" }}
                      className="text-left align-top pl-2"
                    >
                      Place and Date of issue
                    </p>
                  </div>
                  <div
                    className=" border-dashed"
                    style={{ width: "30%" }}
                  ></div>
                  <div>
                    <p
                      style={{ fontSize: "9px", fontWeight: "bold" }}
                      className="text-left align-top pl-2 ml-2"
                    >
                      (Authorised Signatory)
                    </p>
                  </div> */}
                </div>
              </div>
              {/* <div style={{ height: "50%" }}>
                <p
                  style={{ fontSize: "7px", fontWeight: "bold" }}
                  className="text-left align-top p-2"
                >
                  Taken in charge in apparently good condition herein at the
                  place of receipt for transport & delivery as mentioned above
                  unless otherwise stated . The MTO in accordance with the provision
                  contained in the MTD undertakes to perform or to procure the
                  performance of the
                  multimodal transport from the place at which the goods are
                  taken in charge, to the place designated for delivery & assume
                  responsibility for such transport. <br />
                  <br /> in One of the MTD (S) must be surrendered, duly
                  endorsed in exchange for the goods in witness where of the
                  original MTD all of this tenor & date have signed in the
                  number indicated below one of which being accomplished the
                  other(s) to be void.
                </p>
              </div> */}
              <div>
                {Array.isArray(bldata.tblBlContainer) &&
                bldata.tblBlContainer.length < 4 ? (
                  <p></p>
                ) : (
                  <p>– Continuing on Attach Sheet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const SUPERIORFREIGHTSERVICESBLDRAFT = () => (
    <div className="pr-2 pl-2">
      <div id="156" className="mx-auto text-black mt-1">
        {/* <p className="text-black text-xs font-bold text-right">
          {bldata?.blType}
        </p> */}
        <div
          className="mx-auto mt-1 border border-black"
          style={{ height: "280mm" }}
        >
          {/* Header Section - 1 */}
          <div
            className="flex border-b border-black"
            style={{ height: "46%", minHeight: "45%" }}
          >
            <div
              className="border-r border-black"
              style={{ height: "100%", width: "50%" }}
            >
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Shipper
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.shipperName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.shipperAddress}
                  </p>
                </div>
              </div>
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Consignee
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.consigneeName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.consigneeAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
              <div className="border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Notify Party
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.notifyPartyName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.notifyPartyAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
            </div>
            <div style={{ height: "100%", width: "50%" }}>
              <div className=" flex w-full">
                {/* LEFT labels */}
                <div style={{ width: "55%" }}>
                  <div className="flex items-center" style={{ height: "22px" }}>
                    <p
                      className="text-black font-bold"
                      style={{ fontSize: "10px", margin: 0 }}
                    >
                      MTD Number
                    </p>
                  </div>

                  <div className="flex items-center" style={{ height: "22px" }}>
                    <p
                      className="text-black font-bold"
                      style={{ fontSize: "10px", margin: 0 }}
                    >
                      Shipment Reference No
                    </p>
                  </div>
                </div>

                {/* RIGHT bordered values */}
                <div
                  className="border-l border-b border-black"
                  style={{ width: "45%" }}
                >
                  <div
                    className="flex items-center justify-center border-b border-black"
                    style={{ height: "22px" }}
                  >
                    <p
                      className="text-black"
                      style={{ fontSize: "10px", margin: 0 }}
                    >
                      {bldata?.hblNo}
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-center"
                    style={{ height: "22px" }}
                  >
                    <p
                      className="text-black"
                      style={{ fontSize: "10px", margin: 0 }}
                    >
                      {bldata?.jobNo}
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  height: "40%",
                  minHeight: "40% !important",
                  maxHeight: "40% !important",
                  display: "flex", // ✅ enables flexbox
                  justifyContent: "center", // ✅ centers horizontally
                  alignItems: "center", // ✅ centers vertically
                }}
              >
                <img
                  style={{
                    height: "90%",
                    minHeight: "90% !important",
                    maxHeight: "90% !important",
                    width: "80%",
                  }}
                  src="https://expresswayshipping.com/sql-api/uploads/SUPImg.png"
                  alt="LOGO"
                />
              </div>
              <div style={{ height: "45%", minHeight: "45%" }}>
                <p
                  className="text-black p-2 mt-2 font-bold text-center"
                  style={{ fontSize: "8px" }}
                >
                  GF-7/260, TOMAR COLONY, KAMALPUR, BURARI, NORTH DELHI - 110084
                </p>
                <p
                  className="text-black p-2 mt-2 font-bold items-center justify-center text-center"
                  style={{ fontSize: "8px" }}
                >
                  E-Mail: info@rajlogisticsindia.com Website:
                  www.rajlogisticsindia.com
                </p>
                <p
                  className="text-black p-2 mt-2 font-bold items-center justify-center text-center"
                  style={{ fontSize: "8px" }}
                >
                  MTO Reg. Number. MTO/DGS/3492/APR/2027
                </p>
                <p
                  className="text-black p-2 mt-2 font-bold items-center justify-center text-center"
                  style={{ fontSize: "8px" }}
                >
                  RECEIVED by the Carrier the Goods as specified below in
                  apparent goods Order and condition unless otherwise stated, to
                  be transported to such place as agreed, authorized or
                  permitted herein and subject to all the terms and condition
                  appearing in the front and reverse of this MTD to which the
                  Merchant agrees by accepting this MTD any local privilege and
                  customs notwithstanding. The particulars given below as stated
                  by the shipper and the weight, measures, quality, condition,
                  contents and value of the goods are unknown to the Carrier.
                </p>
              </div>
            </div>
          </div>
          {/* Header Section - 2 */}
          <div
            className="flex border-b border-black"
            style={{ height: "10%", minHeight: "10%" }}
          >
            <div
              className="border-r border-black flex"
              style={{ width: "50%" }}
            >
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Pre- Carriage by{" "}
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.preCarriage}
                  </p>
                </div>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Vessel/Voyage No
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.podVesselText} / {bldata?.podVoyageText}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "33%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Discharge
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.pod}
                  </p>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place of Receipt
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.plr}
                  </p>
                </div>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Lading
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.pol}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "33%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place Of Delivery
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.fpd}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div
                className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                style={{ height: "66%" }}
              >
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Delivery Agent:
                </p>
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {bldata?.fpdAgent}
                </p>
                <p
                  className="text-black"
                  style={{ fontSize: "8px", width: "95%" }}
                >
                  {bldata?.fpdAgentAddressName}
                </p>
              </div>
              <div className="flex" style={{ height: "34%" }}>
                <div
                  className="border-r border-black pt-1 pb-1 pl-2 pr-2 "
                  style={{ width: "50%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Mode / Means of Transport
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.preCarriage}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2 " style={{ width: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Route/Place of Transhipment
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}></p>
                </div>
              </div>
            </div>
          </div>
          {/* Grid 1 */}

          <div style={{ height: "26%", maxHeight: "26%" }}>
            <table
              className="text-left"
              style={{ width: "100%", fontSize: "9px" }}
            >
              <tr className="border-b border-black" style={{ width: "100%" }}>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 border-r border-black"
                  style={{ width: "25%" }}
                >
                  Marks and Numbers/ Container Nos/Seal No.
                </th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 border-r border-black"
                  style={{ width: "15%" }}
                >
                  Number and kind of Packages:
                </th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 border-r border-black"
                  style={{ width: "40%" }}
                >
                  Description of Goods
                </th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 border-r border-black"
                  style={{ width: "10%" }}
                >
                  Gross Weight:
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "10%" }}>
                  Measurement
                </th>
              </tr>
              <tr>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px", height: "263px" }}
                >
                  <p className="text-left">
                    {bldata?.marksAndNosDetails} {bldata?.containerNo}
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.noOfPackages} {bldata?.packagesCode}
                  </pre>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 text-left"
                  style={{ fontSize: "9px", height: "240px" }}
                >
                  <div className="flex flex-col justify-evenly h-full">
                    <div className="h-3.5/5">
                      <p className="text-left align-top">
                        {bldata?.goodsDescDetails}
                      </p>
                    </div>
                    <div className="h-1.5/5">
                      <p
                        style={{ fontSize: "9px", whiteSpace: "pre-line" }}
                        className="text-left align-top"
                      >
                        {trimByWordCountBySup(bldata?.blClause, 50)}
                      </p>
                    </div>
                  </div>
                </td>

                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.grossWt} {bldata?.weightUnit}
                  </pre>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 border-l border-black align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.volume} {bldata?.volumeUnitName}
                  </pre>
                </td>
              </tr>
            </table>
          </div>
          {/* Grid 3 */}
          <div className="mt-6" style={{ height: "4%", minHeight: "4%" }}>
            <table style={{ width: "100%", fontSize: "9px" }}>
              <tr className="border-b border-t border-black">
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight & Charges Amount
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight Payable Location
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    No.of original MTD(s)
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "25%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Place and Date of issue
                  </p>
                </th>
              </tr>
              <tr className="border-b border-black">
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight as Arranged
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.freightpayableAtText}
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.noOfBl}
                  </p>
                </td>
                <td className="pt-1 pb-1 pl-1 pr-1" style={{ width: "25%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.blIssuePlaceText} {formatDate(bldata?.blIssueDate)}
                  </p>
                </td>
              </tr>
            </table>
          </div>
          {/* Footer */}
          <div className="flex" style={{ height: "11.6%", minHeight: "11.6%" }}>
            {/* LEFT 75% */}
            <div
              className="border-r border-black p-1 flex flex-col"
              style={{ width: "50%" }}
            >
              {/* Top line */}
              <p
                className="text-left font-bold"
                style={{ fontSize: "9px", lineHeight: "11px", margin: 0 }}
              >
                Other Particulars (if any)
              </p>

              {/* Remarks (optional, keep if you want) */}
              <div
                style={{
                  fontSize: "9px",
                  lineHeight: "11px",
                  marginTop: "2px",
                  height: "28px",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {trimWordsOnCount(bldata?.remarks, 50)}
              </div>

              {/* Center line */}
              <p
                className="text-center font-bold"
                style={{
                  fontSize: "9px",
                  lineHeight: "11px",
                  margin: "2px 0 0 0",
                }}
              >
                SHIPPED ON BOARD : {bldata?.sobDate}
              </p>
              <br></br>
              {/* Bottom lines */}
              <p
                className="text-left font-bold"
                style={{
                  fontSize: "9px",
                  lineHeight: "11px",
                  margin: "6px 0 0 0",
                }}
              >
                Weight and measurement of container not to be included
              </p>

              <p
                className="text-left font-bold"
                style={{
                  fontSize: "9px",
                  lineHeight: "11px",
                  margin: "4px 0 0 0",
                }}
              >
                (TERMS CONTINUED ON BACK HEREOF)
              </p>
            </div>

            {/* RIGHT 25% */}
            <div className="p-1 flex flex-col" style={{ width: "50%" }}>
              {/* Top-right */}
              <p
                className="text-right font-bold"
                style={{ fontSize: "9px", lineHeight: "11px", margin: 0 }}
              >
                FOR RAJ LOGISTICS
              </p>

              {/* Middle-right */}
              <div className="flex-1 flex items-center justify-end">
                <p
                  className="text-right font-bold"
                  style={{ fontSize: "9px", lineHeight: "11px", margin: 0 }}
                >
                  Authorised Signatory
                </p>
              </div>

              {/* Bottom-right */}
              <p
                className="text-right font-bold"
                style={{ fontSize: "9px", lineHeight: "11px", margin: 0 }}
              >
                AS AGENTS FOR THE CARRIER
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const SUPERIORFREIGHTSERVICESBLPRINT = () => (
    <div className="pr-2 pl-2">
      <div id="156" className="mx-auto text-black mt-1">
        {/* <p className="text-black text-xs font-bold text-right">
          {bldata?.blType}
        </p> */}
        <div
          className="mx-auto mt-1 border border-black"
          style={{ height: "280mm" }}
        >
          {/* Header Section - 1 */}
          <div
            className="flex border-b border-black"
            style={{ height: "46%", minHeight: "45%" }}
          >
            <div
              className="border-r border-black"
              style={{ height: "100%", width: "50%" }}
            >
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Shipper
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.shipperName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.shipperAddress}
                  </p>
                </div>
              </div>
              <div className="border-b border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Consignee
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.consigneeName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.consigneeAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
              <div className="border-black" style={{ height: "33%" }}>
                <div className="p-2">
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Notify Party
                  </p>
                  <p className="text-black mt-1" style={{ fontSize: "9px" }}>
                    {bldata?.notifyPartyName}
                  </p>
                  <p
                    className="text-black word-break"
                    style={{ width: "70%", fontSize: "9px" }}
                  >
                    {bldata?.notifyPartyAddress}
                  </p>
                  {/* <p
                    className="text-black word-break"
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    space for telephone number
                  </p> */}
                </div>
              </div>
            </div>
            <div style={{ height: "100%", width: "50%" }}>
              <div className=" flex w-full">
                {/* LEFT labels */}
                <div style={{ width: "55%" }}>
                  <div className="flex items-center" style={{ height: "22px" }}>
                    <p
                      className="text-black font-bold"
                      style={{ fontSize: "10px", margin: 0 }}
                    >
                      MTD Number
                    </p>
                  </div>

                  <div className="flex items-center" style={{ height: "22px" }}>
                    <p
                      className="text-black font-bold"
                      style={{ fontSize: "10px", margin: 0 }}
                    >
                      Shipment Reference No
                    </p>
                  </div>
                </div>

                {/* RIGHT bordered values */}
                <div
                  className="border-l border-b border-black"
                  style={{ width: "45%" }}
                >
                  <div
                    className="flex items-center justify-center border-b border-black"
                    style={{ height: "22px" }}
                  >
                    <p
                      className="text-black"
                      style={{ fontSize: "10px", margin: 0 }}
                    >
                      {bldata?.hblNo}
                    </p>
                  </div>

                  <div
                    className="flex items-center justify-center"
                    style={{ height: "22px" }}
                  >
                    <p
                      className="text-black"
                      style={{ fontSize: "10px", margin: 0 }}
                    >
                      {bldata?.jobNo}
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  height: "40%",
                  minHeight: "40% !important",
                  maxHeight: "40% !important",
                  display: "flex", // ✅ enables flexbox
                  justifyContent: "center", // ✅ centers horizontally
                  alignItems: "center", // ✅ centers vertically
                }}
              >
                <img
                  style={{
                    height: "90%",
                    minHeight: "90% !important",
                    maxHeight: "90% !important",
                    width: "80%",
                  }}
                  src="https://expresswayshipping.com/sql-api/uploads/SUPImg.png"
                  alt="LOGO"
                />
              </div>
              <div style={{ height: "45%", minHeight: "45%" }}>
                <p
                  className="text-black p-2 mt-2 font-bold text-center"
                  style={{ fontSize: "8px" }}
                >
                  GF-7/260, TOMAR COLONY, KAMALPUR, BURARI, NORTH DELHI - 110084
                </p>
                <p
                  className="text-black p-2 mt-2 font-bold items-center justify-center text-center"
                  style={{ fontSize: "8px" }}
                >
                  E-Mail: info@rajlogisticsindia.com Website:
                  www.rajlogisticsindia.com
                </p>
                <p
                  className="text-black p-2 mt-2 font-bold items-center justify-center text-center"
                  style={{ fontSize: "8px" }}
                >
                  MTO Reg. Number. MTO/DGS/3492/APR/2027
                </p>
                <p
                  className="text-black p-2 mt-2 font-bold items-center justify-center text-center"
                  style={{ fontSize: "8px" }}
                >
                  RECEIVED by the Carrier the Goods as specified below in
                  apparent goods Order and condition unless otherwise stated, to
                  be transported to such place as agreed, authorized or
                  permitted herein and subject to all the terms and condition
                  appearing in the front and reverse of this MTD to which the
                  Merchant agrees by accepting this MTD any local privilege and
                  customs notwithstanding. The particulars given below as stated
                  by the shipper and the weight, measures, quality, condition,
                  contents and value of the goods are unknown to the Carrier.
                </p>
              </div>
            </div>
          </div>
          {/* Header Section - 2 */}
          <div
            className="flex border-b border-black"
            style={{ height: "10%", minHeight: "10%" }}
          >
            <div
              className="border-r border-black flex"
              style={{ width: "50%" }}
            >
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Pre- Carriage by{" "}
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.preCarriage}
                  </p>
                </div>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Vessel/Voyage No
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.podVesselText} / {bldata?.podVoyageText}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "33%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Discharge
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.pod}
                  </p>
                </div>
              </div>
              <div style={{ width: "50%" }}>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place of Receipt
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.plr}
                  </p>
                </div>
                <div
                  className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                  style={{ height: "33%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Port Of Lading
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.pol}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2" style={{ height: "33%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Place Of Delivery
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.fpd}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ width: "50%" }}>
              <div
                className="border-b border-black pt-1 pb-1 pl-2 pr-2"
                style={{ height: "66%" }}
              >
                <p className="text-black font-bold" style={{ fontSize: "9px" }}>
                  Delivery Agent:
                </p>
                <p className="text-black" style={{ fontSize: "9px" }}>
                  {bldata?.fpdAgent}
                </p>
                <p
                  className="text-black"
                  style={{ fontSize: "8px", width: "95%" }}
                >
                  {bldata?.fpdAgentAddressName}
                </p>
              </div>
              <div className="flex" style={{ height: "34%" }}>
                <div
                  className="border-r border-black pt-1 pb-1 pl-2 pr-2 "
                  style={{ width: "50%" }}
                >
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Mode / Means of Transport
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}>
                    {bldata?.preCarriage}
                  </p>
                </div>
                <div className="pt-1 pb-1 pl-2 pr-2 " style={{ width: "50%" }}>
                  <p
                    className="text-black font-bold"
                    style={{ fontSize: "9px" }}
                  >
                    Route/Place of Transhipment
                  </p>
                  <p className="text-black" style={{ fontSize: "9px" }}></p>
                </div>
              </div>
            </div>
          </div>
          {/* Grid 1 */}

          <div style={{ height: "26%", maxHeight: "26%" }}>
            <table
              className="text-left"
              style={{ width: "100%", fontSize: "9px" }}
            >
              <tr className="border-b border-black" style={{ width: "100%" }}>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 border-r border-black"
                  style={{ width: "25%" }}
                >
                  Marks and Numbers/ Container Nos/Seal No.
                </th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 border-r border-black"
                  style={{ width: "15%" }}
                >
                  Number and kind of Packages:
                </th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 border-r border-black"
                  style={{ width: "40%" }}
                >
                  Description of Goods
                </th>
                <th
                  className="pt-1 pb-1 pl-2 pr-2 border-r border-black"
                  style={{ width: "10%" }}
                >
                  Gross Weight:
                </th>
                <th className="pt-1 pb-1 pl-2 pr-2" style={{ width: "10%" }}>
                  Measurement
                </th>
              </tr>
              <tr>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px", height: "263px" }}
                >
                  <p className="text-left">{bldata?.marksAndNosDetails}</p>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.noOfPackages} {bldata?.packagesCode}
                  </pre>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 text-left"
                  style={{ fontSize: "9px", height: "240px" }}
                >
                  <div className="flex flex-col justify-evenly h-full">
                    <div className="h-3.5/5">
                      <p className="text-left align-top">
                        {bldata?.goodsDescDetails}
                      </p>
                    </div>
                    <div className="h-1.5/5">
                      <p
                        style={{ fontSize: "9px", whiteSpace: "pre-line" }}
                        className="text-left align-top"
                      >
                        {trimByWordCountBySup(bldata?.blClause, 50)}
                      </p>
                    </div>
                  </div>
                </td>

                <td
                  className="pt-1 pb-1 pl-2 pr-2 align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.grossWt} {bldata?.weightUnit}
                  </pre>
                </td>
                <td
                  className="pt-1 pb-1 pl-2 pr-2 border-l border-black align-top text-left"
                  style={{ fontSize: "9px" }}
                >
                  <pre className="text-left">
                    {bldata?.volume} {bldata?.volumeUnitName}
                  </pre>
                </td>
              </tr>
            </table>
          </div>
          {/* Grid 3 */}
          <div className="mt-6" style={{ height: "4%", minHeight: "4%" }}>
            <table style={{ width: "100%", fontSize: "9px" }}>
              <tr className="border-b border-t border-black">
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight & Charges Amount
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight Payable Location
                  </p>
                </th>
                <th
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    No.of original MTD(s)
                  </p>
                </th>
                <th className="pt-1 pb-1 pl-1 pr-1" style={{ width: "25%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Place and Date of issue
                  </p>
                </th>
              </tr>
              <tr className="border-b border-black">
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    Freight as Arranged
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.freightpayableAtText}
                  </p>
                </td>
                <td
                  className="pt-1 pb-1 pl-1 pr-1 border-r border-black"
                  style={{ width: "25%" }}
                >
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.noOfBl}
                  </p>
                </td>
                <td className="pt-1 pb-1 pl-1 pr-1" style={{ width: "25%" }}>
                  <p className="text-center" style={{ fontSize: "9px" }}>
                    {bldata?.blIssuePlaceText} {formatDate(bldata?.blIssueDate)}
                  </p>
                </td>
              </tr>
            </table>
          </div>
          {/* Footer */}
          <div className="flex" style={{ height: "11.6%", minHeight: "11.6%" }}>
            {/* LEFT 75% */}
            <div
              className="border-r border-black p-1 flex flex-col"
              style={{ width: "50%" }}
            >
              {/* Top line */}
              <p
                className="text-left font-bold"
                style={{ fontSize: "9px", lineHeight: "11px", margin: 0 }}
              >
                Other Particulars (if any)
              </p>

              {/* Remarks (optional, keep if you want) */}
              <div
                style={{
                  fontSize: "9px",
                  lineHeight: "11px",
                  marginTop: "2px",
                  height: "28px",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {trimWordsOnCount(bldata?.remarks, 50)}
              </div>

              {/* Center line */}
              <p
                className="text-center font-bold"
                style={{
                  fontSize: "9px",
                  lineHeight: "11px",
                  margin: "2px 0 0 0",
                }}
              >
                SHIPPED ON BOARD : 16-JAN-19
              </p>
              <br></br>
              {/* Bottom lines */}
              <p
                className="text-left font-bold"
                style={{
                  fontSize: "9px",
                  lineHeight: "11px",
                  margin: "6px 0 0 0",
                }}
              >
                Weight and measurement of container not to be included
              </p>

              <p
                className="text-left font-bold"
                style={{
                  fontSize: "9px",
                  lineHeight: "11px",
                  margin: "4px 0 0 0",
                }}
              >
                (TERMS CONTINUED ON BACK HEREOF)
              </p>
            </div>

            {/* RIGHT 25% */}
            <div className="p-1 flex flex-col" style={{ width: "50%" }}>
              {/* Top-right */}
              <p
                className="text-right font-bold"
                style={{ fontSize: "9px", lineHeight: "11px", margin: 0 }}
              >
                FOR RAJ LOGISTICS
              </p>

              {/* Middle-right */}
              <div className="flex-1 flex items-center justify-end">
                <p
                  className="text-right font-bold"
                  style={{ fontSize: "9px", lineHeight: "11px", margin: 0 }}
                >
                  Authorised Signatory
                </p>
              </div>

              {/* Bottom-right */}
              <p
                className="text-right font-bold"
                style={{ fontSize: "9px", lineHeight: "11px", margin: 0 }}
              >
                AS AGENTS FOR THE CARRIER
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const VAARIDHILOGISTICSDRAFT = () => (
    <div className="px-2">
      <div id="156" className="mx-auto text-black mt-1">
        <div
          className="mx-auto mt-1 border border-black"
          style={{ height: "280mm" }}
        >
          {/* ===================== TOP HEADER (LIKE 2ND IMAGE) ===================== */}
          <div
            className="flex border-b border-black"
            style={{ height: "32%", minHeight: "32%" }}
          >
            {/* LEFT 50% : Consignor/Shipper, Consignee, Notify */}
            <div className="" style={{ width: "50%", height: "100%" }}>
              {/* Consignor/Shipper */}
              <div
                className="border-b border-black"
                style={{ height: "10%" }}
              ></div>
              <div
                className="border-b border-r border-black"
                style={{ height: "30%" }}
              >
                <div className="p-2">
                  <p
                    className="font-bold"
                    style={{ fontSize: "9px", margin: 0 }}
                  >
                    Consignor (Complete Name and Address)
                  </p>
                  <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
                    {bldata?.shipperName}
                  </p>
                  <p
                    className="word-break"
                    style={{ fontSize: "9px", margin: "2px 0 0 0" }}
                  >
                    {bldata?.shipperAddress}
                  </p>
                </div>
              </div>

              {/* Consignee */}
              <div
                className="border-b  border-r border-black"
                style={{ height: "30%" }}
              >
                <div className="p-2">
                  <p
                    className="font-bold"
                    style={{ fontSize: "9px", margin: 0 }}
                  >
                    Consignee (or Order)
                  </p>
                  <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
                    {bldata?.consigneeName}
                  </p>
                  <p
                    className="word-break"
                    style={{ fontSize: "9px", margin: "2px 0 0 0" }}
                  >
                    {bldata?.consigneeAddress}
                  </p>
                </div>
              </div>

              {/* Notify Party */}
              <div className="border-r border-black" style={{ height: "30%" }}>
                <div className="p-2">
                  <p
                    className="font-bold"
                    style={{ fontSize: "9px", margin: 0 }}
                  >
                    Notify Party
                  </p>
                  <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
                    {bldata?.notifyPartyName}
                  </p>
                  <p
                    className="word-break"
                    style={{ fontSize: "9px", margin: "2px 0 0 0" }}
                  >
                    {bldata?.notifyPartyAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT 50% : Top titles + logo/office block */}
            <div style={{ width: "50%", height: "100%" }}>
              {/* Top strip (3 columns) */}
              <div
                className="flex border-b border-black"
                style={{
                  height: "10%",
                  fontSize: "16px",
                  justifyContent: "flex-end", // right
                  alignItems: "flex-end", // bottom
                  padding: "4px 6px", // small gap from borders
                }}
              >
                <p style={{ margin: 0 }}>{bldata?.blType}</p>
              </div>

              <div className="flex " style={{ height: "12%" }}>
                <div className="flex p-2" style={{ width: "100%" }}>
                  <div
                    className="p-1"
                    style={{ width: "50%", fontSize: "13px" }}
                  >
                    BILL OF LADING
                  </div>

                  <div
                    className=" border border-black "
                    style={{ width: "50%", fontSize: "9px" }}
                  >
                    <span
                      className="mt-2 "
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "flex-start",
                      }}
                    >
                      {" "}
                      HBL No. {bldata?.hblNo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Office / Logo block */}
              <div className="" style={{ height: "78%", position: "relative" }}>
                {/* watermark-ish (optional, very light) */}
                {/* <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    opacity: 0.05,
                    fontSize: "30px",
                    fontWeight: 800,
                    transform: "rotate(-18deg)",
                  }}
                >
                  NEGOTIABLE
                </div> */}
              </div>
            </div>
          </div>

          {/* ===================== MID SMALL GRID (LIKE 2ND IMAGE) ===================== */}
          <div
            className="flex border-b border-black"
            style={{ height: "12%", minHeight: "12%" }}
          >
            {/* LEFT 50% : 2 columns x 3 rows */}
            <div className="border-r border-black" style={{ width: "50%" }}>
              <div
                className="flex border-b border-black"
                style={{ height: "33.33%" }}
              >
                <div
                  className="border-r border-black p-1"
                  style={{ width: "50%" }}
                >
                  <p
                    className="font-bold"
                    style={{ fontSize: "9px", margin: 0 }}
                  >
                    Place of Receipt
                  </p>
                  <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
                    {bldata?.plr}
                  </p>
                </div>
                <div className="p-1" style={{ width: "50%" }}>
                  <p
                    className="font-bold"
                    style={{ fontSize: "9px", margin: 0 }}
                  >
                    Port of Loading
                  </p>
                  <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
                    {bldata?.pol}
                  </p>
                </div>
              </div>
              <div className="flex" style={{ height: "33.34%" }}>
                {/* LEFT 50% */}
                <div
                  className="border-r border-black"
                  style={{ width: "50%", padding: "4px" }}
                >
                  <p style={{ fontSize: "9px", fontWeight: 700, margin: 0 }}>
                    Vessel &amp; voyage
                  </p>
                  <p style={{ fontSize: "9px", marginTop: "2px" }}>
                    {bldata?.podVesselText}
                    {bldata?.podVoyageText ? ` / ${bldata?.podVoyageText}` : ""}
                  </p>
                </div>

                {/* RIGHT 50% */}
                <div style={{ width: "50%", padding: "4px" }}>
                  <p style={{ fontSize: "9px", fontWeight: 700, margin: 0 }}>
                    F. Vessel
                  </p>
                  <p style={{ fontSize: "9px", marginTop: "2px" }}>
                    {bldata?.podVesselText}
                    {bldata?.podVoyageText ? ` / ${bldata?.podVoyageText}` : ""}
                  </p>
                </div>
              </div>

              <div
                className="flex border-t border-black"
                style={{ height: "33.33%" }}
              >
                <div
                  className="border-r border-black p-1"
                  style={{ width: "50%" }}
                >
                  <p
                    className="font-bold"
                    style={{ fontSize: "8px", margin: 0 }}
                  >
                    Port of Discharge
                  </p>
                  <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
                    {bldata?.pod}
                  </p>
                </div>
                <div className="p-1" style={{ width: "50%" }}>
                  <p
                    className="font-bold"
                    style={{ fontSize: "9px", margin: 0 }}
                  >
                    Place of Delivery
                  </p>
                  <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
                    {bldata?.fpd}
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT 50% : Agent to contact at destination */}
            <div style={{ width: "50%" }}>
              <div style={{ height: "80%" }} className="p-2">
                <p className="font-bold" style={{ fontSize: "9px", margin: 0 }}>
                  DELIVERY AGENT
                </p>
                <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
                  {bldata?.fpdAgent}
                </p>
                <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
                  {bldata?.fpdAgentAddressName}
                </p>
              </div>
              <div
                className="flex  border-t border-black"
                style={{ width: "100%", height: "20%", fontSize: "9px" }}
              >
                <div
                  className=" border-r border-black"
                  style={{ width: "50%" }}
                >
                  Terms of Shipment
                  <p>{bldata?.tradeTermsId}</p>
                </div>
                <div style={{ width: "50%" }}>
                  No. of Original MTD (s)
                  <p>{bldata?.fpdAgentAddressName}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===================== GOODS TABLE (BIGGER BLANK AREA) ===================== */}

          <div
            className="flex border-b border-black"
            style={{
              fontSize: "9px",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              PARTICULARS FURNISHED BY SHIPPER
            </div>
          </div>

          <div style={{ height: "30%", position: "relative" }}>
            <table style={{ width: "100%", height: "100%", fontSize: "9px" }}>
              <thead>
                <tr className="border-b border-black text-left">
                  <th className="p-1" style={{ width: "23%" }}>
                    MARKS &amp;NOS / CONTAINER
                  </th>
                  <th className="" style={{ width: "18%" }}>
                    NO. OF PKGS
                  </th>
                  <th className="" style={{ width: "35%" }}>
                    DESCRIPTION OF PACKAGES AND GOODS
                    {/* <div style={{ fontSize: "9px", fontWeight: 400 }}>Said to Contain</div> */}
                  </th>
                  <th className="" style={{ width: "12%" }}>
                    GROSS WEIGHT
                    {/* <div style={{ fontSize: "9px", fontWeight: 400 }}>(kgs.)</div> */}
                  </th>
                  <th className="" style={{ width: "12%" }}>
                    MEASUREMENT
                    {/* <div style={{ fontSize: "9px", fontWeight: 400 }}>(cbm)</div> */}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    className="pt-1 pb-1 pl-2 pr-2 align-top text-left whitespace-pre-wrap break-words"
                    style={{ fontSize: "9px" }}
                  >
                    <pre className="text-left">
                      {bldata?.marksAndNosDetails || bldata?.marksNos || ""}
                    </pre>
                    {Array.isArray(bldata?.tblBlContainer) && (
                      <>
                        {bldata.tblBlContainer.length <= 4 ? (
                          // Case: 4 or fewer containers
                          bldata.tblBlContainer.slice(0, 4).map((c, idx) => (
                            <div key={idx} className="leading-tight mt-2">
                              <div>
                                {c?.containerNo ?? ""}
                                {c?.sizeType ? ` ${c.sizeType}` : ""}
                                {c?.agentSealNo ?? ""} {c?.customSealNo ?? ""}
                              </div>
                              <div>PKG: {c?.package ?? ""}</div>
                              <div>GW: {c?.grossWt ?? ""}</div>
                              <div>NW: {c?.netWt ?? ""}</div>
                              <div>CBM: {c?.tareWt ?? ""}</div>
                            </div>
                          ))
                        ) : (
                          // Case: more than 4 containers – show alternative content
                          <div
                            className="text-black font-bold mt-2"
                            style={{ fontSize: "9px" }}
                          >
                            {/* Replace this line with your custom display as per the attached sheet */}
                            CONTAINER DETAILS ATTACHED AS PER AS PER ANNEXURE .
                          </div>
                        )}
                      </>
                    )}
                  </td>

                  <td className=" align-top p-2">
                    <pre className="whitespace-pre-wrap" style={{ margin: 0 }}>
                      {bldata?.noOfPackages} {bldata?.packagesCode}
                    </pre>
                  </td>

                  <td className="align-top p-2">
                    <div style={{ minHeight: "240px" }}>
                      <div>{bldata?.goodsDescDetails}</div>
                      <div style={{ marginTop: "9px" }}>
                        {trimByWordCount
                          ? trimByWordCount(bldata?.blClause, 60)
                          : ""}
                      </div>
                    </div>
                  </td>

                  <td className=" align-top p-2">
                    <pre className="whitespace-pre-wrap" style={{ margin: 0 }}>
                      {bldata?.grossWt} {bldata?.weightUnit}
                    </pre>
                  </td>

                  <td className="align-top p-2">
                    <pre className="whitespace-pre-wrap" style={{ margin: 0 }}>
                      {bldata?.volume} {bldata?.volumeUnitName}
                    </pre>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Diagonal watermark like 2nd image */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                opacity: 0.07,
                fontSize: "34px",
                fontWeight: 800,
                transform: "rotate(-18deg)",
              }}
            >
              NON-NEGOTIABLE
            </div>
          </div>
          {/* ===================== BOTTOM SECTION ===================== */}
          <div className="flex border-t border-b border-black ">
            <div
              className="border-r border-black p-1"
              style={{ width: "25%", fontSize: "9px" }}
            >
              Freight &amp; Charges <br></br>
              <p className="" style={{ fontSize: "9px" }}>
                {bldata?.freightPrepaidCollectId}
              </p>
            </div>
            <div
              className="border-r border-black p-1"
              style={{ width: "25%", fontSize: "9px" }}
            >
              Freight Payable at
              <br></br>
              <p className="" style={{ fontSize: "9px" }}>
                {bldata?.freightpayableAtText}
              </p>
            </div>
            <div
              className="border-r border-black p-1"
              style={{ width: "25%", fontSize: "9px" }}
            >
              SHIPPED ON BOARD DATE
              <br></br>
              <p className="" style={{ fontSize: "9px" }}>
                {bldata?.sobDate}
              </p>
            </div>
            <div className="p-1" style={{ width: "25%", fontSize: "9px" }}>
              Place and Date of Issue
              <br></br>
              <p className="" style={{ fontSize: "9px" }}>
                {bldata?.blIssuePlaceText} {bldata?.blIssueDate}
              </p>
            </div>
          </div>
          <div
            className="flex border-b border-black"
            style={{ width: "100%", height: "183px" }} // adjust height if needed
          >
            {/* LEFT 65% */}
            <div
              className="border-r border-black p-2"
              style={{ width: "65%", height: "100%" }}
            >
              <div style={{ height: "100%" }}>
                <div style={{ height: "60%" }}>
                  <p style={{ fontSize: "11px" }}>Other Particulars (if any)</p>

                  <p style={{ fontSize: "9px" }}>
                    By accepting this Bill of lading shipper accepts and abide
                    by all terms, conditions clauses printed and stamped on the
                    face or reverse side of this Bill of lading. By accepting
                    this Bill of lading, the shipper accepts his responsibility
                    towards the carrier for payment of freight (in case of
                    freight collect shipments),Accrued Government, reshipment or
                    disposal costs (as the case may be)if the consignee fails to
                    take delivery of the cargo with 90 days from the date the
                    cargo reaches destination. For freight prepaid Bill of
                    Ladings, delivery of Cargo is subject to realisation of
                    freight cheque. Demurrage/Detention charges at port of
                    destination payable by consignee as per lines tariff.
                  </p>
                </div>

                <div style={{ marginTop: "6px", height: "40%" }}>
                  <p style={{ fontSize: "11px" }}>
                    LAW &amp; JURISDICTION CLAUSE:
                  </p>

                  <p style={{ fontSize: "9px" }}>
                    The contract evidenced by or contained in this Bill of
                    Lading shall be Governed by the law of India and any claim
                    or dispute arising hereunder or in connection herewith shall
                    (without prejudice to the carrier's right to commence
                    proceedings in any other jurisdiction) be subject to the
                    jurisdictions of courts of India
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT 35% */}
            <div
              className="p-2"
              style={{
                width: "35%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 0, // important so 50/50 works perfectly
              }}
            >
              {/* 50% - center */}
              <div
                style={{
                  height: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "9px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                FOR {bldata?.company}
              </div>

              {/* 50% - center-end (right) */}
              <div
                style={{
                  height: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                <div>
                  AS CARRIER
                  <br />
                  Varridhi Logistics Private Limited
                </div>
              </div>
            </div>
          </div>

          <div className="text-center" style={{ fontSize: "9px" }}>
            Weight and Measurement of Container Not to be Included.
            <br></br>
            (Terms Continued on Back here of)
          </div>
        </div>
      </div>
    </div>
  );
  // const VAARIDHILOGISTICSPRINT = () => (
  //   <div className="px-2">
  //     <div id="156" className="mx-auto text-black mt-1">
  //       <div
  //         className="mx-auto mt-1 "
  //         style={{ height: "280mm" }}
  //       >
  //         {/* ===================== TOP HEADER (LIKE 2ND IMAGE) ===================== */}
  //         <div
  //           className="flex "
  //           style={{ height: "32%", minHeight: "32%" }}
  //         >
  //           {/* LEFT 50% : Consignor/Shipper, Consignee, Notify */}
  //           <div
  //             className=""
  //             style={{ width: "50%", height: "100%" }}
  //           >
  //             {/* Consignor/Shipper */}
  //             <div className="" style={{ height: "33.33%" }}>
  //               <div className="p-2">
  //                 <p className="font-bold" style={{ fontSize: "9px", margin: 0 }}>
  //                   Consignor/Shipper
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
  //                   {bldata?.shipperName}
  //                 </p>
  //                 <p
  //                   className="word-break"
  //                   style={{ fontSize: "9px", margin: "2px 0 0 0" }}
  //                 >
  //                   {bldata?.shipperAddress}
  //                 </p>
  //               </div>
  //             </div>

  //             {/* Consignee */}
  //             <div className="" style={{ height: "33.33%" }}>
  //               <div className="p-2">
  //                 <p className="font-bold" style={{ fontSize: "9px", margin: 0 }}>
  //                   Consignee{" "}
  //                   <span className="font-normal" style={{ fontSize: "8px" }}>
  //                     ( “To Order” so indicate )
  //                   </span>
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
  //                   {bldata?.consigneeName}
  //                 </p>
  //                 <p
  //                   className="word-break"
  //                   style={{ fontSize: "9px", margin: "2px 0 0 0" }}
  //                 >
  //                   {bldata?.consigneeAddress}
  //                 </p>
  //               </div>
  //             </div>

  //             {/* Notify Party */}
  //             <div style={{ height: "33.34%" }}>
  //               <div className="p-2">
  //                 <p className="font-bold" style={{ fontSize: "9px", margin: 0 }}>
  //                   Notify Party
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
  //                   {bldata?.notifyPartyName}
  //                 </p>
  //                 <p
  //                   className="word-break"
  //                   style={{ fontSize: "9px", margin: "2px 0 0 0" }}
  //                 >
  //                   {bldata?.notifyPartyAddress}
  //                 </p>
  //               </div>
  //             </div>
  //           </div>

  //           {/* RIGHT 50% : Top titles + logo/office block */}
  //           <div style={{ width: "50%", height: "100%" }}>
  //             {/* Top strip (3 columns) */}
  //             <div className="flex " style={{ height: "33.4%" }}>
  //               <div
  //                 className=" flex flex-col"
  //                 style={{ width: "50%" }}
  //               >
  //                 {/* TOP DIV */}
  //                 <div className="flex items-center justify-left" style={{ height: "50%" }}>
  //                   <p className="" style={{ fontSize: "10px", margin: "6px" }}>
  //                     Multimodal Transport Document
  //                   </p>

  //                 </div>

  //                 {/* BOTTOM DIV */}
  //                 <div
  //                   className="text-left "
  //                   style={{ height: "50%" }}
  //                 >
  //                   <p className="" style={{ fontSize: "8px", margin: "6px" }}>
  //                     Registration Number : {bldata?.mtoRegNo || ""}
  //                   </p>
  //                 </div>
  //               </div>

  //               {/* <div
  //                 className="border-r border-black flex flex-col justify-center px-2"
  //                 style={{ width: "25%" }}
  //               >

  //               </div> */}

  //               <div className="text-center" style={{ width: "50%" }}>
  //                 <p className="" style={{ fontSize: "10px", margin: "20px" }}>
  //                   Bill of Lading/MTD No.
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
  //                   {bldata?.hblNo}
  //                 </p>
  //               </div>
  //             </div>

  //             {/* Office / Logo block */}
  //             <div
  //               className=""
  //               style={{ height: "66.6%", position: "relative" }}
  //             >
  //               <div
  //                 className="flex items-center justify-center"
  //                 style={{ height: "100%", padding: "10px" }}
  //               >
  //                 <div className="flex items-center gap-3" style={{ width: "100%" }}>
  //                   {/* small logo (left) */}
  //                   {/* <div style={{ width: "28%", display: "flex", justifyContent: "center" }}>
  //                     <img
  //                       src="https://expresswayshipping.com/sql-api/uploads/SUPImg.png"
  //                       alt="LOGO"
  //                       style={{ width: "70px", height: "70px", objectFit: "contain" }}
  //                     />
  //                   </div> */}

  //                   {/* office details (right) */}
  //                   {/* <div style={{ width: "72%" }}>
  //                     <p className="font-bold" style={{ fontSize: "9px", margin: 0 }}>
  //                       Regd. Office :
  //                     </p>
  //                     <p className="font-bold" style={{ fontSize: "10px", margin: "2px 0 0 0" }}>
  //                       {bldata?.companyName || "Vaaridhi Logistics Private Limited"}
  //                     </p>

  //                     <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
  //                       {bldata?.companyAddress ||
  //                         "B-38, First Floor,Anand Vihar Delhi-110092"}
  //                     </p>

  //                     <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
  //                       Tel. : {bldata?.companyPhone || "011-40630429"}
  //                     </p>

  //                     <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
  //                       E-mail : {bldata?.companyEmail || "cs@vaaridhilogistics.com"}{" "}
  //                       {bldata?.companyWebsite ? `Website: ${bldata?.companyWebsite}` : ""}
  //                     </p>
  //                   </div> */}
  //                 </div>
  //               </div>

  //               {/* watermark-ish (optional, very light) */}
  //               {/* <div
  //                 style={{
  //                   position: "absolute",
  //                   inset: 0,
  //                   display: "flex",
  //                   alignItems: "center",
  //                   justifyContent: "center",
  //                   pointerEvents: "none",
  //                   opacity: 0.05,
  //                   fontSize: "30px",
  //                   fontWeight: 800,
  //                   transform: "rotate(-18deg)",
  //                 }}
  //               >
  //                 NEGOTIABLE
  //               </div> */}
  //             </div>
  //           </div>
  //         </div>

  //         {/* ===================== MID SMALL GRID (LIKE 2ND IMAGE) ===================== */}
  //         <div
  //           className="flex "
  //           style={{ height: "12%", minHeight: "12%" }}
  //         >
  //           {/* LEFT 50% : 2 columns x 3 rows */}
  //           <div className="" style={{ width: "50%" }}>
  //             <div className="flex " style={{ height: "33.33%" }}>
  //               <div className=" p-1" style={{ width: "50%" }}>
  //                 <p className="font-bold" style={{ fontSize: "8px", margin: 0 }}>
  //                   Place of Receipt
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>{bldata?.plr}</p>
  //               </div>
  //               <div className="p-1" style={{ width: "50%" }}>
  //                 <p className="font-bold" style={{ fontSize: "8px", margin: 0 }}>
  //                   Port of Loading
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>{bldata?.pol}</p>
  //               </div>
  //             </div>

  //             <div className="flex " style={{ height: "33.33%" }}>
  //               <div className=" p-1" style={{ width: "50%" }}>
  //                 <p className="font-bold" style={{ fontSize: "8px", margin: 0 }}>
  //                   Port of Discharge
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>{bldata?.pod}</p>
  //               </div>
  //               <div className="p-1" style={{ width: "50%" }}>
  //                 <p className="font-bold" style={{ fontSize: "8px", margin: 0 }}>
  //                   Place of Delivery
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>{bldata?.fpd}</p>
  //               </div>
  //             </div>

  //             <div className="flex p-1" style={{ height: "33.34%" }}>
  //               <div className="" style={{ width: "100%" }}>
  //                 <p className="font-bold" style={{ fontSize: "8px", margin: 0 }}>
  //                   Vessel &amp; voyage
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>
  //                   {bldata?.polVessel} {bldata?.polVoyage ? `/ ${bldata?.polVoyage}` : ""}
  //                 </p>
  //               </div>
  //               {/* <div className="p-1" style={{ width: "50%" }}>
  //                 <p className="font-bold" style={{ fontSize: "8px", margin: 0 }}>
  //                   Shipment Reference No.
  //                 </p>
  //                 <p style={{ fontSize: "9px", margin: "2px 0 0 0" }}>{bldata?.jobNo}</p>
  //               </div> */}
  //             </div>
  //           </div>

  //           {/* RIGHT 50% : Agent to contact at destination */}
  //           <div style={{ width: "50%" }}>
  //             <div style={{ height: "100%" }} className="p-2">
  //               <p className="font-bold" style={{ fontSize: "8px", margin: 0 }}>
  //                 Agent to contact at destination
  //               </p>
  //               <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
  //                 {bldata?.fpdAgentName}
  //               </p>
  //               <p style={{ fontSize: "8px", margin: "2px 0 0 0" }}>
  //                 {bldata?.fpdAgentAddressName}
  //               </p>
  //             </div>
  //           </div>
  //         </div>

  //         {/* ===================== GOODS TABLE (BIGGER BLANK AREA) ===================== */}
  //         <div style={{ height: "32%", position: "relative" }}>
  //           <table style={{ width: "100%", height: "100%", fontSize: "9px" }}>
  //             <thead>
  //               <tr className="">
  //                 <th className="" style={{ width: "25%" }}>
  //                   Marks &amp; nos / Container Nos
  //                 </th>
  //                 <th className="" style={{ width: "18%" }}>
  //                   Number &amp; kind of pkgs
  //                 </th>
  //                 <th className="" style={{ width: "37%" }}>
  //                   Description of Goods
  //                   <div style={{ fontSize: "8px", fontWeight: 400 }}>Said to Contain</div>
  //                 </th>
  //                 <th className="" style={{ width: "10%" }}>
  //                   Gross weight
  //                   <div style={{ fontSize: "8px", fontWeight: 400 }}>(kgs.)</div>
  //                 </th>
  //                 <th className="p-1" style={{ width: "10%" }}>
  //                   Measurement
  //                   <div style={{ fontSize: "8px", fontWeight: 400 }}>(cbm)</div>
  //                 </th>
  //               </tr>
  //             </thead>

  //             <tbody>
  //               <tr>
  //                 <td className="align-top p-2" style={{ height: "100%" }}>
  //                   <div style={{ minHeight: "240px" }}>{bldata?.marksAndNosDetails}</div>
  //                 </td>

  //                 <td className=" align-top p-2">
  //                   <pre className="whitespace-pre-wrap" style={{ margin: 0 }}>
  //                     {bldata?.noOfPackages} {bldata?.packagesCode}
  //                   </pre>
  //                 </td>

  //                 <td className="align-top p-2">
  //                   <div style={{ minHeight: "240px" }}>
  //                     <div>{bldata?.goodsDescDetails}</div>
  //                     <div style={{ marginTop: "8px" }}>
  //                       {trimByWordCount ? trimByWordCount(bldata?.blClause, 60) : ""}
  //                     </div>
  //                   </div>
  //                 </td>

  //                 <td className=" align-top p-2">
  //                   <pre className="whitespace-pre-wrap" style={{ margin: 0 }}>
  //                     {bldata?.grossWt} {bldata?.weightUnit}
  //                   </pre>
  //                 </td>

  //                 <td className="align-top p-2">
  //                   <pre className="whitespace-pre-wrap" style={{ margin: 0 }}>
  //                     {bldata?.volume} {bldata?.volumeUnitName}
  //                   </pre>
  //                 </td>
  //               </tr>
  //             </tbody>
  //           </table>

  //           {/* Diagonal watermark like 2nd image */}
  //           <div
  //             style={{
  //               position: "absolute",
  //               inset: 0,
  //               display: "flex",
  //               alignItems: "center",
  //               justifyContent: "center",
  //               pointerEvents: "none",
  //               opacity: 0.07,
  //               fontSize: "34px",
  //               fontWeight: 800,
  //               transform: "rotate(-18deg)",
  //             }}
  //           >
  //             NEGOTIABLE
  //           </div>
  //         </div>
  //         {/* ===================== BOTTOM SECTION ===================== */}
  //         <div className="flex justify-between items-center " style={{ fontSize: "13px", display: "flex", alignItems: "flex-end" }}>
  //           <div
  //             className=""

  //           >
  //             PARTICULARS ABOVE FURNISHED BY CONSIGNOR/CONSIGNEE
  //           </div>

  //           <div className="font-bold " style={{ fontSize: "21px" }}>
  //             ORIGINAL
  //           </div>
  //         </div>
  //         <div className="flex items-start  ">
  //           {/* LEFT 50% */}
  //           <div
  //             className=""
  //             style={{ width: "50%", fontSize: "11px", height: "183px" }}
  //           >
  //             <div style={{ minHeight: "83.5%" }}>
  //               Other Particulars (if any)
  //             </div>

  //             <div className="" style={{ minheight: "16.5%" }}>
  //               All disputes subject to jurisdiction of Delhi Courts Only.
  //             </div>
  //           </div>

  //           {/* RIGHT 50% */}
  //           <div style={{ width: "50%", fontSize: "8px", lineHeight: "9px" }}>
  //             <div className=" ">
  //               Taken in charge in apparently good condition herein at the place of receipt
  //               for transport and delivery as mentioned above, unless otherwise stated. The
  //               MTO in accordance with the provisions contained in the MTD undertakes to
  //               perform or to procure the performance of the multimodal transport from the
  //               place at which the goods are taken in charge, to the place designated for
  //               delivery and assumes responsibility for such transport.

  //               One of the MTD's must be surrendered, duly endorsed in exchange for the goods
  //               in witness where of the original MTD all of this tenor and date have been
  //               signed in the number indicated below one of which being accomplished the
  //               other(s) to be void.

  //               Terms and conditions overleaf.
  //             </div>
  //             <div className="flex items-start  ">
  //               {/* LEFT 50% */}
  //               <div style={{ width: "40%" }} className="">
  //                 <div className="p-1" style={{ height: "30px" }}>
  //                   Number Of Original B/L
  //                 </div>
  //                 <div className=" p-1" style={{ height: "30px" }}>
  //                   Transhipment (if any)
  //                 </div>
  //                 <div className="p-1" style={{ height: "30px" }}>
  //                   {bldata?.preCarriage}
  //                 </div>
  //                 <div className="p-1" style={{ height: "30px" }}>
  //                   {bldata?.freightpayableAtText}
  //                 </div>
  //               </div>

  //               {/* RIGHT 50% */}
  //               <div style={{ width: "60%" }}>
  //                 <div className=" p-1 text-left" style={{ height: "40px" }}>
  //                   Place &amp; Date of Issue
  //                 </div>
  //                 <div className=" p-1 text-center" style={{ height: "40px" }}>

  //                   <p className="font-bold">
  //                     FOR {bldata?.company}
  //                   </p>
  //                 </div>
  //                 <div className=" p-1 text-right" style={{ height: "40px" }}>
  //                   AUTHORISED SIGNATORY
  //                 </div>
  //               </div>
  //             </div>

  //           </div>

  //         </div>
  //         <div className="text-center" style={{ fontSize: "10px" }}>
  //           Weight and Measurement of Container Not to be Included.
  //           <br></br>
  //           (Terms Continued on Back here of)
  //         </div>
  //       </div>
  //     </div >
  //   </div >
  // );

  const YMSBL = () => {
    return (
      <div
        className="text-black"
        style={{
          height: "280mm",
          margin: "0 auto",
          backgroundColor: "white",
        }}
      >
        <div
          className=" text-center font-bold"
          style={{ height: "3%", fontSize: "13px" }}
        >
          NON-NEGOTIABLE SEA WAYBILL
        </div>
        <div
          className=" border border-black"
          style={{ height: "77%", fontSize: "9px" }}
        >
          <div className=" flex" style={{ height: "30% ", width: "100%" }}>
            <div className="" style={{ height: "100% ", width: "50%" }}>
              <div
                className="border-r  border-b border-black px-1 font-bold"
                style={{ height: "33% ", width: "100%" }}
              >
                SHIPPER:
                <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
                  {bldata?.shipperName}
                </p>
                <p
                  className="word-break"
                  style={{ fontSize: "9px", margin: "2px 0 0 0" }}
                >
                  {bldata?.shipperAddress}
                </p>
              </div>
              <div
                className=" border-r  border-b border-black px-1 font-bold"
                style={{ height: "34% ", width: "100%" }}
              >
                CONSIGNEE:
                <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
                  {bldata?.consigneeName}
                </p>
                <p
                  className="word-break"
                  style={{ fontSize: "9px", margin: "2px 0 0 0" }}
                >
                  {bldata?.consigneeAddress}
                </p>
              </div>
              <div
                className="border-r  border-b border-black px-1 font-bold"
                style={{ height: "33% ", width: "100%" }}
              >
                NOTIFY PARTY: (NO CLAIM SHALL ATTACH OF FAILURE TO NOTIFY)
                <p style={{ fontSize: "9px", margin: "4px 0 0 0" }}>
                  {bldata?.notifyPartyName}
                </p>
                <p
                  className="word-break"
                  style={{ fontSize: "9px", margin: "2px 0 0 0" }}
                >
                  {bldata?.notifyPartyAddress}
                </p>
              </div>
            </div>
            <div className="" style={{ width: "50%" }}>
              <div
                className="font-bold px-4"
                style={{ height: "8% ", width: "100%", fontSize: "14px" }}
              >
                B/L No.{bldata?.blNo}
              </div>
              <div
                className=" px-1 flex items-center justify-right"
                style={{ height: "57%", width: "100%" }}
              >
                <img
                  src="https://api.artinshipping.com/sql-api/uploads/ymsimg.png" // put image in public/logo.png
                  alt="Company Logo"
                  width={220}
                  height={80}
                  style={{ objectFit: "contain" }}
                />
              </div>

              <div
                className=" border-b border-black px-1"
                style={{ height: "35% ", width: "100%", fontSize: "7.5px" }}
              >
                Received in apparent good condition except as otherwise noted
                the total number of containers or other packages or units
                enumerated below for transportation from the place of receipt to
                the place of delivery subject to the terms hereof. One of signed
                Bills of Lading must be surrendered duly endorsed in exchange
                for the goods or delivery order. On presentation of this docs
                (duly endorsed) to the Carrier by or on behalf of the Holder,
                the rights liabilities arising in accordance with the term’s
                respects between the Carrier and the Holder as though the
                contract evidence hereby had been made between them. In writing
                whereof Bills of Lading of the tenor and date having been signed
                one of which being accomplished to the others to stand void.
              </div>
            </div>
          </div>
          <div className="flex" style={{ height: "20%", width: "100%" }}>
            <div className="" style={{ width: "50%" }}>
              <div className="" style={{ height: "100% ", width: "100%" }}>
                <div
                  className="flex "
                  style={{ height: "33% ", width: "100%" }}
                >
                  <div
                    className="border-r  border-b border-black font-bold"
                    style={{ width: "50%" }}
                  >
                    Place of Receipt:
                    <p className="text-black px-1" style={{ fontSize: "9px" }}>
                      {bldata?.plr}
                    </p>
                  </div>
                  <div
                    className="border-r  border-b border-black px-1 font-bold"
                    style={{ width: "50%" }}
                  >
                    Port of Loading:
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {bldata?.polName}
                    </p>
                  </div>
                </div>
                <div
                  className=" flex"
                  style={{ height: "34% ", width: "100%" }}
                >
                  <div
                    className=" border-r  border-b border-black px-1 font-bold"
                    style={{ width: "50%" }}
                  >
                    Port of Discharge:
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {bldata?.pod}
                    </p>
                  </div>
                  <div
                    className=" border-r  border-b border-black px-1 font-bold"
                    style={{ width: "50%" }}
                  >
                    Place of Delivery:
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {bldata?.fpd}
                    </p>
                  </div>
                </div>
                <div
                  className="flex "
                  style={{ height: "33% ", width: "100%" }}
                >
                  <div
                    className=" border-r  border-b border-black px-1 font-bold "
                    style={{ width: "50%" }}
                  >
                    Vessel:
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {bldata?.polVessel}
                    </p>
                  </div>
                  <div
                    className=" border-r  border-b border-black px-1 font-bold"
                    style={{ width: "50%" }}
                  >
                    Voyage:
                    <p className="text-black" style={{ fontSize: "9px" }}>
                      {bldata?.polVoyage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="" style={{ width: "50%" }}>
              <div className="" style={{ height: "100%" }}>
                <div
                  className=" px-1"
                  style={{
                    height: "67%",
                    borderBottomWidth: "2px",
                    paddingTop: "6px",
                    paddingLeft: "6px",
                    paddingRight: "6px",
                  }}
                >
                  {/* label (top-left) */}
                  <div
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      lineHeight: "12px",
                    }}
                  >
                    Place and Date of Issue:
                  </div>

                  {/* value (a little gap, left aligned like image) */}
                  <div
                    style={{
                      marginTop: "12px", // ✅ pushes value down like screenshot
                      fontSize: "10px",
                      fontWeight: 700,
                      lineHeight: "12px",
                    }}
                  >
                    {bldata?.fpdAgent}
                  </div>

                  {/* keep this but small (or blank if you want later) */}
                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "9px",
                      lineHeight: "12px",
                    }}
                  >
                    {bldata?.fpdAgentAddressName}
                  </div>
                </div>

                <div
                  className=" border-b border-t border-black px-1 font-bold text-center"
                  style={{ height: "33%" }}
                >
                  Number of Non-Negotiable B’L (s)
                  <p style={{ margin: 0 }}>{bldata?.tradeTermsId} </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex " style={{ height: "38%", width: "100%" }}>
            <table style={{ width: "100%", height: "100%", fontSize: "9px" }}>
              <thead>
                <tr className="">
                  <th
                    className=" border-r  border-black"
                    style={{ width: "18%" }}
                  >
                    Container Serial No. <br></br>
                    (and Serial No.){" "}
                  </th>
                  <th
                    className=" border-r  border-black"
                    style={{ width: "10%" }}
                  >
                    No of Package <br></br>
                    or<br></br>
                    Shipping Units{" "}
                  </th>
                  <th
                    className="border-b border-r border-black"
                    style={{ width: "38%" }}
                  >
                    PARTICULARS OF CARGO AS DECLARED BY SHIPPER
                    <br></br>
                    DESCRIPTION OF GOODS – SAID TO CONTAIN{" "}
                    {/* <div style={{ fontSize: "8px", fontWeight: 400 }}>
                    Said to Contain
                  </div> */}
                  </th>
                  <th
                    className="border-b border-r border-black"
                    style={{ width: "17%" }}
                  >
                    NET WEIGHT<br></br>
                    (KGS){" "}
                    {/* <div style={{ fontSize: "8px", fontWeight: 400 }}>(kgs.)</div> */}
                  </th>
                  <th
                    className=" border-b  border-black p-1"
                    style={{ width: "17%" }}
                  >
                    GROSS WEIGHT<br></br>
                    (KGS)
                    {/* <div style={{ fontSize: "8px", fontWeight: 400 }}>(cbm)</div> */}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td
                    className="align-top p-2 border-r  border-black"
                    style={{ height: "100%" }}
                  >
                    <div style={{ minHeight: "240px" }}>
                      {bldata?.marksAndNosDetails}
                    </div>
                  </td>

                  <td className=" align-top p-2 border-r  border-black">
                    <pre className="whitespace-pre-wrap" style={{ margin: 0 }}>
                      {bldata?.noOfPackages} {bldata?.packagesCode}
                    </pre>
                  </td>

                  <td className="align-top p-2 border-r  border-black">
                    <div style={{ minHeight: "240px" }}>
                      <div>{bldata?.goodsDescDetails}</div>
                      <div style={{ marginTop: "8px" }}>
                        {trimByWordCount
                          ? trimByWordCount(bldata?.blClause, 60)
                          : ""}
                      </div>
                    </div>
                  </td>

                  <td className=" align-top p-2 border-r  border-black">
                    <pre className="whitespace-pre-wrap" style={{ margin: 0 }}>
                      {bldata?.grossWt} {bldata?.weightUnit}
                    </pre>
                  </td>

                  <td className="align-top p-2 ">
                    <pre className="whitespace-pre-wrap" style={{ margin: 0 }}>
                      {bldata?.volume} {bldata?.volumeUnitName}
                    </pre>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
            className=" border-b  border-t border-black  "
            style={{ height: "5%" }}
          >
            <div
              className="text-center border-r  border-black "
              style={{ width: "18%" }}
            >
              TOTAL NUMBER OF <br></br>
              PACKAGE’S OR UNITS <br></br>
              (INWORDS)
            </div>
            <div style={{ width: "82%" }}></div>
          </div>
          <div className="text-center" style={{ height: "7%", width: "100%" }}>
            <div className="flex " style={{ height: "30%", width: "100%" }}>
              <div
                className="border-r  border-b border-black "
                style={{ width: "20%" }}
              >
                FREIGHT & CHARGES{" "}
              </div>
              <div
                className="border-r  border-b border-black"
                style={{ width: "20%" }}
              >
                CHARGEABLE UNITS
              </div>
              <div
                className="border-r  border-b border-black"
                style={{ width: "17%" }}
              >
                RATE
              </div>
              <div
                className="border-r border-b border-black"
                style={{ width: "13%" }}
              >
                PREPAID
              </div>
              <div className="border-b border-black" style={{ width: "30%" }}>
                COLLECT
              </div>
            </div>
            <div className="flex" style={{ height: "70%", width: "100%" }}>
              <div className="border-r border-black" style={{ width: "20%" }}>
                <p className="p-1">{bldata?.freightpayableAtText} </p>
              </div>
              <div className="border-r border-black" style={{ width: "20%" }}>
                <p className="p-1" style={{ fontSize: "9px", margin: 0 }}>
                  {bldata?.freightPrepaidCollectId}
                </p>
              </div>
              <div className="border-r border-black" style={{ width: "17%" }}>
                <p className="p-1" style={{ fontSize: "9px", margin: 0 }}>
                  {bldata?.freightPrepaidCollectId}
                </p>
              </div>
              <div className=" border-r  border-black" style={{ width: "13%" }}>
                <p className="text-center  p-1" style={{ fontSize: "9px" }}>
                  {bldata?.freightPrepaidCollectId}
                </p>
              </div>
              <div className="" style={{ width: "30%" }}>
                <p className="text-center  p-1" style={{ fontSize: "9px" }}>
                  {bldata?.freightPrepaidCollect}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="" style={{ height: "20%", fontSize: "9px" }}>
          <div className="" style={{ height: "40%" }}></div>
          <div
            className="border border-black flex"
            style={{ height: "60%", width: "100%" }}
          >
            <div
              className="border-r border-black px-1"
              style={{ width: "60%", height: "100%" }}
            >
              FOR DELIVERY OF GOODS, PLEASE APPLY TO:
            </div>
            <div
              className="justify-center items-end flex text-center"
              style={{ width: "40%", height: "100%" }}
            >
              __________________________________________<br></br>
              YMS International Logistics <br></br>
              ACTING AS A CARRIER
            </div>
          </div>
        </div>
      </div>
    );
  };
  // ✅ attachment component (uses requested fields)
  const YMSBLAttachMent = ({
    tblBlContainer = [],
    pageNo = 1,
    totalPages = 1,
  }) => {
    // ✅ helpers
    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return 0;
      const n = Number(String(v).replace(/,/g, "").trim());
      return Number.isFinite(n) ? n : 0;
    };

    // ✅ totals (based on your fields)
    const totalNetWt = tblBlContainer.reduce(
      (sum, r) => sum + toNum(r?.netWt),
      0
    );

    // grossWtAndUnit may be "123.45 KGS" -> take numeric part
    const totalGrossWt = tblBlContainer.reduce((sum, r) => {
      const raw = r?.grossWtAndUnit ?? r?.grossWt ?? "";
      const num = String(raw).match(/-?\d+(\.\d+)?/);
      return sum + toNum(num?.[0]);
    }, 0);

    // ✅ unit (prefer first available)
    const unit =
      tblBlContainer.find((x) => x?.weightUnit)?.weightUnitCode ||
      (tblBlContainer.find((x) =>
        (x?.grossWtAndUnit ?? "").toString().match(/[a-zA-Z]+/)
      ) &&
        tblBlContainer
          .find((x) => (x?.grossWtAndUnit ?? "").toString().match(/[a-zA-Z]+/))
          ?.grossWtAndUnit?.toString()
          .match(/[a-zA-Z]+/)?.[0]) ||
      "";

    return (
      <>
        <div className="border border-black">
          <div
            className="text-center border-b border-black font-bold"
            style={{ fontSize: "10px" }}
          >
            NON-NEGOTIABLE SEA WAYBILL
          </div>

          <div
            className="flex text-center border-b border-black bg-gray-300 font-bold"
            style={{ fontSize: "10px" }}
          >
            <div style={{ width: "80%" }}>ATTACHED SHEET</div>
            <div style={{ width: "20%" }}>
              {totalPages > 1 ? `Page ${pageNo} / ${totalPages}` : ""}
            </div>
          </div>

          <div className="flex border-black border-b"></div>

          <div
            className="flex text-center border-black border-b font-bold "
            style={{ width: "100%", fontSize: "10px" }}
          >
            <div
              className="border-black border-r bg-gray-300 "
              style={{ width: "20%" }}
            >
              TANK NUMBER
            </div>
            <div
              className="border-black border-r bg-gray-300 "
              style={{ width: "40%" }}
            >
              SEAL No.
            </div>
            <div
              className="border-black border-r bg-gray-300 "
              style={{ width: "20%" }}
            >
              NET WEIGHT
            </div>
            <div className=" bg-gray-300 " style={{ width: "20%" }}>
              GROSS WEIGHT
            </div>
          </div>

          {/* ✅ rows */}
          {tblBlContainer.map((r, idx) => {
            const sealNo = [r?.agentSealNo, r?.customSealNo]
              .filter(Boolean)
              .join(" / ");
            const netWeight = [r?.netWt, r?.weightUnitCode]
              .filter(Boolean)
              .join(" ");
            const grossWeight = r?.grossWtAndUnit ?? ""; // as per your field

            return (
              <div
                key={idx}
                className="flex text-center border-black border-b"
                style={{ width: "100%", fontSize: "10px" }}
              >
                <div className="border-black border-r" style={{ width: "20%" }}>
                  {r?.containerNo ?? ""}
                </div>

                <div className="border-black border-r" style={{ width: "40%" }}>
                  {sealNo}
                </div>

                <div className="border-black border-r" style={{ width: "20%" }}>
                  {netWeight}
                </div>

                <div style={{ width: "20%" }}>{grossWeight}</div>
              </div>
            );
          })}

          {/* ✅ TOTALS ROW (now filled) */}
          <div
            className="flex text-center bg-gray-300 font-bold"
            style={{ fontSize: "10px" }}
          >
            <div className="border-black border-r" style={{ width: "60%" }}>
              Total net weight
              <br />
              Total gross weight
            </div>

            <div className="border-black border-r" style={{ width: "20%" }}>
              {totalNetWt ? `${totalNetWt.toFixed(3)} ${unit}` : ""}
            </div>

            <div className="" style={{ width: "20%" }}>
              {" "}
              {totalGrossWt ? `${totalGrossWt.toFixed(3)} ${unit}` : ""}
            </div>
          </div>

          <div
            className="flex text-center  bg-gray-300 border-t border-black font-bold"
            style={{ fontSize: "10px" }}
          >
            <div className="border-black border-r" style={{ width: "20%" }}>
              Total no <br />
              of packages
            </div>
            <div className="border-black border-r" style={{ width: "40%" }}>
              {" "}
              {bldata?.noOfPackages} {bldata?.packagesCode}
            </div>
            <div className="border-black border-r" style={{ width: "20%" }}>
              Freight:prepaid
            </div>
            <div style={{ width: "20%" }}>
              {reportData?.freightPrepaidCollect}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <main>
      <div className="mt-5">
        <Print
          //key={reportId}
          enquiryModuleRefs={enquiryModuleRefs}
          reportIds={reportIds}
          printOrientation="portrait"
        />
        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Airway Bill Charge":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={
                      index < reportIds.length - 1
                        ? "report-spacing bg-white"
                        : "bg-white"
                    }
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      padding: "5mm", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "22px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial sans-serif !important",
                      }}
                    >
                      {rptAirwayBillPrintCharge()}
                    </div>
                  </div>
                </>
              );
            case "Airway Bill Charge Copies":
              return (
                <>
                  {Array.from({ length: blIterationLength }).map((_, index) => (
                    <div
                      key={index}
                      ref={(el) => (enquiryModuleRefs.current[index] = el)}
                      className={
                        index < reportIds.length - 1
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
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          width: "100%",
                          boxSizing: "border-box",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        {rptAirwayBillPrintChargeCopies(index)}
                      </div>
                    </div>
                  ))}
                </>
              );
            case "Airway Bill As-Agreed":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={
                      index < reportIds.length - 1
                        ? "report-spacing bg-white"
                        : "bg-white"
                    }
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      padding: "5mm", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "22px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial sans-serif !important",
                      }}
                    >
                      {rptAirwayBillPrintAsAgreed()}
                    </div>
                  </div>
                </>
              );
            case "Airway Bill As-Agreed Copies":
              return (
                <>
                  {Array.from({ length: blIterationLength }).map((_, index) => (
                    <div
                      key={index}
                      ref={(el) => (enquiryModuleRefs.current[index] = el)}
                      className={
                        index < reportIds.length - 1
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
                      }}
                    >
                      <div
                        style={{
                          flex: 1,
                          width: "100%",
                          boxSizing: "border-box",
                          fontFamily: "Arial, sans-serif",
                        }}
                      >
                        {rptAirwayBillPrintASAgreedCopies(index)}
                      </div>
                    </div>
                  ))}
                </>
              );
            case "Airway Bill Shipper Copy":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={
                      index < reportIds.length - 1
                        ? "report-spacing bg-white"
                        : "bg-white"
                    }
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      padding: "5mm", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "22px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial sans-serif !important",
                      }}
                    >
                      {rptAirwayBillPrintShipperCopy()}
                    </div>
                  </div>
                </>
              );
            case "Air Cargo Manifest":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={`bg-white ${
                      index < reportIds.length - 1 ? "report-spacing" : ""
                    }`}
                    style={{
                      width: "297mm", // A4 landscape width
                      height: "210mm", // A4 landscape height
                      margin: "auto",
                      boxSizing: "border-box",
                      padding: "5mm",
                      display: "flex",
                      flexDirection: "column",
                      marginBottom: "0", // Let page-break handle spacing
                      pageBreakAfter:
                        index < reportIds.length - 1 ? "always" : "auto",
                      breakAfter:
                        index < reportIds.length - 1 ? "page" : "auto", // modern fallback
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {rptAirCargoMainfest()}
                    </div>
                  </div>
                </>
              );
            case "SEAWAY BILL OF LADING": {
              // --- utilities (inline) ---
              const splitLines = (txt) =>
                txt ? String(txt).split(/\r?\n/) : [];
              const chunkArray = (arr, size) => {
                if (!Array.isArray(arr) || size <= 0) return [];
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                  chunks.push(arr.slice(i, i + size)); // correct slice
                }
                return chunks;
              };
              const nonEmpty = (arr) =>
                (arr || []).filter((s) => String(s).trim().length > 0);

              // --- paging plan (same behavior as BL Draft) ---
              const LINES_PER_PAGE = 70;

              const jd = bldata || {};

              // Clean empty lines so blank strings don't create phantom pages
              const containerLines = nonEmpty(
                splitLines(jd.containerDetailsAttach)
              );
              const marksLines = nonEmpty(
                splitLines(jd.marksAndNosDetailsAttach)
              );
              const goodsLines = nonEmpty(
                splitLines(jd.goodsDescDetailsAttach)
              );

              const cChunks = chunkArray(containerLines, LINES_PER_PAGE);
              const mChunks = chunkArray(marksLines, LINES_PER_PAGE);
              const gChunks = chunkArray(goodsLines, LINES_PER_PAGE);

              // GRID should begin from container #3 on attach sheets (skip first two printed on main page)
              const gridSrc = jd.tblBlContainer || jd.tblblContainer || [];
              const allGridRows = Array.isArray(gridSrc) ? gridSrc : [];
              const attachStartIndex = 2; // skip 0 & 1 -> start at #3
              const attachRows = allGridRows.slice(attachStartIndex);
              const hasGrid = attachRows.length > 0;

              // Base pages from text attachments
              const baseAttachPages = Math.max(
                cChunks.length,
                mChunks.length,
                gChunks.length,
                0
              );

              // If no text attachments but we DO have grid rows, still create ONE attach page
              const attachPages =
                baseAttachPages > 0 ? baseAttachPages : hasGrid ? 1 : 0;
              const includeAttachments = attachPages > 0;

              // Used lines on last text-attachment page (0 if we only created a page for grid spill)
              let usedOnLast = 0;
              if (baseAttachPages > 0) {
                const last = baseAttachPages - 1;
                usedOnLast = Math.max(
                  (cChunks[last] || []).length,
                  (mChunks[last] || []).length,
                  (gChunks[last] || []).length
                );
              }

              // If there ARE attachments, we spill leftover grid rows onto the LAST attachment page.
              // If there are NO attachments, we don't "reserve" spill space — start grid directly.
              const firstGridCap = includeAttachments
                ? Math.max(0, LINES_PER_PAGE - usedOnLast)
                : 0;
              const firstRows = includeAttachments
                ? attachRows.slice(0, firstGridCap)
                : [];
              const restRows = includeAttachments
                ? attachRows.slice(firstGridCap)
                : attachRows;
              const restChunks = chunkArray(restRows, LINES_PER_PAGE);

              const basePre = {
                fontSize: "8px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                margin: 0,
              };

              // Your grid columns
              const columns = [
                {
                  key: "cno",
                  header: "Tank NOS.",
                  render: (c) => c.containerNumber,
                  align: "left",
                },
                {
                  key: "size",
                  header: "TYPE",
                  render: (c) => `${c.sizeType || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "seal",
                  header: "C. SEAL NO",
                  render: (c) => `${c.customSealNo || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "gw",
                  header: "S. SEAL NO",
                  render: (c) => `${c.agentSealNo || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "nw",
                  header: "NT. WT",
                  render: (c) => c.netWt || "",
                  align: "right",
                },
                {
                  key: "tare",
                  header: "Tare Weight",
                  render: (c) => `${c.tareWt || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "grw",
                  header: "GR. WT",
                  render: (c) => `${c.grossWtAndUnit || ""}`.trim(),
                  align: "right",
                },
              ];

              return (
                // ⬇️ single wrapper so ref captures EVERYTHING (main + attachments + grid pages)
                <div
                  key={index}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  data-report={`seaway-${index}`}
                  style={{ width: "210mm", margin: "auto" }}
                  className="mt-5"
                >
                  {/* Print-only rules so first and following pages break correctly */}
                  <style jsx global>{`
                    @media print {
                      .first-page {
                        page-break-after: always;
                      }
                      .second-page {
                        page-break-before: always;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {/* MAIN (Seaway BL) PAGE */}
                  <div
                    className={
                      index < reportIds.length - 1
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
                    }}
                  >
                    <div
                      className="first-page"
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {rptSeawayBillOfLading()}
                    </div>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />

                  {/* ATTACHMENT PAGES (render if text lines exist OR tblBlContainer has rows) */}
                  {includeAttachments &&
                    Array.from({ length: attachPages }).map((_, p) => {
                      // Only show this page if it has ANY lines OR it's the last page and we have spill rows
                      const pageHasLines =
                        (cChunks[p]?.length || 0) +
                          (mChunks[p]?.length || 0) +
                          (gChunks[p]?.length || 0) >
                        0;
                      const showThisPage =
                        pageHasLines ||
                        (p === attachPages - 1 && firstRows.length > 0);
                      if (!showThisPage) return null;

                      return (
                        <React.Fragment key={`seaway-att-${p}`}>
                          <div
                            className={
                              p === 0
                                ? "second-page bg-white mainPadding"
                                : "bg-white mainPadding"
                            }
                            style={{
                              width: "210mm",
                              height: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <BlAttachmentPrint
                              bldata={bldata}
                              containerLines={cChunks[p] || []}
                              marksLines={mChunks[p] || []}
                              goodsLines={gChunks[p] || []}
                            />

                            {/* Spill first grid rows only on the last attachment page */}
                            {p === attachPages - 1 && firstRows.length > 0 && (
                              <>
                                {/* Table Header */}
                                <div className="flex border-b border-l border-r border-black mr-2 ml-2 text-center bg-gray-200">
                                  {columns.map(({ key, header }, colIdx) => (
                                    <div
                                      key={key}
                                      className="flex-1"
                                      style={{
                                        padding: "2px",
                                        borderRight:
                                          colIdx < columns.length - 1
                                            ? "1px solid black"
                                            : "none",
                                      }}
                                    >
                                      <p
                                        className="text-black"
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {header}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Table Rows (spill) */}
                                <div className="mr-2 ml-2 border-l border-r border-b border-black">
                                  {firstRows.map((c, i) => (
                                    <div key={i} className="flex">
                                      {columns.map(
                                        ({ key, render, align }, colIdx) => (
                                          <div
                                            key={key}
                                            className="flex-1"
                                            style={{
                                              padding: "1px",
                                              borderRight:
                                                colIdx < columns.length - 1
                                                  ? "1px solid black"
                                                  : "none",
                                              textAlign: align,
                                            }}
                                          >
                                            <pre
                                              className="text-black"
                                              style={{ ...basePre }}
                                            >
                                              {render(c)}
                                            </pre>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                        </React.Fragment>
                      );
                    })}

                  {/* REMAINING GRID PAGES */}
                  {restChunks.map((rows, gi) => (
                    <React.Fragment key={`seaway-grid-${gi}`}>
                      <div
                        className="second-page bg-white mainPadding"
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Grid Header */}
                        <div className="flex border border-black mr-2 ml-2 text-center bg-gray-200">
                          {columns.map(({ key, header }, colIdx) => (
                            <div
                              key={key}
                              className="flex-1"
                              style={{
                                padding: "2px",
                                borderRight:
                                  colIdx < columns.length - 1
                                    ? "1px solid black"
                                    : "none",
                              }}
                            >
                              <p
                                className="text-black font-normal"
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "9px",
                                  textAlign: "center",
                                }}
                              >
                                {header}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Grid Rows */}
                        <div className="mr-2 ml-2 border-b border-black">
                          {rows.map((c, i) => (
                            <div
                              key={i}
                              className="flex border-l border-r border-black text-center"
                            >
                              {columns.map(({ key, render, align }, colIdx) => (
                                <div
                                  key={key}
                                  className="flex-1"
                                  style={{
                                    padding: "1px",
                                    borderRight:
                                      colIdx < columns.length - 1
                                        ? "1px solid black"
                                        : "none",
                                    textAlign: align,
                                  }}
                                >
                                  <pre
                                    className="text-black font-normal"
                                    style={{ ...basePre }}
                                  >
                                    {render(c)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            case "SEAWAY BILL OF LADING DRAFT": {
              // --- utilities (inline) ---
              const splitLines = (txt) =>
                txt ? String(txt).split(/\r?\n/) : [];
              const chunkArray = (arr, size) => {
                if (!Array.isArray(arr) || size <= 0) return [];
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                  chunks.push(arr.slice(i, i + size)); // correct slice
                }
                return chunks;
              };
              const nonEmpty = (arr) =>
                (arr || []).filter((s) => String(s).trim().length > 0);

              // --- paging plan (same behavior as BL Draft) ---
              const LINES_PER_PAGE = 70;

              const jd = bldata || {};

              // Clean empty lines so blank strings don't create phantom pages
              const containerLines = nonEmpty(
                splitLines(jd.containerDetailsAttach)
              );
              const marksLines = nonEmpty(
                splitLines(jd.marksAndNosDetailsAttach)
              );
              const goodsLines = nonEmpty(
                splitLines(jd.goodsDescDetailsAttach)
              );

              const cChunks = chunkArray(containerLines, LINES_PER_PAGE);
              const mChunks = chunkArray(marksLines, LINES_PER_PAGE);
              const gChunks = chunkArray(goodsLines, LINES_PER_PAGE);

              // GRID should begin from container #3 on attach sheets (skip first two printed on main page)
              const gridSrc = jd.tblBlContainer || jd.tblblContainer || [];
              const allGridRows = Array.isArray(gridSrc) ? gridSrc : [];
              const attachStartIndex = 2; // skip 0 & 1 -> start at #3
              const attachRows = allGridRows.slice(attachStartIndex);
              const hasGrid = attachRows.length > 0;

              // Base pages from text attachments
              const baseAttachPages = Math.max(
                cChunks.length,
                mChunks.length,
                gChunks.length,
                0
              );

              // If no text attachments but we DO have grid rows, still create ONE attach page
              const attachPages =
                baseAttachPages > 0 ? baseAttachPages : hasGrid ? 1 : 0;
              const includeAttachments = attachPages > 0;

              // Used lines on last text-attachment page (0 if we only created a page for grid spill)
              let usedOnLast = 0;
              if (baseAttachPages > 0) {
                const last = baseAttachPages - 1;
                usedOnLast = Math.max(
                  (cChunks[last] || []).length,
                  (mChunks[last] || []).length,
                  (gChunks[last] || []).length
                );
              }

              // If there ARE attachments, we spill leftover grid rows onto the LAST attachment page.
              // If there are NO attachments, we don't "reserve" spill space — start grid directly.
              const firstGridCap = includeAttachments
                ? Math.max(0, LINES_PER_PAGE - usedOnLast)
                : 0;
              const firstRows = includeAttachments
                ? attachRows.slice(0, firstGridCap)
                : [];
              const restRows = includeAttachments
                ? attachRows.slice(firstGridCap)
                : attachRows;
              const restChunks = chunkArray(restRows, LINES_PER_PAGE);

              const basePre = {
                fontSize: "8px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                margin: 0,
              };

              // Your grid columns
              const columns = [
                {
                  key: "cno",
                  header: "Tank NOS.",
                  render: (c) => c.containerNumber,
                  align: "left",
                },
                {
                  key: "size",
                  header: "TYPE",
                  render: (c) => `${c.sizeType || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "seal",
                  header: "C. SEAL NO",
                  render: (c) => `${c.customSealNo || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "gw",
                  header: "S. SEAL NO",
                  render: (c) => `${c.agentSealNo || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "nw",
                  header: "NT. WT",
                  render: (c) => c.netWt || "",
                  align: "right",
                },
                {
                  key: "tare",
                  header: "Tare Weight",
                  render: (c) => `${c.tareWt || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "grw",
                  header: "GR. WT",
                  render: (c) => `${c.grossWtAndUnit || ""}`.trim(),
                  align: "right",
                },
              ];

              return (
                // ⬇️ single wrapper so ref captures EVERYTHING (main + attachments + grid pages)
                <div
                  key={index}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  data-report={`seaway-${index}`}
                  style={{ width: "210mm", margin: "auto" }}
                  className="mt-5"
                >
                  {/* Print-only rules so first and following pages break correctly */}
                  <style jsx global>{`
                    @media print {
                      .first-page {
                        page-break-after: always;
                      }
                      .second-page {
                        page-break-before: always;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {/* MAIN (Seaway BL) PAGE */}
                  <div
                    className={
                      index < reportIds.length - 1
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
                    }}
                  >
                    <div
                      className="first-page"
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {rptSeawayBillOfLadingDraft()}
                    </div>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />

                  {/* ATTACHMENT PAGES (render if text lines exist OR tblBlContainer has rows) */}
                  {includeAttachments &&
                    Array.from({ length: attachPages }).map((_, p) => {
                      // Only show this page if it has ANY lines OR it's the last page and we have spill rows
                      const pageHasLines =
                        (cChunks[p]?.length || 0) +
                          (mChunks[p]?.length || 0) +
                          (gChunks[p]?.length || 0) >
                        0;
                      const showThisPage =
                        pageHasLines ||
                        (p === attachPages - 1 && firstRows.length > 0);
                      if (!showThisPage) return null;

                      return (
                        <React.Fragment key={`seaway-att-${p}`}>
                          <div
                            className={
                              p === 0
                                ? "second-page bg-white mainPadding"
                                : "bg-white mainPadding"
                            }
                            style={{
                              width: "210mm",
                              height: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <BlAttachmentPrint
                              bldata={bldata}
                              containerLines={cChunks[p] || []}
                              marksLines={mChunks[p] || []}
                              goodsLines={gChunks[p] || []}
                            />

                            {/* Spill first grid rows only on the last attachment page */}
                            {p === attachPages - 1 && firstRows.length > 0 && (
                              <>
                                {/* Table Header */}
                                <div className="flex border-b border-l border-r border-black mr-2 ml-2 text-center bg-gray-200">
                                  {columns.map(({ key, header }, colIdx) => (
                                    <div
                                      key={key}
                                      className="flex-1"
                                      style={{
                                        padding: "2px",
                                        borderRight:
                                          colIdx < columns.length - 1
                                            ? "1px solid black"
                                            : "none",
                                      }}
                                    >
                                      <p
                                        className="text-black"
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {header}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Table Rows (spill) */}
                                <div className="mr-2 ml-2 border-l border-r border-b border-black">
                                  {firstRows.map((c, i) => (
                                    <div key={i} className="flex">
                                      {columns.map(
                                        ({ key, render, align }, colIdx) => (
                                          <div
                                            key={key}
                                            className="flex-1"
                                            style={{
                                              padding: "1px",
                                              borderRight:
                                                colIdx < columns.length - 1
                                                  ? "1px solid black"
                                                  : "none",
                                              textAlign: align,
                                            }}
                                          >
                                            <pre
                                              className="text-black"
                                              style={{ ...basePre }}
                                            >
                                              {render(c)}
                                            </pre>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                        </React.Fragment>
                      );
                    })}

                  {/* REMAINING GRID PAGES */}
                  {restChunks.map((rows, gi) => (
                    <React.Fragment key={`seaway-grid-${gi}`}>
                      <div
                        className="second-page bg-white mainPadding"
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Grid Header */}
                        <div className="flex border border-black mr-2 ml-2 text-center bg-gray-200">
                          {columns.map(({ key, header }, colIdx) => (
                            <div
                              key={key}
                              className="flex-1"
                              style={{
                                padding: "2px",
                                borderRight:
                                  colIdx < columns.length - 1
                                    ? "1px solid black"
                                    : "none",
                              }}
                            >
                              <p
                                className="text-black font-normal"
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "9px",
                                  textAlign: "center",
                                }}
                              >
                                {header}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Grid Rows */}
                        <div className="mr-2 ml-2 border-b border-black">
                          {rows.map((c, i) => (
                            <div
                              key={i}
                              className="flex border-l border-r border-black text-center"
                            >
                              {columns.map(({ key, render, align }, colIdx) => (
                                <div
                                  key={key}
                                  className="flex-1"
                                  style={{
                                    padding: "1px",
                                    borderRight:
                                      colIdx < columns.length - 1
                                        ? "1px solid black"
                                        : "none",
                                    textAlign: align,
                                  }}
                                >
                                  <pre
                                    className="text-black font-normal"
                                    style={{ ...basePre }}
                                  >
                                    {render(c)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            case "BL DRAFT SBX": {
              // --- utilities (inline) ---
              const splitLines = (txt) =>
                txt ? String(txt).split(/\r?\n/) : [];
              const chunkArray = (arr, size) => {
                if (!Array.isArray(arr) || size <= 0) return [];
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                  chunks.push(arr.slice(i, i + size)); // correct slice
                }
                return chunks;
              };
              const nonEmpty = (arr) =>
                (arr || []).filter((s) => String(s).trim().length > 0);

              // --- paging plan (same behavior as BL Draft) ---
              const LINES_PER_PAGE = 70;

              const jd = bldata || {};

              // Clean empty lines so blank strings don't create phantom pages
              const containerLines = nonEmpty(
                splitLines(jd.containerDetailsAttach)
              );
              const marksLines = nonEmpty(
                splitLines(jd.marksAndNosDetailsAttach)
              );
              const goodsLines = nonEmpty(
                splitLines(jd.goodsDescDetailsAttach)
              );

              const cChunks = chunkArray(containerLines, LINES_PER_PAGE);
              const mChunks = chunkArray(marksLines, LINES_PER_PAGE);
              const gChunks = chunkArray(goodsLines, LINES_PER_PAGE);

              // GRID should begin from container #3 on attach sheets (skip first two printed on main page)
              const gridSrc = jd.tblBlContainer || jd.tblblContainer || [];
              const allGridRows = Array.isArray(gridSrc) ? gridSrc : [];
              const attachStartIndex = 0; // skip 0 & 1 -> start at #3
              const attachRows = allGridRows.slice(attachStartIndex);
              const hasGrid = attachRows.length > 0;

              // Base pages from text attachments
              const baseAttachPages = Math.max(
                cChunks.length,
                mChunks.length,
                gChunks.length,
                0
              );

              // If no text attachments but we DO have grid rows, still create ONE attach page
              const attachPages =
                baseAttachPages > 0 ? baseAttachPages : hasGrid ? 1 : 0;
              const includeAttachments = attachPages > 0;

              // Used lines on last text-attachment page (0 if we only created a page for grid spill)
              let usedOnLast = 0;
              if (baseAttachPages > 0) {
                const last = baseAttachPages - 1;
                usedOnLast = Math.max(
                  (cChunks[last] || []).length,
                  (mChunks[last] || []).length,
                  (gChunks[last] || []).length
                );
              }

              // If there ARE attachments, we spill leftover grid rows onto the LAST attachment page.
              // If there are NO attachments, we don't "reserve" spill space — start grid directly.
              const firstGridCap = includeAttachments
                ? Math.max(0, LINES_PER_PAGE - usedOnLast)
                : 0;
              const firstRows = includeAttachments
                ? attachRows.slice(0, firstGridCap)
                : [];

              const restRows = includeAttachments
                ? attachRows.slice(firstGridCap)
                : attachRows;
              const restChunks = chunkArray(restRows, LINES_PER_PAGE);

              const basePre = {
                fontSize: "8px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                margin: 0,
              };

              // Your grid columns
              const columns = [
                {
                  key: "containerNumber",
                  header: "Container No.",
                  render: (c) => c.containerNumber,
                  align: "center",
                },
                {
                  key: "Marks",
                  header: "Marks",
                  render: (c) => c.containerNumber,
                  align: "center",
                },
                {
                  key: "size",
                  header: "Type",
                  render: (c) => `${c.sizeType || ""}`.trim(),
                  align: "center",
                },
                {
                  key: "seal",
                  header: "Agent/Custom Seal No",
                  render: (c) =>
                    `${c.customSealNo || ""} ${c.agentSealNo || ""}`.trim(),
                  align: "center",
                },
                {
                  key: "No of Packages",
                  header: "Packages",
                  render: (c) =>
                    `${c.noOfPackages || ""}${" "}${
                      c.packageCode || ""
                    }`.trim(),
                  align: "center",
                },
                {
                  key: "grossWt",
                  header: "Gross WT (KGS)",
                  render: (c) => c.grossWt || "",
                  align: "center",
                },
                {
                  key: "netWt",
                  header: "Net Wt (KGS)",
                  render: (c) => `${c.netWt || ""}`.trim(),
                  align: "center",
                },
              ];

              return (
                // ⬇️ single wrapper so ref captures EVERYTHING (main + attachments + grid pages)
                <div
                  key={index}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  data-report={`seaway-${index}`}
                  style={{ width: "210mm", margin: "auto" }}
                  className="mt-5"
                >
                  {/* Print-only rules so first and following pages break correctly */}
                  <style jsx global>{`
                    @media print {
                      .first-page {
                        page-break-after: always;
                      }
                      .second-page {
                        page-break-before: always;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {/* MAIN (Seaway BL) PAGE */}
                  <div
                    className={
                      index < reportIds.length - 1
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
                    }}
                  >
                    <div
                      className="first-page"
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {rptBillOfLadingSBX()}
                    </div>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />

                  {/* ATTACHMENT PAGES (render if text lines exist OR tblBlContainer has rows) */}
                  {includeAttachments &&
                    Array.from({ length: attachPages }).map((_, p) => {
                      // Only show this page if it has ANY lines OR it's the last page and we have spill rows
                      const pageHasLines =
                        (cChunks[p]?.length || 0) +
                          (mChunks[p]?.length || 0) +
                          (gChunks[p]?.length || 0) >
                        0;
                      const showThisPage =
                        pageHasLines ||
                        (p === attachPages - 1 && firstRows.length > 0);
                      if (!showThisPage) return null;

                      return (
                        <React.Fragment key={`seaway-att-${p}`}>
                          <div
                            className={
                              p === 0
                                ? "second-page bg-white mainPadding"
                                : "bg-white mainPadding"
                            }
                            style={{
                              width: "210mm",
                              height: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <BlAttachmentPrintSBX
                              bldata={bldata}
                              containerLines={cChunks[p] || []}
                              marksLines={mChunks[p] || []}
                              goodsLines={gChunks[p] || []}
                            />

                            {/* Spill first grid rows only on the last attachment page */}
                            {p === attachPages - 1 && firstRows.length > 0 && (
                              <div className="pl-2 pr-2">
                                {/* Table Header */}
                                <div className="flex border-b border-l border-r border-black text-center bg-gray-200">
                                  {columns.map(({ key, header }, colIdx) => (
                                    <div
                                      key={key}
                                      className="flex-1"
                                      style={{
                                        padding: "2px",
                                        borderRight:
                                          colIdx < columns.length - 1
                                            ? "1px solid black"
                                            : "none",
                                      }}
                                    >
                                      <p
                                        className="text-black"
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {header}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Table Rows (spill) */}
                                <div className="border-l border-r border-b border-black">
                                  {firstRows.map((c, i) => (
                                    <div key={i} className="flex">
                                      {columns.map(
                                        ({ key, render, align }, colIdx) => (
                                          <div
                                            key={key}
                                            className="flex-1"
                                            style={{
                                              padding: "1px",
                                              borderRight:
                                                colIdx < columns.length - 1
                                                  ? "1px solid black"
                                                  : "none",
                                              textAlign: align,
                                            }}
                                          >
                                            <pre
                                              className="text-black"
                                              style={{ ...basePre }}
                                            >
                                              {render(c)}
                                            </pre>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                        </React.Fragment>
                      );
                    })}

                  {/* REMAINING GRID PAGES */}
                  {restChunks.map((rows, gi) => (
                    <React.Fragment key={`seaway-grid-${gi}`}>
                      <div
                        className="second-page bg-white mainPadding"
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Grid Header */}
                        <div className="flex border border-black mr-2 ml-2 text-center bg-gray-200">
                          {columns.map(({ key, header }, colIdx) => (
                            <div
                              key={key}
                              className="flex-1"
                              style={{
                                padding: "2px",
                                borderRight:
                                  colIdx < columns.length - 1
                                    ? "1px solid black"
                                    : "none",
                              }}
                            >
                              <p
                                className="text-black font-normal"
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "9px",
                                  textAlign: "center",
                                }}
                              >
                                {header}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Grid Rows */}
                        <div className="mr-2 ml-2 border-b border-black">
                          {rows.map((c, i) => (
                            <div
                              key={i}
                              className="flex border-l border-r border-black text-center"
                            >
                              {columns.map(({ key, render, align }, colIdx) => (
                                <div
                                  key={key}
                                  className="flex-1"
                                  style={{
                                    padding: "1px",
                                    borderRight:
                                      colIdx < columns.length - 1
                                        ? "1px solid black"
                                        : "none",
                                    textAlign: align,
                                  }}
                                >
                                  <pre
                                    className="text-black font-normal"
                                    style={{ ...basePre }}
                                  >
                                    {render(c)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            case "BL Print SBX": {
              // --- utilities (inline) ---
              const splitLines = (txt) =>
                txt ? String(txt).split(/\r?\n/) : [];
              const chunkArray = (arr, size) => {
                if (!Array.isArray(arr) || size <= 0) return [];
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                  chunks.push(arr.slice(i, i + size)); // correct slice
                }
                return chunks;
              };
              const nonEmpty = (arr) =>
                (arr || []).filter((s) => String(s).trim().length > 0);

              // --- paging plan (same behavior as BL Draft) ---
              const LINES_PER_PAGE = 70;

              const jd = bldata || {};

              // Clean empty lines so blank strings don't create phantom pages
              const containerLines = nonEmpty(
                splitLines(jd.containerDetailsAttach)
              );
              const marksLines = nonEmpty(
                splitLines(jd.marksAndNosDetailsAttach)
              );
              const goodsLines = nonEmpty(
                splitLines(jd.goodsDescDetailsAttach)
              );

              const cChunks = chunkArray(containerLines, LINES_PER_PAGE);
              const mChunks = chunkArray(marksLines, LINES_PER_PAGE);
              const gChunks = chunkArray(goodsLines, LINES_PER_PAGE);

              // GRID should begin from container #3 on attach sheets (skip first two printed on main page)
              const gridSrc = jd.tblBlContainer || jd.tblblContainer || [];
              const allGridRows = Array.isArray(gridSrc) ? gridSrc : [];
              const attachStartIndex = 0; // skip 0 & 1 -> start at #3
              const attachRows = allGridRows.slice(attachStartIndex);
              const hasGrid = attachRows.length > 0;

              // Base pages from text attachments
              const baseAttachPages = Math.max(
                cChunks.length,
                mChunks.length,
                gChunks.length,
                0
              );

              // If no text attachments but we DO have grid rows, still create ONE attach page
              const attachPages =
                baseAttachPages > 0 ? baseAttachPages : hasGrid ? 1 : 0;
              const includeAttachments = attachPages > 0;

              // Used lines on last text-attachment page (0 if we only created a page for grid spill)
              let usedOnLast = 0;
              if (baseAttachPages > 0) {
                const last = baseAttachPages - 1;
                usedOnLast = Math.max(
                  (cChunks[last] || []).length,
                  (mChunks[last] || []).length,
                  (gChunks[last] || []).length
                );
              }

              // If there ARE attachments, we spill leftover grid rows onto the LAST attachment page.
              // If there are NO attachments, we don't "reserve" spill space — start grid directly.
              const firstGridCap = includeAttachments
                ? Math.max(0, LINES_PER_PAGE - usedOnLast)
                : 0;
              const firstRows = includeAttachments
                ? attachRows.slice(0, firstGridCap)
                : [];

              const restRows = includeAttachments
                ? attachRows.slice(firstGridCap)
                : attachRows;
              const restChunks = chunkArray(restRows, LINES_PER_PAGE);

              const basePre = {
                fontSize: "8px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                margin: 0,
              };

              // Your grid columns
              const columns = [
                {
                  key: "containerNumber",
                  header: "Container No.",
                  render: (c) => c.containerNumber,
                  align: "center",
                },
                {
                  key: "Marks",
                  header: "Marks",
                  render: (c) => c.containerNumber,
                  align: "center",
                },
                {
                  key: "size",
                  header: "Type",
                  render: (c) => `${c.sizeType || ""}`.trim(),
                  align: "center",
                },
                {
                  key: "seal",
                  header: "Agent/Custom Seal No",
                  render: (c) =>
                    `${c.customSealNo || ""} ${c.agentSealNo || ""}`.trim(),
                  align: "center",
                },
                {
                  key: "No of Packages",
                  header: "Packages",
                  render: (c) =>
                    `${c.noOfPackages || ""}${" "}${
                      c.packageCode || ""
                    }`.trim(),
                  align: "center",
                },
                {
                  key: "grossWt",
                  header: "Gross WT (KGS)",
                  render: (c) => c.grossWt || "",
                  align: "center",
                },
                {
                  key: "netWt",
                  header: "Net Wt (KGS)",
                  render: (c) => `${c.netWt || ""}`.trim(),
                  align: "center",
                },
                // {
                //   key: "gw",
                //   header: "CBM",
                //   render: (c) => `${c.tareWt || ""}`.trim(),
                //   align: "center",
                // },
              ];

              return (
                // ⬇️ single wrapper so ref captures EVERYTHING (main + attachments + grid pages)
                <div
                  key={index}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  data-report={`seaway-${index}`}
                  style={{ width: "210mm", margin: "auto" }}
                  className="mt-5"
                >
                  {/* Print-only rules so first and following pages break correctly */}
                  <style jsx global>{`
                    @media print {
                      .first-page {
                        page-break-after: always;
                      }
                      .second-page {
                        page-break-before: always;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {/* MAIN (Seaway BL) PAGE */}
                  <div
                    className={
                      index < reportIds.length - 1
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
                    }}
                  >
                    <div
                      className="first-page"
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {rptBillOfLadingPrintSBX()}
                    </div>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />

                  {/* ATTACHMENT PAGES (render if text lines exist OR tblBlContainer has rows) */}
                  {includeAttachments &&
                    Array.from({ length: attachPages }).map((_, p) => {
                      // Only show this page if it has ANY lines OR it's the last page and we have spill rows
                      const pageHasLines =
                        (cChunks[p]?.length || 0) +
                          (mChunks[p]?.length || 0) +
                          (gChunks[p]?.length || 0) >
                        0;
                      const showThisPage =
                        pageHasLines ||
                        (p === attachPages - 1 && firstRows.length > 0);
                      if (!showThisPage) return null;

                      return (
                        <React.Fragment key={`seaway-att-${p}`}>
                          <div
                            className={
                              p === 0
                                ? "second-page bg-white mainPadding"
                                : "bg-white mainPadding"
                            }
                            style={{
                              width: "210mm",
                              height: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <BlAttachmentPrintSBXNoLines
                              bldata={bldata}
                              containerLines={cChunks[p] || []}
                              marksLines={mChunks[p] || []}
                              goodsLines={gChunks[p] || []}
                            />

                            {/* Spill first grid rows only on the last attachment page */}
                            {p === attachPages - 1 && firstRows.length > 0 && (
                              <div className="pl-2 pr-2">
                                {/* Table Header */}
                                <div className="flex  text-center bg-gray-200">
                                  {columns.map(({ key, header }, colIdx) => (
                                    <div
                                      key={key}
                                      className="flex-1"
                                      style={{
                                        padding: "2px",
                                        borderRight:
                                          colIdx < columns.length - 1
                                            ? ""
                                            : "none",
                                      }}
                                    >
                                      <p
                                        className="text-black"
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {header}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Table Rows (spill) */}
                                <div className="">
                                  {firstRows.map((c, i) => (
                                    <div key={i} className="flex">
                                      {columns.map(
                                        ({ key, render, align }, colIdx) => (
                                          <div
                                            key={key}
                                            className="flex-1"
                                            style={{
                                              padding: "1px",
                                              borderRight:
                                                colIdx < columns.length - 1
                                                  ? ""
                                                  : "none",
                                              textAlign: align,
                                            }}
                                          >
                                            <pre
                                              className="text-black"
                                              style={{ ...basePre }}
                                            >
                                              {render(c)}
                                            </pre>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                        </React.Fragment>
                      );
                    })}

                  {/* REMAINING GRID PAGES */}
                  {restChunks.map((rows, gi) => (
                    <React.Fragment key={`seaway-grid-${gi}`}>
                      <div
                        className="second-page bg-white mainPadding"
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Grid Header */}
                        <div className="flex  mr-2 ml-2 text-center bg-gray-200">
                          {columns.map(({ key, header }, colIdx) => (
                            <div
                              key={key}
                              className="flex-1"
                              style={{
                                padding: "2px",
                                borderRight:
                                  colIdx < columns.length - 1 ? "" : "none",
                              }}
                            >
                              <p
                                className="text-black font-normal"
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "9px",
                                  textAlign: "center",
                                }}
                              >
                                {header}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Grid Rows */}
                        <div className="mr-2 ml-2 ">
                          {rows.map((c, i) => (
                            <div key={i} className="flex   text-center">
                              {columns.map(({ key, render, align }, colIdx) => (
                                <div
                                  key={key}
                                  className="flex-1"
                                  style={{
                                    padding: "1px",
                                    borderRight:
                                      colIdx < columns.length - 1 ? "" : "none",
                                    textAlign: align,
                                  }}
                                >
                                  <pre
                                    className="text-black font-normal"
                                    style={{ ...basePre }}
                                  >
                                    {render(c)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            case "SUPERIOR FREIGHT SERVICES BLDRAFT": {
              // --- utilities (inline) ---
              const splitLines = (txt) =>
                txt ? String(txt).split(/\r?\n/) : [];
              const chunkArray = (arr, size) => {
                if (!Array.isArray(arr) || size <= 0) return [];
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                  chunks.push(arr.slice(i, i + size)); // correct slice
                }
                return chunks;
              };
              const nonEmpty = (arr) =>
                (arr || []).filter((s) => String(s).trim().length > 0);

              // --- paging plan (same behavior as BL Draft) ---
              const LINES_PER_PAGE = 70;

              const jd = bldata || {};

              // Clean empty lines so blank strings don't create phantom pages
              const containerLines = nonEmpty(
                splitLines(jd.containerDetailsAttach)
              );
              const marksLines = nonEmpty(
                splitLines(jd.marksAndNosDetailsAttach)
              );
              const goodsLines = nonEmpty(
                splitLines(jd.goodsDescDetailsAttach)
              );

              const cChunks = chunkArray(containerLines, LINES_PER_PAGE);
              const mChunks = chunkArray(marksLines, LINES_PER_PAGE);
              const gChunks = chunkArray(goodsLines, LINES_PER_PAGE);

              // GRID should begin from container #3 on attach sheets (skip first two printed on main page)
              const gridSrc = jd.tblBlContainer || jd.tblblContainer || [];
              const allGridRows = Array.isArray(gridSrc) ? gridSrc : [];
              const attachStartIndex = 2; // skip 0 & 1 -> start at #3
              const attachRows = allGridRows.slice(attachStartIndex);
              const hasGrid = attachRows.length > 0;

              // Base pages from text attachments
              const baseAttachPages = Math.max(
                cChunks.length,
                mChunks.length,
                gChunks.length,
                0
              );

              // If no text attachments but we DO have grid rows, still create ONE attach page
              const attachPages =
                baseAttachPages > 0 ? baseAttachPages : hasGrid ? 1 : 0;
              const includeAttachments = attachPages > 0;

              // Used lines on last text-attachment page (0 if we only created a page for grid spill)
              let usedOnLast = 0;
              if (baseAttachPages > 0) {
                const last = baseAttachPages - 1;
                usedOnLast = Math.max(
                  (cChunks[last] || []).length,
                  (mChunks[last] || []).length,
                  (gChunks[last] || []).length
                );
              }

              // If there ARE attachments, we spill leftover grid rows onto the LAST attachment page.
              // If there are NO attachments, we don't "reserve" spill space — start grid directly.
              const firstGridCap = includeAttachments
                ? Math.max(0, LINES_PER_PAGE - usedOnLast)
                : 0;
              const firstRows = includeAttachments
                ? attachRows.slice(0, firstGridCap)
                : [];
              const restRows = includeAttachments
                ? attachRows.slice(firstGridCap)
                : attachRows;
              const restChunks = chunkArray(restRows, LINES_PER_PAGE);

              const basePre = {
                fontSize: "8px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                margin: 0,
              };

              // Your grid columns
              const columns = [
                {
                  key: "cno",
                  header: "Tank NOS.",
                  render: (c) => c.containerNumber,
                  align: "left",
                },
                {
                  key: "size",
                  header: "TYPE",
                  render: (c) => `${c.sizeType || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "seal",
                  header: "C. SEAL NO",
                  render: (c) => `${c.customSealNo || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "gw",
                  header: "S. SEAL NO",
                  render: (c) => `${c.agentSealNo || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "nw",
                  header: "NT. WT",
                  render: (c) => c.netWt || "",
                  align: "right",
                },
                {
                  key: "tare",
                  header: "Tare Weight",
                  render: (c) => `${c.tareWt || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "grw",
                  header: "GR. WT",
                  render: (c) => `${c.grossWtAndUnit || ""}`.trim(),
                  align: "right",
                },
              ];

              return (
                // ⬇️ single wrapper so ref captures EVERYTHING (main + attachments + grid pages)
                <div
                  key={index}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  data-report={`seaway-${index}`}
                  style={{ width: "210mm", margin: "auto" }}
                  className="mt-5"
                >
                  {/* Print-only rules so first and following pages break correctly */}
                  <style jsx global>{`
                    @media print {
                      .first-page {
                        page-break-after: always;
                      }
                      .second-page {
                        page-break-before: always;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {/* MAIN (Seaway BL) PAGE */}
                  <div
                    className={
                      index < reportIds.length - 1
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
                    }}
                  >
                    <div
                      className="first-page"
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {SUPERIORFREIGHTSERVICESBLDRAFT()}
                    </div>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />

                  {/* ATTACHMENT PAGES (render if text lines exist OR tblBlContainer has rows) */}
                  {includeAttachments &&
                    Array.from({ length: attachPages }).map((_, p) => {
                      // Only show this page if it has ANY lines OR it's the last page and we have spill rows
                      const pageHasLines =
                        (cChunks[p]?.length || 0) +
                          (mChunks[p]?.length || 0) +
                          (gChunks[p]?.length || 0) >
                        0;
                      const showThisPage =
                        pageHasLines ||
                        (p === attachPages - 1 && firstRows.length > 0);
                      if (!showThisPage) return null;

                      return (
                        <React.Fragment key={`seaway-att-${p}`}>
                          <div
                            className={
                              p === 0
                                ? "second-page bg-white mainPadding"
                                : "bg-white mainPadding"
                            }
                            style={{
                              width: "210mm",
                              height: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <BlAttachmentPrint
                              bldata={bldata}
                              containerLines={cChunks[p] || []}
                              marksLines={mChunks[p] || []}
                              goodsLines={gChunks[p] || []}
                            />

                            {/* Spill first grid rows only on the last attachment page */}
                            {p === attachPages - 1 && firstRows.length > 0 && (
                              <>
                                {/* Table Header */}
                                <div className="flex border-b border-l border-r border-black mr-2 ml-2 text-center bg-gray-200">
                                  {columns.map(({ key, header }, colIdx) => (
                                    <div
                                      key={key}
                                      className="flex-1"
                                      style={{
                                        padding: "2px",
                                        borderRight:
                                          colIdx < columns.length - 1
                                            ? "1px solid black"
                                            : "none",
                                      }}
                                    >
                                      <p
                                        className="text-black"
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {header}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Table Rows (spill) */}
                                <div className="mr-2 ml-2 border-l border-r border-b border-black">
                                  {firstRows.map((c, i) => (
                                    <div key={i} className="flex">
                                      {columns.map(
                                        ({ key, render, align }, colIdx) => (
                                          <div
                                            key={key}
                                            className="flex-1"
                                            style={{
                                              padding: "1px",
                                              borderRight:
                                                colIdx < columns.length - 1
                                                  ? "1px solid black"
                                                  : "none",
                                              textAlign: align,
                                            }}
                                          >
                                            <pre
                                              className="text-black"
                                              style={{ ...basePre }}
                                            >
                                              {render(c)}
                                            </pre>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                        </React.Fragment>
                      );
                    })}

                  {/* REMAINING GRID PAGES */}
                  {restChunks.map((rows, gi) => (
                    <React.Fragment key={`seaway-grid-${gi}`}>
                      <div
                        className="second-page bg-white mainPadding"
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Grid Header */}
                        <div className="flex border border-black mr-2 ml-2 text-center bg-gray-200">
                          {columns.map(({ key, header }, colIdx) => (
                            <div
                              key={key}
                              className="flex-1"
                              style={{
                                padding: "2px",
                                borderRight:
                                  colIdx < columns.length - 1
                                    ? "1px solid black"
                                    : "none",
                              }}
                            >
                              <p
                                className="text-black font-normal"
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "9px",
                                  textAlign: "center",
                                }}
                              >
                                {header}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Grid Rows */}
                        <div className="mr-2 ml-2 border-b border-black">
                          {rows.map((c, i) => (
                            <div
                              key={i}
                              className="flex border-l border-r border-black text-center"
                            >
                              {columns.map(({ key, render, align }, colIdx) => (
                                <div
                                  key={key}
                                  className="flex-1"
                                  style={{
                                    padding: "1px",
                                    borderRight:
                                      colIdx < columns.length - 1
                                        ? "1px solid black"
                                        : "none",
                                    textAlign: align,
                                  }}
                                >
                                  <pre
                                    className="text-black font-normal"
                                    style={{ ...basePre }}
                                  >
                                    {render(c)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            case "SUPERIOR FREIGHT SERVICES-BLPRINT": {
              // --- utilities (inline) ---
              const splitLines = (txt) =>
                txt ? String(txt).split(/\r?\n/) : [];
              const chunkArray = (arr, size) => {
                if (!Array.isArray(arr) || size <= 0) return [];
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                  chunks.push(arr.slice(i, i + size)); // correct slice
                }
                return chunks;
              };
              const nonEmpty = (arr) =>
                (arr || []).filter((s) => String(s).trim().length > 0);

              // --- paging plan (same behavior as BL Draft) ---
              const LINES_PER_PAGE = 70;

              const jd = bldata || {};

              // Clean empty lines so blank strings don't create phantom pages
              const containerLines = nonEmpty(
                splitLines(jd.containerDetailsAttach)
              );
              const marksLines = nonEmpty(
                splitLines(jd.marksAndNosDetailsAttach)
              );
              const goodsLines = nonEmpty(
                splitLines(jd.goodsDescDetailsAttach)
              );

              const cChunks = chunkArray(containerLines, LINES_PER_PAGE);
              const mChunks = chunkArray(marksLines, LINES_PER_PAGE);
              const gChunks = chunkArray(goodsLines, LINES_PER_PAGE);

              // GRID should begin from container #3 on attach sheets (skip first two printed on main page)
              const gridSrc = jd.tblBlContainer || jd.tblblContainer || [];
              const allGridRows = Array.isArray(gridSrc) ? gridSrc : [];
              const attachStartIndex = 2; // skip 0 & 1 -> start at #3
              const attachRows = allGridRows.slice(attachStartIndex);
              const hasGrid = attachRows.length > 0;

              // Base pages from text attachments
              const baseAttachPages = Math.max(
                cChunks.length,
                mChunks.length,
                gChunks.length,
                0
              );

              // If no text attachments but we DO have grid rows, still create ONE attach page
              const attachPages =
                baseAttachPages > 0 ? baseAttachPages : hasGrid ? 1 : 0;
              const includeAttachments = attachPages > 0;

              // Used lines on last text-attachment page (0 if we only created a page for grid spill)
              let usedOnLast = 0;
              if (baseAttachPages > 0) {
                const last = baseAttachPages - 1;
                usedOnLast = Math.max(
                  (cChunks[last] || []).length,
                  (mChunks[last] || []).length,
                  (gChunks[last] || []).length
                );
              }

              // If there ARE attachments, we spill leftover grid rows onto the LAST attachment page.
              // If there are NO attachments, we don't "reserve" spill space — start grid directly.
              const firstGridCap = includeAttachments
                ? Math.max(0, LINES_PER_PAGE - usedOnLast)
                : 0;
              const firstRows = includeAttachments
                ? attachRows.slice(0, firstGridCap)
                : [];
              const restRows = includeAttachments
                ? attachRows.slice(firstGridCap)
                : attachRows;
              const restChunks = chunkArray(restRows, LINES_PER_PAGE);

              const basePre = {
                fontSize: "8px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                margin: 0,
              };

              // Your grid columns
              const columns = [
                {
                  key: "cno",
                  header: "Tank NOS.",
                  render: (c) => c.containerNumber,
                  align: "left",
                },
                {
                  key: "size",
                  header: "TYPE",
                  render: (c) => `${c.sizeType || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "seal",
                  header: "C. SEAL NO",
                  render: (c) => `${c.customSealNo || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "gw",
                  header: "S. SEAL NO",
                  render: (c) => `${c.agentSealNo || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "nw",
                  header: "NT. WT",
                  render: (c) => c.netWt || "",
                  align: "right",
                },
                {
                  key: "tare",
                  header: "Tare Weight",
                  render: (c) => `${c.tareWt || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "grw",
                  header: "GR. WT",
                  render: (c) => `${c.grossWtAndUnit || ""}`.trim(),
                  align: "right",
                },
              ];

              return (
                // ⬇️ single wrapper so ref captures EVERYTHING (main + attachments + grid pages)
                <div
                  key={index}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  data-report={`seaway-${index}`}
                  style={{ width: "210mm", margin: "auto" }}
                  className="mt-5"
                >
                  {/* Print-only rules so first and following pages break correctly */}
                  <style jsx global>{`
                    @media print {
                      .first-page {
                        page-break-after: always;
                      }
                      .second-page {
                        page-break-before: always;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {/* MAIN (Seaway BL) PAGE */}
                  <div
                    className={
                      index < reportIds.length - 1
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
                    }}
                  >
                    <div
                      className="first-page"
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {SUPERIORFREIGHTSERVICESBLPRINT()}
                    </div>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />

                  {/* ATTACHMENT PAGES (render if text lines exist OR tblBlContainer has rows) */}
                  {includeAttachments &&
                    Array.from({ length: attachPages }).map((_, p) => {
                      // Only show this page if it has ANY lines OR it's the last page and we have spill rows
                      const pageHasLines =
                        (cChunks[p]?.length || 0) +
                          (mChunks[p]?.length || 0) +
                          (gChunks[p]?.length || 0) >
                        0;
                      const showThisPage =
                        pageHasLines ||
                        (p === attachPages - 1 && firstRows.length > 0);
                      if (!showThisPage) return null;

                      return (
                        <React.Fragment key={`seaway-att-${p}`}>
                          <div
                            className={
                              p === 0
                                ? "second-page bg-white mainPadding"
                                : "bg-white mainPadding"
                            }
                            style={{
                              width: "210mm",
                              height: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <BlAttachmentPrint
                              bldata={bldata}
                              containerLines={cChunks[p] || []}
                              marksLines={mChunks[p] || []}
                              goodsLines={gChunks[p] || []}
                            />

                            {/* Spill first grid rows only on the last attachment page */}
                            {p === attachPages - 1 && firstRows.length > 0 && (
                              <>
                                {/* Table Header */}
                                <div className="flex border-b border-l border-r border-black mr-2 ml-2 text-center bg-gray-200">
                                  {columns.map(({ key, header }, colIdx) => (
                                    <div
                                      key={key}
                                      className="flex-1"
                                      style={{
                                        padding: "2px",
                                        borderRight:
                                          colIdx < columns.length - 1
                                            ? "1px solid black"
                                            : "none",
                                      }}
                                    >
                                      <p
                                        className="text-black"
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {header}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Table Rows (spill) */}
                                <div className="mr-2 ml-2 border-l border-r border-b border-black">
                                  {firstRows.map((c, i) => (
                                    <div key={i} className="flex">
                                      {columns.map(
                                        ({ key, render, align }, colIdx) => (
                                          <div
                                            key={key}
                                            className="flex-1"
                                            style={{
                                              padding: "1px",
                                              borderRight:
                                                colIdx < columns.length - 1
                                                  ? "1px solid black"
                                                  : "none",
                                              textAlign: align,
                                            }}
                                          >
                                            <pre
                                              className="text-black"
                                              style={{ ...basePre }}
                                            >
                                              {render(c)}
                                            </pre>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                        </React.Fragment>
                      );
                    })}

                  {/* REMAINING GRID PAGES */}
                  {restChunks.map((rows, gi) => (
                    <React.Fragment key={`seaway-grid-${gi}`}>
                      <div
                        className="second-page bg-white mainPadding"
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Grid Header */}
                        <div className="flex border border-black mr-2 ml-2 text-center bg-gray-200">
                          {columns.map(({ key, header }, colIdx) => (
                            <div
                              key={key}
                              className="flex-1"
                              style={{
                                padding: "2px",
                                borderRight:
                                  colIdx < columns.length - 1
                                    ? "1px solid black"
                                    : "none",
                              }}
                            >
                              <p
                                className="text-black font-normal"
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "9px",
                                  textAlign: "center",
                                }}
                              >
                                {header}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Grid Rows */}
                        <div className="mr-2 ml-2 border-b border-black">
                          {rows.map((c, i) => (
                            <div
                              key={i}
                              className="flex border-l border-r border-black text-center"
                            >
                              {columns.map(({ key, render, align }, colIdx) => (
                                <div
                                  key={key}
                                  className="flex-1"
                                  style={{
                                    padding: "1px",
                                    borderRight:
                                      colIdx < columns.length - 1
                                        ? "1px solid black"
                                        : "none",
                                    textAlign: align,
                                  }}
                                >
                                  <pre
                                    className="text-black font-normal"
                                    style={{ ...basePre }}
                                  >
                                    {render(c)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            case "BL": {
              // --- utilities (inline) ---
              const splitLines = (txt) =>
                txt ? String(txt).split(/\r?\n/) : [];
              const chunkArray = (arr, size) => {
                if (!Array.isArray(arr) || size <= 0) return [];
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                  chunks.push(arr.slice(i, i + size)); // correct slice
                }
                return chunks;
              };
              const nonEmpty = (arr) =>
                (arr || []).filter((s) => String(s).trim().length > 0);

              // --- paging plan (same behavior as BL Draft) ---
              const LINES_PER_PAGE = 70;

              const jd = bldata || {};

              // Clean empty lines so blank strings don't create phantom pages
              const containerLines = nonEmpty(
                splitLines(jd.containerDetailsAttach)
              );
              const marksLines = nonEmpty(
                splitLines(jd.marksAndNosDetailsAttach)
              );
              const goodsLines = nonEmpty(
                splitLines(jd.goodsDescDetailsAttach)
              );

              const cChunks = chunkArray(containerLines, LINES_PER_PAGE);
              const mChunks = chunkArray(marksLines, LINES_PER_PAGE);
              const gChunks = chunkArray(goodsLines, LINES_PER_PAGE);

              // GRID should begin from container #3 on attach sheets (skip first two printed on main page)
              const gridSrc = jd.tblBlContainer || jd.tblblContainer || [];
              const allGridRows = Array.isArray(gridSrc) ? gridSrc : [];
              const attachStartIndex = 2; // skip 0 & 1 -> start at #3
              const attachRows = allGridRows.slice(attachStartIndex);
              const hasGrid = attachRows.length > 0;

              // Base pages from text attachments
              const baseAttachPages = Math.max(
                cChunks.length,
                mChunks.length,
                gChunks.length,
                0
              );

              // If no text attachments but we DO have grid rows, still create ONE attach page
              const attachPages =
                baseAttachPages > 0 ? baseAttachPages : hasGrid ? 1 : 0;
              const includeAttachments = attachPages > 0;

              // Used lines on last text-attachment page (0 if we only created a page for grid spill)
              let usedOnLast = 0;
              if (baseAttachPages > 0) {
                const last = baseAttachPages - 1;
                usedOnLast = Math.max(
                  (cChunks[last] || []).length,
                  (mChunks[last] || []).length,
                  (gChunks[last] || []).length
                );
              }

              // If there ARE attachments, we spill leftover grid rows onto the LAST attachment page.
              // If there are NO attachments, we don't "reserve" spill space — start grid directly.
              const firstGridCap = includeAttachments
                ? Math.max(0, LINES_PER_PAGE - usedOnLast)
                : 0;
              const firstRows = includeAttachments
                ? attachRows.slice(0, firstGridCap)
                : [];
              const restRows = includeAttachments
                ? attachRows.slice(firstGridCap)
                : attachRows;
              const restChunks = chunkArray(restRows, LINES_PER_PAGE);

              const basePre = {
                fontSize: "8px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                margin: 0,
              };

              // Your grid columns
              const columns = [
                {
                  key: "cno",
                  header: "Tank NOS.",
                  render: (c) => c.containerNumber,
                  align: "left",
                },
                {
                  key: "size",
                  header: "TYPE",
                  render: (c) => `${c.sizeType || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "seal",
                  header: "C. SEAL NO",
                  render: (c) => `${c.customSealNo || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "gw",
                  header: "S. SEAL NO",
                  render: (c) => `${c.agentSealNo || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "nw",
                  header: "NT. WT",
                  render: (c) => c.netWt || "",
                  align: "right",
                },
                {
                  key: "tare",
                  header: "Tare Weight",
                  render: (c) => `${c.tareWt || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "grw",
                  header: "GR. WT",
                  render: (c) => `${c.grossWtAndUnit || ""}`.trim(),
                  align: "right",
                },
              ];

              return (
                // ⬇️ single wrapper so ref captures EVERYTHING (main + attachments + grid pages)
                <div
                  key={index}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  data-report={`seaway-${index}`}
                  style={{ width: "210mm", margin: "auto" }}
                  className="mt-5"
                >
                  {/* Print-only rules so first and following pages break correctly */}
                  <style jsx global>{`
                    @media print {
                      .first-page {
                        page-break-after: always;
                      }
                      .second-page {
                        page-break-before: always;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {/* MAIN (Seaway BL) PAGE */}
                  <div
                    className={
                      index < reportIds.length - 1
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
                    }}
                  >
                    <div
                      className="first-page"
                      style={{
                        flex: 1,
                        width: "100%",
                        boxSizing: "border-box",
                        fontFamily: "Arial, sans-serif",
                      }}
                    >
                      {VAARIDHILOGISTICSDRAFT()}
                    </div>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />

                  {/* ATTACHMENT PAGES (render if text lines exist OR tblBlContainer has rows) */}
                  {includeAttachments &&
                    Array.from({ length: attachPages }).map((_, p) => {
                      // Only show this page if it has ANY lines OR it's the last page and we have spill rows
                      const pageHasLines =
                        (cChunks[p]?.length || 0) +
                          (mChunks[p]?.length || 0) +
                          (gChunks[p]?.length || 0) >
                        0;
                      const showThisPage =
                        pageHasLines ||
                        (p === attachPages - 1 && firstRows.length > 0);
                      if (!showThisPage) return null;

                      return (
                        <React.Fragment key={`seaway-att-${p}`}>
                          <div
                            className={
                              p === 0
                                ? "second-page bg-white mainPadding"
                                : "bg-white mainPadding"
                            }
                            style={{
                              width: "210mm",
                              height: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              display: "flex",
                              flexDirection: "column",
                            }}
                          >
                            <BlAttachmentPrint
                              bldata={bldata}
                              containerLines={cChunks[p] || []}
                              marksLines={mChunks[p] || []}
                              goodsLines={gChunks[p] || []}
                            />

                            {/* Spill first grid rows only on the last attachment page */}
                            {p === attachPages - 1 && firstRows.length > 0 && (
                              <>
                                {/* Table Header */}
                                <div className="flex border-b border-l border-r border-black mr-2 ml-2 text-center bg-gray-200">
                                  {columns.map(({ key, header }, colIdx) => (
                                    <div
                                      key={key}
                                      className="flex-1"
                                      style={{
                                        padding: "2px",
                                        borderRight:
                                          colIdx < columns.length - 1
                                            ? "1px solid black"
                                            : "none",
                                      }}
                                    >
                                      <p
                                        className="text-black"
                                        style={{
                                          fontWeight: "bold",
                                          fontSize: "9px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {header}
                                      </p>
                                    </div>
                                  ))}
                                </div>

                                {/* Table Rows (spill) */}
                                <div className="mr-2 ml-2 border-l border-r border-b border-black">
                                  {firstRows.map((c, i) => (
                                    <div key={i} className="flex">
                                      {columns.map(
                                        ({ key, render, align }, colIdx) => (
                                          <div
                                            key={key}
                                            className="flex-1"
                                            style={{
                                              padding: "1px",
                                              borderRight:
                                                colIdx < columns.length - 1
                                                  ? "1px solid black"
                                                  : "none",
                                              textAlign: align,
                                            }}
                                          >
                                            <pre
                                              className="text-black"
                                              style={{ ...basePre }}
                                            >
                                              {render(c)}
                                            </pre>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                        </React.Fragment>
                      );
                    })}

                  {/* REMAINING GRID PAGES */}
                  {restChunks.map((rows, gi) => (
                    <React.Fragment key={`seaway-grid-${gi}`}>
                      <div
                        className="second-page bg-white mainPadding"
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Grid Header */}
                        <div className="flex border border-black mr-2 ml-2 text-center bg-gray-200">
                          {columns.map(({ key, header }, colIdx) => (
                            <div
                              key={key}
                              className="flex-1"
                              style={{
                                padding: "2px",
                                borderRight:
                                  colIdx < columns.length - 1
                                    ? "1px solid black"
                                    : "none",
                              }}
                            >
                              <p
                                className="text-black font-normal"
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "9px",
                                  textAlign: "center",
                                }}
                              >
                                {header}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Grid Rows */}
                        <div className="mr-2 ml-2 border-b border-black">
                          {rows.map((c, i) => (
                            <div
                              key={i}
                              className="flex border-l border-r border-black text-center"
                            >
                              {columns.map(({ key, render, align }, colIdx) => (
                                <div
                                  key={key}
                                  className="flex-1"
                                  style={{
                                    padding: "1px",
                                    borderRight:
                                      colIdx < columns.length - 1
                                        ? "1px solid black"
                                        : "none",
                                    textAlign: align,
                                  }}
                                >
                                  <pre
                                    className="text-black font-normal"
                                    style={{ ...basePre }}
                                  >
                                    {render(c)}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-gray-300 h-2 no-print" />
                    </React.Fragment>
                  ))}
                </div>
              );
            }
            // ✅ inside your case "YMSBL" return: show attachment ONLY if tblBlContainer has data
            case "YMSBL": {
              const containers = Array.isArray(bldata?.tblBlContainer)
                ? bldata.tblBlContainer
                : [];
              const PER_PAGE = 20;

              const pages = [];
              for (let i = 0; i < containers.length; i += PER_PAGE) {
                pages.push(containers.slice(i, i + PER_PAGE));
              }
              const totalPages = pages.length;

              return (
                // ✅ SINGLE WRAPPER REF — captures main + all attachment pages
                <div
                  key={index}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  data-report={`seaway-${index}`}
                  style={{ width: "210mm", margin: "auto" }}
                  className="mt-5"
                >
                  <style jsx global>{`
                    @media print {
                      .page {
                        page-break-after: always;
                      }
                      .page:last-child {
                        page-break-after: auto;
                      }
                      .no-print {
                        display: none !important;
                      }
                    }
                  `}</style>

                  {/* ================= MAIN PAGE ================= */}
                  <div
                    className="page bg-white"
                    style={{
                      width: "210mm",
                      minHeight: "297mm", // ✅ use minHeight (avoid hiding content)
                      boxSizing: "border-box",
                      padding: "5mm",
                      fontFamily: "Arial, sans-serif",
                    }}
                  >
                    {YMSBL()}
                  </div>

                  {/* ✅ show attachments only when data exists */}
                  {containers.length > 0 && (
                    <>
                      <div className="bg-gray-300 h-2 no-print" />

                      {pages.map((pageRows, pageIdx) => (
                        <div
                          key={pageIdx}
                          className="page bg-white text-black"
                          style={{
                            width: "210mm",
                            minHeight: "297mm", // ✅ minHeight not fixed height
                            boxSizing: "border-box",
                            padding: "5mm",
                            fontFamily: "Arial, sans-serif",
                          }}
                        >
                          <YMSBLAttachMent
                            tblBlContainer={pageRows}
                            pageNo={pageIdx + 1}
                            totalPages={totalPages}
                          />
                        </div>
                      ))}
                    </>
                  )}
                </div>
              );
            }

            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}

//Abhi
export default rptAirwayBill;
