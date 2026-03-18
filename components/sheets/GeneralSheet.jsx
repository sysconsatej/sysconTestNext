"use client";
/* eslint-disable */
import React, { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import PropTypes from "prop-types";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import styles from "@/app/app.module.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightTooltip from "@/components/Tooltip/customToolTip";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { areObjectsEqual, hasBlackValues } from "@/helper/checkValue";
import RowComponent from "@/app/(groupControl)/formControl/addEdit/RowComponent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import Paper from "@mui/material/Paper";
import {
  gridEditIconStyles,
  childTableHeaderStyle,
} from "@/app/globalCss";
import {
  parentAccordionSection,
  SummaryStyles,
  accordianDetailsStyleForm,
  expandIconStyle,
} from "@/app/globalCss";
import { ButtonPanel } from "../Buttons/customeButton";
import { decrypt } from "@/helper/security";
import { commanPostService, fetchReportData, fetchSearchPageData } from "@/services/auth/FormControl.services";
import { toast } from "react-toastify";
import { getUserDetails } from "@/helper/userDetails";
// const { clientId, defaultCompanyId, defaultBranchId, defaultFinYearId } = getUserDetails();
import {
  childAccordionSection,
} from "@/app/globalCss";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import {
  refreshIcon,
  saveIcon,
  addLogo,
  plusIconHover,
  revertHover,
  saveIconHover,
} from "@/assets";

export const parentsFieldsData = {
  "Job Details": [
    {
      id: 1001,
      fieldname: "shipperId",
      yourlabel: "Exporter",
      controlname: "dropdown",
      type: 6902,
      typeValue: "number",
      ordering: 1,
      isControlShow: true,
      isSwitchToText: true,
      isGridView: false,
      isEditable: true,
      isRequired: true,
      sectionHeader: "General",
      sectionOrder: 1,
      referenceColumn: "name",
      referenceTable: "tblCompany",
      // dropdownFilter: `and id=${defaultCompanyId} `,
    },
    {
      id: 1001,
      fieldname: "shipperBranchId",
      yourlabel: "Exporter Branch",
      controlname: "dropdown",
      type: 6902,
      typeValue: "number",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
      referenceColumn: "name",
      referenceTable: "tblCompanyBranch",
      dropdownFilter: "and companyId = ${newState.shipperId}",
    },
    {
      id: 1002,
      fieldname: "shipperAddress",
      yourlabel: "Address",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 1.01,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
      isDisabled: true,
      isEditableMode: "e",
    },
    {
      id: 1003,
      fieldname: "branchSrNo",
      yourlabel: "Branch SrNo",
      controlname: "number",
      type: 6902,
      typeValue: "number",
      ordering: 1.02,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
      isDisabled: true,
    },
    {
      id: 1004,
      fieldname: "exporterStateId",
      yourlabel: "Exporter State",
      controlname: "dropdown",
      referenceTable: "tblState",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      ordering: 1.03,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      isEditableMode: "e",
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1001,
      fieldname: "shipperType",
      yourlabel: "Exporter Type",
      controlname: "dropdown",
      type: 6902,
      typeValue: "number",
      ordering: 1,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      isEditableMode: "e",
      sectionHeader: "General",
      sectionOrder: 1,
      referenceColumn: "name",
      referenceTable: "tblMasterData",
      dropdownFilter:
        "and id in (select id from tblMasterData where masterListName='tblSubtypeCompany')",
    },
    {
      id: 1015,
      fieldname: "shipperRefNo",
      yourlabel: "Exporter Ref No",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 1.1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1016,
      fieldname: "shipperRefDate",
      yourlabel: "Exporter Ref Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 1.2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1034,
      fieldname: "rateRequestId",
      yourlabel: "Quotation",
      controlname: "dropdown",
      referenceTable: "tblRateRequest",
      referenceColumn: "rateRequestNo",
      type: 6653,
      typeValue: "number",
      ordering: 1.5,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1018,
      fieldname: "sbNo",
      yourlabel: "SB Number",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 2.1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1019,
      fieldname: "sbDate",
      yourlabel: "SB Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 2.2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1020,
      fieldname: "rbiApprovalNo",
      yourlabel: "RBI Appr. No",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 2.3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
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
      id: 1021,
      fieldname: "rbiApprovalDate",
      yourlabel: "RBI Appr. Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 2.4,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },

    {
      id: 1022,
      fieldname: "isGrWaived",
      yourlabel: "GR Waived",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 4.1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isEditableMode: "b",
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1023,
      fieldname: "grNo",
      yourlabel: "GR No",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 4.2,
      isControlShow: true,
      isGridView: false,
      isEditableMode: "b",
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1024,
      fieldname: "grDate",
      yourlabel: "GR Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 4.3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isEditableMode: "b",
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1005,
      fieldname: "iecCode",
      yourlabel: "IE Code No",
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
      id: 1006,
      fieldname: "registrationNo",
      yourlabel: "Regn. No",
      controlname: "text",
      referenceTable: "tblRegistration",
      referenceColumn: "name",
      type: 6653,
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
      id: 1025,
      fieldname: "rbiWaiverNo",
      yourlabel: "RBI Waiver No",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 25,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isRequired: false,
      sectionHeader: "General",
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
      id: 1026,
      fieldname: "rbiWaiverDate",
      yourlabel: "RBI Waiver Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 26,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isEditableMode: "b",
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1007,
      fieldname: "dbkBank",
      yourlabel: "DBK Bank",
      controlname: "dropdown",
      referenceTable: "tblCompanyBranchBank",
      referenceColumn: "bankName",
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
      id: 1008,
      fieldname: "dbkAccountNo",
      yourlabel: "DBK A/c.",
      controlname: "number",
      referenceColumn: "dbkAccountNo",
      type: 6902,
      typeValue: "number",
      ordering: 8,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1009,
      fieldname: "dbkEdiAccountNo",
      yourlabel: "DBK EDI A/c.",
      controlname: "number",
      referenceColumn: "dbkEDIAccountNo",
      type: 6902,
      typeValue: "number",
      ordering: 9,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1027,
      fieldname: "bankDealerName",
      yourlabel: "Bank / Dealer",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 9.1,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1028,
      fieldname: "accountNo",
      yourlabel: "A/C Number",
      controlname: "number",
      type: 6902,
      typeValue: "number",
      ordering: 9.2,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1029,
      fieldname: "adCode",
      yourlabel: "AD Code",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 9.3,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1010,
      fieldname: "consigneeId",
      yourlabel: "Consignee",
      controlname: "dropdown",
      referenceTable: "tblCompany",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      ordering: 10,
      isControlShow: true,
      isSwitchToText: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1010,
      fieldname: "consigneeBranchId",
      yourlabel: "Consignee Branch",
      controlname: "dropdown",
      referenceTable: "tblCompanyBranch",
      dropdownFilter: "and companyId = ${newState.consigneeId}",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      ordering: 10,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1011,
      fieldname: "consigneeAddress",
      yourlabel: "Consignee Address",
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
      id: 1012,
      fieldname: "consigneeCountry",
      yourlabel: "Consignee Country",
      controlname: "dropdown",
      referenceTable: "tblCountry",
      referenceColumn: "name",
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
      id: 1012,
      fieldname: "plrId",
      yourlabel: "PLR",
      controlname: "dropdown",
      referenceTable: "tblPort",
      referenceColumn: "name",
      // dropdownFilter: "and countryId= ${newState.consigneeCountry}",
      type: 6653,
      typeValue: "number",
      ordering: 12,
      isControlShow: true,
      isGridView: false,
      isSwitchToText: true,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1012,
      fieldname: "polId",
      yourlabel: "POL",
      controlname: "dropdown",
      referenceTable: "tblPort",
      referenceColumn: "name",
      // dropdownFilter: "and countryId= ${newState.consigneeCountry}",
      type: 6653,
      typeValue: "number",
      ordering: 12,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isSwitchToText: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1012,
      fieldname: "podId",
      yourlabel: "POD",
      controlname: "dropdown",
      referenceTable: "tblPort",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      ordering: 12,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isSwitchToText: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1012,
      fieldname: "fpdId",
      yourlabel: "FPD",
      controlname: "dropdown",
      referenceTable: "tblPort",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      ordering: 12,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      isSwitchToText: true,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 1030,
      fieldname: "epzCode",
      yourlabel: "EPZ Code",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 13,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1031,
      fieldname: "notifyPartyId",
      yourlabel: "Notify",
      controlname: "dropdown",
      referenceTable: "tblCompany",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      ordering: 14,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1032,
      fieldname: "notifyAddress",
      yourlabel: "Notify Address",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 15,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1033,
      fieldname: "docUserId",
      yourlabel: "Doc User",
      controlname: "dropdown",
      referenceTable: "tblUser",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      ordering: 16,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1013,
      fieldname: "isBuyerDifferent",
      yourlabel: "Buyer, if other than consignee",
      controlname: "checkbox",
      type: 6902,
      typeValue: "boolean",
      ordering: 13,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 123531,
      fieldname: "businessSegmentId",
      yourlabel: "Department",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isAuditLog: true,
      referenceTable: "tblBusinessSegment",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 1,
      isRequired: true,
      isEditable: false,
      isEditableMode: "e",
      position: "top",
      sectionHeader: "Job Details",
      sectionOrder: 1,
      isCopy: false,
      isCopyEditable: false,
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      columnsToBeVisible: false,
    },
    {
      id: 123526,
      fieldname: "jobNo",
      yourlabel: "Job No",
      controlname: "text",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      isAuditLog: true,
      type: 6902,
      typeValue: "string",
      size: "100",
      ordering: 2,
      isRequired: false,
      isEditable: false,
      isEditableMode: "e",
      position: "top",
      sectionHeader: "Job Details",
      sectionOrder: 1,
      isCopy: false,
      isCopyEditable: false,
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      columnsToBeVisible: false,
    },
    {
      id: 123527,
      fieldname: "jobDate",
      yourlabel: "Job Date",
      controlname: "date",
      isControlShow: true,
      isGridView: true,
      isDataFlow: true,
      isAuditLog: true,
      type: 6783,
      typeValue: "date",
      size: "100",
      ordering: 3,
      isRequired: true,
      isEditable: false,
      isEditableMode: "e",
      position: "top",
      controlDefaultValue: "date.now()",
      sectionHeader: "Job Details",
      sectionOrder: 1,
      isCopy: false,
      isCopyEditable: false,
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      columnsToBeVisible: false,
    },
    {
      id: 123532,
      fieldname: "createdBy",
      yourlabel: "Created By",
      controlname: "dropdown",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isAuditLog: true,
      referenceTable: "tblUser",
      referenceColumn: "name",
      type: 6653,
      typeValue: "number",
      size: "100",
      ordering: 1,
      isRequired: true,
      isEditable: false,
      isEditableMode: "e",
      position: "top",
      sectionHeader: "Job Details",
      sectionOrder: 1,
      isCopy: false,
      isCopyEditable: false,
      isHideGrid: false,
      isHideGridHeader: false,
      isGridExpandOnLoad: false,
      clientId: 1,
      columnsToBeVisible: false,
    },
  ],
  "Shipment Main Details": [
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
      "ordering": 1
    },
    {
      "fieldname": "dischargePortId",
      "yourlabel": "Discharge Port",
      "controlname": "dropdown",
      "referenceTable": "tblPort",
      "referenceColumn": "name",
      "dropdownFilter": " and countryId = ${newState.dischargeCountryId}",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 1
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
      "fieldname": "destinationPortId",
      "yourlabel": "Destination Port",
      "controlname": "dropdown",
      "referenceTable": "tblPort",
      "referenceColumn": "name",
      "dropdownFilter": " and countryId = ${newState.destinationCountryId}",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 3
    },
    {
      "fieldname": "natureOfCargoId",
      "yourlabel": "Nature of Cargo",
      "controlname": "dropdown",
      "referenceTable": "tblMasterData",
      "referenceColumn": "name",
      "dropdownFilter": "and masterListId in (select id from tblMasterList where name='tblCargoType')",
      "isControlShow": true,
      "isGridView": false,
      "isDataFlow": true,
      "isRequired": false,
      "isEditable": true,
      "isBreak": false,
      "ordering": 16
    },

    {
      "fieldname": "noOfPackages",
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
      "fieldname": "flightNo",
      "yourlabel": "Flight No",
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
      "fieldname": "flightDate",
      "yourlabel": "Flight Date",
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
      "ordering": 6.1
    },
    {
      "fieldname": "egmNo",
      "yourlabel": "EGM No",
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
      "fieldname": "egmDate",
      "yourlabel": "EGM Date",
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
      "ordering": 7.1
    },
    {
      "fieldname": "mawbNo",
      "yourlabel": "MAWB No",
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
      "fieldname": "mawbDate",
      "yourlabel": "MAWB Date",
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
      "ordering": 8.1
    },
    {
      "fieldname": "hawbNo",
      "yourlabel": "HAWB No",
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
      "fieldname": "hawbDate",
      "yourlabel": "HAWB Date",
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
      "ordering": 9.1
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
      "fieldname": "chargeableWt",
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
      "fieldname": "marksNos",
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
  "Shipment Stuffing Details": [
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
  "Shipment Invoice Printing": [
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
  "Shipment Shipping bill Printing": [
    {
      "fieldname": "qCertNo",
      "yourlabel": "Q/Cert. No.",
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
      "fieldname": "qCertDate",
      "yourlabel": "Q/Cert. Date",
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
  "Shipment Annex C1 Details": [
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
};

export default function JobSheet({ value, onChange, jobId }) {
  const newState = value;
  const setNewState = onChange;
  const isView = false;
  console.log("newState =>", newState);
  //const expandAll = true;
  const [parentsFields, setParentsFields] = useState(parentsFieldsData);
  const [expandedAccordion, setExpandedAccordion] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [paraText, setParaText] = useState("");
  const [isError, setIsError] = useState(false);
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [clearFlag, setClearFlag] = useState({ isClear: false, fieldName: "" });
  const [submitNewState, setSubmitNewState] = useState({ routeName: "mastervalue", });
  const [tableName, setTableName] = useState(false);
  const [formControlData, setFormControlData] = useState([]);
  const [hideFieldName, setHideFieldName] = useState([]);
  const [labelName, setLabelName] = useState("");
  const getLabelValue = (labelValue) => setLabelName(labelValue);
  const userData = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const storedUserData = localStorage.getItem("userData");
      if (!storedUserData) return null;
      const decryptedData = decrypt(storedUserData);
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error("Failed to read userData from localStorage:", error);
      return null;
    }
  }, []);
  const [childsFields, setChildsFields] = useState([{
    "id": 1811,
    "formName": "Job Container",
    "childHeading": "Job Container",
    "gridEditableOnLoad": "false",
    "tableName": "tblJobContainer",
    "isAttachmentRequired": "true",
    "isCopyForSameTable": "true",
    "functionOnLoad": null,
    "functionOnSubmit": null,
    "functionOnEdit": null,
    "functionOnDelete": null,
    "isChildCopy": false,
    "searchApi": null,
    "searchApiFields": null,
    "clientId": 1,
    "functionOnAdd": null,
    "isHideGrid": "false",
    "isHideGridHeader": false,
    "isGridExpandOnLoad": false,
    "buttons": [],
    "fields": [
      {
        id: 1,
        fieldname: "containerNo",
        yourlabel: "Container No",
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
        fieldname: "type",
        yourlabel: "Type",
        controlname: "dropdown",
        type: 6902,
        typeValue: "string",
        ordering: 2,
        isControlShow: true,
        isGridView: true,
        isEditable: true,
        isRequired: false,
        sectionHeader: "General",
        sectionOrder: 1,
        referenceTable: "tblMasterData",
        referenceColumn: "name",
        dropdownFilter: "and masterListId in (select id from tblMasterList where name='tblType')",
      },
      {
        id: 3,
        fieldname: "pkgsStuffed",
        yourlabel: "Pkgs Stuffed",
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
        fieldname: "grossWeight",
        yourlabel: "Gross Weight",
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
        fieldname: "sealNo",
        yourlabel: "Seal No",
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
        fieldname: "sealDate",
        yourlabel: "Seal Date",
        controlname: "date",
        type: 6783,
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
        fieldname: "sealType",
        yourlabel: "Seal Type",
        controlname: "dropdown",
        type: 6902,
        typeValue: "string",
        ordering: 7,
        isControlShow: true,
        isGridView: true,
        isEditable: true,
        isRequired: false,
        sectionHeader: "General",
        sectionOrder: 2,
        referenceTable: "tblMasterData",
        referenceColumn: "name",
        dropdownFilter: "and masterListId in (select id from tblMasterList where name='tblSealTypeIndicator')",

      },
      {
        id: 8,
        fieldname: "location",
        yourlabel: "Location",
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
    "subChild": [],
    "showSrNo": false
  },]);
  const [originalData, setOriginalData] = useState(null);
  const [expandAll, setExpandAll] = useState(true);


  // const prevShipperBranchIdRef = useRef(undefined);

  // useEffect(() => {
  //   const currentId = newState?.shipperBranchId ?? null;

  //   if (prevShipperBranchIdRef.current === currentId) return;
  //   prevShipperBranchIdRef.current = currentId;

  //   if (!currentId) return;

  //   let cancelled = false;

  //   (async () => {
  //     try {
  //       const requestObj = {
  //         columns: `c.name as companyName,cb.address,cb.name as companyBranch,cb.branchSrNo,cb.stateId,s.subTypeId,sub.name as subTypeName,st.name as stateName,cb.id as companyBranchId`,
  //         tableName: `tblCompany c left join tblCompanyBranch cb on c.id=cb.companyId left join tblCompanySubtype s on c.id=s.companyId left join tblState st on st.id = cb.stateId left join tblMasterData sub on sub.id = s.subTypeId and sub.masterListName = 'tblSubtypeCompany'`,
  //         whereCondition: `cb.id = ${currentId}`,
  //         clientIdCondition: `cb.status=1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
  //       };

  //       const response = await fetchReportData(requestObj);
  //       if (cancelled) return;

  //       const row = response?.data?.[0];

  //       if (!row) {
  //         setNewState((prev) => ({
  //           ...prev,
  //           shipperAddress: null,
  //           branchSrNo: null,
  //           exporterStateId: null,
  //           shipperType: null,
  //         }));
  //         return;
  //       }

  //       setNewState((prev) => ({
  //         ...prev,
  //         shipperAddress: row.address ?? null,
  //         branchSrNo: row.branchSrNo ?? null,
  //         exporterStateId: row.stateId ?? null,
  //         shipperType: row.subTypeId ?? null,
  //       }));
  //     } catch (err) {
  //       if (cancelled) return;
  //       console.error("fetchReportData error:", err);
  //     }
  //   })();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [newState?.shipperBranchId]);
  // const prevShipperBranchIdRef = useRef(null);

  const prevShipperBranchIdRef = useRef(null);
  const prevDbkBankIdRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const normalizeId = (raw) => {
      const n =
        raw === null || raw === undefined || raw === "" ? null : Number(raw);
      return Number.isFinite(n) ? n : null;
    };

    const shipperId = normalizeId(newState?.shipperBranchId);
    const bankName = normalizeId(newState?.dbkBank);

    (async () => {
      if (!shipperId) {
        prevShipperBranchIdRef.current = null;
        setNewState((prev) => ({
          ...(prev || {}),
          shipperAddress: null,
          branchSrNo: null,
          exporterStateId: null,
          shipperType: null,
          shipperReferenceNo: null,
          shipperReferenceDate: null,


        }));
        return;
      }

      if (prevShipperBranchIdRef.current === shipperId) return;
      prevShipperBranchIdRef.current = shipperId;

      try {
        const requestObj = {
          columns: `
          c.name as companyName,
          c.shipperReferenceNo as refNo,
          c.shipperReferenceDate as date,
          cb.address,
          cb.name as companyBranch,
          cb.branchSrNo,
          cb.stateId,
          s.subTypeId,
          sub.name as subTypeName,
          st.name as stateName,
          cb.id as companyBranchId
        `,
          tableName: `
          tblCompany c
          left join tblCompanyBranch cb on c.id = cb.companyId
          left join tblCompanySubtype s on c.id = s.companyId
          left join tblState st on st.id = cb.stateId
          left join tblMasterData sub
            on sub.id = s.subTypeId
           and sub.masterListName = 'tblSubtypeCompany'
        `,
          whereCondition: `cb.id = ${shipperId}`,
          clientIdCondition: `cb.status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
        };

        const response = await fetchReportData(requestObj);
        if (cancelled) return;

        const row = response?.data?.[0] || null;

        setNewState((prev) => ({
          ...(prev || {}),
          shipperAddress: row?.address ?? null,
          shipperReferenceNo: row?.refNo ?? null,
          shipperReferenceDate: row?.date ?? null,
          branchSrNo: row?.branchSrNo ?? null,
          exporterStateId: row?.stateId ?? null,
          shipperType: row?.subTypeId ?? null,
        }));
      } catch (err) {
        if (!cancelled) console.error("fetchReportData (shipper) error:", err);
      }
    })();
    (async () => {
      if (!bankName) {
        prevDbkBankIdRef.current = null;
        setNewState((prev) => ({
          ...(prev || {}),
          dbkAccountNo: null,
          dbkEdiAccountNo: null,
          dbkPortId: null,
          dbkIFSCCode: null,
          adCode: null,
        }));
        return;
      }
      if (prevDbkBankIdRef.current === bankName) return;
      prevDbkBankIdRef.current = bankName;
      try {
        const requestObj = {
          columns: `b.id,b.bankName,b.adCode,b.dbkAccountNo,b.dbkEDIAccountNo,b.dbkPortId,b.dbkIFSCCode`,
          tableName: `tblCompanyBranchBank b`,
          whereCondition: `b.id = ${bankName}`,
          clientIdCondition: `b.status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
        };

        const response = await fetchReportData(requestObj);
        if (cancelled) return;

        const row = response?.data?.[0] || null;

        setNewState((prev) => ({
          ...(prev || {}),
          dbkAccountNo: row?.dbkAccountNo ?? null,
          dbkEdiAccountNo: row?.dbkEDIAccountNo ?? null,
          dbkPortId: row?.dbkPortId ?? null,
          dbkIFSCCode: row?.dbkIFSCCode ?? null,
          adCode: row?.adCode ?? null,
        }));
      } catch (err) {
        if (!cancelled) console.error("fetchReportData (dbkBank) error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [newState?.shipperBranchId, newState?.dbkBank, setNewState]);

  // useEffect(() => {
  //   if (newState?.isGrWaived == null) return;

  //   const isWaived =
  //     newState.isGrWaived === true || newState.isGrWaived === "true";

  //   if (isWaived) {
  //     setParentsFields(parentsFieldsDataOnGrCheckBox);
  //     setNewState((prev) => ({ ...prev, grNo: null, grDate: null }));
  //   } else {
  //     setParentsFields(parentsFieldsData);
  //     setNewState((prev) => ({ ...prev, rbiWaiverNo: null, rbiWaiverDate: null }));
  //   }
  // }, [newState?.isGrWaived]);


  useEffect(() => {
  if (newState?.isGrWaived == null) return;

  const isWaived =
    newState.isGrWaived === true || newState.isGrWaived === "true";

  const updatedFields = { ...parentsFieldsData };

  Object.keys(updatedFields).forEach((section) => {
    updatedFields[section] = updatedFields[section].map((field) => {
      if (field.fieldname === "grNo" || field.fieldname === "grDate") {
        return {
          ...field,
          isEditable: !isWaived,
        };
      }

      if (
        field.fieldname === "rbiWaiverNo" ||
        field.fieldname === "rbiWaiverDate"
      ) {
        return {
          ...field,
          isEditable: isWaived,
        };
      }

      return field;
    });
  });

  setParentsFields(updatedFields);

  if (isWaived) {
    setNewState((prev) => ({
      ...prev,
      grNo: null,
      grDate: null,
    }));
  } else {
    setNewState((prev) => ({
      ...prev,
      rbiWaiverNo: null,
      rbiWaiverDate: null,
    }));
  }
}, [newState?.isGrWaived]);


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

  const searchParams = useSearchParams();

  // ✅ Prefer URL id/mode (stable) — NOT newState.id
  const recordId = searchParams.get("id");           // change key if your param name differs
  const mode = (searchParams.get("mode") || "").toLowerCase(); // optional

  const isAddMode = useMemo(() => {
    // If you have mode, use it. Otherwise fallback to id.
    if (mode) return mode === "add";
    return !recordId; // add when there is no id
  }, [mode, recordId]);

  const didSetDocUserOnce = useRef(false);

  useEffect(() => {
    // ✅ Only in Add
    if (!isAddMode) return;

    // ✅ only once (prevents re-run when state changes)
    if (didSetDocUserOnce.current) return;

    const loginUserId = userData?.[0]?.id ?? null;
    if (!loginUserId) return;

    setNewState((prev) => {
      // ✅ do not overwrite if already set (user selected manually)
      if (prev?.docUserId) return prev;

      return {
        ...(prev || {}),
        docUserId: loginUserId,
      };
    });

    didSetDocUserOnce.current = true;
  }, [isAddMode, userData, setNewState]);
  const handleFieldValuesChange2 = async (
    updatedValues,
    field,
    formControlData,
  ) => {
    try {
      if (typeof getCopyData !== "function") return;

      const menuID = uriDecodedMenu?.id;
      const requestData = {
        id: updatedValues?.copyMappingName,
        filterValue: Array.isArray(field) ? field[field.length - 1] : field,
        menuID,
      };

      const getCopyDetails = await getCopyData(requestData);
      if (!getCopyDetails?.success) {
        if (typeof toast !== "undefined" && toast?.error)
          toast.error(getCopyDetails?.Message);
        return;
      }
    } catch (error) {
      console.error("Fetch Error :", error);
    }
  };

  return (
    <>
      <div
        className={`w-full p-1 ${styles.pageBackground} overflow-y-auto overflow-x-hidden ${styles.thinScrollBar}`}
        style={{ height: "calc(100vh - 24vh)" }}
      >
        {Object.keys(parentsFields || {}).map((section, index) => (
          <React.Fragment key={`${section}-${index}`}>
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
        ))}

        {childsFields.map((section, index) => (
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
              // getLabelValue
              getLabelValue={getLabelValue}
            />
          </div>
        ))}

        <div className="flex justify-end p-2">
          <ButtonPanel
            buttonsData={[
              { buttonName: "Next", functionOnClick: "handelSave", id: 5975 },
            ]}
            handleButtonClick={{
              handelSave: async () => {
                const allFields = Object.values(parentsFields || {}).flat();

                const requiredMissing = allFields
                  .filter((el) => el?.isRequired)
                  .filter((el) => {
                    const v = newState?.[el.fieldname];
                    if (v === null || v === undefined) return true;
                    if (typeof v === "string") return v.trim() === "";
                    if (Array.isArray(v)) return v.length === 0;
                    return false;
                  });

                if (requiredMissing.length > 0) {
                  toast.error(
                    `Please fill the required fields: ${requiredMissing
                      .map((el) => el?.yourlabel || el?.fieldname)
                      .join(", ")}`
                  );
                  return;
                }

                let finalPayload = {};
                for (const el of allFields) {
                  finalPayload[el.fieldname] = newState?.[el.fieldname];
                }

                const res = await commanPostService({
                  url: "/api/master/saveJsonToDB",
                  data: {
                    jsonData: finalPayload,
                    tableName: "tblJob",
                    formId: newState?.id || null,
                    parentColumnName: "jobId",
                  },
                });
              },
            }}
          />
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

  const ButtonData = [
    {
      buttonName: "Next",
      functionOnClick: "handelSave",
      id: 5975,
    },
  ];

  const handleButtonClick = {
    handelSave: () => {
      const allFields = Object.values(parentsFields || {}).flat();
      const requiredMissing = allFields
        .filter((element) => element?.isRequired)
        .filter((element) => {
          const value = newState?.[element.fieldname];
          if (value === null || value === undefined) return true;
          if (typeof value === "string") return value.trim() === "";
          if (Array.isArray(value)) return value.length === 0;
          return false;
        });

      if (requiredMissing.length > 0) {
        const missingLabels = requiredMissing.map(
          (element) => element?.yourlabel || element?.fieldname,
        );

        toast.error(
          `Please fill the required fields: ${missingLabels.join(", ")}`,
        );

        return;
      }
      let finalPayload = {};
      for (const element of allFields) {
        finalPayload[element.fieldname] = newState?.[element.fieldname];
      }

      commanPostService({
        url: "/api/master/saveJsonToDB",
        data: {
          jsonData: finalPayload,
          tableName: "tblJob",
          formId: newState?.id || null,
          parentColumnName: "jobId",
        },
      }).then((response) => {
        console.log("Response from commanPostService:", response);
      });
    },
  };
  useEffect(() => {
    setIsParentAccordionOpen(expandAll);
  }, [expandAll]);

  useEffect(() => {
    setFieldId(hideColumnsId || []);
  }, [hideColumnsId]);

  function handleChangeFunction(result) {
    if (result?.isCheck === false) {
      if (result?.alertShow) {
        setParaText(result?.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
        setClearFlag({ isClear: true, fieldName: result?.fieldName });
      }
      return;
    }
    const data = { ...(result?.newState || {}) };
    setNewState((pre) => ({ ...(pre || {}), ...data }));
    setSubmitNewState((pre) => ({ ...(pre || {}), ...data }));
  }

  function handleBlurFunction(result) {
    if (result?.isCheck === false) {
      if (result?.alertShow) {
        setParaText(result?.message);
        setIsError(true);
        setOpenModal((prev) => !prev);
        setTypeofModal("onCheck");
      }
      return;
    }
    const data = { ...(result?.newState || {}) };
    setNewState((pre) => ({ ...(pre || {}), ...data }));
    setSubmitNewState((pre) => ({ ...(pre || {}), ...data }));
  }

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
          {section === "Container" ? (
            <>
            </>
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
      {/* <div className="flex justify-end">
        <ButtonPanel
          buttonsData={ButtonData}
          handleButtonClick={handleButtonClick}
        />
      </div> */}
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

  // for scrolling table
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
            feild.fieldname
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
        }
      } catch (error) {
        return toast.error(error.message);
      }
      const tmpData = { ...newState };
      const subChild = section?.subChild?.reduce((obj, item) => {
        obj[item.tableName] = [];
        return obj;
      }, {});
      Object.assign(subChild, Data);
      if (hasBlackValues(subChild)) {
        return;
      }
      tmpData["tblJobContainer"].push({
        ...subChild,
        isChecked: true,
        indexValue: tmpData["tblJobContainer"].length,
      });
      setNewState(tmpData);
      setSubmitNewState(tmpData);
      setOriginalData(tmpData);
      setRenderedData(newState?.tblJobContainer);
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

  const calculateTotalVolumeAndWeight = () => {
    if (!newState || !Array.isArray(newState.tblRateRequestQty)) {
      return newState;
    }

    let totalVolume = 0;
    let totalVolumeWt = 0;
    let totalNoPackage = 0;

    newState.tblRateRequestQty.forEach((row) => {
      const volume = parseFloat(row.volume) || 0;
      const volumeWt = parseFloat(row.volumeWt) || 0;
      const noPackage = parseFloat(row.noOfPackages) || 0;
      totalVolume += volume;
      totalVolumeWt += volumeWt;
      totalNoPackage += noPackage;
    });

    setNewState((prevState) => ({
      ...prevState,
      volume: totalVolume,
      volumeWt: totalVolumeWt,
      noOfPackages: totalNoPackage,
    }));
  };

  useEffect(() => {
    calculateTotalVolumeAndWeight();
  }, [newState.tblRateRequestQty]);

  const calculateTotalNoOfPackages = () => {
    if (!newState || !Array.isArray(newState.tblJobContainer)) {
      return newState;
    }

    const toNum = (v) =>
      v == null || v === "" ? 0 : Number(String(v).replace(/,/g, "")) || 0;

    let totalNoPackages = 0;

    newState.tblJobContainer.forEach((row) => {
      totalNoPackages += toNum(row?.noOfPackages);
    });

    setNewState((prevState) => {
      const targetKey = Object.prototype.hasOwnProperty.call(prevState, "noOfpackages")
        ? "noOfpackages"
        : "noOfPackages";
      if (toNum(prevState?.[targetKey]) === totalNoPackages) return prevState;

      return {
        ...prevState,
        [targetKey]: totalNoPackages,
      };
    });
  };


  useEffect(() => {
    calculateTotalNoOfPackages();
  }, [newState.tblJobContainer]);
  const calculateTotalGrossWeight = () => {
    if (!newState || !Array.isArray(newState.tblJobContainer)) {
      return newState;
    }

    let totalGrossWt = 0;

    newState.tblJobContainer.forEach((row) => {
      const cargoWt = parseFloat(row.grossWt) || 0;
      totalGrossWt += cargoWt;
    });

    setNewState((prevState) => ({
      ...prevState,
      cargoWt: totalGrossWt,
    }));
  };

  useEffect(() => {
    calculateTotalGrossWeight();
  }, [newState.tblJobContainer]);

  const calculateTotalGrossWeightBl = () => {
    if (!newState || !Array.isArray(newState.tblBlContainer)) {
      return newState;
    }

    let totalGrossWt = 0;

    newState.tblBlContainer.forEach((row) => {
      const grossWts = parseFloat(row.grossWt) || 0;
      totalGrossWt += grossWts;
    });

    setNewState((prevState) => ({
      ...prevState,
      grossWt: totalGrossWt,
    }));
  };

  useEffect(() => {
    calculateTotalGrossWeightBl();
  }, [newState.tblBlContainer]);

  useEffect(() => {
    setRenderedData(newState?.tblJobContainer?.slice(0, 10));
    calculateTotalForRow(newState?.tblJobContainer);
    if (
      newState?.tblJobContainer &&
      newState?.tblJobContainer.length > 0
    ) {
      setClickCount(1);
    }
  }, [newState]);

  const renderMoreData = () => {
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
            (_, idx) => idx !== index
          );
          newStateCopy[section.tableName] = updatedData;

          if (updatedData.length === 0) {
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
          }
          return newStateCopy;
        });
        setOriginalData((prevState) => {
          const newStateCopy = { ...prevState };
          const updatedData = newStateCopy["tblJobContainer"]?.filter(
            (_, idx) => idx !== index
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
          (_, idx) => idx !== index
        );
        newStateCopy[section.tableName] = updatedData;

        if (updatedData.length === 0) {
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
        }
        return newStateCopy;
      });
      setOriginalData((prevState) => {
        const newStateCopy = { ...prevState };
        const updatedData = newStateCopy["tblJobContainer"]?.filter(
          (_, idx) => idx !== index
        );
        newStateCopy[section.tableName] = updatedData;
        if (updatedData?.length === 0) {
        }
        return newStateCopy;
      });
      return toast.error(error.message);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const removeChildRecordFromInsert = (id, index) => {
    setSubmitNewState((prevState) => {
      const newStateCopy = { ...newState, ...prevState };
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index
      );
      updatedData = { ...updatedData[0], isChecked: false };
      newStateCopy[section.tableName][index] = updatedData;
      return newStateCopy;
    });
    setNewState((prevState) => {
      const newStateCopy = { ...prevState };
      let updatedData = newStateCopy[section.tableName].filter(
        (_, idx) => idx === index
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
                    // inputFieldsVisible == false &&
                    //   setInputFieldsVisible(
                    //     (prev) => !prev
                    //   );
                    calculateTotalVolumeAndWeight();
                    calculateTotalGrossWeight();
                    calculateTotalGrossWeightBl();
                  }}
                  //
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
                      calculateTotalGrossWeight();
                      calculateTotalVolumeAndWeight();
                      calculateTotalGrossWeightBl();
                      calculateTotalNoOfPackages();
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
                          newState["tblJobContainer"]?.length > 10
                            ? "290px"
                            : "auto",
                        overflowY:
                          newState["tblJobContainer"]?.length > 10
                            ? "auto"
                            : "hidden",
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
                                      section.fields
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
                                      activeColumn === field.fieldname && (
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

// const parentsFieldsDataOnGrCheckBox = {
//   "Job Details": [
//     {
//       id: 1001,
//       fieldname: "shipperId",
//       yourlabel: "Exporter",
//       controlname: "dropdown",
//       type: 6902,
//       typeValue: "number",
//       ordering: 1,
//       isControlShow: true,
//       isSwitchToText: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: true,
//       sectionHeader: "General",
//       sectionOrder: 1,
//       referenceColumn: "name",
//       referenceTable: "tblCompany",
//     },
//     {
//       id: 1001,
//       fieldname: "shipperBranchId",
//       yourlabel: "Exporter Branch",
//       controlname: "dropdown",
//       type: 6902,
//       typeValue: "number",
//       ordering: 1,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//       referenceColumn: "name",
//       referenceTable: "tblCompanyBranch",
//       dropdownFilter: "and companyId = ${newState.shipperId}",
//     },
//     {
//       id: 1002,
//       fieldname: "shipperAddress",
//       yourlabel: "Address",
//       controlname: "textarea",
//       type: 6902,
//       typeValue: "string",
//       ordering: 1.01,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: false,
//       isRequired: false,
//       isEditableMode: "e",
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1003,
//       fieldname: "branchSrNo",
//       yourlabel: "Branch SrNo",
//       controlname: "number",
//       type: 6902,
//       typeValue: "number",
//       ordering: 1.02,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: false,
//       isRequired: false,
//       isEditableMode: "e",
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1004,
//       fieldname: "exporterStateId",
//       yourlabel: "Exporter State",
//       controlname: "dropdown",
//       referenceTable: "tblState",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       ordering: 1.03,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: false,
//       isRequired: false,
//       isEditableMode: "e",
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1001,
//       fieldname: "shipperType",
//       yourlabel: "Exporter Type",
//       controlname: "dropdown",
//       type: 6902,
//       typeValue: "number",
//       ordering: 1,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: false,
//       isRequired: false,
//       isEditableMode: "e",
//       sectionHeader: "General",
//       sectionOrder: 1,
//       referenceColumn: "name",
//       referenceTable: "tblMasterData",
//       dropdownFilter:
//         "and id in (select id from tblMasterData where masterListName='tblSubtypeCompany')",
//     },
//     {
//       id: 1015,
//       fieldname: "shipperRefNo",
//       yourlabel: "Exporter Ref No",
//       controlname: "text",
//       type: 6902,
//       typeValue: "string",
//       ordering: 1.1,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1016,
//       fieldname: "shipperRefDate",
//       yourlabel: "Exporter Ref Date",
//       controlname: "date",
//       type: 6783,
//       typeValue: "date",
//       ordering: 1.2,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1034,
//       fieldname: "rateRequestId",
//       yourlabel: "Quotation",
//       controlname: "dropdown",
//       referenceTable: "tblRateRequest",
//       referenceColumn: "rateRequestNo",
//       type: 6653,
//       typeValue: "number",
//       ordering: 1.5,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1018,
//       fieldname: "sbNo",
//       yourlabel: "SB Number",
//       controlname: "text",
//       type: 6902,
//       typeValue: "string",
//       ordering: 2.1,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1019,
//       fieldname: "sbDate",
//       yourlabel: "SB Date",
//       controlname: "date",
//       type: 6783,
//       typeValue: "date",
//       ordering: 2.2,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1020,
//       fieldname: "rbiApprovalNo",
//       yourlabel: "RBI Appr. No",
//       controlname: "text",
//       type: 6902,
//       typeValue: "string",
//       ordering: 2.3,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
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
//       id: 1021,
//       fieldname: "rbiApprovalDate",
//       yourlabel: "RBI Appr. Date",
//       controlname: "date",
//       type: 6783,
//       typeValue: "date",
//       ordering: 2.4,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },

//     {
//       id: 1022,
//       fieldname: "isGrWaived",
//       yourlabel: "GR Waived",
//       controlname: "checkbox",
//       type: 6902,
//       typeValue: "boolean",
//       ordering: 4.1,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1023,
//       fieldname: "grNo",
//       yourlabel: "GR No",
//       controlname: "text",
//       type: 6902,
//       typeValue: "string",
//       ordering: 4.2,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: false,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
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
//       id: 1024,
//       fieldname: "grDate",
//       yourlabel: "GR Date",
//       controlname: "date",
//       type: 6783,
//       typeValue: "date",
//       ordering: 4.3,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: false,
//       isEditableMode: "b",
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1005,
//       fieldname: "iecCode",
//       yourlabel: "IE Code No",
//       controlname: "text",
//       type: 6902,
//       typeValue: "string",
//       ordering: 5,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1006,
//       fieldname: "registrationNo",
//       yourlabel: "Regn. No",
//       controlname: "text",
//       referenceTable: "tblRegistration",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       ordering: 6,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1025,
//       fieldname: "rbiWaiverNo",
//       yourlabel: "RBI Waiver No",
//       controlname: "text",
//       type: 6902,
//       typeValue: "string",
//       ordering: 25,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
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
//       id: 1026,
//       fieldname: "rbiWaiverDate",
//       yourlabel: "RBI Waiver Date",
//       controlname: "date",
//       type: 6783,
//       typeValue: "date",
//       ordering: 26,
//       isControlShow: true,
//       isGridView: false,
//       isRequired: false,
//       isEditable: true,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1007,
//       fieldname: "dbkBank",
//       yourlabel: "DBK Bank",
//       controlname: "dropdown",
//       referenceTable: "tblCompanyBranchBank",
//       referenceColumn: "bankName",
//       type: 6653,
//       typeValue: "number",
//       ordering: 7,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1008,
//       fieldname: "dbkAccountNo",
//       yourlabel: "DBK A/c.",
//       controlname: "number",
//       // referenceColumn: "dbkAccountNo",
//       type: 6902,
//       typeValue: "number",
//       ordering: 8,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1009,
//       fieldname: "dbkEdiAccountNo",
//       yourlabel: "DBK EDI A/c.",
//       controlname: "number",
//       // referenceColumn: "dbkEDIAccountNo",
//       type: 6902,
//       typeValue: "number",
//       ordering: 9,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1027,
//       fieldname: "bankDealerName",
//       yourlabel: "Bank / Dealer",
//       controlname: "textarea",
//       type: 6902,
//       typeValue: "string",
//       ordering: 9.1,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1028,
//       fieldname: "accountNo",
//       yourlabel: "A/C Number",
//       controlname: "number",
//       type: 6902,
//       typeValue: "number",
//       ordering: 9.2,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1029,
//       fieldname: "adCode",
//       yourlabel: "AD Code",
//       controlname: "text",
//       type: 6902,
//       typeValue: "string",
//       ordering: 9.3,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1010,
//       fieldname: "consigneeId",
//       yourlabel: "Consignee",
//       controlname: "dropdown",
//       referenceTable: "tblCompany",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       ordering: 10,
//       isControlShow: true,
//       isSwitchToText: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1010,
//       fieldname: "consigneeBranchId",
//       yourlabel: "Consignee Branch",
//       controlname: "dropdown",
//       referenceTable: "tblCompanyBranch",
//       dropdownFilter: "and companyId = ${newState.consigneeId}",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       ordering: 10,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1011,
//       fieldname: "consigneeAddress",
//       yourlabel: "Consignee Address",
//       controlname: "textarea",
//       type: 6902,
//       typeValue: "string",
//       ordering: 11,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1012,
//       fieldname: "consigneeCountry",
//       yourlabel: "Consignee Country",
//       controlname: "dropdown",
//       referenceTable: "tblCountry",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       ordering: 12,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1012,
//       fieldname: "plrId",
//       yourlabel: "PLR",
//       controlname: "dropdown",
//       referenceTable: "tblPort",
//       referenceColumn: "name",
//       dropdownFilter: "and countryId= ${newState.consigneeCountry}",
//       type: 6653,
//       typeValue: "number",
//       ordering: 12,
//       isControlShow: true,
//       isGridView: false,
//       isSwitchToText: true,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1012,
//       fieldname: "polId",
//       yourlabel: "POL",
//       controlname: "dropdown",
//       referenceTable: "tblPort",
//       referenceColumn: "name",
//       dropdownFilter: "and countryId= ${newState.consigneeCountry}",
//       type: 6653,
//       typeValue: "number",
//       ordering: 12,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isSwitchToText: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1012,
//       fieldname: "podId",
//       yourlabel: "POD",
//       controlname: "dropdown",
//       referenceTable: "tblPort",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       ordering: 12,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isSwitchToText: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1012,
//       fieldname: "fpdId",
//       yourlabel: "FPD",
//       controlname: "dropdown",
//       referenceTable: "tblPort",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       ordering: 12,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       isSwitchToText: true,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 1030,
//       fieldname: "epzCode",
//       yourlabel: "EPZ Code",
//       controlname: "text",
//       type: 6902,
//       typeValue: "string",
//       ordering: 13,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1031,
//       fieldname: "notifyPartyId",
//       yourlabel: "Notify",
//       controlname: "dropdown",
//       referenceTable: "tblCompany",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       ordering: 14,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1032,
//       fieldname: "notifyAddress",
//       yourlabel: "Notify Address",
//       controlname: "textarea",
//       type: 6902,
//       typeValue: "string",
//       ordering: 15,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1033,
//       fieldname: "docUserId",
//       yourlabel: "Doc User",
//       controlname: "dropdown",
//       referenceTable: "tblUser",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       ordering: 16,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 2,
//     },
//     {
//       id: 1013,
//       fieldname: "isBuyerDifferent",
//       yourlabel: "Buyer, if other than consignee",
//       controlname: "checkbox",
//       type: 6902,
//       typeValue: "boolean",
//       ordering: 13,
//       isControlShow: true,
//       isGridView: false,
//       isEditable: true,
//       isRequired: false,
//       sectionHeader: "General",
//       sectionOrder: 1,
//     },
//     {
//       id: 123531,
//       fieldname: "businessSegmentId",
//       yourlabel: "Department",
//       controlname: "dropdown",
//       isControlShow: true,
//       isGridView: false,
//       isDataFlow: true,
//       isAuditLog: true,
//       referenceTable: "tblBusinessSegment",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       size: "100",
//       ordering: 1,
//       isRequired: true,
//       isEditable: false,
//       isEditableMode: "e",
//       position: "top",
//       sectionHeader: "Job Details",
//       sectionOrder: 1,
//       isCopy: false,
//       isCopyEditable: false,
//       isHideGrid: false,
//       isHideGridHeader: false,
//       isGridExpandOnLoad: false,
//       clientId: 1,
//       columnsToBeVisible: false,
//     },
//     {
//       id: 123526,
//       fieldname: "jobNo",
//       yourlabel: "Job No",
//       controlname: "text",
//       isControlShow: true,
//       isGridView: true,
//       isDataFlow: true,
//       isAuditLog: true,
//       type: 6902,
//       typeValue: "string",
//       size: "100",
//       ordering: 2,
//       isRequired: false,
//       isEditable: false,
//       isEditableMode: "e",
//       position: "top",
//       sectionHeader: "Job Details",
//       sectionOrder: 1,
//       isCopy: false,
//       isCopyEditable: false,
//       isHideGrid: false,
//       isHideGridHeader: false,
//       isGridExpandOnLoad: false,
//       clientId: 1,
//       columnsToBeVisible: false,
//     },
//     {
//       id: 123527,
//       fieldname: "jobDate",
//       yourlabel: "Job Date",
//       controlname: "date",
//       isControlShow: true,
//       isGridView: true,
//       isDataFlow: true,
//       isAuditLog: true,
//       type: 6783,
//       typeValue: "date",
//       size: "100",
//       ordering: 3,
//       isRequired: true,
//       isEditable: false,
//       isEditableMode: "e",
//       position: "top",
//       controlDefaultValue: "currentdate",
//       sectionHeader: "Job Details",
//       sectionOrder: 1,
//       isCopy: false,
//       isCopyEditable: false,
//       isHideGrid: false,
//       isHideGridHeader: false,
//       isGridExpandOnLoad: false,
//       clientId: 1,
//       columnsToBeVisible: false,
//     },
//     {
//       id: 123532,
//       fieldname: "createdBy",
//       yourlabel: "Created By",
//       controlname: "dropdown",
//       isControlShow: true,
//       isGridView: false,
//       isDataFlow: true,
//       isAuditLog: true,
//       referenceTable: "tblUser",
//       referenceColumn: "name",
//       type: 6653,
//       typeValue: "number",
//       size: "100",
//       ordering: 1,
//       isRequired: true,
//       isEditable: false,
//       isEditableMode: "e",
//       position: "top",
//       sectionHeader: "Job Details",
//       sectionOrder: 1,
//       isCopy: false,
//       isCopyEditable: false,
//       isHideGrid: false,
//       isHideGridHeader: false,
//       isGridExpandOnLoad: false,
//       clientId: 1,
//       columnsToBeVisible: false,
//     },
//   ],
//   "Shipment Main Details": [
//     {
//       "fieldname": "dischargeCountryId",
//       "yourlabel": "Discharge Country",
//       "controlname": "dropdown",
//       "referenceTable": "tblCountry",
//       "referenceColumn": "name",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 1
//     },
//     {
//       "fieldname": "dischargePortId",
//       "yourlabel": "Discharge Port",
//       "controlname": "dropdown",
//       "referenceTable": "tblPort",
//       "referenceColumn": "name",
//       "dropdownFilter": " and countryId = ${newState.dischargeCountryId}",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 1
//     },
//     {
//       "fieldname": "destinationCountryId",
//       "yourlabel": "Destination Country",
//       "controlname": "dropdown",
//       "referenceTable": "tblCountry",
//       "referenceColumn": "name",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 4
//     },
//     {
//       "fieldname": "destinationPortId",
//       "yourlabel": "Destination Port",
//       "controlname": "dropdown",
//       "referenceTable": "tblPort",
//       "referenceColumn": "name",
//       "dropdownFilter": " and countryId = ${newState.destinationCountryId}",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 3
//     },
//     {
//       "fieldname": "natureOfCargoId",
//       "yourlabel": "Nature of Cargo",
//       "controlname": "dropdown",
//       "referenceTable": "tblMasterData",
//       "referenceColumn": "name",
//       "dropdownFilter": "and masterListId in (select id from tblMasterList where name='tblCargoType')",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 16
//     },

//     {
//       "fieldname": "noOfPackages",
//       "yourlabel": "Total No. of Pkgs",
//       "controlname": "number",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 17
//     },
//     {
//       "fieldname": "airlineId",
//       "yourlabel": "Airline",
//       "controlname": "dropdown",
//       "referenceTable": "tblAirline",
//       "referenceColumn": "name",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 5
//     },
//     {
//       "fieldname": "flightNo",
//       "yourlabel": "Flight No",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 6
//     },
//     {
//       "fieldname": "flightDate",
//       "yourlabel": "Flight Date",
//       "controlname": "date",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 6.1
//     },
//     {
//       "fieldname": "egmNo",
//       "yourlabel": "EGM No",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 7
//     },
//     {
//       "fieldname": "egmDate",
//       "yourlabel": "EGM Date",
//       "controlname": "date",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 7.1
//     },
//     {
//       "fieldname": "mawbNo",
//       "yourlabel": "MAWB No",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 8
//     },
//     {
//       "fieldname": "mawbDate",
//       "yourlabel": "MAWB Date",
//       "controlname": "date",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 8.1
//     },
//     {
//       "fieldname": "hawbNo",
//       "yourlabel": "HAWB No",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 9
//     },
//     {
//       "fieldname": "hawbDate",
//       "yourlabel": "HAWB Date",
//       "controlname": "date",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 9.1
//     },
//     {
//       "fieldname": "preCarriageBy",
//       "yourlabel": "Pre-Carriage by",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 10
//     },
//     {
//       "fieldname": "placeOfReceipt",
//       "yourlabel": "Place of Receipt",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 11
//     },
//     {
//       "fieldname": "transhipperCode",
//       "yourlabel": "Transhipper Code",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 12
//     },
//     {
//       "fieldname": "gatewayPortId",
//       "yourlabel": "Gateway Port",
//       "controlname": "dropdown",
//       "referenceTable": "tblPort",
//       "referenceColumn": "name",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 13
//     },
//     {
//       "fieldname": "stateOfOriginId",
//       "yourlabel": "State Of Origin",
//       "controlname": "dropdown",
//       "referenceTable": "tblState",
//       "referenceColumn": "name",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 14
//     },
//     {
//       "fieldname": "isAnnexureCFiledWithAnnexureA",
//       "yourlabel": "Annexure-C Details being filed with Annexure-A",
//       "controlname": "checkbox",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 15
//     },

//     {
//       "fieldname": "loosePkgs",
//       "yourlabel": "Loose Pkgs",
//       "controlname": "number",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 18
//     },
//     {
//       "fieldname": "pktsInMawb",
//       "yourlabel": "Pkts in MAWB",
//       "controlname": "number",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 19
//     },
//     {
//       "fieldname": "grossWeight",
//       "yourlabel": "Gross Weight",
//       "controlname": "number",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 20
//     },
//     {
//       "fieldname": "netWeight",
//       "yourlabel": "Net Weight",
//       "controlname": "number",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 21
//     },
//     {
//       "fieldname": "volume",
//       "yourlabel": "Volume",
//       "controlname": "number",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 22
//     },
//     {
//       "fieldname": "chargeableWt",
//       "yourlabel": "Chargeable Weight",
//       "controlname": "number",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 23
//     },
//     {
//       "fieldname": "marksNos",
//       "yourlabel": "Marks & Nos",
//       "controlname": "textarea",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 24
//     }
//   ],
//   "Shipment Stuffing Details": [
//     {
//       "fieldname": "goodsStuffedAtId",
//       "yourlabel": "Goods Stuffed At",
//       "controlname": "dropdown",
//       "referenceTable": "tblMasterData",
//       "referenceColumn": "name",
//       "dropdownFilter": "and masterListId in (select id from tblMasterList where name = 'tblGoodsStuffedAt')",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 1
//     },
//     {
//       "fieldname": "isSampleAccompanied",
//       "yourlabel": "Sample Accompanied",
//       "controlname": "checkbox",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 2
//     },
//     {
//       "fieldname": "cfsId",
//       "yourlabel": "CFS",
//       "controlname": "dropdown",
//       "referenceTable": "tblCfsIcdTerminal",
//       "referenceColumn": "name",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 3
//     },
//     {
//       "fieldname": "factoryAddress",
//       "yourlabel": "Factory Address",
//       "controlname": "textarea",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 4
//     },
//     {
//       "fieldname": "warehouseCode",
//       "yourlabel": "Warehouse Code (of CFS/ICD/Terminal)",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 5
//     },
//     {
//       "fieldname": "sealTypeId",
//       "yourlabel": "Seal Type",
//       "controlname": "dropdown",
//       "referenceTable": "tblMasterData",
//       "referenceColumn": "name",
//       "dropdownFilter": "and masterListId in (select id from tblMasterList where name = 'tblSealType')",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 6
//     },
//     {
//       "fieldname": "sealNo",
//       "yourlabel": "Seal No",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 7
//     },
//     {
//       "fieldname": "agencyName",
//       "yourlabel": "Agency Name",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 8
//     }
//   ],
//   "Shipment Invoice Printing": [
//     {
//       "fieldname": "buyersOrderNo",
//       "yourlabel": "Buyer's Order No",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 1
//     },
//     {
//       "fieldname": "otherReferences",
//       "yourlabel": "Other References",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 2
//     },
//     {
//       "fieldname": "termsOfDeliveryAndPayment",
//       "yourlabel": "Terms of Delivery and Payment",
//       "controlname": "textarea",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 3
//     },
//     {
//       "fieldname": "originCountryId",
//       "yourlabel": "Origin Country",
//       "controlname": "dropdown",
//       "referenceTable": "tblCountry",
//       "referenceColumn": "name",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": false,
//       "isBreak": false,
//       "ordering": 4
//     },
//     {
//       "fieldname": "invoiceHeader",
//       "yourlabel": "Invoice Header",
//       "controlname": "textarea",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 5
//     }
//   ],
//   "Shipment Shipping bill Printing": [
//     {
//       "fieldname": "qCertNo",
//       "yourlabel": "Q/Cert. No.",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 1
//     },
//     {
//       "fieldname": "qCertDate",
//       "yourlabel": "Q/Cert. Date",
//       "controlname": "date",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 1
//     },
//     {
//       "fieldname": "exportTradeControl",
//       "yourlabel": "Export Trade Control",
//       "controlname": "textarea",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 2
//     },
//     {
//       "fieldname": "typeOfShipmentId",
//       "yourlabel": "Type of Shipment",
//       "controlname": "dropdown",
//       "referenceTable": "tblMasterData",
//       "referenceColumn": "name",
//       "dropdownFilter": "and masterListId in (select id from tblMasterList where name = 'tblTypeOfShipment')",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 3
//     },
//     {
//       "fieldname": "shipmentTypeOther",
//       "yourlabel": "Specify, if Other",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 4
//     },
//     {
//       "fieldname": "permissionNoDate",
//       "yourlabel": "Permission No. & Date",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 5
//     },
//     {
//       "fieldname": "exportUnderId",
//       "yourlabel": "Export Under",
//       "controlname": "dropdown",
//       "referenceTable": "tblMasterData",
//       "referenceColumn": "name",
//       "dropdownFilter": "and masterListId in (select id from tblMasterList where name = 'tblExportUnder')",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 6
//     },
//     {
//       "fieldname": "sbHeading",
//       "yourlabel": "S/B Heading",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 7
//     },
//     {
//       "fieldname": "sbBottomText",
//       "yourlabel": "Text to be printed on S/B bottom area",
//       "controlname": "textarea",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": true,
//       "ordering": 8
//     }
//   ],
//   "Shipment Annex C1 Details": [
//     {
//       "fieldname": "ieCodeOfEou",
//       "yourlabel": "IE Code Of EOU",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 1
//     },
//     {
//       "fieldname": "branchSlNo",
//       "yourlabel": "Branch Sl. No.",
//       "controlname": "number",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 2
//     },
//     {
//       "fieldname": "examinationDate",
//       "yourlabel": "Examination Date",
//       "controlname": "date",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 3
//     },
//     {
//       "fieldname": "examiningOfficer",
//       "yourlabel": "Examining Officer",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 4
//     },
//     {
//       "fieldname": "examiningOfficerDesignation",
//       "yourlabel": "Designation",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 5
//     },
//     {
//       "fieldname": "supervisingOfficer",
//       "yourlabel": "Supervising Officer",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 6
//     },
//     {
//       "fieldname": "supervisingOfficerDesignation",
//       "yourlabel": "Designation",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 7
//     },
//     {
//       "fieldname": "commissionerate",
//       "yourlabel": "Commissionerate",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 8
//     },
//     {
//       "fieldname": "division",
//       "yourlabel": "Division",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 9
//     },
//     {
//       "fieldname": "range",
//       "yourlabel": "Range",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 10
//     },
//     {
//       "fieldname": "verifiedByExaminingOfficer",
//       "yourlabel": "Verified by Examining Officer",
//       "controlname": "checkbox",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 11
//     },
//     {
//       "fieldname": "sampleForwarded",
//       "yourlabel": "Sample Forwarded",
//       "controlname": "checkbox",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": false,
//       "ordering": 12
//     },
//     {
//       "fieldname": "sealNumber",
//       "yourlabel": "Seal Number",
//       "controlname": "text",
//       "referenceTable": "",
//       "referenceColumn": "",
//       "dropdownFilter": "",
//       "isControlShow": true,
//       "isGridView": false,
//       "isDataFlow": true,
//       "isRequired": false,
//       "isEditable": true,
//       "isBreak": true,
//       "ordering": 13
//     }
//   ],
// };