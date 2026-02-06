"use client";
/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import styles from "@/app/app.module.css";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import { fontFamilyStyles } from "@/app/globalCss";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
    displayTablePaperStyles,
    displayTableContainerStyles,
    displaytableHeadStyles,
    displaytableRowStyles_two,
    createAddEditPaperStyles,
    searchInputStyling,
} from "@/app/globalCss";

const bottomFormdata = {
    "Container Details": [
        {
            id: 1,
            fieldname: "containerNo",
            yourlabel: "Container No",
            controlname: "text",
            type: 6902,
            typeValue: "string",
            ordering: 1,
            isControlShow: true,
            isGridView: false,
            isEditable: true,
            isRequired: false,
            sectionHeader: "General",
            sectionOrder: 1,
        },
        {
            id: 2,
            fieldname: "type",
            yourlabel: "Type",
            controlname: "dropdown",
            type: 6902,
            typeValue: "string",
            ordering: 2,
            isControlShow: true,
            isGridView: false,
            isEditable: true,
            isRequired: false,
            sectionHeader: "General",
            sectionOrder: 1,
            referenceTable: "tblMasterData",
            referenceColumn: "name",
            dropdownFilter: "and masterListId in (select id from tblMasterList where name='tblType')",
        },
        {
            id: 3,
            fieldname: "pkgsStuffed",
            yourlabel: "Pkgs Stuffed",
            controlname: "text",
            type: 6902,
            typeValue: "string",
            ordering: 3,
            isControlShow: true,
            isGridView: false,
            isEditable: true,
            isRequired: false,
            sectionHeader: "General",
            sectionOrder: 1,
        },
        {
            id: 4,
            fieldname: "grossWeight",
            yourlabel: "Gross Weight",
            controlname: "text",
            type: 6902,
            typeValue: "string",
            ordering: 4,
            isControlShow: true,
            isGridView: false,
            isEditable: true,
            isRequired: false,
            sectionHeader: "General",
            sectionOrder: 1,
        },
        {
            id: 5,
            fieldname: "sealNo",
            yourlabel: "Seal No",
            controlname: "text",
            type: 6902,
            typeValue: "string",
            ordering: 5,
            isControlShow: true,
            isGridView: false,
            isEditable: true,
            isRequired: false,
            sectionHeader: "General",
            sectionOrder: 2,
        },
        {
            id: 6,
            fieldname: "sealDate",
            yourlabel: "Seal Date",
            controlname: "date",
            type: 6783,
            typeValue: "string",
            ordering: 6,
            isControlShow: true,
            isGridView: false,
            isEditable: true,
            isRequired: false,
            sectionHeader: "General",
            sectionOrder: 2,
        },
        {
            id: 7,
            fieldname: "sealType",
            yourlabel: "Seal Type",
            controlname: "dropdown",
            type: 6902,
            typeValue: "string",
            ordering: 7,
            isControlShow: true,
            isGridView: false,
            isEditable: true,
            isRequired: false,
            sectionHeader: "General",
            sectionOrder: 2,
            referenceTable: "tblMasterData",
            referenceColumn: "name",
            dropdownFilter: "and masterListId in (select id from tblMasterList where name='tblSealTypeIndicator')",

        },
        {
            id: 8,
            fieldname: "location",
            yourlabel: "Location",
            controlname: "text",
            type: 6902,
            typeValue: "string",
            ordering: 8,
            isControlShow: true,
            isGridView: false,
            isEditable: true,
            isRequired: false,
            sectionHeader: "General",
            sectionOrder: 2,
        },
    ],
};

export default function ContainerSheet({ value, onChange }) {
    const API_LIST = "/api/blcontainer/list";
    const API_UPSERT = "/api/blcontainer/update";
    const API_DELETE = "/api/blcontainer/delete";

    const theme = useTheme();
    useMediaQuery(theme.breakpoints.down("md"));

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const newState = value || {};
    const setNewState = onChange;
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [totalCount, setTotalCount] = useState(0);
    const [query, setQuery] = useState("");
    const [isColumnSearchOpen, setIsColumnSearchOpen] = useState(false);
    const [activeColumn, setActiveColumn] = useState(null);
    const [columnKeyName, setColumnKeyName] = useState("");
    const [columnKeyValue, setColumnKeyValue] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [mode, setMode] = useState("view");
    const [form, setForm] = useState(getEmptyForm());
    const [hoverRowId, setHoverRowId] = useState(null);
    const [clearFlagLocal, setClearFlagLocal] = useState({
        isClear: false,
        fieldName: "",
    });

    const safeStr = (v) => (v === null || v === undefined ? "" : String(v));
    const isEditable = mode === "edit" || mode === "new";
    const columns = useMemo(
        () => [
            { id: "containerNo", label: "Container No", minWidth: 200 },
            { id: "sealNo", label: "Seal No", minWidth: 160 },
            { id: "sealDate", label: "Seal Date", minWidth: 160 },
            { id: "type", label: "Type", minWidth: 130 },
            { id: "pkgsStuffed", label: "Pkgs stuffed", minWidth: 140 },
            { id: "grossWeight", label: "Gross Weight", minWidth: 140 },
            { id: "sealType", label: "Seal Type", minWidth: 160 },
        ],
        []
    );

    const normalizeRow = (r, idx) => ({
        id: r?.blContainerId ?? r?.id ?? r?._id ?? idx + 1,
        containerNo: r?.containerNo ?? "",
        sealNo: r?.sealNo ?? "",
        sealDate: r?.sealDate ?? "",
        type: r?.containerType ?? r?.type ?? "",
        pkgsStuffed: r?.pkgsStuffed ?? r?.pkgs ?? "",
        grossWeight: r?.grossWt ?? r?.grossWeight ?? "",
        sealType: r?.sealType ?? "",
        location: r?.location ?? "",
        __raw: r,
    });
    const patchParent = useCallback(
        (patch = {}) => {
            if (typeof setNewState === "function") {
                try {
                    setNewState((prev) => ({ ...(prev || {}), ...(patch || {}) }));
                } catch (e) {
                    setNewState({ ...(newState || {}), ...(patch || {}) });
                }
            }
        },
        [setNewState, newState]
    );
    const fetchRows = useCallback(async () => {
        setLoading(true);
        try {
            const payload = {
                pageNo: page,
                pageSize: rowsPerPage,
                searchQuery: query?.trim() || "",
                keyName: columnKeyName || "",
                keyValue: columnKeyValue || "",
            };

            const res = await fetch(API_LIST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to load tblBlContainer data");

            const json = await res.json();

            const dataArr = Array.isArray(json?.data)
                ? json.data
                : Array.isArray(json)
                    ? json
                    : [];

            const mapped = dataArr.map((r, idx) => normalizeRow(r, idx));
            setRows(mapped);
            setTotalCount(Number(json?.totalCount ?? json?.count ?? mapped.length ?? 0));

            if (selectedId && !mapped.some((x) => x.id === selectedId)) {
                setSelectedId(null);
                setMode("view");
                setForm(getEmptyForm());
                patchParent(getEmptyFormForParent());
            }
        } catch (e) {
            console.error("tblBlContainer fetch error:", e);
            setRows([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [API_LIST, page, rowsPerPage, query, columnKeyName, columnKeyValue, selectedId, patchParent]);

    useEffect(() => {
        fetchRows();
    }, [fetchRows]);
    const filteredRowsLocal = useMemo(() => {
        if (!columnKeyName || !columnKeyValue) return rows;
        const ck = (columnKeyName || "").trim();
        const cv = (columnKeyValue || "").trim().toLowerCase();
        return rows.filter((r) => safeStr(r?.[ck]).toLowerCase().includes(cv));
    }, [rows, columnKeyName, columnKeyValue]);

    const handleRightClick = (event, columnId) => {
        event.preventDefault();
        setActiveColumn(columnId);
        setIsColumnSearchOpen(true);
    };

    const totalPages = Math.max(1, Math.ceil((totalCount || 0) / rowsPerPage));
    const selectRow = (row) => {
        const next = {
            id: row?.id ?? null,
            containerNo: row?.containerNo ?? "",
            sealNo: row?.sealNo ?? "",
            sealDate: row?.sealDate ?? "",
            type: row?.type ?? "",
            pkgsStuffed: row?.pkgsStuffed ?? "",
            grossWeight: row?.grossWeight ?? "",
            sealType: row?.sealType ?? "",
            location: row?.__raw?.location ?? row?.location ?? "",
            moveDocType: row?.__raw?.moveDocType ?? "",
            moveDocNo: row?.__raw?.moveDocNo ?? "",
            grWtTRWt: row?.__raw?.grWtTRWt ?? "",
        };

        setSelectedId(next.id);
        setMode("view");
        setForm(next);
        patchParent({
            containerNo: next.containerNo ?? null,
            type: next.type ?? null,
            pkgsStuffed: next.pkgsStuffed ?? null,
            grossWeight: next.grossWeight ?? null,
            sealNo: next.sealNo ?? null,
            sealDate: next.sealDate ?? null,
            sealType: next.sealType ?? null,
            location: next.location ?? null,
            blContainerId: next.id ?? null,
        });
    };
    const onNew = () => {
        setSelectedId(null);
        setMode("new");
        const empty = getEmptyForm();
        setForm(empty);
        patchParent(getEmptyFormForParent());
    };

    const onView = (row) => {
        selectRow(row);
        setMode("view");
    };

    const onEdit = (row) => {
        if (!row?.id) return;
        selectRow(row);
        setMode("edit");
    };

    const onCopy = (row) => {
        selectRow(row);
        setMode("new");
        setForm((prev) => ({ ...(prev || {}), id: null }));
        setSelectedId(null);
        patchParent({ blContainerId: null });
    };

    const onClose = () => {
        setMode("view");
        setSelectedId(null);
        setForm(getEmptyForm());
        patchParent(getEmptyFormForParent());
    };
    const upsert = async () => {
        if (mode === "edit" && !form?.id) return;

        const payload = {
            blContainerId: form?.id ?? null,
            containerNo: form.containerNo,
            sealNo: form.sealNo,
            sealDate: form.sealDate,
            containerType: form.type,
            pkgsStuffed: form.pkgsStuffed,
            grossWt: form.grossWeight,
            sealType: form.sealType,
            moveDocType: form.moveDocType,
            moveDocNo: form.moveDocNo,
            location: form.location,
            grWtTRWt: form.grWtTRWt,
        };

        setLoading(true);
        try {
            const res = await fetch(API_UPSERT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Upsert failed");

            let savedId = form?.id ?? null;
            try {
                const json = await res.json();
                savedId = json?.id ?? json?.blContainerId ?? savedId;
            } catch (_) { }

            await fetchRows();

            setMode("view");
            if (savedId) {
                setSelectedId(savedId);
                patchParent({ blContainerId: savedId });
            }
        } catch (e) {
            console.error("tblBlContainer upsert error:", e);
        } finally {
            setLoading(false);
        }
    };
    const onDelete = async (rowOrId) => {
        const id = typeof rowOrId === "object" ? rowOrId?.id : rowOrId;
        const deleteId = id ?? form?.id;
        if (!deleteId) return;

        setLoading(true);
        try {
            const res = await fetch(API_DELETE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blContainerId: deleteId }),
            });

            if (!res.ok) throw new Error("Delete failed");

            setSelectedId(null);
            setMode("view");
            setForm(getEmptyForm());
            patchParent(getEmptyFormForParent());
            await fetchRows();
        } catch (e) {
            console.error("tblBlContainer delete error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleBottomFieldValuesChange = (updatedValues = {}) => {
        setForm((prev) => {
            const next = { ...(prev || {}), ...(updatedValues || {}) };
            patchParent({
                containerNo: next.containerNo ?? null,
                type: next.type ?? null,
                pkgsStuffed: next.pkgsStuffed ?? null,
                grossWeight: next.grossWeight ?? null,
                sealNo: next.sealNo ?? null,
                sealDate: next.sealDate ?? null,
                sealType: next.sealType ?? null,
                location: next.location ?? null,
                blContainerId: next.id ?? null,
            });

            return next;
        });
    };

    const applyResultToState = (result) => {
        if (result?.isCheck === false) {
            if (result?.alertShow && result?.fieldName) {
                setClearFlagLocal({ isClear: true, fieldName: result.fieldName });
            }
            return;
        }

        const patch = { ...(result?.newState || {}) };
        if (!Object.keys(patch).length) return;
        setForm((p) => ({ ...(p || {}), ...patch }));
        patchParent(patch);
    };

    const editorWrapSx = {
        borderTop: "1px solid var(--inputBorderColor)",
        backgroundColor: "var(--page-bg-color)",
        padding: "8px 10px",
    };

    return (
        <div style={{ width: "100%" }}>
            <div className="flex mb-2 justify-end">

                <div className="flex items-center gap-2 px-1">
                    <Tooltip title="New">
                        <span>
                            <button
                                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
                                type="button"
                                onClick={onNew} disabled={loading} >
                                <AddCircleOutlineIcon fontSize="small" />
                            </button>
                        </span>
                    </Tooltip>

                    <Tooltip title={isEditable ? "Save" : "Select row to edit"}>
                        <span>
                            <button
                                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
                                type="button"
                                onClick={upsert} disabled={loading || !isEditable} sx={iconBtnSx()}>
                                <SaveOutlinedIcon fontSize="small" />
                            </button>
                        </span>
                    </Tooltip>

                    <Tooltip title="Close">
                        <span>
                            <button
                                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
                                type="button"
                                onClick={onClose} disabled={loading} sx={iconBtnSx()}>
                                <CloseOutlinedIcon fontSize="small" />
                            </button>
                        </span>
                    </Tooltip>
                </div>
            </div>

            <Paper elevation={0} sx={displayTablePaperStyles}>
                <TableContainer className={styles.thinScrollBar} sx={displayTableContainerStyles}>
                    <Table stickyHeader size="small">
                        <TableHead sx={displaytableHeadStyles}>
                            <TableRow>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>Sr No</TableCell>

                                {columns.map((c) => (
                                    <TableCell
                                        key={c.id}
                                        onContextMenu={(e) => handleRightClick(e, c.id)}
                                        sx={{
                                            whiteSpace: "nowrap",
                                            minWidth: c.minWidth,
                                            cursor: "context-menu",
                                            position: "relative",
                                            userSelect: "none",
                                        }}
                                    >
                                        {c.label}

                                        {isColumnSearchOpen && activeColumn === c.id && (
                                            <ColumnSearchBox
                                                onClose={() => setIsColumnSearchOpen(false)}
                                                onApply={(val) => {
                                                    setPage(1);
                                                    setColumnKeyName(c.id);
                                                    setColumnKeyValue(val);
                                                    setIsColumnSearchOpen(false);
                                                }}
                                                onClear={() => {
                                                    setPage(1);
                                                    setColumnKeyName("");
                                                    setColumnKeyValue("");
                                                    setIsColumnSearchOpen(false);
                                                }}
                                                defaultValue={columnKeyName === c.id ? columnKeyValue : ""}
                                            />
                                        )}
                                    </TableCell>
                                ))}

                                <TableCell sx={{ whiteSpace: "nowrap", minWidth: 170 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredRowsLocal.length === 0 ? (
                                <TableRow sx={displaytableRowStyles_two()}>
                                    <TableCell
                                        colSpan={columns.length + 2}
                                        sx={{ fontSize: "var(--tableRowFontSize)", color: "var(--tableRowTextColor)" }}
                                    >
                                        {loading ? "Loading..." : "No data found."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRowsLocal.map((r, idx) => {
                                    const isSelected = r.id === selectedId;

                                    return (
                                        <TableRow
                                            key={r.id ?? idx}
                                            sx={{
                                                ...displaytableRowStyles_two(),
                                                cursor: "pointer",
                                                outline: isSelected ? "1px solid var(--inputBorderHoverColor)" : "none",
                                                outlineOffset: "-1px",
                                            }}
                                            onMouseEnter={() => setHoverRowId(r.id)}
                                            onMouseLeave={() => setHoverRowId(null)}
                                            onClick={() => selectRow(r)}
                                        >
                                            <TableCell>{(page - 1) * rowsPerPage + (idx + 1)}</TableCell>

                                            {columns.map((c) => (
                                                <TableCell key={c.id}>{safeStr(r?.[c.id])}</TableCell>
                                            ))}

                                            <TableCell onClick={(e) => e.stopPropagation()} sx={{ paddingRight: 1 }}>
                                                <div
                                                    className="flex items-center gap-1"
                                                    style={{
                                                        opacity: hoverRowId === r.id ? 1 : 0,
                                                        pointerEvents: hoverRowId === r.id ? "auto" : "none",
                                                        transition: "opacity 120ms ease",
                                                    }}
                                                >
                                                    <Tooltip title="View">
                                                        <span>
                                                            <IconButton size="small" onClick={() => onView(r)} sx={iconBtnSx()}>
                                                                <VisibilityOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>

                                                    <Tooltip title="Edit">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => onEdit(r)}
                                                                disabled={loading}
                                                                sx={iconBtnSx()}
                                                            >
                                                                <EditOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>

                                                    <Tooltip title="Copy">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => onCopy(r)}
                                                                disabled={loading}
                                                                sx={iconBtnSx()}
                                                            >
                                                                <ContentCopyOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>

                                                    <Tooltip title="Delete">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => onDelete(r)}
                                                                disabled={loading}
                                                                sx={iconBtnSx({ danger: true })}
                                                            >
                                                                <DeleteOutlineOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </div>
                                                <div style={{ height: 32, display: hoverRowId === r.id ? "none" : "block" }} />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                    <div className="flex items-center justify-end pt-2 px-4 text-black gap-3">
                        <button
                            className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
                            type="button"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            Prev
                        </button>

                        <button
                            className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
                            type="button"
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </button>

                        <input
                            type="number"
                            value={rowsPerPage}
                            onChange={(e) => {
                                const v = parseInt(e.target.value || "15", 10);
                                if (!Number.isNaN(v) && v > 0) {
                                    setRowsPerPage(v);
                                    setPage(1);
                                }
                            }}
                            className={`border ${styles.txtColorDark} ${styles.pageBackground} border-gray-300 rounded-md p-2 h-[28px] w-16 text-[11px] outline-gray-300 outline-0`}
                        />

                        <span className="text-black text-[12px]">
                            Page {page} of {totalPages} (Total: {totalCount})
                        </span>
                    </div>
                    <div
                        style={{
                            ...editorWrapSx,
                            backgroundColor: "var(--page-bg-color)",
                            "--inputBg": "var(--page-bg-color)",
                            "--tableRowBg": "var(--page-bg-color)",
                            "--commonBg": "var(--page-bg-color)",
                        }}
                    >
                        <CustomeInputFields
                            inputFieldData={bottomFormdata["Container Details"]}
                            values={form}
                            onValuesChange={handleBottomFieldValuesChange}
                            inEditMode={{ isEditMode: isEditable, isCopy: false }}
                            clearFlag={clearFlagLocal}
                            newState={form}
                            setStateVariable={setForm}
                            onChangeHandler={(result) => applyResultToState(result)}
                            onBlurHandler={(result) => applyResultToState(result)}
                        />
                    </div>

                </TableContainer>
            </Paper>
        </div>
    );
}

ContainerSheet.propTypes = {
    value: PropTypes.object,
    onChange: PropTypes.func,
};

function ColumnSearchBox({ onClose, onApply, onClear, defaultValue }) {
    const ref = useRef(null);
    const [val, setVal] = useState(defaultValue || "");

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose?.();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    return (
        <Paper ref={ref} sx={{ ...createAddEditPaperStyles, zIndex: 9999 }}>
            <InputBase
                autoFocus
                placeholder="Search..."
                value={val}
                onChange={(e) => setVal(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") onApply?.(val);
                    if (e.key === "Escape") onClose?.();
                }}
                sx={searchInputStyling}
            />

            <Tooltip title="Clear">
                <IconButton
                    sx={{ p: "2px" }}
                    onClick={() => {
                        setVal("");
                        onClear?.();
                    }}
                >
                    <ClearIcon sx={{ fontSize: 16, color: "var(--tableRowTextColor)" }} />
                </IconButton>
            </Tooltip>

            <Divider sx={{ height: 20, opacity: 0.3, mx: 0.5 }} orientation="vertical" />

            <Tooltip title="Search">
                <IconButton sx={{ p: "2px" }} onClick={() => onApply?.(val)}>
                    <SearchIcon sx={{ fontSize: 16, color: "var(--tableRowTextColor)" }} />
                </IconButton>
            </Tooltip>
        </Paper>
    );
}

ColumnSearchBox.propTypes = {
    onClose: PropTypes.func,
    onApply: PropTypes.func,
    onClear: PropTypes.func,
    defaultValue: PropTypes.string,
};
function getEmptyForm() {
    return {
        id: null,
        containerNo: "",
        sealNo: "",
        sealDate: "",
        type: "",
        pkgsStuffed: "",
        grossWeight: "",
        sealType: "",
        moveDocType: "",
        moveDocNo: "",
        location: "",
        grWtTRWt: "",
    };
}
function getEmptyFormForParent() {
    return {
        blContainerId: null,
        containerNo: null,
        type: null,
        pkgsStuffed: null,
        grossWeight: null,
        sealNo: null,
        sealDate: null,
        sealType: null,
        location: null,
    };
}

function iconBtnSx({ danger = false } = {}) {
    return {
        border: "1px solid var(--inputBorderColor)",
        background: "var(--page-bg-color)",
        color: danger ? "var(--dangerText, var(--table-text-color))" : "var(--table-text-color)",
        "&:hover": { background: "var(--tableRowBgHover)" },
        width: 30,
        height: 30,
        borderRadius: "7px",
        mx: 0.4,
    };
}
