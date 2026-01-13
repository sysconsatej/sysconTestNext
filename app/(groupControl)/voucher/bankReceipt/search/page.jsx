"use client";
/* eslint-disable */
// If your tooling expects React in scope:
import React, { useState, useRef, useEffect, useMemo, use } from "react";
import Accordion from "@mui/material/Accordion";
import Typography from "@mui/material/Typography";
import { getUserDetails } from "@/helper/userDetails";
import PropTypes from "prop-types";
import CustomeModal from "@/components/Modal/customModal.jsx";
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
import {
  getVoucher,
  tallyDebitCredit,
} from "@/services/auth/FormControl.services";
import { insertVoucherData } from "@/services/auth/FormControl.services";
import { expandAllIcon, closeIconRed } from "@/assets";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchReportData } from "@/services/auth/FormControl.services.js";
import { useDispatch, useSelector } from "react-redux";

export default function VoucherBankReceiptAdd() {
  const isView = false;
  const prevCidRef = useRef(""); // hide unhide currencyId value
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
  const { clientId } = getUserDetails();
  const { companyId } = getUserDetails();
  const [bankExTrigger, setBankExTrigger] = useState(0);

  const allocPrevRowsRef = useRef([]);
  const autoPrevRef = useRef([]);
  console.log("voucherLedgerTotals =>", voucherLedgerTotals);

  useEffect(() => {
    // Only skip if rows are missing
    if (!Array.isArray(newState?.tblVoucherLedgerDetails)) {
      return;
    }

    setNewState((prev) => {
      const rows = prev?.tblVoucherLedgerDetails;
      if (!Array.isArray(rows) || rows.length === 0) return prev;

      // -------------------------------
      // CASE 1: tdsApplicable = false
      // → clear all row & header TDS
      // -------------------------------
      if (!newState?.tdsApplicable) {
        let anyRowChanged = false;

        const clearedRows = rows.map((row) => {
          if (!row) return row;

          if (row.tdsAmtFC != null || row.tdsAmtHC != null) {
            anyRowChanged = true;
            return {
              ...row,
              tdsAmtFC: null,
              tdsAmtHC: null,
            };
          }

          return row;
        });

        const headerAlreadyCleared =
          prev.tdsAmtFC == null && prev.tdsAmtHC == null && prev.tdsAmt == null;

        if (!anyRowChanged && headerAlreadyCleared) {
          return prev;
        }

        return {
          ...prev,
          tblVoucherLedgerDetails: clearedRows,
          tdsAmtFC: null,
          tdsAmtHC: null,
          tdsAmt: null,
        };
      }

      // -------------------------------
      // CASE 2: tdsApplicable = true
      // → existing auto-calc logic
      // -------------------------------
      let totalTdsFC = 0;
      let totalTdsHC = 0;
      let anyRowChanged = false;

      const updatedRows = rows.map((row) => {
        if (!row) return row;

        let tdsFC = Number(row.tdsAmtFC) || 0;
        let tdsHC = Number(row.tdsAmtHC) || 0;
        let rowChanged = false;

        if (row.autoSetAllocatedAmount === true) {
          // ✅ Checkbox checked → calculate 2% of allocatedAmtFC / HC
          const allocatedFC = Number(row.allocatedAmtFC) || 0;
          const allocatedHC = Number(row.allocatedAmtHC) || 0;

          const calcFC = +(allocatedFC * 0.02).toFixed(2);
          const calcHC = +(allocatedHC * 0.02).toFixed(2);

          if (calcFC !== tdsFC) {
            tdsFC = calcFC;
            rowChanged = true;
          }
          if (calcHC !== tdsHC) {
            tdsHC = calcHC;
            rowChanged = true;
          }
        } else {
          // ❌ Checkbox UNCHECKED → reset row TDS to 0.00
          if (tdsFC !== 0 || tdsHC !== 0) {
            tdsFC = 0;
            tdsHC = 0;
            rowChanged = true;
          }
        }

        totalTdsFC += tdsFC;
        totalTdsHC += tdsHC;

        if (rowChanged) {
          anyRowChanged = true;
          return {
            ...row,
            tdsAmtFC: tdsFC,
            tdsAmtHC: tdsHC,
          };
        }

        return row;
      });

      totalTdsFC = +totalTdsFC.toFixed(2);
      totalTdsHC = +totalTdsHC.toFixed(2);

      const prevTotalTdsFC = Number(prev.tdsAmtFC) || 0;
      const prevTotalTdsHC = Number(prev.tdsAmtHC) || 0;
      const prevTotalTds = Number(prev.tdsAmt) || 0;

      // nothing changed → avoid re-render loop
      if (
        !anyRowChanged &&
        prevTotalTdsFC === totalTdsFC &&
        prevTotalTdsHC === totalTdsHC &&
        prevTotalTds === totalTdsHC
      ) {
        return prev;
      }

      return {
        ...prev,
        tblVoucherLedgerDetails: updatedRows,
        // header-level totals (recalculated every time based on present values)
        tdsAmtFC: totalTdsFC,
        tdsAmtHC: totalTdsHC,
        tdsAmt: totalTdsHC, // main TDS in HC
      };
    });
  }, [newState?.tdsApplicable, newState?.tblVoucherLedgerDetails]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    setNewState((prev) =>
      prev.voucherDate
        ? prev // already set, don't touch
        : { ...prev, voucherDate: today }
    );
  }, []);

  const onConfirm = async (conformData) => {
    setOpenModal((prev) => !prev);
  };

  useEffect(() => {
    console.log("exchangeRate", newState?.exchangeRate);
    console.log("calculationType", newState?.calculationType);

    const details = Array.isArray(newState?.tblVoucherLedgerDetails)
      ? newState.tblVoucherLedgerDetails
      : [];

    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return 0;
      const n = Number(String(v).replace(/,/g, ""));
      return isNaN(n) ? 0 : n;
    };

    const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
    const asStr = (n) => round2(n).toFixed(2);

    // 🔹 read rate + type once
    const exchangeRate = toNum(newState?.exchangeRate);
    const calculationType = newState?.calculationType;

    // 🔹 helper to apply exchange logic to a delta
    const applyDeltaByCalcType = (delta) => {
      if (!exchangeRate || exchangeRate === 0) return delta; // avoid divide by 0
      if (calculationType === "FCHC") {
        // divide by rate
        return delta / exchangeRate;
      }
      if (calculationType === "HCFC") {
        // multiply by rate
        return delta * exchangeRate;
      }
      return delta;
    };

    if (!details.length) {
      allocPrevRowsRef.current = [];
      return;
    }

    const prevDetails = allocPrevRowsRef.current || [];
    const maxLen = Math.max(details.length, prevDetails.length);

    let changedIndex = -1;

    // 🔹 Find which row changed (HC and/or FC) – RAW comparison (no rate)
    for (let i = 0; i < maxLen; i++) {
      const curr = details[i];
      const prev = prevDetails[i];

      if (!curr && prev) {
        // row removed → structural change, just sync and exit
        allocPrevRowsRef.current = details;
        return;
      }

      if (curr && !prev) {
        // new row added
        changedIndex = i;
        break;
      }

      if (!curr && !prev) break;

      const hcCurrRaw = toNum(curr.allocatedAmtHC);
      const hcPrevRaw = toNum(prev.allocatedAmtHC);
      const fcCurrRaw = toNum(curr.allocatedAmtFC);
      const fcPrevRaw = toNum(prev.allocatedAmtFC);

      if (hcCurrRaw !== hcPrevRaw || fcCurrRaw !== fcPrevRaw) {
        changedIndex = i;
        break;
      }
    }

    if (changedIndex === -1) {
      // nothing changed in allocations
      allocPrevRowsRef.current = details;
      return;
    }

    // 🔹 Current header balances
    const prevBalanceHC = toNum(newState?.balanceAmtHc);
    const prevBalanceFC = toNum(newState?.balanceAmtFc);

    // Copy rows to work on
    const working = details.map((row) => ({ ...row }));
    console.log("changedIndex =", changedIndex);
    const prevRow = prevDetails[changedIndex] || {};
    const row = working[changedIndex];

    const hcPrev = toNum(prevRow.allocatedAmtHC);
    const hcCurrInput = toNum(row.allocatedAmtHC); // what user just typed
    const fcPrev = toNum(prevRow.allocatedAmtFC);
    const fcCurrInput = toNum(row.allocatedAmtFC); // what user just typed

    let newBalanceHC = prevBalanceHC;
    let newBalanceFC = prevBalanceFC;
    let hcTouched = false;
    let fcTouched = false;

    // ---------- HC logic with exchangeRate ----------
    if (hcCurrInput !== hcPrev) {
      const rawDeltaHC = hcCurrInput - hcPrev; // user-level delta
      let effectiveDeltaHC = applyDeltaByCalcType(rawDeltaHC); // delta after FCHC/HCFC
      let tempBalanceHC = prevBalanceHC - effectiveDeltaHC;
      let finalHC = hcPrev + effectiveDeltaHC; // final stored HC after conversion

      // clamp if header balance goes negative
      if (tempBalanceHC < 0) {
        const allowedDelta = prevBalanceHC; // we can only consume what is left
        effectiveDeltaHC = allowedDelta;
        finalHC = hcPrev + allowedDelta;
        tempBalanceHC = 0;
      }

      // 🔹 Row-level balanceAmtHC update
      const prevRowBalanceHC = toNum(prevRow.balanceAmtHC);
      let newRowBalanceHC = prevRowBalanceHC - effectiveDeltaHC;
      if (newRowBalanceHC < 0) newRowBalanceHC = 0;

      newBalanceHC = tempBalanceHC;

      row.allocatedAmtHC = asStr(finalHC);
      row.balanceAmtHC = asStr(newRowBalanceHC);

      hcTouched = true;
    }

    // ---------- FC logic with exchangeRate ----------
    if (fcCurrInput !== fcPrev) {
      const rawDeltaFC = fcCurrInput - fcPrev; // user-level delta
      let effectiveDeltaFC = applyDeltaByCalcType(rawDeltaFC); // delta after FCHC/HCFC
      let tempBalanceFC = prevBalanceFC - effectiveDeltaFC;
      let finalFC = fcPrev + effectiveDeltaFC; // final stored FC after conversion

      if (tempBalanceFC < 0) {
        const allowedDelta = prevBalanceFC;
        effectiveDeltaFC = allowedDelta;
        finalFC = fcPrev + allowedDelta;
        tempBalanceFC = 0;
      }

      // 🔹 Row-level balanceAmtFC update
      const prevRowBalanceFC = toNum(prevRow.balanceAmtFC);
      let newRowBalanceFC = prevRowBalanceFC - effectiveDeltaFC;
      if (newRowBalanceFC < 0) newRowBalanceFC = 0;

      newBalanceFC = tempBalanceFC;

      row.allocatedAmtFC = asStr(finalFC);
      row.balanceAmtFC = asStr(newRowBalanceFC);

      fcTouched = true;
    }

    // 🔹 If nothing effectively changed (no balance change, no clamp), skip setState
    const balanceHcChanged = hcTouched && newBalanceHC !== prevBalanceHC;
    const balanceFcChanged = fcTouched && newBalanceFC !== prevBalanceFC;

    const rowActualSame =
      row.allocatedAmtHC === details[changedIndex].allocatedAmtHC &&
      row.allocatedAmtFC === details[changedIndex].allocatedAmtFC;

    if (!balanceHcChanged && !balanceFcChanged && rowActualSame) {
      allocPrevRowsRef.current = details;
      return;
    }

    // 🔹 Commit
    setNewState((prev) => ({
      ...prev,
      balanceAmtHc: hcTouched
        ? asStr(newBalanceHC)
        : prev.balanceAmtHc != null && prev.balanceAmtHc !== ""
        ? String(prev.balanceAmtHc)
        : "0.00",
      balanceAmtFc: fcTouched
        ? asStr(newBalanceFC)
        : prev.balanceAmtFc != null && prev.balanceAmtFc !== ""
        ? String(prev.balanceAmtFc)
        : "0.00",
      tblVoucherLedgerDetails: working,
    }));

    allocPrevRowsRef.current = working;
  }, [newState.tblVoucherLedgerDetails]);

  console.log("newState =>", newState);

  useEffect(() => {
    const details = Array.isArray(newState?.tblVoucherLedgerDetails)
      ? newState.tblVoucherLedgerDetails
      : [];

    // No rows → reset snapshot and exit
    if (!details.length) {
      autoPrevRef.current = [];
      return;
    }

    const toNum = (v) => {
      if (v === null || v === undefined || v === "") return 0;
      const n = Number(String(v).replace(/,/g, ""));
      return isNaN(n) ? 0 : n;
    };

    // ✅ round to 2 decimals (numeric)
    const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

    // ✅ convert to string with 2 decimals
    const asStr = (n) => round2(n).toFixed(2);

    const prevAuto = autoPrevRef.current || [];
    const maxLen = Math.max(details.length, prevAuto.length);

    // 🔹 Find which row's autoSetAllocatedAmount changed
    let changedIndex = -1;

    for (let i = 0; i < maxLen; i++) {
      const currVal = details[i]?.autoSetAllocatedAmount ?? "";
      const prevVal = prevAuto[i] ?? "";

      if (currVal !== prevVal) {
        changedIndex = i;
        break;
      }
    }

    // 🔹 Update snapshot for next time
    autoPrevRef.current = details.map(
      (row) => row?.autoSetAllocatedAmount ?? ""
    );

    // nothing changed → exit
    if (changedIndex === -1) return;

    const changedRow = details[changedIndex];
    if (!changedRow) return;

    // Treat truthy as ON, falsy as OFF
    const isAutoOn = !!changedRow.autoSetAllocatedAmount;

    let newAllocHCStr = "";
    let newAllocFCStr = "";

    if (isAutoOn) {
      // ---------- AUTO ON ----------
      // allocatedAmtHC = OsAmtFC
      // allocatedAmtFC = OsAmtHC
      const osAmtFC = toNum(changedRow.OsAmtFC ?? changedRow.osAmtFC);
      const osAmtHC = toNum(changedRow.OsAmtHC ?? changedRow.osAmtHC);

      newAllocHCStr = osAmtFC ? asStr(osAmtFC) : ""; // ✅ rounded
      newAllocFCStr = osAmtHC ? asStr(osAmtHC) : ""; // ✅ rounded
    } else {
      // ---------- AUTO OFF ----------
      // empty both allocated fields
      newAllocHCStr = "";
      newAllocFCStr = "";
    }

    const currAllocHCStr =
      changedRow.allocatedAmtHC != null
        ? String(changedRow.allocatedAmtHC)
        : "";
    const currAllocFCStr =
      changedRow.allocatedAmtFC != null
        ? String(changedRow.allocatedAmtFC)
        : "";

    // If nothing actually changed, skip setState
    if (currAllocHCStr === newAllocHCStr && currAllocFCStr === newAllocFCStr) {
      return;
    }

    // Build updated array (do not mutate original details)
    const working = details.map((row, idx) =>
      idx === changedIndex
        ? {
            ...row,
            allocatedAmtHC: newAllocHCStr,
            allocatedAmtFC: newAllocFCStr,
          }
        : row
    );

    // 🔹 Commit
    setNewState((prev) => ({
      ...prev,
      tblVoucherLedgerDetails: working,
    }));
  }, [newState.tblVoucherLedgerDetails]);

  // Total of voucher ledger Details
  useEffect(() => {
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

  const ledgerWatch = (newState?.tblVoucherLedger ?? [])
    .map((r) =>
      [
        r?.debitAmount ?? "",
        r?.creditAmount ?? "",
        r?.debitAmountFc ?? "",
        r?.creditAmountFc ?? "",
        r?.glId ?? "",
        r?.indexValue ?? "",
      ].join("|")
    )
    .join("§");

  // Total of voucher ledger
  useEffect(() => {
    const details = Array.isArray(newState?.tblVoucherLedger)
      ? newState.tblVoucherLedger
      : [];

    const toNum = (v) =>
      v == null || v === "" ? 0 : Number(String(v).replace(/,/g, "")) || 0;
    const sum = (field) => details.reduce((s, r) => s + toNum(r?.[field]), 0);

    const nextTotals = {
      debitAmount: sum("debitAmount").toFixed(2),
      creditAmount: sum("creditAmount").toFixed(2),
      debitAmountFc: sum("debitAmountFc").toFixed(2),
      creditAmountFc: sum("creditAmountFc").toFixed(2),
    };

    // avoid extra renders if nothing actually changed
    setVoucherLedgerTotals((prev) => {
      if (
        prev.debitAmount === nextTotals.debitAmount &&
        prev.creditAmount === nextTotals.creditAmount &&
        prev.debitAmountFc === nextTotals.debitAmountFc &&
        prev.creditAmountFc === nextTotals.creditAmountFc
      )
        return prev;
      return nextTotals;
    });

    console.log("[totals effect] hit; rows =", details.length);
  }, [ledgerWatch]);

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

  useEffect(() => {
    const getCurrencyId = (s) =>
      s?.currencyId ?? s?.currencyIddropdown?.[0]?.value ?? null;
    const norm = (v) => (v == null ? "" : String(v).trim());

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
            setNewState((prev) => ({
              ...prev,
              tdsApplicable: false,
            }));
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

      const hasVal = (v) =>
        v !== null && v !== undefined && String(v).trim() !== "";

      // normalize numbers; keep null if empty
      const toNumOrNull = (v) =>
        hasVal(v) ? Number(String(v).replace(/,/g, "").trim()) : null;

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

      //TaLLy Debit and Credit amounts
      const tallyDebitCreditRequestBody = {
        debitAmt: voucherLedgerTotals?.debitAmount,
        creditAmt: voucherLedgerTotals?.creditAmount,
      };
      const tallyDebitCreditData = await tallyDebitCredit(
        tallyDebitCreditRequestBody
      );
      if (tallyDebitCreditData.success != true) {
        setParaText(tallyDebitCreditData.message);
        setIsError(false);
        setOpenModal((prev) => !prev);
        return;
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
        Array.isArray(insertData?.tblVoucherLedgerDetails) &&
        insertData.tblVoucherLedgerDetails.length
      ) {
        insertData.tblVoucherLedgerDetails = insertData.tblVoucherLedgerDetails
          .filter((d) => hasVal(d?.allocatedAmtFC) || hasVal(d?.allocatedAmtHC))
          .map((item) => ({
            ...item,
            allocatedAmtFC: toNumOrNull(item.allocatedAmtFC),
            allocatedAmtHC: toNumOrNull(item.allocatedAmtHC),
            clientId,
            createdBy: userId,
            companyId,
            companyBranchId: branchId,
            financialYearId: financialYear,
            tdsApp: true,
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

  const getLabelValue = (labelValue) => {
    setLabelName(labelValue);
  };

  return (
    <>
      <div className="overflow-y-auto overflow-x-hidden h-[90vh] [scrollbar-gutter:stable] pr-2">
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
                  setBankExTrigger={setBankExTrigger}
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
      <div>
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
  setBankExTrigger: PropTypes.any,
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
  setBankExTrigger,
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

  function handleFunctionOnChange() {
    alert("alert data");
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
                //handleFunctionOnChange();
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
              setBankExTrigger={setBankExTrigger}
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
  {
    id: 1614,
    formName: "Invoice",
    childHeading: "Invoice",
    tableName: "tblVoucherLedgerDetails",
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
        id: 856534,
        fieldname: "autoSetAllocatedAmount",
        yourlabel: "Set Allocation",
        controlname: "checkbox",
        isControlShow: true,
        isGridView: true,
        isDataFlow: false,
        copyMappingName: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: false,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        hyperlinkValue: null,
        referenceColumn: null,
        type: 6903,
        typeValue: "boolean",
        size: "100",
        ordering: 1,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: true,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: "getAutoAllocateAmount()",
        functionOnBlur: null,
        functionOnKeyPress: null,
        isEditableMode: "b",
        sectionHeader: "Bank Receipt",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: true,
        position: "Top",
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
        fieldname: "invoiceIds",
        yourlabel: "Invoice No",
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
        referenceTable: "tblVoucher",
        referenceColumn: "voucherNo",
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 2,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        id: 29118,
        fieldname: "invoiceDate",
        yourlabel: "Invoice Date",
        controlname: "date",
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
        typeValue: "date",
        size: "100",
        ordering: 4,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: "",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "OsAmtFC",
        yourlabel: "O/s Amt FC",
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
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: "",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "OsAmtHC",
        yourlabel: "O/s Amt HC",
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
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "exchangeRate",
        yourlabel: "Ex. Rate",
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
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "allocatedAmtFC",
        yourlabel: "Allocated Amt FC",
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
        sectionHeader: "Bank Receipt",
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
        fieldname: "allocatedAmtHC",
        yourlabel: "Allocated Amt HC",
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
        sectionHeader: "Bank Receipt",
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
        fieldname: "tdsAmtFC",
        yourlabel: "TDS Amt FC",
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
        functionOnChange: "getAutoAllocateAmount()",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        columnsToBeVisible: true,
      },
      {
        id: 29121,
        fieldname: "tdsAmtHC",
        yourlabel: "TDS Amt HC",
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
        functionOnChange: "getAutoAllocateAmount()",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        columnsToBeVisible: true,
      },
      {
        id: 29121,
        fieldname: "balanceAmtFC",
        yourlabel: "Balance Amt FC",
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
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "balanceAmtHC",
        yourlabel: "Balance Amt HC",
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
        type: 6706,
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
        sectionHeader: "Bank Receipt",
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
        sectionHeader: "Bank Receipt",
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
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
  {
    id: 1614,
    formName: "Invoice",
    childHeading: "Invoice",
    tableName: "tblVoucherLedgerDetails",
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
        id: 856531,
        fieldname: "autoSetAllocatedAmount",
        yourlabel: "Set Allocation",
        controlname: "checkbox",
        isControlShow: true,
        isGridView: true,
        isDataFlow: false,
        copyMappingName: null,
        isCommaSeparatedOrCount: null,
        isAuditLog: false,
        keyToShowOnGrid: null,
        isDummy: false,
        dropDownValues: null,
        referenceTable: null,
        hyperlinkValue: null,
        referenceColumn: null,
        type: 6903,
        typeValue: "boolean",
        size: "100",
        ordering: 1,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: true,
        isSwitchToText: true,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        isEditableMode: "e",
        sectionHeader: "Bank Receipt",
        sectionOrder: 2,
        isCopy: true,
        isCopyEditable: true,
        position: "Top",
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
        fieldname: "invoiceIds",
        yourlabel: "Invoice No",
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
        referenceTable: "tblVoucher",
        referenceColumn: "voucherNo",
        type: 6653,
        typeValue: "number",
        size: "100",
        ordering: 2,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        id: 29118,
        fieldname: "invoiceDate",
        yourlabel: "Invoice Date",
        controlname: "date",
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
        typeValue: "date",
        size: "100",
        ordering: 4,
        gridTotal: false,
        gridTypeTotal: null,
        toolTipMessage: null,
        isRequired: false,
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: "",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "OsAmtFC",
        yourlabel: "O/s Amt FC",
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
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: "",
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "OsAmtHC",
        yourlabel: "O/s Amt HC",
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
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "exchangeRate",
        yourlabel: "Ex. Rate",
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
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "allocatedAmtFC",
        yourlabel: "Allocated Amt FC",
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
        sectionHeader: "Bank Receipt",
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
        fieldname: "allocatedAmtHC",
        yourlabel: "Allocated Amt HC",
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
        sectionHeader: "Bank Receipt",
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
        fieldname: "balanceAmtFC",
        yourlabel: "Balance Amt FC",
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
        isEditable: false,
        isSwitchToText: false,
        isBreak: false,
        dropdownFilter: null,
        controlDefaultValue: null,
        functionOnChange: null,
        functionOnBlur: null,
        functionOnKeyPress: null,
        sectionHeader: "Bank Receipt",
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
        fieldname: "balanceAmtHC",
        yourlabel: "Balance Amt HC",
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
        type: 6706,
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
        sectionHeader: "Bank Receipt",
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
        sectionHeader: "Bank Receipt",
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
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
        typeValue: "decimal",
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
        sectionHeader: "Bank Receipt",
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
  "Bank Receipt": [
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
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      isBreak: false,
      dropdownFilter:
        "and  glTypeId in (select id from tblmasterdata where masterlistname = 'tblgltype' and name = 'BANK')",
      controlDefaultValue: null,
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
      yourlabel: "Ledger Name",
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
      isBreak: true,
      dropdownFilter:
        "and glTypeId not in (select id from tblmasterdata where masterlistname = 'tblgltype' and name IN ('BANK','CASH'))",
      controlDefaultValue: null,
      functionOnChange:
        "getVoucherInvoiceDetails(paymentByParty);fetchPartyBalance(paymentByParty);",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
    }, //Done
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
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      typeValue: "decimal",
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
      sectionHeader: "Bank Receipt",
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
      id: 133,
      fieldname: "calculationType",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "FCHC.FC-HC,HCFC.HC-FC",
      functionOnBlur: null,
      functionOnChange: "checkExchangesRate();",
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: null,
      isBreak: true,
      type: "string",
      yourlabel: "Calculation Type",
      ordering: 4,
    },
    {
      id: 29118,
      fieldname: "amtRecFC",
      yourlabel: "Bank Amt Rec FC",
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
      functionOnChange:
        "setSameCurrencyHc();setSameCurrencyFc();calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02);",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "amtRec",
      yourlabel: "Bank Amt Rec HC",
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
      type: 6706,
      typeValue: "decimal",
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
      functionOnChange:
        "setSameCurrencyHc();setSameCurrencyFc();calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      id: 85653,
      fieldname: "tdsApplicable",
      yourlabel: "Tds Applicable",
      controlname: "checkbox",
      isControlShow: true,
      isGridView: false,
      isDataFlow: false,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: false,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6903,
      typeValue: "boolean",
      size: "100",
      ordering: 1,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: true,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange:
        "calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02);",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "e",
      sectionHeader: "Charges",
      sectionOrder: 2,
      isCopy: true,
      isCopyEditable: true,
      position: "Top",
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
      fieldname: "tdsAmtFC",
      yourlabel: "TDS Amt FC",
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
      type: 6706,
      typeValue: "decimal",
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
      sectionHeader: "Charges",
      sectionOrder: 1,
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
      columnsToBeVisible: true,
    },
    {
      id: 29121,
      fieldname: "tdsAmt",
      yourlabel: "TDS Amt",
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
      type: 6706,
      typeValue: "decimal",
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
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      columnsToBeVisible: true,
    },
    {
      id: 29121,
      fieldname: "bankCharges",
      yourlabel: "Bank Charges",
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
      typeValue: "decimal",
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
      functionOnChange:
        "checkVoucherDataChanges();setSameCurrencyHc();setSameCurrencyFc();",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "exGainLoss",
      yourlabel: "Ex Gain / Loss",
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
      typeValue: "decimal",
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
      functionOnChange: "setSameCurrencyHc();setSameCurrencyFc();",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "balanceAmtFc",
      yourlabel: "On Account FC",
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
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "balanceAmtHc",
      yourlabel: "On Account HC",
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
      type: 6706,
      typeValue: "decimal",
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
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      sectionHeader: "Bank Receipt",
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
      controlDefaultValue: "BANK RECEIPT",
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
  "Bank Receipt": [
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
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      isBreak: false,
      dropdownFilter:
        "and glTypeId in (select id from tblmasterdata where masterlistname = 'tblgltype' and name = 'BANK')",
      controlDefaultValue: null,
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
      yourlabel: "Ledger Name",
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
      isBreak: true,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange:
        "getVoucherInvoiceDetails(paymentByParty);fetchPartyBalance(paymentByParty)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
    }, //done
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
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      typeValue: "decimal",
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
      sectionHeader: "Bank Receipt",
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
      id: 133,
      fieldname: "calculationType",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "FCHC.FC-HC,HCFC.HC-FC",
      functionOnBlur: null,
      functionOnChange: "checkExchangesRate();",
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: null,
      isBreak: true,
      type: "string",
      yourlabel: "Calculation Type",
      ordering: 4,
    },
    {
      id: 29118,
      fieldname: "amtRecFC",
      yourlabel: "Bank Amt Rec FC",
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
      functionOnChange:
        "setSameCurrencyHc();setSameCurrencyFc();calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "amtRec",
      yourlabel: "Bank Amt Rec HC",
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
      type: 6706,
      typeValue: "decimal",
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
      functionOnChange:
        "calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt ",
      sectionOrder: 1,
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
      id: 85653,
      fieldname: "tdsApplicable",
      yourlabel: "Tds Applicable",
      controlname: "checkbox",
      isControlShow: true,
      isGridView: false,
      isDataFlow: false,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: false,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6903,
      typeValue: "boolean",
      size: "100",
      ordering: 1,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: true,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange:
        "calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02);",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "e",
      sectionHeader: "Charges",
      sectionOrder: 2,
      isCopy: true,
      isCopyEditable: true,
      position: "Top",
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
      fieldname: "tdsAmtFC",
      yourlabel: "TDS Amt FC",
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
      type: 6706,
      typeValue: "decimal",
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
      sectionHeader: "Charges",
      sectionOrder: 1,
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
      id: 29121,
      fieldname: "tdsAmt",
      yourlabel: "TDS Amt",
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
      type: 6706,
      typeValue: "decimal",
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
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      id: 29121,
      fieldname: "bankCharges",
      yourlabel: "Bank Charges",
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
      typeValue: "decimal",
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
      functionOnChange:
        "checkVoucherDataChanges();setSameCurrencyHc();setSameCurrencyFc();",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "exGainLoss",
      yourlabel: "Ex Gain / Loss",
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
      typeValue: "decimal",
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
      functionOnChange: "setSameCurrencyHc();setSameCurrencyFc();",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "balanceAmtFc",
      yourlabel: "On Account FC",
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
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "balanceAmtHc",
      yourlabel: "On Account HC",
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
      type: 6706,
      typeValue: "decimal",
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
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      sectionHeader: "Bank Receipt",
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
      controlDefaultValue: "BANK RECEIPT",
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
  voucherTypeId: 9,
  voucherTypeIddropdown: [
    {
      value: 9,
      label: "BANK RECEIPT",
    },
  ],
  paymentBank: null,
  bankVoucherLedgerId: null,
  partyVoucherLedgerId: null,
  tdsVoucherLedgerId: null,
  bankChangesVoucherLedgerId: null,
  exGainLossVoucherLedgerId: null,
  onAccountVoucherLedgerId: null,
  tdsApplicable: false,
  voucherNo: null,
  voucherDate: null,
  paymentByParty: null,
  referenceNo: null,
  referenceDate: null,
  paymentTypeId: null,
  currencyId: null,
  exchangeRate: null,
  calculationType: null,
  amtRecFC: null,
  amtRec: null,
  tdsAmtFC: null,
  tdsAmt: null,
  bankCharges: null,
  exGainLoss: null,
  balanceAmtFc: null,
  balanceAmtHc: null,
  narration: null,
  tblVoucherLedger: [],
  tblVoucherLedgerDetails: [
    {
      invoiceIds: null,
      invoiceDate: null,
      OsAmtFC: null,
      OsAmtHC: null,
      exchangeRate: null,
      allocatedAmtHC: null,
      allocatedAmtFC: null,
      balanceAmtFC: null,
      balanceAmtHC: null,
      tdsAmtFC: null,
      tdsAmtHC: null,
      invoiceVoucherLedgerId: null,
      autoSetAllocatedAmount: false,
    },
  ],
};

const sameCurrencyHideField = {
  "Bank Receipt": [
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
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      isBreak: false,
      dropdownFilter:
        "and glTypeId in (select id from tblmasterdata where masterlistname = 'tblgltype' and name = 'BANK')",
      controlDefaultValue: null,
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
      yourlabel: "Ledger Name",
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
      isBreak: true,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange:
        "getVoucherInvoiceDetails(paymentByParty);fetchPartyBalance(paymentByParty)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
    }, //Done
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
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      sectionHeader: "Bank Receipt",
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
      typeValue: "decimal",
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
      sectionHeader: "Bank Receipt",
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
      id: 133,
      fieldname: "calculationType",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "FCHC.FC-HC,HCFC.HC-FC",
      functionOnBlur: null,
      functionOnChange: "checkExchangesRate();",
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: null,
      isBreak: true,
      type: "string",
      yourlabel: "Calculation Type",
      ordering: 4,
    },
    {
      id: 29118,
      fieldname: "amtRecFC",
      yourlabel: "Bank Amt Rec FC",
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
      functionOnChange:
        "setSameCurrencyHc();setSameCurrencyFc();calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "amtRec",
      yourlabel: "Bank Amt Rec HC",
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
      type: 6706,
      typeValue: "decimal",
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
      functionOnChange:
        "setSameCurrencyHc();setSameCurrencyFc();calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02)",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt ",
      sectionOrder: 1,
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
      id: 85653,
      fieldname: "tdsApplicable",
      yourlabel: "Tds Applicable",
      controlname: "checkbox",
      isControlShow: true,
      isGridView: false,
      isDataFlow: false,
      copyMappingName: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: false,
      keyToShowOnGrid: null,
      isDummy: false,
      dropDownValues: null,
      referenceTable: null,
      hyperlinkValue: null,
      referenceColumn: null,
      type: 6903,
      typeValue: "boolean",
      size: "100",
      ordering: 1,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: true,
      isBreak: false,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange:
        "calculateVoucherAmt(currencyId,exchangeRate,amtRec,amtRecFC,tdsAmtFC,tdsAmt,0.02);",
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "e",
      sectionHeader: "Charges",
      sectionOrder: 2,
      isCopy: true,
      isCopyEditable: true,
      position: "Top",
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
      fieldname: "tdsAmtFC",
      yourlabel: "TDS Amt FC",
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
      type: 6706,
      typeValue: "decimal",
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
      sectionHeader: "Charges",
      sectionOrder: 1,
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
      id: 29121,
      fieldname: "tdsAmt",
      yourlabel: "TDS Amt",
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
      type: 6706,
      typeValue: "decimal",
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
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      id: 29121,
      fieldname: "bankCharges",
      yourlabel: "Bank Charges",
      controlname: "number",
      isControlShow: true,
      columnsToBeVisible: true,
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
      typeValue: "decimal",
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
      functionOnChange:
        "checkVoucherDataChanges();setSameCurrencyHc();setSameCurrencyFc();",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "exGainLoss",
      yourlabel: "Ex Gain / Loss",
      controlname: "number",
      isControlShow: true,
      columnsToBeVisible: false,
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
      typeValue: "decimal",
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
      functionOnChange: "setSameCurrencyHc();setSameCurrencyFc();",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "balanceAmtFc",
      yourlabel: "On Account FC",
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
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      fieldname: "balanceAmtHc",
      yourlabel: "On Account HC",
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
      type: 6706,
      typeValue: "decimal",
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
      sectionHeader: "Bank Receipt",
      sectionOrder: 1,
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
      sectionHeader: "Bank Receipt",
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
      controlDefaultValue: "BANK RECEIPT",
      functionOnChange: null,
      functionOnBlur: null,
      functionOnKeyPress: null,
      isEditableMode: "b",
      sectionHeader: "Bank Receipt",
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
//last
