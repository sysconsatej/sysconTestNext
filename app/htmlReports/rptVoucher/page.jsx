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
    const storedReportIds = sessionStorage.getItem("selectedReportIds");
    if (storedReportIds) {
      let reportIds = JSON.parse(storedReportIds);
      reportIds = Array.isArray(reportIds) ? reportIds : [reportIds];
      setReportIds(reportIds);
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
              data.data[0]?.tblVoucherLedgerDetails,
            )
              ? data.data[0].tblVoucherLedgerDetails
              : Array.isArray(data.data[0]?.tblVoucherLedger)
                ? data.data[0].tblVoucherLedger
                : [];

            const voucherLedgerDetailsFlat = parentRows.flatMap((row) =>
              Array.isArray(row?.tblVoucherLedgerDetails)
                ? row.tblVoucherLedgerDetails
                : [],
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

  function formatDateToDMYSlash(dateInput) {
    if (!dateInput) return "";

    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function toTitleCaseText(value = "") {
    return String(value || "")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
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

  function amountToWordsINR(amount) {
    const num = Number(amount || 0);
    if (!Number.isFinite(num) || num <= 0) return "INR ZERO ONLY";

    const ones = [
      "",
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
      "TEN",
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ];

    const tens = [
      "",
      "",
      "TWENTY",
      "THIRTY",
      "FORTY",
      "FIFTY",
      "SIXTY",
      "SEVENTY",
      "EIGHTY",
      "NINETY",
    ];

    const twoDigits = (n) => {
      if (n < 20) return ones[n];
      return `${tens[Math.floor(n / 10)]}${n % 10 ? " " + ones[n % 10] : ""}`;
    };

    const threeDigits = (n) => {
      let str = "";
      if (Math.floor(n / 100) > 0) {
        str += `${ones[Math.floor(n / 100)]} HUNDRED`;
        if (n % 100) str += " ";
      }
      if (n % 100) str += twoDigits(n % 100);
      return str.trim();
    };

    const inWordsIndian = (n) => {
      if (n === 0) return "ZERO";

      let result = "";

      const crore = Math.floor(n / 10000000);
      n %= 10000000;

      const lakh = Math.floor(n / 100000);
      n %= 100000;

      const thousand = Math.floor(n / 1000);
      n %= 1000;

      const hundredPart = n;

      if (crore) result += `${twoDigits(crore)} CRORE `;
      if (lakh) result += `${twoDigits(lakh)} LAKH `;
      if (thousand) result += `${twoDigits(thousand)} THOUSAND `;
      if (hundredPart) result += `${threeDigits(hundredPart)} `;

      return result.trim();
    };

    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);

    let words = `INR ${inWordsIndian(rupees)}`;
    if (paise > 0) {
      words += ` AND ${inWordsIndian(paise)} PAISE`;
    }
    words += " ONLY";

    return words;
  }

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
        item?.invoiceAmountHC ?? item?.invoiceAmountHc,
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
        acc.tdsAmtHC += toNum(r.tdsAmtHC);
        acc.invAmountAdjusted += toNum(r.invAmountAdjusted);
        return acc;
      },
      { invoiceAmount: 0, tdsAmount: 0, invAmountAdjusted: 0, tdsAmtHC: 0 },
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
      })),
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
              {data[0]?.voucherTypeName || ""}
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
                    {Number(clientId) === 9
                      ? item?.vendorInvoiceNo || item?.invoiceNo || ""
                      : item?.invoiceNo || ""}
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
                    className="text-black text-center border border-black p-1"
                    style={{ fontSize: "9px", width: "15%" }}
                  >
                    {Math.abs(
                      (+String(item?.debitAmount ?? "").replace(/,/g, "") ||
                        0) -
                      (+String(item?.creditAmount ?? "").replace(/,/g, "") ||
                        0),
                    ).toFixed(2)}
                  </td>
                  <td
                    className="text-black text-center  border border-black p-1"
                    style={{ fontSize: "9px", width: "15%" }}
                  >
                    {(item?.tdsAmtHC || 0).toFixed(2)}
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
                  className="text-black font-bold text-center border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  {Math.abs(totals.invoiceAmount || 0).toFixed(2)}
                </td>
                <td
                  className="text-black font-bold text-center  border border-black p-1"
                  style={{ fontSize: "9px", width: "10%" }}
                >
                  {Math.abs(totals.tdsAmtHC || 0).toFixed(2)}
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
              className="text-black text-left mt-2 font-bold"
              style={{ fontSize: "11px" }}
            > Narration :
              <span className="font-normal pl-1">{data[0]?.narration || ""}</span>
            </p>
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

  const VoucherReportPrint1 = (input) => {
    const containers = Array.isArray(input)
      ? input
      : Array.isArray(input?.containers)
        ? input?.containers
        : [];

    const toNum = (v) => Number(String(v ?? "").replace(/,/g, "")) || 0;

    const voucherLedgerRows = Array.isArray(data?.[0]?.tblVoucherLedger)
      ? data[0].tblVoucherLedger
      : [];

    const ledgerTotals = voucherLedgerRows.reduce(
      (acc, item) => {
        acc.debit += toNum(item?.debitAmount);
        acc.credit += toNum(item?.creditAmount);
        return acc;
      },
      { debit: 0, credit: 0 }
    );

    ledgerTotals.debit = +ledgerTotals.debit.toFixed(2);
    ledgerTotals.credit = +ledgerTotals.credit.toFixed(2);

    const totalAmountForWords =
      ledgerTotals.debit === ledgerTotals.credit && ledgerTotals.debit > 0
        ? ledgerTotals.debit
        : toNum(data?.[0]?.amount) || Math.max(ledgerTotals.debit, ledgerTotals.credit);

    const amountInWords = amountToWordsINR(totalAmountForWords);

    // 1) add columns to each item
    const rows = (voucherLedgerDetails ?? []).map((item, idx) => {
      const invoiceAmount = +(
        toNum(item?.debitAmount) - toNum(item?.creditAmount)
      ).toFixed(2);

      const tdsAmount = toNum(item?.tdsAmount);
      const invAmountAdjusted = toNum(
        item?.invoiceAmountHC ?? item?.invoiceAmountHc,
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
      { invoiceAmount: 0, tdsAmount: 0, invAmountAdjusted: 0 },
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
      })),
    );
    console.log("Column totals:", totals);


    const VoucherPrintFooter = () => (
      <div style={{ width: "100%" }}>
        <div
          style={{
            padding: "8px 8px 4px 8px",
          }}
        >
          <p
            className="text-black text-left"
            style={{ fontSize: "11px", margin: "0 0 4px 0" }}
          >
            {data[0]?.createdBy || ""}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              alignItems: "center",
            }}
          >
            <p className="text-black font-bold text-left" style={{ fontSize: "10px", margin: 0 }}>
              Prepared By :
            </p>

            <p className="text-black font-bold text-left" style={{ fontSize: "10px", margin: 0 }}>
              Checked By :
            </p>

            <p className="text-black font-bold text-left" style={{ fontSize: "10px", margin: 0 }}>
              Authorised By :
            </p>

            <p className="text-black font-bold text-left" style={{ fontSize: "10px", margin: 0 }}>
              Received By :
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #000",
            padding: "6px 4px",
          }}
        >
          <p
            className="text-black font-bold text-left"
            style={{
              fontSize: "8px",
              lineHeight: "13px",
              margin: 0,
            }}
          >
            This is a computer generated document and does not require a signature
            receipt issued for cheque payment will be subject to realization of the
            cheque
          </p>
        </div>
      </div>
    );

    return (
      <div
        style={{
          minHeight: "calc(297mm - 48px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="mx-auto"
          style={{
            width: "100%",
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CompanyImgModule />

          <h1
            className="text-black font-bold text-center mt-2"
            style={{ fontSize: "14px" }}
          >
            {toTitleCaseText(data[0]?.voucherTypeName || "")}
          </h1>

          <div
            className="mt-2"
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr 140px",
              alignItems: "center",
              width: "100%",
            }}
          >
            <p
              className="text-black font-bold text-left"
              style={{ fontSize: "11px", margin: 0 }}
            >
              Voucher No. & Date:
            </p>

            <p
              className="text-black text-left"
              style={{ fontSize: "11px", margin: 0 }}
            >
              {data[0]?.voucherNo || ""}
            </p>

            <p
              className="text-black text-right"
              style={{ fontSize: "11px", margin: 0 }}
            >
              {formatDateToDMYSlash(data[0]?.voucherDate)}
            </p>
          </div>

          <table
            className="mt-2"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th
                  className="text-black font-bold text-center border border-black p-1"
                  style={{ fontSize: "9px", width: "30%" }}
                >
                  Particulars
                </th>
                <th
                  className="text-black font-bold text-center border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  GL Code
                </th>
                <th
                  className="text-black font-bold text-center border border-black p-1"
                  style={{ fontSize: "9px", width: "25%" }}
                >
                  Narration
                </th>
                <th
                  className="text-black font-bold text-center border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  Debit Amount
                </th>
                <th
                  className="text-black font-bold text-center border border-black p-1"
                  style={{ fontSize: "9px", width: "15%" }}
                >
                  Credit Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {voucherLedgerRows.map((item, index) => {
                const details = Array.isArray(item?.tblVoucherLedgerDetails)
                  ? item.tblVoucherLedgerDetails
                  : [];

                const hasInvoiceDetails = details.length > 0;

                const detailTotals = details.reduce(
                  (acc, d) => {
                    const invoiceAmountFc = toNum(d?.invAmountFC);
                    const invoiceAmountHc = toNum(d?.invoiceAmountHC);
                    const tdsAmount = toNum(d?.tdsAmount);

                    const adjustedAmount = Math.abs(
                      toNum(d?.debitAmount) - toNum(d?.creditAmount)
                    );

                    acc.invoiceAmountFc += invoiceAmountFc;
                    acc.invoiceAmountHc += invoiceAmountHc;
                    acc.tdsAmount += tdsAmount;
                    acc.adjustedAmount += adjustedAmount;

                    return acc;
                  },
                  {
                    invoiceAmountFc: 0,
                    invoiceAmountHc: 0,
                    tdsAmount: 0,
                    adjustedAmount: 0,
                  }
                );

                const ledgerTopStyle = {
                  minHeight: hasInvoiceDetails ? "30px" : "auto",
                  lineHeight: "13px",
                  marginBottom: hasInvoiceDetails ? "4px" : "0px",
                };

                const detailRowHeight = "14px";

                const detailBoxStyle = {
                  fontSize: "8px",
                  lineHeight: detailRowHeight,
                };

                const detailHeaderStyle = {
                  fontWeight: "700",
                  color: "#000",
                  height: detailRowHeight,
                  lineHeight: detailRowHeight,
                  whiteSpace: "nowrap",
                };

                const detailCellStyle = {
                  height: detailRowHeight,
                  lineHeight: detailRowHeight,
                  whiteSpace: "nowrap",
                };

                const detailGridRows = `${detailRowHeight} repeat(${details.length}, ${detailRowHeight}) ${detailRowHeight}`;

                return (
                  <tr key={item?.id || index}>
                    <td
                      className="text-black border border-black p-1 align-top"
                      style={{ fontSize: "9px", width: "30%" }}
                    >
                      <div style={ledgerTopStyle}>{item?.generalLedger || ""}</div>

                      {hasInvoiceDetails && (
                        <div
                          style={{
                            ...detailBoxStyle,
                            display: "grid",
                            gridTemplateColumns: "1.4fr 0.8fr",
                            gridTemplateRows: detailGridRows,
                            columnGap: "8px",
                            alignItems: "start",
                          }}
                        >
                          <div style={detailHeaderStyle}>Invoice No.</div>
                          <div style={detailHeaderStyle}>Date</div>

                          {details.map((d, detailIndex) => (
                            <React.Fragment key={d?.id || detailIndex}>
                              <div style={detailCellStyle}>
                                {d?.vendorInvoiceNo || d?.invoiceNo || ""}
                              </div>

                              <div style={detailCellStyle}>
                                {formatDateToDMYSlash(d?.invoiceDate)}
                              </div>
                            </React.Fragment>
                          ))}

                          <div style={detailCellStyle}></div>
                          <div style={detailHeaderStyle}>Total</div>
                        </div>
                      )}
                    </td>

                    <td
                      className="text-black border border-black p-1 align-top"
                      style={{ fontSize: "9px", width: "15%" }}
                    >
                      <div style={ledgerTopStyle}>{item?.generalLedgerCode || ""}</div>

                      {hasInvoiceDetails && (
                        <div
                          style={{
                            ...detailBoxStyle,
                            display: "grid",
                            gridTemplateRows: detailGridRows,
                            alignItems: "start",
                          }}
                        >
                          <div style={detailHeaderStyle}>Invoice Amount FC</div>

                          {details.map((d, detailIndex) => (
                            <div key={d?.id || detailIndex} style={detailCellStyle}>
                              {toNum(d?.invAmountFC).toFixed(2)}
                            </div>
                          ))}

                          <div style={detailHeaderStyle}>
                            {detailTotals.invoiceAmountFc.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </td>

                    <td
                      className="text-black border border-black p-1 align-top"
                      style={{ fontSize: "9px", width: "25%" }}
                    >
                      <div style={ledgerTopStyle}>{item?.narration || ""}</div>

                      {hasInvoiceDetails && (
                        <div
                          style={{
                            ...detailBoxStyle,
                            display: "grid",
                            gridTemplateColumns: "0.7fr 1fr 1fr",
                            gridTemplateRows: detailGridRows,
                            columnGap: "8px",
                            alignItems: "start",
                          }}
                        >
                          <div style={detailHeaderStyle}>Ex. Rate</div>
                          <div style={detailHeaderStyle}>Invoice Amount HC</div>
                          <div style={detailHeaderStyle}>TDS Amount</div>

                          {details.map((d, detailIndex) => (
                            <React.Fragment key={d?.id || detailIndex}>
                              <div style={detailCellStyle}>
                                {toNum(
                                  d?.exchangeRate ??
                                  item?.exchangeRate ??
                                  data?.[0]?.exchangeRate ??
                                  1
                                ).toFixed(2)}
                              </div>

                              <div style={detailCellStyle}>
                                {toNum(d?.invoiceAmountHC).toFixed(2)}
                              </div>

                              <div style={detailCellStyle}>
                                {toNum(d?.tdsAmount).toFixed(2)}
                              </div>
                            </React.Fragment>
                          ))}

                          <div style={detailCellStyle}></div>

                          <div style={detailHeaderStyle}>
                            {detailTotals.invoiceAmountHc.toFixed(2)}
                          </div>

                          <div style={detailHeaderStyle}>
                            {detailTotals.tdsAmount.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </td>

                    <td
                      className="text-black text-right border border-black p-1 align-top"
                      style={{ fontSize: "9px", width: "15%" }}
                    >
                      <div style={ledgerTopStyle}>
                        {item?.debitAmount != null
                          ? toNum(item?.debitAmount).toFixed(2)
                          : ""}
                      </div>

                      {hasInvoiceDetails && (
                        <div
                          style={{
                            ...detailBoxStyle,
                            display: "grid",
                            gridTemplateRows: detailGridRows,
                            alignItems: "start",
                            textAlign: "right",
                          }}
                        >
                          <div style={detailHeaderStyle}>Amount</div>

                          {details.map((d, detailIndex) => (
                            <div key={d?.id || detailIndex} style={detailCellStyle}>
                              {Math.abs(
                                toNum(d?.debitAmount) - toNum(d?.creditAmount)
                              ).toFixed(2)}
                            </div>
                          ))}

                          <div style={detailHeaderStyle}>
                            {detailTotals.adjustedAmount.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </td>

                    <td
                      className="text-black text-right border border-black p-1 align-top"
                      style={{ fontSize: "9px", width: "15%" }}
                    >
                      <div style={ledgerTopStyle}>
                        {item?.creditAmount != null
                          ? toNum(item?.creditAmount).toFixed(2)
                          : ""}
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td
                  colSpan={3}
                  className="text-black font-bold text-right border border-black p-1"
                  style={{ fontSize: "9px" }}
                >
                  Total :
                </td>
                <td
                  className="text-black font-bold text-right border border-black p-1"
                  style={{ fontSize: "9px" }}
                >
                  {ledgerTotals.debit.toFixed(2)}
                </td>
                <td
                  className="text-black font-bold text-right border border-black p-1"
                  style={{ fontSize: "9px" }}
                >
                  {ledgerTotals.credit.toFixed(2)}
                </td>
              </tr>

              <tr>
                <td
                  className="text-black font-bold text-left border border-black p-1"
                  style={{ fontSize: "9px" }}
                >
                  Amount in Word:
                </td>
                <td
                  colSpan={4}
                  className="text-black text-left border border-black p-1"
                  style={{ fontSize: "9px" }}
                >
                  {amountInWords}
                </td>
              </tr>
            </tbody>
          </table>

          {/* This section creates the large bordered area like Voucher0 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              borderLeft: "1px solid #000",
              borderRight: "1px solid #000",
              borderBottom: "1px solid #000",
              minHeight: "0",
            }}
          >
            <div
              style={{
                padding: "8px 4px",
                flex: 1,
              }}
            >
              <p
                className="text-black font-bold text-left"
                style={{ fontSize: "10px", margin: 0 }}
              >
                Narration :
              </p>

              <p
                className="text-black text-left"
                style={{ fontSize: "10px", margin: "3px 0 0 0" }}
              >
                {data[0]?.narration || ""}
              </p>
            </div>

            <VoucherPrintFooter />
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
                          className={`relative bg-white shadow-lg black-text ${i < reportIds.length - 1 ? "report-spacing" : ""
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
                    ),
                  )}
                </>
              );
            case "Voucher Print":
              const VoucherReportPrint = Array.isArray(VoucherReportChunks)
                ? VoucherReportChunks.filter(Boolean)
                : [];

              return (
                <>
                  {(VoucherReportPrint.length > 0 ? VoucherReportPrint : [undefined]).map(
                    (voucherData, i) => (
                      <>
                        <div
                          key={reportId}
                          ref={(el) => enquiryModuleRefs.current.push(el)}
                          id="Voucher Report Print"
                          className={`relative bg-white shadow-lg black-text ${i < reportIds.length - 1 ? "report-spacing" : ""
                            }`}
                          style={{
                            width: "210mm",
                            height: "297mm",
                            minHeight: "297mm",
                            maxHeight: "297mm",
                            margin: "auto",
                            padding: "24px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          {VoucherReportPrint1(voucherData, i)}

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
                    ),
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
