"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useSearchParams } from "next/navigation";
import "./rptJobs.css";
import Print from "@/components/Print/page";
import { toast } from "react-toastify";
import { decrypt } from "@/helper/security";
import chunk from "lodash/chunk";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
import "@/public/style/reportTheme.css";
import { applyTheme } from "@/utils";
import { getUserDetails } from "@/helper/userDetails";
import moment from "moment";
import { data } from "react-router-dom";

const rptJobs = () => {
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  const [emailIds, setEmailIds] = useState([]);
  const [pdfReportIds, setPdfReportIds] = useState([]);
  const [rpIds, setRpIds] = useState([]);
  const [jobData, setJobData] = useState(null);
  const [voucherData, setVoucherData] = useState(null);
  const enquiryModuleRefs = useRef([]);
  const [ImageUrl, setImageUrl] = useState("");
  const [html2pdf, setHtml2pdf] = useState(null);
  const { clientId } = getUserDetails();

  useEffect(() => {
    const loadHtml2pdf = async () => {
      const module = await import("html2pdf.js");
      setHtml2pdf(() => module.default);
    };

    loadHtml2pdf();
  }, []);
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
      setReportIds(reportIds);
    } else {
      console.log("No Report IDs found in sessionStorage");
    }
  }, []);

  function formatDateToYMD(dateStr) {
    if (!dateStr) return ""; // Handles null, undefined, empty string

    const date = new Date(dateStr);

    if (isNaN(date)) return ""; // Handles invalid date strings

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = date.getFullYear();

    return `${day}/${month}/${year}`; // Returns "dd/mm/yyyy"
  }

  const getValidTillDate = (jobDate, croValidDays) => {
    console.log("📅 jobDate input:", jobDate);
    console.log("🔢 croValidDays input:", croValidDays);
    if (!jobDate || croValidDays == null) {
      console.warn("❌ Missing jobDate or croValidDays");
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

  useEffect(() => {
    const fetchdata = async () => {
      const id = searchParams.get("recordId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          // const requestBody = {
          //   filterCondition: `job.id=${id}`,
          // };
          const requestBody = {
            id: id,
          };
          const response = await fetch(`${baseUrl}/Sql/api/Reports/job`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": JSON.parse(token),
            },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) throw new Error("Failed to fetch job data");
          const data = await response.json();
          setJobData(data.data);
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
        const headerLogoPath = userData[0]?.headerLogoPath;
        if (headerLogoPath) {
          setImageUrl(headerLogoPath);
        }

        applyTheme(enquiryModuleRefs.current);
      }
    };
    fetchHeader();
  }, [reportIds]);

  useEffect(() => {
    const fetchVoucherData = async () => {
      const token = localStorage.getItem("token");
      const id = 147;
      try {
        const response = await fetch(`${baseUrl}/api/Reports/tblVoucher`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": JSON.parse(token),
          },
          body: JSON.stringify({
            projection: {
              companyId: 1,
              "tblVoucherLedger.tblVoucherLedgerDetails.debitAmount": 1,
              "tblVoucherLedger.tblVoucherLedgerDetails.creditAmount": 1,
            },
            id: `${id}`,
          }),
        });
        if (!response.ok) throw new Error("Failed to fetch voucher data");
        const data = await response.json();
        setVoucherData(data.data);
      } catch (error) {
        console.error("Error fetching voucher data:", error);
      }
    };
    if ((reportIds.length > 0 || rpIds.length > 0) && !voucherData) {
      fetchVoucherData();
    }
  }, [reportIds, rpIds, voucherData]);

  // Function to send emails for each report ID in emailIds state
  const sendReportsEmails = () => {
    rpIds.forEach((emailId) => {
      const reportElement = document.getElementById(`report-${emailId}`);
      if (reportElement) {
        const upperHtml =
          '<!DOCTYPE html>\
        <html lang="en">\
        <head>\
            <meta charset="UTF-8">\
            <meta name="viewport" content="width=device-width, initial-scale=1.0">\
            <style>\
                * {\
                    font-family: Arial, Helvetica, sans-serif;\
                }\
                img {\
                    max-width: 100%;\
                    height: auto;\
                }\
                .container {\
                    max-width: 100%;\
                    padding: 0 20px;\
                    margin: 0 auto;\
                }\
                .heading {\
                    font-size: 15px;\
                }\
                @media screen and (max-width: 600px) {\
                    .container {\
                        padding: 0 10px;\
                    }\
                    .tblhead {\
                        font-size: 6px !important; /* Smaller for mobile devices */\
                    }\
                    .heading {\
                        font-size: 8px !important;\
                    }\
                }\
                @media screen and (min-width: 768px) {\
                    .container {\
                        max-width: 768px;\
                    }\
                    .text {\
                        font-size: 14px; /* Smaller font size for tablet screens */\
                    }\
                    h1 {\
                        font-size: 18px; /* Smaller font size for tablet screens */\
                    }\
                }\
                @media screen and (min-width: 1024px) {\
                    .container {\
                        max-width: 1024px;\
                    }\
                    .text {\
                        font-size: 16px; /* Slightly smaller than the default for small desktops */\
                    }\
                    h1 {\
                        font-size: 22px; /* Slightly smaller than the default for small desktops */\
                    }\
                }\
                @media screen and (min-width: 1200px) {\
                    .container {\
                        max-width: 1200px;\
                    }\
                    .text, h1 {\
                        font-size: 14px; /* Default size for laptops */\
                    }\
                    .heading {\
                        font-size: 20px; /* Default size for laptops */\
                    }\
                }\
            </style>\
        </head>\
        <body>';

        const lowerHtml =
          "</body>\
</html>";

        const htmlContent = upperHtml + reportElement.innerHTML + lowerHtml;
        // Check if the emailId is in emailIds and send email if true
        if (emailIds.includes(emailId)) {
          sendEmail(htmlContent);
        }

        // Check if the emailId is in pdfReportIds and send PDF if true
        if (pdfReportIds.includes(emailId)) {
          sendPDF(htmlContent);
        }
      } else {
        console.error(
          `Report with ID ${emailId} not found or not rendered yet.`
        );
      }
    });
  };

  useEffect(() => {
    setRpIds([...new Set([...emailIds, ...pdfReportIds])]);
  }, [emailIds, pdfReportIds]);

  useEffect(() => {
    if (rpIds.length > 0 && jobData && voucherData) {
      sendReportsEmails();
    }
  }, [rpIds, jobData, voucherData]); // Make sure this only triggers when necessary

  const sendEmail = async (content) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${baseUrl}/api/send/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify({
          to: "rohitanabhavane26@gmail.com, abhishek@sysconinfotech.com , akkarma4001@gmail.com , akash@sysconinfotech.com , nilay@sysconinfotech.com ",
          subject: "Reports Email",
          body: content,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          `Failed to send email: ${data.message || "Unknown error"}`
        );
      toast.success("Email sent successfully!");
    } catch (error) {
      //console.error('Error sending email:', error);
      toast.error(`Error sending email: ${error.message}`);
    }
  };

  const sendPDF = async (content) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${baseUrl}/api/send/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify({
          to: "rohitanabhavane26@gmail.com, abhishek@sysconinfotech.com , akkarma4001@gmail.com , akash@sysconinfotech.com , nilay@sysconinfotech.com ",
          subject: "Reports PDF",
          htmlContent: content,
          pdfFilename: "document.pdf",
          userPassword: "12345",
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          `Failed to send email: ${data.message || "Unknown error"}`
        );
      toast.success("PDF sent successfully!");
    } catch (error) {
      //console.error('Error sending email:', error);
      toast.error(`Error sending PDF: ${error.message}`);
    }
  };

  const generateReportBodies = (rpIds) => {
    return rpIds.map((reportId, index) => {
      switch (reportId) {
        case "101":
          // Booking Confirmation
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < rpIds.length - 1 ? "report-spacing" : ""}
            >
              {BookingConfirmationCustomerReport()}
            </div>
          );
        case "105":
          // On Board Confirmation
          return (
            <>
              <div
                key={index}
                ref={enquiryModuleRef}
                id={`report-${reportId}`}
                className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                  } shadow-2xl`}
                style={{
                  width: "210mm",
                  height: "297mm",
                  margin: "auto",
                  boxSizing: "border-box", // space between page edge and inner border
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="p-2 bgTheme ">
                  {OnBoardConfirmationReport()}{" "}
                </div>
              </div>
              <div className="bg-gray-300 h-2 no-print" />
            </>
          );
        case "107":
          // On Board Confirmation
          return (
            <>
              <div
                key={index}
                ref={enquiryModuleRef}
                id={`report-${reportId}`}
                className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                  } shadow-2xl`}
                style={{
                  width: "210mm",
                  height: "297mm",
                  margin: "auto",
                  boxSizing: "border-box", // space between page edge and inner border
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="p-2 bgTheme" style={{ height: "297mm" }}>
                  {LandingConfirmationReports()}
                </div>
              </div>
              <div className="bg-gray-300 h-2 no-print" />
            </>
          );
        case "108":
          // Pre Advice
          return (
            <div
              key={index}
              ref={enquiryModuleRef}
              id={`report-${reportId}`}
              className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                } shadow-2xl`}
              style={{
                width: "210mm",
                height: "297mm",
                margin: "auto",
                boxSizing: "border-box", // space between page edge and inner border
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="p-2 bgTheme">{PreAdviceReports()}</div>
            </div>
          );
        case "109":
          // Stuffing Confirmation
          return (
            <div
              key={index}
              ref={enquiryModuleRef}
              id={`report-${reportId}`}
              className={`black-text  ${index < reportIds.length - 1 ? "report-spacing" : ""
                } shadow-2xl`}
              style={{
                width: "210mm",
                height: "297mm",
                margin: "auto",
                boxSizing: "border-box", // space between page edge and inner border
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="p-2 bgTheme">{StuffingConfirmationReport()}</div>
            </div>
          );
        case "103":
          // Carting Details
          return (
            <div
              key={index}
              ref={enquiryModuleRef}
              id={`report-${reportId}`}
              className={`mt-5 black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                } shadow-2xl`}
              style={{
                width: "210mm",
                height: "297mm",
                margin: "auto",
                boxSizing: "border-box", // space between page edge and inner border
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="p-2 bgTheme">{CartingDetailsReports()}</div>
            </div>
          );
        case "102":
          // Delivery Confirmation
          return (
            <div
              key={index}
              ref={enquiryModuleRef}
              id={`report-${reportId}`}
              className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                } shadow-2xl`}
              style={{
                width: "210mm",
                height: "297mm",
                margin: "auto",
                boxSizing: "border-box", // space between page edge and inner border
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="p-2 bgTheme">{DeliveryConfirmationReports()}</div>
            </div>
          );
        case "106":
          // Request for Payment
          return (
            <div
              key={index}
              ref={enquiryModuleRef}
              id={`report-${reportId}`}
              className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                } shadow-2xl`}
              style={{
                width: "210mm",
                height: "297mm",
                margin: "auto",
                boxSizing: "border-box", // space between page edge and inner border
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="p-2 bgTheme">{RequestforPaymentReport()}</div>
            </div>
          );
        case "110":
          // Transport Instructions
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {TransportInstructionsReport()}
            </div>
          );
        case "104":
          // Freight Certificate
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {FreightCertificateReport()}
            </div>
          );
        case "111":
          // Freight Certificate Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {FreightCertificateAirReport()}
            </div>
          );
        case "112":
          // Delivery Order Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {DeliveryOrderAirReport()}
            </div>
          );
        case "113":
          // Booking Confirmation Sea
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {BookingConfirmationCustomerSeaReport()}
            </div>
          );
        case "114":
          // Delivery Order Sea
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {DeliveryConfirmationSeaReports()}
            </div>
          );
        case "115":
          // Landing Confirmation Sea
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {LandingConfirmationReports()}
            </div>
          );
        case "116":
          // Transport Instructions
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {TransportInstructionsReport()}
            </div>
          );
        case "117":
          // Freight Certificate Sea
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {FreightCertificateReport()}
            </div>
          );
        case "118":
          // Cargo Arrival Note Sea
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {CargoArrivalNoteSeaReports()}
            </div>
          );
        case "119":
          // Delivery Confirmation Sea
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {DeliveryConfirmationSeaReports()}
            </div>
          );
        case "120":
          // Delivery Order to SL Sea
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {DeliveryOrdertoSLSeaReports()}
            </div>
          );
        case "121":
          // Booking Confirmation (Carrier) Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {BookingConfirmationCarrierReports()}
            </div>
          );
        case "122":
          // Booking Confirmation (Customer) Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {BookingConfirmationCustomerReports()}
            </div>
          );
        case "123":
          // Delivery Confirmation Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {DeliveryConfirmationAirReports()}
            </div>
          );
        case "124":
          // Freight Certificate Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {FreightCertificateAirReports()}
            </div>
          );
        case "125":
          // Invoicing Instructions Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {InvoicingInstructionsReports()}
            </div>
          );
        case "126":
          // Pre Advice Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {preAdviceAirReport()}
            </div>
          );
        case "127":
          // Request for Payment Customer Report Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {RequestforPaymentCustomerReport()}
            </div>
          );
        case "128":
          // Transport Instructions Air
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {TransportInstructionsAirReport()}
            </div>
          );
        case "129":
          // Job Sheet Sea
          return (
            <div
              key={index}
              id={`report-${reportId}`}
              className={index < reportIds.length - 1 ? "report-spacing" : ""}
            >
              {JobSheetSeaReport()}
            </div>
          );
        default:
          return null;
      }
    });
  };
  //IMG
  const CompanyImgModule = () => {
    return (
      <img
        src={`${baseUrlNext}${ImageUrl}`}
        alt="LOGO"
        className="w-full"
      ></img>
    );
  };

  const HeaderModule = ({ jobData }) => {
    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "10px", marginBottom: "10px" }}
      >
        <tr>
          <td
            align="right"
            valign="top"
            style={{ width: "50%", maxWidth: "50%" }}
          >
            <table border="0" cellSpacing="0" cellPadding="0" width="40%">
              <tr>
                <th align="left" className="responsiveTh">
                  Date :
                </th>
                <td></td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">
                  Our Reference :
                </th>
                <td>{jobData && jobData.length > 0 ? jobData[0].jobNo : ""}</td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">
                  From :
                </th>
                <td></td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">
                  Email :
                </th>
                <td></td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">
                  Telephone :
                </th>
                <td></td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">
                  Page :
                </th>
                <td>1 of 1</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  HeaderModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const HeaderShipperDataModule = ({ jobData }) => {
    const fallbackText = "";

    const jobDataContent = (data, field) => {
      return data && data.length > 0 ? data[0][field] : fallbackText;
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td valign="top" style={{ width: "60% " }}>
            {jobDataContent(jobData, "shipperName")}
            <br />
            {jobDataContent(jobData, "shipperAddress")}
          </td>
          <td className="tblhead" valign="top" style={{ width: "40%" }}>
            <table
              className="tblhead"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" className="responsiveTh">
                  Date :
                </th>
                <td>{fallbackText}</td>
              </tr>
              <tr>
                <th align="left">Our Reference :</th>
                <td>{jobDataContent(jobData, "jobNo")}</td>
              </tr>
              <tr>
                <th align="left">From :</th>
                <td>{fallbackText}</td>
              </tr>
              <tr>
                <th align="left">Email :</th>
                <td>{fallbackText}</td>
              </tr>
              <tr>
                <th align="left">Telephone :</th>
                <td>{fallbackText}</td>
              </tr>
              <tr>
                <th align="left">Page :</th>
                <td>1 of 1</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  HeaderShipperDataModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const ShipperConsigneeTableModule = ({ jobData }) => {
    const cellStyle = {
      paddingLeft: "5px",
      width: "40%",
      boxSizing: "border-box",
    };

    const headerStyle = {
      paddingLeft: "5px",
      width: "10%",
      boxSizing: "border-box",
      fontWeight: "bold",
      textAlign: "left",
    };

    const getContent = (data, field) =>
      data && data.length > 0 ? data[0][field] : "";

    return (
      <div
        style={{
          marginTop: "10px",
          marginBottom: "10px",
          display: "flex",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <div style={headerStyle}>Shipper</div>
        <div style={cellStyle}>
          {getContent(jobData, "shipperName")}
          <br />
          {getContent(jobData, "shipperAddress")}
        </div>
        <div style={headerStyle}>Consignee</div>
        <div style={cellStyle}>
          {getContent(jobData, "consigneeName")}
          <br />
          {getContent(jobData, "consigneeAddress")}
        </div>
      </div>
    );
  };

  ShipperConsigneeTableModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const ShipperConsigneeTableAirModule = ({ jobData }) => {
    // Inline styles for table cells
    const tdStyle = {
      paddingLeft: "5px", // Adjust padding as needed
    };

    // Inline styles for table headers
    const thStyle = {
      fontWeight: "bold", // Assuming you want your headers to be bold
      textAlign: "left",
    };

    // Helper function to get the job data content
    const getContent = (data, field) =>
      data && data.length > 0 ? data[0][field] : "";

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px", width: "100%" }}
      >
        <tbody>
          <tr>
            <th style={thStyle}>Customer</th>
            <td style={tdStyle}>{getContent(jobData, "consigneeAddress")}</td>
            <th style={thStyle}>Cust. Ref. No.</th>
            <td style={tdStyle}>{getContent(jobData, "consigneeAddress")}</td>
          </tr>
        </tbody>
      </table>
    );
  };
  ShipperConsigneeTableAirModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const PackagesGrossWeightModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "10px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  No.Of Packages{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].noOfPackages : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Gross Weight
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].cargoWt : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Volume{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 && jobData[0].volume
                    ? `${jobData[0].volume} ${jobData[0].volumeUnitName || ""}`
                    : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Container Nos.
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Cargo Type :
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0
                    ? jobData[0].cargoTypeName
                    : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Commodity :
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0
                    ? jobData[0].commodityTypeName
                    : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  PackagesGrossWeightModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const VesselModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Vessel/Voyage
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Place of Receipt{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Port of Loading{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Port of Discharge
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Final Destination{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  ETS
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  ETA{" "}
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  VesselModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const PackagesGrossWeightSeaModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <td width="49%" valign="top">
          <table
            className="tblhead"
            width="100%"
            border="0"
            cellSpacing="0"
            cellPadding="0"
          >
            <tr>
              <th align="left" style={thStyle}>
                No of Packages
              </th>
              <td align="left" style={tdStyle}>
                {jobData && jobData.length > 0 ? jobData[0].noOfPackages : ""}
              </td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>
                Gross Weight
              </th>
              <td align="left" style={tdStyle}>
                {jobData && jobData.length > 0 ? jobData[0].cargoWt : ""}
              </td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>
                Volume
              </th>
              <td align="left" style={tdStyle}>
                {jobData && jobData.length > 0
                  ? `${jobData[0].volume} ${jobData[0].volumeUnitName}`
                  : ""}
              </td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>
                Container Nos
              </th>
              <td align="left" style={tdStyle}>
                {jobData && jobData.length > 0 ? jobData[0].podName : ""}
              </td>
            </tr>
          </table>
        </td>
      </table>
    );
  };
  PackagesGrossWeightSeaModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const VesselEts = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };

    const getData = (data, field) =>
      data && data.length > 0 ? data[0][field] : "";

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Vessel/Voyage:
                </th>
                <td align="left" style={tdStyle}>
                  {getData(jobData, "vesselVoyage")}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  PLR:
                </th>
                <td align="left" style={tdStyle}>
                  {getData(jobData, "plrName")}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  POL:
                </th>
                <td align="left" style={tdStyle}>
                  {getData(jobData, "polName")}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  POD:
                </th>
                <td align="left" style={tdStyle}>
                  {getData(jobData, "podName")}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  ETS:
                </th>
                <td align="left" style={tdStyle}>
                  {getData(jobData, "ets")}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  ETA:
                </th>
                <td align="left" style={tdStyle}>
                  {getData(jobData, "eta")}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope:
                </th>
                <td align="left" style={tdStyle}>
                  {getData(jobData, "movementScope")}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  VesselEts.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const ContainerTableModule = ({ jobData }) => {
    // Define inline styles
    const tableStyle = {
      width: "100%",
      marginTop: "1rem",
      textAlign: "left",
    };
    const thTdStyle = {
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };

    return (
      <table className="tblhead" style={tableStyle}>
        <thead>
          <tr>
            <th style={thTdStyle}>Container No</th>
            <th style={thTdStyle}>Size/Type</th>
            <th style={thTdStyle}>Status</th>
            <th style={thTdStyle}>Gross WT</th>
            <th style={thTdStyle}>No of Packages</th>
          </tr>
        </thead>
        <tbody>
          {jobData &&
            jobData.map(
              (job, index) =>
                job.tblJobContainer &&
                job.tblJobContainer.length > 0 &&
                job.tblJobContainer.map((container, containerIndex) => (
                  <tr key={`job-${index}-container-${containerIndex}`}>
                    <td style={thTdStyle}>{container.containerNo || ""}</td>
                    <td style={thTdStyle}>
                      {`${container.sizeName || ""}/${container.typeName || ""
                        }`}
                    </td>
                    <td style={thTdStyle}>
                      {container.containerStatusName || ""}
                    </td>
                    <td style={thTdStyle}>{container.grossWt || ""}</td>
                    <td style={thTdStyle}>{container.noOfPackages || ""}</td>
                  </tr>
                ))
            )}
        </tbody>
      </table>
    );
  };

  ContainerTableModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const PlrCarrierModule = ({ jobData }) => {
    const mblDate =
      jobData && jobData.length > 0 ? new Date(jobData[0].mblDate) : null;
    const MblDatesFormat = mblDate
      ? `${mblDate.getDate()}/${mblDate.getMonth() + 1
      }/${mblDate.getFullYear()}`
      : "";

    const hblDate =
      jobData && jobData.length > 0 ? new Date(jobData[0].hblDate) : null;
    const hblDatesFormat = hblDate
      ? `${hblDate.getDate()}/${hblDate.getMonth() + 1
      }/${hblDate.getFullYear()}`
      : "";

    const sailData =
      jobData && jobData.length > 0 ? new Date(jobData[0].salingDate) : null;
    const sailDataFormat = sailData
      ? `${sailData.getDate()}/${sailData.getMonth() + 1
      }/${sailData.getFullYear()}`
      : "";

    const arrivalData =
      jobData && jobData.length > 0 ? new Date(jobData[0].arrivalDate) : null;
    const arrivalDataFormat = arrivalData
      ? `${arrivalData.getDate()}/${arrivalData.getMonth() + 1
      }/${arrivalData.getFullYear()}`
      : "";

    const thStyle = {
      width: "15%",
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "10px" }}
      >
        <tr>
          <td width="50%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Vessel/Voyage:
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  PLR:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  POL:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  POD:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  FPD:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MBL No:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].mblNo : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HBL No:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].hblNo : ""}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Carrier:
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Sailing Date:
                </th>
                <td align="left" style={tdStyle}>
                  {sailDataFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Arrival Date:
                </th>
                <td align="left" style={tdStyle}>
                  {arrivalDataFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope :
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MBL Date:
                </th>
                <td align="left" style={tdStyle}>
                  {MblDatesFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HBL Date:
                </th>
                <td align="left" style={tdStyle}>
                  {hblDatesFormat}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  PlrCarrierModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const PlrCarrierSeaModule = ({ jobData }) => {
    const sailData =
      jobData && jobData.length > 0 ? new Date(jobData[0].salingDate) : null;
    const sailDataFormat = sailData
      ? `${sailData.getDate()}/${sailData.getMonth() + 1
      }/${sailData.getFullYear()}`
      : "";

    const arrivalData =
      jobData && jobData.length > 0 ? new Date(jobData[0].arrivalDate) : null;
    const arrivalDataFormat = arrivalData
      ? `${arrivalData.getDate()}/${arrivalData.getMonth() + 1
      }/${arrivalData.getFullYear()}`
      : "";

    const mblDate =
      jobData && jobData.length > 0 ? new Date(jobData[0].mblDate) : null;
    const MblDatesFormat = mblDate
      ? `${mblDate.getDate()}/${mblDate.getMonth() + 1
      }/${mblDate.getFullYear()}`
      : "";

    const hblDate =
      jobData && jobData.length > 0 ? new Date(jobData[0].hblDate) : null;
    const hblDatesFormat = hblDate
      ? `${hblDate.getDate()}/${hblDate.getMonth() + 1
      }/${hblDate.getFullYear()}`
      : "";

    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Vessel/Voyage:
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  PLR:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  POL:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  POD:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  FPD:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MBL No:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].mblNo : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HBL No:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].hblNo : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  IGM No:
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].hblNo : ""}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Carrier:
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Sailing Date:
                </th>
                <td align="left" style={tdStyle}>
                  {sailDataFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Arrival Date:
                </th>
                <td align="left" style={tdStyle}>
                  {arrivalDataFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope :
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MBL Date:
                </th>
                <td align="left" style={tdStyle}>
                  {MblDatesFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HBL Date:
                </th>
                <td align="left" style={tdStyle}>
                  {hblDatesFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  IGM Date:
                </th>
                <td align="left" style={tdStyle}>
                  {hblDatesFormat}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  PlrCarrierSeaModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const CartingDetailsModule = ({ jobData }) => {
    const sailDateRaw = jobData?.[0]?.salingDate;
    const sailDate = sailDateRaw ? new Date(sailDateRaw) : null;

    const sailDateFormat =
      sailDate instanceof Date && !isNaN(sailDate)
        ? `${sailDate.getDate()}/${sailDate.getMonth() + 1
        }/${sailDate.getFullYear()}`
        : "";

    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "10px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Vessel/Voyage
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  PLR{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  POL{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  POD
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  FPD
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Carrier
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Sailing Date{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {sailDateFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  ETA
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  CartingDetailsModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const DeliveryConfirmationModule = ({ jobData }) => {
    const mblDate =
      jobData && jobData.length > 0 ? new Date(jobData[0].mblDate) : null;
    const MblDatesFormat = mblDate
      ? `${mblDate.getDate()}/${mblDate.getMonth() + 1
      }/${mblDate.getFullYear()}`
      : "";

    const hblDate =
      jobData && jobData.length > 0 ? new Date(jobData[0].hblDate) : null;
    const hblDatesFormat = hblDate
      ? `${hblDate.getDate()}/${hblDate.getMonth() + 1
      }/${hblDate.getFullYear()}`
      : "";

    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "10px", marginBottom: "10px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Vessel/Voyage
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Place of Receipt{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Port of Loading{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Port of Discharge{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Final Destination
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MAWB No
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HAWB No
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Carrier
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Depature Data
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Arrival Data
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MAWB Date
                </th>
                <td align="left" style={tdStyle}>
                  {MblDatesFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HAWD Date
                </th>
                <td align="left" style={tdStyle}>
                  {hblDatesFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Delivery Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  DeliveryConfirmationModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const RequestforPaymentModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      width: "20%",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      width: "30%",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Customer
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0
                    ? jobData[0].customerAddress
                    : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Shipper
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? (
                    <>
                      {jobData[0].shipperName}
                      <br />
                      {jobData[0].shipperAddress}
                    </>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Cust Ref No
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Consignee{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? (
                    <>
                      {jobData[0].consigneeName}
                      <br />
                      {jobData[0].consigneeAddress}
                    </>
                  ) : (
                    ""
                  )}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  RequestforPaymentModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const TransportInstructionsModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <div>
        <table
          className="tblhead"
          width="100%"
          border="0"
          cellSpacing="0"
          cellPadding="0"
          style={{ marginTop: "20px" }}
        >
          <tr>
            <td valign="top">
              <table
                className="tblhead"
                width="100%"
                border="0"
                cellSpacing="0"
                cellPadding="0"
              >
                <tr>
                  <th align="left" style={thStyle}>
                    Carrier
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Carrier D.O. No
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Carrier Ref. Date
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Pickup Details
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Delivery Details
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Empty Return Place{" "}
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <table
          className="tblhead"
          width="100%"
          border="0"
          cellSpacing="0"
          cellPadding="0"
          style={{ marginTop: "20px" }}
        >
          <tr>
            <td width="49%" valign="top">
              <table
                className="tblhead"
                width="100%"
                border="0"
                cellSpacing="0"
                cellPadding="0"
              >
                <tr>
                  <th align="left" style={thStyle}>
                    Cargo Type
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Commodity
                  </th>
                  <td align="left" style={tdStyle}>
                    {jobData && jobData.length > 0
                      ? jobData[0].commodityTypeName
                      : ""}
                  </td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Container Nos.
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p className="tblhead mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="tblhead mt-2 text-xs">Best Regards,</p>
      </div>
    );
  };
  TransportInstructionsModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const FreightCertificateModule = ({ jobData }) => {
    const thStyle = {
      width: "20%",
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "2px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "10px", marginBottom: "10px" }}
      >
        <tr>
          <td width="50%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  No of Packages
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].packageName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Cargo Type
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0
                    ? jobData[0].cargoTypeName
                    : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Commodity
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0
                    ? jobData[0].commodityTypeName
                    : ""}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Gross Weight
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].cargoWt : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Volume
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0
                    ? `${jobData[0].volume} ${jobData[0].volumeUnitName}`
                    : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Container Nos
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  FreightCertificateModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const FreightCertificateFutterModule = () => {
    return (
      <table
        className="text-xs text-left"
        style={{ width: "100%", marginTop: "1rem" }}
      >
        <tr className="border-b border-black mb-2">
          <th>Charge Description</th>
          <th style={{ paddingLeft: "1.25rem" }}>Quantity</th>
          <th style={{ paddingLeft: "1.25rem" }}>Rate</th>
          <th style={{ paddingLeft: "1.25rem" }}>Curent Ex. </th>
          <th style={{ paddingLeft: "1.25rem" }}>Rate</th>
          <th style={{ paddingLeft: "1.25rem" }}>Amount in Fc</th>
          <th style={{ paddingLeft: "1.25rem" }}>Total Amount</th>
        </tr>
        <tbody>
          <tr className="p-2 text-center"></tr>
          <tr></tr>
          <tr></tr>
          <tr></tr>
          <tr></tr>
          <tr></tr>
          <tr></tr>
        </tbody>
      </table>
    );
  };
  FreightCertificateFutterModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };
  // import FF AIR
  const FreightCertificateAirModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    const DepatureData =
      jobData && jobData.length > 0 ? new Date(jobData[0].salingDate) : null;
    const DepatureDataFormat = DepatureData
      ? `${DepatureData.getDate()}/${DepatureData.getMonth() + 1
      }/${DepatureData.getFullYear()}`
      : "";

    const arrivalData =
      jobData && jobData.length > 0 ? new Date(jobData[0].arrivalDate) : null;
    const arrivalDataFormat = arrivalData
      ? `${arrivalData.getDate()}/${arrivalData.getMonth() + 1
      }/${arrivalData.getFullYear()}`
      : "";

    const mblDate =
      jobData && jobData.length > 0 ? new Date(jobData[0].mblDate) : null;
    const MblDatesFormat = mblDate
      ? `${mblDate.getDate()}/${mblDate.getMonth() + 1
      }/${mblDate.getFullYear()}`
      : "";

    const hblDate =
      jobData && jobData.length > 0 ? new Date(jobData[0].hblDate) : null;
    const hblDatesFormat = hblDate
      ? `${hblDate.getDate()}/${hblDate.getMonth() + 1
      }/${hblDate.getFullYear()}`
      : "";

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Flght No
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Place of Origin
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Origin Airpot
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Destination Airpot
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Final destination
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MAWB No
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].mblNo : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HAWB No
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].hblNo : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  IGM No
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].hblNo : ""}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Airlines Name
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Depature Date
                </th>
                <td align="left" style={tdStyle}>
                  {DepatureDataFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Arrival Date
                </th>
                <td align="left" style={tdStyle}>
                  {arrivalDataFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MAWB Date
                </th>
                <td align="left" style={tdStyle}>
                  {MblDatesFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HAWB Date
                </th>
                <td align="left" style={tdStyle}>
                  {hblDatesFormat}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  IGM Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  FreightCertificateAirModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const FreightCargoAirModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Cargo Type
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Commodity
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0
                    ? jobData[0].commodityTypeName
                    : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Gross Weight
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].cargoWt : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Volumetric Weight
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Chargeable Weight
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  FreightCargoAirModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const DeliveryOrderAirModule = ({ jobData }) => {
    return (
      <div>
        <table
          className="tblhead"
          width="100%"
          border="0"
          cellSpacing="0"
          cellPadding="0"
          style={{ marginTop: "20px" }}
        >
          <tr>
            <td align="right" valign="top" style={{ maxWidth: "50%" }}>
              <table
                className="tblhead"
                border="0"
                cellSpacing="0"
                cellPadding="0"
              >
                <tr>
                  <th align="left" className="responsiveTh">
                    DO NO :
                  </th>
                  <td></td>
                </tr>
                <tr>
                  <th align="left" className="responsiveTh">
                    DATE :
                  </th>
                  <td></td>
                </tr>
                <tr>
                  <th align="left" className="responsiveTh">
                    IGM NO :
                  </th>
                  <td>
                    {jobData && jobData.length > 0 ? jobData[0].mblNo : "/"}
                  </td>
                </tr>
                <tr>
                  <th align="left" className="responsiveTh">
                    DATE :{" "}
                  </th>
                  <td></td>
                </tr>
                <tr>
                  <th align="left" className="responsiveTh">
                    Telephone :
                  </th>
                  <td></td>
                </tr>
                <tr>
                  <th align="left" className="responsiveTh">
                    ITEM No :
                  </th>
                  <td></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table>
          <tr>
            <th className="tblhead">DearSir,</th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <p>
          Please Deliver to ,the following packages which arrived Ex-Flight No.:
          -{" "}
        </p>
        <table
          className="mt-5 text-center text-xs"
          id="DeliveryOrderTable"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <tr>
            <th style={{ border: "2px solid black" }}>MAWB NO.</th>
            <th style={{ border: "2px solid black" }}>HAWB NO.:</th>
            <th style={{ border: "2px solid black" }}>NO OF PKG.</th>
            <th style={{ border: "2px solid black" }}>WEIGHT .</th>
            <th style={{ border: "2px solid black" }}>DESCRIPTION</th>
          </tr>
          <tr>
            <td style={{ border: "2px solid black" }} className="ps-5">
              {jobData && jobData.length > 0 ? jobData[0].mblNo : "/"}
            </td>
            <td style={{ border: "2px solid black" }} className="ps-5">
              {jobData && jobData.length > 0 ? jobData[0].hblNo : ""}
            </td>
            <td style={{ border: "2px solid black" }} className="ps-5">
              {jobData && jobData.length > 0 ? jobData[0].noOfPackages : ""}
            </td>
            <td style={{ border: "2px solid black" }} className="ps-5">
              {jobData && jobData.length > 0 ? jobData[0].volumeWt : ""}
            </td>
            <td style={{ border: "2px solid black" }} className="ps-5"></td>
          </tr>
        </table>
      </div>
    );
  };
  DeliveryOrderAirModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  //import FF sea
  const BookingConfirmationCustomerBothModule = ({ jobData }) => {
    return (
      <div>
        <HeaderShipperDataModule jobData={jobData} />
        <table className="tblhead text-xs text-left">
          <tr>
            <th className="tblhead" style={{ textAlign: "left" }}>
              Your Reference :
            </th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="tblhead mt-2 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <VesselEts jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <ShipperConsigneeTableModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <div>
          <ContainerTableModule jobData={jobData} />
        </div>
        <p className="tblhead mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="tblhead mt-2 text-xs">Best Regards,</p>
      </div>
    );
  };
  BookingConfirmationCustomerBothModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const DeliveryOrdeModule = () => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };
    return (
      <div>
        <table
          className="tblhead"
          width="100%"
          border="0"
          cellSpacing="0"
          cellPadding="0"
          style={{ marginTop: "20px" }}
        >
          <tr>
            <td width="49%" valign="top">
              <table
                className="tblhead"
                width="100%"
                border="0"
                cellSpacing="0"
                cellPadding="0"
              >
                <tr>
                  <th align="left" style={thStyle}>
                    DO Date:
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    To :-
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table
          className="tblhead"
          width="100%"
          border="0"
          cellSpacing="0"
          cellPadding="0"
          style={{ marginTop: "20px" }}
        >
          <tr>
            <td width="49%" valign="top">
              <table
                className="tblhead"
                width="100%"
                border="0"
                cellSpacing="0"
                cellPadding="0"
              >
                <tr>
                  <th align="left" style={thStyle}>
                    Dear Sir,
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Subject:
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <table
          className="tblhead"
          width="100%"
          border="0"
          cellSpacing="0"
          cellPadding="0"
          style={{ marginTop: "20px" }}
        >
          <tr>
            <td width="49%" valign="top">
              <table
                className="tblhead"
                width="100%"
                border="0"
                cellSpacing="0"
                cellPadding="0"
              >
                <tr>
                  <th align="left" style={thStyle}>
                    Master B/L No.:
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    House B/L No.:
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    IGM / Item No.:
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    IGM Date :
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Vessel/Voyage:
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    Consignee Name.:
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
                <tr>
                  <th align="left" style={thStyle}>
                    CHA Name.:
                  </th>
                  <td align="left" style={tdStyle}></td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <div>
          <p className="mt-3">
            Ref subject shipment, we have recieved the original house B /L and
            all our charges from the consignee. By all respects the above House
            B/L has been checked & found in order.The original master B/L is
            surrendered at port of loading and the shipment is checked and found
            in order.
          </p>
          <p className="mt-3">
            Please find enclosed herewith the copy of the MB/L and HB/L along
            with necessary endorsements, Kindly issue the delivery order to
            above mentioned consignee or his clearing agent.
          </p>
          <p className="mt-3">
            We indemnify the Shipping Line and their Agents against any
            Liability, Loss & penalty that may be imposed on you or your
            Principals. We agree to bear all Cost,Penalty, Fine & Claims that
            may occur for releasing this shipment to the concern as per our
            instruction
          </p>
          <p className="mt-3">Thanking you,</p>
          <p className="mt-3">Yours faithfully,</p>
          <p>For </p>
          <p className="mt-3">Authorised Signatory</p>
        </div>
      </div>
    );
  };
  DeliveryOrdeModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  // Export FF Air
  const BookingConfirmationCarrierModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Flight No.
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Place of Origin{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Origin Airport{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Destination Airport{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Final Destination
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  ETS
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  ETA
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };

  BookingConfirmationCarrierModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const CustomerConsigneeModule = ({ jobData }) => {
    const cellStyle = {
      paddingLeft: "5px",
      width: "30%",
      boxSizing: "border-box",
    };

    const headerStyle = {
      paddingLeft: "5px",
      width: "20%",
      boxSizing: "border-box",
      fontWeight: "bold",
      textAlign: "left",
    };

    const getContent = (field) =>
      jobData && jobData.length > 0 ? jobData[0][field] : "";

    return (
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          width: "100%",
          flexWrap: "wrap",
          marginBottom: "10px",
        }}
      >
        {/* Only render Customer if customerAddress exists */}
        <>
          <div style={headerStyle}>Customer</div>
          <div style={cellStyle}>{getContent("customerAddress")}</div>
        </>

        {/* Only render Consignee if either name or address exists */}
        <>
          <div style={headerStyle}>Consignee</div>
          <div style={cellStyle}>
            {getContent("consigneeName")}
            {getContent("consigneeName") && <br />}
            {getContent("consigneeAddress")}
          </div>
        </>
      </div>
    );
  };

  CustomerConsigneeModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const cargoTypeModule = ({ jobData }) => {
    return (
      <div>
        <div style={{ display: "inline-block" }}>
          <table className="mt-5 text-left text-xs text-left">
            <tr>
              <th>Cargo Type </th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>Commodity </th>
              <td className="ps-5">
                {jobData && jobData.length > 0
                  ? jobData[0].commodityTypeName
                  : ""}
              </td>
            </tr>
            <tr>
              <th>Port of Loading</th>
              <td className="ps-5">
                {jobData && jobData.length > 0 ? jobData[0].polName : ""}
              </td>
            </tr>
            <tr>
              <th>Port of Discharge</th>
              <td className="ps-5">
                {jobData && jobData.length > 0 ? jobData[0].podName : ""}
              </td>
            </tr>
            <tr>
              <th>Final Destination</th>
              <td className="ps-5">
                {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
              </td>
            </tr>
            <tr>
              <th>MAWB No</th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>HAWB No</th>
              <td className="ps-5"></td>
            </tr>
          </table>
        </div>
        <div style={{ display: "inline-block", marginLeft: "31%" }}>
          <table className="text-xs text-left">
            <tr>
              <th>Carrier</th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>Depature Data</th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>Arrival Data</th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>Movement Scope</th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>MAWB Date</th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>HAWD Date</th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>Delivery Date</th>
              <td className="ps-5"></td>
            </tr>
          </table>
        </div>
      </div>
    );
  };
  cargoTypeModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const GrossModule = ({ jobData }) => {
    return (
      <div>
        <div style={{ display: "inline-block" }}>
          <table className="mt-5 text-left text-xs text-left">
            <tr>
              <th>Cargo Type </th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>Commodity </th>
              <td className="ps-5">
                {jobData && jobData.length > 0
                  ? jobData[0].commodityTypeName
                  : ""}
              </td>
            </tr>
            <tr>
              <th>Gross Weight</th>
              <td className="ps-5">
                {jobData && jobData.length > 0 ? jobData[0].cargoWt : ""}
              </td>
            </tr>
            <tr>
              <th>Volumetric Weight </th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>Chargeable Weight</th>
              <td className="ps-5"></td>
            </tr>
          </table>
        </div>
        <div style={{ display: "inline-block", marginLeft: "32%" }}>
          <table className="text-xs text-left">
            <tr>
              <th>Cargo Type</th>
              <td className="ps-5"></td>
            </tr>
            <tr>
              <th>Commodity</th>
              <td className="ps-5">
                {jobData && jobData.length > 0
                  ? jobData[0].commodityTypeName
                  : ""}
              </td>
            </tr>
          </table>
        </div>
      </div>
    );
  };
  GrossModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const GrossModuleAir = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <div>
        <table
          className="tblhead"
          width="100%"
          border="0"
          cellSpacing="0"
          cellPadding="0"
          style={{ marginTop: "20px" }}
        >
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Cargo Type{" "}
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Commodity{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0
                    ? jobData[0].commodityTypeName
                    : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Gross Weight
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].cargoWt : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Volumetric Weight{" "}
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Chargeable Weight
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </table>
      </div>
    );
  };
  GrossModuleAir.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const BookingConfirmationCustomerModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Flight No.
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Place of Origin{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Origin Airport{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Destination Airport{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Final Destination
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Airline Name
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Departure Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Arrival Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  BookingConfirmationCustomerModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const DeliveryConfirmationAirModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Flight No.
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Place of Origin{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Origin Airport{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Destination Airport{" "}
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Final Destination
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MAWB No.
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HAWB No
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Airline Name
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Departure Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Arrival Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope{" "}
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MAWB Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HAWB Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Delivery Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  DeliveryConfirmationAirModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const PackageModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };
    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  No.Of Packages
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Gross Weight
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].cargoWt : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Volume
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  PackageModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const FreightCertificateEAirModule = ({ jobData }) => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Flight No.
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Place of Origin
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Origin Airport
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Destination Airport
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Final Destination
                </th>
                <td align="left" style={tdStyle}>
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MAWB No.
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HAWB No
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  IGM No.
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Airline Name
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Departure Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Arrival Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Movement Scope
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  MAWB Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  HAWB Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  IGM Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  FreightCertificateEAirModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const TransportInstructionsAirModule = () => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Carrier .
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Carrier Ref. No{" "}
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Pickup Details
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>
                  Factory Details{" "}
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  TransportInstructionsAirModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const TransporAirModule = () => {
    const thStyle = {
      width: "10%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
    };
    const tdStyle = {
      width: "30%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
    };

    return (
      <table
        className="tblhead"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
        style={{ marginTop: "20px" }}
      >
        <tr>
          <td width="49%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  Origin Airport
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              className="tblhead"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th align="left" style={thStyle}>
                  {" "}
                  Departure Date
                </th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  TransporAirModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const InstructionsAirModule = () => {
    return (
      <div>
        <table
          className="table-fixed text-xs  text-left custom-table"
          style={{ width: "100%" }}
        >
          <tbody>
            <tr>
              <th className="header">Flight No.</th>
              <td></td>
              <th className="header">Airline Name </th>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  InstructionsAirModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  // Job Sheet
  const JobContainerModule = ({ jobData }) => {
    const thStyle = {
      width: "15%",
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "600",
      border: "2px solid #A9A9A9",
      textAlign: "center",
    };

    const tdStyle = {
      width: "15%",
      textAlign: "left",
      padding: "5px",
      verticalAlign: "top",
      border: "2px solid #A9A9A9",
    };

    const tableStyle = {
      width: "100%",
      borderCollapse: "collapse",
    };

    const hoverHighlightStyle = {
      ":hover": {
        backgroundColor: "#f2f2f2",
      },
    };
    return (
      <>
        <div className="headerTable">
          <table style={tableStyle} className="text-xs tblhead">
            <thead>
              <tr>
                <th style={thStyle}>Container No</th>
                <th style={thStyle}>Size</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Gross Weight</th>
                <th style={thStyle}>Net Weight</th>
                <th style={thStyle}>Total No of Packages</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(jobData)
                ? jobData.map((job, jobIndex) =>
                  Array.isArray(job.tblJobContainer)
                    ? job.tblJobContainer.map((container, containerIndex) => (
                      <tr
                        key={`${jobIndex}-${containerIndex}`}
                        style={hoverHighlightStyle}
                      >
                        <td style={tdStyle}>
                          {container.containerNo || ""}
                        </td>
                        <td style={tdStyle}>{container.sizeName || ""}</td>
                        <td style={tdStyle}>{container.typeName || ""}</td>
                        <td style={tdStyle}>
                          {container.grossWt ? container.grossWt : ""}
                        </td>
                        <td style={tdStyle}>
                          {container.netWt ? container.netWt : ""}
                        </td>
                        <td style={tdStyle}>
                          {container.noOfPackages || ""}
                        </td>
                      </tr>
                    ))
                    : null
                )
                : null}
            </tbody>
          </table>
        </div>
      </>
    );
  };
  JobContainerModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  const JobDetailsModule = ({ jobData }) => {
    const thStyle = {
      textAlign: "left",
      padding: "5px 11px",
      verticalAlign: "top",
      fontWeight: "600",
      border: "2px solid #A9A9A9",
      width: "10%",
    };

    const tdStyle = {
      textAlign: "left",
      padding: "5px 11px",
      verticalAlign: "top",
      border: "2px solid #A9A9A9",
      width: "20%",
    };

    const tableStyle = {
      minWidth: "100%",
      borderCollapse: "collapse",
    };
    return (
      <>
        <div className="headerTable">
          <table style={tableStyle} className="table-fixed text-xs tblhead">
            <tbody>
              <tr>
                <th style={thStyle}>Job no:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0 ? jobData[0].jobNo : ""}
                </td>
                <th style={thStyle}>Job Date:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0
                    ? new Date(jobData[0].jobDate).toLocaleDateString("en-GB")
                    : ""}
                </td>
                <th style={thStyle}>Commodity:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0
                    ? jobData[0].commodityTypeName
                    : ""}
                </td>
              </tr>
              {/* Customer, Shipper, Consignee */}
              <tr>
                <th style={thStyle}>Customer:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0
                    ? jobData[0].customerAddress
                    : ""}
                </td>
                <th style={thStyle}>Shipper:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0
                    ? jobData[0].shipperAddress
                    : ""}
                </td>
                <th style={thStyle}>Consignee:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0
                    ? jobData[0].consigneeAddress
                    : ""}
                </td>
              </tr>
              {/* PLR, POL, POD */}
              <tr>
                <th style={thStyle}>PLR:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
                </td>
                <th style={thStyle}>POL:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0 ? jobData[0].polName : ""}
                </td>
                <th style={thStyle}>POD:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0 ? jobData[0].podName : ""}
                </td>
              </tr>
              {/* FPO, Departure Vessel, Arrival Vessel */}
              <tr>
                <th style={thStyle}>FPO:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
                </td>
                <th style={thStyle}>Departure Vessel:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  /
                </td>
                <th style={thStyle}>Arrival Vessel:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  /
                </td>
              </tr>
              {/* No of Packages, Gross weight, Volume */}
              <tr>
                <th style={thStyle}>No of Packages:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0 ? jobData[0].noOfPackages : ""}
                </td>
                <th style={thStyle}>Gross weight:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0 ? jobData[0].cargoWt : ""}
                </td>
                <th style={thStyle}>Volume:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0
                    ? `${jobData[0].volume} ${jobData[0].volumeUnitName}`
                    : ""}
                </td>
              </tr>
              {/* Sales Person */}
              <tr>
                <th style={thStyle}>Sales Person:</th>
                <td style={{ ...tdStyle }} colSpan="3">
                  {jobData && jobData.length > 0
                    ? jobData[0].salesPersonName
                    : ""}
                </td>
                {/* Placeholder for potentially additional data */}
                <th style={thStyle}></th>
                <td style={{ ...tdStyle }} colSpan="3"></td>
                <th style={thStyle}></th>
                <td style={{ ...tdStyle }} colSpan="3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    );
  };
  JobDetailsModule.propTypes = {
    jobData: PropTypes.arrayOf(PropTypes.object),
  };

  //Reports Structure
  const BookingConfirmationCustomerReport = () => (
    <div style={{ color: "black !important", width: "210mm", height: "297mm" }}>
      <CompanyImgModule />
      <div>
        <h1
          style={{
            text: "black",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Booking Confirmation &#40;Customer&#41;
        </h1>
        <BookingConfirmationCustomerBothModule jobData={jobData} />
      </div>
    </div>
  );

  const OnBoardConfirmationReport = () => (
    <div className="!text-black">
      <div
        id="105"
        className="mx-auto p-8"
        style={{ width: "210mm", height: "297mm" }}
      >
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{
              text: "black",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            <u>On Board Confirmation</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <table className="tblhead text-xs text-left">
          <tr>
            <th className="tblhead">Your Reference :</th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <div>
          <PlrCarrierModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <div>
          <ContainerTableModule jobData={jobData} />
        </div>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const LandingConfirmationReports = () => (
    <div className="!text-black">
      <div
        id="115"
        className="mx-auto p-8"
        style={{ width: "210mm", height: "297mm" }}
      >
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{
              text: "black",
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            <u>Landing Confirmation</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <table className="tblhead text-xs text-left">
          <tr>
            <th className="tblhead">Your Reference :</th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <div>
          <PlrCarrierModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <div>
          <ContainerTableModule jobData={jobData} />
        </div>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const PreAdviceReports = () => (
    <div className="!text-black">
      <div id="108" className="mx-auto p-8" style={{ height: "297mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Pre Advice</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <table className="text-xs text-left tblhead">
          <tr>
            <th>Your Reference :</th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <div>
          <PlrCarrierModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <div>
          <ContainerTableModule jobData={jobData} />
        </div>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const StuffingConfirmationReport = () => (
    <div className="!text-black">
      <div id="109" className="mx-auto p-8" style={{ height: "297mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Stuffing Confirmation</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <table className="text-xs text-left">
          <tr>
            <th>Your Reference :</th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <VesselModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <div>
          <ContainerTableModule jobData={jobData} />
        </div>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const CartingDetailsReports = () => (
    <div>
      <div
        id="103"
        style={{ color: "black !important", width: "210mm", height: "297mm" }}
        className="mx-auto p-8"
      >
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Carting Details</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <table className="text-left">
          <tr>
            <th>Your Reference :</th>
            <td></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="mt-5">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <div>
          <CartingDetailsModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const DeliveryConfirmationReports = () => (
    <div className="!text-black">
      <div
        id="102"
        style={{ color: "black !important", height: "297mm" }}
        className="mx-auto p-8"
      >
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Delivery Confirmation</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <table className="text-xs text-left">
          <tr>
            <th>Your Reference :</th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="mt-2 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <div>
          <DeliveryConfirmationModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const RequestforPaymentReport = () => (
    <div className="!text-black">
      <div id="106" className="mx-auto p-8" style={{ height: "297mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Request for Payment</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <table className="text-xs text-left">
          <tr>
            <th>Your Reference :</th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <div>
          <PlrCarrierModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <RequestforPaymentModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const TransportInstructionsReport = () => (
    <div className="!text-black">
      <div id="110" className="mx-auto p-8" style={{ height: "297mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Transport Instructions</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <div>
          <TransportInstructionsModule jobData={jobData} />
        </div>
      </div>
    </div>
  );

  const FreightCertificateReport = () => (
    <div className="!text-black">
      <div id="117" className="mx-auto p-8" style={{ height: "297mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Freight Certificate</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <FreightCertificateModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <PlrCarrierModule jobData={jobData} />
        </div>
        <div>
          <FreightCertificateFutterModule jobData={jobData} />
        </div>
        <div>
          <hr className="hrRow"></hr>
          <div>
            <table className="mt-2 text-left text-xs text-left">
              <tr>
                <th>Grand Total</th>
                <td></td>
              </tr>
            </table>
          </div>
          <hr className="hrRow mt-2"></hr>
          <p className="mt-2 text-xs">
            We trust we have served you with this information and kindly confirm
            the booking.
          </p>
          <p className="mt-2 text-xs">Best Regards,</p>
        </div>
      </div>
    </div>
  );
  //Import AIR FF
  const FreightCertificateAirReport = () => (
    <div>
      <div id="111" className="mx-auto p-8" style={{ height: "297mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Freight Certificate b</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <FreightCertificateAirModule jobData={jobData} />
        <hr className="hrRow "></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <FreightCargoAirModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <FreightCertificateFutterModule jobData={jobData} />
        <div>
          <hr className="hrRow"></hr>
          <hr className="hrRow mt-4"></hr>
          <div>
            <table className="mt-5 text-left text-xs text-left">
              <tr>
                <th>Grand Total</th>
                <td></td>
              </tr>
            </table>
          </div>
          <hr className="hrRow mt-4"></hr>
          <p className="mt-2 text-xs">
            We trust we have served you with this information and kindly confirm
            the booking.
          </p>
          <p className="mt-2 text-xs">Best Regards,</p>
        </div>
      </div>
    </div>
  );

  const DeliveryOrderAirReport = () => (
    <div>
      <div id="112" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            DELIVERY ORDER
          </h1>
        </div>
        <DeliveryOrderAirModule jobData={jobData} />
      </div>
    </div>
  );
  //Import FF sea
  const BookingConfirmationCustomerSeaReport = () => (
    <div>
      <div id="113" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Booking Confirmation</u>
          </h1>
          <BookingConfirmationCustomerBothModule jobData={jobData} />
        </div>
      </div>
    </div>
  );

  const DeliveryConfirmationSeaReports = () => (
    <div>
      <div id="119" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Delivery Confirmation</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <table className="text-xs text-left">
          <tr>
            <th>Your Reference :</th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <div>
          <DeliveryConfirmationModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightSeaModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const CargoArrivalNoteSeaReports = () => (
    <div>
      <div id="118" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Cargo Arrival Note</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <table className="text-xs text-left">
          <tr>
            <th>Your Reference :</th>
            <td className="ps-5"></td>
          </tr>
        </table>
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <PlrCarrierSeaModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <div>
          <ShipperConsigneeTableModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <div>
          <PackagesGrossWeightModule jobData={jobData} />
        </div>
        <hr className="hrRow"></hr>
        <div>
          <FreightCertificateFutterModule jobData={jobData} />
        </div>
        <div>
          <hr className="hrRow"></hr>
          <hr className="hrRow mt-4"></hr>
          <div>
            <table className="mt-5 text-left text-xs text-left">
              <tr>
                <th>Grand Total</th>
                <td></td>
              </tr>
            </table>
          </div>
          <hr className="hrRow mt-4"></hr>
          <p className="mt-2 text-xs">
            We trust we have served you with this information and kindly confirm
            the booking.
          </p>
          <p className="mt-2 text-xs">Best Regards,</p>
        </div>
      </div>
    </div>
  );

  const DeliveryOrdertoSLSeaReports = () => (
    <div>
      <div id="120" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <DeliveryOrdeModule jobData={jobData} />
      </div>
    </div>
  );
  //Export FF air
  const BookingConfirmationCarrierReports = () => (
    <div>
      <div id="121" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Booking Confirmation(Carrier)</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <BookingConfirmationCarrierModule />
        <hr className="hrRow"></hr>
        <CustomerConsigneeModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <GrossModuleAir jobData={jobData} />
        <hr className="hrRow"></hr>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const BookingConfirmationCustomerReports = () => (
    <div>
      <div id="122" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Booking Confirmation(Customer)</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <BookingConfirmationCustomerModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <GrossModuleAir jobData={jobData} />
        <hr className="hrRow"></hr>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const DeliveryConfirmationAirReports = () => (
    <div>
      <div id="123" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Booking Confirmation(Customer)</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <p className="mt-5 text-xs">
          We herewith confirm to have booked below mentioned shipment(s) as
          listed below.
        </p>
        <DeliveryConfirmationAirModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <PackageModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <p className="mt-2 text-xs">
          We trust we have served you with this information and kindly confirm
          the booking.
        </p>
        <p className="mt-2 text-xs">Best Regards,</p>
      </div>
    </div>
  );

  const FreightCertificateAirReports = () => (
    <div>
      <div
        id="124"
        className="container mx-auto p-8"
        style={{ height: "297mm" }}
      >
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Freight Certificate</u>
          </h1>
        </div>
        <HeaderModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <FreightCertificateEAirModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <ShipperConsigneeTableModule jobData={jobData} />
        <hr className="hrRow"></hr>
        <GrossModuleAir jobData={jobData} />
        <hr className="hrRow"></hr>
        <FreightCertificateFutterModule jobData={jobData} />
        <div>
          <hr className="hrRow"></hr>
          <hr className="hrRow mt-4"></hr>
          <p className="mt-2 text-xs">
            We trust we have served you with this information and kindly confirm
            the booking.
          </p>
          <p className="mt-2 text-xs">Best Regards,</p>
        </div>
      </div>
    </div>
  );

  const InvoicingInstructionsReports = () => (
    <div>
      <div>
        <div id="125" className="mx-auto p-8" style={{ height: "282mm" }}>
          <CompanyImgModule />
          <div>
            <h1
              className="heading"
              style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
            >
              <u>Invoicing Instructions</u>
            </h1>
            <HeaderModule jobData={jobData} />
            <hr className="hrRow"></hr>
            <p className="mt-5 text-xs">
              We herewith confirm to have booked below mentioned shipment(s) as
              listed below.
            </p>
            <FreightCertificateEAirModule jobData={jobData} />
            <hr className="hrRow"></hr>
            <ShipperConsigneeTableModule jobData={jobData} />
            <hr className="hrRow"></hr>
            <GrossModuleAir jobData={jobData} />
            <hr className="hrRow"></hr>
            <div>
              <p className="mt-2 text-xs">
                We trust we have served you with this information and kindly
                confirm the booking.
              </p>
              <p className="mt-2 text-xs">Best Regards,</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const preAdviceAirReport = () => (
    <div>
      <div id="126" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Pre Advice</u>
          </h1>
          <div>
            <HeaderModule jobData={jobData} />
            <hr className="hrRow"></hr>
            <p className="mt-5 text-xs">
              We herewith confirm to have booked below mentioned shipment(s) as
              listed below.
            </p>
            <FreightCertificateEAirModule jobData={jobData} />
            <hr className="hrRow"></hr>
            <ShipperConsigneeTableAirModule jobData={jobData} />
            <ShipperConsigneeTableModule jobData={jobData} />
            <hr className="hrRow"></hr>
            <GrossModuleAir jobData={jobData} />
            <hr className="hrRow"></hr>
            <div>
              <p className="mt-2 text-xs">
                We trust we have served you with this information and kindly
                confirm the booking.
              </p>
              <p className="mt-2 text-xs">Best Regards,</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  //last done
  const RequestforPaymentCustomerReport = () => (
    <div>
      <div id="127" className="mx-auto p-8" style={{ height: "282mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Request for Payment(Customer)</u>
          </h1>
          <HeaderModule jobData={jobData} />
          <hr className="hrRow"></hr>
          <p className="mt-5 text-xs">
            We herewith confirm to have booked below mentioned shipment(s) as
            listed below.
          </p>
          <FreightCertificateEAirModule jobData={jobData} />
          <hr className="hrRow"></hr>
          <ShipperConsigneeTableAirModule jobData={jobData} />
          <ShipperConsigneeTableModule jobData={jobData} />
          <hr className="hrRow"></hr>
          <GrossModuleAir jobData={jobData} />
          <hr className="hrRow"></hr>
          <div>
            <p className="mt-2 text-xs">
              We trust we have served you with this information and kindly
              confirm the booking.
            </p>
            <p className="mt-2 text-xs">Best Regards,</p>
          </div>
        </div>
      </div>
    </div>
  );

  const TransportInstructionsAirReport = () => (
    <div>
      <div id="128" className="mx-auto p-8" style={{ height: "297mm" }}>
        <CompanyImgModule />
        <div>
          <h1
            className="heading"
            style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
          >
            <u>Transport Instructions</u>
          </h1>
          <hr className="hrRow"></hr>
          <p className="mt-5 text-xs">
            We herewith confirm to have booked below mentioned shipment(s) as
            listed below.
          </p>
          <TransportInstructionsAirModule jobData={jobData} />
          <TransporAirModule jobData={jobData} />
          <hr className="hrRow"></hr>
        </div>
      </div>
    </div>
  );

  const JobChargeModule = ({ jobData, voucherData }) => {
    const tableStyle = {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "10px",
    };

    const headerStyle = {
      backgroundColor: "#e0e0e0",
      color: "#000",
      border: "2px solid #707070",
      padding: "8px",
      textAlign: "center",
    };

    const cellStyle = {
      border: "2px solid #707070",
      padding: "8px",
      textAlign: "center",
    };
    let totalRevenueProvisional = 0;
    let totalCostProvisional = 0;
    let totalRevenueActual = 0;
    let totalCostActual = 0;

    let allVoucherDetails = [];

    // Flatten the array of arrays into a single array of voucher details
    voucherData?.forEach((voucher) => {
      voucher.tblVoucherLedger?.forEach((ledger) => {
        allVoucherDetails.push(...ledger.tblVoucherLedgerDetails);
      });
    });

    // Assuming jobData and voucherData are arrays of job charges.
    // If the structures are different, you will need to adjust the mapping logic accordingly.
    return (
      <>
        <style>{`
        .table-fixed tbody tr:hover {
          background-color: #f2f2f2;
        }
      `}</style>
        <div>
          <table style={tableStyle} className="table-fixed text-xs">
            <thead>
              <tr>
                <th rowSpan="2" style={headerStyle}>
                  Charge Name
                </th>
                <th colSpan="4" style={headerStyle}>
                  Provisional
                </th>
                <th colSpan="4" style={headerStyle}>
                  Actual
                </th>
              </tr>
              <tr>
                <th style={headerStyle}>Revenue</th>
                <th style={headerStyle}>Cost</th>
                <th style={headerStyle}>Profit</th>
                <th style={headerStyle}>Neutral</th>
                <th style={headerStyle}>Revenue</th>
                <th style={headerStyle}>Cost</th>
                <th style={headerStyle}>Profit</th>
                <th style={headerStyle}>Neutral</th>
              </tr>
            </thead>
            <tbody>
              {jobData &&
                jobData.map(
                  (job, jobIndex) =>
                    job.tblJobCharge &&
                    job.tblJobCharge.map((charge, chargeIndex) => {
                      const profitProvisional =
                        (charge.sellAmount || 0) - (charge.buyAmount || 0);
                      totalRevenueProvisional += charge.sellAmount || 0;
                      totalCostProvisional += charge.buyAmount || 0;

                      // For actual amounts, use similar logic as above.
                      // totalRevenueActual += charge.actualSellAmount || 0;
                      // totalCostActual += charge.actualBuyAmount || 0;

                      // Get corresponding voucher details
                      const voucherDetail =
                        allVoucherDetails[chargeIndex] || {};
                      const revenueActual = voucherDetail.creditAmount || 0;
                      const costActual = voucherDetail.debitAmount || 0;
                      const profitActual = revenueActual - costActual;

                      // Sum up actual totals
                      totalRevenueActual += revenueActual;
                      totalCostActual += costActual;

                      return (
                        <tr key={`job-${jobIndex}-charge-${chargeIndex}`}>
                          <td style={cellStyle}>{charge.chargeName || "/"}</td>
                          <td style={cellStyle}>{charge.sellAmount || "/"}</td>
                          <td style={cellStyle}>{charge.buyAmount || "/"}</td>
                          <td style={cellStyle}>{profitProvisional || "/"}</td>
                          <td style={cellStyle}></td>
                          {/* Actual columns can be filled in when you have the data */}
                          <td style={cellStyle}>{revenueActual}</td>
                          <td style={cellStyle}>{costActual}</td>
                          <td style={cellStyle}>{profitActual}</td>
                          <td style={cellStyle}></td>{" "}
                          {/* Neutral - placeholder */}{" "}
                          {/* This is for 'Neutral' which you haven't defined */}
                          {/* < {totalRevenueActual} , {totalCostActual} , {totalProfitActual}  > */}
                        </tr>
                      );
                    })
                )}
            </tbody>
            <tfoot>
              <tr>
                <th style={cellStyle}>Grand Total:</th>
                <td style={cellStyle}>{totalRevenueProvisional}</td>
                <td style={cellStyle}>{totalCostProvisional}</td>
                <td style={cellStyle}>
                  {totalRevenueProvisional - totalCostProvisional}
                </td>
                {/* Actual totals can be added when you have the data */}
                <td style={cellStyle}>/</td>
                <td style={cellStyle}>{totalRevenueActual}</td>
                <td style={cellStyle}>{totalCostActual}</td>
                <td style={cellStyle}>
                  {totalRevenueActual - totalCostActual}
                </td>
                <td style={cellStyle}>/</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </>
    );
  };
  JobChargeModule.propTypes = {
    jobData: PropTypes.object.isRequired,
    voucherData: PropTypes.object.isRequired,
  };

  const JobSheetSeaReport = () => (
    <div className="!text-black">
      <div id="129" className="mx-auto p-8" style={{ height: "297mm" }}>
        <CompanyImgModule />
        <div className="flex justify-center">
          <div
            className="mt-5 text-xs"
            style={{ width: "30%", backgroundColor: "#e0e0e0" }}
          >
            <h1
              className="heading pt-2 pb-2"
              style={{ text: "black", textAlign: "center", fontWeight: "bold" }}
            >
              Job Cost Sheet
            </h1>
          </div>
        </div>
        <div
          className="mt-5 mb-3 text-xs"
          style={{ width: "30%", backgroundColor: "#e0e0e0" }}
        >
          <h2 className="font-semibold px-3 py-1 ">Job Details: </h2>
        </div>
        <JobDetailsModule jobData={jobData} />
        <div
          className="mt-5 mb-3 text-xs "
          style={{ width: "30%", backgroundColor: "#e0e0e0" }}
        >
          <h2 className=" font-semibold px-3 py-1 ">Container Details :</h2>
        </div>
        <JobContainerModule jobData={jobData} />
        <div
          className="mt-3 text-xs "
          style={{ width: "30%", backgroundColor: "#e0e0e0" }}
        >
          <h2 className="font-semibold px-3 py-1">Charge Details :</h2>
        </div>
        {voucherData && (
          <JobChargeModule jobData={jobData} voucherData={voucherData} />
        )}
      </div>
    </div>
  );

  const BlPrint = ({ jobData }) => {
    console.log("=>>", jobData);
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
                {jobData && jobData.length > 0 && jobData[0].blStatus === "D"
                  ? "Draft"
                  : jobData && jobData.length > 0 && jobData[0].blTypeName}
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
                    width: "50%",
                  }}
                >
                  {jobData && jobData.length > 0 ? jobData[0].shipperName : ""}{" "}
                  <br />
                  {jobData && jobData.length > 0
                    ? jobData[0].shipperAddress
                    : ""}
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
                    width: "50%",
                  }}
                >
                  {jobData && jobData.length > 0
                    ? jobData[0].consigneeName
                    : ""}{" "}
                  <br />
                  {jobData && jobData.length > 0
                    ? jobData[0].consigneeAddress
                    : ""}
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
                    width: "50%",
                  }}
                >
                  {jobData && jobData.length > 0
                    ? jobData[0].notifyPartyName
                    : ""}{" "}
                  <br />
                  {jobData && jobData.length > 0
                    ? jobData[0].notifyPartyAddress
                    : ""}
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
                    {jobData && jobData.length > 0 ? jobData[0].blNo : ""}
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
                      {jobData && jobData.length > 0
                        ? jobData[0].preCarriage
                        : ""}
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
                      {jobData && jobData.length > 0
                        ? jobData[0].polVesselText
                        : ""}{" "}
                      /{" "}
                      {jobData && jobData.length > 0
                        ? jobData[0].polVoyageText
                        : ""}
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
                      {jobData && jobData.length > 0 ? jobData[0].fpdName : ""}
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
                      {jobData && jobData.length > 0 ? jobData[0].plrName : ""}
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
                      {jobData && jobData.length > 0 ? jobData[0].polName : ""}
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
                      {jobData && jobData.length > 0 ? jobData[0].podName : ""}
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
                    width: "50%",
                  }}
                >
                  {jobData && jobData.length > 0
                    ? jobData[0].notifyPartyName
                    : ""}{" "}
                  <br />
                  {jobData && jobData.length > 0
                    ? jobData[0].notifyPartyAddress
                    : ""}
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
                    {jobData && jobData.length > 0
                      ? jobData[0].transportMode
                      : ""}
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
            {jobData && jobData.length > 0 && jobData[0].blStatus === "D" && (
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
                {jobData && jobData.length > 0
                  ? jobData[0].containerDetails
                  : ""}
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
                {jobData && jobData.length > 0
                  ? jobData[0].marksAndNosDetails
                  : ""}
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
                {jobData && jobData.length > 0
                  ? jobData[0].goodsDescDetails
                  : ""}
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
                {jobData && jobData.length > 0 ? jobData[0].cargoWt : ""}{" "}
                {jobData && jobData.length > 0 ? jobData[0].weightUnit : ""}
                <br />
                <br />
                Net Weight:
                <br />
                {jobData && jobData.length > 0 ? jobData[0].volume : ""}{" "}
                {jobData && jobData.length > 0 ? jobData[0].weightUnit : ""}{" "}
                <br />
                <br />
                {/* {jobData?.shippedOnboardDate} */}
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
                {jobData && jobData.length > 0 ? jobData[0].volume : ""}{" "}
                {jobData && jobData.length > 0 ? jobData[0].volumeUnitName : ""}{" "}
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
            {jobData && jobData.length > 0 && jobData[0].blStatus === "F" && (
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
            <p className="mt-1">{jobData?.freightPrepaidCollect}</p>
          </div>
          <div className="flex-1 border-l border-black p-2">
            <p className="font-bold">Freight Payable at</p>
            <p className="mt-1">
              {jobData && jobData.length > 0
                ? jobData[0].freightpayableAtText
                : ""}
            </p>
          </div>
          <div className="flex-1 border-l border-black p-2">
            <p className="font-bold">Number of Original MTDs</p>
            <p className="mt-1">{jobData?.noOfBl}</p>
          </div>
          <div className="flex-1 border-l border-black p-2">
            <p className="font-bold">Place and Date of Issue</p>
            <p className="mt-1">
              {jobData?.blIssuePlaceText} {jobData?.blIssueDate}
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
              For {""}{" "}
              {jobData && jobData.length > 0 ? jobData[0].companyName : ""}
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
                  B/L No : {jobData?.blNo}
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
                  Vessel Name : {jobData?.oceanVessel?.Name}
                  <span className="ms-2">{jobData?.voyageNo?.Name}</span>
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
                  {jobData?.descOfGoodsDetaislAttach}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const BlAttachmentPrint = ({
    jobData,
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
              {jobData?.[0]?.blNo || ""}
            </p>
          </div>
          <div className="flex-1 uppercase border-l border-black">
            <p
              className="pt-1 pb-1 pl-1 !text-black"
              style={{ fontSize: "9px" }}
            >
              {jobData?.[0]?.polVesselText || ""}
            </p>
          </div>
          <div className="flex-1 uppercase border-l border-black">
            <p
              className="pt-1 pb-1 pl-1 !text-black"
              style={{ fontSize: "9px" }}
            >
              {jobData?.[0]?.polVoyageText || ""}
            </p>
          </div>
        </div>

        {(containerLines.length || marksLines.length || goodsLines.length) && (
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
                { label: "Container No(s)", basis: "14%" },
                { label: "Marks and No. (s)", basis: "14%" },
                {
                  label:
                    "No. of Pkgs., Kinds of Pkgs., General Description of Goods",
                  basis: "50%",
                },
                { label: "Gross Weight / No of Packages", basis: "22%" },
              ].map(({ label, basis }) => (
                <div key={label} style={{ flexBasis: basis, padding: "5px" }}>
                  <p
                    className="!text-black font-normal"
                    style={{
                      fontWeight: "bold",
                      fontSize: "8px",
                      textAlign: "center",
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
              <div style={{ flexBasis: "14%", padding: "5px" }}>
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
              </div>
              {/* Marks lines */}
              <div style={{ flexBasis: "14%", padding: "5px" }}>
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
              <div style={{ flexBasis: "50%", padding: "5px" }}>
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
              <div
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
                  {jobData?.[0]?.cargoWt || ""} {jobData?.[0]?.weightUnit || ""}{" "}
                  / {jobData?.[0]?.noOfPackages || ""}{" "}
                  {jobData?.[0]?.package || ""}
                </pre>
              </div>
            </div>
          </>
        )}
      </>
    );
  };

  const rptBlDraft = () => (
    <div className="!text-black">
      <div id="155" className="mx-auto">
        <BlPrint jobData={jobData} />
      </div>
    </div>
  );

  const rptBlAttachment = () => (
    <div className="!text-black">
      <div id="155" className="mx-auto">
        <BlAttachmentPrint jobData={jobData} />
      </div>
    </div>
  );

  //Komal
  const JobSheetProvisional = () => {
    return (
      <div className="a4-landscape print-area">
        <CompanyImgModule />
        <div className="flex justify-center">
          <div className=" mt-5 w-[25%] text-center font-bold text-black text-sm ">
            <h1 className="py-0.1">Job Cost Sheet</h1>
          </div>
        </div>
        <div className=" mt-5 w-[25%] text-left font-bold text-black text-sm ">
          <h2 className="py-0.1">Job Details :</h2>
        </div>
        <JobDetailsProvisionalModule jobData={jobData} />

        <div className="mt-5 w-[25%] text-left font-bold text-black text-sm ">
          <h3 className="py-0.1">Container Details :</h3>
        </div>
        <JobContainerProvisionalModule jobData={jobData} />

        <div className="mt-5 w-[25%] text-left font-bold text-black text-sm ">
          <h3 className="py-0.1">Charge Details :</h3>
        </div>
        <JobChargeProvisionalModule jobData={jobData} />
      </div>
    );
  };

  const CROShipper = (depotData) => {
    const norm = (s) => (s ?? "").toString().trim().toLowerCase();

    return (
      <div className="a4-landscape print-area">
        <CompanyImgModule />
        {/* Header */}

        <div>
          <h1 className="text-center font-bold text-sm text-black mt-2">
            Tank Release Order To Shipper
          </h1>
          <div className="mt-2" style={{ width: "100%", display: "flex" }}>
            <div style={{ width: "55%" }}>
              <div
                style={{ width: "55%" }}
                className="flex items-end justify-start"
              >
                <p
                  className="text-black font-bold mr-2"
                  style={{ fontSize: "10px" }}
                >
                  To, <br />
                  {depotData && depotData.length > 0 ? depotData[0].depot : ""}
                  <br />
                  {depotData && depotData.length > 0
                    ? depotData[0].depotAddress
                    : ""}
                  <br />
                </p>
              </div>
            </div>
            <div style={{ width: "45%" }}>
              <div style={{ width: "100%", display: "flex" }}>
                <p style={{ width: "35%" }} className="text-left font-semibold">
                  BOOKING PARTY:
                </p>
                <p style={{ width: "65%" }} className="text-left">
                  {jobData && jobData.length > 0 ? jobData[0].customerName : ""}
                </p>
              </div>
              <div style={{ width: "100%", display: "flex" }}>
                <p style={{ width: "35%" }} className="text-left font-semibold">
                  BOOKING NUMBER:
                </p>
                <p style={{ width: "65%" }} className="text-left">
                  {jobData && jobData.length > 0 ? jobData[0].jobNo : ""}
                </p>
              </div>
              <div style={{ width: "100%", display: "flex" }}>
                <p style={{ width: "35%" }} className="text-left font-semibold">
                  DATE:
                </p>
                <p style={{ width: "65%" }} className="text-left">
                  {jobData && jobData.length > 0
                    ? formatDateToYMD(jobData[0].jobDate)
                    : ""}
                </p>
              </div>
              <div style={{ width: "100%", display: "flex" }}>
                <p style={{ width: "35%" }} className="text-left font-semibold">
                  VALIDITY DATE:
                </p>
                <p style={{ width: "65%" }} className="text-left">
                  {getValidTillDate(
                    jobData?.[0]?.jobDate,
                    jobData?.[0]?.croValidDays
                  )}
                </p>
              </div>
            </div>
          </div>
          <p className="text-left text-xs mt-2">
            The following containers are assigned to the below booking party for
            stuffing arrangement.
          </p>
          <div className="text-black text-center text-xs mt-2 border-t border-l pt-1 pb-1 bg-gray-300 border-r font-semibold border-black">
            <p style={{ fontSize: "9px" }}>RELEASE DETAILS</p>
          </div>

          <table className="w-full border border-black text-[9px] text-xs">
            <thead style={{ fontSize: "9px" }}>
              <tr className="border-t border-b border-black bg-gray-200">
                <th className="w-1/6 text-center border-r border-l border-black font-semibold py-1 text-black">
                  CONTAINER NUMBER
                </th>
                <th className="w-1/6 text-center border-r border-black font-semibold py-1 text-black">
                  CONTAINER TYPE
                </th>
                <th className="w-1/6 text-center border-r border-black font-semibold py-1 text-black">
                  CAPACITY
                </th>
                <th className="w-1/6 text-center border-r border-black font-semibold py-1 text-black">
                  TARE WEIGHT
                </th>
                <th className="w-1/6 text-center border-r border-black font-semibold py-1 text-black">
                  MINIMUM FILLING
                </th>
                <th className="w-1/6 text-center border-r border-black font-semibold py-1 text-black">
                  MAXIMUM FILLING
                </th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "9px" }}>
              {(() => {
                // figure out target depot from depotData (same as first table)
                const targetDepot = Array.isArray(depotData)
                  ? depotData[0]?.depot
                  : typeof depotData === "string"
                    ? depotData
                    : depotData?.depot;

                // build filtered rows
                const rows = (Array.isArray(jobData) ? jobData : []).flatMap(
                  (job, jobIndex) =>
                    (Array.isArray(job.tblJobContainer)
                      ? job.tblJobContainer
                      : []
                    )
                      .filter((container) =>
                        targetDepot
                          ? norm(container.depot) === norm(targetDepot)
                          : true
                      )
                      .map((container, containerIndex) => (
                        <tr
                          key={`${jobIndex}-${containerIndex}`}
                          className="border-t border-b border-black"
                        >
                          <td className="w-1/6 text-center border-l border-r border-black py-1 text-black">
                            {container.containerNo || ""}
                          </td>
                          <td className="w-1/6 text-center border-r border-black py-1 text-black">
                            {container.sizeName || ""} /{" "}
                            {container.typeName || ""}
                          </td>
                          <td className="w-1/6 text-center border-r border-black py-1 text-black">
                            {container.capacity || ""}
                          </td>
                          <td className="w-1/6 text-center border-r border-black py-1 text-black">
                            {container.tareWt || ""}{" "}
                            {container.tareWtUnitCode || ""}
                          </td>
                          <td className="w-1/6 text-center border-r border-black py-1 text-black">
                            80%(+-5%)
                          </td>
                          <td className="w-1/6 text-center border-r border-black py-1 text-black">
                            90%(+-5%)
                          </td>
                        </tr>
                      ))
                );

                // fallback if no matching rows
                if (rows.length === 0) {
                  return (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-2 border-t border-b border-black"
                      >
                        {targetDepot
                          ? `No containers found for depot: ${targetDepot}`
                          : "No container data available."}
                      </td>
                    </tr>
                  );
                }

                return rows;
              })()}
            </tbody>
          </table>

          <table className="w-full border border-black text-[9px] mt-2">
            <thead>
              <tr className="border-t border-b border-black"></tr>
              <th className="w-1/3 text-center border-r border-black font-semibold py-1 text-black text-[9px] text-xs">
                GOODS DESCRIPTION
              </th>
              <th className="w-1/3 text-center border-r border-l border-black font-semibold py-1 text-black text-[9px] text-xs">
                VESSEL/VOYAGE / IMO (Lloyds)
              </th>
            </thead>
            <tbody>
              <tr className="border-t border-b border-black"></tr>
              <th className="w-1/3 text-center border-r border-black font-normal py-1 text-black text-[9px] text-xs">
                {jobData && jobData.length > 0 ? jobData[0].commodityText : ""}
              </th>
              <th className="w-1/3 text-center border-r border-l font-normal border-black py-1 text-black text-[9px] text-xs">
                {jobData && jobData.length > 0 ? jobData[0].polVessel : ""}
                {" / "}
                {jobData && jobData.length > 0 ? jobData[0].polVoyage : ""}
                {" / "}
                {jobData && jobData.length > 0 ? jobData[0].imo : ""}
              </th>
            </tbody>
          </table>
        </div>

        <div>
          {/* <div style={{ width: "100%", display: "flex" }}>
            <div style={{ width: "17%" }}>
              <p className="text-left font-semibold text-xs mt-2">
                GOODS DESCRIPTION:
              </p>
            </div>
            <div style={{ width: "83%" }}>
              <p className="text-left text-xs mt-2">
                {jobData && jobData.length > 0 ? jobData[0].commodityText : ""}
              </p>
            </div>
          </div> */}
          <div style={{ width: "100%", display: "flex" }}>
            <div style={{ width: "30%" }}>
              <p className="text-left font-semibold text-xs mt-2">
                SPECIAL REMARKS TO CUSTOMER:
              </p>
            </div>
            <div style={{ width: "70%" }}>
              <p className="text-left text-xs mt-2">
                {jobData && jobData.length > 0 ? jobData[0].remarks : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs">
          <p className="text-left font-semibold text-xs mt-2">
            Terms and Conditions:
          </p>
          <p className="text-xs mt-1">
            1) Tanks carrying dangerous cargoes should strictly comply with the
            Regulations laid down in the IMDG code. Any fines/penalties for
            non-conformity of IMDG regulations for shipment of dangerous cargoes
            shall be recovered from shipper.
          </p>
          <p className="text-xs mt-1">
            2) Please submit relevant shipping bill "out of charge" to LINE
            surveyors.
          </p>
          <p className="text-xs mt-1">
            3) Cargo not to exceed payload as indicated on tank. Carrier will
            not be responsible for stuffing cargo over rated capacity.
          </p>
          <p className="text-xs mt-1">
            4) Shipper will be liable for any damage to the tank whatsoever due
            to over filling / overweight or any accident whilst in his custody.
          </p>
          <p className="text-xs mt-1">
            5) Shipper at the time of taking delivery of tank from depot to
            inspect Tank in sound condition and should "RETURN" the tank after
            filling of cargo directly into the terminal in sound condition for
            the nominated carrier / vessel.
          </p>
          <p className="text-xs mt-1">
            6) Please submit bill of lading draft on email
            id:tankexp@sartransport.com as soon as the tank is picked up for
            factory stuffing.
          </p>
          <p className="text-xs mt-1">
            7) Bill of Lading must be collected within 3 working days from the
            vessel departure. From the 4th day onward, a Late Documentation Fee
            will be charged at the time the Bill of Lading.
          </p>
          <p className="text-xs mt-1">
            8) We are accepting payment by RTGS/NEFT only. <br />
            Bank Details: As mentioned on INVOICE
          </p>
          <p className="text-xs mt-1">
            9) Ensure the empty container received from yard is in clean and
            sound condition. Costs for any subsequent rejection will be for your
            account.
          </p>
          <p className="text-xs mt-1">
            10) Any loss or damage to the tank container while in custody of
            shipper, transporter, forwarder shall be fully indemnified for
            repair/replacement/reimbursement as notified by the owner.
          </p>
          <p className="text-xs mt-1">
            11) Shipper / Forwarder will fully indemnify the line from any
            claims for costs, charges, legal expenses, arising from death or
            injury caused by any person, or damage to any property arising out
            of use.
          </p>
          <p className="text-xs mt-1">
            12) Please ensure to stuff the cargo as per port of discharge
            mentioned in the DO, failing which all the consequences will be on
            your account
          </p>
          <p className="text-xs mt-1">
            13) Any customs documentation/Costs / Customs Duty/ Inspection /
            Taxes /VAT / Overweight permits / drop & pull/ heating prior to
            delivery / Chassis Hire/ Trailer detention etc if any on shipper /
            consignee / freight payer account.
          </p>
          <p className="text-xs mt-1">
            14) Repairs to the tank container due to damage caused whilst in the
            Shipper / Consignee / Frt Forwarders custody.
          </p>
          <p className="text-xs mt-1">
            15) Please ensure to stuff the cargo as per port of discharge
            mentioned in the DO, failing which all the consequences will be on
            your account
          </p>
          <p className="text-xs mt-1">
            16) Replacement of any missing part of our equipment / damage tank
            container, due to damage, loss, incurred whilst the tank In
            shipper's and / or consignee's control. Standard local cleaning
            charges as per provided SDS for the cargo carried, after discharge
            at destination. For upto a maximum 20 Litres of residual cargo.
          </p>
          <p className="text-xs mt-1">
            17) POL/POD Transport, Surveying Costs etc. If any charges incurred
            at pod and consignee refuses to pay the additional charges, the
            shipper / freight payer agrees to settle all the charges with the
            agreed payment term. By placing export Delivery order / transport
            order based on this offer,you confirm that you have read, understood
            and accept, acknowledge the complete content including all terms &
            conditions on this Quote
          </p>
        </div>
      </div>
    );
  };

  const CRODEPOT = (depotData) => {
    console.log("cro", depotData);

    // ——— helpers ———
    const norm = (s) => (s ?? "").toString().trim().toLowerCase();
    const targetDepot = Array.isArray(depotData)
      ? depotData[0]?.depot
      : typeof depotData === "string"
        ? depotData
        : depotData?.depot;

    // Build filtered rows from jobData
    const rows = (Array.isArray(jobData) ? jobData : []).flatMap(
      (job, jobIndex) =>
        (Array.isArray(job.tblJobContainer) ? job.tblJobContainer : [])
          // keep only containers whose depot matches the selected depot
          .filter((container) =>
            targetDepot ? norm(container.depot) === norm(targetDepot) : true
          )
          .map((container, containerIndex) => ({
            key: `${jobIndex}-${containerIndex}`,
            job,
            container,
          }))
    );

    return (
      <div className="a4-landscape print-area">
        <CompanyImgModule />
        {/* Header */}

        <div>
          <h1 className="text-center font-bold text-sm text-black mt-2">
            Tank Release Order To Depot
          </h1>
          <div className="mt-2" style={{ width: "100%", display: "flex" }}>
            <div style={{ width: "55%" }}>
              <div
                style={{ width: "55%" }}
                className="flex items-end justify-start"
              >
                <p
                  className="text-black font-bold mr-2"
                  style={{ fontSize: "10px" }}
                >
                  To, <br />
                  {depotData && depotData.length > 0 ? depotData[0].depot : ""}
                  <br />
                  {depotData && depotData.length > 0
                    ? depotData[0].depotAddress
                    : ""}
                  <br />
                </p>
              </div>
            </div>
            <div style={{ width: "45%" }}>
              {/* <div style={{ width: "100%", display: "flex" }}>
                <p style={{ width: "35%" }} className="text-left font-semibold">
                  BOOKING PARTY:
                </p>
                <p style={{ width: "65%" }} className="text-left">
                  {jobData && jobData.length > 0 ? jobData[0].customerName : ""}
                </p>
              </div> */}
              <div style={{ width: "100%", display: "flex" }}>
                <p style={{ width: "35%" }} className="text-left font-semibold">
                  BOOKING NUMBER:
                </p>
                <p style={{ width: "65%" }} className="text-left">
                  {jobData && jobData.length > 0 ? jobData[0].jobNo : ""}
                </p>
              </div>
              <div style={{ width: "100%", display: "flex" }}>
                <p style={{ width: "35%" }} className="text-left font-semibold">
                  DATE:
                </p>
                <p style={{ width: "65%" }} className="text-left">
                  {jobData && jobData.length > 0
                    ? formatDateToYMD(jobData[0].jobDate)
                    : ""}
                </p>
              </div>
              <div style={{ width: "100%", display: "flex" }}>
                <p style={{ width: "35%" }} className="text-left font-semibold">
                  VALIDITY DATE:
                </p>
                <p style={{ width: "65%" }} className="text-left">
                  {getValidTillDate(
                    jobData?.[0]?.jobDate,
                    jobData?.[0]?.croValidDays
                  )}
                </p>
              </div>
            </div>
          </div>
          <p className="text-left text-xs mt-2">
            The following containers are assigned to the below booking party for
            stuffing arrangement.
          </p>
          <div className="text-black text-center text-xs mt-2 border-t border-l pt-1 pb-1 bg-gray-300 border-r font-semibold border-black">
            <p style={{ fontSize: "9px" }}>RELEASE DETAILS</p>
          </div>
          <table className="w-full border border-black text-[9px] text-xs">
            <thead style={{ fontSize: "9px" }}>
              <tr className="border-t border-b border-black">
                <th className="w-1/3 text-center border-r border-l border-black font-semibold py-1 text-black text-[9px] text-xs">
                  CONTAINER NUMBER
                </th>
                <th className="w-1/3 text-center border-r border-black font-semibold py-1 text-black text-[9px] text-xs">
                  CONTAINER TYPE
                </th>
                <th className="w-1/3 text-center border-r border-black font-semibold py-1 text-black text-[9px] text-xs">
                  Pickup date
                </th>
              </tr>
            </thead>

            <tbody style={{ fontSize: "9px" }}>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center py-2 border-t border-b border-black"
                  >
                    {targetDepot
                      ? `No containers found for depot: ${targetDepot}`
                      : "No container data available."}
                  </td>
                </tr>
              ) : (
                rows.map(({ key, container, job }) => (
                  <tr key={key} className="border-t border-b border-black">
                    <td className="w-1/3 text-center border-l border-r border-black py-1 text-black text-[9px]">
                      {container.containerNo || ""}
                    </td>
                    <td className="w-1/3 text-center border-r border-black py-1 text-black text-[9px]">
                      {(container.sizeName || "").toString()}
                      {" / "}
                      {(container.typeName || "").toString()}
                    </td>
                    <td className="w-1/3 text-center border-r border-black py-1 text-black text-[9px]">
                      {/* Prefer job-level pickupDate; fallback to first job’s pickupDate if needed */}
                      {job?.pickupDate
                        ? formatDateToYMD(job.pickupDate)
                        : jobData?.[0]?.pickupDate
                          ? formatDateToYMD(jobData[0].pickupDate)
                          : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div>
          <div style={{ width: "100%", display: "flex" }}>
            <div style={{ width: "30%" }}>
              <p className="text-left font-semibold text-xs mt-2">
                SPECIAL REMARKS TO CUSTOMER:
              </p>
            </div>
            <div style={{ width: "70%" }}>
              <p className="text-left text-xs mt-2">
                {jobData && jobData.length > 0 ? jobData[0].remarks : ""}
              </p>
            </div>
          </div>
        </div>
        <div className="text-xs">
          <p className="text-left font-semibold text-xs mt-2">
            Terms and Conditions:
          </p>
          <p className="text-xs mt-1">
            1) Any loss or damage to the tank container while in custody of
            depot shall be fully indemnified for
            repair/replacement/reimbursement as notified by the owner
          </p>
          <p className="text-xs mt-1">
            2) Depot will fully indemnify the line from any claims for costs,
            charges, legal expenses, arising from death or injury caused by any
            person, or damage to any property arisingout of use.
          </p>
          <p className="text-xs mt-1">
            3) Any customs documentation/Costs / Customs Duty/ Inspection /Taxes
            / VAT /Overweight permits / drop & pull/ heating prior to delivery /
            Chassis Hire / Trailer detentionetc if any on shipper / consignee /
            freight payer account.
          </p>
          <p className="text-xs mt-1">
            4) Repairs to the tank container due to damage caused whilst in the
            depot custody.
          </p>
          <p className="text-xs mt-1">
            5) Replacement of any missing part of our equipment/ damage tank
            container, due to damage, loss, incurred whilst the tank In depot
            control. Standard local cleaningcharges as per provided SDS for the
            cargo carried,after discharge at destination. For upto a maximum 20
            Litres of residual cargo.you confirm that you have read, understood
            and accept, acknowledge the complete content including all terms &
            conditions on this CRO/DO
          </p>
          <p className="text-xs mt-1">
            6): for any issue pls get in touch with mnr@sarlogisolutions.com
          </p>
        </div>
      </div>
    );
  };

  const JobDetailsProvisionalModule = ({ jobData }) => {
    if (!jobData || jobData.length === 0) return null;
    const job = jobData[0];

    const thStyle = {
      border: "1px solid black",
      padding: "4px",
      fontWeight: "bold",
      textAlign: "left",
      verticalAlign: "top",
      width: "10%",
    };

    const tdStyle = {
      border: "1px solid black",
      padding: "4px",
      textAlign: "left",
      verticalAlign: "top",
      width: "23%",
    };

    const tableStyle = {
      width: "100%",
      borderCollapse: "collapse",
    };

    return (
      <div className="text-xs mt-4 ">
        <div className="headerTable">
          <table
            style={tableStyle}
            className="table-fixed text-sm tblhead mt-1"
          >
            <tbody>
              <tr>
                <th style={thStyle}>Job no:</th>
                <td style={tdStyle} colSpan="3">
                  {job.jobNo || ""}
                </td>
                <th style={thStyle}>Job Date:</th>
                <td style={tdStyle} colSpan="3">
                  {job.jobDate
                    ? new Date(job.jobDate).toLocaleDateString("en-GB")
                    : ""}
                </td>
                <th style={thStyle}>Commodity:</th>
                <td style={tdStyle} colSpan="3">
                  {job.commodityTypeName || ""}
                </td>
              </tr>

              <tr>
                <th style={thStyle}>Customer:</th>
                <td style={tdStyle} colSpan="3">
                  {job.customerAddress || ""}
                </td>
                <th style={thStyle}>Shipper:</th>
                <td style={tdStyle} colSpan="3">
                  {job.shipperAddress || ""}
                </td>
                <th style={thStyle}>Consignee:</th>
                <td style={tdStyle} colSpan="3">
                  {job.consigneeAddress || ""}
                </td>
              </tr>

              <tr>
                <th style={thStyle}>PLR:</th>
                <td style={tdStyle} colSpan="3">
                  {job.plrName || ""}
                </td>
                <th style={thStyle}>POL:</th>
                <td style={tdStyle} colSpan="3">
                  {job.polName || ""}
                </td>
                <th style={thStyle}>POD:</th>
                <td style={tdStyle} colSpan="3">
                  {job.podName || ""}
                </td>
              </tr>

              <tr>
                <th style={thStyle}>FPO:</th>
                <td style={tdStyle} colSpan="3">
                  {job.fpdName || ""}
                </td>
                <th style={thStyle}>Departure Vessel:</th>
                <td style={tdStyle} colSpan="3">
                  /
                </td>
                <th style={thStyle}>Arrival Vessel:</th>
                <td style={tdStyle} colSpan="3">
                  /
                </td>
              </tr>

              <tr>
                <th style={thStyle}>No of Packages:</th>
                <td style={tdStyle} colSpan="3">
                  {job.noOfPackages || ""}
                </td>
                <th style={thStyle}>Gross weight:</th>
                <td style={tdStyle} colSpan="3">
                  {job.cargoWt || ""}
                </td>
                <th style={thStyle}>Volume:</th>
                <td style={tdStyle} colSpan="3">{`${job.volume || ""} ${job.volumeUnitName || ""
                  }`}</td>
              </tr>

              <tr>
                <th style={thStyle}>Sales Person:</th>
                <td style={tdStyle} colSpan="3">
                  {job.salesPersonName || ""}
                </td>
                <th style={thStyle}></th>
                <td style={tdStyle} colSpan="3"></td>
                <th style={thStyle}></th>
                <td style={tdStyle} colSpan="3"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const JobContainerProvisionalModule = ({ jobData }) => {
    const thStyle = {
      padding: "5px",
      verticalAlign: "top",
      fontWeight: "bold",
      border: "1px solid black",
      textAlign: "center",
    };

    const tdStyle = {
      padding: "5px",
      verticalAlign: "top",
      border: "1px solid black",
      textAlign: "left",
    };

    const tableStyle = {
      width: "100%",
      borderCollapse: "collapse",
    };

    return (
      <div className="headerTable mt-4">
        <table style={tableStyle} className="text-xs">
          <thead>
            <tr>
              <th style={thStyle}>Container No</th>
              <th style={thStyle}>Size</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Gross Weight</th>
              <th style={thStyle}>Net Weight</th>
              <th style={thStyle}>Total No. of Packages</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(jobData) &&
              jobData.map((job, jobIndex) =>
                Array.isArray(job.tblJobContainer)
                  ? job.tblJobContainer.map((container, containerIndex) => (
                    <tr key={`${jobIndex}-${containerIndex}`}>
                      <td style={tdStyle}>{container.containerNo || ""}</td>
                      <td style={tdStyle}>{container.sizeName || ""}</td>
                      <td style={tdStyle}>{container.typeName || ""}</td>
                      <td style={tdStyle}>
                        {container.grossWt
                          ? `${parseFloat(
                            container.grossWt
                          ).toLocaleString()} KGS`
                          : ""}
                      </td>
                      <td style={tdStyle}>
                        {container.netWt ? `${container.netWt} KGS` : ""}
                      </td>
                      <td style={tdStyle}>
                        {container.noOfPackages
                          ? parseFloat(container.noOfPackages).toFixed(2)
                          : ""}
                      </td>
                    </tr>
                  ))
                  : null
              )}
          </tbody>
        </table>
      </div>
    );
  };
  const JobChargeProvisionalModule = ({ jobData, voucherData }) => {
    const tableStyle = {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "10px",
      fontSize: "12px",
    };

    const headerStyle = {
      border: "1px solid black",
      padding: "6px",
      backgroundColor: "#f0f0f0",
      fontWeight: "bold",
      textAlign: "center",
    };

    const cellStyle = {
      border: "1px solid black",
      padding: "6px",
      textAlign: "right",
    };

    const leftCellStyle = {
      ...cellStyle,
      textAlign: "left",
      whiteSpace: "normal",
      wordWrap: "break-word",
      maxWidth: "150px",
    };

    let totalRevenueProvisional = 0;
    let totalCostProvisional = 0;
    let totalRevenueActual = 0;
    let totalCostActual = 0;

    let allVoucherDetails = [];
    voucherData?.forEach((voucher) => {
      voucher.tblVoucherLedger?.forEach((ledger) => {
        allVoucherDetails.push(...ledger.tblVoucherLedgerDetails);
      });
    });

    // Step 1: Aggregate charges by charge name
    const aggregatedCharges = {};

    jobData?.forEach((job) => {
      job.tblJobCharge?.forEach((charge, index) => {
        const key = charge.charge || "UNKNOWN";

        const sellAmount = parseFloat(charge.sellTotalAmountHc) || 0;
        const buyAmount = parseFloat(charge.buyTotalAmountHc) || 0;
        const voucherDetail = allVoucherDetails[index] || {};
        const revenueActual = parseFloat(voucherDetail.creditAmount) || 0;
        const costActual = parseFloat(voucherDetail.debitAmount) || 0;

        if (!aggregatedCharges[key]) {
          aggregatedCharges[key] = {
            sell: 0,
            buy: 0,
            revenueActual: 0,
            costActual: 0,
          };
        }

        aggregatedCharges[key].sell += sellAmount;
        aggregatedCharges[key].buy += buyAmount;
        aggregatedCharges[key].revenueActual += revenueActual;
        aggregatedCharges[key].costActual += costActual;
      });
    });

    return (
      <>
        <style>{`
        
          
        }
      `}</style>
        <div>
          <table style={tableStyle} className="table-fixed">
            <thead>
              <tr>
                <th rowSpan="2" style={headerStyle}>
                  Charge Name
                </th>
                <th colSpan="4" style={headerStyle}>
                  Provisional
                </th>
                <th colSpan="4" style={headerStyle}>
                  Actual
                </th>
              </tr>
              <tr>
                <th style={headerStyle}>Revenue</th>
                <th style={headerStyle}>Cost</th>
                <th style={headerStyle}>Profit</th>
                <th style={headerStyle}>Neutral</th>
                <th style={headerStyle}>Revenue</th>
                <th style={headerStyle}>Cost</th>
                <th style={headerStyle}>Profit</th>
                <th style={headerStyle}>Neutral</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(aggregatedCharges).map(
                ([chargeName, values], idx) => {
                  const profitProvisional = values.sell - values.buy;
                  const profitActual = values.revenueActual - values.costActual;

                  totalRevenueProvisional += values.sell;
                  totalCostProvisional += values.buy;
                  totalRevenueActual += values.revenueActual;
                  totalCostActual += values.costActual;

                  return (
                    <tr key={`charge-${idx}`}>
                      <td style={leftCellStyle}>{chargeName}</td>
                      <td style={cellStyle}>{values.sell.toFixed(2)}</td>
                      <td style={cellStyle}>{values.buy.toFixed(2)}</td>
                      <td style={cellStyle}>{profitProvisional.toFixed(2)}</td>
                      <td style={cellStyle}>0.00</td>
                      <td style={cellStyle}>
                        {values.revenueActual.toFixed(2)}
                      </td>
                      <td style={cellStyle}>{values.costActual.toFixed(2)}</td>
                      <td style={cellStyle}>{profitActual.toFixed(2)}</td>
                      <td style={cellStyle}>0.00</td>
                    </tr>
                  );
                }
              )}
            </tbody>
            <tfoot>
              <tr>
                <th style={leftCellStyle}>Grand Total :</th>
                <td style={cellStyle}>{totalRevenueProvisional.toFixed(2)}</td>
                <td style={cellStyle}>{totalCostProvisional.toFixed(2)}</td>
                <td style={cellStyle}>
                  {(totalRevenueProvisional - totalCostProvisional).toFixed(2)}
                </td>
                <td style={cellStyle}>0.00</td>
                <td style={cellStyle}>{totalRevenueActual.toFixed(2)}</td>
                <td style={cellStyle}>{totalCostActual.toFixed(2)}</td>
                <td style={cellStyle}>
                  {(totalRevenueActual - totalCostActual).toFixed(2)}
                </td>
                <td style={cellStyle}>0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </>
    );
  };

  return (
    <main className="bg-gray-300">
      <div className="pt-5">{generateReportBodies(rpIds)}</div>
      <Print
        //key={reportId}
        enquiryModuleRefs={enquiryModuleRefs}
        reportIds={reportIds}
        printOrientation="portrait"
      />
      <div>
        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Booking Confirmation Export Sea":
              // Booking Confirmation
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-6 bgTheme ">
                      {BookingConfirmationCustomerReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "On Board Confirmation":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {OnBoardConfirmationReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );

            case "Landing Confirmation":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {LandingConfirmationReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );

            case "Pre Advice":
              // Pre Advice
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">{PreAdviceReports()}</div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Stuffing Confirmation":
              // Stuffing Confirmation
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {StuffingConfirmationReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Carting Details":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">{CartingDetailsReports()}</div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>

                  {/* Screen-only visual gap */}
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );

            case "Delivery Confirmation":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-4 bgTheme">
                      {DeliveryConfirmationReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>

                  {/* Screen-only visual gap */}
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );

            case "Request for Payment":
              // Request for Payment
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-4 bgTheme">
                      {RequestforPaymentReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Transport Instructions":
              // Transport Instructions
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {TransportInstructionsReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Freight Certificate":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-4 bgTheme">
                      {FreightCertificateReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>

                  {/* Screen-only visual gap */}
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );

            case "Freight Certificate Air":
              // Freight Certificate Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {FreightCertificateAirReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Delivery Order Air":
              // Delivery Order Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {DeliveryOrderAirReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Booking Confirmation Import Sea":
              // Booking Confirmation Sea
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text  ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {BookingConfirmationCustomerSeaReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Delivery Confirmation Import Sea":
              // Delivery Order Sea
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {DeliveryConfirmationSeaReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Landing Confirmation Import Sea":
              // Landing Confirmation Sea
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {LandingConfirmationReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Transport Instructions Sea":
              // Transport Instructions
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {TransportInstructionsReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Freight Certificate Sea":
              // Freight Certificate Sea
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {FreightCertificateReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Cargo Arrival Note Sea":
              // Cargo Arrival Note Sea
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {CargoArrivalNoteSeaReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Delivery Confirmation Sea":
              // Delivery Confirmation Sea
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {DeliveryConfirmationSeaReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Delivery Order Sea":
              // Delivery Order to SL Sea
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {DeliveryOrdertoSLSeaReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Booking Confirmation Air":
              // Booking Confirmation (Carrier) Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {BookingConfirmationCarrierReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Booking Confirmation Export Air":
              // Booking Confirmation (Customer) Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {BookingConfirmationCustomerReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Delivery Confirmation Air":
              // Delivery Confirmation Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {DeliveryConfirmationAirReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Freight Certificate Air":
              // Freight Certificate Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {FreightCertificateAirReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Invoicing Instructions Air":
              // Invoicing Instructions Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {InvoicingInstructionsReports()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Pre Advice Air":
              // Pre Advice Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">{preAdviceAirReport()}</div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Request for Payment":
              // Request for Payment Customer Report Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {RequestforPaymentCustomerReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Transport Instructions Air":
              // Transport Instructions Air
              return (
                <>
                  <div
                    key={index}
                    //ref={enquiryModuleRef}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                      } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", // space between page edge and inner border
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-2 bgTheme">
                      {TransportInstructionsAirReport()}
                    </div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "Job Sheet Sea":
              return (
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text shadow-2xl ${index < reportIds.length - 1 ? "page-break" : ""
                      }`}
                    style={{
                      width: "210mm",
                      margin: "auto",
                      boxSizing: "border-box",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div className="p-4 bgTheme">{JobSheetSeaReport()}</div>
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
                  </div>

                  {/* Spacer for screen only */}
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );

            case "Job sheet provisional Actual":
              // Job Sheet provisional Actual
              return (
                <div
                  key={index}
                  //ref={enquiryModuleRef}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  id={`report-${reportId}`}
                  className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
                    } shadow-2xl`}
                  style={{
                    width: "210mm",
                    height: "297mm",
                    margin: "auto",
                    boxSizing: "border-box", // space between page edge and inner border
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div className="p-4 bgTheme">{JobSheetProvisional()}</div>
                  <style jsx>{`
                    .black-text {
                      color: black !important;
                    }
                  `}</style>
                </div>
              );

            case "BL Draft": {
              if (reportIds.indexOf("BL Draft") !== index) return null; // Only run once

              const chunkArray = (arr, size) => {
                const chunks = [];
                for (let i = 0; i < arr.length; i += size) {
                  chunks.push(arr.slice(i + 0, i + size));
                }
                return chunks;
              };

              const LINES_PER_PAGE = 70;
              const containerLines =
                jobData?.[0]?.containerDetailsAttach?.split(/\r?\n/) || [];
              const marksLines =
                jobData?.[0]?.marksAndNosDetailsAttach?.split(/\r?\n/) || [];
              const goodsLines =
                jobData?.[0]?.goodsDescDetailsAttach?.split(/\r?\n/) || [];
              const cChunks = chunkArray(containerLines, LINES_PER_PAGE);
              const mChunks = chunkArray(marksLines, LINES_PER_PAGE);
              const gChunks = chunkArray(goodsLines, LINES_PER_PAGE);
              const attachPages = Math.max(
                cChunks.length,
                mChunks.length,
                gChunks.length
              );

              const usedOnLast = Math.max(
                (cChunks[attachPages - 1] || []).length,
                (mChunks[attachPages - 1] || []).length,
                (gChunks[attachPages - 1] || []).length
              );
              const firstGridCap = Math.max(0, LINES_PER_PAGE - usedOnLast);
              const allGridRows = jobData?.[0]?.tblJobContainer || [];
              const firstRows = allGridRows.slice(0, firstGridCap);
              const restRows = allGridRows.slice(firstGridCap);
              const restChunks = chunkArray(restRows, LINES_PER_PAGE);

              const basePre = {
                fontSize: "8px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
                margin: 0,
              };

              const columns = [
                {
                  key: "cno",
                  header: "Container No(s)",
                  render: (c) => c.containerNo,
                  align: "left",
                },
                {
                  key: "size",
                  header: "Size / Type",
                  render: (c) =>
                    `${c.sizeName || ""} ${c.typeName || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "seal",
                  header: "Seal No",
                  render: (c) =>
                    `${c.customSealNo || ""} ${c.agentSealNo || ""}`.trim(),
                  align: "left",
                },
                {
                  key: "gw",
                  header: "Gross Weight",
                  render: (c) =>
                    `${c.grossWt || ""} ${c.weightUnit || ""}`.trim(),
                  align: "right",
                },
                {
                  key: "nw",
                  header: "Net Weight",
                  render: (c) => c.netWt || "",
                  align: "right",
                },
                {
                  key: "pkg",
                  header: "Packages",
                  render: (c) =>
                    `${c.noOfPackages || ""} ${c.package || ""}`.trim(),
                  align: "right",
                },
              ];

              return (
                <>
                  {/* Print-only page-break rules */}
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

                  <div
                    style={{ width: "210mm", margin: "auto" }}
                    className="mt-5"
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  >
                    {/* --- FIRST PAGE: Draft --- */}
                    <div
                      className="first-page bg-white mainPadding"
                      style={{
                        width: "210mm",
                        height: "297mm",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        margin: "auto",
                      }}
                    >
                      <BlPrint jobData={jobData} />
                    </div>
                    <div className="bg-gray-300 h-2 no-print" />

                    {/* ATTACHMENT PAGES */}
                    {Array.from({ length: attachPages }).map((_, p) => (
                      <React.Fragment key={`att-${p}`}>
                        <div
                          className={
                            p === 0
                              ? "second-page bg-white mainPadding"
                              : "bg-white mainPadding"
                          }
                          style={{
                            width: "210mm",
                            height: "297mm",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            margin: "auto",
                          }}
                        >
                          <BlAttachmentPrint
                            jobData={jobData}
                            containerLines={cChunks[p] || []}
                            marksLines={mChunks[p] || []}
                            goodsLines={gChunks[p] || []}
                          />

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

                              {/* Table Rows */}
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
                    ))}

                    {/* REMAINING GRID PAGES */}
                    {restChunks.map((rows, gi) => (
                      <React.Fragment key={`grid-${gi}`}>
                        <div
                          className="second-page bg-white mainPadding"
                          style={{
                            width: "210mm",
                            height: "297mm",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            margin: "auto",
                          }}
                        >
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
                          <div className="mr-2 ml-2 border-b border-black">
                            {rows.map((c, i) => (
                              <div
                                key={i}
                                className="flex border-l border-r border-black text-center"
                              >
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
                                        className="text-black font-normal"
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
                        <div className="bg-gray-300 h-2 no-print" />
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            }
            // case "CRODEPOT":
            //   // Booking Confirmation
            //   return (
            //     <>
            //       <div
            //         key={index}
            //         ref={(el) => (enquiryModuleRefs.current[index] = el)}
            //         id={`report-${reportId}`}
            //         className={`black-text ${index < reportIds.length - 1 ? "report-spacing" : ""
            //           } shadow-2xl`}
            //         style={{
            //           width: "210mm",
            //           height: "297mm",
            //           margin: "auto",
            //           boxSizing: "border-box", // space between page edge and inner border
            //           display: "flex",
            //           flexDirection: "column",
            //           backgroundColor: "#fff",
            //           // pageBreakAfter:
            //           //   index < reportIds.length - 1 ? "always" : "auto",
            //         }}
            //       >
            //         <div className="p-4 bgTheme">{CRODEPOT()}</div>
            //         <style jsx>{`
            //           .black-text {
            //             color: black !important;
            //           }
            //         `}</style>
            //       </div>
            //       <div className="bg-gray-300 h-2 no-print" />
            //     </>
            //   );

            case "CRODEPOT":
              // Booking Confirmation
              return (
                <>
                  {Array.isArray(jobData) &&
                    jobData.length > 0 &&
                    jobData[0].tblJobQty
                      .map((job) => job.depot) // Extract depot names from tblJobQty
                      .filter(
                        (value, index, self) => self.indexOf(value) === index
                      ) // Remove duplicates to get unique depots
                      .map((depot, depotIndex) => {
                        const depotData = jobData[0].tblJobQty.filter(
                          (job) => job.depot === depot
                        ); // Filter job data for the current depot

                        return (
                          <>
                            <div
                              key={depotIndex}
                              ref={(el) =>
                                (enquiryModuleRefs.current[depotIndex] = el)
                              }
                              id={`report-${reportId}`}
                              className={`black-text ${depotIndex < jobData[0].tblJobQty.length - 1
                                  ? "report-spacing"
                                  : ""
                                } shadow-2xl`}
                              style={{
                                width: "210mm",
                                height: "297mm",
                                margin: "auto",
                                boxSizing: "border-box", // space between page edge and inner border
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "#fff",
                                pageBreakAfter:
                                  depotIndex < jobData[0].tblJobQty.length - 1
                                    ? "always"
                                    : "auto", // Ensure each depot gets a page break
                              }}
                            >
                              <div className="p-4 bgTheme">
                                {CRODEPOT(depotData)}
                                {/* Pass depot-specific data to CRODEPOT */}
                              </div>
                              <style jsx>{`
                                .black-text {
                                  color: black !important;
                                }
                              `}</style>
                            </div>
                            <div className="bg-gray-300 h-2 no-print" />
                          </>
                        );
                      })}
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            case "CROSHIPPER":
              // return (
              //   <>
              //     <div
              //       key={index}
              //       ref={(el) => (enquiryModuleRefs.current[index] = el)}
              //       id={`report-${reportId}`}
              //       className={`black-text ${
              //         index < reportIds.length - 1 ? "report-spacing" : ""
              //       } shadow-2xl`}
              //       style={{
              //         width: "210mm",
              //         height: "297mm",
              //         margin: "auto",
              //         boxSizing: "border-box", // space between page edge and inner border
              //         display: "flex",
              //         flexDirection: "column",
              //         backgroundColor: "#fff",
              //         pageBreakAfter:
              //           index < reportIds.length - 1 ? "always" : "auto",
              //       }}
              //     >
              //       <div className="p-4 bgTheme">{CROShipper()}</div>
              //       <style jsx>{`
              //         .black-text {
              //           color: black !important;
              //         }
              //       `}</style>
              //     </div>
              //     <div className="bg-gray-300 h-2 no-print" />
              //   </>
              // );
              return (
                <>
                  {Array.isArray(jobData) &&
                    jobData.length > 0 &&
                    jobData[0].tblJobQty
                      .map((job) => job.depot) // Extract depot names from tblJobQty
                      .filter(
                        (value, index, self) => self.indexOf(value) === index
                      ) // Remove duplicates to get unique depots
                      .map((depot, depotIndex) => {
                        const depotData = jobData[0].tblJobQty.filter(
                          (job) => job.depot === depot
                        ); // Filter job data for the current depot

                        return (
                          <>
                            <div
                              key={depotIndex}
                              ref={(el) =>
                                (enquiryModuleRefs.current[depotIndex] = el)
                              }
                              id={`report-${reportId}`}
                              className={`black-text ${depotIndex < jobData[0].tblJobQty.length - 1
                                  ? "report-spacing"
                                  : ""
                                } shadow-2xl`}
                              style={{
                                width: "210mm",
                                height: "297mm",
                                margin: "auto",
                                boxSizing: "border-box", // space between page edge and inner border
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "#fff",
                                pageBreakAfter:
                                  depotIndex < jobData[0].tblJobQty.length - 1
                                    ? "always"
                                    : "auto", // Ensure each depot gets a page break
                              }}
                            >
                              <div className="p-4 bgTheme">
                                {CROShipper(depotData)}
                                {/* Pass depot-specific data to CRODEPOT */}
                              </div>
                              <style jsx>{`
                                .black-text {
                                  color: black !important;
                                }
                              `}</style>
                            </div>
                            <div className="bg-gray-300 h-2 no-print" />
                          </>
                        );
                      })}
                  <div className="bg-gray-300 h-2 no-print" />
                </>
              );
            default:
              return null;
          }
        })}
      </div>
    </main>
  );
};

export default rptJobs;
