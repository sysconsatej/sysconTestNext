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
  const getPdfName = () => {
    return reportIds?.join("-") || "Report";
  };

  const buildFullHtml = async () => {
    const style = await fetch("/style/reportTheme.css");
    const css = await style.text();

    const elements = enquiryModuleRefs.current || [];

    const allInnerHTML = elements
      .filter(Boolean)
      .map((el, index) => {
        const html = el.innerHTML;

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

    return fullHtml;
  };

  const buildPdfRequestBody = async () => {
    const pdfName = getPdfName();
    const fullHtml = await buildFullHtml();

    return {
      orientation: printOrientation,
      pdfFilename: pdfName,
      htmlContent: fullHtml,
    };
  };

  const generatePdfBlob = async () => {
    const requestBody = await buildPdfRequestBody();
    const blob = await printPDF(requestBody);
    return blob;
  };

  const handlePrint = async () => {
    try {
      const pdfName = getPdfName();
      const blob = await generatePdfBlob();

      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${pdfName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      console.log("PDF generated and downloaded successfully.");
      toast.success("PDF downloaded successfully.");
    } catch (error) {
      console.error("Error while generating PDF:", error);
      toast.error("Error while generating PDF.");
    }
  };

  const handleBrowserPrint = async () => {
    try {
      const blob = await generatePdfBlob();

      const pdfUrl = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );

      const iframe = document.createElement("iframe");

      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";

      iframe.src = pdfUrl;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          } catch (printError) {
            console.error("Print dialog error:", printError);
            toast.error("Unable to open print dialog.");
          }

          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }

            window.URL.revokeObjectURL(pdfUrl);
          }, 3000);
        }, 500);
      };
    } catch (error) {
      console.error("Error while opening print:", error);
      toast.error("Error while opening print.");
    }
  };

  const handlePDFEmail = async () => {
    try {
      const requestBody = await buildPdfRequestBody();

      await emailPDF(requestBody);

      toast.success("PDF Send successfully.");
    } catch (error) {
      console.error("Error while sending PDF:", error);
      toast.error("Error while generating PDF.");
    }
  };

  const handleEmailBody = async () => {
    try {
      const pdfName = getPdfName();
      const fullHtml = await buildFullHtml();

      const requestBody = {
        to: "client@example.com",
        cc: "",
        bcc: "",
        subject: `Report: ${pdfName}`,
        body: "This is a fallback plain text body.",
        htmlContent: fullHtml,
      };

      const res = await emailReportsInBody(requestBody);
      const result = await res.status;

      if (result) {
        toast.success("Email sent successfully.");
      } else {
        toast.error("Error while Sending Email.");
      }
    } catch (error) {
      console.error("Error while sending email:", error);
      toast.error("Error while sending email.");
    }
  };

  return (
    <div className="flex space-x-4 p-2 mb-5">
      <button
        type="button"
        className="ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
        onClick={handlePrint}
      >
        Download
      </button>

      <button
        type="button"
        className="inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
        onClick={handleBrowserPrint}
      >
        Print
      </button>

      {/* <button
        type="button"
        className="ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
        onClick={handlePDFEmail}
      >
        PDF
      </button>

      <button
        type="button"
        className="ms-2 inline-flex items-center px-8 py-1.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
        onClick={handleEmailBody}
      >
        Email
      </button> */}
    </div>
  );
}