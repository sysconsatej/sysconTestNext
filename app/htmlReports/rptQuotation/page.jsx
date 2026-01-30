"use client";
/* eslint-disable */
import React, { useEffect, useState, useMemo, useRef } from "react";
import { toWords } from "number-to-words";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import { useSearchParams } from "next/navigation";
import "./rptQuotation.css";
import PropTypes from "prop-types";
import { decrypt } from "@/helper/security";
import jsPDF from "jspdf"; // Import jsPDF
import "jspdf-autotable"; // Import AutoTable plugin
import Print from "@/components/Print/page";
import {
  fetchReportData,
  reportTheme,
} from "@/services/auth/FormControl.services";
import { applyTheme } from "@/utils";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
import "@/public/style/reportTheme.css";
import { getUserDetails } from "@/helper/userDetails";

function rptQuotation() {
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState([]);
  const [printReportName, setPrintReportName] = useState([]);
  const [CompanyHeader, setCompanyHeader] = useState("");
  const [ImageUrl, setImageUrl] = useState("");
  const [userName, setUserName] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const enquiryModuleRefs = useRef([]);
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [html2pdf, setHtml2pdf] = useState(null);
  const [printOrientation, setPrintOrientation] = useState(null);
  const { clientId } = getUserDetails();
  console.log("clientId", clientId);

  useEffect(() => {
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
            filterCondition: `(rr.id=${
              Number(id) || 0
            } or rr.rateRequestNo in (${id
              .split(",")
              .map((e) => `'${e}'`)
              .join(",")}))`,
            filterCondition: `(rr.id=${
              Number(id) || 0
            } or rr.rateRequestNo in (${id
              .split(",")
              .map((e) => `'${e}'`)
              .join(",")}))`,
          };
          const response = await fetch(
            `${baseUrl}/Sql/api/Reports/rateRequest`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": JSON.parse(token),
              },
              body: JSON.stringify(requestBody),
            },
          );
          if (!response.ok) throw new Error("Failed to fetch job data");
          const data = await response.json();
          setData(data?.data);
          if (clientId == 13) {
            if (Array.isArray(data?.data) && data?.data?.length > 0) {
              console.log(
                "data for print report name:",
                data?.data[0]?.rateRequestNo,
              );
              setPrintReportName(
                data?.data[0]?.rateRequestNo !== ""
                  ? [data?.data[0]?.rateRequestNo]
                  : [],
              );
            }
          }
          setCompanyHeader(data?.data[0]?.brachId);
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
            clientIdCondition: `clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')) FOR JSON PATH, INCLUDE_NULL_VALUES`,
          };

          const data = await fetchReportData(requestBody);
          // const themeData = await reportTheme(themeRequest);

          // applyTheme(
          //   themeData.data,
          //   enquiryModuleRef.current?.querySelector(".bgTheme")
          // );

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

  // useEffect(() => {
  //   const fetchHeader = async () => {
  //     const storedUserData = localStorage.getItem("userData");
  //     if (storedUserData) {
  //       const decryptedData = decrypt(storedUserData);
  //       const userData = JSON.parse(decryptedData);
  //       const BranchId = userData[0].defaultBranchId;
  //       const clientCode = userData[0].clientCode;
  //       const requestBody = {
  //         tableName: "tblCompanyBranchParameter",
  //         whereCondition: {
  //           status: 1,
  //           companyBranchId: BranchId,
  //           clientCode: clientCode,
  //         },
  //         projection: {
  //           tblCompanyBranchParameterDetails: 1,
  //         },
  //       };
  //       try {
  //         const dataURl = await fetchDataAPI(requestBody);
  //         const response = dataURl.data;
  //         if (
  //           response &&
  //           response.length > 0 &&
  //           response[0].tblCompanyBranchParameterDetails.length > 0
  //         ) {
  //           const headerUrl =
  //             response[0].tblCompanyBranchParameterDetails[0].header;
  //           setImageUrl(headerUrl);
  //         } else {
  //           console.error("No valid data received");
  //         }
  //       } catch (error) {
  //         console.error("Error fetching initial data:", error);
  //       }
  //     }
  //   };
  //   fetchHeader();
  // }, [CompanyHeader]);

  // const CompanyImgModule = () => {
  //   return (
  //     <img
  //       src={ImageUrl}
  //       alt="LOGO"
  //       style={{ marginTop: "-35px" }}
  //       className="w-full"
  //     ></img>
  //   );
  // };

  useEffect(() => {
    const fetchHeader = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const headerLogoPath = userData[0]?.headerLogoPath;
        const companyName = userData[0]?.companyName;
        const userName = userData[0]?.name;
        if (headerLogoPath) {
          setImageUrl(headerLogoPath);
        }
        if (companyName) {
          setCompanyName(companyName);
        }
        if (userName) {
          setUserName(userName);
        }
      }
    };
    fetchHeader();
  }, [CompanyHeader]);

  function numberToWordsOnly(input) {
    const ONES = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const TENS = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    const toNumber = (v) =>
      typeof v === "number" ? v : Number(String(v).replace(/,/g, ""));
    let amount = toNumber(input);
    if (!Number.isFinite(amount)) throw new Error("Invalid number");

    const sign = amount < 0 ? "minus " : "";
    amount = Math.abs(amount);

    const whole = Math.floor(amount + 1e-9);
    const frac = Math.round((amount - whole) * 100 + 1e-9); // two decimals as a number 0..99

    const belowHundred = (n) => {
      if (n < 20) return ONES[n];
      const t = TENS[Math.floor(n / 10)];
      const u = n % 10;
      return u ? `${t}-${ONES[u]}` : t;
    };

    const belowThousand = (n) => {
      if (n < 100) return belowHundred(n);
      const h = Math.floor(n / 100);
      const r = n % 100;
      return r
        ? `${ONES[h]} hundred and ${belowHundred(r)}`
        : `${ONES[h]} hundred`;
    };

    // International scale: thousand, million, billion, trillion
    const intToWords = (n) => {
      if (n === 0) return "zero";
      const parts = [];

      const trillion = Math.floor(n / 1_000_000_000_000);
      n %= 1_000_000_000_000;
      if (trillion) parts.push(`${intToWords(trillion)} trillion`);

      const billion = Math.floor(n / 1_000_000_000);
      n %= 1_000_000_000;
      if (billion) parts.push(`${intToWords(billion)} billion`);

      const million = Math.floor(n / 1_000_000);
      n %= 1_000_000;
      if (million) parts.push(`${intToWords(million)} million`);

      const thousand = Math.floor(n / 1_000);
      n %= 1_000;
      if (thousand) parts.push(`${intToWords(thousand)} thousand`);

      if (n > 0) parts.push(belowThousand(n));
      return parts.join(" ");
    };

    // Build output without any currency words
    let out;
    if (whole === 0 && frac > 0) {
      // e.g., 0.34 -> "Thirty-Four Only"
      out = `${sign}${belowHundred(frac)} only`;
    } else {
      out = `${sign}${intToWords(whole)}${
        frac > 0 ? ` and ${belowHundred(frac)}` : ""
      } only`;
    }

    // Title Case the output to match your examples
    out = out
      .split(" ")
      .map((w) =>
        w
          .split("-")
          .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
          .join("-"),
      )
      .join(" ");

    return out;
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);
    if (isNaN(date)) return "";

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months start from 0
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${dd}/${mm}/${yyyy}:${hh}:${min}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);
    if (isNaN(date)) return "";

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Months start from 0
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${dd}/${mm}/${yyyy}`;
  };

  const CompanyImgModule = () => {
    return (
      <img
        src={`${baseUrlNext}${ImageUrl}`}
        alt="LOGO"
        style={{ marginTop: "-35px" }}
        className="w-full"
      ></img>
    );
  };

  const ExportSeaQuotationEnquiryModule = ({ data }) => {
    const RequestDate =
      data && data.length > 0 ? new Date(data[0].rateRequestDate) : null;
    const DatesFormat = RequestDate
      ? `${RequestDate.getDate()}/${
          RequestDate.getMonth() + 1
        }/${RequestDate.getFullYear()}`
      : "";

    return (
      <div className="flex flex-wrap">
        <div className="w-1/2 px-2">
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th>Enquiry Date : </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].enquiryDate !== ""
                    ? data[0].enquiryDate
                    : ""}
                </td>
              </tr>
              <tr className="mt-2">
                <th>MODE OF WORK :</th>
                <td className="pl-5"></td>
              </tr>
              <tr>
                <th>POR :</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].plrName !== ""
                    ? data[0].plrName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>POL :</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].polName !== ""
                    ? data[0].polName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>POD :</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].podName !== ""
                    ? data[0].podName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>PICKUP ADDRESS :</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].pickupAddress !== ""
                    ? data[0].pickupAddress
                    : ""}
                </td>
              </tr>
              <tr>
                <th>STUFFING ADDRESS :</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].pickupAddress !== ""
                    ? data[0].pickupAddress
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-1/2 px-2">
          <table className="mt-1 ml-20 text-left text-xs">
            <tbody>
              <tr>
                <th>COMMODITY :</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].commodity !== ""
                    ? data[0].commodity
                    : ""}
                </td>
              </tr>
              <tr>
                <th>WEIGHT :</th>
                <td className="pl-5">{DatesFormat}</td>
              </tr>
              <tr>
                <th>EQPMT :</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].customerPerson !== ""
                    ? data[0].customerPerson
                    : ""}
                </td>
              </tr>
              <tr>
                <th>NO. OF EQPT :</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].customerPerson !== ""
                    ? data[0].customerPerson
                    : ""}
                </td>
              </tr>
              <tr>
                <th>REMARKS :</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].remarks !== ""
                    ? data[0].remarks
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-full px-2">
          <hr className="hrRow"></hr>
        </div>
      </div>
    );
  };
  ExportSeaQuotationEnquiryModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        rateRequestDate: PropTypes.string,
        customerName: PropTypes.string,
        rateRequestNo: PropTypes.string,
        customerPerson: PropTypes.string,
      }),
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  };

  const ExportSeaQuotationModule = ({ data }) => {
    const RequestDate =
      data && data.length > 0 ? new Date(data[0].rateRequestDate) : null;
    const DatesFormat = RequestDate
      ? `${RequestDate.getDate()}/${
          RequestDate.getMonth() + 1
        }/${RequestDate.getFullYear()}`
      : "";

    return (
      <div className="flex flex-wrap">
        <div className="w-1/2 px-2">
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th className="pr-8">Customer: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].customerName !== ""
                    ? data[0].customerName
                    : ""}
                </td>
              </tr>
              <tr className="mt-2">
                <th className="pr-8">ATTN:</th>
                <td className="pl-5"></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-1/2 px-2">
          <table className="mt-1 ml-20 text-left text-xs">
            <tbody>
              <tr>
                <th className="pr-5">Quotation No:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].rateRequestNo !== ""
                    ? data[0].rateRequestNo
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pr-5">Dated:</th>
                <td className="pl-5">{DatesFormat}</td>
              </tr>
              <tr>
                <th className="pr-5">Handled By:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].createdName !== ""
                    ? data[0].createdName
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-full px-2">
          <hr className="hrRow"></hr>
        </div>
      </div>
    );
  };
  ExportSeaQuotationModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        rateRequestDate: PropTypes.string,
        customerName: PropTypes.string,
        rateRequestNo: PropTypes.string,
        customerPerson: PropTypes.string,
      }),
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  };

  async function TarifffetchTermsAndConditions(
    clientCode,
    loginCompany,
    loginBranch,
    businessSegmentId,
  ) {
    const url = `${baseUrl}/api/validations/formControlValidation/fetchdata`;

    const requestBody = {
      tableName: "tblTermsCondition",
      whereCondition: {
        clientCode: clientCode,
        loginCompany: loginCompany,
        loginBranch: loginBranch,
        businessSegmentId: businessSegmentId,
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (data.success) {
        console.log("Terms and Conditions fetched successfully:", data.data);
        return data.data; // Return the fetched data
      } else {
        console.warn("Server returned success as false:", data.message);
        return null; // Return null if the server response is unsuccessful
      }
    } catch (error) {
      console.error("Error fetching terms and conditions:", error);
      return null; // Return null for errors
    }
  }

  const ExportShipperModule = ({ data }) => {
    return (
      <div className="mt-1 flex flex-wrap">
        <div className="w-1/2 px-2">
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th>Shipper:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0]?.shipperName !== ""
                    ? data[0]?.shipperName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Pickup Address:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0]?.pickupAddress !== ""
                    ? data[0]?.pickupAddress
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-1/2 px-2">
          <table className="mt-1 ml-20 text-left text-xs">
            <tbody>
              <tr>
                <th>Consignee:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].consigneeName !== ""
                    ? data[0].consigneeName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Delivery Address:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0]?.deliveryAddress !== ""
                    ? data[0]?.deliveryAddress
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  ExportShipperModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        businessSegmentName: PropTypes.string,
        pickupAddress: PropTypes.string,
        vendorId: PropTypes.string,
        deliveryAddress: PropTypes.string,
      }),
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  };

  const ExportShipperDetailsModule = ({ data }) => {
    let expectedSailDate;
    const formatDate = (date) => {
      if (!date) return ""; // Return empty string if date is null or undefined
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    if (data && data.length > 0 && data[0].expectedSailDate) {
      expectedSailDate = formatDate(data[0].expectedSailDate);
      console.log("Formatted Date: ", expectedSailDate);
    } else {
      console.log("Date is not available or data is undefined.");
      expectedSailDate = "";
    }

    return (
      <div>
        <div
          className="flex flex-wrap bg-gray-300 justify-center items-center mt-5 text-xs w-full tableBg "
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <th className="mt-1 mb-3">Shipment Details</th>
        </div>
        <div
          className=" flex flex-wrap "
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <div className="w-1/3 px-2 border-r border-black">
            <table className=" mt-1 text-left text-xs">
              <tr>
                <th>POR: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].plrName !== ""
                    ? data[0].plrName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>FPD: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].fpdName !== ""
                    ? data[0].fpdName
                    : ""}
                </td>
              </tr>

              <tr>
                <th>Cargo Type: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].cargoType !== ""
                    ? data[0].cargoType
                    : ""}
                </td>
              </tr>
            </table>
          </div>
          <div className="w-1/3 px-2 border-r border-black">
            <table className="mt-1 text-left text-xs">
              <tr>
                <th>POL:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].polName !== ""
                    ? data[0].polName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>EST Date:</th>
                <td className="pl-5">{expectedSailDate}</td>
              </tr>
              <tr>
                <th className="pb-3">Commodity:</th>
                <td className="pl-5 pb-3">
                  {data && data.length > 0 && data[0].commodity !== ""
                    ? data[0].commodity
                    : ""}
                </td>
              </tr>
            </table>
          </div>
          <div className="w-1/3 px-2">
            <table className="mt-1 text-left text-xs">
              <tr>
                <th>POD: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].podName !== ""
                    ? data[0].podName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Gross Weight:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].cargoWt !== ""
                    ? data[0].cargoWt
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Shipment Type: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].natureOfCargoName !== ""
                    ? data[0].natureOfCargoName
                    : ""}
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div className="text-xs w-full" style={{ border: "1px solid black" }}>
          <th className="pt-2 pb-3">
            Remarks:{" "}
            {data && data.length > 0 && data[0].remarks !== ""
              ? data[0].remarks
              : ""}{" "}
          </th>
        </div>
      </div>
    );
  };
  ExportShipperDetailsModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        validityFrom: PropTypes.string,
        validityTo: PropTypes.string,
        fpdName: PropTypes.string,
        cargoTypeName: PropTypes.string,
        containerStatusName: PropTypes.string,
        polName: PropTypes.string,
        commodity: PropTypes.string,
        podName: PropTypes.string,
        transitTime: PropTypes.string,
      }),
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  };

  const ExportShipperDetailsModuleAir = ({ data }) => {
    const FromDate =
      data && data.length > 0 ? new Date(data[0].validityFrom) : null;
    const FromDates = FromDate
      ? `${FromDate.getDate()}/${
          FromDate.getMonth() + 1
        }/${FromDate.getFullYear()}`
      : "";

    // const ToDate = data && data.length > 0 ? new Date(data[0].validityTo) : null;
    // const ToDates = ToDate ? `${ToDate.getDate()}/${ToDate.getMonth() + 1}/${ToDate.getFullYear()}` : '';

    return (
      <div>
        <div
          className="flex flex-wrap  justify-center items-center mt-5 text-xs w-full"
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <th className="mt-1">Shipment Details</th>
        </div>
        <div
          className=" flex flex-wrap "
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <div className="w-1/3 px-2 border-r border-black">
            <table className=" mt-1 text-left text-xs">
              <tr>
                <th>Orgin Airport:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].polName !== ""
                    ? data[0].polName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Transit Time: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].transitTime !== ""
                    ? data[0].transitTime
                    : ""}
                </td>
              </tr>

              <tr>
                <th>Cargo Type:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].cargoTypeName !== ""
                    ? data[0].cargoTypeName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Volume: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].volumeUnitNameCode !== ""
                    ? data[0].volumeUnitNameCode
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Validity From: </th>
                <td className="pl-5">{FromDates}</td>
              </tr>
              <tr>
                <th>Airline Line: </th>
                <td className="pl-5"></td>
              </tr>
            </table>
          </div>
          <div className="w-1/3 px-2 border-r border-black">
            <table className="mt-1 text-left text-xs">
              <tr>
                <th>Dest Airport:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].podName !== ""
                    ? data[0].podName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Commodity Type: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].commodityTypeName !== ""
                    ? data[0].commodityTypeName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Gross Wt:</th>
                <td className="pl-5"></td>
              </tr>
              <tr>
                <th>Volumetric Wt:</th>
                <td className="pl-5"></td>
              </tr>
            </table>
          </div>
          <div className="w-1/3 px-2 ">
            <table className="mt-1 text-left text-xs">
              <tr>
                <th>Routing: </th>
                <td className="pl-5"></td>
              </tr>
              <tr>
                <th>Commodity: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].commodity !== ""
                    ? data[0].commodity
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Chargeable Wt: </th>
                <td className="pl-5"> </td>
              </tr>
              <tr>
                <th>Trade Terms: </th>
                <td className="pl-5"></td>
              </tr>
            </table>
          </div>
        </div>

        <div className="text-xs w-full" style={{ border: "1px solid black" }}>
          <th className="pt-2">Remarks: </th>
        </div>
      </div>
    );
  };
  ExportShipperDetailsModuleAir.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        validityFrom: PropTypes.string,
        validityTo: PropTypes.string,
        polName: PropTypes.string,
        transitTime: PropTypes.string,
        cargoTypeName: PropTypes.string,
        volumeUnitNameCode: PropTypes.string,
        podName: PropTypes.string,
        commodityTypeName: PropTypes.string,
        commodity: PropTypes.string,
      }),
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  };

  const ExportSizeTypeModule = ({ data }) => {
    const rateRequestQty = data?.[0]?.tblRateRequestQty ?? [];

    if (rateRequestQty.length === 0) {
      return <div></div>;
    }

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0.5 text-left text-xs"
          style={{ border: "1px solid black", width: "50%" }}
        >
          <thead>
            <tr className="bg-gray-300">
              <th className="text-center border-black border-b border-r pb-2">
                Size / Type
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Gross Weight
              </th>
            </tr>
          </thead>
          <tbody>
            {rateRequestQty.map((item, index) => (
              <tr key={`item-${index}`}>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {`${item?.sizeName ?? ""} / ${item?.typeName ?? ""}`}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {item?.qty ? parseFloat(item.qty).toFixed(2) : ""}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {`${item?.cargoWt ?? ""} ${item?.wtUnitName ?? ""}`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    );
  };

  ExportSizeTypeModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        tblRateRequestQty: PropTypes.arrayOf(
          PropTypes.shape({
            sizeName: PropTypes.string,
            typeName: PropTypes.string,
            qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            wtUnitName: PropTypes.string,
          }),
        ),
      }),
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  };

  const ExportSizeTypeModuleAir = ({ data }) => {
    const rateRequestQty =
      data && data.length > 0 ? data[0].tblRateRequestQty : [];
    console.log("ak", rateRequestQty);

    //console.log(rateRequestQty)
    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0.5 text-left text-xs"
          style={{ border: "1px solid black", width: "100%" }}
        >
          <thead>
            <tr>
              <th className="text-center border-black border-b border-r ">
                No Of Packages{" "}
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Gross Weight
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                L x W x H
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Volume{" "}
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Volumetric Weight
              </th>
            </tr>
          </thead>
          <tbody>
            {rateRequestQty.map((item, index) => (
              <tr key={`item-${index}`}>
                <td className="text-right border-black border-b border-r pt-2">
                  {/* {item.qty !== null ? item.noOfPackages : ''} */}
                  {item.qty && item.noOfPackages !== ""
                    ? item.noOfPackages
                    : ""}
                </td>
                <td className="text-right border-black border-b border-r pt-2">
                  {item.qty !== null ? item.wtUnitName : ""}
                </td>
                <td className="text-right border-black border-b border-r pt-2"></td>
                <td className="text-right border-black border-b border-r pt-2">
                  {/* {item.qty !== null ? item.volume : ''} */}
                  {item.qty !== null
                    ? item.volume + " " + data[0].volumeUnitNameCode
                    : ""}
                </td>
                <td className="text-right border-black border-b border-r pt-2"></td>
              </tr>
            ))}
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    );
  };
  ExportSizeTypeModuleAir.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        tblRateRequestQty: PropTypes.arrayOf(
          PropTypes.shape({
            noOfPackages: PropTypes.string,
            qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            wtUnitName: PropTypes.string,
            volume: PropTypes.string,
            volumeUnitNameCode: PropTypes.string, // Add this line for volumeUnitNameCode
          }),
        ),
        volumeUnitNameCode: PropTypes.string, // Define volumeUnitNameCode at the top level of data
      }),
    ).isRequired,
  };

  const ExportChargeModuleAirLine = ({ data }) => {
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    console.log("1", rateRequestCharge);
    // Filter out records where vendorName is ''
    const filteredRateRequestCharge = rateRequestCharge.filter(
      (charge) => charge.vendorName !== "",
    );

    const sortedRateRequestCharge = filteredRateRequestCharge.sort((a, b) => {
      // Sort based on sellCurrencyName, excluding records with ''
      if (a.sellCurrencyName === "") return 1;
      if (b.sellCurrencyName === "") return -1;
      return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
    });

    const groupedCharges = sortedRateRequestCharge.reduce((acc, curr) => {
      const vendorName = curr.vendorName; // Use the actual vendorName, not ''
      if (!acc[vendorName]) {
        acc[vendorName] = [];
      }
      acc[vendorName].push(curr);
      return acc;
    }, {});

    const subtotals = {};
    Object.keys(groupedCharges).forEach((vendorName) => {
      groupedCharges[vendorName].forEach((charge) => {
        // const currency = charge.sellCurrencyName || '';
        if (!subtotals[vendorName]) {
          subtotals[vendorName] = { amount: 0, totalAmount: 0 };
        }
        subtotals[vendorName].amount += charge.sellAmount || 0;

        subtotals[vendorName].totalAmount += charge.sellTotalAmount || 0;
      });
    });

    // const grandTotal = rateRequestCharge.reduce((acc, charge) => acc + (charge.sellTotalAmount || 0), 0);
    // const grandTotalInWords = toWords(grandTotal);

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0 text-left text-xs"
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th className="text-center border-black border-b border-r pt-2">
                CHARGE DESCRIPTION
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Size/Type
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Curr
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Ex. Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Total Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Remarks:
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedCharges).map(([vendorName, charges]) => (
              <React.Fragment key={vendorName}>
                <tr>
                  <td
                    className="text-left border-black border-b border-r py-px font-bold"
                    colSpan={10}
                  >
                    {vendorName}
                  </td>
                </tr>
                {charges.map((item, index, array) => (
                  <React.Fragment key={`item-${index}`}>
                    <tr>
                      <td
                        className="px-3 border-black border-b border-r py-px"
                        style={{
                          maxWidth: "150px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.chargeName || ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {item.sizeName && item.sizeName !== ""
                          ? item.sizeName
                          : ""}{" "}
                        /{" "}
                        {item.typeCode &&
                        item.typeCode !== "" &&
                        item.typeCode !== "null"
                          ? item.typeCode
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.qty === "number" &&
                        item.qty !== null &&
                        item.qty !== ""
                          ? item.qty.toFixed(2)
                          : 0.0}
                      </td>
                      <td className="text-left border-black border-b border-r py-px">
                        {item.sellCurrencyName &&
                        item.sellCurrencyName !== "" &&
                        item.sellCurrencyName !== "null"
                          ? item.sellCurrencyName
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.sellExchangeRate === "number" &&
                        item.sellExchangeRate !== null &&
                        item.sellExchangeRate !== ""
                          ? item.sellExchangeRate.toFixed(2)
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.sellRate === "number" &&
                        item.sellRate !== null &&
                        item.sellRate !== ""
                          ? item.sellRate.toFixed(2)
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.sellAmount === "number" &&
                        item.sellAmount !== null &&
                        item.sellAmount !== ""
                          ? item.sellAmount.toFixed(2)
                          : ""}
                      </td>
                      {/* <td className="text-right border-black border-b border-r py-px">
                            {typeof item.sellTaxAmount === 'number' && item.sellTaxAmount !== null && item.sellTaxAmount !== '' ? item.sellTaxAmount.toFixed(2) : ''}
                          </td> */}
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.sellTotalAmount === "number" &&
                        item.sellTotalAmount !== null &&
                        item.sellTotalAmount !== ""
                          ? item.sellTotalAmount.toFixed(2)
                          : ""}
                      </td>
                      <td
                        className="text-left border-black border-b border-r py-px"
                        style={{
                          maxWidth: "150px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.remarks &&
                        item.remarks !== "" &&
                        item.remarks !== "null"
                          ? item.remarks
                          : ""}
                      </td>
                    </tr>
                    {index === array.length - 1 && (
                      <tr>
                        <td
                          className="border-black border-b border-r font-bold py-px"
                          colSpan={6}
                        >
                          Total {item.sellCurrencyName}:
                        </td>
                        <td
                          className="text-right border-black border-b border-r py-px"
                          colSpan={1}
                        >
                          {subtotals[vendorName].amount.toFixed(2)}
                        </td>
                        {/* <td className="text-right border-black border-b border-r py-px" colSpan={1}>{subtotals[vendorName].taxAmount.toFixed(2)}</td> */}
                        <td
                          className="text-right border-black border-b border-r py-px"
                          colSpan={1}
                        >
                          {subtotals[vendorName].totalAmount.toFixed(2)}
                        </td>
                        <td
                          className="text-right border-black border-b border-r py-px"
                          colSpan={1}
                        ></td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  ExportChargeModuleAirLine.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        tblRateRequestCharge: PropTypes.arrayOf(
          PropTypes.shape({
            chargeName: PropTypes.string,
            sizeName: PropTypes.string,
            typeCode: PropTypes.string,
            qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            sellCurrencyName: PropTypes.string,
            sellExchangeRate: PropTypes.number,
            sellRate: PropTypes.number,
            sellAmount: PropTypes.number,
            sellTotalAmount: PropTypes.number,
            remarks: PropTypes.string,
          }),
        ),
      }),
    ).isRequired,
  };

  const TransportInstructionsAirModule = ({ data }) => {
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    if (!Array.isArray(data) || data.length === 0) {
      console.error("data is not an array or is empty");
      return <div>.</div>;
    }

    // Check if any quotationFlag is true
    const hasQuotationFlagTrue = data.some((item) =>
      item.tblRateRequestCharge.some((charge) => charge.quotationFlag === true),
    );

    // If no quotationFlag is true, return an empty div
    if (!hasQuotationFlagTrue) {
      return <div>.</div>;
    }

    // Check if 'OCEAN FREIGHT' is present in the data
    const hasOceanFreight = data.some((item) =>
      item.tblRateRequestCharge.some(
        (charge) =>
          charge.quotationFlag === true &&
          charge.chargeName?.toLowerCase().includes("freight"),
      ),
    );

    if (!hasOceanFreight) {
      // const groupedCharges = rateRequestCharge.reduce((acc, charge) => {
      //     const group = charge.chargeGroupName || 'N/A';
      //     if (!acc[group]) {
      //         acc[group] = [];
      //     }
      //     acc[group].push(charge);
      //     return acc;
      // }, {});

      const groupedCharges = rateRequestCharge.reduce((acc, charge) => {
        // Check if chargeName includes 'FREIGHT' and skip it if true
        if (
          charge.chargeName &&
          charge.chargeName?.toLowerCase().includes("freight")
        ) {
          return acc; // Skip this charge
        }

        const group = charge.chargeGroupName || "";
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(charge);

        return acc;
      }, {});

      // Calculate subtotal for each charge group
      const subtotals = Object.keys(groupedCharges).map((groupName) => {
        const groupCharges = groupedCharges[groupName];
        return {
          groupName,
          buyRateInrSubtotal: groupCharges.reduce(
            (acc, charge) => acc + (charge.buyAmountHc || 0),
            0,
          ),
          buyRateUsdSubtotal: groupCharges.reduce(
            (acc, charge) => acc + (charge.buyAmount || 0),
            0,
          ),
          sellRateInrSubtotal: groupCharges.reduce(
            (acc, charge) => acc + (charge.sellAmountHc || 0),
            0,
          ),
          sellRateUsdSubtotal: groupCharges.reduce(
            (acc, charge) => acc + (charge.sellAmount || 0),
            0,
          ),
        };
      });

      // Calculate overall total
      const total = subtotals.reduce(
        (acc, subtotal) => {
          acc.buyRateInrTotal += subtotal.buyRateInrSubtotal;
          acc.buyRateUsdTotal += subtotal.buyRateUsdSubtotal;
          acc.sellRateInrTotal += subtotal.sellRateInrSubtotal;
          acc.sellRateUsdTotal += subtotal.sellRateUsdSubtotal;
          return acc;
        },
        {
          buyRateInrTotal: 0,
          buyRateUsdTotal: 0,
          sellRateInrTotal: 0,
          sellRateUsdTotal: 0,
        },
      );
      return (
        <div className="dynamic_table mt-2" style={{ width: "100%" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid black",
                fontSize: "10px",
              }}
            >
              <thead
                style={{
                  backgroundColor: "#d1d5db",
                  border: "1px solid black",
                }}
              >
                <tr style={{ border: "1px solid black" }}>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    CHARGE GROUP
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    CHARGES
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    SIZE/TYPE
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    BUY RATE INR
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    BUY RATE USD
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    SELL RATE INR
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    SELL RATE USD
                  </th>
                </tr>
              </thead>
              <tbody>
                {subtotals.map((subtotal, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {groupedCharges[subtotal.groupName].map(
                      (charge, rowIndex) => (
                        <tr
                          key={rowIndex}
                          style={{ border: "1px solid black" }}
                        >
                          {rowIndex === 0 && (
                            <td
                              style={{
                                padding: "5px",
                                border: "1px solid black",
                              }}
                              rowSpan={
                                groupedCharges[subtotal.groupName].length
                              }
                            >
                              {charge.chargeGroupName || ""}
                            </td>
                          )}
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                            }}
                          >
                            {charge.chargeName || ""}
                          </td>
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "center",
                            }}
                          >
                            {charge.sizeName || " "} / {charge.typeName || " "}
                          </td>
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "right",
                            }}
                          >
                            {(charge.buyAmountHc || 0).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "right",
                            }}
                          >
                            {(charge.buyAmount || 0).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "right",
                            }}
                          >
                            {(charge.sellAmountHc || 0).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "right",
                            }}
                          >
                            {(charge.sellAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ),
                    )}
                    {/* Subtotal Row */}
                    <tr
                      style={{
                        border: "1px solid black",
                        fontWeight: "bold",
                        backgroundColor: "#e5e7eb",
                      }}
                    >
                      <td
                        style={{ padding: "5px", border: "1px solid black" }}
                        colSpan="3"
                      >
                        {subtotal.groupName} Sub Total
                      </td>
                      <td
                        style={{
                          padding: "5px",
                          border: "1px solid black",
                          textAlign: "right",
                        }}
                      >
                        {subtotal.buyRateInrSubtotal.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "5px",
                          border: "1px solid black",
                          textAlign: "right",
                        }}
                      >
                        {subtotal.buyRateUsdSubtotal.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "5px",
                          border: "1px solid black",
                          textAlign: "right",
                        }}
                      >
                        {subtotal.sellRateInrSubtotal.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "5px",
                          border: "1px solid black",
                          textAlign: "right",
                        }}
                      >
                        {subtotal.sellRateUsdSubtotal.toFixed(2)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                {/* Total Row */}
                <tr
                  style={{
                    border: "1px solid black",
                    fontWeight: "bold",
                    backgroundColor: "#d1d5db",
                  }}
                >
                  <td
                    style={{ padding: "5px", border: "1px solid black" }}
                    colSpan="3"
                  >
                    Grand Total
                  </td>
                  <td
                    style={{
                      padding: "5px",
                      border: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    {total.buyRateInrTotal.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "5px",
                      border: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    {total.buyRateUsdTotal.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "5px",
                      border: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    {total.sellRateInrTotal.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "5px",
                      border: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    {total.sellRateUsdTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Filtering charges where quotationFlag is true
    const allCharges = useMemo(
      () =>
        data
          .flatMap((item) => item.tblRateRequestCharge)
          .filter((charge) => charge.quotationFlag === true),
      [data],
    );

    // Handling Sea Freight with distinct logic
    const oceanFreightCharges = useMemo(
      () =>
        allCharges
          .filter((charge) =>
            charge.chargeGroupName.toLowerCase().includes("freight"),
          )
          .reduce((acc, charge) => {
            const key = `${charge.chargeName}-${charge.sizeName}-${charge.typeName}`;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(charge);
            return acc;
          }, {}),
      [allCharges],
    );

    // Handling other charges without distinct logic
    const otherCharges = useMemo(
      () =>
        allCharges
          .filter(
            (charge) =>
              !charge.chargeGroupName.toLowerCase().includes("freight"),
          )
          .reduce((acc, charge) => {
            acc.push(charge);
            return acc;
          }, []),
      [allCharges],
    );

    const combinedCharges = useMemo(
      () => [...Object.values(oceanFreightCharges).flat(), ...otherCharges],
      [oceanFreightCharges, otherCharges],
    );

    // Get unique vendors specific to OCEAN FREIGHT charges
    const oceanFreightVendors = useMemo(() => {
      return [
        ...new Set(
          Object.values(oceanFreightCharges)
            .flat()
            .filter((charge) =>
              charge.chargeName?.toLowerCase().includes("freight"),
            )
            .map((charge) => charge.vendorName),
        ),
      ].sort();
    }, [oceanFreightCharges]);

    // Initialize grand totals for all vendors
    const grandTotals = useMemo(() => {
      return oceanFreightVendors.reduce((totals, vendor) => {
        totals[vendor] = {
          buyRateInr: 0,
          buyRateUsd: 0,
          sellRateInr: 0,
          sellRateUsd: 0,
        };
        return totals;
      }, {});
    }, [oceanFreightVendors]);

    const groupedCharges = useMemo(() => {
      return combinedCharges.reduce((acc, charge) => {
        const key = charge.chargeGroupName.toLowerCase().includes("freight")
          ? `${charge.chargeGroupName}-${charge.chargeName}-${charge.sizeName}-${charge.typeName}`
          : `${charge.chargeGroupName}-${charge.chargeName}-${charge.vendorName}-${charge.sizeName}-${charge.typeName}`;

        if (!acc[key]) {
          acc[key] = {
            chargeGroupName: charge.chargeGroupName,
            chargeName: charge.chargeName,
            sizeName: charge.sizeName,
            typeName: charge.typeName,
            vendors: {},
          };
        }

        // Handle the logic where rates should be consistent across all vendors for other charge groups
        if (!charge.chargeGroupName.toLowerCase().includes("freight")) {
          oceanFreightVendors.forEach((vendor) => {
            acc[key].vendors[vendor] = {
              buyRateInr: charge.buyAmountHc ?? 0,
              buyRateUsd: charge.buyAmount ?? 0,
              sellRateInr: charge.sellAmountHc ?? 0,
              sellRateUsd: charge.sellAmount ?? 0,
            };
          });
        } else {
          acc[key].vendors[charge.vendorName] = {
            buyRateInr: charge.buyAmountHc ?? 0,
            buyRateUsd: charge.buyAmount ?? 0,
            sellRateInr: charge.sellAmountHc ?? 0,
            sellRateUsd: charge.sellAmount ?? 0,
          };
        }
        return acc;
      }, {});
    }, [combinedCharges]);

    const rows = useMemo(() => {
      const rowAccumulator = [];
      let subTotals = oceanFreightVendors.reduce((acc, vendor) => {
        acc[vendor] = {
          buyRateInr: 0,
          buyRateUsd: 0,
          sellRateInr: 0,
          sellRateUsd: 0,
        };
        return acc;
      }, {});

      // Count how many rows each charge group will span
      const chargeGroupRowSpans = {};
      Object.values(groupedCharges).forEach((chargeGroup) => {
        if (!chargeGroupRowSpans[chargeGroup.chargeGroupName]) {
          chargeGroupRowSpans[chargeGroup.chargeGroupName] = 0;
        }
        chargeGroupRowSpans[chargeGroup.chargeGroupName]++;
      });

      let currentChargeGroup = null;
      let currentRowSpan = 0;

      Object.entries(groupedCharges).forEach(([key, chargeGroup], index) => {
        const { chargeGroupName, chargeName, sizeName, typeName, vendors } =
          chargeGroup;

        const showChargeGroup = currentChargeGroup !== chargeGroupName;
        if (showChargeGroup) {
          currentChargeGroup = chargeGroupName;
          currentRowSpan = chargeGroupRowSpans[chargeGroupName];
        }

        const chargeRow = (
          <tr
            className="border-collapse border border-black p-2 text-xs"
            key={key}
          >
            {showChargeGroup ? (
              <td
                className="border-collapse border border-black p-2 text-xs"
                rowSpan={currentRowSpan}
              >
                {chargeGroupName}
              </td>
            ) : null}
            <td className="border-collapse border border-black p-2 text-xs">
              {chargeName}
            </td>
            <td className="border-collapse border border-black p-2 text-center text-xs">
              {`${sizeName || " "} / ${typeName || " "}`}
            </td>
            {oceanFreightVendors.map((vendor, colIndex) => {
              const vendorRates = vendors[vendor] || {
                buyRateInr: 0,
                buyRateUsd: 0,
                sellRateInr: 0,
                sellRateUsd: 0,
              };
              subTotals[vendor].buyRateInr += vendorRates.buyRateInr;
              subTotals[vendor].buyRateUsd += vendorRates.buyRateUsd;
              subTotals[vendor].sellRateInr += vendorRates.sellRateInr;
              subTotals[vendor].sellRateUsd += vendorRates.sellRateUsd;

              grandTotals[vendor].buyRateInr += vendorRates.buyRateInr;
              grandTotals[vendor].buyRateUsd += vendorRates.buyRateUsd;
              grandTotals[vendor].sellRateInr += vendorRates.sellRateInr;
              grandTotals[vendor].sellRateUsd += vendorRates.sellRateUsd;

              return (
                <React.Fragment key={colIndex}>
                  <td className="border-collapse border border-black text-right text-xs">
                    <div className="p-2">
                      {vendorRates.buyRateUsd.toFixed(2)}
                    </div>
                    <hr
                      style={{
                        width: "100%",
                        height: "1px",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        backgroundColor: "black",
                      }}
                    />
                    <div className="p-2">
                      {vendorRates.buyRateInr.toFixed(2)}
                    </div>
                  </td>
                  <td className="border-collapse border border-black text-right text-xs">
                    <div className="p-2">
                      {vendorRates.sellRateUsd.toFixed(2)}
                    </div>
                    <hr
                      style={{
                        width: "100%",
                        height: "1px",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        backgroundColor: "black",
                      }}
                    />
                    <div className="p-2">
                      {vendorRates.sellRateInr.toFixed(2)}
                    </div>
                  </td>
                </React.Fragment>
              );
            })}
          </tr>
        );

        rowAccumulator.push(chargeRow);

        // Check if next item belongs to a different charge group
        if (
          index === Object.entries(groupedCharges).length - 1 || // If it's the last item
          Object.entries(groupedCharges)[index + 1][1].chargeGroupName !==
            chargeGroupName // or the next item has a different charge group
        ) {
          const subTotalRow = (
            <tr
              className="border-collapse border-2 border-black p-2 font-bold bg-gray-200"
              key={`subtotal-${chargeGroupName}`}
            >
              <td
                className="border-collapse border border-black p-2"
                colSpan={3}
              >
                {chargeGroupName} Sub Total
              </td>
              {oceanFreightVendors.map((vendor, index) => (
                <React.Fragment key={index}>
                  <td className="border-collapse border border-black text-right text-xs">
                    <div className="p-2">
                      {subTotals[vendor].buyRateUsd.toFixed(2)}
                    </div>
                    <hr
                      style={{
                        width: "100%",
                        height: "0.5px",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        backgroundColor: "black",
                      }}
                    />
                    <div className="p-2">
                      {subTotals[vendor].buyRateInr.toFixed(2)}
                    </div>
                  </td>

                  <td className="border-collapse border border-black text-right text-xs">
                    <div className="p-2">
                      {subTotals[vendor].sellRateUsd.toFixed(2)}
                    </div>
                    <hr
                      style={{
                        width: "100%",
                        height: "0.5px",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        backgroundColor: "black",
                      }}
                    />
                    <div className="p-2">
                      {subTotals[vendor].sellRateInr.toFixed(2)}
                    </div>
                  </td>
                </React.Fragment>
              ))}
            </tr>
          );
          rowAccumulator.push(subTotalRow);

          // Reset subTotals for the next charge group
          subTotals = oceanFreightVendors.reduce((acc, vendor) => {
            acc[vendor] = {
              buyRateInr: 0,
              buyRateUsd: 0,
              sellRateInr: 0,
              sellRateUsd: 0,
            };
            return acc;
          }, {});
        }
      });

      // Add grand total row
      const grandTotalRow = (
        <tr
          className="border-collapse border-2 border-black p-2 font-bold bg-gray-300"
          key="grand-total"
        >
          <td className="border-collapse border border-black p-2" colSpan={3}>
            GRAND TOTAL
          </td>
          {oceanFreightVendors.map((vendor, index) => (
            <React.Fragment key={index}>
              <td className="border-collapse border border-black text-right text-xs">
                <div className="p-2">
                  {grandTotals[vendor].buyRateUsd.toFixed(2)}
                </div>
                <hr
                  style={{
                    width: "100%",
                    height: "0.5px",
                    margin: 0,
                    padding: 0,
                    border: "none",
                    backgroundColor: "black",
                  }}
                />
                <div className="p-2">
                  {grandTotals[vendor].buyRateInr.toFixed(2)}
                </div>
              </td>

              <td className="border-collapse border border-black text-right text-xs">
                <div className="p-2">
                  {grandTotals[vendor].sellRateUsd.toFixed(2)}
                </div>
                <hr
                  style={{
                    width: "100%",
                    height: "0.5px",
                    margin: 0,
                    padding: 0,
                    border: "none",
                    backgroundColor: "black",
                  }}
                />
                <div className="p-2">
                  {grandTotals[vendor].sellRateInr.toFixed(2)}
                </div>
              </td>
            </React.Fragment>
          ))}
        </tr>
      );

      rowAccumulator.push(grandTotalRow);

      return rowAccumulator;
    }, [groupedCharges, oceanFreightVendors, grandTotals]);

    return (
      <div className="dynamic_table">
        <div className="overflow-x-auto mt-2">
          <div className="w-full">
            <div className="overflow-x-scroll">
              <table className="min-w-full table-auto border-collapse border border-black p-2 text-xs">
                <thead className="border-collapse border border-black p-2">
                  <tr className="border-collapse border border-black p-2 bg-gray-300">
                    <th
                      className="border-collapse border border-black p-2"
                      rowSpan={2}
                    >
                      CHARGE GROUP
                    </th>
                    <th
                      className="border-collapse border border-black p-2 w-40"
                      rowSpan={2}
                    >
                      CHARGES
                    </th>
                    <th
                      className="border-collapse border border-black p-2"
                      rowSpan={2}
                    >
                      SIZE/TYPE
                    </th>
                    {oceanFreightVendors.map((vendor, index) => (
                      <th
                        className="border-collapse border border-black p-2"
                        colSpan={2}
                        key={index}
                      >
                        {vendor}
                      </th>
                    ))}
                  </tr>
                  <tr className="border-collapse border border-black p-2 bg-gray-300">
                    {oceanFreightVendors.map((vendor, index) => (
                      <React.Fragment key={index}>
                        <th className="border-collapse border border-black p-2">
                          Buy Rate <br />
                          USD / INR
                        </th>
                        <th className="border-collapse border border-black p-2">
                          Sell Rate <br />
                          USD / INR
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TransportInstructionsDepartmentModule = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("data is not an array or is empty");
      return <div>.</div>;
    }

    // Check if any quotationFlag is true
    const hasQuotationFlagTrue = data.some((item) =>
      item.tblRateRequestCharge.some((charge) => charge.quotationFlag === true),
    );

    // If no quotationFlag is true, return an empty div
    if (!hasQuotationFlagTrue) {
      return <div>.</div>;
    }

    // Check if 'OCEAN FREIGHT' is present in the data
    // const hasOceanFreight = data.some(item =>
    //     item.tblRateRequestCharge.some(charge => charge.chargeName.toLowerCase().includes('freight'))
    // );

    // Check if 'OCEAN FREIGHT' is present in the data with the condition that quotationFlag is true
    const hasOceanFreight = data.some((item) =>
      item.tblRateRequestCharge.some(
        (charge) =>
          charge.quotationFlag === true &&
          charge.chargeName?.toLowerCase().includes("freight"),
      ),
    );

    if (!hasOceanFreight) {
      // Code for handling when 'OCEAN FREIGHT' is not present
      const allCharges = useMemo(
        () =>
          data
            .flatMap((item) => item.tblRateRequestCharge)
            .filter((charge) => charge.quotationFlag === true),
        [data],
      );

      // const groupedCharges = useMemo(() => {
      //   return allCharges.reduce((acc, charge) => {
      //     const { chargeGroupName } = charge;
      //     if (!acc[chargeGroupName]) acc[chargeGroupName] = [];
      //     acc[chargeGroupName].push(charge);
      //     return acc;
      //   }, {});
      // }, [allCharges]);

      const groupedCharges = useMemo(() => {
        return allCharges.reduce((acc, charge) => {
          const chargeGroupName = charge?.chargeGroupName ?? ""; // Replace null/undefined with empty string
          if (!acc[chargeGroupName]) acc[chargeGroupName] = [];
          acc[chargeGroupName].push(charge);
          return acc;
        }, {});
      }, [allCharges]);

      const rows = useMemo(() => {
        const rowAccumulator = [];
        let grandTotal = 0;

        Object.entries(groupedCharges).forEach(([groupName, charges]) => {
          const rowSpan = charges.length;
          let groupTotal = 0;

          const safeGroupName = groupName ?? "";
          console.log("brother", safeGroupName);
          console.log("groupedCharges", groupedCharges);
          charges.forEach((charge, index) => {
            const chargeRow = (
              <tr
                className="border-collapse border border-black p-2 text-xs"
                key={`${groupName}-${index}`}
              >
                {index === 0 && (
                  <td
                    className="border-collapse border border-black p-2 text-xs"
                    rowSpan={rowSpan}
                  >
                    {safeGroupName}
                  </td>
                )}
                <td className="border-collapse border border-black p-2 text-xs">
                  {charge.chargeName}
                </td>
                <td className="border-collapse border border-black p-2 text-center text-xs">
                  {`${charge.sizeName || " "} / ${charge.typeName || " "}`}
                </td>
                <td className="border-collapse border border-black p-2 text-right text-xs">
                  {charge.sellRate?.toFixed(2) || "0.00"}
                </td>
              </tr>
            );

            groupTotal += charge.sellRate || 0;
            grandTotal += charge.sellRate || 0;
            rowAccumulator.push(chargeRow);
          });

          // Add subtotal row for the group with merged columns
          const subtotalRow = (
            <tr
              className="border-collapse border-2 border-black p-2 font-bold bg-gray-200"
              key={`subtotal-${groupName}`}
            >
              <td
                className="border-collapse border border-black p-2"
                colSpan={3}
              >
                {groupName} Sub Total
              </td>
              <td className="border-collapse border border-black p-2 text-right">
                {groupTotal.toFixed(2) || "0.00"}
              </td>
            </tr>
          );

          rowAccumulator.push(subtotalRow);
        });

        // Add grand total row for all groups
        const grandTotalRow = (
          <tr
            className="border-collapse border-2 border-black p-2 font-bold bg-gray-300"
            key="grand-total"
          >
            <td className="border-collapse border border-black p-2" colSpan={3}>
              GRAND TOTAL
            </td>
            <td className="border-collapse border border-black p-2 text-right">
              {grandTotal.toFixed(2)}
            </td>
          </tr>
        );

        rowAccumulator.push(grandTotalRow);

        return rowAccumulator;
      }, [groupedCharges]);

      return (
        <div className="overflow-x-auto mt-1">
          <div className="w-full">
            <div className="overflow-x-scroll">
              <table className="min-w-full table-auto border-collapse border border-black p-2 text-xs">
                <thead className="border-collapse border border-black p-2">
                  <tr className="border-collapse border border-black p-2 bg-gray-300">
                    <th
                      className="border-collapse border border-black p-2"
                      colSpan={3}
                    >
                      CHARGES
                    </th>
                    <th
                      className="border-collapse border border-black p-2"
                      rowSpan={2}
                    >
                      SELL RATE
                    </th>
                  </tr>
                  <tr className="border-collapse border border-black p-2 bg-gray-300">
                    <th className="border-collapse border border-black p-2 w-40">
                      CHARGE GROUP
                    </th>
                    <th className="border-collapse border border-black p-2 w-40">
                      CHARGES
                    </th>
                    <th className="border-collapse border border-black p-2">
                      SIZE/TYPE
                    </th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    // Filtering charges where quotationFlag is true
    const allCharges = useMemo(
      () =>
        data
          .flatMap((item) => item.tblRateRequestCharge)
          .filter((charge) => charge.quotationFlag === true),
      [data],
    );

    // Filtering and ensuring distinct rows for Sea Freight
    const oceanFreightCharges = useMemo(
      () =>
        allCharges
          .filter((charge) =>
            charge?.chargeGroupName?.toLowerCase().includes("freight"),
          )
          .reduce((acc, charge) => {
            const key = `${charge?.chargeName}-${charge?.sizeName}-${charge?.typeName}`;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(charge);
            return acc;
          }, {}),
      [allCharges],
    );

    // const otherCharges = useMemo(
    //   () =>
    //     allCharges.filter(
    //       (charge) => !charge.chargeGroupName.toLowerCase().includes("freight")
    //     ),
    //   [allCharges]
    // );

    const otherCharges = useMemo(
      () =>
        allCharges.filter(
          (charge) =>
            !(
              charge.chargeGroupName &&
              charge.chargeGroupName.toLowerCase().includes("freight")
            ),
        ),
      [allCharges],
    );

    // Flatten the distinct Sea Freight charges
    const combinedCharges = useMemo(
      () => [...Object.values(oceanFreightCharges).flat(), ...otherCharges],
      [oceanFreightCharges, otherCharges],
    );

    // Get unique vendors specific to OCEAN FREIGHT charges
    const oceanFreightVendors = useMemo(() => {
      return [
        ...new Set(
          Object.values(oceanFreightCharges)
            .flat()
            .filter((charge) =>
              charge.chargeName?.toLowerCase().includes("freight"),
            )
            .map((charge) => charge.vendorName),
        ),
      ].sort();
    }, [oceanFreightCharges]);

    // Initialize grand totals for all vendors
    const grandTotals = useMemo(() => {
      return oceanFreightVendors.reduce((totals, vendor) => {
        totals[vendor] = 0;
        return totals;
      }, {});
    }, [oceanFreightVendors]);
    const safe = (val) => val || "";
    const groupedCharges = useMemo(() => {
      return combinedCharges.reduce((acc, charge) => {
        const key = safe(charge?.chargeGroupName)
          .toLowerCase()
          .includes("freight")
          ? `${safe(charge.chargeGroupName)}-${safe(charge.chargeName)}-${safe(
              charge.sizeName,
            )}-${safe(charge.typeName)}`
          : `${safe(charge.chargeGroupName)}-${safe(charge.chargeName)}-${safe(
              charge.vendorName,
            )}-${safe(charge.sizeName)}-${safe(charge.typeName)}`;

        if (!acc[key]) {
          acc[key] = {
            chargeGroupName: charge.chargeGroupName,
            chargeName: charge.chargeName,
            sizeName: charge.sizeName,
            typeName: charge.typeName,
            vendors: {},
            sellRate: charge.sellRate,
          };
        }

        acc[key].vendors[charge.vendorName] = charge.sellRate;
        return acc;
      }, {});
    }, [combinedCharges]);

    const rows = useMemo(() => {
      const rowAccumulator = [];
      let subTotals = oceanFreightVendors.reduce((acc, vendor) => {
        acc[vendor] = 0;
        return acc;
      }, {});

      // Count how many rows each charge group will span
      const chargeGroupRowSpans = {};
      Object.values(groupedCharges).forEach((chargeGroup) => {
        if (!chargeGroupRowSpans[chargeGroup.chargeGroupName]) {
          chargeGroupRowSpans[chargeGroup.chargeGroupName] = 0;
        }
        chargeGroupRowSpans[chargeGroup.chargeGroupName]++;
      });

      let currentChargeGroup = null;
      let currentRowSpan = 0;

      Object.entries(groupedCharges).forEach(([key, chargeGroup], index) => {
        const {
          chargeGroupName,
          chargeName,
          sizeName,
          typeName,
          vendors,
          sellRate,
        } = chargeGroup;

        const showChargeGroup = currentChargeGroup !== chargeGroupName;
        if (showChargeGroup) {
          currentChargeGroup = chargeGroupName;
          currentRowSpan = chargeGroupRowSpans[chargeGroupName];
        }

        const chargeRow = (
          <tr
            className="border-collapse border border-black p-2 text-xs"
            key={key}
          >
            {showChargeGroup ? (
              <td
                className="border-collapse border border-black p-2 text-xs"
                rowSpan={currentRowSpan}
              >
                {chargeGroupName}
              </td>
            ) : (
              ""
            )}
            <td className="border-collapse border border-black p-2 text-xs">
              {chargeName}
            </td>
            <td className="border-collapse border border-black p-2 text-center text-xs">
              {`${sizeName || " "} / ${typeName || " "}`}
            </td>
            {(chargeGroupName?.toLowerCase() || "").includes("freight")
              ? oceanFreightVendors.map((vendor, colIndex) => {
                  const vendorSellRate = vendors[vendor] || 0;
                  grandTotals[vendor] += vendorSellRate;
                  subTotals[vendor] += vendorSellRate;

                  return (
                    <td
                      className="border-collapse border border-black p-2 text-right text-xs"
                      key={colIndex}
                    >
                      {vendorSellRate.toFixed(2)}
                    </td>
                  );
                })
              : oceanFreightVendors.map((vendor, colIndex) => {
                  subTotals[vendor] += sellRate;
                  grandTotals[vendor] += sellRate;

                  return (
                    <td
                      className="border-collapse border border-black p-2 text-right text-xs"
                      key={colIndex}
                    >
                      {(sellRate ?? 0).toFixed(2)}
                    </td>
                  );
                })}
          </tr>
        );

        rowAccumulator.push(chargeRow);

        // Check if next item belongs to a different charge group
        if (
          index === Object.entries(groupedCharges).length - 1 || // If it's the last item
          Object.entries(groupedCharges)[index + 1][1].chargeGroupName !==
            chargeGroupName // or the next item has a different charge group
        ) {
          const subTotalRow = (
            <tr
              className="border-collapse border-2 border-black p-2 font-bold bg-gray-200"
              key={`subtotal-${chargeGroupName}`}
            >
              <td
                className="border-collapse border border-black p-2"
                colSpan={3}
              >
                {chargeGroupName} Sub Total
              </td>
              {oceanFreightVendors.map((vendor, index) => (
                <td
                  className="border-collapse border border-black p-2 text-right"
                  key={index}
                >
                  {subTotals[vendor].toFixed(2)}
                </td>
              ))}
            </tr>
          );
          rowAccumulator.push(subTotalRow);

          // Reset subTotals for the next charge group
          subTotals = oceanFreightVendors.reduce((acc, vendor) => {
            acc[vendor] = 0;
            return acc;
          }, {});
        }
      });

      // Add grand total row
      const grandTotalRow = (
        <tr
          className="border-collapse border-2 border-black p-2 font-bold bg-gray-300"
          key="grand-total"
        >
          <td className="border-collapse border border-black p-2" colSpan={3}>
            GRAND TOTAL
          </td>
          {oceanFreightVendors.map((vendor, index) => (
            <td
              className="border-collapse border border-black p-2 text-right"
              key={index}
            >
              {grandTotals[vendor].toFixed(2)}
            </td>
          ))}
        </tr>
      );

      rowAccumulator.push(grandTotalRow);

      return rowAccumulator;
    }, [groupedCharges, oceanFreightVendors, grandTotals]);

    return (
      <div className="overflow-x-auto mt-1">
        <div className="w-full">
          <div className="overflow-x-scroll">
            <table className="min-w-full table-auto border-collapse border border-black p-2 text-xs">
              <thead className="border-collapse border border-black p-2">
                <tr className="border-collapse border border-black p-2 bg-gray-300">
                  <th
                    className="border-collapse border border-black p-2"
                    rowSpan={2}
                  >
                    CHARGE GROUP
                  </th>
                  <th
                    className="border-collapse border border-black p-2 w-40"
                    rowSpan={2}
                  >
                    CHARGES
                  </th>
                  <th
                    className="border-collapse border border-black p-2"
                    rowSpan={2}
                  >
                    SIZE/TYPE
                  </th>
                  {oceanFreightVendors.map((vendor, index) => (
                    <th
                      className="border-collapse border border-black p-2"
                      colSpan={1}
                      key={index}
                    >
                      {vendor}
                    </th>
                  ))}
                </tr>
                <tr className="border-collapse border border-black p-2 bg-gray-300">
                  {oceanFreightVendors.map((vendor, index) => (
                    <th
                      className="border-collapse border border-black p-2"
                      key={index}
                    >
                      SELL RATE
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ExportSeaQuotationModuleRFQ = ({ data }) => {
    const RequestDate =
      data && data.length > 0 ? new Date(data[0].rateRequestDate) : null;
    const DatesFormat = RequestDate
      ? `${RequestDate.getDate()}/${
          RequestDate.getMonth() + 1
        }/${RequestDate.getFullYear()}`
      : "";

    return (
      <div className="flex flex-wrap">
        <div className="w-1/3 px-2">
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th>Quotation No:</th>
                <td>
                  {data && data.length > 0 && data[0].rateRequestNo !== ""
                    ? data[0].rateRequestNo
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-1/3 px-2"></div>
        <div className="w-1/3 px-2">
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th>Dated:</th>
                <td>{DatesFormat}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const ExportShipperDetailsModuleRFQ = ({ data }) => {
    let expectedSailDate;
    const formatDate = (date) => {
      if (!date) return ""; // Return empty string if date is null or undefined
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    if (data && data.length > 0 && data[0].expectedSailDate) {
      expectedSailDate = formatDate(data[0].expectedSailDate);
    } else {
      console.log("Date is not available or data is undefined.");
      expectedSailDate = "";
    }

    return (
      <div>
        <div className="flex flex-col md:flex-row flex-wrap border border-black">
          <div className="w-full md:w-1/3 px-2 border-b md:border-b-0 md:border-r border-black pb-3">
            <table className="mt-1 text-left text-xs w-full table-auto">
              <tbody>
                <tr>
                  <th className="text-left w-1/5">POR :</th>
                  <td>
                    {data && data.length > 0 && data[0].plrName !== ""
                      ? data[0].plrName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/5">FPD :</th>
                  <td>
                    {data && data.length > 0 && data[0].fpdName !== ""
                      ? data[0].fpdName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/4">Cargo Type:</th>
                  <td>
                    {data && data.length > 0 && data[0].commodityTypeName !== ""
                      ? data[0].commodityTypeName
                      : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full md:w-1/3 px-2 border-b md:border-b-0 md:border-r border-black pb-3">
            <table className="mt-1 text-left text-xs w-full table-auto">
              <tbody>
                <tr>
                  <th className="text-left w-1/4">POL :</th>
                  <td>
                    {data && data.length > 0 && data[0].polName !== ""
                      ? data[0].polName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/3">Gross Weight:</th>
                  <td>
                    {data && data.length > 0 && data[0].cargoWt !== ""
                      ? data[0].cargoWt
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/4">Commodity:</th>
                  <td>
                    {data && data.length > 0 && data[0].commodity !== ""
                      ? data[0].commodity
                      : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full md:w-1/3 px-2 pb-3">
            <table className="mt-1 text-left text-xs w-full table-auto">
              <tbody>
                <tr>
                  <th className="text-left w-1/4">POD :</th>
                  <td>
                    {data && data.length > 0 && data[0].podName !== ""
                      ? data[0].podName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/3">Shipment Type:</th>
                  <td>
                    {data && data.length > 0 && data[0].natureOfCargoName !== ""
                      ? data[0].natureOfCargoName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/4">EST Date:</th>
                  <td>{expectedSailDate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-xs w-full border border-black mt-1">
          <div className="p-2 pb-3">
            <strong>
              Remarks:{" "}
              {data && data.length > 0 && data[0].remarks !== ""
                ? data[0].remarks
                : ""}{" "}
            </strong>
          </div>
        </div>
      </div>
    );
  };

  const HeaderdataAirModule = ({ data }) => {
    const rateRequestNo =
      data && data.length > 0 && data[0].rateRequestNo !== ""
        ? data[0].rateRequestNo
        : "";
    const RequestDate =
      data && data.length > 0 ? new Date(data[0].rateRequestDate) : null;
    const rateRequestDate = RequestDate
      ? `${RequestDate.getDate()}/${
          RequestDate.getMonth() + 1
        }/${RequestDate.getFullYear()}`
      : "";
    return (
      <main>
        <div className="flex flex-row">
          RateRequest No : <p className="font-bold">{rateRequestNo}</p>
        </div>
        <div className="mb-2 mt-1 flex flex-row">
          Date : <p className="font-bold">{rateRequestDate}</p>
        </div>
      </main>
    );
  };
  const FooterAirModule = ({ data }) => {
    const customerName =
      data && data.length > 0 && data[0].customerName !== ""
        ? data[0].customerName
        : "";
    return (
      <main>
        <div className="flex flex-row">
          Customer Name : <p className="font-bold">{customerName} </p>
        </div>
      </main>
    );
  };

  const ExportChargeModuleAirLineWithTax = ({ data }) => {
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    // Filter out records where vendorName is ''
    const filteredRateRequestCharge = rateRequestCharge.filter(
      (charge) => charge.vendorName !== "",
    );

    const sortedRateRequestCharge = filteredRateRequestCharge.sort((a, b) => {
      // Sort based on sellCurrencyName, excluding records with ''
      if (a.sellCurrencyName === "") return 1;
      if (b.sellCurrencyName === "") return -1;
      return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
    });

    const groupedCharges = sortedRateRequestCharge.reduce((acc, curr) => {
      const vendorName = curr.vendorName; // Use the actual vendorName, not ''
      if (!acc[vendorName]) {
        acc[vendorName] = [];
      }
      acc[vendorName].push(curr);
      return acc;
    }, {});

    const subtotals = {};
    Object.keys(groupedCharges).forEach((vendorName) => {
      groupedCharges[vendorName].forEach((charge) => {
        // const currency = charge.sellCurrencyName || '';
        if (!subtotals[vendorName]) {
          subtotals[vendorName] = { amount: 0, taxAmount: 0, totalAmount: 0 };
        }
        subtotals[vendorName].amount += charge.sellAmount || 0;
        subtotals[vendorName].taxAmount += charge.sellTaxAmount || 0;
        subtotals[vendorName].totalAmount += charge.sellTotalAmount || 0;
      });
    });

    // const grandTotal = rateRequestCharge.reduce((acc, charge) => acc + (charge.sellTotalAmount || 0), 0);
    // const grandTotalInWords = toWords(grandTotal);

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0 text-left text-xs"
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th className="text-center border-black border-b border-r pt-2">
                CHARGE DESCRIPTION
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Size/Type
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Curr
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Ex. Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Tax Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Total Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Remarks:
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedCharges).map(([vendorName, charges]) => (
              <React.Fragment key={vendorName}>
                <tr>
                  <td
                    className="text-left border-black border-b border-r py-px font-bold"
                    colSpan={10}
                  >
                    {vendorName}
                  </td>
                </tr>
                {charges.map((item, index, array) => (
                  <React.Fragment key={`item-${index}`}>
                    <tr>
                      <td
                        className="px-3 border-black border-b border-r py-px"
                        style={{
                          maxWidth: "150px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.chargeName || ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {item.sizeName && item.sizeName !== ""
                          ? item.sizeName
                          : ""}{" "}
                        /{" "}
                        {item.typeCode &&
                        item.typeCode !== "" &&
                        item.typeCode !== "null"
                          ? item.typeCode
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.qty === "number" &&
                        item.qty !== null &&
                        item.qty !== ""
                          ? item.qty.toFixed(2)
                          : 0.0}
                      </td>
                      <td className="text-left border-black border-b border-r py-px">
                        {item.sellCurrencyName &&
                        item.sellCurrencyName !== "" &&
                        item.sellCurrencyName !== "null"
                          ? item.sellCurrencyName
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.sellExchangeRate === "number" &&
                        item.sellExchangeRate !== null &&
                        item.sellExchangeRate !== ""
                          ? item.sellExchangeRate.toFixed(2)
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.sellRate === "number" &&
                        item.sellRate !== null &&
                        item.sellRate !== ""
                          ? item.sellRate.toFixed(2)
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.sellAmount === "number" &&
                        item.sellAmount !== null &&
                        item.sellAmount !== ""
                          ? item.sellAmount.toFixed(2)
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.sellTaxAmount === "number" &&
                        item.sellTaxAmount !== null &&
                        item.sellTaxAmount !== ""
                          ? item.sellTaxAmount.toFixed(2)
                          : ""}
                      </td>
                      <td className="text-right border-black border-b border-r py-px">
                        {typeof item.sellTotalAmount === "number" &&
                        item.sellTotalAmount !== null &&
                        item.sellTotalAmount !== ""
                          ? item.sellTotalAmount.toFixed(2)
                          : ""}
                      </td>
                      <td
                        className="text-left border-black border-b border-r py-px"
                        style={{
                          maxWidth: "150px",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.remarks &&
                        item.remarks !== "" &&
                        item.remarks !== "null"
                          ? item.remarks
                          : ""}
                      </td>
                    </tr>
                    {index === array.length - 1 && (
                      <tr>
                        <td
                          className="border-black border-b border-r font-bold py-px"
                          colSpan={6}
                        >
                          Total {item.sellCurrencyName}:
                        </td>
                        <td
                          className="text-right border-black border-b border-r py-px"
                          colSpan={1}
                        >
                          {subtotals[vendorName].amount.toFixed(2)}
                        </td>
                        <td
                          className="text-right border-black border-b border-r py-px"
                          colSpan={1}
                        >
                          {subtotals[vendorName].taxAmount.toFixed(2)}
                        </td>
                        <td
                          className="text-right border-black border-b border-r py-px"
                          colSpan={1}
                        >
                          {subtotals[vendorName].totalAmount.toFixed(2)}
                        </td>
                        <td
                          className="text-right border-black border-b border-r py-px"
                          colSpan={1}
                        ></td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
            <tr></tr>
          </tbody>
        </table>
      </div>
    );
  };
  ExportChargeModuleAirLineWithTax.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        tblRateRequestCharge: PropTypes.arrayOf(
          PropTypes.shape({
            chargeName: PropTypes.string,
            sizeName: PropTypes.string,
            typeCode: PropTypes.string,
            qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            sellCurrencyName: PropTypes.string,
            sellExchangeRate: PropTypes.number,
            sellRate: PropTypes.number,
            sellAmount: PropTypes.number,
            sellTaxAmount: PropTypes.number, // New prop type for sellTaxAmount
            sellTotalAmount: PropTypes.number,
            remarks: PropTypes.string,
          }),
        ),
      }),
    ).isRequired,
  };

  const ExportChargeModule = ({ data }) => {
    // Assuming data is structured correctly and contains an array of charge objects
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    console.log("3", rateRequestCharge);
    // Filter out charges where the vendorName IS NOT present in the data array
    const filteredRateRequestCharge = rateRequestCharge.filter((charge) => {
      return !data.some(
        (dataItem) => dataItem.vendorName !== charge.vendorName,
      ); // Invert the comparison
    });

    const sortedRateRequestCharge = filteredRateRequestCharge.sort((a, b) => {
      // Ensure that '' entries are sorted last
      if (a.sellCurrencyName === "") return 1;
      if (b.sellCurrencyName === "") return -1;
      // Sort based on the currency name
      return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
    });

    // Calculate subtotals by currency
    const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
      const currency = curr.sellCurrencyName || "";
      if (!acc[currency]) {
        acc[currency] = { amount: 0, totalAmount: 0 }; // Removed taxAmount from subtotal calculation
      }
      acc[currency].amount += curr.sellAmount || 0;
      acc[currency].totalAmount += curr.sellTotalAmount || 0;
      return acc;
    }, {});

    const grandTotal = sortedRateRequestCharge.reduce(
      (acc, charge) => acc + (charge.sellTotalAmount || 0),
      0,
    );

    const grandTotalInWords = toWords(grandTotal);

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0 text-left text-xs"
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th className="text-center border-black border-b border-r pt-2">
                CHARGE DESCRIPTION
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Size/Type
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Curr
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Ex. Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Total Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Remarks:
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRateRequestCharge.map((item, index, array) => {
              // Render charge row
              const rows = [
                <tr key={`item-${index}`}>
                  <td
                    className="px-3 border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {`${item.chargeName || ""}`}
                  </td>

                  <td className="text-left border-black border-b border-r py-px">
                    {item.sizeName &&
                    item.sizeName !== "" &&
                    item.sizeName !== "null"
                      ? item.sizeName
                      : ""}{" "}
                    /{" "}
                    {item.typeCode &&
                    item.typeCode !== "" &&
                    item.typeCode !== "null"
                      ? item.typeCode
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.qty === "number" &&
                    item.qty !== null &&
                    item.qty !== ""
                      ? item.qty.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-left border-black border-b border-r py-px">
                    {item.sellCurrencyName &&
                    item.sellCurrencyName !== "" &&
                    item.sellCurrencyName !== "null"
                      ? item.sellCurrencyName
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellExchangeRate === "number" &&
                    item.sellExchangeRate !== null &&
                    item.sellExchangeRate !== ""
                      ? item.sellExchangeRate.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellRate === "number" &&
                    item.sellRate !== null &&
                    item.sellRate !== ""
                      ? item.sellRate.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellAmount === "number" &&
                    item.sellAmount !== null &&
                    item.sellAmount !== ""
                      ? item.sellAmount.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellTotalAmount === "number" &&
                    item.sellTotalAmount !== null &&
                    item.sellTotalAmount !== ""
                      ? item.sellTotalAmount.toFixed(2)
                      : ""}
                  </td>
                  <td
                    className="text-left border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {item.remarks &&
                    item.remarks !== "" &&
                    item.remarks !== "null"
                      ? item.remarks
                      : ""}
                  </td>
                </tr>,
              ];

              // Check if this is the last item or the next item has a different currency
              const lastOfCurrency =
                index === array.length - 1 ||
                array[index + 1].sellCurrencyName !== item.sellCurrencyName;
              if (lastOfCurrency) {
                // Add subtotal row
                const subtotal = subtotals[item.sellCurrencyName];
                rows.push(
                  <tr key={`subtotal-${item.sellCurrencyName}`}>
                    <td className="border-black border-b border-r font-bold py-px">
                      Total ({item.sellCurrencyName}):
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r font-bold py-px">
                      {subtotal.amount.toFixed(2)}({item.sellCurrencyName}){" "}
                    </td>
                    <td className="text-center border-black border-b border-r font-bold py-px">
                      {subtotal.totalAmount.toFixed(2)} ({item.sellCurrencyName}
                      )
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                  </tr>,
                );
              }
              return rows;
            })}
          </tbody>
        </table>
        <div
          className="mt-2 flex flex-wrap"
          style={{ width: "100%", marginTop: "5px" }}
        >
          <div
            className="text-xs w-full flex justify-between"
            style={{
              borderTop: "1px solid black",
              borderRight: "1px solid black",
              borderLeft: "1px solid black",
            }}
          >
            <div className="mt-2 font-bold py-px">Grand Total:</div>
            <div className="mt-2 mr-10 font-bold py-px">
              {grandTotal.toFixed(2)}
            </div>
          </div>
          <div
            className="text-xs w-full flex justify-between"
            style={{ border: "1px solid black" }}
          >
            <div className="mt-2 font-bold py-px">Amount in Words:</div>
            <div
              className="mt-2 font-bold py-px"
              style={{ marginRight: "85%" }}
            >
              {capitalizeFirstLetters(grandTotalInWords)} ONLY
            </div>
          </div>
        </div>
      </div>
    );
  };
  ExportChargeModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        tblRateRequestCharge: PropTypes.arrayOf(
          PropTypes.shape({
            chargeName: PropTypes.string,
            sizeName: PropTypes.string,
            typeCode: PropTypes.string,
            qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            sellCurrencyName: PropTypes.string,
            sellExchangeRate: PropTypes.number,
            sellRate: PropTypes.number,
            sellAmount: PropTypes.number,
            sellTotalAmount: PropTypes.number,
            remarks: PropTypes.string,
          }),
        ),
      }),
    ).isRequired,
  };
  const ExportChargeModuleWithTax = ({ data }) => {
    // Assuming data is structured correctly and contains an array of charge objects
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    // Filter out charges where the vendorName IS NOT present in the data array
    const filteredRateRequestCharge = rateRequestCharge.filter((charge) => {
      return !data.some(
        (dataItem) => dataItem.vendorName !== charge.vendorName,
      ); // Invert the comparison
    });

    const sortedRateRequestCharge = filteredRateRequestCharge.sort((a, b) => {
      // Ensure that '' entries are sorted last
      if (a.sellCurrencyName === "") return 1;
      if (b.sellCurrencyName === "") return -1;
      // Sort based on the currency name
      return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
    });

    // Calculate subtotals by currency
    const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
      const currency = curr.sellCurrencyName || "";
      if (!acc[currency]) {
        acc[currency] = { amount: 0, taxAmount: 0, totalAmount: 0 };
      }
      acc[currency].amount += curr.sellAmount || 0;
      acc[currency].taxAmount += curr.sellTaxAmount || 0;
      acc[currency].totalAmount += curr.sellTotalAmount || 0;
      return acc;
    }, {});

    const grandTotal = sortedRateRequestCharge.reduce(
      (acc, charge) => acc + (charge.sellTotalAmount || 0),
      0,
    );

    const grandTotalInWords = toWords(grandTotal);
    // const calculateTax = data;

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0 text-left text-xs"
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th className="text-center border-black border-b border-r pt-2">
                CHARGE DESCRIPTION
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Size/Type
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Curr
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Ex. Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Tax Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Total Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Remarks:
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRateRequestCharge.map((item, index, array) => {
              // Render charge row
              const rows = [
                <tr key={`item-${index}`}>
                  {/* <td className="mt-3 text-center border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}> */}
                  <td
                    className="px-3 border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {`${item.chargeName || ""}`}
                  </td>

                  <td className="text-left border-black border-b border-r py-px">
                    {item.sizeName &&
                    item.sizeName !== "" &&
                    item.sizeName !== "null"
                      ? item.sizeName
                      : ""}{" "}
                    /{" "}
                    {item.typeCode &&
                    item.typeCode !== "" &&
                    item.typeCode !== "null"
                      ? item.typeCode
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.qty === "number" &&
                    item.qty !== null &&
                    item.qty !== ""
                      ? item.qty.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellCurrencyName &&
                    item.sellCurrencyName !== "" &&
                    item.sellCurrencyName !== "null"
                      ? item.sellCurrencyName
                      : ""}
                  </td>
                  <td className="text-left border-black border-b border-r py-px">
                    {typeof item.sellExchangeRate === "number" &&
                    item.sellExchangeRate !== null &&
                    item.sellExchangeRate !== ""
                      ? item.sellExchangeRate.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellRate === "number" &&
                    item.sellRate !== null &&
                    item.sellRate !== ""
                      ? item.sellRate.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellAmount === "number" &&
                    item.sellAmount !== null &&
                    item.sellAmount !== ""
                      ? item.sellAmount.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellTaxAmount === "number" &&
                    item.sellTaxAmount !== null &&
                    item.sellTaxAmount !== ""
                      ? item.sellTaxAmount.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellTotalAmount === "number" &&
                    item.sellTotalAmount !== null &&
                    item.sellTotalAmount !== ""
                      ? item.sellTotalAmount.toFixed(2)
                      : ""}
                  </td>
                  <td
                    className="text-left border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {item.remarks &&
                    item.remarks !== "" &&
                    item.remarks !== "null"
                      ? item.remarks
                      : ""}
                  </td>
                </tr>,
              ];

              // Check if this is the last item or the next item has a different currency
              const lastOfCurrency =
                index === array.length - 1 ||
                array[index + 1].sellCurrencyName !== item.sellCurrencyName;
              if (lastOfCurrency) {
                // Add subtotal row
                const subtotal = subtotals[item.sellCurrencyName];
                rows.push(
                  <tr key={`subtotal-${item.sellCurrencyName}`}>
                    <td className="border-black border-b border-r font-bold py-px">
                      Total ({item.sellCurrencyName}):
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal.amount.toFixed(2)} ({item.sellCurrencyName})
                    </td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal.taxAmount.toFixed(2)}({item.sellCurrencyName})
                    </td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal.totalAmount.toFixed(2)}({item.sellCurrencyName}
                      ){" "}
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                  </tr>,
                );
              }
              return rows;
            })}
          </tbody>
        </table>
        <div
          className="mt-2 flex flex-wrap"
          style={{ width: "100%", marginTop: "5px" }}
        >
          <div
            className="text-xs w-full flex justify-between"
            style={{
              borderTop: "1px solid black",
              borderRight: "1px solid black",
              borderLeft: "1px solid black",
            }}
          >
            <div className="mt-2 font-bold py-px">Grand Total:</div>
            <div className="mt-2 mr-10 font-bold py-px">
              {grandTotal.toFixed(2)}
            </div>
          </div>
          <div
            className="text-xs w-full flex justify-between"
            style={{ border: "1px solid black" }}
          >
            <div className="mt-2 font-bold py-px">Amount in Words:</div>
            <div
              className="mt-2 font-bold py-px"
              style={{ marginRight: "85%" }}
            >
              {capitalizeFirstLetters(grandTotalInWords)} ONLY
            </div>
          </div>
        </div>
      </div>
    );
  };
  ExportChargeModuleWithTax.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        tblRateRequestCharge: PropTypes.arrayOf(
          PropTypes.shape({
            chargeName: PropTypes.string,
            sizeName: PropTypes.string,
            typeCode: PropTypes.string,
            qty: PropTypes.number,
            sellCurrencyName: PropTypes.string,
            sellExchangeRate: PropTypes.number,
            sellRate: PropTypes.number,
            sellAmount: PropTypes.number,
            sellTaxAmount: PropTypes.number,
            sellTotalAmount: PropTypes.number,
            remarks: PropTypes.string,
            // Add any other fields as necessary based on your data structure
          }),
        ),
        // Add other fields from data if needed
      }),
    ).isRequired,
  };
  function capitalizeFirstLetters(words) {
    return words.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  const ExportParagrafModule = ({ data }) => {
    let terms = `1) In case insurance is needed, AMC GLOBAL FREIGHT FORWARDING PVT.LTD can get it arranged at the request of Shipper/Consignee with applicable charges.

2) GST is applicable as per government of india rules and may change from time to time.

3) Bookings are subject to Cargo acceptance, Space and equipment availability by carrier/carriers agent.

4) Rates are valid only for Commodity & Dimensions mentioned herein. Actual billing will be as per final weight & dimensions calculated by Carrier and

appearing on Transport Document.

5) These rates are not valid for dangerous goods/ hazardous, perishable, restricted article & over dimensional cargo.

6) All business transactions are subject to Standard Trading Conditions as approved by Federation of Freight Forwarders Association in India. Disputes

are subject to Mumbai jurisdiction.

7) The Cargo to be insured by Shipper / Consignee /Any other party nominated by the Shipper/Consignee. AMC GLOBAL FREIGHT FORWARDING PVT.LTD shall

not be held responsible any Loss/ Damage of goods in transit.

8) Fumigation for wooden pallets/packaging can be arranged as per request. Cargo to be stuffed by Shipper and arranged in Airworthy/Seaworthy

packing as applicable to the shipment.

9) Rates are for Stackable cargo unless specifically mentioned otherwise.

10) Exchange rate applicable as on date of arrival/departure as the case may be.

11) Please note that rates will be charged on Gross Weight or Airline Weight calculation (i.e Chargeable weight), whichever is higher.

12) Airport Handling, Warehousing, Statutory Charges, Custom Duty & Stamp Duty and all Receipted charges will be charged at Actuals with Receipt.

13) Wherever the charges are mentioned as “ACTUALS” , receipt will be provided and the rates will be based on actual charged by Carrier/Terminal

Operator/ Airport Authority or any other third party.

14) FSC/ SSC computed are based on the current prevalent index & any revision will have a bearing on our Final Offer/ Quote.

15) Bookings is subject to space availability with respective carrier.`;
    const [termsAndConditions, setTermsAndConditions] = useState("");

    useEffect(() => {
      const getdata = async () => {
        const data = await fetchTermsAndConditions();
        if (data && data.length > 0) {
          setTermsAndConditions(data[0].termsCondition || "");
        } else {
          setTermsAndConditions(terms);
        }
      };

      getdata();
    }, []);

    // Split the terms and conditions by line break ("\n") and map each line with its line number
    const termsArray = termsAndConditions
      .split("\n")
      .map((line) => {
        // Trim whitespace and check if the line is not empty
        if (line.trim().length > 0) {
          // Display the line content
          return ` ${line}`;
        }
        return null;
      })
      .filter((line) => line !== null); // Remove any null entries resulting from empty lines

    // Check if data is valid and has a companyName property
    // const isValidCompanyName = data && data.length > 0 && data[0].hasOwnProperty('companyName');

    // Display company name if available, otherwise show blank
    const companyName = data[0]?.companyName === "" ? "" : data[0]?.companyName;

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <div className="text-xs w-full">
          <h3 className="mt-0 font-bold">Terms & Conditions :</h3>
          {termsArray.map((term, index) => (
            <p key={index} className="mt-2 font-bold">
              {term}
            </p>
          ))}
        </div>
        <div className="mt-1">
          <p className="mt-2">
            <strong>Thanks and Best Regards.</strong>
          </p>
          <p>
            <strong>For {companyName}</strong>
          </p>
        </div>
      </div>
    );
  };

  ExportParagrafModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        companyName: PropTypes.string,
        // Add any other expected properties from data here
      }),
    ).isRequired,
  };

  async function fetchTermsAndConditions() {
    const url = `${baseUrl}/api/validations/formControlValidation/fetchdata`;
    const requestBody = {
      tableName: "tblTermsCondition",
      whereCondition: {
        _id: "65cb645121bfb4c481c1d850",
        companyId: "865",
        companyBranchId: "8331",
        businessSegmentId: "5",
      },
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`,
        );
      }

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        console.warn("Server returned success as false:", data.message);
        return data.message;
      }
    } catch (error) {
      console.error("Error fetching terms and conditions:", error);
      return false;
    }
  }

  const QuotationEnquireyModule = () => (
    <div>
      <div id="150" className="container mx-auto p-14 bodyColour">
        <HeaderdataAirModule data={data} />
        <TransportInstructionsAirModule data={data} />
        <FooterAirModule data={data} />
      </div>
    </div>
  );

  const ExportSeaQuotationModulePlanRFQ = ({ data }) => {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("data is not an array or is empty");
      return <div></div>;
    }

    const rateRequestCharge = data[0]?.tblRateRequestCharge || [];
    const tblRateRequestPlan = data[0]?.tblRateRequestPlan || [];

    const allCharges = useMemo(
      () =>
        data
          .flatMap((item) => item.tblRateRequestCharge || [])
          .filter((charge) => charge.quotationFlag),
      [data],
    );

    const oceanFreightCharges = useMemo(
      () =>
        allCharges.filter((charge) =>
          charge.chargeName?.toLowerCase().includes("freight"),
        ),
      [allCharges],
    );

    const otherCharges = useMemo(
      () =>
        allCharges
          .filter(
            (charge) => !charge.chargeName?.toLowerCase().includes("freight"),
          )
          .sort((a, b) => a?.chargeName?.localeCompare(b.chargeName)),
      [allCharges],
    );

    const combinedCharges = useMemo(
      () => [...oceanFreightCharges, ...otherCharges],
      [oceanFreightCharges, otherCharges],
    );

    const groupedCharges = useMemo(() => {
      return combinedCharges.reduce((acc, charge) => {
        const key = `${charge.chargeName}|${charge.sizeName}|${charge.typeName}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(charge);
        return acc;
      }, {});
    }, [combinedCharges]);

    const oceanFreightVendors = useMemo(
      () =>
        [
          ...new Set(oceanFreightCharges.map((charge) => charge.vendorName)),
        ].sort(),
      [oceanFreightCharges],
    );

    const filteredRateRequestPlan = useMemo(
      () =>
        tblRateRequestPlan.filter((item) =>
          oceanFreightVendors.includes(item.vendorNamePlan),
        ),
      [tblRateRequestPlan, oceanFreightVendors],
    );

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}/${date.getFullYear()}`;
    };

    const thStyle = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      backgroundColor: "#E0E0E0",
      border: "1px solid #000000",
    };
    const tdStyle = {
      textAlign: "left",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
    };
    const tdStyleCenter = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
    };

    if (filteredRateRequestPlan.length === 0) {
      return;
    }

    return (
      <div className="flex flex-wrap mt-2">
        <table
          className="table-auto text-xs"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead className="bg-gray-300">
            <tr>
              <th style={thStyle}>VESSEL PLAN</th>
              <th style={thStyle}>ETD</th>
              <th style={thStyle}>ETA</th>
              <th style={thStyle}>TT</th>
              <th style={thStyle}>ROUTE</th>
              <th style={thStyle}>FREE TIME AT POD</th>
              <th style={thStyle}>RATES VALIDITY</th>
            </tr>
          </thead>
          <tbody>
            {filteredRateRequestPlan.map((item, index) => (
              <tr key={index}>
                <td style={tdStyle}>{item.vendorNamePlan}</td>
                <td style={tdStyle}>{formatDate(item.etd)}</td>
                <td style={tdStyle}>{formatDate(item.eta)}</td>
                <td style={tdStyle}>{item.transitTime}</td>
                <td style={tdStyle}>{item.route}</td>
                <td style={tdStyleCenter}>{item.destinationFreeDays}</td>
                <td style={tdStyle}>{formatDate(item.rateVailidity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const TermsAndCondition = ({ terms }) => {
    const style = {
      fontFamily: 'var(--rp-fontFamily), "Helvetica", "Arial", sans-serif',
      color: "var(--rp-textColor)",
      fontSize: "var(--rp-fontSize, 11px)",
      margin: 0,
      lineHeight: "1.8",
    };

    return (
      <div className="mt-2">
        {terms?.split("\n").map((line, index) => (
          <p key={index} style={style}>
            {line}
          </p>
        ))}
      </div>
    );
  };

  const HeaderModule = ({ data }) => {
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(date.getDate()).padStart(2, "0")}`;
    };

    return (
      <table
        className="tblhead text-xs text-black dark:text-white"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tbody>
          <tr>
            <td align="right" valign="top" style={{ maxWidth: "50%" }}>
              <table
                className="tblhead"
                border="0"
                cellSpacing="0"
                cellPadding="0"
              >
                <tr>
                  <th
                    align="left"
                    className="responsiveTh"
                    style={{ paddingRight: "10px" }}
                  >
                    Date :
                  </th>
                  <td>
                    {data && data.length > 0
                      ? formatDate(data[0].rateRequestDate)
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th
                    align="left"
                    className="responsiveTh"
                    style={{ paddingRight: "10px" }}
                  >
                    Proposed By:
                  </th>
                  <td>{data && data.length > 0 ? data[0].preparedById : ""}</td>
                </tr>
                <tr>
                  <th
                    align="left"
                    className="responsiveTh"
                    style={{ paddingRight: "10px" }}
                  >
                    Presented To:
                  </th>
                  <td>
                    {data && data.length > 0 ? data[0].customerPerson : ""}
                  </td>
                </tr>
                <tr>
                  <th
                    align="left"
                    className="responsiveTh"
                    style={{ paddingRight: "10px" }}
                  >
                    Company :
                  </th>
                  <td>{data && data.length > 0 ? data[0].customerName : ""}</td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  HeaderModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const ExportAirQuotationModule = ({ data }) => {
    console.log("data =>", data);
    let rateRequestDate;
    const formatDate = (date) => {
      if (!date) return ""; // Return empty string if date is null or undefined

      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0"); // Get the day and pad with zero if needed

      // Create an array of month abbreviations
      const monthAbbreviations = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      const month = monthAbbreviations[d.getMonth()]; // Get the month abbreviation

      const year = d.getFullYear(); // Get the full year
      return `${day}/${month}/${year}`; // Return the formatted date
    };

    if (data && data.length > 0 && data[0].rateRequestDate) {
      rateRequestDate = formatDate(data[0].rateRequestDate);
    } else {
      console.log("Date is not available or data is undefined.");
      rateRequestDate = "";
    }
    let cargoWt =
      data && data.length > 0 && data[0].cargoWt !== "" ? data[0].cargoWt : "";
    let cargoWtUnitCode =
      data && data.length > 0 && data[0].cargoWtUnitCode !== ""
        ? data[0].cargoWtUnitCode
        : "";
    return (
      <div>
        <div className="flex flex-col md:flex-row flex-wrap border border-black">
          <div className="w-full md:w-1/2 px-2 border-b md:border-b-0 md:border-r border-black pb-3">
            <table className="mt-1 text-left text-xs w-full table-auto">
              <tbody>
                <tr>
                  <th className="text-left w-1/5">Quotation No :</th>
                  <td>
                    {data && data.length > 0 && data[0].rateRequestNo !== ""
                      ? data[0].rateRequestNo
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/5">Dated :</th>
                  <td>{rateRequestDate}</td>
                </tr>
                <tr>
                  <th className="text-left w-1/4">Customer:</th>
                  <td>
                    {data && data.length > 0 && data[0].customerName !== ""
                      ? data[0].customerName
                      : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full md:w-1/3 px-2 pb-3">
            <table className="mt-1 text-left text-xs w-full table-auto">
              <tbody>
                <tr>
                  <th className="text-left w-1/4">Origin Airport :</th>
                  <td>
                    {data && data.length > 0 && data[0].polName !== ""
                      ? data[0].polName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/3">Dest Airport:</th>
                  <td>
                    {data && data.length > 0 && data[0].podName !== ""
                      ? data[0].podName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/4">Gr.wt (KGS):</th>
                  <td>
                    {cargoWt} {cargoWtUnitCode}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-xs w-full border-l border-r border-b border-black">
          <div className="p-2 pb-3">
            <strong>
              Remarks:{" "}
              {data && data.length > 0 && data[0].remarks !== ""
                ? data[0].remarks
                : ""}{" "}
            </strong>
          </div>
        </div>
      </div>
    );
  };

  const ExportAirQuotationRateBasisModule = ({ data }) => {
    // Filter the charges where rateBasisName does not include 'weight'
    const tblRateRequestCharge =
      data[0]?.tblRateRequestCharge?.filter(
        (charge) => !charge?.rateBasis?.toLowerCase().includes("weight"),
      ) || [];
    if (tblRateRequestCharge.length === 0) {
      return;
    }
    // Calculate the total amount
    const totalAmount = tblRateRequestCharge.reduce(
      (acc, item) => acc + item.sellAmount,
      0,
    );

    const thStyle = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      backgroundColor: "#E0E0E0",
      border: "1px solid #000000",
    };
    const tdStyle = {
      textAlign: "left",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
    };
    const tdStyleCenter = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
    };
    const tdStyleRight = {
      textAlign: "right",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
    };

    return (
      <>
        <div className="text-xs w-full border border-black mt-3">
          <div className=" p-2 text-center">
            <strong>Fixed charges</strong>
          </div>
        </div>
        <div className="flex flex-wrap mt-2">
          <table
            className="table-auto text-xs"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead className="bg-gray-300">
              <tr>
                <th style={thStyle}>Sr. No.</th>
                <th style={thStyle}>Charge Description</th>
                <th style={thStyle}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {tblRateRequestCharge.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyleCenter}>{index + 1}</td>
                  <td style={tdStyle}>{item.chargeDescription}</td>
                  <td style={tdStyleRight}>
                    {(item.sellAmount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr>
                <td
                  colSpan="2"
                  style={{ ...tdStyle, fontWeight: "bold" }}
                  className="ps-6"
                >
                  Total
                </td>
                <td style={{ ...tdStyleRight, fontWeight: "bold" }}>
                  {totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  };

  const FulfillmentRatesModule = () => {
    if (!Array.isArray(data) || data.length === 0) {
      console.error("Data is not an array or is empty");
      return <div></div>;
    }

    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}/${date.getFullYear()}`;
    };

    const charges = data[0]?.tblRateRequestCharge || [];
    const customerName = data[0]?.customerName || "N/A";
    const validityFrom = formatDate(data[0]?.validityFrom);
    const validityTo = formatDate(data[0]?.validityTo);

    const categories = charges.reduce((acc, charge) => {
      const groupName = charge.chargeGroupName || "Uncategorized";
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push(charge);
      return acc;
    }, {});

    const mergeRows = (category) => {
      let lastChargeDescription = null;
      let rowSpanMap = {};
      let rowIndex = 0;

      categories[category].forEach((charge, idx) => {
        const chargeDescription = charge.chargeDescription || "";

        if (lastChargeDescription === chargeDescription) {
          rowSpanMap[lastChargeDescription].rowSpan += 1;
        } else {
          rowSpanMap[chargeDescription] = { rowSpan: 1, firstRowIdx: rowIndex };
          lastChargeDescription = chargeDescription;
        }
        rowIndex++;
      });

      return rowSpanMap;
    };

    const tableHeaderStyle =
      "bg-blue-600 text-white font-bold text-sm border-gray-800";
    const tableRowStyle =
      "border-b border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700";
    const tableCellStyle =
      "px-2 py-1 border border-gray-400 text-left text-xs text-black dark:text-white";
    const headStyle = "px-2 py-1 border-1 border-gray-800 text-xs text-center";

    return (
      <div className="p-8 bg-gray-50 dark:bg-gray-900">
        <div className="container-auto w-full mx-auto mt-5">
          <CompanyImgModule />
          <h1 className="text-center text-gray-800 dark:text-white font-semibold text-xl mt-6 mb-8">
            Warehousing / Storage
          </h1>
          <HeaderModule data={data} />
        </div>

        <p className="text-xs text-gray-800 dark:text-white italic mb-6">
          Validity: {validityFrom} to {validityTo} - Carrier Contract Subject to
          Terms.
        </p>

        {Object.keys(categories).map((category, index) => {
          const rowSpanMap = mergeRows(category);

          return (
            categories[category].length > 0 && (
              <div key={index} className="mb-8">
                <table className="table-auto w-full mx-auto mb-4 border-collapse bg-white dark:bg-gray-800 shadow-sm rounded-lg text-sm">
                  <thead className={tableHeaderStyle}>
                    <tr>
                      <th className={`${headStyle} w-1/3`}>{category}</th>{" "}
                      {/* Fixed width for the first column */}
                      <th className={`${headStyle} w-1/3 text-right`}>
                        Rate
                      </th>{" "}
                      {/* Fixed width for the second column */}
                      <th className={`${headStyle} w-1/3`}>
                        Unit of Measure
                      </th>{" "}
                      {/* Fixed width for the third column */}
                    </tr>
                  </thead>
                  <tbody>
                    {categories[category].map((charge, idx) => {
                      const chargeDescription = charge.chargeDescription;
                      const rowSpanInfo = rowSpanMap[chargeDescription];

                      return (
                        <tr key={idx} className={tableRowStyle}>
                          {rowSpanInfo?.firstRowIdx === idx && (
                            <td
                              className={tableCellStyle}
                              rowSpan={rowSpanInfo.rowSpan}
                            >
                              {chargeDescription}
                              {charge.remarks ? ` (${charge.remarks})` : ""}
                            </td>
                          )}
                          <td className="px-2 py-1 border border-gray-400 text-right text-xs text-black dark:text-white w-1/3">
                            {charge.sellRate || ""}{" "}
                            {charge.sellCurrencyCode || ""}
                          </td>
                          <td className={`${tableCellStyle} w-1/3`}>
                            {charge.rateBasisName || ""}
                            {charge.minimum ? `, ${charge.minimum}` : ""}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          );
        })}

        <div className="mt-8 text-xs text-gray-800 dark:text-white">
          <p>Prices are subject to standard trading conditions.</p>
          <p>
            Any additional charges incurred will be billed as per contract
            terms.
          </p>
        </div>
      </div>
    );
  };

  // const AirQuotationGrid = ({ data }) => {
  //   // Filter rate requests containing 'weight'
  //   const filteredRateRequestCharge =
  //     data[0]?.tblRateRequestCharge?.filter((charge) =>
  //       charge?.rateBasis?.toLowerCase().includes("weight")
  //     ) || [];

  //   if (filteredRateRequestCharge.length === 0) {
  //     return null;
  //   }

  //   // Group charges by chargeName, vendorName and vendorAgentName, summing the buyRates
  //   const groupedCharges = filteredRateRequestCharge.reduce((acc, charge) => {
  //     const key = `${charge.chargeName}-${charge.vendorName}-${charge.vendorAgentName}`;
  //     if (!acc[key]) {
  //       acc[key] = { ...charge, buyRate: 0 };
  //     }
  //     acc[key].buyRate += charge.buyRate;
  //     return acc;
  //   }, {});

  //   // Get a list of unique vendor/vendor-agent combinations, treating null/undefined as empty string
  //   const vendorPairs = [
  //     ...new Set(
  //       filteredRateRequestCharge.map(
  //         (charge) =>
  //           `${charge.vendorName || ""}||${charge.vendorAgentName || ""}`
  //       )
  //     ),
  //   ].map((pair) => {
  //     const [vendorName, vendorAgentName] = pair.split("||");
  //     return {
  //       vendorName,
  //       vendorAgentName,
  //       key: `${vendorName}-${vendorAgentName}`,
  //     };
  //   });

  //   // Initialize totals for each vendor pair
  //   const totals = vendorPairs.reduce((acc, { key }) => {
  //     acc[key] = 0;
  //     return acc;
  //   }, {});

  //   // Array to hold each row's total
  //   const rowTotals = [];

  //   // Styles
  //   const thStyle = {
  //     textAlign: "center",
  //     padding: "10px",
  //     verticalAlign: "top",
  //     backgroundColor: "#E0E0E0",
  //     border: "1px solid #000",
  //   };
  //   const thStyleTotal = {
  //     ...thStyle,
  //     backgroundColor: "#D1D5DB",
  //   };
  //   const tdStyle = {
  //     textAlign: "center",
  //     padding: "10px",
  //     border: "1px solid #000",
  //   };
  //   const tdStyleRight = {
  //     ...tdStyle,
  //     textAlign: "right",
  //   };

  //   // Unique charge names
  //   const uniqueChargeNames = [
  //     ...new Set(filteredRateRequestCharge.map((charge) => charge.chargeName)),
  //   ];

  //   return (
  //     <div className="dynamic_table pt-2" style={{ width: "100%" }}>
  //       <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
  //         <table
  //           className="text-xs"
  //           style={{
  //             width: "100%",
  //             borderCollapse: "collapse",
  //             minWidth: "1200px",
  //             border: "1px solid black",
  //           }}
  //         >
  //           {vendorPairs.length > 0 && (
  //             <thead>
  //               <tr>
  //                 <th style={thStyle}>CHARGES</th>
  //                 {vendorPairs.map(({ vendorName, vendorAgentName, key }) => (
  //                   <th key={key} style={thStyle}>
  //                     {vendorAgentName && vendorName ? (
  //                       <>
  //                         <div>{vendorAgentName}</div>
  //                         <span>/</span>
  //                         <div>{vendorName}</div>
  //                       </>
  //                     ) : (
  //                       <div>{vendorAgentName || vendorName}</div>
  //                     )}
  //                   </th>
  //                 ))}
  //                 {/* <th style={thStyleTotal}>Total</th> */}
  //               </tr>
  //             </thead>
  //           )}
  //           <tbody>
  //             {uniqueChargeNames.map((chargeName, rowIdx) => {
  //               let rowTotal = 0;

  //               // build each vendor-cell for this row
  //               const cells = vendorPairs.map(({ key }) => {
  //                 const buyRate =
  //                   groupedCharges[`${chargeName}-${key}`]?.buyRate || 0;
  //                 totals[key] += buyRate;
  //                 rowTotal += buyRate;
  //                 return (
  //                   <td key={key} style={tdStyleRight}>
  //                     {buyRate.toFixed(2)}
  //                   </td>
  //                 );
  //               });

  //               // // record this row's total
  //               // rowTotals.push(rowTotal);

  //               return (
  //                 <tr key={rowIdx}>
  //                   <td style={tdStyle}>{chargeName}</td>
  //                   {cells}
  //                   {/* <td style={tdStyleRight}>{rowTotal.toFixed(2)}</td> */}
  //                 </tr>
  //               );
  //             })}

  //             {/* aggregate total row */}
  //             <tr>
  //               <td style={tdStyle}>
  //                 <strong>Total</strong>
  //               </td>
  //               {vendorPairs.map(({ key }) => (
  //                 <td key={key} style={tdStyleRight}>
  //                   <strong>{totals[key].toFixed(2)}</strong>
  //                 </td>
  //               ))}
  //               <td style={tdStyleRight}>
  //                 <strong>
  //                   {rowTotals.reduce((sum, rt) => sum + rt, 0).toFixed(2)}
  //                 </strong>
  //               </td>
  //             </tr>
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>
  //   );
  // };

  const AirQuotationGrid = ({ data }) => {
    // Filter rate requests containing 'weight'
    const filteredRateRequestCharge =
      data[0]?.tblRateRequestCharge?.filter((charge) =>
        charge?.rateBasis?.toLowerCase().includes("weight"),
      ) || [];

    if (filteredRateRequestCharge.length === 0) {
      return null;
    }

    // Group charges by chargeName + vendorName + vendorAgentName
    const groupedCharges = filteredRateRequestCharge.reduce((acc, charge) => {
      const key = `${charge.chargeName}-${charge.vendorName}-${charge.vendorAgentName}`;
      if (!acc[key]) acc[key] = { ...charge, buyRate: 0 };
      acc[key].buyRate += charge.buyRate;
      return acc;
    }, {});

    // Build unique vendor/vendor-agent pairs
    const vendorPairs = [
      ...new Set(
        filteredRateRequestCharge.map(
          (c) => `${c.vendorName || ""}||${c.vendorAgentName || ""}`,
        ),
      ),
    ].map((pair) => {
      const [vendorName, vendorAgentName] = pair.split("||");
      return {
        vendorName,
        vendorAgentName,
        key: `${vendorName}-${vendorAgentName}`,
      };
    });

    // Initialize column totals
    const totals = vendorPairs.reduce((acc, { key }) => {
      acc[key] = 0;
      return acc;
    }, {});

    // Styles
    const thStyle = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      backgroundColor: "#E0E0E0",
      border: "1px solid #000",
    };
    const tdStyle = {
      textAlign: "center",
      padding: "10px",
      border: "1px solid #000",
    };
    const tdStyleRight = { ...tdStyle, textAlign: "right" };

    // Unique charge names
    const uniqueChargeNames = [
      ...new Set(filteredRateRequestCharge.map((c) => c.chargeName)),
    ];

    return (
      <div className="dynamic_table pt-2" style={{ width: "100%" }}>
        <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
          <table
            className="text-xs"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1200px",
              border: "1px solid black",
            }}
          >
            {/* Header (no Total column) */}
            {vendorPairs.length > 0 && (
              <thead>
                <tr>
                  <th style={thStyle}>CHARGES</th>
                  {vendorPairs.map(({ vendorName, vendorAgentName, key }) => (
                    <th key={key} style={thStyle}>
                      {vendorAgentName && vendorName ? (
                        <>
                          <div>{vendorAgentName} /</div>
                          <div>{vendorName}</div>
                        </>
                      ) : (
                        <div>{vendorAgentName || vendorName}</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {/* Data rows (no per-row Total cell) */}
              {uniqueChargeNames.map((chargeName, rowIdx) => {
                return (
                  <tr key={rowIdx}>
                    <td style={tdStyle}>{chargeName}</td>
                    {vendorPairs.map(({ key }) => {
                      const buyRate =
                        groupedCharges[`${chargeName}-${key}`]?.buyRate || 0;
                      totals[key] += buyRate;
                      return (
                        <td key={key} style={tdStyleRight}>
                          {buyRate.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Aggregate totals row */}
              <tr>
                <td style={tdStyle}>
                  <strong>Total</strong>
                </td>
                {vendorPairs.map(({ key }) => (
                  <td key={key} style={tdStyleRight}>
                    <strong>{totals[key].toFixed(2)}</strong>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const TotalVariationFixedChargesTable = ({ data }) => {
    // Get the company name from the data
    let companyName =
      data && data.length > 0 && data[0].companyName !== ""
        ? data[0].companyName
        : "";

    // Filter charges that contain 'weight' in rateBasisName
    const filteredRateRequestCharge =
      data[0]?.tblRateRequestCharge?.filter((charge) =>
        charge?.rateBasis?.toLowerCase().includes("weight"),
      ) || [];

    // Exit if there are no charges
    if (filteredRateRequestCharge.length === 0) {
      return null;
    }

    // Get cargo weight
    const cargoWt = data[0]?.cargoWt || 0;

    // Filter out weight-related charges for calculations
    const tblRateRequestCharge =
      data[0]?.tblRateRequestCharge?.filter(
        (charge) => !charge?.rateBasis?.toLowerCase().includes("weight"),
      ) || [];

    // Calculate the total amount for other charges
    const totalAmount = tblRateRequestCharge.reduce(
      (acc, item) => acc + (item.sellAmount || 0),
      0,
    );

    // const vendorPairs = [
    //   ...new Set(
    //     filteredRateRequestCharge.map(
    //       (c) => `${c.vendorName || ""}||${c.vendorAgentName || ""}`
    //     )
    //   ),
    // ].map((pair) => {
    //   const [vendorName, vendorAgentName] = pair.split("||");
    //   return {
    //     vendorName,
    //     vendorAgentName,
    //     key: `${vendorName}-${vendorAgentName}`,
    //   };
    // });

    const vendorPairsMap = filteredRateRequestCharge.reduce((map, charge) => {
      const vendorName = charge.vendorName || "";
      const vendorAgentName = charge.vendorAgentName || "";
      const comboKey = `${vendorName}||${vendorAgentName}`;

      if (!map.has(comboKey)) {
        map.set(comboKey, {
          vendorName,
          vendorAgentName,
          // agent first, then vendor
          key: `${vendorAgentName} / ${vendorName}`,
          totalBuyRate: parseFloat(charge.buyRate) || 0,
        });
      } else {
        map.get(comboKey).totalBuyRate += parseFloat(charge.buyRate) || 0;
      }

      return map;
    }, new Map());

    // turn it back into an array
    const vendorPairs = Array.from(vendorPairsMap.values());

    console.log("vendorPairs Ak", vendorPairs);

    // Custom styles for the table
    const thStyle = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      backgroundColor: "#E0E0E0",
      border: "1px solid #000000",
    };
    const tdStyle = {
      textAlign: "left",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
      width: "25%",
    };
    const tdStyleRight = {
      textAlign: "right",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
      width: "25%",
    };

    // Constant to add to each total
    const constantToAdd = totalAmount;

    // Group charges by chargeName and sum their buyRates
    const groupedCharges = filteredRateRequestCharge.reduce((acc, charge) => {
      if (!acc[charge.chargeName]) {
        acc[charge.chargeName] = { ...charge, buyRate: 0 };
      }
      acc[charge.chargeName].buyRate += charge?.buyRate;
      return acc;
    }, {});

    // Convert the grouped charges back to an array
    const groupedChargesArray = Object.values(groupedCharges);

    return (
      <div>
        <div className="mt-1 flex flex-wrap headerTable">
          <table
            className="text-xs"
            style={{ width: "50%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th colSpan={2} style={thStyle}>
                  Total of Variation & Fixed charges
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Map through grouped charges and render each row */}
              {vendorPairs.map(
                ({ vendorAgentName, vendorName, totalBuyRate }, index) => {
                  // fall back to 0 if undefined
                  const rate = totalBuyRate || 0;

                  // your total‐charge logic
                  const totalCharge = rate * cargoWt + constantToAdd;

                  return (
                    <tr key={index}>
                      {/* Vendor/Agent Column */}
                      <td style={tdStyle}>
                        {vendorAgentName && vendorName ? (
                          <>
                            <div>{vendorAgentName} /</div>
                            <div>{vendorName}</div>
                          </>
                        ) : (
                          <div>{vendorAgentName || vendorName}</div>
                        )}
                      </td>

                      {/* Computed Buy-Rate Column */}
                      <td style={tdStyleRight}>
                        {rate > 0 ? `INR ${totalCharge.toFixed(2)} + GST` : "-"}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const TariffExportSeaQuotationModule = ({ data }) => {
    setPrintOrientation("portrait");
    const RequestDate =
      data && data.length > 0 ? new Date(data[0].rateRequestDate) : null;
    const DatesFormat = RequestDate
      ? `${RequestDate.getDate()}/${
          RequestDate.getMonth() + 1
        }/${RequestDate.getFullYear()}`
      : "";

    return (
      <div className="flex flex-wrap">
        {/* Left Side */}
        <div style={{ width: "60%" }}>
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th
                  style={{ width: "30%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Customer:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.customerName || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    width: "30%",
                    fontSize: "10px",
                    verticalAlign: "top",
                  }}
                  className="pr-1 pt-0 pb-0"
                >
                  Customer Address:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.customerAddress || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "30%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Pickup Name:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.shipperText || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "30%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Pickup Address:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.pickupAddress || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    width: "30%",
                    fontSize: "10px",
                    verticalAlign: "top",
                  }}
                  className="pr-1 pt-0 pb-0"
                >
                  Delivery To:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.consigneeName || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    width: "30%",
                    fontSize: "10px",
                    verticalAlign: "top",
                  }}
                  className="pr-1 pt-0 pb-0"
                >
                  Delivery Address:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.deliveryAddress || ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Right Side */}
        <div style={{ width: "40%" }} className="px-2">
          <table className="mt-1 text-left text-xs w-full">
            <tbody>
              <tr>
                <th
                  style={{ width: "40%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Quotation No:
                </th>
                <td
                  style={{ width: "60%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.rateRequestNo || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "40%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Dated:
                </th>
                <td
                  style={{ width: "60%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {DatesFormat}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "40%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Collection Date:
                </th>
                <td
                  style={{ width: "60%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {formatDateTime(data?.[0]?.collectionDate)}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "40%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Handled By:
                </th>
                <td
                  style={{ width: "60%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {userName}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "40%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Delivery Date:
                </th>
                <td
                  style={{ width: "60%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {formatDateTime(data?.[0]?.expectedDeliveryDate)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Divider */}
        <div className="w-full mt-2">
          <hr className="border-black border" />
        </div>
      </div>
    );
  };
  TariffExportSeaQuotationModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        rateRequestDate: PropTypes.string,
        customerName: PropTypes.string,
        consigneeName: PropTypes.string,
        deliveryAddress: PropTypes.string,
        customerName: PropTypes.string,
        rateRequestNo: PropTypes.string,
        preparedById: PropTypes.string,
      }),
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  };

  console.log("data", data);

  const TariffExportShipperDetailsModule = ({ data }) => {
    // let expectedSailDate;
    // const formatDate = (date) => {
    //     if (!date) return ''; // Return empty string if date is null or undefined
    //     const d = new Date(date);
    //     const day = String(d.getDate()).padStart(2, '0');
    //     const month = String(d.getMonth() + 1).padStart(2, '0');
    //     const year = d.getFullYear();
    //     return `${day}/${month}/${year}`;
    // };

    // if (data && data.length > 0 && data[0].expectedSailDate) {
    //     expectedSailDate = formatDate(data[0].expectedSailDate);
    //     console.log("Formatted Date: ", expectedSailDate);
    // } else {
    //     console.log("Date is not available or data is undefined.");
    //     expectedSailDate = '';
    // }
    const RequestDate =
      data && data.length > 0 ? new Date(data[0].rateRequestDate) : null;
    const DatesFormat = RequestDate
      ? `${RequestDate.getDate()}/${
          RequestDate.getMonth() + 1
        }/${RequestDate.getFullYear()}`
      : "";

    return (
      <div>
        <div
          className="flex flex-wrap bg-gray-300 justify-center items-center mt-5 text-xs w-full tableBg"
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <th className="mb-3">Shipment Details</th>
        </div>
        <div
          className=" flex flex-wrap "
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <div className="w-1/2 px-2 border-r border-black">
            <table className=" mt-1 text-left text-xs">
              <tr>
                <th className="pl-2 pt-1 pb-1">Commodity : </th>
                <td className="pl-2 pt-1 pb-1">
                  {data && data.length > 0 && data[0].commodityTypeName !== ""
                    ? data[0].commodityTypeName
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pl-2 pt-1 pb-1">Gross Weight: </th>
                <td className="pl-2 pt-1 pb-1">
                  {data && data.length > 0 && data[0].cargoWt !== ""
                    ? data[0].cargoWt
                    : ""}{" "}
                  {data && data.length > 0 && data[0].cargoWtUnitCode !== ""
                    ? data[0].cargoWtUnitCode
                    : ""}
                </td>
              </tr>

              <tr>
                <th className="pl-2 pt-1 pb-1">Cargo Volume: </th>
                <td className="pl-2 pt-1 pb-1">
                  {data && data.length > 0 && data[0].volume !== ""
                    ? data[0].volume
                    : ""}{" "}
                  {data && data.length > 0 && data[0].volumeUnitCode !== ""
                    ? data[0].volumeUnitCode
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pl-2 pt-0 pb-2">No of Packages : </th>
                <td className="pl-2 pt-0 pb-2">
                  {data && data.length > 0 && data[0].noOfPackages !== ""
                    ? data[0].noOfPackages
                    : ""}{" "}
                  {data && data.length > 0 && data[0].packageNameCode !== ""
                    ? data[0].packageNameCode
                    : ""}
                </td>
              </tr>
            </table>
          </div>

          <div className="w-1/2 px-2">
            <table className="mt-1 text-left text-xs">
              <tr>
                <th className="pl-2 pt-1 pb-1">No of Pallets : </th>
                <td className="pl-2 pt-1 pb-1">
                  {data && data.length > 0 && data[0].noOfPallets !== ""
                    ? data[0].noOfPallets
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pl-2 pt-1 pb-1">Validity From : </th>
                <td className="pl-2 pt-1 pb-1">
                  {data && data.length > 0 && data[0].validityFrom !== ""
                    ? new Date(data[0].validityFrom).toLocaleDateString("en-GB") // en-GB gives dd/mm/yyyy format
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pl-2 pt-0 pb-2">Validity To : </th>
                <td className="pl-2 pt-0 pb-2">
                  {data && data.length > 0 && data[0].validityTo !== ""
                    ? new Date(data[0].validityTo).toLocaleDateString("en-GB") // en-GB gives dd/mm/yyyy format
                    : ""}
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div
          className=" px-2 text-xs w-full"
          style={{ border: "1px solid black" }}
        >
          <th className="pt-2 pb-3 pt-1 pb-1">
            Remarks:{" "}
            {data && data.length > 0 && data[0].remarks !== ""
              ? data[0].remarks
              : ""}{" "}
          </th>
        </div>
      </div>
    );
  };
  TariffExportShipperDetailsModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        commodityTypeName: PropTypes.string,
        cargoWtUnitCode: PropTypes.string,
        cargoWt: PropTypes.string,
        volumeUnitNameCode: PropTypes.string,
        volume: PropTypes.string,
        noOfPackages: PropTypes.string,
        noOfPallets: PropTypes.string,
        validityFrom: PropTypes.string,
        validityTo: PropTypes.string,
        Remarks: PropTypes.string,
      }),
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  };
  const TariffChargeSizeTypeModule = ({ data }) => {
    // Assuming data is structured correctly and contains an array of charge objects
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    // Filter out charges where the vendorName IS NOT present in the data array
    // const filteredRateRequestCharge = rateRequestCharge.filter((charge) => {
    //   return !data.some(
    //     (dataItem) => dataItem.vendorName !== charge.vendorName
    //   ); // Invert the comparison
    // });

    // const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
    //   // Ensure that '' entries are sorted last
    //   if (a.sellCurrencyName === "") return 1;
    //   if (b.sellCurrencyName === "") return -1;
    //   // Sort based on the currency name
    //   return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
    // });

    const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
      const aCurrency = a.sellCurrencyName || "";
      const bCurrency = b.sellCurrencyName || "";

      if (aCurrency === "" && bCurrency !== "") return 1;
      if (aCurrency !== "" && bCurrency === "") return -1;

      return aCurrency.localeCompare(bCurrency);
    });

    // Calculate subtotals by currency
    const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
      const currency = curr.sellCurrencyName || "";
      if (!acc[currency]) {
        acc[currency] = { amount: 0, totalAmount: 0 };
      }
      acc[currency].amount += curr.sellAmount || 0;
      acc[currency].totalAmount += curr.sellTotalAmount || 0;
      return acc;
    }, {});

    const grandTotal = sortedRateRequestCharge.reduce(
      (acc, charge) => acc + (charge.sellTotalAmount || 0),
      0,
    );

    console.log("sortedRateRequestCharge", sortedRateRequestCharge);

    const grandTotalInWords = toWords(grandTotal);

    // const Amount = sortedRateRequestCharge.reduce(
    //   (acc, charge) => acc + (charge.sellAmount || 0),
    //   0
    // );

    // const totalAmount = sortedRateRequestCharge.reduce(
    //   (acc, charge) => acc + (charge.sellTotalAmountHc || 0),
    //   0
    // );

    return (
      <>
        <div className="mt-1 flex flex-wrap headerTable ">
          <table
            className="mt-0 text-left text-xs "
            style={{
              borderTop: "1px solid black",
              borderLeft: "1px solid black",
              borderBottom: "1px solid black",
              width: "100%",
            }}
          >
            <thead>
              <tr>
                <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                  CHARGE DESCRIPTION
                </th>
                <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                  Size/Type
                </th>
                <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                  Qty
                </th>
                <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                  Curr
                </th>
                <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                  Ex. Rate
                </th>
                <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                  Rate
                </th>
                <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                  Amount
                </th>
                <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                  Total Amount
                </th>
                <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                  Remarks:
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRateRequestCharge.map((item, index, array) => {
                // Render charge row
                const rows = [
                  <tr key={`item-${index}`}>
                    <td
                      className="px-3 border-black border-b border-r py-px"
                      style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                    >
                      {`${item.chargeName || ""}`}
                    </td>

                    <td className="text-center border-black border-b border-r py-px">
                      {item.sizeName &&
                      item.sizeName !== "" &&
                      item.sizeName !== "null"
                        ? item.sizeName
                        : ""}{" "}
                      /{" "}
                      {item.typeCode &&
                      item.typeCode !== "" &&
                      item.typeCode !== "null"
                        ? item.typeCode
                        : ""}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.qty === "number" &&
                      item.qty !== null &&
                      item.qty !== ""
                        ? item.qty.toFixed(2)
                        : ""}
                    </td>
                    <td className="text-center border-black border-b border-r py-px">
                      {item.sellCurrencyName &&
                      item.sellCurrencyName !== "" &&
                      item.sellCurrencyName !== "null"
                        ? item.sellCurrencyName
                        : ""}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellExchangeRate === "number" &&
                      item.sellExchangeRate !== null &&
                      item.sellExchangeRate !== ""
                        ? item.sellExchangeRate.toFixed(2)
                        : ""}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellRate === "number" &&
                      item.sellRate !== null &&
                      item.sellRate !== ""
                        ? item.sellRate.toFixed(2)
                        : ""}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellAmount === "number" &&
                      item.sellAmount !== null &&
                      item.sellAmount !== ""
                        ? item.sellAmount.toFixed(2)
                        : ""}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellTotalAmount === "number" &&
                      item.sellTotalAmount !== null &&
                      item.sellTotalAmount !== ""
                        ? item.sellTotalAmount.toFixed(2)
                        : ""}
                    </td>
                    <td
                      className="text-left border-black border-b border-r py-px"
                      style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                    >
                      {item.remarks &&
                      item.remarks !== "" &&
                      item.remarks !== "null"
                        ? item.remarks
                        : ""}
                    </td>
                  </tr>,
                ];

                // Check if this is the last item or the next item has a different currency
                const lastOfCurrency =
                  index === array.length - 1 ||
                  array[index + 1].sellCurrencyName !== item.sellCurrencyName;
                if (lastOfCurrency) {
                  // Add subtotal row
                  const subtotal = subtotals[item.sellCurrencyName];
                  rows.push(
                    <tr key={`subtotal-${item.sellCurrencyName}`}>
                      <td className="border-black border-b border-r font-bold py-px px-2">
                        Total ({item.sellCurrencyName}):
                      </td>
                      <td className="text-center border-black border-b border-r"></td>
                      <td className="text-center border-black border-b border-r"></td>
                      <td className="text-center border-black border-b border-r"></td>
                      <td className="text-center border-black border-b border-r"></td>
                      <td className="text-center border-black border-b border-r"></td>
                      <td className="text-center border-black border-b border-r font-bold py-px">
                        {subtotal.amount.toFixed(2)}({item.sellCurrencyName}){" "}
                        {/* {Amount.toFixed(2)} */}
                      </td>
                      <td className="text-center border-black border-b border-r font-bold py-px">
                        {subtotal.totalAmount.toFixed(2)} (
                        {item.sellCurrencyName}){/* {totalAmount.toFixed(2)} */}
                      </td>
                      <td className="text-center border-black border-b border-r"></td>
                    </tr>,
                  );
                }
                return rows;
              })}
            </tbody>
          </table>
          <div
            className="mt-2 flex flex-wrap"
            style={{ width: "100%", marginTop: "5px" }}
          >
            <div
              className="text-xs w-full flex justify-between"
              style={{
                borderTop: "1px solid black",
                borderRight: "1px solid black",
                borderLeft: "1px solid black",
              }}
            >
              <div className="mt-1 font-bold py-px px-2">Grand Total:</div>
              <div className="mt-1 mr-10 font-bold py-px">
                {grandTotal.toFixed(2)}
              </div>
            </div>
            <div
              className="text-xs w-full flex"
              style={{ border: "1px solid black" }}
            >
              <div className="mt-1 font-bold px-2">Amount in Words:</div>
              <div className="mt-1 font-bold">
                {capitalizeFirstLetters(grandTotalInWords)} ONLY
              </div>
            </div>
          </div>
        </div>
        <p className="mt-2" style={{ fontSize: "9px" }}>
          VAT charges will be added in the invoice.
        </p>
      </>
    );
  };
  TariffChargeSizeTypeModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        tblRateRequestCharge: PropTypes.arrayOf(
          PropTypes.shape({
            chargeName: PropTypes.string,
            sizeName: PropTypes.string,
            typeCode: PropTypes.string,
            qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            sellCurrencyName: PropTypes.string,
            sellExchangeRate: PropTypes.number,
            sellRate: PropTypes.number,
            sellAmount: PropTypes.number,
            sellTotalAmount: PropTypes.number,
            remarks: PropTypes.string,
          }),
        ),
      }),
    ).isRequired,
  };
  const TariffExportParagrafModule = ({ data }) => {
    const [termsAndConditions, setTermsAndConditions] = useState("");

    useEffect(() => {
      const getdata = async () => {
        const data = await fetchTermsAndConditions();
        if (data && data.length > 0) {
          setTermsAndConditions(data[0].termsCondition || "");
        }
      };

      getdata();
    }, []);

    // Split the terms and conditions by line break ("\n") and map each line with its line number
    const termsArray = termsAndConditions
      .split("\n")
      .map((line) => {
        // Trim whitespace and check if the line is not empty
        if (line.trim().length > 0) {
          // Display the line content
          return ` ${line}`;
        }
        return null;
      })
      .filter((line) => line !== null); // Remove any null entries resulting from empty lines

    const companyName = data[0]?.companyName === "" ? "" : data[0]?.companyName;

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <div className="text-xs w-full">
          <h3 className="mt-0 font-bold">Terms & Conditions:</h3>
          {/* {termsArray.map((term, index) => (
                        <p key={index} className="mt-2 font-bold">{term}</p>
                    ))} */}
        </div>
        <div className="mt-1">
          <p className="mt-2">
            <strong>Thanks and Best Regards.</strong>
          </p>
          <p>
            <strong>For {companyName}</strong>
          </p>
        </div>
      </div>
    );
  };

  TariffExportParagrafModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        companyName: PropTypes.string,
        // Add any other expected properties from data here
      }),
    ).isRequired,
  };

  const QuotationSeaCustomerModule = ({ data }) => {
    const RequestDate =
      data && data.length > 0 ? new Date(data[0].rateRequestDate) : null;
    const monthNames = [
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
    const DatesFormat = RequestDate
      ? `${RequestDate.getDate()} ${
          monthNames[RequestDate.getMonth()]
        } ${RequestDate.getFullYear()}`
      : "";

    return (
      <div className="flex flex-wrap">
        <div className="w-1/2 px-2">
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th className="pr-8">Customer: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].customerName !== ""
                    ? data[0].customerName
                    : ""}
                </td>
              </tr>
              <tr className="mt-2">
                <th className="pr-8">ATTN:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].customerPerson !== ""
                    ? data[0].customerPerson
                    : ""}
                </td>
              </tr>
              <tr className="mt-2">
                <th className="pr-8">Sales Person:</th>
                <td className="pl-5">
                  {data &&
                  data.length > 0 &&
                  data[0].salesExecutivePerson !== ""
                    ? data[0].salesExecutivePerson
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-1/2 px-2">
          <table className="mt-1 ml-20 text-left text-xs">
            <tbody>
              <tr>
                <th className="pr-5">Quotation No:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].rateRequestNo !== ""
                    ? data[0].rateRequestNo
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pr-5">Dated:</th>
                <td className="pl-5">{DatesFormat}</td>
              </tr>
              <tr>
                <th className="pr-5">Handled By:</th>
                <td className="pl-5">{userName}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-full px-2">
          <hr className="hrRow"></hr>
        </div>
      </div>
    );
  };
  console.log("data", data);
  const QuotationExportShipperModule = ({ data }) => {
    return (
      <div className="mt-1 flex flex-wrap">
        <div className="w-1/2 px-2">
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th>Shipper:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].shipperName !== ""
                    ? data[0].shipperName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Pickup Address:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].pickupAddress !== ""
                    ? data[0].pickupAddress
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-1/2 px-2">
          <table className="mt-1 ml-20 text-left text-xs">
            <tbody>
              <tr>
                <th>Consignee:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].consName !== ""
                    ? data[0].consigneeText
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Delivery Address:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].deliveryAddress !== ""
                    ? data[0].deliveryAddress
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const QuotationExportShipperDetailsModule = ({ data }) => {
    let expectedSailDate;
    const formatDate = (date) => {
      if (!date) return ""; // Return empty string if date is null or undefined
      const d = new Date(date);
      const day = d.getDate();
      const monthNames = [
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
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    };

    if (data && data.length > 0 && data[0].expectedSailDate) {
      expectedSailDate = formatDate(data[0].expectedSailDate);
      console.log("Formatted Date: ", expectedSailDate);
    } else {
      console.log("Date is not available or data is undefined.");
      expectedSailDate = "";
    }

    return (
      <div>
        <div
          className="flex flex-wrap bg-gray-300 justify-center items-center mt-5 text-xs w-full tableBg"
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <th className="mt-1 mb-3">Shipment Details</th>
        </div>
        <div
          className=" flex flex-wrap "
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <div className="w-1/3 px-2 border-r border-black">
            <table className=" mt-1 text-left text-xs">
              <tr>
                <th>POR: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].plrName !== ""
                    ? data[0].plrName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>FPD: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].fpdName !== ""
                    ? data[0].fpdName
                    : ""}
                </td>
              </tr>

              <tr>
                <th>Cargo Type: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].cargoType !== ""
                    ? data[0].cargoType
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Origin Rate:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].originFreeDays !== ""
                    ? data[0].originFreeDays
                    : ""}
                  {" Free Days thereafter"}{" "}
                  {data && data.length > 0 && data[0].originDemurrageRate !== ""
                    ? data[0].originDemurrageRate
                    : ""}{" "}
                  {data && data.length > 0 && data[0].demurrageCurrency !== ""
                    ? data[0].demurrageCurrency
                    : ""}{" "}
                  {"per day"}
                </td>
              </tr>
            </table>
          </div>
          <div className="w-1/3 px-2 border-r border-black">
            <table className="mt-1 text-left text-xs">
              <tr>
                <th>POL:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].polName !== ""
                    ? data[0].polName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>EST Date:</th>
                <td className="pl-5">{expectedSailDate}</td>
              </tr>
              <tr>
                <th>Commodity:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].commodity !== ""
                    ? data[0].commodity
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pb-3">Destination Rate:</th>
                <td className="pl-5 pb-3">
                  {data && data.length > 0 && data[0].destinationFreeDays !== ""
                    ? data[0].destinationFreeDays
                    : ""}
                  {" Free Days thereafter"}{" "}
                  {data &&
                  data.length > 0 &&
                  data[0].destinationDemurrageRate !== ""
                    ? data[0].destinationDemurrageRate
                    : ""}{" "}
                  {data && data.length > 0 && data[0].demurrageCurrency !== ""
                    ? data[0].demurrageCurrency
                    : ""}{" "}
                  {"per day"}
                </td>
              </tr>
            </table>
          </div>
          <div className="w-1/3 px-2">
            <table className="mt-1 text-left text-xs">
              <tr>
                <th>POD: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].podName !== ""
                    ? data[0].podName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Gross Weight:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].cargoWt !== ""
                    ? data[0].cargoWt
                    : ""}{" "}
                  {data && data.length > 0 && data[0].cargoWtUnitNameCode !== ""
                    ? data[0].cargoWtUnitNameCode
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Shipment Type: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].natureOfCargoName !== ""
                    ? data[0].natureOfCargoName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Validity To: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].validityTo
                    ? new Date(data[0].validityTo).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </td>
              </tr>
            </table>
          </div>
        </div>
        <div className="text-xs w-full" style={{ border: "1px solid black" }}>
          <th className="pt-2 pb-3">
            Remarks:{" "}
            {data && data.length > 0 && data[0].remarks !== ""
              ? data[0].remarks
              : ""}{" "}
          </th>
        </div>
      </div>
    );
  };
  const QuotationExportSizeTypeModule = ({ data }) => {
    const rateRequestQty =
      data && data.length > 0 ? data[0].tblRateRequestQty : [];
    return (
      <div className="mt-1 flex flex-wrap headerTable headerTable">
        <table
          className="mt-0.5 text-left text-xs"
          style={{ border: "1px solid black", width: "50%" }}
        >
          <thead>
            <tr className="bg-gray-300">
              <th className="text-center border-black border-b border-r pb-2">
                Size / Type
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Gross Weight
              </th>
            </tr>
          </thead>
          <tbody>
            {rateRequestQty.map((item, index) => (
              <tr key={`item-${index}`}>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {`${item?.sizeName || ""} / ${item?.typeName || ""}`}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {item.qty && item.qty !== ""
                    ? parseFloat(item.qty).toFixed(2)
                    : ""}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {/* {item.qty && item.wtUnitName !== '' ? item.wtUnitName : ''} */}
                  {`${item?.cargoWt ? item.cargoWt : ""} ${
                    item?.wtUnitName ? item.wtUnitName : ""
                  }`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    );
  };
  const QuotationExportChargeModuleWithTax = ({ data }) => {
    // Assuming data is structured correctly and contains an array of charge objects
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    console.log("NEWCharge", rateRequestCharge);
    // Filter out charges where the vendorName IS NOT present in the data array
    const filteredRateRequestCharge = rateRequestCharge.filter((charge) => {
      return !data.some(
        (dataItem) => dataItem.vendorName !== charge.vendorName,
      ); // Invert the comparison
    });

    const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
      // Ensure that '' entries are sorted last
      if (a.sellCurrencyName === "") return 1;
      if (b.sellCurrencyName === "") return -1;
      // Sort based on the currency name
      return a.sellCurrencyName?.localeCompare(b.sellCurrencyName);
    });

    // Calculate subtotals by currency
    const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
      const currency = curr.sellCurrencyName || "";
      if (!acc[currency]) {
        acc[currency] = { amount: 0, taxAmount: 0, totalAmount: 0 };
      }
      acc[currency].amount += curr.sellAmount || 0;
      acc[currency].taxAmount += curr.sellTaxAmount || 0;
      acc[currency].totalAmount += curr.sellTotalAmount || 0;
      return acc;
    }, {});

    const grandTotal = sortedRateRequestCharge.reduce(
      (acc, charge) => acc + (charge.sellTotalAmount || 0),
      0,
    );

    const grandTotalInWords = toWords(grandTotal);

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0 text-left text-xs"
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr className="bg-gray-300">
              <th className="text-center border-black border-b border-r pt-2">
                Charge Description
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Size/Type
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Curr
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Ex. Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Tax Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Total Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Remarks:
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRateRequestCharge.map((item, index, array) => {
              // Render charge row

              const rows = [
                <tr key={`item-${index}`}>
                  <td
                    className="px-3 border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {`${item.chargeDescription || ""}`}
                  </td>

                  <td className="text-left border-black border-b border-r py-px">
                    {item.sizeName &&
                    item.sizeName !== "" &&
                    item.sizeName !== "null"
                      ? item.sizeName
                      : ""}{" "}
                    /{" "}
                    {item.typeName &&
                    item.typeName !== "" &&
                    item.typeName !== "null"
                      ? item.typeName
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.qty === "number" &&
                    item.qty !== null &&
                    item.qty !== ""
                      ? item.qty.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellCurrency &&
                    item.sellCurrency !== "" &&
                    item.sellCurrency !== "null"
                      ? item.sellCurrency
                      : ""}
                  </td>
                  <td className="text-left border-black border-b border-r py-px">
                    {typeof item.sellExchangeRate === "number" &&
                    item.sellExchangeRate !== null &&
                    item.sellExchangeRate !== ""
                      ? item.sellExchangeRate.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellRate === "number" &&
                    item.sellRate !== null &&
                    item.sellRate !== ""
                      ? item.sellRate.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellAmount === "number" &&
                    item.sellAmount !== null &&
                    item.sellAmount !== ""
                      ? item.sellAmount.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellTaxAmount === "number" &&
                    item.sellTaxAmount !== null &&
                    item.sellTaxAmount !== ""
                      ? item.sellTaxAmount.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellTotalAmount === "number" &&
                    item.sellTotalAmount !== null &&
                    item.sellTotalAmount !== ""
                      ? item.sellTotalAmount.toFixed(2)
                      : ""}
                  </td>
                  <td
                    className="text-left border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {item.remarks &&
                    item.remarks !== "" &&
                    item.remarks !== "null"
                      ? item.remarks
                      : ""}
                  </td>
                </tr>,
              ];

              // Check if this is the last item or the next item has a different currency
              const lastOfCurrency =
                index === array.length - 1 ||
                array[index + 1].sellCurrency !== item.sellCurrency;
              if (lastOfCurrency) {
                // Add subtotal row
                const subtotal = subtotals[item.sellCurrency];
                rows.push(
                  <tr key={`subtotal-${item.sellCurrency}`}>
                    <td className="border-black border-b border-r font-bold py-px">
                      Total ({item.sellCurrency}):
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.amount.toFixed(2)} ({item.sellCurrency})
                    </td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.taxAmount.toFixed(2)}({item.sellCurrency})
                    </td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.totalAmount.toFixed(2)}({item.sellCurrency}
                      ){" "}
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                  </tr>,
                );
              }
              return rows;
            })}
          </tbody>
        </table>
        <div
          className="mt-2 flex flex-wrap"
          style={{ width: "100%", marginTop: "5px" }}
        >
          <div
            className="text-xs w-full flex justify-between"
            style={{
              borderTop: "1px solid black",
              borderRight: "1px solid black",
              borderLeft: "1px solid black",
            }}
          >
            <div className="mt-2 font-bold py-px">Grand Total:</div>
            <div className="mt-2 mr-10 font-bold py-px">
              {grandTotal.toFixed(2)}
            </div>
          </div>
          <div
            className="text-xs w-full flex justify-between"
            style={{ border: "1px solid black" }}
          >
            <div className="mt-2 font-bold py-px">Amount in Words:</div>
            <div className="mt-2 font-bold py-px flex-grow text-left">
              {capitalizeFirstLetters(grandTotalInWords)} ONLY
            </div>
          </div>
        </div>
      </div>
    );
  };
  const QuotationExportAirChargeModuleWithTax = ({ data }) => {
    // Assuming data is structured correctly and contains an array of charge objects
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    console.log("NEWCharge", rateRequestCharge);
    // Filter out charges where the vendorName IS NOT present in the data array
    const filteredRateRequestCharge = rateRequestCharge.filter((charge) => {
      return !data.some(
        (dataItem) => dataItem.vendorName !== charge.vendorName,
      ); // Invert the comparison
    });

    console.log("rateRequestCharge =>", rateRequestCharge);

    // const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
    //   // Ensure that '' entries are sorted last
    //   if (a.sellCurrencyName === "") return 1;
    //   if (b.sellCurrencyName === "") return -1;
    //   // Sort based on the currency name
    //   return a.sellCurrencyName?.localeCompare(b.sellCurrencyName);
    // });

    const sortedRateRequestCharge = rateRequestCharge
      .filter((item) => item?.sellTaxAmount != null) // Filter where sellTaxAmount is not null
      .sort((a, b) => {
        // Ensure that '' entries are sorted last
        if (a.sellCurrencyName === "") return 1;
        if (b.sellCurrencyName === "") return -1;
        // Sort based on the currency name
        return a.sellCurrencyName?.localeCompare(b.sellCurrencyName);
      });

    // Calculate subtotals by currency
    const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
      const currency = curr.sellCurrencyName || "";
      if (!acc[currency]) {
        acc[currency] = { amount: 0, taxAmount: 0, totalAmount: 0 };
      }
      acc[currency].amount += curr.sellAmount || 0;
      acc[currency].taxAmount += curr.sellTaxAmount || 0;
      acc[currency].totalAmount += curr.sellTotalAmount || 0;
      return acc;
    }, {});

    const grandTotal = sortedRateRequestCharge.reduce(
      (acc, charge) => acc + (charge.sellTotalAmount || 0),
      0,
    );

    const grandTotalInWords = toWords(grandTotal);

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0 text-left text-xs"
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr className="bg-gray-300">
              <th className="text-center border-black border-b border-r pt-2">
                Charge Description
              </th>

              <th className="text-center border-black border-b border-r pt-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Curr
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Ex. Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Tax Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Total Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Remarks:
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRateRequestCharge.map((item, index, array) => {
              // Render charge row

              const rows = [
                <tr key={`item-${index}`}>
                  <td
                    className="px-3 border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {`${item.chargeDescription || ""}`}
                  </td>

                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.qty === "number" &&
                    item.qty !== null &&
                    item.qty !== ""
                      ? item.qty.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellCurrency &&
                    item.sellCurrency !== "" &&
                    item.sellCurrency !== "null"
                      ? item.sellCurrency
                      : ""}
                  </td>
                  <td className="text-left border-black border-b border-r py-px">
                    {typeof item.sellExchangeRate === "number" &&
                    item.sellExchangeRate !== null &&
                    item.sellExchangeRate !== ""
                      ? item.sellExchangeRate.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellRate === "number" &&
                    item.sellRate !== null &&
                    item.sellRate !== ""
                      ? item.sellRate.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellAmount === "number" &&
                    item.sellAmount !== null &&
                    item.sellAmount !== ""
                      ? item.sellAmount.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellTaxAmount === "number" &&
                    item.sellTaxAmount !== null &&
                    item.sellTaxAmount !== ""
                      ? item.sellTaxAmount.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellTotalAmount === "number" &&
                    item.sellTotalAmount !== null &&
                    item.sellTotalAmount !== ""
                      ? item.sellTotalAmount.toFixed(2)
                      : ""}
                  </td>
                  <td
                    className="text-left border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {item.remarks &&
                    item.remarks !== "" &&
                    item.remarks !== "null"
                      ? item.remarks
                      : ""}
                  </td>
                </tr>,
              ];

              // Check if this is the last item or the next item has a different currency
              const lastOfCurrency =
                index === array.length - 1 ||
                array[index + 1].sellCurrency !== item.sellCurrency;
              if (lastOfCurrency) {
                // Add subtotal row
                const subtotal = subtotals[item.sellCurrency];
                rows.push(
                  <tr key={`subtotal-${item.sellCurrency}`}>
                    <td className="border-black border-b border-r font-bold py-px">
                      Total ({item.sellCurrency}):
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-center border-black border-b border-r"></td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.amount.toFixed(2)} ({item.sellCurrency})
                    </td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.taxAmount.toFixed(2)}({item.sellCurrency})
                    </td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.totalAmount.toFixed(2)}({item.sellCurrency}
                      ){" "}
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                  </tr>,
                );
              }
              return rows;
            })}
          </tbody>
        </table>
        <div
          className="mt-2 flex flex-wrap"
          style={{ width: "100%", marginTop: "5px" }}
        >
          <div
            className="text-xs w-full flex justify-between"
            style={{
              borderTop: "1px solid black",
              borderRight: "1px solid black",
              borderLeft: "1px solid black",
            }}
          >
            <div className="mt-2 font-bold py-px">Grand Total:</div>
            <div className="mt-2 mr-10 font-bold py-px">
              {grandTotal.toFixed(2)}
            </div>
          </div>
          <div
            className="text-xs w-full flex justify-between"
            style={{ border: "1px solid black" }}
          >
            <div className="mt-2 font-bold py-px">Amount in Words:</div>
            <div className="mt-2 font-bold py-px flex-grow text-left">
              {capitalizeFirstLetters(grandTotalInWords)} ONLY
            </div>
          </div>
        </div>
      </div>
    );
  };
  // const QuotationExportParagrafModule = ({ data }) => {
  //     const [termsAndConditions, setTermsAndConditions] = useState("");

  //     useEffect(() => {
  //         const getdata = async () => {
  //             const data = await fetchTermsAndConditions();
  //             if (data && data.length > 0) {
  //                 setTermsAndConditions(data[0].termsCondition || "");
  //             }
  //         };

  //         getdata();
  //     }, []);

  //     // Split the terms and conditions by line break ("\n") and map each line with its line number
  //     const termsArray = termsAndConditions
  //         .split("\n")
  //         .map((line) => {
  //             // Trim whitespace and check if the line is not empty
  //             if (line.trim().length > 0) {
  //                 // Display the line content
  //                 return ` ${line}`;
  //             }
  //             return null;
  //         })
  //         .filter((line) => line !== null); // Remove any null entries resulting from empty lines

  //     // Check if data is valid and has a companyName property
  //     // const isValidCompanyName = data && data.length > 0 && data[0].hasOwnProperty('companyName');

  //     // Display company name if available, otherwise show blank
  //     const companyName = data[0]?.companyName === "" ? "" : data[0]?.companyName;

  //     return (
  //         <div className="mt-1 flex flex-wrap headerTable">
  //             <div className="text-xs w-full">
  //                 <h3 className="mt-0 font-bold">Terms & Conditions:</h3>
  //                 {termsArray.map((term, index) => (
  //                     <p key={index} className="mt-2 font-bold">
  //                         {term}
  //                     </p>
  //                 ))}
  //             </div>
  //             <div className="mt-1">
  //                 <p className="mt-2">
  //                     <strong>Thanks and Best Regards.</strong>
  //                 </p>
  //                 <p>
  //                     <strong>For {companyName}</strong>
  //                 </p>
  //             </div>
  //         </div>
  //     );
  // };
  const QuotationExportParagrafModule = ({ data }) => {
    let terms = `1) In case insurance is needed, it arranged at the request of Shipper/Consignee with applicable charges.

2) GST is applicable as per government of india rules and may change from time to time.

3) Bookings are subject to Cargo acceptance, Space and equipment availability by carrier/carriers agent.

4) Rates are valid only for Commodity & Dimensions mentioned herein. Actual billing will be as per final weight & dimensions calculated by Carrier and

appearing on Transport Document.

5) These rates are not valid for dangerous goods/ hazardous, perishable, restricted article & over dimensional cargo.

6) All business transactions are subject to Standard Trading Conditions as approved by Federation of Freight Forwarders Association in India. Disputes

are subject to Mumbai jurisdiction.

7) The Cargo to be insured by Shipper / Consignee /Any other party nominated by the Shipper/Consignee. Shall

not be held responsible any Loss/ Damage of goods in transit.

8) Fumigation for wooden pallets/packaging can be arranged as per request. Cargo to be stuffed by Shipper and arranged in Airworthy/Seaworthy

packing as applicable to the shipment.

9) Rates are for Stackable cargo unless specifically mentioned otherwise.

10) Exchange rate applicable as on date of arrival/departure as the case may be.

11) Please note that rates will be charged on Gross Weight or Airline Weight calculation (i.e Chargeable weight), whichever is higher.

12) Airport Handling, Warehousing, Statutory Charges, Custom Duty & Stamp Duty and all Receipted charges will be charged at Actuals with Receipt.

13) Wherever the charges are mentioned as “ACTUALS” , receipt will be provided and the rates will be based on actual charged by Carrier/Terminal

Operator/ Airport Authority or any other third party.

14) FSC/ SSC computed are based on the current prevalent index & any revision will have a bearing on our Final Offer/ Quote.

15) Bookings is subject to space availability with respective carrier.`;
    const [termsAndConditions, setTermsAndConditions] = useState("");

    useEffect(() => {
      const getdata = async () => {
        const data = await fetchTermsAndConditions();
        if (data && data.length > 0) {
          setTermsAndConditions(data[0].termsCondition || "");
        } else {
          setTermsAndConditions(terms);
        }
      };

      getdata();
    }, []);

    // Split the terms and conditions by line break ("\n") and map each line with its line number
    const termsArray = termsAndConditions
      .split("\n")
      .map((line) => {
        // Trim whitespace and check if the line is not empty
        if (line.trim().length > 0) {
          // Display the line content
          return ` ${line}`;
        }
        return null;
      })
      .filter((line) => line !== null); // Remove any null entries resulting from empty lines

    // Check if data is valid and has a companyName property
    // const isValidCompanyName = data && data.length > 0 && data[0].hasOwnProperty('companyName');

    // Display company name if available, otherwise show blank
    const companyName = data[0]?.companyName === "" ? "" : data[0]?.companyName;

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <div className="text-xs w-full">
          <h3 className="mt-0 font-bold">Terms & Conditions :</h3>
          {termsArray.map((term, index) => (
            <p key={index} className="mt-2 font-bold">
              {term}
            </p>
          ))}
        </div>
        <div className="mt-1">
          <p className="mt-2">
            <strong>Thanks and Best Regards.</strong>
          </p>
          <p>
            <strong>For {companyName}</strong>
          </p>
        </div>
      </div>
    );
  };
  const QuotationExportChargeModuleWithoutTax = ({ data }) => {
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];

    console.log("NEWCharge", rateRequestCharge);

    const filteredRateRequestCharge = rateRequestCharge.filter((charge) => {
      return !data.some(
        (dataItem) => dataItem.vendorName !== charge.vendorName,
      );
    });

    const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
      if (a.sellCurrencyName === "") return 1;
      if (b.sellCurrencyName === "") return -1;
      return a.sellCurrencyName?.localeCompare(b.sellCurrencyName);
    });

    const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
      const currency = curr.sellCurrencyName || "";
      if (!acc[currency]) {
        acc[currency] = { sellAmount: 0, sellTotalAmount: 0 };
      }
      acc[currency].sellAmount += curr.sellAmount || 0;
      acc[currency].sellTotalAmount += curr.sellTotalAmount || 0;
      return acc;
    }, {});

    const grandTotal = sortedRateRequestCharge.reduce(
      (acc, charge) => acc + (charge.sellTotalAmount || 0),
      0,
    );

    const grandTotalInWords = toWords(grandTotal);

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0 text-left text-xs"
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr className="bg-gray-300">
              <th className="text-center border-black border-b border-r pt-2">
                Charge Description
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Size/Type
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Curr
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Ex. Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Total Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Remarks:
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRateRequestCharge.map((item, index, array) => {
              const rows = [
                <tr key={`item-${index}`}>
                  <td
                    className="px-3 border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {item.chargeDescription || ""}
                  </td>
                  <td className="text-left border-black border-b border-r py-px">
                    {item.sizeName || ""} / {item.typeName || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.qty?.toFixed(2) || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellCurrency || ""}
                  </td>
                  <td className="text-left border-black border-b border-r py-px">
                    {item.sellExchangeRate?.toFixed(2) || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellRate?.toFixed(2) || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellAmount?.toFixed(2) || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellTotalAmount?.toFixed(2) || ""}
                  </td>
                  <td
                    className="text-left border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {item.remarks || ""}
                  </td>
                </tr>,
              ];

              const lastOfCurrency =
                index === array.length - 1 ||
                array[index + 1].sellCurrency !== item.sellCurrency;
              if (lastOfCurrency) {
                const subtotal = subtotals[item.sellCurrency];
                rows.push(
                  <tr key={`subtotal-${item.sellCurrency}`}>
                    <td className="border-black border-b border-r font-bold py-px">
                      Total ({item.sellCurrency}):
                    </td>
                    <td
                      colSpan={5}
                      className="text-center border-black border-b border-r"
                    ></td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.sellAmount.toFixed(2)} ({item.sellCurrency})
                    </td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.sellTotalAmount.toFixed(2)} (
                      {item.sellCurrency})
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                  </tr>,
                );
              }
              return rows;
            })}
          </tbody>
        </table>
        <div
          className="mt-2 flex flex-wrap"
          style={{ width: "100%", marginTop: "5px" }}
        >
          <div
            className="text-xs w-full flex justify-between"
            style={{
              borderTop: "1px solid black",
              borderRight: "1px solid black",
              borderLeft: "1px solid black",
            }}
          >
            <div className="mt-2 font-bold py-px">Grand Total:</div>
            <div className="mt-2 mr-10 font-bold py-px">
              {grandTotal.toFixed(2)}
            </div>
          </div>
          <div
            className="text-xs w-full flex justify-between"
            style={{ border: "1px solid black" }}
          >
            <div className="mt-2 font-bold py-px">Amount in Words:</div>
            <div className="mt-2 font-bold py-px flex-grow text-left">
              {capitalizeFirstLetters(grandTotalInWords)} ONLY
            </div>
          </div>
        </div>
      </div>
    );
  };

  // const QuotationExportChargeModuleWithoutTax = ({ data }) => {
  //   const rateRequestCharge =
  //     data && Array.isArray(data) && data.length > 0
  //       ? data[0].tblRateRequestCharge
  //       : [];

  //   console.log("NEWCharge", rateRequestCharge);

  //   const filteredRateRequestCharge = rateRequestCharge.filter((charge) => {
  //     return !data.some((dataItem) => dataItem.vendorName !== charge.vendorName);
  //   });

  //   const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
  //     if (a.sellCurrencyName === '') return 1;
  //     if (b.sellCurrencyName === '') return -1;
  //     return a.sellCurrencyName?.localeCompare(b.sellCurrencyName);
  //   });

  //   const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
  //     const currency = curr.sellCurrencyName || '';
  //     if (!acc[currency]) {
  //       acc[currency] = { amount: 0, totalAmount: 0 };
  //     }
  //     acc[currency].amount += curr.sellAmount || 0;
  //     acc[currency].totalAmount += curr.sellTotalAmount || 0;
  //     return acc;
  //   }, {});

  //   const grandTotal = sortedRateRequestCharge.reduce(
  //     (acc, charge) => acc + (charge.sellTotalAmount || 0),
  //     0
  //   );

  //   const grandTotalInWords = toWords(grandTotal);

  //   return (
  //     <div className="mt-1 flex flex-wrap headerTable">
  //       <table
  //         className="mt-0 text-left text-xs"
  //         style={{
  //           borderTop: '1px solid black',
  //           borderLeft: '1px solid black',
  //           borderBottom: '1px solid black',
  //           width: '100%',
  //         }}
  //       >
  //         <thead>
  //           <tr className="bg-gray-300">
  //             <th className="text-center border-black border-b border-r pt-2">Charge Description</th>
  //             <th className="text-center border-black border-b border-r pt-2">Size/Type</th>
  //             <th className="text-center border-black border-b border-r pt-2">Qty</th>
  //             <th className="text-center border-black border-b border-r pt-2">Curr</th>
  //             <th className="text-center border-black border-b border-r pt-2">Ex. Rate</th>
  //             <th className="text-center border-black border-b border-r pt-2">Rate</th>
  //             <th className="text-center border-black border-b border-r pt-2">Amount</th>
  //             <th className="text-center border-black border-b border-r pt-2">Total Amount</th>
  //             <th className="text-center border-black border-b border-r pt-2">Remarks:</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           {sortedRateRequestCharge.map((item, index, array) => {
  //             const rows = [
  //               <tr key={`item-${index}`}>
  //                 <td className="px-3 border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>{item.chargeDescription || ''}</td>
  //                 <td className="text-left border-black border-b border-r py-px">{item.sizeName || ''} / {item.typeName || ''}</td>
  //                 <td className="text-right border-black border-b border-r py-px">{item.qty?.toFixed(2) || ''}</td>
  //                 <td className="text-right border-black border-b border-r py-px">{item.sellCurrency || ''}</td>
  //                 <td className="text-left border-black border-b border-r py-px">{item.sellExchangeRate?.toFixed(2) || ''}</td>
  //                 <td className="text-right border-black border-b border-r py-px">{item.sellRate?.toFixed(2) || ''}</td>
  //                 <td className="text-right border-black border-b border-r py-px">{item.sellAmount?.toFixed(2) || ''}</td>
  //                 <td className="text-right border-black border-b border-r py-px">{item.sellTotalAmount?.toFixed(2) || ''}</td>
  //                 <td className="text-left border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>{item.remarks || ''}</td>
  //               </tr>,
  //             ];

  //             const lastOfCurrency =
  //               index === array.length - 1 ||
  //               array[index + 1].sellCurrency !== item.sellCurrency;
  //             if (lastOfCurrency) {
  //               const subtotal = subtotals[item.sellCurrency];
  //               rows.push(
  //                 <tr key={`subtotal-${item.sellCurrency}`}>
  //                   <td className="border-black border-b border-r font-bold py-px">Total ({item.sellCurrency}):</td>
  //                   <td colSpan={5} className="text-center border-black border-b border-r"></td>
  //                   <td className="text-right border-black border-b border-r font-bold py-px">{subtotal?.amount.toFixed(2)} ({item.sellCurrency})</td>
  //                   <td className="text-right border-black border-b border-r font-bold py-px">{subtotal?.totalAmount.toFixed(2)} ({item.sellCurrency})</td>
  //                   <td className="text-center border-black border-b border-r"></td>
  //                 </tr>
  //               );
  //             }
  //             return rows;
  //           })}
  //         </tbody>
  //       </table>
  //       <div className="mt-2 flex flex-wrap" style={{ width: '100%', marginTop: '5px' }}>
  //         <div className="text-xs w-full flex justify-between" style={{ borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}>
  //           <div className="mt-2 font-bold py-px">Grand Total:</div>
  //           <div className="mt-2 mr-10 font-bold py-px">{grandTotal.toFixed(2)}</div>
  //         </div>
  //         <div className="text-xs w-full flex justify-between" style={{ border: '1px solid black' }}>
  //           <div className="mt-2 font-bold py-px">Amount in Words:</div>
  //           <div className="mt-2 font-bold py-px flex-grow text-left">{capitalizeFirstLetters(grandTotalInWords)} ONLY</div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };
  const QuotationExportChargeModuleAirWithoutTax = ({ data }) => {
    console.log("data", data);
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];

    console.log("NEWCharge", rateRequestCharge);

    const filteredRateRequestCharge = rateRequestCharge.filter((charge) => {
      return !data.some(
        (dataItem) => dataItem.vendorName !== charge.vendorName,
      );
    });

    // const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
    //   if (a.sellCurrencyName === "") return 1;
    //   if (b.sellCurrencyName === "") return -1;
    //   return a.sellCurrencyName?.localeCompare(b.sellCurrencyName);
    // });

    const sortedRateRequestCharge = rateRequestCharge.filter(
      (item) => item.sellTaxAmount == null || item.sellTaxAmount === "",
    );

    const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
      const currency = curr.sellCurrencyName || "";
      if (!acc[currency]) {
        acc[currency] = { amount: 0, totalAmount: 0 };
      }
      acc[currency].amount += curr.sellAmount || 0;
      acc[currency].totalAmount += curr.sellTotalAmount || 0;
      return acc;
    }, {});

    const grandTotal = sortedRateRequestCharge.reduce(
      (acc, charge) => acc + (charge.sellTotalAmount || 0),
      0,
    );

    const grandTotalInWords = toWords(grandTotal);

    return (
      <div className="mt-1 flex flex-wrap headerTable">
        <table
          className="mt-0 text-left text-xs"
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr className="bg-gray-300">
              <th className="text-center border-black border-b border-r pt-2">
                Charge Description
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Size/Type
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Curr
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Ex. Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Total Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2">
                Remarks:
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRateRequestCharge.map((item, index, array) => {
              const rows = [
                <tr key={`item-${index}`}>
                  <td
                    className="px-3 border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {item.chargeDescription || ""}
                  </td>
                  <td className="text-left border-black border-b border-r py-px">
                    {item.sizeName || ""} / {item.typeName || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.qty?.toFixed(2) || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellCurrency || ""}
                  </td>
                  <td className="text-left border-black border-b border-r py-px">
                    {item.sellExchangeRate?.toFixed(2) || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellRate?.toFixed(2) || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellAmount?.toFixed(2) || ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {item.sellTotalAmount?.toFixed(2) || ""}
                  </td>
                  <td
                    className="text-left border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {item.remarks || ""}
                  </td>
                </tr>,
              ];

              const lastOfCurrency =
                index === array.length - 1 ||
                array[index + 1].sellCurrency !== item.sellCurrency;
              if (lastOfCurrency) {
                const subtotal = subtotals[item.sellCurrency];
                rows.push(
                  <tr key={`subtotal-${item.sellCurrency}`}>
                    <td className="border-black border-b border-r font-bold py-px">
                      Total ({item.sellCurrency}):
                    </td>
                    <td
                      colSpan={5}
                      className="text-center border-black border-b border-r"
                    ></td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.amount.toFixed(2)} ({item.sellCurrency})
                    </td>
                    <td className="text-right border-black border-b border-r font-bold py-px">
                      {subtotal?.totalAmount.toFixed(2)} ({item.sellCurrency})
                    </td>
                    <td className="text-center border-black border-b border-r"></td>
                  </tr>,
                );
              }
              return rows;
            })}
          </tbody>
        </table>
        <div
          className="mt-2 flex flex-wrap"
          style={{ width: "100%", marginTop: "5px" }}
        >
          <div
            className="text-xs w-full flex justify-between"
            style={{
              borderTop: "1px solid black",
              borderRight: "1px solid black",
              borderLeft: "1px solid black",
            }}
          >
            <div className="mt-2 font-bold py-px">Grand Total:</div>
            <div className="mt-2 mr-10 font-bold py-px">
              {grandTotal.toFixed(2)}
            </div>
          </div>
          <div
            className="text-xs w-full flex justify-between"
            style={{ border: "1px solid black" }}
          >
            <div className="mt-2 font-bold py-px">Amount in Words:</div>
            <div className="mt-2 font-bold py-px flex-grow text-left">
              {capitalizeFirstLetters(grandTotalInWords)} ONLY
            </div>
          </div>
        </div>
      </div>
    );
  };
  const QuotationExportShipperDetailsModuleAir = ({ data }) => {
    const FromDate =
      data && data.length > 0 ? new Date(data[0].validityFrom) : null;
    const monthNames = [
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
    const FromDates = FromDate
      ? `${FromDate.getDate()} ${
          monthNames[FromDate.getMonth()]
        } ${FromDate.getFullYear()}`
      : "";

    // const ToDate = data && data.length > 0 ? new Date(data[0].validityTo) : null;
    // const ToDates = ToDate ? `${ToDate.getDate()}/${ToDate.getMonth() + 1}/${ToDate.getFullYear()}` : '';

    return (
      <div>
        <div
          className="bg-gray-300 flex flex-wrap  justify-center items-center mt-5 text-xs w-full"
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <th className="mt-1">Shipment Details</th>
        </div>
        <div
          className=" flex flex-wrap "
          style={{
            borderTop: "1px solid black",
            borderRight: "1px solid black",
            borderLeft: "1px solid black",
          }}
        >
          <div className="w-1/3 px-2 border-r border-black">
            <table className=" mt-1 text-left text-xs">
              <tr>
                <th>Orgin Airport:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].polName !== ""
                    ? data[0].polName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Transit Time: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].transitTime !== ""
                    ? data[0].transitTime
                    : ""}
                </td>
              </tr>

              <tr>
                <th>Cargo Type:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].cargoType !== ""
                    ? data[0].cargoType
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Volume: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].volume !== ""
                    ? data[0].volume
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Validity From: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].validityFrom
                    ? new Date(data[0].validityFrom).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : ""}
                </td>
              </tr>
            </table>
          </div>
          <div className="w-1/3 px-2 border-r border-black">
            <table className="mt-1 text-left text-xs">
              <tr>
                <th>Dest Airport:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].podName !== ""
                    ? data[0].podName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Commodity Type: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].commodityType !== ""
                    ? data[0].commodityType
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Gross Wt:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].cargoWt !== ""
                    ? data[0].cargoWt
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Volumetric Wt:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].volumeWt !== ""
                    ? data[0].volumeWt
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Validity To: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].validityTo
                    ? new Date(data[0].validityTo).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </td>
              </tr>
            </table>
          </div>
          <div className="w-1/3 px-2 ">
            <table className="mt-1 text-left text-xs">
              <tr>
                <th>Routing: </th>
                <td className="pl-5"></td>
              </tr>
              <tr>
                <th>Commodity: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].commodity !== ""
                    ? data[0].commodity
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Chargeable Wt: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].chargeableWt !== ""
                    ? data[0].chargeableWt
                    : ""}{" "}
                </td>
              </tr>
              <tr>
                <th>Trade Terms: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].tradeTerms !== ""
                    ? data[0].tradeTerms
                    : ""}
                </td>
              </tr>
            </table>
          </div>
        </div>

        <div className="text-xs w-full" style={{ border: "1px solid black" }}>
          <th className="pt-2">Remarks: </th>
        </div>
      </div>
    );
  };

  const QuotationExportSizeTypeModuleAir = ({ data }) => {
    const rateRequestQty =
      data && data.length > 0 ? data[0].tblRateRequestQty : [];

    console.log("NEW AIR ", rateRequestQty);
    return (
      <div className="mt-1 flex flex-grow w-full justify-center">
        <table
          className="mt-0.5 text-left text-xs w-full"
          style={{ border: "1px solid black" }}
        >
          <thead>
            <tr className="bg-gray-300">
              <th className="text-center border-black border-b border-r pb-2">
                No Of Packages
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Gross Weight
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                L x W x H
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Volume
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Volumetric Weight
              </th>
            </tr>
          </thead>
          <tbody>
            {rateRequestQty.map((item, index) => (
              <tr key={`item-${index}`}>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {`${item.noOfPackages !== "" ? item.noOfPackages : ""} `}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {item.qty && item.qty !== ""
                    ? parseFloat(item.qty).toFixed(2)
                    : ""}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {`${item.length !== "" ? item.length : ""} X ${
                    item.width !== "" ? item.width : ""
                  } X ${item.height !== "" ? item.height : ""} ${
                    item.dimensionUnit !== "" ? item.dimensionUnit : ""
                  }`}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {item.volume || ""}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {item.volumeUnit || ""}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    );
  };

  const QuotationAirGridChargeWise = ({ data }) => {
    const rateRequestCharge =
      data && data.length > 0 ? data[0].tblRateRequestCharge : [];

    return <div className="mt-1 flex flex-grow w-full"></div>;
  };

  const QuotationExportChargeVendorWiseModule = ({ data }) => {
    let chargeData =
      data && data.length > 0 ? data[0].tblRateRequestCharge : [];

    let grandTotalAmount = chargeData.reduce((acc, item) => {
      return acc + (parseFloat(item.sellAmountHc) || 0);
    }, 0);

    let grandTotalInWords = toWords(grandTotalAmount);

    const currency = data && data.length > 0 ? data[0].currency : "";

    // Separate records into two groups: with and without vendors
    const recordsWithVendor = chargeData.filter(
      (item) => item.vendorName && item.vendorName.trim() !== "",
    );
    // const recordsWithoutVendor = chargeData.filter(
    //   (item) => !item.vendorName || item.vendorName.trim() === ""
    // );

    const recordsWithoutVendor = chargeData.filter(
      (item) =>
        (!item.vendorName || item.vendorName.trim() === "") &&
        !(
          item.sellRate == null ||
          item.sellRate === 0 ||
          item.sellRate === "0.00" ||
          item.sellRate === 0.0
        ),
    );

    // If no valid records exist for either category, show a message
    if (recordsWithVendor.length === 0 && recordsWithoutVendor.length === 0) {
      return (
        <div className="mt-4 flex flex-grow w-full justify-center">
          <p className="text-center text-lg font-semibold text-gray-600">
            No data available.
          </p>
        </div>
      );
    }

    let lastVendor = null;
    let totalAmount = 0.0;
    let totalTotalAmount = 0.0;
    const vendorRows = [];

    // Generate table rows for records with vendors
    recordsWithVendor.forEach((item, index) => {
      const isNewVendor = item.vendorName !== lastVendor;

      if (isNewVendor && lastVendor !== null) {
        // Insert Total Row before switching to new vendor
        vendorRows.push(
          <tr key={`total-${lastVendor}`} className="bg-gray-300 font-semibold">
            <td
              className="text-right border-black border-b border-r pt-2 pb-2 pe-2"
              colSpan="6"
            >
              Total ({currency})
            </td>
            <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
              {totalAmount.toFixed(2)}
            </td>
            <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
              {totalTotalAmount.toFixed(2)}
            </td>
            <td className="border-black border-b border-r pt-2 pb-2"></td>
          </tr>,
        );

        // Reset totals for the new vendor
        totalAmount = 0.0;
        totalTotalAmount = 0.0;
      }

      if (isNewVendor) {
        // Push vendor name row before adding new charges
        vendorRows.push(
          <tr key={`vendor-${item.vendorName}`} className="bg-gray-200">
            <td
              className="text-left font-semibold border-black border-b border-r pt-2 pb-2 ps-4"
              colSpan="9"
            >
              {item.vendorName}
            </td>
          </tr>,
        );

        lastVendor = item.vendorName;
      }

      // Accumulate totals
      totalAmount += parseFloat(item.sellAmountHc) || 0.0;
      totalTotalAmount += parseFloat(item.sellTotalAmount) || 0.0;

      vendorRows.push(
        <tr key={`charge-${index}`}>
          <td className="border-black border-b border-r pt-2 pb-3 ps-4">
            {item.chargeDescription || ""}
          </td>
          <td className="border-black border-b border-r pt-2 pb-3 ps-2">
            {item.sizeName} / {item.typeName} / {item.tankType}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.qty && item.qty !== ""
              ? parseFloat(item.qty).toFixed(2)
              : 0.0}
          </td>
          <td className="border-black border-b border-r pt-2 pb-3 ps-2">
            {item.sellCurrencyName || ""}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.sellExchangeRate || 0.0}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.sellRate || 0.0}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.sellAmountHc || 0.0}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.sellTotalAmount || 0.0}
          </td>
          <td className="border-black border-b border-r pt-2 pb-3 ps-2">
            {item.remarks || ""}
          </td>
        </tr>,
      );
    });

    // Final Total Row for the Last Vendor
    if (lastVendor) {
      vendorRows.push(
        <tr
          key={`final-total-${lastVendor}`}
          className="bg-gray-300 font-semibold"
        >
          <td
            className="text-right border-black border-b border-r pt-2 pb-2 pe-2"
            colSpan="6"
          >
            Total ({currency})
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
            {totalAmount.toFixed(2)}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
            {totalTotalAmount.toFixed(2)}
          </td>
          <td className="border-black border-b border-r pt-2 pb-2"></td>
        </tr>,
      );
    }

    // Total calculation for records without vendors
    let noVendorTotalAmount = 0.0;
    let noVendorTotalTotalAmount = 0.0;

    recordsWithoutVendor.forEach((item) => {
      noVendorTotalAmount += parseFloat(item.sellAmountHc) || 0.0;
      noVendorTotalTotalAmount += parseFloat(item.sellTotalAmount) || 0.0;
    });

    return (
      <div className="mt-1 flex flex-col w-full justify-center">
        {/* Table for records with vendors */}
        {recordsWithVendor.length > 0 && (
          <>
            <table
              className="mt-0.5 text-left text-xs w-full"
              style={{ border: "1px solid black" }}
            >
              <thead>
                <tr className="bg-gray-300">
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Charge Description
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Size/Type
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Qty
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Curr
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Ex. Rate
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Rate
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Total Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>{vendorRows}</tbody>
            </table>
          </>
        )}

        {/* Table for records without vendors */}
        {recordsWithoutVendor.length > 0 && (
          <>
            <table
              className="mt-2 text-left text-xs w-full"
              style={{ border: "1px solid black" }}
            >
              <thead>
                <tr className="bg-gray-300">
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Charge Description
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Size/Type
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Qty
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Curr
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Ex. Rate
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Rate
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Total Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {recordsWithoutVendor.map((item, index) => (
                  <tr key={`no-vendor-${index}`}>
                    <td className="border-black border-b border-r pt-2 pb-3 ps-4">
                      {item.chargeDescription}
                    </td>
                    <td className="border-black border-b border-r pt-2 pb-3 ps-4">
                      {item.sizeName} / {item.typeName} / {item.tankType}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.qty && item.qty !== ""
                        ? parseFloat(item.qty).toFixed(2)
                        : ""}
                    </td>
                    <td className="border-black text-center border-b border-r pt-2 pb-3 ps-2">
                      {item.sellCurrencyName}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.sellExchangeRate || 0.0}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.sellRate || 0.0}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.sellAmountHc || 0.0}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.sellTotalAmount || 0.0}
                    </td>
                    <td className="border-black border-b border-r pt-2 pb-3 ps-2">
                      {item.remarks || ""}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-300 font-semibold">
                  <td
                    className="text-right border-black border-b border-r pt-2 pb-2 pe-2"
                    colSpan="6"
                  >
                    Total ({currency})
                  </td>
                  <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
                    {noVendorTotalAmount.toFixed(2)}
                  </td>
                  <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
                    {noVendorTotalTotalAmount.toFixed(2)}
                  </td>
                  <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2"></td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Table for Grand Total */}
        <table className="mt-2 text-left text-xs w-full">
          <tr className="bg-gray-300 border border-black">
            <th className="text-left pt-2 pb-2 ps-4">
              Grand Total ({currency}){" "}
            </th>
            <th className="text-left pt-2 pb-2">{grandTotalAmount}</th>
          </tr>
          <tr className="bg-gray-300 border border-black">
            <th className="text-left pt-2 pb-2 ps-4">Amount in Words </th>
            <th className="text-left pt-2 pb-2 uppercase">
              {" "}
              {currency} {grandTotalInWords}
            </th>
          </tr>
        </table>
      </div>
    );
  };

  const QuotationExportChargeVendorWiseModuleWithTax = ({ data }) => {
    let chargeData =
      data && data.length > 0 ? data[0].tblRateRequestCharge : [];

    let grandTotalAmount = chargeData.reduce((acc, item) => {
      return acc + (parseFloat(item.sellAmountHc) || 0);
    }, 0);

    let grandTotalInWords = toWords(grandTotalAmount);

    const currency = data && data.length > 0 ? data[0].currency : "";

    // Separate records into two groups: with and without vendors
    const recordsWithVendor = chargeData.filter(
      (item) => item.vendorName && item.vendorName.trim() !== "",
    );
    const recordsWithoutVendor = chargeData.filter(
      (item) => !item.vendorName || item.vendorName.trim() === "",
    );

    // If no valid records exist for either category, show a message
    if (recordsWithVendor.length === 0 && recordsWithoutVendor.length === 0) {
      return (
        <div className="mt-4 flex flex-grow w-full justify-center">
          <p className="text-center text-lg font-semibold text-gray-600">
            No data available.
          </p>
        </div>
      );
    }

    let lastVendor = null;
    let totalAmount = 0.0;
    let taxAmount = 0.0;
    let totalTotalAmount = 0.0;
    const vendorRows = [];

    // Generate table rows for records with vendors
    recordsWithVendor.forEach((item, index) => {
      const isNewVendor = item.vendorName !== lastVendor;

      if (isNewVendor && lastVendor !== null) {
        // Insert Total Row before switching to new vendor
        vendorRows.push(
          <tr key={`total-${lastVendor}`} className="bg-gray-300 font-semibold">
            <td
              className="text-right border-black border-b border-r pt-2 pb-2 pe-2"
              colSpan="6"
            >
              Total ({currency})
            </td>
            <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
              {totalAmount.toFixed(2)}
            </td>
            <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
              {taxAmount.toFixed(2)}
            </td>
            <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
              {totalTotalAmount.toFixed(2)}
            </td>
            <td className="border-black border-b border-r pt-2 pb-2"></td>
          </tr>,
        );

        // Reset totals for the new vendor
        totalAmount = 0.0;
        taxAmount = 0.0;
        totalTotalAmount = 0.0;
      }

      if (isNewVendor) {
        // Push vendor name row before adding new charges
        vendorRows.push(
          <tr key={`vendor-${item.vendorName}`} className="bg-gray-200">
            <td
              className="text-left font-semibold border-black border-b border-r pt-2 pb-2 ps-4"
              colSpan="10"
            >
              {item.vendorName}
            </td>
          </tr>,
        );

        lastVendor = item.vendorName;
      }

      // Accumulate totals
      totalAmount += parseFloat(item.sellAmountHc) || 0.0;
      taxAmount += parseFloat(item.sellTaxAmount) || 0.0;
      totalTotalAmount += parseFloat(item.sellTotalAmount) || 0.0;

      vendorRows.push(
        <tr key={`charge-${index}`}>
          <td className="border-black border-b border-r pt-2 pb-3 ps-4">
            {item.chargeDescription || ""}
          </td>
          <td className="border-black border-b border-r pt-2 pb-3 ps-2">
            {item.sizeName} / {item.typeName} / {item.tankType}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.qty && item.qty !== ""
              ? parseFloat(item.qty).toFixed(2)
              : 0.0}
          </td>
          <td className="border-black border-b border-r pt-2 pb-3 ps-2">
            {item.sellCurrencyName || ""}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.sellExchangeRate || 0.0}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.sellRate || 0.0}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.sellAmountHc || 0.0}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.sellTaxAmount || 0.0}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
            {item.sellTotalAmount || 0.0}
          </td>
          <td className="border-black border-b border-r pt-2 pb-3 ps-2">
            {item.remarks || ""}
          </td>
        </tr>,
      );
    });

    // Final Total Row for the Last Vendor
    if (lastVendor) {
      vendorRows.push(
        <tr
          key={`final-total-${lastVendor}`}
          className="bg-gray-300 font-semibold"
        >
          <td
            className="text-right border-black border-b border-r pt-2 pb-2 pe-2"
            colSpan="6"
          >
            Total ({currency})
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
            {totalAmount.toFixed(2)}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
            {taxAmount.toFixed(2)}
          </td>
          <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
            {totalTotalAmount.toFixed(2)}
          </td>
          <td className="border-black border-b border-r pt-2 pb-2"></td>
        </tr>,
      );
    }

    // Total calculation for records without vendors
    let noVendorTotalAmount = 0.0;
    let noVendortaxAmount = 0.0;
    let noVendorTotalTotalAmount = 0.0;

    recordsWithoutVendor.forEach((item) => {
      noVendorTotalAmount += parseFloat(item.sellAmountHc) || 0.0;
      noVendortaxAmount += parseFloat(item.sellTaxAmount) || 0.0;
      noVendorTotalTotalAmount += parseFloat(item.sellTotalAmount) || 0.0;
    });

    return (
      <div className="mt-1 flex flex-col w-full justify-center">
        {/* Table for records with vendors */}
        {recordsWithVendor.length > 0 && (
          <>
            <table
              className="mt-0.5 text-left text-xs w-full"
              style={{ border: "1px solid black" }}
            >
              <thead>
                <tr className="bg-gray-300">
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Charge Description
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Size/Type
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Qty
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Curr
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Ex. Rate
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Rate
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Tax Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Total Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>{vendorRows}</tbody>
            </table>
          </>
        )}

        {/* Table for records without vendors */}
        {recordsWithoutVendor.length > 0 && (
          <>
            <table
              className="mt-2 text-left text-xs w-full"
              style={{ border: "1px solid black" }}
            >
              <thead>
                <tr className="bg-gray-300">
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Charge Description
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Size/Type
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Qty
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Curr
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Ex. Rate
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Rate
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Tax Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Total Amount
                  </th>
                  <th className="text-center border-black border-b border-r pt-2 pb-2">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {recordsWithoutVendor.map((item, index) => (
                  <tr key={`no-vendor-${index}`}>
                    <td className="border-black border-b border-r pt-2 pb-3 ps-4">
                      {item.chargeDescription}
                    </td>
                    <td className="border-black border-b border-r pt-2 pb-3 ps-4">
                      {item.sizeName} / {item.typeName}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.qty && item.qty !== ""
                        ? parseFloat(item.qty).toFixed(2)
                        : ""}
                    </td>
                    <td className="border-black border-b border-r pt-2 pb-3 ps-2">
                      {item.sellCurrency}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.sellExchangeRate || 0.0}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.sellRate || 0.0}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.sellAmountHc || 0.0}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.sellTaxAmount || 0.0}
                    </td>
                    <td className="text-right border-black border-b border-r pt-2 pb-3 pe-2">
                      {item.sellTotalAmount || 0.0}
                    </td>
                    <td className="border-black border-b border-r pt-2 pb-3 ps-2">
                      {item.remarks || ""}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-300 font-semibold">
                  <td
                    className="text-right border-black border-b border-r pt-2 pb-2 pe-2"
                    colSpan="6"
                  >
                    Total ({currency})
                  </td>
                  <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
                    {noVendorTotalAmount.toFixed(2)}
                  </td>
                  <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
                    {noVendortaxAmount.toFixed(2)}
                  </td>
                  <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2">
                    {noVendorTotalTotalAmount.toFixed(2)}
                  </td>
                  <td className="text-right border-black border-b border-r pt-2 pb-2 pe-2"></td>
                </tr>
              </tbody>
            </table>
          </>
        )}

        {/* Table for Grand Total */}
        <table className="mt-2 text-left text-xs w-full">
          <tr className="bg-gray-300 border border-black">
            <th className="text-left pt-2 pb-2 ps-4">
              Grand Total ({currency}){" "}
            </th>
            <th className="text-left pt-2 pb-2">{grandTotalAmount}</th>
          </tr>
          <tr className="bg-gray-300 border border-black">
            <th className="text-left pt-2 pb-2 ps-4">Amount in Words </th>
            <th className="text-left pt-2 pb-2 uppercase">
              {" "}
              {currency} {grandTotalInWords}
            </th>
          </tr>
        </table>
      </div>
    );
  };

  const QuotationExportWithTaxAndWithoutTax = ({ data }) => {
    const calculateTax = data[0]?.calculateTax; // Extracting calculateTax from the data

    return (
      <div>
        {calculateTax === true ? (
          <QuotationExportChargeVendorWiseModuleWithTax data={data} />
        ) : (
          <QuotationExportChargeVendorWiseModule data={data} />
        )}
      </div>
    );
  };

  const SarQuotationTermsAndCondition = () => {
    return (
      <>
        <div className="mt-2" style={{ fontSize: "9px" }}>
          <p className="underline font-semibold text-sm">
            General Terms and Condition :
          </p>
          <p className="text-sm">
            1.RATES ARE SUBJECT TO TERMS AGREED AT THE TIME OF QUOTATION (CY/CY
            / DOOR-DOOR /DOOR-CY).
          </p>
          <p className="text-sm">
            -SUBJECT TO SPACE AND TANK AVAILABILITY AT POL
          </p>
          <p className="text-sm">
            -SUBJECT TO TANK AVAILABILITY AND PRODUCT APPROVAL AND COMPATIBILITY
            AT POL
          </p>
          <p className="text-sm">
            2.EQUIPMENT: 20' ISO TANK CONTAINER, UN-TANK TYPE T11 (TP1),
            STANDARD 25000 LITRES -- 26000 LITRES CAPACITY OF TANK WITH BOTTOM
            DISCHARGE /
          </p>
          <p className="text-sm">STEAM TUBE COIL AVAILABLE.</p>
          <p className="font-semibold text-sm mt-2">
            Rates are exclusive of below local charges unless it is a Ex. Works
            or DAP shipment:-
          </p>
          <div style={{ display: "flex", width: "100%" }} className="mt-2">
            <div style={{ width: "3%" }}></div>
            <div style={{ width: "97%" }}>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  listStyleType: "disc",
                }}
              >
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Load port Terminal Handling Charges, ISPS, ENS, ACD, BL fee
                </li>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Any Special Tank preparaon / N2 Purging / Pickling & passivaon
                  / Pump / Hoses / Gaskets / Handrails / Special couplings /
                </li>
                <p>
                  IMO product name, Cargo labelling Special high security Seals
                  etc for loading & unloading on shipper / consignee account.
                </p>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Any Local charges at POL (Port storage, Rail ramp Li on -- Li
                  off, Import DO Fee, Export BL fees, Courier fee).
                </li>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Any customs documentaon/Costs / Customs Duty/ Inspecon / Taxes
                  / VAT / Overweight permits / drop & pull / heang prior
                </li>
                <p>
                  to delivery / Chassis Hire / Trailer detenon etc if any on
                  shipper / consignee / freight payer account.
                </p>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Any Repairs to the tank container due to damage caused whilst
                  in the Shipper / Consignee / Frt Forwarders custody
                </li>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Any Repairs to the tank container due to damage caused whilst
                  in the Shipper / Consignee / Frt Forwarders custody
                </li>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Replacement of any missing part of our equipment / damage tank
                  container, due to damage, loss, incurred whilst the tank In
                </li>
                <p>
                  shipper's and / or consignee's control. Indicave replacement
                  value is Usd25000/- per tank.
                </p>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Cargo compability to our equipment SS 316 is the shipper's
                  responsibility.
                </li>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Standard local cleaning charges included in freight as per
                  provided SDS for the cargo carried, however, aer discharge at
                </li>
                <p>
                  desnaon maximum permissible residue allowed is not more than
                  20 litres. If residue found is more, disposal cost will be
                </p>
                <p>applicable as per the Depot.</p>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  POL Transport.
                </li>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  Surveying Costs etc.
                </li>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  If any charges incurred at pod and consignee refuses to pay
                  the addional charges, the shipper / freight payer agrees to
                  settle
                </li>
                <p>all the charges with the agreed payment term.</p>
                <li
                  style={{ fontSize: "12px", fontFamily: "Arial, sans-serif" }}
                >
                  By placing export Delivery order / transport order based on
                  this offer, you confirm that you have read, understood and
                </li>
                <p>
                  accepted, acknowledge the complete content including all terms
                  & condions on this Quote
                </p>
              </ul>
            </div>
          </div>
          <p className="font-semibold text-sm mt-2">
            I thank you for the opportunity of subming this quotaon and look
            forward to your response. If I can be of any further assistance,
            please do not
          </p>
          <p className="font-semibold text-sm">hesitate to contact me.</p>
          <p className="font-bold text-sm">Kind Regards,</p>
          <p className="text-sm">{userName}</p>
          <p className="text-sm">{data[0]?.companyName}</p>
        </div>
      </>
    );
  };

  const CostSheetAirQuotationModule = ({ data }) => {
    let rateRequestDate;
    const formatDate = (date) => {
      if (!date) return ""; // Return empty string if date is null or undefined

      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, "0"); // Get the day and pad with zero if needed

      // Create an array of month abbreviations
      const monthAbbreviations = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ];
      const month = monthAbbreviations[d.getMonth()]; // Get the month abbreviation

      const year = d.getFullYear(); // Get the full year
      return `${day}/${month}/${year}`; // Return the formatted date
    };

    if (data && data.length > 0 && data[0].rateRequestDate) {
      rateRequestDate = formatDate(data[0].rateRequestDate);
    } else {
      rateRequestDate = "";
    }
    let cargoWt =
      data && data.length > 0 && data[0].cargoWt !== "" ? data[0].cargoWt : "";
    let cargoWtUnitCode =
      data && data.length > 0 && data[0].cargoWtUnitCode !== ""
        ? data[0].cargoWtUnitCode
        : "";
    return (
      <div>
        <div className="flex flex-col md:flex-row flex-wrap border border-black">
          <div className="w-full md:w-1/2 px-2 border-b md:border-b-0 md:border-r border-black pb-3">
            <table className="mt-1 text-left text-xs w-full table-auto">
              <tbody>
                <tr>
                  <th className="text-left w-1/5">Quotation No :</th>
                  <td>
                    {data && data.length > 0 && data[0].rateRequestNo !== ""
                      ? data[0].rateRequestNo
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/5">Dated :</th>
                  <td>{rateRequestDate}</td>
                </tr>
                <tr>
                  <th className="text-left w-1/4">Customer:</th>
                  <td>
                    {data && data.length > 0 && data[0].customerName !== ""
                      ? data[0].customerName
                      : ""}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-full md:w-1/3 px-2 pb-3">
            <table className="mt-1 text-left text-xs w-full table-auto">
              <tbody>
                <tr>
                  <th className="text-left w-1/4">Origin Airport :</th>
                  <td>
                    {data && data.length > 0 && data[0].polName !== ""
                      ? data[0].polName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/3">Dest Airport:</th>
                  <td>
                    {data && data.length > 0 && data[0].fpdName !== ""
                      ? data[0].fpdName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th className="text-left w-1/4">Gr.wt (KGS):</th>
                  <td>
                    {cargoWt} {cargoWtUnitCode}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-xs w-full border border-black">
          <div className="p-2 pb-3">
            <strong>
              Remarks:{" "}
              {data && data.length > 0 && data[0].remarks !== ""
                ? data[0].remarks
                : ""}{" "}
            </strong>
          </div>
        </div>
      </div>
    );
  };

  const CostSheetAirQuotationRateBasisModule = ({ data }) => {
    // Filter the charges where rateBasisName does not include 'weight'
    const tblRateRequestCharge =
      data[0]?.tblRateRequestCharge?.filter(
        (charge) => !charge?.rateBasis?.toLowerCase().includes("weight"),
      ) || [];
    if (tblRateRequestCharge.length === 0) {
      return;
    }
    // Calculate the total amount
    const totalAmount = tblRateRequestCharge.reduce(
      (acc, item) => acc + item.sellAmount,
      0,
    );

    const thStyle = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      backgroundColor: "#E0E0E0",
      border: "1px solid #000000",
    };
    const tdStyle = {
      textAlign: "left",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
    };
    const tdStyleCenter = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
    };
    const tdStyleRight = {
      textAlign: "right",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
    };

    return (
      <div className="text-xs w-full border-0 border-black mt-3">
        <div className=" p-2 text-center">
          <strong>Fixed charges</strong>
        </div>

        <div className="flex flex-wrap mt-2">
          <table
            className="table-auto text-xs"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead className="bg-gray-300">
              <tr>
                <th style={thStyle}>Sr. No.</th>
                <th style={thStyle}>Charge Description</th>
                <th style={thStyle}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {tblRateRequestCharge.map((item, index) => (
                <tr key={index}>
                  <td style={tdStyleCenter}>{index + 1}</td>
                  <td style={tdStyle}>{item.chargeDescription}</td>
                  <td style={tdStyleRight}>
                    {(item.sellAmount || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr>
                <td
                  colSpan="2"
                  style={{ ...tdStyle, fontWeight: "bold" }}
                  className="ps-6"
                >
                  Total
                </td>
                <td style={{ ...tdStyleRight, fontWeight: "bold" }}>
                  {totalAmount.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const CostQuotationExportSizeTypeModuleAir = ({ data }) => {
    const rateRequestQty =
      data && data.length > 0 ? data[0].tblRateRequestQty : [];
    return (
      <div className="mt-1 flex flex-grow w-full justify-center">
        <table
          className="mt-0.5 text-left text-xs w-full"
          style={{ border: "1px solid black" }}
        >
          <thead>
            <tr className="bg-gray-300">
              <th className="text-center border-black border-b border-r pb-2">
                No Of Packages
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Gross Weight
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                L x W x H
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Volume
              </th>
              <th className="text-center border-black border-b border-r pt-2 pb-2">
                Volumetric Weight
              </th>
            </tr>
          </thead>
          <tbody>
            {rateRequestQty.map((item, index) => (
              <tr key={`item-${index}`}>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {`${item.noOfPackages !== "" ? item.noOfPackages : ""} `}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {item.qty && item.qty !== ""
                    ? parseFloat(item.qty).toFixed(2)
                    : ""}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {
                    [item.length, item.width, item.height]
                      .filter((val) => val != null && val !== "") // remove null, undefined, and empty strings :contentReference[oaicite:1]{index=1}
                      .join(" X ") + // join with separator :contentReference[oaicite:2]{index=2}
                      (item.dimensionUnit ? ` ${item.dimensionUnit}` : "") // append unit if present
                  }
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {item.volume || ""}
                </td>
                <td className="text-center border-black border-b border-r pt-2 pb-3">
                  {item.volumeUnit || ""}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot></tfoot>
        </table>
      </div>
    );
  };
  // const CostSheetAirQuotationGrid = ({ data }) => {
  //   // Filter rate requests containing 'weight'
  //   const filteredRateRequestCharge =
  //     data[0]?.tblRateRequestCharge?.filter((charge) =>
  //       charge?.rateBasis?.toLowerCase().includes("weight")
  //     ) || [];

  //   if (filteredRateRequestCharge.length === 0) {
  //     return null;
  //   }

  //   // Group charges by chargeName and vendorName, summing the buyRates
  //   const groupedCharges = filteredRateRequestCharge.reduce((acc, charge) => {
  //     const key = `${charge.chargeName}-${charge.vendorName}`;
  //     if (!acc[key]) {
  //       acc[key] = { ...charge, buyRate: 0 };
  //     }
  //     acc[key].buyRate += charge.buyRate;
  //     return acc;
  //   }, {});

  //   // Get a list of unique vendor names
  //   const vendorNames = [
  //     ...new Set(filteredRateRequestCharge.map((charge) => charge?.vendorName)),
  //   ];

  //   // Initialize totals for each vendor
  //   const totals = vendorNames.reduce((acc, vendorName) => {
  //     acc[vendorName] = 0;
  //     return acc;
  //   }, {});

  //   // Initialize row totals array
  //   const rowTotals = [];

  //   const thStyle = {
  //     textAlign: "center",
  //     padding: "10px",
  //     verticalAlign: "top",
  //     backgroundColor: "#E0E0E0",
  //     border: "1px solid #000000",
  //   };
  //   const thStyleTotal = {
  //     textAlign: "center",
  //     padding: "10px",
  //     backgroundColor: "#E0E0E0",
  //     border: "1px solid #000000",
  //   };
  //   const tdStyle = {
  //     textAlign: "center",
  //     padding: "10px",
  //     verticalAlign: "top",
  //     border: "1px solid #000000",
  //   };
  //   const tdStyleRight = {
  //     textAlign: "right",
  //     padding: "10px",
  //     verticalAlign: "top",
  //     border: "1px solid #000000",
  //   };

  //   // Create a list of charges by unique charge names
  //   const uniqueChargeNames = [
  //     ...new Set(filteredRateRequestCharge.map((charge) => charge.chargeName)),
  //   ];

  //   return (
  //     <div className="dynamic_table pt-2" style={{ width: "100%" }}>
  //       {/* Outer div to control horizontal scrolling */}
  //       <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
  //         {/* Table with 100% width and minimum width to ensure it stretches if there are many columns */}
  //         <table
  //           className="text-xs"
  //           style={{
  //             width: "100%",
  //             borderCollapse: "collapse",
  //             minWidth: "1200px",
  //             border: "1px solid black",
  //           }}
  //         >
  //           {vendorNames.length > 0 && (
  //             <thead style={{ backgroundColor: "#d1d5db" }}>
  //               <tr>
  //                 <th style={thStyle}>CHARGES</th>
  //                 {vendorNames.map((vendorName, index) => (
  //                   <th key={index} style={thStyle}>
  //                     {vendorName}
  //                   </th>
  //                 ))}
  //                 <th style={thStyleTotal}>Total</th>
  //               </tr>
  //             </thead>
  //           )}
  //           <tbody>
  //             {uniqueChargeNames.map((chargeName, index) => {
  //               let rowTotal = 0;

  //               return (
  //                 <tr key={index}>
  //                   <td style={tdStyle}>{chargeName}</td>

  //                   {vendorNames.map((vendorName, vendorIndex) => {
  //                     const chargeKey = `${chargeName}-${vendorName}`;
  //                     const buyRate = groupedCharges[chargeKey]?.buyRate || 0;

  //                     // Add buyRate to the respective vendor's total
  //                     totals[vendorName] += buyRate;
  //                     // Add buyRate to the row total
  //                     rowTotal += buyRate;

  //                     return (
  //                       <td key={vendorIndex} style={tdStyleRight}>
  //                         {buyRate.toFixed(2)}
  //                       </td>
  //                     );
  //                   })}

  //                   {/* Add row-wise total */}
  //                   <td style={tdStyleRight}>{rowTotal.toFixed(2)}</td>

  //                   {rowTotals.push(rowTotal)}
  //                 </tr>
  //               );
  //             })}

  //             {/* Add the total row */}
  //             <tr>
  //               <td style={tdStyle}>
  //                 <strong>Total</strong>
  //               </td>
  //               {vendorNames.map((vendorName, index) => (
  //                 <td key={index} style={tdStyleRight}>
  //                   <strong>{totals[vendorName].toFixed(2)}</strong>
  //                 </td>
  //               ))}
  //               <td style={tdStyleRight}>
  //                 <strong>
  //                   {rowTotals
  //                     .reduce((sum, rowTotal) => sum + rowTotal, 0)
  //                     .toFixed(2)}
  //                 </strong>
  //               </td>
  //             </tr>
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>
  //   );
  // };

  const CostSheetAirQuotationGrid = ({ data }) => {
    // Filter rate requests containing 'weight'
    const filteredRateRequestCharge =
      data[0]?.tblRateRequestCharge?.filter((charge) =>
        charge?.rateBasis?.toLowerCase().includes("weight"),
      ) || [];

    if (filteredRateRequestCharge.length === 0) {
      return null;
    }

    // Group charges by chargeName, vendorName and vendorAgentName, summing the buyRates
    const groupedCharges = filteredRateRequestCharge.reduce((acc, charge) => {
      const key = `${charge.chargeName}-${charge.vendorName}-${charge.vendorAgentName}`;
      if (!acc[key]) {
        acc[key] = { ...charge, buyRate: 0 };
      }
      acc[key].buyRate += charge.buyRate;
      return acc;
    }, {});

    // Get a list of unique vendor/vendor-agent combinations, treating null/undefined as empty string
    const vendorPairs = [
      ...new Set(
        filteredRateRequestCharge.map(
          (charge) =>
            `${charge.vendorName || ""}||${charge.vendorAgentName || ""}`,
        ),
      ),
    ].map((pair) => {
      const [vendorName, vendorAgentName] = pair.split("||");
      return {
        vendorName,
        vendorAgentName,
        key: `${vendorName}-${vendorAgentName}`,
      };
    });

    // Initialize totals for each vendor pair
    const totals = vendorPairs.reduce((acc, { key }) => {
      acc[key] = 0;
      return acc;
    }, {});

    // Array to hold each row's total
    const rowTotals = [];

    // Styles
    const thStyle = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      backgroundColor: "#E0E0E0",
      border: "1px solid #000",
    };
    const thStyleTotal = {
      ...thStyle,
      backgroundColor: "#D1D5DB",
    };
    const tdStyle = {
      textAlign: "center",
      padding: "10px",
      border: "1px solid #000",
    };
    const tdStyleRight = {
      ...tdStyle,
      textAlign: "right",
    };

    // Unique charge names
    const uniqueChargeNames = [
      ...new Set(filteredRateRequestCharge.map((charge) => charge.chargeName)),
    ];

    return (
      <div className="dynamic_table pt-2" style={{ width: "100%" }}>
        <div style={{ overflowX: "auto", whiteSpace: "nowrap" }}>
          <table
            className="text-xs"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "1200px",
              border: "1px solid black",
            }}
          >
            {vendorPairs.length > 0 && (
              <thead>
                <tr>
                  <th style={thStyle}>CHARGES</th>
                  {vendorPairs.map(({ vendorName, vendorAgentName, key }) => (
                    <th key={key} style={thStyle}>
                      {vendorAgentName && vendorName ? (
                        <>
                          <div>{vendorAgentName}</div>
                          <span>/</span>
                          <div>{vendorName}</div>
                        </>
                      ) : (
                        <div>{vendorAgentName || vendorName}</div>
                      )}
                    </th>
                  ))}
                  <th style={thStyleTotal}>Total</th>
                </tr>
              </thead>
            )}
            <tbody>
              {uniqueChargeNames.map((chargeName, rowIdx) => {
                let rowTotal = 0;

                // build each vendor-cell for this row
                const cells = vendorPairs.map(({ key }) => {
                  const buyRate =
                    groupedCharges[`${chargeName}-${key}`]?.buyRate || 0;
                  totals[key] += buyRate;
                  rowTotal += buyRate;
                  return (
                    <td key={key} style={tdStyleRight}>
                      {buyRate.toFixed(2)}
                    </td>
                  );
                });

                // record this row's total
                rowTotals.push(rowTotal);

                return (
                  <tr key={rowIdx}>
                    <td style={tdStyle}>{chargeName}</td>
                    {cells}
                    <td style={tdStyleRight}>{rowTotal.toFixed(2)}</td>
                  </tr>
                );
              })}

              {/* aggregate total row */}
              <tr>
                <td style={tdStyle}>
                  <strong>Total</strong>
                </td>
                {vendorPairs.map(({ key }) => (
                  <td key={key} style={tdStyleRight}>
                    <strong>{totals[key].toFixed(2)}</strong>
                  </td>
                ))}
                <td style={tdStyleRight}>
                  <strong>
                    {rowTotals.reduce((sum, rt) => sum + rt, 0).toFixed(2)}
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CostSheetTransportInstructionsAirModule = ({ data }) => {
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    if (!Array.isArray(data) || data.length === 0) {
      console.error("data is not an array or is empty");
      return <div>.</div>;
    }

    // Check if any quotationFlag is true
    const hasQuotationFlagTrue = data.some((item) =>
      item.tblRateRequestCharge.some((charge) => charge.quotationFlag === true),
    );

    // If no quotationFlag is true, return an empty div
    if (!hasQuotationFlagTrue) {
      return <div>.</div>;
    }

    // Check if 'OCEAN FREIGHT' is present in the data
    const hasOceanFreight = data.some((item) =>
      item.tblRateRequestCharge.some(
        (charge) =>
          charge.quotationFlag === true &&
          charge.chargeName?.toLowerCase().includes("freight"),
      ),
    );

    if (!hasOceanFreight) {
      // const groupedCharges = rateRequestCharge.reduce((acc, charge) => {
      //     const group = charge.chargeGroupName || 'N/A';
      //     if (!acc[group]) {
      //         acc[group] = [];
      //     }
      //     acc[group].push(charge);
      //     return acc;
      // }, {});

      const groupedCharges = rateRequestCharge.reduce((acc, charge) => {
        // Check if chargeName includes 'FREIGHT' and skip it if true
        if (
          charge.chargeName &&
          charge.chargeName?.toLowerCase().includes("freight")
        ) {
          return acc; // Skip this charge
        }

        const group = charge.chargeGroupName || "";
        if (!acc[group]) {
          acc[group] = [];
        }
        acc[group].push(charge);

        return acc;
      }, {});

      // Calculate subtotal for each charge group
      const subtotals = Object.keys(groupedCharges).map((groupName) => {
        const groupCharges = groupedCharges[groupName];
        return {
          groupName,
          buyRateInrSubtotal: groupCharges.reduce(
            (acc, charge) => acc + (charge.buyAmountHc || 0),
            0,
          ),
          buyRateUsdSubtotal: groupCharges.reduce(
            (acc, charge) => acc + (charge.buyAmount || 0),
            0,
          ),
          sellRateInrSubtotal: groupCharges.reduce(
            (acc, charge) => acc + (charge.sellAmountHc || 0),
            0,
          ),
          sellRateUsdSubtotal: groupCharges.reduce(
            (acc, charge) => acc + (charge.sellAmount || 0),
            0,
          ),
        };
      });

      // Calculate overall total
      const total = subtotals.reduce(
        (acc, subtotal) => {
          acc.buyRateInrTotal += subtotal.buyRateInrSubtotal;
          acc.buyRateUsdTotal += subtotal.buyRateUsdSubtotal;
          acc.sellRateInrTotal += subtotal.sellRateInrSubtotal;
          acc.sellRateUsdTotal += subtotal.sellRateUsdSubtotal;
          return acc;
        },
        {
          buyRateInrTotal: 0,
          buyRateUsdTotal: 0,
          sellRateInrTotal: 0,
          sellRateUsdTotal: 0,
        },
      );
      return (
        <div className="dynamic_table mt-2" style={{ width: "100%" }}>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid black",
                fontSize: "10px",
              }}
            >
              <thead
                style={{
                  backgroundColor: "#E0E0E0",
                  border: "1px solid black",
                }}
              >
                <tr style={{ border: "1px solid black" }}>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    CHARGE GROUP
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    CHARGES
                  </th>
                  {/* <th style={{ padding: "5px", border: "1px solid black" }}>
                    SIZE/TYPE
                  </th> */}
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    BUY RATE INR
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    BUY RATE USD
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    SELL RATE INR
                  </th>
                  <th style={{ padding: "5px", border: "1px solid black" }}>
                    SELL RATE USD
                  </th>
                </tr>
              </thead>
              <tbody>
                {subtotals.map((subtotal, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    {groupedCharges[subtotal.groupName].map(
                      (charge, rowIndex) => (
                        <tr
                          key={rowIndex}
                          style={{ border: "1px solid black" }}
                        >
                          {rowIndex === 0 && (
                            <td
                              style={{
                                padding: "5px",
                                border: "1px solid black",
                              }}
                              rowSpan={
                                groupedCharges[subtotal.groupName].length
                              }
                            >
                              {charge.chargeGroupName || ""}
                            </td>
                          )}
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                            }}
                          >
                            {charge.chargeName || ""}
                          </td>

                          {/* <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "center",
                            }}
                          >
                            {charge.sizeName || " "} / {charge.typeName || " "}
                          </td> */}
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "right",
                            }}
                          >
                            {(charge.buyAmountHc || 0).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "right",
                            }}
                          >
                            {(charge.buyAmount || 0).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "right",
                            }}
                          >
                            {(charge.sellAmountHc || 0).toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "5px",
                              border: "1px solid black",
                              textAlign: "right",
                            }}
                          >
                            {(charge.sellAmount || 0).toFixed(2)}
                          </td>
                        </tr>
                      ),
                    )}
                    {/* Subtotal Row */}
                    <tr
                      style={{
                        border: "1px solid black",
                        fontWeight: "bold",
                        backgroundColor: "#e5e7eb",
                      }}
                    >
                      <td
                        style={{ padding: "5px", border: "1px solid black" }}
                        colSpan="2"
                      >
                        {subtotal.groupName} Sub Total
                      </td>
                      <td
                        style={{
                          padding: "5px",
                          border: "1px solid black",
                          textAlign: "right",
                        }}
                      >
                        {subtotal.buyRateInrSubtotal.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "5px",
                          border: "1px solid black",
                          textAlign: "right",
                        }}
                      >
                        {subtotal.buyRateUsdSubtotal.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "5px",
                          border: "1px solid black",
                          textAlign: "right",
                        }}
                      >
                        {subtotal.sellRateInrSubtotal.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: "5px",
                          border: "1px solid black",
                          textAlign: "right",
                        }}
                      >
                        {subtotal.sellRateUsdSubtotal.toFixed(2)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
                {/* Total Row */}
                <tr
                  style={{
                    border: "1px solid black",
                    fontWeight: "bold",
                    backgroundColor: "#d1d5db",
                  }}
                >
                  <td
                    style={{ padding: "5px", border: "1px solid black" }}
                    colSpan="2"
                  >
                    Grand Total
                  </td>
                  <td
                    style={{
                      padding: "5px",
                      border: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    {total.buyRateInrTotal.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "5px",
                      border: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    {total.buyRateUsdTotal.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "5px",
                      border: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    {total.sellRateInrTotal.toFixed(2)}
                  </td>
                  <td
                    style={{
                      padding: "5px",
                      border: "1px solid black",
                      textAlign: "right",
                    }}
                  >
                    {total.sellRateUsdTotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Filtering charges where quotationFlag is true
    const allCharges = useMemo(
      () =>
        data
          .flatMap((item) => item.tblRateRequestCharge)
          .filter((charge) => charge.quotationFlag === true),
      [data],
    );

    // Handling Sea Freight with distinct logic
    const oceanFreightCharges = useMemo(
      () =>
        allCharges
          .filter((charge) =>
            charge.chargeGroupName.toLowerCase().includes("freight"),
          )
          .reduce((acc, charge) => {
            const key = `${charge.chargeName}-${charge.sizeName}-${charge.typeName}`;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(charge);
            return acc;
          }, {}),
      [allCharges],
    );

    // Handling other charges without distinct logic
    const otherCharges = useMemo(
      () =>
        allCharges
          .filter(
            (charge) =>
              !charge.chargeGroupName.toLowerCase().includes("freight"),
          )
          .reduce((acc, charge) => {
            acc.push(charge);
            return acc;
          }, []),
      [allCharges],
    );

    const combinedCharges = useMemo(
      () => [...Object.values(oceanFreightCharges).flat(), ...otherCharges],
      [oceanFreightCharges, otherCharges],
    );

    // Get unique vendors specific to OCEAN FREIGHT charges
    // const oceanFreightVendors = useMemo(() => {
    //   return [
    //     ...new Set(
    //       Object.values(oceanFreightCharges)
    //         .flat()
    //         .filter((charge) =>
    //           charge.chargeName?.toLowerCase().includes("freight")
    //         )
    //         .map((charge) => charge.vendorName)
    //     ),
    //   ].sort();
    // }, [oceanFreightCharges]);

    // console.log("oceanFreightVendors", oceanFreightVendors);

    const oceanFreightVendors = useMemo(() => {
      // flatten & filter
      const freightCharges = Object.values(oceanFreightCharges)
        .flat()
        .filter((c) => c.chargeName?.toLowerCase().includes("freight"));

      const seen = new Set();
      const uniquePairs = [];

      for (const { vendorName, vendorAgentName } of freightCharges) {
        const key =
          vendorAgentName && vendorName
            ? `${vendorAgentName} / \n${vendorName}`
            : vendorAgentName || vendorName;

        if (!seen.has(key)) {
          seen.add(key);
          uniquePairs.push({ vendorName, vendorAgentName, key });
        }
      }

      return uniquePairs.sort(
        (a, b) =>
          (a.vendorAgentName || "").localeCompare(b.vendorAgentName || "") ||
          a.vendorName.localeCompare(b.vendorName),
      );
    }, [oceanFreightCharges]);

    console.log("oceanFreightVendors", oceanFreightVendors);

    // Initialize grand totals for all vendors
    const grandTotals = useMemo(() => {
      return oceanFreightVendors.reduce((totals, vendor) => {
        totals[vendor] = {
          buyRateInr: 0,
          buyRateUsd: 0,
          sellRateInr: 0,
          sellRateUsd: 0,
        };
        return totals;
      }, {});
    }, [oceanFreightVendors]);

    const groupedCharges = useMemo(() => {
      return combinedCharges.reduce((acc, charge) => {
        const key = charge.chargeGroupName.toLowerCase().includes("freight")
          ? `${charge.chargeGroupName}-${charge.chargeName}-${charge.sizeName}-${charge.typeName}`
          : `${charge.chargeGroupName}-${charge.chargeName}-${charge.vendorName}-${charge.sizeName}-${charge.typeName}`;

        if (!acc[key]) {
          acc[key] = {
            chargeGroupName: charge.chargeGroupName,
            chargeName: charge.chargeName,
            sizeName: charge.sizeName,
            typeName: charge.typeName,
            vendors: {},
          };
        }

        // Handle the logic where rates should be consistent across all vendors for other charge groups
        if (!charge.chargeGroupName.toLowerCase().includes("freight")) {
          oceanFreightVendors.forEach((vendor) => {
            acc[key].vendors[vendor] = {
              buyRateInr: charge.buyAmountHc ?? 0,
              buyRateUsd: charge.buyAmount ?? 0,
              sellRateInr: charge.sellAmountHc ?? 0,
              sellRateUsd: charge.sellAmount ?? 0,
            };
          });
        } else {
          acc[key].vendors[charge.vendorName] = {
            buyRateInr: charge.buyAmountHc ?? 0,
            buyRateUsd: charge.buyAmount ?? 0,
            sellRateInr: charge.sellAmountHc ?? 0,
            sellRateUsd: charge.sellAmount ?? 0,
          };
        }
        return acc;
      }, {});
    }, [combinedCharges]);

    const rows = useMemo(() => {
      const rowAccumulator = [];
      let subTotals = oceanFreightVendors.reduce((acc, vendor) => {
        acc[vendor] = {
          buyRateInr: 0,
          buyRateUsd: 0,
          sellRateInr: 0,
          sellRateUsd: 0,
        };
        return acc;
      }, {});

      // Count how many rows each charge group will span
      const chargeGroupRowSpans = {};
      const chargeGroups = Object.values(groupedCharges);

      // Calculate the row span value based on the number of charge groups
      const totalChargeGroups = chargeGroups.length;

      for (let i = 0; i < totalChargeGroups; i++) {
        const chargeGroup = chargeGroups[i];

        // Initialize the row span for the current charge group if not already set
        if (!chargeGroupRowSpans[chargeGroup.chargeGroupName]) {
          chargeGroupRowSpans[chargeGroup.chargeGroupName] = 0;
        }

        // Increment the row span for the current charge group
        chargeGroupRowSpans[chargeGroup.chargeGroupName]++;
      }

      // Set all row spans to the maximum found value
      const maxRowSpan = Math.max(...Object.values(chargeGroupRowSpans));
      for (const key in chargeGroupRowSpans) {
        chargeGroupRowSpans[key] = maxRowSpan;
      }

      let currentChargeGroup = null;
      let currentRowSpan = 0;

      const groupNames = Object.keys(chargeGroupRowSpans);
      const lastGroupName = groupNames[groupNames.length - 1];

      Object.entries(groupedCharges).forEach(([key, chargeGroup], index) => {
        const { chargeGroupName, chargeName, sizeName, typeName, vendors } =
          chargeGroup;
        const showChargeGroup = currentChargeGroup !== chargeGroupName;
        if (showChargeGroup) {
          // mark that we've switched into a new group
          currentChargeGroup = chargeGroupName;

          // base span from your existing map (default 0 if missing)
          const baseSpan = chargeGroupRowSpans[chargeGroupName] || 0;

          // if this is the very last group, add one
          currentRowSpan =
            chargeGroupName === lastGroupName ? baseSpan + 1 : baseSpan;
        }

        const chargeRow = (
          <tr
            className="border-collapse border border-black p-2 text-xs"
            key={key}
          >
            {showChargeGroup ? (
              <td
                className="border-collapse border border-black p-2 text-xs"
                rowSpan={currentRowSpan}
              >
                {chargeGroupName}
              </td>
            ) : null}
            <td className="border-collapse border border-black p-2 text-xs">
              {chargeName}
            </td>
            {oceanFreightVendors.map((vendor, colIndex) => {
              const vendorRates = vendors[vendor] || {
                buyRateInr: 0,
                buyRateUsd: 0,
                sellRateInr: 0,
                sellRateUsd: 0,
              };
              subTotals[vendor].buyRateInr += vendorRates.buyRateInr;
              subTotals[vendor].buyRateUsd += vendorRates.buyRateUsd;
              subTotals[vendor].sellRateInr += vendorRates.sellRateInr;
              subTotals[vendor].sellRateUsd += vendorRates.sellRateUsd;

              grandTotals[vendor].buyRateInr += vendorRates.buyRateInr;
              grandTotals[vendor].buyRateUsd += vendorRates.buyRateUsd;
              grandTotals[vendor].sellRateInr += vendorRates.sellRateInr;
              grandTotals[vendor].sellRateUsd += vendorRates.sellRateUsd;

              return (
                <React.Fragment key={colIndex}>
                  <td className="border-collapse border border-black text-right text-xs">
                    <div className="p-2">
                      {vendorRates.buyRateUsd.toFixed(2)}
                    </div>
                    <hr className="border-collapse border-1 border-black" />
                    <div className="p-2">
                      {vendorRates.buyRateInr.toFixed(2)}
                    </div>
                  </td>
                  <td className="border-collapse border border-black text-right text-xs">
                    <div className="p-2">
                      {vendorRates.sellRateUsd.toFixed(2)}
                    </div>
                    <hr className="border-collapse border-1 border-black" />
                    <div className="p-2">
                      {vendorRates.sellRateInr.toFixed(2)}
                    </div>
                  </td>
                </React.Fragment>
              );
            })}
          </tr>
        );

        rowAccumulator.push(chargeRow);

        // Check if next item belongs to a different charge group
        if (
          index === Object.entries(groupedCharges).length - 1 || // If it's the last item
          Object.entries(groupedCharges)[index + 1][1].chargeGroupName !==
            chargeGroupName // or the next item has a different charge group
        ) {
          const subTotalRow = (
            <tr
              className="border-collapse border border-black p-2 font-bold bg-gray-200"
              key={`subtotal-${chargeGroupName}`}
            >
              <td
                className="border-collapse border border-black p-2"
                colSpan={1}
              >
                {chargeGroupName} Sub Total
              </td>
              {oceanFreightVendors.map((vendor, index) => (
                <React.Fragment key={index}>
                  <td className="border-collapse border border-black text-right text-xs">
                    <div className="p-2">
                      {subTotals[vendor].buyRateUsd.toFixed(2)}
                    </div>
                    <hr className="border-collapse border-1 border-black" />
                    <div className="p-2">
                      {subTotals[vendor].buyRateInr.toFixed(2)}
                    </div>
                  </td>

                  <td className="border-collapse border border-black text-right text-xs">
                    <div className="p-2">
                      {subTotals[vendor].sellRateUsd.toFixed(2)}
                    </div>
                    <hr className="border-collapse border-1 border-black" />
                    <div className="p-2">
                      {subTotals[vendor].sellRateInr.toFixed(2)}
                    </div>
                  </td>
                </React.Fragment>
              ))}
            </tr>
          );
          rowAccumulator.push(subTotalRow);

          // Reset subTotals for the next charge group
          subTotals = oceanFreightVendors.reduce((acc, vendor) => {
            acc[vendor] = {
              buyRateInr: 0,
              buyRateUsd: 0,
              sellRateInr: 0,
              sellRateUsd: 0,
            };
            return acc;
          }, {});
        }
      });

      // Add grand total row
      const grandTotalRow = (
        <tr
          className="border-collapse border border-black p-2 font-bold bg-gray-300"
          key="grand-total"
        >
          <td className="border-collapse border border-black p-2" colSpan={2}>
            GRAND TOTAL
          </td>
          {oceanFreightVendors.map((vendor, index) => (
            <React.Fragment key={index}>
              <td className="border-collapse border border-black text-right text-xs">
                <div className="p-2">
                  {grandTotals[vendor].buyRateUsd.toFixed(2)}
                </div>
                <hr className="border-collapse border-1 border-black" />
                <div className="p-2">
                  {grandTotals[vendor].buyRateInr.toFixed(2)}
                </div>
              </td>

              <td className="border-collapse border border-black text-right text-xs">
                <div className="p-2">
                  {grandTotals[vendor].sellRateUsd.toFixed(2)}
                </div>
                <hr className="border-collapse border-1 border-black" />
                <div className="p-2">
                  {grandTotals[vendor].sellRateInr.toFixed(2)}
                </div>
              </td>
            </React.Fragment>
          ))}
        </tr>
      );

      rowAccumulator.push(grandTotalRow);

      return rowAccumulator;
    }, [groupedCharges, oceanFreightVendors, grandTotals]);

    return (
      <div className="dynamic_table">
        <div className="overflow-x-auto mt-2">
          <div className="w-full">
            <div className="overflow-x-scroll">
              <table className="min-w-full table-auto border-collapse border border-black p-2 text-xs">
                <thead className="border-collapse border border-black p-2">
                  <tr className="border-collapse border border-black p-2 bg-gray-300">
                    <th
                      className="border-collapse border border-black p-2"
                      rowSpan={2}
                    >
                      CHARGE GROUP
                    </th>
                    <th
                      className="border-collapse border border-black p-2 w-40"
                      rowSpan={2}
                    >
                      CHARGES
                    </th>
                    {oceanFreightVendors.map((vendor, index) => (
                      <th
                        className="border-collapse border border-black p-2"
                        colSpan={2}
                        key={index}
                      >
                        {vendor?.key}
                      </th>
                    ))}
                  </tr>
                  <tr className="border-collapse border border-black p-2 bg-gray-300">
                    {oceanFreightVendors.map((vendor, index) => (
                      <React.Fragment key={index}>
                        <th className="border-collapse border border-black p-2">
                          Buy Rate <br />
                          USD / INR
                        </th>
                        <th className="border-collapse border border-black p-2">
                          Sell Rate <br />
                          USD / INR
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CostSheetTotalVariationFixedChargesTable = ({ data }) => {
    // Get the company name from the data
    let companyName =
      data && data.length > 0 && data[0].companyName !== ""
        ? data[0].companyName
        : "";

    // Filter charges that contain 'weight' in rateBasisName
    const filteredRateRequestCharge =
      data[0]?.tblRateRequestCharge?.filter((charge) =>
        charge?.rateBasis?.toLowerCase().includes("weight"),
      ) || [];

    // Exit if there are no charges
    if (filteredRateRequestCharge.length === 0) {
      return null;
    }

    // Get cargo weight
    const cargoWt = data[0]?.cargoWt || 0;

    // Filter out weight-related charges for calculations
    const tblRateRequestCharge =
      data[0]?.tblRateRequestCharge?.filter(
        (charge) => !charge?.rateBasis?.toLowerCase().includes("weight"),
      ) || [];

    // Calculate the total amount for other charges
    const totalAmount = tblRateRequestCharge.reduce(
      (acc, item) => acc + (item.sellAmount || 0),
      0,
    );

    // Custom styles for the table
    const thStyle = {
      textAlign: "center",
      padding: "10px",
      verticalAlign: "top",
      backgroundColor: "#E0E0E0",
      border: "1px solid #000000",
    };
    const tdStyle = {
      textAlign: "left",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
      width: "25%",
    };
    const tdStyleRight = {
      textAlign: "right",
      padding: "10px",
      verticalAlign: "top",
      border: "1px solid #000000",
      width: "25%",
    };

    // Constant to add to each total
    const constantToAdd = totalAmount;

    // Group charges by chargeName and sum their buyRates
    const groupedCharges = filteredRateRequestCharge.reduce((acc, charge) => {
      if (!acc[charge.chargeName]) {
        acc[charge.chargeName] = { ...charge, buyRate: 0 };
      }
      acc[charge.chargeName].buyRate += charge?.buyRate;
      return acc;
    }, {});

    // Convert the grouped charges back to an array
    const groupedChargesArray = Object.values(groupedCharges);

    return (
      <div>
        <div className="mt-1 flex flex-wrap headerTable">
          <table
            className="text-xs"
            style={{ width: "50%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th colSpan={2} style={thStyle}>
                  Total of Variation & Fixed charges
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Map through grouped charges and render each row */}
              {groupedChargesArray.map((charge, index) => {
                const chargeName = charge?.chargeName || "";
                const chargeValue = charge?.buyRate || 0;

                // Calculate total for this charge: (Charge Value * Cargo Weight) + Constant
                const totalCharge = chargeValue * cargoWt + constantToAdd;

                return (
                  <tr key={index}>
                    {/* Vendor Name Column */}
                    <td style={tdStyle}>{chargeName}</td>

                    {/* Buy Rate Column with Total Calculation */}
                    <td style={tdStyleRight}>
                      {chargeValue
                        ? `INR ${totalCharge.toFixed(2)} + GST`
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const ExportQuotationSeaModule = () => (
    <div>
      <div className="container mx-auto p-14 bodyColour text-black h-auto bgTheme">
        <CompanyImgModule />
        <h1
          style={{ textAlign: "center", fontWeight: "bold" }}
          className="mt-2"
        >
          Quotation
        </h1>
        <QuotationSeaCustomerModule data={data} />
        <QuotationExportShipperModule data={data} />
        <QuotationExportShipperDetailsModule data={data} />
        <QuotationExportSizeTypeModule data={data} />
        {/* <QuotationExportChargeVendorWiseModule data={data} />
        <QuotationExportChargeVendorWiseModuleWithTax data={data} /> */}
        <QuotationExportWithTaxAndWithoutTax data={data} />
        {clientId === 3 && <ExportParagrafModule data={data} />}
        {/* {clientId != 3 && <TermsAndCondition terms={termsAndConditions} />} */}
        {clientId === 13 && <SarQuotationTermsAndCondition />}
      </div>
    </div>
  );

  const ExportQuotationSeaModuleSAR = () => (
    <div>
      <div className="container mx-auto p-14 bodyColour text-black h-auto bgTheme">
        <CompanyImgModule />
        <h1
          style={{ textAlign: "center", fontWeight: "bold" }}
          className="mt-2"
        >
          Quotation
        </h1>
        <QuotationSeaCustomerModule data={data} />
        <QuotationExportShipperModule data={data} />
        <QuotationExportShipperDetailsModule data={data} />
        <QuotationExportSizeTypeModule data={data} />
        {/* <QuotationExportChargeVendorWiseModule data={data} />
        <QuotationExportChargeVendorWiseModuleWithTax data={data} /> */}
        <QuotationExportWithTaxAndWithoutTax data={data} />
        {clientId === 3 && <ExportParagrafModule data={data} />}
        {/* {clientId != 3 && <TermsAndCondition terms={termsAndConditions} />} */}
        {clientId === 13 && <SarQuotationTermsAndCondition />}
      </div>
    </div>
  );

  const ExportQuotationAirModule = () => (
    <div>
      <div className="container mx-auto p-14 bodyColour text-black h-auto bgTheme">
        <CompanyImgModule />
        <h1 style={{ textAlign: "center", fontWeight: "bold" }}>
          Quotation {data[0]?.businessSegmentName}
        </h1>
        <QuotationSeaCustomerModule data={data} />
        <QuotationExportShipperModule data={data} />
        <QuotationExportShipperDetailsModuleAir data={data} />
        <QuotationExportSizeTypeModuleAir data={data} />
        <QuotationExportAirChargeModuleWithTax data={data} />
        <QuotationExportChargeModuleAirWithoutTax data={data} />
        <QuotationAirGridChargeWise data={data} />
        <QuotationExportParagrafModule data={data} />
      </div>
    </div>
  );
  // module
  const QuotationEnquiryModule = ({ item, index }) => (
    <div>
      <div className="container mx-auto p-10 bodyColour text-black bgTheme">
        <CompanyImgModule />
        <h1 className="" style={{ textAlign: "center", fontWeight: "bold" }}>
          Quotation Cost Sheet
        </h1>
        <ExportSeaQuotationModuleRFQ data={[{ ...item, index: index }]} />
        <ExportShipperDetailsModuleRFQ data={[{ ...item, index: index }]} />
        <ExportSizeTypeModule data={[{ ...item, index: index }]} />
        <TransportInstructionsAirModule data={[{ ...item, index: index }]} />
        <ExportSeaQuotationModulePlanRFQ data={[{ ...item, index: index }]} />
      </div>
    </div>
  );

  const QuotationDepartmentModule = ({ item, index }) => (
    <div>
      <div className="container mx-auto p-14 bodyColour text-black h-auto bgTheme">
        <CompanyImgModule />
        <h1 style={{ textAlign: "center", fontWeight: "bold" }}>
          Quotation {item?.businessSegmentName}
        </h1>
        <ExportSeaQuotationModule data={[{ ...item, index: index }]} />
        <ExportShipperModule data={[{ ...item, index: index }]} />
        <ExportShipperDetailsModule data={[{ ...item, index: index }]} />
        <ExportSizeTypeModule data={[{ ...item, index: index }]} />
        <TransportInstructionsDepartmentModule
          data={[{ ...item, index: index }]}
        />
        <ExportSeaQuotationModulePlanRFQ data={[{ ...item, index: index }]} />
        {clientId === 3 && (
          <ExportParagrafModule data={[{ ...item, index: index }]} />
        )}
      </div>
    </div>
  );

  const ExportAirQuotation = () => (
    <div>
      <div
        id="155"
        className="container mx-auto p-14 bodyColour text-black h-auto bgTheme"
      >
        <CompanyImgModule />
        <h1 style={{ textAlign: "center", fontWeight: "bold" }}>
          Export Air Quotation
        </h1>
        <ExportAirQuotationModule data={data} />
        <ExportAirQuotationRateBasisModule data={data} />
        <AirQuotationGrid data={data} />
        <TotalVariationFixedChargesTable data={data} />
        {clientId === 3 && <ExportParagrafModule data={data} />}
        <p className="mt-5">(Authorized Signatory)</p>
      </div>
    </div>
  );

  const PalletExportSeaQuotationModule = ({ data }) => {
    const RequestDate =
      data && data.length > 0 ? new Date(data[0].rateRequestDate) : null;
    const DatesFormat = RequestDate
      ? `${RequestDate.getDate()}/${
          RequestDate.getMonth() + 1
        }/${RequestDate.getFullYear()}`
      : "";
    console.log("data", data);
    return (
      <div className="flex flex-wrap text-black dark:text-white">
        <div className="w-1/2 px-2">
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th className="pr-5">Customer: </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].customerName !== ""
                    ? data[0].customerName
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pr-5">Customer Address:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].customerAddress !== ""
                    ? data[0].customerAddress
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pr-5">Delivery To:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].consigneeName !== ""
                    ? data[0].consigneeName
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Delivery Address:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].deliveryAddress !== ""
                    ? data[0].deliveryAddress
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-1/2 px-10">
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th className="pr-5">Quotation No:</th>
                <td
                  style={{
                    wordWrap: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {data && data.length > 0 && data[0].rateRequestNo !== ""
                    ? data[0].rateRequestNo
                    : ""}
                </td>
              </tr>
              <tr>
                <th className="pr-5">Dated:</th>
                <td className="pl-5">{DatesFormat}</td>
              </tr>
              <tr>
                <th className="pr-5">Handled By:</th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].preparedById !== ""
                    ? data[0].preparedById
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Validity From : </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].validityFrom !== ""
                    ? new Date(data[0].validityFrom).toLocaleDateString("en-GB") // en-GB gives dd/mm/yyyy format
                    : ""}
                </td>
              </tr>
              <tr>
                <th>Validity To : </th>
                <td className="pl-5">
                  {data && data.length > 0 && data[0].validityTo !== ""
                    ? new Date(data[0].validityTo).toLocaleDateString("en-GB") // en-GB gives dd/mm/yyyy format
                    : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="w-full px-2">
          <hr className="hrRow"></hr>
        </div>
      </div>
    );
  };
  PalletExportSeaQuotationModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        rateRequestDate: PropTypes.string,
        customerName: PropTypes.string,
        consigneeName: PropTypes.string,
        deliveryAddress: PropTypes.string,
        customerName: PropTypes.string,
        rateRequestNo: PropTypes.string,
        preparedById: PropTypes.string,
      }),
    ).isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  };
  const PalletChargeSizeTypeModule = ({ data }) => {
    // Assuming data is structured correctly and contains an array of charge objects
    const tblRateRequestLTLCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestLTLCharge
        : [];
    console.log("3", tblRateRequestLTLCharge);

    // The data is directly used without filtering or sorting
    const colors = [
      "#CCCCFF",
      "#FCE4D6",
      "#E2EFDA",
      "#FFCCCC",
      "#D9E1F2",
      "#FFF2CC",
      "#CC99FF",
      "#F8CBAD",
      "#C6E0B4",
      "#FF9999",
      "#B4C6E7",
      "#FFE699",
      "#CC66FF",
      "#F4B084",
      "#A9D08E",
    ];

    return (
      <div className="mt-1 flex flex-wrap">
        <table
          className="mt-0 text-left text-xs"
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                ZONE
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                POSTCODES
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                MICRO
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                QTR
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                HALF
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                1
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                2
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                3
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                4
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                5
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                6
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                7
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                8
              </th>
              <th
                className="text-center border-black border-b border-r pt-2"
                style={{ backgroundColor: "#00B0F0" }}
              >
                9
              </th>
            </tr>
          </thead>
          <tbody>
            {tblRateRequestLTLCharge?.map((item, index) => (
              <tr
                key={`item-${index}`}
                style={{ backgroundColor: colors[index % colors.length] }}
              >
                <td className="text-left border-black border-b border-r py-px">
                  {item.name && item.name !== "" && item.name !== "null"
                    ? item.name
                    : ""}
                </td>
                <td
                  className="text-left border-black border-b border-r py-px"
                  style={{ maxWidth: "250px", overflowWrap: "break-word" }}
                >
                  {item.zipCode &&
                  item.zipCode !== "" &&
                  item.zipCode !== "null"
                    ? item.zipCode
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rateMicro &&
                  item.rateMicro !== "" &&
                  item.rateMicro !== "null"
                    ? item.rateMicro
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rateQuater &&
                  item.rateQuater !== "" &&
                  item.rateQuater !== "null"
                    ? item.rateQuater
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rateHalf &&
                  item.rateHalf !== "" &&
                  item.rateHalf !== "null"
                    ? item.rateHalf
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rate1 && item.rate1 !== "" && item.rate1 !== "null"
                    ? item.rate1
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rate2 && item.rate2 !== "" && item.rate2 !== "null"
                    ? item.rate2
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rate3 && item.rate3 !== "" && item.rate3 !== "null"
                    ? item.rate3
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rate4 && item.rate4 !== "" && item.rate4 !== "null"
                    ? item.rate4
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rate5 && item.rate5 !== "" && item.rate5 !== "null"
                    ? item.rate5
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rate6 && item.rate6 !== "" && item.rate6 !== "null"
                    ? item.rate6
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rate7 && item.rate7 !== "" && item.rate7 !== "null"
                    ? item.rate7
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rate8 && item.rate8 !== "" && item.rate8 !== "null"
                    ? item.rate8
                    : ""}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.rate8 && item.rate9 !== "" && item.rate9 !== "null"
                    ? item.rate9
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  PalletChargeSizeTypeModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        tblRateRequestCharge: PropTypes.arrayOf(
          PropTypes.shape({
            chargeName: PropTypes.string,
            sizeName: PropTypes.string,
            typeCode: PropTypes.string,
            qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            sellCurrencyName: PropTypes.string,
            sellExchangeRate: PropTypes.number,
            sellRate: PropTypes.number,
            sellAmount: PropTypes.number,
            sellTotalAmount: PropTypes.number,
            remarks: PropTypes.string,
          }),
        ),
      }),
    ).isRequired,
  };
  const PalletAdditionalSeriesModule = ({ data }) => {
    // Assuming data is structured correctly and contains an array of charge objects
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];
    console.log("3", rateRequestCharge);

    return (
      <div className="mt-1 flex flex-wrap" style={{ width: "100%" }}>
        {" "}
        {/* Full-width container */}
        <div style={{ width: "50%" }}>
          {" "}
          {/* Left side: Table container */}
          <div style={{ width: "100%" }}>
            {" "}
            {/* Stack table and terms vertically */}
            <table
              className="mt-0 text-left text-xs"
              style={{
                borderTop: "1px solid black",
                borderLeft: "1px solid black",
                borderBottom: "1px solid black",
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  <th
                    className="text-center border-black border-b border-r pt-2"
                    colSpan={2}
                    style={{ backgroundColor: "#00B0F0" }}
                  >
                    ADDITIONAL SERVICES
                  </th>
                </tr>
              </thead>
              <tbody>
                {rateRequestCharge.map((item, index) => (
                  <tr key={`item-${index}`}>
                    <td
                      className="px-3 border-black border-b border-r py-px"
                      style={{
                        maxWidth: "150px",
                        overflowWrap: "break-word",
                        backgroundColor: "#D9E1F2",
                      }}
                    >
                      {item.sizeName &&
                      item.chargeDescription !== "" &&
                      item.chargeDescription !== "null"
                        ? item.chargeDescription
                        : ""}
                    </td>
                    <td
                      className="text-left border-black border-b border-r py-px"
                      style={{ backgroundColor: "#FFFF99" }}
                    >
                      {item.sellRate &&
                      item.sellRate !== "" &&
                      item.sellRate !== "null"
                        ? item.sellRate
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Display PalletExportParagrafModule directly below the table */}
            <div style={{ marginTop: "20px" }}>
              <PalletExportParagrafModule data={data} />
            </div>
          </div>
        </div>
        <div style={{ width: "40%", textAlign: "center", padding: "10px" }}>
          {" "}
          {/* Right side: Image container */}
          <img
            src="http://94.136.187.170:3016/api/images/CML/cml_palletImage20250125092528479.jpg"
            alt="Service Image"
            style={{
              maxWidth: "100%",
              height: "auto",
              border: "1px solid black",
            }}
          />
        </div>
      </div>
    );
  };
  PalletAdditionalSeriesModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        tblRateRequestCharge: PropTypes.arrayOf(
          PropTypes.shape({
            chargeName: PropTypes.string,
            sizeName: PropTypes.string,
            typeCode: PropTypes.string,
            qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            sellCurrencyName: PropTypes.string,
            sellExchangeRate: PropTypes.number,
            sellRate: PropTypes.number,
            sellAmount: PropTypes.number,
            sellTotalAmount: PropTypes.number,
            remarks: PropTypes.string,
          }),
        ),
      }),
    ).isRequired,
  };

  const PalletExportParagrafModule = () => {
    const [termsAndConditions, setTermsAndConditions] = useState("");

    useEffect(() => {
      const getData = async () => {
        // Retrieve userData from localStorage
        const storedUserData = localStorage.getItem("userData");
        if (storedUserData) {
          const decryptedData = decrypt(storedUserData); // Decrypt if necessary
          const userData = JSON.parse(decryptedData);
          console.log("userData", userData);
          // Extract required fields from userData
          const clientCode = userData[0]?.clientCode;
          const loginCompany = userData[0]?.loginCompany;
          const loginBranch = userData[0]?.loginBranch;
          const businessSegmentId = userData[0]?.businessSegmentId;
          const ownCompanyName = userData[0]?.businessSegmentId;

          // Fetch Terms and Conditions
          const data = await TarifffetchTermsAndConditions(
            clientCode,
            loginCompany,
            loginBranch,
            businessSegmentId,
            ownCompanyName,
          );
          if (data && data.length > 0) {
            setTermsAndConditions(data[0].termsCondition || "");
          }
        }
      };

      getData();
    }, []);

    // Split the terms and conditions by line break ("\n") and map each line with its line number
    const termsArray = termsAndConditions
      .split("\n")
      .map((line) => {
        // Trim whitespace and check if the line is not empty
        if (line.trim().length > 0) {
          // Display the line content
          return ` ${line}`;
        }
        return null;
      })
      .filter((line) => line !== null); // Remove any null entries resulting from empty lines

    const storedUserData = localStorage.getItem("userData");
    let ownCompanyName = null;
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData); // Decrypt if necessary
      const userData = JSON.parse(decryptedData);
      ownCompanyName = userData[0]?.ownCompanyName;
    }
    return (
      <div className="mt-1 flex flex-wrap text-black dark:text-white">
        <div className="text-xs w-full">
          <h3 className="mt-0 font-bold text-black dark:text-white">
            Terms & Conditions:
          </h3>

          {termsArray.map((term, index) => (
            <p key={index} className="mt-0 text-black dark:text-white">
              {term}
            </p>
          ))}
        </div>

        <div className="mt-1">
          <p className="mt-2 text-black dark:text-white">
            <strong>Thanks and Best Regards.</strong>
          </p>
          <p className="text-black dark:text-white">
            <strong>For {ownCompanyName}</strong>
          </p>
        </div>
      </div>
    );
  };
  PalletExportParagrafModule.propTypes = {
    data: PropTypes.arrayOf(
      PropTypes.shape({
        companyName: PropTypes.string,
        // Add any other expected properties from data here
      }),
    ).isRequired,
  };

  console.log("data ", data);

  const QuotationTariffModule = () => (
    <div>
      <div
        className="container mx-auto p-10 mt-8 bodyColour bgTheme"
        style={{ color: "black" }}
      >
        <CompanyImgModule />
        <h1 style={{ textAlign: "center", fontWeight: "bold", color: "black" }}>
          {/* Quotation {data[0]?.businessSegment} */}
          Quotation {data[0]?.businessSegmentName}
        </h1>
        <div className="!text-black">
          <TariffExportSeaQuotationModule data={data} />
          <TariffExportShipperDetailsModule data={data} />
          <TariffChargeSizeTypeModule data={data} />
          <TransportInstructionsDepartmentModule data={data} />
          <TariffExportParagrafModule data={data} />
        </div>
      </div>
    </div>
  );

  const QuotationPalletModule = () => (
    <div className="text-black dark:text-white">
      <div className="m-1 text-black border border-black">
        <div className="mt-9 ml-1">
          <CompanyImgModule />
        </div>
      </div>
      <h1 className="text-center font-bold text-xl pt-1 pb-1 underline text-black dark:text-white">
        Quotation Transportation
      </h1>
      <PalletExportSeaQuotationModule data={data} />
      <PalletChargeSizeTypeModule data={data} />
      <PalletAdditionalSeriesModule data={data} />
    </div>
  );

  const CostSheetAirQuotation = () => (
    <div>
      <div
        id="155"
        className="container mx-auto p-14 bodyColour text-black h-auto bgTheme"
      >
        <CompanyImgModule />
        <h1 style={{ textAlign: "center", fontWeight: "bold" }}>
          Cost Sheet Air Quotation
        </h1>
        <CostSheetAirQuotationModule data={data} />
        <CostQuotationExportSizeTypeModuleAir data={data} />
        <CostSheetAirQuotationGrid data={data} />
        <CostSheetTransportInstructionsAirModule data={data} />
        <CostSheetTotalVariationFixedChargesTable data={data} />
        <CostSheetAirQuotationRateBasisModule data={data} />
        <p className="mt-5">(Authorized Signatory)</p>
      </div>
    </div>
  );

  const ContainerPlannerQuotationModule = ({ data }) => {
    setPrintOrientation("portrait");
    const RequestDate =
      data && data.length > 0 ? new Date(data[0].rateRequestDate) : null;

    const DatesFormat = RequestDate
      ? `${RequestDate.getDate()}/${
          RequestDate.getMonth() + 1
        }/${RequestDate.getFullYear()}`
      : "";

    return (
      <div className="flex flex-wrap">
        {/* Left Side */}
        <div style={{ width: "60%" }}>
          <table className="mt-1 text-left text-xs">
            <tbody>
              <tr>
                <th
                  style={{ width: "30%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Customer:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.customerName || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    width: "30%",
                    fontSize: "10px",
                    verticalAlign: "top",
                  }}
                  className="pr-1 pt-0 pb-0"
                >
                  Customer Address:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.customerAddress || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "30%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Location From:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.fromLocation || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "30%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Location To:
                </th>
                <td
                  style={{ width: "70%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.toLocation || ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Right Side */}
        <div style={{ width: "40%" }} className="px-2">
          <table className="mt-1 text-left text-xs w-full">
            <tbody>
              <tr>
                <th
                  style={{ width: "40%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Quotation No:
                </th>
                <td
                  style={{ width: "60%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {data?.[0]?.rateRequestNo || ""}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "40%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Dated:
                </th>
                <td
                  style={{ width: "60%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {DatesFormat}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "40%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Handled By:
                </th>
                <td
                  style={{ width: "60%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {userName}
                </td>
              </tr>
              <tr>
                <th
                  style={{ width: "40%", fontSize: "10px" }}
                  className="pr-1 pt-0 pb-0"
                >
                  Validity To:
                </th>
                <td
                  style={{ width: "60%", fontSize: "10px" }}
                  className="pl-2 pt-1 pb-1"
                >
                  {formatDate(data[0]?.validityTo)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Divider */}
        <div className="w-full mt-2">
          <hr className="border-black border" />
        </div>
      </div>
    );
  };

  const ContainerPlannerSizeTypeModule = ({ data }) => {
    // Assuming data is structured correctly and contains an array of charge objects
    const rateRequestCharge =
      data && Array.isArray(data) && data.length > 0
        ? data[0].tblRateRequestCharge
        : [];

    const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
      const aCurrency = a.sellCurrencyName || "";
      const bCurrency = b.sellCurrencyName || "";

      if (aCurrency === "" && bCurrency !== "") return 1;
      if (aCurrency !== "" && bCurrency === "") return -1;

      return aCurrency.localeCompare(bCurrency);
    });

    // Calculate subtotals by currency
    const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
      const currency = curr.sellCurrencyName || "";
      if (!acc[currency]) {
        acc[currency] = { amount: 0, totalAmount: 0 };
      }
      acc[currency].amount += curr.sellAmount || 0;
      acc[currency].totalAmount += curr.sellTotalAmount || 0;
      return acc;
    }, {});

    const grandTotal = sortedRateRequestCharge.reduce(
      (acc, charge) => acc + (charge.sellAmount || 0),
      0,
    );

    console.log("sortedRateRequestCharge", sortedRateRequestCharge);

    const grandTotalInWords = numberToWordsOnly(grandTotal);

    return (
      <div className="mt-1 flex flex-wrap headerTable ">
        <table
          className="mt-0 text-left text-xs "
          style={{
            borderTop: "1px solid black",
            borderLeft: "1px solid black",
            borderBottom: "1px solid black",
            width: "100%",
          }}
        >
          <thead>
            <tr>
              <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                CHARGE DESCRIPTION
              </th>
              <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                Size/Type
              </th>
              <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                Qty
              </th>
              <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                Currency
              </th>
              <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                Rate
              </th>
              <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                Amount
              </th>
              <th className="text-center border-black border-b border-r pt-2  bg-gray-300">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {rateRequestCharge.map((item, index, array) => {
              // Render charge row
              const rows = [
                <tr key={`item-${index}`}>
                  <td
                    className="px-3 border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {`${item.chargeName || ""}`}
                  </td>

                  <td className="text-center border-black border-b border-r py-px">
                    {item.sizeName &&
                    item.sizeName !== "" &&
                    item.sizeName !== "null"
                      ? item.sizeName
                      : ""}{" "}
                    /{" "}
                    {item.typeCode &&
                    item.typeCode !== "" &&
                    item.typeCode !== "null"
                      ? item.typeCode
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.qty === "number" &&
                    item.qty !== null &&
                    item.qty !== ""
                      ? item.qty.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-center border-black border-b border-r py-px">
                    {item.sellCurrencyName &&
                    item.sellCurrencyName !== "" &&
                    item.sellCurrencyName !== "null"
                      ? item.sellCurrencyName
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellRate === "number" &&
                    item.sellRate !== null &&
                    item.sellRate !== ""
                      ? item.sellRate.toFixed(2)
                      : ""}
                  </td>
                  <td className="text-right border-black border-b border-r py-px">
                    {typeof item.sellAmount === "number" &&
                    item.sellAmount !== null &&
                    item.sellAmount !== ""
                      ? item.sellAmount.toFixed(2)
                      : ""}
                  </td>
                  <td
                    className="text-left border-black border-b border-r py-px"
                    style={{ maxWidth: "150px", overflowWrap: "break-word" }}
                  >
                    {item.remarks &&
                    item.remarks !== "" &&
                    item.remarks !== "null"
                      ? item.remarks
                      : ""}
                  </td>
                </tr>,
              ];

              // Check if this is the last item or the next item has a different currency
              // const lastOfCurrency =
              //   index === array.length - 1 ||
              //   array[index + 1].sellCurrencyName !== item.sellCurrencyName;
              // if (lastOfCurrency) {
              //   // Add subtotal row
              //   const subtotal = subtotals[item.sellCurrencyName];
              //   rows.push(
              //     <tr key={`subtotal-${item.sellCurrencyName}`}>
              //       <td className="border-black border-b border-r font-bold py-px px-2">
              //         Total ({item.sellCurrencyName}):
              //       </td>
              //       <td className="text-center border-black border-b border-r"></td>
              //       <td className="text-center border-black border-b border-r"></td>
              //       <td className="text-center border-black border-b border-r"></td>
              //       <td className="text-center border-black border-b border-r"></td>
              //       <td className="text-center border-black border-b border-r"></td>
              //       <td className="text-center border-black border-b border-r font-bold py-px">
              //         {subtotal.amount.toFixed(2)}({item.sellCurrencyName}){" "}
              //         {/* {Amount.toFixed(2)} */}
              //       </td>
              //       <td className="text-center border-black border-b border-r font-bold py-px">
              //         {subtotal.totalAmount.toFixed(2)} ({item.sellCurrencyName}
              //         ){/* {totalAmount.toFixed(2)} */}
              //       </td>
              //       <td className="text-center border-black border-b border-r"></td>
              //     </tr>
              //   );
              // }
              return rows;
            })}
          </tbody>
        </table>
        <div
          className="mt-2 flex flex-wrap"
          style={{ width: "100%", marginTop: "5px" }}
        >
          <div
            className="text-xs w-full flex justify-between"
            style={{
              borderTop: "1px solid black",
              borderRight: "1px solid black",
              borderLeft: "1px solid black",
            }}
          >
            <div className="mt-1 font-bold py-px px-2">Grand Total:</div>
            <div className="mt-1 mr-10 font-bold py-px">
              {grandTotal.toFixed(2)}
            </div>
          </div>
          <div
            className="text-xs w-full flex"
            style={{ border: "1px solid black" }}
          >
            <div className="mt-1 font-bold px-2">Amount in Words:</div>
            <div className="mt-1 font-bold">
              {capitalizeFirstLetters(grandTotalInWords)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ContainerPlanner = () => (
    <div>
      <div
        className="container mx-auto p-10 mt-8 bodyColour bgTheme"
        style={{ color: "black" }}
      >
        <CompanyImgModule />
        <h1 style={{ textAlign: "center", fontWeight: "bold", color: "black" }}>
          {/* Quotation {data[0]?.businessSegment} */}
          Quotation Container Planner
        </h1>
        <div className="!text-black">
          <ContainerPlannerQuotationModule data={data} />
          <ContainerPlannerSizeTypeModule data={data} />
          <div className="flex flex-wrap headerTable">
            <div className="text-xs w-full"></div>
            <div className="mt-2">
              <p>
                <p>
                  <b>Note VAT charges will be added in the invoice.</b>
                </p>
              </p>
              <p>
                <strong>Thanks and Best Regards.</strong>
              </p>
              <p>
                <strong>For {companyName}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main>
      <div className="mt-5">
        <Print
          enquiryModuleRefs={enquiryModuleRefs}
          printOrientation={printOrientation || "landscape"}
          reportIds={printReportName?.length > 0 ? printReportName : reportIds}
        />

        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Quotation Sea Report":
              return (
                <>
                  {data.map((item, idx) => {
                    return (
                      <div
                        key={idx}
                        ref={(el) => (enquiryModuleRefs.current[idx] = el)}
                        className={
                          idx < data.length - 1 ? "report-spacing" : ""
                        }
                      >
                        <QuotationDepartmentModule item={item} />
                      </div>
                    );
                  })}
                </>
              );
            case "Quotation Cost Sheet":
              return (
                <>
                  {data.map((item, idx) => {
                    return (
                      <div
                        key={idx}
                        ref={(el) => (enquiryModuleRefs.current[idx] = el)}
                        className={
                          idx < data.length - 1 ? "report-spacing" : ""
                        }
                      >
                        <QuotationEnquiryModule item={item} index={idx} />
                      </div>
                    );
                  })}
                </>
              );
            case "CostSheet Air New":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={
                      index < reportIds.length - 1 ? "report-spacing" : ""
                    }
                  >
                    {CostSheetAirQuotation()}
                  </div>
                </>
              );
            case "Warehousing/Storage":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={
                      index < reportIds.length - 1 ? "report-spacing" : ""
                    }
                  >
                    {FulfillmentRatesModule()}
                  </div>
                </>
              );
            case "Export Air Quotation":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={
                      index < reportIds.length - 1 ? "report-spacing" : ""
                    }
                  >
                    {ExportAirQuotation()}
                  </div>
                </>
              );
            case "Terrif Report":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={
                      index < reportIds.length - 1 ? "report-spacing" : ""
                    }
                  >
                    {QuotationTariffModule()}
                  </div>
                </>
              );
            case "Quotation Sea Print":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={
                      index < reportIds.length - 1 ? "report-spacing" : ""
                    }
                  >
                    {clientId === 13
                      ? ExportQuotationSeaModuleSAR()
                      : ExportQuotationSeaModule()}
                  </div>
                </>
              );
            case "Customer Quotation Air":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    className={
                      index < reportIds.length - 1 ? "report-spacing" : ""
                    }
                  >
                    {ExportQuotationAirModule()}
                  </div>
                </>
              );
            case "Quotation Transportation (FTL)":
              return (
                <>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      key={index}
                      ref={(el) => (enquiryModuleRefs.current[index] = el)}
                      className={
                        index < reportIds.length - 1 ? "report-spacing" : ""
                      }
                      style={{
                        width: "210mm", // A4 width in millimeters
                        height: "297mm", // A4 height in millimeters
                        backgroundColor: "white", // Optional for clarity
                        marginBottom: "20px", // Can be removed if centering takes priority
                      }}
                    >
                      {QuotationTariffModule()}
                    </div>
                  </div>
                </>
              );
            case "Quotation Transportation (LTL)":
              return (
                <>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      key={index}
                      ref={(el) => (enquiryModuleRefs.current[index] = el)}
                      className={
                        index < reportIds.length - 1 ? "report-spacing" : ""
                      }
                      style={{
                        width: "210mm", // A4 width in millimeters
                        height: "297mm", // A4 height in millimeters
                        backgroundColor: "white", // Optional for clarity
                        marginBottom: "20px", // Can be removed if centering takes priority
                      }}
                    >
                      {QuotationPalletModule()}
                    </div>
                  </div>
                </>
              );
            case "Container Planner":
              return (
                <>
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      key={index}
                      ref={(el) => (enquiryModuleRefs.current[index] = el)}
                      className={
                        index < reportIds.length - 1 ? "report-spacing" : ""
                      }
                      style={{
                        width: "210mm", // A4 width in millimeters
                        height: "297mm", // A4 height in millimeters
                        backgroundColor: "white", // Optional for clarity
                        marginBottom: "20px", // Can be removed if centering takes priority
                        pageBreakAfter:
                          index < reportIds.length - 1 ? "always" : "auto",
                      }}
                    >
                      {ContainerPlanner()}
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
//AKASH
export default rptQuotation;
