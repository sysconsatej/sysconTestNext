"use client";
/* eslint-disable */

import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "@/app/app.module.css";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
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
import Typography from "@mui/material/Typography";
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
import { fontFamilyStyles } from "@/app/globalCss";
export default function SearchEditGrid({
    title = "",
    columns = [],
    editorFields = [],
    rowIdField = "id",
    fetchPayload = {},
    fetchRows,
    onSave,
    onDelete,
    height = 220,
}) {
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [totalCount, setTotalCount] = useState(0);
    const [isColumnSearchOpen, setIsColumnSearchOpen] = useState(false);
    const [activeColumn, setActiveColumn] = useState(null);
    const [columnKeyName, setColumnKeyName] = useState("");
    const [columnKeyValue, setColumnKeyValue] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [mode, setMode] = useState("new");
    const [form, setForm] = useState({});
    const [hoverRowId, setHoverRowId] = useState(null);
    const [clearFlagLocal] = useState({ isClear: false, fieldName: "" });
    const safeStr = (v) => (v === null || v === undefined ? "" : String(v));
    const isEditable = mode === "edit" || mode === "new";
    const totalPages = Math.max(1, Math.ceil((totalCount || 0) / rowsPerPage));

    const hasRows = (rows?.length || 0) > 0;

    const normalizeRow = (r, idx) => {
        const id = r?.[rowIdField] ?? r?.id ?? r?._id ?? r?.rowId ?? idx + 1;
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

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, columnKeyName, columnKeyValue, JSON.stringify(fetchPayload || {})]);

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
            next[f.fieldname] = row?.__raw?.[f.fieldname] ?? row?.[f.fieldname] ?? "";
        });

        setForm(next);
    };

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
            const payload = { ...(form || {}), [rowIdField]: form?.id ?? null };
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

    const paperSx = {
        ...displayTablePaperStyles,
        display: "flex",
        flexDirection: "column",
        height: hasRows ? displayTablePaperStyles.height : "auto",
        minHeight: hasRows ? displayTablePaperStyles.height : "unset",
    };

    const tableContainerSx = {
        ...displayTableContainerStyles,
        height: hasRows ? height : "auto",
        maxHeight: hasRows ? height : "unset",
        overflowY: hasRows ? "auto" : "hidden",
        overflowX: "auto",
        backgroundColor: "var(--page-bg-color)",
        flex: "0 0 auto",
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Paper elevation={0} sx={paperSx}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        px: 1,
                        py: 0.6,
                        borderBottom: "1px solid var(--inputBorderColor)",
                        flex: "0 0 auto",
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
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

                        <Tooltip title="Save">
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
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer className={styles.thinScrollBar} sx={tableContainerSx}>
                    <Table stickyHeader size="small">
                        <TableHead sx={displaytableHeadStyles}>
                            <TableRow>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>{title ? `Sr No` : "Sr No"}</TableCell>

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

                                <TableCell sx={{ whiteSpace: "nowrap", minWidth: 170 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredRowsLocal.length === 0 ? (
                                <TableRow sx={displaytableRowStyles_two()}>
                                    <TableCell colSpan={columns.length + 2} sx={{ fontSize: "var(--tableRowFontSize)", color: "var(--tableRowTextColor)" }}>
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
                                                <TableCell key={c.field}>{safeStr(r?.[c.field])}</TableCell>
                                            ))}

                                            <TableCell onClick={(e) => e.stopPropagation()} sx={{ paddingRight: 1 }}>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        gap: 0.5,
                                                        alignItems: "center",
                                                        opacity: hoverRowId === r.id ? 1 : 0,
                                                        pointerEvents: hoverRowId === r.id ? "auto" : "none",
                                                        transition: "opacity 120ms ease",
                                                        minHeight: 32,
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
                                                            <IconButton size="small" onClick={() => onEdit(r)} disabled={loading} sx={iconBtnSx()}>
                                                                <EditOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>

                                                    <Tooltip title="Copy">
                                                        <span>
                                                            <IconButton size="small" onClick={() => onCopy(r)} disabled={loading} sx={iconBtnSx()}>
                                                                <ContentCopyOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>

                                                    <Tooltip title="Delete">
                                                        <span>
                                                            <IconButton size="small" onClick={() => del(r)} disabled={loading} sx={iconBtnSx({ danger: true })}>
                                                                <DeleteOutlineOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </Box>

                                                {hoverRowId !== r.id && <Box sx={{ minHeight: 32 }} />}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box
                    className={` ${styles.pageContainer}`}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: "10px",
                        px: 2,
                        py: 1,
                        flexWrap: "nowrap",

                        "& button": {
                            height: "28px",
                            minHeight: "28px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "0 14px",
                            lineHeight: "28px",
                            boxSizing: "border-box",
                        },

                        "& input": {
                            height: "30px",
                            lineHeight: "28px",
                            padding: "0 8px",
                            boxSizing: "border-box",
                            fontSize: "11px",
                        },

                        "& .pageText": {
                            lineHeight: "28px",
                            whiteSpace: "nowrap",
                            fontSize: "11px",
                            color: "var(--table-text-color)",
                            margin: 0,
                        },
                    }}
                >
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
                        className={`border ${styles.txtColorDark} ${styles.pageBackground} border-gray-300 rounded-md`}
                        style={{ width: 60 }}
                    />

                    <span className="pageText txtColorDark">
                        Page {page} of {totalPages} (Total: {totalCount})
                    </span>
                </Box>
                <Box sx={{ borderTop: "1px solid var(--inputBg, #fff)", padding: "8px 10px", flex: "0 0 auto" }}>
                    <CustomeInputFields
                        inputFieldData={editorFields || []}
                        values={form}
                        onValuesChange={(vals) => setForm((p) => ({ ...(p || {}), ...(vals || {}) }))}
                        inEditMode={{ isEditMode: isEditable, isCopy: false }}
                        clearFlag={clearFlagLocal}
                        newState={form}
                        setStateVariable={setForm}
                        onChangeHandler={(result) => {
                            if (result?.newState) setForm((p) => ({ ...(p || {}), ...(result.newState || {}) }));
                        }}
                        onBlurHandler={(result) => {
                            if (result?.newState) setForm((p) => ({ ...(p || {}), ...(result.newState || {}) }));
                        }}
                    />

                    <Box sx={{ display: "flex", mt: 1, alignItems: "center" }}>
                        <Box sx={{ ml: "auto", fontSize: 11, color: "var(--tableRowTextColor)" }}>
                            {mode === "new" ? "Mode: New" : mode === "edit" ? "Mode: Edit" : "Mode: View"}
                            {selectedId ? ` | Selected: ${selectedId}` : ""}
                        </Box>
                    </Box>
                </Box>
            </Paper >
        </Box >
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
        <Paper
            ref={ref}
            sx={{
                ...createAddEditPaperStyles,
                zIndex: 9999,
                position: "absolute",
                top: "100%",
                left: 0,
                mt: "4px",
                minWidth: 220,
            }}
        >
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
        color: danger ? "var(--dangerText, var(--table-text-color))" : "var(--table-text-color)",
        "&:hover": { background: "var(--tableRowBgHover)" },
        width: 30,
        height: 30,
        borderRadius: "7px",
        mx: 0.3,
    };
}
