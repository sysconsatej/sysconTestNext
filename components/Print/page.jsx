/* eslint-disable */
import React from "react";
import {
  printPDF,
  emailPDF,
  emailReportsInBody,
} from "@/services/auth/FormControl.services";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

Print.propTypes = {
  enquiryModuleRefs: PropTypes.any,
  printOrientation: PropTypes.any,
  reportIds: PropTypes.any,
};
export default function Print({
  enquiryModuleRefs,
  printOrientation,
  reportIds,
}) {
  const handlePrint = async () => {
    const style = await fetch("/style/reportTheme.css");
    const css = await style.text();

    // 👇 Merge all report HTMLs
    const elements = enquiryModuleRefs.current || [];
    // const allInnerHTML = elements
    //   .filter(Boolean) // filter out any undefined refs
    //   .map((el) => el.innerHTML)
    //   .join("");

    const allInnerHTML = elements
      .filter(Boolean)
      .map((el, index) => {
        const html = el.innerHTML;
        // Add page break before every report after the first
        return index === 0
          ? html
          : `<div style="page-break-before: always;"></div>${html}`;
      })
      .join("");

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${css}</style>
        </head>
        <body>${allInnerHTML}</body>
      </html>
    `;

    const pdfName = reportIds?.join("-") || "Report";
    //console.log("fullHtml", fullHtml);

    const requestBody = {
      orientation: printOrientation,
      pdfFilename: pdfName,
      htmlContent: fullHtml,
    };

    try {
      const blob = await printPDF(requestBody);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", pdfName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.log("PDF generated and downloaded successfully.");
    } catch (error) {
      console.error("Error while generating PDF:", error);
    }
  };
  const handlePDFEmail = async () => {
    const style = await fetch("/style/reportTheme.css");
    const css = await style.text();

    // 👇 Merge all report HTMLs
    const elements = enquiryModuleRefs.current || [];
    const allInnerHTML = elements
      .filter(Boolean) // filter out any undefined refs
      .map((el) => el.innerHTML)
      .join("");

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${css}</style>
        </head>
        <body>${allInnerHTML}</body>
      </html>
    `;

    const pdfName = reportIds?.join("-") || "Report";

    const requestBody = {
      orientation: printOrientation,
      pdfFilename: pdfName,
      htmlContent: fullHtml,
    };

    try {
      const blob = await emailPDF(requestBody);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", pdfName);
      //document.body.appendChild(link);
      // link.click();
      link.remove();
      toast.success("PDF Send successfully.");
    } catch (error) {
      toast.error("Error while generating PDF.");
    }
  };
  const handleEmailBody = async () => {
    const style = await fetch("/style/reportTheme.css");
    const css = await style.text();

    // Merge all report HTMLs
    const elements = enquiryModuleRefs.current || [];
    const allInnerHTML = elements
      .filter(Boolean)
      .map((el) => el.innerHTML)
      .join("");

    const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>${css}</style>
      </head>
      <body class="text-[13px] text-gray-800 bg-white">
        ${allInnerHTML}
      </body>
    </html>
  `;

    const pdfName = reportIds?.join("-") || "Report";

    const requestBody = {
      to: "client@example.com", // 🔁 Replace with dynamic value as needed
      cc: "", // Optional
      bcc: "", // Optional
      subject: `Report: ${pdfName}`,
      body: "This is a fallback plain text body.",
      htmlContent: fullHtml,
    };

    try {
      const res = await emailReportsInBody(requestBody);
      const result = await res.status;
      if (result) {
        toast.success("Email sent successfully.");
      } else {
        toast.error("Error while Sending Email.");
      }
    } catch (error) {
      console.error("Error while sending email:", error);
    }
  };
  return (
    <div className="flex space-x-4 p-2 mb-5">
      <button
        className="ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
        onClick={() => handlePrint()}
      >
        Download
      </button>
      <button
        className="ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
        onClick={() => handlePDFEmail()}
      >
        PDF
      </button>
      <button
        className="ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
        onClick={() => handleEmailBody()}
      >
        Email
      </button>
    </div>
  );
}
