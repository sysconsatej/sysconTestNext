import React, { useEffect, useState } from "react";
import {
  rptJobExportSea,
  rptSearchCriteria,
} from "@/services/auth/FormControl.services.js";
import styles from "@/components/common.module.css";
import PaginationButtons from "@/components/Pagination";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import JsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { get, orderBy } from "lodash";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
// import { ButtonPanel } from "../Buttons/customeButton";

function CommonDynamicReport() {
  const [tableData, setTableData] = useState([]);
  const [grid, setGrid] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const isLastPage = currentPage === Math.ceil(tableData.length / itemsPerPage);
  const [isSortingEnabled, setIsSortingEnabled] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [currentItemsGrouped, setCurrentItemsGrouped] = useState([]);
  const [groupingField, setGroupingField] = useState(null);

  useEffect(() => {
    rptSearchCriteria({
      tableName: "tblReportSearchCriteria",
    }).then((data) => {
      const fetchedData = data.data[0];
      setGrid(fetchedData.grid);
      // Update the sorting enabled state based on the fetched JSON
      setIsSortingEnabled(fetchedData.sorting === "y");
      // Determine and store the field name for dynamic grouping
      const groupingFieldName = getGroupingFieldName(fetchedData.grid);
      if (groupingFieldName) {
        setGroupingField(groupingFieldName); // You need to define this state and its setter
      }
    });
  }, []);

  useEffect(() => {
    if (groupingField) {
      const currentItemsGrouped = preprocessDataForGrouping(
        tableData.slice(firstItemIndex, lastItemIndex),
        groupingField
      );
      setCurrentItemsGrouped(currentItemsGrouped);
    }
  }, [currentPage, tableData, groupingField]);

  function isValidDate(value) {
    return moment(value, moment.ISO_8601, true).isValid();
  }

  const calculateGrandTotals = () => {
    const totals = {};
    tableData.forEach((data) => {
      grid.forEach(({ fieldname }) => {
        const value = get(data, fieldname);
        if (typeof value === "number") {
          if (!Object.prototype.hasOwnProperty.call(totals, fieldname)) {
            totals[fieldname] = 0;
          }
          totals[fieldname] += value;
        }
      });
    });
    return totals;
  };

  const grandTotals = calculateGrandTotals();

  const handleGoClick = async () => {
    const requestData = {
      projection: {},
    };
    const responseData = await rptJobExportSea(requestData);
    if (responseData && responseData.success && groupingField) {
      // Apply grouping immediately after fetching and before setting state
      const processedData = preprocessDataForGrouping(
        responseData.data,
        groupingField
      );
      setTableData(processedData);
    }
  };

  const handleExportToExcel = () => {
    // Extract headers labels from the grid
    const headerLabels = grid.map((g) => g.label);

    // Convert tableData to worksheet format with the headers
    const dataToExport = tableData.map((row) => {
      return grid.reduce((acc, { fieldname, label }) => {
        let value = row[fieldname];
        if (typeof value === "string" && isValidDate(value)) {
          value = moment(value).format("DD-MM-YYYY");
        }
        acc[label] = value;
        return acc;
      }, {});
    });

    // Create a new workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport, {
      header: headerLabels,
      skipHeader: true,
    });
    const wb = XLSX.utils.book_new();

    // Add header labels with yellow background
    const header = headerLabels.map((label) => ({
      v: label,
      s: {
        fill: {
          fgColor: { rgb: "FFFF00" },
        },
        font: {
          bold: true,
        },
        alignment: {
          horizontal: "center",
          vertical: "center",
        },
      },
    }));

    // Append the header with style to the first row in the worksheet
    XLSX.utils.sheet_add_json(ws, [header], { skipHeader: true, origin: "A1" });

    // Append worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    // Write workbook and export
    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
      cellStyles: true,
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(blob, "export.xlsx");
  };

  const handleExportToPDF = () => {
    const unit = "pt";
    const size = "A4";
    const orientation = "landscape";

    const doc = new JsPDF(orientation, unit, size);

    // Assuming you have an image URL or a base64 string
    const imageUrl = "./NCLP.jpg"; // Adjust as necessary

    // Get page width and calculate new image dimensions for margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const leftRightMargin = 40; // Margin on each side
    const newImageWidth = pageWidth - leftRightMargin * 2; // Image width after considering margins
    const xPosition = leftRightMargin; // Starting x position for the image
    const imageHeight = 90; // Adjust as needed

    // Load the image into the PDF with adjusted width and position
    doc.addImage(imageUrl, "PNG", xPosition, 10, newImageWidth, imageHeight);

    // Adjust the startY position of the autoTable to be below your image
    const headers = [grid.map((g) => g.label)]; // Headers from grid labels

    // Mapping the data to match the headers
    const data = tableData.map((row) =>
      grid.map((g) => {
        let value = row[g.fieldname];
        if (typeof value === "string" && isValidDate(value)) {
          value = moment(value).format("DD-MM-YYYY");
        }
        return value;
      })
    );

    let content = {
      startY: 100, // Adjust based on the height of your image + some padding
      head: headers,
      body: data,
      theme: "grid",
      styles: {
        fontSize: 6, // Smaller font size for the table data
      },
      headStyles: {
        fontSize: 8, // Slightly larger font size for headers, adjust as needed
      },
    };

    doc.autoTable(content);
    doc.save("report.pdf");
  };

  const handleExportToCSV = () => {
    const headers = grid.map((g) => g.label).join(",") + "\n";

    const rows = tableData
      .map((row) => {
        return grid
          .map(({ fieldname }) => {
            let value = row[fieldname];
            if (typeof value === "string" && isValidDate(value)) {
              value = `"${moment(value).format("DD-MM-YYYY")}"`; // Wrap date strings in quotes
            } else if (typeof value === "string") {
              value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes in strings
            }
            return value;
          })
          .join(",");
      })
      .join("\n");

    const csvString = headers + rows;

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "export.csv");
  };

  const toggleSort = (fieldname) => {
    if (!isSortingEnabled) return;

    const newDirection =
      sortColumn === fieldname && sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    setSortColumn(fieldname);
  };

  useEffect(() => {
    if (sortColumn && groupingField) {
      let sortedData = orderBy(tableData, [sortColumn], [sortDirection]);
      // Reapply the grouping logic to the sorted data
      sortedData = preprocessDataForGrouping(sortedData, groupingField);
      setTableData(sortedData);
    }
  }, [sortColumn, sortDirection, groupingField]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = tableData.slice(firstItemIndex, lastItemIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  function preprocessDataForGrouping(data, groupByFieldName) {
    let prevValue = null;
    let groupCount = 0;
    const processedData = data.map((item, index) => {
      const isFirstInGroup = item[groupByFieldName] !== prevValue;
      item.isFirstInGroup = isFirstInGroup;
      if (isFirstInGroup) {
        if (index !== 0) {
          // Avoid marking the first data row unnecessarily
          // Ensure the target for groupSpan exists
          if (data[index - groupCount - 1] !== undefined) {
            data[index - groupCount - 1].groupSpan = groupCount + 1;
          }
        }
        prevValue = item[groupByFieldName];
        groupCount = 0;
      } else {
        groupCount++;
      }
      return item;
    });
    // Handle the last group
    if (
      groupCount > 0 &&
      processedData.length > 0 &&
      processedData[processedData.length - groupCount - 1] !== undefined
    ) {
      processedData[processedData.length - groupCount - 1].groupSpan =
        groupCount + 1;
    }
    return processedData;
  }

  const renderTableData = (data, index) => {
    return grid.map((item, colIndex) => {
      // Skip rendering cells that are not the first in their group for the first column
      if (colIndex === 0 && !data.isFirstInGroup) {
        return null;
      }

      let content = get(data, item.fieldname);
      if (typeof content === "string" && isValidDate(content)) {
        content = moment(content).format("DD-MM-YYYY");
      }

      // Dynamically replace the ID in the URL string if a URL is provided
      const contentWithOptionalLink = item.url ? (
        // Replace the placeholder in the URL string with the actual data ID
        <a
          href={item.url.replace(/"id":0/, `"id":${data.id}`)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.linkHoverBlue}
        >
          {content}
        </a>
      ) : (
        content
      );

      // Define inline styles for top-left alignment conditionally
      const inlineStyle =
        colIndex === 0 && data.isFirstInGroup
          ? { verticalAlign: "top", textAlign: "left" }
          : {};

      return (
        <TableCell
          key={`${item.fieldname}-${index}`}
          // Apply rowSpan for the first column of the first item in each group
          rowSpan={
            colIndex === 0 && data.isFirstInGroup && data.groupSpan
              ? data.groupSpan
              : undefined
          }
          style={inlineStyle}
          className={`${styles.tableCell} whitespace-nowrap text-gray-900 text-xs`}
        >
          {contentWithOptionalLink}
        </TableCell>
      );
    });
  };

  const renderGrandTotalRow = () => {
    return (
      <TableRow>
        {grid.map(({ fieldname}, index) => {
          let displayValue = "";
          if (index === 0) {
            // Set the label for the first cell
            displayValue = "Grand Total";
          } else if (Object.prototype.hasOwnProperty.call(grandTotals, fieldname)) {
            // Format number to two decimal places if it's a decimal number
            const value = grandTotals[fieldname];
            displayValue =
              typeof value === "number"
                ? Number.isInteger(value)
                  ? value.toString()
                  : value.toFixed(2)
                : "";
          }

          return (
            <TableCell
              key={fieldname}
              className={`${styles.tableCell} whitespace-nowrap text-gray-900 text-xs`}
            >
              {displayValue}
            </TableCell>
          );
        })}
      </TableRow>
    );
  };

  function getGroupingFieldName(grid) {
    // Find the field with a groupingDepth property
    const field = grid.find((item) => item.groupingDepth !== undefined);
    return field ? field.fieldname : null; // Return the fieldname or null if not found
  }

  return (
    <>
      <div className="my-2 mt-4">
        <button
          onClick={handleGoClick}
          className="bg-blue-800 text-white rounded p-2 w-auto text-xs hover:bg-blue-600"
          style={{ opacity: 1, cursor: "pointer" }}
        >
          Go
        </button>
        <button
          onClick={handleExportToExcel}
          className="bg-blue-800 text-white rounded ml-2 p-2 w-auto text-xs hover:bg-blue-600"
          style={{ opacity: 1, cursor: "pointer" }}
        >
          Export to Excel
        </button>
        <button
          onClick={handleExportToPDF}
          className="bg-blue-800 text-white rounded ml-2 p-2 w-auto text-xs hover:bg-blue-600"
          style={{ opacity: 1, cursor: "pointer" }}
        >
          Export to PDF
        </button>
        <button
          onClick={handleExportToCSV}
          className="bg-blue-800 text-white rounded ml-2 p-2 w-auto text-xs hover:bg-blue-600"
          style={{ opacity: 1, cursor: "pointer" }}
        >
          Export to CSV
        </button>
      </div>
      <div
        className={`${styles.scroll} overflow-x-auto border border-gray-200 rounded-lg`}
        style={{ maxHeight: "450px", overflowY: "auto" }}
      >
        <Table className="min-w-full text-sm">
          <TableHead className="text-white">
            <TableRow className={`${styles.tblHead}`}>
              {grid.map((item) => (
                <TableCell
                  key={item.fieldname}
                  className={`${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                  style={{
                    position: "sticky",
                    top: 0,
                    color: "#fff",
                    backgroundColor: "#1565C0",
                    zIndex: 999,
                    cursor: isSortingEnabled ? "pointer" : "default",
                  }}
                  onClick={() => toggleSort(item.fieldname)}
                >
                  {item.label}
                  {isSortingEnabled &&
                    sortColumn === item.fieldname &&
                    (sortDirection === "asc" ? (
                      <ArrowDownwardIcon
                        fontSize="small"
                        style={{ marginLeft: 5 }}
                      />
                    ) : (
                      <ArrowUpwardIcon
                        fontSize="small"
                        style={{ marginLeft: 5 }}
                      />
                    ))}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.map((data) => (
              <TableRow key={data._id} className="hover:bg-gray-100">
                {renderTableData(data)}
              </TableRow>
            ))}
            {isLastPage && renderGrandTotalRow()}
          </TableBody>
        </Table>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <PaginationButtons
          totalPages={Math.ceil(tableData.length / itemsPerPage)}
          currentPage={currentPage}
          pageSelected={handlePageChange}
        />
      </div>
    </>
  );
}
export default CommonDynamicReport;
