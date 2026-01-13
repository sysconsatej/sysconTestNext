"use client";
/* eslint-disable */
import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { MenuItem } from "@mui/material";
import {
  fetchReportData,
  dynamicDropDownFieldsData,
  getContainerData,
  editLastActivity
} from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
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
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import { toast, ToastContainer } from "react-toastify";
import { areObjectsEqual, hasBlackValues } from "@/helper/checkValue";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import RowComponent from "@/app/(groupControl)/formControl/addEdit/RowComponent";
import { getContainerActivity } from "@/services/auth/FormControl.services";
import { fontFamilyStyles } from "@/app/globalCss";
export default function AccordionUsage() {
  const [nextActOptions, setNextActOptions] = React.useState([]);
  const [agentOptions, setAgentOptions] = React.useState([]);
  const [agentBranchOptions, setAgentBranchOptions] = React.useState([]);
  const [locationOptions, setLocationOptions] = React.useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const params = new URLSearchParams(window.location.search);
  const id = params.get("recordId");
  const [controller, setController] = useState(null);
  const [isNextPageNull, setIsNextPageNull] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isFocused, setIsFocused] = useState(false);
  const { clientId } = getUserDetails();
  const menuId = true;
  const [containerNo, setContainerNos] = useState("");
  const [bookingNo, setBookingNo] = useState("");
  const [blNo, setBlNo] = useState("");
  const { companyId, branchId, userId, financialYear } = getUserDetails();
  const [childsFields, setChildsFields] = useState([
    {
      id: 1614,
      formName: "Container Activity",
      childHeading: "Container",
      tableName: "tblContainerMovement",
      isAttachmentRequired: "true",
      isCopyForSameTable: "true",
      functionOnLoad: null,
      functionOnSubmit: "copyContainerData(activityId,activityDate,toLocationId)",
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
          id: 15768,
          fieldname: "containerNo",
          yourlabel: "Container No",
          controlname: "dropdown",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblContainer",
          hyperlinkValue: null,
          referenceColumn: "containerNo",
          type: 6653,
          typeValue: "number",
          size: "100",
          ordering: 1,
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
          isEditableMode: "b",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15767,
          fieldname: "lastActivity",
          yourlabel: "Last Activity",
          controlname: "string",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: null,
          hyperlinkValue: null,
          referenceColumn: null,
          type: 6902,
          typeValue: "string",
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
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "e",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15770,
          fieldname: "lastActivityDate",
          yourlabel: "Last Activity Date",
          controlname: "date",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: null,
          hyperlinkValue: null,
          referenceColumn: null,
          type: 6783,
          typeValue: "date",
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
          isEditableMode: "b",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "activityId",
          yourlabel: "Next Activity",
          controlname: "dropdown",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblContainerActivity",
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
          dropdownFilter: `and id in (select id from fn_containerNextActivities(${'${values.containerNo}'},${companyId},${branchId},${financialYear},${userId},${clientId}))`,
          controlDefaultValue: null,
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "e",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15770,
          fieldname: "activityDate",
          yourlabel: "Next Activity Date",
          controlname: "datetime",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: null,
          hyperlinkValue: null,
          referenceColumn: null,
          type: 6783,
          typeValue: "date",
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
          isEditableMode: "e",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "agentId",
          yourlabel: "Agent Name",
          controlname: "dropdown",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblCompany",
          hyperlinkValue: null,
          referenceColumn: "name",
          type: 6653,
          typeValue: "number",
          size: "100",
          ordering: 1,
          gridTotal: false,
          gridTypeTotal: null,
          toolTipMessage: null,
          isRequired: true,
          isEditable: true,
          isSwitchToText: false,
          isBreak: false,
          dropdownFilter: null,
          controlDefaultValue: null,
          functionOnChange: "setBranchForContainerMovement(agentId);",
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "e",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "agentBranchId",
          yourlabel: "Agent Branch",
          controlname: "dropdown",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblCompanyBranch",
          hyperlinkValue: null,
          referenceColumn: "name",
          type: 6653,
          typeValue: "number",
          size: "100",
          ordering: 1,
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
          isEditableMode: "e",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "fromLocationId",
          yourlabel: "From Location",
          controlname: "dropdown",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblPort",
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
          isEditable: false,
          isSwitchToText: false,
          isBreak: false,
          dropdownFilter: null,
          controlDefaultValue: null,
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "b",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "toLocationId",
          yourlabel: "To Location",
          controlname: "dropdown",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblPort",
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
          controlDefaultValue: null,
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "e",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15767,
          fieldname: "remarks",
          yourlabel: "Remarks",
          controlname: "string",
          isControlShow: true,
          isGridView: true,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: null,
          hyperlinkValue: null,
          referenceColumn: null,
          type: 6902,
          typeValue: "string",
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
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "e",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "jobId",
          yourlabel: "Job No",
          controlname: "dropdown",
          isControlShow: false,
          isGridView: false,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblJob",
          hyperlinkValue: null,
          referenceColumn: "jobNo",
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
          controlDefaultValue: null,
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "b",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "importBlId",
          yourlabel: "Import Bl",
          controlname: "dropdown",
          isControlShow: false,
          isGridView: false,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblBl",
          hyperlinkValue: null,
          referenceColumn: "mblNo",
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
          controlDefaultValue: null,
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "b",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "exportBlId",
          yourlabel: "Export Bl",
          controlname: "dropdown",
          isControlShow: false,
          isGridView: false,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblBl",
          hyperlinkValue: null,
          referenceColumn: "mblNo",
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
          controlDefaultValue: null,
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "b",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 3,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "vesselId",
          yourlabel: "Vessel",
          controlname: "dropdown",
          isControlShow: false,
          isGridView: false,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblVessel",
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
          controlDefaultValue: null,
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "b",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 13,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
        {
          id: 15768,
          fieldname: "voyageId",
          yourlabel: "voyage",
          controlname: "dropdown",
          isControlShow: false,
          isGridView: false,
          isDataFlow: null,
          copyMappingName: null,
          isCommaSeparatedOrCount: null,
          isAuditLog: null,
          keyToShowOnGrid: null,
          isDummy: false,
          dropDownValues: null,
          referenceTable: "tblVoyage",
          hyperlinkValue: null,
          referenceColumn: "voyageNo",
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
          controlDefaultValue: null,
          functionOnChange: null,
          functionOnBlur: null,
          functionOnKeyPress: null,
          isEditableMode: "b",
          sectionHeader: "container",
          sectionOrder: 1,
          isCopy: null,
          isCopyEditable: null,
          position: "top",
          isHideGrid: false,
          isHideGridHeader: false,
          isGridExpandOnLoad: false,
          clientId: 13,
          isColumnVisible: null,
          isColumnDisabled: null,
          columnsToDisabled: null,
          columnsToHide: null,
        },
      ],
      subChild: [],
    },
  ]);
  const [isError, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [newState, setNewState] = useState({
    routeName: "mastervalue",
    containerNo: null,
    bookingNo: null,
    blNo: null,
    tblContainerMovement: [],
  });
  const [expandAll, setExpandAll] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [clearFlag, setClearFlag] = useState({
    isClear: false,
    fieldName: "",
  });
  const [submitNewState, setSubmitNewState] = useState({
    routeName: "mastervalue",
  });
  const [formControlData, setFormControlData] = useState([]);
  const [parentsFields, setParentsFields] = useState([
    {
      "container Activity": [
        {
          id: 65070,
          fieldname: "containerNo",
          yourlabel: "Container No",
          controlname: "text",
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
          referenceTable: null,
          referenceColumn: null,
          type: 6902,
          typeValue: "string",
          size: "100",
          ordering: 23,
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
          sectionHeader: "container Activity",
          sectionOrder: 3,
          isCopy: true,
          isCopyEditable: false,
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
          id: 65070,
          fieldname: "bookingNo",
          yourlabel: "Booking No",
          controlname: "text",
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
          referenceTable: null,
          referenceColumn: null,
          type: 6902,
          typeValue: "string",
          size: "100",
          ordering: 23,
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
          sectionHeader: "container Activity",
          sectionOrder: 3,
          isCopy: true,
          isCopyEditable: false,
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
          id: 65070,
          fieldname: "blNo",
          yourlabel: "Bl NO",
          controlname: "text",
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
          referenceTable: null,
          referenceColumn: null,
          type: 6902,
          typeValue: "string",
          size: "100",
          ordering: 23,
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
          sectionHeader: "container Activity",
          sectionOrder: 3,
          isCopy: true,
          isCopyEditable: false,
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
      ],
    },
  ]);
  const [expandedAccordion, setExpandedAccordion] = useState([]);
  const [tableName, setTableName] = useState(false);
  const [hideFieldName, setHideFieldName] = useState([]);
  const [labelName, setLabelName] = useState("");


  const getLabelValue = (labelValue) => {
    setLabelName(labelValue);
  };
  const handleGoClick = async () => {
    try {
      let allRows = [];
      const { clientId, companyId, branchId, userId, financialYear } = getUserDetails();
      // ✅ Common parameters for all API calls
      const commonParams = {
        clientId: clientId,
        companyId: companyId,
        companyBranchId: branchId,
        financialyearId: financialYear,
        userId: userId,
      };

      // ✅ From containerNo
      if (newState?.containerNo && newState.containerNo.trim() !== "") {
        const containerNumbers = newState.containerNo.split(",").map(c => c.trim());

        for (const container of containerNumbers) {
          const fetchResponse = await getContainerActivity({
            containerNo: container,
            ...commonParams,
          });

          if (fetchResponse?.success && Array.isArray(fetchResponse?.Chargers) && fetchResponse.Chargers.length > 0) {
            const mappedRows = fetchResponse.Chargers.map((item, idx) => ({
              containerNo: String(item.containerId),
              containerNodropdown: [{ value: item.containerId, label: item.containerNo }],
              lastActivity: String(item.lastActivity),
              lastActivitydropdown: [{ value: item.lastActivity, label: item.lastActivityname }],
              agentId: String(item.agentId),
              agentIddropdown: [{ value: item.agentId, label: item.agentName }],
              agentBranchId: String(item.agentBranchId),
              agentBranchIddropdown: [{ value: item.agentBranchId, label: item.agentBranch }],
              fromLocationId: String(item.formLocationId),
              fromLocationIddropdown: [{ value: item.formLocationId, label: item.fromLocation }],
              lastActivityDate: item.activityDate,
              activityId: Array.isArray(item.nextActivities) && item.nextActivities.length > 0 ? String(item.nextActivities[0].id) : "",
              activityIddropdown: Array.isArray(item.nextActivities)
                ? item.nextActivities.map(na => ({ value: na.id, label: na.name }))
                : [],
              remarks: item.remarks ?? "",
              jobId: String(item.jobId),
              vesselId: String(item.vesselId),
              voyageId: String(item.voyageId),
              importBlId: String(item.importBlId),
              exportBlId: String(item.exportBlId),
              lastActivity: item.lastActivityname ?? "",
              indexValue: allRows.length + idx,
              isChecked: true,
            }));
            allRows = [...allRows, ...mappedRows];
          } else {
            toast.warn(`No container data found for: ${container}`);
          }
        }
      }

      // ✅ From bookingNo
      if (newState?.bookingNo && newState.bookingNo.trim() !== "") {
        const fetchResponse = await getContainerActivity({
          bookingNo: newState.bookingNo,
          ...commonParams,
        });
        if (fetchResponse?.success && Array.isArray(fetchResponse?.Chargers) && fetchResponse.Chargers.length > 0) {
          const mappedRows = fetchResponse.Chargers.map((item, idx) => ({
            bookingNo: String(item.bookingNo),
            containerNo: String(item.containerId),
            containerNodropdown: [{ value: item.containerId, label: item.containerNo }],
            lastActivity: String(item.lastActivity),
            lastActivitydropdown: [{ value: item.lastActivity, label: item.lastActivityname }],
            agentId: String(item.agentId),
            agentIddropdown: [{ value: item.agentId, label: item.agentName }],
            agentBranchId: String(item.agentBranchId),
            agentBranchIddropdown: [{ value: item.agentBranchId, label: item.agentBranch }],
            fromLocationId: String(item.formLocationId),
            fromLocationIddropdown: [{ value: item.formLocationId, label: item.fromLocation }],
            lastActivityDate: item.activityDate,
            remarks: item.remarks ?? "",
            jobId: String(item.jobId),
            vesselId: String(item.vesselId),
            voyageId: String(item.voyageId),
            importBlId: String(item.importBlId),
            exportBlId: String(item.exportBlId),
            lastActivity: item.lastActivityname ?? "",
            activityId: Array.isArray(item.nextActivities) && item.nextActivities.length > 0 ? String(item.nextActivities[0].id) : "",
            activityIddropdown: Array.isArray(item.nextActivities)
              ? item.nextActivities.map(na => ({ value: na.id, label: na.name }))
              : [],
            indexValue: allRows.length + idx,
            isChecked: true,
          }));
          allRows = [...allRows, ...mappedRows];
        } else {
          toast.warn(`No booking data found for: ${newState.bookingNo}`);
        }
      }

      // ✅ From blNo
      if (newState?.blNo && newState.blNo.trim() !== "") {
        const fetchResponse = await getContainerActivity({
          blNo: newState.blNo,
          ...commonParams,
        });

        if (fetchResponse?.success && Array.isArray(fetchResponse?.Chargers) && fetchResponse.Chargers.length > 0) {
          const mappedRows = fetchResponse.Chargers.map((item, idx) => ({
            blNo: String(item.blNo),
            containerNo: String(item.containerId),
            containerNodropdown: [{ value: item.containerId, label: item.containerNo }],
            lastActivity: String(item.lastActivity),
            lastActivitydropdown: [{ value: item.lastActivity, label: item.lastActivityname }],
            agentId: String(item.agentId),
            agentIddropdown: [{ value: item.agentId, label: item.agentName }],
            agentBranchId: String(item.agentBranchId),
            agentBranchIddropdown: [{ value: item.agentBranchId, label: item.agentBranch }],
            fromLocationId: String(item.formLocationId),
            fromLocationIddropdown: [{ value: item.formLocationId, label: item.fromLocation }],
            lastActivityDate: item.activityDate,
            remarks: item.remarks ?? "",
            jobId: String(item.jobId),
            vesselId: String(item.vesselId),
            voyageId: String(item.voyageId),
            importBlId: String(item.importBlId),
            exportBlId: String(item.exportBlId),
            lastActivity: item.lastActivityname ?? "",
            activityId: Array.isArray(item.nextActivities) && item.nextActivities.length > 0 ? String(item.nextActivities[0].id) : "",
            activityIddropdown: Array.isArray(item.nextActivities)
              ? item.nextActivities.map(na => ({ value: na.id, label: na.name }))
              : [],
            indexValue: allRows.length + idx,
            isChecked: true,
          }));
          allRows = [...allRows, ...mappedRows];
        } else {
          toast.warn(`No BL data found for: ${newState.blNo}`);
        }
      }
      console.log("newState", newState)
      // ✅ Final update
      if (allRows.length > 0) {
        setNewState(prev => ({
          ...prev,
          tblContainerMovement: allRows,
        }));

        setSubmitNewState(prev => ({
          ...prev,
          tblContainerMovement: allRows,
        }));
      } else {
        toast.error("No data found. Please enter container no, booking no, or BL no.");
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
      toast.error("Something went wrong while fetching data.");
    }
  };


  const handleClear = () => {
    setNewState((prev) => ({
      ...prev,
      containerNo: null,
      bookingNo: null,
      blNo: null,
      tblContainerMovement: [],
    }));

    setSubmitNewState((prev) => ({
      ...prev,
      tblContainerMovement: [],
    }));

    setClearFlag({
      isClear: true,
      fieldName: "",
    });

    setExpandAll(true);
    setExpandedAccordion((prev) => {
      return parentsFields.map((_, idx) => idx);
    });
  };


  // const handleEditLastActivityClick = async () => {
  //   try {
  //     if (newState?.containerNo && newState.containerNo.trim() !== "") {
  //       const containerNumbers = newState.containerNo.split(",").map(c => c.trim());
  //       const requestData = {
  //         columns: "id",
  //         tableName: "tblContainer",
  //         whereCondition: `containerNo ='${containerNumbers}'`,
  //         clientIdCondition: `status=1 FOR JSON PATH , INCLUDE_NULL_VALUES `,
  //       };

  //       const containerData = await fetchReportData(requestData);
  //       const containerIdData = containerData.data[0].id;

  //       const request = {
  //         clientId: clientId,
  //         containerId: containerIdData,
  //       };

  //       const containerEdit = await editLastActivity(request);
  //       console.log("containerEdit", containerEdit);

  //       if (containerEdit?.success && Array.isArray(containerEdit?.Chargers) && containerEdit.Chargers.length >= 1) {
  //         const firstRecord = containerEdit.Chargers[0];  // latest
  //         const secondRecord = containerEdit.Chargers.length >= 2 ? containerEdit.Chargers[1] : null;

  //         const updatedMovements = newState.tblContainerMovement.map((movement) => ({
  //           ...movement,

  //           // ✅ Last activity from 2nd if exists, else 1st
  //           lastActivity: secondRecord?.activityName ?? firstRecord.activityName ?? "",
  //           lastActivitydropdown: [
  //             {
  //               value: (secondRecord?.activityId ?? firstRecord.activityId),
  //               label: (secondRecord?.activityName ?? firstRecord.activityName),
  //             },
  //           ],
  //           lastActivityDate: secondRecord?.activityDate ?? firstRecord.activityDate ?? "",

  //           // ✅ FromLocation → 2nd record if exists, else 1st
  //           fromLocation: secondRecord?.fromLocationName ?? firstRecord.fromLocationName ?? "",
  //           fromLocationdropdown: [
  //             {
  //               value: (secondRecord?.fromLocationId ?? firstRecord.fromLocationId),
  //               label: (secondRecord?.fromLocationName ?? firstRecord.fromLocationName),
  //             },
  //           ],

  //           // ✅ ToLocation → 1st record if 2 exist, else empty
  //           toLocation: secondRecord ? (firstRecord.toLocationName ?? "") : "",
  //           toLocationdropdown: secondRecord
  //             ? [{ value: firstRecord.toLocationId, label: firstRecord.toLocationName }]
  //             : [],

  //           // ✅ ActivityId always from 1st
  //           activityId: firstRecord.activityId ?? "",
  //           activityIddropdown: [
  //             { value: firstRecord.activityId, label: firstRecord.activityName },
  //           ],
  //           activityDate: firstRecord.activityDate ?? "",
  //         }));

  //         setNewState({
  //           ...newState,
  //           tblContainerMovement: updatedMovements,
  //         });
  //       } else {
  //         toast.warn("No activity records found for this container.");
  //       }
  //     } else {
  //       toast.error("Please enter at least one container number.");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching container activity:", error);
  //     toast.error("Something went wrong while fetching container data.");
  //   }
  // };


  const handleEditLastActivityClick = async () => {
    try {
      if (newState?.containerNo && newState.containerNo.trim() !== "") {
        const containerNumbers = newState.containerNo.split(",").map(c => c.trim());
        const requestData = {
          columns: "id",
          tableName: "tblContainer",
          whereCondition: `containerNo ='${containerNumbers}'`,
          clientIdCondition: `status=1 FOR JSON PATH , INCLUDE_NULL_VALUES `,
        };

        const containerData = await fetchReportData(requestData);
        const containerIdData = containerData.data[0].id;

        const request = {
          clientId: clientId,
          containerId: containerIdData,
        };

        const containerEdit = await editLastActivity(request);
        console.log("containerEdit", containerEdit);

        if (containerEdit?.success && Array.isArray(containerEdit?.Chargers) && containerEdit.Chargers.length >= 1) {
          const firstRecord = containerEdit.Chargers[0];   // latest
          const secondRecord = containerEdit.Chargers.length >= 2 ? containerEdit.Chargers[1] : null;

          const updatedMovements = newState.tblContainerMovement.map((movement) => ({
            ...movement,

            // ✅ Last activity from 2nd if exists, else 1st
            lastActivity: secondRecord?.activityName ?? firstRecord.activityName ?? "",
            lastActivitydropdown: [
              {
                value: (secondRecord?.activityId ?? firstRecord.activityId),
                label: (secondRecord?.activityName ?? firstRecord.activityName),
              },
            ],
            lastActivityDate: secondRecord?.activityDate ?? firstRecord.activityDate ?? "",

            // ✅ FromLocation always from 1st record
            fromLocation: firstRecord.fromLocationName ?? "",
            fromLocationdropdown: [
              {
                value: firstRecord.fromLocationId,
                label: firstRecord.fromLocationName,
              },
            ],

            // ✅ ToLocation from 2nd record (if exists), else empty
            toLocation: secondRecord?.toLocationName ?? "",
            toLocationdropdown: secondRecord
              ? [{ value: secondRecord.toLocationId, label: secondRecord.toLocationName }]
              : [],

            // ✅ ActivityId always from 1st
            activityId: firstRecord.activityId ?? "",
            activityIddropdown: [
              { value: firstRecord.activityId, label: firstRecord.activityName },
            ],
            activityDate: firstRecord.activityDate ?? "",
          }));

          setNewState({
            ...newState,
            tblContainerMovement: updatedMovements,
          });
        } else {
          toast.warn("No activity records found for this container.");
        }
      } else {
        toast.error("Please enter at least one container number.");
      }
    } catch (error) {
      console.error("Error fetching container activity:", error);
      toast.error("Something went wrong while fetching container data.");
    }
  };

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
      const { clientId, userId } = getUserDetails();
      const payload = {
        tblContainerMovement: submitNewState.tblContainerMovement,
        clientId: clientId,
        userId: userId
      };

      const result = await getContainerData(payload);

      if (result.success) {
        toast.success("Saved successfully.");
      } else {
        toast.error(result.message || "Save failed.");
      }
    } catch (err) {
      toast.error("Error submitting form.");
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex space-x-4 p-2 mb-5">
        <button
          className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
          type="button"
          onClick={() => handleGoClick()}
        >
          {"GO"}
        </button>
        <button
          className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
          type="button"
          onClick={() => handleEditLastActivityClick()}
        >
          {"Edit Last Activity"}
        </button>
        <button
          className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
          type="button"
          onClick={() => handleSubmit()}
        >
          {"Submit"}
        </button>
        <button
          className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
          type="Close"
          onClick={() => handleClear()}
        >
          {"Close"}
        </button>
      </div>
      {/* Parents Accordian */}
      {Object.keys(parentsFields).map((section, index) => {
        return (
          <React.Fragment key={index}>
            <ParentAccordianComponent
              expandAll={expandAll}
              section={"Container Activity"}
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
            getLabelValue={getLabelValue}
          />
        </div>
      ))}
    </>
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
                  title={"Add A"}
                  onClick={() => {
                    childButtonHandler(section, indexValue);
                  }}
                />
              )}
            </div>

            {/* Custom Input Fields in the middle */}
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
                    //                    console.log("callSaveFunctionOnLastTab");
                    childButtonHandler(section, indexValue, true);
                    // inputFieldsVisible == false &&
                    //   setInputFieldsVisible(
                    //     (prev) => !prev
                    //   );
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
                    title={"Save A"}
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
  //
  // getLabelValue
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
        sx={{
          ...parentAccordionSection,
          // border: isParentAccordionOpen ? "  red" : "none",
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
              inputFieldData={parentsFields[0]["container Activity"]}
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
            />
          </div>
        </AccordionDetails>
      </Accordion>
    </React.Fragment>
  );
}