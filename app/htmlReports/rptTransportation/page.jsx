"use client";
/* eslint-disable */
import React, { useEffect, useState, useMemo, useRef } from "react";
import { toWords } from "number-to-words";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import { useSearchParams } from "next/navigation";
import PropTypes from "prop-types";
import { fetchDataAPI } from "@/services/auth/FormControl.services";
import { decrypt } from "@/helper/security";
import jsPDF from "jspdf"; // Import jsPDF
import "jspdf-autotable"; // Import AutoTable plugin
import html2canvas from "html2canvas";
import { printPDF } from "@/services/auth/FormControl.services";
import { BorderBottom, BorderLeft, Portrait } from "@mui/icons-material";
import "./rptTransportation.css";
import Print from "@/components/Print/page";
const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
import { applyTheme } from "@/utils";

function rptTransportation() {
  const searchParams = useSearchParams();
  const [reportIds, setReportIds] = useState([]);
  const [data, setData] = useState([]);
  const [CompanyHeader, setCompanyHeader] = useState("");
  const [ImageUrl, setImageUrl] = useState("");
  const [companyname, setCompanyname] = useState(null);
  const enquiryModuleRef = useRef();
  const [html2pdf, setHtml2pdf] = useState(null);
  const enquiryModuleRefs = useRef([]);

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

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const _id = searchParams.get("reportId");
  //     console.log(_id);
  //     if (_id != null) {
  //       try {
  //         const token = localStorage.getItem("token");
  //         if (!token) throw new Error("No token found");
  //         const response = await fetch(
  //           `${baseUrl}/api/reports/vehicleRouteReport`,
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //               "x-access-token": JSON.parse(token),
  //             },
  //             body: JSON.stringify({
  //               projection: {},
  //               _id: _id,
  //             }),
  //           }
  //         );
  //         if (!response.ok) throw new Error("Failed to fetch job data");
  //         const data = await response.json();
  //         //console.log('Fetched data: NEWWWWW', data.data[0].brachId);
  //         setData(data.data);
  //         setCompanyHeader(data.data[0].brachId);
  //       } catch (error) {
  //         console.error("Error fetching job data:", error);
  //       }
  //     }
  //   };
  //   if (reportIds.length > 0) {
  //     fetchData();
  //   }
  // }, [reportIds]);

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
          if (!response.ok) throw new Error("Failed to fetch job data");
          const data = await response.json();
          setData(data.data);
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
        const BranchId = userData[0].defaultBranchId;
        const clientCode = userData[0].clientCode;
        const requestBody = {
          tableName: "tblCompanyBranchParameter",
          whereCondition: {
            status: 1,
            companyBranchId: BranchId,
            clientCode: clientCode,
          },
          projection: {
            tblCompanyBranchParameterDetails: 1,
          },
        };
        try {
          const dataURl = await fetchDataAPI(requestBody);
          const response = dataURl.data;
          if (
            response &&
            response.length > 0 &&
            response[0].tblCompanyBranchParameterDetails.length > 0
          ) {
            const headerUrl =
              response[0].tblCompanyBranchParameterDetails[0].header;
            //setImageUrl(headerUrl);
          } else {
            console.error("No valid data received");
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      }
    };
    fetchHeader();
  }, [CompanyHeader]);

  useEffect(() => {
    const fetchHeader = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const headerLogoPath = userData[0]?.headerLogoPath;
        const companyName = userData[0]?.companyName;
        if (headerLogoPath) {
          setImageUrl(headerLogoPath);
        }
        if (companyName) {
          setCompanyname(companyName);
        }

        applyTheme(enquiryModuleRefs.current);
      }
    };
    fetchHeader();
  }, [reportIds]);

  console.log("report Data", data);

  const deliveryNoteStyles = `
    .table-container {
      width: 100%;
      border: 1px solid black;
    }
    .table-container table {
      width: 100%;
      border-collapse: collapse;
    }
    .table-container th,
    .table-container td {
      border: 1px solid black;
      padding: 4px;
      text-align: center;
    }
    .flex-container {
      display: flex;
      flex-wrap: wrap;
    }
    .flex-item {
      width: 33.33%;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      border-right: 1px solid black;
    }
    .flex-item:last-child {
      border-right: none;
    }
    .table-no-border th,
    .table-no-border td {
      border: none;
    }
    .custom-font {
      font-size: 9px !important;
    }
  `;

  console.log("data =>>>>", data);
  const CompanyImgModule = () => {
    return (
      <img
        src={`${baseUrlNext}${ImageUrl}`}
        alt="LOGO"
        className="w-full"
      ></img>
    );
  };
  const PageFooter = () => {
    return (
      <div
        style={{
          display: "flex", // Use flexbox layout
          flexDirection: "column", // Stack content vertically
          height: "100%", // Ensure container takes up full available height
        }}
      >
        {/* Signature Table */}
        <div
          style={{
            borderTop: "1px solid black",
            borderBottom: "1px solid black",
          }}
        >
          <table className="custom-font text-left w-full text-center table-fixed">
            <thead>
              <tr>
                <th className="pr-5 pt-1 pb-1">For,</th>
                <th className="pr-5 pt-1 pb-1">Driver Name</th>
                <th className="pr-5 pt-1 pb-1">Deliver to </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pr-5 pt-1 pb-1 ">{companyname}</td>
                <td className="pr-5 pt-1 pb-1 ">
                  {data && data.length > 0 ? data[0].driverName : ""}
                </td>
                <td className="pr-5 pt-1 pb-1 ">
                  {data && data.length > 0 ? data[0].deliverToName : ""}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          style={{
            borderBottom: "1px solid black",
          }}
          className="mt-10"
        >
          <table className="mt-1 custom-font text-left w-full text-center table-fixed">
            <thead>
              <tr>
                <th className="pr-5 pt-2 pb-2">Signature</th>
                <th className="pr-5 pt-2 pb-2">Signature</th>
                <th className="pr-5 pt-2 pb-2">Signature</th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="p-2 custom-font">
          <p>
            {" "}
            All payments should be payable to CARGO MOVERS LOGISTICS LIMITED
            through bank credit on receipt. Unless notified within 4 working
            days on receipt, the bill and its contents will be deemed as
            correct. All Business of whatsoever nature, be it as agents or
            principal, with any party whatsoever, shall solely be conducted in
            accordance with RHA Standard Trading Conditions. These conditions
            have clauses which may limit or exclude our liability, and a copy is
            available on request. VAT:448654164, REG ENGLAND:14996609
          </p>
        </div>
      </div>
    );
  };

  const PageFooterRD = () => {
    return (
      <div
        style={{
          display: "flex", // Use flexbox layout
          flexDirection: "column", // Stack content vertically
          height: "100%", // Ensure container takes up full available height
        }}
      >
        {/* Signature Table */}
        <div>
          <table className="text-xs w-full text-right table-fixed">
            <thead>
              <tr>
                <th className="pr-5 pt-2 pb-2">
                  For, {data && data.length > 0 ? data[0].ownCompanyName : ""}
                </th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>

        <div
          style={{
            borderBottom: "1px solid black",
          }}
          className="mt-5"
        >
          <table className="mt-1 text-xs w-full text-right table-fixed">
            <thead>
              <tr>
                <th className="pr-5 pt-2 pb-2">Authorized Signatory </th>
              </tr>
            </thead>
          </table>
        </div>
        <div className="p-2 text-xs">
          <p>
            {" "}
            All payments should be payable to CARGO MOVERS LOGISTICS LIMITED
            through bank credit on receipt. Unless notified within 4 working
            days on receipt, the bill and its contents will be deemed as
            correct. All Business of whatsoever nature, be it as agents or
            principal, with any party whatsoever, shall solely be conducted in
            accordance with RHA Standard Trading Conditions. These conditions
            have clauses which may limit or exclude our liability, and a copy is
            available on request. VAT:448654164, REG ENGLAND:14996609
          </p>
        </div>
      </div>
    );
  };

  const handlePrintDeliveryNote = async (data) => {
    const uniqueVehicleOrderNos = new Set(
      data.map((item) => item.vehicleOrderNo).filter((orderNo) => orderNo) // Filter to exclude undefined or null values
    );
    const pageDisplayed = uniqueVehicleOrderNos.size;
    const element = enquiryModuleRef.current;

    // Wrap the content into pages
    const pageContent = element.innerHTML;
    let contentHtml = "";
    for (let i = 0; i < pageDisplayed; i++) {
      contentHtml += `
        <div>
          ${pageContent}
        </div>
      `;
    }

    const initialHtml =
      "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><style>.custom-font {font-size: 9px !important;}</style></head><body>";
    const finalHtml = "</body></html>";
    const html = initialHtml + contentHtml + finalHtml;
    const pdfName = reportIds;

    const requestBody = {
      orientation: "Portrait",
      pdfFilename: pdfName,
      htmlContent: html,
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

  const handlePrint = async () => {
    const element = enquiryModuleRef.current;
    const initialHtml =
      "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><style>.custom-font {font-size: 9px !important;}</style></head><body>";
    const finalHtml = "</body></html>";
    const html = initialHtml + element.innerHTML + finalHtml;
    const pdfName = reportIds;

    const requestBody = {
      orientation: "Portrait",
      pdfFilename: pdfName,
      htmlContent: html,
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const routeDetailsRpt = () => {
    console.log("data", data);
    const vehicleRouteDetails = data?.[0]?.tblVehicleRouteDetails || [];
    return (
      <div
        style={{ BorderBottom: "1px solid black" }}
        className="m-4 text-black border border-black"
      >
        <div className="mt-9 ml-1">
          <CompanyImgModule />
        </div>
        <div
          style={{
            borderTop: "1px solid black",
            borderBottom: "1px solid black",
          }}
        >
          {/* Heading */}
          <h1 className="text-center font-bold text-2xl pt-2 pb-2">
            Loading Sheet
          </h1>
        </div>
        {/* Top Table */}
        <div className="flex flex-wrap">
          <div className="w-1/2 px-2">
            <table className="mt-1 mb-1 text-left custom-font">
              <tbody>
                <tr>
                  <td className="p-1">Routing No. :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].routeNo : ""}
                  </td>
                </tr>
                <tr className="mt-2">
                  <td className="p-1">Vehicle Type :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].vehicleTypeCode : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Driver Name :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].driverName : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Actual Departure Date :</td>
                  <td className="p-1">
                    {data &&
                      data.length > 0 &&
                      formatDate(
                        data[0].tblVehicleRouteDetails[0].actualDepartureDate
                      )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-1/2 px-2">
            <table className="mt-1  text-left custom-font">
              <tbody>
                <tr>
                  <td className="p-1">Routing date :</td>
                  <td className="p-1">
                    {data && data.length > 0 && formatDate(data[0].routeDate)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Vehicle No :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].vehicleName : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Expected Arrival Date :</td>
                  <td className="p-1">
                    {data &&
                      data.length > 0 &&
                      formatDate(
                        data[0].tblVehicleRouteDetails[0].actualArrivalDate
                      )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Grid Table */}
        <div className="w-full mt-5" style={{ height: "450px" }}>
          <table
            className="mt-1 custom-font text-left text-center table-auto"
            style={{ width: "100%", overflow: "auto", tableLayout: "fixed" }}
          >
            <thead className="bg-gray-200 custom-font">
              <tr>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Sr No.
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Order No.
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Order Date
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Customer Name
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Pickup Address
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Deliver To
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Delivery Address
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  No. of Packages
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Gross Weight
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Unloaded Weight
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Remarks
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Date of Arrival
                </th>
                <th className="pt-2 pb-2 border border-black custom-font">
                  Signature
                </th>
              </tr>
            </thead>
            <tbody>
              {vehicleRouteDetails.map((route, index) => (
                <tr key={index} className="custom-font">
                  <td className=" pt-2 pb-2 border border-black custom-font">
                    {index + 1}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {route.vehicleOrderNo || ""}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {formatDate(route.actualDepartureDate || "")}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {route.customerName || ""}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {route.pickupLocationAddress || ""}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {route.deliverToName || ""}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {route.deliveryLocationAddress || ""}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {route.tblVehicleOrderDetails?.[0]?.noOfPackages || ""}{" "}
                    {route.tblVehicleOrderDetails?.[0]?.typesOfPackagesName ||
                      ""}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {route.grossWt || ""}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {route.unloadedWeight || ""}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {route.remarks || ""}
                  </td>
                  <td
                    style={{
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                    className="pt-2 pb-2 border border-black custom-font"
                  >
                    {formatDate(route.actualArrivalDate) || ""}
                  </td>
                  <td className="pt-2 pb-2 border border-black custom-font">
                    {""}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot></tfoot>
          </table>
        </div>

        <footer
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <PageFooterRD />
        </footer>
      </div>
    );
  };

  const deliveryNoteRpt = () => {
    console.log("data", data);

    // Assuming `data` is already available
    const vehicleRouteDetails = data?.[0]?.vehicleRouteDetails || [];
    console.log("vehicleRouteDetails", vehicleRouteDetails);

    // Calculate totals
    const totalNoOfPackages = vehicleRouteDetails.reduce((total, route) => {
      return total + (route?.noOfPackages || 0);
    }, 0);

    const totalGrossWeight = vehicleRouteDetails.reduce((total, route) => {
      return total + (route?.grossWt || 0);
    }, 0);

    const totalLoadedWeight = vehicleRouteDetails.reduce((total, route) => {
      return total + (route.loadedWeight || 0);
    }, 0);

    const totalUnloadedWeight = vehicleRouteDetails.reduce((total, route) => {
      return total + (route.unloadedWeight || 0);
    }, 0);

    return (
      <div className="m-4 text-black border border-black">
        <div className="ml-1">
          <CompanyImgModule />
        </div>
        <div
          style={{
            borderTop: "1px solid black",
            borderBottom: "1px solid black",
          }}
        >
          {/* Heading */}
          <h1 className="text-center font-bold text-2xl pt-1 pb-1">
            Delivery Note
          </h1>
        </div>

        {/* Top Table */}
        <div className="flex flex-wrap">
          <div className="w-3/5 px-2">
            <table className="mt-1 mb-1 text-left custom-font ">
              <tbody>
                <tr>
                  <td className="p-1">Customer :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].customerName : ""}
                  </td>
                </tr>
                <tr className="mt-2">
                  <td className="p-1">Pickup address :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].pickupAddress : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Deliver to :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].deliverTo : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Deliver Address :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].deliveryAddress : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Expected Departure Date :</td>
                  <td className="p-1">
                    {data &&
                      data.length > 0 &&
                      formatDate(data[0].expectedDeliveryDate)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Expected Arrival Date :</td>
                  <td className="p-1">
                    {data &&
                      data.length > 0 &&
                      formatDate(data[0].expectedPickupDate)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Expected PickUp Date :</td>
                  <td className="p-1">
                    {data && data.length > 0 && formatDate(data[0].etd)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="w-2/5 px-2">
            <table className="mt-1  text-left custom-font">
              <tbody>
                <tr>
                  <td className="p-1">Vehicle No :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].vehicleName : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Vehicle Order No :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].vehicleOrderNo : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Vehicle Order Date :</td>
                  <td className="p-1">
                    {data &&
                      data.length > 0 &&
                      formatDate(data[0].vehicleOrderDate)}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Vehicle Type :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].vehicleCode : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Driver Name :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].driverName : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Reference No :</td>
                  <td className="p-1">
                    {data && data.length > 0 ? data[0].referenceNo : ""}
                  </td>
                </tr>
                <tr>
                  <td className="p-1">Expected Delivery Date :</td>
                  <td className="p-1">
                    {data && data.length > 0 && formatDate(data[0].etaAtPod)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Grid Table */}
        <div style={{ height: "400px" }}>
          <table className="mt-1 custom-font text-left w-full text-center table-auto">
            <thead className="bg-gray-200">
              <tr>
                <th className="pr-2 pt-2 pb-2 border-t border-b border-r  border-black">
                  Sr No
                </th>
                <th className="pr-2 pt-2 pb-2 border border-black">
                  Cargo Details
                </th>
                <th className="pr-2 pt-2 pb-2 border border-black">
                  No. of Packages
                </th>
                <th className="pr-2 pt-2 pb-2 border border-black">
                  Gross Weight
                </th>
                <th className="pr-2 pt-2 pb-2 border border-black">volume</th>
                <th className="pr-2 pt-2 pb-2 border border-black">
                  Loaded Weight
                </th>
                <th className="pr-2 pt-2 pb-2 border border-black">
                  Unloaded Weight
                </th>
                <th className="pr-2 pt-2 pb-2 border border-black">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {vehicleRouteDetails.map((route, index) => (
                <tr key={index}>
                  <td className="pr-5 pt-2 pb-2 border-t border-b border-r border-black">
                    {index + 1}
                  </td>
                  <td className="pr-5 pt-2 pb-2 border border-black">
                    {data && data.length > 0 ? data[0]?.CommodityText : ""}
                  </td>
                  <td className="pr-5 pt-2 pb-2 border border-black">
                    {route?.noOfPackages || ""}{" "}
                    {route?.typesOfPackagesName || ""}
                  </td>
                  <td className="pr-5 pt-2 pb-2 border border-black">
                    {data && data.length > 0 ? data[0]?.grossWt : ""}{" "}
                    {data && data.length > 0 ? data[0]?.wtUnit : ""}
                  </td>
                  <td className="pr-5 pt-2 pb-2 border border-black">
                    {data && data.length > 0 ? data[0]?.volume : ""}{" "}
                    {data && data.length > 0 ? data[0]?.volumeUnit : ""}
                  </td>
                  <td className="pr-5 pt-2 pb-2 border border-black">
                    {route.loadedWeight || ""}
                  </td>
                  <td className="pr-5 pt-2 pb-2 border border-black">
                    {route.unloadedWeight || ""}
                  </td>
                  <td className="pr-5 pt-2 pb-2 border border-black">
                    {route?.remarks || ""}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* <tfoot>
              <tr>
                <th className="pr-5 pt-2 pb-2 border border-black"></th>
                <th className="pr-5 pt-2 pb-2 border border-black">TOTAL</th>
                <th className="pr-5 pt-2 pb-2 border border-black">
                  {totalNoOfPackages}
                </th>
                <th className="pr-5 pt-2 pb-2 border border-black">
                  {totalGrossWeight}
                </th>
                <th className="pr-5 pt-2 pb-2 border border-black">
                  {totalLoadedWeight}
                </th>
                <th className="pr-5 pt-2 pb-2 border border-black">
                  {totalUnloadedWeight}
                </th>
                <th className="pr-5 pt-2 pb-2 border border-black"></th>
                <th className="pr-5 pt-2 pb-2 border border-black"></th>
              </tr>
            </tfoot> */}
          </table>
        </div>
        <footer
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          <PageFooter />
        </footer>
      </div>
    );
  };

  return (
    <main className="bg-gray-200">
      <div className="p-4">
        <Print
          //key={reportId}
          enquiryModuleRefs={enquiryModuleRefs}
          reportIds={reportIds}
          printOrientation="portrait"
        />
      </div>
      <div
        style={{
          display: "flex", // Enables flexbox
          justifyContent: "center", // Centers horizontally
          alignItems: "center",
        }}
      >
        {reportIds.map((reportId, index) => {
          switch (reportId) {
            case "Route Details":
              return (
                <div
                  key={index}
                  ref={enquiryModuleRef}
                  className={
                    index < reportIds.length - 1 ? "report-spacing" : ""
                  }
                  style={{
                    width: "210mm", // A4 width in millimeters
                    height: "297mm", // A4 height in millimeters
                    backgroundColor: "white", // Optional for clarity
                    marginBottom: "20px",
                  }}
                >
                  {routeDetailsRpt()}
                </div>
              );
            case "Delivery Note":
              return (
                <div
                  key={index}
                  ref={(el) => (enquiryModuleRefs.current[index] = el)}
                  className={
                    index < reportIds.length - 1 ? "report-spacing" : ""
                  }
                  style={{
                    width: "210mm", // A4 width in millimeters
                    height: "297mm", // A4 height in millimeters
                    backgroundColor: "white", // Optional for clarity
                    marginBottom: "20px",
                    pageBreakAfter:
                      index < reportIds.length - 1 ? "always" : "auto",
                  }}
                >
                  {/* Inject styles directly into component */}
                  <style>{deliveryNoteStyles}</style>
                  {deliveryNoteRpt()}
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
//Abhi
export default rptTransportation;
