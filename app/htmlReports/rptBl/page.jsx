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
                  src="https://expresswayshipping.com/sql-api/uploads/1752843752950-03_SAR%20Logo%20PNG.png"
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
                src="https://expresswayshipping.com/sql-api/uploads/SARSign.png"
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
          SEAWAY BILL OF LADING
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
                  src="https://expresswayshipping.com/sql-api/uploads/1752843752950-03_SAR%20Logo%20PNG.png"
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
                src="https://expresswayshipping.com/sql-api/uploads/SARSign.png"
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
              {bldata?.polVessel || ""}
            </p>
          </div>
          <div className="flex-1 uppercase border-l border-black">
            <p
              className="pt-1 pb-1 pl-1 !text-black"
              style={{ fontSize: "9px" }}
            >
              {bldata?.polVoyage || ""}
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
