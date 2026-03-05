"use client";
/* eslint-disable */
import React, { useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import styles from "@/app/app.module.css";
import { styled } from "@mui/material/styles";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { toast } from "react-toastify";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  parentAccordionSection,
  SummaryStyles,
  accordianDetailsStyleForm,
  expandIconStyle,
  customTextFieldStyles,
  textInputStyle,
} from "@/app/globalCss";
import { gridEditIconStyles, childTableHeaderStyle } from "@/app/globalCss";
import { childAccordionSection } from "@/app/globalCss";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import { areObjectsEqual, hasBlackValues } from "@/helper/checkValue";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import {
  refreshIcon,
  saveIcon,
  addLogo,
  plusIconHover,
  revertHover,
  saveIconHover,
} from "@/assets";
import Paper from "@mui/material/Paper";
import LightTooltip from "@/components/Tooltip/customToolTip";
import Box from "@mui/material/Box";
import { MenuItem, TextField } from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import RowComponent from "@/app/(groupControl)/formControl/addEdit/RowComponent";
import {
  commanPostService,
  dynamicDropDownFieldsData,
  fetchSearchPageData,
  fetchReportData,
} from "@/services/auth/FormControl.services";

const formdata = {
  General: [
    {
      id: 125711,
      fieldname: null,
      yourlabel: "General Info",
      controlname: "label",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      copyMappingName: null,
      hyperlinkValue: null,
      isCommaSeparatedOrCount: null,
      isAuditLog: true,
      keyToShowOnGrid: null,
      isDummy: true,
      dropDownValues: null,
      referenceTable: null,
      referenceColumn: null,
      type: null,
      typeValue: null,
      size: null,
      ordering: 25,
      gridTotal: false,
      gridTypeTotal: null,
      toolTipMessage: null,
      isRequired: false,
      isEditable: true,
      isSwitchToText: false,
      isBreak: true,
      dropdownFilter: null,
      controlDefaultValue: null,
      functionOnChange: "",
      functionOnBlur: null,
      functionOnKeyPress: null,
      sectionHeader: "Port Details",
      sectionOrder: 2,
      isCopy: true,
      isCopyEditable: true,
      isEditableMode: "e",
      position: "top",
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
      id: 2001,
      fieldname: "eximCodeId",
      yourlabel: "Exim Code",
      controlname: "dropdown",
      referenceTable: "tblMasterData",
      referenceColumn: "name",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList where name = 'tblEximCode')",
      type: 6653,
      typeValue: "number",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2002,
      fieldname: "endUse",
      yourlabel: "End Use",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2003,
      fieldname: "ptaFtaInfoId",
      yourlabel: "PTA/FTA info",
      controlname: "dropdown",
      referenceTable: "tblMasterData",
      referenceColumn: "name",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList where name = 'tblPtaFtaInfo')",
      type: 6653,
      typeValue: "number",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2004,
      fieldname: "medicinalPlantId",
      yourlabel: "Medicinal Plant",
      controlname: "dropdown",
      referenceTable: "tblMasterData",
      referenceColumn: "name",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList where name = 'tblMedicinalPlant')",
      type: 6653,
      typeValue: "number",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2005,
      fieldname: "labGrownDiamondId",
      yourlabel: "Lab Grown Diamond",
      controlname: "dropdown",
      referenceTable: "tblMasterData",
      referenceColumn: "name",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList where name = 'tblLabGrownDiamond')",
      type: 6653,
      typeValue: "number",
      ordering: 5,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2006,
      fieldname: "nfeiCategoryId",
      yourlabel: "NFEI Category",
      controlname: "dropdown",
      referenceTable: "tblMasterData",
      referenceColumn: "name",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList where name = 'tblNfeiCategory')",
      type: 6653,
      typeValue: "number",
      ordering: 6,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2007,
      fieldname: "originDistrictId",
      yourlabel: "Origin District",
      controlname: "dropdown",
      referenceTable: "tblDistrict",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 7,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2008,
      fieldname: "alternateQty",
      yourlabel: "Alternate Qty",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 8,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2009,
      fieldname: "alternateQtyUnit",
      yourlabel: "Alternate Qty Unit",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 9,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2010,
      fieldname: "formulation",
      yourlabel: "Formulation",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 10,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2011,
      fieldname: "rewardItem",
      yourlabel: "Reward Item",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 11,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2012,
      fieldname: "isStrCode",
      yourlabel: "STR Code",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 12,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2013,
      fieldname: "originStateId",
      yourlabel: "Origin State",
      controlname: "dropdown",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 13,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2014,
      fieldname: "materialCode",
      yourlabel: "Material Code",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 14,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 2015,
      fieldname: "surfaceMaterialInContact",
      yourlabel: "Surface Material in Contact",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 15,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
    {
      id: 125711,
      fieldname: "pmvInfo",
      yourlabel: "PMV Info",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 15,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },

    {
      id: 3001,
      fieldname: "pmvCurrencyId",
      yourlabel: "Currency",
      controlname: "dropdown",
      referenceTable: "tblMasterData",
      referenceColumn: "code",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList where name = 'tblCurrency')",
      type: 6653,
      typeValue: "number",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 4,
    },
    {
      id: 3002,
      fieldname: "pmvCalcMethod",
      yourlabel: "Calc. Method",
      controlname: "dropdown",
      dropDownValues: [
        { value: "Manual", label: "Manual" },
        { value: "System", label: "System" },
      ],
      type: 6902,
      typeValue: "string",
      ordering: 2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 4,
    },
    {
      id: 3003,
      fieldname: "pmvPerUnit",
      yourlabel: "PMV / Unit",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 4,
    },
    {
      id: 3004,
      fieldname: "pmvPerUnit",
      yourlabel: "Pmv Currency",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 4,
    },
    {
      id: 3005,
      fieldname: "totalPmv",
      yourlabel: "Total PMV",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 4,
    },
    {
      id: 3006,
      fieldname: "totalPmvCurrency",
      yourlabel: "Total PMV Currency",
      controlname: "dropdown",
      referenceTable: "tblMasterData",
      referenceColumn: "code",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList where name = 'tblCurrency')",
      type: 6902,
      typeValue: "string",
      ordering: 4.1,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 4,
      labelValue: "INR",
    },
    {
      id: 125711,
      fieldname: null,
      yourlabel: "IGST Compensation Cess Info",
      controlname: "text",
      type: 6902,
      typeValue: "decimal",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 4,
    },
    {
      id: 3101,
      fieldname: "gstPaymentStatus",
      yourlabel: "GST Pymt Status",
      controlname: "dropdown",
      dropDownValues: [
        { value: "Export Under Bond", label: "Export Under Bond" },
        { value: "Export With Payment", label: "Export With Payment" },
      ],
      type: 6902,
      typeValue: "string",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "GST Details",
      sectionOrder: 5,
    },
    {
      id: 3102,
      fieldname: "gstTaxableValue",
      yourlabel: "Taxable Value (INR)",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 2,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "GST Details",
      sectionOrder: 5,
    },
    {
      id: 3103,
      fieldname: "gstRate",
      yourlabel: "GST Rate (%)",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "GST Details",
      sectionOrder: 5,
    },
    {
      id: 3104,
      fieldname: "igstAmount",
      yourlabel: "IGST Amt (INR)",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "GST Details",
      sectionOrder: 5,
    },
    {
      id: 3105,
      fieldname: "compCessRate",
      yourlabel: "Comp. Cess (%)",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 5,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "GST Details",
      sectionOrder: 5,
    },
    {
      id: 3106,
      fieldname: "compCessAmount",
      yourlabel: "Comp. Cess Amt (INR)",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 6,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "GST Details",
      sectionOrder: 5,
    },
    {
      id: 125711,
      fieldname: null,
      yourlabel: "RODTEP Info",
      controlname: "text",
      type: 6902,
      typeValue: "decimal",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 4,
    },
    {
      id: 3201,
      fieldname: "rodtepClaim",
      yourlabel: "RODTEP Claim",
      controlname: "dropdown",
      dropDownValues: [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ],
      type: 6902,
      typeValue: "string",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "RODTEP Details",
      sectionOrder: 6,
    },
    {
      id: 3202,
      fieldname: "rodtepQuantity",
      yourlabel: "Quantity",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "RODTEP Details",
      sectionOrder: 6,
    },
    {
      id: 3203,
      fieldname: "rodtepRate",
      yourlabel: "Rate (in %)",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "RODTEP Details",
      sectionOrder: 6,
    },
    {
      id: 3204,
      fieldname: "rodtepCapValue",
      yourlabel: "Cap Value",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "RODTEP Details",
      sectionOrder: 6,
    },
    {
      id: 3205,
      fieldname: "rodtepCapValuePerUnit",
      yourlabel: "Cap value per units",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 5,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "RODTEP Details",
      sectionOrder: 6,
    },
    {
      id: 3206,
      fieldname: "rodtepAmount",
      yourlabel: "RODTEP Amount (INR)",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 6,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "RODTEP Details",
      sectionOrder: 6,
    },
  ],
  "Re-export": [
    {
      id: 3002,
      fieldname: "beNumber",
      yourlabel: "B/E Number",
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
      id: 3003,
      fieldname: "beDate",
      yourlabel: "B/E Date",
      controlname: "date",
      type: 6902,
      typeValue: "date",
      ordering: 2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3004,
      fieldname: "invoiceSNo",
      yourlabel: "Invoice SNo",
      controlname: "number",
      type: 6706,
      typeValue: "number",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3005,
      fieldname: "itemSNo",
      yourlabel: "Item SNo",
      controlname: "number",
      type: 6706,
      typeValue: "number",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3006,
      fieldname: "importPortCodeId",
      yourlabel: "Import Port Code",
      controlname: "dropdown",
      referenceTable: "tblPort",
      referenceColumn: "code + ' - ' + name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 5,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3007,
      fieldname: "isManualBe",
      yourlabel: "Manual B/E",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 6,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3008,
      fieldname: "beItemDesc",
      yourlabel: "B/E Item Desc.",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 7,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3009,
      fieldname: "qtyImported",
      yourlabel: "Quantity Imported",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 8,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3010,
      fieldname: "assessableValue",
      yourlabel: "Assessable Value",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 9,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3011,
      fieldname: "totalDutyPaid",
      yourlabel: "Total Duty Paid",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 10,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3012,
      fieldname: "totalDutyPaidDate",
      yourlabel: "Duty Paid Date",
      controlname: "date",
      type: 6902,
      typeValue: "date",
      ordering: 11,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3013,
      fieldname: "qtyExported",
      yourlabel: "Quantity Exported",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 12,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3014,
      fieldname: "technicalDetails",
      yourlabel: "Technical Details",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 13,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3015,
      fieldname: "isInputCreditAvailed",
      yourlabel: "Input Credit Availed",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 14,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3016,
      fieldname: "isPersonalUseItem",
      yourlabel: "Personal Use Item",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 15,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3017,
      fieldname: "otherIdentifyingParameters",
      yourlabel: "Other Identifying Parameters",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 16,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3018,
      fieldname: "isAgainstExportObligation",
      yourlabel: "Against Export Obligation",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 17,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3019,
      fieldname: "obligationNo",
      yourlabel: "Obligation No.",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 18,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3020,
      fieldname: "drawbackAmtClaimed",
      yourlabel: "Drawback Amt claimed",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 19,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3021,
      fieldname: "isItemUnUsed",
      yourlabel: "Item Un-Used",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 20,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3022,
      fieldname: "isCommissionerPermission",
      yourlabel: "Commissioner Permission",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 21,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3023,
      fieldname: "boardNumber",
      yourlabel: "Board Number",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 22,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3024,
      fieldname: "boardDate",
      yourlabel: "Board Date",
      controlname: "date",
      type: 6902,
      typeValue: "date",
      ordering: 23,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3025,
      fieldname: "isModvatAvailed",
      yourlabel: "MODVAT Availed",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 24,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3026,
      fieldname: "isModvatReversed",
      yourlabel: "MODVAT Reversed",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 25,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
  ],
  "Other Details": [
    {
      id: 3101,
      fieldname: "accessoriesId",
      yourlabel: "Accessories",
      controlname: "dropdown",
      referenceTable: "tblMasterData",
      referenceColumn: "name",
      dropdownFilter:
        "and masterListId in (select id from tblMasterList where name = 'tblAccessories')",
      type: 6653,
      typeValue: "number",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3102,
      fieldname: "accessoriesRemarks",
      yourlabel: "",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },

    {
      id: 3103,
      fieldname: "isThirdPartyExport",
      yourlabel: "Third Party EXPORT",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3104,
      fieldname: "thirdPartyName",
      yourlabel: "Name",
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
      id: 3105,
      fieldname: "thirdPartyIeCode",
      yourlabel: "IE Code",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 5,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3106,
      fieldname: "thirdPartyBranchSNo",
      yourlabel: "Branch SNo",
      controlname: "number",
      type: 6706,
      typeValue: "number",
      ordering: 6,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3107,
      fieldname: "thirdPartyRegnNo",
      yourlabel: "Regn. No",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 7,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3108,
      fieldname: "thirdPartyAddress",
      yourlabel: "Address",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 8,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },

    {
      id: 3110,
      fieldname: "mpgName",
      yourlabel: "Name",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 9,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3111,
      fieldname: "mpgCode",
      yourlabel: "Code",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 10,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3112,
      fieldname: "mpgAddress",
      yourlabel: "Address",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 11,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3113,
      fieldname: "mpgCountryId",
      yourlabel: "Country",
      controlname: "dropdown",
      referenceTable: "tblCountry",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 12,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3114,
      fieldname: "mpgStateProvince",
      yourlabel: "State/Province",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 13,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3115,
      fieldname: "mpgPostalCode",
      yourlabel: "Postal Code",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 14,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3116,
      fieldname: "mpgSourceStateId",
      yourlabel: "Source State",
      controlname: "dropdown",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 15,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3117,
      fieldname: "mpgTransitCountryId",
      yourlabel: "Transit Country",
      controlname: "dropdown",
      referenceTable: "tblCountry",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 16,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
  ],
  "Cess-Cenvat Details": [
    {
      id: 3101,
      fieldname: "certificateNumber",
      yourlabel: "Certificate Number",
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
      id: 3102,
      fieldname: "jobDate",
      yourlabel: "Date",
      controlname: "date",
      type: 6902,
      typeValue: "date",
      ordering: 2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },

    {
      id: 3103,
      fieldname: "validUpto",
      yourlabel: "Valid Upto",
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
      id: 3104,
      fieldname: "cExOfficeCode",
      yourlabel: "CEx Office Code",
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
      id: 3105,
      fieldname: "assesseeCode",
      yourlabel: "Assessee Code",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 5,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },

  ],
};

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } catch (e) {
      reject(e);
    }
  });
}

async function defaultHandleFileAndUpdateState(file, cb) {
  const base64 = await fileToBase64(file);
  cb?.({
    name: file?.name || "",
    type: file?.type || "",
    size: file?.size || 0,
    base64,
  });
}

export default function ItemSheet({ value, onChange }) {
  const [parentsFields] = useState(formdata);
  const [expandAll, setExpandAll] = useState(true);
  const [clearFlag, setClearFlag] = useState({ isClear: false, fieldName: "" });
  const [tableName, setTableName] = useState(false);
  const [formControlData, setFormControlData] = useState([]);
  const [hideFieldName, setHideFieldName] = useState([]);
  const [labelName, setLabelName] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [paraText, setParaText] = useState("");
  const [isError, setIsError] = useState(false);
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [submitNewState, setSubmitNewState] = useState({
    routeName: "mastervalue",
  });
  const newState = value;
  const setNewState = onChange;
  const [originalData, setOriginalData] = useState(null);
  const getLabelValue = (labelValue) => setLabelName(labelValue);
  const [childsFields, setChildsFields] = useState([
    {
      id: 4200,
      formName: "Item - Main",
      childHeading: "Main",
      gridEditableOnLoad: "false",
      tableName: "tblItem",
      isAttachmentRequired: "false",
      isCopyForSameTable: "true",
      functionOnLoad: null,
      functionOnSubmit: null,
      functionOnEdit: null,
      functionOnDelete: null,
      isChildCopy: false,
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
          id: 4201,
          fieldname: "itemDescription",
          yourlabel: "Description",
          controlname: "textarea",
          type: 6902,
          typeValue: "string",
          ordering: 1,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 8,
        },
        {
          id: 4203,
          fieldname: "ritcHsnCode",
          yourlabel: "RITC/HSN Code",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 2,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 8,
        },
        {
          id: 4204,
          fieldname: "quantity",
          yourlabel: "Quantity",
          controlname: "number",
          type: 6706,
          typeValue: "decimal",
          ordering: 3,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 8,
        },
        {
          id: 4205,
          fieldname: "sqcQuantity",
          yourlabel: "SQC Qty",
          controlname: "number",
          type: 6706,
          typeValue: "decimal",
          ordering: 4,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 8,
        },
        {
          id: 4206,
          fieldname: "unitPrice",
          yourlabel: "Unit Price",
          controlname: "number",
          type: 6706,
          typeValue: "decimal",
          ordering: 5,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 8,
        },
        {
          id: 4208,
          fieldname: "pricePer",
          yourlabel: "Per",
          controlname: "number",
          type: 6706,
          typeValue: "decimal",
          ordering: 6,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 8,
        },
        {
          id: 4209,
          fieldname: "amount",
          yourlabel: "Amount",
          controlname: "number",
          type: 6706,
          typeValue: "decimal",
          ordering: 7,
          isControlShow: true,
          isGridView: true,
          isEditable: false,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 8,
        },
      ],
      subChild: [],
      showSrNo: false,
    },

    {
      id: 4300,
      formName: "Item - DUC Info",
      childHeading: "DUC-Info",
      gridEditableOnLoad: "false",
      tableName: "tblDucInfo",
      isAttachmentRequired: "false",
      isCopyForSameTable: "true",
      functionOnLoad: null,
      functionOnSubmit: null,
      functionOnEdit: null,
      functionOnDelete: null,
      isChildCopy: false,
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
          id: 1,
          fieldname: "ducRefNo",
          yourlabel: "DUC Ref No.",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 1,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 2,
          fieldname: "exportType",
          yourlabel: "Export Type",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 2,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 3,
          fieldname: "sbDate",
          yourlabel: "SB Date",
          controlname: "date",
          type: 6902,
          typeValue: "string",
          ordering: 3,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 4,
          fieldname: "beNo",
          yourlabel: "BE No.",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 4,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 5,
          fieldname: "beDate",
          yourlabel: "BE Date",
          controlname: "date",
          type: 6902,
          typeValue: "string",
          ordering: 5,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 6,
          fieldname: "beFiledAt",
          yourlabel: "BE Filed At",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 6,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
        },
        {
          id: 7,
          fieldname: "beInvSr",
          yourlabel: "BE Inv. Sr.",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 7,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
        },
        {
          id: 8,
          fieldname: "beItemSr",
          yourlabel: "BE Item Sr.",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 8,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
        },
      ],
      subChild: [],
      showSrNo: false,
    },

    {
      id: 4400,
      formName: "Item - DOC Info",
      childHeading: "DOC-Info",
      gridEditableOnLoad: "false",
      tableName: "tblDocInfo",
      isAttachmentRequired: "false",
      isCopyForSameTable: "true",
      functionOnLoad: null,
      functionOnSubmit: null,
      functionOnEdit: null,
      functionOnDelete: null,
      isChildCopy: false,
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
          id: 1,
          fieldname: "docType",
          yourlabel: "Doc Type",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 1,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 2,
          fieldname: "description",
          yourlabel: "Description",
          controlname: "textarea",
          type: 6902,
          typeValue: "string",
          ordering: 2,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 3,
          fieldname: "agencyCode",
          yourlabel: "Agency Code",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 3,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
        },
        {
          id: 4,
          fieldname: "agencyName",
          yourlabel: "Agency Name",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 4,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
        },
        {
          id: 5,
          fieldname: "documentName",
          yourlabel: "Document Name",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 5,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
        },
      ],
      subChild: [],
      showSrNo: false,
    },

    {
      id: 4500,
      formName: "Item - ARE Details",
      childHeading: "ARE-Details",
      gridEditableOnLoad: "false",
      tableName: "tblAreDetails",
      isAttachmentRequired: "false",
      isCopyForSameTable: "true",
      functionOnLoad: null,
      functionOnSubmit: null,
      functionOnEdit: null,
      functionOnDelete: null,
      isChildCopy: false,
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
          id: 1,
          fieldname: "areNumber",
          yourlabel: "ARE Number",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 1,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 2,
          fieldname: "areDate",
          yourlabel: "ARE Date",
          controlname: "date",
          type: 6902,
          typeValue: "string",
          ordering: 2,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 3,
          fieldname: "commissionerate",
          yourlabel: "Commissionerate",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 3,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 4,
          fieldname: "division",
          yourlabel: "Division",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 4,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
        },
        {
          id: 5,
          fieldname: "range",
          yourlabel: "Range",
          controlname: "text",
          type: 6902,
          typeValue: "string",
          ordering: 5,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
        },
        {
          id: 6,
          fieldname: "remark",
          yourlabel: "Remark",
          controlname: "textarea",
          type: 6902,
          typeValue: "string",
          ordering: 6,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
        },
      ],
      subChild: [],
      showSrNo: false,
    },
  ]);

  const handleFieldValuesChange = async (updatedValues) => {
    const entries = Object.entries(updatedValues || {});
    const hasFile = entries.some(([, v]) => v instanceof File);

    if (hasFile) {
      for (const [key, value] of entries) {
        if (value instanceof File) {
          const fn =
            typeof window !== "undefined" &&
              typeof window.handleFileAndUpdateState === "function"
              ? window.handleFileAndUpdateState
              : defaultHandleFileAndUpdateState;

          await fn(value, (jsonData) => {
            const merged = { ...(newState || {}), [key]: jsonData };
            setNewState?.(merged);
            setSubmitNewState(merged);
          });
        } else {
          const merged = { ...(newState || {}), [key]: value };
          setNewState?.(merged);
          setSubmitNewState(merged);
        }
      }
      return;
    }

    const merged = { ...(newState || {}), ...(updatedValues || {}) };
    setNewState?.(merged);
    setSubmitNewState(merged);
  };

  const handleFieldValuesChange2 = async () => { };

  return (
    <div
      className={`w-full p-1 ${styles.pageBackground} overflow-y-auto overflow-x-hidden ${styles.thinScrollBar}`}
      style={{ height: "calc(100vh - 24vh)" }}
    >
      {/* 1) MAIN GRID FIRST */}
      {childsFields
        .filter((x) => x.tableName === "tblItem")
        .map((section, index) => (
          <ChildAccordianComponent
            key={`child-${section.tableName}-${index}`}
            section={section}
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
          />
        ))}

      {/* 2) GENERAL INFO */}
      <ParentAccordianComponent
        key="parent-General"
        section="General"
        indexValue={0}
        expandAll={expandAll}
        parentsFields={parentsFields}
        newState={newState}
        handleFieldValuesChange={handleFieldValuesChange}
        handleFieldValuesChange2={handleFieldValuesChange2}
        setNewState={setNewState}
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

      {/* 3) DUC + 4) DOC */}
      {childsFields
        .filter(
          (x) => x.tableName === "tblDucInfo" || x.tableName === "tblDocInfo",
        )
        .map((section, index) => (
          <ChildAccordianComponent
            key={`child-${section.tableName}-${index}`}
            section={section}
            newState={newState}
            setNewState={setNewState}
            handleFieldValuesChange2={handleFieldValuesChange2}
            indexValue={index + 10}
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
          />
        ))}

      {/* 5) ARE */}
      {childsFields
        .filter((x) => x.tableName === "tblAreDetails")
        .map((section, index) => (
          <ChildAccordianComponent
            key={`child-${section.tableName}-${index}`}
            section={section}
            newState={newState}
            setNewState={setNewState}
            handleFieldValuesChange2={handleFieldValuesChange2}
            indexValue={index + 20}
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
          />
        ))}

      {/* 6) OTHER DETAILS */}
      <ParentAccordianComponent
        key="parent-OtherDetails"
        section="Other Details"
        indexValue={1}
        expandAll={expandAll}
        parentsFields={parentsFields}
        newState={newState}
        handleFieldValuesChange={handleFieldValuesChange}
        handleFieldValuesChange2={handleFieldValuesChange2}
        setNewState={setNewState}
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
        disableExpandAll
      />

      {/* 7) RE-EXPORT */}
      <ParentAccordianComponent
        key="parent-ReExport"
        section="Re-export"
        indexValue={2}
        expandAll={expandAll}
        parentsFields={parentsFields}
        newState={newState}
        handleFieldValuesChange={handleFieldValuesChange}
        handleFieldValuesChange2={handleFieldValuesChange2}
        setNewState={setNewState}
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
        disableExpandAll
      />

      <ParentAccordianComponent
        key="parent-Cess-Cenvat Details"
        section="Cess-Cenvat Details"
        indexValue={1}
        expandAll={expandAll}
        parentsFields={parentsFields}
        newState={newState}
        handleFieldValuesChange={handleFieldValuesChange}
        handleFieldValuesChange2={handleFieldValuesChange2}
        setNewState={setNewState}
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
        disableExpandAll
      />
      <CessCenvatAccordion
        values={newState}
        onChangeHandler={(next) => setNewState(next)}
      />
    </div>
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
  disableExpandAll: PropTypes.bool,
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
  disableExpandAll = false,
}) {
  const getArr = (sec, state) => {
    const key = SECTION_TO_STATE_KEY[sec];
    const arr = state?.[key];
    return Array.isArray(arr) ? arr : [];
  };

  const setArr = (sec, next) => {
    const key = SECTION_TO_STATE_KEY[sec];
    setNewState?.((prev) => ({ ...(prev || {}), [key]: next }));
    setSubmitNewState?.((prev) => ({ ...(prev || {}), [key]: next }));
  };

  const [isOpen, setIsOpen] = useState(false);
  const [fieldId, setFieldId] = useState([]);

  useEffect(() => {
    if (disableExpandAll) return;
    setIsOpen(!!expandAll);
  }, [expandAll, disableExpandAll]);
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
    setNewState?.((prev) => ({ ...(prev || {}), ...patch }));
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

function normalizeOptions(rows = [], preferLabelKey = "code") {
  const out = [];
  const seen = new Set();

  (Array.isArray(rows) ? rows : []).forEach((r, idx) => {
    const label =
      r?.[preferLabelKey] ??
      r?.code ??
      r?.name ??
      r?.label ??
      "";

    const value =
      r?.id ??
      r?.value ??
      r?.[preferLabelKey] ??
      r?.code ??
      r?.name ??
      r?.label ??
      "";

    if (label === "" || value === "") return;

    const key = String(value);
    if (seen.has(key)) return;
    seen.add(key);

    out.push({ value, label, raw: r });
  });

  return out;
}

function CessCenvatAccordion({
  section = "CESS / CENVAT",
  indexValue = 0,
  values: extValues,
  onChangeHandler,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const [unitOptions, setUnitOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  const cacheRef = useRef({});

  const fetchDropdown = async ({ key, referenceTable, referenceColumn, dropdownFilter }) => {
    if (cacheRef.current[key]) return cacheRef.current[key];

    const resp = await dynamicDropDownFieldsData({
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable,
      referenceColumn,
      dropdownFilter: dropdownFilter || "",
      search: "",
      pageNo: 1,
    });

    const list = normalizeOptions(resp?.data || [], "code");
    cacheRef.current[key] = list;
    return list;
  };

  useEffect(() => {
    (async () => {
      try {
        const unitList = await fetchDropdown({
          key: "UNIT",
          referenceTable: "tblMasterData",
          referenceColumn: "code",
          dropdownFilter:
            "and masterListId in (select id from tblMasterList where name = 'tblUnit')",
        });

        setUnitOptions([{ value: "", label: "" }, ...unitList]);

        const currList = await fetchDropdown({
          key: "CURR",
          referenceTable: "tblMasterData",
          referenceColumn: "code",
          dropdownFilter:
            "and masterListId in (select id from tblMasterList where name = 'tblCurrency')",
        });

        setCurrencyOptions([{ value: "", label: "" }, ...currList]);
      } catch (e) {
        console.error("Dropdown fetch error:", e);
        setUnitOptions([{ value: "", label: "" }]);
        setCurrencyOptions([{ value: "", label: "" }]);
      }
    })();
  }, []);

  const [localValues, setLocalValues] = useState({
    cessLeviable: false,

    exportDuty: "",
    exportDutyRate1: "0.00",
    exportDutyRateType: "%",
    exportDutyRate2: "0.00",
    exportDutyTV: "0.00",
    exportDutyQty: "0.000",
    exportDutyUnit: "",
    exportDutyDesc: "",

    cess: "",
    cessRate1: "0.00",
    cessRateType: "%",
    cessRate2: "0.00",
    cessTV: "0.00",
    cessQty: "0.000",
    cessUnit: "",
    cessDesc: "",

    othDuty: "",
    othDutyRate1: "0.00",
    othDutyRateType: "%",
    othDutyRate2: "0.00",
    othDutyTV: "0.00",
    othDutyQty: "0.000",
    othDutyUnit: "",
    othDutyDesc: "",

    thirdCess: "",
    thirdCessRate1: "0.00",
    thirdCessRateType: "%",
    thirdCessRate2: "0.00",
    thirdCessTV: "0.00",
    thirdCessQty: "0.000",
    thirdCessUnit: "",
    thirdCessDesc: "",

    cenvatCertNo: "",
    cenvatDate: "",
    cenvatValidUpto: "",
    cenvatCexOfficeCode: "",
    cenvatAssesseeCode: "",
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
    [],
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

  const SmallText = ({
    k,
    label,
    width = 120,
    type = "text",
    disabled = false,
  }) => (
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

  const SmallSelect = ({
    k,
    label,
    options,
    width = 140,
    disabled = false,
  }) => (
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
            fontSize: 11,
            right: 4,
          },
        }}
      >
        {options.map((o, i) => (
          <MenuItem key={`${o.value}-${o.label}-${i}`} value={o.value}>
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

  const headerCellSx = useMemo(
    () => ({
      height: "30px",
      padding: "0 15px",
      fontSize: "var(--tableHeaderFontSize)",
      fontWeight: "var(--tableHeaderFontWeight)",
      textTransform: "capitalize",
      background: "var(--tableHeaderBg)",
      color: "var(--tableHeaderTextColor)",
      whiteSpace: "nowrap",
      borderBottom: "1px solid var(--commonBg)",
    }),
    [],
  );

  const bodyCellSx = useMemo(
    () => ({
      padding: "0 15px",
      fontSize: "var(--tableRowFontSize)",
      fontWeight: "var(--tableRowFontWeight)",
      color: "var(--tableRowTextColor)",
      whiteSpace: "nowrap",
      borderBottom: "1px solid var(--commonBg)",
      backgroundColor: "var(--tableRowBg)",
      verticalAlign: "middle",
      height: "25px",
    }),
    [],
  );

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
      label: "Export Duty",
      keyPrefix: "exportDuty",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ],
      dutyKey: "exportDuty",
      rate1: "exportDutyRate1",
      rateType: "exportDutyRateType",
      rate2: "exportDutyRate2",
      tv: "exportDutyTV",
      qty: "exportDutyQty",
      unit: "exportDutyUnit",
      desc: "exportDutyDesc",
    },
    {
      label: "Cess",
      keyPrefix: "cess",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
      ],
      dutyKey: "cess",
      rate1: "cessRate1",
      rateType: "cessRateType",
      rate2: "cessRate2",
      tv: "cessTV",
      qty: "cessQty",
      unit: "cessUnit",
      desc: "cessDesc",
    },
    {
      label: "Oth. Duty/Cess",
      keyPrefix: "othDuty",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
      ],
      dutyKey: "othDuty",
      rate1: "othDutyRate1",
      rateType: "othDutyRateType",
      rate2: "othDutyRate2",
      tv: "othDutyTV",
      qty: "othDutyQty",
      unit: "othDutyUnit",
      desc: "othDutyDesc",
    },
    {
      label: "Third Cess",
      keyPrefix: "thirdCess",
      hasUnit: true,
      dutyOptions: [
        { value: "", label: "" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
      ],
      dutyKey: "thirdCess",
      rate1: "thirdCessRate1",
      rateType: "thirdCessRateType",
      rate2: "thirdCessRate2",
      tv: "thirdCessTV",
      qty: "thirdCessQty",
      unit: "thirdCessUnit",
      desc: "thirdCessDesc",
      isLast: true,
    },
  ];

  return (
    <Accordion expanded={isOpen} sx={{ ...parentAccordionSection }}>
      <AccordionSummary
        className="relative left-[11px]"
        sx={{ ...SummaryStyles }}
        expandIcon={
          <LightTooltip title={isOpen ? "Collapse" : "Expand"}>
            <ExpandMoreIcon
              sx={{ ...expandIconStyle }}
              onClick={() => setIsOpen((p) => !p)}
            />
          </LightTooltip>
        }
        aria-controls={`panel${indexValue + 1}-content`}
        id={`panel${indexValue + 1}-header`}
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
                      Cess/Duty
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 420 }}>
                      Cess/Duty Rates
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 190 }}>
                      Tariff Value (T.V.)
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 150 }}>
                      Qty for Cess/Duty
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 150 }}>
                      Unit
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 220 }}>
                      Cess Desc
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
                          <SmallText k={r.qty} label="Qty" width={90} type="number" />
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <SmallSelect
                            k={r.unit}
                            label="Unit"
                            width={120}
                            options={unitOptions}
                          />                        </TableCell>
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
  getLabelValue: PropTypes.any,
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
  getLabelValue,
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
  const [isGridEdit, setIsGridEdit] = useState(false);
  const [columnTotals, setColumnTotals] = useState({});
  const [containerWidth, setContainerWidth] = useState(0);
  const [calculateData, setCalculateData] = useState(0);
  const [dummyFieldArray, setDummyFieldArray] = useState([]);

  const [tableBodyWidhth, setTableBodyWidth] = useState("0px");

  console.log("copyChildValueObj", copyChildValueObj);

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

    if (getIds.length === 0) {
      setIschildAccordionOpen((pre) => !pre);
      setNewState((prev) => ({
        ...prev,
        tblVehicleRouteDetails: [],
      }));
      return;
    }

    const reportPromises = getIds.map((id) => {
      const requestBody = {
        columns: "id,invoiceNo,jobNo",
        tableName: "tblInvoice",
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

    const vehicleRouteDetails = getIds.map((id, idx) => {
      const rec = reports[idx]?.data?.[0] || null;
      const option = rec ? { value: rec.id, label: rec.jobNo } : null;

      const existing = newState.tblVehicleRouteDetails?.[idx] || {};

      return {
        ...existing,
        jobId: id,
        jobIddropdown: option ? [option] : [],
        jobIdText: option ? [option] : [],
        indexValue: idx,
      };
    });
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
            feild.fieldname,
          ) ||
            String(childObject[feild.fieldname] || "").trim() === "")
        ) {
          toast.error(`Value for ${feild.yourlabel} is missing or empty.`);
          return;
        }
      }
      toast.dismiss();
      try {
        if (section.functionOnSubmit && section.functionOnSubmit !== null) {
          let functonsArray = section.functionOnSubmit?.trim().split(";");
          for (const fun of functonsArray) {
            if (typeof onSubmitValidation?.[fun] === "function") {
            }

            let updatedData = onSubmitFunctionCall(
              fun,
              newState,
              formControlData,
              Data,
              setChildObject,
            );

            if (updatedData?.alertShow == true) {
              setParaText(updatedData.message);
              setIsError(true);
              setOpenModal((prev) => !prev);
              setTypeofModal("onCheck");
            }

            if (updatedData) {
              Data = updatedData.values;

              setNewState((prevState) => ({
                ...(prevState || {}),
                ...(updatedData?.newState || {}),
              }));

              setSubmitNewState((prevState) => ({
                ...(prevState || {}),
                ...(updatedData?.newState || {}),
              }));
            }
          }
        }
      } catch (error) {
        return toast.error(error.message);
      }
      const tName = section?.tableName;
      const subChild = section?.subChild?.reduce((obj, item) => {
        obj[item.tableName] = [];
        return obj;
      }, {});

      Object.assign(subChild, Data);

      if (hasBlackValues(subChild)) return;
      setNewState((prev) => {
        const next = { ...(prev || {}) };
        const arr = Array.isArray(next[tName]) ? [...next[tName]] : [];
        arr.push({
          ...subChild,
          isChecked: true,
          indexValue: arr.length,
        });
        next[tName] = arr;
        return next;
      });

      setSubmitNewState((prev) => {
        const next = { ...(prev || {}) };
        const arr = Array.isArray(next[tName]) ? [...next[tName]] : [];
        arr.push({
          ...subChild,
          isChecked: true,
          indexValue: arr.length,
        });
        next[tName] = arr;
        return next;
      });
      setOriginalData((prev) => {
        const base = { ...(prev || newState || {}) };
        const arr = Array.isArray(base[tName]) ? [...base[tName]] : [];
        arr.push({
          ...subChild,
          isChecked: true,
          indexValue: arr.length,
        });
        return { ...base, [tName]: arr };
      });
      setRenderedData((prevRendered) => {
        const baseArr = Array.isArray(newState?.[tName]) ? newState[tName] : [];
        const nextArr = [
          ...baseArr,
          { ...subChild, isChecked: true, indexValue: baseArr.length },
        ];
        return nextArr;
      });

      setChildObject({});
      setInputFieldsVisible((prev) => !prev);

      if (islastTab == true) {
        setTimeout(() => {
          setInputFieldsVisible((prev) => !prev);
        }, 3);
      }
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
        renderMoreData();
      }
    }
  };
  const calculateTotalForRow = (rowData) => {
    section.fields?.forEach((item) => {
      if (
        item.gridTotal &&
        (item.type === "number" ||
          item.type === "decimal" ||
          item.type === "string")
      ) {
        const newValue =
          item.gridTypeTotal === "s"
            ? rowData?.reduce((sum, row) => {
              const parsedValue =
                typeof row[item.fieldname] === "number"
                  ? row[item.fieldname]
                  : parseFloat(row[item.fieldname] || 0);
              return isNaN(parsedValue) ? sum : sum + parsedValue;
            }, 0)
            : rowData?.filter((row) => row[item.fieldname]).length;
        setColumnTotals((prevColumnTotals) => ({
          ...prevColumnTotals,
          tableName: section.tableName,
          [item.fieldname]: newValue,
        }));
      }
    });
  };

  const tName = section?.tableName;

  const tableArr = useMemo(() => {
    const arr = newState?.[tName];
    return Array.isArray(arr) ? arr : [];
  }, [newState, tName]);

  const renderMoreData = () => {
    const lastIndex = renderedData.length + 10;
    const newData = tableArr.slice(renderedData.length, lastIndex);
    setRenderedData((prevData) => [...prevData, ...newData]);
  };

  useEffect(() => {
    setRenderedData(tableArr.slice(0, 10));
    calculateTotalForRow(tableArr);

    if (tableArr.length > 0) {
      setClickCount(1);
    } else {
      setClickCount(0);
    }
  }, [tableArr]);

  const deleteChildRecord = (index) => {
    try {
      if (section.functionOnDelete && section.functionOnDelete !== null) {
        let functonsArray = section.functionOnDelete?.trim().split(";");
        let UpdatedNewState = {
          ...newState,
          [section.tableName]: newState[section.tableName].filter(
            (_, i) => i !== index,
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
            setChildObject,
          );
          if (updatedData?.alertShow == true) {
            setParaText(updatedData.message);
            setIsError(true);
            setOpenModal((prev) => !prev);
            setTypeofModal("onCheck");
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
            (_, idx) => idx !== index,
          );
          newStateCopy[section.tableName] = updatedData;

          if (updatedData.length === 0) {
          }
          return newStateCopy;
        });
        setSubmitNewState((prevState) => {
          const newStateCopy = { ...prevState };
          const updatedData = newStateCopy[section.tableName].filter(
            (_, idx) => idx !== index,
          );
          newStateCopy[section.tableName] = updatedData;
          if (updatedData.length === 0) {
          }
          return newStateCopy;
        });
        setOriginalData((prevState) => {
          const newStateCopy = { ...prevState };
          const updatedData = (newStateCopy[section.tableName] || []).filter(
            (_, idx) => idx !== index,
          );
          newStateCopy[section.tableName] = updatedData;

          if (updatedData?.length === 0) {
            setInputFieldsVisible(true);
          }
          return newStateCopy;
        });
      }
    } catch (error) {
      setNewState((prevState) => {
        const newStateCopy = { ...prevState };
        const updatedData = newStateCopy[section.tableName].filter(
          (_, idx) => idx !== index,
        );
        newStateCopy[section.tableName] = updatedData;

        if (updatedData.length === 0) {
        }
        return newStateCopy;
      });
      setSubmitNewState((prevState) => {
        const newStateCopy = { ...prevState };
        const updatedData = newStateCopy[section.tableName].filter(
          (_, idx) => idx !== index,
        );
        newStateCopy[section.tableName] = updatedData;
        if (updatedData.length === 0) {
        }
        return newStateCopy;
      });
      setOriginalData((prevState) => {
        const newStateCopy = { ...prevState };
        const updatedData = (newStateCopy[section.tableName] || []).filter(
          (_, idx) => idx !== index,
        );
        newStateCopy[section.tableName] = updatedData;
        if (updatedData?.length === 0) {
        }
        return newStateCopy;
      });
      return toast.error(error.message);
    }
  };
  const removeChildRecordFromInsert = (id, index) => {
    setSubmitNewState((prevState) => {
      const newStateCopy = { ...newState, ...prevState };
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index,
      );
      updatedData = { ...updatedData[0], isChecked: false };
      newStateCopy[section.tableName][index] = updatedData;
      return newStateCopy;
    });
    setNewState((prevState) => {
      const newStateCopy = { ...prevState };
      // const updatedData = newStateCopy[section.tableName].filter(
      //   (item) => item._id !== id
      // );
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index,
      );
      updatedData = { ...updatedData[0], isChecked: false };
      newStateCopy[section.tableName][index] = updatedData;
      return newStateCopy;
    });
  };
  const handleRightClick = (event, columnId) => {
    event.preventDefault();
    setInputVisible(true);
    setActiveColumn(columnId);
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

    function filterFunction(searchValue, columnKey) {
      if (!searchValue.trim()) {
        setInputVisible(false);
        setSubmitNewState(originalData);
        return setNewState(originalData);
      }
      const lowercasedInput = searchValue.toLowerCase();
      const filtered = newState[section.tableName].filter((item) => {
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

  const handleSortBy = (columnId) => {
    if (sortedColumn === columnId) {
      setIsAscending(!isAscending);
      sortJSON(renderedData, columnId, isAscending ? "asc" : "desc");
    } else {
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
      const newCopy = { ...prev };
      if (newCopy[tableName] === undefined) {
        newCopy[tableName] = [];
      }
      newCopy[tableName].push(newState[tableName]);
      return newCopy;
    });

    setIsGridEdit((prevState) => !prevState);
  }

  function gridEditSaveFunction(tableName, section) {
    const objectsToValidate = copyChildValueObj[tableName][0];
    for (const field of section.fields) {
      let isFieldValid = false;

      for (const object of objectsToValidate) {
        if (field.isRequired) {
          if (
            Object.prototype.hasOwnProperty.call(object, field.fieldname) &&
            object[field.fieldname] &&
            object[field.fieldname].trim() !== ""
          ) {
            isFieldValid = true;
            break;
          }
        }
      }

      if (!isFieldValid && field.isRequired) {
        toast.error(`Value for ${field.yourlabel} is missing or empty.`);
        return;
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
          tableRef.current?.scrollLeft,
        ),
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
    values,
  ) {
    const funcNameMatch = functionData?.match(/^(\w+)/);
    const argsMatch = functionData?.match(/\((.*)\)/);

    if (funcNameMatch && argsMatch !== null) {
      const funcName = funcNameMatch[1];
      const argsStr = argsMatch[1] || "";

      const func = formControlValidation?.[funcName];

      if (typeof func === "function") {
        let args;
        if (argsStr === "") {
          args = {};
        } else {
          args = argsStr;
        }
        const updatedValues = await func({
          args,
          newState,
          formControlData,
          setFormControlData,
          setStateVariable,
          values,
        });
        if (updatedValues?.result) {
        }
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
            childObject,
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
            className={`relative right-[11px]  ${styles.txtColor}`}
          >
            {section.childHeading || section.tableName}
          </Typography>
          {renderedData?.length > 0 && isChildAccordionOpen && (
            <>
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
            {inputFieldsVisible && (
              <div
                className={` overflow-hidden  flex    items-start gap-4 mt-[0.5rem] ml-[1rem] mb-[0.5rem]  justify-between`}
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

            {tableArr.length > 0 && (
              <>
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
                      height: tableArr.length > 10 ? "290px" : "auto",
                      overflowY: tableArr.length > 10 ? "auto" : "hidden",
                    }}
                  >
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
                                    section.fields,
                                  )
                                }
                              >
                                {index === 0 && (
                                  <HoverIcon
                                    defaultIcon={addLogo}
                                    hoverIcon={plusIconHover}
                                    altText={"Add"}
                                    title={"Add"}
                                    onClick={() => {
                                      inputFieldsVisible == false &&
                                        setInputFieldsVisible((prev) => !prev);
                                    }}
                                  />
                                )}
                                <span
                                  className={`${styles.labelText}`}
                                  onClick={() => handleSortBy(field.fieldname)}
                                >
                                  {field.yourlabel}
                                </span>
                                <span>
                                  {isInputVisible &&
                                    activeColumn === field.fieldname && (
                                      <CustomizedInputBase
                                        columnData={field}
                                        setPrevSearchInput={setPrevSearchInput}
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
                            isGridEdit={isGridEdit}
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
