"use client";
/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import Print from "@/components/Print/page";
import { getUserDetails } from "@/helper/userDetails";
import "./qrCode.css";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";  // Using 'qrcode' package

export default function QRCODE() {
  const enquiryModuleRefs = useRef([]);
  const searchParams = useSearchParams();
  const { clientId } = getUserDetails();
  const [printName, setPrintName] = useState([]);
  const [reportIds, setReportIds] = useState(["Qr Code"]);
  const [data, setData] = useState([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState([]); // State to store QR code data URLs
  const [qrCodeSize, setQrCodeSize] = useState(256);  // Variable to adjust QR code size
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const fetchdata = async () => {
      const id = searchParams.get("recordId");
      const reportId = searchParams.get("reportId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const requestBody = {
            recordId: id,
          };
          const response = await fetch(`${baseUrl}/Sql/api/Reports/goodsInwardQrGenerator`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": JSON.parse(token),
            },
            body: JSON.stringify(requestBody),
          });
          if (!response.ok) throw new Error("Failed to fetch job data");
          const data = await response.json();
          setData(data.data); // Assuming response data is under `data.data`
        } catch (error) {
          console.error("Error fetching job data:", error);
        }
      }
    };
    if (reportIds.length > 0) {
      fetchdata();
    }
  }, [reportIds]);

  // Generate QR code for each item in data
  useEffect(() => {
    const generateQrCodes = () => {
      const codes = data.map((item) =>
        QRCode.toDataURL(JSON.stringify(item))  // Generate data URL from the entire object
      );
      Promise.all(codes)
        .then((urls) => {
          setQrCodeDataUrl(urls);  // Store the generated QR code data URLs
        })
        .catch((error) => {
          console.error("Error generating QR codes:", error);
        });
    };

    if (data.length > 0) {
      generateQrCodes();
    }
  }, [data]);

  console.log("Data:", data);
  console.log("QR Codes Data URL:", qrCodeDataUrl);

  return (
    <main className="bg-gray-300">
      <Print
        enquiryModuleRefs={enquiryModuleRefs}
        reportIds={printName?.length > 0 ? [printName] : reportIds}
        printOrientation="portrait"
      />
      <div>
        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Qr Code":
              return (
                <div key={index}>
                  {/* QR Code Generation for each item in data */}
                  {data?.map((item, idx) => (
                    <div
                      key={idx}
                      ref={(el) => (enquiryModuleRefs.current[idx] = el)}
                      id={`report-${reportId}`}
                      className={`black-text shadow-2xl`}
                      style={{
                        width: "210mm",
                        height: "100mm",
                        margin: "auto",
                        boxSizing: "border-box", 
                        display: "flex",
                        flexDirection: "column",
                        backgroundColor: "#f7f4f4",
                        justifyContent: "center", // Ensure centered
                        alignItems: "center", // Ensure centered
                        pageBreakBefore: "always", // Force page break before each QR code
                      }}
                    >
                      <h3 style={{ color: "black", fontSize: "10px" }}>QR Code for {item.wh_referenceNo}</h3>
                      <div style={{ marginBottom: "10px", minWidth: "200px", minHeight: "200px" }}>
                        {qrCodeDataUrl[idx] ? (
                          <img
                            src={qrCodeDataUrl[idx]}
                            alt={`QR Code for ${item.wh_referenceNo}`}
                            width={qrCodeSize}  // Use qrCodeSize for adjustable size
                            height={qrCodeSize}
                          />
                        ) : (
                          <p>Loading...</p> // Show loading text until QR code is generated
                        )}
                      </div>
                      {/* Displaying more details */}
                      <div>
                        <p style={{ color: "black", fontSize: "10px" }}>Customer Ref: {item.wh_customerRefNo}</p>
                        <p style={{ color: "black", fontSize: "10px" }}>Warehouse ID: {item.wh_id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}
