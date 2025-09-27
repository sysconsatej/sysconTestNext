"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useState, useEffect, useRef, use } from "react";
import styles from "@/app/app.module.css";
import CustomeModal from "@/components/Modal/customModal";
import {
  parentAccordionSection,
  accordianDetailsStyle,
  displaytableRowStyles_two,
} from "@/app/globalCss";
import {
  reportSearchCriteria,
  reportControlListing,
  fetchDataAPI,
  dynamicReportFilter,
  fetchReportData,
  dynamicDropDownFieldsData,
  fetchDynamicReportSpData,
  fetchExcelData,
  fetchExcelDataInsert,
  insertExcelData,
  insertExcelDataInDatabase,
} from "@/services/auth/FormControl.services.js";
import { ButtonPanel } from "@/components/Buttons/customeButton.jsx";
import { CustomSpinner } from "@/components/Spinner/spinner";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import { toast } from "react-toastify";
import PropTypes from "prop-types";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
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
import { get, orderBy, set } from "lodash";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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
import InputBase from "@mui/material/InputBase";
import LightTooltip from "@/components/Tooltip/customToolTip";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useThemeProvider } from "@/context/themeProviderDataContext";
import { handleExcelUploadFunc } from "@/helper/emailValidation";
import ChartReports from "@/components/chart/chart";
import ExcelJS from "exceljs";
import _ from "lodash"; // Loadash for deep equality check
import Pagination from "@mui/material/Pagination";
import PaginationItem from "@mui/material/PaginationItem";
import Stack from "@mui/material/Stack";
import paginationStyles from "@/components/common.module.css";
import { paginationStyle } from "@/app/globalCss";
import { getUserDetails } from "@/helper/userDetails";
import { XMLParser } from "fast-xml-parser";
import { soaData } from "@/constant/data";

AddEditFormControll.propTypes = {
  reportData: PropTypes.string, // Adjust the type as needed
};

import {
  displayTablePaperStyles,
  displayTableRowStylesNoHover,
} from "@/app/globalCss";

export default function AddEditFormControll({ reportData }) {
  const searchParams = useSearchParams();
  const search = reportData ? reportData : searchParams.get("menuName");
  const [parentsFields, setParentsFields] = useState([]);
  const [newState, setNewState] = useState({});
  const [formDataChange, SetFormDataChange] = useState({});
  const [filterCondition, setFilterCondition] = useState({});
  const [buttonsData, setButtonsData] = useState(null); // Initialize as null
  const [openModal, setOpenModal] = useState(false);
  const [isError, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [apiUrl, setAPiUrl] = useState("");
  const [tableData, setTableData] = useState([]);
  const [grid, setGrid] = useState([]);
  const [gridHeader, setGridHeader] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPaginationPage, setCurrentPaginationPage] = useState(1);
  const [itemsPerPaginatedPage, setItemsPerPaginatedPage] = useState(10);
  const [groupingDepth, setGroupingDepth] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortingFieldName, setSortingFieldName] = useState(null);
  const [isSortingEnabled, setIsSortingEnabled] = useState(true);
  const [groupingField, setGroupingField] = useState(1);
  const [originalData, setOriginalData] = useState([]);
  const [prevSearchInput, setPrevSearchInput] = useState("");
  const [reportCalled, setReportCalled] = useState(false);
  const [apiGridData, setApiGridData] = useState([]);
  const [formControlData, setFormControlData] = useState([]);
  const [dateCriteria, setDateCriteria] = useState("");
  const [parentGroupingDepth, setParentGroupingDepth] = useState(0);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [paginatedData, setPaginatedData] = useState([]);
  const [finalPaginatedData, setFinalPaginatedData] = useState([]);
  const [DateFormat, setDateFormat] = useState([]);
  const [clearFlag, setClearFlag] = useState({
    isClear: false,
    fieldName: "",
  });
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [chartData, setChartData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [filteredSortData, setFilteredSortData] = useState([]);
  const [toggle, setToggle] = useState(true);
  const [menuType, setMenuType] = useState(null);
  const [menuName, setMenuName] = useState(null);
  const [allErrors, setAllErrors] = useState([]);
  const sortedErrors = allErrors?.sort((a, b) => a.row - b.row);
  const [reportName, setReportName] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [labelName, setLabelName] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [activeColIndex, setActiveColIndex] = useState(0);
  const [fetchedDataFromAPI, setFetchedDataFromAPI] = useState([]);
  const { initializeTheme, toggledThemeValue } = useThemeProvider();
  const rowRefs = useRef([]);
  const [spName, setSpName] = useState(null);
  const { clientId } = getUserDetails();
  const { companyId } = getUserDetails();
  const { branchId } = getUserDetails();
  const { financialYear } = getUserDetails();
  const { emailId } = getUserDetails();
  const { userId } = getUserDetails();
  const [dataForExcel, setDataForExcel] = useState([]);
  const [rowColorsForExcel, setRowColorsForExcel] = useState({});
  const [isDefaultDataShow, setIsDefaultDataShow] = useState(true);
  const [outputFileType, setOutputFileType] = useState(true);
  const [outputFileFormat, setOutputFileFormat] = useState(true);
  const [isDataFromStoredProcedure, setIsDataFromStoredProcedure] =
    useState(false);
  const [pivotRowFields, setPivotRowFields] = useState(
    "Invoice No,BL No,Invoicing Party,Voyage No,Container No,Free Days,Invoice Amount,Tax"
  );
  const [pivotColFields, setPivotColFields] = useState(
    "Container Type,Vessel Name,Charge Name"
  );
  const [pivotValueFields, setPivotValueFields] = useState("Charge Amount");
  const [pivotRowTable, setPivotRowTotal] = useState("y");
  const [pivotGrandTotal, setPivotGrandTotal] = useState("y");
  const [pivotHeader, setPivotHeader] = useState([]);
  const [pivotGrid, setPivotGrid] = useState([]);
  const [lastPagePagination, setLastPagePagination] = useState(1);
  const [fullPivotValues, setFullPivotValues] = useState([]);
  const [currentPageNumber, setCurrentPageNumber] = useState(null);
  const [subtotalColumns, setSubtotalColumns] = useState([]);
  const [isInputVisible, setInputVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [isDisplayGrandTotal, setIsDisplayGrandTotal] = useState(true);

  useEffect(() => {
    if (menuType == "C") {
      setToggle(false);
    }
  }, [menuType]);
  
  useEffect(() => {
    // Setup code here
    return () => {
      // Cleanup code here
      if (typeof destroy === "function") {
        destroy();
      }
    };
  }, []);

  if (typeof window !== "undefined") {
    // Safe to use localStorage
    let data = localStorage.getItem("key");
  }

  const getLabelValue = (labelValue) => {
    setLabelName(labelValue);
  };
  useEffect(() => {
    const fetchHeader = async () => {
      const requestBody = {
        tableName: "tblCompanyBranchParameter",
        whereCondition: {
          status: 1,
          companyBranchId: branchId,
          clientId: clientId,
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
          setImageUrl(headerUrl);
        } else {
          console.error("No valid data received");
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchHeader();
  }, []);

  useEffect(() => {
    const fetchMenuType = async () => {
      const requestBodyMenu = {
        columns: "menuName,menuType",
        tableName: "tblMenu",
        whereCondition: `id = ${search}`,
        clientIdCondition: `status = 1 FOR JSON PATH`,
      };
      try {
        const data = await fetchReportData(requestBodyMenu);
        if (data && data.data && data.data.length > 0) {
          setMenuType(data.data[0].menuType);
          setMenuName(data.data[0].menuName);
        } else {
          console.error("No data found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchMenuType();
  }, [search]);

  useEffect(() => {
    if (paginatedData?.length > 0) {
      const sortedData = handleGroupAndSortByDepth(paginatedData, grid); // Sorting happens first

      // Check if the sorted data is different from the current paginated data to avoid unnecessary state updates
      const groupedData = preprocessDataForGrouping(
        sortedData,
        grid,
        groupingDepth
      );

      // Use deep equality check to avoid infinite update loop
      if (!_.isEqual(groupedData, paginatedData)) {
        setPaginatedData(groupedData);
      }
    }
  }, [isSortingEnabled, paginatedData, grid, groupingDepth]);

  const handleRightClick = (event, columnId) => {
    console.log("Right-clicked column ID:", columnId);

    event.preventDefault(); // Prevent the default context menu
    setInputVisible(true); // Show the input field
    setActiveColumn(columnId); // Set the active column to the one that was right-clicked
  };

  const handleFileAndUpdateState = (file, updateState) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target.result;

      // Check for XML file by extension or content type
      if (
        file.name.endsWith(".xml") ||
        file.type === "application/xml" ||
        file.type === "text/xml" ||
        file.name.endsWith(".XML")
      ) {
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@",
          ignoreNameSpace: true, // 👈 removes w:, ns2:, etc.
          parseTagValue: true,
          parseAttributeValue: true,
          trimValues: true,
        });

        const jsonData = parser.parse(result);
        updateState(jsonData);
      } else {
        const workbook = XLSX.read(result, { type: "array" });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        });

        updateState(jsonData);
      }
    };

    // Read as text for XML, ArrayBuffer for Excel
    if (
      file.name.endsWith(".xml") ||
      file.type === "application/xml" ||
      file.type === "text/xml" ||
      file.name.endsWith(".XML")
    ) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const xmlToJson = (node) => {
    // Text node
    if (
      node.nodeType === Node.TEXT_NODE ||
      node.nodeType === Node.CDATA_SECTION_NODE
    ) {
      const text = node.nodeValue.trim();
      return text ? text : null;
    }

    const result = {};

    // Add attributes
    if (node.attributes) {
      for (let attr of node.attributes) {
        result[`@${attr.name}`] = attr.value;
      }
    }

    // Group child nodes
    const childMap = {};
    for (let child of node.childNodes) {
      const childObj = xmlToJson(child);
      if (childObj === null) continue;

      const name = child.nodeName;

      if (!childMap[name]) {
        childMap[name] = childObj;
      } else {
        if (!Array.isArray(childMap[name])) {
          childMap[name] = [childMap[name]];
        }
        childMap[name].push(childObj);
      }
    }

    // Combine results
    const hasAttributes = Object.keys(result).length > 0;
    const hasChildren = Object.keys(childMap).length > 0;

    if (hasAttributes || hasChildren) {
      return {
        ...result,
        ...childMap,
      };
    }

    return null;
  };

  const handleFieldValuesChange = (updatedValues) => {
    const entries = Object.entries(updatedValues);
    const hasFile = entries.some(([, value]) => value instanceof File);

    if (hasFile) {
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          handleFileAndUpdateState(value, (jsonData) => {
            setNewState((prevState) => {
              const newState = { ...prevState, [key]: jsonData };
              return newState;
            });
            setFilterCondition((prevState) => {
              const newFilterCondition = { ...prevState, [key]: jsonData };
              return newFilterCondition;
            });
          });
        } else {
          setNewState((prevState) => {
            const newState = { ...prevState, [key]: value };
            return newState;
          });
          setFilterCondition((prevState) => {
            const newFilterCondition = { ...prevState, [key]: value };
            return newFilterCondition;
          });
          SetFormDataChange((prevState) => {
            const newState = { ...prevState, ...updatedValues };
            return newState;
          });
        }
      });
    } else {
      setNewState((prevState) => {
        const newState = { ...prevState, ...updatedValues };
        return newState;
      });
      SetFormDataChange((prevState) => {
        const newState = { ...prevState, ...updatedValues };
        return newState;
      });
      setFilterCondition((prevState) => {
        const newFilterCondition = { ...prevState, ...updatedValues };
        return newFilterCondition;
      });
    }
  };

  useEffect(() => {}, [newState, filterCondition]);

  function removeSingleQuotes(obj) {
    if (Array.isArray(obj)) {
      return obj.map(removeSingleQuotes);
    }
    if (obj !== null && typeof obj === "object") {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        cleaned[key] = removeSingleQuotes(value);
      }
      return cleaned;
    }
    if (typeof obj === "string") {
      return obj.replace(/'/g, "");
    }
    // numbers, booleans, null, etc.
    return obj;
  }

  function sortJsonData(data, columnId, sortDirection = "asc") {
    if (!columnId) return data;

    return data.sort((a, b) => {
      let valueA = a[columnId];
      let valueB = b[columnId];

      if (valueA == null) valueA = "";
      if (valueB == null) valueB = "";

      if (typeof valueA === "string") valueA = valueA.toLowerCase();
      if (typeof valueB === "string") valueB = valueB.toLowerCase();

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleButtonClick = {
    handleSubmit: async () => {
      setCurrentPage(1);
      setIsLoading(true);
      for (const [section, fields] of Object.entries(parentsFields)) {
        const missingField = Object.entries(fields).find(
          ([, { isRequired, fieldname, yourlabel }]) =>
            isRequired && !newState[fieldname]
        );

        if (missingField) {
          const [, { yourlabel }] = missingField;
          toast.error(`Value for ${yourlabel} is missing.`);
          setIsLoading(false); // Stop loading if there's a validation error
          return;
        }
      }
      if (isDefaultDataShow === false && outputFileFormat === "Excel") {
        let jsonData = { ...filterCondition, clientId: clientId };
        const fetchData = await fetchDynamicReportSpData(spName, jsonData);

        const workbook = new ExcelJS.Workbook();

        // Iterate over each dataset in fetchData
        if (fetchData && fetchData.data?.length > 0) {
          // 3) One-and-only Workbook
          const workbook = new ExcelJS.Workbook();

          // 4) Helper to avoid duplicate sheet names
          const usedNames = new Set();
          function makeSheetName(base, idx) {
            let name = `${base}_${idx + 1}`;
            let attempt = 1;
            while (usedNames.has(name)) {
              name = `${base}_${idx + 1}_${attempt++}`;
            }
            usedNames.add(name);
            return name;
          }

          // 5) Walk the top‐level arrays
          fetchData.data.forEach((outerArray, outerIdx) => {
            // CASE A: outerArray is directly an array of row‐objects
            if (
              outerArray.length > 0 &&
              typeof outerArray[0] === "object" &&
              !Array.isArray(outerArray[0])
            ) {
              const sheetName = makeSheetName("Data", outerIdx);
              const ws = workbook.addWorksheet(sheetName);

              // headers from the first object
              const headers = Object.keys(outerArray[0]);
              ws.addRow(headers);

              // each row
              outerArray.forEach((item) => {
                const row = headers.map((h) => item[h] ?? "");
                ws.addRow(row);
              });
            }
            // CASE B: outerArray is an array of `{ key: [...] }` datasets
            else {
              outerArray.forEach((dataset) => {
                const key = Object.keys(dataset)[0];
                const data = dataset[key];

                // normalize to an array of objects
                const rows = Array.isArray(data) ? data : [data];
                if (rows.length === 0 || typeof rows[0] !== "object") return;

                const sheetName = makeSheetName(key, outerIdx);
                const ws = workbook.addWorksheet(sheetName);

                const headers = Object.keys(rows[0]);
                ws.addRow(headers);

                rows.forEach((item) => {
                  const row = headers.map((h) => item[h] ?? "");
                  ws.addRow(row);
                });
              });
            }
          });

          // 6) Write & download
          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${spName}.xlsx`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } else {
          console.log("No data available to export.");
        }
        setIsLoading(false);
      } else if (isDefaultDataShow === false && outputFileFormat === "Json") {
        const fetchData = await fetchDynamicReportSpData(
          spName,
          filterCondition
        );
        console.log("fetchData =>>", fetchData);

        if (fetchData && fetchData.data?.length > 0) {
          // Serialize the data to a JSON string with indentation for formatting
          const jsonString = JSON.stringify(fetchData.data, null, 2);

          // Convert the JSON string to a Blob object
          const blob = new Blob([jsonString], { type: "application/json" });

          // Create a link and trigger the download
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${spName}.json`;
          link.click();
        } else {
          console.log("No data available to export.");
        }
        setIsLoading(false);
      } else if (isDefaultDataShow === false && outputFileFormat === "CSV") {
        const fetchData = await fetchDynamicReportSpData(
          spName,
          filterCondition
        );
        console.log("fetchData =>>", fetchData);

        if (fetchData && fetchData.data.length > 0) {
          // Initialize CSV content
          let csvContent = "data:text/csv;charset=utf-8,";

          // Iterate over each dataset in fetchData
          fetchData.data.forEach((outerArray, index) => {
            // Since the data is doubly nested, iterate through the outer array
            outerArray.forEach((dataset, dataSetIndex) => {
              const key = Object.keys(dataset)[0]; // e.g., 'tblCompanyCode'
              const data = dataset[key]; // This is the array of data

              if (data.length > 0) {
                if (dataSetIndex === 0 && index === 0) {
                  // Create headers from the keys of the first item in the array
                  const headers = Object.keys(data[0]).join(",");
                  csvContent += headers + "\r\n"; // Adding header row
                }

                // Add data rows
                data.forEach((item) => {
                  const row = Object.keys(data[0])
                    .map((header) => {
                      const value = item[header];
                      // Check if the value is an object and handle it appropriately
                      if (value && typeof value === "object") {
                        // If it's an object, convert it to a string or handle differently
                        return `"${value.toString().replace(/"/g, '""')}"`;
                      }
                      return `"${(value || "")
                        .toString()
                        .replace(/"/g, '""')}"`; // Ensure null or undefined becomes an empty string and escape quotes
                    })
                    .join(",");
                  csvContent += row + "\r\n"; // Add each row with a new line
                });
              }
            });
          });

          // Encode the CSV content so it can be parsed as a URI
          const encodedUri = encodeURI(csvContent);
          // Create a link and trigger the download
          const link = document.createElement("a");
          link.setAttribute("href", encodedUri);
          link.setAttribute("download", `${spName}.csv`);
          document.body.appendChild(link); // Required for Firefox
          link.click();
          document.body.removeChild(link); // Clean up
        } else {
          console.log("No data available to export.");
        }
        setIsLoading(false);
      } else {
        try {
          // Clear previous data
          setPaginatedData([]);
          setFinalPaginatedData([]);
          setTableData([]);
          setReportCalled(true);
          setFilteredSortData([]);
          // Validate the required fields
          for (const [section, fields] of Object.entries(parentsFields)) {
            const missingField = Object.entries(fields).find(
              ([, { isRequired, fieldname, yourlabel }]) =>
                isRequired && !newState[fieldname]
            );

            if (missingField) {
              const [, { yourlabel }] = missingField;
              toast.error(`Value for ${yourlabel} is missing.`);
              setIsLoading(false); // Stop loading if there's a validation error
              return;
            }
          }

          const removeDropdownFields = (obj) => {
            const newObj = { ...obj };
            Object.keys(newObj).forEach((key) => {
              if (key.endsWith("dropdown")) {
                delete newObj[key];
              }
            });
            return newObj;
          };

          const updateFieldNames = async (filterCondition) => {
            const updatedFilterCondition = {
              ...filterCondition,
              companyId,
              branchId,
              financialYear,
              userId,
              clientId,
            };

            for (const key in filterCondition) {
              // Skip fields with an empty string or null value
              if (
                filterCondition[key] === "" ||
                filterCondition[key] === null
              ) {
                delete updatedFilterCondition[key];
                continue;
              }

              const requestBodyGrid = {
                columns: "af.id,af.fieldname,af.label",
                tableName:
                  "tblApiDefinition ad Left join tblApiFields af on af.apiDefinitionId = ad.id",
                whereCondition: `af.id = ${key} and af.status = 1`,
                clientIdCondition: `ad.status = 1 FOR JSON PATH`,
              };

              try {
                const data = await fetchReportData(requestBodyGrid);
                if (
                  data &&
                  data.data &&
                  data.data[0] &&
                  data.data[0].fieldname
                ) {
                  const apiField = data.data[0].fieldname;
                  const newFieldName = apiField;

                  // Add the new fieldname with the old value
                  updatedFilterCondition[newFieldName] =
                    updatedFilterCondition[key];
                  // Remove the old fieldname
                  delete updatedFilterCondition[key];
                } else {
                  console.error("No data returned for key:", key);
                }
              } catch (error) {
                console.error(
                  "Error fetching report types for key:",
                  key,
                  error
                );
              }
            }

            // Filter out null or empty string values before returning the result
            for (const key in updatedFilterCondition) {
              if (
                updatedFilterCondition[key] === "" ||
                updatedFilterCondition[key] === null
              ) {
                delete updatedFilterCondition[key];
              }
            }

            return updatedFilterCondition;
          };

          // Process the filter conditions and fetch new data
          const filterConditionWithoutDropdowns =
            removeDropdownFields(filterCondition);
          const updatedConditionWithFieldNames = await updateFieldNames(
            filterConditionWithoutDropdowns
          );

          let responseData = await dynamicReportFilter(
            updatedConditionWithFieldNames,
            clientId,
            spName
          );
          if (responseData && responseData.success) {
            const processedData = preprocessDataForGrouping(
              responseData.data,
              grid,
              groupingDepth
            );
            if (isDataFromStoredProcedure) {
              if (processedData.length > 0) {
                const keys = Object.keys(processedData[0]);

                const fieldNamesFormattedArray = keys
                  .filter(
                    (key) =>
                      key !== "groupSpans" && key !== "startIndexForGroup"
                  )
                  .map((key) => ({
                    fieldname: key,
                    label: key,
                    minWidth: 100,
                    width: 150,
                  }));

                setGrid(fieldNamesFormattedArray);
                setGridHeader(fieldNamesFormattedArray);
              } else {
                console.log("Filtered data is empty");
              }
            } else {
              for (var key = 0; key < apiGrid.length; key++) {
                var apiFieldsId = fetchGrid[key].fieldname;
                if (
                  apiFieldsId === undefined ||
                  apiFieldsId === null ||
                  apiFieldsId === ""
                ) {
                  grid.push({
                    fieldName: fetchGrid[key].label,
                    label: fetchGrid[key].label,
                    _id: null,
                  });
                } else {
                  const requestBodyGrid = {
                    columns: "af.id,af.fieldname,af.label",
                    tableName:
                      "tblApiDefinition ad Left join tblApiFields af on af.apiDefinitionId = ad.id",
                    whereCondition: `af.id = ${apiFieldsId} and af.status = 1 and ad.status = 1`,
                    clientIdCondition: `ad.status = 1 FOR JSON PATH`,
                  };
                  try {
                    const data = await fetchReportData(requestBodyGrid);
                    if (data) {
                      grid.push(data.data[0]);
                    } else {
                      console.error("No data returned for key:", key);
                    }
                  } catch (error) {
                    console.error(
                      "Error fetching report types for key:",
                      key,
                      error
                    );
                  }
                }
              }
              setGrid(grid);
              const header = fetchGrid.map((gridItem) => ({
                fieldname: gridItem.fieldname,
                label: gridItem.label,
                minWidth: gridItem.minWidth || 100,
                width: gridItem.width || 150,
              }));
              setGridHeader(header);
            }

            // Filter out rows with all null or empty fields
            const filteredTableData = processedData.filter((data) => {
              return Object.values(data).some(
                (value) => value !== null && value !== ""
              );
            });

            // Set new data
            setPaginatedData(filteredTableData);
            setTableData(filteredTableData);
            setFinalPaginatedData(filteredTableData);
            setFilteredSortData(filteredTableData);
            setIsDataInitialized(true);
            setIsDefaultDataShow(true);
          } else {
            // Handle the case where data fetching fails
            console.error("Data fetching failed");
          }
        } catch (error) {
          console.error("Error during data fetching:", error);
        } finally {
          // Stop loading~
          setIsLoading(false);
        }
      }
    },
    handleExcelUpload: async () => {
      try {
        // Fetch data again
        //const apiResponse = await reportControlListing(search); // Ensure `reportControlListing` and `search` are defined
        if (search !== null) {
          const fetchedData = search;
          let { allErrors, filteredObjectIds } = await handleExcelUploadFunc(
            fetchedData,
            newState
          );

          // Check if errors array is empty or not
          if (
            (Array.isArray(allErrors) && allErrors.length === 0) ||
            allErrors == undefined
          ) {
            // const response = await insertExcelData(filteredObjectIds);
            const requestBodyForMenuReportDetails = {
              columns:
                "spName,reportCriteriaId,isDefaultDataShow,outputFileType,isSp",
              tableName: "tblMenuReportMapping",
              whereCondition: `menuId = ${search}`,
              clientIdCondition: `status = 1 FOR JSON PATH,INCLUDE_NULL_VALUES`,
            };
            reportData = await fetchReportData(requestBodyForMenuReportDetails);
            const spName = reportData.data[0].spName;
            let json = { ...newState, clientId: clientId, createdBy: userId };
            let formatJson = removeSingleQuotes(json);
            // const data = await fetchExcelData(spName, formatJson);
            const response = await fetchExcelDataInsert(spName, formatJson);
            //const response = await insertExcelDataInDatabase(insertData);

            if (response.rowsAffected.success) {
              return toast.success(`${response.rowsAffected.message}`);
            } else {
              setAllErrors(response.rowsAffected.errors);
              return toast.error(`${response.rowsAffected.message}`);
            }
          } else {
            toast.error("Upload Failed ! File contains Error");
          }

          if (menuType === "E") {
            setAllErrors(allErrors); // Ensure `setAllErrors` is defined
          }
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        console.log("Error handling Excel upload:", error);
      }
    },
    handleTextUpload: async () => {
      try {
        if (search !== null) {
          const originalUploads = newState.excelUploads;

          const transformedUploads = originalUploads.map((item, index) => {
            const key = Object.keys(item)[0];
            const value = item[key];
            return {
              rowNo: index + 1,
              data: index === 0 ? key : value,
            };
          });

          // Remove excelUploads and add textUploads
          const { excelUploads, ...rest } = newState;
          const jsonData = {
            ...rest,
            textUploads: transformedUploads,
          };

          const requestBodyForMenuReportDetails = {
            columns:
              "spName,reportCriteriaId,isDefaultDataShow,outputFileType,isSp",
            tableName: "tblMenuReportMapping",
            whereCondition: `menuId = ${search}`,
            clientIdCondition: `status = 1 FOR JSON PATH,INCLUDE_NULL_VALUES`,
          };

          const reportData = await fetchReportData(
            requestBodyForMenuReportDetails
          );
          const spName = reportData.data[0].spName;

          const json = { ...jsonData, clientId };
          const data = await fetchExcelData(spName, json);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        console.log("Error handling Excel upload:", error);
      }
    },
    handleXMLUpload: async () => {
      try {
        if (search !== null) {
          const originalUploads = newState;
          console.log("originalUploads", originalUploads);
          const requestBodyForMenuReportDetails = {
            columns:
              "spName,reportCriteriaId,isDefaultDataShow,outputFileType,isSp",
            tableName: "tblMenuReportMapping",
            whereCondition: `menuId = ${search}`,
            clientIdCondition: `status = 1 FOR JSON PATH,INCLUDE_NULL_VALUES`,
          };
          reportData = await fetchReportData(requestBodyForMenuReportDetails);
          const spName = reportData.data[0].spName;
          let json = {
            ...newState,
            companyId,
            branchId,
            financialYear,
            userId,
            clientId,
          };
          let formatJson = removeSingleQuotes(json);
          // const data = await fetchExcelData(spName, formatJson);
          const response = await fetchExcelDataInsert(spName, formatJson);

          console.log("response", response);
          if (response?.success) {
            return toast.success(`${response?.rowsAffected?.message}`);
          } else {
            setAllErrors(response?.rowsAffected?.errors);
            return toast.error(`${response?.rowsAffected?.message}`);
          }
        } else {
          toast.error("Failed to fetch data");
          throw new Error("Failed to fetch data");
        }
      } catch (error) {
        console.log("Error handling Excel upload:", error);
        toast.error(`Error handling Excel upload:  ${error.message}`);
      }
    },
    handleExportToExcel: async () => {
      if (isDefaultDataShow === false && outputFileFormat === "Excel") {
        const fetchData = await fetchDynamicReportSpData(
          spName,
          filterCondition
        );
        console.log("fetchData =>>", fetchData);
        console.log("fetchData =>>", fetchData.data.length);

        const workbook = new ExcelJS.Workbook();

        // Iterate over each dataset in fetchData
        if (fetchData && fetchData.data.length > 0) {
          fetchData.data.forEach((outerArray, index) => {
            // Since the data is doubly nested, iterate through the outer array
            outerArray.forEach((dataset) => {
              // Assuming dataset structure like { tblCompanyCode: [{code: 'AMC'}] }
              const key = Object.keys(dataset)[0]; // e.g., 'tblCompanyCode'
              const data = dataset[key]; // This is the array of data

              // Create a unique worksheet name using the key and the index
              //const worksheetName = `${key}_${index + 1}`;
              const worksheetName = `${key}`;
              const worksheet = workbook.addWorksheet(worksheetName);

              if (data.length > 0) {
                // Create headers from the keys of the first item in the array
                const headers = Object.keys(data[0]);
                worksheet.addRow(headers); // Adding header row

                // Add data rows
                data.forEach((item) => {
                  const row = headers.map((header) => item[header] || ""); // Map each header to its corresponding value in the item
                  worksheet.addRow(row);
                });
              }
            });
          });

          // Write workbook to buffer and trigger file download
          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], { type: "application/octet-stream" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${spName}.xlsx`;
          link.click();
        } else {
          console.log("No data available to export.");
        }
      } else {
        const cleanColorCode = (color) =>
          color.startsWith("#") ? color.slice(1) : color;
        let cleanedRowColors = Object.values(rowColorsForExcel).map((color) => {
          // Clean the color code (remove "#" if present)
          const cleanedColor = cleanColorCode(color);

          // Replace "transparent" with "FFFFFF"
          return cleanedColor === "transparent" ? "FFFFFF" : cleanedColor;
        });

        if (!reportCalled) {
          toast.error("Please generate the report first.");
          return;
        }

        const requestBody = {
          columns: "rfl.yourlabel,rfl.fieldname,rfl.controlname",
          tableName:
            "tblMenuReportMapping mrm left join tblReportCriteria rc on rc.id = mrm.reportCriteriaId left join tblReportCriteriaList rfl on rfl.reportCriteriaId = mrm.reportCriteriaId",
          whereCondition: `mrm.menuId = ${search} and mrm.status = 1 and rc.status = 1`,
          clientIdCondition: `rfl.status = 1 FOR JSON PATH`,
        };

        try {
          const data = await fetchReportData(requestBody);
          if (data?.data?.length > 0) {
            const fields = data.data; // Directly assigning the array
            const labelValueObject = {};

            for (const field of fields) {
              const key = field.fieldname; // Access fieldname properly
              const controlName = field.controlname;
              const yourlabel = field.yourlabel;
              const controlNameRequestBody = {
                columns: "name",
                tableName: "tblMasterData",
                whereCondition: `id=${controlName}`,
                clientIdCondition: `status = 1 FOR JSON PATH`,
              };

              try {
                const controlData = await fetchReportData(
                  controlNameRequestBody
                );
                if (controlData?.data?.length > 0) {
                  const controlNameData = controlData.data[0].name;
                  labelValueObject[yourlabel] = {
                    fieldname: key,
                    controlname: controlNameData,
                    value: null,
                  };
                }
              } catch (error) {
                console.error("Error fetching control name data:", error);
              }
            }

            // Match and update values from newState
            for (const label in labelValueObject) {
              const fieldname = labelValueObject[label].fieldname;
              const controlName = labelValueObject[label].controlname;

              if (newState.hasOwnProperty(fieldname)) {
                let value = newState[fieldname];

                if (controlName === "date" && value) {
                  const date = new Date(value);
                  value = date.toLocaleDateString("en-GB");
                } else if (
                  controlName === "dropdown" &&
                  newState[`${fieldname}dropdown`]
                ) {
                  const dropdownArray = newState[`${fieldname}dropdown`];
                  const selectedOption = dropdownArray.find(
                    (option) => option.value === value
                  );
                  if (selectedOption) value = selectedOption.label;
                }

                if (value) labelValueObject[label].value = value;
              }
            }

            const fieldsArray = Object.entries(labelValueObject)
              .filter(([key, obj]) => obj.value !== null) // Filter out objects where value is null
              .map(([key, obj]) => ({
                label: key,
                value: obj.value,
              }));

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Report");

            // Add an image if required
            const response = await fetch(imageUrl);
            const arrayBuffer = await response.arrayBuffer();
            const imageId = workbook.addImage({
              buffer: Buffer.from(arrayBuffer),
              extension: "jpg",
            });
            worksheet.addImage(imageId, {
              tl: { col: 0, row: 0 },
              ext: { width: 500, height: 100 },
            });

            // Spacer rows for the image
            worksheet.addRow([]);
            worksheet.addRow([]);
            worksheet.addRow([]);
            worksheet.addRow([]);

            // Add "Report Name" row with styling
            const reportNameRow = worksheet.addRow([
              `Report Name: ${reportName}`,
            ]);
            reportNameRow.font = { bold: true, color: { argb: "FFFFFF" } };
            reportNameRow.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "0766AD" },
            };
            worksheet.mergeCells(
              `A${reportNameRow.number}:B${reportNameRow.number}`
            );
            worksheet.addRow([]);

            // Add `fieldsArray` data (label and value pairs)
            fieldsArray.forEach((field) => {
              const row = worksheet.addRow([field.label, field.value]);
              row.eachCell((cell, colIndex) => {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: { argb: colIndex % 2 === 1 ? "DDDDDD" : "FFFFFF" },
                };
                cell.font = { bold: colIndex === 1 };
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.border = {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                };
              });
            });

            worksheet.addRow([]);

            // Add header row
            const headerRow = worksheet.addRow(gridHeader.map((g) => g.label));
            headerRow.font = { bold: true };
            headerRow.eachCell((cell) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "D3D3D3" },
              };
              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
            });

            const dataToExport = paginatedData.map((row) =>
              gridHeader.map((header) => {
                const gridItem = grid.find(
                  (g) => g?.fieldname === header.fieldname
                );
                if (!gridItem) {
                  console.warn(
                    `No grid item found for fieldname: ${header?.fieldname}`
                  );
                }
                let value = row[gridItem?.fieldname] ?? ""; // Use nullish coalescing
                if (typeof value === "string" && isValidDate(value)) {
                  value = moment(value).format("DD-MM-YYYY");
                }
                return value;
              })
            );
            // Group rows based on `groupingDepth`
            for (let colIndex = 0; colIndex <= groupingDepth; colIndex++) {
              let previousValue = null;
              dataToExport.forEach((row) => {
                if (row[colIndex] === previousValue) {
                  row[colIndex] = ""; // Replace duplicate value with an empty string
                } else {
                  previousValue = row[colIndex];
                }
              });
            }

            worksheet.columns = gridHeader.map((header) => {
              // Set a default width or use a custom logic to determine width for each column
              return { width: 20 }; // You can adjust the width value (e.g., 30 or 40) as needed
            });

            // Add data rows with styles and grouping
            dataToExport.forEach((rowData, rowIndex) => {
              const row = worksheet.addRow(rowData);
              row.eachCell((cell) => {
                cell.fill = {
                  type: "pattern",
                  pattern: "solid",
                  fgColor: {
                    argb: `${cleanedRowColors[rowIndex] || "FFFFFF"}`,
                  },
                };
                cell.border = {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                };
                cell.alignment = {
                  vertical: "middle",
                  horizontal: "center",
                  wrapText: true,
                };
              });
            });

            const grandTotalRow = worksheet.addRow(
              gridHeader.map((header, colIndex) => {
                if (colIndex === 0) return "Grand Total";

                // Check if the current column should be totaled (e.g., is numeric)
                const isNumericColumn = !isNaN(
                  dataToExport
                    .map((row) => parseFloat(row[colIndex]))
                    .find((val) => !isNaN(val))
                );

                if (isNumericColumn) {
                  const columnData = dataToExport.map((row) => {
                    const value = parseFloat(row[colIndex]);
                    return isNaN(value) ? 0 : value; // Replace invalid numbers with 0
                  });

                  const columnTotal = columnData.reduce(
                    (acc, num) => acc + num,
                    0
                  );
                  return columnTotal.toFixed(2); // Return total formatted to two decimal places
                }

                // If not numeric, leave the cell blank
                return "";
              })
            );

            // Style the grand total row
            grandTotalRow.eachCell((cell, colIndex) => {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "DDDDDD" },
              };
              cell.font = { bold: true };
              cell.alignment = {
                vertical: "middle",
                horizontal: colIndex === 0 ? "left" : "center",
              };
              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
            });

            // Save the file
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
              type: "application/octet-stream",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${reportName}.xlsx`;
            link.click();

            toast.success("Excel file exported successfully!");
          } else {
            console.error("No data returned or data structure is invalid");
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error("Failed to export to Excel.");
        }
      }
    },
    handleExportToExcelDataOnly: async () => {
      if (!reportCalled) {
        toast.error("Please generate report first");
        return;
      }

      // Extract header labels from the grid
      const headerLabels = grid.map((g) => g.label);

      // Convert tableData to a format suitable for Excel
      const dataToExport = tableData.map((row) => {
        return headerLabels.map((label) => {
          const gridItem = grid.find((g) => g.label === label);
          let value = row[gridItem.fieldname];

          // Format date if applicable
          if (typeof value === "string" && isValidDate(value)) {
            value = moment(value).format("DD-MM-YYYY");
          }

          return value !== undefined ? value : "";
        });
      });

      // Calculate totals row
      const totalsRow = headerLabels.map((label, index) => {
        if (index === 0) return "Grand Total";

        let total = 0;
        dataToExport.forEach((row) => {
          const value = row[index];
          if (typeof value === "number") {
            total += value;
          }
        });

        return total || "";
      });

      // Add totals row to the data
      dataToExport.push(totalsRow);

      // Create a new workbook and add a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Sheet1");

      // Fetch and add the image
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: Buffer.from(arrayBuffer),
        extension: "jpg",
      });

      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 500, height: 100 },
      });

      // Add some empty rows after the image to position the header
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);

      // Add headers with styles
      const headerRow = worksheet.addRow(headerLabels);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "0766AD" }, // Set header background color to #0766AD
        };
        cell.font = { bold: true, color: { argb: "FFFFFF" } }; // Set font color to white
        cell.alignment = { horizontal: "center", vertical: "center" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Add data rows
      dataToExport.forEach((dataRow, rowIndex) => {
        const row = worksheet.addRow(dataRow);
        row.eachCell((cell) => {
          cell.alignment = { horizontal: "center", vertical: "center" };
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });

        // Apply specific styling to the totals row
        if (rowIndex === dataToExport.length - 1) {
          // Check if it's the last row (totals row)
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "EEEEEE" }, // Set background color to #EEEEEE
            };
            cell.font = { bold: true }; // Optionally make the font bold for the totals row
            cell.border = {
              top: { style: "thick", color: { argb: "000000" } }, // Darker top border
              left: { style: "thick", color: { argb: "000000" } }, // Darker left border
              bottom: { style: "thick", color: { argb: "000000" } }, // Darker bottom border
              right: { style: "thick", color: { argb: "000000" } }, // Darker right border
            };
          });
        }
      });

      // Adjust column widths dynamically based on the content
      worksheet.columns.forEach((column, colIndex) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const cellLength = cell.value ? cell.value.toString().length : 0;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        });

        const headerLength = headerLabels[colIndex].length;
        column.width = Math.max(headerLength, maxLength) + 2; // Add some padding
      });

      // Ensure all cells, including empty ones, have borders
      worksheet.eachRow((row) => {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        });
      });

      // Save the workbook
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `${reportName}.xlsx`);
    },
    handleExportToPDF: async () => {
      if (!reportCalled) {
        toast.error("Please generate report first");
        return;
      }

      // Create a new PDF document
      const doc = new jsPDF("landscape");

      // Add an image if necessary
      try {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");
        doc.addImage(
          `data:image/jpeg;base64,${base64String}`,
          "JPEG",
          10,
          10,
          280,
          50
        );
      } catch (error) {
        console.error("Error adding image to PDF:", error);
      }

      // Prepare the headers and data for the table
      const headerLabels = gridHeader.map((g) => g.label);

      const dataToExport = tableData.map((row) => {
        return gridHeader.map((header) => {
          const gridItem = grid.find((g) => g._id === header.fieldname);

          if (!gridItem) {
            console.warn(`Grid item not found for label: ${header.label}`);
            return ""; // Return an empty string if not found
          }

          let value = row[gridItem.fieldname];

          // Format date if applicable
          if (typeof value === "string" && isValidDate(value)) {
            value = moment(value).format(DateFormat || "DD-MM-YYYY"); // Use DateFormat if available
          }

          return value !== undefined ? value : "";
        });
      });

      // Calculate totals and add to the last row
      const totalsRow = headerLabels.map((label, index) => {
        if (index === 0) return "Grand Total";

        let total = 0;
        dataToExport.forEach((row) => {
          const value = row[index];
          if (typeof value === "number") {
            total += value;
          }
        });

        return total || "";
      });

      // Add the totals row to the data
      dataToExport.push(totalsRow);

      // Add a title
      doc.text(reportName || "Report", 14, 70);

      // Add the table with autoTable
      doc.autoTable({
        startY: 80, // Start after the image and title
        head: [headerLabels],
        body: dataToExport,
        styles: {
          fontSize: 8, // Set font size
          cellPadding: 2, // Adjust padding if necessary
          valign: "middle", // Vertically align text to the middle
          halign: "center", // Horizontally align text to the center
          lineColor: [0, 0, 0], // Border color
          lineWidth: 0.5, // Border width
        },
        headStyles: {
          fillColor: [7, 102, 173], // Header background color
          textColor: [255, 255, 255], // Header text color
          fontStyle: "bold",
          halign: "center",
        },
        footStyles: {
          fillColor: [238, 238, 238], // Footer background color
          textColor: [0, 0, 0], // Footer text color
          fontStyle: "bold",
        },
        theme: "grid", // Apply grid theme to the table
        showHead: "everyPage", // Show header on every page
        showFoot: "lastPage", // Show footer only on the last page
        didDrawPage: function (data) {
          // Add footer with page numbers
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();
          doc.text(
            `Page ${pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
        },
        willDrawCell: function (data) {
          // Apply styling to the last row (Grand Total row)
          if (data.row.index === data.table.body.length - 1) {
            data.cell.styles.fillColor = [211, 211, 211]; // Set background color to gray
            data.cell.styles.textColor = [0, 0, 0]; // Set text color to black
            data.cell.styles.fontStyle = "bold"; // Set font to bold
          }
        },
      });

      // Save the PDF
      doc.save(`${reportName || "report"}.pdf`);
    },
    handleExportToPDFDataOnly: async () => {
      if (!reportCalled) {
        toast.error("Please generate report first");
        return;
      }

      // Create a new PDF document
      const doc = new jsPDF("landscape");

      // Add an image if necessary
      try {
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");
        doc.addImage(
          `data:image/jpeg;base64,${base64String}`,
          "JPEG",
          10,
          10,
          280,
          50
        );
      } catch (error) {
        console.error("Error adding image to PDF:", error);
      }

      // Prepare the headers and data for the table
      const headerLabels = gridHeader.map((g) => g.label);

      const dataToExport = tableData.map((row) => {
        return gridHeader.map((header) => {
          const gridItem = grid.find((g) => g._id === header.fieldname);

          if (!gridItem) {
            console.warn(`Grid item not found for label: ${header.label}`);
            return ""; // Return an empty string if not found
          }

          let value = row[gridItem.fieldname];

          // Format date if applicable
          if (typeof value === "string" && isValidDate(value)) {
            value = moment(value).format(DateFormat || "DD-MM-YYYY"); // Use DateFormat if available
          }

          return value !== undefined ? value : "";
        });
      });

      // Calculate totals and add to the last row
      const totalsRow = headerLabels.map((label, index) => {
        if (index === 0) return "Grand Total";

        let total = 0;
        dataToExport.forEach((row) => {
          const value = row[index];
          if (typeof value === "number") {
            total += value;
          }
        });

        return total || "";
      });

      // Add the totals row to the data
      dataToExport.push(totalsRow);

      // Add a title
      doc.text(reportName || "Report", 14, 70);

      // Add the table with autoTable
      doc.autoTable({
        startY: 80, // Start after the image and title
        head: [headerLabels],
        body: dataToExport,
        styles: {
          fontSize: 8, // Set font size
          cellPadding: 2, // Adjust padding if necessary
          valign: "middle", // Vertically align text to the middle
          halign: "center", // Horizontally align text to the center
          lineColor: [0, 0, 0], // Border color
          lineWidth: 0.5, // Border width
        },
        headStyles: {
          fillColor: [7, 102, 173], // Header background color
          textColor: [255, 255, 255], // Header text color
          fontStyle: "bold",
          halign: "center",
        },
        footStyles: {
          fillColor: [238, 238, 238], // Footer background color
          textColor: [0, 0, 0], // Footer text color
          fontStyle: "bold",
        },
        theme: "grid", // Apply grid theme to the table
        showHead: "everyPage", // Show header on every page
        showFoot: "lastPage", // Show footer only on the last page
        didDrawPage: function (data) {
          // Add footer with page numbers
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height
            ? pageSize.height
            : pageSize.getHeight();
          doc.text(
            `Page ${pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
        },
        willDrawCell: function (data) {
          // Apply styling to the last row (Grand Total row)
          if (data.row.index === data.table.body.length - 1) {
            data.cell.styles.fillColor = [211, 211, 211]; // Set background color to gray
            data.cell.styles.textColor = [0, 0, 0]; // Set text color to black
            data.cell.styles.fontStyle = "bold"; // Set font to bold
          }
        },
      });

      // Save the PDF
      doc.save(`${reportName || "report"}.pdf`);
    },
    handleExportToCSV: () => {
      if (!reportCalled) {
        toast.error("Please generate report first");
        return;
      }
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
    },
    handleClose: () => {
      setParaText("Do you want to close this form, all changes will be lost?");
      setIsError(true);
      setOpenModal((prev) => !prev);
    },
    handleChart: () => {
      const formValueFormat = (obj) => {
        const result = {};
        for (const key in obj) {
          if (typeof obj[key] !== "object" && key !== "chartType") {
            result[key] = Number(obj[key]);
          }
        }
        return result;
      };

      const filterData = formValueFormat(newState);

      setChartData(filterData);
    },
    handlePivot: async () => {
      const requestBodyForMenuReportDetails = {
        columns:
          "spName,reportCriteriaId,isDefaultDataShow,outputFileType,isSp",
        tableName: "tblMenuReportMapping",
        whereCondition: `menuId = ${search}`,
        clientIdCondition: `status = 1 FOR JSON PATH,INCLUDE_NULL_VALUES`,
      };
      reportData = await fetchReportData(requestBodyForMenuReportDetails);
      const spName = reportData.data[0].spName;
      const data = await fetchDynamicReportSpData(spName, filterCondition);
      const rowFields = pivotRowFields.split(",").map((f) => f.trim());
      const colFields = pivotColFields.split(",").map((f) => f.trim());
      const valueField = pivotValueFields.trim();
      const pivot = data.data[0];

      const pivotMap = new Map();
      const columnHierarchy = new Map();
      const subtotalColumns = new Set();

      pivot.forEach((row) => {
        const rowKey = rowFields.map((f) => row[f] ?? "").join("||");
        const colKeyParts = colFields.map((f) => row[f] ?? "");
        const colKey = colKeyParts.join("||");
        const value = parseFloat(row[valueField]) || 0;

        // Build hierarchy
        let currentLevel = columnHierarchy;
        colKeyParts.forEach((part, i) => {
          if (!currentLevel.has(part)) {
            currentLevel.set(part, new Map());
          }
          if (i === colKeyParts.length - 1) {
            currentLevel.set(part, null);
          } else {
            currentLevel = currentLevel.get(part);
          }
        });

        if (!pivotMap.has(rowKey)) {
          pivotMap.set(rowKey, {
            __rowFields: rowFields.map((f) => row[f] ?? ""),
          });
        }

        const existing = pivotMap.get(rowKey);
        existing[colKey] = (existing[colKey] || 0) + value;
        pivotMap.set(rowKey, existing);
      });

      // Generate structured headers with subtotals
      const structuredHeaders = [];

      const generateHeaders = (hierarchy, parentKeys = []) => {
        let subtotalKey;

        for (const [key, subMap] of hierarchy.entries()) {
          if (subMap === null) {
            const header = {
              ...Object.fromEntries(
                parentKeys.map((val, idx) => ["level" + (idx + 1), val])
              ),
              ["level" + (parentKeys.length + 1)]: key,
              key: [...parentKeys, key].join("||"),
            };
            structuredHeaders.push(header);
          } else {
            generateHeaders(subMap, [...parentKeys, key]);

            // Subtotal
            subtotalKey = [...parentKeys, key, "Subtotal"].join("||");
            structuredHeaders.push({
              ...Object.fromEntries(
                [...parentKeys, key].map((val, idx) => [
                  "level" + (idx + 1),
                  val,
                ])
              ),
              ["level" + (parentKeys.length + 2)]: "Subtotal",
              key: subtotalKey,
            });
            subtotalColumns.add(subtotalKey);
          }
        }
      };

      generateHeaders(columnHierarchy);

      const finalHeaders = [
        ...rowFields,
        ...structuredHeaders.map((h) => h.key),
      ];
      if (pivotRowTable === "y") finalHeaders.push("Row Total");

      const groupedRows = new Map();
      for (const [_, rowData] of pivotMap) {
        const rowGroupKey = rowData.__rowFields[0];
        if (!groupedRows.has(rowGroupKey)) groupedRows.set(rowGroupKey, []);

        const rowObj = {};
        rowFields.forEach((f, idx) => {
          rowObj[f] = rowData.__rowFields[idx];
        });
        structuredHeaders.forEach((h) => {
          rowObj[h.key] = rowData[h.key] || 0;
        });

        // Subtotal calculations
        for (const h of structuredHeaders) {
          if (h.key.endsWith("||Subtotal")) {
            const prefix = h.key.replace(/\|\|Subtotal$/, "");
            const matching = structuredHeaders.filter(
              (x) =>
                x.key.startsWith(prefix + "||") && !x.key.endsWith("||Subtotal")
            );
            rowObj[h.key] = matching.reduce(
              (sum, x) => sum + (rowObj[x.key] || 0),
              0
            );
          }
        }

        if (pivotRowTable === "y") {
          rowObj["Row Total"] = structuredHeaders.reduce(
            (sum, h) => sum + (rowObj[h.key] || 0),
            0
          );
        }

        groupedRows.get(rowGroupKey).push(rowObj);
      }

      const pivotData = [];
      groupedRows.forEach((rows, groupKey) => {
        rows.forEach((row) => pivotData.push(row));
        const subtotalRow = { [rowFields[0]]: `Subtotal - ${groupKey}` };
        structuredHeaders.forEach((h) => {
          subtotalRow[h.key] = rows.reduce(
            (sum, r) => sum + (r[h.key] || 0),
            0
          );
        });
        if (pivotRowTable === "y") {
          subtotalRow["Row Total"] = structuredHeaders.reduce(
            (sum, h) => sum + (subtotalRow[h.key] || 0),
            0
          );
        }
        pivotData.push(subtotalRow);
      });

      if (pivotGrandTotal === "y") {
        const grandTotalRow = {};
        rowFields.forEach(
          (f, idx) => (grandTotalRow[f] = idx === 0 ? "Grand Total" : "")
        );
        structuredHeaders.forEach((h) => {
          grandTotalRow[h.key] = pivotData.reduce(
            (sum, row) => sum + (row[h.key] || 0),
            0
          );
        });
        if (pivotRowTable === "y") {
          grandTotalRow["Row Total"] = structuredHeaders.reduce(
            (sum, h) => sum + (grandTotalRow[h.key] || 0),
            0
          );
        }
        pivotData.push(grandTotalRow);
      }

      const pivotValues = pivotData.map((row) =>
        finalHeaders.map((h) => row[h] ?? "")
      );
      setFullPivotValues(pivotValues);
      setPivotHeader(structuredHeaders);
      setSubtotalColumns(Array.from(subtotalColumns));

      const lastItemIndexPagination =
        currentPaginationPage * itemsPerPaginatedPage;
      const firstItemIndexPagination =
        lastItemIndexPagination - itemsPerPaginatedPage;
      const currentItemsPagination = pivotValues.slice(
        firstItemIndexPagination,
        lastItemIndexPagination
      );

      setLastPagePagination(
        Math.ceil(pivotValues.length / itemsPerPaginatedPage)
      );
      setPivotGrid(currentItemsPagination);
    },
  };

  const handlePageChange = (page, tableData) => {
    const startIndex = (page - 1) * itemsPerPaginatedPage;
    const endIndex = startIndex + itemsPerPaginatedPage;
    const currentItemsPagination = tableData?.slice(startIndex, endIndex);
    setPivotGrid(currentItemsPagination);
    setCurrentPageNumber(page);
  };

  useEffect(() => {
    const startIndex = (currentPageNumber - 1) * itemsPerPaginatedPage;
    const endIndex = startIndex + itemsPerPaginatedPage;
    const currentItemsPagination = fullPivotValues?.slice(startIndex, endIndex);
    const lastPagePagination = Math.ceil(
      fullPivotValues.length / itemsPerPaginatedPage
    );
    setPivotGrid(currentItemsPagination);
    setLastPagePagination(lastPagePagination);
  }, [itemsPerPaginatedPage, currentPageNumber]);

  const onConfirm = async (conformData) => {
    if (conformData.isError) {
      setOpenModal((prev) => !prev);
      setClearFlag({
        isClear: false,
        fieldName: "",
      });
    }
  };

  function groupAndSortFields(fields) {
    // Group fields by 'sectionHeader'
    const groupedFields = fields.reduce((acc, field) => {
      const section = field.sectionHeader || "default"; // Use 'default' or any other value for fields without sectionHeader
      acc[section] = acc[section] || [];
      acc[section].push(field);
      return acc;
    }, {});

    // Sort each group by 'sectionOrder'
    Object.keys(groupedFields).forEach((section) => {
      groupedFields[section].sort(
        (a, b) => (a.sectionOrder || 0) - (b.sectionOrder || 0)
      );
    });

    return groupedFields;
  }

  async function fetchData() {
    setIsLoading(true); // Start loading
    setPaginatedData([]);
    setTableData([]);
    let reportData = null;
    try {
      setIsLoading(true);
      let apiEndPoint;
      const requestBody = {
        menuId: search,
        clientId: clientId,
      };
      const apiResponse = await reportSearchCriteria(requestBody);
      let tempNewState = { ...newState };
      if (apiResponse.success) {
        const fetchedData = apiResponse.data[0];
        setReportName(fetchedData.reportName);
        for (const field of fetchedData.fields) {
          if (
            field.referenceTable !== "" &&
            field.referenceTable !== null &&
            field.referenceColumn !== "" &&
            field.referenceColumn !== null &&
            field.controlDefaultValue !== "" &&
            field.controlDefaultValue !== null
          ) {
            const requestBodyDefaultValue = {
              onfilterkey: "status",
              onfiltervalue: 1,
              referenceTable: field.referenceTable,
              referenceColumn: field.referenceColumn,
              dropdownFilter: field.controlDefaultValue || "",
            };
            try {
              const apiResponseDefaultValue = await dynamicDropDownFieldsData(
                requestBodyDefaultValue
              );
              field.controlDefaultValue = apiResponseDefaultValue.data[0].id;
            } catch (error) {
              console.error(
                `Error fetching data for referenceTable: ${field.referenceTable}, referenceColumn: ${field.referenceColumn}`,
                error
              );
            }
          }
        }
        fetchedData.fields.forEach((element) => {
          tempNewState = {
            ...tempNewState,
            [element.fieldname]: element.controlDefaultValue,
          };
          if (element.controlname === 6652) {
            if (element.controlDefaultValue != null) {
              tempNewState = {
                ...tempNewState,
                [`${element.fieldname}dropdown`]: element.controlDefaultValue,
                [element.fieldname]: element.controlDefaultValue.value || "",
              };
            }
          }
          if (element.controlname === 6755) {
            if (element.controlDefaultValue != null) {
              tempNewState = {
                ...tempNewState,
                [`${element.fieldname}multiselect`]:
                  element.controlDefaultValue,
                [element.fieldname]: element.controlDefaultValue.value || "",
              };
            }
          }
        });
        let fetchedDataFields = [];
        fetchedDataFields = fetchedData.fields;
        setParentGroupingDepth(fetchedData.groupingDepth);
        setDateCriteria(fetchedData.dateCriteria);
        setGroupingField(fetchedData.groupingDepth);
        setGroupingDepth(fetchedData.groupingDepth);
        const updatedFields = await Promise.all(
          fetchedDataFields.map(async (field) => {
            const updatedField = { ...field };

            // Update controlname
            if (field.controlname) {
              const requestBodyControlName = {
                columns: "md.id,md.name",
                tableName:
                  "tblMasterData md Left join tblMasterList ml on ml.id = md.masterListId",
                whereCondition: `ml.name = 'tblControlType' and md.status = 1`,
                clientIdCondition: `ml.status = 1 FOR JSON PATH`,
              };

              try {
                const dataControlName = await fetchReportData(
                  requestBodyControlName
                );
                if (dataControlName && dataControlName.data.length > 0) {
                  let isMatchFound = false;
                  for (const item of dataControlName.data) {
                    if (item.id === updatedField.controlname) {
                      updatedField.controlname = item.name;
                      isMatchFound = true;
                    }
                  }

                  if (!isMatchFound) {
                    console.error(
                      "No matching ID found in dataControlName.data"
                    );
                  }
                } else {
                  console.error("No data available or empty data set received");
                }
              } catch (error) {
                console.error("Error fetching data for controlname:", error);
              }
            }

            // Update type
            if (field.type) {
              const requestBodyType = {
                columns: "md.id,md.name",
                tableName:
                  "tblMasterData md Left join tblMasterList ml on ml.id = md.masterListId",
                whereCondition: `ml.name ='tblDataType' and md.status = 1`,
                clientIdCondition: `ml.status = 1 FOR JSON PATH`,
              };
              try {
                const dataType = await fetchReportData(requestBodyType);
                if (dataType && dataType.data.length > 0) {
                  let isMatchFound = false;
                  for (const item of dataType.data) {
                    if (item.id === updatedField.type) {
                      updatedField.type = item.name;
                      isMatchFound = true;
                    }
                  }

                  if (!isMatchFound) {
                    console.error(
                      "No matching ID found for updatedField.type in dataType.data"
                    );
                  }
                } else {
                  console.error("dataType is undefined or contains no data");
                }
              } catch (error) {
                console.error("Error fetching data for type:", error);
              }
            }
            return updatedField;
          })
        );

        setFormControlData({ ...fetchedData, fields: updatedFields });

        const resData = groupAndSortFields(updatedFields);
        setFormControlData(fetchedData);
        setParentsFields(resData);
        setButtonsData(fetchedData.buttons);
        setOriginalData(fetchedData.grid);
        setFetchedDataFromAPI(fetchedData.grid);
        const apiGrid = fetchedData.grid;
        setApiGridData(apiGrid);
        const apiId = fetchedData.apiUrl;
        const fetchGrid = fetchedData.grid;
        var grid = [];

        console.log("grid", grid);
        console.log("header", gridHeader);

        const requestBody = {
          columns: "apiPath",
          tableName: "tblApiDefinition",
          whereCondition: `id = ${apiId}`,
          clientIdCondition: `status = 1 FOR JSON PATH`,
        };
        try {
          const data = await fetchReportData(requestBody);
          if (data) {
            apiEndPoint = data.data[0].apiPath;
            setAPiUrl(data.data[0].apiPath);
          } else {
          }
        } catch (error) {
          console.error("Error fetching report types:", error);
        }
        const updateFieldNames = async (updatedFields) => {
          const updatedFilterCondition = {};
          const promises = updatedFields.map(async (field) => {
            const requestBodyGrid = {
              columns: "id,fieldname,label",
              tableName: "tblApiFields",
              whereCondition: `id = ${field.fieldname}`,
              clientIdCondition: `status = 1 FOR JSON PATH`,
            };
            try {
              const data = await fetchReportData(requestBodyGrid);
              if (data && data.data && data.data[0] && data.data[0].apiFields) {
                const apiField = data.data[0];
                const newFieldName = apiField.fieldname;
                // Add the new fieldname with the controlDefaultValue
                updatedFilterCondition[newFieldName] =
                  field.controlDefaultValue;
              } else {
                console.error("No data returned for key:", field._id);
              }
            } catch (error) {
              console.error(
                "Error fetching report types for key:",
                field._id,
                error
              );
            }
          });

          await Promise.all(promises);

          // Remove fields with null or empty string values
          const filteredCondition = Object.keys(updatedFilterCondition)
            .filter(
              (key) =>
                updatedFilterCondition[key] !== null &&
                updatedFilterCondition[key] !== ""
            )
            .reduce((obj, key) => {
              obj[key] = updatedFilterCondition[key];
              return obj;
            }, {});
          return filteredCondition;
        };

        setFilterCondition(filterCondition);
        const updatedConditionWithFieldNames = await updateFieldNames(
          updatedFields
        );
        setFilterCondition(updatedConditionWithFieldNames);
        const apiEndPointValue = `${apiEndPoint}`;
        const updatedFilterCondition = updatedConditionWithFieldNames;

        const requestBodyForMenuReportDetails = {
          columns:
            "spName,reportCriteriaId,isDefaultDataShow,outputFileType,isSp,isDisplayGrandTotal",
          tableName: "tblMenuReportMapping",
          whereCondition: `menuId = ${search}`,
          clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
        };
        let getSpName = null;
        let isSpName = null;
        try {
          reportData = await fetchReportData(requestBodyForMenuReportDetails);
          console.log("data ", reportData);

          if (reportData) {
            setSpName(reportData.data[0].spName);
            getSpName = reportData.data[0].spName;
            setIsDataFromStoredProcedure(reportData.data[0].isSp);
            setIsDefaultDataShow(
              reportData?.data[0]?.isDefaultDataShow === false ? false : true
            );
            setOutputFileType(
              reportData?.data[0]?.outputFileType === null ? true : false
            );
            setOutputFileFormat(reportData?.data[0]?.outputFileType);
            setIsDisplayGrandTotal(reportData?.data[0]?.isDisplayGrandTotal);
          } else {
            console.log("spName not found");
          }
        } catch (error) {
          console.error("Error fetching report types:", error);
        }
        if (
          reportData?.data[0]?.isDefaultDataShow === true &&
          reportData?.data[0]?.outputFileType === null
        ) {
          console.log("getSpName", getSpName);
          let responseData = await dynamicReportFilter(
            updatedFilterCondition,
            clientId,
            getSpName
          );

          if (responseData && responseData.success) {
            const processedData = preprocessDataForGrouping(
              responseData.data,
              grid,
              groupingDepth
            );
            if (isDataFromStoredProcedure) {
              if (processedData.length > 0) {
                const keys = Object.keys(processedData[0]);

                const fieldNamesFormattedArray = keys
                  .filter(
                    (key) =>
                      key !== "groupSpans" && key !== "startIndexForGroup"
                  )
                  .map((key) => ({
                    fieldname: key,
                    label: key,
                    minWidth: 100,
                    width: 150,
                  }));

                setGrid(fieldNamesFormattedArray);
                setGridHeader(fieldNamesFormattedArray);
              } else {
                console.log("Filtered data is empty");
              }
            } else {
              for (var key = 0; key < apiGrid.length; key++) {
                var apiFieldsId = fetchGrid[key].fieldname;
                if (
                  apiFieldsId === undefined ||
                  apiFieldsId === null ||
                  apiFieldsId === ""
                ) {
                  grid.push({
                    fieldName: fetchGrid[key].label,
                    label: fetchGrid[key].label,
                    _id: null,
                  });
                } else {
                  const requestBodyGrid = {
                    columns: "af.id,af.fieldname,af.label",
                    tableName:
                      "tblApiDefinition ad Left join tblApiFields af on af.apiDefinitionId = ad.id",
                    whereCondition: `af.id = ${apiFieldsId} and af.status = 1 and ad.status = 1`,
                    clientIdCondition: `ad.status = 1 FOR JSON PATH`,
                  };
                  try {
                    const data = await fetchReportData(requestBodyGrid);
                    if (data) {
                      grid.push(data.data[0]);
                    } else {
                      console.error("No data returned for key:", key);
                    }
                  } catch (error) {
                    console.error(
                      "Error fetching report types for key:",
                      key,
                      error
                    );
                  }
                }
              }
              setGrid(grid);
              const header = fetchGrid.map((gridItem) => ({
                fieldname: gridItem.fieldname,
                label: gridItem.label,
                minWidth: gridItem.minWidth || 100,
                width: gridItem.width || 150,
              }));
              setGridHeader(header);
            }
            setPaginatedData(processedData);
            setFilteredSortData(processedData);
            setTableData(processedData);
            setIsDataInitialized(true);
          } else {
            // setLoader(false);
          }
        }
        setIsSortingEnabled(fetchedData.sorting === "y");
        setNewState((prev) => {
          return { ...prev, ...tempNewState };
        });
        setFilterCondition(newState);
      } else {
        setParaText(apiResponse.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  }

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

  useEffect(() => {
    const fetchDateFormat = async () => {
      const requestBody = {
        columns: "dateTimeFormat",
        tableName: "tblUser",
        whereCondition: `emailId = '${emailId}' and status = 1`,
        clientIdCondition: `clientId = ${clientId} FOR JSON PATH`,
      };
      try {
        const data = await fetchReportData(requestBody);
        if (data) {
          setDateFormat(data.data[0].dateTimeFormat);
        } else {
          toast.error("Failed to fetch report types");
        }
      } catch (error) {
        console.error("Error fetching report types:", error);
      }
    };
    fetchDateFormat();
  }, []);

  useEffect(() => {
    handleButtonClick.handleSubmit();
  }, []);

  useEffect(() => {
    fetchData();
  }, [search, groupingField, spName]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = paginatedData?.slice(firstItemIndex, lastItemIndex);
  const lastPage = Math.ceil(tableData.length / itemsPerPage);

  const updatePaginatedData = (page) => {
    const endIndex = page * itemsPerPage;
    const startIndex = endIndex - itemsPerPage;
    if (isSortingEnabled === false) {
      setFinalPaginatedData(paginatedData.slice(startIndex, endIndex));
      setDataForExcel(paginatedData);
    } else {
      setFinalPaginatedData(filteredSortData.slice(startIndex, endIndex));
      setDataForExcel(filteredSortData);
    }
  };

  // On change handler updates page and triggers pagination update
  const handleChange = (page) => {
    setCurrentPage(page);
    updatePaginatedData(page);
  };

  // useEffect to handle initial load and react to page changes
  useEffect(() => {
    updatePaginatedData(currentPage);
  }, [currentPage, itemsPerPage, paginatedData]);

  const preprocessDataForGrouping = (data, grid, groupingDepth) => {
    let totalGroupingDepth = grid.length;

    if (groupingDepth > totalGroupingDepth) {
      toast.error("Grouping depth should be less than or equal to grid depth");
      setPaginatedData([]);
      return;
    }

    const groupedData = data.map((item) => ({
      ...item,
      groupSpans: Array(groupingDepth).fill(1),
      startIndexForGroup: Array(groupingDepth).fill(null),
    }));

    let prevValues = Array(groupingDepth).fill(null);

    for (let i = 0; i < groupingDepth; i++) {
      let spanCount = 1;

      // Using both fieldname and the column index to ensure uniqueness
      let uniqueFieldname = `${grid[i].fieldname}_${i}`; // Column index ensures uniqueness

      for (let j = 0; j < data.length; j++) {
        const currentValue = data[j][grid[i].fieldname];

        if (
          prevValues[i] === currentValue &&
          isSameGroupContext(data, j, i, grid)
        ) {
          spanCount++;
          groupedData[j - spanCount + 1].groupSpans[i] = spanCount;
          groupedData[j].groupSpans[i] = 0;
        } else {
          spanCount = 1;
          prevValues[i] = currentValue;
          groupedData[j].startIndexForGroup[i] = j;
        }
      }
    }

    return groupedData;
  };

  function isSameGroupContext(data, currentIndex, depth, grid) {
    if (currentIndex === 0) return false;

    for (let k = 0; k < depth; k++) {
      // Include column index to ensure uniqueness for fields with the same name
      let uniqueFieldname = `${grid[k].fieldname}_${k}`;

      let sameContext =
        data[currentIndex][grid[k].fieldname] ===
        data[currentIndex - 1][grid[k].fieldname];

      if (!sameContext) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    function updateTableRowsColor() {
      const newRowColors = {};
      dataForExcel.forEach((item, index) => {
        const bgColor = item.colorCodeNew || "transparent";
        newRowColors[index] = bgColor;
      });
      setRowColorsForExcel(newRowColors);
    }
    if (dataForExcel.length > 0) {
      updateTableRowsColor();
    }
  }, [dataForExcel]);

  let rowColors = {};
  const renderTableData = (data, rowIndex, colorCode) => {
    // Determine the background color for this row
    let bgColor = "";
    if (colorCode === undefined || colorCode === null || colorCode === "") {
      bgColor = rowIndex === activeRowIndex ? "transparent" : "transparent";
    } else {
      bgColor = rowIndex === activeRowIndex ? `${colorCode}` : `${colorCode}`;
    }
    rowColors[rowIndex] = bgColor; // Store color in rowColors object with rowIndex as key

    return grid.map((item, colIndex) => {
      let content = data[item.fieldname];

      if (data.groupSpans[colIndex] === 0) {
        return null; // Skip rendering cells that are part of a group
      }

      if (!DateFormat && typeof content === "string" && isValidDate(content)) {
        content = moment(content).format("DD-MM-YYYY");
      } else if (
        DateFormat &&
        typeof content === "string" &&
        isValidDate(content)
      ) {
        content = moment(content).format(`${DateFormat}`);
      }

      // Render the cell with proper row span and background color
      return (
        <TableCell
          key={`${item.fieldname}-${rowIndex}-${colIndex}`}
          rowSpan={
            data.groupSpans[colIndex] > 1
              ? data.groupSpans[colIndex]
              : undefined
          }
          style={{
            backgroundColor: rowColors[rowIndex], // Use stored color
            border: "1px solid grey",
          }}
          className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
        >
          {content}
        </TableCell>
      );
    });
  };

  const handleKeyDown = (event) => {
    const maxColumns = grid.length; // Calculate the number of columns
    const maxRows = paginatedData?.length; // Calculate the number of rows

    switch (event.key) {
      case "ArrowUp":
        if (activeRowIndex > 0) {
          setActiveRowIndex((prevIndex) => prevIndex - 1); // Move up
        }
        break;
      case "ArrowDown":
        if (activeRowIndex < maxRows - 1) {
          setActiveRowIndex((prevIndex) => prevIndex + 1); // Move down
        }
        break;
      case "ArrowRight":
        if (activeColIndex < maxColumns - 1) {
          setActiveColIndex((prevIndex) => prevIndex + 1); // Move right
        }
        break;
      case "ArrowLeft":
        if (activeColIndex > 0) {
          setActiveColIndex((prevIndex) => prevIndex - 1); // Move left
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeRowIndex, activeColIndex, paginatedData, grid]);

  useEffect(() => {
    if (rowRefs.current[activeRowIndex]) {
      const activeRow = rowRefs.current[activeRowIndex];
      const activeCell = activeRow.children[activeColIndex];
      const container = activeRow.closest(".MuiTableContainer-root");

      if (activeCell && container) {
        const cellOffsetLeft = activeCell.offsetLeft; // Distance from the left edge of the cell to the container's left edge
        const containerScrollLeft = container.scrollLeft; // Current horizontal scroll position of the container
        const containerWidth = container.clientWidth; // Width of the visible part of the container
        const cellWidth = activeCell.offsetWidth; // Width of the active cell

        if (cellOffsetLeft < containerScrollLeft) {
          container.scrollLeft = cellOffsetLeft;
        } else if (
          cellOffsetLeft + cellWidth >
          containerScrollLeft + containerWidth
        ) {
          container.scrollLeft = cellOffsetLeft + cellWidth - containerWidth;
        }
      }
    }
  }, [activeColIndex, activeRowIndex]);

  useEffect(() => {
    if (rowRefs.current[activeRowIndex]) {
      const activeRow = rowRefs.current[activeRowIndex];
      const container = activeRow.closest(".MuiTableContainer-root");

      if (activeRow && container) {
        const rowRect = activeRow.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const additionalRowsHeight = rowRect.height * 2;

        if (rowRect.top < containerRect.top) {
          container.scrollTop -=
            containerRect.top - rowRect.top + additionalRowsHeight; // Scroll two rows further up
        } else if (rowRect.bottom > containerRect.bottom) {
          container.scrollTop +=
            rowRect.bottom - containerRect.bottom + rowRect.height; // Scroll down slightly less than needed
        }
      }
    }
  }, [activeRowIndex, activeColIndex]);

  const handleSort = (columnId, label) => {
    if (!isSortingEnabled) {
      return;
    }

    const dataKey = getDataKeyFromColumnId(columnId, grid);
    const newSortDirection =
      sortColumn === columnId && sortDirection === "asc" ? "desc" : "asc";

    let sortedData;

    // Check if the column is a Date field (based on columnId or label containing 'Date')
    if (
      label.toLowerCase().includes("date") ||
      columnId.toLowerCase().includes("date")
    ) {
      sortedData = sortJsonDataByDate(
        filteredSortData,
        dataKey,
        newSortDirection
      );
    } else {
      sortedData = sortJsonData(filteredSortData, dataKey, newSortDirection);
    }

    setFilteredSortData(sortedData);
    setSortColumn(columnId);
    setSortDirection(newSortDirection);
    const endIndex = currentPage * itemsPerPage;
    const startIndex = endIndex - itemsPerPage;

    if (isSortingEnabled) {
      setFinalPaginatedData(sortedData.slice(startIndex, endIndex));
    }
  };

  // Custom sort function for Date type fields
  const sortJsonDataByDate = (data, dataKey, sortDirection) => {
    return data.sort((a, b) => {
      const dateA = parseDate(a[dataKey]);
      const dateB = parseDate(b[dataKey]);

      if (sortDirection === "asc") {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });
  };

  // Function to parse dates in dd/mm/yyyy format to a Date object
  const parseDate = (dateString) => {
    const parts = dateString.split("/");
    // parts[0] = day, parts[1] = month, parts[2] = year
    return new Date(parts[2], parts[1] - 1, parts[0]); // Date constructor uses month as 0-indexed
  };

  const handleSortPagination = (columnId, page) => {
    if (!isSortingEnabled) {
      return;
    }

    // Determining the correct sort direction
    const newSortDirection =
      sortColumn === columnId && sortDirection === "asc"
        ? `${sortDirection}`
        : `${sortDirection}`;

    // Sorting data
    const dataKey = getDataKeyFromColumnId(columnId, grid);
    const sortedData = sortJsonData(
      filteredSortData,
      dataKey,
      newSortDirection
    );

    // Updating state
    setSortColumn(columnId);
    setSortDirection(newSortDirection);
    setFilteredSortData(sortedData);
    // Calculating pagination
    const endIndex = page * itemsPerPage;
    const startIndex = endIndex - itemsPerPage;
    // Updating the paginated data
    setFinalPaginatedData(sortedData.slice(startIndex, endIndex));
  };

  const handleGroupAndSortByDepth = (data, grid) => {
    // Define the columns to sort by, in hierarchical order
    const sortColumns = grid.map((item) => item.fieldname); // Assuming grid contains column fieldnames

    // Use lodash `_.orderBy` to sort by multiple columns
    const sortedData = _.orderBy(
      data,
      sortColumns,
      Array(sortColumns.length).fill("asc")
    ); // 'asc' for ascending order
    return sortedData;
  };

  const getDataKeyFromColumnId = (columnId, grid) => {
    const map = {};

    grid.forEach((item) => {
      map[item.id] = item.fieldname;
    });

    return map[columnId] || columnId;
  };

  function handleChangeFunction(result) {
    if (result.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
        setClearFlag({
          isClear: true,
          fieldName: result.fieldName,
        });
      }
      return;
    }
    // let data = { ...result.values };
    let data = { ...result.newState };
    setNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
    setSubmitNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }
  function handleBlurFunction(result) {
    if (result?.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    let data = { ...result?.newState };
    setNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
    setSubmitNewState((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }

  return (
    <React.Fragment>
      <div className={`h-auto relative`}>
        <form onSubmit={handleButtonClick.handleSubmit}>
          {/* Middle Accordion view */}
          <div
            className={`w-full p-1`}
            style={{
              height: `calc(100vh - 15vh - ${reportData ? "60px" : "0px"} )`,
            }}
          >
            {Object.keys(parentsFields).map((section, index) => {
              return (
                <React.Fragment key={index}>
                  <Accordion
                    expanded={toggle}
                    sx={{ ...parentAccordionSection }}
                    key={1}
                    setTypeofModal={setTypeofModal}
                    getLabelValue={getLabelValue}
                  >
                    {/* Accordion Summary */}
                    <AccordionSummary
                      className="relative left-[11px]"
                      expandIcon={
                        <LightTooltip title={toggle ? "Collapse" : "Expand"}>
                          <ExpandMoreIcon sx={{ color: "black" }} />
                        </LightTooltip>
                      }
                      aria-controls={`panel${1 + 1}-content`}
                      id={`panel${1 + 1}-header`}
                      onClick={() => setToggle((prev) => !prev)}
                    >
                      <Typography className="relative right-[11px]">
                        {menuName}
                      </Typography>
                    </AccordionSummary>
                    {/* Accordion Details */}
                    <AccordionDetails
                      className={`!pb-0 overflow-hidden ${styles.thinScrollBar}`}
                      sx={{ ...accordianDetailsStyle }}
                    >
                      {/* Custom Input Fields */}

                      <CustomeInputFields
                        inputFieldData={parentsFields[section]}
                        values={newState}
                        onValuesChange={handleFieldValuesChange}
                        onChangeHandler={(result) => {
                          handleChangeFunction(result);
                        }}
                        onBlurHandler={(result) => {
                          handleBlurFunction(result);
                        }}
                        clearFlag={clearFlag}
                        formControlData={formControlData}
                        formDataChange={formDataChange}
                        setFormControlData={setFormControlData}
                        setStateVariable={setNewState}
                        getLabelValue={() => {
                          console.log("sample");
                        }}
                      />

                      {/*  Button Grid */}
                      <ButtonPanel
                        buttonsData={buttonsData}
                        handleButtonClick={handleButtonClick}
                        isReport={true}
                      />
                    </AccordionDetails>
                  </Accordion>
                  {/* Conditionally render the table based on menuType */}
                  {isDefaultDataShow &&
                    outputFileType &&
                    menuType === "D" &&
                    (isLoading ? (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "50vh",
                        }}
                      >
                        <CustomSpinner />
                      </div>
                    ) : initialLoadComplete && paginatedData?.length > 0 ? (
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
                          ref={rowRefs}
                          className={`${styles.thinScrollBar} ${styles.tableContainer} `}
                          sx={{
                            ...(toggle
                              ? displayReportTableContainerToggleStyles
                              : displayReportTableContainerStyles),
                            position: "relative !important",
                            displayTableContainerStyles,
                          }}
                        >
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
                                {gridHeader.map((item) => (
                                  <TableCell
                                    key={item.fieldname}
                                    style={{
                                      minWidth: item.minWidth,
                                      width: item.width,
                                      position: "sticky",
                                      cursor: isSortingEnabled
                                        ? "pointer"
                                        : "default",
                                    }}
                                    className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                                    onContextMenu={(event) =>
                                      handleRightClick(event, item.fieldname)
                                    }
                                  >
                                    <span
                                      onClick={() => {
                                        if (isSortingEnabled) {
                                          setSortingFieldName(item.fieldname);
                                          handleSort(
                                            item?.fieldname,
                                            item?.label
                                          );
                                        }
                                      }}
                                    >
                                      {item.label}
                                      {sortColumn === item.fieldname &&
                                        (sortDirection === "asc" ? (
                                          <ArrowDownwardIcon />
                                        ) : (
                                          <ArrowUpwardIcon />
                                        ))}
                                    </span>
                                    <span>
                                      {isInputVisible &&
                                        activeColumn === item.fieldname && ( // Conditionally render the input
                                          <CustomizedInputBase
                                            columnData={item}
                                            setPrevSearchInput={
                                              setPrevSearchInput
                                            }
                                            prevSearchInput={prevSearchInput}
                                            setInputVisible={setInputVisible}
                                            isInputVisible={isInputVisible}
                                            setGridData={setFinalPaginatedData}
                                            originalData={paginatedData}
                                            gridData={finalPaginatedData}
                                            setCurrentPage={setCurrentPage}
                                          />
                                        )}
                                    </span>
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>

                            <TableBody
                              id="bodyRow"
                              style={{
                                overflow: "auto",
                                marginTop: "30px",
                                border: "1px solid grey",
                              }}
                              className="text-gray-900 dark:text-white"
                            >
                              {finalPaginatedData.map((data, rowIndex) => (
                                <TableRow
                                  key={data.fieldname}
                                  ref={(el) => {
                                    if (rowRefs.current) {
                                      rowRefs.current[rowIndex] = el;
                                    }
                                  }}
                                  style={{ border: "1px solid grey" }}
                                  className={`${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
                                  sx={{
                                    ...(toggledThemeValue
                                      ? displayTableRowStylesNoHover
                                      : displaytableRowStyles),
                                  }}
                                >
                                  {renderTableData(
                                    data,
                                    rowIndex,
                                    data.colorCodeNew
                                  )}
                                </TableRow>
                              ))}
                              {isDisplayGrandTotal == true &&
                                currentPage === lastPage && (
                                  <TableRow
                                    style={{
                                      border: `2px solid ${
                                        toggledThemeValue ? "white" : "black"
                                      }`,
                                    }}
                                    className={` ${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
                                    sx={{
                                      ...(toggledThemeValue
                                        ? displayTableRowStylesNoHover
                                        : displaytableRowStyles),
                                    }}
                                  >
                                    {grid.map((item, index) => {
                                      let displayGrandTotal = false;
                                      const grandTotalValue =
                                        grandTotals[item.fieldname];
                                      const correspondingApiData =
                                        apiGridData?.find(
                                          (apiItem) =>
                                            apiItem.fieldname === item.id
                                        );
                                      displayGrandTotal = correspondingApiData
                                        ? correspondingApiData.displayGrandTotal
                                        : null;

                                      return (
                                        <TableCell
                                          key={`total-${item.fieldname}`}
                                          style={{
                                            border: `1px solid ${
                                              toggledThemeValue
                                                ? "white"
                                                : "black"
                                            }`,
                                            fontWeight: "bold",
                                            color: `${
                                              toggledThemeValue
                                                ? "white"
                                                : "black"
                                            }`,
                                          }}
                                          className={`${styles.striped} ${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                                        >
                                          {isDisplayGrandTotal === true
                                            ? index === 0
                                              ? "Grand Total"
                                              : grandTotalValue !== undefined
                                              ? grandTotalValue
                                              : ""
                                            : ""}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    ) : initialLoadComplete ? (
                      <div style={{ textAlign: "center", marginTop: "20px" }}>
                        <Typography variant="h6">Data Not Found</Typography>
                      </div>
                    ) : null)}

                  {/* Render a static table if menuType is "E" */}
                  {menuType === "E" && (
                    <Paper
                      sx={{
                        ...displayReportTablePaperStyles,
                      }}
                      className={`${styles.pageBackground} `}
                    >
                      <TableContainer
                        id={"paper"}
                        className={` ${styles.thinScrollBar} ${styles.pageBackground} `}
                        sx={{
                          ...displayReportTableContainerStyles,
                          position: "relative !important",
                        }}
                      >
                        {/* Table */}
                        <Table
                          stickyHeader
                          aria-label="sticky table"
                          style={{
                            tableLayout:
                              "fixed" /* Fixed layout prevents expansion */,
                            width: "100%",
                            border: "1px solid grey",
                            borderCollapse: "collapse",
                            borderSpacing: 0,
                          }}
                          className={`min-w-full text-[9px] overflow-auto ${styles.hideScrollbar} ${styles.thinScrollBar}`}
                        >
                          {/* Table Head */}
                          <TableHead
                            className="text-white"
                            sx={{
                              ...displaytableHeadStyles,
                            }}
                          >
                            <TableRow>
                              <TableCell>Sr No</TableCell>
                              <TableCell>Row No</TableCell>
                              <TableCell>Errors</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {sortedErrors.map((error, index) => (
                              <TableRow
                                key={index}
                                sx={{
                                  ...displaytableRowStyles_two(),
                                }}
                              >
                                <TableCell
                                  style={{
                                    padding: "2px 4px",
                                    fontSize: "9px",
                                  }}
                                  align="left"
                                >
                                  {index + 1}
                                </TableCell>
                                <TableCell
                                  style={{ padding: "0px 4px" }}
                                  align="left"
                                >
                                  {error.row}
                                </TableCell>
                                <TableCell
                                  style={{ padding: "0px 4px" }}
                                  align="left"
                                >
                                  {error.message}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  )}

                  {menuType === "P" && (
                    <>
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
                          ref={rowRefs}
                          className={`${styles.thinScrollBar} ${styles.tableContainer}`}
                          sx={{
                            ...(toggle
                              ? displayReportTableContainerToggleStyles
                              : displayReportTableContainerStyles),
                            position: "relative !important",
                            displayTableContainerStyles,
                          }}
                        >
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
                              sx={{ ...displaytableHeadStyles }}
                              style={{ position: "sticky", top: 0, zIndex: 3 }}
                            >
                              <TableRow className="!border !border-gray-600">
                                {pivotRowFields.split(",").map((field, idx) => (
                                  <TableCell
                                    key={`row-header-${idx}`}
                                    rowSpan={3}
                                    align="center"
                                    className={`${styles.cellHeading} text-[9px] whitespace-nowrap !border !border-gray-600 !uppercase`}
                                    style={{
                                      position: "sticky",
                                      top: 0,
                                      zIndex: 3,
                                      minWidth: 120,
                                      padding: "2px 6px",
                                      border: "1px solid grey",
                                    }}
                                  >
                                    {field}
                                  </TableCell>
                                ))}
                                {[
                                  ...new Set(pivotHeader.map((h) => h.level1)),
                                ].map((group, idx) => {
                                  const colSpan = pivotHeader.filter(
                                    (h) => h.level1 === group
                                  ).length;
                                  return (
                                    <TableCell
                                      key={`group1-${idx}`}
                                      colSpan={colSpan}
                                      align="center"
                                      className={`${styles.cellHeading} text-[9px] whitespace-nowrap`}
                                      style={{
                                        position: "sticky",
                                        top: 0,
                                        zIndex: 3,
                                        padding: "2px 8px",
                                        border: "1px solid grey",
                                      }}
                                    >
                                      {group}
                                    </TableCell>
                                  );
                                })}
                                {pivotRowTable === "y" && (
                                  <TableCell
                                    rowSpan={3}
                                    align="center"
                                    className={`${styles.cellHeading} text-[9px]`}
                                    style={{
                                      position: "sticky",
                                      top: 0,
                                      zIndex: 3,
                                      padding: "2px 6px",
                                      border: "1px solid grey",
                                    }}
                                  >
                                    Row Total
                                  </TableCell>
                                )}
                              </TableRow>

                              {pivotColFields.split(",").length > 1 && (
                                <TableRow className="border border-gray-600">
                                  {[
                                    ...new Set(
                                      pivotHeader.map(
                                        (h) => `${h.level1}||${h.level2}`
                                      )
                                    ),
                                  ].map((key, idx) => {
                                    const [lvl1, lvl2] = key.split("||");
                                    const colSpan = pivotHeader.filter(
                                      (h) =>
                                        h.level1 === lvl1 && h.level2 === lvl2
                                    ).length;
                                    return (
                                      <TableCell
                                        key={`group2-${idx}`}
                                        colSpan={colSpan}
                                        align="center"
                                        className={`${styles.cellHeading} text-[9px] whitespace-nowrap border border-gray-600`}
                                        style={{
                                          position: "sticky",
                                          top: 24,
                                          zIndex: 2,
                                          padding: "2px 6px",
                                          border: "1px solid grey",
                                        }}
                                      >
                                        {lvl2}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              )}

                              {pivotColFields.split(",").length > 2 && (
                                <TableRow className="border border-gray-600">
                                  {pivotHeader.map((h, i) => (
                                    <TableCell
                                      key={`group3-${i}`}
                                      align="center"
                                      className={`${styles.cellHeading} text-[9px] whitespace-nowrap border border-gray-600`}
                                      style={{
                                        position: "sticky",
                                        top: 48,
                                        zIndex: 1,
                                        padding: "2px 6px",
                                        border: "1px solid grey !important",
                                      }}
                                    >
                                      {h.level3 ||
                                        h.level2 ||
                                        h.level1 ||
                                        h.key}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              )}
                            </TableHead>

                            <TableBody
                              id="bodyRow"
                              style={{
                                overflow: "auto",
                                border: "1px solid grey",
                              }}
                            >
                              {pivotGrid.map((rowData, rowIndex) => {
                                const isSubtotalRow =
                                  rowData[0]
                                    ?.toString()
                                    .startsWith("Subtotal") ||
                                  rowData[0] === "Grand Total";
                                return (
                                  <TableRow
                                    key={`row-${rowIndex}`}
                                    ref={(el) =>
                                      rowRefs.current &&
                                      (rowRefs.current[rowIndex] = el)
                                    }
                                    className={`${
                                      styles.tableCellHoverEffect
                                    } ${
                                      styles.hh
                                    } border border-gray-600 rounded-lg p-0 opacity-1 z-0 ${
                                      isSubtotalRow
                                        ? "font-bold bg-gray-100"
                                        : ""
                                    }`}
                                    sx={
                                      toggledThemeValue
                                        ? displayTableRowStylesNoHover
                                        : displaytableRowStyles
                                    }
                                  >
                                    {rowData.map((cell, colIndex) => {
                                      const headerKey =
                                        fullPivotValues[0]?.[colIndex];
                                      const isSubtotalColumn =
                                        subtotalColumns?.includes(headerKey);
                                      return (
                                        <TableCell
                                          key={`cell-${rowIndex}-${colIndex}`}
                                          className={`${styles.tableCell} whitespace-nowrap text-xs`}
                                          style={{
                                            border: "1px solid grey",
                                            fontWeight:
                                              isSubtotalRow || isSubtotalColumn
                                                ? "bold"
                                                : "normal",
                                            backgroundColor: isSubtotalColumn
                                              ? "#F5F5F5"
                                              : isSubtotalRow
                                              ? "#DDDDDD"
                                              : "",
                                            color:
                                              rowData[0] === "Grand Total"
                                                ? toggledThemeValue
                                                  ? "white"
                                                  : "black"
                                                : undefined,
                                          }}
                                        >
                                          {cell}
                                        </TableCell>
                                      );
                                    })}
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>

                      <div className="flex items-center justify-between pt-2 px-4 text-black">
                        <div className="flex items-end ml-auto">
                          <div className="mr-5">
                            <Stack>
                              <Pagination
                                count={lastPagePagination}
                                showFirstButton
                                showLastButton
                                sx={{ ...paginationStyle }}
                                onChange={(event, value) => {
                                  handlePageChange(value, fullPivotValues);
                                }}
                                renderItem={(item) => {
                                  const isDisabled =
                                    ((item.type === "first" ||
                                      item.type === "previous") &&
                                      pivotGrid === 1) ||
                                    ((item.type === "last" ||
                                      item.type === "next") &&
                                      pivotGrid === lastPagePagination);
                                  return (
                                    <PaginationItem
                                      {...item}
                                      className={`${paginationStyles.txtColorDark}`}
                                      sx={{
                                        fontSize: 10,
                                        height: 21,
                                        width: 21,
                                        minWidth: 0,
                                        color: isDisabled
                                          ? "grey"
                                          : "var(--text-color-dark)",
                                      }}
                                    />
                                  );
                                }}
                              />
                            </Stack>
                          </div>
                          <input
                            type="number"
                            value={itemsPerPaginatedPage}
                            onChange={(e) => {
                              const newItemsPerPage = parseInt(
                                e.target.value,
                                10
                              );
                              if (newItemsPerPage > 0) {
                                setItemsPerPaginatedPage(newItemsPerPage);
                                setCurrentPageNumber(1);
                              }
                            }}
                            className={`border ${styles.txtColorDark} ${styles.pageBackground} border-gray-300 rounded-md p-2 h-[17px] w-14 text-[10px] mr-[15px] outline-gray-300 outline-0`}
                          />
                          <p className={`text-[10px] ${styles.txtColorDark}`}>
                            {currentPage} of {lastPagePagination} Pages
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  {menuType === "C" && (
                    <ChartReports
                      newState={newState}
                      chartExpand={toggle}
                      formControlData={formControlData}
                      chartData={chartData}
                      clientId={clientId}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          {menuType != "P" && (
            <div className="flex items-center justify-between pt-2 px-4 text-black">
              <div className="flex items-end ml-auto">
                {/* Pagination Buttons */}
                <div className="mr-5">
                  <Stack>
                    <Pagination
                      count={lastPage}
                      showFirstButton
                      showLastButton
                      sx={{
                        ...paginationStyle,
                      }}
                      onChange={(event, value) => {
                        handleChange(value);
                        handleSortPagination(sortingFieldName, value);
                      }}
                      renderItem={(item) => {
                        const { type } = item;
                        // Check if the button should be disabled
                        const isDisabled =
                          ((type === "first" || type === "previous") &&
                            currentItems === 1) ||
                          ((type === "last" || type === "next") &&
                            currentItems === lastPage);
                        return (
                          <PaginationItem
                            {...item}
                            className={`${paginationStyles.txtColorDark}`}
                            sx={{
                              fontSize: 10,
                              height: 21,
                              width: 21,
                              minWidth: 0,
                              color: isDisabled
                                ? "grey"
                                : "var(--text-color-dark)", // Change color if disabled
                            }}
                          />
                        );
                      }}
                    />
                  </Stack>
                </div>
                <input
                  type="number"
                  value={itemsPerPage}
                  onChange={(e) => {
                    const newItemsPerPage = parseInt(e.target.value, 10);
                    if (newItemsPerPage > 0) {
                      setItemsPaginationPerPage(newItemsPerPage);
                      setCurrentPage(1);
                    }
                  }}
                  className={`border ${styles.txtColorDark} ${styles.pageBackground} border-gray-300 rounded-md p-2 h-[17px] w-14 text-[10px] mr-[15px] outline-gray-300 outline-0`}
                />
                <p className={`text-[10px] ${styles.txtColorDark}`}>
                  {currentPage} of {lastPage} Pages
                </p>
              </div>
            </div>
          )}
        </form>
        {/* <CustomeModal /> */}
        {openModal && (
          <CustomeModal
            setOpenModal={setOpenModal}
            openModal={openModal}
            onConfirm={onConfirm}
            isError={isError}
            paraText={paraText}
            typeEvent={typeofModal}
            labelValue={labelName}
          />
        )}
      </div>
    </React.Fragment>
  );
}

CustomizedInputBase.propTypes = {
  columnData: PropTypes.array,
  setPrevSearchInput: PropTypes.func,
  prevSearchInput: PropTypes.string,
  setInputVisible: PropTypes.func,
  setGridData: PropTypes.func,
  originalData: PropTypes.array,
  gridData: PropTypes.array,
  setCurrentPage: PropTypes.func,
};
function CustomizedInputBase({
  columnData,
  setPrevSearchInput,
  prevSearchInput,
  setInputVisible,
  setGridData,
  originalData,
  gridData,
  setCurrentPage, // Reset to first page after filtering
}) {
  const [searchInputGridData, setSearchInputGridData] = useState(
    prevSearchInput || ""
  );

  // Custom filter logic
  const filterFunction = (searchValue, columnKey) => {
    debugger;
    if (!searchValue.trim()) {
      setInputVisible(false);
      return setGridData(originalData);
    }
    const lowercasedInput = searchValue.toLowerCase();
    const filtered = gridData.filter((item) => {
      // Access the item's property based on columnKey and convert to string for comparison
      let columnValue = String(item[columnKey]).toLowerCase();

      const iso8601Regex = /^\d{4}-\d{2}-\d{2}t\d{2}:\d{2}:\d{2}\.\d{3}z$/;

      if (iso8601Regex.test(columnValue)) {
        columnValue = moment(columnValue).format("YYYY-MM-DD HH:mm:ss");
      }

      return columnValue.includes(lowercasedInput);
    });
    if (filtered.length === 0) {
      toast.error("No matching records found.");
      return;
    }
    setGridData(filtered);
    setInputVisible(false);
    setCurrentPage(1); // Reset to first page after filtering
    setPrevSearchInput(searchValue);
  };

  function handleClose() {
    setSearchInputGridData("");
    setPrevSearchInput("");
  }

  return (
    <Paper
      sx={{
        ...createAddEditPaperStyles,
      }}
    >
      <InputBase
        sx={{
          ...searchInputStyling,
        }}
        placeholder="Search..."
        inputProps={{ "aria-label": "search..." }}
        value={searchInputGridData}
        onChange={(e) => setSearchInputGridData(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            filterFunction(searchInputGridData, columnData.fieldname);
          }
        }}
      />
      <LightTooltip title="Clear">
        <IconButton color="gray" sx={{ p: "2px" }} aria-label="clear">
          <ClearIcon
            onClick={() => handleClose()}
            sx={{
              color: "var(--table-text-color)",
            }}
          />
        </IconButton>
      </LightTooltip>
      <Divider
        sx={{
          height: 25,
          borderColor: "var(--table-text-color)",
          opacity: 0.3,
        }}
        orientation="vertical"
      />
      <LightTooltip title="Save">
        <IconButton
          type="button"
          sx={{ p: "2px" }}
          aria-label="search"
          onClick={() =>
            filterFunction(searchInputGridData, columnData.fieldname)
          }
        >
          <SearchIcon
            sx={{
              color: "var(--table-text-color)",
            }}
          />
        </IconButton>
      </LightTooltip>
    </Paper>
  );
}
