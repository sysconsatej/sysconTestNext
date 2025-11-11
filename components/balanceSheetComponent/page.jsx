/* eslint-disable */
import React, { useEffect, useState, useMemo } from "react";
import "./BalanceSheet.css";
import { BorderRight } from "@mui/icons-material";
import { useThemeProvider } from "@/context/themeProviderDataContext";
import {
  createAddEditPaperStyles,
  displayReportTableContainerStyles,
  displayReportTablePaperStyles,
  displayReportTablePaperToggleStyles,
  displayReportTableContainerToggleStyles,
  displaytableHeadStyles,
  displaytableRowStyles,
  displayTableContainerStyles,
  searchInputStyling,
} from "@/app/globalCss";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import {
  displayTablePaperStyles,
  displayTableRowStylesNoHover,
} from "@/app/globalCss";
import styles from "@/app/app.module.css";
import Link from "next/link";

function BalanceSheetComponent({ data1, data2, reportTypeData, excelTest }) {
  const [totalAssets, setTotalAssets] = useState(0);
  const [totalLiabilities, setTotalLiabilities] = useState(0);
  const [reportData, setReportData] = useState({
    assetsData: [],
    liabilityData: [],
    totalAssets: 0,
    totalLiabilities: 0,
  });
  const [reportType, setReportType] = useState(reportTypeData);
  const { initializeTheme, toggledThemeValue } = useThemeProvider();
  //
  const [toggle, setToggle] = useState(true);

  // Set report type if it changes
  useEffect(() => {
    setReportType(reportTypeData);
  }, [reportTypeData]);

  useEffect(() => {
    const TestData = async () => {
      alert("SECOND Page");
    };
    if (excelTest === "y") {
      TestData();
    }
  }, [excelTest]);

  // Process and update balance sheet data when reportType or balanceSheetData changes
  useEffect(() => {
    if (!data1 && !data2) return;

    let assets, liabilities;

    if (reportType === "S") {
      assets = data1
        .filter((item) =>
          item.Balance_Sheet_Group.toLowerCase().includes("assets")
        )
        .sort((a, b) => {
          // Check if either item is "Net Loss"
          const isNetLossA = a.tbGroupName.toLowerCase().includes("net loss");
          const isNetLossB = b.tbGroupName.toLowerCase().includes("net loss");

          // Place "Net Loss" at the end
          if (isNetLossA && !isNetLossB) return 1; // a goes after b
          if (!isNetLossA && isNetLossB) return -1; // b goes after a

          // Otherwise, sort alphabetically
          return a.tbGroupName.localeCompare(b.tbGroupName);
        });
      liabilities = data2
        .filter((item) =>
          item.Balance_Sheet_Group.toLowerCase().includes("liability")
        )
        .sort((a, b) => {
          // Check if either item is "Net Profit"
          const isNetProfitA = a.tbGroupName
            .toLowerCase()
            .includes("net profit");
          const isNetProfitB = b.tbGroupName
            .toLowerCase()
            .includes("net profit");

          // Place "Net Profit" at the end
          if (isNetProfitA && !isNetProfitB) return 1; // a goes after b
          if (!isNetProfitA && isNetProfitB) return -1; // b goes after a

          // Otherwise, sort alphabetically
          return a.tbGroupName.localeCompare(b.tbGroupName);
        });
    } else if (reportType === "D") {
      assets = data1
        .filter((item) =>
          item.Balance_Sheet_Group.toLowerCase().includes("assets")
        )
        .sort((a, b) => a.tbGroupName.localeCompare(b.tbGroupName));
      liabilities = data2
        .filter((item) =>
          item.Balance_Sheet_Group.toLowerCase().includes("liability")
        )
        .sort((a, b) => a.tbGroupName.localeCompare(b.tbGroupName));
    }

    // Calculate total as the net balance of positive and negative values
    if (reportType === "S") {
      const totalAssets = assets.reduce((sum, asset) => {
        if (asset.tbGroupName.toLowerCase().includes("net loss")) {
          return sum - asset.Amount; // Subtract "Net Loss" amount
        }
        return sum + asset.Amount; // Add other amounts
      }, 0);
      const totalLiabilities = liabilities.reduce(
        (sum, liability) => sum + liability.Amount,
        0
      );
      setTotalAssets(totalAssets);
      setTotalLiabilities(totalLiabilities);
      setReportData({
        assetsData: assets,
        liabilityData: liabilities,
        totalAssets,
        totalLiabilities,
      });
    } else if (reportType === "D") {
      const totalAssets = assets.reduce(
        (sum, asset) => sum + asset.TBAmount,
        0
      );
      const totalLiabilities = liabilities.reduce((sum, liability, index) => {
        const newSum = sum + liability.TBAmount;
        //console.log(`Step ${index + 1}: Adding ${liability.TBAmount} => Running Total: ${newSum}`);
        return newSum;
      }, 0);
      setTotalAssets(totalAssets);
      setTotalLiabilities(totalLiabilities);
      setReportData({
        assetsData: assets,
        liabilityData: liabilities,
        totalAssets,
        totalLiabilities,
      });
    }
  }, [data1 || data2, reportType]);

  // Render grouped rows with subtotals
  const renderGroupedRows = useMemo(() => {
    return (data) => {
      let groupedRows = [];
      let currentGroup = null;
      let currentSubGroup1 = null;
      let currentSubGroup2 = null;

      data.forEach((item, index) => {
        const isNewGroup = item.tbGroupName !== currentGroup;
        const isNewSubGroup1 =
          item.Sub_Group_1 !== currentSubGroup1 ||
          item.tbGroupName !== currentGroup;
        const isNewSubGroup2 =
          item.Sub_Group_2 !== currentSubGroup2 ||
          item.Sub_Group_1 !== currentSubGroup1;
        const isSubtotal =
          item.Sub_Group_1 && item.Sub_Group_1.includes("SUBTOTAL (");

        if (isNewGroup) {
          currentGroup = item.tbGroupName;
        }
        if (isNewSubGroup1) {
          currentSubGroup1 = item.Sub_Group_1;
        }
        if (isNewSubGroup2) {
          currentSubGroup2 = item.Sub_Group_2;
        }

        // Calculate rowSpan for Sub_Group_1
        const subGroup1RowSpan = data.filter(
          (d) =>
            d.tbGroupName === item.tbGroupName &&
            d.Sub_Group_1 === item.Sub_Group_1
        ).length;

        // Calculate rowSpan for Sub_Group_2
        const subGroup2RowSpan = data.filter(
          (d) =>
            d.tbGroupName === item.tbGroupName &&
            d.Sub_Group_1 === item.Sub_Group_1 &&
            d.Sub_Group_2 === item.Sub_Group_2
        ).length;

        groupedRows.push(
          <TableRow
            style={{ border: "1px solid grey" }}
            className={`${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
            sx={{
              ...(toggledThemeValue
                ? displayTableRowStylesNoHover
                : displaytableRowStyles),
            }}
            key={index}
          >
            {/* Merge cells for tbGroupName */}
            {isNewGroup ? (
              <TableCell
                style={{ border: "1px solid grey" }}
                className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
                rowSpan={
                  data.filter((d) => d.tbGroupName === item.tbGroupName).length
                }
              >
                <Link
                  href={`/accountingReports/trialBalance?reportType=D&balanceType=E`}
                  className="text-[#0766ad] hover:underline cursor-pointer"
                  title={`Open Trial Balance: ${item.tbGroupName ?? ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.tbGroupName}
                </Link>
              </TableCell>
            ) : null}
            {/* Merge cells for Sub_Group_1 based on Sub_Group_2 */}
            {isNewSubGroup1 ? (
              <TableCell
                className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
                rowSpan={subGroup1RowSpan}
                style={{
                  //backgroundColor: isSubtotal ? "#7e9bcf" : null, // Highlight subtotal rows
                  fontWeight: isSubtotal ? "bold" : "normal", // Font Weight for subtotal rows
                  wordWrap: "break-word", // Wrap long words
                  whiteSpace: "normal", // Allow text to break onto the next line
                  border: "1px solid grey",
                }}
              >
                {/* Conditionally render a link only if it's not a SUBTOTAL row */}
                {!isSubtotal ? (
                  <Link
                    href={{
                      pathname: "/accountingReports/ledgerReport",
                      query: { gl_id: btoa(item.gl_id) }, // Encode the ID
                    }}
                  >
                    {item.Sub_Group_1}
                  </Link>
                ) : (
                  item.Sub_Group_1 // Render plain text for SUBTOTAL rows
                )}
              </TableCell>
            ) : null}
            {/* Merge cells for Sub_Group_2 based on Sub_Group_3 */}
            {isNewSubGroup2 ? (
              <TableCell
                className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
                rowSpan={subGroup2RowSpan}
                style={{
                  //backgroundColor: isSubtotal ? "#7e9bcf" : null,
                  fontWeight: isSubtotal ? "bold" : "normal",
                  wordWrap: "break-word", // Wrap long words
                  whiteSpace: "normal",
                  border: "1px solid grey",
                }}
              >
                <Link
                  href={{
                    pathname: "/accountingReports/ledgerReport",
                    query: { gl_id: btoa(item.gl_id) }, // Encode the ID
                  }}
                >
                  {item.Sub_Group_2 || " "}
                </Link>
              </TableCell>
            ) : null}
            {/* Sub_Group_3 column */}
            {/* Sub_Group_3 column */}
            <TableCell
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              style={{
                //backgroundColor: isSubtotal ? "#7e9bcf" : null,
                fontWeight: isSubtotal ? "bold" : "normal",
                wordWrap: "break-word", // Wrap long words
                whiteSpace: "normal",
                border: "1px solid grey",
              }}
            >
              <Link
                href={{
                  pathname: "/accountingReports/ledgerReport",
                  query: { gl_id: btoa(item.gl_id) }, // Encode the ID
                }}
              >
                {item.Sub_Group_3 || " "}
              </Link>
            </TableCell>
            <TableCell
              className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white"
              style={{
                //backgroundColor: isSubtotal ? "#7e9bcf" : null, // Highlight subtotal rows
                fontWeight: isSubtotal ? "bold" : "normal", // Font Weight for subtotal rows
                padding: "0 0px 0 0 !important",
                textAlign: "right !important",
                border: "1px solid grey",
              }}
            >
              {item.Amount != null
                ? item.Amount < 0
                  ? `(-${Math.abs(item.Amount).toFixed(2)})` // Show negative numbers with minus sign and in parentheses
                  : item.Amount.toFixed(2) // Show positive numbers normally
                : null}
            </TableCell>

            <TableCell
              className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white"
              style={{
                //backgroundColor: isSubtotal ? "#7e9bcf" : null, // Highlight subtotal rows
                fontWeight: isSubtotal ? "bold" : "normal", // Font Weight for subtotal rows
                border: "1px solid grey",
                padding: "0 0px 0 0 !important",
                textAlign: "right !important",
              }}
            >
              {item.Amount1 != null
                ? item.Amount1 < 0
                  ? `(-${Math.abs(item.Amount1).toFixed(2)})` // Show negative numbers with minus sign and in parentheses
                  : item.Amount1.toFixed(2) // Show positive numbers normally
                : null}
            </TableCell>

            {/* TBAmount column */}
            <TableCell
              className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white"
              style={{
                //backgroundColor: isSubtotal ? "#7e9bcf" : null, // Highlight subtotal rows
                fontWeight: isSubtotal ? "bold" : "normal", // Font Weight for subtotal rows
                border: "1px solid grey",
                padding: "0 0px 0 0 !important",
                textAlign: "right !important",
              }}
            >
              {item.TBAmount != null
                ? item.TBAmount < 0
                  ? `(-${Math.abs(item.TBAmount).toFixed(2)})` // Show negative numbers with minus sign and in parentheses
                  : item.TBAmount.toFixed(2) // Show positive numbers normally
                : null}
            </TableCell>
          </TableRow>
        );
      });

      return groupedRows;
    };
  }, [reportData]);

  // Table for Summary view
  // const SummaryTable = ({
  //   data,
  //   total,
  //   title,
  //   totalAssets,
  //   totalLiabilities,
  //   maxRowCount,
  // }) => {
  //   const isProfit = totalAssets >= totalLiabilities;
  //   const netValue = Math.abs(totalAssets - totalLiabilities).toLocaleString(
  //     undefined,
  //     {
  //       minimumFractionDigits: 2,
  //       maximumFractionDigits: 2,
  //     }
  //   );

  //   const fontColor = toggledThemeValue ? "white" : "black";

  //   const filteredData = data.filter((item) => item.Amount !== 0);
  //   const rowDiff = maxRowCount - filteredData.length;
  //   const filledData = [
  //     ...filteredData,
  //     ...Array(rowDiff).fill({ tbGroupName: "\u00A0", Amount: "\u00A0" }),
  //   ];

  //   return (
  //     <table className="table">
  //       <thead>
  //         <tr>
  //           <th
  //             className="sticky-header"
  //             style={{
  //               color: "white", // Always white
  //               backgroundColor: "#0766ad", // Example background for contrast
  //             }}
  //           >
  //             {title}
  //           </th>
  //           <th
  //             className="sticky-header"
  //             style={{
  //               color: "white", // Always white
  //               backgroundColor: "#0766ad", // Example background for contrast
  //             }}
  //           ></th>
  //         </tr>
  //       </thead>
  //       <tbody>
  //         {filledData.map((item, index) => (
  //           <tr key={index}>
  //             <td
  //               className={`text-black ${
  //                 item?.tbGroupName?.toLowerCase().includes("net loss")
  //                   ? "bold-text bg-gray-200"
  //                   : ""
  //               }`}
  //               style={{ color: fontColor }}
  //             >
  //               {item?.tbGroupName || ""}
  //             </td>
  //             <td
  //               className={`text-right text-black ${
  //                 item?.tbGroupName?.toLowerCase().includes("net loss")
  //                   ? "bg-gray-200"
  //                   : ""
  //               }`}
  //               style={{ color: fontColor }}
  //             >
  //               {item?.Amount !== null && item.Amount !== "\u00A0"
  //                 ? item.Amount < 0
  //                   ? `(-${Math.abs(item.Amount).toLocaleString(undefined, {
  //                       useGrouping: false,
  //                       minimumFractionDigits: 2,
  //                       maximumFractionDigits: 2,
  //                     })})`
  //                   : item.Amount.toLocaleString(undefined, {
  //                       useGrouping: false,
  //                       minimumFractionDigits: 2,
  //                       maximumFractionDigits: 2,
  //                     })
  //                 : ""}
  //             </td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   );
  // };

  const SummaryTable = ({
    data,
    total,
    title,
    totalAssets, // (not used here, kept to match your props)
    totalLiabilities, // (not used here, kept to match your props)
    maxRowCount,
  }) => {
    const rows = Array.isArray(data) ? data : [];
    const fillerCount = Math.max(
      0,
      (Number.isFinite(maxRowCount) ? maxRowCount : 0) - rows.length
    );

    return (
      <>
        <Table
          stickyHeader
          aria-label="sticky table"
          style={{
            border: "1px solid grey",
            borderCollapse: "collapse",
            borderSpacing: 0,
          }}
          className={`min-w-full text-sm overflow-auto ${styles.stripedRow} ${styles.hideScrollbar} ${styles.thinScrollBar}`}
        >
          <TableHead
            className={`${styles.inputTextColor}`}
            sx={{ ...displaytableHeadStyles }}
          >
            <TableRow className={`${styles.tblHead}`}>
              <TableCell
                style={{
                  minWidth: "100",
                  width: "150",
                  position: "sticky",
                  // cursor: isSortingEnabled ? "pointer" : "default",
                }}
                className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
              >
                {title}
              </TableCell>
              <TableCell
                style={{
                  minWidth: "100",
                  width: "150",
                  position: "sticky",
                  // cursor: isSortingEnabled ? "pointer" : "default",
                }}
                className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
              ></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((item, index) => (
              <TableRow
                style={{ border: "1px solid grey" }}
                className={`${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
                sx={{
                  ...(toggledThemeValue
                    ? displayTableRowStylesNoHover
                    : displaytableRowStyles),
                }}
                key={item?.id ?? `${item?.tbGroupName ?? "row"}-${index}`}
              >
                <TableCell
                  style={{ border: "1px solid grey" }}
                  className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
                >
                  <Link
                    href={`/accountingReports/trialBalance?reportType=D&balanceType=E&tbGroupId=${item?.balance_sheet_group_id}`}
                    className="text-[#0766ad] hover:underline cursor-pointer"
                    title={`Open group: ${item?.tbGroupName ?? ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item?.tbGroupName || ""}
                  </Link>
                </TableCell>
                <TableCell
                  style={{
                    border: "1px solid grey",
                    textAlign: "right",
                  }}
                  className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
                >
                  {item?.Amount !== null && item?.Amount !== "\u00A0"
                    ? item.Amount < 0
                      ? `(-${Math.abs(item.Amount).toLocaleString(undefined, {
                          useGrouping: false,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })})`
                      : item.Amount.toLocaleString(undefined, {
                          useGrouping: false,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                    : ""}
                </TableCell>
              </TableRow>
            ))}

            {/* padding rows to match maxRowCount */}
            {fillerCount > 0 &&
              Array.from({ length: fillerCount }).map((_, i) => (
                <TableRow
                  style={{ border: "1px solid grey" }}
                  className={`${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
                  sx={{
                    ...(toggledThemeValue
                      ? displayTableRowStylesNoHover
                      : displaytableRowStyles),
                  }}
                  key={i ?? `${item?.tbGroupName ?? "row"}-${i}`}
                >
                  <TableCell
                    style={{
                      border: "1px solid grey",
                    }}
                    className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
                  >
                    &nbsp;
                  </TableCell>
                  <TableCell
                    style={{
                      border: "1px solid grey",
                    }}
                    className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
                  >
                    &nbsp;
                  </TableCell>
                </TableRow>
              ))}

            {/* total row always last (optional) */}
            {/* {typeof total === "number" && (
            <tr className="border-t font-semibold">
              <td className="text-black">
                {title?.toLowerCase().includes("liabilit")
                  ? "Total Liabilities"
                  : title?.toLowerCase().includes("asset")
                  ? "Total Assets"
                  : "Total"}
              </td>
              <td className="text-black text-right">
                {total < 0
                  ? `(-${Math.abs(total).toLocaleString(undefined, {
                      useGrouping: false,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })})`
                  : total.toLocaleString(undefined, {
                      useGrouping: false,
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </td>
            </tr>
          )} */}
          </TableBody>
        </Table>
      </>
    );
  };

  // Table for Detailed view
  const DetailedTable = ({ data, total, title }) => (
    <>
      <Table
        stickyHeader
        aria-label="sticky table"
        style={{
          border: "1px solid grey",
          borderCollapse: "collapse",
          borderSpacing: 0,
        }}
        className={`min-w-full text-sm overflow-auto ${styles.stripedRow} ${styles.hideScrollbar} ${styles.thinScrollBar}`}
      >
        <TableHead
          className={`${styles.inputTextColor}`}
          sx={{ ...displaytableHeadStyles }}
        >
          <TableRow className={`${styles.tblHead}`}>
            <TableCell
              style={{
                minWidth: "100",
                width: "150",
                position: "sticky",
                // cursor: isSortingEnabled ? "pointer" : "default",
              }}
              className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
            >
              {title}
            </TableCell>
            <TableCell
              style={{
                minWidth: "100",
                width: "150",
                position: "sticky",
                // cursor: isSortingEnabled ? "pointer" : "default",
              }}
              className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
            ></TableCell>
            <TableCell
              style={{
                minWidth: "100",
                width: "150",
                position: "sticky",
                // cursor: isSortingEnabled ? "pointer" : "default",
              }}
              className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
            ></TableCell>
            <TableCell
              style={{
                minWidth: "100",
                width: "150",
                position: "sticky",
                // cursor: isSortingEnabled ? "pointer" : "default",
              }}
              className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
            ></TableCell>
            <TableCell
              style={{
                minWidth: "100",
                width: "150",
                position: "sticky",
                // cursor: isSortingEnabled ? "pointer" : "default",
              }}
              className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
            ></TableCell>
            <TableCell
              style={{
                minWidth: "100",
                width: "150",
                position: "sticky",
                // cursor: isSortingEnabled ? "pointer" : "default",
              }}
              className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
            ></TableCell>
            <TableCell
              style={{
                minWidth: "100",
                width: "150",
                position: "sticky",
                // cursor: isSortingEnabled ? "pointer" : "default",
              }}
              className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
            >
              Balance
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderGroupedRows(data)}</TableBody>
      </Table>
    </>
  );

  return (
    <div id="htmlContent">
      <div id="replaceDiv" className="scroll-container thinScrollBar">
        <div className="flex flex-col w-full">
          {/* Main content */}
          <div className="flex flex-row w-full">
            {/* Liabilities Section */}
            <div className="flex-1 w-1/2">
              {/* <Paper
                sx={{
                  ...(toggle
                    ? displayReportTablePaperToggleStyles
                    : displayReportTablePaperStyles),
                  displayTablePaperStyles,
                }}
              > */}
              {reportType === "S" ? (
                <SummaryTable
                  data={reportData.liabilityData}
                  total={reportData.totalLiabilities}
                  totalAssets={totalAssets}
                  totalLiabilities={totalLiabilities}
                  maxRowCount={Math.max(
                    reportData.liabilityData.length,
                    reportData.assetsData.length
                  )}
                  title="Liabilities"
                />
              ) : (
                <DetailedTable
                  data={reportData.liabilityData}
                  total={reportData.totalLiabilities}
                  title="Liabilities"
                />
              )}
              {/* </Paper> */}
            </div>
            {/* Assets Section */}
            <div className="flex-1 w-1/2">
              {reportType === "S" ? (
                <SummaryTable
                  data={reportData.assetsData}
                  total={reportData.totalAssets}
                  totalAssets={totalAssets}
                  totalLiabilities={totalLiabilities}
                  maxRowCount={Math.max(
                    reportData.liabilityData.length,
                    reportData.assetsData.length
                  )}
                  title="Assets"
                />
              ) : (
                <DetailedTable
                  data={reportData.assetsData}
                  total={reportData.totalAssets}
                  title="Assets"
                />
              )}
            </div>
          </div>
          {/* Totals Section */}
          <div className="flex flex-row w-full">
            {/* Total Liabilities Table */}
            <div className="flex-1 w-1/2">
              <table className="table w-full">
                <tbody>
                  <tr className="total-row">
                    <td
                      className="text-black bg-gray-300"
                      rowSpan={7}
                      style={{ borderRight: "none" }}
                    >
                      Total Liabilities
                    </td>
                    <td
                      className="text-right font-bold text-black bg-gray-300"
                      style={{ borderLeft: "none" }}
                    >
                      {totalLiabilities < 0
                        ? `${Math.abs(totalLiabilities).toFixed(2)}`
                        : totalLiabilities.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Total Assets Table */}
            <div className="flex-1 w-1/2">
              <table className="table w-full">
                <tbody>
                  <tr className="total-row">
                    <td
                      className="text-black bg-gray-300"
                      rowSpan={7}
                      style={{ borderRight: "none" }}
                    >
                      Total Assets
                    </td>
                    <td
                      className="text-right font-bold text-black bg-gray-300"
                      style={{ borderLeft: "none" }}
                    >
                      {totalAssets < 0
                        ? `${Math.abs(totalAssets).toFixed(2)}`
                        : totalAssets.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BalanceSheetComponent;
