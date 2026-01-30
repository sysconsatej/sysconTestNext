"use client";
/* eslint-disable */

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import styles from "@/app/app.module.css";

import { styled } from "@mui/material/styles";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import {
  parentAccordionSection,
  SummaryStyles,
  accordianDetailsStyleForm,
  expandIconStyle,
  customTextFieldStyles,
  textInputStyle,
} from "@/app/globalCss";

import LightTooltip from "@/components/Tooltip/customToolTip";

import Box from "@mui/material/Box";
import {
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

/* =========================
   FORM DATA
========================= */
const formdata = {
  Main: [],
  "Buyer/Third Party Information": [
    {
      id: 125711,
      fieldname: null,
      yourlabel: "Third Party Info",
      controlname: "label",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isDummy: true,
      ordering: 25,
      isEditable: true,
      isBreak: true,
    },
    {
      id: 1004,
      fieldname: "exporterNameOne",
      yourlabel: "Name",
      controlname: "text",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 1002,
      fieldname: "exporterAddressOne",
      yourlabel: "Address",
      controlname: "textarea",
      ordering: 2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 1012,
      fieldname: "consigneeCountryNameOne",
      yourlabel: "City",
      controlname: "text",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 1005,
      fieldname: "ieCodeNo",
      yourlabel: "Pin",
      controlname: "text",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 10122,
      fieldname: "consigneeCountryNameOneCountry",
      yourlabel: "Country",
      controlname: "text",
      ordering: 5,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 10041,
      fieldname: "exporterStateIdOne",
      yourlabel: "State",
      controlname: "dropdown",
      referenceTable: "tblState",
      referenceColumn: "name",
      ordering: 6,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isBreak: true,
    },

    {
      id: 125712,
      fieldname: null,
      yourlabel: "Buyer Info",
      controlname: "label",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isDummy: true,
      ordering: 26,
      isEditable: true,
      isBreak: true,
    },
    {
      id: 2004,
      fieldname: "exporterName",
      yourlabel: "Name",
      controlname: "text",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 2002,
      fieldname: "exporterAddress",
      yourlabel: "Address",
      controlname: "textarea",
      ordering: 2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 2012,
      fieldname: "consigneeCountryNameCity",
      yourlabel: "City",
      controlname: "text",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 2005,
      fieldname: "buyerPin",
      yourlabel: "Pin",
      controlname: "text",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 20121,
      fieldname: "buyerCountry",
      yourlabel: "Country",
      controlname: "text",
      ordering: 5,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
    },
    {
      id: 20041,
      fieldname: "exporterStateId",
      yourlabel: "State",
      controlname: "dropdown",
      referenceTable: "tblState",
      referenceColumn: "name",
      ordering: 6,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isBreak: true,
    },
  ],
  "Other Info": [
    {
      fieldname: "exportContractNoDate",
      yourlabel: "Export Contract No / Dt.",
      controlname: "text",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 1,
    },
    {
      fieldname: "natureOfPaymentId",
      yourlabel: "Nature of Payment",
      controlname: "dropdown",
      referenceTable: "tblMasterData",
      referenceColumn: "name",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList where name = 'tblNatureOfPayment')",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 2,
    },
    {
      fieldname: "paymentPeriodDays",
      yourlabel: "Payment Period",
      controlname: "number",
      suffixText: "days",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 3,
    },
    {
      fieldname: "aeoCode",
      yourlabel: "AEO Code",
      controlname: "text",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 4,
    },
    {
      fieldname: "aeoCountryId",
      yourlabel: "AEO Country",
      controlname: "dropdown",
      referenceTable: "tblCountry",
      referenceColumn: "name",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 5,
    },
    {
      fieldname: "aeoRole",
      yourlabel: "AEO Role",
      controlname: "text",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      isBreak: true,
      ordering: 6,
    },
  ],
};

/* ============================================================================
  ✅ INVOICE SHEET (FIXED)
  - Removed hooks from inside functions
  - Fixed isParentAccordionOpen undefined by using local `isOpen`
  - Safe merge updates to newState + optional onValuesChange callback
============================================================================ */
export default function InvoiceSheet({
  values = {},
  onValuesChange,
  inEditMode = { isEditMode: false, isCopy: false },
  newState = {},
  setStateVariable,
}) {
  const [parentsFields] = useState(formdata);
  const [expandAll] = useState(true);

  const [clearFlag, setClearFlag] = useState({ isClear: false, fieldName: "" });
  const [tableName] = useState(false);
  const [formControlData, setFormControlData] = useState([]);
  const [hideFieldName] = useState([]);
  const [labelName, setLabelName] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [paraText, setParaText] = useState("");
  const [isError, setIsError] = useState(false);
  const [typeofModal, setTypeofModal] = useState("onClose");

  const [submitNewState, setSubmitNewState] = useState({
    routeName: "mastervalue",
  });

  const getLabelValue = (labelValue) => setLabelName(labelValue);

  const setStateSafe = (patchOrUpdater) => {
    if (typeof setStateVariable === "function") {
      setStateVariable(patchOrUpdater);
    }
  };

  const handleFieldValuesChange = (updatedValues = {}) => {
    // merge into newState
    setStateSafe((prev) => {
      const base = prev || newState || {};
      const merged = { ...base, ...updatedValues };
      return merged;
    });

    // keep your submit object synced
    setSubmitNewState((prev) => ({ ...(prev || {}), ...updatedValues }));

    // optional callback (if parent wants values)
    if (typeof onValuesChange === "function") {
      onValuesChange(updatedValues);
    }
  };

  const handleFieldValuesChange2 = async () => {
    // keep as-is (you can implement mapping logic later)
  };

  return (
    <div
      className={`w-full p-1 ${styles.pageBackground} overflow-y-auto overflow-x-hidden ${styles.thinScrollBar}`}
      style={{ height: "calc(100vh - 24vh)" }}
    >
      {Object.keys(parentsFields).map((section, index) => (
        <ParentAccordianComponent
          key={`${section}-${index}`}
          section={section}
          indexValue={index}
          expandAll={expandAll}
          parentsFields={parentsFields}
          newState={newState}
          handleFieldValuesChange={handleFieldValuesChange}
          handleFieldValuesChange2={handleFieldValuesChange2}
          setNewState={setStateVariable}
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
        />
      ))}

      <CessCenvatAccordion />
    </div>
  );
}

InvoiceSheet.propTypes = {
  values: PropTypes.object,
  onValuesChange: PropTypes.func,
  inEditMode: PropTypes.object,
  newState: PropTypes.any,
  setStateVariable: PropTypes.any,
};

/* ============================================================================
  ✅ PARENT ACCORDION (FIXED)
  - Uses `isOpen` state (no undefined isParentAccordionOpen)
============================================================================ */
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
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [fieldId, setFieldId] = useState([]);

  useEffect(() => setIsOpen(!!expandAll), [expandAll]);
  useEffect(() => setFieldId(hideColumnsId || []), [hideColumnsId]);

  const applyResultToState = (result, from = "change") => {
    if (result?.isCheck === false) {
      if (result?.alertShow) {
        setParaText?.(result?.message || "");
        setIsError?.(true);
        setOpenModal?.((prev) => !prev);
        setTypeofModal?.("onCheck");
        if (from === "change") {
          setClearFlag?.({ isClear: true, fieldName: result?.fieldName });
        }
      }
      return;
    }

    const patch = { ...(result?.newState || {}) };
    if (typeof setNewState === "function") {
      setNewState((prev) => ({ ...(prev || {}), ...patch }));
    }
    setSubmitNewState?.((prev) => ({ ...(prev || {}), ...patch }));
  };

  return (
    <Accordion
      expanded={isOpen}
      onChange={() => setIsOpen((p) => !p)}
      sx={{ ...parentAccordionSection }}
    >
      <AccordionSummary
        sx={{ ...SummaryStyles }}
        expandIcon={
          <LightTooltip title={isOpen ? "Collapse" : "Expand"}>
            <ExpandMoreIcon sx={{ ...expandIconStyle }} />
          </LightTooltip>
        }
      >
        <Typography className="relative right-[11px]">{section}</Typography>
      </AccordionSummary>

      <AccordionDetails
        className={`overflow-hidden p-0 ${styles.thinScrollBar}`}
        sx={{ ...accordianDetailsStyleForm }}
      >
        <CustomeInputFields
          inputFieldData={parentsFields?.[section] || []}
          values={newState}
          onValuesChange={handleFieldValuesChange}
          handleFieldValuesChange2={handleFieldValuesChange2}
          inEditMode={{ isEditMode: false, isCopy: true }}
          onChangeHandler={(result) => applyResultToState(result, "change")}
          onBlurHandler={(result) => applyResultToState(result, "blur")}
          clearFlag={clearFlag}
          newState={newState}
          tableName={parentTableName}
          formControlData={formControlData}
          setFormControlData={setFormControlData}
          setStateVariable={setNewState}
          getLabelValue={getLabelValue}
          hideColumnsId={fieldId}
        />
      </AccordionDetails>
    </Accordion>
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
};

/* ============================================================================
  ✅ CESS / CENVAT ACCORDION (your table, kept)
============================================================================ */
function CessCenvatAccordion({
  section = "Freight Insurance and Other Charges",
  indexValue = 0,
  values: extValues,
  onChangeHandler,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const [localValues, setLocalValues] = useState({
    Freight: "",
    FreightRate1: "0.00",
    FreightRateType: "%",
    FreightRate2: "0.00",
    FreightTV: "0.00",
    FreightQty: "0.000",
    FreightUnit: "",
    FreightDesc: "",

    Insurance: "",
    InsuranceRate1: "0.00",
    InsuranceRateType: "%",
    InsuranceRate2: "0.00",
    InsuranceTV: "0.00",
    InsuranceQty: "0.000",
    InsuranceUnit: "",
    InsuranceDesc: "",

    Discount: "",
    DiscountRate1: "0.00",
    DiscountRateType: "%",
    DiscountRate2: "0.00",
    DiscountTV: "0.00",
    DiscountQty: "0.000",
    DiscountUnit: "",
    DiscountDesc: "",

    otherdeduction: "",
    otherdeductionRate1: "0.00",
    otherdeductionRateType: "%",
    otherdeductionRate2: "0.00",
    otherdeductionTV: "0.00",
    otherdeductionQty: "0.000",
    otherdeductionUnit: "",
    otherdeductionDesc: "",

    Commission: "",
    CommissionRate1: "0.00",
    CommissionRateType: "%",
    CommissionRate2: "0.00",
    CommissionTV: "0.00",
    CommissionQty: "0.000",
    CommissionUnit: "",
    CommissionDesc: "",

    fobvalue: "",
    fobvalueRate1: "0.00",
    fobvalueRateType: "%",
    fobvalueRate2: "0.00",
    fobvalueTV: "0.00",
    fobvalueQty: "0.000",
    fobvalueUnit: "",
    fobvalueDesc: "",
  });

  const values = extValues ?? localValues;

  const setValue = (key, val) => {
    if (typeof onChangeHandler === "function" && extValues) {
      onChangeHandler({ ...(extValues || {}), [key]: val });
      return;
    }
    setLocalValues((p) => ({ ...p, [key]: val }));
  };

  const CustomeTextField = useMemo(
    () =>
      styled(TextField)({
        ...customTextFieldStyles,
      }),
    []
  );

  const compactFieldSx = (k, width) => ({
    ...textInputStyle({ fieldname: values?.[k], isFocused: false }),
    width,
    minWidth: 0,
    "& .MuiOutlinedInput-root": {
      height: "27px",
      backgroundColor: "var(--inputBg)",
    },
    "& .MuiOutlinedInput-input": {
      padding: 0,
      height: "27px",
      width: "100%",
    },
    "& .MuiInputBase-input": {
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
      color: "var(--inputTextColor)",
      marginLeft: "15px",
      marginRight: "15px",
    },
    "& .MuiInputLabel-root": {
      fontSize: "var(--inputFontSize)",
      fontWeight: "var(--inputFontWeight)",
      color: "var(--table-text-color)",
    },
  });

  const SmallText = ({ k, label, width = 120, type = "text", disabled = false }) => (
    <LightTooltip title={label || ""}>
      <CustomeTextField
        autoComplete="off"
        type={type}
        size="small"
        variant="outlined"
        value={values?.[k] ?? ""}
        onChange={(e) => setValue(k, e.target.value)}
        disabled={disabled}
        sx={{
          ...compactFieldSx(k, width),
          "& input": { padding: "2px 6px" },
        }}
      />
    </LightTooltip>
  );

  const SmallSelect = ({ k, label, options, width = 140, disabled = false }) => (
    <LightTooltip title={label || ""}>
      <CustomeTextField
        select
        size="small"
        variant="outlined"
        value={values?.[k] ?? ""}
        onChange={(e) => setValue(k, e.target.value)}
        disabled={disabled}
        sx={{
          ...compactFieldSx(k, width),
          "& .MuiSelect-select": {
            padding: "2px 26px 2px 6px",
            fontSize: "var(--inputFontSize)",
            color: "var(--inputTextColor)",
          },
          "& .MuiSvgIcon-root": {
            color: "var(--table-text-color) !important",
            fontSize: 18,
            right: 4,
          },
        }}
      >
        {options.map((o) => (
          <MenuItem
            key={o.value}
            value={o.value}
            dense
            sx={{ fontSize: "var(--inputFontSize)" }}
          >
            {o.label}
          </MenuItem>
        ))}
      </CustomeTextField>
    </LightTooltip>
  );

  const RatesCell = ({ k1, kType, k2 }) => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "nowrap",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <SmallText k={k1} label="Rate" width={110} type="number" />
      <Typography
        sx={{
          fontSize: "12px",
          opacity: 0.75,
          whiteSpace: "nowrap",
          color: "var(--tableRowTextColor)",
        }}
      >
        /
      </Typography>
      <SmallSelect
        k={kType}
        label="Type"
        width={90}
        options={[
          { value: "%", label: "%" },
          { value: "Rs", label: "Rs" },
        ]}
      />
      <SmallText k={k2} label="Alt" width={110} type="number" />
    </Box>
  );

  const headerCellSx = {
    height: "30px",
    padding: "0 15px",
    fontSize: "var(--tableHeaderFontSize)",
    fontWeight: "var(--tableHeaderFontWeight)",
    textTransform: "capitalize",
    background: "var(--tableHeaderBg)",
    color: "var(--tableHeaderTextColor)",
    whiteSpace: "nowrap",
    borderBottom: "1px solid var(--commonBg)",
  };

  const bodyCellSx = {
    padding: "0 15px",
    fontSize: "var(--tableRowFontSize)",
    fontWeight: "var(--tableRowFontWeight)",
    color: "var(--tableRowTextColor)",
    whiteSpace: "nowrap",
    borderBottom: "1px solid var(--commonBg)",
    backgroundColor: "var(--tableRowBg)",
    verticalAlign: "middle",
    height: "25px",
  };

  const leftLabelSx = {
    ...bodyCellSx,
    fontWeight: 600,
    width: 160,
  };

  const tableWrapSx = {
    border: "1px solid var(--commonBg)",
    borderRadius: "4px",
    overflow: "hidden",
    background: "var(--accordionBodyBg)",
    minWidth: 980,
  };

  const dutyRows = [
    {
      label: "Freight",
      keyPrefix: "Freight",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ],
      dutyKey: "Freight",
      rate1: "FreightRate1",
      rateType: "FreightRateType",
      rate2: "FreightRate2",
      tv: "FreightTV",
      qty: "FreightQty",
      unit: "FreightUnit",
      desc: "FreightDesc",
    },
    {
      label: "Insurance",
      keyPrefix: "Insurance",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
      ],
      dutyKey: "Insurance",
      rate1: "InsuranceRate1",
      rateType: "InsuranceRateType",
      rate2: "InsuranceRate2",
      tv: "InsuranceTV",
      qty: "InsuranceQty",
      unit: "InsuranceUnit",
      desc: "InsuranceDesc",
    },
    {
      label: "Discount",
      keyPrefix: "Discount",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
      ],
      dutyKey: "Discount",
      rate1: "DiscountRate1",
      rateType: "DiscountRateType",
      rate2: "DiscountRate2",
      tv: "DiscountTV",
      qty: "DiscountQty",
      unit: "DiscountUnit",
      desc: "DiscountDesc",
    },
    {
      label: "Other Deduction",
      keyPrefix: "otherdeduction",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
      ],
      dutyKey: "otherdeduction",
      rate1: "otherdeductionRate1",
      rateType: "otherdeductionRateType",
      rate2: "otherdeductionRate2",
      tv: "otherdeductionTV",
      qty: "otherdeductionQty",
      unit: "otherdeductionUnit",
      desc: "otherdeductionDesc",
      isLast: true,
    },
    {
      label: "Commission",
      keyPrefix: "Commission",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
      ],
      dutyKey: "Commission",
      rate1: "CommissionRate1",
      rateType: "CommissionRateType",
      rate2: "CommissionRate2",
      tv: "CommissionTV",
      qty: "CommissionQty",
      unit: "CommissionUnit",
      desc: "CommissionDesc",
      isLast: true,
    },
    {
      label: "FOB Value",
      keyPrefix: "fobvalue",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
      ],
      dutyKey: "fobvalue",
      rate1: "fobvalueRate1",
      rateType: "fobvalueRateType",
      rate2: "fobvalueRate2",
      tv: "fobvalueTV",
      qty: "fobvalueQty",
      unit: "fobvalueUnit",
      desc: "fobvalueDesc",
      isLast: true,
    },
  ];

  return (
    <Accordion
      expanded={isOpen}
      onChange={() => setIsOpen((p) => !p)}
      sx={{ ...parentAccordionSection }}
    >
      <AccordionSummary
        sx={{ ...SummaryStyles }}
        expandIcon={
          <LightTooltip title={isOpen ? "Collapse" : "Expand"}>
            <ExpandMoreIcon sx={{ ...expandIconStyle }} />
          </LightTooltip>
        }
      >
        <Typography className="relative right-[11px]">{section}</Typography>
      </AccordionSummary>

      <AccordionDetails
        className={`overflow-hidden p-0 ${styles.thinScrollBar}`}
        sx={{ ...accordianDetailsStyleForm }}
      >
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            p: 1,
          }}
          className={styles.thinScrollBar}
        >
          <Box sx={tableWrapSx}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 1,
                py: 0.7,
                borderBottom: "1px solid var(--commonBg)",
                background: "var(--accordionBodyBg)",
              }}
            />

            <TableContainer>
              <Table size="small" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ ...headerCellSx, width: 160 }} />
                    <TableCell sx={{ ...headerCellSx, width: 220 }}>
                      Currency
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 420 }}>
                      exchange Rates
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 190 }}>
                      Rates
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 240 }}>
                      Base Value
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 220 }}>
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dutyRows.map((r) => {
                    const cellSx = r.isLast
                      ? { ...bodyCellSx, borderBottom: "none" }
                      : bodyCellSx;
                    const leftSx = r.isLast
                      ? { ...leftLabelSx, borderBottom: "none" }
                      : leftLabelSx;

                    return (
                      <TableRow
                        key={r.keyPrefix}
                        sx={{
                          "&:hover": {
                            backgroundColor: "var(--tableRowBgHover)",
                          },
                          "&:hover td": {
                            color: "var(--tableRowTextColorHover)",
                          },
                        }}
                      >
                        <TableCell sx={leftSx}>{r.label}</TableCell>

                        <TableCell sx={cellSx}>
                          <SmallSelect
                            k={r.dutyKey}
                            label={r.label}
                            width={180}
                            options={r.dutyOptions}
                          />
                        </TableCell>

                        <TableCell sx={{ ...cellSx, width: 420 }}>
                          <RatesCell
                            k1={r.rate1}
                            kType={r.rateType}
                            k2={r.rate2}
                          />
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <SmallText
                            k={r.tv}
                            label="Tariff Value"
                            width={140}
                            type="number"
                          />
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <SmallText
                              k={r.qty}
                              label="Qty"
                              width={120}
                              type="number"
                            />
                            <Typography
                              sx={{
                                fontSize: "var(--tableRowFontSize)",
                                fontWeight: 600,
                                opacity: 0.85,
                                color: "var(--tableRowTextColor)",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Unit
                            </Typography>
                            <SmallText k={r.unit} label="Unit" width={90} />
                          </Box>
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <SmallText k={r.desc} label="Cess Desc" width={180} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
