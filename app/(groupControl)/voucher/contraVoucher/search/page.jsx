"use client";
/* eslint-disable */
// If your tooling expects React in scope:
import React, { useState, useRef, useEffect, useMemo } from "react";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import { getUserDetails } from "@/helper/userDetails";
import PropTypes from "prop-types";
import {
  parentAccordionSection,
  SummaryStyles,
  searchInputStyling,
  childTableHeaderStyle,
  childAccordionSection,
  createAddEditPaperStyles,
  gridEditIconStyles,
  accordianDetailsStyleForm,
  childTableRowStyles,
  totalSumChildStyle,
  expandIconStyle,
} from "@/app/globalCss";
import LightTooltip from "@/components/Tooltip/customToolTip";
import styles from "@/app/app.module.css";
import AccordionSummary from "@mui/material/AccordionSummary";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import {
  refreshIcon,
  saveIcon,
  addLogo,
  plusIconHover,
  revertHover,
  saveIconHover,
} from "@/assets";
import CustomeInputFields from "@/components/StaticInputs/customeInputFields";
import { toast, ToastContainer } from "react-toastify";
import { areObjectsEqual, hasBlackValues } from "@/helper/checkValue";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import IconButton from "@mui/material/IconButton";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import FilterListIcon from "@mui/icons-material/FilterList";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RowComponent from "@/app/(groupControl)/voucher/bankReceipt/addEdit/RowComponent/RowComponent.jsx";
import { fontFamilyStyles } from "@/app/globalCss";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { getVoucher } from "@/services/auth/FormControl.services";
import { insertVoucherData } from "@/services/auth/FormControl.services";
import { expandAllIcon, closeIconRed } from "@/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchReportData } from "@/services/auth/FormControl.services.js";
import { useDispatch, useSelector } from "react-redux";

export default function VoucherBankReceiptAdd() {
  const selectedMenuId = useSelector((state) => state?.counter?.selectedMenuId);
  const { push } = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [voucher, setVoucher] = useState({});
  const [newState, setNewState] = useState(formState);
  const [childsFields, setChildsFields] = useState(isTdsApplicable);
  const [expandAll, setExpandAll] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [isError, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [displayField, setDisplayField] = useState(true);
  const [clearFlag, setClearFlag] = useState({
    isClear: false,
    fieldName: "",
  });
  const [submitNewState, setSubmitNewState] = useState({
    routeName: "mastervalue",
  });
  const [formControlData, setFormControlData] = useState([]);
  const [parentsFields, setParentsFields] = useState(
    parentFieldIsTdsNotApplied
  );
  const [expandedAccordion, setExpandedAccordion] = useState([]);
  const [tableName, setTableName] = useState(false);
  const [hideFieldName, setHideFieldName] = useState([]);
  const [labelName, setLabelName] = useState("");
  const [totals, setTotals] = useState({
    osAmtFC: 0,
    osAmtHC: 0,
    allocatedAmtHC: 0,
    allocatedAmtFC: 0,
    balanceAmtFC: 0,
    balanceAmtHC: 0,
    tdsAmtFC: 0,
    tdsAmtHC: 0,
  });
  const [voucherLedgerTotals, setVoucherLedgerTotals] = useState({
    debitAmount: 0,
    creditAmount: 0,
    debitAmountFc: 0,
    creditAmountFc: 0,
  });
  const isView = false;
  const { clientId } = getUserDetails();
  const { companyId } = getUserDetails();
  const { branchId } = getUserDetails();
  const { financialYear } = getUserDetails();
  const { emailId } = getUserDetails();
  const { userId } = getUserDetails();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const prevFilledRef = useRef(false);

  console.log("newState=>", newState);

  // helper to safely parse numbers
  // ----------------- helpers -----------------
  const toNum = (v, fallback = 0) => {
    if (v == null) return fallback;
    const s = String(v).replace(/,/g, "").trim();
    const n = Number(s);
    return Number.isFinite(n) ? n : fallback;
  };

  function useDebouncedValue(value, delay = 250) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
      const id = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
  }

  const parseForCalc = (v) => {
    const raw = v ?? "";
    const s = String(raw).replace(/,/g, "").trim();
    if (s === "") return { n: 0, empty: true }; // allow empty in UI; treat as 0 for math
    const n = Number(s);
    return { n: Number.isFinite(n) ? n : 0, empty: false };
  };

  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  // ----------------- inside your component -----------------
  const rowsAll = newState?.tblVoucherLedgerDetails ?? [];

  /* ========= HC debounce signal (UNIQUE NAME) ========= */
  const detailsSigHC = useMemo(() => {
    try {
      return JSON.stringify(
        rowsAll.map((r) => ({
          OsAmtHC: r?.OsAmtHC ?? 0,
          allocatedAmtHC: r?.allocatedAmtHC ?? "",
          balanceAmtHC: r?.balanceAmtHC ?? null,
          voucherNo: r?.voucherNo ?? null,
          invoiceIds: r?.invoiceIds ?? null,
        }))
      );
    } catch {
      return String(rowsAll?.length || 0);
    }
  }, [rowsAll]);

  const debouncedHCSig = useDebouncedValue(detailsSigHC, 250);

  /* ========= FC debounce signal (UNIQUE NAME) ========= */
  const detailsSigFC = useMemo(() => {
    try {
      return JSON.stringify(
        rowsAll.map((r) => ({
          OsAmtFC: r?.OsAmtFC ?? 0,
          allocatedAmtFC: r?.allocatedAmtFC ?? "",
          balanceAmtFC: r?.balanceAmtFC ?? null,
          voucherNo: r?.voucherNo ?? null,
          invoiceIds: r?.invoiceIds ?? null,
        }))
      );
    } catch {
      return String(rowsAll?.length || 0);
    }
  }, [rowsAll]);

  const debouncedFCSig = useDebouncedValue(detailsSigFC, 200);

  /* =========================
   * HC ROW-WISE CLAMP EFFECT
   * ========================= */
  useEffect(() => {
    const rows = Array.isArray(newState?.tblVoucherLedgerDetails)
      ? newState.tblVoucherLedgerDetails
      : [];
    if (rows.length === 0) return;

    const amtRecHC = toNum(newState?.amtRec);
    const hasHCCap = amtRecHC > 0;

    // Parse rows once
    const parsed = rows.map((r) => ({
      osHC: toNum(r.OsAmtHC),
      ...parseForCalc(r.allocatedAmtHC),
      raw: r,
    }));

    // Prefix sum of previous allocations (as-is from user)
    const prefixAllocated = new Array(parsed.length).fill(0);
    for (let i = 1; i < parsed.length; i++) {
      prefixAllocated[i] = round2(
        prefixAllocated[i - 1] + Math.max(0, parsed[i - 1].n)
      );
    }

    let didChange = false;

    const next = parsed.map((p, i) => {
      // remaining BEFORE this row
      let remainingBefore = hasHCCap
        ? round2(amtRecHC - prefixAllocated[i])
        : Number.POSITIVE_INFINITY;
      if (!Number.isFinite(remainingBefore) || remainingBefore < 0)
        remainingBefore = 0;

      // cap by OS only if OS > 0
      const osCap = p.osHC > 0 ? p.osHC : Number.POSITIVE_INFINITY;
      const allowed = Math.max(0, Math.min(osCap, remainingBefore));

      let allocAdj = p.n;
      let mutatedAlloc = false;

      if (allocAdj < 0) {
        allocAdj = 0;
        mutatedAlloc = true;
      } else if ((hasHCCap || p.osHC > 0) && allocAdj > allowed) {
        allocAdj = allowed; // clamp to remaining
        mutatedAlloc = true;
      }

      const balance =
        p.osHC > 0 ? round2(p.osHC - allocAdj) : p.raw.balanceAmtHC ?? "";
      const balanceStr =
        typeof balance === "number"
          ? balance === 0
            ? "0"
            : String(balance)
          : balance;

      const nextRow = { ...p.raw };

      // update balance if changed
      if (String(nextRow.balanceAmtHC ?? "") !== String(balanceStr ?? "")) {
        nextRow.balanceAmtHC = balanceStr;
        didChange = true;
      }

      // only overwrite allocatedAmtHC if we actually clamped/adjusted it
      if (mutatedAlloc) {
        const allocStr = allocAdj === 0 ? "0" : String(allocAdj);
        if (String(nextRow.allocatedAmtHC ?? "") !== allocStr) {
          nextRow.allocatedAmtHC = allocStr;
          didChange = true;
        }
      }

      return nextRow;
    });

    if (didChange) {
      setNewState((prev) => ({
        ...prev,
        tblVoucherLedgerDetails: next,
      }));
    }
  }, [debouncedHCSig, newState?.amtRec]);

  /* =========================
   * HC GLOBAL BALANCE EFFECT
   * ========================= */
  useEffect(() => {
    const amtRecHC = toNum(newState?.amtRec);
    const rows = Array.isArray(newState?.tblVoucherLedgerDetails)
      ? newState.tblVoucherLedgerDetails
      : [];

    const totalAllocatedHC = round2(
      rows.reduce((sum, r) => sum + toNum(r?.allocatedAmtHC), 0)
    );
    if (Number.isNaN(amtRecHC) || Number.isNaN(totalAllocatedHC)) return;

    let remainingHC = round2(amtRecHC - totalAllocatedHC);
    if (remainingHC < 0) remainingHC = 0;

    const remainingHCStr = remainingHC === 0 ? "0" : String(remainingHC);

    if (newState?.balanceAmtHc !== remainingHCStr) {
      setNewState((prev) => ({
        ...prev,
        balanceAmtHc: remainingHCStr,
      }));
    }
  }, [newState?.amtRec, newState?.tblVoucherLedgerDetails]);

  /* =========================
   * FC ROW-WISE CLAMP EFFECT
   * ========================= */
  useEffect(() => {
    const fcRows = Array.isArray(newState?.tblVoucherLedgerDetails)
      ? newState.tblVoucherLedgerDetails
      : [];
    if (fcRows.length === 0) return;

    const amtRecFC = toNum(newState?.amtRecFC); // total received in FC
    const hasFCCap = amtRecFC > 0;

    // Parse rows once for FC values
    const parsedFC = fcRows.map((r) => ({
      osAmtFC: toNum(r.OsAmtFC), // opening/bill FC
      ...parseForCalc(r.allocatedAmtFC), // { n, empty }
      rawRow: r,
    }));

    // Prefix sum of previous FC allocations
    const prefixAllocatedFC = new Array(parsedFC.length).fill(0);
    for (let i = 1; i < parsedFC.length; i++) {
      prefixAllocatedFC[i] = round2(
        prefixAllocatedFC[i - 1] + Math.max(0, parsedFC[i - 1].n)
      );
    }

    let didChange = false;

    const updatedRows = parsedFC.map((p, i) => {
      // Remaining FC before this row
      let remainingBeforeFC = hasFCCap
        ? round2(amtRecFC - prefixAllocatedFC[i])
        : Number.POSITIVE_INFINITY;
      if (!Number.isFinite(remainingBeforeFC) || remainingBeforeFC < 0)
        remainingBeforeFC = 0;

      // Cap by OS FC only if > 0
      const osCapFC = p.osAmtFC > 0 ? p.osAmtFC : Number.POSITIVE_INFINITY;

      // Allowed allocation for this row
      const allowedFC = Math.max(0, Math.min(osCapFC, remainingBeforeFC));

      let adjustedAllocFC = p.n;
      let mutatedAllocFC = false;

      if (adjustedAllocFC < 0) {
        adjustedAllocFC = 0;
        mutatedAllocFC = true;
      } else if ((hasFCCap || p.osAmtFC > 0) && adjustedAllocFC > allowedFC) {
        adjustedAllocFC = allowedFC; // clamp to remaining
        mutatedAllocFC = true;
      }

      // Compute balance FC if OS > 0, otherwise leave as-is
      const balanceFC =
        p.osAmtFC > 0
          ? round2(p.osAmtFC - adjustedAllocFC)
          : p.rawRow.balanceAmtFC ?? "";
      const balanceFCStr =
        typeof balanceFC === "number"
          ? balanceFC === 0
            ? "0"
            : String(balanceFC)
          : balanceFC;

      const nextRow = { ...p.rawRow };

      // Update balanceAmtFC if changed
      if (String(nextRow.balanceAmtFC ?? "") !== String(balanceFCStr ?? "")) {
        nextRow.balanceAmtFC = balanceFCStr;
        didChange = true;
      }

      // Only overwrite allocatedAmtFC if we clamped
      if (mutatedAllocFC) {
        const allocFCStr =
          adjustedAllocFC === 0 ? "0" : String(adjustedAllocFC);
        if (String(nextRow.allocatedAmtFC ?? "") !== allocFCStr) {
          nextRow.allocatedAmtFC = allocFCStr;
          didChange = true;
        }
      }

      return nextRow;
    });

    if (didChange) {
      setNewState((prev) => ({
        ...prev,
        tblVoucherLedgerDetails: updatedRows,
      }));
    }
  }, [debouncedFCSig, newState?.amtRecFC]);

  /* =========================
   * FC GLOBAL BALANCE EFFECT
   * ========================= */
  useEffect(() => {
    const amtRecFC = toNum(newState?.amtRecFC);
    const fcRows = Array.isArray(newState?.tblVoucherLedgerDetails)
      ? newState.tblVoucherLedgerDetails
      : [];

    const totalAllocatedFC = round2(
      fcRows.reduce((sum, r) => sum + toNum(r?.allocatedAmtFC), 0)
    );
    if (Number.isNaN(amtRecFC) || Number.isNaN(totalAllocatedFC)) return;

    let remainingFC = round2(amtRecFC - totalAllocatedFC);
    if (remainingFC < 0) remainingFC = 0;

    const remainingFCStr = remainingFC === 0 ? "0" : String(remainingFC);

    if (newState?.balanceAmtFc !== remainingFCStr) {
      setNewState((prev) => ({
        ...prev,
        balanceAmtFc: remainingFCStr,
      }));
    }
  }, [newState?.amtRecFC, newState?.tblVoucherLedgerDetails]);

  /* =========================
   * TOTALS (HC + FC)
   * ========================= */
  useEffect(() => {
    console.log(
      "newState?.tblVoucherLedgerDetails",
      newState?.tblVoucherLedgerDetails
    );
    const list = newState?.tblVoucherLedgerDetails ?? [];
    if (!list.length) return;

    const sumField = (field) =>
      list.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);

    setTotals({
      osAmtFC: sumField("OsAmtFC").toFixed(2),
      osAmtHC: sumField("OsAmtHC").toFixed(2),
      allocatedAmtHC: sumField("allocatedAmtHC").toFixed(2),
      allocatedAmtFC: sumField("allocatedAmtFC").toFixed(2),
      balanceAmtFC: sumField("balanceAmtFC").toFixed(2),
      balanceAmtHC: sumField("balanceAmtHC").toFixed(2),
      tdsAmtFC: sumField("tdsAmtFC").toFixed(2),
      tdsAmtHC: sumField("tdsAmtHC").toFixed(2),
    });
  }, [newState?.tblVoucherLedgerDetails]);
  //omkar
  const lastCreditTotalRef = useRef(0);
  const lastDebitTotalRef = useRef(0);

  useEffect(() => {
    const list = newState?.tblVoucherLedger ?? [];

    // When list is empty, reset refs and exit
    if (!list.length) {
      lastCreditTotalRef.current = 0;
      lastDebitTotalRef.current = 0;
      return;
    }

    const toNum = (v) =>
      v === null || v === undefined ? 0 : parseFloat(v) || 0;

    const totalCredit = list.reduce((sum, r) => sum + toNum(r.creditAmount), 0);
    const totalDebit = list.reduce((sum, r) => sum + toNum(r.debitAmount), 0);

    const deltaCredit = totalCredit - lastCreditTotalRef.current; // add
    const deltaDebit = totalDebit - lastDebitTotalRef.current; // subtract
    const netDelta = deltaCredit - deltaDebit;

    if (netDelta !== 0) {
      setNewState((prev) => {
        const prevBal = toNum(prev.balanceAmtHc);
        const newBal = prevBal + netDelta; // credit adds, debit subtracts
        return { ...prev, balanceAmtHc: newBal.toString() };
      });
    }

    // update refs after applying
    lastCreditTotalRef.current = totalCredit;
    lastDebitTotalRef.current = totalDebit;
  }, [JSON.stringify(newState?.tblVoucherLedger)]);

  //omkar
  useEffect(() => {
    console.log("newState?.tblVoucherLedger", newState?.tblVoucherLedger);
    if (newState?.tblVoucherLedger?.length) {
      const details = newState.tblVoucherLedger;

      // Utility function to sum a field safely
      const sumField = (field) =>
        details.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);

      setVoucherLedgerTotals({
        debitAmount: sumField("debitAmount").toFixed(2),
        creditAmount: sumField("creditAmount").toFixed(2),
        debitAmountFc: sumField("debitAmountFc").toFixed(2),
        creditAmountFc: sumField("creditAmountFc").toFixed(2),
      });
    }
  }, [newState]);

  //Setting allocated amount
  const rows = newState?.tblVoucherLedgerDetails ?? [];

  // Build a signature so the effect runs when any relevant field changes
  const allocSig = useMemo(
    () =>
      rows
        .map((r) => {
          const key = r.id ?? r.indexValue ?? "";
          const auto = r.autoSetAllocatedAmount ? 1 : 0;
          return `${key}:${auto}:${r.OsAmtFC ?? ""}:${r.OsAmtHC ?? ""}`;
        })
        .join("|"),
    [rows]
  );

  useEffect(() => {
    if (!rows.length) return;

    const toNumOrNull = (v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = Number(String(v).replace(/,/g, ""));
      return Number.isFinite(n) ? n : null;
    };

    let changed = false;

    const nextRows = rows.map((r) => {
      const targetFC = r.autoSetAllocatedAmount ? toNumOrNull(r.OsAmtFC) : null;
      const targetHC = r.autoSetAllocatedAmount ? toNumOrNull(r.OsAmtHC) : null;

      const curFC = r.allocatedAmtFC ?? null;
      const curHC = r.allocatedAmtHC ?? null;

      if (curFC !== targetFC || curHC !== targetHC) {
        changed = true;
        return { ...r, allocatedAmtFC: targetFC, allocatedAmtHC: targetHC };
      }
      return r;
    });

    if (changed) {
      setNewState((prev) => ({
        ...prev,
        tblVoucherLedgerDetails: nextRows,
      }));
    }
  }, [allocSig]);
  //Setting allocated amount

  // //Setting currency
  useEffect(() => {
    // already set (by user or earlier)? do nothing
    if (newState?.currencyId) return;

    let cancelled = false;

    (async () => {
      try {
        const requestBody = {
          columns: "cp.currencyId, md.code",
          tableName:
            "tblCompanyParameter cp Left Join tblMasterData md on md.id = cp.currencyId",
          whereCondition: `cp.status = 1 and cp.clientId = ${clientId}`,
          clientIdCondition: `cp.companyId = ${companyId} FOR JSON PATH`,
        };

        const response = await fetchReportData(requestBody);
        const row = Array.isArray(response?.data) ? response.data[0] : null;

        if (!cancelled && row?.currencyId) {
          // set only if still missing (don’t overwrite user changes)
          setNewState((prev) =>
            prev?.currencyId
              ? prev
              : {
                  ...prev,
                  currencyId: row.currencyId,
                  currencyIddropdown: row.code,
                }
          );
        }
      } catch (err) {
        console.error("fetchReportData failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [clientId, companyId]); // run on mount / when ids change

  //Setting currency

  //Set Voucher Date
  const todayStr = () => {
    const d = new Date(); // local (IST)
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return; // run only once
    setNewState((prev) =>
      prev?.voucherDate ? prev : { ...prev, voucherDate: todayStr() }
    );
    didInitRef.current = true;
  }, []);

  const getCurrencyId = (s) =>
    s?.currencyId ?? s?.currencyIddropdown?.[0]?.value ?? null;
  const norm = (v) => (v == null ? "" : String(v).trim());
  const prevCidRef = useRef(""); // stores the last *normalized* currencyId we acted on

  useEffect(() => {
    let active = true;

    const run = async () => {
      const cid = norm(getCurrencyId(newState)); // "" for null/undefined

      // only act if value changed (including to/from "")
      if (cid === prevCidRef.current) return;
      prevCidRef.current = cid;

      // if empty/null: still "hit" this branch
      if (cid === "") {
        // choose what you want to do when currency is cleared:
        // e.g., show the TDS-not-applied parent fields or reset
        setParentsFields(parentFieldIsTdsNotApplied);
        return; // stop here if you don't need the DB fetch for empty
      }

      // non-empty: fetch company default and compare
      try {
        const requestBody = {
          columns: "currencyId",
          tableName: "tblCompanyParameter",
          whereCondition: `companyId = ${companyId} and clientId = ${clientId}`,
          clientIdCondition: `status = 1 FOR JSON PATH,INCLUDE_NULL_VALUES`,
        };

        const reportData = await fetchReportData(requestBody);
        if (!active) return;

        if (
          reportData?.success === true &&
          Array.isArray(reportData.data) &&
          reportData.data.length > 0
        ) {
          const dbCurrencyId = norm(reportData.data[0]?.currencyId);

          if (dbCurrencyId === cid) {
            setParentsFields(sameCurrencyHideField);
          } else {
            setParentsFields(parentFieldIsTdsNotApplied);
          }
        } else {
          // no company default found → pick your fallback
          setParentsFields(parentFieldIsTdsNotApplied);
        }
      } catch (err) {
        console.error("fetchReportData failed:", err);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [newState?.currencyId, newState?.currencyIddropdown]);

  const getLabelValue = (labelValue) => {
    setLabelName(labelValue);
  };

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const requestBody = {
          clientId: clientId,
          glId: newState.paymentByParty,
        };
        const result = await getVoucher(requestBody);
        setVoucher(result.vouchers);
        if (result.vouchers && result.vouchers.length > 0) {
          const voucherDataToInsert = result?.vouchers.map(
            (voucher, index) => ({
              ...voucher,
              autoSetAllocatedAmount: false,
              indexValue: index,
            })
          );
          setNewState((pre) => ({
            ...pre,
            tblVoucherLedgerDetails: voucherDataToInsert,
          }));
        }
        console.log("voucher", result.vouchers);
      } catch (err) {
        console.error("Error fetching voucher:", err);
      }
    };

    if (newState) {
      fetchVoucher();
    }
  }, [newState.paymentByParty]);

  useEffect(() => {
    const v = newState?.tdsApplicable;

    // No action if not set yet
    if (v === undefined || v === null || v === "") return;

    const isTrue = v === true || v === "true" || v === 1 || v === "1";
    const isFalse = v === false || v === "false" || v === 0 || v === "0";

    if (isTrue) {
      setChildsFields(isTdsApplicable);
      setParentsFields(parentFieldIsTdsApplied);
      setDisplayField(true);
    } else if (isFalse) {
      setChildsFields(isTdsNotApplicable);
      setParentsFields(parentFieldIsTdsNotApplied);
      setNewState((prev) => ({
        ...prev,
        tdsAmt: null,
        tdsAmtFC: null,
      }));
      setDisplayField(false);
    }
  }, [newState?.tdsApplicable]);

  const handleFieldValuesChange = (updatedValues) => {
    const entries = Object.entries(updatedValues);
    const hasFile = entries.some(([, value]) => value instanceof File);

    if (hasFile) {
      // Process each entry and handle files specifically
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          // Process the file and update the corresponding key with JSON data
          handleFileAndUpdateState(value, (jsonData) => {
            const newFormFieldsValues = { ...newState, [key]: jsonData };
            setNewState(newFormFieldsValues);
            setSubmitNewState(newFormFieldsValues);
          });
        } else {
          // Directly merge non-file data into the state
          const newFormFieldsValues = { ...newState, [key]: value };
          setNewState(newFormFieldsValues);
          setSubmitNewState(newFormFieldsValues);
        }
      });
    } else {
      // No files, proceed as normal
      const formFieldsValues = { ...newState, ...updatedValues };
      setNewState(formFieldsValues);
      setSubmitNewState(formFieldsValues);
    }
  };

  const handleFieldValuesChange2 = async (
    updatedValues,
    field,
    formControlData
  ) => {
    try {
      const requestData = {
        id: updatedValues.copyMappingName,
        filterValue: field[field.length - 1],
        menuID: uriDecodedMenu.id,
      };

      const getCopyDetails = await getCopyData(requestData);
      if (!getCopyDetails.success) {
        toast.error(getCopyDetails.Message);
        return;
      }
      let dataToCopy = {};
      getCopyDetails.keyToValidate.fieldsMaping
        .filter((data) => !data.isChild)
        .forEach((data) => {
          if (
            Array.isArray(getCopyDetails.data[0][data.toColmunName]) &&
            formControlData?.controlname.toLowerCase() == "multiselect"
          ) {
            dataToCopy[data.toColmunName] = newState[data.toColmunName].concat(
              getCopyDetails.data[0][data.toColmunName]
            );
          } else {
            dataToCopy[data.toColmunName] =
              getCopyDetails.data[0][data.toColmunName];
          }
        });
      getCopyDetails.keyToValidate.fieldsMaping
        .filter((data) => data.isChild)
        .forEach((data) => {
          dataToCopy[data?.toTableName] =
            getCopyDetails.data[0][data?.toTableName];
        });
      let childData = getCopyDetails.keyToValidate.fieldsMaping.filter(
        (data) => data.isChild == "true"
      );
      setChildsFields((prev) => {
        let updatedFields = [...prev];
        childData.forEach((data) => {
          let index = updatedFields.findIndex(
            (i) => i.tableName === data.toColmunName
          );

          if (index !== -1) {
            updatedFields[index] = {
              ...updatedFields[index],
              isAddFunctionality: data.isAddFunctionality,
              isDeleteFunctionality: data.isDeleteFunctionality,
              isCopyFunctionality: data.isCopyFunctionality,
            };
          }
        });
        return updatedFields;
      });

      const dataObj = getCopyDetails.data[0];

      Object.keys(dataObj).forEach((key) => {
        if (Array.isArray(dataObj[key])) {
          dataObj[key] = dataObj[key].map((item, index) => ({
            ...item,
            indexValue: index + 1,
          }));
        }
      });

      const finalIndexdata = {
        ...getCopyDetails,
        data: [dataObj, ...(getCopyDetails?.data?.slice(1) || [])],
      };

      setNewState((prevState) => {
        finalIndexdata.keyToValidate.fieldsMaping.forEach((data) => {
          if (data.isChild == "true") {
            if (typeof prevState[data.ToColmunName] === "undefined") {
              prevState[data.ToColmunName] = [];
            }
            for (const iterator of finalIndexdata.data[0][data.ToColmunName]) {
              prevState[data.ToColmunName].push(iterator);
            }
          }
        });

        return {
          ...prevState,
          ...finalIndexdata.data[0],
        };
      });
      setSubmitNewState((prevState) => ({
        ...prevState,
        ...finalIndexdata.data[0],
      }));
      console.log("newState ===", newState);

      setKeysTovalidate(finalIndexdata.keyToValidate.fieldsMaping);
    } catch (error) {
      console.error("Fetch Error :", error);
    }
  };
  const handleSubmit = async () => {
    try {
      const { clientId, userId, companyId, branchId, financialYear, emailId } =
        getUserDetails();

      for (const [section, fields] of Object.entries(parentsFields)) {
        const missingField = Object.entries(fields).find(
          // eslint-disable-next-line no-unused-vars
          ([, { isRequired, fieldname, yourlabel }]) =>
            isRequired && !newState[fieldname]
        );

        if (missingField) {
          const [, { yourlabel }] = missingField;
          toast.error(`Value for ${yourlabel} is missing.`);
          return;
        }
      }

      const now = new Date(); // optional, if you want to add createdDate

      let insertData = {
        ...newState,
        clientId,
        createdBy: userId,
        companyId,
        companyBranchId: branchId,
        financialYearId: financialYear,
        emailId,
      };

      console.log("insertData 1 ==>", insertData);

      if (
        insertData &&
        insertData.tblVoucherLedger &&
        insertData.tblVoucherLedger.length > 0
      ) {
        insertData.tblVoucherLedger = insertData.tblVoucherLedger.map(
          (item) => ({
            ...item,
            clientId,
            createdBy: userId,
            companyId,
            companyBranchId: branchId,
            financialYearId: financialYear,
            // createdDate: now, // optional
          })
        );
      }

      if (
        insertData &&
        insertData.tblVoucherLedgerDetails &&
        insertData.tblVoucherLedgerDetails.length > 0
      ) {
        insertData.tblVoucherLedgerDetails =
          insertData.tblVoucherLedgerDetails.map((item) => ({
            ...item,
            clientId,
            createdBy: userId,
            companyId,
            companyBranchId: branchId,
            financialYearId: financialYear,
            tdsApp: true,
            // createdDate: now, // optional
          }));
      }

      console.log("insertData 2 ==>", insertData);

      const requestBody = {
        recordId: null,
        clientId,
        companyId,
        companyBranchId: branchId,
        financialYearId: financialYear,
        userId,
        json: { ...insertData, menuId: selectedMenuId },
      };

      const result = await insertVoucherData(requestBody);

      if (result.success) {
        setNewState(formState);
        //setSubmitNewState({});
        toast.success(result.message || "Save successfully.");
      } else {
        toast.error(result.message || "Save failed.");
      }
    } catch (err) {
      toast.error("Error submitting form.");
      console.error(err);
    }
  };

  const handleClose = async () => {
    push("/voucher/bankReceipt");
  };

  return (
    <>
      <div className="overflow-y-auto overflow-x-hidden h-[90vh] [scrollbar-gutter:stable] pr-2">
        {/* <button
            className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
            type="button"
            onClick={() => handleSubmit()}
          >
            {"Submit"}
          </button>
          <button
            className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
            type="Close"
          >
            {"Close"}
          </button> */}
        <div className="flex justify-between items-center w-full">
          {/* Left buttons */}
          <div className="flex gap-2">
            <button
              className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              type="button"
              onClick={() => handleSubmit()}
            >
              Submit
            </button>
            <button
              className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              type="button"
              onClick={() => handleClose()}
            >
              Close
            </button>
          </div>

          {/* Right icon buttons */}
          <div className="flex items-center gap-2">
            <LightTooltip title={expandAll ? "Collapse All" : "Expand All"}>
              <IconButton
                onClick={() => setExpandAll((expand) => !expand)}
                sx={{
                  width: "25px",
                  height: "25px",
                  padding: "7px",
                  backgroundColor: "var(--accordion-summary-bg)",
                }}
                className={`${styles?.accordianSummaryBg} rounded-full shadow-md`}
              >
                <Image
                  src={expandAllIcon}
                  alt={expandAll ? "Collapse All" : "Expand All"}
                  width={20}
                  height={20}
                  className={`cursor-pointer opacity-60 ${
                    expandAll
                      ? "rotate-180 transition-all duration-300"
                      : "transition-all duration-300"
                  }`}
                />
              </IconButton>
            </LightTooltip>

            <LightTooltip title="Close">
              <IconButton
                onClick={() => handleClose()}
                sx={{
                  width: "25px",
                  height: "25px",
                  padding: "7px",
                  backgroundColor: "var(--accordion-summary-bg)",
                }}
                className="rounded-full shadow-md"
              >
                <Image src={closeIconRed} alt="Close" width={20} height={20} />
              </IconButton>
            </LightTooltip>
          </div>
        </div>
        <div className="mt-2">
          {/* Parents Accordian */}
          {Object.keys(parentsFields).map((section, index) => {
            return (
              <React.Fragment key={index}>
                <ParentAccordianComponent
                  expandAll={expandAll}
                  section={section}
                  indexValue={index}
                  parentsFields={parentsFields}
                  handleFieldValuesChange={handleFieldValuesChange}
                  handleFieldValuesChange2={handleFieldValuesChange2}
                  expandedAccordion={expandedAccordion}
                  setNewState={setNewState}
                  newState={newState}
                  setExpandedAccordion={setExpandedAccordion}
                  setOpenModal={setOpenModal}
                  setParaText={setParaText}
                  setIsError={setIsError}
                  setTypeofModal={setTypeofModal}
                  clearFlag={clearFlag}
                  setClearFlag={setClearFlag}
                  setSubmitNewState={setSubmitNewState}
                  parentTableName={tableName}
                  formControlData={formControlData}
                  setFormControlData={setFormControlData}
                  getLabelValue={getLabelValue}
                  hideColumnsId={hideFieldName}
                  isView={isView}
                />
              </React.Fragment>
            );
          })}
        </div>
        <div>
          {childsFields.map((section, index) => (
            <>
              <div key={index} className="w-full">
                <ChildAccordianComponent
                  section={section}
                  key={index}
                  newState={newState}
                  setNewState={setNewState}
                  handleFieldValuesChange2={handleFieldValuesChange2}
                  indexValue={index}
                  expandAll={expandAll}
                  setExpandAll={setExpandAll}
                  originalData={originalData}
                  setOpenModal={setOpenModal}
                  setParaText={setParaText}
                  setIsError={setIsError}
                  setTypeofModal={setTypeofModal}
                  clearFlag={clearFlag}
                  setClearFlag={setClearFlag}
                  submitNewState={submitNewState}
                  setSubmitNewState={setSubmitNewState}
                  formControlData={formControlData}
                  setFormControlData={setFormControlData}
                  getLabelValue={getLabelValue}
                  isView={isView}
                />
                {section?.tableName === "tblVoucherLedgerDetails" && (
                  <div
                    className="w-[100%] text-white bg-[var(--accordionChildHeaderBg)] text-[11px] pt-1 pb-1 ps-4"
                    style={{ marginTop: "-15px" }}
                  >
                    <div className="flex">
                      <div
                        className={`${displayField ? "w-[23%]" : "w-[28%]"}`}
                      >
                        <p>Total</p>
                      </div>
                      <div className="w-[8.5%] text-center">
                        <p>{totals.osAmtFC}</p>
                      </div>
                      <div className="w-[8.5%] text-center">
                        <p>{totals.osAmtHC}</p>
                      </div>
                      <div
                        className={`${
                          displayField ? "w-[8.5%]" : "w-[10%]"
                        } text-center`}
                      >
                        <p></p>
                      </div>
                      <div
                        className={`${
                          displayField ? "w-[8.5%]" : "w-[12%]"
                        } text-center`}
                      >
                        <p>{totals.allocatedAmtFC}</p>
                      </div>
                      <div
                        className={`${
                          displayField ? "w-[8.5%]" : "w-[11%]"
                        } text-center`}
                      >
                        <p>{totals.allocatedAmtHC}</p>
                      </div>
                      {displayField == true && (
                        <>
                          <div className="w-[8.5%] text-center">
                            <p>{totals.tdsAmtFC}</p>
                          </div>
                          <div className="w-[8.5%] text-center">
                            <p>{totals.tdsAmtHC}</p>
                          </div>
                        </>
                      )}
                      <div
                        className={`${
                          displayField ? "w-[8.5%]" : "w-[11%]"
                        } text-center`}
                      >
                        <p>{totals.balanceAmtFC}</p>
                      </div>
                      <div className="w-[8.5%] text-center">
                        <p>{totals.balanceAmtHC}</p>
                      </div>
                    </div>
                  </div>
                )}
                {section?.tableName === "tblVoucherLedger" && (
                  <div
                    className="w-[100%] text-white bg-[var(--accordionChildHeaderBg)] text-[11px] pt-1 pb-1 ps-4"
                    style={{ marginTop: "-15px" }}
                  >
                    <div className="flex">
                      <div className={"w-[28%]"}>
                        <p>Total</p>
                      </div>
                      <div className="w-[16.5%] text-center">
                        <p>{voucherLedgerTotals.debitAmount}</p>
                      </div>
                      <div className="w-[15%] text-center">
                        <p>{voucherLedgerTotals.creditAmount}</p>
                      </div>
                      <div className="w-[15%] text-center">
                        <p>{voucherLedgerTotals.debitAmountFc}</p>
                      </div>
                      <div className="w-[19%] text-center">
                        <p>{voucherLedgerTotals.creditAmountFc}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ))}
        </div>
      </div>
    </>
  );
}

ParentAccordianComponent.propTypes = {
  section: PropTypes.any,
  indexValue: PropTypes.any,
  newState: PropTypes.any,
  parentsFields: PropTypes.any,
  handleFieldValuesChange: PropTypes.any,
  handleFieldValuesChange2: PropTypes.any,
  expandAll: PropTypes.any,
  setNewState: PropTypes.any,
  setOpenModal: PropTypes.any,
  setParaText: PropTypes.any,
  setIsError: PropTypes.any,
  setTypeofModal: PropTypes.any,
  clearFlag: PropTypes.any,
  setClearFlag: PropTypes.any,
  setSubmitNewState: PropTypes.any,
  parentTableName: PropTypes.any,
  formControlData: PropTypes.any,
  setFormControlData: PropTypes.any,
  hideColumnsId: PropTypes.any,
  getLabelValue: PropTypes.any,
  isView: PropTypes.any,
};

function ParentAccordianComponent({
  section,
  indexValue,
  newState,
  expandAll,
  parentsFields,
  handleFieldValuesChange,
  handleFieldValuesChange2,
  setNewState,
  setOpenModal,
  setParaText,
  setIsError,
  setTypeofModal,
  clearFlag,
  setClearFlag,
  setSubmitNewState,
  parentTableName,
  formControlData,
  setFormControlData,
  getLabelValue,
  hideColumnsId,
  isView,
}) {
  const [isParentAccordionOpen, setIsParentAccordionOpen] = useState(false);
  const [fieldId, setFieldId] = useState([]);

  useEffect(() => {
    setIsParentAccordionOpen(expandAll);
  }, [expandAll]);

  useEffect(() => {
    setFieldId(hideColumnsId);
  }, [hideColumnsId]);

  function handleChangeFunction(result) {
    if (result?.isCheck === false) {
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
  function handleBlurFunction(result) {
    if (result.isCheck === false) {
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
    <React.Fragment key={indexValue}>
      <Accordion
        expanded={isParentAccordionOpen}
        sx={{
          ...parentAccordionSection,
        }}
        key={indexValue}
      >
        <AccordionSummary
          className="relative left-[11px]"
          sx={{ ...SummaryStyles }}
          expandIcon={
            <LightTooltip title={isParentAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon
                sx={{ ...expandIconStyle }}
                onClick={() => setIsParentAccordionOpen((prev) => !prev)}
              />
            </LightTooltip>
          }
          aria-controls={`panel${indexValue + 1}-content`}
          id={`panel${indexValue + 1}-header`}
        >
          <Typography className="relative right-[11px]" key={indexValue}>
            {section}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          className={` overflow-hidden p-0 ${styles.thinScrollBar}`}
          sx={{
            ...accordianDetailsStyleForm,
          }}
        >
          <div className="">
            <CustomeInputFields
              inputFieldData={parentsFields[section]}
              values={newState}
              onValuesChange={handleFieldValuesChange}
              handleFieldValuesChange2={handleFieldValuesChange2}
              inEditMode={{ isEditMode: false, isCopy: true }}
              onChangeHandler={(result) => {
                handleChangeFunction(result);
                //                console.log("result---", result);
              }}
              onBlurHandler={(result) => {
                handleBlurFunction(result);
              }}
              clearFlag={clearFlag}
              newState={newState}
              tableName={parentTableName}
              formControlData={formControlData}
              setFormControlData={setFormControlData}
              setStateVariable={setNewState}
              getLabelValue={getLabelValue}
              hideColumnsId={fieldId}
              isView={isView}
            />
          </div>
        </AccordionDetails>
      </Accordion>
    </React.Fragment>
  );
}

ChildAccordianComponent.propTypes = {
  section: PropTypes.any,
  indexValue: PropTypes.any,
  newState: PropTypes.any,
  setNewState: PropTypes.any,
  expandAll: PropTypes.any,
  handleFieldValuesChange2: PropTypes.any,
  setOpenModal: PropTypes.any,
  setParaText: PropTypes.any,
  setIsError: PropTypes.any,
  setTypeofModal: PropTypes.any,
  clearFlag: PropTypes.any,
  setClearFlag: PropTypes.any,
  submitNewState: PropTypes.any,
  setSubmitNewState: PropTypes.any,
  formControlData: PropTypes.any,
  setFormControlData: PropTypes.any,
  //
  getLabelValue: PropTypes.any,
  isView: PropTypes.any,
};
function ChildAccordianComponent({
  section,
  indexValue,
  handleFieldValuesChange2,
  newState,
  setNewState,
  expandAll,
  setOpenModal,
  setParaText,
  setIsError,
  setTypeofModal,
  clearFlag,
  setClearFlag,
  submitNewState,
  setSubmitNewState,
  formControlData,
  setFormControlData,
  //
  getLabelValue,
  isView,
}) {
  const tableRef = useRef(null);
  const [clickCount, setClickCount] = useState(0);
  const [inputFieldsVisible, setInputFieldsVisible] = useState(false);
  const [isChildAccordionOpen, setIschildAccordionOpen] = useState(false);
  const [childObject, setChildObject] = useState({});
  const [renderedData, setRenderedData] = useState([]);
  const [isInputVisible, setInputVisible] = useState(false);
  const [activeColumn, setActiveColumn] = useState(null);
  const [originalData, setOriginalData] = useState(null);
  const [prevSearchInput, setPrevSearchInput] = useState("");
  const [isAscending, setIsAscending] = useState(true);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [copyChildValueObj, setCopyChildValueObj] = useState([]);
  const [isGridEdit, setIsGridEdit] = useState(true);
  const [columnTotals, setColumnTotals] = useState({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [calculateData, setCalculateData] = useState(0);
  const [dummyFieldArray, setDummyFieldArray] = useState([]);
  const [isButton, setIsButton] = useState(false);

  // for scrolling table
  const [tableBodyWidhth, setTableBodyWidth] = useState("0px");

  useEffect(() => {
    if (formControlData?.tableName === "tblVehicleRoute") {
      (async () => {
        await setSameDDValueFromParentToChild();
      })();
    }
  }, [newState?.jobId]);

  const setSameDDValueFromParentToChild = async () => {
    const rawIds = String(newState.jobId || "").split(",");

    const getIds = rawIds
      .map((id) => id.trim())
      .filter((id) => id !== "")
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));

    // If no valid IDs, reset the accordion and table
    if (getIds.length === 0) {
      setIschildAccordionOpen((pre) => !pre);
      setNewState((prev) => ({
        ...prev,
        tblVehicleRouteDetails: [],
      }));
      return;
    }

    // Fetch report data for each job ID in parallel
    const reportPromises = getIds.map((id) => {
      const requestBody = {
        columns: "id,jobNo",
        tableName: "tblJob",
        whereCondition: `id = '${id}'`,
        clientIdCondition: "status=1 FOR JSON PATH",
      };
      return fetchReportData(requestBody);
    });

    let reports;
    try {
      reports = await Promise.all(reportPromises);
    } catch (err) {
      console.error("Failed to fetch some reports:", err);
      reports = [];
    }

    // Build updated route details by preserving existing state
    const vehicleRouteDetails = getIds.map((id, idx) => {
      const rec = reports[idx]?.data?.[0] || null;
      const option = rec ? { value: rec.id, label: rec.jobNo } : null;

      const existing = newState.tblVehicleRouteDetails?.[idx] || {};

      return {
        ...existing, // preserve existing interactive state (e.g., disabled flags, user edits)
        jobId: id,
        jobIddropdown: option ? [option] : [],
        jobIdText: option ? [option] : [],
        indexValue: idx,
      };
    });

    // Update the state
    setNewState((prev) => ({
      ...prev,
      tblVehicleRouteDetails: vehicleRouteDetails,
    }));
  };

  const handleFieldChildrenValuesChange = (updatedValues) => {
    console.log("updatedValues", { ...childObject, ...updatedValues });

    setChildObject((prevObject) => ({ ...prevObject, ...updatedValues }));
  };

  const childButtonHandler = (section, indexValue, islastTab) => {
    //    console.log("childButtonHandler", section);
    if (isChildAccordionOpen) {
      setClickCount((prevCount) => prevCount + 1);
    }

    inputFieldsVisible == false && setInputFieldsVisible((prev) => !prev);
    if (inputFieldsVisible) {
      let Data = { ...childObject };
      for (var feild of section.fields) {
        if (
          feild.isRequired &&
          (!Object.prototype.hasOwnProperty.call(
            childObject,
            feild.fieldname
          ) ||
            childObject[feild.fieldname]?.trim() === "")
        ) {
          toast.error(`Value for ${feild.yourlabel} is missing or empty.`);
          return;
        }
      }

      toast.dismiss();
      try {
        if (section.functionOnSubmit && section.functionOnSubmit !== null) {
          let functonsArray = section.functionOnSubmit?.trim().split(";");
          //          console.log("functonsArray", functonsArray);

          // let Data = { ...childObject }
          for (const fun of functonsArray) {
            if (typeof onSubmitValidation[fun] == "function") {
            }

            let updatedData = onSubmitFunctionCall(
              fun,
              newState,
              formControlData,
              Data,
              setChildObject
            );
            if (updatedData?.alertShow == true) {
              // if (updatedData.type == "success") {
              //   toast.success(updatedData.message);

              // }
              // else {
              // toast.error(updatedData.message);
              setParaText(updatedData.message);
              setIsError(true);
              setOpenModal((prev) => !prev);
              setTypeofModal("onCheck");
              // setClearFlag({
              //   isClear: true,
              //   fieldName: result.fieldName,
              // });
              // }
            }
            if (updatedData) {
              Data = updatedData.values;
              setNewState((prevState) => {
                return {
                  ...prevState,
                  ...updatedData?.newState,
                };
              });
              setSubmitNewState((prevState) => {
                return {
                  ...prevState,
                  ...updatedData?.newState,
                };
              });
            }
          }
        }
      } catch (error) {
        return toast.error(error.message);
      }

      // try {
      //   if (typeof onSubmitValidation[section.functionOnSubmit] == "function") {
      //   onSubmitValidation?.[section.functionOnSubmit]({
      //     ...childObject})
      //   }
      // } catch (error) {
      //  return toast.error(error.message);
      // }
      const tmpData = { ...newState };
      const subChild = section.subChild?.reduce((obj, item) => {
        obj[item.tableName] = [];
        return obj;
      }, {});
      Object.assign(subChild, Data);
      if (hasBlackValues(subChild)) {
        return;
      }
      tmpData[section.tableName].push({
        ...subChild,
        isChecked: true,
        indexValue: tmpData[section.tableName].length,
      });
      setNewState(tmpData);
      setSubmitNewState(tmpData);
      setOriginalData(tmpData);
      setRenderedData(newState[section.tableName]);
      setChildObject({});
      setInputFieldsVisible((prev) => !prev);
      if (islastTab == true) {
        setTimeout(() => {
          setInputFieldsVisible((prev) => !prev);
        }, 3);
      }
      // islastTab == true &&
    }
  };

  useEffect(() => {
    let tmpData = { ...childObject };
    section.fields?.forEach((item) => {
      if (["checkbox", "radio"].includes(item.controlname.toLowerCase())) {
        tmpData[item.fieldname] = false;
      }
    });
    setChildObject((prevObject) => ({ ...prevObject, ...tmpData }));
  }, []);

  const childExpandedAccordion = () => {
    setIschildAccordionOpen((prev) => !prev);
  };

  useEffect(() => {
    setIschildAccordionOpen(expandAll);
  }, [expandAll]);
  const handleScroll = () => {
    const container = tableRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight;
      if (isAtBottom) {
        //        // console.log("You have reached the bottom of the scroll.");
        renderMoreData();
      }
    }
  };

  // Function to calculate totals for a single row
  const calculateTotalForRow = (rowData) => {
    // Iterate over each field in the fields array
    section.fields?.forEach((item) => {
      // Check if the field requires grid total and is of type 'number' or 'text'
      if (
        item.gridTotal &&
        (item.type === "number" ||
          item.type === "decimal" ||
          item.type === "string")
      ) {
        // Calculate total based on grid type
        const newValue =
          item.gridTypeTotal === "s"
            ? rowData?.reduce((sum, row) => {
                const parsedValue =
                  typeof row[item.fieldname] === "number"
                    ? row[item.fieldname]
                    : parseFloat(row[item.fieldname] || 0);
                return isNaN(parsedValue) ? sum : sum + parsedValue;
              }, 0) // Calculate sum for 's' type
            : rowData?.filter((row) => row[item.fieldname]).length; // Calculate count for 'c' type
        setColumnTotals((prevColumnTotals) => ({
          ...prevColumnTotals,
          tableName: section.tableName,
          [item.fieldname]: newValue,
        }));
      }
    });
  };

  useEffect(() => {
    // Initialize with initial data
    setRenderedData(newState[section.tableName]?.slice(0, 10)); // Initially render 10 items
    calculateTotalForRow(newState[section.tableName]);
    if (
      newState[section.tableName] &&
      newState[section.tableName]?.length > 0
    ) {
      setClickCount(1);
    }
  }, [newState]);

  const renderMoreData = () => {
    // Calculate the index range to render
    const lastIndex = renderedData.length + 10;
    const newData = newState[section.tableName]?.slice(
      renderedData.length,
      lastIndex
    );
    setRenderedData((prevData) => [...prevData, ...newData]);
  };

  const deleteChildRecord = (index) => {
    try {
      if (section.functionOnDelete && section.functionOnDelete !== null) {
        let functonsArray = section.functionOnDelete?.trim().split(";");
        // let functonsArray = ["setCalculateVolume(volume)"]
        //        console.log("functonsArray", functonsArray);
        let UpdatedNewState = {
          ...newState,
          [section.tableName]: newState[section.tableName].filter(
            (_, i) => i !== index
          ),
        };
        let Data = { ...newState[section.tableName][index] };
        for (const fun of functonsArray) {
          if (typeof onSubmitValidation[fun] == "function") {
          }

          let updatedData = onSubmitFunctionCall(
            fun,
            UpdatedNewState,
            formControlData,
            {},
            setChildObject
          );
          if (updatedData?.alertShow == true) {
            // if (updatedData.type == "success") {
            //   toast.success(updatedData.message);

            // }
            // else {
            // toast.error(updatedData.message);
            setParaText(updatedData.message);
            setIsError(true);
            setOpenModal((prev) => !prev);
            setTypeofModal("onCheck");
            // setClearFlag({
            //   isClear: true,
            //   fieldName: result.fieldName,
            // });
            // }
          }
          if (updatedData) {
            Data = updatedData.values;
            setNewState((prevState) => {
              return {
                ...prevState,
                ...updatedData?.newState,
              };
            });
            setSubmitNewState((prevState) => {
              return {
                ...prevState,
                ...updatedData?.newState,
              };
            });
          }
        }
      } else {
        setNewState((prevState) => {
          const newStateCopy = { ...prevState };
          const updatedData = newStateCopy[section.tableName].filter(
            (_, idx) => idx !== index
          );
          newStateCopy[section.tableName] = updatedData;

          if (updatedData.length === 0) {
            //setInputFieldsVisible((prev) => !prev);
          }
          return newStateCopy;
        });
        setSubmitNewState((prevState) => {
          const newStateCopy = { ...prevState };
          const updatedData = newStateCopy[section.tableName].filter(
            (_, idx) => idx !== index
          );
          newStateCopy[section.tableName] = updatedData;
          if (updatedData.length === 0) {
            //setInputFieldsVisible((prev) => !prev);
          }
          return newStateCopy;
        });
        setOriginalData((prevState) => {
          const newStateCopy = { ...prevState };
          const updatedData = newStateCopy[section?.tableName]?.filter(
            (_, idx) => idx !== index
          );
          newStateCopy[section.tableName] = updatedData;
          if (updatedData?.length === 0) {
            //setInputFieldsVisible((prev) => !prev);
            setInputFieldsVisible(true);
          }
          return newStateCopy;
        });
      }
    } catch (error) {
      setNewState((prevState) => {
        const newStateCopy = { ...prevState };
        const updatedData = newStateCopy[section.tableName].filter(
          (_, idx) => idx !== index
        );
        newStateCopy[section.tableName] = updatedData;

        if (updatedData.length === 0) {
          //setInputFieldsVisible((prev) => !prev);
        }
        return newStateCopy;
      });
      setSubmitNewState((prevState) => {
        const newStateCopy = { ...prevState };
        const updatedData = newStateCopy[section.tableName].filter(
          (_, idx) => idx !== index
        );
        newStateCopy[section.tableName] = updatedData;
        if (updatedData.length === 0) {
          //setInputFieldsVisible((prev) => !prev);
        }
        return newStateCopy;
      });
      setOriginalData((prevState) => {
        const newStateCopy = { ...prevState };
        const updatedData = newStateCopy[section?.tableName]?.filter(
          (_, idx) => idx !== index
        );
        newStateCopy[section.tableName] = updatedData;
        if (updatedData?.length === 0) {
          //setInputFieldsVisible((prev) => !prev);
          //setInputFieldsVisible(true);
        }
        return newStateCopy;
      });
      return toast.error(error.message);
    }

    // setNewState((prevState) => {
    //   const newStateCopy = { ...prevState };
    //   const updatedData = newStateCopy[section.tableName].filter(
    //     (_, idx) => idx !== index
    //   );
    //   newStateCopy[section.tableName] = updatedData;

    //   if (updatedData.length === 0) {
    //     setInputFieldsVisible((prev) => !prev);
    //   }
    //   return newStateCopy;
    // });
    // setSubmitNewState((prevState) => {
    //   const newStateCopy = { ...prevState };
    //   const updatedData = newStateCopy[section.tableName].filter(
    //     (_, idx) => idx !== index
    //   );
    //   newStateCopy[section.tableName] = updatedData;
    //   if (updatedData.length === 0) {
    //     setInputFieldsVisible((prev) => !prev);
    //   }
    //   return newStateCopy;
    // });
    // setOriginalData((prevState) => {
    //   const newStateCopy = { ...prevState };
    //   const updatedData = newStateCopy[section?.tableName]?.filter(
    //     (_, idx) => idx !== index
    //   );
    //   newStateCopy[section.tableName] = updatedData;
    //   if (updatedData?.length === 0) {
    //     setInputFieldsVisible((prev) => !prev);
    //   }
    //   return newStateCopy;
    // });
  };

  // eslint-disable-next-line no-unused-vars
  const removeChildRecordFromInsert = (id, index) => {
    setSubmitNewState((prevState) => {
      const newStateCopy = { ...newState, ...prevState };
      // Assume each entry in the array has an 'id' property
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index
      );
      updatedData = { ...updatedData[0], isChecked: false };
      newStateCopy[section.tableName][index] = updatedData;
      return newStateCopy;
    });
    setNewState((prevState) => {
      const newStateCopy = { ...prevState };
      // Assume each entry in the array has an 'id' property
      // const updatedData = newStateCopy[section.tableName].filter(
      //   (item) => item._id !== id
      // );
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index
      );
      updatedData = { ...updatedData[0], isChecked: false };
      newStateCopy[section.tableName][index] = updatedData;
      return newStateCopy;
    });
  };

  //right click function
  const handleRightClick = (event, columnId) => {
    event.preventDefault(); // Prevent the default context menu
    setInputVisible(true); // Show the input field
    setActiveColumn(columnId); // Set the active column to the one that was right-clicked
    // setOriginalData(newState);
  };

  CustomizedInputBase.propTypes = {
    columnData: PropTypes.array,
    setPrevSearchInput: PropTypes.func,
    prevSearchInput: PropTypes.string,
    controlerName: PropTypes.string,
  };
  function CustomizedInputBase({
    columnData,
    setPrevSearchInput,
    prevSearchInput,
    controlerName,
  }) {
    const [searchInput, setSearchInput] = useState(prevSearchInput || "");

    // Custom filter logic
    function filterFunction(searchValue, columnKey) {
      if (!searchValue.trim()) {
        setInputVisible(false);
        setSubmitNewState(originalData);
        return setNewState(originalData);
      }
      const lowercasedInput = searchValue.toLowerCase();
      const filtered = newState[section.tableName].filter((item) => {
        // Access the item's property based on columnKey and convert to string for comparison
        let columnValue = "";
        if (controlerName.toLowerCase() === "dropdown") {
          const dropdownColumnValue = columnKey + "dropdown";
          const dropdownItem = item[dropdownColumnValue][0].label;
          columnValue = dropdownItem
            ? String(`${dropdownItem}`).toLowerCase()
            : "";
          return columnValue.includes(lowercasedInput);
        } else {
          columnValue = String(item[columnKey]).toLowerCase();
          return columnValue.includes(lowercasedInput);
        }
      });

      if (filtered.length === 0) {
        toast.error("No matching records found.");
        return;
      }
      setNewState({ ...newState, [section.tableName]: filtered });
      setSubmitNewState({ ...newState, [section.tableName]: filtered });
      setInputVisible(false);
      setPrevSearchInput(searchValue);
    }

    function handleClose() {
      setSearchInput("");
      setPrevSearchInput("");
    }

    return (
      <Paper
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
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              filterFunction(searchInput, columnData.fieldname);
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
            onClick={() => filterFunction(searchInput, columnData.fieldname)}
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

  // Function to handle sorting when a column header is clicked
  const handleSortBy = (columnId) => {
    // If the same column is clicked again, toggle the sorting order
    if (sortedColumn === columnId) {
      setIsAscending(!isAscending);
      sortJSON(renderedData, columnId, isAscending ? "asc" : "desc");
    } else {
      // If a different column is clicked, update the sortedColumn state and set sorting order to ascending
      setSortedColumn(columnId);
      setIsAscending(true);
    }
  };

  const renderSortIcon = (columnId) => {
    if (sortedColumn === columnId) {
      return (
        <>
          {isAscending ? (
            <LightTooltip title="Descending">
              <ArrowDownwardIcon
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "1",
                  color: "#636363",
                }}
              />
            </LightTooltip>
          ) : (
            <LightTooltip title="Ascending">
              <ArrowUpwardIcon
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "1",
                  color: "#636363",
                }}
              />
            </LightTooltip>
          )}
        </>
      );
    } else {
      return (
        <>
          {isAscending ? (
            <LightTooltip title="Ascending">
              <ArrowUpwardIcon
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "0",
                  color: "#636363",
                }}
              />
            </LightTooltip>
          ) : (
            <LightTooltip title="Descending">
              <ArrowDownwardIcon
                fontSize="small"
                className={`${styles.ArrowDropUpIcon}`}
                sx={{
                  opacity: "0",
                  color: "#636363",
                }}
              />
            </LightTooltip>
          )}
        </>
      );
    }
  };

  function handleChangeFunction(result) {
    if (result?.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    let data = { ...result?.values };
    // let data = { ...result.newState };
    setChildObject((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }
  function handleBlurFunction(result) {
    if (result.isCheck === false) {
      if (result.alertShow) {
        setParaText(result.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    let data = { ...result?.values };
    // let data = { ...result.newState };
    setChildObject((pre) => {
      return {
        ...pre,
        ...data,
      };
    });
  }

  function gridEditHandle(tableName) {
    if (isGridEdit) {
      toast.warn("Please save the changes before editing");
      return;
    }
    setCopyChildValueObj((prev) => {
      // Clone the previous state
      const newCopy = { ...prev };
      // Ensure there's an array to push to for the tableName
      if (newCopy[tableName] === undefined) {
        newCopy[tableName] = [];
      }
      // Append the new state for the tableName
      newCopy[tableName].push(newState[tableName]);
      // Return the modified copy
      return newCopy;
    });

    // Toggle the isGridEdit state
    setIsGridEdit((prevState) => !prevState);
  }

  function gridEditSaveFunction(tableName, section) {
    const objectsToValidate = copyChildValueObj[tableName][0]; // array of objects
    for (const field of section.fields) {
      // Loop through the fields that need validation
      let isFieldValid = false; // Track if the current field is valid

      for (const object of objectsToValidate) {
        // Loop through each object in your array
        if (field.isRequired) {
          // Check if the field exists in the object and it is not empty
          if (
            Object.prototype.hasOwnProperty.call(object, field.fieldname) &&
            object[field.fieldname] &&
            object[field.fieldname].trim() !== ""
          ) {
            isFieldValid = true; // Field is valid, break out of the loop for this field
            break;
          }
        }
      }

      if (!isFieldValid && field.isRequired) {
        // If no valid entry was found and the field is required
        toast.error(`Value for ${field.yourlabel} is missing or empty.`);
        return; // Exit the function if a validation fails
      }
    }
    setNewState((prev) => {
      return {
        ...prev,
        [tableName]: copyChildValueObj[tableName]?.[0],
      };
    });
    setSubmitNewState((prev) => {
      return {
        ...prev,
        [tableName]: copyChildValueObj[tableName]?.[0],
      };
    });
    setIsGridEdit(!isGridEdit);
    setCopyChildValueObj([]);
  }
  function gridEditCloseFunction(tableName) {
    setCopyChildValueObj([]);
    setIsGridEdit(!isGridEdit);
  }

  const logRef = () => {
    if (tableRef.current) {
      const width = tableRef.current.offsetWidth;
      setContainerWidth(width);
    } else {
    }
  };

  useEffect(() => {
    const horiScroll = () => {
      const right = Math.round(
        Math.floor(
          tableRef.current?.getBoundingClientRect()?.width +
            tableRef.current?.scrollLeft
        )
      );
      if (tableRef.current?.scrollWidth > tableRef.current?.clientWidth) {
        setTableBodyWidth(`${right - 70}`);
      } else {
        setTableBodyWidth(`0`);
      }
    };

    horiScroll();

    tableRef.current?.addEventListener("scroll", horiScroll);

    return () => {
      tableRef.current?.removeEventListener("scroll", horiScroll);
    };
  }, [tableRef.current]);

  async function onLoadFunctionCall(
    functionData,
    formControlData,
    setFormControlData,
    setStateVariable,
    values
  ) {
    const funcNameMatch = functionData?.match(/^(\w+)/);
    const argsMatch = functionData?.match(/\((.*)\)/);

    // Check if we have a function name match, and we have an argsMatch (even if there are no arguments)
    if (funcNameMatch && argsMatch !== null) {
      const funcName = funcNameMatch[1];
      const argsStr = argsMatch[1] || "";

      // Find the function in formControlValidation by the extracted name
      const func = formControlValidation?.[funcName];

      if (typeof func === "function") {
        // Prepare arguments: If there are no arguments, argsStr will be an empty string
        let args;
        if (argsStr === "") {
          args = {}; // No arguments, so pass an empty object or as per the function's expected parameters
        } else {
          args = argsStr; // Has arguments, pass them as an object
        }
        // Call the function with the prepared arguments
        const updatedValues = await func({
          args,
          newState,
          formControlData,
          setFormControlData,
          setStateVariable,
          values,
        });
        if (updatedValues?.result) {
          // setIsDataLoaded(false);
          // toast[updatedValues.type](updatedValues.message);
          // setFormControlData(updatedValues.formControlData);
        }
        // onChangeHandler(updatedValues); // Assuming you have an onChangeHandler function to handle the updated values
      }
    }
  }
  useEffect(() => {
    if (section && section?.functionOnLoad?.length > 0 && inputFieldsVisible) {
      const funcCallString = section.functionOnLoad;
      if (funcCallString) {
        funcCallString.split(";").forEach((funcCall) => {
          onLoadFunctionCall(
            funcCall,
            formControlData,
            setFormControlData,
            setChildObject,
            childObject
          );
        });
      }
    }
  }, [inputFieldsVisible]);
  return (
    <>
      <Accordion
        expanded={isChildAccordionOpen}
        sx={{ ...childAccordionSection }}
      >
        <AccordionSummary
          className="relative left-[11px]"
          expandIcon={
            <LightTooltip title={isChildAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon
                sx={{ color: "white" }}
                onClick={() => childExpandedAccordion(indexValue)}
              />
            </LightTooltip>
          }
          aria-controls={`panel${indexValue + 1}-content`}
          id={`panel${indexValue + 1}-header`}
        >
          <Typography
            key={indexValue}
            // color={"white"}
            className={`relative right-[11px] w-[50%] ${styles.txtColor}`}
          >
            {section.childHeading || section.tableName}
          </Typography>
          {renderedData?.length > 0 && isChildAccordionOpen && (
            <>
              <div className="flex items-center justify-end w-[50%] gap-2 me-4">
                <LightTooltip title="Edit Grid">
                  <EditNoteRoundedIcon
                    sx={{
                      ...gridEditIconStyles,
                    }}
                    onClick={() => {
                      gridEditHandle(section.tableName);
                    }}
                  />
                </LightTooltip>
                {isGridEdit && (
                  <LightTooltip title="Save">
                    <SaveOutlinedIcon
                      sx={{
                        marginLeft: "8px",
                        ...gridEditIconStyles,
                      }}
                      onClick={() => {
                        gridEditSaveFunction(section.tableName, section);
                      }}
                    />
                  </LightTooltip>
                )}
                {isGridEdit && (
                  <LightTooltip title="Cancel">
                    <CloseOutlinedIcon
                      sx={{
                        marginLeft: "8px",
                        ...gridEditIconStyles,
                      }}
                      onClick={() => {
                        gridEditCloseFunction(section.tableName);
                      }}
                    />
                  </LightTooltip>
                )}
                {section.tableName === "tblVoucherLedger" && (
                  <>
                    <LightTooltip title="Allocated FIFO">
                      <IconButton
                        color="gray"
                        sx={{ p: "2px" }}
                        aria-label="Allocated FIFO"
                      >
                        <AutorenewIcon
                          // onClick={() => handleClose()}
                          sx={{
                            ...gridEditIconStyles,
                          }}
                        />
                      </IconButton>
                    </LightTooltip>
                    <LightTooltip title="Filter">
                      <IconButton
                        color="gray"
                        sx={{ p: "2px" }}
                        aria-label="Filter"
                      >
                        <FilterListIcon
                          // onClick={() => handleClose()}
                          sx={{
                            ...gridEditIconStyles,
                          }}
                        />
                      </IconButton>
                    </LightTooltip>
                    <LightTooltip title="Clear All">
                      <IconButton
                        color="gray"
                        sx={{ p: "2px" }}
                        aria-label="Clear All"
                      >
                        <HighlightOffIcon
                          // onClick={() => handleClose()}
                          sx={{
                            ...gridEditIconStyles,
                          }}
                        />
                      </IconButton>
                    </LightTooltip>
                  </>
                )}
              </div>
            </>
          )}
        </AccordionSummary>
        <AccordionDetails
          className={`${styles.pageBackground} flex   relative  `}
          sx={{
            height: clickCount === 0 ? "3.5rem" : "auto",
            padding: inputFieldsVisible ? "0" : "0",
            width: "100%",
          }}
        >
          <div key={indexValue} className=" w-full ">
            {/* Icon Button on the right */}
            <div className="absolute top-1 right-[-3px] flex  justify-end">
              {clickCount === 0 && (
                <HoverIcon
                  defaultIcon={addLogo}
                  hoverIcon={plusIconHover}
                  altText={"Add"}
                  title={"Add"}
                  onClick={() => {
                    childButtonHandler(section, indexValue);
                  }}
                />
              )}
            </div>

            {/* Custom Input Fields in the middle */}
            {inputFieldsVisible && (
              <div
                className={`overflow-hidden flex items-start gap-4 mt-[0.5rem] ml-[1rem] mb-[0.5rem] justify-between`}
              >
                <CustomeInputFields
                  inputFieldData={section.fields}
                  onValuesChange={handleFieldChildrenValuesChange}
                  handleFieldValuesChange2={handleFieldValuesChange2}
                  values={childObject}
                  onChangeHandler={(result) => {
                    handleChangeFunction(result);
                  }}
                  onBlurHandler={(result) => {
                    handleBlurFunction(result);
                  }}
                  clearFlag={clearFlag}
                  newState={newState}
                  tableName={section.tableName}
                  formControlData={formControlData}
                  setFormControlData={setFormControlData}
                  setStateVariable={setChildObject}
                  callSaveFunctionOnLastTab={() => {
                    childButtonHandler(section, indexValue, true);
                  }}
                  getLabelValue={getLabelValue}
                />
                <div className=" relative top-0 right-[3px] flex justify-end items-center  md:ml-20">
                  <HoverIcon
                    defaultIcon={refreshIcon}
                    hoverIcon={revertHover}
                    altText={"Revert"}
                    title={"Revert"}
                    onClick={() => {
                      setChildObject({});
                      if (newState[section.tableName]?.length > 0) {
                        setInputFieldsVisible((prev) => !prev);
                      }
                    }}
                  />
                  <HoverIcon
                    defaultIcon={saveIcon}
                    hoverIcon={saveIconHover}
                    altText={"Save"}
                    title={"Save"}
                    onClick={() => {
                      childButtonHandler(section, indexValue);
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <div className="flex items-center justify-end  mr-2">
                {dummyFieldArray?.length > 0 && clickCount > 0 && (
                  <>
                    {dummyFieldArray.map((item, index) => (
                      <Typography
                        variant="h5"
                        key={index}
                        className={`${styles.inputTextColor}`}
                      >
                        {Object.entries(item).map(([key, value]) => (
                          <>
                            {key && value ? (
                              <span key={key}>
                                {key}: {value},{" "}
                              </span>
                            ) : (
                              <></>
                            )}
                          </>
                        ))}
                      </Typography>
                    ))}
                  </>
                )}
              </div>
            </div>

            {newState[section.tableName] &&
              newState[section.tableName]?.length > 0 && (
                <>
                  {/* Table grid view Section at bottom*/}
                  <div key={indexValue} className={``}>
                    <TableContainer
                      onClick={logRef}
                      component={Paper}
                      ref={tableRef}
                      onScroll={handleScroll}
                      className={`${styles.hideScrollbar} ${styles.thinScrollBar}`}
                      sx={{
                        overflowX: "auto",
                        width: "100%",
                        height:
                          newState[section.tableName]?.length > 10
                            ? "290px"
                            : "auto",
                        overflowY:
                          newState[section.tableName]?.length > 10
                            ? "auto"
                            : "hidden",
                      }}
                    >
                      {/* <Table aria-label="collapsible table"> */}
                      <Table
                        aria-label="sticky table"
                        stickyHeader
                        className={`bg-[var(--commonBg)] w-[fit-content] min-w-[100%] `}
                      >
                        <TableHead>
                          <TableRow>
                            {section.fields
                              .filter((elem) => elem.isGridView)
                              .map((field, index) => (
                                <TableCell
                                  key={index}
                                  className={`${styles.cellHeading} cursor-pointer `}
                                  align="left"
                                  sx={{
                                    ...childTableHeaderStyle,
                                  }}
                                  onContextMenu={(event) =>
                                    handleRightClick(
                                      event,
                                      field.fieldname,
                                      section,
                                      section.fields
                                    )
                                  } // Add the right-click handler here
                                >
                                  {index === 0 &&
                                    section.tableName ===
                                      "tblVoucherLedgerDetails" && (
                                      <HoverIcon
                                      // defaultIcon={addLogo}
                                      // hoverIcon={plusIconHover}
                                      // altText={"Add Abc"}
                                      // title={"Add Abc"}
                                      // onClick={() => {
                                      //   inputFieldsVisible == false &&
                                      //     setInputFieldsVisible(
                                      //       (prev) => !prev
                                      //     );
                                      // }}
                                      />
                                    )}
                                  {index === 0 &&
                                    section.tableName ===
                                      "tblVoucherLedger" && (
                                      <HoverIcon
                                        defaultIcon={addLogo}
                                        hoverIcon={plusIconHover}
                                        altText={"Add"}
                                        title={"Add"}
                                        onClick={() => {
                                          inputFieldsVisible == false &&
                                            setInputFieldsVisible(
                                              (prev) => !prev
                                            );
                                        }}
                                      />
                                    )}
                                  <span
                                    className={`${styles.labelText}`}
                                    onClick={() =>
                                      handleSortBy(field.fieldname)
                                    }
                                  >
                                    {field.yourlabel}
                                  </span>
                                  <span>
                                    {isInputVisible &&
                                      activeColumn === field.fieldname && ( // Conditionally render the input
                                        <CustomizedInputBase
                                          columnData={field}
                                          setPrevSearchInput={
                                            setPrevSearchInput
                                          }
                                          prevSearchInput={prevSearchInput}
                                          controlerName={field.controlname}
                                        />
                                      )}
                                  </span>
                                  <span className="ml-1">
                                    {renderSortIcon(field.fieldname)}
                                  </span>
                                </TableCell>
                              ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {renderedData?.map((row, index) => (
                            <RowComponent
                              fields={section.fields}
                              childIndex={index}
                              childName={section.tableName}
                              subChild={section.subChild}
                              sectionData={section}
                              key={index}
                              row={row}
                              newState={newState}
                              setNewState={setNewState}
                              setInputFieldsVisible={setInputFieldsVisible}
                              setRenderedData={setRenderedData}
                              deleteChildRecord={deleteChildRecord}
                              calculateData={calculateData}
                              setCalculateData={setCalculateData}
                              dummyFieldArray={dummyFieldArray}
                              setDummyFieldArray={setDummyFieldArray}
                              isGridEdit={
                                section?.tableName === "tblVoucherLedger"
                                  ? false
                                  : isGridEdit
                              }
                              //isGridEdit={false}
                              isView={isView}
                              setIsGridEdit={setIsGridEdit}
                              copyChildValueObj={copyChildValueObj}
                              childArr={copyChildValueObj}
                              setCopyChildValueObj={setCopyChildValueObj}
                              setOpenModal={setOpenModal}
                              setParaText={setParaText}
                              expandAll={expandAll}
                              setIsError={setIsError}
                              setTypeofModal={setTypeofModal}
                              clearFlag={clearFlag}
                              setClearFlag={setClearFlag}
                              containerWidth={containerWidth}
                              submitNewState={submitNewState}
                              setSubmitNewState={setSubmitNewState}
                              removeChildRecordFromInsert={
                                removeChildRecordFromInsert
                              }
                              formControlData={formControlData}
                              setFormControlData={setFormControlData}
                              tableBodyWidhth={tableBodyWidhth}
                              // expandAll={expandAll}
                            />
                          ))}
                          <>
                            {Object.keys(columnTotals).length > 0 &&
                              columnTotals.tableName === section.tableName && (
                                <TableRow
                                  className={`${styles.tableCellHoverEffect} ${styles.hh}`}
                                  sx={{
                                    "& > *": { borderBottom: "unset" },
                                  }}
                                >
                                  {section.fields
                                    .filter((elem) => elem.isGridView)
                                    .map((field, index) => (
                                      <TableCell
                                        align="left"
                                        key={index}
                                        className={`cursor-pointer `}
                                        sx={{
                                          ...totalSumChildStyle,
                                          paddingLeft:
                                            index === 0 ? "29px" : "0px",
                                        }}
                                      >
                                        <div className="relative ">
                                          <div
                                            className={`${childTableRowStyles} `}
                                            style={{
                                              backgroundColor: "#E0E0E0",
                                            }}
                                          >
                                            {(field.type === "number" ||
                                              field.type === "decimal" ||
                                              field.type === "string") &&
                                            field.gridTotal
                                              ? columnTotals[field.fieldname]
                                              : ""}
                                          </div>
                                        </div>
                                      </TableCell>
                                    ))}
                                </TableRow>
                              )}
                          </>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                </>
              )}
          </div>
        </AccordionDetails>
      </Accordion>
    </>
  );
}

const isTdsApplicable = [
  // {
  //   id: 1614,
  //   formName: "Invoice",
  //   childHeading: "Invoice",
  //   tableName: "tblVoucherLedgerDetails",
  //   isAttachmentRequired: "true",
  //   isCopyForSameTable: "true",
  //   functionOnLoad: null,
  //   functionOnSubmit: null,
  //   functionOnEdit: null,
  //   functionOnDelete: null,
  //   searchApi: null,
  //   searchApiFields: null,
  //   clientId: 1,
  //   functionOnAdd: null,
  //   isHideGrid: "false",
  //   isHideGridHeader: false,
  //   isGridExpandOnLoad: false,
  //   buttons: [],
  //   fields: [
  //     {
  //       id: 856534,
  //       fieldname: "autoSetAllocatedAmount",
  //       yourlabel: "Set Allocation",
  //       controlname: "checkbox",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: false,
  //       copyMappingName: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: false,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       hyperlinkValue: null,
  //       referenceColumn: null,
  //       type: 6903,
  //       typeValue: "boolean",
  //       size: "100",
  //       ordering: 1,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: true,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       isEditableMode: "b",
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: true,
  //       position: "Top",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29116,
  //       fieldname: "invoiceIds",
  //       yourlabel: "Invoice No",
  //       controlname: "dropdown",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: "tblVoucher",
  //       referenceColumn: "voucherNo",
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 2,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29118,
  //       fieldname: "invoiceDate",
  //       yourlabel: "Invoice Date",
  //       controlname: "date",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "date",
  //       size: "100",
  //       ordering: 4,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: "",
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29119,
  //       fieldname: "OsAmtFC",
  //       yourlabel: "O/s Amt FC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 5,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: "",
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29120,
  //       fieldname: "OsAmtHC",
  //       yourlabel: "O/s Amt HC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 6,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "exchangeRate",
  //       yourlabel: "Ex. Rate",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "allocatedAmtFC",
  //       yourlabel: "Allocated Amt FC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "allocatedAmtHC",
  //       yourlabel: "Allocated Amt HC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "tdsAmtFC",
  //       yourlabel: "TDS Amt FC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //       columnsToBeVisible: true,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "tdsAmtHC",
  //       yourlabel: "TDS Amt HC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //       columnsToBeVisible: true,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "balanceAmtFC",
  //       yourlabel: "Balance Amt FC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "balanceAmtHC",
  //       yourlabel: "Balance Amt HC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6706,
  //       typeValue: "decimal",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //   ],
  //   subChild: [],
  // },
  {
    id: 1614,
    formName: "",
    childHeading: "Additional Ledgers",
    tableName: "tblVoucherLedger",
    isAttachmentRequired: "true",
    isCopyForSameTable: "true",
    functionOnLoad: null,
    functionOnSubmit: null,
    functionOnEdit: null,
    functionOnDelete: null,
    searchApi: null,
    searchApiFields: null,
    clientId: 1,
    functionOnAdd: null,
    isHideGrid: "false",
    isHideGridHeader: false,
    isGridExpandOnLoad: false,
    buttons: [],
    fields: [
      {
        id: 29116,
        fieldname: "glId",
        yourlabel: "Ledger Name",
        controlname: "dropdown",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: "tblGeneralLedger",
        referenceColumn: "name",
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 2,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange:
          "setVoucher(glId);getVoucherParty(glId);setGeneralLedgerName()",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
      {
        id: 29116,
        fieldname: "glVoucherLedgerId",
        yourlabel: "GL Voucher Ledger",
        controlname: "dropdown",
        isControlShow: true,
        isGridView: false,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: "tblGeneralLedger",
        referenceColumn: "name",
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 2,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
        columnsToBeVisible: false,
      },
      {
        id: 29118,
        fieldname: "debitAmount",
        yourlabel: "Debit Amount",
        controlname: "number",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        referenceColumn: null,
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 4,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: "",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
      {
        id: 29119,
        fieldname: "creditAmount",
        yourlabel: "Credit Amount",
        controlname: "number",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        referenceColumn: null,
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 5,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: "",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
      {
        id: 29120,
        fieldname: "debitAmountFc",
        yourlabel: "Debit Amount FC",
        controlname: "number",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        referenceColumn: null,
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 6,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
      {
        id: 29121,
        fieldname: "creditAmountFc",
        yourlabel: "Credit Amount FC",
        controlname: "number",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        referenceColumn: null,
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 7,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
    ],
    subChild: [],
  },
];

const isTdsNotApplicable = [
  // {
  //   id: 1614,
  //   formName: "Invoice",
  //   childHeading: "Invoice",
  //   tableName: "tblVoucherLedgerDetails",
  //   isAttachmentRequired: "true",
  //   isCopyForSameTable: "true",
  //   functionOnLoad: null,
  //   functionOnSubmit: null,
  //   functionOnEdit: null,
  //   functionOnDelete: null,
  //   searchApi: null,
  //   searchApiFields: null,
  //   clientId: 1,
  //   functionOnAdd: null,
  //   isHideGrid: "false",
  //   isHideGridHeader: false,
  //   isGridExpandOnLoad: false,
  //   buttons: [],
  //   fields: [
  //     {
  //       id: 856531,
  //       fieldname: "autoSetAllocatedAmount",
  //       yourlabel: "Set Allocation",
  //       controlname: "checkbox",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: false,
  //       copyMappingName: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: false,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       hyperlinkValue: null,
  //       referenceColumn: null,
  //       type: 6903,
  //       typeValue: "boolean",
  //       size: "100",
  //       ordering: 1,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: true,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       isEditableMode: "e",
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: true,
  //       position: "Top",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29116,
  //       fieldname: "invoiceIds",
  //       yourlabel: "Invoice No",
  //       controlname: "dropdown",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: "tblVoucher",
  //       referenceColumn: "voucherNo",
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 2,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29118,
  //       fieldname: "invoiceDate",
  //       yourlabel: "Invoice Date",
  //       controlname: "date",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "date",
  //       size: "100",
  //       ordering: 4,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: "",
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29119,
  //       fieldname: "OsAmtFC",
  //       yourlabel: "O/s Amt FC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 5,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: "",
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29120,
  //       fieldname: "OsAmtHC",
  //       yourlabel: "O/s Amt HC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 6,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "exchangeRate",
  //       yourlabel: "Ex. Rate",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "allocatedAmtFC",
  //       yourlabel: "Allocated Amt FC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "allocatedAmtHC",
  //       yourlabel: "Allocated Amt HC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "balanceAmtFC",
  //       yourlabel: "Balance Amt FC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6653,
  //       typeValue: "number",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: false,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //     {
  //       id: 29121,
  //       fieldname: "balanceAmtHC",
  //       yourlabel: "Balance Amt HC",
  //       controlname: "number",
  //       isControlShow: true,
  //       isGridView: true,
  //       isDataFlow: true,
  //       copyMappingName: null,
  //       hyperlinkValue: null,
  //       isCommaSeparatedOrCount: null,
  //       isAuditLog: true,
  //       keyToShowOnGrid: null,
  //       isDummy: false,
  //       dropDownValues: null,
  //       referenceTable: null,
  //       referenceColumn: null,
  //       type: 6706,
  //       typeValue: "decimal",
  //       size: "100",
  //       ordering: 7,
  //       gridTotal: false,
  //       gridTypeTotal: null,
  //       toolTipMessage: null,
  //       isRequired: false,
  //       isEditable: true,
  //       isSwitchToText: false,
  //       isBreak: false,
  //       dropdownFilter: null,
  //       controlDefaultValue: null,
  //       functionOnChange: null,
  //       functionOnBlur: null,
  //       functionOnKeyPress: null,
  //       sectionHeader: "Contra Voucher",
  //       sectionOrder: 2,
  //       isCopy: true,
  //       isCopyEditable: false,
  //       isEditableMode: "b",
  //       position: "bottom",
  //       isHideGrid: false,
  //       isHideGridHeader: false,
  //       isGridExpandOnLoad: false,
  //       clientId: 1,
  //       isColumnVisible: null,
  //       isColumnDisabled: null,
  //       columnsToDisabled: null,
  //       columnsToHide: null,
  //     },
  //   ],
  //   subChild: [],
  // },
  {
    id: 1614,
    formName: "",
    childHeading: "Additional Ledgers",
    tableName: "tblVoucherLedger",
    isAttachmentRequired: "true",
    isCopyForSameTable: "true",
    functionOnLoad: null,
    functionOnSubmit: null,
    functionOnEdit: null,
    functionOnDelete: null,
    searchApi: null,
    searchApiFields: null,
    clientId: 1,
    functionOnAdd: null,
    isHideGrid: "false",
    isHideGridHeader: false,
    isGridExpandOnLoad: false,
    buttons: [],
    fields: [
      {
        id: 29116,
        fieldname: "glId",
        yourlabel: "Ledger Name",
        controlname: "dropdown",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: "tblGeneralLedger",
        referenceColumn: "name",
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 2,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange:
          "setVoucher(glId);getVoucherParty(glId);setGeneralLedgerName()",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
      {
        id: 29116,
        fieldname: "glVoucherLedgerId",
        yourlabel: "GL Voucher Ledger",
        controlname: "dropdown",
        isControlShow: false,
        isGridView: false,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: "tblGeneralLedger",
        referenceColumn: "name",
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 2,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
        columnsToBeVisible: false,
      },
      {
        id: 29118,
        fieldname: "debitAmount",
        yourlabel: "Debit Amount",
        controlname: "number",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        referenceColumn: null,
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 4,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: "",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
      {
        id: 29119,
        fieldname: "creditAmount",
        yourlabel: "Credit Amount",
        controlname: "number",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        referenceColumn: null,
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 5,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: "",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
      {
        id: 29120,
        fieldname: "debitAmountFc",
        yourlabel: "Debit Amount FC",
        controlname: "number",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        referenceColumn: null,
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 6,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
      {
        id: 29121,
        fieldname: "creditAmountFc",
        yourlabel: "Credit Amount FC",
        controlname: "number",
        isControlShow: true,
        isGridView: true,
        isDataFlow: true,
        copyMappingName: null,
        hyperlinkValue: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: true,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        referenceColumn: null,
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 7,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Contra Voucher",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: false,
        isEditableMode: "b",
        position: "bottom",
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        isColumnVisible: null,
        isColumnDisabled: null,
        columnsToDisabled: null,
        columnsToHide: null,
      },
    ],
    subChild: [],
  },
];

const parentFieldIsTdsApplied = {
  "Contra Voucher": [
    {
      id: 50102,
      fieldname: "voucherNo",
      yourlabel: "Voucher No",
      controlname: "text",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6902,
      typeValue: "string",
      size: "100",
      ordering: 2,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50103,
      fieldname: "voucherDate",
      yourlabel: "Voucher Date",
      controlname: "date",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6783,
      typeValue: "date",
      size: "100",
      ordering: 3,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50110,
      fieldname: "paymentByParty",
      yourlabel: "Party Name",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblGeneralLedger",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 4,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: "and glTypeId in (select id from tblmasterdata where masterlistname = 'tblgltype' and name IN ('BANK','CASH'))",
      controlDefaultValue: null,
      functionOnChange: "getVoucherInvoiceDetails(paymentByParty)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 60110,
      fieldname: "paymentBank",
      yourlabel: "Bank Name",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblGeneralLedger",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 5,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: "Bank Name",
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: true,
      dropdownFilter:
        "and  glTypeId in (select id from tblmasterdata where masterlistname = 'tblgltype' and name = 'BANK')",
      controlDefaultValue: null,
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50106,
      fieldname: "referenceNo",
      yourlabel: "Reference No",
      controlname: "text",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6653,
      typeValue: "string",
      size: "100",
      ordering: 6,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50107,
      fieldname: "referenceDate",
      yourlabel: "Reference Date",
      controlname: "date",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6783,
      typeValue: "date",
      size: "100",
      ordering: 7,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50109,
      fieldname: "paymentTypeId",
      yourlabel: "Ref. Type",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblMasterData",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 8,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter:
        "and masterListId in (select id from tblMasterList  where name = 'tblChequeType')",
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50104,
      fieldname: "currencyId",
      yourlabel: "Currency",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblMasterData",
      hyperlinkValue: null,
      referenceColumn: "code",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 9,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter:
        "and masterListId in (select id from tblMasterList  where name = 'tblCurrency' and status=1)",
      controlDefaultValue: null,
      functionOnChange: "setFirstExchangeRate(currencyId,exchangeRate)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50105,
      fieldname: "exchangeRate",
      yourlabel: "Exchange Rate",
      controlname: "number",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 10,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange:
        "calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50111,
      fieldname: "narration",
      yourlabel: "Narration",
      controlname: "textarea",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6902,
      typeValue: "string",
      size: "100",
      ordering: 11,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50101,
      fieldname: "voucherTypeId",
      yourlabel: "Voucher Type",
      controlname: "dropdown",
      isControlShow: false,
      isGridView: true,
      isDataFlow: false,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblVoucherType",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 1,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: "Contra Voucher",
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
  ],
};

const parentFieldIsTdsNotApplied = {
  "Contra Voucher": [
    {
      id: 50102,
      fieldname: "voucherNo",
      yourlabel: "Voucher No",
      controlname: "text",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6902,
      typeValue: "string",
      size: "100",
      ordering: 2,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50103,
      fieldname: "voucherDate",
      yourlabel: "Voucher Date",
      controlname: "date",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6783,
      typeValue: "date",
      size: "100",
      ordering: 3,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50110,
      fieldname: "paymentByParty",
      yourlabel: "Party Name",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblGeneralLedger",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 4,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: "and glTypeId in (select id from tblmasterdata where masterlistname = 'tblgltype' and name IN ('BANK','CASH'))",
      controlDefaultValue: null,
      functionOnChange: "getVoucherInvoiceDetails(paymentByParty)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 60110,
      fieldname: "paymentBank",
      yourlabel: "Bank Name",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblGeneralLedger",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 5,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: "Bank Name",
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: true,
      dropdownFilter:
        "and glTypeId in (select id from tblmasterdata where masterlistname = 'tblgltype' and name = 'BANK')",
      controlDefaultValue: null,
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50106,
      fieldname: "referenceNo",
      yourlabel: "Reference No",
      controlname: "text",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6653,
      typeValue: "string",
      size: "100",
      ordering: 6,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50107,
      fieldname: "referenceDate",
      yourlabel: "Reference Date",
      controlname: "date",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6783,
      typeValue: "date",
      size: "100",
      ordering: 7,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50109,
      fieldname: "paymentTypeId",
      yourlabel: "Ref. Type",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblMasterData",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 8,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter:
        "and masterListId in (select id from tblMasterList  where name = 'tblChequeType')",
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50104,
      fieldname: "currencyId",
      yourlabel: "Currency",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblMasterData",
      hyperlinkValue: null,
      referenceColumn: "code",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 9,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter:
        "and masterListId in (select id from tblMasterList  where name = 'tblCurrency' and status=1)",
      controlDefaultValue: null,
      functionOnChange: "setFirstExchangeRate(currencyId,exchangeRate)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50105,
      fieldname: "exchangeRate",
      yourlabel: "Exchange Rate",
      controlname: "number",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 10,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange:
        "calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50111,
      fieldname: "narration",
      yourlabel: "Narration",
      controlname: "textarea",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6902,
      typeValue: "string",
      size: "100",
      ordering: 11,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50101,
      fieldname: "voucherTypeId",
      yourlabel: "Voucher Type",
      controlname: "dropdown",
      isControlShow: false,
      isGridView: true,
      isDataFlow: false,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblVoucherType",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 1,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: "Contra Voucher",
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
  ],
};

const formState = {
  routeName: "mastervalue",
  paymentBankdropdown: [
    {
      value: 1554,
      label: "DESTINATION CHARGES INCOME",
    },
  ],
  voucherTypeId: 13,
  voucherTypeIddropdown: [
    {
      value: 13,
      label: "CONTRA VOUCHER",
    },
  ],
  paymentBank: 1554,
  voucherNo:null,
  voucherDate:null,
  paymentByParty:null,
  narration: null,
  referenceNo: null,
  referenceDate: null,
  paymentTypeId: null,
  currencyId: null,
  exchangeRate: null,
  tblVoucherLedger: [],
};

const sameCurrencyHideField = {
  "Contra Voucher": [
    {
      id: 50102,
      fieldname: "voucherNo",
      yourlabel: "Voucher No",
      controlname: "text",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6902,
      typeValue: "string",
      size: "100",
      ordering: 2,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50103,
      fieldname: "voucherDate",
      yourlabel: "Voucher Date",
      controlname: "date",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6783,
      typeValue: "date",
      size: "100",
      ordering: 3,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50110,
      fieldname: "paymentByParty",
      yourlabel: "Party Name",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblGeneralLedger",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 4,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: "and glTypeId in (select id from tblmasterdata where masterlistname = 'tblgltype' and name IN ('BANK','CASH'))",
      controlDefaultValue: null,
      functionOnChange: "getVoucherInvoiceDetails(paymentByParty)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 60110,
      fieldname: "paymentBank",
      yourlabel: "Bank Name",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblGeneralLedger",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 5,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: "Bank Name",
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: true,
      dropdownFilter:
        "and glTypeId in (select id from tblmasterdata where masterlistname = 'tblgltype' and name = 'BANK')",
      controlDefaultValue: null,
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50106,
      fieldname: "referenceNo",
      yourlabel: "Reference No",
      controlname: "text",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6653,
      typeValue: "string",
      size: "100",
      ordering: 6,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50107,
      fieldname: "referenceDate",
      yourlabel: "Reference Date",
      controlname: "date",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6783,
      typeValue: "date",
      size: "100",
      ordering: 7,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50109,
      fieldname: "paymentTypeId",
      yourlabel: "Ref. Type",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblMasterData",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 8,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter:
        "and masterListId in (select id from tblMasterList  where name = 'tblChequeType')",
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50104,
      fieldname: "currencyId",
      yourlabel: "Currency",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblMasterData",
      hyperlinkValue: null,
      referenceColumn: "code",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 9,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter:
        "and masterListId in (select id from tblMasterList  where name = 'tblCurrency' and status=1)",
      controlDefaultValue: null,
      functionOnChange: "setFirstExchangeRate(currencyId,exchangeRate)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50105,
      fieldname: "exchangeRate",
      yourlabel: "Exchange Rate",
      controlname: "number",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 10,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: true,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange:
        "calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50111,
      fieldname: "narration",
      yourlabel: "Narration",
      controlname: "textarea",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6902,
      typeValue: "string",
      size: "100",
      ordering: 11,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
    {
      id: 50101,
      fieldname: "voucherTypeId",
      yourlabel: "Voucher Type",
      controlname: "dropdown",
      isControlShow: false,
      isGridView: true,
      isDataFlow: false,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: "tblVoucherType",
      hyperlinkValue: null,
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 1,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: "Contra Voucher",
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Contra Voucher",
      sectionOrder: 1,
      isCopy: true,
      isCopyEditable: false,
      position: "top",
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      isColumnVisible: null,
      isColumnDisabled: null,
      columnsToDisabled: null,
      columnsToHide: null,
    },
  ],
};
