"use client";
/* eslint-disable */
import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import styles from "@/app/app.module.css";

// MUI
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

// ✅ Your theme-friendly styles (already in your project)
import {
    displayTablePaperStyles,
    displayTableContainerStyles,
    displaytableHeadStyles,
    displaytableRowStyles_two,
    createAddEditPaperStyles,
    searchInputStyling,
    customTextFieldStyles,
} from "@/app/globalCss";

export default function ContainerSheet({
    values = {},
    onValuesChange,
    clearFlag,
    inEditMode = { isEditMode: false, isCopy: false },
    newState,
    setStateVariable,
}) {
    // ✅ Replace with your real endpoints
    const API_LIST = "/api/blcontainer/list";
    const API_UPSERT = "/api/blcontainer/update"; // can handle insert/update
    const API_DELETE = "/api/blcontainer/delete"; // optional (if you have)

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);

    // ✅ paging
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [totalCount, setTotalCount] = useState(0);

    // ✅ (kept) global search state - not shown in UI now (you can re-add later)
    const [query, setQuery] = useState("");

    // ✅ column right-click filter
    const [isColumnSearchOpen, setIsColumnSearchOpen] = useState(false);
    const [activeColumn, setActiveColumn] = useState(null);
    const [columnKeyName, setColumnKeyName] = useState("");
    const [columnKeyValue, setColumnKeyValue] = useState("");

    // ✅ selection + bottom editor
    const [selectedId, setSelectedId] = useState(null);
    const [mode, setMode] = useState("view"); // view | edit | new
    const [form, setForm] = useState(getEmptyForm());

    // helpers
    const safeStr = (v) => (v === null || v === undefined ? "" : String(v));
    const isEditable = mode === "edit" || mode === "new";

    // ✅ columns (top grid)
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

    // ✅ normalize backend row -> UI row
    const normalizeRow = (r, idx) => ({
        id: r?.blContainerId ?? r?.id ?? r?._id ?? idx + 1,
        containerNo: r?.containerNo ?? "",
        sealNo: r?.sealNo ?? "",
        sealDate: r?.sealDate ?? "",
        type: r?.containerType ?? r?.type ?? "",
        pkgsStuffed: r?.pkgsStuffed ?? r?.pkgs ?? "",
        grossWeight: r?.grossWt ?? r?.grossWeight ?? "",
        sealType: r?.sealType ?? "",
        __raw: r,
    });

    const fetchRows = async () => {
        setLoading(true);
        try {
            const payload = {
                pageNo: page,
                pageSize: rowsPerPage,
                // ✅ no top search UI now, but payload still supports (kept blank)
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

            // ✅ if selected row no longer exists, reset selection
            if (selectedId && !mapped.some((x) => x.id === selectedId)) {
                setSelectedId(null);
                setMode("view");
                setForm(getEmptyForm());
            }
        } catch (e) {
            console.error("tblBlContainer fetch error:", e);
            setRows([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRows();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, query, columnKeyName, columnKeyValue]);

    // ✅ no visible search bar now => show rows directly
    const filteredRowsLocal = useMemo(() => {
        // keep column filter functional
        if (!columnKeyName || !columnKeyValue) return rows;

        const ck = (columnKeyName || "").trim();
        const cv = (columnKeyValue || "").trim().toLowerCase();

        return rows.filter((r) => safeStr(r?.[ck]).toLowerCase().includes(cv));
    }, [rows, columnKeyName, columnKeyValue]);

    // -----------------------------
    // Column Search (right-click)
    // -----------------------------
    const handleRightClick = (event, columnId) => {
        event.preventDefault();
        setActiveColumn(columnId);
        setIsColumnSearchOpen(true);
    };

    const clearAllFilters = () => {
        setQuery("");
        setColumnKeyName("");
        setColumnKeyValue("");
        setActiveColumn(null);
        setIsColumnSearchOpen(false);
        setPage(1);
    };

    const totalPages = Math.max(1, Math.ceil((totalCount || 0) / rowsPerPage));

    // -----------------------------
    // Row select -> load into editor
    // -----------------------------
    const selectRow = (row) => {
        setSelectedId(row?.id ?? null);
        setMode("view");
        setForm({
            id: row?.id ?? null,
            containerNo: row?.containerNo ?? "",
            sealNo: row?.sealNo ?? "",
            sealDate: row?.sealDate ?? "",
            type: row?.type ?? "",
            pkgsStuffed: row?.pkgsStuffed ?? "",
            grossWeight: row?.grossWeight ?? "",
            sealType: row?.sealType ?? "",
            // optional extra:
            moveDocType: row?.__raw?.moveDocType ?? "",
            moveDocNo: row?.__raw?.moveDocNo ?? "",
            location: row?.__raw?.location ?? "",
            grWtTRWt: row?.__raw?.grWtTRWt ?? "",
        });
    };

    const setF = (k, v) => setForm((p) => ({ ...(p || {}), [k]: v }));

    // -----------------------------
    // Bottom buttons like screenshot
    // -----------------------------
    const onNew = () => {
        setSelectedId(null);
        setMode("new");
        setForm(getEmptyForm());
    };

    const onEdit = () => {
        if (!selectedId) return;
        setMode("edit");
    };

    const onClose = () => {
        setMode("view");
        setSelectedId(null);
        setForm(getEmptyForm());
    };

    const upsert = async ({ keepNew = false } = {}) => {
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

            if (keepNew) {
                setMode("new");
                setSelectedId(null);
                setForm(getEmptyForm());
            } else {
                setMode("view");
                if (savedId) setSelectedId(savedId);
            }
        } catch (e) {
            console.error("tblBlContainer upsert error:", e);
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        if (!form?.id) return;
        setLoading(true);
        try {
            const res = await fetch(API_DELETE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ blContainerId: form.id }),
            });

            if (!res.ok) throw new Error("Delete failed");

            setSelectedId(null);
            setMode("view");
            setForm(getEmptyForm());
            await fetchRows();
        } catch (e) {
            console.error("tblBlContainer delete error:", e);
        } finally {
            setLoading(false);
        }
    };

    const fieldSx = {
        ...customTextFieldStyles,
        "& .MuiOutlinedInput-root": {
            height: "27px",
            backgroundColor: "var(--inputBg)",
        },
        "& .MuiInputBase-input": { fontSize: "10px" },
        "& .MuiInputLabel-root": { fontSize: "10px" },
    };

    const labelStyle = {
        fontSize: "10px",
        fontWeight: 600,
        color: "var(--tableRowTextColor)",
        whiteSpace: "nowrap",
        paddingRight: 6,
    };

    const editorWrapSx = {
        borderTop: "1px solid var(--inputBorderColor)",
        backgroundColor: "var(--page-bg-color)",
        padding: "8px 10px",
    };

    const editorRowDesktop = {
        display: "grid",
        gridTemplateColumns: "90px 1fr 90px 1fr 90px 1fr 90px 1fr",
        gap: "6px 10px",
        alignItems: "center",
    };

    const editorRowMobile = {
        display: "grid",
        gridTemplateColumns: "120px 1fr",
        gap: "6px 10px",
        alignItems: "center",
    };

    return (
        <div style={{ width: "100%" }}>

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
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {filteredRowsLocal.length === 0 ? (
                                <TableRow sx={displaytableRowStyles_two()}>
                                    <TableCell
                                        colSpan={columns.length + 1}
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
                                            onClick={() => selectRow(r)}
                                        >
                                            <TableCell>{(page - 1) * rowsPerPage + (idx + 1)}</TableCell>
                                            {columns.map((c) => (
                                                <TableCell key={c.id}>{safeStr(r?.[c.id])}</TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>

                    {/* ✅ pagination footer (FIXED parseInt base) */}
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
                                const v = parseInt(e.target.value || "15", 10); // ✅ base MUST be 10
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

                    {/* ✅ BOTTOM EDITOR */}
                    <div style={editorWrapSx}>
                        {/* row 1 */}
                        <div style={isMobile ? editorRowMobile : editorRowDesktop}>
                            <div style={labelStyle}>Container No</div>
                            <TextField
                                size="small"
                                value={form.containerNo}
                                onChange={(e) => setF("containerNo", e.target.value)}
                                disabled={!isEditable}
                                sx={fieldSx}
                            />

                            {!isMobile && (
                                <>
                                    <div style={labelStyle}>Type</div>
                                    <TextField
                                        size="small"
                                        select
                                        value={form.type}
                                        onChange={(e) => setF("type", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    >
                                        <MenuItem value="">--</MenuItem>
                                        <MenuItem value="20 High Cube">20 High Cube</MenuItem>
                                        <MenuItem value="40 High Cube">40 High Cube</MenuItem>
                                        <MenuItem value="20 GP">20 GP</MenuItem>
                                        <MenuItem value="40 GP">40 GP</MenuItem>
                                    </TextField>

                                    <div style={labelStyle}>Pkts Stuffed</div>
                                    <TextField
                                        size="small"
                                        value={form.pkgsStuffed}
                                        onChange={(e) => setF("pkgsStuffed", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    />

                                    <div style={labelStyle}>Gross Weight</div>
                                    <TextField
                                        size="small"
                                        value={form.grossWeight}
                                        onChange={(e) => setF("grossWeight", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    />
                                </>
                            )}
                        </div>

                        {isMobile && (
                            <>
                                <div style={{ height: 6 }} />
                                <div style={editorRowMobile}>
                                    <div style={labelStyle}>Type</div>
                                    <TextField
                                        size="small"
                                        select
                                        value={form.type}
                                        onChange={(e) => setF("type", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    >
                                        <MenuItem value="">--</MenuItem>
                                        <MenuItem value="20 High Cube">20 High Cube</MenuItem>
                                        <MenuItem value="40 High Cube">40 High Cube</MenuItem>
                                        <MenuItem value="20 GP">20 GP</MenuItem>
                                        <MenuItem value="40 GP">40 GP</MenuItem>
                                    </TextField>

                                    <div style={labelStyle}>Pkts Stuffed</div>
                                    <TextField
                                        size="small"
                                        value={form.pkgsStuffed}
                                        onChange={(e) => setF("pkgsStuffed", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    />

                                    <div style={labelStyle}>Gross Weight</div>
                                    <TextField
                                        size="small"
                                        value={form.grossWeight}
                                        onChange={(e) => setF("grossWeight", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    />
                                </div>
                            </>
                        )}

                        {/* row 2 */}
                        <div style={{ height: 6 }} />

                        <div style={isMobile ? editorRowMobile : editorRowDesktop}>
                            <div style={labelStyle}>Seal No</div>
                            <TextField
                                size="small"
                                value={form.sealNo}
                                onChange={(e) => setF("sealNo", e.target.value)}
                                disabled={!isEditable}
                                sx={fieldSx}
                            />

                            {!isMobile && (
                                <>
                                    <div style={labelStyle}>Seal Date</div>
                                    <TextField
                                        size="small"
                                        placeholder="dd-mmm-yyyy"
                                        value={form.sealDate}
                                        onChange={(e) => setF("sealDate", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    />

                                    <div style={labelStyle}>Seal Type</div>
                                    <TextField
                                        size="small"
                                        select
                                        value={form.sealType}
                                        onChange={(e) => setF("sealType", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    >
                                        <MenuItem value="">--</MenuItem>
                                        <MenuItem value="BTSL - Bottle">BTSL - Bottle</MenuItem>
                                        <MenuItem value="Cable">Cable</MenuItem>
                                        <MenuItem value="Metal">Metal</MenuItem>
                                    </TextField>

                                    <div style={labelStyle}>Location</div>
                                    <TextField
                                        size="small"
                                        value={form.location}
                                        onChange={(e) => setF("location", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    />
                                </>
                            )}
                        </div>

                        {isMobile && (
                            <>
                                <div style={{ height: 6 }} />
                                <div style={editorRowMobile}>
                                    <div style={labelStyle}>Seal Date</div>
                                    <TextField
                                        size="small"
                                        placeholder="dd-mmm-yyyy"
                                        value={form.sealDate}
                                        onChange={(e) => setF("sealDate", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    />

                                    <div style={labelStyle}>Seal Type</div>
                                    <TextField
                                        size="small"
                                        select
                                        value={form.sealType}
                                        onChange={(e) => setF("sealType", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    >
                                        <MenuItem value="">--</MenuItem>
                                        <MenuItem value="BTSL - Bottle">BTSL - Bottle</MenuItem>
                                        <MenuItem value="Cable">Cable</MenuItem>
                                        <MenuItem value="Metal">Metal</MenuItem>
                                    </TextField>

                                    <div style={labelStyle}>Location</div>
                                    <TextField
                                        size="small"
                                        value={form.location}
                                        onChange={(e) => setF("location", e.target.value)}
                                        disabled={!isEditable}
                                        sx={fieldSx}
                                    />
                                </div>
                            </>
                        )}

                        {/* Buttons row */}
                        <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                            <Button size="small" variant="outlined" onClick={onNew} disabled={loading} sx={btnSx()}>
                                New
                            </Button>

                            <Button
                                size="small"
                                variant="outlined"
                                onClick={onEdit}
                                disabled={loading || !selectedId}
                                sx={btnSx()}
                            >
                                Edit
                            </Button>

                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => upsert({ keepNew: false })}
                                disabled={loading || !isEditable}
                                sx={btnSx()}
                            >
                                Update
                            </Button>

                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => upsert({ keepNew: true })}
                                disabled={loading || !isEditable}
                                sx={btnSx()}
                            >
                                Update &amp; New
                            </Button>

                            <Button
                                size="small"
                                variant="outlined"
                                onClick={onDelete}
                                disabled={loading || !form?.id}
                                sx={btnSx({ danger: true })}
                            >
                                Delete
                            </Button>

                            <Button size="small" variant="outlined" onClick={onClose} disabled={loading} sx={btnSx()}>
                                Close
                            </Button>

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

ContainerSheet.propTypes = {
    values: PropTypes.object,
    onValuesChange: PropTypes.func,
    clearFlag: PropTypes.object,
    inEditMode: PropTypes.object,
    newState: PropTypes.object,
    setStateVariable: PropTypes.func,
};

// -----------------------------
// ✅ Column search popup (right click)
// -----------------------------
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

// -----------------------------
// helpers
// -----------------------------
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

function btnSx({ danger = false } = {}) {
    return {
        height: 26,
        fontSize: 11,
        borderColor: danger ? "var(--dangerBorder, var(--inputBorderColor))" : "var(--inputBorderColor)",
        color: danger ? "var(--dangerText, var(--table-text-color))" : "var(--table-text-color)",
        backgroundColor: "var(--page-bg-color)",
        "&:hover": { backgroundColor: "var(--tableRowBgHover)" },
    };
}

function iconBtnSx() {
    return {
        border: "1px solid var(--inputBorderColor)",
        background: "var(--page-bg-color)",
        color: "var(--table-text-color)",
        "&:hover": { background: "var(--tableRowBgHover)" },
        width: 32,
        height: 32,
    };
}
