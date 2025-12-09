/* eslint-disable */
import React, { useEffect, useState } from "react";
import "./trialBalance.css";
import Link from "next/link";
import styles from "@/app/app.module.css";
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
import { useThemeProvider } from "@/context/themeProviderDataContext";

function TrialBalanceComponent({
  balanceSheetData,
  reportTypeData,
  reportBalanceType,
  menuId,
  tableToggle,
}) {
  const [reportData, setReportData] = useState([]);
  const [reportType, setReportType] = useState(reportTypeData);
  const [balanceType, setBalanceType] = useState(reportBalanceType);
  const [reportTitle, setReportTitle] = useState("");
  const [toggle, setToggle] = useState(true);
  const { initializeTheme, toggledThemeValue } = useThemeProvider();

  // Update reportType and balanceType when props change
  useEffect(() => {
    setReportType(reportTypeData);
    setBalanceType(reportBalanceType);
  }, [reportTypeData, reportBalanceType]);

  useEffect(() => {
    setToggle(tableToggle);
  }, [tableToggle]);

  // Recalculate report data when balanceSheetData, reportType, or balanceType changes
  useEffect(() => {
    if (!balanceSheetData) return;

    let title = "";
    let aggregatedData = {};

    if (reportType === "S") {
      if (balanceType === "O") {
        title = "Opening Balance";
        aggregatedData = balanceSheetData.reduce((acc, item) => {
          const key = `${item.BalanceSheetName}-${item.tb1GroupName}`;
          if (!acc[key]) {
            acc[key] = {
              BalanceSheetName: item.BalanceSheetName,
              tb1GroupName: item.tb1GroupName,
              drBalance: item.openingBalance > 0 ? item.openingBalance : 0,
              crBalance:
                item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0,
            };
          } else {
            acc[key].drBalance +=
              item.openingBalance > 0 ? item.openingBalance : 0;
            acc[key].crBalance +=
              item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0;
          }
          return acc;
        }, {});
      } else if (balanceType === "C") {
        title = "Closing Balance";
        aggregatedData = balanceSheetData.reduce((acc, item) => {
          const key = `${item.BalanceSheetName}-${item.tb1GroupName}`;
          if (!acc[key]) {
            acc[key] = {
              BalanceSheetName: item.BalanceSheetName,
              tb1GroupName: item.tb1GroupName,
              drBalance: item.closingBalance > 0 ? item.closingBalance : 0,
              crBalance:
                item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
            };
          } else {
            acc[key].drBalance +=
              item.closingBalance > 0 ? item.closingBalance : 0;
            acc[key].crBalance +=
              item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
          }
          return acc;
        }, {});
      } else if (balanceType === "E") {
        title = "Extended Balance";
        aggregatedData = balanceSheetData.reduce((acc, item) => {
          const key = `${item.BalanceSheetName}-${item.tb1GroupName}`;
          if (!acc[key]) {
            acc[key] = {
              BalanceSheetName: item.BalanceSheetName,
              tb1GroupName: item.tb1GroupName,
              drBalanceOpeningBalance:
                item.openingBalance > 0 ? item.openingBalance : 0,
              crBalanceOpeningBalance:
                item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0,
              drBalanceTransactionBalance:
                item.transactionBalance > 0 ? item.transactionBalance : 0,
              crBalanceTransactionBalance:
                item.transactionBalance < 0
                  ? Math.abs(item.transactionBalance)
                  : 0,
              drBalanceClosingBalance:
                item.closingBalance > 0 ? item.closingBalance : 0,
              crBalanceClosingBalance:
                item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
            };
          } else {
            acc[key].drBalanceOpeningBalance +=
              item.openingBalance > 0 ? item.openingBalance : 0;
            acc[key].crBalanceOpeningBalance +=
              item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0;
            acc[key].drBalanceTransactionBalance +=
              item.transactionBalance > 0 ? item.transactionBalance : 0;
            acc[key].crBalanceTransactionBalance +=
              item.transactionBalance < 0
                ? Math.abs(item.transactionBalance)
                : 0;
            acc[key].drBalanceClosingBalance +=
              item.closingBalance > 0 ? item.closingBalance : 0;
            acc[key].crBalanceClosingBalance +=
              item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
          }
          return acc;
        }, {});
      }
    }

    if (reportType === "D") {
      if (balanceType === "O") {
        title = "Opening Balance";
        aggregatedData = balanceSheetData.reduce((acc, item) => {
          const key = `${item.BalanceSheetName}-${item.tb1GroupName}-${item.glName}`;

          // Initialize if the key doesn't exist
          if (!acc[key]) {
            acc[key] = {
              BalanceSheetName: item.BalanceSheetName,
              tb1GroupName: item.tb1GroupName,
              glName: item.glName, // Ensure glName is added
              glId: item.glId,
              drBalanceOpeningBalance:
                item.openingBalance > 0 ? item.openingBalance : 0,
              crBalanceOpeningBalance:
                item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0,
              drBalanceTransactionBalance:
                item.transactionBalance > 0 ? item.transactionBalance : 0,
              crBalanceTransactionBalance:
                item.transactionBalance < 0
                  ? Math.abs(item.transactionBalance)
                  : 0,
              drBalanceClosingBalance:
                item.closingBalance > 0 ? item.closingBalance : 0,
              crBalanceClosingBalance:
                item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
            };
          } else {
            // Aggregate balance values for each glName
            acc[key].drBalanceOpeningBalance +=
              item.openingBalance > 0 ? item.openingBalance : 0;
            acc[key].crBalanceOpeningBalance +=
              item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0;
            acc[key].drBalanceTransactionBalance +=
              item.transactionBalance > 0 ? item.transactionBalance : 0;
            acc[key].crBalanceTransactionBalance +=
              item.transactionBalance < 0
                ? Math.abs(item.transactionBalance)
                : 0;
            acc[key].drBalanceClosingBalance +=
              item.closingBalance > 0 ? item.closingBalance : 0;
            acc[key].crBalanceClosingBalance +=
              item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
          }

          return acc;
        }, {});
      } else if (balanceType === "C") {
        title = "Closing Balance";
        aggregatedData = balanceSheetData.reduce((acc, item) => {
          const key = `${item.BalanceSheetName}-${item.tb1GroupName}-${item.glName}`;

          // Initialize if the key doesn't exist
          if (!acc[key]) {
            acc[key] = {
              BalanceSheetName: item.BalanceSheetName,
              tb1GroupName: item.tb1GroupName,
              glName: item.glName, // Ensure glName is added
              glId: item.glId,
              drBalanceClosingBalance:
                item.closingBalance > 0 ? item.closingBalance : 0,
              crBalanceClosingBalance:
                item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
            };
          } else {
            // Aggregate balance values for each glName
            acc[key].drBalanceClosingBalance +=
              item.closingBalance > 0 ? item.closingBalance : 0;
            acc[key].crBalanceClosingBalance +=
              item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
          }

          return acc;
        }, {});
      } else if (balanceType === "E") {
        title = "Extended Balance";
        aggregatedData = balanceSheetData.reduce((acc, item) => {
          const key = `${item.BalanceSheetName}-${item.tb1GroupName}-${item.glName}`;

          // Initialize if the key doesn't exist
          if (!acc[key]) {
            acc[key] = {
              BalanceSheetName: item.BalanceSheetName,
              tb1GroupName: item.tb1GroupName,
              glName: item.glName, // Ensure glName is added
              glId: item.glId,
              drBalanceOpeningBalance:
                item.openingBalance > 0 ? item.openingBalance : 0,
              crBalanceOpeningBalance:
                item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0,
              drBalanceTransactionBalance:
                item.transactionBalance > 0 ? item.transactionBalance : 0,
              crBalanceTransactionBalance:
                item.transactionBalance < 0
                  ? Math.abs(item.transactionBalance)
                  : 0,
              drBalanceClosingBalance:
                item.closingBalance > 0 ? item.closingBalance : 0,
              crBalanceClosingBalance:
                item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
            };
          } else {
            // Aggregate balance values for each glName
            acc[key].drBalanceOpeningBalance +=
              item.openingBalance > 0 ? item.openingBalance : 0;
            acc[key].crBalanceOpeningBalance +=
              item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0;
            acc[key].drBalanceTransactionBalance +=
              item.transactionBalance > 0 ? item.transactionBalance : 0;
            acc[key].crBalanceTransactionBalance +=
              item.transactionBalance < 0
                ? Math.abs(item.transactionBalance)
                : 0;
            acc[key].drBalanceClosingBalance +=
              item.closingBalance > 0 ? item.closingBalance : 0;
            acc[key].crBalanceClosingBalance +=
              item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
          }

          return acc;
        }, {});
      }
    }

    setReportTitle(title);
    const BS_ORDER = { Assets: 0, Liability: 1, Income: 2, Expense: 3 };

    setReportData(
      Object.values(aggregatedData).sort((a, b) => {
        const aKey = (a.BalanceSheetName || "").trim();
        const bKey = (b.BalanceSheetName || "").trim();

        // rank unknowns to the end (999)
        const aRank = BS_ORDER[aKey] ?? 999;
        const bRank = BS_ORDER[bKey] ?? 999;

        if (aRank !== bRank) return aRank - bRank;

        // tie-break by tb1GroupName A→Z, case-insensitive, numeric-aware
        return (a.tb1GroupName ?? "").localeCompare(
          b.tb1GroupName ?? "",
          undefined,
          { sensitivity: "base", numeric: true }
        );
      })
    );

    // setReportData(
    //   Object.values(aggregatedData).sort(
    //     (a, b) =>
    //       a.BalanceSheetName.localeCompare(b.BalanceSheetName) ||
    //       a.tb1GroupName.localeCompare(b.tb1GroupName)
    //   )
    // );
  }, [balanceSheetData, reportType, balanceType]);

  if (!balanceSheetData) return <div>No data available</div>;

  function renderGroupedRows(data) {
    let groupedRows = [];
    let lastBalanceSheetName = "";
    let rowSpanCount = 0;

    // Initialize grand total accumulators
    let drBalanceGrandTotal = 0;
    let crBalanceGrandTotal = 0;

    data.forEach((item, index) => {
      const isNewGroup = item.BalanceSheetName !== lastBalanceSheetName;
      if (isNewGroup) {
        // Calculate row span for the current BalanceSheetName
        rowSpanCount = data.filter(
          (d) => d.BalanceSheetName === item.BalanceSheetName
        ).length;
        lastBalanceSheetName = item.BalanceSheetName;
      }

      // Accumulate totals for grand total row
      drBalanceGrandTotal += item.drBalance ?? 0;
      crBalanceGrandTotal += item.crBalance ?? 0;

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
          {isNewGroup ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              rowSpan={rowSpanCount}
            >
              {item.BalanceSheetName}
            </TableCell>
          ) : null}
          <TableCell
            style={{ border: "1px solid grey" }}
            className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
          >
            {item.tb1GroupName}
          </TableCell>
          <TableCell
            style={{ border: "1px solid grey" }}
            className="whitespace-nowrap text-xs text-gray-900 dark:text-white text-right"
            // className=" text-black"
          >
            {item.drBalance?.toLocaleString("en-IN") || "0.00"}
          </TableCell>
          <TableCell
            style={{ border: "1px solid grey" }}
            className="whitespace-nowrap text-xs text-gray-900 dark:text-white text-right"
          >
            {item.crBalance?.toLocaleString("en-IN") || "0.00"}
          </TableCell>
        </TableRow>
      );
    });

    //     {item.drBalance?.toLocaleString("en-IN", {
    //   style: "currency",
    //   currency: "INR",
    // }) || "0.00"}

    // Add the grand total row at the end
    groupedRows.push(
      <tr key="grand-total" className="grand-total-row bg-gray-300">
        <td colSpan={2} className="text-black text-right font-bold">
          Grand Total
        </td>
        <td className="text-right text-black font-bold">
          {drBalanceGrandTotal.toLocaleString("en-IN")}
        </td>
        <td className="text-right text-black font-bold">
          {crBalanceGrandTotal.toLocaleString("en-IN")}
        </td>
      </tr>
    );

    return groupedRows;
  }

  function renderGroupedRowsOpeningDetailed(data) {
    let groupedRows = [];
    let lastBalanceSheetName = "";
    let lastTb1GroupName = "";
    let balanceSheetRowSpanCount = 0;
    let tb1GroupRowSpanCount = 0;

    // Initialize variables to keep track of subtotal and grand total balances
    let drOpeningSubtotal = 0;
    let crOpeningSubtotal = 0;

    let drOpeningGrandTotal = 0;
    let crOpeningGrandTotal = 0;

    data.forEach((item, index) => {
      const isNewBalanceSheetGroup =
        item.BalanceSheetName !== lastBalanceSheetName;
      const isNewTb1Group = item.tb1GroupName !== lastTb1GroupName;

      // Update rowSpanCount for new groups, including subtotal rows
      if (isNewBalanceSheetGroup) {
        balanceSheetRowSpanCount = data.filter(
          (d) => d.BalanceSheetName === item.BalanceSheetName
        ).length;

        // Calculate the number of subtotals for this BalanceSheetName
        const tb1GroupNames = new Set(
          data
            .filter((d) => d.BalanceSheetName === item.BalanceSheetName)
            .map((d) => d.tb1GroupName)
        );
        balanceSheetRowSpanCount += tb1GroupNames.size; // Include subtotal rows

        lastBalanceSheetName = item.BalanceSheetName;
      }
      if (isNewTb1Group) {
        tb1GroupRowSpanCount = data.filter(
          (d) => d.tb1GroupName === item.tb1GroupName
        ).length;
        lastTb1GroupName = item.tb1GroupName;

        // Reset subtotals for a new group
        drOpeningSubtotal = 0;
        crOpeningSubtotal = 0;
      }

      // Accumulate totals for each group
      drOpeningSubtotal += item.drBalanceOpeningBalance ?? 0;
      crOpeningSubtotal += item.crBalanceOpeningBalance ?? 0;

      // Render each row of data
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
          {isNewBalanceSheetGroup ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              rowSpan={balanceSheetRowSpanCount}
            >
              {item.BalanceSheetName}
            </TableCell>
          ) : null}
          {isNewTb1Group ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              rowSpan={tb1GroupRowSpanCount}
            >
              {item.tb1GroupName}
            </TableCell>
          ) : null}
          {reportType === "D" && balanceType === "O" ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
            >
              <Link
                //href={`/editableDynamicReport?menuName=${menuId}&glId=${item?.glId}`}
                href={`/accountingReports/ledgerReport`}
                className="text-[#0766ad] hover:underline cursor-pointer"
                title={`Open : ${item.glName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.glName}
              </Link>
            </TableCell>
          ) : null}

          <TableCell
            style={{ border: "1px solid grey" }}
            className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white"
          >
            {item.drBalanceOpeningBalance ?? 0.0}
          </TableCell>
          <TableCell
            style={{ border: "1px solid grey" }}
            className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white"
          >
            {item.crBalanceOpeningBalance ?? 0.0}
          </TableCell>
        </TableRow>
      );

      // Add a subtotal row after the last item of each tb1GroupName
      const isLastItemInGroup =
        index === data.length - 1 ||
        data[index + 1].tb1GroupName !== item.tb1GroupName;
      if (isLastItemInGroup) {
        groupedRows.push(
          <tr key={`subtotal-${index}`} className="subtotal-row">
            <td
              colSpan={reportType === "D" && balanceType === "O" ? 2 : 1}
              className="text-black text-right uppercase"
            >
              <strong>Subtotal</strong>
            </td>
            <td className="text-right text-black">
              {(drOpeningSubtotal ?? 0.0).toFixed(2)}
            </td>
            <td className="text-right text-black">
              {(crOpeningSubtotal ?? 0.0).toFixed(2)}
            </td>
          </tr>
        );

        // Accumulate subtotals into grand totals
        drOpeningGrandTotal += drOpeningSubtotal;
        crOpeningGrandTotal += crOpeningSubtotal;
      }
    });

    // Add the grand total row at the end
    groupedRows.push(
      <tr key="grand-total" className="grand-total-row">
        <td
          colSpan={reportType === "D" && balanceType === "O" ? 3 : 1}
          className="text-black font-bold text-right bg-gray-300 uppercase"
        >
          <strong>Grand Total</strong>
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {drOpeningGrandTotal}
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {crOpeningGrandTotal}
        </td>
      </tr>
    );

    return groupedRows;
  }

  function renderGroupedRowsClosingDetailed(data) {
    let groupedRows = [];
    let lastBalanceSheetName = "";
    let lastTb1GroupName = "";
    let balanceSheetRowSpanCount = 0;
    let tb1GroupRowSpanCount = 0;

    // Initialize variables to keep track of subtotal and grand total balances
    let drClosingSubtotal = 0;
    let crClosingSubtotal = 0;

    let drClosingGrandTotal = 0;
    let crClosingGrandTotal = 0;

    data.forEach((item, index) => {
      const isNewBalanceSheetGroup =
        item.BalanceSheetName !== lastBalanceSheetName;
      const isNewTb1Group = item.tb1GroupName !== lastTb1GroupName;

      // Update rowSpanCount for new groups, including subtotal rows
      if (isNewBalanceSheetGroup) {
        balanceSheetRowSpanCount = data.filter(
          (d) => d.BalanceSheetName === item.BalanceSheetName
        ).length;

        // Calculate the number of subtotals for this BalanceSheetName
        const tb1GroupNames = new Set(
          data
            .filter((d) => d.BalanceSheetName === item.BalanceSheetName)
            .map((d) => d.tb1GroupName)
        );
        balanceSheetRowSpanCount += tb1GroupNames.size; // Include subtotal rows

        lastBalanceSheetName = item.BalanceSheetName;
      }
      if (isNewTb1Group) {
        tb1GroupRowSpanCount = data.filter(
          (d) => d.tb1GroupName === item.tb1GroupName
        ).length;
        lastTb1GroupName = item.tb1GroupName;

        // Reset subtotals for a new group
        drClosingSubtotal = 0;
        crClosingSubtotal = 0;
      }

      // Accumulate totals for each group
      drClosingSubtotal += item.drBalanceClosingBalance ?? 0;
      crClosingSubtotal += item.crBalanceClosingBalance ?? 0;

      // Render each row of data
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
          {isNewBalanceSheetGroup ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              rowSpan={balanceSheetRowSpanCount}
            >
              {item.BalanceSheetName}
            </TableCell>
          ) : null}
          {isNewTb1Group ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              rowSpan={tb1GroupRowSpanCount}
            >
              {item.tb1GroupName}
            </TableCell>
          ) : null}
          {reportType === "D" && balanceType === "C" ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
            >
              <Link
                //href={`/editableDynamicReport?menuName=${menuId}&glId=${item?.glId}`}
                href={`/accountingReports/ledgerReport`}
                className="text-[#0766ad] hover:underline cursor-pointer"
                title={`Open  ${item.glName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.glName}
              </Link>
            </TableCell>
          ) : null}
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.drBalanceClosingBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.crBalanceClosingBalance ?? 0}
          </TableCell>
        </TableRow>
      );

      // Add a subtotal row after the last item of each tb1GroupName
      const isLastItemInGroup =
        index === data.length - 1 ||
        data[index + 1].tb1GroupName !== item.tb1GroupName;
      if (isLastItemInGroup) {
        groupedRows.push(
          <tr key={`subtotal-${index}`} className="subtotal-row">
            <td
              colSpan={reportType === "D" && balanceType === "C" ? 2 : 1}
              className="text-black text-right uppercase"
            >
              <strong>Subtotal</strong>
            </td>
            <td className="text-right text-black">
              {(drClosingSubtotal ?? 0.0).toFixed(2)}
            </td>
            <td className="text-right text-black">
              {(crClosingSubtotal ?? 0.0).toFixed(2)}
            </td>
          </tr>
        );

        // Accumulate subtotals into grand totals
        drClosingGrandTotal += drClosingSubtotal;
        crClosingGrandTotal += crClosingSubtotal;
      }
    });

    // Add the grand total row at the end
    groupedRows.push(
      <tr key="grand-total" className="grand-total-row">
        <td
          colSpan={reportType === "D" && balanceType === "C" ? 3 : 1}
          className="text-black font-bold text-right bg-gray-300 uppercase"
        >
          <strong>Grand Total</strong>
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {drClosingGrandTotal}
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {crClosingGrandTotal}
        </td>
      </tr>
    );

    return groupedRows;
  }

  function renderGroupedRowsTransaction(data) {
    let groupedRows = [];
    let lastBalanceSheetName = "";
    let lastTb1GroupName = "";
    let balanceSheetRowSpanCount = 0;
    let tb1GroupRowSpanCount = 0;

    // Initialize variables to keep track of subtotal and grand total balances
    let drOpeningSubtotal = 0;
    let crOpeningSubtotal = 0;
    let drTransactionSubtotal = 0;
    let crTransactionSubtotal = 0;
    let drClosingSubtotal = 0;
    let crClosingSubtotal = 0;

    let drOpeningGrandTotal = 0;
    let crOpeningGrandTotal = 0;
    let drTransactionGrandTotal = 0;
    let crTransactionGrandTotal = 0;
    let drClosingGrandTotal = 0;
    let crClosingGrandTotal = 0;

    data.forEach((item, index) => {
      const isNewBalanceSheetGroup =
        item.BalanceSheetName !== lastBalanceSheetName;
      const isNewTb1Group = item.tb1GroupName !== lastTb1GroupName;

      // Update rowSpanCount for new groups, including subtotal rows
      if (isNewBalanceSheetGroup) {
        balanceSheetRowSpanCount = data.filter(
          (d) => d.BalanceSheetName === item.BalanceSheetName
        ).length;

        // Calculate the number of subtotals for this BalanceSheetName
        const tb1GroupNames = new Set(
          data
            .filter((d) => d.BalanceSheetName === item.BalanceSheetName)
            .map((d) => d.tb1GroupName)
        );
        balanceSheetRowSpanCount += tb1GroupNames.size; // Include subtotal rows

        lastBalanceSheetName = item.BalanceSheetName;
      }
      if (isNewTb1Group) {
        tb1GroupRowSpanCount = data.filter(
          (d) => d.tb1GroupName === item.tb1GroupName
        ).length;
        lastTb1GroupName = item.tb1GroupName;

        // Reset subtotals for a new group
        drOpeningSubtotal = 0;
        crOpeningSubtotal = 0;
        drTransactionSubtotal = 0;
        crTransactionSubtotal = 0;
        drClosingSubtotal = 0;
        crClosingSubtotal = 0;
      }

      // Accumulate totals for each group
      drOpeningSubtotal += item.drBalanceOpeningBalance ?? 0;
      crOpeningSubtotal += item.crBalanceOpeningBalance ?? 0;
      drTransactionSubtotal += item.drBalanceTransactionBalance ?? 0;
      crTransactionSubtotal += item.crBalanceTransactionBalance ?? 0;
      drClosingSubtotal += item.drBalanceClosingBalance ?? 0;
      crClosingSubtotal += item.crBalanceClosingBalance ?? 0;

      // Render each row of data
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
          {isNewBalanceSheetGroup ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              rowSpan={balanceSheetRowSpanCount}
            >
              {item.BalanceSheetName}
            </TableCell>
          ) : null}
          {isNewTb1Group ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              rowSpan={tb1GroupRowSpanCount}
            >
              {item.tb1GroupName}
            </TableCell>
          ) : null}
          {reportType === "D" && balanceType === "E" ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
            >
              <Link
                //href={`/editableDynamicReport?menuName=${menuId}&glId=${item?.glId}`}
                href={`/accountingReports/ledgerReport`}
                className="text-[#0766ad] hover:underline cursor-pointer"
                title={`Open : ${item.glName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.glName}
              </Link>
            </TableCell>
          ) : null}
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.drBalanceOpeningBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.crBalanceOpeningBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.drBalanceTransactionBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.crBalanceTransactionBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.drBalanceClosingBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.crBalanceClosingBalance ?? 0}
          </TableCell>
        </TableRow>
      );

      // Add a subtotal row after the last item of each tb1GroupName
      const isLastItemInGroup =
        index === data.length - 1 ||
        data[index + 1].tb1GroupName !== item.tb1GroupName;
      if (isLastItemInGroup) {
        groupedRows.push(
          <tr key={`subtotal-${index}`} className="subtotal-row">
            <td
              colSpan={reportType === "D" && balanceType === "E" ? 2 : 1}
              className="text-black text-right uppercase"
            >
              <strong>Subtotal</strong>
            </td>
            <td className="text-right text-black">
              {(drOpeningSubtotal ?? 0.0).toFixed(2)}
            </td>
            <td className="text-right text-black">
              {(crOpeningSubtotal ?? 0.0).toFixed(2)}
            </td>
            <td className="text-right text-black">
              {(drTransactionSubtotal ?? 0.0).toFixed(2)}
            </td>
            <td className="text-right text-black">
              {(crTransactionSubtotal ?? 0.0).toFixed(2)}
            </td>
            <td className="text-right text-black">
              {(drClosingSubtotal ?? 0.0).toFixed(2)}
            </td>
            <td className="text-right text-black">
              {(crClosingSubtotal ?? 0.0).toFixed(2)}
            </td>
          </tr>
        );

        // Accumulate subtotals into grand totals
        drOpeningGrandTotal += drOpeningSubtotal;
        crOpeningGrandTotal += crOpeningSubtotal;
        drTransactionGrandTotal += drTransactionSubtotal;
        crTransactionGrandTotal += crTransactionSubtotal;
        drClosingGrandTotal += drClosingSubtotal;
        crClosingGrandTotal += crClosingSubtotal;
      }
    });

    // Add the grand total row at the end
    groupedRows.push(
      <tr key="grand-total" className="grand-total-row">
        <td
          colSpan={reportType === "D" && balanceType === "E" ? 3 : 1}
          className="text-black font-bold text-right bg-gray-300 uppercase"
        >
          <strong>Grand Total</strong>
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {drOpeningGrandTotal}
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {crOpeningGrandTotal}
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {drTransactionGrandTotal}
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {crTransactionGrandTotal}
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {drClosingGrandTotal}
        </td>
        <td className="text-right text-black bg-gray-300 font-bold">
          {crClosingGrandTotal}
        </td>
      </tr>
    );

    return groupedRows;
  }

  function renderGroupedRowsTransactionSummary(data) {
    let groupedRows = [];
    let lastBalanceSheetName = "";
    let lastTb1GroupName = "";
    let balanceSheetRowSpanCount = 0;
    let tb1GroupRowSpanCount = 0;

    // Initialize variables to keep track of grand total balances
    let drOpeningGrandTotal = 0;
    let crOpeningGrandTotal = 0;
    let drTransactionGrandTotal = 0;
    let crTransactionGrandTotal = 0;
    let drClosingGrandTotal = 0;
    let crClosingGrandTotal = 0;

    data.forEach((item, index) => {
      const isNewBalanceSheetGroup =
        item.BalanceSheetName !== lastBalanceSheetName;
      const isNewTb1Group = item.tb1GroupName !== lastTb1GroupName;

      // Update rowSpanCount for new groups
      if (isNewBalanceSheetGroup) {
        balanceSheetRowSpanCount = data.filter(
          (d) => d.BalanceSheetName === item.BalanceSheetName
        ).length;
        lastBalanceSheetName = item.BalanceSheetName;
      }
      if (isNewTb1Group) {
        tb1GroupRowSpanCount = data.filter(
          (d) => d.tb1GroupName === item.tb1GroupName
        ).length;
        lastTb1GroupName = item.tb1GroupName;
      }

      // Accumulate totals for the grand total row
      drOpeningGrandTotal += item.drBalanceOpeningBalance ?? 0;
      crOpeningGrandTotal += item.crBalanceOpeningBalance ?? 0;
      drTransactionGrandTotal += item.drBalanceTransactionBalance ?? 0;
      crTransactionGrandTotal += item.crBalanceTransactionBalance ?? 0;
      drClosingGrandTotal += item.drBalanceClosingBalance ?? 0;
      crClosingGrandTotal += item.crBalanceClosingBalance ?? 0;

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
          {isNewBalanceSheetGroup ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              rowSpan={balanceSheetRowSpanCount}
            >
              {item.BalanceSheetName}
            </TableCell>
          ) : null}
          {isNewTb1Group ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              rowSpan={tb1GroupRowSpanCount}
            >
              {item.tb1GroupName}
            </TableCell>
          ) : null}
          {reportType === "D" && balanceType === "E" ? (
            <TableCell
              style={{ border: "1px solid grey" }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
            >
              {item.glName}
            </TableCell>
          ) : null}
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.drBalanceOpeningBalance ?? 0}
          </TableCell>
          <TableCell className="text-right  whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.crBalanceOpeningBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.drBalanceTransactionBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.crBalanceTransactionBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.drBalanceClosingBalance ?? 0}
          </TableCell>
          <TableCell className="text-right whitespace-nowrap text-xs text-gray-900 dark:text-white">
            {item.crBalanceClosingBalance ?? 0}
          </TableCell>
        </TableRow>
      );
    });

    // Add the grand total row at the end
    groupedRows.push(
      <tr key="grand-total" className="grand-total-row bg-gray-300">
        <td
          colSpan={reportType === "D" && balanceType === "E" ? 2 : 1}
          className="text-black text-left"
        >
          <strong>Grand Total:</strong>
        </td>
        <td></td>
        <td className="text-right text-black">{drOpeningGrandTotal}</td>
        <td className="text-right text-black">{crOpeningGrandTotal}</td>
        <td className="text-right text-black">{drTransactionGrandTotal}</td>
        <td className="text-right text-black">{crTransactionGrandTotal}</td>
        <td className="text-right text-black">{drClosingGrandTotal}</td>
        <td className="text-right text-black">{crClosingGrandTotal}</td>
      </tr>
    );

    return groupedRows;
  }

  console.log("reportData =>", reportData);

  return (
    <div id="htmlContent">
      <div id="replaceDiv" className="scroll-container thinScrollBar">
        {reportType === "S" && (balanceType === "O" || balanceType === "C") ? ( //done
          <Paper
            sx={{
              ...(toggle
                ? displayReportTablePaperToggleStyles
                : displayReportTablePaperStyles),
              displayTablePaperStyles,
            }}
          >
            <TableContainer
              id="paper"
              className={`${styles.thinScrollBar} ${styles.tableContainer}`}
              sx={{
                ...(toggle
                  ? displayReportTableContainerToggleStyles
                  : displayReportTableContainerStyles),
                position: "relative !important", // needed for sticky
                displayTableContainerStyles,
              }}
            >
              <table className="table">
                <thead>
                  {/* Row 1 */}
                  <tr style={{ height: 40 }}>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Group
                    </th>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      {reportTitle}
                    </th>
                  </tr>

                  {/* Row 2 */}
                  <tr>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Balance Sheet
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Trial Balance
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Dr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Cr
                    </th>
                  </tr>
                </thead>

                <tbody>{renderGroupedRows(reportData)}</tbody>
              </table>
            </TableContainer>
          </Paper>
        ) : reportType === "S" && balanceType === "E" ? ( //done
          <Paper
            sx={{
              ...(toggle
                ? displayReportTablePaperToggleStyles
                : displayReportTablePaperStyles),
              displayTablePaperStyles,
            }}
          >
            <TableContainer
              id="paper"
              className={`${styles.thinScrollBar} ${styles.tableContainer}`}
              sx={{
                ...(toggle
                  ? displayReportTableContainerToggleStyles
                  : displayReportTableContainerStyles),
                position: "relative !important", // needed for sticky
                displayTableContainerStyles,
              }}
            >
              <table className="table">
                <thead>
                  {/* Row 1 */}
                  <tr style={{ height: 40 }}>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Group
                    </th>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Opening
                    </th>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Transaction
                    </th>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Closing
                    </th>
                  </tr>

                  {/* Row 2 */}
                  <tr>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Balance Sheet
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Trial Balance
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Dr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Cr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Dr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Cr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Dr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Cr
                    </th>
                  </tr>
                </thead>

                <tbody>{renderGroupedRowsTransactionSummary(reportData)}</tbody>
              </table>
            </TableContainer>
          </Paper>
        ) : reportType === "D" && balanceType === "O" ? ( //done
          <Paper
            sx={{
              ...(toggle
                ? displayReportTablePaperToggleStyles
                : displayReportTablePaperStyles),
              displayTablePaperStyles,
            }}
          >
            <TableContainer
              id="paper"
              className={`${styles.thinScrollBar} ${styles.tableContainer}`}
              sx={{
                ...(toggle
                  ? displayReportTableContainerToggleStyles
                  : displayReportTableContainerStyles),
                position: "relative !important", // needed for sticky
                displayTableContainerStyles,
              }}
            >
              <table className="table">
                <thead>
                  {/* Row 1 */}
                  <tr style={{ height: 40 }}>
                    <th
                      colSpan="3"
                      className="text-center"
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 3,
                      }}
                    >
                      Group
                    </th>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 3,
                      }}
                    >
                      {reportTitle}
                    </th>
                  </tr>

                  {/* Row 2 */}
                  <tr>
                    <th
                      className="text-center"
                      style={{
                        position: "sticky",
                        top: 40,
                        zIndex: 2,
                      }}
                    >
                      Balance Sheet
                    </th>
                    <th
                      className="text-center"
                      style={{
                        position: "sticky",
                        top: 40,
                        zIndex: 2,
                      }}
                    >
                      Trial Balance
                    </th>
                    <th
                      className="text-center"
                      style={{
                        position: "sticky",
                        top: 40,
                        zIndex: 2,
                      }}
                    >
                      Gl Name
                    </th>
                    <th
                      className="text-center"
                      style={{
                        position: "sticky",
                        top: 40,
                        zIndex: 2,
                      }}
                    >
                      Dr
                    </th>
                    <th
                      className="text-center"
                      style={{
                        position: "sticky",
                        top: 40,
                        zIndex: 2,
                      }}
                    >
                      Cr
                    </th>
                  </tr>
                </thead>
                <tbody>{renderGroupedRowsOpeningDetailed(reportData)}</tbody>
              </table>
            </TableContainer>
          </Paper>
        ) : reportType === "D" && balanceType === "C" ? ( //done
          <Paper
            sx={{
              ...(toggle
                ? displayReportTablePaperToggleStyles
                : displayReportTablePaperStyles),
              displayTablePaperStyles,
            }}
          >
            <TableContainer
              id="paper"
              className={`${styles.thinScrollBar} ${styles.tableContainer}`}
              sx={{
                ...(toggle
                  ? displayReportTableContainerToggleStyles
                  : displayReportTableContainerStyles),
                position: "relative !important", // needed for sticky
                displayTableContainerStyles,
              }}
            >
              <table className="table">
                <thead>
                  {/* Row 1 */}
                  <tr style={{ height: 40 }}>
                    <th
                      colSpan="3"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Group
                    </th>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      {reportTitle}
                    </th>
                  </tr>

                  {/* Row 2 */}
                  <tr>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Balance Sheet
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Trial Balance
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Gl Name
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Dr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Cr
                    </th>
                  </tr>
                </thead>

                <tbody>{renderGroupedRowsClosingDetailed(reportData)}</tbody>
              </table>
            </TableContainer>
          </Paper>
        ) : reportType === "D" && balanceType === "E" ? ( //done
          <Paper
            sx={{
              ...(toggle
                ? displayReportTablePaperToggleStyles
                : displayReportTablePaperStyles),
              displayTablePaperStyles,
            }}
          >
            <TableContainer
              id="paper"
              className={`${styles.thinScrollBar} ${styles.tableContainer}`}
              sx={{
                ...(toggle
                  ? displayReportTableContainerToggleStyles
                  : displayReportTableContainerStyles),
                position: "relative !important", // needed for sticky
                displayTableContainerStyles,
              }}
            >
              <table className="table">
                <thead>
                  {/* Row 1 */}
                  <tr style={{ height: 40 }}>
                    <th
                      colSpan="3"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Group
                    </th>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Opening
                    </th>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Transaction
                    </th>
                    <th
                      colSpan="2"
                      className="text-center"
                      style={{ position: "sticky", top: 0, zIndex: 3 }}
                    >
                      Closing
                    </th>
                  </tr>

                  {/* Row 2 */}
                  <tr>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Balance Sheet
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Trial Balance
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Gl Name
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Dr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Cr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Dr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Cr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Dr
                    </th>
                    <th
                      className="text-center"
                      style={{ position: "sticky", top: 40, zIndex: 2 }}
                    >
                      Cr
                    </th>
                  </tr>
                </thead>

                <tbody>{renderGroupedRowsTransaction(reportData)}</tbody>
              </table>
            </TableContainer>
          </Paper>
        ) : null}
      </div>
    </div>
  );
}

export default TrialBalanceComponent;
