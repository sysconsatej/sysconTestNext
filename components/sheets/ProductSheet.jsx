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
  Checkbox,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

const formdata = {
  "Main": [
    {
      id: 4201,
      fieldname: "itemDescription",
      yourlabel: "Description",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
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
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 8,
    },

    // 🔹 Quantity
    {
      id: 4204,
      fieldname: "quantity",
      yourlabel: "Quantity",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 8,
    },

    // 🔹 SQC Qty
    {
      id: 4205,
      fieldname: "sqcQuantity",
      yourlabel: "SQC Qty",
      controlname: "number",
      type: 6706,
      typeValue: "decimal",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
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
      isGridView: false,
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
      isGridView: false,
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
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 8,
    },
  ],

  "General": [
    {
      "id": 125711,
      "fieldname": null,
      "yourlabel": "General Info",
      "controlname": "label",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "copyMappingName": null,
      "hyperlinkValue": null,
      "isCommaSeparatedOrCount": null,
      "isAuditLog": true,
      "keyToShowOnGrid": null,
      "isDummy": true,
      "dropDownValues": null,
      "referenceTable": null,
      "referenceColumn": null,
      "type": null,
      "typeValue": null,
      "size": null,
      "ordering": 25,
      "gridTotal": false,
      "gridTypeTotal": null,
      "toolTipMessage": null,
      "isRequired": false,
      "isEditable": true,
      "isSwitchToText": false,
      "isBreak": true,
      "dropdownFilter": null,
      "controlDefaultValue": null,
      "functionOnChange": "",
      "functionOnBlur": null,
      "functionOnKeyPress": null,
      "sectionHeader": "Port Details",
      "sectionOrder": 2,
      "isCopy": true,
      "isCopyEditable": true,
      "isEditableMode": "e",
      "position": "top",
      "isHideGrid": false,
      "isHideGridHeader": false,
      "isGridExpandOnLoad": false,
      "clientId": 1,
      "isColumnVisible": null,
      "isColumnDisabled": null,
      "columnsToDisabled": null,
      "columnsToHide": null,
      "columnsToBeVisible": true
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
      id: 2008,
      fieldname: "alternateQty",
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
      "id": 125711,
      "fieldname": null,
      "yourlabel": "PMV Info",
      "controlname": "label",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "copyMappingName": null,
      "hyperlinkValue": null,
      "isCommaSeparatedOrCount": null,
      "isAuditLog": true,
      "keyToShowOnGrid": null,
      "isDummy": true,
      "dropDownValues": null,
      "referenceTable": null,
      "referenceColumn": null,
      "type": null,
      "typeValue": null,
      "size": null,
      "ordering": 25,
      "gridTotal": false,
      "gridTypeTotal": null,
      "toolTipMessage": null,
      "isRequired": false,
      "isEditable": true,
      "isSwitchToText": false,
      "isBreak": true,
      "dropdownFilter": null,
      "controlDefaultValue": null,
      "functionOnChange": "",
      "functionOnBlur": null,
      "functionOnKeyPress": null,
      "sectionHeader": "Port Details",
      "sectionOrder": 2,
      "isCopy": true,
      "isCopyEditable": true,
      "isEditableMode": "e",
      "position": "top",
      "isHideGrid": false,
      "isHideGridHeader": false,
      "isGridExpandOnLoad": false,
      "clientId": 1,
      "isColumnVisible": null,
      "isColumnDisabled": null,
      "columnsToDisabled": null,
      "columnsToHide": null,
      "columnsToBeVisible": true
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
        { value: "System", label: "System" }
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
      yourlabel: "",
      controlname: "label",
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
      isBreak: 1
    },
    {
      "id": 125711,
      "fieldname": null,
      "yourlabel": "IGST Compensation Cess Info",
      "controlname": "label",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "copyMappingName": null,
      "hyperlinkValue": null,
      "isCommaSeparatedOrCount": null,
      "isAuditLog": true,
      "keyToShowOnGrid": null,
      "isDummy": true,
      "dropDownValues": null,
      "referenceTable": null,
      "referenceColumn": null,
      "type": null,
      "typeValue": null,
      "size": null,
      "ordering": 25,
      "gridTotal": false,
      "gridTypeTotal": null,
      "toolTipMessage": null,
      "isRequired": false,
      "isEditable": true,
      "isSwitchToText": false,
      "isBreak": true,
      "dropdownFilter": null,
      "controlDefaultValue": null,
      "functionOnChange": "",
      "functionOnBlur": null,
      "functionOnKeyPress": null,
      "sectionHeader": "Port Details",
      "sectionOrder": 2,
      "isCopy": true,
      "isCopyEditable": true,
      "isEditableMode": "e",
      "position": "top",
      "isHideGrid": false,
      "isHideGridHeader": false,
      "isGridExpandOnLoad": false,
      "clientId": 1,
      "isColumnVisible": null,
      "isColumnDisabled": null,
      "columnsToDisabled": null,
      "columnsToHide": null,
      "columnsToBeVisible": true
    },

    {
      id: 3101,
      fieldname: "gstPaymentStatus",
      yourlabel: "GST Pymt Status",
      controlname: "dropdown",
      dropDownValues: [
        { value: "Export Under Bond", label: "Export Under Bond" },
        { value: "Export With Payment", label: "Export With Payment" }
      ],
      type: 6902,
      typeValue: "string",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "GST Details",
      sectionOrder: 5
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
      sectionOrder: 5
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
      sectionOrder: 5
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
      sectionOrder: 5
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
      sectionOrder: 5
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
      isBreak: 1
    },
    {
      "id": 125711,
      "fieldname": null,
      "yourlabel": "RODTEP Info",
      "controlname": "label",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "copyMappingName": null,
      "hyperlinkValue": null,
      "isCommaSeparatedOrCount": null,
      "isAuditLog": true,
      "keyToShowOnGrid": null,
      "isDummy": true,
      "dropDownValues": null,
      "referenceTable": null,
      "referenceColumn": null,
      "type": null,
      "typeValue": null,
      "size": null,
      "ordering": 25,
      "gridTotal": false,
      "gridTypeTotal": null,
      "toolTipMessage": null,
      "isRequired": false,
      "isEditable": true,
      "isSwitchToText": false,
      "isBreak": true,
      "dropdownFilter": null,
      "controlDefaultValue": null,
      "functionOnChange": "",
      "functionOnBlur": null,
      "functionOnKeyPress": null,
      "sectionHeader": "Port Details",
      "sectionOrder": 2,
      "isCopy": true,
      "isCopyEditable": true,
      "isEditableMode": "e",
      "position": "top",
      "isHideGrid": false,
      "isHideGridHeader": false,
      "isGridExpandOnLoad": false,
      "clientId": 1,
      "isColumnVisible": null,
      "isColumnDisabled": null,
      "columnsToDisabled": null,
      "columnsToHide": null,
      "columnsToBeVisible": true
    },

    {
      id: 3201,
      fieldname: "rodtepClaim",
      yourlabel: "RODTEP Claim",
      controlname: "dropdown",
      dropDownValues: [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" }
      ],
      type: 6902,
      typeValue: "string",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "RODTEP Details",
      sectionOrder: 6
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
      sectionOrder: 6
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
      sectionOrder: 6
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
      sectionOrder: 6
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
      sectionOrder: 6
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
      sectionOrder: 6
    }
  ],
  "Quota": [

  ],
  "ARE-Details": [

  ],
  "Re-export": [
    {
      "id": 125711,
      "fieldname": null,
      "yourlabel": "RE-EXPORT ITEM",
      "controlname": "label",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "copyMappingName": null,
      "hyperlinkValue": null,
      "isCommaSeparatedOrCount": null,
      "isAuditLog": true,
      "keyToShowOnGrid": null,
      "isDummy": true,
      "dropDownValues": null,
      "referenceTable": null,
      "referenceColumn": null,
      "type": null,
      "typeValue": null,
      "size": null,
      "ordering": 25,
      "gridTotal": false,
      "gridTypeTotal": null,
      "toolTipMessage": null,
      "isRequired": false,
      "isEditable": true,
      "isSwitchToText": false,
      "isBreak": true,
      "dropdownFilter": null,
      "controlDefaultValue": null,
      "functionOnChange": "",
      "functionOnBlur": null,
      "functionOnKeyPress": null,
      "sectionHeader": "Port Details",
      "sectionOrder": 2,
      "isCopy": true,
      "isCopyEditable": true,
      "isEditableMode": "e",
      "position": "top",
      "isHideGrid": false,
      "isHideGridHeader": false,
      "isGridExpandOnLoad": false,
      "clientId": 1,
      "isColumnVisible": null,
      "isColumnDisabled": null,
      "columnsToDisabled": null,
      "columnsToHide": null,
      "columnsToBeVisible": true
    },
    {

      id: 2001,
      fieldname: "eximCodeId",
      yourlabel: "B/E Number",
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
      yourlabel: "Quantity Exported",
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
      yourlabel: "Invoice SNo",
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
      yourlabel: "Item No",
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
      yourlabel: "Import Port Code",
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
      yourlabel: "Technical Details",
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
      yourlabel: "Manual B/E",
      controlname: "checkbox",
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
      yourlabel: "Input CRedit Availed",
      controlname: "checkbox",
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
      id: 2010,
      fieldname: "formulation",
      yourlabel: "Personal Use Item",
      controlname: "checkbox",
      type: 6902,
      typeValue: "string",
      ordering: 9,
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
      yourlabel: "B/E Item Desc",
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
      id: 2012,
      fieldname: "isStrCode",
      yourlabel: "Other Identifying Parameters",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 11,
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
      yourlabel: "Against Export Obligation",
      controlname: "checkbox",
      referenceTable: "tblState",
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
      sectionOrder: 3,
    },
    {
      id: 2014,
      fieldname: "materialCode",
      yourlabel: "Obligation No.",
      controlname: "checkbox",
      type: 6902,
      typeValue: "string",
      ordering: 13,
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
      yourlabel: "Throwback Amt Claimed",
      controlname: "numbers",
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
      id: 2013,
      fieldname: "originStateId",
      yourlabel: "quality imported",
      controlname: "numbers",
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
      sectionOrder: 3,
    },
    {
      id: 2013,
      fieldname: "originStateId",
      yourlabel: "Item-Un Used",
      controlname: "checkbox",
      referenceTable: "tblState",
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
      sectionOrder: 3,
    },
    {
      id: 2013,
      fieldname: "originStateId",
      yourlabel: "Commisioner Person",
      controlname: "checkbox",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 17,
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
      yourlabel: "Assessable Value ",
      controlname: "checkbox",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 18,
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
      yourlabel: "Board Number",
      controlname: "numbers",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 19,
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
      yourlabel: "Board Number Date",
      controlname: "date",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 20,
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
      yourlabel: "Total Duty Paid",
      controlname: "checkbox",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 21,
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
      yourlabel: "Total Duty Paid date",
      controlname: "date",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 22,
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
      yourlabel: "Modvat Availed",
      controlname: "checkbox",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 23,
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
      yourlabel: "Modvat Reserved",
      controlname: "checkbox",
      referenceTable: "tblState",
      referenceColumn: "name",
      dropdownFilter: "",
      type: 6653,
      typeValue: "number",
      ordering: 24,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 3,
    },
  ],
  "Other-Details": [
    {
      "id": 125711,
      "fieldname": null,
      "yourlabel": "Acessories",
      "controlname": "label",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "copyMappingName": null,
      "hyperlinkValue": null,
      "isCommaSeparatedOrCount": null,
      "isAuditLog": true,
      "keyToShowOnGrid": null,
      "isDummy": true,
      "dropDownValues": null,
      "referenceTable": null,
      "referenceColumn": null,
      "type": null,
      "typeValue": null,
      "size": null,
      "ordering": 25,
      "gridTotal": false,
      "gridTypeTotal": null,
      "toolTipMessage": null,
      "isRequired": false,
      "isEditable": true,
      "isSwitchToText": false,
      "isBreak": true,
      "dropdownFilter": null,
      "controlDefaultValue": null,
      "functionOnChange": "",
      "functionOnBlur": null,
      "functionOnKeyPress": null,
      "sectionHeader": "Port Details",
      "sectionOrder": 2,
      "isCopy": true,
      "isCopyEditable": true,
      "isEditableMode": "e",
      "position": "top",
      "isHideGrid": false,
      "isHideGridHeader": false,
      "isGridExpandOnLoad": false,
      "clientId": 1,
      "isColumnVisible": null,
      "isColumnDisabled": null,
      "columnsToDisabled": null,
      "columnsToHide": null,
      "columnsToBeVisible": true
    },
    {
      id: 1002,
      fieldname: "exporterAddress",
      yourlabel: "Acessories",
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
      isBreak: 1
    },

    {
      "id": 125711,
      "fieldname": null,
      "yourlabel": "Third Party Export",
      "controlname": "label",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "copyMappingName": null,
      "hyperlinkValue": null,
      "isCommaSeparatedOrCount": null,
      "isAuditLog": true,
      "keyToShowOnGrid": null,
      "isDummy": true,
      "dropDownValues": null,
      "referenceTable": null,
      "referenceColumn": null,
      "type": null,
      "typeValue": null,
      "size": null,
      "ordering": 25,
      "gridTotal": false,
      "gridTypeTotal": null,
      "toolTipMessage": null,
      "isRequired": false,
      "isEditable": true,
      "isSwitchToText": false,
      "isBreak": true,
      "dropdownFilter": null,
      "controlDefaultValue": null,
      "functionOnChange": "",
      "functionOnBlur": null,
      "functionOnKeyPress": null,
      "sectionHeader": "Port Details",
      "sectionOrder": 2,
      "isCopy": true,
      "isCopyEditable": true,
      "isEditableMode": "e",
      "position": "top",
      "isHideGrid": false,
      "isHideGridHeader": false,
      "isGridExpandOnLoad": false,
      "clientId": 1,
      "isColumnVisible": null,
      "isColumnDisabled": null,
      "columnsToDisabled": null,
      "columnsToHide": null,
      "columnsToBeVisible": true
    },
    {
      id: 1002,
      fieldname: "exporterAddress",
      yourlabel: "Name",
      controlname: "text",
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
      id: 1002,
      fieldname: "exporterAddress",
      yourlabel: "IE Code",
      controlname: "numbers",
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
      id: 1002,
      fieldname: "exporterAddress",
      yourlabel: "Branch SNo",
      controlname: "number",
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
      id: 1002,
      fieldname: "exporterAddress",
      yourlabel: "Reg no",
      controlname: "number",
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
      id: 1002,
      fieldname: "exporterAddress",
      yourlabel: "Address",
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
      isBreak: 1
    },

    {
      "id": 125711,
      "fieldname": null,
      "yourlabel": "Manufacturer/Producer/Grower Details",
      "controlname": "label",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "copyMappingName": null,
      "hyperlinkValue": null,
      "isCommaSeparatedOrCount": null,
      "isAuditLog": true,
      "keyToShowOnGrid": null,
      "isDummy": true,
      "dropDownValues": null,
      "referenceTable": null,
      "referenceColumn": null,
      "type": null,
      "typeValue": null,
      "size": null,
      "ordering": 25,
      "gridTotal": false,
      "gridTypeTotal": null,
      "toolTipMessage": null,
      "isRequired": false,
      "isEditable": true,
      "isSwitchToText": false,
      "isBreak": true,
      "dropdownFilter": null,
      "controlDefaultValue": null,
      "functionOnChange": "",
      "functionOnBlur": null,
      "functionOnKeyPress": null,
      "sectionHeader": "Port Details",
      "sectionOrder": 2,
      "isCopy": true,
      "isCopyEditable": true,
      "isEditableMode": "e",
      "position": "top",
      "isHideGrid": false,
      "isHideGridHeader": false,
      "isGridExpandOnLoad": false,
      "clientId": 1,
      "isColumnVisible": null,
      "isColumnDisabled": null,
      "columnsToDisabled": null,
      "columnsToHide": null,
      "columnsToBeVisible": true
    },
    {
      id: 1004,
      fieldname: "exporterStateId",
      yourlabel: "Name",
      controlname: "dropdown",
      referenceTable: "tblState",
      referenceColumn: "name",
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
      id: 1005,
      fieldname: "ieCodeNo",
      yourlabel: "Code",
      controlname: "text",
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
      id: 1002,
      fieldname: "exporterAddress",
      yourlabel: "Address",
      controlname: "textarea",
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
      id: 1012,
      fieldname: "consigneeCountryName",
      yourlabel: "Country",
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
      id: 1005,
      fieldname: "ieCodeNo",
      yourlabel: "Postal Code",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 6,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1004,
      fieldname: "exporterStateId",
      yourlabel: " Source State",
      controlname: "dropdown",
      referenceTable: "tblState",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      ordering: 7,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1012,
      fieldname: "consigneeCountryName",
      yourlabel: "Transit Country",
      controlname: "text",
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
  ],
  "DUC-Info": [

  ],
  "DOC-Info": [

  ],
};

export default function EntitySheet({
  values = {},
  onValuesChange,
  inEditMode = { isEditMode: false, isCopy: false },
  newState,
  setStateVariable,
}) {
  // ✅ Keep form sections (Accordion list is derived from keys)
  const [parentsFields] = useState(formdata);

  // ✅ Expand/collapse all parent accordions
  const [expandAll, setExpandAll] = useState(true);

  // ✅ Used by your dynamic form component
  const [clearFlag, setClearFlag] = useState({ isClear: false, fieldName: "" });
  const [tableName, setTableName] = useState(false);
  const [formControlData, setFormControlData] = useState([]);
  const [hideFieldName, setHideFieldName] = useState([]);
  const [labelName, setLabelName] = useState("");

  // (Optional) You had these modal states in your old code.
  // They are only needed if your onChange/onBlur validations require a modal.
  const [openModal, setOpenModal] = useState(false);
  const [paraText, setParaText] = useState("");
  const [isError, setIsError] = useState(false);
  const [typeofModal, setTypeofModal] = useState("onClose");

  // ✅ If you are maintaining newState + submitNewState in this file
  const [submitNewState, setSubmitNewState] = useState({
    routeName: "mastervalue",
  });

  // ✅ Label getter (kept because you pass it to CustomeInputFields)
  const getLabelValue = (labelValue) => setLabelName(labelValue);

  /**
   * ✅ MAIN handler called by CustomeInputFields when any field changes.
   * - If file found, handle file separately (your existing behavior).
   * - Otherwise merge values.
   */
  const handleFieldValuesChange = (updatedValues) => {
    const entries = Object.entries(updatedValues);
    const hasFile = entries.some(([, v]) => v instanceof File);

    if (hasFile) {
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          // ⚠️ You referenced handleFileAndUpdateState earlier.
          // Keep your existing function in your project. (Not redefining here)
          handleFileAndUpdateState(value, (jsonData) => {
            const merged = { ...newState, [key]: jsonData };
            setStateVariable?.(merged);
            setSubmitNewState(merged);
          });
        } else {
          const merged = { ...newState, [key]: value };
          setStateVariable?.(merged);
          setSubmitNewState(merged);
        }
      });
      return;
    }

    const merged = { ...newState, ...updatedValues };
    setStateVariable?.(merged);
    setSubmitNewState(merged);
  };

  /**
   * ✅ Your copy-mapping handler
   * NOTE: You used many external vars/functions (uriDecodedMenu, getCopyData, toast, etc.)
   * Keep your existing implementation if it works.
   * I am keeping the signature so your CustomeInputFields integration doesn't break.
   */
  const handleFieldValuesChange2 = async () => {
    // keep your original logic here if needed
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

      {/* ✅ Additional CESS/CENVAT accordion (custom table UI) */}
      <CessCenvatAccordion />
    </div>
  );
}

EntitySheet.propTypes = {
  values: PropTypes.object,
  onValuesChange: PropTypes.func,
  clearFlag: PropTypes.object,
  inEditMode: PropTypes.object,
  newState: PropTypes.object,
  setStateVariable: PropTypes.func,
};

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

  useEffect(() => setIsOpen(expandAll), [expandAll]);
  useEffect(() => setFieldId(hideColumnsId || []), [hideColumnsId]);

  // ✅ unify change behavior (your form sends result)
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

    setNewState?.((prev) => ({ ...prev, ...patch }));
    setSubmitNewState?.((prev) => ({ ...prev, ...patch }));
  };

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

/* ============================================================================
  ✅ CESS / CENVAT ACCORDION
  - Built for the ICEGATE style table you want
  - Uses your customTextFieldStyles + textInputStyle for inputs
============================================================================ */

function CessCenvatAccordion({
  section = "CESS / CENVAT",
  indexValue = 0,
  values: extValues,
  onChangeHandler,
}) {
  const [isOpen, setIsOpen] = useState(true);

  // ✅ local fallback state (works even if parent doesn't pass values)
  const [localValues, setLocalValues] = useState({
    cessLeviable: false,

    exportDuty: "",
    exportDutyRate1: "0.00",
    exportDutyRateType: "%",
    exportDutyRate2: "0.00",
    exportDutyTV: "0.00",
    exportDutyQty: "0.000",
    exportDutyUnit: "", // ✅ added
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
    othDutyUnit: "", // ✅ added
    othDutyDesc: "",

    thirdCess: "",
    thirdCessRate1: "0.00",
    thirdCessRateType: "%",
    thirdCessRate2: "0.00",
    thirdCessTV: "0.00",
    thirdCessQty: "0.000",
    thirdCessUnit: "", // ✅ added
    thirdCessDesc: "",

    cenvatCertNo: "",
    cenvatDate: "",
    cenvatValidUpto: "",
    cenvatCexOfficeCode: "",
    cenvatAssesseeCode: "",
  });

  const values = extValues ?? localValues;

  // ✅ Safe setValue that supports controlled/uncontrolled usage
  const setValue = (key, val) => {
    if (typeof onChangeHandler === "function" && extValues) {
      onChangeHandler({ ...(extValues || {}), [key]: val });
      return;
    }
    setLocalValues((p) => ({ ...p, [key]: val }));
  };

  // ✅ Styled textfield (your project styles)
  const CustomeTextField = useMemo(
    () =>
      styled(TextField)({
        ...customTextFieldStyles,
      }),
    []
  );

  // ✅ common compact field Sx using your system variables
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

  // ✅ reusable tiny input
  const SmallText = ({ k, label, width = 120, type = "text", disabled = false }) => {
    return (
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
            "& input": {
              padding: "2px 6px",
            },
          }}
        />
      </LightTooltip>
    );
  };

  // ✅ reusable tiny select
  const SmallSelect = ({ k, label, options, width = 140, disabled = false }) => {
    return (
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
            <MenuItem key={o.value} value={o.value} dense sx={{ fontSize: "var(--inputFontSize)" }}>
              {o.label}
            </MenuItem>
          ))}
        </CustomeTextField>
      </LightTooltip>
    );
  };

  // ✅ (Rate1) ( / ) (%/Rs dropdown) (Rate2)
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
      <Typography sx={{ fontSize: "12px", opacity: 0.75, whiteSpace: "nowrap", color: "var(--tableRowTextColor)" }}>
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

  // ✅ Table styles matching your software theme
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
    minWidth: 980, // keep ICEGATE-like scroll
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
        {/* ✅ Horizontal scroll area */}
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            p: 1,
          }}
          className={styles.thinScrollBar}
        >
          {/* ===========================
              ✅ TOP TABLE: CESS / EXP DUTY
             =========================== */}
          <Box sx={tableWrapSx}>
            {/* header strip (kept, themed) */}
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
                    <TableCell sx={{ ...headerCellSx, width: 240 }}>
                      Qty for Cess/Duty
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 220 }}>
                      Cess Desc
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dutyRows.map((r) => {
                    const cellSx = r.isLast ? { ...bodyCellSx, borderBottom: "none" } : bodyCellSx;
                    const leftSx = r.isLast ? { ...leftLabelSx, borderBottom: "none" } : leftLabelSx;

                    return (
                      <TableRow
                        key={r.keyPrefix}
                        sx={{
                          "&:hover": { backgroundColor: "var(--tableRowBgHover)" },
                          "&:hover td": { color: "var(--tableRowTextColorHover)" },
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
                          <RatesCell k1={r.rate1} kType={r.rateType} k2={r.rate2} />
                        </TableCell>

                        <TableCell sx={cellSx}>
                          <SmallText k={r.tv} label="Tariff Value" width={140} type="number" />
                        </TableCell>

                        <TableCell sx={cellSx}>
                          {r.hasUnit ? (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <SmallText k={r.qty} label="Qty" width={120} type="number" />
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
                          ) : (
                            <SmallText k={r.qty} label="Qty" width={120} type="number" />
                          )}
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

          {/* ===========================
              ✅ CENVAT DETAILS (below)
             =========================== */}
          <Box sx={{ ...tableWrapSx, mt: 1.2 }}>
            <Box
              sx={{
                px: 1,
                py: 0.7,
                borderBottom: "1px solid var(--commonBg)",
                background: "var(--accordionBodyBg)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "var(--tableHeaderFontSize)",
                  fontWeight: "var(--tableHeaderFontWeight)",
                  color: "var(--tableHeaderTextColor)",
                }}
              >
                CENVAT Details
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "150px 220px 90px 220px 90px 220px",
                gap: 1,
                px: 1,
                py: 1,
                alignItems: "center",
              }}
            >
              <Typography sx={{ fontSize: "var(--tableRowFontSize)", fontWeight: 600, color: "var(--tableRowTextColor)" }}>
                Certificate Number
              </Typography>
              <SmallText k="cenvatCertNo" label="Certificate Number" width={220} />

              <Typography sx={{ fontSize: "var(--tableRowFontSize)", fontWeight: 600, color: "var(--tableRowTextColor)" }}>
                Date
              </Typography>
              <SmallText k="cenvatDate" label="Date" width={220} />

              <Typography sx={{ fontSize: "var(--tableRowFontSize)", fontWeight: 600, color: "var(--tableRowTextColor)" }}>
                Valid Upto
              </Typography>
              <SmallText k="cenvatValidUpto" label="Valid Upto" width={220} />

              <Typography sx={{ fontSize: "var(--tableRowFontSize)", fontWeight: 600, color: "var(--tableRowTextColor)" }}>
                CEx Office Code
              </Typography>
              <SmallText k="cenvatCexOfficeCode" label="CEx Office Code" width={220} />

              <Typography sx={{ fontSize: "var(--tableRowFontSize)", fontWeight: 600, color: "var(--tableRowTextColor)" }}>
                Assessee Code
              </Typography>
              <SmallText k="cenvatAssesseeCode" label="Assessee Code" width={220} />
              
            </Box>
          </Box>
        </Box>
        
      </AccordionDetails>
      
    </Accordion>
  );
}
