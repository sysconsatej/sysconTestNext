"use client";
/* eslint-disable */
import React, { useEffect, useState, useMemo, useRef } from "react";
import { toWords } from "number-to-words";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import { useSearchParams } from "next/navigation";
import "./rptWarehouse.css";
import PropTypes from "prop-types";
import {
  fetchDataAPI,
  warehouseData,
} from "@/services/auth/FormControl.services";
import { decrypt } from "@/helper/security";
import jsPDF from "jspdf"; // Import jsPDF
import "jspdf-autotable"; // Import AutoTable plugin
import html2canvas from "html2canvas";
import { printPDF } from "@/services/auth/FormControl.services";
import Print from "@/components/Print/page";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;

function rptWarehouse() {
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState([]);
  const [CompanyHeader, setCompanyHeader] = useState("");
  const [ImageUrl, setImageUrl] = useState("");
  const enquiryModuleRef = useRef();
  const [html2pdf, setHtml2pdf] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const enquiryModuleRefs = useRef([]);
  const chunkSize = 15;

  console.log("data=>", data);

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
            filterCondition: `${id}`,
          };
          const response = await fetch(
            `${baseUrl}/Sql/api/Reports/warehouseData`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-access-token": JSON.parse(token),
              },
              body: JSON.stringify(requestBody),
            },
          );
          if (!response.ok) throw new Error("Failed to fetch BL data");
          const data = await response.json();
          setData(data.data[0]);
          console.log("Test BL", data.data[0]);
        } catch (error) {
          console.error("Error fetching BL data:", error);
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
      }
    };
    fetchHeader();
  }, [reportIds]);

  const CompanyImgModule = () => {
    return (
      <img
        src={`${baseUrlNext}${ImageUrl}`}
        alt="LOGO"
        className="w-full"
      ></img>
    );
  };

  const chunkArray = (arr, size) => {
    if (!Array.isArray(arr) || size <= 0) return [arr || []];
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  // pick the "header" object safely whether data is array or object
  const header = Array.isArray(data) ? data?.[0] : data;

  // build containers safely
  const containers = Array.isArray(header?.warehouseTransactionDetails)
    ? header.warehouseTransactionDetails.map((item, i) => ({
      ...item,
      containerNoIndex: i,
    }))
    : [];

  // chunks
  const chunks =
    chunkSize > 0 ? chunkArray(containers, chunkSize) : [containers];

  console.log("chunks=>", chunks);

  const VesselModule = () => {
    const thStyle = {
      width: "12%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };
    const tdStyle = {
      width: "38%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };

    return (
      <table
        className="mt-1"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
      >
        <tr className="border-black border">
          <td width="49%" valign="top">
            <table
              className="border-black border-r"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Name:
                </th>
                <td className="item-center" style={tdStyle}>
                  {data && data?.customerName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Address:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerAddress}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Kind Attn:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.kindAttn}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Tel:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.telephoneNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Email:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.emailId}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Ref No:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerRefNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  P.O.No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.poNo}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GIN No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.ginNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GIN Date:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.ginDate}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Transporter Name:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.transporterName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Transporter Ref.No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.transporterRefNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Vehicle No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.vehicleNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  B/L/AWB/LR No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.blAwrLrNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  const VesselModuleGoodsDeliveryNote = () => {
    const thStyle = {
      width: "12%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };
    const tdStyle = {
      width: "38%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };

    return (
      <table
        className="mt-1"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
      >
        <tr className="border-black border">
          <td width="49%" valign="top">
            <table
              className="border-black border-r"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Name:
                </th>
                <td className="item-center" style={tdStyle}>
                  {data && data?.customerName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Address:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerAddress}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Kind Attn:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.kindAttn}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Tel:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.telephoneNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Email:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.emailId}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Ref No:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerRefNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GOUT .No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.goutNo}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GD No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.gdNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GD Date:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.gdDate}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Deliver to:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.delivertoName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Deliver Address:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.deliveryAddress}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  const VesselModuleGoodsReceiptNote = () => {
    const thStyle = {
      width: "12%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };
    const tdStyle = {
      width: "38%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };

    return (
      <table
        className="mt-1"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
      >
        <tr className="border-black border">
          <td width="49%" valign="top">
            <table
              className="border-black border-r"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Name:
                </th>
                <td className="item-center" style={tdStyle}>
                  {data && data?.customerName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Address:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerAddress}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Kind Attn:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.kindAttn}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Tel:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.telephoneNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Email:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.emailId}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Ref No:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerRefNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GIN .No.: 
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.ginNo}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GRN No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.grnNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GRN Date:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.grnDate}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  const VesselModuleOutward = () => {
    const thStyle = {
      width: "12%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };
    const tdStyle = {
      width: "38%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };

    return (
      <table
        className="mt-1"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
      >
        <tr className="border-black border">
          <td width="49%" valign="top">
            <table
              className="border-black border-r"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Name:
                </th>
                <td className="item-center" style={tdStyle}>
                  {data && data?.customerName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Address:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerAddress}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Kind Attn:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.kindAttn}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Tel:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.telephoneNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Email:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.emailId}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Ref No:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerRefNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  S.O.No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.soNo}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GOUT No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.goutNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GOUT Date:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.goutDate}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Deliver to:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.delivertoName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Deliver Address:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.deliveryAddress}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Transporter Name:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.transporterName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Transporter Ref.No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.transporterRefNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Vehicle No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.vehicleNo}
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    );
  };
  const VesselPurchaseOrderKn = () => {
    const thStyle = {
      width: "12%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };
    const tdStyle = {
      width: "38%",
      textAlign: "left",
      paddingTop: "2px",
      paddingLeft: "5px",
      paddingRight: "2px",
      paddingBottom: "2px",
      verticalAlign: "top",
      fontSize: `9px`,
    };

    return (
      <table
        className="mt-1"
        width="100%"
        border="0"
        cellSpacing="0"
        cellPadding="0"
      >
        <tr className="border-black border">
          <td width="49%" valign="top">
            <table
              className="border-black border-r"
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Name:
                </th>
                <td className="item-center" style={tdStyle}>
                  {data && data?.customerName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Address:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerAddress}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Kind Attn:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.kindAttn}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Tel:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.telephoneNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Email:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.emailId}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Customer Ref No:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.customerRefNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  P.O.No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.poNo}
                </td>
              </tr>
            </table>
          </td>
          <td width="51%" valign="top">
            <table
              width="100%"
              border="0"
              cellSpacing="0"
              cellPadding="0"
            >
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GIN No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.ginNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  GIN Date:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.ginDate}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Transporter Name:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.transporterName}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Transporter Ref.No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.transporterRefNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  Vehicle No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.vehicleNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                >
                  B/L/AWB/LR No.:
                </th>
                <td align="left" style={tdStyle}>
                  {data && data?.blAwrLrNo}
                </td>
              </tr>
              <tr>
                <th
                  align="left"
                  style={thStyle}
                ><span></span>
                </th>
                <td align="left" style={tdStyle}>
                  <span style={{ color: "white" }}>s</span></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    );
  };
  const TableInwardsNote = ({ chunkContainers }) => {
    const rows = Array.isArray(chunkContainers?.chunkContainers)
      ? chunkContainers?.chunkContainers
      : [];

    return (
      <table className="w-full mt-2 table-fixed border border-black border-collapse">
        <thead className="bg-gray-800" >
          <tr>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product Type
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Quantity
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                No. of pkjs
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Gross Wt.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Customer Batch No.
              </p>
            </th>
          </tr>
        </thead>

        <tbody>
          {(rows.length > 0 ? rows : [{}]).map((item, index) => (
            <tr
              key={item?.id ?? index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-200"} // stripes
            >
              {/* Product */}
              <td className="w-1/8 border border-black p-1 text-center align-middle">
                <p className="text-black font-normal" style={{ fontSize: "9px" }}>
                  {item.itemTypeName || ""}
                </p>
              </td>

              {/* Product Type */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                  {item.itemName || ""}
                </p>
              </td>

              {/* Quantity */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.qty ?? ""}
                </p>
              </td>

              {/* No. of pkjs */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.noOfPackages ?? ""} {item.packageCode || ""}
                </p>
              </td>

              {/* Gross Wt. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {(item.grossWt ?? "") + " " + (item.wtUnitCode || "")}
                </p>
              </td>

              {/* Customer Batch No. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.customerbatchNo || ""}
                </p>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    );
  };
  const TableDeliveryNote = ({ chunkContainers }) => {
    const rows = Array.isArray(chunkContainers?.chunkContainers)
      ? chunkContainers?.chunkContainers
      : [];

    return (
      <table className="w-full mt-2 table-fixed border border-black border-collapse">
        <thead className="bg-gray-800" >
          <tr>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product Type
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Quantity
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                No. of pkjs
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Gross Wt.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Status
              </p>
            </th>
          </tr>
        </thead>

        <tbody>
          {(rows.length > 0 ? rows : [{}]).map((item, index) => (
            <tr
              key={item?.id ?? index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-200"} // stripes
            >
              {/* Product */}
              <td className="w-1/8 border border-black p-1 text-center align-middle">
                <p className="text-black font-normal" style={{ fontSize: "9px" }}>
                  {item.itemTypeName || ""}
                </p>
              </td>

              {/* Product Type */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                  {item.itemName || ""}
                </p>
              </td>

              {/* Quantity */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.qty ?? ""}
                </p>
              </td>

              {/* No. of pkjs */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.noOfPackages ?? ""} {item.packageCode || ""}
                </p>
              </td>

              {/* Gross Wt. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {(item.grossWt ?? "") + " " + (item.wtUnitCode || "")}
                </p>
              </td>

              {/* Customer Batch No. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.customerbatchNo || ""}
                </p>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    );
  };
  const TableGoodsReceiptNote = ({ chunkContainers }) => {
    const rows = Array.isArray(chunkContainers?.chunkContainers)
      ? chunkContainers?.chunkContainers
      : [];

    return (
      <table className="w-full mt-2 table-fixed border border-black border-collapse">
        <thead className="bg-gray-800" >
          <tr>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product Type
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Quantity
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                No. of pkjs
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Gross Wt.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Customer Batch No.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Section
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Sub Section
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Status
              </p>
            </th>
          </tr>
        </thead>

        <tbody>
          {(rows.length > 0 ? rows : [{}]).map((item, index) => (
            <tr
              key={item?.id ?? index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-200"} // stripes
            >
              {/* Product */}
              <td className="w-1/8 border border-black p-1 text-center align-middle">
                <p className="text-black font-normal" style={{ fontSize: "9px" }}>
                  {item.itemTypeName || ""}
                </p>
              </td>

              {/* Product Type */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                  {item.itemName || ""}
                </p>
              </td>

              {/* Quantity */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.qty ?? ""}
                </p>
              </td>

              {/* No. of pkjs */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.noOfPackages ?? ""} {item.packageCode || ""}
                </p>
              </td>

              {/* Gross Wt. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {(item.grossWt ?? "") + " " + (item.wtUnitCode || "")}
                </p>
              </td>

              {/* Customer Batch No. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.customerbatchNo || ""}
                </p>
              </td>
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.section || ""}
                </p>
              </td>
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.subSection || ""}
                </p>
              </td>
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.status || ""}
                </p>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    );
  };
  const TableOutwardNote = ({ chunkContainers }) => {
    const rows = Array.isArray(chunkContainers?.chunkContainers)
      ? chunkContainers?.chunkContainers
      : [];

    return (
      <table className="w-full mt-2 table-fixed border border-black border-collapse">
        <thead className="bg-gray-800" >
          <tr>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product Type
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Quantity
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                No. of pkjs
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Gross Wt.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Customer Batch No.
              </p>
            </th>
          </tr>
        </thead>

        <tbody>
          {(rows.length > 0 ? rows : [{}]).map((item, index) => (
            <tr
              key={item?.id ?? index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-200"} // stripes
            >
              {/* Product */}
              <td className="w-1/8 border border-black p-1 text-center align-middle">
                <p className="text-black font-normal" style={{ fontSize: "9px" }}>
                  {item.itemTypeName || ""}
                </p>
              </td>

              {/* Product Type */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                  {item.itemName || ""}
                </p>
              </td>

              {/* Quantity */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.qty ?? ""}
                </p>
              </td>

              {/* No. of pkjs */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.noOfPackages ?? ""} {item.packageCode || ""}
                </p>
              </td>

              {/* Gross Wt. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {(item.grossWt ?? "") + " " + (item.wtUnitCode || "")}
                </p>
              </td>

              {/* Customer Batch No. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.customerbatchNo || ""}
                </p>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    );
  };
  const TablePurchaseOrderKn = ({ chunkContainers }) => {
    const rows = Array.isArray(chunkContainers?.chunkContainers)
      ? chunkContainers?.chunkContainers
      : [];

    return (
      <table className="w-full mt-2 table-fixed border border-black border-collapse">
        <thead className="bg-gray-800" >
          <tr>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Product Type
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Quantity
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                No. of pkjs
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Gross Wt.
              </p>
            </th>
            <th className="w-1/8 border border-black p-1">
              <p className="text-white font-bold" style={{ fontSize: "9px" }}>
                Customer Batch No.
              </p>
            </th>
          </tr>
        </thead>

        <tbody>
          {(rows.length > 0 ? rows : [{}]).map((item, index) => (
            <tr
              key={item?.id ?? index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-200"} // stripes
            >
              {/* Product */}
              <td className="w-1/8 border border-black p-1 text-center align-middle">
                <p className="text-black font-normal" style={{ fontSize: "9px" }}>
                  {item.itemTypeName || ""}
                </p>
              </td>

              {/* Product Type */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center" style={{ fontSize: "9px" }}>
                  {item.itemName || ""}
                </p>
              </td>

              {/* Quantity */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.qty ?? ""}
                </p>
              </td>

              {/* No. of pkjs */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.noOfPackages ?? ""} {item.packageCode || ""}
                </p>
              </td>

              {/* Gross Wt. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {(item.grossWt ?? "") + " " + (item.wtUnitCode || "")}
                </p>
              </td>

              {/* Customer Batch No. */}
              <td className="w-1/8 border border-black p-1">
                <p className="text-black font-normal text-center align-middle" style={{ fontSize: "9px" }}>
                  {item.customerbatchNo || ""}
                </p>
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    );
  };
  const GoodsInwardsNote = (chunkContainers) => (
    <div>
      <div className="mx-auto text-black">
        <div>
          <div>
            <CompanyImgModule />
          </div>
          <div className="text-center">
            <h1
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "black",
              }}
            >
              GOODS INWARDS NOTE
            </h1>
          </div>
          <div>
            <p
              className="text-center font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyName}
            </p>
            <p
              className="text-center mb-2 font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyAddress}
            </p>
          </div>
          <div style={{ width: "100%" }}>
            <VesselModule />
          </div>
          <div
            style={{
              width: "100%",
              height: "450px",
              maxHeight: "450px",
              minHeight: "450px",
            }}
          >
            <TableInwardsNote chunkContainers={chunkContainers} />
          </div>
          <div
            style={{
              width: "100%",
            }}
          >
            <p style={{ fontSize: "11px" }}>
              We acknowledge the receipt of goods stated above
            </p>
            <p style={{ fontSize: "11px" }} className="mt-2">
              For <span className="font-bold">{data && data?.companyName}</span>
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1 font-bold">
              {data && data?.createdByName}
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1">
              Authorized signatory
            </p>
            <div style={{ fontSize: "11px" }} className="mt-8">
              <div className="grid grid-cols-3 w-full items-center">
                <p className="text-left">Printed By:</p>
                <p className="text-center">Printed On:</p>
                <p className="text-right">Received By:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const GoodsDeliveryNote = (chunkContainers) => (
    <div>
      <div className="mx-auto text-black">
        <div>
          <div>
            <CompanyImgModule />
          </div>
          <div className="text-center">
            <h1
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "black",
              }}
            >
              GOODS DELIVERY NOTE
            </h1>
          </div>
          <div>
            <p
              className="text-center font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyName}
            </p>
            <p
              className="text-center mb-2 font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyAddress}
            </p>
          </div>
          <div style={{ width: "100%" }}>
            <VesselModuleGoodsDeliveryNote />
          </div>
          <div
            style={{
              width: "100%",
              height: "450px",
              maxHeight: "450px",
              minHeight: "450px",
            }}
          >
            <TableDeliveryNote chunkContainers={chunkContainers} />
          </div>
          <div
            style={{
              width: "100%",
            }}
          >
            <p style={{ fontSize: "11px" }}>
              We acknowledge the receipt of goods stated above
            </p>
            <p style={{ fontSize: "11px" }} className="mt-2">
              For <span className="font-bold">{data && data?.companyName}</span>
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1 font-bold">
              {data && data?.createdByName}
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1">
              Authorized signatory
            </p>
            <div style={{ fontSize: "11px" }} className="mt-8">
              <div className="grid grid-cols-3 w-full items-center">
                <p className="text-left">Printed By:</p>
                <p className="text-center">Printed On:</p>
                <p className="text-right">Received By:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const GoodsReceiptNote = (chunkContainers) => (
    <div>
      <div className="mx-auto text-black">
        <div>
          <div>
            <CompanyImgModule />
          </div>
          <div className="text-center">
            <h1
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "black",
              }}
            >
              GOODS RECEIPT NOTE
            </h1>
          </div>
          <div>
            <p
              className="text-center font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyName}
            </p>
            <p
              className="text-center mb-2 font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyAddress}
            </p>
          </div>
          <div style={{ width: "100%" }}>
            <VesselModuleGoodsReceiptNote />
          </div>
          <div
            style={{
              width: "100%",
              height: "450px",
              maxHeight: "450px",
              minHeight: "450px",
            }}
          >
            <TableGoodsReceiptNote chunkContainers={chunkContainers} />
          </div>
          <div
            style={{
              width: "100%",
            }}
          >
            <p style={{ fontSize: "11px" }}>
              We acknowledge the receipt of goods stated above
            </p>
            <p style={{ fontSize: "11px" }} className="mt-2">
              For <span className="font-bold">{data && data?.companyName}</span>
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1 font-bold">
              {data && data?.createdByName}
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1">
              Authorized signatory
            </p>
            <div style={{ fontSize: "11px" }} className="mt-8">
              <div className="grid grid-cols-3 w-full items-center">
                <p className="text-left">Printed By:</p>
                <p className="text-center">Printed On:</p>
                <p className="text-right">Received By:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const GoodsOutwardNote = (chunkContainers) => (
    <div>
      <div className="mx-auto text-black">
        <div>
          <div>
            <CompanyImgModule />
          </div>
          <div className="text-center">
            <h1
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "black",
              }}
            >
              GOODS OUTWARD NOTE
            </h1>
          </div>
          <div>
            <p
              className="text-center font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyName}
            </p>
            <p
              className="text-center mb-2 font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyAddress}
            </p>
          </div>
          <div style={{ width: "100%" }}>
            <VesselModuleOutward />
          </div>
          <div
            style={{
              width: "100%",
              height: "450px",
              maxHeight: "450px",
              minHeight: "450px",
            }}
          >
            <TableOutwardNote chunkContainers={chunkContainers} />
          </div>
          <div
            style={{
              width: "100%",
            }}
          >
            <p style={{ fontSize: "11px" }}>
              We acknowledge the receipt of goods stated above
            </p>
            <p style={{ fontSize: "11px" }} className="mt-2">
              For <span className="font-bold">{data && data?.companyName}</span>
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1 font-bold">
              {data && data?.createdByName}
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1">
              Authorized signatory
            </p>
            <div style={{ fontSize: "11px" }} className="mt-8">
              <div className="grid grid-cols-3 w-full items-center">
                <p className="text-left">Printed By:</p>
                <p className="text-center">Printed On:</p>
                <p className="text-right">Received By:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  const PurchaseOrderKn = (chunkContainers) => (
    <div>
      <div className="mx-auto text-black">
        <div>
          <div>
            <CompanyImgModule />
          </div>
          <div className="text-center">
            <h1
              style={{
                fontWeight: "bold",
                fontSize: "16px",
                color: "black",
              }}
            >
              PURCHASE ORDER
            </h1>
          </div>
          <div>
            <p
              className="text-center font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyName}
            </p>
            <p
              className="text-center mb-2 font-semibold"
              style={{ fontSize: "11px", color: "black" }}
            >
              {data && data?.companyAddress}
            </p>
          </div>
          <div style={{ width: "100%" }}>
            <VesselPurchaseOrderKn/>
          </div>
          <div
            style={{
              width: "100%",
              height: "450px",
              maxHeight: "450px",
              minHeight: "450px",
            }}
          >
            <TablePurchaseOrderKn chunkContainers={chunkContainers} />
          </div>
          <div
            style={{
              width: "100%",
            }}
          >
            <p style={{ fontSize: "11px" }}>
              We acknowledge the receipt of goods stated above
            </p>
            <p style={{ fontSize: "11px" }} className="mt-2">
              For <span className="font-bold">{data && data?.companyName}</span>
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1 font-bold">
              {data && data?.createdByName}
            </p>
            <p style={{ fontSize: "11px" }} className="mt-1">
              Authorized signatory
            </p>
            <div style={{ fontSize: "11px" }} className="mt-8">
              <div className="grid grid-cols-3 w-full items-center">
                <p className="text-left">Printed By:</p>
                <p className="text-center">Printed On:</p>
                <p className="text-right">Received By:</p>
              </div>
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
          reportIds={reportIds}
          printOrientation="portrait"
        />

        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "GOODS INWARDS NOTE": {
              // ✅ same chunk logic you showed: normalize + always render at least 1 page
              const ginPages = Array.isArray(chunks)
                ? chunks.filter(Boolean)
                : [];
              const pages = ginPages.length > 0 ? ginPages : [undefined];

              return (
                <React.Fragment key={reportId}>
                  {pages.map((chunkContainers, i) => {
                    // ✅ build a unique ref index so multiple pages don't overwrite report refs
                    const refIndex = index + i;

                    return (
                      <div
                        key={`${reportId}-${i}`}
                        ref={(el) => (enquiryModuleRefs.current[refIndex] = el)}
                        className={
                          i < pages.length - 1
                            ? "report-spacing bg-white"
                            : "bg-white"
                        }
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            padding: "8px",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {GoodsInwardsNote({ chunkContainers })}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            }
            case "GOODS DELIVERY NOTE": {
              // ✅ same chunk logic you showed: normalize + always render at least 1 page
              const ginPages = Array.isArray(chunks)
                ? chunks.filter(Boolean)
                : [];
              const pages = ginPages.length > 0 ? ginPages : [undefined];

              return (
                <React.Fragment key={reportId}>
                  {pages.map((chunkContainers, i) => {
                    // ✅ build a unique ref index so multiple pages don't overwrite report refs
                    const refIndex = index + i;

                    return (
                      <div
                        key={`${reportId}-${i}`}
                        ref={(el) => (enquiryModuleRefs.current[refIndex] = el)}
                        className={
                          i < pages.length - 1
                            ? "report-spacing bg-white"
                            : "bg-white"
                        }
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            padding: "8px",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {GoodsDeliveryNote({ chunkContainers })}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            }
            case "GOODS RECEIPT NOTE": {
              const GRN_CHUNK_SIZE = 10;

              // ✅ Extract rows from ANY possible chunk shape
              const getRowsFromChunk = (c) => {
                if (!c) return [];
                if (Array.isArray(c)) return c;

                // most likely keys (try all)
                const candidates = [
                  c.chunkContainers,
                  c.rows,
                  c.data,
                  c.list,
                  c.items,
                  c.details,
                  c.result,
                  c.table,
                  c.containerList,
                ];

                for (const v of candidates) {
                  if (Array.isArray(v)) return v;
                }

                // fallback: if it has ONLY one array prop, use it
                const firstArrayKey = Object.keys(c).find((k) => Array.isArray(c[k]));
                if (firstArrayKey) return c[firstArrayKey];

                return [];
              };

              const buildChunks = (arr, size) => {
                const out = [];
                for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
                return out;
              };

              // ✅ DEBUG (keep for now)
              console.log("[GRN] chunks type:", Array.isArray(chunks) ? "array" : typeof chunks);
              console.log("[GRN] chunks length:", Array.isArray(chunks) ? chunks.length : 0);
              console.log("[GRN] chunks[0] keys:", chunks?.[0] ? Object.keys(chunks[0]) : "no chunks[0]");
              console.log("[GRN] chunks[0] preview:", chunks?.[0]);

              // ✅ 1) Flatten all rows from existing `chunks`
              const allRows = Array.isArray(chunks)
                ? chunks.filter(Boolean).flatMap(getRowsFromChunk)
                : [];

              console.log("[GRN] allRows length:", allRows.length);
              console.log("[GRN] allRows[0] preview:", allRows?.[0]);

              // ✅ 2) Re-chunk ONLY for GRN into 10
              const pagesRaw = buildChunks(allRows, GRN_CHUNK_SIZE);

              // ✅ 3) Convert to EXACT shape your TableGoodsReceiptNote expects
              const pages =
                pagesRaw.length > 0
                  ? pagesRaw.map((arr) => ({ chunkContainers: arr }))
                  : [{ chunkContainers: [] }];

              console.log("[GRN] pages:", pages.length);

              return (
                <React.Fragment key={reportId}>
                  {pages.map((chunkObj, i) => {
                    const refIndex = index + i;

                    return (
                      <div
                        key={`${reportId}-${i}`}
                        ref={(el) => (enquiryModuleRefs.current[refIndex] = el)}
                        className={i < pages.length - 1 ? "report-spacing bg-white" : "bg-white"}
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            padding: "8px",
                            boxSizing: "border-box",
                            fontFamily: "Arial, sans-serif",
                          }}
                        >
                          {/* ✅ pass the chunk object directly */}
                          {GoodsReceiptNote(chunkObj)}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            }
            case "GOODS OUTWARDS NOTE": {
              // ✅ same chunk logic you showed: normalize + always render at least 1 page
              const ginPages = Array.isArray(chunks)
                ? chunks.filter(Boolean)
                : [];
              const pages = ginPages.length > 0 ? ginPages : [undefined];

              return (
                <React.Fragment key={reportId}>
                  {pages.map((chunkContainers, i) => {
                    // ✅ build a unique ref index so multiple pages don't overwrite report refs
                    const refIndex = index + i;

                    return (
                      <div
                        key={`${reportId}-${i}`}
                        ref={(el) => (enquiryModuleRefs.current[refIndex] = el)}
                        className={
                          i < pages.length - 1
                            ? "report-spacing bg-white"
                            : "bg-white"
                        }
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            padding: "8px",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {GoodsOutwardNote({ chunkContainers })}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            }
            case "Purchase Order KN": {
              // ✅ same chunk logic you showed: normalize + always render at least 1 page
              const ginPages = Array.isArray(chunks)
                ? chunks.filter(Boolean)
                : [];
              const pages = ginPages.length > 0 ? ginPages : [undefined];

              return (
                <React.Fragment key={reportId}>
                  {pages.map((chunkContainers, i) => {
                    // ✅ build a unique ref index so multiple pages don't overwrite report refs
                    const refIndex = index + i;

                    return (
                      <div
                        key={`${reportId}-${i}`}
                        ref={(el) => (enquiryModuleRefs.current[refIndex] = el)}
                        className={
                          i < pages.length - 1
                            ? "report-spacing bg-white"
                            : "bg-white"
                        }
                        style={{
                          width: "210mm",
                          height: "297mm",
                          margin: "auto",
                          boxSizing: "border-box",
                          padding: "5mm",
                          display: "flex",
                          flexDirection: "column",
                          marginBottom: "22px",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            width: "100%",
                            padding: "8px",
                            boxSizing: "border-box",
                            fontFamily: "Arial sans-serif !important",
                          }}
                        >
                          {PurchaseOrderKn({ chunkContainers })}
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            }
            default:
              return null;
          }
        })}
      </div>
    </main>
  );
}
//AKASH
export default rptWarehouse;
