/* eslint-disable */
import React from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { toast } from "react-toastify";
import { decrypt } from "@/helper/security";
import { useEffect, useState } from "react";
import { printPDFEditor } from "@/services/auth/FormControl.services";
import PropTypes from "prop-types";
import styles from "@/components/common.module.css";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const NavBarButton = ({ templateName }) => {
  const [userName, setUserName] = useState("");
  const [receivedTemplateName, setReceivedTemplateName] =
    useState(templateName);

  useEffect(() => {
    const fetchName = () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const name = userData[0]?.name;
        setUserName(name);
      }
    };
    fetchName();
  }, []);

  const getCurrentDateTime = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, "0");
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
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  function extractHeaderImage(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const imgElement = doc.querySelector(".se-image-container img"); // Modify this selector based on your HTML structure

    if (imgElement) {
      return imgElement.getAttribute("src"); // Return the image URL
    }

    return null; // Return null if no image found
  }

  const handlePrint = async (event) => {
    event.preventDefault();
    const element = document.querySelector(".prose");
    if (!element) {
      console.error("Element with class 'prose' not found.");
      return;
    }
    const initialHtml =
      "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body>";
    const finalHtml = "</body></html>";
    const html = initialHtml + element.innerHTML + finalHtml;
    const pdfName = "Reports";
    const requestBody = {
      orientation: "portrait",
      pdfFilename: pdfName,
      htmlContent: html,
    };

    try {
      const blob = await printPDFEditor(requestBody);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${pdfName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      console.log("PDF generated and downloaded successfully.");
    } catch (error) {
      console.error("Error while generating PDF:", error);
    }
  };

  const handleEmail = async (event) => {
    event.preventDefault();
    let content = document.querySelector(".prose").innerHTML;

    // Replace {PrintedOn} with the current date and time
    const printedOn = getCurrentDateTime();
    content = content.replace(/{PrintedOn}/g, printedOn);

    const receivedBy = "";
    const footerText = `Printed By: ${userName} | Printed On: ${printedOn} | Received By: ${receivedBy}`;

    // Add the footerText to the content (this will stick it to the bottom of the page)
    content += `<div style="position: fixed; bottom: 0; left: 0; width: 100%; font-weight: bold; margin-bottom: 5px; display: flex; justify-content: space-between;">
  <span>Printed By: ${userName} | Printed On: ${printedOn}</span>
  <span style="margin-right: 100px;">Received By: ${receivedBy}</span>
</div>`;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${baseUrl}/api/send/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify({
          to: "rohitanabhavane26@gmail.com, abhishek@sysconinfotech.com , akkarma4001@gmail.com , akash@sysconinfotech.com , nilay@sysconinfotech.com",
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
      toast.error(`Error sending email: ${error.message}`);
    }
  };

  const handlePDF = async (event) => {
    event.preventDefault();

    // Get the HTML content as a string
    let contentElement = document.querySelector(".prose");
    if (!contentElement) {
      console.error("Element with class 'prose' not found.");
      return;
    }

    // Proceed with the content for sending as an email
    let content = contentElement.innerHTML;

    // Get the current date and time in dd/mm/yyyy hh:mm format
    const printedOn = getCurrentDateTime();
    const receivedBy = ""; // Add receivedBy dynamically if necessary

    // Footer content for the PDF and email
    const footerText = `Printed By: ${userName} | Printed On: ${printedOn} | Received By: ${receivedBy}`;

    // Add the footerText to the content (this will stick it to the bottom of the page)
    content += `<div style="position: fixed; bottom: 0; left: 0; width: 100%; font-weight: bold; margin-bottom: 5px; display: flex; justify-content: space-between;">
  <span>Printed By: ${userName} | Printed On: ${printedOn}</span>
  <span style="margin-right: 100px;">Received By: ${receivedBy}</span>
</div>`;

    // Create a jsPDF instance to generate the PDF
    const pdf = new jsPDF("p", "pt", "a4");

    // Append the main content to the PDF (for example, as an image or text)
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${baseUrl}/api/send/pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": JSON.parse(token),
        },
        body: JSON.stringify({
          to: "rohitanabhavane26@gmail.com, abhishek@sysconinfotech.com , akkarma4001@gmail.com , akash@sysconinfotech.com , nilay@sysconinfotech.com",
          subject: "Reports PDF",
          htmlContent: content, // Include the footer in the email content (fixed at the bottom of the page)
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
      toast.error(`Error sending PDF: ${error.message}`);
    }
  };

  return (
    <div className="flex space-x-4 p-2">
      <button
        className={`px-4 text-[12px] py-2 ${styles.bgPrimaryColorBtn} flex items-center justify-center  rounded-[5px] shadow-custom  w-24 h-[27px]`}
        onClick={handlePrint}
      >
        Print
      </button>
      <button
        className={`px-4 text-[12px] py-2 ${styles.bgPrimaryColorBtn} flex items-center justify-center  rounded-[5px] shadow-custom  w-24 h-[27px]`}
        onClick={handleEmail}
      >
        Email
      </button>
      <button
        className={`px-4 text-[12px] py-2 ${styles.bgPrimaryColorBtn} flex items-center justify-center  rounded-[5px] shadow-custom  w-24 h-[27px]`}
        onClick={handlePDF}
      >
        PDF
      </button>
    </div>
  );
};

NavBarButton.propTypes = {
  templateName: PropTypes.string.isRequired,
};

export default NavBarButton;
