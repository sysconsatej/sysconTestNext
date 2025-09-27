"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useState, useEffect, useRef } from "react";
import styles from "@/app/app.module.css";
import CustomeModal from "@/components/Modal/customModal";
import { parentAccordionSection, accordianDetailsStyle } from "@/app/globalCss";
import {
  reportSearchCriteria,
  reportControlListing,
  fetchDataAPI,
  dynamicReportFilter,
  fetchReportData,
  dynamicDropDownFieldsData,
  fetchDynamicReportSpData,
  insertExcelData,
  insertExcelDataInDatabase,
  saveEditedReport,
  mergeBl,
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
import { get, orderBy } from "lodash";
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
import PrintModal from "@/components/Modal/printModal.jsx";
AddEditFormControll.propTypes = {
  reportData: PropTypes.string, // Adjust the type as needed
};

import {
  displayTablePaperStyles,
  displayTableRowStylesNoHover,
} from "@/app/globalCss";
import { parse } from "dotenv";
import { decrypt } from "@/helper/security";
import { data } from "autoprefixer";

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
  const [groupingDepth, setGroupingDepth] = useState(null);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortingFieldName, setSortingFieldName] = useState(null);
  const [isSortingEnabled, setIsSortingEnabled] = useState(true);
  const [groupingField, setGroupingField] = useState(1);
  const [originalData, setOriginalData] = useState([]);
  const [reportCalled, setReportCalled] = useState(false);
  const [apiGridData, setApiGridData] = useState([]);
  const [formControlData, setFormControlData] = useState([]);
  const [dateCriteria, setDateCriteria] = useState("");
  const [parentGroupingDepth, setParentGroupingDepth] = useState(0);
  const [isDataInitialized, setIsDataInitialized] = useState(false);
  const [paginatedData, setPaginatedData] = useState([]);
  const [dataToGetSelectedRowData, setDataToGetSelectedRowData] = useState([]);
  const [finalPaginatedData, setFinalPaginatedData] = useState([]);
  const [DateFormat, setDateFormat] = useState([]);
  const [editableFields, setEditableFields] = useState([]);
  const [saveSpName, setSaveSpName] = useState(null);
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
  const sortedErrors = allErrors.sort((a, b) => a.row - b.row);
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
  const [selectedRow, setselectedRow] = useState(new Set());
  const [selectedRows, setselectedRows] = useState([]);
  const [selectedReportRow, setselectedReportRow] = useState([]);
  const [ReportNames, setReportNames] = useState([]);
  const [isModalVisible, setisModalVisible] = useState(false);
  const [isDataFromStoredProcedure, setIsDataFromStoredProcedure] =
    useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [submittedMenuId, setSubmittedMenuId] = useState(null);
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  const [reportEditableType, setReportEditableType] = useState(null);
  const [prevSearchInput, setPrevSearchInput] = useState("");
  const [isInputVisible, setInputVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [lastPagePagination, setLastPagePagination] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]); // use this state to get all selected row ids
  const [fullRowJson, setFullRowJson] = useState([]); // use this state to get all selected row ids

  console.log("selectedIds", selectedIds);
  console.log("fullRowJson", fullRowJson);
  
  useEffect(() => {
    if(menuType == 'C'){
      setToggle(false);
    }
  }, [menuType]);

  useEffect(() => {
    if (!selectedRow) {
      setSelectedIds([]); // empty array when nothing selected
      setFullRowJson([]);
      setFullRowJson([]);
      return;
    }

    const byRowIndex = new Map(
      (Array.isArray(dataToGetSelectedRowData) ? dataToGetSelectedRowData : [])
        .map((rec) => {
          // main key
          const key =
            rec?.rowIndex ??
            rec?.RowIndex ??
            rec?.row_index ??
            rec?.index ??
            null;
          return key != null ? [String(key), rec] : null;
        })
        .filter(Boolean)
    );

    const rowsArray = Array.from(
      selectedRow?.values ? selectedRow.values() : selectedRow
    );

    // Selected IDs
    if (rowsArray.length > 0) {
      const ids = rowsArray
        .map((row) => {
          const rowIndex = row?.value ?? row; // handles Set values() or raw number
          // 1) Prefer lookup by rowIndex
          let record = byRowIndex.get(String(rowIndex));
          // 2) Fallback to positional index if not found
          if (!record && Array.isArray(dataToGetSelectedRowData)) {
            record = dataToGetSelectedRowData[Number(rowIndex)];
          }
          const id = record?.ID ?? record?.id ?? record?.Id ?? null;
          return id != null ? { id } : null;
        })
        .filter(Boolean);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
    }

    // Full row JSON objects
    if (rowsArray.length > 0) {
      const fullSelectedRowJson = rowsArray
        .map((row) => {
          const rowIndex = row?.value ?? row;
          let record = byRowIndex.get(String(rowIndex));
          if (!record && Array.isArray(dataToGetSelectedRowData)) {
            record = dataToGetSelectedRowData[Number(rowIndex)];
          }
          return record ? { record } : null;
        })
        .filter(Boolean);
      setFullRowJson(fullSelectedRowJson);
    } else {
      setFullRowJson([]);
    }
  }, [selectedRow]);

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
    ReportData();
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

  const handleFileAndUpdateState = (file, updateState) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const buffer = e.target.result;
      const workbook = XLSX.read(buffer, { type: "array" });
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      updateState(jsonData);
    };

    reader.readAsArrayBuffer(file);
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

  const handleChangeData = () => {};
  console.log("finalPaginatedData", finalPaginatedData);
  useEffect(() => {}, [newState, filterCondition]);

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

  const removeDropdownFields = (obj) => {
    const newObj = { ...obj };
    Object.keys(newObj).forEach((key) => {
      if (key.endsWith("dropdown")) {
        delete newObj[key];
      }
    });
    return newObj;
  };

  function formatXml(xml) {
    const PADDING = "  "; // set indentation
    const reg = /(>)(<)(\/*)/g;
    let formatted = "";
    let pad = 0;

    xml = xml.replace(reg, "$1\r\n$2$3");
    xml.split("\r\n").forEach((node) => {
      let indent = 0;
      if (node.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (node.match(/^<\/\w/)) {
        if (pad !== 0) pad -= 1;
      } else if (node.match(/^<\w([^>]*[^/])?>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      const padding = new Array(pad + 1).join(PADDING);
      formatted += padding + node + "\r\n";
      pad += indent;
    });

    return formatted.trim();
  }

  // Remove a trailing "UNT<GS>digits<GS>" line (GS = \x1D) at the very end
  function stripTrailingUNT(s) {
    return s.replace(/(?:\r?\n)?UNT\x1D\d+(?:\x1D[^\r\n]*)?\s*$/u, "");
  }

  const handleButtonClick = {
    handleSubmit: async () => {
      setCurrentPage(1);
      setSelectedIds([]);
      setIsLoading(true);
      setselectedRow(new Set());
      setSelectedIds([]);
      setFullRowJson([]);
      setselectedRows([]);
      if (isDefaultDataShow === false && outputFileFormat === "Excel") {
        const filterCondition = null;
        const fetchData = await fetchDynamicReportSpData(spName, {
          ...filterCondition,
          companyId,
          branchId,
          financialYear,
          userId,
          clientId,
        });
        const workbook = new ExcelJS.Workbook();

        // Iterate over each dataset in fetchData
        if (fetchData && fetchData.data?.length > 0) {
          fetchData.data.forEach((outerArray, index) => {
            // Since the data is doubly nested, iterate through the outer array
            outerArray.forEach((dataset) => {
              // Assuming dataset structure like { tblCompanyCode: [{code: 'AMC'}] }
              const key = Object.keys(dataset)[0]; // e.g., 'tblCompanyCode'
              const data = dataset[key]; // This is the array of data

              // Create a unique worksheet name using the key and the index
              //const worksheetName = `${key}_${index + 1}`;
              const worksheetName = `${key}`;
              const worksheet = workbook?.addWorksheet(worksheetName);

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
        setIsLoading(false);
      } else if (isDefaultDataShow === false && outputFileFormat === "Json") {
        const filterCondition = null;
        const fetchData = await fetchDynamicReportSpData(spName, {
          ...filterCondition,
          companyId,
          branchId,
          financialYear,
          userId,
          clientId,
        });

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
        const filterCondition = null;
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
                let fieldNamesFormattedArrayWithOutId =
                  fieldNamesFormattedArray.filter(
                    (item) => item?.fieldname?.toLowerCase() !== "id"
                  );
                setGridHeader(fieldNamesFormattedArrayWithOutId);
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
              console.log("header =>>", header);
              setGridHeader(header);
            }

            // Filter out rows with all null or empty fields
            const filteredTableData = processedData.filter((data) => {
              return Object.values(data).some(
                (value) => value !== null && value !== ""
              );
            });

            console.log("filterCondition =>>", processedData);
            let addSectionKey = processedData.map((item, i) => ({
              ...item,
              rowIndex: i,
            }));
            console.log("addSectionKey", addSectionKey);
            // Set new data
            setPaginatedData(addSectionKey);
            setTableData(addSectionKey);
            setFinalPaginatedData(addSectionKey);
            setFilteredSortData(addSectionKey);
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
          const { allErrors, filteredObjectIds } = await handleExcelUploadFunc(
            fetchedData,
            newState
          );

          // Check if errors array is empty or not
          if (allErrors.length === 0) {
            // const response = await insertExcelData(filteredObjectIds);
            const requestBodyForMenuReportDetails = {
              columns:
                "spName,reportCriteriaId,isDefaultDataShow,outputFileType,isSp",
              tableName: "tblMenuReportMapping",
              whereCondition: `menuId = ${search}`,
              clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
            };
            reportData = await fetchReportData(requestBodyForMenuReportDetails);
            const spName = reportData.data[0].spName;
            const insertData = {
              spName: spName,
              jsonData: JSON.stringify(filteredObjectIds),
            };

            const response = await insertExcelDataInDatabase(insertData);

            toast.success(
              `${response.rowsAffected} Rows Inserted Successfully`
            );
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

    handleExportToExcel: async () => {
      if (isDefaultDataShow === false && outputFileFormat === "Excel") {
        const filterCondition = null;
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
                  (g) => g.id === parseInt(header.fieldname)
                );
                if (!gridItem) {
                  console.warn(
                    `No grid item found for fieldname: ${header.fieldname}`
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
    handleLineNumber: () => {
      toast.success("Line Number function Triggered");
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
    handleSaveEditedData: async () => {
      const removeDropdownFields = (obj) => {
        const newObj = { ...obj };
        Object.keys(newObj).forEach((key) => {
          if (key.endsWith("dropdown")) {
            delete newObj[key];
          }
        });
        return newObj;
      };
      try {
        const filterConditionWithoutDropdowns =
          removeDropdownFields(filterCondition);
        const updatedCondition = {
          ...filterConditionWithoutDropdowns,
          companyId,
          branchId,
          financialYear,
          userId,
          clientId,
        };
        // const json = {
        //   ...updatedCondition,
        //   data: selectedRows,
        // };
        const json = {
          ...updatedCondition,
          data: selectedIds,
        };
        if (reportEditableType === "Excel") {
          let response = await saveEditedReport({
            json,
            spName: saveSpName,
          });
          if (response.success) {
            console.log("response", response);
            const workbook = new ExcelJS.Workbook();
            const { data } = response;

            if (Array.isArray(data) && data.length > 0) {
              const isNested = Array.isArray(data[0]);

              if (isNested) {
                // “Doubly-nested”: data = [ [ { sheet1: […] }, { sheet2: […] } ], … ]
                data.forEach((outerArray, idx) => {
                  outerArray.forEach((dataset) => {
                    const key = Object.keys(dataset)[0];
                    const rows = dataset[key];
                    const sheet = workbook.addWorksheet(key);

                    if (Array.isArray(rows) && rows.length > 0) {
                      const headers = Object.keys(rows[0]);
                      sheet.addRow(headers);
                      rows.forEach((item) =>
                        sheet.addRow(headers.map((h) => item[h] ?? ""))
                      );
                    }
                  });
                });
              } else {
                // Flat array: data = [ { col1:…, col2:… }, … ]
                const sheet = workbook.addWorksheet(spName);
                const headers = Object.keys(data[0]);
                sheet.addRow(headers);
                data.forEach((item) =>
                  sheet.addRow(headers.map((h) => item[h] ?? ""))
                );
              }

              // Write & download
              const buffer = await workbook.xlsx.writeBuffer();
              const blob = new Blob([buffer], {
                type: "application/octet-stream",
              });
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = `${saveSpName}.xlsx`;
              link.click();

              toast.success(response.message);
            } else {
              console.log("No data available to export.");
              toast.error("No data to export");
            }
          }
        } else if (reportEditableType === "Json") {
          try {
            const response = await saveEditedReport({
              json,
              spName: saveSpName,
            });

            if (!response.success) {
              toast.error(response.message || "Failed to generate JSON");
              return;
            }

            // 1. Stringify your data (or the entire response, as you prefer)
            const payload = response.data; // or: { ...response }
            const jsonString = JSON.stringify(payload, null, 2);

            // 2. Make a JSON blob
            const blob = new Blob([jsonString], { type: "application/json" });

            // 3. Create a temporary link and click it
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${saveSpName}.json`;
            document.body.appendChild(link);
            link.click();

            // 4. Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(response.message);
          } catch (error) {
            console.error("Error generating JSON file:", error);
            toast.error(error.message || "Error generating JSON file");
          }
        } else if (reportEditableType === "Xml") {
          try {
            const response = await saveEditedReport({
              json,
              spName: saveSpName,
              type: "xml",
            });

            if (!response.success) {
              toast.error(response.message || "Failed to generate XML");
              return;
            }

            let xmlString = response.data?.[""] || "";

            if (!xmlString.trim().startsWith("<")) {
              throw new Error("Invalid XML content");
            }

            // Format the XML before creating the Blob
            const formattedXml = formatXml(xmlString);

            const blob = new Blob([formattedXml], { type: "application/xml" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${saveSpName}.xml`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(response.message || "XML file downloaded");
          } catch (error) {
            console.error("Error generating XML file:", error);
            toast.error(error.message || "Error generating XML file");
          }
        } else if (reportEditableType === "Csv") {
          try {
            // 1. Call your saveEditedReport as before
            const response = await saveEditedReport({
              json,
              spName: saveSpName,
            });

            if (!response.success) {
              toast.error(response.message || "Failed to generate CSV");
              return;
            }

            // 2. Normalize your data array
            const data = Array.isArray(response.data) ? response.data : [];
            if (data.length === 0) {
              console.log("No data available to export.");
              toast.error("No data to export");
              return;
            }

            // 3. Build CSV string
            const headers = Object.keys(data[0]);
            // helper to escape & wrap values
            const escape = (val) =>
              `"${String(val ?? "").replace(/"/g, '""')}"`;

            // header row
            let csv = headers.map((h) => escape(h)).join(",") + "\n";

            // data rows
            data.forEach((rowObj) => {
              const row = headers.map((h) => escape(rowObj[h]));
              csv += row.join(",") + "\n";
            });

            // 4. Create a Blob & download
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${saveSpName}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success(response.message);
          } catch (error) {
            console.error("Error generating CSV file:", error);
            toast.error(error.message || "Error generating CSV file");
          }
        } else if (reportEditableType === "Text") {
          try {
            const response = await saveEditedReport({
              json,
              spName: saveSpName,
            });
            if (!response.success) {
              toast.error(response.message || "Failed to generate Text file");
              return;
            }

            let raw = response.data;
            if (typeof raw === "string") {
              try {
                raw = JSON.parse(raw);
              } catch {}
            }
            const rows = Array.isArray(raw) ? raw : [];
            if (rows.length === 0) {
              toast.error("No data to export");
              return;
            }

            const US = "\x1D";

            const decodeEscapes = (s) => {
              if (s == null) return "";
              let out = String(s);
              out = out.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
                String.fromCharCode(parseInt(h, 16))
              );
              out = out.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) =>
                String.fromCharCode(parseInt(h, 16))
              );
              out = out.replace(/\u001d/g, US);
              out = out.replace(/&#x([0-9a-fA-F]+);/gi, (_, h) =>
                String.fromCodePoint(parseInt(h, 16))
              );
              out = out.replace(/&#([0-9]+);/g, (_, d) =>
                String.fromCodePoint(parseInt(d, 10))
              );
              return out;
            };

            // Build segments
            const segs = rows
              .map((row) => {
                if (row && typeof row === "object") {
                  if (typeof row.advlist === "string")
                    return decodeEscapes(row.advlist);
                  return decodeEscapes(
                    Object.values(row)
                      .map((v) => (v == null ? "" : String(v)))
                      .join(US)
                  );
                }
                return decodeEscapes(row);
              })
              .filter((s) => s && s.trim().length > 0);

            // Group into messages and rebuild UNT
            const output = [];
            let current = [];
            let unhRef = "";
            let untRefCandidate = "";

            const flush = () => {
              if (!current.length) return;
              const count = current.length + 1;
              const ref = untRefCandidate || unhRef || "";
              output.push(...current);
              output.push(`UNT${US}${count}${US}${ref}`);
              current = [];
              unhRef = "";
              untRefCandidate = "";
            };

            for (const seg of segs) {
              const tag = seg.slice(0, 3);
              if (tag === "UNH") {
                flush();
                const f = seg.split(US);
                unhRef =
                  f[1] && f[1] !== "COPRAR"
                    ? f[1]
                    : f[3] || f[4] || f[f.length - 1] || "";
                current.push(seg);
              } else if (tag === "UNT") {
                const f = seg.split(US);
                untRefCandidate = f[2] || f[1] || untRefCandidate;
                flush(); // we rebuild UNT
              } else {
                current.push(seg);
              }
            }
            flush();

            // Strict CRLF + no BOM; write as raw bytes
            const textContent = output.join("\r\n") + "\r\n";

            // Download helper
            const download = (
              bytesOrBlob,
              filename,
              mime = "application/octet-stream"
            ) => {
              const blob =
                bytesOrBlob instanceof Blob
                  ? bytesOrBlob
                  : new Blob([bytesOrBlob], { type: mime });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            };

            // Real file (binary-safe, no BOM)
            const cleanedData = stripTrailingUNT(textContent);
            const bytes = new TextEncoder().encode(cleanedData); // keeps 0x1D intact
            download(bytes, `${saveSpName}.txt`, "application/octet-stream");

            // Optional: human-readable preview (US -> |) for copy/paste/QA
            const preview = textContent.replace(/\x1D/g, " ");

            // remove the final line if it starts with "UNT"
            const cleaned = preview
              .replace(/\s+$/, "") // trim trailing whitespace/newlines
              .replace(/(?:\r?\n)?UNT\b[^\r\n]*$/i, ""); // drop last "UNT ..." line

            //download(cleaned, `${saveSpName}.txt`, "text/plain;charset=utf-8");

            toast.success(response.message);
          } catch (error) {
            console.error("Error generating Text file:", error);
            toast.error(error.message || "Error generating Text file");
          }
        } else if (reportEditableType === "Email") {
          console.log("saveSpName", saveSpName);
          let json = {
            ...updatedCondition,
            data: selectedIds,
          };
          console.log("json data after", json);
          let response = await saveEditedReport({
            json,
            spName: saveSpName,
            type: "Email",
          });
          if (response.success) {
            console.log("response", response);
            const { data } = response;
            console.log("data", data);
            return toast.success(data?.message);
          }
        } else if (reportEditableType === "splitBooking") {
          try {
            if (Array.isArray(fullRowJson) && fullRowJson.length > 0) {
              const transformedData = fullRowJson.map((item) => {
                const rec = item?.record ?? {};
                return {
                  ...rec,
                  BookingSRNos: rec["Booking SR Nos"] ?? "",
                };
              });
              const json = {
                ...updatedCondition,
                data: transformedData,
              };
              let response = await saveEditedReport({
                json,
                spName: saveSpName,
              });
              if (response?.success) {
                return toast.success(response?.message);
              }
            }
          } catch (error) {
            console.error("Error saving edited data:", error);
            toast.error(error.message);
          }
        } else if (reportEditableType === "splitBl") {
          try {
            if (Array.isArray(fullRowJson) && fullRowJson.length > 0) {
              const transformedData = fullRowJson.map((item) => {
                const rec = item?.record ?? {};
                return {
                  ...rec,
                  BLSrNos: rec["BL Sr Nos"] ?? "",
                  ContainerNo: rec["Container No"] ?? "",
                };
              });
              const json = {
                ...updatedCondition,
                data: transformedData,
              };
              let response = await saveEditedReport({
                json,
                spName: saveSpName,
              });
              if (response.success) {
                console.log("response", response);
                return toast.success(response?.message);
              } else {
                return toast.error(response?.message);
              }
            }
          } catch (error) {
            console.error("Error saving edited data:", error);
            toast.error(error.message);
          }
        } else {
          const getRowId = (row) => row?.Id ?? row?.id ?? row?.ID;

          const updatedSelectedRows = finalPaginatedData.filter((row) =>
            selectedRows.some(
              (selected) => getRowId(selected) === getRowId(row)
            )
          );

          let cleanSelectedRows = updatedSelectedRows.map((row) => {
            const newRow = { ...row };
            Object.keys(newRow).forEach((key) => {
              if (key.endsWith("dropdown")) {
                delete newRow[key];
              }
            });
            return newRow;
          });

          const filterConditionWithoutDropdowns =
            removeDropdownFields(filterCondition);
          const updatedCondition = {
            ...filterConditionWithoutDropdowns,
            companyId,
            branchId,
            financialYear,
            userId,
            clientId,
          };

          cleanSelectedRows = {
            ...updatedCondition,
            data: selectedIds,
          };

          let response = await saveEditedReport({
            json: cleanSelectedRows,
            spName: saveSpName,
          });

          if (response.success === true) {
            return toast.success(response.message);
          }
          toast.error(response.message);
        }
      } catch (error) {
        console.error("Error saving edited data:", error);
        toast.error(error.message);
      }
    },
    handleGenerateReport: async () => {
      console.log("handleGenerateReport", selectedIds);
      let selectedReportIds = null;
      if (selectedIds.length > 0) {
        selectedReportIds = selectedIds.map((row) => row?.id).join(",");
      } else {
        toast.error("Please select at least one row.");
      }
      setOpenPrintModal((prev) => !prev);
      setSubmittedMenuId(search);
      setSubmittedRecordId(selectedReportIds);
      const filterConditionWithoutDropdowns =
        removeDropdownFields(filterCondition);
      const updatedCondition = {
        ...filterConditionWithoutDropdowns,
        companyId,
        branchId,
        financialYear,
        userId,
        clientId,
      };
      const json = {
        ...updatedCondition,
        data: selectedRows,
      };
      const response = await saveEditedReport({
        json,
        spName: saveSpName,
      });
      if (response.success === true) {
        return;
        //toast.success(response.message);
      }
      //toast.error(response.message);
    },
    handleMergeBl: async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const userId = userData[0]?.id;
        try {
          const selectedJobNos = selectedRows.map((row) => row["Booking No"]);

          const removeDropdownFields = (obj) => {
            const newObj = { ...obj };
            Object.keys(newObj).forEach((key) => {
              if (key.endsWith("dropdown")) {
                delete newObj[key];
              }
            });
            return newObj;
          };

          const filterConditionWithoutDropdowns =
            removeDropdownFields(filterCondition);

          const bookingNoArray = selectedJobNos.map((jobNo) => ({ jobNo }));

          const requestBody = {
            vesselId: filterConditionWithoutDropdowns?.vesselId,
            voyageId: filterConditionWithoutDropdowns?.voyageId,
            userId: userId,
            bookingNos: JSON.stringify(bookingNoArray),
            clientId: clientId,
          };

          const mergeBlData = await mergeBl(requestBody);

          if (
            mergeBlData &&
            Array.isArray(mergeBlData) &&
            mergeBlData.length > 0
          ) {
            toast.success("Merge BL created successfully!");
          } else {
            toast.error("Failed to create Merge BL. No data returned.");
          }
        } catch (error) {
          console.error("Merge BL Error:", error);
          toast.error(error?.message || "An unexpected error occurred.");
        }
      }
    },
    handleCreateSplitBL: async () => {
      alert("Create Split BL");
    },
  };

  useEffect(() => {
    setLastPagePagination(Math.ceil(paginatedData.length / itemsPerPage) || 1);
  }, [paginatedData, itemsPerPage, tableData.length]);
  const ReportData = async () => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientId = userData[0].clientId;
      const menuName = searchParams.get("menuName");
      console.log("userData[0] =>>", userData[0]);
      if (menuName !== null) {
        const requestBody = {
          columns:
            "mrm.reportMenuId,mrm.reportTemplateId,tm.menuName,tm.menuLink,tm.menuType,tm.clientId",
          tableName:
            "tblMenuReportMapping mrm Inner Join tblMenu tm on mrm.reportMenuId = tm.id",
          whereCondition: `mrm.menuId = ${search} and tm.status = 1 and mrm.clientId in (${clientId} ,(select id from tblClient where clientCode = 'SYSCON'))`,
          clientIdCondition: `mrm.status = 1 FOR JSON PATH`,
        };

        try {
          const response = await fetchReportData(requestBody);
          console.log("Response:", response);

          const data = response.data || response;
          if (Array.isArray(data) && data.length > 0) {
            const fetchedMenuNames = data.map((item) => ({
              ReportId: item.reportTemplateId,
              ReportName: item.menuName,
              ReportMenuLink: item.menuLink,
              menuType: item.menuType,
              reportMenuId: item.reportMenuId,
              //reportType: "T", // Assuming "T" as a static value for `reportType`
            }));
            setReportNames(fetchedMenuNames);
          } else {
            setReportNames([]);
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      }
    }
  };

  const onConfirm = async (conformData) => {
    if (conformData.isError) {
      setOpenModal((prev) => !prev);
      setClearFlag({
        isClear: false,
        fieldName: "",
      });
    }
  };

  const handleRightClick = (event, columnId) => {
    console.log("Right-clicked column ID:", columnId);
    event.preventDefault(); // Prevent the default context menu
    setInputVisible(true); // Show the input field
    setActiveColumn(columnId); // Set the active column to the one that was right-clicked
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
    setselectedRow(new Set());
    setSelectedIds([]);
    setFullRowJson([]);
    setselectedRows([]);
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
        console.log("fetchedData", fetchedData);
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
        setEditableFields(fetchedData.editableFields);
        setSaveSpName(fetchedData.saveSpName);
        setReportEditableType(fetchedData.reportEditableType);
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
            "spName,reportCriteriaId,isDefaultDataShow,outputFileType,isSp",
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
                let fieldNamesFormattedArrayWithOutId =
                  fieldNamesFormattedArray.filter(
                    (item) => item?.fieldname?.toLowerCase() !== "id"
                  );
                setGridHeader(fieldNamesFormattedArrayWithOutId);
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
              console.log("header =>>", header);
              setGridHeader(header);
            }
            let addSectionKey = processedData.map((item, i) => ({
              ...item,
              rowIndex: i,
            }));
            setPaginatedData(addSectionKey);
            setFilteredSortData(addSectionKey);
            setTableData(addSectionKey);
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

  // const handlePageChange = (page) => {
  //   setCurrentPage(page);
  // };

  const updatePaginatedData = (page) => {
    const endIndex = page * itemsPerPage;
    const startIndex = endIndex - itemsPerPage;
    if (isSortingEnabled === false) {
      setFinalPaginatedData(paginatedData.slice(startIndex, endIndex));
      setDataToGetSelectedRowData([]);
      setDataToGetSelectedRowData(paginatedData);
      setDataForExcel(paginatedData);
    } else if (prevSearchInput !== "") {
      const filteredSortData = paginatedData.slice(startIndex, endIndex);
      setFinalPaginatedData(filteredSortData);
      setDataToGetSelectedRowData([]);
      setDataToGetSelectedRowData(paginatedData);
      setDataForExcel(filteredSortData);
    } else {
      setFinalPaginatedData(filteredSortData.slice(startIndex, endIndex));
      setDataToGetSelectedRowData([]);
      setDataToGetSelectedRowData(paginatedData);
      setDataForExcel(filteredSortData);
    }
  };

  useEffect(() => {
    // Initialize paginated data on first render
    updatePaginatedData(currentPage);
  }, [paginatedData, itemsPerPage]);

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
  const renderTableData = (data, rowIndex, colorCode, indexOfRow) => {
    function handleOnJsonChange(value) {
      console.log("handleOnJsonChange", value);
      // setValue((prev) => ({ ...prev, ...value }));
      setFinalPaginatedData((prev) => {
        const updatedData = [...prev];
        updatedData[rowIndex] = { ...updatedData[rowIndex], ...value };
        console.log("updatedData", updatedData);

        return updatedData;
      });
      setDataToGetSelectedRowData((prev) => {
        const updatedData = [...prev];
        updatedData[indexOfRow] = { ...updatedData[indexOfRow], ...value };
        return updatedData;
      });
    }
    // function handleFieldChange(value) {
    //   const fieldKey = Object.keys(value)[0]; // 'From' or 'To'
    //   const fieldValue = value[fieldKey];

    //   setFinalPaginatedData((prev) => {
    //     const updatedData = [...prev];
    //     const updatedRow = { ...updatedData[rowIndex], ...value };

    //     const currentFrom = parseInt(updatedRow.From, 10);
    //     const currentTo = parseInt(updatedRow.To, 10);

    //     // If both From and To exist, validate
    //     if (!isNaN(currentFrom) && !isNaN(currentTo)) {
    //       for (let i = 0; i < updatedData.length; i++) {
    //         if (i === rowIndex) continue;

    //         const otherFrom = parseInt(updatedData[i].From, 10);
    //         const otherTo = parseInt(updatedData[i].To, 10);

    //         if (!isNaN(otherFrom) && !isNaN(otherTo)) {
    //           const overlap =
    //             (currentFrom >= otherFrom && currentFrom <= otherTo) ||
    //             (currentTo >= otherFrom && currentTo <= otherTo) ||
    //             (currentFrom <= otherFrom && currentTo >= otherTo); // full overlap

    //           if (overlap) {
    //             toast.error(
    //               `Range [${currentFrom} - ${currentTo}] overlaps with row ${i + 1} range [${otherFrom} - ${otherTo}]`
    //             );

    //             // Set the invalid field back to null
    //             updatedRow[fieldKey] = null;
    //             updatedData[rowIndex] = updatedRow;
    //             return updatedData;
    //           }
    //         }
    //       }
    //     }

    //     updatedData[rowIndex] = updatedRow;
    //     return updatedData;
    //   });
    // }

    function handleFieldChange(value) {
      const fieldKey = Object.keys(value)[0]; // 'From' or 'To'
      let fieldValue = value[fieldKey];

      setFinalPaginatedData((prev) => {
        const updatedData = [...prev];
        const currentRow = { ...updatedData[rowIndex] };

        // Parse the input as integer
        const parsedValue = parseInt(fieldValue, 10);

        // Check for negative values
        if (!isNaN(parsedValue) && parsedValue < 0) {
          toast.error(`${fieldKey} value cannot be negative.`);
          currentRow[fieldKey] = null;
          updatedData[rowIndex] = currentRow;
          return updatedData;
        }

        // Update field value
        currentRow[fieldKey] = fieldValue;

        // Auto-calculate To = From + BLCount - 1
        if (fieldKey === "From") {
          const from = parseInt(fieldValue, 10);
          const blCount = parseInt(currentRow.BLCount, 10);

          if (!isNaN(from) && !isNaN(blCount)) {
            currentRow.To = (from + blCount).toString(); // Convert back to string
          }
        }

        const currentFrom = parseInt(currentRow.From, 10);
        const currentTo = parseInt(currentRow.To, 10);

        // Check for overlaps
        if (!isNaN(currentFrom) && !isNaN(currentTo)) {
          for (let i = 0; i < updatedData.length; i++) {
            if (i === rowIndex) continue;

            const otherFrom = parseInt(updatedData[i].From, 10);
            const otherTo = parseInt(updatedData[i].To, 10);

            if (!isNaN(otherFrom) && !isNaN(otherTo)) {
              const overlap =
                (currentFrom >= otherFrom && currentFrom <= otherTo) ||
                (currentTo >= otherFrom && currentTo <= otherTo) ||
                (currentFrom <= otherFrom && currentTo >= otherTo);

              if (overlap) {
                toast.error(
                  `Range [${currentFrom} - ${currentTo}] overlaps with row ${
                    i + 1
                  } range [${otherFrom} - ${otherTo}]`
                );
                currentRow[fieldKey] = null;
                if (fieldKey === "From") currentRow.To = ""; // Clear To as well if From is invalid
                updatedData[rowIndex] = currentRow;
                return updatedData;
              }
            }
          }
        }

        updatedData[rowIndex] = currentRow;
        return updatedData;
      });
    }

    let bgColor = "";
    if (colorCode === undefined || colorCode === null || colorCode === "") {
      bgColor = rowIndex === activeRowIndex ? "transparent" : "transparent";
    } else {
      bgColor = rowIndex === activeRowIndex ? `${colorCode}` : `${colorCode}`;
    }
    rowColors[rowIndex] = bgColor; // Store color in rowColors object with rowIndex as key

    const handleRowSelection = (indexOfRow) => {
      console.log("rowIndex", indexOfRow);
      console.log("selectedRow", selectedRow);
      setselectedRow((prevSelected) => {
        const newSelected = new Set(prevSelected);
        if (newSelected.has(indexOfRow)) {
          newSelected.delete(indexOfRow);
        } else {
          newSelected.add(indexOfRow);
        }
        return newSelected;
      });
    };

    const getRowId = (row) => row?.Id ?? row?.id ?? row?.ID;
    const getSelectedRows = (rowIndex) => {
      const selectedRowId = getRowId(finalPaginatedData[rowIndex]);
      if (menuName === "Update Nominated Area") {
        const { nominatedAreaCodedropdown, dpdCodedropdown, thirdCfsdropdown } =
          filterCondition || {};

        const nominatedAreaItem = nominatedAreaCodedropdown?.[0];
        const dpdDescriptionItem = dpdCodedropdown?.[0];
        const thirdCfsDescriptionItem = thirdCfsdropdown?.[0];

        setselectedRows((prevSelectedRows) => {
          const isAlreadySelected = prevSelectedRows.some(
            (row) => getRowId(row) === selectedRowId
          );

          if (isAlreadySelected) {
            // ✅ DO NOT clear enriched values from finalPaginatedData
            return prevSelectedRows.filter(
              (row) => getRowId(row) !== selectedRowId
            );
          } else {
            const latestRow = finalPaginatedData[rowIndex];

            const enrichedRow = {
              ...latestRow,
              ...(latestRow["Nominated Area"] == null ||
              latestRow["Nominated Area"] === ""
                ? {
                    "Nominated Area":
                      nominatedAreaItem?.value?.toString() || "",
                    "Nominated Areadropdown": nominatedAreaItem
                      ? [nominatedAreaItem]
                      : [],
                  }
                : {}),
              ...(latestRow["DPD Desciption"] == null ||
              latestRow["DPD Desciption"] === ""
                ? {
                    "DPD Desciption":
                      dpdDescriptionItem?.value?.toString() || "",
                    "DPD Desciptiondropdown": dpdDescriptionItem
                      ? [dpdDescriptionItem]
                      : [],
                  }
                : {}),
              ...(latestRow["Third CFS Desciption"] == null ||
              latestRow["Third CFS Desciption"] === ""
                ? {
                    "Third CFS Desciption":
                      thirdCfsDescriptionItem?.value?.toString() || "",
                    "Third CFS Desciptiondropdown": thirdCfsDescriptionItem
                      ? [thirdCfsDescriptionItem]
                      : [],
                  }
                : {}),
            };

            setFinalPaginatedData((prev) => {
              const updatedData = [...prev];
              updatedData[rowIndex] = enrichedRow;
              return updatedData;
            });
            console.log("enrichedRow", enrichedRow);
            return [...prevSelectedRows, enrichedRow];
          }
        });
      } else if (menuName === "Update Bl Line No Details") {
        // Ensure latest row with updated fields like itemNo
        const latestRow = finalPaginatedData[rowIndex];

        const enrichedRow = {
          ...latestRow,
          ...(filterCondition || {}),
        };

        setselectedRows((prevSelectedRows) => {
          const isAlreadySelected = prevSelectedRows.some(
            (row) => getRowId(row) === selectedRowId
          );

          if (isAlreadySelected) {
            return prevSelectedRows.filter(
              (row) => getRowId(row) !== selectedRowId
            );
          } else {
            return [...prevSelectedRows, enrichedRow];
          }
        });
      } else {
        const latestRow = finalPaginatedData[rowIndex];

        setselectedRows((prevSelectedRows) => {
          const isAlreadySelected = prevSelectedRows.some(
            (row) => getRowId(row) === selectedRowId
          );

          if (isAlreadySelected) {
            return prevSelectedRows.filter(
              (row) => getRowId(row) !== selectedRowId
            );
          } else {
            return [...prevSelectedRows, latestRow];
          }
        });
      }
    };

    const isRangeValid = (rowIndex, from, to, data) => {
      if (menuName !== "Update Bl Line No Details") return true;

      if (from > to) {
        toast.error(
          `Row ${rowIndex + 1}: 'From' must be less than or equal to 'To'`
        );
        return false;
      }

      for (let i = 0; i < rowIndex; i++) {
        const prevTo = parseInt(data[i]?.To, 10);
        if (!isNaN(prevTo) && from <= prevTo) {
          toast.error(
            `Row ${
              rowIndex + 1
            }: 'From' must be greater than all previous rows' 'To' (conflict with Row ${
              i + 1
            })`
          );
          return false;
        }
      }

      return true;
    };

    return grid
      .filter((item) => item?.fieldname?.toLowerCase() !== "id")
      .map((item, colIndex) => {
        let content = data[item?.fieldname];
        if (data.groupSpans[colIndex] === 0) {
          return null;
        }

        if (
          !DateFormat &&
          typeof content === "string" &&
          isValidDate(content)
        ) {
          content = moment(content).format("DD-MM-YYYY");
        } else if (
          DateFormat &&
          typeof content === "string" &&
          isValidDate(content)
        ) {
          content = moment(content).format(`${DateFormat}`);
        }
        if (colIndex === 0) {
          return (
            <React.Fragment key={`${item.fieldname}-${rowIndex}-${colIndex}`}>
              <TableCell
                style={{
                  backgroundColor: rowColors[rowIndex], // Use stored color
                  border: "1px solid grey",
                  padding: "0px 15px",
                }}
                className="whitespace-nowrap text-xs text-gray-900 dark:text-white "
              >
                <input
                  type="checkbox"
                  // checked={selectedRow.has(content)}
                  // onChange={() => {
                  //   handleRowSelection(content), getSelectedRows(content);
                  // }}
                  checked={selectedRow.has(indexOfRow)}
                  onChange={() => {
                    handleRowSelection(indexOfRow);
                    getSelectedRows(rowIndex);
                  }}

                  // You can add checked/unchecked logic here as needed
                />
              </TableCell>
              <TableCell
                rowSpan={
                  data.groupSpans[colIndex] > 1
                    ? data.groupSpans[colIndex]
                    : undefined
                }
                style={{
                  backgroundColor: rowColors[rowIndex], // Use stored color
                  border: "1px solid grey",
                  padding: "0px 5px",
                }}
                className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
              >
                {editableFields.find((g) => g.fieldname == item.fieldname) ? (
                  <CustomeInputFields
                    inputFieldData={[
                      editableFields.find((g) => g.fieldname == item.fieldname),
                    ]}
                    values={data}
                    onValuesChange={handleOnJsonChange}
                    onKeyDown={handleChangeData}
                  />
                ) : (
                  content
                )}
              </TableCell>
            </React.Fragment>
          );
        } else {
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
                padding: "0px 5px",
              }}
              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
            >
              {editableFields.find((g) => g.fieldname == item.fieldname) ? (
                <CustomeInputFields
                  inputFieldData={[
                    editableFields.find((g) => g.fieldname == item.fieldname),
                  ]}
                  values={data}
                  onValuesChange={handleOnJsonChange}
                  // onKeyDown={handleChangeData}
                  onKeyDown={handleFieldChange}
                />
              ) : (
                content
              )}
            </TableCell>
          );
        }
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

  console.log("setselectedRow", selectedRow);

  const handleReportClick = (reportId) => {
    const selectedReport = ReportNames.find(
      (report) => report.ReportName === reportId
    );

    if (selectedReport) {
      if (selectedReport.menuType === "T" || selectedReport.menuType === "t") {
        const reportIdsArray = [reportId];
        const templateId = selectedReport.ReportId.toString();
        // const selectedReportId = [SelectedRow]; // Assuming this should refer to the selected row or item
        // setTemplateId(reportIdsArray);
        // router.push(
        //   `/reportTemplateCreator/viewEditer?templateId=${templateId}&reportId=${selectedReportId}&menuName=${search}`
        // );
      } else {
        const reportIdsArray = [selectedReport.ReportName.toString()];
        const selectedReportIds = reportIdsArray;
        sessionStorage.setItem(
          "selectedReportIds",
          JSON.stringify(selectedReportIds)
        );

        sessionStorage.setItem(
          "selectedReportsMenuId",
          JSON.stringify(selectedReport.reportMenuId)
        );

        // If objectId is referring to reportId, ensure it's properly set
        // Convert selectedRow (Set) to an array and join as comma-separated string
        const recordIds = Array.from(selectedRow).join(",");
        const url = `${selectedReport.ReportMenuLink}?recordId=${recordIds}&reportId=${selectedReport.reportMenuId}`;
        if (url) {
          window.open(url, "_blank");
        } else {
          console.error("Unable to open the report: URL is not defined.");
        }
      }
    } else {
      console.error("Report not found for the given reportId.");
    }
  };
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
                                {gridHeader.map((item, headIdx) => (
                                  <React.Fragment key={item.fieldname}>
                                    {headIdx == 0 ? (
                                      <>
                                        <TableCell
                                          key={`select-${headIdx}`}
                                          style={{
                                            minWidth: item.minWidth,
                                            width: item.width,
                                            position: "sticky",
                                          }}
                                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                                        >
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={
                                                selectedRow.size ===
                                                dataToGetSelectedRowData.length
                                                //finalPaginatedData.length
                                              }
                                              onChange={(e) => {
                                                if (e.target.checked) {
                                                  const allIndexes = new Set(
                                                    dataToGetSelectedRowData.map(
                                                      //finalPaginatedData.map(
                                                      // (_, idx) => idx
                                                      (_, idx) => _?.rowIndex
                                                    )
                                                  );
                                                  setselectedRow(allIndexes);
                                                } else {
                                                  setselectedRow(new Set());
                                                  setselectedRows([]);
                                                }
                                              }}
                                            />
                                            <span>Select</span>
                                          </div>
                                        </TableCell>

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
                                            handleRightClick(
                                              event,
                                              item.fieldname
                                            )
                                          }
                                        >
                                          <span
                                            onClick={() => {
                                              if (isSortingEnabled) {
                                                setSortingFieldName(
                                                  item.fieldname
                                                );
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
                                              activeColumn ===
                                                item.fieldname && ( //added for function call
                                                <CustomizedInputBase
                                                  columnData={item}
                                                  setPrevSearchInput={
                                                    setPrevSearchInput
                                                  }
                                                  prevSearchInput={
                                                    prevSearchInput
                                                  }
                                                  setInputVisible={
                                                    setInputVisible
                                                  }
                                                  isInputVisible={
                                                    isInputVisible
                                                  }
                                                  setDataToGetSelectedRowData={
                                                    setDataToGetSelectedRowData
                                                  }
                                                  setSelectedIds={
                                                    setSelectedIds
                                                  }
                                                  setselectedRow={
                                                    setselectedRow
                                                  }
                                                  setGridData={
                                                    setFinalPaginatedData
                                                  }
                                                  originalData={paginatedData}
                                                  gridData={finalPaginatedData}
                                                  setCurrentPage={
                                                    setCurrentPage
                                                  }
                                                />
                                              )}
                                          </span>
                                        </TableCell>
                                      </>
                                    ) : (
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
                                          handleRightClick(
                                            event,
                                            item.fieldname
                                          )
                                        }
                                      >
                                        <span
                                          onClick={() => {
                                            if (isSortingEnabled) {
                                              setSortingFieldName(
                                                item.fieldname
                                              );
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
                                            activeColumn === item.fieldname && ( //rohit
                                              <CustomizedInputBase
                                                columnData={item}
                                                setPrevSearchInput={
                                                  setPrevSearchInput
                                                }
                                                prevSearchInput={
                                                  prevSearchInput
                                                }
                                                setInputVisible={
                                                  setInputVisible
                                                }
                                                setDataToGetSelectedRowData={
                                                  setDataToGetSelectedRowData
                                                }
                                                isInputVisible={isInputVisible}
                                                setGridData={setPaginatedData}
                                                originalData={tableData}
                                                gridData={paginatedData}
                                                setCurrentPage={setCurrentPage}
                                              />
                                            )}
                                        </span>
                                      </TableCell>
                                    )}
                                  </React.Fragment>
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
                                    data.colorCodeNew,
                                    data?.rowIndex
                                  )}
                                </TableRow>
                              ))}

                              {/* {currentPage === lastPage && (
                                // <TableRow
                                //   style={{
                                //     border: `2px solid ${toggledThemeValue ? "white" : "black"
                                //       }`,
                                //   }}
                                //   className={` ${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
                                //   sx={{
                                //     ...(toggledThemeValue
                                //       ? displayTableRowStylesNoHover
                                //       : displaytableRowStyles),
                                //   }}
                                // >
                                //   {grid.map((item, index) => {
                                //     let displayGrandTotal = false;
                                //     const grandTotalValue =
                                //       grandTotals[item.fieldname];
                                //     const correspondingApiData =
                                //       apiGridData?.find(
                                //         (apiItem) =>
                                //           apiItem.fieldname === item.id
                                //       );
                                //     displayGrandTotal = correspondingApiData
                                //       ? correspondingApiData.displayGrandTotal
                                //       : null;

                                //     // return (
                                //     //   <TableCell
                                //     //     key={`total-${item.fieldname}`}
                                //     //     style={{
                                //     //       border: `1px solid ${toggledThemeValue
                                //     //         ? "white"
                                //     //         : "black"
                                //     //         }`,
                                //     //       fontWeight: "bold",
                                //     //       color: `${toggledThemeValue
                                //     //         ? "white"
                                //     //         : "black"
                                //     //         }`,
                                //     //     }}
                                //     //     className={`${styles.striped} ${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                                //     //   >
                                //     //     {index === 0
                                //     //       ? "Grand Total"
                                //     //       : grandTotalValue !== undefined &&
                                //     //         displayGrandTotal === true
                                //     //         ? grandTotalValue
                                //     //         : ""}
                                //     //   </TableCell>
                                //     // );
                                //   })}
                                // </TableRow>
                              )} */}
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
                          className={`min-w-full text-sm overflow-auto ${styles.hideScrollbar} ${styles.thinScrollBar}`}
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
                              <TableRow key={index}>
                                <TableCell
                                  className={`pt-1 pb-1 ps-4 text-xs`}
                                  align="left"
                                >
                                  {index + 1}
                                </TableCell>
                                <TableCell
                                  className={`pt-1 pb-1 ps-4 text-xs`}
                                  align="left"
                                >
                                  {error.row}
                                </TableCell>
                                <TableCell
                                  className={`pt-1 pb-1 ps-4 text-xs`}
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
          <div className="flex items-center justify-between pt-2 px-4 text-black">
            <div className="flex items-end ml-auto">
              {/* Pagination Buttons */}
              <div className="mr-5">
                <Stack>
                  <Pagination
                    count={lastPagePagination}
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
                    setItemsPerPage(newItemsPerPage);
                    setCurrentPage(1);
                  }
                }}
                className={`border ${styles.txtColorDark} ${styles.pageBackground} border-gray-300 rounded-md p-2 h-[17px] w-14 text-[10px] mr-[15px] outline-gray-300 outline-0`}
              />
              <p className={`text-[10px] ${styles.txtColorDark}`}>
                {currentPage} of {lastPagePagination} Pages
              </p>
            </div>
          </div>
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

      <>
        <div>
          {openPrintModal && (
            <PrintModal
              setOpenPrintModal={setOpenPrintModal}
              submittedRecordId={submittedRecordId}
              submittedMenuId={submittedMenuId}
              openPrintModal={openPrintModal}
              pageType={"Forms"}
            />
          )}
        </div>
      </>
    </React.Fragment>
  );
}

CustomizedInputBase.propTypes = {
  columnData: PropTypes.array,
  setPrevSearchInput: PropTypes.func,
  prevSearchInput: PropTypes.string,
  setInputVisible: PropTypes.func,
  setDataToGetSelectedRowData: PropTypes.func,
  setselectedRow: PropTypes.func,
  setSelectedIds: PropTypes.func,
  setGridData: PropTypes.func,
  originalData: PropTypes.array,
  gridData: PropTypes.array,
  setCurrentPage: PropTypes.func, // Reset to first page after filtering
};
function CustomizedInputBase({
  columnData,
  setPrevSearchInput,
  prevSearchInput,
  setInputVisible,
  setDataToGetSelectedRowData,
  setSelectedIds,
  setselectedRow,
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
    if (!searchValue.trim()) {
      setInputVisible(false);
      // setSelectedIds([]);
      setselectedRow(new Set());
      setDataToGetSelectedRowData(originalData);
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
    setDataToGetSelectedRowData(filtered);
    // setSelectedIds([]);
    setselectedRow(new Set());
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
