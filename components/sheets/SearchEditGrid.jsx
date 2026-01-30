"use client";
/* eslint-disable */

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "@/app/app.module.css";

// ✅ Custom Fields
import CustomeInputFields from "@/components/Inputs/customeInputFields";

// MUI
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";

// Icons (same as ContainerSheet)
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

// ✅ Your theme-friendly styles
import {
    displayTablePaperStyles,
    displayTableContainerStyles,
    displaytableHeadStyles,
    displaytableRowStyles_two,
    createAddEditPaperStyles,
    searchInputStyling,
} from "@/app/globalCss";

/**
 * SearchEditGrid (ContainerSheet-style)
 * - Server-side paging (pageNo/pageSize)
 * - Right-click column filter (keyName/keyValue)
 * - Row hover actions: View/Edit/Copy/Delete
 * - Top toolbar: New/Save/Close
 * - Bottom editor using CustomeInputFields (no bottom buttons)
 */
export default function SearchEditGrid({
    title = "",
    columns = [],
    editorFields = [],
    rowIdField = "id",

    fetchPayload = {},
    fetchRows, // async (payload)=> { data:[], totalCount:number } OR []
    onSave, // async (row)=> savedRow or ok
    onDelete, // async (row)=> ok

    height = 220,
}) {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);

    // ✅ paging
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [totalCount, setTotalCount] = useState(0);

    // ✅ optional global search (not shown)
    const [query, setQuery] = useState("");

    // ✅ right-click column filter
    const [isColumnSearchOpen, setIsColumnSearchOpen] = useState(false);
    const [activeColumn, setActiveColumn] = useState(null);
    const [columnKeyName, setColumnKeyName] = useState("");
    const [columnKeyValue, setColumnKeyValue] = useState("");

    // ✅ selection + bottom editor
    const [selectedId, setSelectedId] = useState(null);
    const [mode, setMode] = useState("view"); // view | edit | new
    const [form, setForm] = useState({});

    // ✅ hover actions
    const [hoverRowId, setHoverRowId] = useState(null);

    const [clearFlagLocal, setClearFlagLocal] = useState({
        isClear: false,
        fieldName: "",
    });

    const safeStr = (v) => (v === null || v === undefined ? "" : String(v));
    const isEditable = mode === "edit" || mode === "new";

    const totalPages = Math.max(1, Math.ceil((totalCount || 0) / rowsPerPage));

    const normalizeRow = (r, idx) => {
        const id =
            r?.[rowIdField] ??
            r?.id ??
            r?._id ??
            r?.rowId ??
            idx + 1;

        const mapped = { id };

        columns.forEach((c) => {
            mapped[c.field] = r?.[c.field] ?? "";
        });

        mapped.__raw = r;
        return mapped;
    };

    const buildEmptyFormFromFields = () => {
        const base = { id: null };
        (editorFields || []).forEach((f) => {
            if (f?.fieldname) base[f.fieldname] = "";
        });
        return base;
    };

    const fetchList = async () => {
        setLoading(true);
        try {
            const payload = {
                ...(fetchPayload || {}),
                pageNo: page,
                pageSize: rowsPerPage,
                searchQuery: query?.trim() || "",
                keyName: columnKeyName || "",
                keyValue: columnKeyValue || "",
            };

            const out = await fetchRows?.(payload);

            const dataArr = Array.isArray(out)
                ? out
                : Array.isArray(out?.data)
                    ? out.data
                    : Array.isArray(out?.rows)
                        ? out.rows
                        : [];

            const mapped = dataArr.map((r, idx) => normalizeRow(r, idx));
            setRows(mapped);

            const tc = Number(out?.totalCount ?? out?.count ?? mapped.length ?? 0);
            setTotalCount(tc);

            // if selected no longer exists
            if (selectedId && !mapped.some((x) => x.id === selectedId)) {
                setSelectedId(null);
                setMode("view");
                setForm(buildEmptyFormFromFields());
            }
        } catch (e) {
            console.error("[SearchEditGrid] fetch error:", e);
            setRows([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    // fetch on dependencies
    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        page,
        rowsPerPage,
        query,
        columnKeyName,
        columnKeyValue,
        JSON.stringify(fetchPayload || {}),
    ]);

    // init form once editor fields are known
    useEffect(() => {
        setForm((p) => {
            const empty = buildEmptyFormFromFields();
            return Object.keys(p || {}).length ? p : empty;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(editorFields || [])]);

    const filteredRowsLocal = useMemo(() => {
        if (!columnKeyName || !columnKeyValue) return rows;
        const ck = (columnKeyName || "").trim();
        const cv = (columnKeyValue || "").trim().toLowerCase();
        return rows.filter((r) => safeStr(r?.[ck]).toLowerCase().includes(cv));
    }, [rows, columnKeyName, columnKeyValue]);

    const handleRightClick = (event, colField) => {
        event.preventDefault();
        setActiveColumn(colField);
        setIsColumnSearchOpen(true);
    };

    const selectRow = (row) => {
        setSelectedId(row?.id ?? null);
        setMode("view");

        const next = buildEmptyFormFromFields();
        next.id = row?.id ?? null;

        (editorFields || []).forEach((f) => {
            if (!f?.fieldname) return;
            next[f.fieldname] =
                row?.__raw?.[f.fieldname] ??
                row?.[f.fieldname] ??
                "";
        });

        setForm(next);
    };

    // ✅ ContainerSheet-like actions
    const onNew = () => {
        setSelectedId(null);
        setMode("new");
        setForm(buildEmptyFormFromFields());
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
    };

    const onClose = () => {
        setMode("view");
        setSelectedId(null);
        setForm(buildEmptyFormFromFields());
    };

    const upsert = async () => {
        if (mode === "edit" && !form?.id) return;

        setLoading(true);
        try {
            const payload = {
                ...(form || {}),
                [rowIdField]: form?.id ?? null,
            };

            const saved = await onSave?.(payload);

            await fetchList();

            setMode("view");
            const sid = saved?.[rowIdField] ?? saved?.id ?? form?.id ?? null;
            if (sid) setSelectedId(sid);
        } catch (e) {
            console.error("[SearchEditGrid] upsert error:", e);
        } finally {
            setLoading(false);
        }
    };

    const del = async (row) => {
        const id = row?.id ?? form?.id ?? null;
        if (!id) return;

        setLoading(true);
        try {
            await onDelete?.({ ...(row?.__raw || row || {}), [rowIdField]: id });

            setSelectedId(null);
            setMode("view");
            setForm(buildEmptyFormFromFields());
            await fetchList();
        } catch (e) {
            console.error("[SearchEditGrid] delete error:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleBottomFieldValuesChange = (updatedValues) => {
        setForm((prev) => ({ ...(prev || {}), ...(updatedValues || {}) }));
    };

    const editorWrapSx = {
        borderTop: "1px solid var(--inputBorderColor)",
        backgroundColor: "var(--page-bg-color)",
        padding: "8px 10px",
    };

    return (
        <div style={{ width: "100%" }}>
            {/* ✅ Top hover toolbar (same as ContainerSheet) */}
            <div className="flex mb-2 justify-end">
                <div
                    className="flex justify-between h-[27px] border border-gray-100 rounded-[7px] shadow-md"
                    style={{ background: "var(--page-bg-color)" }}
                >
                    <div className="flex items-center px-1">
                        <Tooltip title="New">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onNew}
                                    disabled={loading}
                                    sx={iconBtnSx()}
                                >
                                    <AddCircleOutlineIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title={isEditable ? "Save" : "Edit or New to Save"}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={upsert}
                                    disabled={loading || !isEditable}
                                    sx={iconBtnSx()}
                                >
                                    <SaveOutlinedIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title="Close">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={onClose}
                                    disabled={loading}
                                    sx={iconBtnSx()}
                                >
                                    <CloseOutlinedIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>

            <Paper elevation={0} sx={displayTablePaperStyles}>
                <TableContainer
                    className={styles.thinScrollBar}
                    sx={{
                        ...displayTableContainerStyles,
                        maxHeight: height,
                    }}
                >
                    <Table stickyHeader size="small">
                        <TableHead sx={displaytableHeadStyles}>
                            <TableRow>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                    {title ? `${title} - Sr No` : "Sr No"}
                                </TableCell>

                                {columns.map((c) => (
                                    <TableCell
                                        key={c.field}
                                        onContextMenu={(e) => handleRightClick(e, c.field)}
                                        sx={{
                                            whiteSpace: "nowrap",
                                            minWidth: c.width || 120,
                                            cursor: "context-menu",
                                            position: "relative",
                                            userSelect: "none",
                                        }}
                                    >
                                        {c.headerName || c.label || c.field}

                                        {isColumnSearchOpen && activeColumn === c.field && (
                                            <ColumnSearchBox
                                                onClose={() => setIsColumnSearchOpen(false)}
                                                onApply={(val) => {
                                                    setPage(1);
                                                    setColumnKeyName(c.field);
                                                    setColumnKeyValue(val);
                                                    setIsColumnSearchOpen(false);
                                                }}
                                                onClear={() => {
                                                    setPage(1);
                                                    setColumnKeyName("");
                                                    setColumnKeyValue("");
                                                    setIsColumnSearchOpen(false);
                                                }}
                                                defaultValue={columnKeyName === c.field ? columnKeyValue : ""}
                                            />
                                        )}
                                    </TableCell>
                                ))}

                                {/* ✅ Actions column like ContainerSheet */}
                                <TableCell sx={{ whiteSpace: "nowrap", minWidth: 170 }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredRowsLocal.length === 0 ? (
                                <TableRow sx={displaytableRowStyles_two()}>
                                    <TableCell
                                        colSpan={columns.length + 2}
                                        sx={{
                                            fontSize: "var(--tableRowFontSize)",
                                            color: "var(--tableRowTextColor)",
                                        }}
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
                                                outline: isSelected
                                                    ? "1px solid var(--inputBorderHoverColor)"
                                                    : "none",
                                                outlineOffset: "-1px",
                                            }}
                                            onMouseEnter={() => setHoverRowId(r.id)}
                                            onMouseLeave={() => setHoverRowId(null)}
                                            onClick={() => selectRow(r)}
                                        >
                                            <TableCell>
                                                {(page - 1) * rowsPerPage + (idx + 1)}
                                            </TableCell>

                                            {columns.map((c) => (
                                                <TableCell key={c.field}>{safeStr(r?.[c.field])}</TableCell>
                                            ))}

                                            {/* ✅ Hover icons */}
                                            <TableCell
                                                onClick={(e) => e.stopPropagation()}
                                                sx={{ paddingRight: 1 }}
                                            >
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
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => onView(r)}
                                                                sx={iconBtnSx()}
                                                            >
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
                                                                onClick={() => del(r)}
                                                                disabled={loading}
                                                                sx={iconBtnSx({ danger: true })}
                                                            >
                                                                <DeleteOutlineOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </div>

                                                {/* keep row height stable */}
                                                <div
                                                    style={{
                                                        height: 32,
                                                        display: hoverRowId === r.id ? "none" : "block",
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* ✅ Pagination footer (unchanged) */}
                    <div className="flex items-center justify-end pt-2 px-4 text-black gap-3">
                        <Button
                            size="small"
                            variant="outlined"
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            sx={{
                                height: 28,
                                fontSize: 11,
                                borderColor: "var(--inputBorderColor)",
                                color: "var(--table-text-color)",
                            }}
                        >
                            Prev
                        </Button>

                        <Button
                            size="small"
                            variant="outlined"
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            sx={{
                                height: 28,
                                fontSize: 11,
                                borderColor: "var(--inputBorderColor)",
                                color: "var(--table-text-color)",
                            }}
                        >
                            Next
                        </Button>

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

                        <p className={`text-[11px] ${styles.txtColorDark}`}>
                            Page {page} of {totalPages} (Total: {totalCount})
                        </p>
                    </div>

                    {/* ✅ Bottom Editor (no buttons) */}
                    <div style={editorWrapSx}>
                        <CustomeInputFields
                            inputFieldData={editorFields || []}
                            values={form}
                            onValuesChange={handleBottomFieldValuesChange}
                            inEditMode={{ isEditMode: isEditable, isCopy: false }}
                            clearFlag={clearFlagLocal}
                            newState={form}
                            setStateVariable={setForm}
                            onChangeHandler={(result) => {
                                if (result?.newState) {
                                    setForm((p) => ({ ...(p || {}), ...(result.newState || {}) }));
                                }
                            }}
                            onBlurHandler={(result) => {
                                if (result?.newState) {
                                    setForm((p) => ({ ...(p || {}), ...(result.newState || {}) }));
                                }
                            }}
                        />

                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                marginTop: 8,
                                flexWrap: "wrap",
                                alignItems: "center",
                            }}
                        >
                            <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--tableRowTextColor)" }}>
                                {mode === "new" ? "Mode: New" : mode === "edit" ? "Mode: Edit" : "Mode: View"}
                                {selectedId ? ` | Selected: ${selectedId}` : ""}
                            </div>
                        </div>
                    </div>
                </TableContainer>
            </Paper>
        </div>
    );
}

SearchEditGrid.propTypes = {
    title: PropTypes.string,
    columns: PropTypes.array,
    editorFields: PropTypes.array,
    rowIdField: PropTypes.string,
    fetchPayload: PropTypes.object,
    fetchRows: PropTypes.func,
    onSave: PropTypes.func,
    onDelete: PropTypes.func,
    height: PropTypes.number,
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

function iconBtnSx({ danger = false } = {}) {
    return {
        border: "1px solid var(--inputBorderColor)",
        background: "var(--page-bg-color)",
        color: danger
            ? "var(--dangerText, var(--table-text-color))"
            : "var(--table-text-color)",
        "&:hover": { background: "var(--tableRowBgHover)" },
        width: 30,
        height: 30,
        borderRadius: "7px",
        mx: 0.4,
    };
}
