"use client";
/* eslint-disable */
import React, { useEffect, useState, useMemo, useRef } from "react";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL; // kept as-is per your original code
import { useSearchParams, usePathname } from "next/navigation";
import { decrypt } from "@/helper/security";
import "jspdf-autotable";
import Print from "@/components/Print/page";
import "@/public/style/reportTheme.css";
import { getUserDetails } from "@/helper/userDetails";
import "./rptVoucher.css";
import { color, text } from "d3";

export default function rptDoLetter() {
  const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
  const { clientId } = getUserDetails();
  const enquiryModuleRefs = useRef([]);
  enquiryModuleRefs.current = [];
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState([]);
  const [voucherLedgerDetails, setVoucherLedgerDetails] = useState([]);
  const [companyName, setCompanyName] = useState(null);

  const voucherReportSize = 6;

  useEffect(() => {
    setReportIds(["Voucher Report"]);
    const storedReportIds = sessionStorage.getItem("selectedReportIds");
    if (storedReportIds) {
      let reportIds = JSON.parse(storedReportIds);
      reportIds = Array.isArray(reportIds) ? reportIds : [reportIds];
      setReportIds(["Voucher Report"]);
    } else {
      console.log("No Report IDs found in sessionStorage");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const id = searchParams.get("recordId");
      console.log(id);
      if (id != null) {
        try {
          const token = localStorage.getItem("token");
          if (!token) throw new Error("No token found");
          const filterCondition = { id: id };
          const response = await fetch(`${baseUrl}/Sql/api/Reports/voucher`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-access-token": JSON.parse(token),
            },
            body: JSON.stringify(filterCondition),
          });
          if (!response.ok) throw new Error("Failed to fetch Voucher data");
          const data = await response.json();
          console.log("fetch Voucher", data?.data[0]);
          setData(data?.data);
          if (Array.isArray(data?.data) && data.data.length > 0) {
            // parent rows may be under tblVoucherLedgerDetails (as you said) or sometimes under tblVoucherLedger
            const parentRows = Array.isArray(
              data.data[0]?.tblVoucherLedgerDetails
            )
              ? data.data[0].tblVoucherLedgerDetails
              : Array.isArray(data.data[0]?.tblVoucherLedger)
              ? data.data[0].tblVoucherLedger
              : [];

            const voucherLedgerDetailsFlat = parentRows.flatMap((row) =>
              Array.isArray(row?.tblVoucherLedgerDetails)
                ? row.tblVoucherLedgerDetails
                : []
            );

            // console it
            console.log("voucherLedgerDetailsFlat:", voucherLedgerDetailsFlat);
            if (voucherLedgerDetailsFlat?.length) {
              //console.table(voucherLedgerDetailsFlat); // nice readable table in devtools
              setVoucherLedgerDetails(voucherLedgerDetailsFlat);
            }
          }

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
          console.error("Error fetching job data:", error);
        }
      }
    };
    if (reportIds.length > 0) {
      fetchData();
    }
  }, [reportIds]);

  function formatDateToDMYMon(dateInput) {
    if (!dateInput) return "";

    // Support "dd/mm/yyyy" strings as well as Date/ISO inputs
    let date;
    if (
      typeof dateInput === "string" &&
      /^\d{2}\/(\d{2})\/\d{4}$/.test(dateInput)
    ) {
      const [d, m, y] = dateInput.split("/").map(Number);
      date = new Date(y, m - 1, d); // avoid locale parsing issues
    } else {
      date = new Date(dateInput);
    }

    if (Number.isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const months = [
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
    const mon = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}-${mon}-${year}`; // e.g., "30/oct/2025"
  }

  const containers = data[0]?.tblBlContainer || [];

  const chunkArray = (arr, size) => {
    if (!Array.isArray(arr) || size <= 0) return [arr || []];
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const VoucherReportChunks =
    voucherReportSize > 0
      ? chunkArray(containers, voucherReportSize)
      : [containers];

  const CompanyImgModule = () => {
    const storedUserData = localStorage.getItem("userData");
    let imageHeader = null;
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      imageHeader = userData[0]?.headerLogoPath;
    }
    return (
      <img
        src={imageHeader ? baseUrlNext + imageHeader : ""}
        style={{ width: "100%", height: "130px" }}
        alt="LOGO"
      />
    );
  };

  const VoucherReport = (input) => {
    const containers = Array.isArray(input)
      ? input
      : Array.isArray(input?.containers)
      ? input?.containers
      : [];

    const toNum = (v) => Number(String(v ?? "").replace(/,/g, "")) || 0;

    // 1) add columns to each item
    const rows = (voucherLedgerDetails ?? []).map((item, idx) => {
      const invoiceAmount = +(
        toNum(item?.debitAmount) - toNum(item?.creditAmount)
      ).toFixed(2);

      const tdsAmount = toNum(item?.tdsAmount);
      const invAmountAdjusted = toNum(
        item?.invoiceAmountHC ?? item?.invoiceAmountHc
      );

      return {
        ...item,
        indexValue: item.indexValue ?? idx,
        invoiceAmount, // (balanceAmount - creditAmount)
        tdsAmount, // as-is (normalized to number)
        invAmountAdjusted, // from invoiceAmountHC
      };
    });

    // 2) (optional) per-column totals
    const totals = rows.reduce(
      (acc, r) => {
        acc.invoiceAmount += toNum(r.invoiceAmount);
        acc.tdsAmount += toNum(r.tdsAmount);
        acc.invAmountAdjusted += toNum(r.invAmountAdjusted);
        return acc;
      },
      { invoiceAmount: 0, tdsAmount: 0, invAmountAdjusted: 0 }
    );

    // round once at the end
    totals.invoiceAmount = +totals.invoiceAmount.toFixed(2);
    totals.tdsAmount = +totals.tdsAmount.toFixed(2);
    totals.invAmountAdjusted = +totals.invAmountAdjusted.toFixed(2);

    // 3) console for verification
    console.table(
      rows.map((r) => ({
        voucherNo: r.voucherNo ?? r.voucherNumber ?? r.voucher,
        invoiceAmount: r.invoiceAmount,
        tdsAmount: r.tdsAmount,
        invAmountAdjusted: r.invAmountAdjusted,
      }))
    );
    console.log("Column totals:", totals);

    return (
      <div>
        <div className="mx-auto">
          <CompanyImgModule />
          <div>
            <h1
              className="text-black font-bold text-center mt-2"
              style={{ fontSize: "14px" }}
            >
              Receipt
            </h1>
            <table
              className="mt-2"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tr>
                <th
                  className="text-black font-bold text-left"
                  style={{ fontSize: "11px" }}
                >
                  Party Name{" "}
                </th>
                <th
                  className="text-black font-bold text-left"
                  style={{ fontSize: "11px" }}
                >
                  Receipt No
                </th>
                <th
                  className="text-black font-bold text-left"
                  style={{ fontSize: "11px" }}
                >
                  Receipt Date
                </th>
              </tr>
              <tr>
                <td
                  className="text-black text-left"
                  style={{ fontSize: "10px" }}
                >
                  {data[0]?.partyName}
                </td>
                <td
                  className="text-black text-left"
                  style={{ fontSize: "10px" }}
                >
                  {data[0]?.voucherNo}
                </td>
                <td
                  className="text-black text-left"
                  style={{ fontSize: "10px" }}
                >
                  {formatDateToDMYMon(data[0]?.voucherDate)}
                </td>
              </tr>
            </table>
            <p
              className="text-black text-left mt-2"
              style={{ fontSize: "10px" }}
            >
              Received with thanks from{" "}
              <span className="font-bold">{data[0]?.partyName}</span> as per
              below details :
            </p>
            <table
              className="mt-2"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tr>
                <th
                  className="text-black font-bold text-center border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  Type
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  Cheque / Reference No .
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  Cheque / Reference Date
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "25%" }}
                >
                  Bank Name
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "25%" }}
                >
                  Payment By
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  Amount
                </th>
              </tr>
              <tr>
                <td
                  className="text-black text-center border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  {data[0]?.paymentType}
                </td>
                <td
                  className="text-black text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  {data[0]?.referenceNo}
                </td>
                <td
                  className="text-black text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  {formatDateToDMYMon(data[0]?.referenceDate)}
                </td>
                <td
                  className="text-black text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "25%" }}
                >
                  {data[0]?.paymentByBank}
                </td>
                <td
                  className="text-black text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "25%" }}
                >
                  {data[0]?.partyName}
                </td>
                <td
                  className="text-black text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  {data[0]?.amount}
                </td>
              </tr>
            </table>
            <p
              className="text-black text-left mt-2"
              style={{ fontSize: "10px" }}
            >
              Payment Towards the below shipments :
            </p>
            <table
              className="mt-2"
              style={{ width: "100%", borderCollapse: "collapse" }}
            >
              <tr>
                <th
                  className="text-black font-bold text-center border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  Invoice No.
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  Invoice Date
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  Job No
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  BL No
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  Invoice Amount
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  TDS Amount
                </th>
                <th
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  Inv Amount Adjusted
                </th>
              </tr>
              {voucherLedgerDetails.map((item, index) => (
                <tr>
                  <td
                    className="text-black text-center border border-black p-1"
                    style={{ fontSize: "9px", width: "15%" }}
                  >
                    {item?.invoiceNo}
                  </td>
                  <td
                    className="text-black text-center  border border-black p-1"
                    style={{ fontSize: "9px", width: "15%" }}
                  >
                    {formatDateToDMYMon(item?.invoiceDate)}
                  </td>
                  <td
                    className="text-black text-center  border border-black p-1"
                    style={{ fontSize: "9px", width: "15%" }}
                  >
                    {item?.jobNo}
                  </td>
                  <td
                    className="text-black text-center  border border-black p-1"
                    style={{ fontSize: "9px", width: "10%" }}
                  >
                    {item?.blNo}
                  </td>
                  <td
                    className="text-black text-center  border border-black p-1"
                    style={{ fontSize: "9px", width: "15%" }}
                  >
                    {(
                      (+String(item?.debitAmount ?? "").replace(/,/g, "") ||
                        0) -
                      (+String(item?.creditAmount ?? "").replace(/,/g, "") || 0)
                    ).toFixed(2)}
                  </td>
                  <td
                    className="text-black text-center  border border-black p-1"
                    style={{ fontSize: "9px", width: "15%" }}
                  >
                    {(item?.tdsAmount || 0).toFixed(2)}
                  </td>
                  <td
                    className="text-black text-center  border border-black p-1"
                    style={{ fontSize: "9px", width: "15%" }}
                  >
                    {(item?.invoiceAmountHC || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  className="text-black font-bold text-right border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                  colSpan={4}
                >
                  Total Amount
                </td>
                <td
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  {(totals.invoiceAmount || 0).toFixed(2)}
                </td>
                <td
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  {(totals.tdsAmount || 0).toFixed(2)}
                </td>
                <td
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  {(totals.invAmountAdjusted || 0).toFixed(2)}
                </td>
              </tr>
            </table>
            <p
              className="text-black text-left mt-8"
              style={{ fontSize: "11px" }}
            >
              For <span className="font-bold">{data[0]?.company || ""}</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main>
      <div className="mt-5">
        <Print
          enquiryModuleRefs={enquiryModuleRefs}
          reportIds={reportIds}
          printOrientation="portrait"
        />

        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Voucher Report":
              const voucherReport = Array.isArray(VoucherReportChunks)
                ? VoucherReportChunks.filter(Boolean)
                : [];
              return (
                <>
                  {(voucherReport.length > 0 ? voucherReport : [undefined]).map(
                    (voucherData, i) => (
                      <>
                        <div
                          key={reportId}
                          ref={(el) => enquiryModuleRefs.current.push(el)}
                          id="Voucher Report"
                          className={`relative bg-white shadow-lg black-text ${
                            i < reportIds.length - 1 ? "report-spacing" : ""
                          }`}
                          style={{
                            width: "210mm",
                            minHeight: "297mm",
                            maxHeight: "297mm",
                            margin: "auto",
                            padding: "24px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                          }}
                        >
                          {/* Print fix style */}
                          {VoucherReport(voucherData, i)}

                          <style jsx>{`
                            body {
                              margin: 24px;
                              padding: 24px;
                            }
                            .black-text {
                              color: black !important;
                            }

                            @media print {
                              .report-spacing {
                                page-break-after: always;
                              }
                            }
                          `}</style>
                        </div>
                        <div className="bg-gray-300 h-2 no-print" />
                      </>
                    )
                  )}
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
