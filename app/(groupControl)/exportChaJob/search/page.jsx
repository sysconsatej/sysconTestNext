"use client";
/* eslint-disable */

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

// MUI
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import TextField from "@mui/material/TextField";

// Icons
import CloseIcon from "@mui/icons-material/Close";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

// Date
import dayjs from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Styles
import styles from "@/app/app.module.css";
import {
    searchInputStyling,
    createAddEditPaperStyles,
    advanceSearchPaperStyles,
    displaytableRowStyles_two,
    displayTableContainerStyles,
    displayTablePaperStyles,
    displaytableHeadStyles,
    pageTableCellInlineStyle,
} from "@/app/globalCss";

// Components
import LightTooltip from "@/components/Tooltip/customToolTip";
import CustomeBreadCrumb from "@/components/VoucherBreadCrumbs/breadCrumb.jsx";
import CustomeModal from "@/components/Modal/customModal.jsx";
import PaginationButtons from "@/components/Pagination/index.jsx";
import GridHoverIcon from "@/components/HoveredIcons/GridHoverIcon";

// Services / Helpers
import { fetchSearchPageData, fetchReportData } from "@/services/auth/FormControl.services.js";
import { getUserDetails } from "@/helper/userDetails";
import { isDateFormat } from "@/helper/dateFormat";

// Assets (same pattern as your Voucher search page)
import {
    searchImage,
    magnifyIcon,
    magnifyIconHover,
    closeIcon,
    crossIconHover,
    refreshIcon,
    revertHover,
    addDocIcon,
    addDocIconHover,
} from "@/assets/index.jsx";

// ✅ change if needed
const TABLE_NAME = "tblJob";

// ✅ grid columns
const JOB_GRID_CONFIG = [
    { fieldname: "jobNo", controlname: "text", yourlabel: "Job No" },
    { fieldname: "jobDate", controlname: "date", yourlabel: "Job Date" },
    { fieldname: "rateRequestId", controlname: "text", yourlabel: "Quotation No" },
    { fieldname: "customerId", controlname: "text", yourlabel: "Customer" },
    { fieldname: "polId", controlname: "text", yourlabel: "POL" },
    { fieldname: "podId", controlname: "text", yourlabel: "POD" },
    { fieldname: "commodityText", controlname: "text", yourlabel: "Commodity" },
    { fieldname: "createdBy", controlname: "text", yourlabel: "Created By" },
    { fieldname: "createdDate", controlname: "date", yourlabel: "Created Date/Time" },
];

export default function JobSearchLikeVoucherPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tableRef = useRef(null);

    const {
        clientId,
        companyId,
        branchId,
        financialYearId,
        defaultCompanyId,
        defaultBranchId,
        defaultFinYearId,
    } = getUserDetails();

    // -------- UI / Paging ----------
    const [page, setPage] = useState(1);
    const [selectedPageNumber, setSelectedPageNumber] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(17);
    const [totalPages, setTotalPages] = useState(0);
    const [pageCount, setPageCount] = useState(0);

    const [gridData, setGridData] = useState([]);
    const [loader, setLoader] = useState(true);

    // Top icons hover
    const [hoveredIcon, setHoveredIcon] = useState(null);

    // Advanced search (same UX as voucher page)
    const [searchOpen, setSearchOpen] = useState(false);
    const [isAdvanceSearchOpen, setIsAdvanceSearchOpen] = useState(false);
    const [searchInput, setSearchInput] = useState("");

    // Simple “advanced” filters (kept stable + production friendly)
    const [filters, setFilters] = useState({
        jobNo: "",
        createdBy: "",
        status: "",
        jobDateFrom: null,
        jobDateTo: null,
    });

    // Right click column search
    const [isInputVisible, setInputVisible] = useState(false);
    const [activeColumn, setActiveColumn] = useState(null);
    const [prevSearchInput, setPrevSearchInput] = useState("");
    const [columnSearchKeyName, setColumnSearchKeyName] = useState("");
    const [columnSearchKeyValue, setColumnSearchKeyValue] = useState("");

    // Sorting (client-side on current page data)
    const [sortedColumn, setSortedColumn] = useState(null);
    const [isAscending, setIsAscending] = useState(true);

    // Modal
    const [openModal, setOpenModal] = useState(false);
    const [paraText, setParaText] = useState("");
    const [isError, setIsError] = useState(false);

    // Scroll sync for right-side icon bar
    const [scrollLeft, setScrollLeft] = useState(0);

    // ✅ Table headings same structure as voucher page
    const tableheading = useMemo(() => {
        return JOB_GRID_CONFIG.map((h) => ({
            id: h.fieldname,
            label: h.yourlabel,
            refkey: h.keyToShowOnGrid || null,
            isDummy: false,
            dummyField: null,
            align: "left",
            minWidth: 200,
        }));
    }, []);

    // -------- helpers ----------
    const escapeSqlLike = (v) => String(v ?? "").trim().replace(/'/g, "''");

    const buildFilterCondition = () => {
        const parts = [];

        // ✅ your standard company/client/branch/year conditions
        if (clientId) parts.push(`clientId=${clientId}`);
        if (companyId || defaultCompanyId) parts.push(`companyId=${companyId || defaultCompanyId}`);
        if (branchId || defaultBranchId) parts.push(`companyBranchId=${branchId || defaultBranchId}`);
        if (financialYearId || defaultFinYearId)
            parts.push(`financialYearId=${financialYearId || defaultFinYearId}`);

        // ✅ if your table uses status=1 for active rows (common in your project)
        parts.push(`status = 1`);

        // Global search (top Search... input)
        if (searchInput?.trim()) {
            const q = escapeSqlLike(searchInput);
            parts.push(`(
                            jobNo like '%${q}%'
                            OR rateRequestId like '%${q}%'
                            OR customerId like '%${q}%'
                            OR polId like '%${q}%'
                            OR podId like '%${q}%'
                            OR commodityText like '%${q}%'
                            OR createdBy like '%${q}%'
                        )`);
        }


        // Advanced filters (simple, stable)
        if (filters.jobNo?.trim()) parts.push(`jobNo like '%${escapeSqlLike(filters.jobNo)}%'`);
        if (filters.createdBy?.trim())
            parts.push(`createdBy like '%${escapeSqlLike(filters.createdBy)}%'`);
        if (filters.status?.trim()) parts.push(`status like '%${escapeSqlLike(filters.status)}%'`);

        if (filters.jobDateFrom) {
            parts.push(`jobDate >= '${dayjs(filters.jobDateFrom).format("YYYY-MM-DD")}'`);
        }
        if (filters.jobDateTo) {
            parts.push(`jobDate <= '${dayjs(filters.jobDateTo).format("YYYY-MM-DD")}'`);
        }

        // Column right-click search (like voucher page)
        if (columnSearchKeyName && String(columnSearchKeyValue ?? "").trim() !== "") {
            const v = escapeSqlLike(columnSearchKeyValue);
            parts.push(`${columnSearchKeyName} like '%${v}%'`);
        }

        return parts.join(" and ");
    };

    function pageSelected(p) {
        setPage(p);
        setSelectedPageNumber(p);
    }

    const handleCustomRowsPerPageChange = (event) => {
        const value = parseInt(event.target.value || "0", 10);
        if (!isNaN(value) && value > 0) {
            sessionStorage?.setItem("rowsPerPage", value);
            setRowsPerPage(value);
            setPage(1);
            setSelectedPageNumber(1);
        }
    };

    useEffect(() => {
        const storedRowsPerPage = sessionStorage.getItem("rowsPerPage");
        setRowsPerPage(storedRowsPerPage ? parseInt(storedRowsPerPage, 10) : 17);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Right click input
    const handleRightClick = (event, columnId) => {
        event.preventDefault();
        setInputVisible(true);
        setActiveColumn(columnId);
    };

    // Sorting (client-side)
    const handleSortBy = (col) => {
        setSortedColumn(col.id);
        setIsAscending((p) => !p);
    };

    const renderSortIcon = (columnId) => {
        const active = sortedColumn === columnId;
        const visibleOpacity = active ? 1 : 0;
        return (
            <>
                {!isAscending ? (
                    <LightTooltip title={active ? "Ascending" : ""}>
                        <ArrowUpwardIcon
                            fontSize="small"
                            className={styles.ArrowDropUpIcon}
                            sx={{ opacity: visibleOpacity, color: "white" }}
                        />
                    </LightTooltip>
                ) : (
                    <LightTooltip title={active ? "Descending" : ""}>
                        <ArrowDownwardIcon
                            fontSize="small"
                            className={styles.ArrowDropUpIcon}
                            sx={{ opacity: visibleOpacity, color: "white" }}
                        />
                    </LightTooltip>
                )}
            </>
        );
    };

    const applyClientSort = (data) => {
        if (!sortedColumn) return data;
        const dir = isAscending ? 1 : -1;
        const copy = [...(data || [])];
        copy.sort((a, b) => {
            const av = a?.[sortedColumn];
            const bv = b?.[sortedColumn];

            // date-safe compare
            const ad = dayjs(av);
            const bd = dayjs(bv);
            if (ad.isValid() && bd.isValid() && String(sortedColumn).toLowerCase().includes("date")) {
                return (ad.valueOf() - bd.valueOf()) * dir;
            }

            const as = String(av ?? "").toLowerCase();
            const bs = String(bv ?? "").toLowerCase();
            if (as < bs) return -1 * dir;
            if (as > bs) return 1 * dir;
            return 0;
        });
        return copy;
    };

    // Fetch
    async function fetchData() {
        try {
            setLoader(true);

            const filterCondition = buildFilterCondition();

            const requestData = {
                tableName: TABLE_NAME,
                fieldName: JOB_GRID_CONFIG,
                clientId: clientId,
                filterCondition,
                pageNo: page,
                pageSize: rowsPerPage,
                // keyName/keyValue are already merged into filterCondition above,
                // but keeping these is harmless if your API expects it:
                keyName: columnSearchKeyName,
                keyValue: columnSearchKeyValue,
            };

            const apiResponse = await fetchSearchPageData(requestData);

            if (apiResponse?.success === true && Array.isArray(apiResponse?.data)) {
                const sorted = applyClientSort(apiResponse.data);
                setGridData(sorted);

                const countReq = {
                    columns: "id",
                    tableName: TABLE_NAME,
                    // whereCondition: filterCondition || "1=1",
                    // clientIdCondition: `FOR JSON PATH, INCLUDE_NULL_VALUES`,
                };

                const countResp = await fetchReportData(countReq);

                const countArr = Array.isArray(countResp?.data) ? countResp.data : Array.isArray(countResp) ? countResp : [];
                const Count = countArr?.length || 0;

                setPageCount(Count);
                setTotalPages(Math.ceil(Count / rowsPerPage) || 1);

                setSearchOpen(false);
            } else {
                setGridData([]);
                setParaText(apiResponse?.message || "No records found.");
                setIsError(false);
                setOpenModal(true);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setGridData([]);
            setParaText("Error while fetching data.");
            setIsError(true);
            setOpenModal(true);
        } finally {
            setLoader(false);
        }
    }
    useEffect(() => {
        fetchData();
    }, [page, rowsPerPage, sortedColumn, isAscending, columnSearchKeyName, columnSearchKeyValue]);

    useEffect(() => {
        const el = document.getElementById("paper");
        if (!el) return;

        let timerId = null;
        const onScroll = () => {
            if (!timerId) {
                timerId = setTimeout(() => {
                    setScrollLeft(el.scrollLeft || 0);
                    timerId = null;
                }, 100);
            }
        };

        el.addEventListener("scroll", onScroll);
        return () => {
            el.removeEventListener("scroll", onScroll);
            if (timerId) clearTimeout(timerId);
        };
    }, [gridData?.length]);

    // Toolbar actions
    const handleInitailSearch = () => {
        setPage(1);
        setSelectedPageNumber(1);
        fetchData();
        setSearchOpen(false);
    };

    const handleRemoveFilter = () => {
        setSearchInput("");
        setFilters({
            jobNo: "",
            createdBy: "",
            status: "",
            jobDateFrom: null,
            jobDateTo: null,
        });
        setColumnSearchKeyName("");
        setColumnSearchKeyValue("");
        setPrevSearchInput("");
        setInputVisible(false);
        setActiveColumn(null);
        setSortedColumn(null);
        setIsAscending(true);

        setRowsPerPage(17);
        setPage(1);
        setSelectedPageNumber(1);
    };

    const handleClose = () => {
        router.back();
    };

    const handleAdd = () => {
        router.push("/exportChaJob");
    };

    return (
        <div className="relative">
            <CustomeBreadCrumb name="Job" />

            <div className="flex mb-3 justify-end -mt-[10px]">
                <div className="flex justify-between h-[27px] border border-gray-100 rounded-[7px] shadow-md">
                    <Stack direction="row">
                        <LightTooltip title="Add Form">
                            <Button
                                onMouseEnter={() => setHoveredIcon("addForm")}
                                onMouseLeave={() => setHoveredIcon(null)}
                                onClick={handleAdd}
                            >
                                <Image
                                    src={hoveredIcon === "addForm" ? addDocIconHover : addDocIcon}
                                    alt="Add Icon"
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
                            >
                                <Image
                                    src={hoveredIcon === "advanceSearch" ? magnifyIconHover : searchImage}
                                    alt="Search Icon"
                                    priority={false}
                                    className="cursor-pointer gridIcons2"
                                />
                            </Button>
                        </LightTooltip>

                        <LightTooltip title="Close">
                            <Button
                                onMouseEnter={() => setHoveredIcon("close")}
                                onMouseLeave={() => setHoveredIcon(null)}
                                onClick={handleClose}
                            >
                                <CloseIcon sx={{ fontSize: 18, color: "var(--table-text-color)" }} />
                            </Button>
                        </LightTooltip>
                    </Stack>
                </div>
            </div>

            {searchOpen && (
                <Paper
                    className={`absolute top-[8%] right-0 z-50 ${styles.searchDispalyBg} border border-[#B2BAC2] rounded-[7px] shadow-md`}
                    sx={{ width: "90%", height: "auto" }}
                >
                    <div className="mx-[20px]">
                        {/* Global search row */}
                        <div className="flex items-center relative mt-[6px]">
                            <Paper sx={{ ...advanceSearchPaperStyles }}>
                                <InputBase
                                    autoFocus
                                    autoComplete="off"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    placeholder="Search..."
                                    inputProps={{ "aria-label": "search..." }}
                                    sx={{ ...searchInputStyling }}
                                    onKeyDown={(e) => e.key === "Enter" && handleInitailSearch()}
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
                                className={"relative left-2 cursor-pointer"}
                                onClick={() => setSearchOpen(false)}
                            />
                        </div>

                        <button
                            className={`${styles.txtColorDark} mt-[6px] block text-[12px]`}
                            onClick={() => setIsAdvanceSearchOpen((p) => !p)}
                        >
                            Advanced Search
                        </button>

                        {isAdvanceSearchOpen && (
                            <div className="mt-[8px] mb-[8px] grid grid-cols-1 md:grid-cols-2 gap-3">
                                <TextField
                                    size="small"
                                    label="Job No"
                                    value={filters.jobNo}
                                    onChange={(e) => setFilters((p) => ({ ...p, jobNo: e.target.value }))}
                                />
                                <TextField
                                    size="small"
                                    label="Created By"
                                    value={filters.createdBy}
                                    onChange={(e) =>
                                        setFilters((p) => ({ ...p, createdBy: e.target.value }))
                                    }
                                />
                                <TextField
                                    size="small"
                                    label="Status"
                                    value={filters.status}
                                    onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                                />

                                <DateTimePicker
                                    label="Job Date From"
                                    value={filters.jobDateFrom ? dayjs(filters.jobDateFrom) : null}
                                    onChange={(v) =>
                                        setFilters((p) => ({ ...p, jobDateFrom: v ? v.toDate() : null }))
                                    }
                                    slots={{ openPickerIcon: ExpandMoreIcon }}
                                    slotProps={{
                                        field: { clearable: true },
                                        actionBar: { actions: ["cancel"] },
                                    }}
                                />

                                <DateTimePicker
                                    label="Job Date To"
                                    value={filters.jobDateTo ? dayjs(filters.jobDateTo) : null}
                                    onChange={(v) =>
                                        setFilters((p) => ({ ...p, jobDateTo: v ? v.toDate() : null }))
                                    }
                                    slots={{ openPickerIcon: ExpandMoreIcon }}
                                    slotProps={{
                                        field: { clearable: true },
                                        actionBar: { actions: ["cancel"] },
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex gap-3 mt-1 pb-2">
                            <button
                                className={`my-[6px] ${styles.commonBtn}`}
                                onClick={() => {
                                    setPage(1);
                                    setSelectedPageNumber(1);
                                    fetchData();
                                    setSearchOpen(false);
                                }}
                            >
                                Search
                            </button>
                            <button className={`my-[6px] ${styles.commonBtn}`} onClick={handleRemoveFilter}>
                                Remove filter
                            </button>
                        </div>
                    </div>
                </Paper>
            )}

            <Paper sx={{ ...displayTablePaperStyles }}>
                <TableContainer
                    id="paper"
                    className={`${styles.thinScrollBar}`}
                    sx={{
                        ...displayTableContainerStyles,
                        position: "relative !important",
                    }}
                    ref={tableRef}
                >
                    <Table stickyHeader aria-label="sticky table" className={`overflow-auto ${styles.thinScrollBar}`}>
                        <TableHead sx={{ ...displaytableHeadStyles }}>
                            <TableRow style={{ cursor: "context-menu" }}>
                                {tableheading.map((col, index) => (
                                    <TableCell
                                        key={index}
                                        align={col.align}
                                        style={{ minWidth: col.minWidth }}
                                        width={"auto"}
                                        className={`${styles.cellHeading} cursor-pointer`}
                                        onContextMenu={(event) => handleRightClick(event, col.id)}
                                    >
                                        <span
                                            className={`${styles.labelText}`}
                                            onClick={() => handleSortBy(col)}
                                        >
                                            {col.label}
                                        </span>

                                        <span>
                                            {isInputVisible && activeColumn === col.id && (
                                                <CustomizedInputBase
                                                    columnData={col}
                                                    setPrevSearchInput={setPrevSearchInput}
                                                    prevSearchInput={prevSearchInput}
                                                    setInputVisible={setInputVisible}
                                                    setColumnSearchKeyName={setColumnSearchKeyName}
                                                    setColumnSearchKeyValue={setColumnSearchKeyValue}
                                                    isInputVisible={isInputVisible}
                                                    setSearchInput={setSearchInput}
                                                    setRowsPerPage={setRowsPerPage}
                                                    setPage={setPage}
                                                />
                                            )}
                                        </span>

                                        <span className="ml-1">{renderSortIcon(col.id)}</span>
                                    </TableCell>
                                ))}
                                <TableCell align="left" width={"auto"} />
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
                                        hover
                                        role="checkbox"
                                        key={rowIndex}
                                        className={`${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
                                        sx={{
                                            ...displaytableRowStyles_two(),
                                        }}
                                        onDoubleClick={() => {
                                            // ✅ update your route
                                            router.push(`/job/addEdit?id=${row?.id}`);
                                        }}
                                    >
                                        {tableheading.map((fieldName, idx) => (
                                            <TableCell key={`${rowIndex}-${fieldName.id}`} align="left">
                                                {isDateFormat(row?.[fieldName.id])}
                                            </TableCell>
                                        ))}

                                        <TableCell style={{ width: "auto" }}>
                                            <div className="w-full">
                                                <div
                                                    id={"iconsRow"}
                                                    className={`${styles.iconContainer2} flex items-center w-full -mt-[11px]`}
                                                    style={{
                                                        height: "20px",
                                                        right: `-${scrollLeft}px`,
                                                        display: "flex",
                                                        opacity: 0.85,
                                                    }}
                                                >
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}

                            {gridData?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={tableheading.length + 1}>
                                        <div
                                            className={`${styles.pageBackground} flex items-center justify-center h-[calc(100vh-168px)]`}
                                        >
                                            <div className={`${styles.pageBackground} container mx-auto text-center`}>
                                                {loader ? (
                                                    <p className="text-gray-500 text-lg mt-4">{"Loading..."}</p>
                                                ) : (
                                                    <p className="text-gray-500 text-lg mt-4">{"No Records Found."}</p>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <div className="flex items-center justify-end pt-2 px-4 text-black">
                <PaginationButtons
                    totalPages={totalPages || 1}
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
                    {selectedPageNumber} of {totalPages || 1} Pages
                </p>
            </div>

            {openModal && (
                <CustomeModal
                    setOpenModal={setOpenModal}
                    openModal={openModal}
                    onConfirm={() => setOpenModal(false)}
                    isError={isError}
                    paraText={paraText}
                    labelValue={""}
                />
            )}
        </div>
    );
}

function CustomizedInputBase({
    columnData,
    setPrevSearchInput,
    prevSearchInput,
    setInputVisible,
    setColumnSearchKeyName,
    setColumnSearchKeyValue,
    isInputVisible,
    setSearchInput,
    setRowsPerPage,
    setPage,
}) {
    const inputRef = useRef(null);
    const [searchInputGridData, setSearchInputGridData] = useState(prevSearchInput || "");

    const filterFunction = (searchValue, columnKey) => {
        setColumnSearchKeyName(columnKey);
        setColumnSearchKeyValue(searchValue);
        setSearchInput(searchValue);
        setPrevSearchInput(searchValue);
        setInputVisible(false);
        setRowsPerPage(17);
        setPage(1);
    };

    const handleClear = () => {
        setSearchInputGridData("");
        setPrevSearchInput("");
        setSearchInput("");
        setColumnSearchKeyName("");
        setColumnSearchKeyValue("");
        setPage(1);
        setRowsPerPage(17);
        setInputVisible(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setInputVisible(!isInputVisible);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isInputVisible, setInputVisible]);

    return (
        <Paper
            ref={inputRef}
            sx={{
                ...createAddEditPaperStyles,
            }}
        >
            <InputBase
                autoFocus
                sx={{ ...searchInputStyling }}
                placeholder="Search..."
                inputProps={{ "aria-label": "search..." }}
                value={searchInputGridData}
                onChange={(e) => setSearchInputGridData(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") filterFunction(searchInputGridData, columnData.id);
                }}
            />

            <LightTooltip title="Clear">
                <IconButton sx={{ p: "2px" }} aria-label="clear" onClick={handleClear}>
                    <ClearIcon sx={{ color: "var(--table-text-color)" }} />
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
                    <SearchIcon sx={{ color: "var(--table-text-color)" }} />
                </IconButton>
            </LightTooltip>
        </Paper>
    );
}
