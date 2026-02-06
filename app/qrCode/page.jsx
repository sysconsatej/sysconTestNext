"use client";
/* eslint-disable */
import Print from "@/components/Print/page";
import { getUserDetails } from "@/helper/userDetails";
import React, { useRef, useState } from "react";
import "./qrCode.css";

export default function QRCODE() {
  const enquiryModuleRefs = useRef([]);
  const { clientId } = getUserDetails();
  const [printName, setPrintName] = useState([]);
  const [reportIds, setReportIds] = useState(["Qr Code"]);

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
                <>
                  <div
                    key={index}
                    ref={(el) => (enquiryModuleRefs.current[index] = el)}
                    id={`report-${reportId}`}
                    className={`black-text ${
                      index < reportIds.length - 1 ? "report-spacing" : ""
                    } shadow-2xl`}
                    style={{
                      width: "210mm",
                      height: "297mm",
                      margin: "auto",
                      boxSizing: "border-box", 
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "#f7f4f4",
                    }}
                  >
                    <style jsx>{`
                      .black-text {
                        color: black !important;
                      }
                    `}</style>
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
