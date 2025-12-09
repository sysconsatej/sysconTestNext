"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useEffect, useState } from "react";
import { parentAccordionSection, accordianDetailsStyle } from "@/app/globalCss";
import styles from "@/app/app.module.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightTooltip from "@/components/Tooltip/customToolTip";
import { useSearchParams } from "next/navigation";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import { getUserDetails } from "@/helper/userDetails";
import { fontFamilyStyles } from "@/app/globalCss";
import { ledgerData } from "@/services/auth/FormControl.services.js";
import {
  createAddEditPaperStyles,
  displayReportTableContainerStyles,
  displayReportTablePaperStyles,
  displayReportTablePaperToggleStyles,
  displayReportTableContainerToggleStyles,
  displaytableHeadStyles,
  displaytableRowStyles,
  displayTableContainerStyles,
  searchInputStyling,
} from "@/app/globalCss";

import {
  displayTablePaperStyles,
  displayTableRowStylesNoHover,
} from "@/app/globalCss";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { useThemeProvider } from "@/context/themeProviderDataContext";
import Link from "next/link";

const LedgerReport = () => {
  const { defaultFinYearId } = getUserDetails();
  const { defaultCompanyId } = getUserDetails();
  const { defaultBranchId } = getUserDetails();
  const { clientId } = getUserDetails();
  const { initializeTheme, toggledThemeValue } = useThemeProvider();
  const searchParams = useSearchParams();
  const encodedGlId = searchParams.get("gl_id");
  const [toggle, setToggle] = useState(false);
  const [receivedGlId, setReceivedGlId] = useState(null);
  const [formControlData, setFormControlData] = useState([]);
  const [formDataChange, SetFormDataChange] = useState({});
  const [filterCondition, setFilterCondition] = useState({});
  const [clearFlag, setClearFlag] = useState({
    isClear: false,
    fieldName: "",
  });
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [parentsFields, setParentsFields] = useState([
    {
      id: 192,
      fieldname: "companyName",
      controlname: "dropdown",
      controlDefaultValue: null,
      dropdownFilter: "and ownCompany = 'y'",
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: "name",
      referenceTable: "tblCompany",
      toolTipMessage: "Company",
      type: "number",
      yourlabel: "Company",
      ordering: 1,
    },
    {
      id: 193,
      fieldname: "companyBranchName",
      controlname: "dropdown",
      controlDefaultValue: null,
      dropdownFilter: "and companyId=${dynamicFormData.companyName}",
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: "name",
      referenceTable: "tblCompanyBranch",
      toolTipMessage: "Company Branch",
      type: "number",
      yourlabel: "Company Branch",
      ordering: 2,
    },
    {
      id: 195,
      fieldname: "ledgerName",
      controlname: "dropdown",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: "name",
      referenceTable: "tblGeneralLedger",
      toolTipMessage: "Ledger Name",
      type: "number",
      yourlabel: "Ledger Name",
      ordering: 4,
    },
    {
      id: 196,
      fieldname: "fromDate",
      controlname: "date",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "From Date",
      type: "date",
      yourlabel: "From Date",
      ordering: 5,
    },
    {
      id: 197,
      fieldname: "toDate",
      controlname: "date",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "To Date",
      type: "date",
      yourlabel: "To Date",
      ordering: 6,
    },
    {
      id: 198,
      fieldname: "localForeign",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "L.Local,F.Foreign",
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "Local/Foreign",
      type: "string",
      yourlabel: "Local/Foreign",
      ordering: 7,
    },
    {
      id: 198,
      fieldname: "voucherGrouping",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "Y.Yes,N.No",
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "Voucher Grouping",
      type: "string",
      yourlabel: "Voucher Grouping",
      ordering: 8,
    },
    {
      id: 133,
      fieldname: "reportType",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "S.Summary,D.Detailed",
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: null,
      type: "string",
      yourlabel: "Report Type",
      ordering: 9,
    },
  ]);
  //   {
  //   id: 192,
  //   fieldname: "bankName",
  //   controlname: "dropdown",
  //   controlDefaultValue: null,
  //   dropdownFilter:
  //     "and masterListId = (select id from tblMasterList where name='tblBank')",
  //   dropDownValues: null,
  //   functionOnBlur: null,
  //   functionOnChange: null,
  //   functionOnKeyPress: null,
  //   isControlShow: true,
  //   isEditable: true,
  //   isRequired: false,
  //   referenceColumn: "name",
  //   referenceTable: "tblMasterData",
  //   toolTipMessage: "Bank",
  //   type: "number",
  //   yourlabel: "Bank",
  //   ordering: 1,
  // },
  const [newState, setNewState] = useState({
    fromDate: null,
    toDate: null,
    companyName: null,
    companyBranchName: null,
    ledgerName: null,
    localForeign: "L",
    bankName: null,
    voucherGrouping: "N",
    reportType: "D",
  });
  const [ledgerReportData, setLedgerReportData] = useState([]);
  const [localForeignRadio, setLocalForeignRadio] = useState(null);
  const [voucherGroupingRadio, setVoucherGroupingRadio] = useState(null);
  const [reportTypeRadio, setReportTypeRadio] = useState(null);

  console.log("newState", newState);

  const decodeGlId = (encodedId) => {
    try {
      return atob(encodedId);
    } catch (error) {
      console.error("Invalid encoded ID");
      return null;
    }
  };

  useEffect(() => {
    const decodedGlId = decodeGlId(encodedGlId);
    setReceivedGlId(decodedGlId);
  }, [searchParams]);

  const getLabelValue = (labelValue) => {
    setLabelName(labelValue);
  };

  const handleFieldValuesChange = (updatedValues) => {
    const entries = Object.entries(updatedValues);
    const hasFile = entries.some(([, value]) => value instanceof File);

    if (hasFile) {
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          handleFileAndUpdateState(value, (jsonData) => {
            setNewState((prevState) => {
              const newState = { ...prevState, [key]: jsonData };
              return newState;
            });
            setFilterCondition((prevState) => {
              const newFilterCondition = { ...prevState, [key]: jsonData };
              return newFilterCondition;
            });
          });
        } else {
          setNewState((prevState) => {
            const newState = { ...prevState, [key]: value };
            return newState;
          });
          setFilterCondition((prevState) => {
            const newFilterCondition = { ...prevState, [key]: value };
            return newFilterCondition;
          });
          SetFormDataChange((prevState) => {
            const newState = { ...prevState, ...updatedValues };
            return newState;
          });
        }
      });
    } else {
      setNewState((prevState) => {
        const newState = { ...prevState, ...updatedValues };
        return newState;
      });
      SetFormDataChange((prevState) => {
        const newState = { ...prevState, ...updatedValues };
        return newState;
      });
      setFilterCondition((prevState) => {
        const newFilterCondition = { ...prevState, ...updatedValues };
        return newFilterCondition;
      });
    }
  };

  const formatDate = (date) => {
    // no selection / empty -> null
    if (date == null || date === "") return null;

    // accept Date, string, or timestamp
    const d = date instanceof Date ? date : new Date(date);

    // invalid date -> null
    if (Number.isNaN(d.getTime())) return null;

    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toIntOrNull = (v) => {
    if (v === null || v === undefined) return null; // null/undefined → null
    const s = typeof v === "string" ? v.trim() : v; // trim strings
    if (s === "") return null; // empty string → null
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null; // NaN → null
  };

  //Fetch Ledger Report Data Function
  async function fetchLedgerReportData() {
    console.log('data', newState)
    const filterCondition = {
      fromDate: formatDate(newState?.fromDate),
      toDate: formatDate(newState?.toDate),
      companyBranchId: toIntOrNull(newState?.companyBranchName),
      companyId: toIntOrNull(newState?.companyName),
      ledgerId: toIntOrNull(newState?.ledgerName),
      clientId: toIntOrNull(clientId),
      voucherGrouping: newState?.voucherGrouping || null,
    };

    const payload = {
      spName: "ledgerReportApi",
      filterCondition: filterCondition,
    };

    console.log("ledgerReportRequestBody =>", payload);
    const ledger = await ledgerData(payload);

    const rows = Array.isArray(ledger?.data) ? ledger.data : [];
    setLedgerReportData(rows);

    if (
      newState?.localForeign &&
      newState?.localForeign !== localForeignRadio
    ) {
      setLocalForeignRadio(newState.localForeign);
    }
    if (
      newState?.voucherGrouping &&
      newState?.voucherGrouping !== voucherGroupingRadio
    ) {
      setVoucherGroupingRadio(newState.voucherGrouping);
    }
    if (newState?.reportType && newState?.reportType !== reportTypeRadio) {
      setReportTypeRadio(newState.reportType);
    }

    return payload;
  }

  // --- helpers Starts ---
  const fmtDate = (v) => {
    if (!v) return "";
    const d = typeof v === "string" ? new Date(v) : v;
    if (Number.isNaN(d?.getTime?.())) return String(v);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const fmtAmt = (n) => {
    const num = Number(n);
    return Number.isFinite(num)
      ? num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      : "";
  };
  // --- helpers Ends ---

  // Redirection To Invoice Page or Voucher Page Starts ---
  const voucherRouteBase = "/voucher/bankReceipt/addEdit";
  const makeVoucherHref = (r) => `${r?.menuLink}/addEdit?id=${r.voucherId}`;
  // Redirection To Invoice Page or Voucher Page Ends ---

  // --- All Table Headers Array Starts ---
  const localCurrencyColumns = [
    {
      key: "date",
      label: "Date",
      align: "left",
      render: (r) => fmtDate(r.voucherDate || r.date),
    },
    {
      key: "voucherNo",
      label: "Voucher No.",
      align: "left",
      render: (r) => {
        const no = r.voucherNo || r.voucherNumber || r.voucher;
        const id = r.voucherId ?? r.id;
        if (!no) return ""; // nothing to show
        if (!id) return no; // no id → plain text
        return (
          <Link
            href={makeVoucherHref(r)}
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()} // don’t trigger row click
          >
            {no}
          </Link>
        );
      },
    },
    {
      key: "chequeNo",
      label: "Cheque No.",
      align: "left",
      render: (r) => r.chequeNo || r.chequeNumber || r.instrumentNo || "",
    },
    {
      key: "partyBillNo",
      label: "Party bill no",
      align: "left",
      render: (r) => r.partyBillNo || r.billNo || "",
    },
    {
      key: "partyBillDate",
      label: "Party bill date",
      align: "left",
      render: (r) => fmtDate(r.partyBillDate || r.billDate),
    },
    {
      key: "particulars",
      label: "Particulars",
      align: "left",
      render: (r) => r.particulars || r.accountName || r.ledgerName || "",
    },
    {
      key: "narration",
      label: "Narration",
      align: "left",
      render: (r) => r.narration || "",
    },
    {
      key: "job",
      label: "Job",
      align: "left",
      render: (r) => r.job || r.jobNo || r.jobName || "",
    },
    {
      key: "debit",
      label: "Debit",
      align: "right",
      render: (r) => fmtAmt(r.debitAmount),
    },
    {
      key: "credit",
      label: "Credit",
      align: "right",
      render: (r) => fmtAmt(r.creditAmount),
    },
    {
      key: "balance",
      label: "Balance",
      align: "right",
      render: (r) => fmtAmt(r.balance || r.runningBalance),
    },
    {
      key: "balanceType",
      label: "BalanceType",
      align: "left",
      render: (r) => r.balanceType || r.balanceSign || "",
    },
  ];

  const foreignCurrencyColumns = [
    {
      key: "date",
      label: "Date",
      align: "left",
      render: (r) => fmtDate(r.voucherDate || r.date),
    },
    {
      key: "voucherNo",
      label: "Voucher No.",
      align: "left",
      render: (r) => {
        const no = r.voucherNo || r.voucherNumber || r.voucher;
        const id = r.voucherId ?? r.id;
        if (!no) return ""; // nothing to show
        if (!id) return no; // no id → plain text
        return (
          <Link
            href={makeVoucherHref(r)}
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()} // don’t trigger row click
          >
            {no}
          </Link>
        );
      },
    },
    {
      key: "chequeNo",
      label: "Cheque No.",
      align: "left",
      render: (r) => r.chequeNo || r.chequeNumber || r.instrumentNo || "",
    },
    {
      key: "partyBillNo",
      label: "Party bill no",
      align: "left",
      render: (r) => r.partyBillNo || r.billNo || "",
    },
    {
      key: "partyBillDate",
      label: "Party bill date",
      align: "left",
      render: (r) => fmtDate(r.partyBillDate || r.billDate),
    },
    {
      key: "particulars",
      label: "Particulars",
      align: "left",
      render: (r) => r.particulars || r.accountName || r.ledgerName || "",
    },
    {
      key: "narration",
      label: "Narration",
      align: "left",
      render: (r) => r.narration || "",
    },
    {
      key: "job",
      label: "Job",
      align: "left",
      render: (r) => r.job || r.jobNo || r.jobName || "",
    },
    {
      key: "job",
      label: "Job",
      align: "left",
      render: (r) => r.currencyCode || "",
    },
    {
      key: "debit",
      label: "Debit",
      align: "right",
      render: (r) => fmtAmt(r.debitAmountFc),
    },
    {
      key: "credit",
      label: "Credit",
      align: "right",
      render: (r) => fmtAmt(r.creditAmountFc),
    },
    {
      key: "exchangeRate",
      label: "exchangeRate",
      align: "right",
      render: (r) => fmtAmt(r.exchangeRate),
    },
    {
      key: "balance",
      label: "Balance",
      align: "right",
      render: (r) => fmtAmt(r.balance || r.runningBalance),
    },
    {
      key: "balanceType",
      label: "BalanceType",
      align: "left",
      render: (r) => r.balanceType || r.balanceSign || "",
    },
  ];
  // --- All Table Headers Array ends ---

  //Calculate Total Of table starts --

  const localCurrencyTotals = React.useMemo(() => {
    let debit = 0,
      credit = 0;
    for (const r of ledgerReportData || []) {
      debit += Number(r.debitAmount) || 0;
      credit += Number(r.creditAmount) || 0;
    }
    return { debit, credit, balance: debit - credit };
  }, [ledgerReportData]);

  const foreignCurrencyTotals = React.useMemo(() => {
    let debit = 0,
      credit = 0;
    for (const r of ledgerReportData || []) {
      debit += Number(r.debitAmountFc) || 0;
      credit += Number(r.creditAmountFc) || 0;
    }
    return { debit, credit, balance: debit - credit };
  }, [ledgerReportData]);

  return (
    <>
      <React.Fragment>
        <Accordion
          expanded={toggle}
          sx={{ ...parentAccordionSection }}
          key={1}
          setTypeofModal={setTypeofModal}
          getLabelValue={getLabelValue}
        >
          {/* Accordion Summary */}
          <AccordionSummary
            className="relative left-[11px]"
            expandIcon={
              <LightTooltip title={toggle ? "Collapse" : "Expand"}>
                <ExpandMoreIcon sx={{ color: "black" }} />
              </LightTooltip>
            }
            aria-controls={`panel${1 + 1}-content`}
            id={`panel${1 + 1}-header`}
            onClick={() => setToggle((prev) => !prev)}
          >
            <Typography className="relative right-[11px]">
              {"Ledger Report "}
            </Typography>
          </AccordionSummary>
          {/* Accordion Details */}
          <AccordionDetails
            className={`!pb-0 overflow-hidden ${styles.thinScrollBar}`}
            sx={{ ...accordianDetailsStyle }}
          >
            {/* Custom Input Fields */}

            <CustomeInputFields
              inputFieldData={parentsFields}
              values={newState}
              onValuesChange={handleFieldValuesChange}
              onChangeHandler={(result) => {
                handleChangeFunction(result);
              }}
              onBlurHandler={(result) => {
                handleBlurFunction(result);
              }}
              clearFlag={clearFlag}
              formControlData={formControlData}
              formDataChange={formDataChange}
              setFormControlData={setFormControlData}
              setStateVariable={setNewState}
              getLabelValue={() => {
                console.log("sample");
              }}
            />

            <div className="flex">
              <button
                onClick={async () => {
                  await fetchLedgerReportData();
                }}
                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              >
                Go
              </button>
            </div>
          </AccordionDetails>
        </Accordion>
        {/* Table */}
        {localForeignRadio === "L" &&
          voucherGroupingRadio === "N" &&
          reportTypeRadio === "D" && (
            <>
              <div className="flex items-center justify-between ps-4 pe-4">
                <p className="font-bold text-[var(--accordionChildHeaderBg)] text-xs mb-2">
                  Opening Balance :
                </p>
                <p className="font-bold text-[var(--tableRowTextColor)] text-xs mb-2 text-right">
                  1000000
                </p>
              </div>
              <Paper
                sx={{
                  ...(toggle
                    ? displayReportTablePaperToggleStyles
                    : displayReportTablePaperStyles),
                  displayTablePaperStyles,
                }}
              >
                <TableContainer
                  id="paper"
                  //ref={rowRefs}
                  className={`${styles.thinScrollBar} ${styles.tableContainer} `}
                  sx={{
                    ...(toggle
                      ? displayReportTableContainerToggleStyles
                      : displayReportTableContainerStyles),
                    position: "relative !important",
                    displayTableContainerStyles,
                  }}
                >
                  <Table
                    stickyHeader
                    aria-label="ledger table"
                    style={{
                      border: "1px solid grey",
                      borderCollapse: "collapse",
                      borderSpacing: 0,
                    }}
                    className={`min-w-full text-sm overflow-auto ${styles.stripedRow} ${styles.hideScrollbar} ${styles.thinScrollBar}`}
                  >
                    <TableHead
                      className={`${styles.inputTextColor}`}
                      sx={{ ...displaytableHeadStyles }}
                    >
                      <TableRow className={`${styles.tblHead}`}>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        //sx={{ minWidth: 110 }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Voucher No.
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Cheque No.
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Party bill no
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Party bill date
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Particulars
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Narration
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Job
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Debit
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Credit
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Balance
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          BalanceType
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody
                      id="bodyRow"
                      style={{
                        overflow: "auto",
                        marginTop: "30px",
                        border: "1px solid grey",
                      }}
                      className="text-gray-900 dark:text-white"
                    >
                      {ledgerReportData.map((row, rowIndex) => (
                        <TableRow
                          key={row?.id ?? rowIndex}
                          style={{ border: "1px solid grey" }}
                          className={`${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
                          sx={{
                            ...(toggledThemeValue
                              ? displayTableRowStylesNoHover
                              : displaytableRowStyles),
                          }}
                        >
                          {localCurrencyColumns.map((col, colIndex) => (
                            <TableCell
                              key={`${rowIndex}-${col.key}`}
                              align={col.align || "left"}
                              style={{ border: "1px solid grey" }}
                              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
                            >
                              {col.render(row) ?? ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {/* Totals row */}
                      <TableRow
                        key="totalRow"
                        style={{ border: "1px solid grey" }}
                        className={`${styles.hh} rounded-lg p-0 opacity-1 z-0 font-bold dark:text-white`}
                        sx={{
                          ...(toggledThemeValue
                            ? displayTableRowStylesNoHover
                            : displaytableRowStyles),
                          backgroundColor: "#f0f0f0 !important",
                          fontWeight: "bold !important",
                        }}
                      >
                        {localCurrencyColumns.map((col, idx) => {
                          let value = "";
                          if (col.key === "debit")
                            value = fmtAmt(localCurrencyTotals.debit);
                          else if (col.key === "credit")
                            value = fmtAmt(localCurrencyTotals.credit);
                          // else if (col.key === "balance")
                          //   value = fmtAmt(totals.balance);
                          else if (idx === 0) value = "Total";
                          return (
                            <TableCell
                              key={`total-${col.key}`}
                              align={col.align || "left"}
                              style={{
                                border: "1px solid grey",
                                fontWeight: "bold !important",
                              }}
                              className="whitespace-nowrap text-xs font-bold !text-gray-900 dark:text-white"
                            >
                              {value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      {/* Totals row */}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              <div className="flex items-center justify-between ps-4 pe-4">
                <p className="font-bold text-[var(--accordionChildHeaderBg)] text-xs mt-2 mb-2">
                  Closing Balance :
                </p>
                <p className="font-bold text-[var(--tableRowTextColor)] text-xs mb-2 text-right mt-2 mb-2">
                  1000000
                </p>
              </div>
            </>
          )}
        {localForeignRadio === "F" &&
          voucherGroupingRadio === "N" &&
          reportTypeRadio === "D" && (
            <>
              <div className="flex items-center justify-between ps-4 pe-4">
                <p className="font-bold text-[var(--accordionChildHeaderBg)] text-xs mb-2">
                  Opening Balance :
                </p>
                <p className="font-bold text-[var(--tableRowTextColor)] text-xs mb-2 text-right">
                  1000000
                </p>
              </div>
              <Paper
                sx={{
                  ...(toggle
                    ? displayReportTablePaperToggleStyles
                    : displayReportTablePaperStyles),
                  displayTablePaperStyles,
                }}
              >
                <TableContainer
                  id="paper"
                  //ref={rowRefs}
                  className={`${styles.thinScrollBar} ${styles.tableContainer} `}
                  sx={{
                    ...(toggle
                      ? displayReportTableContainerToggleStyles
                      : displayReportTableContainerStyles),
                    position: "relative !important",
                    displayTableContainerStyles,
                  }}
                >
                  <Table
                    stickyHeader
                    aria-label="ledger table"
                    style={{
                      border: "1px solid grey",
                      borderCollapse: "collapse",
                      borderSpacing: 0,
                    }}
                    className={`min-w-full text-sm overflow-auto ${styles.stripedRow} ${styles.hideScrollbar} ${styles.thinScrollBar}`}
                  >
                    <TableHead
                      className={`${styles.inputTextColor}`}
                      sx={{ ...displaytableHeadStyles }}
                    >
                      <TableRow className={`${styles.tblHead}`}>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        //sx={{ minWidth: 110 }}
                        >
                          Date
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Voucher No.
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Cheque No.
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Party bill no
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Party bill date
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Particulars
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Narration
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Job
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Currency Code
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Debit Amount FC
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Credit Amount FC
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Exchange Rate
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          Balance
                        </TableCell>
                        <TableCell
                          style={{
                            position: "sticky",
                          }}
                          className={`${styles.cellHeading} cursor-pointer ${styles.tableCell} ${styles.tableCellHover} whitespace-nowrap text-xs`}
                        >
                          BalanceType
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody
                      id="bodyRow"
                      style={{
                        overflow: "auto",
                        marginTop: "30px",
                        border: "1px solid grey",
                      }}
                      className="text-gray-900 dark:text-white"
                    >
                      {ledgerReportData.map((row, rowIndex) => (
                        <TableRow
                          key={row?.id ?? rowIndex}
                          style={{ border: "1px solid grey" }}
                          className={`${styles.tableCellHoverEffect} ${styles.hh} rounded-lg p-0 opacity-1 z-0`}
                          sx={{
                            ...(toggledThemeValue
                              ? displayTableRowStylesNoHover
                              : displaytableRowStyles),
                          }}
                        >
                          {foreignCurrencyColumns.map((col, colIndex) => (
                            <TableCell
                              key={`${rowIndex}-${col.key}`}
                              align={col.align || "left"}
                              style={{ border: "1px solid grey" }}
                              className="whitespace-nowrap text-xs text-gray-900 dark:text-white"
                            >
                              {col.render(row) ?? ""}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                      {/* Totals row */}
                      <TableRow
                        key="totalRow"
                        style={{ border: "1px solid grey" }}
                        className={`${styles.hh} rounded-lg p-0 opacity-1 z-0 font-bold dark:text-white`}
                        sx={{
                          ...(toggledThemeValue
                            ? displayTableRowStylesNoHover
                            : displaytableRowStyles),
                          backgroundColor: "#f0f0f0 !important",
                          fontWeight: "bold !important",
                        }}
                      >
                        {foreignCurrencyColumns.map((col, idx) => {
                          let value = "";
                          if (col.key === "debit")
                            value = fmtAmt(foreignCurrencyTotals.debit);
                          else if (col.key === "credit")
                            value = fmtAmt(foreignCurrencyTotals.credit);
                          // else if (col.key === "balance")
                          //   value = fmtAmt(totals.balance);
                          else if (idx === 0) value = "Total";
                          return (
                            <TableCell
                              key={`total-${col.key}`}
                              align={col.align || "left"}
                              style={{
                                border: "1px solid grey",
                                fontWeight: "bold !important",
                              }}
                              className="whitespace-nowrap text-xs font-bold !text-gray-900 dark:text-white"
                            >
                              {value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                      {/* Totals row */}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              <div className="flex items-center justify-between ps-4 pe-4">
                <p className="font-bold text-[var(--accordionChildHeaderBg)] text-xs mt-2 mb-2">
                  Closing Balance :
                </p>
                <p className="font-bold text-[var(--tableRowTextColor)] text-xs mb-2 text-right mt-2 mb-2">
                  1000000
                </p>
              </div>
            </>
          )}
        {localForeignRadio === "F" &&
          voucherGroupingRadio === "N" &&
          reportTypeRadio === "S" && (
            <>
              <table className="mt-4 ms-2">
                <tr>
                  <td className="text-xs font-bold text-[var(--accordionChildHeaderBg)] pb-2">
                    Opening Balance :
                  </td>
                  <td className="text-xs font-bold text-[var(--tableRowTextColor)] text-right ps-4 pb-2">
                    1000000
                  </td>
                </tr>
                <tr>
                  <td className="text-xs text-[var(--accordionChildHeaderBg)] pb-2">
                    Total Debit :
                  </td>
                  <td className="text-xs text-[var(--tableRowTextColor)] text-right ps-4 pb-2">
                    1000000
                  </td>
                </tr>
                <tr>
                  <td className="text-xs text-[var(--accordionChildHeaderBg)] pb-2">
                    Total Credit :
                  </td>
                  <td className="text-xs text-[var(--tableRowTextColor)] text-right ps-4 pb-2">
                    1000000
                  </td>
                </tr>
                <tr>
                  <td className="text-xs font-bold text-[var(--accordionChildHeaderBg)] pb-2">
                    Closing Balance :
                  </td>
                  <td className="text-xs font-bold text-[var(--tableRowTextColor)] text-right ps-4 pb-2">
                    1000000
                  </td>
                </tr>
              </table>
            </>
          )}
        {localForeignRadio === "L" &&
          voucherGroupingRadio === "N" &&
          reportTypeRadio === "S" && (
            <>
              <table className="mt-4 ms-2">
                <tr>
                  <td className="text-xs font-bold text-[var(--accordionChildHeaderBg)]">
                    Opening Balance :
                  </td>
                  <td className="text-xs font-bold text-[var(--tableRowTextColor)] text-right ps-4 pb-2">
                    1000000
                  </td>
                </tr>
                <tr>
                  <td className="text-xs text-[var(--accordionChildHeaderBg)]">
                    Total Debit :
                  </td>
                  <td className="text-xs text-[var(--tableRowTextColor)] text-right ps-4 pb-2">
                    1000000
                  </td>
                </tr>
                <tr>
                  <td className="text-xs text-[var(--accordionChildHeaderBg)]">
                    Total Credit :
                  </td>
                  <td className="text-xs text-[var(--tableRowTextColor)] text-right ps-4 pb-2">
                    1000000
                  </td>
                </tr>
                <tr>
                  <td className="text-xs font-bold text-[var(--accordionChildHeaderBg)]">
                    Closing Balance :
                  </td>
                  <td className="text-xs font-bold text-[var(--tableRowTextColor)] text-right ps-4 pb-2">
                    1000000
                  </td>
                </tr>
              </table>
            </>
          )}
      </React.Fragment>
    </>
  );
};

export default LedgerReport;
