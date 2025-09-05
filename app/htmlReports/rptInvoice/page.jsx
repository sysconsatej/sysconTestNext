"use client";
/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import numberToWords from "@/helper/numberToWords";
import decodeJWT from "@/helper/decodeJWT";
import { generateQRCodeDataUrl } from "@/helper/setQRCodeAsImage";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import { useSearchParams } from "next/navigation";
import "./rptInvoice.css";
import {
  fetchDataAPI,
  reportTheme,
} from "@/services/auth/FormControl.services";
import { decrypt } from "@/helper/security";
import "jspdf-autotable"; // Import AutoTable plugin
import Print from "@/components/Print/page";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { applyTheme } from "@/utils";
import "@/public/style/reportTheme.css";

const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
function rptInvoice() {
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState([]);
  const [charge, setCharge] = useState([]);
  const [chargeAtt, setChargeAtt] = useState([]);
  const [hsnSac, setHsnSac] = useState([]);
  const [CompanyHeader, setCompanyHeader] = useState("");
  const hsnGridRef = useRef(null);
  const [chargeGridHeight, setChargeGridHeight] = useState("245px");
  const hsnGridHeight = 150;
  const [ImageUrl, setImageUrl] = useState("");
  const enquiryModuleRefs = useRef([]);
  const [html2pdf, setHtml2pdf] = useState(null);
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0"); // Ensures two digits for the day
  const month = date.toLocaleString("en-US", { month: "short" }); // Gets short month name
  const year = date.getFullYear();
  const itemsPerPage = 10;
  const hsnSacItemPerPage = 5;
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [htmlContents, setHtmlContents] = useState({});
  const [printName, setPrintName] = useState([]);

  const convertNumberToWords = (num) => {
    // Simple placeholder — replace with your own INR number-to-words logic if needed
    return Number(num).toLocaleString("en-IN");
  };
  const collectHtmlFromIds = (ids) => {
    const collectedHtml = {};
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        collectedHtml[id] = element.outerHTML;
      }
    });
    setHtmlContents(collectedHtml);
  };

  useEffect(() => {
    if (reportIds.length > 0) {
      const cleanedIds = reportIds.map((name) => name.replace(/\s+/g, ""));

      // Delay to ensure DOM is painted
      setTimeout(() => collectHtmlFromIds(cleanedIds), 100);
    }
  }, [reportIds]);

  const formatDateToDDMMYYYY = (inputDate) => {
    if (!inputDate) return ""; // handles null, undefined, empty string

    const date = new Date(inputDate);
    if (isNaN(date)) return ""; // handles invalid dates

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

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

  useEffect(() => {
    const loadHtml2pdf = async () => {
      const module = await import("html2pdf.js");
      setHtml2pdf(() => module.default);
    };

    loadHtml2pdf();
  }, []);

  useEffect(() => {
    if (hsnGridRef.current) {
      const height = hsnGridRef.current.offsetHeight;
      const totalRowHeight = 28; // adjust as needed
      setChargeGridHeight(`${height + totalRowHeight}px`);
    }
  }, [hsnSac]);

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

          applyTheme(enquiryModuleRefs.current);

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

  function splitIntoChunksWithExtraArray(array, chunkSize) {
    let result = [];

    // Check if the array has one chunk with more than 4 or fewer than 10 elements
    if (array.length > 0 && array.length > 4 && array.length < 10) {
      // Add an empty array if the condition is satisfied
      result.push(array);
      result.push([]); // Add an empty array at the end
    } else {
      // Regular chunking
      for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
      }
    }

    return result;
  }
  function splitIntoChunks(array, chunkSize) {
    let result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      result.push(chunk);
    }
    return result;
  }
  useEffect(() => {
    const fetchdata = async () => {
      const id = searchParams.get("recordId");
      const reportId = searchParams.get("reportId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const requestBody = {
            invoiceId: id,
            reportId: reportId,
          };
          console.log("Request Body", requestBody);
          const response = await fetch(`${baseUrl}/Sql/api/Reports/invoice`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": JSON.parse(token),
            },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) throw new Error("Failed to fetch job data");
          const data = await response.json();
          setData(data.data);
          const storedReportIds = sessionStorage.getItem("selectedReportIds");
          let reportNames = null;
          if (storedReportIds) {
            reportNames = JSON.parse(storedReportIds);
            reportNames = Array.isArray(reportIds) ? reportIds : [reportIds];
          } else {
            console.log("No Report IDs found in sessionStorage");
          }
          if (
            reportNames[0] === "Tax Invoice" ||
            reportNames[0] === "Proforma Invoice" ||
            reportNames[0] === "Invoice Print" ||
            reportNames[0] === "Sundry Invoice Print" ||
            reportNames[0] === "Sub Lease Invoice Print" ||
            reportNames[0] === "Sales Invoice Container wise"
          ) {
            const result = splitIntoChunksWithExtraArray(
              data.data[0]?.tblInvoiceCharge,
              itemsPerPage
            );
            console.log("Data received:", result);
            setCharge(result);

            const allInvoiceDetails = data.data[0]?.tblInvoiceCharge?.flatMap(
              (charge) => charge.tblInvoiceChargeDetails || []
            );
            const resultAtt = splitIntoChunksWithExtraArray(
              allInvoiceDetails,
              itemsPerPage
            );
            console.log("Data received Abhi:", resultAtt);

            setChargeAtt(resultAtt);
            const allTaxes = [];
            const uniqueSacList = [];
            const uniqueHsnList = [];
            // Step 1: Collect all tax and unique codes
            data.data[0]?.tblInvoiceCharge?.forEach((charge) => {
              if (Array.isArray(charge.tblInvoiceChargeTax)) {
                charge.tblInvoiceChargeTax.forEach((tax) => {
                  allTaxes.push(tax);
                });
              }
              if (charge.sac) uniqueSacList.push(charge.sac);
              if (charge.hsn) uniqueHsnList.push(charge.hsn);
            });

            const dedupedSacList = [...new Set(uniqueSacList)];
            const dedupedHsnList = [...new Set(uniqueHsnList)];
            const charges = data.data[0]?.tblInvoiceCharge || [];

            // Step 2: Calculate for SAC
            const sacSummary = dedupedSacList.map((sac) => {
              const matchingRecords = charges.filter(
                (charge) => charge.sac === sac
              );

              let CGST = 0;
              let SGST = 0;
              let IGST = 0;
              let taxableAmount = 0;

              matchingRecords.forEach((charge) => {
                taxableAmount += Number(charge.taxableAmount) || 0;

                if (Array.isArray(charge.tblInvoiceChargeTax)) {
                  charge.tblInvoiceChargeTax.forEach((tax) => {
                    const amount = Number(tax.taxAmountHc) || 0;

                    switch (tax.taxCode) {
                      case "CGST":
                        CGST += amount;
                        break;
                      case "SGST":
                        SGST += amount;
                        break;
                      case "IGST":
                        IGST += amount;
                        break;
                    }
                  });
                }
              });

              return {
                sac,
                hsn: null,
                CGST,
                SGST,
                IGST,
                taxableAmount,
              };
            });

            // Step 3: Calculate for HSN
            const hsnSummary = dedupedHsnList.map((hsn) => {
              const matchingRecords = charges.filter(
                (charge) => charge.hsn === hsn
              );

              let CGST = 0;
              let SGST = 0;
              let IGST = 0;
              let taxableAmount = 0;

              matchingRecords.forEach((charge) => {
                taxableAmount += Number(charge.taxableAmount) || 0;

                if (Array.isArray(charge.tblInvoiceChargeTax)) {
                  charge.tblInvoiceChargeTax.forEach((tax) => {
                    const amount = Number(tax.taxAmountHc) || 0;

                    switch (tax.taxCode) {
                      case "CGST":
                        CGST += amount;
                        break;
                      case "SGST":
                        SGST += amount;
                        break;
                      case "IGST":
                        IGST += amount;
                        break;
                    }
                  });
                }
              });

              return {
                sac: null,
                hsn,
                CGST,
                SGST,
                IGST,
                taxableAmount,
              };
            });

            // Step 4: Combine both summaries
            const combinedSummary = [...sacSummary, ...hsnSummary];
            if (combinedSummary.length > 0) {
              const hsnSacResult = splitIntoChunks(
                combinedSummary,
                hsnSacItemPerPage
              );
              setHsnSac(hsnSacResult);
            }
          }

          setCompanyHeader(data.data[0].brachId);
        } catch (error) {
          console.error("Error fetching job data:", error);
        }
      }
    };
    if (reportIds.length > 0) {
      fetchdata();
    }
  }, [reportIds]);

  useEffect(() => {
    const fetchHeader = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const BranchId = userData[0].defaultBranchId;
        const clientCode = userData[0].clientCode;
        const requestBody = {
          tableName: "tblCompanyBranchParameter",
          whereCondition: {
            status: 1,
            companyBranchId: BranchId,
            clientCode: clientCode,
          },
          projection: {
            tblCompanyBranchParameterDetails: 1,
          },
        };
        try {
          const dataURl = await fetchDataAPI(requestBody);
          const response = dataURl.data;
          if (
            response &&
            response.length > 0 &&
            response[0].tblCompanyBranchParameterDetails.length > 0
          ) {
            const headerUrl =
              response[0].tblCompanyBranchParameterDetails[0].header;
            setImageUrl(headerUrl);
          } else {
            console.error("No valid data received");
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      }
    };
    fetchHeader();
  }, [CompanyHeader]);

  const CompanyImgModule = ({ data }) => {
    const token = data[0]?.signedQrCode; // Get the QR code token from the data
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState(""); // State to hold QR code data URL

    useEffect(() => {
      const generateQRCode = async () => {
        // Ensure token exists before generating QR code
        if (token) {
          try {
            const dataUrl = await generateQRCodeDataUrl(token);
            setQrCodeDataUrl(dataUrl);
          } catch (error) {
            console.error("Error generating QR code:", error);
          }
        }
      };

      generateQRCode(); // Call the function to generate the QR code
    }, [token]); // Re-run the effect when the token changes

    return (
      <div className="flex border-t border-l border-r border-black p-6 w-full">
        {/* 70% left side */}
        <div className="w-[85%] flex items-center">
          <img
            src={`${baseUrlNext}${ImageUrl}`}
            alt="LOGO"
            className="w-full my-auto"
            style={{ maxHeight: "130px", width: "100%" }}
          />
        </div>

        <div className="w-[15%] flex justify-end items-start">
          {qrCodeDataUrl ? (
            <img src={qrCodeDataUrl} alt="QR Code" height={350} width={350} />
          ) : (
            <p className="text-xs"></p>
          )}
        </div>
      </div>
    );
  };
  const CompanyImgModuleInvoicePrint = ({ data }) => {
    return (
      <div className="flex border-t border-l border-r border-black w-full p-0.5">
        {/* 70% left side */}
        <div className="w-[100%] flex items-center">
          <img
            src={`${baseUrlNext}${ImageUrl}`}
            alt="LOGO"
            className="w-full my-auto"
            style={{ minHeight: "90px", maxHeight: "90px", width: "100%" }}
          />
        </div>
      </div>
    );
  };
  const CompanyImgModuleInvoice = ({ data }) => {
    return (
      <div className="flex w-full p-0.5 border-t border-l border-r border-black">
        {/* 70% left side */}
        <div
          className="w-[100%] flex items-center"
          style={{ minHeight: "110px", maxHeight: "110px", width: "100%" }}
        >
          <img
            src={`${baseUrlNext}${ImageUrl}`}
            alt="LOGO"
            style={{ minHeight: "110px", maxHeight: "110px", width: "100%" }}
          />
        </div>
      </div>
    );
  };
  const TaxInvoiceHeader = ({ data }) => {
    console.log("TaxInvoiceHeader", data);
    console.log("reportIds", reportIds[0]);
    return (
      <div className="border-l border-r border-b border-black">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
        <div className="flex justify-between w-full p-2">
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">CIN No.:</span>{" "}
              {data[0]?.ownCinNo || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State:</span>{" "}
              {data[0]?.ownState || ""}
            </p>
          </div>
          <div style={{ width: "15%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State Code:</span>{" "}
              {data[0]?.ownStateCode || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">GSTIN:</span>{" "}
              {data[0]?.ownGstin || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">PAN No:</span>{" "}
              {data[0]?.partyPanNo || ""}
            </p>
          </div>
        </div>
        <div className="border-t border-black">
          <div className="flex">
            <div style={{ width: "60%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">IRN : </span>
                {data[0]?.irn || ""}
              </p>
            </div>
            <div style={{ width: "40%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}>
                <span className="font-bold">Ack No. / Ack Date : </span>
                {/* {data[0]?.irn || ""} */}
                {data[0]?.ackNo || ""} <span className="font-bold"> / </span>
                {formatDateToDDMMYYYY(data[0]?.ackDate) || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const ProformaInvoiceHeader = ({ data }) => {
    return (
      <div className="border-l border-r border-b border-black">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
        <div className="flex justify-between w-full p-2">
          <div style={{ width: "25%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">CIN No.:</span>{" "}
              {data[0]?.ownCinNo || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State:</span>{" "}
              {data[0]?.ownState || ""}
            </p>
          </div>
          <div style={{ width: "15%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">State Code:</span>{" "}
              {data[0]?.ownStateCode || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">GSTIN:</span>{" "}
              {data[0]?.ownGstin || ""}
            </p>
          </div>
          <div style={{ width: "20%" }}>
            <p style={{ fontSize: "9px" }}>
              <span className="font-bold">PAN No:</span>{" "}
              {data[0]?.partyPanNo || ""}
            </p>
          </div>
        </div>
        <div className="border-t border-black">
          <div className="flex">
            <div style={{ width: "60%" }}></div>
            <div style={{ width: "40%" }}>
              <p className="pl-2 pt-1 pb-1" style={{ fontSize: "9px" }}></p>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const InvoicePrintHeader = ({ data }) => {
    console.log("TaxInvoiceHeader", data);
    console.log("reportIds", reportIds[0]);
    setPrintName(data[0]?.invoiceNo);
    return (
      <div className="border-l border-r border-b border-black pt-1 pb-1">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
      </div>
    );
  };
  const SundryInvoicePrintHeader = ({ data }) => {
    console.log("TaxInvoiceHeader", data);
    console.log("reportIds", reportIds[0]);
    return (
      <div className="border-l border-r border-b border-black pt-1 pb-1">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
      </div>
    );
  };
  const SubLeaseInvoicePrintHeader = ({ data }) => {
    console.log("TaxInvoiceHeader", data);
    console.log("reportIds", reportIds[0]);
    return (
      <div className="border-l border-r border-b border-black pt-1 pb-1">
        <div className="flex flex-grow w-full justify-center items-center">
          <h1 className="text-black font-bold text-sm">
            {data[0]?.invoiceHeading || ""}
          </h1>
        </div>
      </div>
    );
  };
  const TaxInvoiceBillingDetails = ({ data }) => {
    return (
      <div className="flex border-r border-l border-b border-black p-2">
        <div style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Billing Party Name :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.party || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Address :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.billingPartyAddress || ""}</p>
          </div>
        </div>
        <div
          className="ps-2 pt-1 pb-2"
          style={{ fontSize: "9px", width: "24%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              PAN No. :{" "}
            </p>
            <p style={{ width: "65%" }}>{data[0]?.ownPanNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              State :{" "}
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyState || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              State Code :{" "}
            </p>
            <p style={{ width: "65%" }}>24</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "35%" }}>
              GSTIN :{" "}
            </p>
            <p style={{ width: "65%" }}>{data[0]?.partyGstin || ""}</p>
          </div>
        </div>
        <div
          className="ps-2 pt-1 pb-2"
          style={{ fontSize: "9px", width: "41%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice No. :{" "}
            </p>
            <p style={{ width: "70%" }}>{data[0]?.invoiceNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Invoice Date :{" "}
            </p>
            <p style={{ width: "70%" }}>
              {formatDateToDDMMYYYY(data[0]?.invoiceDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Credit Period :{" "}
            </p>
            <p style={{ width: "70%" }}>{data[0]?.creditPeriod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "30%" }}>
              Due Date :{" "}
            </p>
            <p style={{ width: "70%" }}>
              {formatDateToDDMMYYYY(data[0]?.dueDate) || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const InvoicePrintBillingDetails = ({ data }) => {
    return (
      <div>
        <div
          className="flex border-r border-l border-b border-black "
          style={{ minHeight: "90px", maxHeight: "90px" }}
        >
          <div
            className="p-2"
            style={{
              fontSize: "9px",
              width: "50%",
              borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                Invoice To :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.party || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                {" "}
              </p>
              <p style={{ width: "85%" }}>
                {data[0]?.billingPartyAddress || ""}
              </p>
            </div>
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.partyPanNo || ""}</p>
            </div>
          </div>
          <div className="p-1 " style={{ fontSize: "9px", width: "50%" }}>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice No. :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceNo || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceDate || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Due Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.dueDate || ""}</p>
            </div>
          </div>
        </div>
        <div>
          {/* <div
            className="p-1"
            style={{
              fontSize: "9px",
              width: "50%",
              // borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.ownPanNo || ""}</p>
            </div>
          </div> */}
          {/* <div
            className="p-1 flex w-full"
            style={{ fontSize: "9px", width: "50%" }}
          >
            <div
              className="flex w-full"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice No. :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceNo || ""}</p>
            </div>
            <div
              className="flex w-full"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice Date :{" "}
              </p>
              <p style={{ width: "65%" }}>
                {data[0]?.invoiceDate || ""}
              </p>
            </div>
          </div> */}
        </div>
      </div>
    );
  };
  const SundryInvoicePrintBillingDetails = ({ data }) => {
    return (
      <div>
        <div
          className="flex border-r border-l border-b border-black "
          style={{ minHeight: "90px", maxHeight: "90px" }}
        >
          <div
            className="p-2"
            style={{
              fontSize: "9px",
              width: "50%",
              borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                Invoice To :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.party || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                {" "}
              </p>
              <p style={{ width: "85%" }}>
                {data[0]?.billingPartyAddress || ""}
              </p>
            </div>
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.partyPanNo || ""}</p>
            </div>
          </div>
          <div className="p-1 " style={{ fontSize: "9px", width: "50%" }}>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice No. :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceNo || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Invoice Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.invoiceDate || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Due Date :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.dueDate || ""}</p>
            </div>
            <div
              className="flex w-full pb-1"
              style={{ fontSize: "9px", width: "50%" }}
            >
              <p className="font-bold" style={{ width: "35%" }}>
                Job No. :{" "}
              </p>
              <p style={{ width: "65%" }}>{data[0]?.jobNo || ""}</p>
            </div>
          </div>
        </div>
        <div
          className=" border-r border-l border-b border-black pl-2 pt-1 "
          style={{ minHeight: "45px", maxHeight: "45px" }}
        >
          <div className="flex w-full pb-1">
            <p className="font-bold" style={{ fontSize: "9px ", width: "10%" }}>
              Remarks :
            </p>
            <p style={{ fontSize: "9px ", width: "90%" }}>
              {data[0]?.remarks || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const SubLeaseInvoicePrintBillingDetails = ({ data }) => {
    return (
      <div>
        <div
          className="flex border-r border-l border-b border-black "
          style={{ minHeight: "80px", maxHeight: "80px" }}
        >
          <div
            className="p-2"
            style={{
              fontSize: "9px",
              width: "50%",
              borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                Invoice To :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.party || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                {" "}
              </p>
              <p style={{ width: "85%" }}>
                {data[0]?.billingPartyAddress || ""}
              </p>
            </div>
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.partyPanNo || ""}</p>
            </div>
          </div>
          <div className="p-1 " style={{ fontSize: "9px", width: "50%" }}>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  Invoice No. :{" "}
                </p>
                <p style={{ width: "70%" }}>{data[0]?.invoiceNo || ""}</p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.invoiceDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  Job No. :{" "}
                </p>
                <p style={{ width: "70%" }}>{data[0]?.jobNo || ""}</p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  Due Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.dueDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  From Location :{" "}
                </p>
                <p style={{ width: "70%" }}>{data[0]?.pol || ""}</p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  From Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.fromDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  To Location :{" "}
                </p>
                <p style={{ width: "70%" }}>{data[0]?.fpd || ""}</p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  To Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.toDate || ""}</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className=" border-r border-l border-b border-black pl-2 pt-1 "
          style={{ minHeight: "45px", maxHeight: "45px" }}
        >
          <div className="flex w-full pb-1">
            <p className="font-bold" style={{ fontSize: "9px ", width: "10%" }}>
              Remarks :
            </p>
            <p style={{ fontSize: "9px ", width: "90%" }}>
              {data[0]?.remarks || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const SalesInvoiceContainerWiseBillingDetails = ({ data }) => {
    return (
      <div>
        <div
          className="flex border-r border-l border-b border-black "
          style={{ minHeight: "80px", maxHeight: "80px" }}
        >
          <div
            className="p-2"
            style={{
              fontSize: "9px",
              width: "50%",
              borderRight: "1px solid black",
            }}
          >
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                Invoice To :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.party || ""}</p>
            </div>
            <div className="flex pt-1 w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                {" "}
              </p>
              <p style={{ width: "85%" }}>
                {data[0]?.billingPartyAddress || ""}
              </p>
            </div>
            <div className="flex w-full">
              <p className="font-bold" style={{ width: "15%" }}>
                TAX No. :{" "}
              </p>
              <p style={{ width: "85%" }}>{data[0]?.partyPanNo || ""}</p>
            </div>
          </div>
          <div className="p-1 " style={{ fontSize: "9px", width: "50%" }}>
            <div className="flex w-full pb-1">
              <div className="flex w-full" style={{ width: "65%" }}>
                <p className="font-bold" style={{ width: "30%" }}>
                  Invoice No. :{" "}
                </p>
                <p style={{ width: "70%" }}>{data[0]?.invoiceNo || ""}</p>
              </div>
              <div className="flex w-full" style={{ width: "35%" }}>
                <p className="font-bold" style={{ width: "45%" }}>
                  Date :{" "}
                </p>
                <p style={{ width: "55%" }}>{data[0]?.invoiceDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full">
                <p className="font-bold" style={{ width: "20%" }}>
                  Due Date :{" "}
                </p>
                <p style={{ width: "80%" }}>{data[0]?.dueDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full">
                <p className="font-bold" style={{ width: "20%" }}>
                  From Date :{" "}
                </p>
                <p style={{ width: "80%" }}>{data[0]?.fromDate || ""}</p>
              </div>
            </div>
            <div className="flex w-full pb-1">
              <div className="flex w-full">
                <p className="font-bold" style={{ width: "20%" }}>
                  To Date :{" "}
                </p>
                <p style={{ width: "80%" }}>{data[0]?.toDate || ""}</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className=" border-r border-l border-b border-black pl-2 pt-1 "
          style={{ minHeight: "45px", maxHeight: "45px" }}
        >
          <div className="flex w-full pb-1">
            <p className="font-bold" style={{ fontSize: "9px ", width: "10%" }}>
              Remarks :
            </p>
            <p style={{ fontSize: "9px ", width: "90%" }}>
              {data[0]?.remarks || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  const TaxInvoiceJobDetails = ({ data }) => {
    return (
      <div className="flex border-r border-l border-b border-black">
        <div className="p-2" style={{ fontSize: "9px", width: "38%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Job No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.jobNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              MB/L No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.mblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              HB/L No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.hblNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Vessel/Voy :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.vessel || ""} / {data[0]?.voyageNo || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POL :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.pol || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              POD :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.pod || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipment Terms :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.tradeTerms || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Place Of Supply :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.placeOfSupply || ""}</p>
          </div>
        </div>
        <div
          className="border-r border-black p-2"
          style={{ fontSize: "9px", width: "22%" }}
        >
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.jobDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.mblDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {formatDateToDDMMYYYY(data[0]?.hblDate) || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Date :{" "}
            </p>
            <p style={{ width: "60%" }}></p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              PLR :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.plr || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              FPD :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.fpd || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Size Type :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.size || ""}/{data[0]?.typeCode || ""}{" "}
            </p>
          </div>
        </div>
        <div className="p-2" style={{ fontSize: "9px", width: "40%" }}>
          <div className="flex w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipper. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.shipper || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Consignee :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.consignee || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Cargo Type :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.cargoType || ""}
              {" / "}
              {data[0]?.containerStatus || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Commodity :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.commodity || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Cargo Weight :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.cargoWeight || ""} {data[0]?.wtUnitName || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              No. of Pkg :{" "}
            </p>
            <p style={{ width: "60%" }}>
              {data[0]?.noOfPackages || ""} {data[0]?.packagingTypeCode || ""}
            </p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Shipper Ref.No. :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.shipperRefNo || ""}</p>
          </div>
          <div className="flex pt-1 w-full">
            <p className="font-bold" style={{ width: "40%" }}>
              Ex. Rate :{" "}
            </p>
            <p style={{ width: "60%" }}>{data[0]?.exchangeRate || ""}</p>
          </div>
        </div>
      </div>
    );
  };
  const InvoicePrintJobDetails = ({ data }) => {
    return (
      <div className="border-r border-l border-b border-black">
        <div className="flex w-full border-b border-black">
          <div className="flex w-full border-r border-black">
            <div className="p-2" style={{ fontSize: "9px ", width: "100%" }}>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  MBL No. :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.mblNo || ""}</p>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  HBL No. :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.hblNo || ""}</p>
              </div>
              <div className="flex w-full pb-1">
                <div className="flex w-full" style={{ width: "70%" }}>
                  <p className="font-bold" style={{ width: "35%" }}>
                    Vessel / Voy :{" "}
                  </p>
                  <p style={{ width: "65%" }}>
                    {data[0]?.vessel || ""} / {data[0]?.voyageNo || ""}
                  </p>
                </div>
                <div className="flex w-full" style={{ width: "30%" }}>
                  <p className="font-bold" style={{ width: "30%" }}>
                    Date :{" "}
                  </p>
                  <p style={{ width: "70%" }}>{data[0]?.sailDate || ""}</p>
                </div>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  Port of Loading :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.pol || ""}</p>
              </div>
            </div>
          </div>
          <div className="flex w-full ">
            <div className="p-2" style={{ fontSize: "9px ", width: "100%" }}>
              <div className="flex w-full pb-1">
                <div className="flex w-full" style={{ width: "60%" }}>
                  <p className="font-bold" style={{ width: "42%" }}>
                    Job No. :{" "}
                  </p>
                  <p style={{ width: "58%" }}>{data[0]?.jobNo || ""}</p>
                </div>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  Port of Discharge :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.pod || ""}</p>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  Destination Port :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.fpd || ""}</p>
              </div>
              <div className="flex w-full pb-1">
                <p className="font-bold" style={{ width: "25%" }}>
                  Commodity :{" "}
                </p>
                <p style={{ width: "75%" }}>{data[0]?.commodity || ""}</p>
              </div>
            </div>
          </div>
        </div>
        <div className=" pl-2 pt-1 -b-1">
          <div className="flex w-full pb-1">
            <p className="font-bold" style={{ fontSize: "9px ", width: "10%" }}>
              Remarks :
            </p>
            <p style={{ fontSize: "9px ", width: "90%" }}>
              {data[0]?.remarks || ""}
            </p>
          </div>
        </div>
      </div>
    );
  };
  console.log("data", data);
  const TaxInvoiceChargeDetails = ({ data, charge, index, hsnSac }) => {
    let totalAmount = 0;
    charge.forEach((group) => {
      group.forEach((item) => {
        if (!isNaN(item.totalAmount) && item.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });
    //const totalAmountInWords = toWords(parseFloat(data[0]?.invoiceAmount) || 0);
    // const totalAmountInWords = numberToWords(
    //   parseFloat(data[0]?.invoiceAmount),
    //   data[0]?.currency
    // );

    const gridTotal = data[0]?.tblInvoiceCharge?.reduce((acc, curr) => {
      const qty = Number(curr.qty || 0);
      const rate = Number(curr.rate || 0);
      const exchangeRate = Number(curr.exchangeRate || 1);
      const tax = Number(curr.IGST || curr.CGST || curr.SGST || 0);

      const rowTotal = qty * rate * exchangeRate + tax;
      return acc + rowTotal;
    }, 0);

    const totalAmountInWords = numberToWords(parseFloat(gridTotal), "INR");

    // Calculate the number of charges on the current page
    const currentPageLength = charge[index]?.length || 0;
    const nextPageLength = charge[index + 1]?.length || 0;
    const lastPageIndex = charge.length - 1;

    const totalPages = charge.length;
    // Determine if it's the last page
    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    // Condition to check if there is only one page
    const isSinglePage = charge.length === 1;

    // Adjust the charge grid height based on whether it's a single page or not
    const chargeGridHeight = isSinglePage ? "115px" : "260px"; // Set to 100px for a single page, otherwise keep it 245px.

    // Show the second grid only if it's the last page or if more than 4 charges exist
    const showHsnGrid =
      isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {/* First Grid: Charge Details */}

        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="p-1 border-r border-black" style={{ width: "30%" }}>
              DESCRIPTION
            </p>
            <p className="p-1 border-r border-black" style={{ width: "13%" }}>
              HSN / SAC Code
            </p>
            <p className="p-1 border-r border-black" style={{ width: "4%" }}>
              Qty
            </p>
            <p className="p-1 border-r border-black" style={{ width: "6%" }}>
              Rate
            </p>
            <p className="p-1 border-r border-black" style={{ width: "4%" }}>
              Curr
            </p>
            <p className="p-1 border-r border-black" style={{ width: "7%" }}>
              Ex. Rate
            </p>
            <p className="p-1 border-r border-black" style={{ width: "7%" }}>
              Taxable Amount
            </p>
            <p className="p-1 border-r border-black" style={{ width: "7%" }}>
              Tax Rate
            </p>
            <p className="p-1 border-r border-black" style={{ width: "5%" }}>
              IGST
            </p>
            <p className="p-1 border-r border-black" style={{ width: "5%" }}>
              CGST
            </p>
            <p className="p-1 border-r border-black" style={{ width: "5%" }}>
              SGST
            </p>
            <p className="p-1 text-center" style={{ width: "7%" }}>
              Amount in {data[0]?.currency || ""}
            </p>
          </div>
        )}
        {/* Charge Grid */}
        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l border-b"
            style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge[index]?.map((chargeData, idx, array) => (
              <div
                key={idx}
                className={`flex w-full ${
                  idx === array.length - 1 ? "border-b" : ""
                }`}
                style={{ fontSize: "9px", width: "100%" }}
              >
                <p
                  className="pb-1 pl-2 border-r border-black ps-1"
                  style={{ width: "30%" }}
                >
                  {chargeData?.description || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "13%" }}
                >
                  {chargeData?.hsn || ""} {chargeData?.sac || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "4%" }}
                >
                  {chargeData?.qty || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "6%" }}
                >
                  {chargeData?.rate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "4%" }}
                >
                  {chargeData?.chargeCurrency || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "7%" }}
                >
                  {chargeData?.exchangeRate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "7%" }}
                >
                  {chargeData?.taxableAmount || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "7%" }}
                >
                  {chargeData?.taxAmount || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "5%" }}
                >
                  {chargeData?.IGST || "0.00"}
                </p>
                <p
                  className="pb-1 border-r border-black text-center"
                  style={{ width: "5%" }}
                >
                  {chargeData?.CGST || "0.00"}
                </p>
                <p
                  className="pb-1 border-r border-black text-center"
                  style={{ width: "5%" }}
                >
                  {chargeData?.SGST || "0.00"}
                </p>
                <p className="pb-1 text-center" style={{ width: "7%" }}>
                  {(
                    Number(chargeData?.qty || 0) *
                      Number(chargeData?.rate || 0) *
                      Number(chargeData?.exchangeRate || 1) +
                    Number(
                      chargeData?.IGST ||
                        chargeData?.CGST ||
                        chargeData?.SGST ||
                        0
                    )
                  ).toFixed(2)}
                </p>
              </div>
            ))}

            {/* Final row - Amount in Words */}
            <div
              className="flex w-full border-t border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <p
                className="p-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data[0]?.currency || ""} {totalAmountInWords || ""} Only
              </p>
              <p className="p-1" style={{ width: "8%" }}>
                Total {data[0]?.currency || ""}
              </p>
              <p className="p-1" style={{ width: "7%" }}>
                {gridTotal?.toFixed(2)}
              </p>
            </div>
          </div>
        )}
        {/* Show HSN grid only if it's the last page and more than 4 charges */}
        {showHsnGrid && index === totalPages - 1 && (
          <div>
            <TaxInvoiceHsnSummaryGrid hsnSac={hsnSac} data={data} />
          </div>
        )}
      </>
    );
  };
  const InvoicePrintChargeDetails = ({ data, charge, index, hsnSac }) => {
    let totalAmount = 0;
    charge.forEach((group) => {
      group.forEach((item) => {
        if (!isNaN(item.totalAmount) && item.totalAmount !== null) {
          totalAmount += Number(item.totalAmount);
        }
      });
    });

    const gridTotal = data[0]?.tblInvoiceCharge?.reduce((acc, curr) => {
      const qty = Number(curr.qty || 0);
      const rate = Number(curr.rate || 0);
      const exchangeRate = Number(curr.exchangeRate || 1);
      const tax = Number(curr.IGST || curr.CGST || curr.SGST || 0);

      const rowTotal = qty * rate * exchangeRate + tax;
      return acc + rowTotal;
    }, 0);

    const totalAmountInWords = numberToWords(parseFloat(gridTotal), "INR");

    // Calculate the number of charges on the current page
    const currentPageLength = charge[index]?.length || 0;
    const nextPageLength = charge[index + 1]?.length || 0;
    const lastPageIndex = charge.length - 1;

    const totalPages = charge.length;
    // Determine if it's the last page
    const isLastPage =
      index === lastPageIndex ||
      (index === lastPageIndex - 1 && nextPageLength < 4);

    // Condition to check if there is only one page
    const isSinglePage = charge.length === 1;

    // Adjust the charge grid height based on whether it's a single page or not
    // const chargeGridHeight = isSinglePage ? "490px" : "490px"; // Set to 100px for a single page, otherwise keep it 245px.

    // // Show the second grid only if it's the last page or if more than 4 charges exist
    // const showHsnGrid =
    //   isLastPage || (currentPageLength > 4 && currentPageLength < 10);

    return (
      <>
        {/* First Grid: Charge Details */}

        {currentPageLength > 0 && (
          <div
            className="flex w-full border-black border-r border-l border-b text-center font-bold"
            style={{ fontSize: "9px", width: "100%" }}
          >
            <p className="p-1 border-r border-black" style={{ width: "45%" }}>
              Charge
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Qty
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Rate
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Curr
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Ex. Rate
            </p>
            <p className="p-1 border-black" style={{ width: "15%" }}>
              Amount
            </p>
          </div>
        )}
        {/* Charge Grid */}
        {currentPageLength > 0 && (
          <div
            className="border-black border-r border-l" style={{maxheight: "540px",minHeight: "540px", height: "540px"}}
            // style={{ height: chargeGridHeight, overflow: "hidden" }}
          >
            {charge[index]?.map((chargeData, idx, array) => (
              <div
                key={idx}
                className={`flex w-full ${
                  idx === array.length - 1 ? "border-b border-black" : ""
                }`}
                style={{ fontSize: "9px", width: "100%" }}
              >
                <p
                  className="pb-1 pl-2 border-r border-black "
                  style={{ width: "45%" }}
                >
                  {chargeData?.description || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeData?.qty || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeData?.rate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeData?.chargeCurrency || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeData?.exchangeRate || ""}
                </p>
                <p
                  className="pb-1 border-black text-center ps-1"
                  style={{ width: "15%" }}
                >
                  {chargeData?.totalAmountFc || ""}
                </p>
              </div>
            ))}
            {/* Final row - Amount in Words */}
            <div
              className="flex w-full border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <div className="border-r border-black" style={{ width: "50%" }}>
                <div>
                  <p className=" text-left pl-2">Note :</p>
                </div>
                <div>
                  <p className=" text-left pl-2">
                    {" "}
                    ANY DISCREPANCY NOTED IN INVOICE, SHOULD BE BROUGHT TO OUR
                    NOTICE WITH IN 7 (SEVEN) DAYS FROM DATE OF INVOICE.
                  </p>
                </div>
              </div>
              <div className="border-black" style={{ width: "50%" }}>
                <div className="flex w-full border-b border-black pb-1 pt-1">
                  <p className=" text-right" style={{ width: "60%" }}>
                    Subtotal
                  </p>
                  <p className="text-right pr-1" style={{ width: "40%" }}>
                    {gridTotal?.toFixed(2)}
                  </p>
                </div>
                <div className="flex w-full pb-1 pt-1">
                  <p className=" text-right" style={{ width: "60%" }}>
                    Amount {data[0]?.currency || ""}
                  </p>
                  <p className="text-right pr-1" style={{ width: "40%" }}>
                    {gridTotal?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="flex w-full border-b border-black"
              style={{ fontSize: "9px", width: "100%" }}
            >
              <p
                className="p-1 uppercase"
                style={{ width: "85%", paddingRight: "15px" }}
              >
                <span className="font-bold">Amount in Words </span>
                {data[0]?.currency || ""} {totalAmountInWords || ""} Only
              </p>
            </div>
          </div>
        )}
        
      </>
    );
  };
  const TaxInvoiceRemarks = ({ data }) => {
    return (
      <div className="border-r border-l border-b border-black p-2">
        <p style={{ fontSize: "9px" }}>
          <span className="font-bold">Remarks : </span> {data[0]?.remarks || ""}
        </p>
        <p style={{ fontSize: "9px", marginTop: "2px" }}>
          <span className="font-bold">Container No(s) : </span>
          {data[0]?.containerNos || ""}
        </p>
      </div>
    );
  };
  const InvoicePrintRemarks = ({ data }) => {
    return (
      <div
        className="border-r border-l border-b border-black pl-2 pt-1 pb-1"
        style={{ minHeight: "40px", maxHeight: "40px" }}
      >
        <p style={{ fontSize: "9px", marginTop: "1px" }}>
          <span className="font-bold">Container : </span>
          {data[0]?.sizeTypeContainer || ""}
        </p>
        <p style={{ fontSize: "9px", marginTop: "1px" }}>
          {data[0]?.containerNos || ""}
        </p>
      </div>
    );
  };
  const TaxInvoiceSpacing = () => {
    return (
      <div
        className="border-b border-r border-l border-black"
        style={{ height: "330px" }}
      ></div>
    );
  };
  const TaxInvoiceTermsAndCondition = ({ data, index, termsAndConditions }) => {
    const companyName = data[0]?.company || "";

    // Helper to turn a newline or array into a sequence of lines
    const renderTerms = (tc) => {
      if (Array.isArray(tc)) {
        return tc.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ));
      }
      if (typeof tc === "string") {
        return tc.split(/\r?\n/).map((line, i) => (
          <React.Fragment key={i}>
            {line.trim()}
            <br />
          </React.Fragment>
        ));
      }
      return null;
    };

    return (
      <>
        <div
          className="flex border-r border-l border-b border-black p-2"
          style={{ fontSize: "9px", height: "220px" }}
        >
          <div style={{ width: "60%" }}>
            <p className="font-bold">Terms And Condition :</p>
            <p className="mt-2" style={{ lineHeight: 1.4 }}>
              {termsAndConditions ? (
                renderTerms(termsAndConditions)
              ) : (
                <p>
                  a) All payments should be in favour of {companyName}
                  <br />
                  b) If any discrepancy is noticed in the invoice, kindly inform
                  us in writing within 7 days else the same will be considered
                  as correct.
                  <br />
                  c) If payment is delayed beyond agreed credit terms, it will
                  attract interest @18% per annum.
                  <br />
                  d) Please check your GST Details. If the same needs
                  modification kindly notify us within 3 working days.
                  <br />
                  e) Kindly settle the tax component of the invoice within 7
                  days.
                  <br />
                  f) Jurisdiction: Dispute if any shall be subject to the
                  jurisdiction of Pune (India) Courts only.
                  <br />
                </p>
              )}
            </p>
          </div>
          <div style={{ width: "40%" }}>
            <p className="font-bold text-right pr-4" style={{ height: "56%" }}>
              For {companyName}
            </p>
            <p className="font-bold text-right pr-4">Authorized Signatory</p>
          </div>
        </div>
        <div className="p-2 border-r border-l border-b border-black flex">
          <div className="font-bold" style={{ width: "90%", fontSize: "9px" }}>
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          <div style={{ width: "10%", fontSize: "9px" }}>
            Page {index + 1} of{" "}
            {Math.ceil(data[0]?.tblInvoiceCharge?.length / itemsPerPage || 1)}
          </div>
        </div>
      </>
    );
  };
  const InvoicePrintTermsAndCondition = ({
    data,
    index,
    termsAndConditions,
  }) => {
    const companyName = data[0]?.company || "";

    // Helper to turn a newline or array into a sequence of lines
    const renderTerms = (tc) => {
      if (Array.isArray(tc)) {
        return tc.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            <br />
          </React.Fragment>
        ));
      }
      if (typeof tc === "string") {
        return tc.split(/\r?\n/).map((line, i) => (
          <React.Fragment key={i}>
            {line.trim()}
            <br />
          </React.Fragment>
        ));
      }
      return null;
    };

    return (
      <>
        <div
          className="flex border border-black"
          style={{ fontSize: "9px", height: "140px" }}
        >
          <div
            className="text-left border-r border-black p-2"
            style={{ width: "60%", fontSize: "9px" }}
          >
            <p className="font-bold">
              All payment to be issued in favour of {data[0]?.company || ""}{" "}
            </p>
            <br />
            <p className="pt-1 pb-1 font-bold">For RTGS / NEFT Payment:</p>
            <div>
              <div className="flex w-full">
                <p
                  className="font-bold line-height-2 "
                  style={{ width: "30%" }}
                >
                  BANK NAME :{" "}
                </p>
                <p
                  className="font-bold text-left line-height-2 "
                  style={{ width: "70%" }}
                >
                  {data[0]?.bankName || ""}
                </p>
              </div>
              <div className="flex w-full">
                <p
                  className="font-bold line-height-2 "
                  style={{ width: "30%" }}
                >
                  BANK ADDRESS :{" "}
                </p>
                <p
                  className="font-bold text-left line-height-2 "
                  style={{ width: "70%" }}
                >
                  {data[0]?.bankAddress || ""}
                </p>
              </div>
              <div className="flex w-full">
                <p
                  className="font-bold line-height-2 "
                  style={{ width: "30%" }}
                >
                  CURRENT A/C NO :{" "}
                </p>
                <p
                  className="font-bold text-left line-height-2 "
                  style={{ width: "70%" }}
                >
                  {data[0]?.bankAccountNo || ""}
                </p>
              </div>
              <div className="flex w-full">
                <p
                  className="font-bold line-height-2 "
                  style={{ width: "30%" }}
                >
                  SWIFT CODE :{" "}
                </p>
                <p
                  className="font-bold text-left line-height-2 "
                  style={{ width: "70%" }}
                >
                  {data[0]?.bankSwiftCode || ""}
                </p>
              </div>
            </div>
          </div>
          <div style={{ width: "40%" }}>
            <div style={{ height: "56%" }}>
              <p className="font-bold text-right pr-4">For {companyName}</p>
              <div className="w-full flex justify-end">
                <img
                  src="https://expresswayshipping.com/sql-api/uploads/SARSign.png"
                  style={{ width: "200px", height: "80px", marginRight: "2px" }}
                />
              </div>
              <p className="font-bold text-right pr-4">Authorized Signatory</p>
            </div>
          </div>
        </div>
        <div className="p-2 border-r border-l border-b border-black flex">
          <div className="font-bold" style={{ width: "90%", fontSize: "9px", color: "black"}}>
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          {/* <div style={{ width: "10%", fontSize: "9px" }}>
            Page {index + 1} of{" "}
            {Math.ceil(data[0]?.tblInvoiceCharge?.length / itemsPerPage || 1)}
          </div> */}
        </div>
        <div>
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
      </>
    );
  };
  const InvoiceNewTermAndCondition = () => {
    
    return (
      <>
        <div
          className="p-2 border border-black"
          style={{ fontSize: "9px", color: "black", width: "100%", height: "278mm" }}
        >
          <p className="font-bold mt-4 mb-2">Terms & Conditions </p>
          <p>
            1. We always try our best to raise our invoices strictly as per our
            offer duly agreed and accepted by you. However still if there are
            any disputes it should be raised within 10 days from the date of
            invoice beyond which no disputes shall be entertained.{" "}
          </p>
          <p>
            2. Any claim / grievance brought by you against us should be
            notified to us in writing within 10 days of the date of the Invoice,
            failing which we shall have no liability whatsoever. No claim/
            grievance will be entertained after 10 days from the date of this
            invoice. No claim for loss, damage or delay will be entertained
            until all invoices and charges have been paid. The amount of any
            such claim shall not be deducted from amounts due to us.{" "}
          </p>
          <p>
            3. Parties shall meet and endeavour to amicably resolve through
            discussions any dispute, difference, claim or controversy including
            the matter of damages, if any (a “Dispute”) that arises by and
            between the Parties in connection of this Invoice, or anything
            connected or related to or incidental to this Invoice. If the
            Dispute is not amicably resolved by the Parties within 90 (ninety)
            days of the Parties meeting, either Party may submit the Dispute to
            Arbitration to be conducted in accordance with the Arbitration Act
            2001 and Amendment thereto in accordance with the following
            procedure:{" "}
          </p>
          <p>a. The arbitration proceedings shall be held in Singapore. </p>
          <p>
            b. There shall be a panel of 1 (One) arbitrator, to be selected by
            following the due process of law established under the Arbitration
            Act 2001.
          </p>
          <p>
            c. The arbitration proceedings shall be conducted and the award
            shall be rendered in English.
          </p>
          <p>
            d. The arbitrators shall make the award within 3 (three) months of
            entering upon the reference unless the time is extended by consent
            of both Parties.
          </p>
          <p>
            e. The award rendered by the arbitrators shall be final, conclusive
            and binding on the Parties.
          </p>
          <p>
            f. The award shall be enforceable in any court having jurisdiction,
            subject to Applicable Law.
          </p>
          <p>
            g. Each Party shall bear the cost of preparing and presenting its
            case.
          </p>
          <p>
            h. The Parties shall equally share the cost of arbitration,
            including the arbitrators' fees and expenses.
          </p>
          <p>
            4. The Courts of Singapore alone shall have jurisdiction with regard
            to all or any of the matters arising out of or in relation to this
            invoice.
          </p>
          <p>
            5. We request our invoices are duly processed and booked in your
            accounts well before the due dates as per our agreed credit limits.
          </p>
          <p>
            6. Payments are required to be made invoice to invoice to enable
            proper accounting at both the ends.
          </p>
          <p>
            7. Payments are to be made strictly on or before the due date, as
            per agreed credit terms in accordance with the contract or as per
            mail communication. Interest at the rate of 21% per annum shall be
            charged beyond the due dates.
          </p>
          <p>
            8. We do not offer and shall not be bound to insure the consignment
            or any part thereof. All movements of consignment are on 'Owners
            Risk basis' and not on 'Carrier Risk basis'. It is solely your
            obligation to take insurance for your consignment. Any consignment
            not insured by you, has been / shall be solely sent at your risk. In
            the event of the consignment being lost / misplaced / mis-delivered
            / untraceable during transit, our liability shall be limited to the
            amount of the invoice raised by us.
          </p>
          <p>
            9. We shall not be held responsible for any unintentional /
            accidental loss or damage to the consignment, either in our hands or
            in the hands of the carrier of the consignment.
          </p>
          <p>
            10. Consignments which cannot be delivered either because they are
            insufficiently or incorrectly addressed or because they are not
            collected or accepted by the Consignee, maybe sold or returned to
            you at our discretion, after the expiration of 21 days from the date
            a notice is issued to you at the address mentioned herein. All
            charges and expenses arising in connection with the sale or return
            of the consignment shall be paid by you.
          </p>
          <p>
            11. We shall have a lien on the consignment for all freight charges,
            customs duties, advances or any other charges arising out of the
            shipment of the consignment and shall have a right to refuse to
            release the consignment unless the charges as aforesaid are paid to
            us.
          </p>
          <p>
            12. If the consignment is not accepted by the consignee resulting in
            demurrage charges being payable, you shall be liable to pay the same
            immediately and in any event within a period of 7 days from the date
            the same become payable, failing which we shall be entitled to
            dispose-off the consignment and clear the demurrage charges. Any
            balance demurrage charges which remain payable even after the sale
            of the consignment, you remain to pay the same.
          </p>
          <p>
            13. We shall not be liable for delay in delivery or loss in transit
            of the consignment in the event of the happening of any force
            majeure event, including but not be limited to act of God, weather,
            fire, riots or civil commotion, strikes, epidemic, stormy weather,
            floods, natural disasters / calamities, transport failure, festival
            celebrations, labour shortage, curfew or lockdowns imposed by any
            Government / Local / Government /Local Authorities or any other
            cause which is beyond our control and which prevents us from
            performing our obligation in terms of this invoice. We shall issue
            you notice on the happening of any such force majeure event and
            shall use our best efforts to minimize the extent and effect of such
            event.
          </p>
          <p>
            14. We shall not be liable for any loss arising out of confiscation
            of the consignment by any Government / Local / Statutory Authority.
          </p>
          <p>
            15. You shall be liable for any duty, tax, any other charges by
            whatever levied by any Government / Local / Statutory Authority for
            or in connection with the consignment.
          </p>
          <p>
            16. You shall be responsible to comply with all applicable laws,
            customs and other Government / Local / Statutory Authority
            regulations of all countries / states through or over which the
            consignment may be carried including those relating to packing,
            carriage or delivery of the consignment and shall furnish such
            information and provide proper documentation as may be necessary to
            comply with such laws and regulations.
          </p>
          <p>
            17. You undertake to make good the loss to us or any of other
            customers in case the consignment causes any damage to other
            consignments loaded on the carriage due to inherent nature or
            mis-declaration of the consignment or due to seizure by any
            Government / Local / Statutory Authority due to improper /
            incomplete documentation which results in other consignments getting
            delayed and thereby loss to us. You are to indemnify us for any
            loss, direct or indirect, caused to us on account of the
            consignment.
          </p>
          <p>
            18. Consignments shall be deemed to be delivered to the Consignee
            once the consignment is delivered to the consignee/ person accepting
            on behalf of the consignee, consignments will be delivered to the
            address of the consignee and not necessarily to the named receiver
            personally.
          </p>
        </div>
        <div className="p-2 border-r border-l border-b border-black flex">
          <div className="font-bold" style={{ width: "90%", fontSize: "9px", color: "black" }}>
            This is a computer generated invoice no stamp and signature is
            required.
          </div>
          {/* <div style={{ width: "10%", fontSize: "9px", color: "black" }}>
            Page 2 of{" "}
            2
          </div> */}
        </div>
        </>
    )
}
  const TaxInvoiceHsnSummaryGrid = ({ hsnSac, data }) => {
    console.log("hsnSac=>", hsnSac);
    console.log("data=>", data);
    const totals = hsnSac[0]?.reduce(
      (acc, item) => {
        acc.CGST += item.CGST || 0;
        acc.SGST += item.SGST || 0;
        acc.IGST += item.IGST || 0;
        acc.taxableAmount += item.taxableAmount || 0;
        return acc;
      },
      { CGST: 0, SGST: 0, IGST: 0, taxableAmount: 0 }
    );
    return (
      <div
        className="flex border-r border-l border-b border-black"
        style={{
          height: `${hsnGridHeight}px`,
          overflow: "hidden",
        }}
      >
        <div className="border-r border-black" style={{ width: "60%" }}>
          <div
            className="flex flex-between w-full font-bold text-center border-b border-black"
            style={{ fontSize: "8px" }}
          >
            <p className="flex-1 p-1 border-r border-black">HSN / SAC</p>
            <p className="flex-1 p-1 border-r border-black">Taxable Value</p>
            <p className="flex-1 p-1 border-r border-black">Rate</p>
            <p className="flex-1 p-1 border-r border-black">IGST</p>
            <p className="flex-1 p-1 border-r border-black">CGST</p>
            <p className="flex-1 p-1">SGST</p>
          </div>

          {/* Table Body */}
          <div style={{ height: "108px", overflow: "hidden" }}>
            {hsnSac?.map((group, groupIndex) => {
              const rows = group.map((item, index) => (
                <div
                  key={`${groupIndex}-${index}`}
                  className="flex flex-between w-full text-center"
                  style={{ fontSize: "8px" }}
                >
                  <p className="flex-1 pb-1 border-r border-black">
                    {item.sac || item.hsn || ""}
                  </p>
                  <p className="flex-1 pb-1 border-r border-black">
                    {(item.taxableAmount || 0)?.toFixed(2)}
                  </p>
                  <p className="flex-1 pb-1 border-r border-black"></p>
                  <p className="flex-1 pb-1 border-r border-black">
                    {(item.IGST || 0)?.toFixed(2)}
                  </p>
                  <p className="flex-1 pb-1 border-r border-black">
                    {(item.CGST || 0)?.toFixed(2)}
                  </p>
                  <p className="flex-1 pb-1">{(item.SGST || 0)?.toFixed(2)}</p>
                </div>
              ));

              // Fill empty rows if less than 6
              const emptyRowsCount = Math.max(0, 7 - rows.length);
              const emptyRows = Array.from(
                { length: emptyRowsCount },
                (_, i) => (
                  <div
                    key={`empty-${groupIndex}-${i}`}
                    className="flex flex-between w-full font-bold text-center"
                    style={{ fontSize: "8px" }}
                  >
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1 border-r border-black">&nbsp;</p>
                    <p className="flex-1 pb-1">&nbsp;</p>
                  </div>
                )
              );

              return [...rows, ...emptyRows];
            })}
          </div>

          <div
            className="flex flex-between w-full font-bold text-center border-t border-black"
            style={{ fontSize: "8px" }}
          >
            <p className="flex-1 p-1 border-r border-black">Total</p>
            <p className="flex-1 p-1 border-r border-black">
              {totals?.taxableAmount?.toFixed(2) || ""}
            </p>
            <p className="flex-1 p-1 border-r border-black">{""}</p>
            <p className="flex-1 p-1 border-r border-black">
              {totals?.IGST?.toFixed(2) || ""}
            </p>
            <p className="flex-1 p-1 border-r border-black">
              {totals?.CGST?.toFixed(2) || ""}
            </p>
            <p className="flex-1 p-1">{totals?.SGST?.toFixed(2) || ""}</p>
          </div>
        </div>
        <div className="p-2" style={{ width: "40%", fontSize: "8px" }}>
          <p>
            In case of discrepancy in the invoice amount, please notify within 2
            days.
          </p>
          <p className="font-bold">
            All payment to be issued in favour of {data[0]?.company || ""}{" "}
          </p>
          <br />
          <p className="pt-1 pb-1 font-bold">For RTGS / NEFT Payment:</p>
          <div>
            <div className="flex">
              <p className="font-bold line-height-2 flex-1">BANK NAME : </p>
              <p className="font-bold line-height-2 flex-1">
                {data[0]?.bankName || ""}
              </p>
            </div>
            <div className="flex">
              <p className="font-bold line-height-2 flex-1">BANK ADDRESS : </p>
              <p className="font-bold line-height-2 flex-1">
                {data[0]?.bankAddress || ""}
              </p>
            </div>
            <div className="flex">
              <p className="font-bold line-height-2 flex-1">
                CURRENT A/C NO :{" "}
              </p>
              <p className="font-bold line-height-2 flex-1">
                {data[0]?.bankAccountNo || ""}
              </p>
            </div>
            <div className="flex">
              <p className="font-bold line-height-2 flex-1">SWIFT CODE : </p>
              <p className="font-bold line-height-2 flex-1">
                {data[0]?.bankSwiftCode || ""}
              </p>
            </div>
            <div className="flex">
              <p className="font-bold line-height-2 flex-1">IFSC CODE : </p>
              <p className="font-bold line-height-2 flex-1">
                {data[0]?.bankIfscCode || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const taxInvoice = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModule data={data} />
        <TaxInvoiceHeader data={data} />
        <TaxInvoiceBillingDetails data={data} />
        {index === 0 && <TaxInvoiceJobDetails data={data} />}
        <TaxInvoiceRemarks data={data} />
        <TaxInvoiceChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <TaxInvoiceTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const taxInvoiceWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModule data={data} />
        <TaxInvoiceHeader data={data} />
        <TaxInvoiceBillingDetails data={data} />
        <TaxInvoiceJobDetails data={data} />
        <TaxInvoiceSpacing />
        <TaxInvoiceTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const ProformaInvoice = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModule data={data} />
        <ProformaInvoiceHeader data={data} />
        <TaxInvoiceBillingDetails data={data} />
        {index === 0 && <TaxInvoiceJobDetails data={data} />}
        <TaxInvoiceRemarks data={data} />
        <TaxInvoiceChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <TaxInvoiceTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const ProformaInvoiceWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModule data={data} />
        <ProformaInvoiceHeader data={data} />
        <TaxInvoiceBillingDetails data={data} />
        <TaxInvoiceJobDetails data={data} />
        <TaxInvoiceSpacing />
        <TaxInvoiceTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const invoicePrint = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <InvoicePrintHeader data={data} />
        <InvoicePrintBillingDetails data={data} />
        {index === 0 && <InvoicePrintJobDetails data={data} />}
        <InvoicePrintRemarks data={data} />
        <InvoicePrintChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <InvoicePrintTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const invoicePrintWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <InvoicePrintHeader data={data} />
        <InvoicePrintBillingDetails data={data} />
        <InvoicePrintJobDetails data={data} />
        <TaxInvoiceSpacing />
        <InvoicePrintTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const sundryInvoicePrint = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SundryInvoicePrintHeader data={data} />
        <SundryInvoicePrintBillingDetails data={data} />
        <InvoicePrintChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <InvoicePrintTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const sundryInvoicePrintWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SundryInvoicePrintHeader data={data} />
        <SundryInvoicePrintBillingDetails data={data} />
        <TaxInvoiceSpacing />
        <InvoicePrintTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const shouldRenderSecondPage = useEffect(() => {
    const loadHtml2pdf = async () => {
      const module = await import("html2pdf.js");
      setHtml2pdf(() => module.default);
    };

    loadHtml2pdf();
  }, []);

  const SubLeaseInvoice = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SubLeaseInvoicePrintHeader data={data} />
        <SubLeaseInvoicePrintBillingDetails data={data} />
        <InvoicePrintChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <InvoicePrintTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const SubLeaseInvoiceWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SubLeaseInvoicePrintHeader data={data} />
        <SubLeaseInvoicePrintBillingDetails data={data} />
        <TaxInvoiceSpacing />
        <InvoicePrintTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const SalesInvoiceContainerWise = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SubLeaseInvoicePrintHeader data={data} />
        <SalesInvoiceContainerWiseBillingDetails data={data} />
        <InvoicePrintChargeDetails
          data={data}
          charge={charge}
          index={index}
          hsnSac={hsnSac}
        />
        {index === 0 && (
          <InvoicePrintTermsAndCondition
            data={data}
            index={index}
            termsAndConditions={termsAndConditions}
          />
        )}
      </div>
    </div>
  );
  const SalesInvoiceContainerWiseWithoutCharges = (index) => (
    <div>
      <div className="mx-auto !text-black">
        <CompanyImgModuleInvoicePrint data={data} />
        <SubLeaseInvoicePrintHeader data={data} />
        <SalesInvoiceContainerWiseBillingDetails data={data} />
        <TaxInvoiceSpacing />
        <InvoicePrintTermsAndCondition
          data={data}
          index={0}
          termsAndConditions={termsAndConditions}
        />
      </div>
    </div>
  );

  const BlAttachmentPrint = ({ chargeAtt, index }) => {
    return (
      <>
        <div className="text-black p-10">
          <div className="flex flex-grow w-full justify-center items-center pb-5">
            <h1 className="text-black font-bold text-sm">
              Attachment For Invoice
            </h1>
          </div>
          <div
            className="flex w-full border-black border-t border-r border-l border-b text-center font-bold"
            style={{ fontSize: "10px", width: "100%" }}
          >
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Sr No.
            </p>
            <p className="p-1 border-r border-black" style={{ width: "30%" }}>
              Container No.
            </p>
            <p className="p-1 border-r border-black" style={{ width: "15%" }}>
              Size/Type
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Rate
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Currency
            </p>
            <p className="p-1 border-r border-black" style={{ width: "10%" }}>
              Ex. Rate
            </p>
            <p className="p-1 border-black" style={{ width: "15%" }}>
              Amount
            </p>
          </div>
          <div
            className=" flex w-full border-black border-r border-l border-b"
            style={{ overflow: "hidden" }}
          >
            {chargeAtt[index]?.map((chargeAttData, idx, array) => (
              <div
                key={idx}
                className={`flex w-full ${
                  idx === array.length - 1 ? "border-b" : ""
                }`}
                style={{ fontSize: "9px", width: "100%" }}
              >
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeAttData?.srNo || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "30%" }}
                >
                  {chargeAttData?.containerNo || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "15%" }}
                >
                  {chargeAttData?.size || ""} / {chargeAttData?.typeCode || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeAttData?.rate || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeAttData?.currency || ""}
                </p>
                <p
                  className="pb-1 border-r border-black text-center ps-1"
                  style={{ width: "10%" }}
                >
                  {chargeAttData?.exchangeRate || ""}
                </p>
                <p
                  className="pb-1 border-black text-center ps-1"
                  style={{ width: "15%" }}
                >
                  {chargeAttData?.amountHc || ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  const ChargeGrid = ({ data = [] }) => {
    // Accept either an array or an object with tblInvoiceCharge
    const rows = Array.isArray(data) ? data : data?.tblInvoiceCharge || [];

    // simple number formatter; leave blank if null/undefined
    const fmt = (v, opts = { maximumFractionDigits: 2 }) =>
      v === null || v === undefined || v === ""
        ? ""
        : Number(v).toLocaleString(undefined, opts);

    return (
      <div className="w-full">
        <table className="w-full border-b border-l border-r border-black border-collapse text-[9px]">
          <thead>
            <tr className="bg-gray-300">
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                SNo
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Description
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Unit Rate
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                ROE
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                No. Of Units
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Net Amount
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT%
              </th>
              <th
                rowSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                VAT Amount
              </th>
              <th
                colSpan={2}
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                Payable Amount
              </th>
            </tr>
            <tr className="bg-gray-300">
              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in USD
              </th>
              <th
                className="border-b border-l border-r border-black text-center pl-1 pr-1 pt-0.5 pb-0.5"
                style={{ color: "black", fontSize: "9px" }}
              >
                in KES
              </th>
            </tr>
          </thead>

          <tbody
            style={{
              color: "black",
              fontSize: "9px",
              minHeight: "545px",
              height: "545px",
            }}
          >
            {rows.length > 0 ? (
              rows.map((r, i) => (
                <tr key={i} className="align-top">
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {i + 1}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {r.description || r.chargeName || ""}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r.unitRate ?? r.rate)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r.exchangeRate ?? r.roe)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r.units ?? r.qty, { maximumFractionDigits: 3 })}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r.netAmount)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r.vatPct ?? r.VAT ?? r.taxPercent, {
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r.vatAmount ?? r.taxAmount)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r.payableUSD)}
                  </td>
                  <td
                    className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right"
                    style={{ color: "black", fontSize: "9px" }}
                  >
                    {fmt(r.payableKES)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-center"
                  style={{
                    color: "black",
                    fontSize: "9px",
                    minHeight: "545px",
                    height: "545px",
                  }}
                  colSpan={10}
                >
                  No charges to display
                </td>
              </tr>
            )}
          </tbody>
          {/* Totals row */}
          <tfoot>
            <tr>
              {/* Left merged note area */}
              <td
                colSpan={6}
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-left"
              >
                <span
                  className="font-semibold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Demurrage Valid Till :
                </span>{" "}
                {/* {demurrageValidTill} */}
              </td>

              {/* â€œTotal Amount:â€ label in the VAT% column */}
              <td className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right">
                <span
                  className="font-semibold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Total Amount:
                </span>
              </td>

              {/* Totals for VAT Amount, in USD, in KES */}
              <td
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {/* {fmt(totalVAT)} */}
              </td>
              <td
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {/* {fmt(totalUSD)} */}
              </td>
              <td
                className="border border-black pl-1 pr-1 pt-0.5 pb-0.5 text-right font-bold"
                style={{ color: "black", fontSize: "9px" }}
              >
                {/* {fmt(totalKES)} */}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  const HeadingGrid = ({ data }) => {
    return (
      <div className="flex">
        {/* First Table */}
        <table
          style={{
            width: "50%",
            borderCollapse: "collapse",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            borderTop: "1px solid black",
          }}
        >
          {/* First row spans 4 rows */}
          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
              rowSpan={4}
            >
              {/* ~4 normal rows: 13â€“14px each -> ~52â€“56px */}
              <div style={{ minHeight: "110px" }}>
                <p
                  className="text-left text-black font-bold pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Invoice to
                </p>
              </div>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
              rowSpan={4}
            >
              <div style={{ minHeight: "110px" }}>
                <p
                  className="text-left text-black pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Invoice to
                </p>
              </div>
            </td>
          </tr>

          {/* placeholder rows covered by the rowspan (no cells allowed here) */}
          <tr aria-hidden="true"></tr>
          <tr aria-hidden="true"></tr>
          <tr aria-hidden="true"></tr>

          {/* Normal rows continue below */}
          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                PIN NO:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {data?.partyPincode || ""}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                VAT :
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Akash
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                EXCHANGE RATE:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Akash
              </p>
            </td>
          </tr>
        </table>

        {/* Second Table */}
        <table
          style={{
            width: "50%",
            borderCollapse: "collapse",
            border: "1px solid black", // âœ… outer border only
          }}
        >
          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                Invoice Date:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* value here */}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                B/L NUMBER:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* value here */}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                VESSEL NAME / VOYAGE NO:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* value here */}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                POL:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* value here */}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                POD:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* value here */}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                DESTINATION:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* value here */}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                MANIFEST / REG NO:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* value here */}
              </p>
            </td>
          </tr>

          <tr>
            <td
              className="pl-1 pr-1"
              style={{ width: "30%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black font-bold pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                ETA:
              </p>
            </td>
            <td
              className="pl-1 pr-1"
              style={{ width: "70%", verticalAlign: "top" }}
            >
              <p
                className="text-left text-black pt-0.5 pb-0.5"
                style={{ fontSize: "9px", color: "black" }}
              >
                {/* value here */}
              </p>
            </td>
          </tr>
        </table>
      </div>
    );
  };

  const BankDetailsGrid = ({ data }) => {
    return (
      <>
        <div>
          <p
            className="text-left text-black font-bold pt-1 pb-1 pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "9px", color: "black", width: "100%" }}
          >
            Bank Details
          </p>
        </div>
        <div>
          <p
            className="text-left text-black font-bold pb-1 pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "10px", color: "black", width: "100%" }}
          >
            Beneficiary Name: <span>{data?.beneficiaryName || ""}</span>
          </p>
        </div>
        <table
          className="w-full"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid black",
          }}
        >
          <tbody>
            <tr>
              <td
                className="pl-1 pr-1"
                style={{
                  width: "33%",
                  verticalAlign: "top",
                  border: "1px solid black",
                }}
              >
                <p
                  className="text-left text-black font-bold pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Beneficiary Bank:
                </p>
              </td>
              <td
                className="pl-1 pr-1"
                style={{
                  width: "33%",
                  verticalAlign: "top",
                  border: "1px solid black",
                }}
              >
                <p
                  className="text-left text-black font-bold pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Bank Branch:
                </p>
              </td>
              <td
                className="pl-1 pr-1"
                style={{
                  width: "33%",
                  verticalAlign: "top",
                  border: "1px solid black",
                }}
              >
                <p
                  className="text-left text-black font-bold pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Bank Swift Code:
                </p>
              </td>
            </tr>
            <tr>
              <td
                className="pl-1 pr-1"
                style={{
                  width: "33%",
                  verticalAlign: "top",
                  border: "1px solid black",
                }}
              >
                <p
                  className="text-left text-black font-bold pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Currency:
                </p>
              </td>
              <td
                className="pl-1 pr-1"
                style={{
                  width: "33%",
                  verticalAlign: "top",
                  border: "1px solid black",
                }}
              >
                <p
                  className="text-left text-black font-bold pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Account No:
                </p>
              </td>
              <td
                className="pl-1 pr-1"
                style={{
                  width: "33%",
                  verticalAlign: "top",
                  border: "1px solid black",
                }}
              >
                <p
                  className="text-left text-black font-bold pt-0.5 pb-0.5"
                  style={{ fontSize: "9px", color: "black" }}
                >
                  Mpesa Paybill:
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  };

  const TermsAndConditionGrid = () => {
    return (
      <>
        <div>
          <p
            className="text-left text-black font-bold pt-1 pb-1 pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "9px", color: "black", width: "100%" }}
          >
            Invoice Terms & Conditions
          </p>
        </div>
        <div>
          <p
            className="text-left text-black  pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - The exchange rate is based on the date the invoice is issued and
            may be subject to change.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - All cheques and banker’s drafts MUST be payable to “SEALEAD
            SHIPPING AGENCY KENYA LIMITED”
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - Personal cheques are NOT accepted. Kindly deposit all cash
            payments, banker’s drafts, or remittances to our bank account using
            the details provided.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - A penalty of USD 50 will be charged for each bounced cheque
            deposited into our account.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - Any additional costs or commissions arising from payments made via
            RTGS or cheques shall be borne by the customer.
          </p>
          <p
            className="text-left text-black pl-1 pr-1 border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - All enquiries regarding free days, demurrage, Delivery Order
            requirements/charges, or EDO mapping should be addressed to
          </p>
          <p
            className="text-left text-black pl-1 pr-1 pb-1 border-b border-l border-r border-black"
            style={{ fontSize: "8px", color: "black", width: "100%" }}
          >
            - All enquiries regarding free days, demurrage, Delivery Order
            requirements/charges, or EDO mapping should be addressed to
            generalenquiries@sea-lead.com
          </p>
        </div>
      </>
    );
  };

  const Invoice = (index) => (
    <>
      <div>
        <CompanyImgModuleInvoice />
        <HeadingGrid />
        <ChargeGrid />
        <BankDetailsGrid />
        <TermsAndConditionGrid />
      </div>
    </>
  );
  console.log("printName", printName);

  return (
    <main>
      <div className="mt-5">
        <Print
          //key={reportId}
          enquiryModuleRefs={enquiryModuleRefs}
          reportIds={printName ? [printName] : reportIds}
          printOrientation="portrait"
        />
        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Tax Invoice":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="TaxInvoice"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto", // Ensure the correct page break setting
                            padding: "5mm", // space between page edge and inner border
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {taxInvoice(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
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
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {taxInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );

            case "Proforma Invoice":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="ProformaInvoice"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            pageBreakAfter:
                              index < data[0]?.tblInvoiceCharge?.length - 1
                                ? "always"
                                : "auto", // Ensure the correct page break setting
                            padding: "5mm", // space between page edge and inner border
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {ProformaInvoice(index)}
                          </div>
                          <style jsx>{`
                            .black-text {
                              color: black !important;
                            }
                          `}</style>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
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
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {ProformaInvoiceWithoutCharges()}
                        </div>
                        <style jsx>{`
                          .black-text {
                            color: black !important;
                          }
                        `}</style>
                      </div>
                    )}
                  </div>
                </>
              );

            case "Invoice Print":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="InvoicePrint"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <>
                          <div
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              backgroundColor: "#fff",
                              pageBreakAfter:
                                index < reportIds.length - 1
                                  ? "always"
                                  : "auto",
                              padding: "5mm", // space between page edge and inner border
                              display: "flex",
                              flexDirection: "column",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                                fontFamily: "Arial sans-serif !important",
                              }}
                            >
                              {invoicePrint(index)}
                            </div>
                          </div>
                          <div className="bg-gray-300 h-2 no-print" />
                          <div
                            style={{
                              width: "210mm",
                              height: "297mm",
                              maxHeight: "297mm",
                              margin: "auto",
                              boxSizing: "border-box",
                              backgroundColor: "#fff",
                              pageBreakAfter:
                                index < reportIds.length - 1
                                  ? "always"
                                  : "auto",
                              padding: "5mm", // space between page edge and inner border
                              display: "flex",
                              flexDirection: "column",
                              marginBottom: "22px",
                            }}
                            className="bgTheme removeFontSize"
                          >
                            <div
                              style={{
                                flex: 1,
                                width: "100%",
                                boxSizing: "border-box",
                                fontFamily: "Arial sans-serif !important",
                              }}
                            >
                              {InvoiceNewTermAndCondition(index)}
                            </div>
                          </div>
                        </>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
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
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {invoicePrintWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );

            case "Sundry Invoice Print":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="SundryInvoicePrint"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            // height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            backgroundColor: "#fff",
                            pageBreakAfter:
                              index < reportIds.length - 1 ? "always" : "auto",
                            padding: "5mm", // space between page edge and inner border
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {sundryInvoicePrint(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
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
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {sundryInvoicePrintWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );

            case "Sub Lease Invoice Print":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="SubLeaseInvoice"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            // height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            backgroundColor: "#fff",
                            pageBreakAfter:
                              index < reportIds.length - 1 ? "always" : "auto",
                            padding: "5mm", // space between page edge and inner border
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {SubLeaseInvoice(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
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
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {SubLeaseInvoiceWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    // className={
                    //   p === 0
                    //     ? "second-page bg-white mainPadding"
                    //     : "bg-white mainPadding"
                    // }
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {chargeAtt && chargeAtt.length > 0 && (
                      <BlAttachmentPrint chargeAtt={chargeAtt} index={index} />
                    )}
                  </div>
                </>
              );

            case "Sales Invoice Container wise":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="SalesInvoiceContainerWise"
                  >
                    {charge?.length > 0 ? (
                      // Render taxInvoice if there are charges
                      Array.from({
                        length: charge?.length,
                      }).map((_, index) => (
                        <div
                          key={index}
                          style={{
                            width: "210mm",
                            // height: "297mm",
                            margin: "auto",
                            boxSizing: "border-box",
                            backgroundColor: "#fff",
                            pageBreakAfter:
                              index < reportIds.length - 1 ? "always" : "auto",
                            padding: "5mm", // space between page edge and inner border
                            display: "flex",
                            flexDirection: "column",
                            marginBottom: "22px",
                          }}
                          className="bgTheme removeFontSize"
                        >
                          <div
                            style={{
                              flex: 1,
                              width: "100%",
                              boxSizing: "border-box",
                              fontFamily: "Arial sans-serif !important",
                            }}
                          >
                            {SalesInvoiceContainerWise(index)}
                          </div>
                        </div>
                      ))
                    ) : (
                      // Render taxInvoiceWithoutCharges if there are no charges
                      <div
                        style={{
                          width: "210mm",
                          // height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm", // space between page edge and inner border
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                          pageBreakAfter:
                            index < reportIds.length - 1 ? "always" : "auto",
                        }}
                        className="bgTheme removeFontSize"
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {SalesInvoiceContainerWiseWithoutCharges()}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    // className={
                    //   p === 0
                    //     ? "second-page bg-white mainPadding"
                    //     : "bg-white mainPadding"
                    // }
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "#ffffff",
                    }}
                  >
                    {chargeAtt && chargeAtt.length > 0 && (
                      <BlAttachmentPrint chargeAtt={chargeAtt} index={index} />
                    )}
                  </div>
                </>
              );

            case "Invoice":
              return (
                <>
                  <div
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id="Invoice"
                  >
                    <div
                      key={index}
                      style={{
                        width: "210mm",
                        height: "297mm",
                        margin: "auto",
                        boxSizing: "border-box",
                        pageBreakAfter:
                          index < data[0]?.tblInvoiceCharge?.length - 1
                            ? "always"
                            : "auto", // Ensure the correct page break setting
                        padding: "5mm", // space between page edge and inner border
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: "22px",
                      }}
                      className="bgTheme removeFontSize"
                    >
                      <div
                        style={{
                          flex: 1,
                          width: "100%",
                          boxSizing: "border-box",
                          fontFamily: "Arial sans-serif !important",
                        }}
                      >
                        {Invoice()}
                      </div>
                    </div>
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
export default rptInvoice;
