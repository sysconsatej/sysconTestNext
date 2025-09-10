"use client";
/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import styles from "@/app/app.module.css";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import GridHoverIcon from "@/components/HoveredIcons/GridHoverIcon";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import {
  searchInputStyling,
  createAddEditPaperStyles,
  customDatePickerStyleCss22,
  textInputStyle2,
  customDatePickerStyleCss23,
  menuListStyles,
  advanceSearchPaperStyles,
  menuStyles,
  displaytableRowStyles_two,
} from "@/app/globalCss";
import {
  masterTableList,
  formControlMenuList,
  deleteMasterRecord,
  dynamicDropDownFieldsData,
  fetchDataAPI,
  disableEdit,
  disableAdd,
} from "@/services/auth/FormControl.services.js";
import {
  viewIcon,
  addDocIcon,
  magnifyIcon,
  shareIcon,
  edit,
  copyDoc,
  DeleteIcon2,
  printer,
  attach,
  attachmentIcon,
  PrintHover,
  CopyHover,
  DeleteHover,
  EditHover,
  addLogo,
  closeIcon,
  addDocIconHover,
  ShareIconHover,
  plusIconHover,
  crossIconHover,
  refreshIcon,
  revertHover,
  magnifyIconHover,
  viewIconHover,
  searchImage,
} from "@/assets/index.jsx";
import LightTooltip from "@/components/Tooltip/customToolTip";
import CustomeBreadCrumb from "@/components/BreadCrumbs/breadCrumb.jsx";
import IconButton from "@mui/material/IconButton";
import CustomeModal from "@/components/Modal/customModal.jsx";
import { toast } from "react-toastify";
import { useSearchParams } from "next/navigation";
import PaginationButtons from "@/components/Pagination/index.jsx";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import {
  displaytableHeadStyles,
  displaytableRowStyles,
  displayTableContainerStyles,
  displayTablePaperStyles,
} from "@/app/globalCss";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import ClearIcon from "@mui/icons-material/Clear";
import PropTypes from "prop-types";
import { isDateFormat } from "@/helper/dateFormat";
import dayjs from "dayjs";
import Select from "react-select";
import { components } from "react-select";
import { decrypt } from "@/helper/security";
import CloseIcon from "@mui/icons-material/Close";
import _ from "lodash";
import { getUserDetails } from "@/helper/userDetails";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { encryptUrlFun } from "@/utils";
import PrintModal from "@/components/Modal/printModal.jsx";

export default function StickyHeadTable() {
  const router = useRouter();
  const { clientId } = getUserDetails();
  const searchParams = useSearchParams();
  const search = JSON.parse(searchParams.get("menuName")).id;
  const [menuSearch, setMenuSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(17);
  const [gridData, setGridData] = useState([]);
  const [headerFields, setHeaderFields] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [tableName, setTableName] = useState("");
  const [isError, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [selectedPage, setSelectedPage] = useState("1");
  const [totalPages, setTotalPages] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [loader, setLoader] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [isInputVisible, setInputVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdvanceSearchOpen, setIsAdvanceSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [advanceSearch, setadvanceSearch] = useState({});
  const [prevSearchInput, setPrevSearchInput] = useState("");
  const [dropHeaderFields, setDropHeaderFields] = useState([]);
  const [dropPageNo, setDropPageNo] = useState(1);
  const [isNewSearch, setIsNewSearch] = useState(false);
  const [columnSearchKeyName, setColumnSearchKeyName] = useState("");
  const [columnSearchKeyValue, setColumnSearchKeyValue] = useState("");
  const [selectedPageNumber, setSelectedPageNumber] = useState(1);
  const [isRequiredAttachment, setIsRequiredAttachment] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [reportNames, setReportNames] = useState([]);
  const [objectId, setObjectId] = useState("");
  const [SelectedRow, setSelectedRow] = useState("");
  const [sortData, setSortData] = useState({
    label: "",
    order: "",
  });
  const [dynamic, setDynamic] = useState([
    {
      headers: "",
      dropSelected: "",
      data: "",
      fromDate: "",
      toDate: "",
      controlname: "",
      value: "",
      isDropDown: false,
      dropDownValues: [],
    },
  ]);
  const [isReportPresent, setisReportPresent] = useState(false);
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [submittedMenuId, setSubmittedMenuId] = useState(null);
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [isViewVisible, setIsViewVisible] = useState(false);
  const [isPrintVisible, setIsPrintVisible] = useState(true);
  const [isCopyVisible, setIsCopyVisible] = useState(false);
  const [formControlData, setFormControlData] = useState([]);

  async function checkReportPresent(menuId) {
    if (menuId) {
      const requestBody = {
        columns:
          "mrm.reportMenuId,mrm.reportTemplateId,tm.menuName,tm.menuLink,tm.menuType,tm.clientId",
        tableName:
          "tblMenuReportMapping mrm Inner Join tblMenu tm on mrm.reportMenuId = tm.id",
        whereCondition: `mrm.menuId = ${menuId} and tm.status = 1 and mrm.clientId in (${clientId} ,(select id from tblClient where clientCode = 'SYSCON'))`,
        clientIdCondition: `mrm.status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
      };
      try {
        const response = await fetchReportData(requestBody);
        const data = response.data || response;
        if (data.length > 0) {
          setisReportPresent(true);
        } else {
          setisReportPresent(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await checkReportPresent(search);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [search]);

  useEffect(() => {
    async function fetchUserData() {
      const { clientId, companyId, branchId, userId } = getUserDetails();
      try {
        const menuAccessRequest = {
          columns: "*",
          tableName: "tblMenuAccess",
          whereCondition: `menuId = ${search}`,
          clientIdCondition: `userId = ${userId} and clientId in (${clientId}) FOR JSON PATH, INCLUDE_NULL_VALUES`,
        };
        const fetchedUserData = await fetchReportData(menuAccessRequest);
        const menuAccessData = fetchedUserData.data[0];
        console.log("Menu Access Data:", menuAccessData);
        setIsAddVisible(menuAccessData?.isAdd);
        setIsEditVisible(menuAccessData?.isEdit);
        setIsDeleteVisible(menuAccessData?.isDelete);
        setIsViewVisible(menuAccessData?.isView);
        setIsCopyVisible(menuAccessData?.isCopy);
        setIsPrintVisible(menuAccessData?.isPrint);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchUserData();
  }, [search]);

  async function checkReportPresent(menuId) {
    if (menuId) {
      const requestBody = {
        columns:
          "mrm.reportMenuId,mrm.reportTemplateId,tm.menuName,tm.menuLink,tm.menuType,tm.clientId",
        tableName:
          "tblMenuReportMapping mrm Inner Join tblMenu tm on mrm.reportMenuId = tm.id",
        whereCondition: `mrm.menuId = ${menuId} and tm.status = 1 and mrm.clientId in (${clientId} ,(select id from tblClient where clientCode = 'SYSCON'))`,
        clientIdCondition: `mrm.status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
      };
      try {
        const response = await fetchReportData(requestBody);
        const data = response.data || response;
        if (data.length > 0) {
          setisReportPresent(true);
        } else {
          setisReportPresent(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        await checkReportPresent(search);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [search]);

  const handlePrint = (row) => {
    if (isReportPresent) {
      setOpenPrintModal((prev) => !prev);
      setSubmittedMenuId(search);
      setSubmittedRecordId(row.id);
    }
  };

  const validateEdit = async (tableName, recordId) => {
    const requestBody = {
      tableName: tableName,
      recordId: recordId.id,
    };
    const data = await disableEdit(requestBody);
    if (data.success === true) {
      setParaText(data.message);
      //setIsError(true);
      setOpenModal((prev) => !prev);
    } else {
      addEditController(recordId);
    }
  };

  const validateAdd = async (tableName) => {
    const requestBody = {
      tableName: tableName,
    };
    const data = await disableAdd(requestBody);
    if (data.success === true) {
      setParaText(data.message);
      setIsError(false);
      setOpenModal((prev) => !prev);
    } else {
      addEditController("add");
    }
  };

  const handleReportClick = (reportId) => {
    const selectedReport = reportNames.find(
      (report) => report.ReportName === reportId
    );

    if (selectedReport) {
      if (selectedReport.menuType === "T" || selectedReport.menuType === "t") {
        const reportIdsArray = [reportId];
        const templateId = selectedReport.ReportId.toString();
        const selectedReportId = [SelectedRow]; // Assuming this should refer to the selected row or item
        setTemplateId(reportIdsArray);
        router.push(
          `/reportTemplateCreator/viewEditer?templateId=${templateId}&reportId=${selectedReportId}&menuName=${search}`
        );
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
        const url = `${selectedReport.ReportMenuLink}?recordId=${SelectedRow}&reportId=${selectedReport.reportMenuId}`;
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

  function calculatePageNo() {
    // If there's a search input, check if the user is navigating to other pages post-search
    if (searchInput.length > 0 && !isNewSearch) {
      setIsNewSearch(true);
      return 1; // Reset to page 1 for new searches or if the user is not navigating
    }

    // Use the user-specified page number when there is no search input affecting the results
    return page == 0 ? 1 : page;
  }
  async function fetchData() {
    setMenuSearch(() => search);
    try {
      setLoader(true);
      if (!dataFetched) {
        const tableHeadingsData = await formControlMenuList(search);
        if (tableHeadingsData.success === false) {
          setHeaderFields([]);
          setGridData([]);
          setLoader(false);
          return;
        }
        setDynamic([
          {
            headers: "",
            dropSelected: "",
            data: "",
            fromDate: "",
            toDate: "",
            controlname: "",
            value: "",
            isDropDown: false,
            dropDownValues: [],
          },
        ]);
        setFormControlData(tableHeadingsData.data[0]);
        setHeaderFields(tableHeadingsData.data[0]?.fields);
        setDropHeaderFields(tableHeadingsData.data[0]?.fields);
        setDataFetched(true);
        setIsRequiredAttachment(
          tableHeadingsData.data[0]?.isRequiredAttachment
        );
        let requestData = {
          tableName: tableHeadingsData.data[0]?.tableName,
          pageNo: 1,
          limit: rowsPerPage,
          menuID: search,
          label: sortData.label,
          order: sortData.order,
          search: advanceSearch,
          searchQuery: searchInput,
        };
        const apiResponse = await masterTableList(requestData);
        if (apiResponse.data?.length > 0) {
          const { data, Count } = apiResponse;
          setTableName(tableHeadingsData.data[0]?.tableName);
          setGridData(data);
          if (Count !== 0) {
            setPageCount(Count);
          }
          setTotalPages(
            Math.ceil((Count !== 0 ? Count : pageCount) / rowsPerPage)
          );
          setSearchOpen(false);
          setPage(1);
        } else {
          setGridData([]);
          setParaText(apiResponse.message);
          // setIsError(true);
          // setOpenModal((prev) => !prev);
          setLoader(false);
        }
      } else if (menuSearch !== search) {
        const tableHeadingsData = await formControlMenuList(search);
        if (tableHeadingsData.success === false) {
          setHeaderFields([]);
          setGridData([]);
          setLoader(false);
          return;
        }
        setFormControlData(tableHeadingsData.data[0]);
        setHeaderFields(tableHeadingsData.data[0]?.fields);
        setDropHeaderFields(tableHeadingsData.data[0]?.fields);
        setDynamic([
          {
            headers: "",
            dropSelected: "",
            data: "",
            fromDate: "",
            toDate: "",
            controlname: "",
            value: "",
            isDropDown: false,
            dropDownValues: [],
          },
        ]);
        setDataFetched(true);
        setIsRequiredAttachment(
          tableHeadingsData.data[0]?.isRequiredAttachment
        );
        let requestData = {
          tableName: tableHeadingsData.data[0]?.tableName,
          menuID: search,
          pageNo: 1,
          limit: rowsPerPage,
          label: sortData.label,
          order: sortData.order,
          search: advanceSearch,
          searchQuery: searchInput,
        };
        const apiResponse = await masterTableList(requestData);
        if (apiResponse.data?.length > 0) {
          const { data, Count } = apiResponse;
          setTableName(tableHeadingsData.data[0]?.tableName);
          setGridData(data);
          // setOriginalData(data);
          if (Count !== 0) {
            setPageCount(Count);
          }
          setTotalPages(
            Math.ceil((Count !== 0 ? Count : pageCount) / rowsPerPage)
          );
          setSearchOpen(false);
          setPage(1);
        } else {
          setGridData([]);
          setParaText(apiResponse.message);
          // setIsError(true);
          // setOpenModal((prev) => !prev);
          setLoader(false);
        }
      } else {
        let requestData = {
          tableName: tableName,
          pageNo: calculatePageNo(),
          limit: rowsPerPage,
          label: sortData.label,
          order: sortData.order,
          menuID: search,
          search: advanceSearch,
          searchQuery: searchInput,
          keyName: columnSearchKeyName,
          keyValue: columnSearchKeyValue,
        };

        const apiResponse = await masterTableList(requestData);
        if (apiResponse.data?.length > 0) {
          const { data, Count } = apiResponse;
          setTableName(tableName);
          setGridData(data);
          if (Count !== 0) {
            setPageCount(Count);
          }
          setTotalPages(
            Math.ceil((Count !== 0 ? Count : pageCount) / rowsPerPage)
          );
          pageSelected(requestData.pageNo);
        } else {
          setGridData([]);
          setLoader(false);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle the error (e.g., set an error state, show a notification)
      setGridData([]);
      setLoader(false);
    }
  }
  async function fetchDropDownData(field, inputValueForDataFetch) {
    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: field.referenceTable,
      referenceColumn: field.referenceColumn,
      dropdownFilter: field.dropdownFilter,
      pageNo: inputValueForDataFetch?.length > 0 ? 1 : dropPageNo,
      search: inputValueForDataFetch,
    };
    try {
      const apiResponse = await dynamicDropDownFieldsData(requestData);

      if (!apiResponse.success) {
        // Handle the case where apiResponse is falsy (e.g., null, undefined)
        console.error("API response is falsy.");
        return [];
      } else {
        return apiResponse.data;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // Handle the error (e.g., set an error state, show a notification)
      return false;
    }
  }

  useEffect(() => {
    if (menuSearch !== search) {
      setIsAdvanceSearchOpen(false);
    }
    fetchData();
  }, [
    search,
    page,
    rowsPerPage,
    advanceSearch,
    columnSearchKeyName,
    columnSearchKeyValue,
    sortData,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const clientId = userData[0].clientId;
        const menuName = JSON.parse(searchParams.get("menuName")).id;
        if (menuName !== null) {
          const requestBody = {
            columns:
              "mrm.reportMenuId,mrm.reportTemplateId,tm.menuName,tm.menuLink,tm.menuType,tm.clientId",
            tableName:
              "tblMenuReportMapping mrm Inner Join tblMenu tm on mrm.reportMenuId = tm.id",
            whereCondition: `mrm.menuId = ${menuName} and tm.status = 1 and mrm.clientId in (${clientId} ,(select id from tblClient where clientCode = 'SYSCON'))`,
            clientIdCondition: `mrm.status = 1 FOR JSON PATH`,
          };
          try {
            const response = await fetchReportData(requestBody);
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

    fetchData();
  }, [searchParams]);

  const addEditController = (data, isCopy, isView) => {
    // Check if data and index are valid before navigating
    const queryString = encodeURIComponent(
      JSON.stringify({
        id: data.id,
        menuName: search,
        isCopy: isCopy || false,
        isView: isView || false,
      })
    );

    const addPageQueryString = encryptUrlFun({
      id: search,
      menuName: JSON.parse(searchParams.get("menuName")).menuName,
      parentMenuId: JSON.parse(searchParams.get("menuName")).parentMenuId,
    });

    if (data !== "add") {
      router.push(`/invoiceControl/addEdit//${queryString}`);
    } else if (data === "add") {
      router.push(`/invoiceControl/search/${addPageQueryString}`);
    } else {
      console.error("Invalid data or index provided for navigation");
      // Handle the error or provide feedback to the user
    }
  };

  const deleteController = (data) => {
    console.log("deleteController", data);
    const { clientId } = getUserDetails();
    setDeleteData({
      id: data.id,
      tableName,
      clientId,
      menuID: search,
    });
    setParaText("Do you want to delete this record?");
    setIsError(false);
    setOpenModal((prev) => !prev);
  };

  const onConfirm = async (conformData) => {
    if (conformData.isError) {
      setOpenModal((prev) => !prev);
    }
    // API call for delete
    if (conformData.value) {
      const payloadData = { ...deleteData };
      try {
        const responseData = await deleteMasterRecord(payloadData);
        if (responseData.success) {
          toast.success(responseData.message);
          setDeleteData(null);
          setOpenModal((prev) => !prev);
          fetchData();
        } else {
          toast.error(responseData.message);
        }
      } catch (error) {
        // Handle any API call errors
        console.error("Error in API call:", error);
        toast.error("An error occurred while processing the request");
      }
    }
  };

  // Filter fields with isRequired true for headers
  // const headers = headerFields?.filter((field) => field.isGridView);
  var headers =
    formControlData.gridConfig && typeof formControlData.gridConfig === "string"
      ? JSON.parse(formControlData.gridConfig)
      : headerFields?.filter((field) => field.isGridView);

  // Create table columns based on headers
  const tableheading = headers?.map((header) => ({
    id: header?.fieldname,
    label: header?.yourlabel,
    refkey: header.keyToShowOnGrid || null,
    isDummy: header.isDummy || false,
    dummyField: header.isCommaSeparatedOrCount || null,
    align: "left", // You can set the alignment as per your requirement
    minWidth: 200, // You can set the minimum width as per your requirement
  }));
  function getNestedValue(obj, refKey) {
    if (typeof refKey === "string") {
      const keys = refKey.split(".");
      let result = obj;
      for (let key of keys) {
        if (result && typeof result === "object") {
          result = result[key];
        } else {
          return undefined;
        }
      }
      return result;
    }

    return undefined;
  }
  function getCommaSeparatedValuesCountFromNestedKeys(dataa, nestedKey) {
    let data;
    if (Array.isArray(dataa)) {
      data = dataa;
    } else if (typeof dataa === "object") {
      data = [dataa];
    }

    if (!Array.isArray(data)) {
      return {
        values: "", // Return an empty string if the input is not an array
        count: 0, // Initialize count to 0
      };
    }

    if (!nestedKey) {
      return {
        values: "", // Return an empty string if the key is not provided
        count: 0, // Initialize count to 0
      };
    }

    const values = [];
    let count = 0;

    data.forEach((item) => {
      const value = ProccessForTheCommaSeperated(item, nestedKey);
      if (value !== undefined) {
        values.push(value);
        count += value.split(",").length; // Increment the count by the number of values
      }
    });

    return {
      values: values.filter((value) => value !== undefined).join(", "),
      count: count,
    };
  }

  function ProccessForTheCommaSeperated(Data, nestedKey) {
    const keys = nestedKey.split(".");
    const key = keys[0];

    let value = [];

    if (keys.length === 1) {
      typeof Data[key] !== "undefined" && Data[key] !== null
        ? value.push(Data[key])
        : null;
    } else {
      if (typeof Data[key] === "object" && Data[key] !== null) {
        let find = ProccessForTheCommaSeperated(
          Data[key],
          keys.slice(1).join(".")
        );
        value = [...value, find];
      }
      if (Array.isArray(Data[key])) {
        const keytoSend = keys.slice(1).join(".");
        let find = Data[key].map((item) =>
          ProccessForTheCommaSeperated(item, keytoSend)
        );
        value = [...find];
      }
    }

    return value.join(",");
  }

  const handleCustomRowsPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      sessionStorage?.setItem("rowsPerPage", value);
      setRowsPerPage(value);
      setSelectedPageNumber(page);
    }
  };
  useEffect(() => {
    const storedRowsPerPage = sessionStorage.getItem("rowsPerPage");
    setRowsPerPage(storedRowsPerPage ? parseInt(storedRowsPerPage) : 17);
  }, [sessionStorage.getItem("rowsPerPage"), search]);

  function pageSelected(selectedValue) {
    // console.log("pageSelected - - - - - ", selectedValue);
    setSelectedPage(selectedValue);
    setPage(selectedValue);
    setSelectedPageNumber(selectedValue);
  }

  useEffect(() => {
    // console.log('checkMenuId', sessionStorage.getItem('menuId') == search);
    if (sessionStorage?.getItem('menuId') == search) {
      const menuId = JSON.parse(sessionStorage.getItem('advanceSearch'));
      const dynamic = JSON.parse(sessionStorage.getItem('dynamic'));
      console.log("dynamic", dynamic)
      setadvanceSearch(menuId);
      setDynamic(dynamic);
      // setIsAdvanceSearchOpen(true);
    }
    else {
      sessionStorage.removeItem('advanceSearch');
      sessionStorage.removeItem('menuId');
      sessionStorage.removeItem('dynamic');
      setadvanceSearch({});
      setDynamic([]);
    }
  }, [search])
  // Function to handle sorting when a column header is clicked
  const handleSortBy = (elem) => {
    // If the same column is clicked again, toggle the sorting order
    setSortedColumn(elem.id); // If a different column is clicked, update the sortedColumn state and set sorting order to ascending

    if (sortedColumn === elem.id || sortedColumn === null) {
      setIsAscending((prevState) => !prevState);
    } else {
      setIsAscending((prevState) => !prevState);
    }
    const order = isAscending ? 1 : -1;
    setSortData({
      label: elem.id,
      order: order,
    });
  };

  const renderSortIcon = (columnId) => {
    if (sortedColumn === columnId) {
      return (
        <>
          {!isAscending ? (
            <LightTooltip title={sortedColumn === null ? "" : "Ascending"}>
              <ArrowUpwardIcon
                color="white"
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "1",
                }}
              />
            </LightTooltip>
          ) : (
            <LightTooltip title={sortedColumn === null ? "" : "Descending"}>
              <ArrowDownwardIcon
                color="white"
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "1",
                }}
              />
            </LightTooltip>
          )}
        </>
      );
    } else {
      return (
        <>
          {!isAscending ? (
            <LightTooltip title={sortedColumn === null ? "" : "Ascending"}>
              <ArrowUpwardIcon
                color="white"
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "0",
                }}
              />
            </LightTooltip>
          ) : (
            <LightTooltip title={sortedColumn === null ? "" : "Descending"}>
              <ArrowDownwardIcon
                color="white"
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "0",
                }}
              />
            </LightTooltip>
          )}
        </>
      );
    }
  };

  //right click function
  const handleRightClick = (event, columnId) => {
    event.preventDefault(); // Prevent the default context menu
    setInputVisible(true); // Show the input field
    setActiveColumn(columnId); // Set the active column to the one that was right-clicked
  };

  // advance search
  // Function to handle change in selected header
  const [newValueState, setNewValueState] = useState();
  const handleHeaderChange = async (
    index,
    newValue,
    dropPageNo,
    searchValue
  ) => {
    try {
      const prevData = [...dynamic];
      prevData[index]["value"] = newValue;
      prevData[index]["isDropDown"] =
        newValue.controlname.toLowerCase() == "dropdown" ? true : false;
      newValue.pageNo = dropPageNo;
      setNewValueState(newValue);
      if (newValue.controlname.toLowerCase() == "dropdown") {
        fetchDropDownData(newValue, searchValue).then((data) => {
          if (data.length === 0) {
            return;
          }
          setDynamic((prev) => {
            // Create a shallow copy of the array to avoid directly mutating the state
            const updatedItems = [...prev];
            // Only proceed if the index is within the bounds of the array
            if (index >= 0 && index < updatedItems.length) {
              // Create a copy of the item you want to update to avoid mutating it directly
              const updatedItem = { ...updatedItems[index] };
              // Update the fields in the copied item
              updatedItem["value"] = newValue;

              updatedItems[index] = updatedItem;
              updatedItem["dropDownValues"] =
                searchValue?.length > 0
                  ? [...data]
                  : [...updatedItem["dropDownValues"], ...data];
              updatedItems[index]["controlname"] = newValue.controlname;
              updatedItems[index]["dropSelected"] = newValue.label;
              updatedItem["isDropDown"] =
                newValue.controlname.toLowerCase() === "dropdown";
            }
            // Return the updated array to set the new state
            // console.log("updatedItems", updatedItems);
            return updatedItems;
          });
        });
      } else {
        setDynamic((prev) => {
          // Create a shallow copy of the array to avoid directly mutating the state
          const updatedItems = [...prev];

          // Only proceed if the index is within the bounds of the array
          if (index >= 0 && index < updatedItems.length) {
            // Create a copy of the item you want to update to avoid mutating it directly
            const updatedItem = { ...updatedItems[index] };

            // Update the fields in the copied item
            updatedItem["value"] = newValue;
            updatedItem["isDropDown"] =
              newValue?.controlname?.toLowerCase() === "dropdown";
            // Replace the item in the copied array with the updated item
            updatedItems[index] = updatedItem;
            updatedItems[index]["controlname"] = newValue.controlname;
            updatedItems[index]["dropSelected"] = newValue.label;
          }
          // Return the updated array to set the new state
          // console.log("setDynamic", setDynamic);
          return updatedItems;
        });
      }
      setDropHeaderFields((prev) =>
        prev.filter((item) => item.fieldname !== newValue.fieldname)
      );
    } catch (error) {
      console.error(" error ", error);
    }
  };

  // Options for the first autocomplete (labels instead of IDs)
  const dropHeaderOptions = dropHeaderFields
    ?.map((header) => {
      return {
        label: header?.yourlabel,
        fieldname: header?.fieldname,
        controlname: header?.controlname,
        referenceTable: header?.referenceTable,
        referenceColumn: header?.referenceColumn,
      };
    })
    .sort((a, b) => {
      return a.label?.localeCompare(b.label);
    });
  const initialHeaderFields = headerFields
    ?.map((header) => {
      return {
        label: header?.yourlabel,
        value: header?.fieldname,
      };
    })
    .sort((a, b) => {
      return a.label.localeCompare(b.label);
    });

  const setValues = (index, value) => {
    setDynamic((prev) => {
      // Create a shallow copy of the array to avoid directly mutating the state
      const updatedItems = [...prev];

      // Only proceed if the index is within the bounds of the array
      if (index >= 0 && index < updatedItems.length) {
        // Create a copy of the item you want to update to avoid mutating it directly
        const updatedItem = { ...updatedItems[index] };

        updatedItem["advanceSearch"] = {
          [updatedItem?.value.fieldname]: value?.id || value,
        };
        updatedItems[index] = updatedItem;
      }

      // Return the updated array to set the new state
      return updatedItems;
    });
  };

  const handleFromDateChange = (newValue, index, name) => {
    if (newValue && newValue.$d) {
      // Check if newValue is a valid Day.js object
      const formattedDate = newValue.format("YYYY-MM-DDTHH:mm:ss"); // Format the date to ISO string or any format you need
      setDynamic((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
              ...item,
              fromDate: formattedDate,
              advanceSearch: {
                ...item.advanceSearch, // Spread existing advanceSearch to keep previous data
                [name]: {
                  // Update or add the new key within advanceSearch
                  ...item.advanceSearch?.[name], // Spread existing values under this key, if any
                  $gte: formattedDate, // Update or add the $lte key under the specified name
                },
              },
            }
            : item
        )
      );
    }
  };

  const handleToDateChange = (newValue, index, name) => {
    if (newValue && newValue.$d) {
      // Check if newValue is a valid Day.js object
      const formattedDate = newValue.format("YYYY-MM-DDTHH:mm:ss"); // Format the date to ISO string or any format you need
      setDynamic((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
              ...item,
              toDate: formattedDate,
              advanceSearch: {
                ...item.advanceSearch, // Spread existing advanceSearch to keep previous data
                [name]: {
                  // Update or add the new key within advanceSearch
                  ...item.advanceSearch?.[name], // Spread existing values under this key, if any
                  $lte: formattedDate, // Update or add the $lte key under the specified name
                },
              },
            }
            : item
        )
      );
    }
  };

  const handleAdd = () => {
    // Add your add functionality here
    setDynamic((prev) => [
      ...prev,
      {
        headers: "",
        data: "",
        fromDate: "",
        toDate: "",
        controlname: "",
        value: "",
        isDropDown: false,
        dropDownValues: [],
      },
    ]);
  };

  const handleDelete = (i) => {
    // Add your delete functionality here
    const prevData = [...dynamic];
    prevData.splice(i, 1);
    setDynamic(prevData);
  };

  const handleRevert = (index, elem) => {
    // remove all data and revert back to initial state
    // frop dropheader remove dynamic header field
    const updatedItems = [...dynamic];

    const removedDropData = headerFields.filter(
      (header) =>
        !updatedItems.some((item) => header.fieldname === item.value.fieldname)
    );

    const insertDropData = headerFields.find((item) => {
      return item.fieldname === elem.value.fieldname;
    });

    const newDropHeaderFields = [...removedDropData, insertDropData];
    setDropHeaderFields(newDropHeaderFields);
    updatedItems[index] = {
      headers: "",
      data: "",
      fromDate: "",
      toDate: "",
      controlname: "",
      value: "",
      isDropDown: false,
      dropDownValues: [],
      dropSelected: "",
    };
    setDynamic(updatedItems);
    return true;
  };

  // search data based on advance search
  const handleSearch = () => {
    let tempObj = {};
    dynamic.map((d) => {
      Object.assign(tempObj, d.advanceSearch);
    });
    setadvanceSearch(tempObj);
    sessionStorage.setItem('advanceSearch', JSON.stringify(tempObj));
    sessionStorage.setItem('menuId', search);
    sessionStorage.setItem('dynamic', JSON.stringify(dynamic));
    setSearchOpen(false);
  };

  // Remove search filter and fetchData
  const handleRemoveSearch = () => {
    setDropHeaderFields(headerFields);
    setIsAdvanceSearchOpen(false);
    setDynamic([
      {
        headers: "",
        dropSelected: "",
        data: "",
        fromDate: "",
        toDate: "",
        controlname: "",
        value: "",
        isDropDown: false,
        dropDownValues: [],
      },
    ]);
    setSearchInput("");
    setadvanceSearch({});
    setRowsPerPage(17);
    setPage(1);
  };

  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [isFocused5, setIsFocused5] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleFocus = () => {
    setIsFocused(true);
    setIsFocused5(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsFocused5(false);
  };

  useEffect(() => {
    const inputElement = inputRef.current;

    if (inputElement) {
      inputElement.addEventListener("focus", handleFocus);
      inputElement.addEventListener("blur", handleBlur);

      return () => {
        inputElement.removeEventListener("focus", handleFocus);
        inputElement.removeEventListener("blur", handleBlur);
      };
    }
  }, []);

  let PaperId = null;
  if (typeof window !== "undefined") {
    // Safe to use `document` here
    PaperId = document.getElementById("paper");
    // Perform operations with `element`
  }
  // This function will handle the scroll event
  // State to hold the current scroll position
  useEffect(() => {
    let timerId = null;

    const updatePosition = () => {
      if (!timerId) {
        timerId = setTimeout(() => {
          if (PaperId) {
            setScrollLeft(PaperId.scrollLeft);
          }
          timerId = null;
        }, 100); // Adjust the 100ms to your needs for throttling
      }
    };

    if (PaperId) {
      PaperId.addEventListener("scroll", updatePosition);

      return () => {
        PaperId.removeEventListener("scroll", updatePosition);
        if (timerId) {
          clearTimeout(timerId);
        }
      };
    }
  }, [PaperId]); //

  function handleInitailSearch() {
    fetchData();
    setSearchOpen(false);
  }

  const handleInputChange = (index, newInputValue, dropPageNo) => {
    handleHeaderChange(index, newValueState, dropPageNo, newInputValue);
  };

  const showLabel = false;
  const customStyles = {
    menu: (base) => ({
      ...base,
      ...menuStyles,
    }),
    menuPortal: (provided) => ({
      ...provided,
      backgroundColor: "var(--page-bg-color)",
      zIndex: 9999, // Set zIndex to a very high value
    }),
    option: (provided) => ({
      ...provided,
      backgroundColor: "var(--accordian-summary-bg)",
      color: "var(--table-text-color)", // Normal text color
      ":hover": {
        ...provided[":hover"],
        backgroundColor: "var(--accordion-summary-bg)", // Background color on hover
      },
    }),
    menuList: () => ({
      ...menuListStyles,
    }),

    control: (base, { isDisabled }) => ({
      ...base,
      minHeight: "27px",
      borderWidth: 1,
      borderColor: isDisabled ? "#B2BAC2" : "#E0E3E7",
      backgroundColor: "var(--page-bg-color)",
      boxShadow: "none",
      borderRadius: "4px",
      "&:hover": { borderColor: "#B2BAC2" },
      color: "#00000099",
      cursor: "text !important",
      width: "12rem",
      height: "27px ",
      zindex: 999,
      fontSize: "10px",
      position: "relative",
    }),
    indicatorSeparator: (base) => ({
      ...base,
      display: "none",
    }),
    placeholder: (base) => ({
      ...base,
      color: "var(--table-text-color)",
      margin: 0,
      padding: 0,
      fontSize: "10px",
      position: "relative",
      bottom: "2px",
      display: !showLabel ? "inline" : "none",
    }),
    dropdownIndicator: (base) => ({
      ...base,
      "& svg": {
        width: "12px !important", // Adjust the size of the arrow icon
        height: "12px !important", // Adjust the size of the arrow icon
      },
      cursor: "pointer !important",
    }),

    clearIndicator: (base) => ({
      ...base,
      "& svg": {
        width: "12px !important", // Adjust the size of the clear icon
        height: "12px !important", // Adjust the size of the clear icon
        cursor: "pointer !important",
      },
    }),

    singleValue: (base) => ({
      ...base,
      color: "var(--table-text-color)",
    }),
    valueContainer: (provided) => ({
      ...provided,
      flexWrap: "nowrap", // Set selected values to not wrap
      // overflow: "hidden", // Optional: hides overflowed content
    }),
    input: (base) => ({
      ...base,
      color: "var(--table-text-color)", // Set color of typed text to "var(--table-text-color)"
    }),
  };
  let callInputChangeFunc = true;
  const [scrollPosition, setScrollPosition] = useState(0);

  const CustomMenuList = (props) => {
    const {
      dropPageNo,
      setDropPageNo,
      setScrollPosition,
      scrollPosition,
      index,
    } = props; // Assuming these are passed as props now
    const menuListRef = useRef(null);
    // Adding a flag to control when to adjust scroll
    const localScrollPosition = useRef(scrollPosition); // To track scroll position locally
    useEffect(() => {
      const menuList = menuListRef.current;
      if (menuList) {
        const onScroll = () => {
          const { scrollHeight, scrollTop, clientHeight } = menuList;
          localScrollPosition.current = scrollTop;
          const isBottom = scrollHeight - scrollTop === clientHeight;

          if (isBottom && scrollPosition !== scrollTop) {
            setScrollPosition(scrollTop);
            setDropPageNo((prevPageNo) => prevPageNo + 1);
            handleHeaderChange(index, newValueState, dropPageNo + 1, "");
          }
        };

        menuList.addEventListener("scroll", onScroll);
        return () => {
          menuList.removeEventListener("scroll", onScroll);
        };
      }
    }, []); // Updated the dependencies
    useEffect(() => {
      const menuList = menuListRef.current;

      if (menuList && dropPageNo > 1) {
        // Use requestAnimationFrame to ensure the DOM updates are complete
        requestAnimationFrame(() => {
          menuList.scrollTop = localScrollPosition.current;
        });
      }
    }, [dropPageNo]); // Added adjustScrollNeeded as a dependency

    return (
      <components.MenuList {...props} innerRef={menuListRef}>
        {props.children}
      </components.MenuList>
    );
  };

  CustomMenuList.propTypes = {
    props: PropTypes.any,
    selectProps: PropTypes.any,
    children: PropTypes.any,
    dropPageNo: PropTypes.any,
    setDropPageNo: PropTypes.any,
    setScrollPosition: PropTypes.any,
    scrollPosition: PropTypes.any,
    index: PropTypes.any,
  };

  return (
    <div className="relative">
      <CustomeBreadCrumb />
      <div className="flex mb-3 justify-end -mt-[10px] ">
        <div className="flex justify-between h-[27px] border border-gray-100 rounded-[7px] shadow-md">
          <Stack direction="row" className="">
            {isAddVisible && (
              <LightTooltip title="Add Form">
                <Button
                  onMouseEnter={() => setHoveredIcon("addForm")}
                  onMouseLeave={() => setHoveredIcon(null)}
                  onClick={() => validateAdd(tableName)}
                >
                  <Image
                    src={
                      hoveredIcon === "addForm" ? addDocIconHover : addDocIcon
                    }
                    alt="Add Icon"
                    priority={false}
                    className="cursor-pointer gridIcons2"
                  />
                </Button>
              </LightTooltip>
            )}

            <LightTooltip title="share Form">
              <Button
                onMouseEnter={() => setHoveredIcon("shareForm")}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <Image
                  src={hoveredIcon === "shareForm" ? ShareIconHover : shareIcon}
                  alt="Share Icon"
                  priority={false}
                  className="cursor-pointer gridIcons2"
                />
              </Button>
            </LightTooltip>
            <LightTooltip title="Advanced Search">
              <Button
                onClick={() => {
                  setSearchOpen(!searchOpen);
                }}
                onMouseEnter={() => setHoveredIcon("advanceSearch")}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <Image
                  src={
                    hoveredIcon === "advanceSearch"
                      ? magnifyIconHover
                      : searchImage
                  }
                  alt="Search Icon"
                  priority={false}
                  className="cursor-pointer gridIcons2"
                />
              </Button>
            </LightTooltip>
          </Stack>
        </div>
      </div>

      {/* serach modal */}
      {searchOpen && (
        <Paper
          className={`absolute top-[8%] right-0 z-50 ${styles.searchDispalyBg} border border-[#B2BAC2]  rounded-[7px] shadow-md`}
          sx={{ width: "90%", height: "auto" }}
        >
          <div className=" mx-[20px] ">
            <div className="flex items-center  relative mt-[6px]">
              <Paper
                sx={{
                  ...advanceSearchPaperStyles,
                }}
              >
                <InputBase
                  autoFocus={true}
                  autoComplete="off"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search..."
                  inputProps={{ "aria-label": "search..." }}
                  sx={{
                    ...searchInputStyling,
                  }}
                />
                <GridHoverIcon
                  defaultIcon={magnifyIcon}
                  hoverIcon={magnifyIconHover}
                  altText={"search"}
                  title={"search"}
                  onClick={() => handleInitailSearch()}
                />
              </Paper>
              <GridHoverIcon
                defaultIcon={closeIcon}
                hoverIcon={crossIconHover}
                altText={"close"}
                title={"close"}
                className={"relative left-2 cursor-pointer "}
                onClick={() => setSearchOpen(false)}
              />
            </div>
            <button
              className={`${styles.txtColorDark} mt-[6px] block text-[12px]`}
              onClick={() => {
                setIsAdvanceSearchOpen(!isAdvanceSearchOpen);
                setSearchInput("");
              }}
            >
              Advanced Search
            </button>

            {isAdvanceSearchOpen && (
              <>
                {dynamic?.map((elem, index) => {
                  return (
                    <div
                      className="mt-[6px] gap-10 my-3  flex  items-center"
                      key={index}
                    >
                      <Select
                        key={index}
                        menuPortalTarget={document.body}
                        backspaceRemovesValue={true}
                        isClearable={true}
                        styles={customStyles}
                        options={dropHeaderOptions}
                        className={`w-[12rem] ${styles.inputField}  `}
                        value={
                          initialHeaderFields?.find(
                            (option) => option.label === elem.value?.label
                          ) || null
                        }
                        noOptionsMessage={() => "No records found"}
                        onMenuOpen={() => {
                          setScrollPosition(0);
                        }}
                        onMenuClose={() => { }}
                        onFocus={() => { }}
                        onChange={(newValue) => {
                          callInputChangeFunc = false;
                          if (newValue) {
                            // Handle the selection
                            handleHeaderChange(index, newValue, dropPageNo, "");
                          } else {
                            // Handle the clear event
                            handleRevert(index, elem);
                          }
                          callInputChangeFunc = true;
                        }}
                        onBlur={() => {
                          // setIsFocused4(false);
                        }}
                      />

                      {elem.isDropDown == true && (
                        <Select
                          key={index}
                          className={styles.advanceFilterInputs}
                          backspaceRemovesValue={true}
                          isClearable={true}
                          styles={customStyles}
                          options={elem.dropDownValues}
                          components={{
                            MenuList: (props) => (
                              <CustomMenuList
                                {...props}
                                dropPageNo={dropPageNo}
                                setDropPageNo={setDropPageNo}
                                setScrollPosition={setScrollPosition}
                                scrollPosition={scrollPosition}
                                index={index}
                              />
                            ),
                          }}
                          value={elem.dropDownValues?.find(
                            (option) =>
                              option.value ===
                              elem.advanceSearch?.[elem.value?.fieldname]
                          )}
                          noOptionsMessage={() =>
                            dropHeaderOptions.length === 0
                              ? "No records found"
                              : "Searching..."
                          }
                          onMenuOpen={() => {
                            setDropPageNo(1);
                          }}
                          onMenuClose={() => {
                            setDropPageNo(1);
                          }}
                          onFocus={() => {
                            setDropPageNo(1);
                          }}
                          onChange={(newValue) => {
                            setValues(index, newValue?.value);
                          }}
                          onBlur={() => {
                            setDropPageNo(1);
                          }}
                          onInputChange={(value, e) => {
                            console.log("callInputChangeFunc", e);
                            if (
                              callInputChangeFunc &&
                              e.action === "input-change"
                            ) {
                              handleInputChange(index, value, dropPageNo);
                            }
                          }}
                        />
                      )}

                      {elem.isDropDown == false &&
                        elem.controlname == "text" && (
                          <TextField
                            key={index}
                            onFocus={() => {
                              setIsFocused2(true);
                            }}
                            onBlur={() => {
                              setIsFocused2(false);
                            }}
                            sx={{
                              ...textInputStyle2({
                                fieldname: "",
                                isFocused2,
                              }),
                            }}
                            size="small"
                            id="outlined-basic"
                            label="Search Text"
                            variant="outlined"
                            value={
                              elem?.advanceSearch?.[elem?.value?.fieldname]
                            }
                            onChange={(e) =>
                              setValues(index, e.target.value, "headersData")
                            }
                          />
                        )}

                      {elem.isDropDown == false &&
                        elem.controlname == "number" && (
                          <TextField
                            key={index}
                            onFocus={() => {
                              setIsFocused2(true);
                            }}
                            onBlur={() => {
                              setIsFocused2(true);
                            }}
                            sx={{
                              ...textInputStyle2({
                                fieldname: "",
                                isFocused2,
                                index: 1,
                              }),
                            }}
                            size="small"
                            id="outlined-basic"
                            label="Search Text"
                            variant="outlined"
                            value={
                              elem?.advanceSearch?.[elem?.value?.fieldname]
                            }
                            onChange={(e) =>
                              setValues(index, e.target.value, "headersData")
                            }
                          />
                        )}

                      {elem.isDropDown === false &&
                        elem.controlname === "date" && (
                          <>
                            <div
                              onFocus={() => setIsFocused(true)}
                              onBlur={() => setIsFocused(false)}
                              key={index}
                            >
                              <DateTimePicker
                                slotProps={{
                                  field: { clearable: true },
                                  actionBar: {
                                    // The actions will be the same between desktop and mobile
                                    actions: ["cancel"],
                                  },
                                  switchViewIcon: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  day: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },

                                  layout: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      borderRadius: "2px",
                                      borderWidth: "1px",
                                      borderColor:
                                        "var(--accordion-summary-bg)",
                                      border: "1px solid",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  leftArrowIcon: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  rightArrowIcon: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  calendarHeader: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  weekDayLabel: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                }}
                                key={index}
                                value={
                                  elem.fromDate ? dayjs(elem.fromDate) : null
                                }
                                onChange={(newValue) => {
                                  console.log("newValue", newValue, elem);
                                  handleFromDateChange(
                                    newValue,
                                    index,
                                    elem.value.fieldname
                                  );
                                }}
                                slots={{
                                  openPickerIcon: ExpandMoreIcon,
                                }}
                                onOpen={() => {
                                  setIsFocused(true);
                                }}
                                onClose={() => {
                                  setIsFocused(false);
                                }}
                                sx={{
                                  ...customDatePickerStyleCss22({
                                    fieldname: "FromDate",
                                    isFocused: isFocused,
                                    value: elem.fromDate,
                                  }),
                                }}
                                label="From Date"
                                name="FromDate"
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    onFocus={() => {
                                      setIsFocused(true); // Update the state when the input field is focused
                                    }}
                                    // If you need to handle onBlur as well
                                    onBlur={() => {
                                      setIsFocused(false);
                                    }}
                                  />
                                )}
                              />
                            </div>
                            <div
                              onFocus={() => setIsFocused5(true)}
                              onBlur={() => setIsFocused5(false)}
                              key={index}
                            >
                              <DateTimePicker
                                slotProps={{
                                  field: { clearable: true },
                                  actionBar: {
                                    // The actions will be the same between desktop and mobile
                                    actions: ["cancel"],
                                  },
                                  switchViewIcon: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  day: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },

                                  layout: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      borderRadius: "2px",
                                      borderWidth: "1px",
                                      borderColor:
                                        "var(--accordion-summary-bg)",
                                      border: "1px solid",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  leftArrowIcon: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  rightArrowIcon: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  calendarHeader: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                  weekDayLabel: {
                                    sx: {
                                      color: "var(--table-text-color)",
                                      backgroundColor:
                                        "var(--accordion-summary-bg)",
                                    },
                                  },
                                }}
                                key={index}
                                value={elem.toDate ? dayjs(elem.toDate) : null}
                                onChange={(newValue) => {
                                  handleToDateChange(
                                    newValue,
                                    index,
                                    elem.value.fieldname
                                  );
                                }}
                                slots={{
                                  openPickerIcon: ExpandMoreIcon,
                                }}
                                onOpen={() => {
                                  setIsFocused5(true);
                                }}
                                onClose={() => {
                                  setIsFocused5(false);
                                }}
                                sx={{
                                  ...customDatePickerStyleCss23({
                                    fieldname: "ToDate",
                                    isFocused5: isFocused5,
                                    value: elem.toDate,
                                  }),
                                }}
                                className={styles.advanceFilterInputs}
                                label="To Date"
                                name="ToDate"
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    InputProps={{
                                      ...params.InputProps,
                                      onFocus: () => {
                                        setIsFocused5(true);
                                      },
                                      // Optional: Handle onBlur if needed
                                      onBlur: () => {
                                        setIsFocused5(false);
                                      },
                                    }}
                                  />
                                )}
                              />
                            </div>
                          </>
                        )}

                      {elem.isDropDown == false &&
                        (elem.controlname.toLowerCase() == "radio" ||
                          elem.controlname.toLowerCase() == "checkbox") && (
                          <TextField
                            key={index}
                            onFocus={() => {
                              setIsFocused2(true);
                            }}
                            onBlur={() => {
                              setIsFocused2(false);
                            }}
                            sx={{
                              ...textInputStyle2({
                                fieldname: "",
                                isFocused2,
                              }),
                            }}
                            size="small"
                            id="outlined-basic"
                            label="Search Text"
                            variant="outlined"
                            value={
                              elem?.advanceSearch?.[elem?.value?.fieldname]
                            }
                            onChange={(e) =>
                              setValues(index, e.target.value, "headersData")
                            }
                          />
                        )}

                      {elem.isDropDown == false &&
                        elem.controlname.toLowerCase() == "time" && (
                          <TextField
                            key={index}
                            onFocus={() => {
                              setIsFocused2(true);
                            }}
                            onBlur={() => {
                              setIsFocused2(false);
                            }}
                            sx={{
                              ...textInputStyle2({
                                fieldname: "",
                                isFocused2,
                              }),
                            }}
                            size="small"
                            id="outlined-basic"
                            label="Search Text"
                            variant="outlined"
                            value={
                              elem?.advanceSearch?.[elem?.value?.fieldname]
                            }
                            onChange={(e) =>
                              setValues(index, e.target.value, "headersData")
                            }
                          />
                        )}

                      <div className="flex gap-3 items-center absolute right-5">
                        <GridHoverIcon
                          defaultIcon={addLogo} // Your default icon source
                          hoverIcon={plusIconHover} // Your hover icon source
                          altText="Add"
                          title={"Add"}
                          onClick={() => {
                            handleAdd();
                          }}
                        />
                        <GridHoverIcon
                          defaultIcon={DeleteIcon2} // Your default icon source
                          hoverIcon={DeleteHover} // Your hover icon source
                          altText="Delete"
                          title={"Delete"}
                          onClick={() => {
                            dynamic.length > 1 && handleDelete(index);
                          }}
                        />
                        <GridHoverIcon
                          defaultIcon={refreshIcon} // Your default icon source
                          hoverIcon={revertHover} // Your hover icon source
                          title={"Revert"}
                          altText={"Revert"}
                          onClick={() => {
                            handleRevert(index, elem);
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            <div className="flex gap-3 mt-1">
              <button
                className={` my-[6px] ${styles.commonBtn}`}
                onClick={() => {
                  handleSearch();
                }}
              >
                Search
              </button>
              <button
                className={` my-[6px] ${styles.commonBtn}`}
                onClick={() => {
                  handleRemoveSearch();
                }}
              >
                Remove filter
              </button>
            </div>
          </div>
        </Paper>
      )}

      {tableheading?.length > 0 ? (
        <>
          <Paper
            sx={{
              ...displayTablePaperStyles,
            }}
          >
            <TableContainer
              id={"paper"}
              className={` ${styles.thinScrollBar}`}
              sx={{
                ...displayTableContainerStyles,
                position: "relative !important",
              }}
            >
              <Table
                stickyHeader
                aria-label="sticky table"
                className={` overflow-auto   ${styles.hideScrollbar} ${styles.thinScrollBar}`}
              >
                {/* Table Heading */}
                <TableHead
                  sx={{
                    ...displaytableHeadStyles,
                  }}
                >
                  <TableRow
                    style={{
                      cursor: "context-menu",
                    }}
                  >
                    {tableheading.map((elem) => (
                      <TableCell
                        key={elem.id}
                        align={elem.align}
                        style={{ minWidth: elem.minWidth }}
                        width={"auto"}
                        className={`${styles.cellHeading} cursor-pointer `}
                        onContextMenu={(event) =>
                          handleRightClick(event, elem.id)
                        } // Add the right-click handler here
                      >
                        <span
                          className={`${styles.labelText}`}
                          onClick={() => {
                            handleSortBy(elem);
                          }}
                        >
                          {elem.label}
                        </span>
                        <span>
                          {isInputVisible &&
                            activeColumn === elem.id && ( // Conditionally render the input
                              <CustomizedInputBase
                                columnData={elem}
                                setPrevSearchInput={setPrevSearchInput}
                                prevSearchInput={prevSearchInput}
                                setInputVisible={setInputVisible}
                                setColumnSearchKeyName={setColumnSearchKeyName}
                                setColumnSearchKeyValue={
                                  setColumnSearchKeyValue
                                }
                                isInputVisible={isInputVisible}
                                setSearchInput={setSearchInput}
                                setIsNewSearch={setIsNewSearch}
                                setRowsPerPage={setRowsPerPage}
                                setPage={setPage}
                              />
                            )}
                        </span>
                        <span className="ml-1">{renderSortIcon(elem.id)}</span>
                      </TableCell>
                    ))}
                    <TableCell align="left" width={"auto"}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody
                  style={{
                    overflow: "auto",
                    marginTop: "30px",
                  }}
                  key={"body"}
                >
                  {gridData?.length > 0 &&
                    gridData?.map((row, rowIndex) => (
                      <TableRow
                        hover={true}
                        role="checkbox"
                        key={rowIndex}
                        className={`${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
                        sx={{
                          ...displaytableRowStyles_two(),
                        }}
                      >
                        {tableheading.map((fieldName, index) => (
                          <>
                            {fieldName.id !== "" &&
                              (fieldName.isDummy === false ||
                                fieldName.isDummy === null) && (
                                <TableCell
                                  key={index}
                                  align="left"
                                  className={`
                          ${index === 0 && styles.tableCellHoverEffect}
                          `}
                                >
                                  {typeof row[fieldName.id] === "object" &&
                                    row[fieldName.id] !== null
                                    ? getNestedValue(
                                      row[fieldName.id],
                                      fieldName.refkey
                                    )
                                    : isDateFormat(row[fieldName.id])}
                                </TableCell>
                              )}

                            {typeof row[fieldName.id] ===
                              ("object" || "Array") &&
                              fieldName.isDummy === true && (
                                <TableCell
                                  key={index}
                                  align="left"
                                  className=""
                                >
                                  {fieldName.dummyField == "comma"
                                    ? getCommaSeparatedValuesCountFromNestedKeys(
                                      row[fieldName.id],
                                      fieldName.refkey
                                    ).values
                                    : getCommaSeparatedValuesCountFromNestedKeys(
                                      row[fieldName.id],
                                      fieldName.refkey
                                    ).count}
                                </TableCell>
                              )}
                            {typeof row[fieldName.id] !==
                              ("object" || "Array") &&
                              fieldName.isDummy === true && (
                                <TableCell key={index} align="left"></TableCell>
                              )}
                          </>
                        ))}
                        <TableCell
                          className={styles.tableCellHoverEffect}
                          style={{ width: "auto" }}
                          key={rowIndex}
                        >
                          <div className="w-full  ">
                            <div
                              id={"iconsRow"}
                              className={` ${styles.iconContainer2} flex items-center w-full -mt-[11px]  `}
                              style={{
                                right: `-${scrollLeft}px`,
                                height: "20px",
                              }}
                            >
                              {isEditVisible && (
                                <GridHoverIcon
                                  defaultIcon={edit} // Your default icon source
                                  hoverIcon={EditHover} // Your hovered icon source
                                  altText="Edit"
                                  title={"Edit"}
                                  // onClick={() => addEditController(row)}
                                  onClick={async () =>
                                    validateEdit(tableName, row)
                                  }
                                />
                              )}
                              {isViewVisible && (
                                <GridHoverIcon
                                  defaultIcon={viewIcon} // Your default icon source
                                  hoverIcon={viewIconHover} // Your hovered icon source
                                  altText={"view"}
                                  title={"view"}
                                  onClick={() =>
                                    addEditController(row, false, true)
                                  }
                                />
                              )}
                              {isCopyVisible && (
                                <GridHoverIcon
                                  defaultIcon={copy} // Your default icon source
                                  hoverIcon={CopyHover} // Your hovered icon source
                                  altText="Copy"
                                  title={"Copy"}
                                  onClick={() => addEditController(row, true)}
                                />
                              )}
                              {isRequiredAttachment && (
                                <GridHoverIcon
                                  defaultIcon={attach} // Your default icon source
                                  hoverIcon={attachmentIcon} // Your hovered icon source
                                  altText="Attachment"
                                  title={"Attachment"}
                                />
                              )}
                              {/* {isPrintVisible && ( */}
                              <GridHoverIcon
                                defaultIcon={printer} // Your default icon source
                                hoverIcon={PrintHover} // Your hovered icon source
                                altText="Print"
                                title={"Print"}
                                onClick={async () => {
                                  handlePrint(row);
                                  setModalVisible(true);
                                }}
                              />
                              {/* )} */}
                              {isDeleteVisible && (
                                <GridHoverIcon
                                  defaultIcon={DeleteIcon2} // Your default icon source
                                  hoverIcon={DeleteHover} // Your hovered icon source
                                  altText="Delete"
                                  title={"Delete Record"}
                                  onClick={() => deleteController(row)}
                                />
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {gridData.length === 0 && (
                <div
                  className={`${styles.pageBackground} flex items-center justify-center h-[calc(100vh-168px)]`}
                >
                  <div
                    className={`${styles.pageBackground} container mx-auto text-center`}
                  >
                    {!loader && (
                      <p className="text-gray-500 text-lg mt-4">
                        {"No Records Found."}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {/* new model Akash */}
              <div>
                {openPrintModal && (
                  <PrintModal
                    setOpenPrintModal={setOpenPrintModal}
                    submittedRecordId={submittedRecordId}
                    submittedMenuId={submittedMenuId}
                    openPrintModal={openPrintModal}
                    pageType={"searchPage"}
                  />
                )}
              </div>
            </TableContainer>
          </Paper>
          <div className="flex items-center justify-end pt-2 px-4 text-black">
            <PaginationButtons
              totalPages={totalPages}
              pageSelected={pageSelected}
              selectedPageNumber={selectedPageNumber}
            />
            <input
              type="number"
              value={rowsPerPage}
              onChange={handleCustomRowsPerPageChange}
              className={`border ${styles.txtColorDark} ${styles.pageBackground} border-gray-300 rounded-md p-2 h-[17px] w-14 text-[10px] mr-[15px] outline-gray-300 outline-0`}
            />
            <p className={`text-[10px] ${styles.txtColorDark}`}>
              {selectedPage} of {totalPages} Pages
            </p>
          </div>
        </>
      ) : (
        <div
          className={`${styles.pageBackground} flex items-center justify-center h-[calc(100vh-200px)]`}
        >
          <div className="container mx-auto text-center">
            {loader ? (
              <p className="text-gray-500 text-lg mt-4">{"Loading..."}</p>
            ) : (
              <p className="text-gray-500 text-lg mt-4">
                {"No Records Found."}
              </p>
            )}
          </div>
        </div>
      )}

      {/* <CustomeModal /> */}
      {openModal && (
        <CustomeModal
          setOpenModal={setOpenModal}
          openModal={openModal}
          onConfirm={onConfirm}
          isError={isError}
          paraText={paraText}
          labelValue={""}
        />
      )}
    </div>
  );
}

CustomizedInputBase.propTypes = {
  columnData: PropTypes.array,
  setPrevSearchInput: PropTypes.func,
  prevSearchInput: PropTypes.string,
  setInputVisible: PropTypes.func,
  setColumnSearchKeyName: PropTypes.func,
  setColumnSearchKeyValue: PropTypes.func,
  isInputVisible: PropTypes.bool,
  setSearchInput: PropTypes.func,
  setIsNewSearch: PropTypes.func,
  setRowsPerPage: PropTypes.func,
  setPage: PropTypes.number,
};
function CustomizedInputBase({
  columnData,
  setPrevSearchInput,
  prevSearchInput,
  setInputVisible,
  setColumnSearchKeyName,
  setColumnSearchKeyValue,
  isInputVisible,
  setSearchInput,
  setIsNewSearch,
  setRowsPerPage,
  setPage,
}) {
  const inputRef = useRef(null); // Ref to the Paper component
  const [searchInputGridData, setSearchInputGridData] = useState(
    prevSearchInput || ""
  );

  // Custom filter logic
  const filterFunction = (searchValue, columnKey) => {
    setColumnSearchKeyName(columnKey);
    setColumnSearchKeyValue(searchValue);
    setSearchInput(searchValue);
    setInputVisible(false);
    setPrevSearchInput(searchValue);
    if (searchValue === "") {
      setRowsPerPage(17);
      setPage(1);
    }
  };

  function handleClose() {
    setSearchInputGridData("");
    setPrevSearchInput("");
    setSearchInput("");
    setIsNewSearch(false);
  }

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setInputVisible(!isInputVisible);
      }
    };

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputRef]);

  return (
    <Paper
      ref={inputRef}
      sx={{
        ...createAddEditPaperStyles,
      }}
    >
      <InputBase
        autoFocus={true}
        sx={{
          ...searchInputStyling,
        }}
        placeholder="Search..."
        inputProps={{ "aria-label": "search..." }}
        value={searchInputGridData}
        onChange={(e) => setSearchInputGridData(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            filterFunction(searchInputGridData, columnData.id);
          }
        }}
      />
      <LightTooltip title="Clear">
        <IconButton sx={{ p: "2px" }} aria-label="clear">
          <ClearIcon
            onClick={handleClose}
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
      <LightTooltip title="Search">
        <IconButton
          type="button"
          sx={{ p: "2px" }}
          aria-label="search"
          onClick={() => filterFunction(searchInputGridData, columnData.id)}
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
