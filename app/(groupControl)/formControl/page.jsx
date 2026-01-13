"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useState, useRef, useEffect } from "react";
import {
  fetchDataAPI,
  masterTableInfo,
  disableEdit,
  disableAdd,
} from "@/services/auth/FormControl.services.js";
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
import { useRouter, useParams } from "next/navigation";
import TextField from "@mui/material/TextField";
import GridHoverIcon from "@/components/HoveredIcons/GridHoverIcon";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import CloseIcon from "@mui/icons-material/Close";
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
  pageTableCellInlineStyle,
} from "@/app/globalCss";
import {
  masterTableList,
  formControlMenuList,
  deleteMasterRecord,
  dynamicDropDownFieldsData,
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
import { toast, ToastContainer } from "react-toastify";
import { useSearchParams } from "next/navigation";
import PaginationButtons from "@/components/Pagination/index.jsx";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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
import * as onEditFunction from "@/helper/onEditFunction";
import { tab } from "@material-tailwind/react";
import _ from "lodash";
import { encryptUrlFun, operatorFunc, useTableNavigation } from "@/utils";
import { menuAccessByEmailId } from "@/services/auth/Auth.services";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";
import PrintModal from "@/components/Modal/printModal.jsx";
import useMediaQuery from "@mui/material/useMediaQuery";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { useTheme } from "@mui/material/styles";
import Pagination from "@mui/material/Pagination";

/* ✅ put these styles ABOVE return OR near your component (same file) */
const chipBtnStyle = {
  height: 34,
  padding: "0 12px",
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.22)",
  background: "rgba(255,255,255,0.06)",
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: "0.1px",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

const chipBtnStyleStrong = {
  ...chipBtnStyle,
  border: "1px solid rgba(99,102,241,0.30)",
  background: "rgba(99,102,241,0.14)",
};

const chipBtnStyleDanger = {
  ...chipBtnStyle,
  width: 38,
  justifyContent: "center",
  padding: 0,
  border: "1px solid rgba(239,68,68,0.26)",
  background: "rgba(239,68,68,0.10)",
};

function onEditAndDeleteFunctionCall(
  functionData,
  newState,
  formControlData,
  values,
  setStateVariable
) {
  const funcNameMatch = functionData?.match(/^(\w+)/);
  const argsMatch = functionData?.match(/\((.*)\)/);
  console.log(functionData, "functionData");
  // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
  if (funcNameMatch && argsMatch !== null) {
    const funcName = funcNameMatch[1];
    const argsStr = argsMatch[1] || "";

    // Find the function in formControlValidation by the extracted name
    const func = onEditFunction?.[funcName];

    if (typeof func === "function") {
      // Prepare arguments: If there are no arguments, argsStr will be an empty string
      let args;
      if (argsStr === "") {
        args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
      } else {
        args = argsStr; // Has arguments, pass them as an object
      }
      console.log(args);
      // Call the function with the prepared arguments
      let result = onEditFunction?.[funcName]({
        args,
        newState,
        formControlData,
        values,
        setStateVariable,
      });
      return result;
      // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
    }
  }
}

export default function StickyHeadTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = JSON.parse(searchParams.get("menuName")).id;
  const inputRef = useRef(null);
  const { clientId } = getUserDetails();
  const [menuSearch, setMenuSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(17);
  const [gridData, setGridData] = useState([]);
  const [headerFields, setHeaderFields] = useState([]);
  const [viewFields, setViewFieldData] = useState([]);
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
  const [selectedPageNumber, setSelectedPageNumber] = useState(1); // setSelectedPageNumber
  const [isRequiredAttachment, setIsRequiredAttachment] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFocused2, setIsFocused2] = useState(false);
  const [isFocused5, setIsFocused5] = useState(false);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [reportTemplateData, setReportTemplate] = useState([]);
  const [SelectedRow, setSelectedRow] = useState("");
  const [isNewModalVisible, setNewModalVisible] = useState(false);
  const [sortData, setSortData] = useState({
    label: "",
    order: "",
  });
  const [openPrintModal, setOpenPrintModal] = useState(false);
  const [submittedMenuId, setSubmittedMenuId] = useState(null);
  const [submittedRecordId, setSubmittedRecordId] = useState(null);
  const [isReportPresent, setisReportPresent] = useState(false);
  //const [defaultCompanyBranch, setDefaultCompanyBranch] = useState([]);
  const [operatorsBg, setOperatorsBg] = useState("blue");

  const isMobile = useMediaQuery("(max-width:768px)");
  const [expandedRows, setExpandedRows] = useState({}); // { [rowId]: true/false }
  const theme = useTheme();

  // Tailwind lg starts at 1024px
  //const isLgUp = useMediaQuery("(min-width:1024px)", { noSsr: true });
  const isLgUp = useMediaQuery("(min-width:1024px)");

  // ✅ small screen height = full viewport height (dynamic, correct on mobile address bar too)
  const [mobileViewportH, setMobileViewportH] = React.useState(0);

  const SWIPE_REVEAL_PX = 72; // width of action tray
  const SWIPE_THRESHOLD_PX = 26; // swipe distance to open

  const [swipeOpenId, setSwipeOpenId] = useState(null);
  const [dragX, setDragX] = useState({});
  const [draggingId, setDraggingId] = useState(null);

  const swipeRef = useRef({
    id: null,
    startX: 0,
    startY: 0,
    baseX: 0,
    dragging: false,
    intentLocked: false,
    isHorizontal: false,
  });

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const closeSwipe = (id) => {
    if (!id) return;
    setDragX((prev) => ({ ...prev, [id]: 0 }));
    setSwipeOpenId((cur) => (cur === id ? null : cur));
  };

  const openSwipe = (id) => {
    if (!id) return;
    setDragX((prev) => ({ ...prev, [id]: -SWIPE_REVEAL_PX }));
    setSwipeOpenId(id);
  };

  const onSwipeStart = (id, e) => {
    const tag = (e.target?.tagName || "").toLowerCase();

    // ✅ Don’t start swipe when clicking on buttons/icons inside
    if (tag === "button" || tag === "img" || tag === "svg" || tag === "path")
      return;

    const point = e.touches?.[0] ?? e;
    const clientX = point?.clientX ?? 0;
    const clientY = point?.clientY ?? 0;

    // ✅ close another open card before starting
    if (swipeOpenId && swipeOpenId !== id) closeSwipe(swipeOpenId);

    swipeRef.current.id = id;
    swipeRef.current.startX = clientX;
    swipeRef.current.startY = clientY;
    swipeRef.current.baseX =
      dragX?.[id] ?? (swipeOpenId === id ? -SWIPE_REVEAL_PX : 0);

    swipeRef.current.dragging = true;
    swipeRef.current.intentLocked = false;
    swipeRef.current.isHorizontal = false;

    setDraggingId(id);

    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {}
  };

  const onSwipeMove = (e) => {
    const id = swipeRef.current.id;
    if (!id || !swipeRef.current.dragging) return;

    const point = e.touches?.[0] ?? e;
    const clientX = point?.clientX ?? 0;
    const clientY = point?.clientY ?? 0;

    const dx = clientX - swipeRef.current.startX;
    const dy = clientY - swipeRef.current.startY;

    // ✅ decide swipe intent once
    if (!swipeRef.current.intentLocked) {
      if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
      swipeRef.current.intentLocked = true;
      swipeRef.current.isHorizontal = Math.abs(dx) > Math.abs(dy);
    }

    // ✅ only handle horizontal swipe
    if (!swipeRef.current.isHorizontal) return;

    e.preventDefault?.(); // ✅ prevent vertical scroll when swiping horizontally

    const next = clamp(swipeRef.current.baseX + dx, -SWIPE_REVEAL_PX, 0);
    setDragX((prev) => ({ ...prev, [id]: next }));
  };

  const onSwipeEnd = () => {
    const id = swipeRef.current.id;
    if (!id) return;

    const current = dragX?.[id] ?? 0;

    // ✅ snap open or close based on threshold
    if (current < -SWIPE_THRESHOLD_PX) openSwipe(id);
    else closeSwipe(id);

    swipeRef.current = {
      id: null,
      startX: 0,
      startY: 0,
      baseX: 0,
      dragging: false,
      intentLocked: false,
      isHorizontal: false,
    };

    setDraggingId(null);
  };

  React.useEffect(() => {
    const setH = () => {
      // visualViewport handles mobile browser bars better than innerHeight
      const h = window.visualViewport?.height || window.innerHeight || 0;
      setMobileViewportH(h);
    };

    setH();
    window.addEventListener("resize", setH);
    window.visualViewport?.addEventListener("resize", setH);

    return () => {
      window.removeEventListener("resize", setH);
      window.visualViewport?.removeEventListener("resize", setH);
    };
  }, []);

  console.log("isLgUp=>", isLgUp);

  // const validateEdit = async (tableName, recordId) => {
  //   const requestBody = {
  //     tableName: tableName,
  //     recordId: recordId.id,
  //   };
  //   const data = await disableEdit(requestBody);
  //   if (data.success === true) {
  //     setParaText(data.message);
  //     setIsError(false);
  //     setOpenModal((prev) => !prev);
  //   } else {
  //     addEditController(recordId);
  //   }
  // };

  const validateEdit = async (tableName, recordId) => {
    //alert("working")
    const requestBody = {
      tableName: tableName,
      recordId: recordId.id,
      clientId: clientId,
      menuId: search,
    };
    const data = await disableEdit(requestBody);
    if (data.success === false) {
      setParaText(data.message);
      //setIsError(true);
      setOpenModal((prev) => !prev);
      return;
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
  const [isModalVisible, setModalVisible] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [getUser, setUser] = useState(null);
  // const [isVisible, setIsVisible] = useState(false);  // State to manage visibility
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isAddVisible, setIsAddVisible] = useState(false);
  const [isViewVisible, setIsViewVisible] = useState(false);
  const [isPrintVisible, setIsPrintVisible] = useState(false);
  const [isCopyVisible, setIsCopyVisible] = useState(false);
  const [isAttachmentVisible, setisAttachmentVisible] = useState(false);
  let [TemplateIdAfterSelect, setTemplateId] = useState([0]);
  //const[isRequired, setIsRequiredCopyVisible] = useState(false);
  //const [isPrintVisible, setIsPrintVisible] = useState(false);

  const [reportNames, setReportNames] = useState([]);
  const [objectId, setObjectId] = useState("");

  const [formControlData, setFormControlData] = useState([]);

  // ref part

  const tableRef = useRef(null);
  const { moveToRow, setMoveToRow } = useTableNavigation(
    tableRef,
    gridData.length > 0 ? gridData : []
  );

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, [searchParams]);

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
        // setisAttachmentVisible(menuAccessData?.isPrint);
        setisAttachmentVisible(true);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchUserData();
  }, [search]);

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

  const handlePrint = (row) => {
    if (isReportPresent) {
      setOpenPrintModal((prev) => !prev);
      setSubmittedMenuId(search);
      setSubmittedRecordId(row.id);
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
        setViewFieldData(tableHeadingsData.data[0]?.viewFields || []);
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
        if (apiResponse.success === true && apiResponse.data?.length > 0) {
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
          console.log(
            "Math.ceil((Count !== 0 ? Count : pageCount) / rowsPerPage)",
            Math.ceil((Count !== 0 ? Count : pageCount) / 1)
          );

          setSearchOpen(false);
          setPage(1);
        } else {
          setGridData([]);
          setTableName(tableHeadingsData.data[0]?.tableName);
          setParaText(apiResponse.message);
          //setIsError(true);
          setOpenModal((prev) => !prev);
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
        setViewFieldData(tableHeadingsData.data[0]?.viewFields || []);
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
          //setIsError(true);
          setOpenModal((prev) => !prev);
          setLoader(false);
        }
      } else {
        let apiResponse = [];
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

        apiResponse = await masterTableList(requestData);
        if (apiResponse.data?.length > 0) {
          const { data, Count } = apiResponse;
          setTableName(tableName);
          setGridData(data);
          // setOriginalData(data);

          if (Count !== 0) {
            setPageCount(Count);
          }
          setTotalPages(
            Math.ceil((Count !== 0 ? Count : pageCount) / rowsPerPage)
          );
          pageSelected(requestData.pageNo);
        } else {
          let requestData = {
            tableName: tableName,
            pageNo: 1,
            limit: rowsPerPage,
            label: sortData.label,
            order: sortData.order,
            menuID: search,
            search: advanceSearch,
            searchQuery: searchInput,
            keyName: columnSearchKeyName,
            keyValue: columnSearchKeyValue,
          };
          apiResponse = await masterTableList(requestData);
          const { data, Count } = apiResponse;
          setTableName(tableName);
          setGridData(data);
          // setOriginalData(data);

          if (Count !== 0) {
            setPageCount(Count);
          }
          setTotalPages(
            Math.ceil((Count !== 0 ? Count : pageCount) / rowsPerPage)
          );
          pageSelected(requestData.pageNo);
          setGridData([]);
          setLoader(false);
        }
      }
    } catch (error) {
      // Handle the error (e.g., set an error state, show a notification)
      console.error("Error fetching data:", error);
      setGridData([]);
      setLoader(false);
    }
  }

  const handleIconClick = async () => {
    await fetchParentMenuId();
    await fetchReportTemplate();
  };

  const fetchParentMenuId = async () => {
    const requestBodyMenu = {
      tableName: "tblMenu1",
      whereCondition: {
        formControlId: search,
        status: 1,
      },
    };
    console.log("Akash", fetchParentMenuId);
    try {
      const data = await fetchDataAPI(requestBodyMenu);
      if (data && data.data && data.data.length > 0) {
        const parentId = data.data[0].parentMenuId;
        setParentMenuId(parentId);
        await fetchParentMenuName(parentId); // Fetch parent menu name
      } else {
        console.error("No data found for Parent Menu ID");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const clientCode = userData[0].clientCode;

        const requestBody = {
          tableName: "tblReportTemplate",
          whereCondition: {
            status: 1,
            clientCode: clientCode,
          },
          projection: {
            reportTemplateName: 1,
          },
        };
        console.log("requestBody", requestBody);

        try {
          const data = await fetchDataAPI(requestBody);
          if (data.data.length >= 0) {
            console.log("Fetched data reportTemplate:", data.data);
            setReportTemplate(data.data);
            console.log("reportTemplate", data.data);
          } else {
            throw new Error("Failed to fetch data");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchData();
  }, []);

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
    console.log("UniqueXXXXXXXXXX", requestData);
    try {
      const apiResponse = await dynamicDropDownFieldsData(requestData);
      if (!apiResponse.success) {
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

  const addEditController = async (data, isCopy, isView) => {
    // FormData
    // Check if data and index are valid before navigating
    const queryString = encryptUrlFun({
      id: data._id || data.id,
      menuName: search,
      isCopy: isCopy || false,
      isView: isView || false,
    });

    const addPageQueryString = encryptUrlFun({
      id: search,
      menuName: JSON.parse(searchParams.get("menuName")).menuName,
      parentMenuId: JSON.parse(searchParams.get("menuName")).parentMenuId,
    });

    if (data !== "add") {
      try {
        console.log(formControlData, "formControlData");
        if (
          formControlData.functionOnEdit &&
          formControlData.functionOnEdit !== null
        ) {
          // formControlData?.functionOnEdit.split(";").forEach((e) => onEditAndDeleteFunctionCall(e, data))
          for (const func of formControlData?.functionOnEdit.split(";")) {
            let updatedData = onEditAndDeleteFunctionCall(
              func,
              data,
              formControlData,
              data
            );
            if (updatedData.alertShow == true) {
              setParaText(updatedData.message);
              setIsError(true);
              setOpenModal((prev) => !prev);
              // setTypeofModal("onCheck");
              return;
            }
          }
        }
        // onEditFunctionCall("DemoValidation()",data)
      } catch (error) {
        return toast.error(error.message);
      }
      const { clientId } = getUserDetails();
      const apiResponse = await masterTableInfo({
        clientID: parseInt(clientId),
        recordID: parseInt(data.id),
        menuID: parseInt(search),
      });
      console.log("apiResponse", apiResponse);

      if (apiResponse.success == false) {
        return toast.error(apiResponse.message, {
          autoClose: 1000,
        });
      }
      router.push(`/formControl/addEdit//${queryString}`);
    } else if (data === "add") {
      router.push(`/formControl/search/${addPageQueryString}`);
    } else {
      console.error("Invalid data or index provided for navigation");
      // Handle the error or provide feedback to the user
    }
  };

  const deleteController = (data) => {
    try {
      if (
        formControlData.functionOnDelete &&
        formControlData.functionOnDelete !== null
      ) {
        formControlData?.functionOnDelete
          .split(";")
          .forEach((e) => onEditAndDeleteFunctionCall(e, data));
      }
    } catch (error) {
      return toast.error(error.message);
    }
    console.log("deleteController", data);
    const { clientId } = getUserDetails();
    setDeleteData({
      id: data.id,
      tableName,
      menuID: search,
      clientId: parseInt(clientId),
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
          setIsError(false);
          setOpenModal((prev) => !prev);
          //toast.error(responseData.message, { autoClose: 1000 });
        }
      } catch (error) {
        // Handle any API call errors
        console.error("Error in API call:", error);
        toast.error("An error occurred while processing the request");
      }
    }
  };

  // Filter fields with isRequired true for headers
  // var headers = headerFields?.filter((field) => field.isGridView);
  var headers =
    formControlData.gridConfig && typeof formControlData.gridConfig === "string"
      ? JSON.parse(formControlData.gridConfig)
      : headerFields?.filter((field) => field.isGridView);

  headers = headers?.concat(viewFields);

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
      setRowsPerPage(value);
      setTotalPages(
        Math.ceil((pageCount !== 0 ? pageCount : pageCount) / value)
      );
      console.log(
        "pageCount",
        Math.ceil((pageCount !== 0 ? pageCount : pageCount) / value)
      );
    }
  };

  useEffect(() => {
    const storedRowsPerPage = sessionStorage.getItem("rowsPerPage");
    setRowsPerPage(storedRowsPerPage ? parseInt(storedRowsPerPage) : 17);
  }, [sessionStorage.getItem("rowsPerPage"), search]);
  function pageSelected(selectedValue) {
    setSelectedPage(selectedValue);
    setPage(selectedValue);
    setSelectedPageNumber(selectedValue);
  }

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
      const formattedDate = newValue.format("YYYY-MM-DD"); // Format the date to ISO string or any format you need
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
      const formattedDate = newValue.format("YYYY-MM-DD"); // Format the date to ISO string or any format you need
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

    // const updatedItems = [...dynamic];
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
    sessionStorage.setItem("dynamic", JSON.stringify(dynamic));
    sessionStorage.setItem("advanceSearch", JSON.stringify(tempObj));
    sessionStorage.setItem("menuId", JSON.stringify(search));
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
  useEffect(() => {
    // console.log('checkMenuId', sessionStorage.getItem('menuId') == search);
    if (sessionStorage?.getItem("menuId") == search) {
      const menuId = JSON.parse(sessionStorage.getItem("advanceSearch"));
      const dynamic = JSON.parse(sessionStorage.getItem("dynamic"));
      console.log("dynamic", dynamic);
      setadvanceSearch(menuId);
      setDynamic(dynamic);
      // setIsAdvanceSearchOpen(true);
    } else {
      sessionStorage.removeItem("advanceSearch");
      sessionStorage.removeItem("menuId");
      sessionStorage.removeItem("dynamic");
      setadvanceSearch({});
      setDynamic([]);
    }
  }, [search]);

  let PaperId = null;
  if (typeof window !== "undefined") {
    // Safe to use `document` here
    PaperId = document.getElementById("paper");
    // Perform operations with `element`
  }

  // This function will handle the scroll event, State to hold the current scroll position

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
  }, [PaperId]);

  useEffect(() => {
    const getIdFromGrid = gridData.map((item) => item.id);
    async function bgColorSetByOperator() {
      const result = await operatorFunc(search, getIdFromGrid, tableName);
      setOperatorsBg(result);
    }
    bgColorSetByOperator();
  }, [gridData, tableName]);

  function handleInitailSearch() {
    fetchData();
    setSearchOpen(false);
  }

  const handleInputChange = (index, newInputValue, dropPageNo) => {
    handleHeaderChange(index, newValueState, dropPageNo, newInputValue);
  };

  const showLabel = false;
  let callInputChangeFunc = true;
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
        backgroundColor: "var(--inputBorderColor)", // Background color on hover
        color: "var(--inputBg)",
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
      // backgroundColor: isDisabled ? "white" : "white",
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
      // color: "#00000099",
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
      // color: "#FFFFFF",
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
    }, []);
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

      {/* ========================================================= */}
      {/* ✅ MOBILE/TAB ONLY ( < lg )  -> updated layout (no overlap) */}
      {/* ✅ DESKTOP/WEB ONLY ( >= lg ) -> KEEP YOUR OLD UI AS-IS     */}
      {/* ========================================================= */}

      {!isLgUp ? (
        <>
          {/* ✅ Mobile/Tab toolbar (2nd row) - right aligned, no overlap */}
          <div className="mt-2 mb-3 flex justify-end">
            <div className="flex justify-between h-[30px] border border-gray-100 rounded-[10px] shadow-md px-1">
              <Stack direction="row">
                {isAddVisible && (
                  <LightTooltip title="Add Form">
                    <Button
                      onMouseEnter={() => setHoveredIcon("addForm")}
                      onMouseLeave={() => setHoveredIcon(null)}
                      onClick={() => validateAdd(tableName)}
                      sx={{ minWidth: 0, padding: "2px 6px" }}
                    >
                      <Image
                        src={
                          hoveredIcon === "addForm"
                            ? addDocIconHover
                            : addDocIcon
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
                    sx={{ minWidth: 0, padding: "2px 6px" }}
                  >
                    <Image
                      src={
                        hoveredIcon === "shareForm" ? ShareIconHover : shareIcon
                      }
                      alt="Share Icon"
                      priority={false}
                      className="cursor-pointer gridIcons2"
                    />
                  </Button>
                </LightTooltip>

                <LightTooltip title="Advanced Search">
                  <Button
                    onClick={() => setSearchOpen(!searchOpen)}
                    onMouseEnter={() => setHoveredIcon("advanceSearch")}
                    onMouseLeave={() => setHoveredIcon(null)}
                    sx={{ minWidth: 0, padding: "2px 6px" }}
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

          {/* ✅ Mobile/Tab Search Modal (normal flow, NOT absolute, so no overlap) */}
          {searchOpen && (
            <Paper
              className={`z-50 ${styles.searchDispalyBg} border border-[#B2BAC2] rounded-[10px] shadow-md w-full`}
              sx={{ height: "auto" }}
            >
              <div className="mx-[12px]">
                <div className="flex items-center relative mt-[8px]">
                  <Paper sx={{ ...advanceSearchPaperStyles, width: "100%" }}>
                    <InputBase
                      autoFocus={true}
                      autoComplete="off"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search..."
                      inputProps={{ "aria-label": "search..." }}
                      sx={{ ...searchInputStyling, width: "100%" }}
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
                  className={`${styles.txtColorDark} mt-[8px] block text-[12px]`}
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
                          key={index}
                          className="mt-[8px] my-3 flex flex-col gap-2"
                        >
                          {/* ✅ First Select full width */}
                          <Select
                            menuPortalTarget={document.body}
                            backspaceRemovesValue={true}
                            isClearable={true}
                            styles={customStyles}
                            options={dropHeaderOptions}
                            className={`w-full ${styles.inputField}`}
                            value={
                              initialHeaderFields?.find(
                                (option) => option.label === elem.value?.label
                              ) || null
                            }
                            noOptionsMessage={() => "No records found"}
                            onMenuOpen={() => setScrollPosition(0)}
                            onChange={(newValue) => {
                              callInputChangeFunc = false;
                              if (newValue) {
                                handleHeaderChange(
                                  index,
                                  newValue,
                                  dropPageNo,
                                  ""
                                );
                              } else {
                                handleRevert(index, elem);
                              }
                              callInputChangeFunc = true;
                            }}
                          />

                          {/* ✅ Second control full width */}
                          {elem.isDropDown == true && (
                            <Select
                              className={`w-full ${styles.advanceFilterInputs}`}
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
                              onMenuOpen={() => setDropPageNo(1)}
                              onMenuClose={() => setDropPageNo(1)}
                              onFocus={() => setDropPageNo(1)}
                              onChange={(newValue) =>
                                setValues(index, newValue?.value)
                              }
                              onBlur={() => setDropPageNo(1)}
                              onInputChange={(value, e) => {
                                if (
                                  callInputChangeFunc &&
                                  e.action === "input-change"
                                ) {
                                  handleInputChange(index, value, dropPageNo);
                                }
                              }}
                            />
                          )}

                          {/* ✅ Action icons row in mobile (NOT absolute) */}
                          <div className="flex justify-end gap-3 items-center">
                            {isAddVisible && (
                              <GridHoverIcon
                                defaultIcon={addLogo}
                                hoverIcon={plusIconHover}
                                altText="Add"
                                title={"Add"}
                                onClick={() => handleAdd()}
                              />
                            )}

                            <GridHoverIcon
                              defaultIcon={DeleteIcon2}
                              hoverIcon={DeleteHover}
                              altText="Delete"
                              title={"Delete"}
                              onClick={() => {
                                dynamic.length > 1 && handleDelete(index);
                              }}
                            />

                            <GridHoverIcon
                              defaultIcon={refreshIcon}
                              hoverIcon={revertHover}
                              title={"Revert"}
                              altText={"Revert"}
                              onClick={() => handleRevert(index, elem)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                <div className="flex gap-3 mt-1 pb-2">
                  <button
                    className={`my-[6px] ${styles.commonBtn}`}
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                  <button
                    className={`my-[6px] ${styles.commonBtn}`}
                    onClick={handleRemoveSearch}
                  >
                    Remove filter
                  </button>
                </div>
              </div>
            </Paper>
          )}
        </>
      ) : (
        <>
          {/* ✅ DESKTOP/WEB: KEEP YOUR OLD DESIGN AS IT IS (paste your original block here) */}
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
                          hoveredIcon === "addForm"
                            ? addDocIconHover
                            : addDocIcon
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
                      src={
                        hoveredIcon === "shareForm" ? ShareIconHover : shareIcon
                      }
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

          {/* ✅ DESKTOP: keep your existing absolute modal exactly same */}
          {searchOpen && (
            <Paper
              className={`absolute top-[8%] right-0 z-50 ${styles.searchDispalyBg} border border-[#B2BAC2]  rounded-[7px] shadow-md`}
              sx={{ width: "90%", height: "auto" }}
            >
              <div className="mx-[14px] sm:mx-[20px]">
                <div className="flex items-center relative mt-[10px]">
                  <Paper sx={{ ...advanceSearchPaperStyles, width: "100%" }}>
                    <InputBase
                      autoFocus={true}
                      autoComplete="off"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Search..."
                      inputProps={{ "aria-label": "search..." }}
                      sx={{ ...searchInputStyling, width: "100%" }}
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
                  className={`${styles.txtColorDark} mt-[8px] block text-[12px]`}
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
                          className="
                    my-3 mt-[10px]
                    flex flex-col gap-2
                    lg:relative lg:flex-row lg:items-center lg:gap-10
                  "
                          key={index}
                        >
                          {/* ✅ Header Select */}
                          <Select
                            key={index}
                            menuPortalTarget={document.body}
                            backspaceRemovesValue={true}
                            isClearable={true}
                            styles={customStyles}
                            options={dropHeaderOptions}
                            className={`w-full lg:w-[12rem] ${styles.inputField}`}
                            value={
                              initialHeaderFields?.find(
                                (option) => option.label === elem.value?.label
                              ) || null
                            }
                            noOptionsMessage={() => "No records found"}
                            onMenuOpen={() => setScrollPosition(0)}
                            onChange={(newValue) => {
                              callInputChangeFunc = false;
                              if (newValue) {
                                handleHeaderChange(
                                  index,
                                  newValue,
                                  dropPageNo,
                                  ""
                                );
                              } else {
                                handleRevert(index, elem);
                              }
                              callInputChangeFunc = true;
                            }}
                          />

                          {/* ✅ dropdown / input blocks stay same */}
                          {elem.isDropDown == true && (
                            <Select
                              key={index}
                              className={`w-full lg:flex-1 ${styles.advanceFilterInputs}`}
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
                              onMenuOpen={() => setDropPageNo(1)}
                              onMenuClose={() => setDropPageNo(1)}
                              onFocus={() => setDropPageNo(1)}
                              onChange={(newValue) =>
                                setValues(index, newValue?.value)
                              }
                              onBlur={() => setDropPageNo(1)}
                              onInputChange={(value, e) => {
                                if (
                                  callInputChangeFunc &&
                                  e.action === "input-change"
                                ) {
                                  handleInputChange(index, value, dropPageNo);
                                }
                              }}
                            />
                          )}

                          {/* ✅ Action icons:
                      - Mobile/Tab: stays in flow (below)
                      - Desktop: right aligned inside row */}
                          <div className="flex justify-end gap-3 items-center lg:absolute lg:right-2 lg:top-1/2 lg:-translate-y-1/2">
                            {isAddVisible && (
                              <GridHoverIcon
                                defaultIcon={addLogo}
                                hoverIcon={plusIconHover}
                                altText="Add"
                                title={"Add"}
                                onClick={() => handleAdd()}
                              />
                            )}

                            <GridHoverIcon
                              defaultIcon={DeleteIcon2}
                              hoverIcon={DeleteHover}
                              altText="Delete"
                              title={"Delete"}
                              onClick={() => {
                                dynamic.length > 1 && handleDelete(index);
                              }}
                            />

                            <GridHoverIcon
                              defaultIcon={refreshIcon}
                              hoverIcon={revertHover}
                              title={"Revert"}
                              altText={"Revert"}
                              onClick={() => handleRevert(index, elem)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 pb-3">
                  <button
                    className={`my-[6px] ${styles.commonBtn} w-full sm:w-auto`}
                    onClick={handleSearch}
                  >
                    Search
                  </button>
                  <button
                    className={`my-[6px] ${styles.commonBtn} w-full sm:w-auto`}
                    onClick={handleRemoveSearch}
                  >
                    Remove filter
                  </button>
                </div>
              </div>
            </Paper>
          )}
        </>
      )}

      {tableheading?.length > 0 ? (
        <>
          {/* ========================================================= */}
          {/* ✅ SMALL DEVICES (mobile + tab)  < 1024px */}
          {/* ========================================================= */}

          {!isLgUp && (
            <div
              className={`${styles.pageBackground} flex flex-col flex-1 min-h-0`}
              style={{
                height: "calc(100dvh - 140px)",
                maxHeight: "calc(100dvh - 140px)",
                overflow: "hidden",
              }}
            >
              {/* Scroll area */}
              <div
                className={`flex-1 min-h-0 overflow-y-auto ${styles.thinScrollBar}`}
                style={{
                  WebkitOverflowScrolling: "touch",
                  padding: 8,
                  paddingBottom: 78,
                }}
                // ✅ close ONLY when clicking empty area, not icons/tray
                onPointerDown={(e) => {
                  // if there is an open swipe, and user taps outside any tray/button => close
                  if (!swipeOpenId) return;

                  const tag = (e.target?.tagName || "").toLowerCase();
                  if (
                    tag === "button" ||
                    tag === "img" ||
                    tag === "svg" ||
                    tag === "path"
                  )
                    return;

                  // ✅ If tap happens inside an action tray, don’t close
                  if (e.target?.closest?.("[data-swipe-tray='1']")) return;

                  closeSwipe(swipeOpenId);
                }}
              >
                {gridData?.length > 0 ? (
                  <div className="space-y-2">
                    {gridData.map((row, rowIndex) => {
                      const isExpanded = !!expandedRows?.[row?.id];

                      const getValue = (field) => {
                        if (!field?.id) return "";
                        if (field?.isDummy) {
                          return field?.dummyField === "comma"
                            ? getCommaSeparatedValuesCountFromNestedKeys(
                                row?.[field?.id],
                                field?.refkey
                              )?.values
                            : getCommaSeparatedValuesCountFromNestedKeys(
                                row?.[field?.id],
                                field?.refkey
                              )?.count;
                        }
                        if (
                          typeof row?.[field?.id] === "object" &&
                          row?.[field?.id] !== null
                        ) {
                          return getNestedValue(
                            row?.[field?.id],
                            field?.refkey
                          );
                        }
                        return isDateFormat(row?.[field?.id]);
                      };

                      // Header fields
                      const titleField = tableheading?.[0];
                      const subField = tableheading?.[1];
                      const titleValue = getValue(titleField) || "—";
                      const subValue = getValue(subField) || "";

                      const compactFields = (tableheading || [])
                        .filter(
                          (f) =>
                            f?.id &&
                            f?.id !== titleField?.id &&
                            f?.id !== subField?.id
                        )
                        .slice(0, 4);

                      const expandedFields = (tableheading || []).filter(
                        (f) => {
                          if (!f?.id) return false;
                          if (f.id === titleField?.id || f.id === subField?.id)
                            return false;
                          if (compactFields.some((cf) => cf?.id === f.id))
                            return false;
                          return true;
                        }
                      );

                      const translateX =
                        dragX?.[row?.id] ??
                        (swipeOpenId === row?.id ? -SWIPE_REVEAL_PX : 0);

                      const trayVisible =
                        swipeOpenId === row?.id || Math.abs(translateX) > 2;

                      return (
                        <Paper
                          key={row?.id ?? rowIndex}
                          className={`${styles.pageBackground}`}
                          sx={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            border: "1px solid rgba(148,163,184,0.18)",
                            background: "rgba(255,255,255,0.04)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            boxShadow: "0 6px 16px rgba(2,6,23,0.08)",
                            position: "relative",
                          }}
                        >
                          {/* ✅ SWIPE WRAP */}
                          <div
                            style={{
                              position: "relative",
                              overflow: "hidden",
                              touchAction: "pan-y",
                            }}
                            onPointerDown={(e) => onSwipeStart(row?.id, e)}
                            onPointerMove={onSwipeMove}
                            onPointerUp={onSwipeEnd}
                            onPointerCancel={onSwipeEnd}
                            onTouchStart={(e) => onSwipeStart(row?.id, e)}
                            onTouchMove={onSwipeMove}
                            onTouchEnd={onSwipeEnd}
                          >
                            {/* ✅ TRAY (behind) */}
                            <div
                              data-swipe-tray="1"
                              style={{
                                position: "absolute",
                                top: 0,
                                right: 0,
                                bottom: 0,
                                width: SWIPE_REVEAL_PX,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: 6,

                                opacity: trayVisible ? 1 : 0,
                                transform: trayVisible
                                  ? "translateX(0)"
                                  : "translateX(10px)",
                                transition:
                                  draggingId === row?.id
                                    ? "none"
                                    : "opacity 180ms ease, transform 180ms ease",
                                pointerEvents: trayVisible ? "auto" : "none",

                                background:
                                  "linear-gradient(180deg, rgba(2,6,23,0.10) 0%, rgba(2,6,23,0.18) 100%)",
                                borderLeft: "1px solid rgba(148,163,184,0.12)",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",
                                zIndex: 0,
                              }}
                              // ✅ IMPORTANT: do not let tray clicks bubble to list close handler
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex flex-col items-center gap-2">
                                {isEditVisible && (
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <GridHoverIcon
                                      defaultIcon={edit}
                                      hoverIcon={EditHover}
                                      altText="Edit"
                                      title={"Edit"}
                                      onClick={async () =>
                                        validateEdit(tableName, row)
                                      }
                                    />
                                  </div>
                                )}

                                {isViewVisible && (
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <GridHoverIcon
                                      defaultIcon={viewIcon}
                                      hoverIcon={viewIconHover}
                                      altText={"view"}
                                      title={"view"}
                                      onClick={() =>
                                        addEditController(row, false, true)
                                      }
                                    />
                                  </div>
                                )}

                                {isCopyVisible && (
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <GridHoverIcon
                                      defaultIcon={copyDoc}
                                      hoverIcon={CopyHover}
                                      altText="Copy"
                                      title={"Copy Record"}
                                      onClick={() =>
                                        addEditController(row, true)
                                      }
                                    />
                                  </div>
                                )}

                                {isPrintVisible && (
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <GridHoverIcon
                                      defaultIcon={printer}
                                      hoverIcon={PrintHover}
                                      altText="Print"
                                      title={"Print"}
                                      onClick={async () => {
                                        handlePrint(row);
                                        setModalVisible(true);
                                      }}
                                    />
                                  </div>
                                )}

                                {isDeleteVisible && (
                                  <div onClick={(e) => e.stopPropagation()}>
                                    <GridHoverIcon
                                      defaultIcon={DeleteIcon2}
                                      hoverIcon={DeleteHover}
                                      altText="Delete"
                                      title="Delete Record"
                                      onClick={() => deleteController(row)}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* ✅ FRONT (slides) */}
                            <div
                              style={{
                                width: "100%",
                                background: "rgba(255,255,255,0.04)",
                                backdropFilter: "blur(10px)",
                                WebkitBackdropFilter: "blur(10px)",

                                transform: `translateX(${translateX}px)`,
                                transition:
                                  draggingId === row?.id
                                    ? "none"
                                    : "transform 260ms cubic-bezier(0.22,1,0.36,1)",
                                willChange: "transform",
                                zIndex: 1,
                              }}
                              // ✅ prevent list close when tapping card content
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Accent */}
                              <div
                                style={{
                                  height: 1.5,
                                  background:
                                    "linear-gradient(90deg, rgba(14,165,233,0.55) 0%, rgba(99,102,241,0.52) 50%, rgba(236,72,153,0.45) 100%)",
                                }}
                              />

                              {/* Header */}
                              <div
                                style={{
                                  padding: "8px 8px 6px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 8,
                                }}
                              >
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <div
                                    className={`${styles.txtColorDark}`}
                                    style={{
                                      fontSize: 12.5,
                                      fontWeight: 900,
                                      lineHeight: "15px",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      letterSpacing: "0.15px",
                                    }}
                                    title={String(titleValue || "")}
                                  >
                                    {titleValue}
                                  </div>

                                  {!!subValue && (
                                    <div
                                      className={`${styles.txtColorDark}`}
                                      style={{
                                        marginTop: 2,
                                        fontSize: 10,
                                        fontWeight: 700,
                                        opacity: 0.62,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                      title={String(subValue || "")}
                                    >
                                      {subValue}
                                    </div>
                                  )}
                                </div>

                                {/* Expand icon */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedRows((prev) => ({
                                      ...(prev || {}),
                                      [row?.id]: !prev?.[row?.id],
                                    }))
                                  }
                                  className="active:scale-[0.98] transition"
                                  style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 10,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: "1px solid rgba(148,163,184,0.14)",
                                    background: "rgba(255,255,255,0.05)",
                                    boxShadow:
                                      "inset 0 1px 0 rgba(255,255,255,0.08)",
                                    flexShrink: 0,
                                  }}
                                  aria-label={
                                    isExpanded ? "Collapse" : "Expand"
                                  }
                                  title={isExpanded ? "Collapse" : "Expand"}
                                >
                                  <span
                                    className={`${styles.txtColorDark}`}
                                    style={{
                                      fontSize: 14,
                                      fontWeight: 900,
                                      opacity: 0.85,
                                      transform: isExpanded
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                      transition: "transform 200ms ease",
                                      lineHeight: 1,
                                    }}
                                  >
                                    ▾
                                  </span>
                                </button>
                              </div>

                              {/* Divider */}
                              <div
                                style={{
                                  borderTop: "1px solid rgba(148,163,184,0.10)",
                                }}
                              />

                              {/* Body */}
                              <div style={{ padding: 6 }}>
                                {/* Compact fields */}
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 6,
                                  }}
                                >
                                  {compactFields.map((field, i) => (
                                    <div
                                      key={field?.id ?? i}
                                      style={{
                                        minWidth: 0,
                                        padding: "4px 2px",
                                      }}
                                    >
                                      <div
                                        className={`${styles.txtColorDark}`}
                                        style={{
                                          fontSize: 9,
                                          fontWeight: 800,
                                          opacity: 0.55,
                                          letterSpacing: "0.2px",
                                          textTransform: "uppercase",
                                          whiteSpace: "nowrap",
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                        }}
                                        title={field?.label}
                                      >
                                        {field?.label}
                                      </div>
                                      <div
                                        className={`${styles.txtColorDark}`}
                                        style={{
                                          marginTop: 2,
                                          fontSize: 11,
                                          fontWeight: 850,
                                          lineHeight: "14px",
                                          wordBreak: "break-word",
                                          opacity: 0.95,
                                        }}
                                      >
                                        {getValue(field) ?? ""}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Animated Expanded Section */}
                                <div
                                  style={{
                                    marginTop: 8,
                                    overflow: "hidden",
                                    maxHeight: isExpanded ? 520 : 0,
                                    opacity: isExpanded ? 1 : 0,
                                    transform: isExpanded
                                      ? "translateY(0px)"
                                      : "translateY(-4px)",
                                    transition:
                                      "max-height 320ms ease, opacity 220ms ease, transform 220ms ease",
                                  }}
                                >
                                  <div
                                    style={{
                                      borderRadius: 12,
                                      border:
                                        "1px solid rgba(148,163,184,0.10)",
                                      background: "rgba(255,255,255,0.03)",
                                      padding: 6,
                                    }}
                                  >
                                    <div className="space-y-1.5">
                                      {expandedFields.map((field, i) => (
                                        <div
                                          key={field?.id ?? i}
                                          style={{
                                            display: "flex",
                                            gap: 8,
                                            alignItems: "flex-start",
                                            padding: "6px 7px",
                                            borderRadius: 10,
                                            border:
                                              "1px solid rgba(148,163,184,0.08)",
                                            background:
                                              "rgba(255,255,255,0.04)",
                                          }}
                                        >
                                          <div
                                            className={`${styles.txtColorDark}`}
                                            style={{
                                              minWidth:
                                                "clamp(78px, 32vw, 130px)",
                                              fontSize: 9.5,
                                              fontWeight: 800,
                                              opacity: 0.55,
                                              letterSpacing: "0.2px",
                                              textTransform: "uppercase",
                                            }}
                                          >
                                            {field?.label}
                                          </div>
                                          <div
                                            className={`${styles.txtColorDark}`}
                                            style={{
                                              fontSize: 11,
                                              fontWeight: 800,
                                              opacity: 0.95,
                                              lineHeight: "14px",
                                              wordBreak: "break-word",
                                              flex: 1,
                                            }}
                                          >
                                            {getValue(field) ?? ""}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Paper>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className={`${styles.pageBackground} flex items-center justify-center`}
                    style={{ minHeight: "100%" }}
                  >
                    <div className="container mx-auto text-center">
                      {loader ? (
                        <p className="text-gray-500 text-lg mt-4">Loading...</p>
                      ) : (
                        <p className="text-gray-500 text-lg mt-4">
                          No Records Found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Footer pagination sticky (side-by-side only, no overlap) */}
              <div
                className={`flex items-center ${styles.txtColorDark} ${styles.pageBackground}`}
                style={{
                  flexShrink: 0,
                  position: "sticky",
                  bottom: 0,
                  zIndex: 100,
                  minWidth: 0,

                  // ✅ premium glass footer
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 100%)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",

                  // ✅ subtle border + glow
                  borderTop: "1px solid rgba(148,163,184,0.18)",
                  boxShadow: "0 -10px 24px rgba(2,6,23,0.12)",

                  paddingBottom: "calc(env(safe-area-inset-bottom) + 8px)",
                  paddingLeft: 12,
                  paddingRight: 86, // ✅ keep space for floating button
                  paddingTop: 10,

                  gap: 12,
                }}
              >
                {/* ✅ small top highlight line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 1,
                    background:
                      "linear-gradient(90deg, rgba(14,165,233,0.45) 0%, rgba(99,102,241,0.38) 50%, rgba(236,72,153,0.32) 100%)",
                    opacity: 0.9,
                  }}
                />

                {/* LEFT: pagination (scrolls horizontally if needed) */}
                <div
                  style={{
                    flex: "1 1 auto",
                    minWidth: 0,
                    overflowX: "auto",
                    overflowY: "hidden",
                    WebkitOverflowScrolling: "touch",
                    paddingBottom: 2,
                    paddingTop: 2,
                  }}
                  className={styles.thinScrollBar}
                >
                  <div
                    style={{ display: "inline-flex", minWidth: "max-content" }}
                  >
                    <PaginationButtons
                      totalPages={totalPages}
                      pageSelected={pageSelected}
                      selectedPageNumber={selectedPageNumber}
                    />
                  </div>
                </div>

                {/* RIGHT: rowsPerPage + page text */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flex: "0 0 auto",
                    whiteSpace: "nowrap",
                  }}
                >
                  {/* ✅ premium pill input */}
                  <input
                    type="number"
                    value={rowsPerPage}
                    onChange={handleCustomRowsPerPageChange}
                    className={`${styles.txtColorDark}`}
                    style={{
                      height: 22,
                      width: 56,
                      fontSize: 10,
                      padding: "0 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.24)",
                      background: "rgba(255,255,255,0.07)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
                      outline: "none",
                    }}
                  />

                  {/* ✅ premium chip text */}
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: 999,
                      border: "1px solid rgba(148,163,184,0.18)",
                      background: "rgba(255,255,255,0.06)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10)",
                      opacity: 0.95,
                    }}
                    className={styles.txtColorDark}
                  >
                    {selectedPage} / {totalPages}
                    <span
                      style={{ opacity: 0.6, fontWeight: 700, marginLeft: 6 }}
                    >
                      pages
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ✅ BIG DEVICES (laptop/desktop and above) >= 1024px */}
          {/* ========================================================= */}
          {isLgUp && (
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
                                    setColumnSearchKeyName={
                                      setColumnSearchKeyName
                                    }
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
                            <span className="ml-1">
                              {renderSortIcon(elem.id)}
                            </span>
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
                                    <TableCell
                                      key={index}
                                      align="left"
                                    ></TableCell>
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
                                      onClick={() =>
                                        addEditController(row, true)
                                      }
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
                                      //validateEditPrint(tableName, row)
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
                        tableName={tableName}
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
          )}
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
      {/* my models  */}

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
