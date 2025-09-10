/* eslint-disable no-unused-vars */

"use client";
import React, { useState, useEffect, useRef } from "react";
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

import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import {
  formControlListing,
  formControlMenuList,
  deleteFormControlRecord,
  copyFormControl,
} from "@/services/auth/FormControl.services.js";
import {
  addDocIcon,
  edit,
  shareIcon,
  DeleteIcon2,
  copyDoc,
  CopyHover,
  DeleteHover,
  EditHover,
  addDocIconHover,
  ShareIconHover,
} from "@/assets/index.jsx";
import LightTooltip from "@/components/Tooltip/customToolTip";
import CustomeBreadCrumb from "@/components/BreadCrumbs/breadCrumb.jsx";
import CustomeModal from "@/components/Modal/customModal.jsx";
import IconButton from "@mui/material/IconButton";
import { toast } from "react-toastify";
import PaginationButtons from "@/components/Pagination/index.jsx";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CopyFormControl from "@/components/Modal/copyFormControl";
import PropTypes from "prop-types";
import {
  displaytableHeadStyles,
  // displaytableRowStyles,
  fontFamilyStyles,
  displayTableContainerStyles,
  searchInputStyling,
  createAddEditPaperStyles,
  displayTablePaperStyles,
  pageTableCellInlineStyle,
  displaytableRowStyles_two,
} from "@/app/globalCss";
import { useTableNavigation } from "@/utils";
// import { set } from "lodash";

export default function StickyHeadTable() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(17);
  const [gridData, setGridData] = useState([]);
  const [headerFields, setHeaderFields] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [deleteData, setDeleteData] = useState(null);
  const [isError, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [selectedPage, setSelectedPage] = useState("1");
  const [totalPages, setTotalPages] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [loader, setLoader] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);
  const [isInputVisible, setInputVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [prevSearchInput, setPrevSearchInput] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [columnSearchKeyName, setColumnSearchKeyName] = useState("");
  const [columnSearchKeyValue, setColumnSearchKeyValue] = useState("");
  const [sortData, setSortData] = useState({
    label: "",
    order: "",
  });
  const [isNewSearch, setIsNewSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedPageNumber, setSelectedPageNumber] = useState(1); // setSelectedPageNumber
  const tableRef = useRef(null);
  const { moveToRow, setMoveToRow } = useTableNavigation(tableRef, gridData);
  const [copyModalShow, setcopyModalShow] = useState(false);
  const [copyData, setCopyData] = useState({});

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
    try {
      setLoader(true);
      let tableHeadingsData = [];
      if (!dataFetched) {
        // Call api for table grid data
        tableHeadingsData = await formControlMenuList("CreateFormcontrol");
        setDataFetched(true);
        if (tableHeadingsData.data?.length > 0) {
          setHeaderFields(tableHeadingsData.data[0].fields);
          let requestData = {
            pageNo: page,
            label: sortData.label,
            order: sortData.order,
            limit: rowsPerPage,
          };
          const tableData = await formControlListing(requestData);
          if (tableData) {
            const { Count, data } = tableData;
            setGridData(data);
            setTotalPages(
              Math.ceil((Count !== 0 ? Count : pageCount) / rowsPerPage)
            );
            if (Count !== 0) {
              setPageCount(Count);
            }
          }
        } else {
          setParaText(tableHeadingsData.message);
          setIsError(true);
          setOpenModal((prev) => !prev);
        }
      } else {
        let requestData = {
          pageNo: calculatePageNo(),
          limit: rowsPerPage,
          label: sortData.label,
          order: sortData.order,
          keyName: columnSearchKeyName,
          keyValue: columnSearchKeyValue,
        };

        const tableData = await formControlListing(requestData);
        if (tableData) {
          const { Count, data } = tableData;
          setGridData(data);
          setTotalPages(
            Math.ceil((Count !== 0 ? Count : pageCount) / rowsPerPage)
          );
          if (Count !== 0) {
            setPageCount(Count);
          }
          pageSelected(requestData.pageNo);
        } else {
          setGridData([]);
          setLoader(false);
        }
      }
    } finally {
      setLoader(false);
    }
  }

  React.useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, columnSearchKeyName, columnSearchKeyValue, sortData]);

  const addEditController = (data, isCopy) => {
    // Check if data and index are valid before navigating
    const queryString = encodeURIComponent(
      JSON.stringify({ id: data.id, isCopy: isCopy || false })
    );
    // Check if data and index are valid before navigating
    if (data !== "add") {
      router.push(`/createFormControl/addEdit/${queryString}`);
    } else if (data === "add") {
      router.push(`/createFormControl/addEdit`);
    } else {
      console.error("Invalid data or index provided for navigation");
      // Handle the error or provide feedback to the user
    }
  };

  const deleteController = (data) => {
    setDeleteData({
      id: data.id,
      tableName: data.tableName,
      menuID: data.menuID,
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
      const payloadData = { status: 2, routeName: "FormRoute", ...deleteData };
      try {
        const responseData = await deleteFormControlRecord(payloadData);
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
  const headers = headerFields.filter((field) => field.isGridView);
  // Create table columns based on headers
  const tableheading = headers.map((header) => ({
    id: header.fieldname,
    label: header.yourlabel,
    refkey: header.keyToShowOnGrid,
    isDummy: header.isDummy,
    dummyField: header.isCommaSeparatedOrCount,
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
      setRowsPerPage(value);
      setSelectedPageNumber(page);
    }
  };

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

  const HandleCopyFormControl = async () => {
    let submit = await copyFormControl(copyData);
    if (submit.success == true) {
      setCopyData({});
      toast.success(submit.message);
      setcopyModalShow(false);
    } else {
      toast.error(submit.message);
    }
  };

  const [scrollLeft, setScrollLeft] = useState(0);

  // const PaperId = document.getElementById("paper2");
  let PaperId = null;
  if (typeof window !== "undefined") {
    PaperId = document.getElementById("paper2");
  }
  React.useEffect(() => {
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

  return (
    <div>
      <CustomeBreadCrumb />

      <div className="flex mb-3  justify-end  ">
        <div className="flex justify-between h-[27px]  border border-gray-100 rounded-[7px] shadow-md">
          <Stack spacing={0} direction="row">
            <LightTooltip title="Add Form">
              <Button
                onMouseEnter={() => setHoveredIcon("addForm")}
                onMouseLeave={() => setHoveredIcon(null)}
                onClick={() => addEditController("add")}
              >
                <Image
                  src={hoveredIcon === "addForm" ? addDocIconHover : addDocIcon}
                  alt="Add Icon"
                  priority={false}
                  className="cursor-pointer gridIcons2"
                />
              </Button>
            </LightTooltip>

            <LightTooltip title="share Form">
              <Button
                onMouseEnter={() => setHoveredIcon("shareForm")}
                onMouseLeave={() => setHoveredIcon(null)}
                onClick={() => setcopyModalShow((prev) => !prev)}
              >
                <Image
                  src={hoveredIcon === "shareForm" ? ShareIconHover : shareIcon}
                  alt="Share Icon"
                  priority={false}
                  className="cursor-pointer gridIcons2 "
                />
              </Button>
            </LightTooltip>
            {/* <LightTooltip title="Advance Search">
              <Button
                onMouseEnter={() => setHoveredIcon("advanceSearch")}
                onMouseLeave={() => setHoveredIcon(null)}
              >
                <Image
                  src={
                    hoveredIcon === "advanceSearch"
                      ? magnifyIconHover
                      : magnifyIcon
                  }
                  alt="Search Icon"
                  priority={false}
                  className="cursor-pointer gridIcons2"
                />
              </Button>
            </LightTooltip> */}
          </Stack>
        </div>
      </div>
      {/* <CopyFormControl showModal={copyModalShow} handleClose={() => setcopyModalShow(prev => !prev)} data={copyData} onchange={(e) => { setCopyData((prev) => ({ ...prev, [e.target.name]: e.target.value })) }} handleSend={HandleCopyFormControl} /> */}

      {tableheading.length ? (
        <>
          <Paper
            sx={{
              ...displayTablePaperStyles,
              // height: "calc(100vh - 120px) !important",
            }}
          >
            <TableContainer
              id="paper2"
              className={` ${styles.thinScrollBar} overflow-auto`}
              sx={{
                ...displayTableContainerStyles,
                position: "relative !important",
              }}
              ref={tableRef}
            >
              <Table
                stickyHeader
                aria-label="sticky table"
                className={` overflow-auto  ${styles.hideScrollbar} ${styles.thinScrollBar}`}
              >
                {/* Table Heading */}
                <TableHead
                  sx={{
                    ...displaytableHeadStyles,
                  }}
                >
                  <TableRow style={{ cursor: "context-menu" }}>
                    {tableheading.map((elem) => (
                      <TableCell
                        key={elem.id}
                        align={elem.align}
                        style={{ minWidth: elem.minWidth }}
                        className={`${styles.cellHeading} cursor-pointer`}
                        onContextMenu={(event) =>
                          handleRightClick(event, elem.id)
                        } // Add the right-click handler here
                      >
                        <span
                          className={`${styles.labelText}`}
                          onClick={() => handleSortBy(elem)}
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
                                setRowsPerPage={setRowsPerPage}
                                setPage={setPage}
                                setSearchInput={setSearchInput}
                                setIsNewSearch={setIsNewSearch}
                              />
                            )}
                        </span>
                        <span className="ml-1">{renderSortIcon(elem.id)}</span>
                      </TableCell>
                    ))}
                    <TableCell
                      key={"action"}
                      align="left"
                      width={"18%"}
                    ></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody style={{ overflow: "auto", marginTop: "30px" }}>
                  {gridData?.length > 0 &&
                    gridData?.map((row, rowIndex) => (
                      <TableRow
                        role="checkbox"
                        tabIndex={-1}
                        key={rowIndex}
                        className={`${styles.tableCellHoverEffect} ${styles.hh} ${styles.tableRowHover}  rounded-lg  m-5 `}
                        sx={{
                          ...displaytableRowStyles_two(moveToRow > 0),
                          ...fontFamilyStyles,
                        }}
                        onMouseEnter={() => {
                          setMoveToRow(0);
                        }}
                        onMouseLeave={() => {
                          setMoveToRow(0);
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
                              ${index === 0 && styles.tableCellHoverEffect}  `}
                                >
                                  {typeof row[fieldName.id] === "object" &&
                                  row[fieldName.id] !== null
                                    ? getNestedValue(
                                        row[fieldName.id],
                                        fieldName.refkey
                                      )
                                    : row[fieldName.id]?.toString()}
                                </TableCell>
                              )}
                            {typeof row[fieldName.id] ===
                              ("object" || "Array") &&
                              fieldName.isDummy === true && (
                                <TableCell key={index} align="left">
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
                        {rowIndex + 1 !== moveToRow ? (
                          <>
                            <TableCell
                              className={
                                moveToRow > 0 ? "" : styles.tableCellHoverEffect
                              }
                              style={{ width: "auto" }}
                              key={rowIndex}
                            >
                              <div className="w-full">
                                <div
                                  onInvalid={"iconsRow"}
                                  className={
                                    moveToRow > 0
                                      ? ""
                                      : ` ${styles.iconContainer3} flex items-center w-full -mt-[11px]`
                                  }
                                  style={{
                                    right: `-${scrollLeft}px`,
                                    height: "20px",
                                    display: moveToRow > 0 ? "none" : "block",
                                  }}
                                >
                                  <HoverIcon
                                    defaultIcon={edit}
                                    hoverIcon={EditHover}
                                    altText="Edit"
                                    title={"Edit"}
                                    onClick={() => addEditController(row)}
                                  />
                                  <HoverIcon
                                    defaultIcon={copyDoc}
                                    hoverIcon={CopyHover}
                                    altText="Copy"
                                    title={"Copy Record"}
                                    onClick={() => addEditController(row, true)}
                                  />
                                  <HoverIcon
                                    defaultIcon={DeleteIcon2}
                                    hoverIcon={DeleteHover}
                                    altText="Delete"
                                    title={"Delete Record"}
                                    onClick={() => deleteController(row)}
                                  />
                                </div>
                              </div>
                              {/* </div> */}
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell style={{ width: "auto" }} key={rowIndex}>
                              <div className=" w-full">
                                <div
                                  id="iconsRow"
                                  // className={` ${styles.iconContainer3} flex items-center w-full -mt-[11px]`}
                                  style={pageTableCellInlineStyle(
                                    scrollLeft,
                                    rowIndex
                                  )}
                                >
                                  <HoverIcon
                                    defaultIcon={edit}
                                    hoverIcon={EditHover}
                                    altText="Edit"
                                    title={"Edit"}
                                    onClick={() => addEditController(row)}
                                  />
                                  <HoverIcon
                                    defaultIcon={copyDoc}
                                    hoverIcon={CopyHover}
                                    altText="Copy"
                                    title={"Copy Record"}
                                    onClick={() => addEditController(row, true)}
                                  />
                                  <HoverIcon
                                    defaultIcon={DeleteIcon2}
                                    hoverIcon={DeleteHover}
                                    altText="Delete"
                                    title={"Delete Record"}
                                    onClick={() => deleteController(row)}
                                  />
                                </div>
                              </div>
                              {/* </div> */}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              {gridData.length === 0 && (
                <div className=" flex items-center justify-center h-[calc(100vh-168px)]">
                  <div className="container mx-auto text-center">
                    {!loader && (
                      <p className="text-gray-500 text-lg mt-4">
                        {"No Records Found."}
                      </p>
                    )}
                  </div>
                </div>
              )}
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
        <div className="bg-gray-100 flex items-center justify-center h-[calc(100vh-200px)]">
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
  setRowsPerPage: PropTypes.func,
  setPage: PropTypes.number,
  setSearchInput: PropTypes.func,
  setIsNewSearch: PropTypes.func,
};
function CustomizedInputBase({
  columnData,
  setPrevSearchInput,
  prevSearchInput,
  setInputVisible,
  setColumnSearchKeyName,
  setColumnSearchKeyValue,
  setRowsPerPage,
  setPage,
  setSearchInput,
  setIsNewSearch,
}) {
  const [searchInputGridData, setSearchInputGridData] = useState(
    prevSearchInput || ""
  );
  const inputRef = useRef(null); // Ref to the Paper component
  // Custom filter logic
  const filterFunction = (searchValue, columnKey) => {
    setColumnSearchKeyName(columnKey);
    setColumnSearchKeyValue(searchValue);
    setInputVisible(false);
    setPrevSearchInput(searchValue);
    setSearchInput(searchValue);
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
        setInputVisible(false);
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
