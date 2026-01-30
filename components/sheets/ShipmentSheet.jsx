"use client";
/* eslint-disable */
import React, { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import styles from "@/app/app.module.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightTooltip from "@/components/Tooltip/customToolTip";
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
import SearchEditGrid from "./SearchEditGrid";

const exBondColumns = [
  { field: "voyage", headerName: "Voyage", width: 160 },
  { field: "igmNo", headerName: "IGM No", width: 140 },
  { field: "igmDate", headerName: "IGM Date", width: 140 },
  { field: "noOfPkg", headerName: "No Of Pkg", width: 140 },
  { field: "bondNo", headerName: "Bond No", width: 140 },
  { field: "bondDate", headerName: "Bond Date", width: 140 },
  { field: "warehouse", headerName: "Warehouse", width: 220 },
];

const formdata = {
  "Main": [
    {
      "fieldname": "dischargePortId",
      "yourlabel": "Discharge Port",
      "controlname": "dropdown",
      "referenceTable": "tblPort",
      "referenceColumn": "name + ' (' + code + ')'",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 1
    },
    {
      "fieldname": "dischargeCountryId",
      "yourlabel": "Discharge Country",
      "controlname": "dropdown",
      "referenceTable": "tblCountry",
      "referenceColumn": "name",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 2
    },
    {
      "fieldname": "destinationPortId",
      "yourlabel": "Destination Port",
      "controlname": "dropdown",
      "referenceTable": "tblPort",
      "referenceColumn": "name + ' (' + code + ')'",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 3
    },
    {
      "fieldname": "destinationCountryId",
      "yourlabel": "Destination Country",
      "controlname": "dropdown",
      "referenceTable": "tblCountry",
      "referenceColumn": "name",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 4
    },
    {
      "fieldname": "airlineId",
      "yourlabel": "Airline",
      "controlname": "dropdown",
      "referenceTable": "tblAirline",
      "referenceColumn": "name",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 5
    },
    {
      "fieldname": "flightNoDate",
      "yourlabel": "Flight No/Date",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 6
    },
    {
      "fieldname": "egmNoDate",
      "yourlabel": "EGM No/Date",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 7
    },
    {
      "fieldname": "mawbNoDate",
      "yourlabel": "MAWB No/Date",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 8
    },
    {
      "fieldname": "hawbNoDate",
      "yourlabel": "HAWB No/Date",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 9
    },
    {
      "fieldname": "preCarriageBy",
      "yourlabel": "Pre-Carriage by",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 10
    },
    {
      "fieldname": "placeOfReceipt",
      "yourlabel": "Place of Receipt",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 11
    },
    {
      "fieldname": "transhipperCode",
      "yourlabel": "Transhipper Code",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 12
    },
    {
      "fieldname": "gatewayPortId",
      "yourlabel": "Gateway Port",
      "controlname": "dropdown",
      "referenceTable": "tblPort",
      "referenceColumn": "name",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 13
    },
    {
      "fieldname": "stateOfOriginId",
      "yourlabel": "State Of Origin",
      "controlname": "dropdown",
      "referenceTable": "tblState",
      "referenceColumn": "name",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 14
    },
    {
      "fieldname": "isAnnexureCFiledWithAnnexureA",
      "yourlabel": "Annexure-C Details being filed with Annexure-A",
      "controlname": "checkbox",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 15
    },
    {
      "fieldname": "natureOfCargoId",
      "yourlabel": "Nature of Cargo",
      "controlname": "dropdown",
      "referenceTable": "tblMasterData",
      "referenceColumn": "name",
      "dropdownFilter": "and masterListId in (select id from tblMasterList where name='tblNatureOfCargo')",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 16
    },
    {
      "fieldname": "totalNoOfPkgs",
      "yourlabel": "Total No. of Pkgs",
      "controlname": "number",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 17
    },
    {
      "fieldname": "loosePkgs",
      "yourlabel": "Loose Pkgs",
      "controlname": "number",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 18
    },
    {
      "fieldname": "pktsInMawb",
      "yourlabel": "Pkts in MAWB",
      "controlname": "number",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 19
    },
    {
      "fieldname": "grossWeight",
      "yourlabel": "Gross Weight",
      "controlname": "number",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 20
    },
    {
      "fieldname": "netWeight",
      "yourlabel": "Net Weight",
      "controlname": "number",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 21
    },
    {
      "fieldname": "volume",
      "yourlabel": "Volume",
      "controlname": "number",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 22
    },
    {
      "fieldname": "chargeableWeight",
      "yourlabel": "Chargeable Weight",
      "controlname": "number",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 23
    },
    {
      "fieldname": "marksAndNos",
      "yourlabel": "Marks & Nos",
      "controlname": "textarea",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 24
    }
  ],
  "Stuffing Details": [
    {
      "fieldname": "goodsStuffedAtId",
      "yourlabel": "Goods Stuffed At",
      "controlname": "dropdown",
      "referenceTable": "tblMasterData",
      "referenceColumn": "name",
      "dropdownFilter": "and masterListId in (select id from tblMasterList where name = 'tblGoodsStuffedAt')",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 1
    },
    {
      "fieldname": "isSampleAccompanied",
      "yourlabel": "Sample Accompanied",
      "controlname": "checkbox",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 2
    },
    {
      "fieldname": "cfsId",
      "yourlabel": "CFS",
      "controlname": "dropdown",
      "referenceTable": "tblCfsIcdTerminal",
      "referenceColumn": "name",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 3
    },
    {
      "fieldname": "factoryAddress",
      "yourlabel": "Factory Address",
      "controlname": "textarea",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 4
    },
    {
      "fieldname": "warehouseCode",
      "yourlabel": "Warehouse Code (of CFS/ICD/Terminal)",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 5
    },
    {
      "fieldname": "sealTypeId",
      "yourlabel": "Seal Type",
      "controlname": "dropdown",
      "referenceTable": "tblMasterData",
      "referenceColumn": "name",
      "dropdownFilter": "and masterListId in (select id from tblMasterList where name = 'tblSealType')",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 6
    },
    {
      "fieldname": "sealNo",
      "yourlabel": "Seal No",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 7
    },
    {
      "fieldname": "agencyName",
      "yourlabel": "Agency Name",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 8
    }
  ],
  "Invoice Printing": [
    {
      "fieldname": "buyersOrderNo",
      "yourlabel": "Buyer's Order No",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 1
    },
    {
      "fieldname": "otherReferences",
      "yourlabel": "Other References",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 2
    },
    {
      "fieldname": "termsOfDeliveryAndPayment",
      "yourlabel": "Terms of Delivery and Payment",
      "controlname": "textarea",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 3
    },
    {
      "fieldname": "originCountryId",
      "yourlabel": "Origin Country",
      "controlname": "dropdown",
      "referenceTable": "tblCountry",
      "referenceColumn": "name",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": false,
      "isBreak": false,
      "ordering": 4
    },
    {
      "fieldname": "invoiceHeader",
      "yourlabel": "Invoice Header",
      "controlname": "textarea",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 5
    }
  ],
  "shipping bill Printing": [
    {
      "fieldname": "qCertNoDate",
      "yourlabel": "Q/Cert. No./Date",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 1
    },
    {
      "fieldname": "exportTradeControl",
      "yourlabel": "Export Trade Control",
      "controlname": "textarea",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 2
    },
    {
      "fieldname": "typeOfShipmentId",
      "yourlabel": "Type of Shipment",
      "controlname": "dropdown",
      "referenceTable": "tblMasterData",
      "referenceColumn": "name",
      "dropdownFilter": "and masterListId in (select id from tblMasterList where name = 'tblTypeOfShipment')",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 3
    },
    {
      "fieldname": "shipmentTypeOther",
      "yourlabel": "Specify, if Other",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 4
    },
    {
      "fieldname": "permissionNoDate",
      "yourlabel": "Permission No. & Date",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 5
    },
    {
      "fieldname": "exportUnderId",
      "yourlabel": "Export Under",
      "controlname": "dropdown",
      "referenceTable": "tblMasterData",
      "referenceColumn": "name",
      "dropdownFilter": "and masterListId in (select id from tblMasterList where name = 'tblExportUnder')",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 6
    },
    {
      "fieldname": "sbHeading",
      "yourlabel": "S/B Heading",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 7
    },
    {
      "fieldname": "sbBottomText",
      "yourlabel": "Text to be printed on S/B bottom area",
      "controlname": "textarea",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": true,
      "ordering": 8
    }
  ],
  "Ex-Bond Details": [
    {
      fieldname: "voyage",
      yourlabel: "Voyage",
      controlname: "text",
      referenceTable: "",
      referenceColumn: "",
      dropdownFilter: "",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isRequired: false,
      isEditable: true,
      isBreak: false,
      ordering: 1,
    },
    {
      fieldname: "igmNo",
      yourlabel: "IGM No",
      controlname: "text",
      referenceTable: "",
      referenceColumn: "",
      dropdownFilter: "",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isRequired: false,
      isEditable: true,
      isBreak: false,
      ordering: 2,
    },
    {
      fieldname: "igmDate",
      yourlabel: "IGM Date",
      controlname: "date",
      referenceTable: "",
      referenceColumn: "",
      dropdownFilter: "",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isRequired: false,
      isEditable: true,
      isBreak: false,
      ordering: 3,
    },
    {
      fieldname: "noOfPkg",
      yourlabel: "No Of Pkg",
      controlname: "number",
      referenceTable: "",
      referenceColumn: "",
      dropdownFilter: "",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isRequired: false,
      isEditable: true,
      isBreak: false,
      ordering: 4,
    },
    {
      fieldname: "bondNo",
      yourlabel: "Bond No",
      controlname: "text",
      referenceTable: "",
      referenceColumn: "",
      dropdownFilter: "",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isRequired: false,
      isEditable: true,
      isBreak: false,
      ordering: 5,
    },
    {
      fieldname: "bondDate",
      yourlabel: "Bond Date",
      controlname: "date",
      referenceTable: "",
      referenceColumn: "",
      dropdownFilter: "",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isRequired: false,
      isEditable: true,
      isBreak: false,
      ordering: 6,
    },
    {
      fieldname: "warehouse",
      yourlabel: "Warehouse",
      controlname: "text",
      referenceTable: "",
      referenceColumn: "",
      dropdownFilter: "",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isRequired: false,
      isEditable: true,
      isBreak: true,   // ✅ break to next line after long field
      ordering: 7,
    },
  ],
  "Annex C1 Details": [
    {
      "fieldname": "ieCodeOfEou",
      "yourlabel": "IE Code Of EOU",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 1
    },
    {
      "fieldname": "branchSlNo",
      "yourlabel": "Branch Sl. No.",
      "controlname": "number",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 2
    },
    {
      "fieldname": "examinationDate",
      "yourlabel": "Examination Date",
      "controlname": "date",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 3
    },
    {
      "fieldname": "examiningOfficer",
      "yourlabel": "Examining Officer",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 4
    },
    {
      "fieldname": "examiningOfficerDesignation",
      "yourlabel": "Designation",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 5
    },
    {
      "fieldname": "supervisingOfficer",
      "yourlabel": "Supervising Officer",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 6
    },
    {
      "fieldname": "supervisingOfficerDesignation",
      "yourlabel": "Designation",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 7
    },
    {
      "fieldname": "commissionerate",
      "yourlabel": "Commissionerate",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 8
    },
    {
      "fieldname": "division",
      "yourlabel": "Division",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 9
    },
    {
      "fieldname": "range",
      "yourlabel": "Range",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 10
    },
    {
      "fieldname": "verifiedByExaminingOfficer",
      "yourlabel": "Verified by Examining Officer",
      "controlname": "checkbox",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 11
    },
    {
      "fieldname": "sampleForwarded",
      "yourlabel": "Sample Forwarded",
      "controlname": "checkbox",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 12
    },
    {
      "fieldname": "sealNumber",
      "yourlabel": "Seal Number",
      "controlname": "text",
      "referenceTable": "",
      "referenceColumn": "",
      "dropdownFilter": "",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": true,
      "ordering": 13
    }
  ],
}

export default function ShipmentSheet({ value, onChange }) {
  const parentsFields = formdata;
  const [expandAll, setExpandAll] = useState(true);
  const [expandedAccordion, setExpandedAccordion] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [paraText, setParaText] = useState("");
  const [isError, setIsError] = useState(false);
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [clearFlag, setClearFlag] = useState({
    isClear: false,
    fieldName: "",
  });
  const [submitNewState, setSubmitNewState] = useState({
    routeName: "mastervalue",
  });
  const [tableName, setTableName] = useState(false);
  const [formControlData, setFormControlData] = useState([]);
  const newState = value;          // ✅ source of truth
  const setNewState = onChange;    // ✅ direct update

  const getLabelValue = (labelValue) => {
    //    console.log(labelValue, "labelValue");
    setLabelName(labelValue);
  };
  const [hideFieldName, setHideFieldName] = useState([]);
  const [labelName, setLabelName] = useState("");

  const handleFieldValuesChange = (updatedValues = {}) => {
    setNewState((prev) => {
      const next = { ...(prev || {}) };

      Object.entries(updatedValues).forEach(([key, value]) => {
        next[key] = value;
      });

      return next;
    });

    setSubmitNewState((prev) => ({
      ...(prev || {}),
      ...updatedValues,
    }));
  };


  const handleFieldValuesChange2 = async (
    updatedValues,
    field,
    formControlData
  ) => {
    try {
      console.log("field", field);
      const requestData = {
        id: updatedValues.copyMappingName,
        filterValue: field[field.length - 1],
        menuID: uriDecodedMenu.id,
      };
      console.log("formControlData", requestData);

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
          // dataToCopy[data.tableName] = getCopyDetails.data[0][data?.toTableName];
          dataToCopy[data?.toTableName] = formControlData?.controlname.toLowerCase() == "multiselect" ? [...newState[data?.toTableName], ...getCopyDetails.data[0][data?.toTableName]] : getCopyDetails.data[0][data?.toTableName]
            ;
        });

      //      console.log("dataToCopy", dataToCopy);
      let childData = getCopyDetails.keyToValidate.fieldsMaping.filter(
        (data) => data.isChild == "true"
      );
      setChildsFields((prev) => {
        // Create a copy of the previous state
        let updatedFields = [...prev];

        childData.forEach((data) => {
          let index = updatedFields.findIndex(
            (i) => i.tableName === data.toColmunName
          );

          if (index !== -1) {
            // Update the specific object at the found index
            updatedFields[index] = {
              ...updatedFields[index],
              isAddFunctionality: data.isAddFunctionality,
              isDeleteFunctionality: data.isDeleteFunctionality,
              isCopyFunctionality: data.isCopyFunctionality,
            };
          }
        });
        //        console.log("updatedFields", updatedFields);

        // Return the new state
        return updatedFields;
      });

      console.log("getCopyDetails", dataToCopy);

      const dataObj = dataToCopy;

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

      // setNewState((prevState) => {
      //   finalIndexdata.keyToValidate.fieldsMaping.forEach((data) => {
      //     if (data.isChild == "true") {
      //       if (typeof prevState[data.ToColmunName] === "undefined") {
      //         prevState[data.ToColmunName] = [];
      //       }
      //       for (const iterator of finalIndexdata.data[0][data.ToColmunName]) {
      //         prevState[data.ToColmunName].push(iterator);
      //       }

      //       //            console.log("prevState", prevState);
      //     }
      //   });
      //   // return {
      //   //   ...prevState,
      //   //   ...dataToCopy,
      //   // };
      //   return {
      //     ...prevState,
      //     ...finalIndexdata.data[0],
      //   };
      // });

      setNewState((prevState) => {
        const next = { ...(prevState || {}) };

        finalIndexdata.keyToValidate.fieldsMaping.forEach((data) => {
          if (data.isChild == "true") {
            const key = data.ToColmunName;
            next[key] = [
              ...(next[key] || []),
              ...(finalIndexdata.data[0][key] || []),
            ];
          }
        });

        return {
          ...next,
          ...finalIndexdata.data[0],
        };
      });

      setSubmitNewState((prevState) => ({
        ...prevState,
        ...finalIndexdata.data[0],
      }));

      setKeysTovalidate(finalIndexdata.keyToValidate.fieldsMaping);
    } catch (error) {
      console.error("Fetch Error :", error);
    }
  };

  const ui = useMemo(
    () => ({
      wrap: {
        width: "100%",
        display: "flex",
        justifyContent: "center",
      },
      panel: {
        width: "100%",
        border: "1px solid var(--inputBorderColor)",
        background: "var(--page-bg-color)",
        borderRadius: 4,
        padding: 10,
      },
    }),
    []
  );

  return (
    <>
      <div
        className={`w-full p-1 ${styles.pageBackground}  overflow-y-auto  overflow-x-hidden  ${styles.thinScrollBar}`}
        style={{
          height: "calc(100vh - 24vh)",
        }}
      >
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
              />
            </React.Fragment>
          );
        })}
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
  const [isParentAccordionOpen, setIsParentAccordionOpen] = useState(false);
  const [fieldId, setFieldId] = useState([]);
  useEffect(() => {
    setIsParentAccordionOpen(expandAll);
  }, [expandAll]);
  console.log("section Name", section);
  console.log("parentsFields Name", parentsFields);
  useEffect(() => {
    setFieldId(hideColumnsId);
  }, [hideColumnsId]);

  //  console.log("hideColumnsId of ak", hideColumnsId);

  function handleChangeFunction(result) {
    //    console.log(result, "resilt");
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
    // let data = { ...result.values };
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
    // let data = { ...result.values };
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
  //  console.log("parentsFields[section] =>>", parentsFields[section]);
  return (
    <React.Fragment key={indexValue}>
      <Accordion
        expanded={isParentAccordionOpen}
        onChange={() => setIsParentAccordionOpen((p) => !p)}
        sx={{ ...parentAccordionSection }}
      >
        <AccordionSummary
          sx={{ ...SummaryStyles }}
          expandIcon={
            <LightTooltip title={isParentAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon sx={{ ...expandIconStyle }} />
            </LightTooltip>
          }
        >
          <Typography className="relative right-[11px]" key={indexValue}>
            {section}
          </Typography>
        </AccordionSummary>

        <AccordionDetails
          className={` overflow-hidden p-0 ${styles.thinScrollBar}`}
          sx={{ ...accordianDetailsStyleForm }}
        >
          {section === "Ex-Bond Details" ? (
            <div className="p-1">
              <SearchEditGrid
                title="Ex-Bond Details"
                columns={exBondColumns}
                editorFields={parentsFields?.[section] || []}
                rowIdField="id"
                fetchPayload={{ jobId: newState?.jobId }}
                fetchRows={async (payload) => {
                  return { data: [], totalCount: 0 };
                }}
                onSave={async (row) => row}
                onDelete={async (row) => { }}
                height={220}
              />

              <div className="mt-2">
                <CustomeInputFields
                  inputFieldData={parentsFields?.[section] || []}
                  values={newState}
                  onValuesChange={handleFieldValuesChange}
                  handleFieldValuesChange2={handleFieldValuesChange2}
                  inEditMode={{ isEditMode: false, isCopy: true }}
                  onChangeHandler={(result) => handleChangeFunction(result)}
                  onBlurHandler={(result) => handleBlurFunction(result)}
                  clearFlag={clearFlag}
                  newState={newState}
                  tableName={parentTableName}
                  formControlData={formControlData}
                  setFormControlData={setFormControlData}
                  setStateVariable={setNewState}
                  getLabelValue={getLabelValue}
                  hideColumnsId={fieldId}
                />
              </div>
            </div>
          ) : (
            <div>
              <CustomeInputFields
                inputFieldData={parentsFields[section]}
                values={newState}
                onValuesChange={handleFieldValuesChange}
                handleFieldValuesChange2={handleFieldValuesChange2}
                inEditMode={{ isEditMode: false, isCopy: true }}
                onChangeHandler={(result) => handleChangeFunction(result)}
                onBlurHandler={(result) => handleBlurFunction(result)}
                clearFlag={clearFlag}
                newState={newState}
                tableName={parentTableName}
                formControlData={formControlData}
                setFormControlData={setFormControlData}
                setStateVariable={setNewState}
                getLabelValue={getLabelValue}
                hideColumnsId={fieldId}
              />
            </div>
          )}
        </AccordionDetails>
      </Accordion>
    </React.Fragment>
  );
}
