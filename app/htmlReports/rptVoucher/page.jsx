"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import "./rptVoucher.css";
import Print from "@/components/Print/page";
import { decrypt } from "@/helper/security";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
import "@/public/style/reportTheme.css";
import { reportTheme } from "@/services/auth/FormControl.services";
import { applyTheme } from "@/utils";
import { array } from "prop-types";

const rptVoucher = () => {
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState(null);
  const enquiryModuleRef = useRef();
  const [html2pdf, setHtml2pdf] = useState(null);
  const [ImageUrl, setImageUrl] = useState("");

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
    const fetchData = async () => {
      const id = searchParams.get("recordId");
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const requestBody = {
            id: id,
          };
          const response = await fetch(
            `${baseUrl}/Sql/api/Reports/vehicleRoute`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": JSON.parse(token),
              },
              body: JSON.stringify(requestBody),
            }
          );
          if (!response.ok)
            throw new Error("Failed to fetch vehicleRoute data");
          const data = await response.json();
          setData(data.data);
        } catch (error) {
          console.error("Error fetching job data:", error);
        }
      }
    };
    if (reportIds.length > 0) {
      fetchData();
    }
  }, [reportIds]);

  useEffect(() => {
    const fetchHeader = async () => {
      const getReportId = searchParams.get("reportId");
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const headerLogoPath = userData[0]?.headerLogoPath;
        if (headerLogoPath) {
          setImageUrl(headerLogoPath);
        }
        const themeRequest = {
          clientId: userData[0]?.clientId,
          reportId: Number(getReportId),
        };
        const themeData = await reportTheme(themeRequest);
        applyTheme(
          themeData.data,
          enquiryModuleRef.current?.querySelector(".bgTheme")
        );
        // enquiryModuleRef.current.style.backgroundColor =
        //   themeData.data["bgColor"] || "white";
      }
    };
    fetchHeader();
  }, [reportIds]);

  const CompanyImgModule = () => {
    return (
      <img
        src={`${baseUrlNext}${ImageUrl}`}
        alt="LOGO"
        class="border-t border-l border-r border-black p-6 w-full"
        style={{ color: "black" }}
      ></img>
    );
  };

  const VoucherGrid = (data) => {
    const gridData =
      Array.isArray(data.data) && data.data.length > 0 ? data.data : [];
    const bindGridData =
      Array.isArray(gridData[0]?.voucherLedger) &&
      gridData[0]?.voucherLedger.length > 0
        ? gridData[0]?.voucherLedger
        : [];
    console.log("bindGridData", bindGridData);
    return (
      <>
        <div className="w-full flex border-black border-l border-r border-t bg-gray-200">
          <p
            style={{ width: "25%", color: "black", fontSize: "10px" }}
            className="pl-2 font-bold pt-1 pb-1 text-center"
          >
            Particulars
          </p>
          <p
            style={{ width: "45%", color: "black", fontSize: "10px" }}
            className="pl-2 border-l border-black font-bold pt-1 pb-1 text-center"
          >
            Narration{" "}
          </p>
          <p
            style={{ width: "15%", color: "black", fontSize: "10px" }}
            className="pl-2 border-l border-black font-bold pt-1 pb-1 text-center"
          >
            Debit Amount{" "}
          </p>
          <p
            style={{ width: "15%", color: "black", fontSize: "10px" }}
            className="pl-2 border-l border-black font-bold pt-1 pb-1 text-center"
          >
            Credit Amount
          </p>
        </div>
        {bindGridData.map((row, idx) => (
          <>
            <div
              key={idx}
              style={{ color: "black", fontSize: "11px" }}
              className="w-full flex border-black border-l border-r border-b border-t"
            >
              <p style={{ width: "25%" }} className="pl-2 pt-1 pb-1 pr-1">
                {row.generalLedger || "."}
              </p>
              <p
                style={{ width: "45%" }}
                className="pl-2 border-l border-black pt-1 pb-1 pr-1"
              >
                {row.narration}
              </p>
              <p
                style={{ width: "15%" }}
                className="pl-2 border-l border-black pt-1 pb-1 text-right pr-1"
              >
                {row.debitAmount}
              </p>
              <p
                style={{ width: "15%" }}
                className="pl-2 border-l border-black pt-1 pb-1 text-right pr-1"
              >
                {row.creditAmount}
              </p>
            </div>
            <div>
              <div className="w-full flex border-black border-l border-r border-b bg-gray-100">
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1 font-bold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Invoice No.
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1 font-bold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Date
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1 font-bold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Invoice Amount FC
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1 font-bold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Ex. Rate
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1 font-bold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Invoice Amount
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1 font-bold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  TDS Amount
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1 font-bold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Amount
                </p>
              </div>
              <div className="w-full flex border-black border-l border-r">
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  FSAMUMI2504068
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  10/04/2025
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  19162.26
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  1.00
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  19162.26
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  0.00
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  18837.26
                </p>
              </div>
              <div className="w-full flex border-black border-l border-r">
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  FSAMUMI2504068
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  10/04/2025
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  19162.26
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  1.00
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  19162.26
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  0.00
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  18837.26
                </p>
              </div>
              <div className="w-full flex border-black border-l border-r">
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1 font-bold"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  Total
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                ></p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  19162.26
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                ></p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  19162.26
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                >
                  0.00
                </p>
                <p
                  className="pl-2 pt-1 pb-1 pr-1 flex-1"
                  style={{ color: "black", fontSize: "9px" }}
                ></p>
              </div>
            </div>
          </>
        ))}
        <div
          style={{ color: "black", fontSize: "10px" }}
          className="w-full flex border-black border-l border-r border-b border-t font-bold bg-gray-300"
        >
          <p style={{ width: "25%" }} className="pl-2 pt-1 pb-1 pr-1"></p>
          <p style={{ width: "15%" }} className="pl-2 pt-1 pb-1 pr-1"></p>
          <p
            style={{ width: "45%" }}
            className="pl-2 pt-1 pb-1 pr-1 text-right font-bold"
          >
            Total
          </p>
          <p
            style={{ width: "15%" }}
            className="pl-2 border-l border-black pt-1 pb-1 text-right pr-1"
          ></p>
          <p
            style={{ width: "15%" }}
            className="pl-2 border-l border-black pt-1 pb-1 text-right pr-1"
          ></p>
        </div>
      </>
    );
  };

  const voucherDetailsRpt = () => (
    <div>
      <div className="mx-auto">
        <CompanyImgModule />
        <div className="flex flex-grow w-full justify-center items-center border-black border-l border-r">
          <h1 style={{ color: "black" }} className="font-bold text-sm">
            Bank Receipt
          </h1>
        </div>
        <div
          style={{ width: "100%", color: "black", fontSize: "11px" }}
          className="flex border-black border-l border-r"
        >
          <div style={{ width: "69%", fontSize: "11px" }}>
            <p className="pl-2 pt-1 pb-1 w-full">
              <span className="font-bold">Voucher No.:</span>
              <span className="ml-5">BP/00317/25-26</span>
            </p>
          </div>
          <div style={{ width: "31%", fontSize: "11px" }}>
            <p className="pl-4 pt-1 pb-1 w-full">
              <span className="font-bold">Date :</span>
              <span className="ml-5">07/05/2025</span>
            </p>
          </div>
        </div>
        <VoucherGrid data={data} />
      </div>
    </div>
  );

  return (
    <main className="bg-gray-300 p-5">
      <Print
        enquiryModuleRef={enquiryModuleRef}
        printOrientation="portrait"
        reportIds={reportIds}
      />
      <div>
        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Voucher Printing":
              return (
                <>
                  <div
                    key={index}
                    ref={enquiryModuleRef}
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
                      <div className="bgTheme removeFontSize">
                        {voucherDetailsRpt()}
                      </div>
                      <style jsx>{`
                        .black-text {
                          color: black !important;
                        }
                      `}</style>
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
};

export default rptVoucher;
