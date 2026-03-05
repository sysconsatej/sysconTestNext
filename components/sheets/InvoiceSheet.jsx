"use client";
/* eslint-disable */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
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
import { ButtonPanel } from "../Buttons/customeButton";
import { invoice } from "@/app/(groupControl)/exportChaJob/search/page";
import {
  commanPostService,
  dynamicDropDownFieldsData,
  fetchSearchPageData,
  fetchReportData,
} from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";
const { clientId, defaultCompanyId, defaultBranchId, defaultFinYearId } =
  getUserDetails();
const formdata = {
  "Main Information": [
    {
      id: 1,
      fieldname: "invoiceNo",
      yourlabel: "Invoice No",
      controlname: "text",
      ordering: 1,
      isControlShow: true,
      isGridView: true,
      isEditable: true,
      isRequired: true,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 2,
      fieldname: "invoiceDate",
      yourlabel: "Invoice Date",
      controlname: "date",
      ordering: 2,
      isControlShow: true,
      isGridView: true,
      isEditable: true,
      isRequired: true,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 3,
      fieldname: "invoiceCurrency",
      yourlabel: "Currency",
      controlname: "dropdown",
      ordering: 3,
      isControlShow: true,
      referenceTable: "tblMasterData",
      referenceColumn: "code",
      dropdownFilter:
        "and masterListId in (SELECT id from tblMasterList WHERE name ='tblCurrency')",
      isGridView: true,
      isEditable: true,
      isRequired: true,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 4,
      fieldname: "exchangeRate",
      yourlabel: "Exchange Rate",
      controlname: "number",
      ordering: 4,
      isControlShow: true,
      isGridView: true,
      isEditable: true,
      isRequired: true,
      sectionHeader: "General",
      sectionOrder: 1,
    },
    {
      id: 5,
      fieldname: "invoiceAmount",
      yourlabel: "Invoice Value",
      controlname: "number",
      ordering: 5,
      isControlShow: true,
      isGridView: true,
      isEditable: true,
      isRequired: true,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 6,
      fieldname: "fobValue",
      yourlabel: "FOB Value",
      controlname: "number",
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
      fieldname: "remarks",
      yourlabel: "Remarks",
      controlname: "textarea",
      ordering: 7,
      isControlShow: true,
      isGridView: true,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
      isBreak: 1,
    },
  ],
  "Buyer/Third Party Information": [
    {
      id: 1004,
      fieldname: "buyerId",
      yourlabel: "Exporter Name",
      controlname: "dropdown",
      referenceTable: "tblCompany",
      referenceColumn: "name",
      ordering: 2,
      isRequired: true,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isDisabled: true,
      isEditableMode: "b",
    },
    {
      id: 10122,
      fieldname: "buyerBranchId",
      yourlabel: "Branch",
      controlname: "dropdown",
      referenceTable: "tblCompanyBranch",
      referenceColumn: "name",
      dropdownFilter: "and companyId = ${newState.buyerId}",
      ordering: 6,
      isControlShow: true,
      isRequired: true,
      isGridView: false,
      isEditable: false,
      isDisabled: true,
      isEditableMode: "b",
    },
    {
      id: 1002,
      fieldname: "buyerAddress",
      yourlabel: "Address",
      controlname: "textarea",
      ordering: 3,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isDisabled: true,
      isEditableMode: "b",
    },
    {
      id: 10041,
      fieldname: "buyerStateId",
      yourlabel: "State",
      controlname: "dropdown",
      referenceTable: "tblState",
      referenceColumn: "name",
      ordering: 7,
      isControlShow: true,
      isGridView: false,
      isBreak: false,
      isEditable: false,
      isDisabled: true,
      isEditableMode: "b",
    },
    {
      id: 1012,
      fieldname: "buyerCityId",
      yourlabel: "City",
      controlname: "dropdown",
      referenceTable: "tblCity",
      referenceColumn: "name",
      ordering: 4,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isDisabled: true,
      isEditableMode: "b",
    },
    {
      id: 1005,
      fieldname: "buyerpin",
      yourlabel: "Pin",
      controlname: "text",
      typeValue: "text",
      ordering: 5,
      isControlShow: true,
      isGridView: false,
      isEditable: false,
      isDisabled: true,
      isEditableMode: "b",
    },
    {
      id: 125712,
      fieldname: "buyerOrderNo",
      yourlabel: "Buyer Info",
      controlname: "text",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isDummy: true,
      ordering: 8,
      isBreak: true,
      isEditable: false,
      isDisabled: true,
      isEditableMode: "b",
    },
  ],
  "Other Info": [
    {
      fieldname: "exporterContractNo",
      yourlabel: "Export Contract No",
      controlname: "text",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 1,
    },
    {
      fieldname: "exporterContractDate",
      yourlabel: "Export Contract Date",
      controlname: "date",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 2,
    },
    {
      fieldname: "natureOfTransaction",
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
      ordering: 3,
    },
    {
      fieldname: "periodOfPayment",
      yourlabel: "Payment Period",
      controlname: "number",
      suffixText: "days",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 4,
    },
    {
      fieldname: "aeoCode",
      yourlabel: "AEO Code",
      controlname: "text",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 5,
    },
    {
      fieldname: "aeoCountry",
      yourlabel: "AEO Country",
      controlname: "dropdown",
      referenceTable: "tblCountry",
      referenceColumn: "name",
      isControlShow: true,
      isGridView: false,
      isDataFlow: true,
      isEditable: true,
      ordering: 6,
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
      ordering: 7,
    },
  ],
};

export default function InvoiceSheet({
  value,
  onChange,
  inEditMode = { isEditMode: false, isCopy: false },
  jobId = null,
  // newState = {},
  setStateVariable,
}) {
  const [parentsFields] = useState(formdata);
  const [clearFlag, setClearFlag] = useState({ isClear: false, fieldName: "" });
  const newState = value;
  const setNewState = onChange;
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
  const ButtonData = [
    {
      buttonName: "Next",
      functionOnClick: "handelSave",
      id: 5975,
    },
  ];

  const handleButtonClick = {
    handelSave: async () => {
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

      const finalPayload = { jobId: jobId };
      for (const element of allFields) {
        finalPayload[element.fieldname] = newState?.[element.fieldname];
      }

      try {
        const response = await commanPostService({
          url: "/api/master/saveJsonToDB",
          data: {
            jsonData: finalPayload,
            tableName: "tblJobInvoice",
            formId: newState?.id || null,
            parentColumnName: "jobId",
          },
        });
        console.log("Response from commanPostService:", response);
      } catch (error) {
        console.error("Error while saving job:", error);
        toast.error("Unable to save data. Please try again.");
        return;
      }

      onChange((prev) => {
        const currentState = prev || {};
        const existingRows = Array.isArray(currentState.tblJobInvoice)
          ? currentState.tblJobInvoice
          : [];
        const rowData = { ...invoice, ...currentState };
        delete rowData.tblJobInvoice;

        return {
          ...invoice,
          tblJobInvoice: [...existingRows, rowData],
        };
      });
    },
  };

  const [childsFields, setChildsFields] = useState([
    {
      id: 1811,
      formName: "Job Invoice",
      childHeading: "Job Invoice",
      gridEditableOnLoad: "false",
      tableName: "tblJobInvoice",
      isAttachmentRequired: "true",
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
          fieldname: "invoiceNo",
          yourlabel: "Invoice No",
          controlname: "text",
          ordering: 1,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: true,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 2,
          fieldname: "invoiceDate",
          yourlabel: "Invoice Date",
          controlname: "date",
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
          fieldname: "invoiceCurrency",
          yourlabel: "Currency",
          controlname: "dropdown",
          ordering: 3,
          isControlShow: true,
          referenceTable: "tblMasterData",
          referenceColumn: "code",
          dropdownFilter:
            "and masterListId in (SELECT id from tblMasterList WHERE name ='tblCurrency')",
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 1,
        },
        {
          id: 4,
          fieldname: "exchangeRate",
          yourlabel: "Exchange Rate",
          controlname: "number",
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
          fieldname: "invoiceAmount",
          yourlabel: "Invoice Value",
          controlname: "number",
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
          fieldname: "fobValue",
          yourlabel: "FOB Value",
          controlname: "number",
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
          fieldname: "remarks",
          yourlabel: "Remarks",
          controlname: "textarea",
          ordering: 7,
          isControlShow: true,
          isGridView: true,
          isEditable: true,
          isRequired: false,
          sectionHeader: "General",
          sectionOrder: 2,
          isBreak: 1,
        },
      ],
      subChild: [],
      showSrNo: false,
    },
  ]);

  const [originalData, setOriginalData] = useState(null);
  const [expandAll, setExpandAll] = useState(true);

  const buildFilterCondition = () => {
    const parts = [];
    if (clientId) parts.push(`clientId=${clientId}`);
    if (defaultCompanyId) parts.push(`companyId=${defaultCompanyId}`);
    if (defaultBranchId) parts.push(`companyBranchId=${defaultBranchId}`);
    if (defaultFinYearId) parts.push(`financialYearId=${defaultFinYearId}`);
    if (jobId) parts.push(`jobId=${jobId}`);
    parts.push(`status = 1`);
    return parts.join(" and ");
  };

  // ✅ Default Invoice Date = current date (only for NEW mode)
  useEffect(() => {
    const isNew = !jobId || Number(jobId) === 0; // your page passes 0 for new
    if (!isNew) return;

    if (typeof setNewState !== "function") return;

    setNewState((prev) => {
      const p = prev || {};
      if (p.invoiceDate) return p; // do not override if already set / user selected
      return { ...p, invoiceDate: new Date() };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  useEffect(() => {
    fetchJobInvoiceData();
  }, [jobId]);
  async function fetchJobInvoiceData() {
    try {
      const filterCondition = buildFilterCondition();
      const requestData = {
        tableName: "tblJobInvoice",
        fieldName: (childsFields?.[0]?.fields || []).map((e) => ({
          fieldname: e.fieldname,
          yourlabel: e.yourlabel,
        })),
        clientId: clientId,
        filterCondition,
        pageNo: 1,
        pageSize: 10,
        keyName: "",
        keyValue: "",
      };

      const apiResponse = await fetchSearchPageData(requestData);
      if (apiResponse.success) {
        const rows = Array.isArray(apiResponse?.data)
          ? apiResponse.data.map((row, index) => ({
            ...row,
            isChecked: true,
            indexValue: index,
          }))
          : [];

        setNewState((prev) => ({
          ...(prev || {}),
          tblJobInvoice: rows,
        }));

        setOriginalData((prev) => ({
          ...(prev || {}),
          tblJobInvoice: rows,
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

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

  const handleFieldValuesChange2 = async () => { };

  return (
    <div
      className={`w-full p-1 ${styles.pageBackground} overflow-y-auto overflow-x-hidden ${styles.thinScrollBar}`}
      style={{ height: "calc(100vh - 24vh)" }}
    >
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
      <CessCenvatAccordion newState={newState} setNewState={setNewState} />
      <div className="flex justify-end">
        <ButtonPanel
          buttonsData={ButtonData}
          handleButtonClick={handleButtonClick}
        />
      </div>
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
  const getArr = (sec, state) => {
    const key = SECTION_TO_STATE_KEY[sec];
    const arr = state?.[key];
    return Array.isArray(arr) ? arr : [];
  };

  const setArr = (sec, next) => {
    const key = SECTION_TO_STATE_KEY[sec];
    if (typeof setNewState === "function") {
      setNewState((prev) => ({ ...(prev || {}), [key]: next }));
    }
    setSubmitNewState?.((prev) => ({ ...(prev || {}), [key]: next }));
  };

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

function CessCenvatAccordion({
  section = "Freight Insurance and Other Charges",
  indexValue = 0,
  newState,
  setNewState,
}) {
  const { defaultCompanyId } = getUserDetails();
  const companyId = defaultCompanyId;
  const [isOpen, setIsOpen] = useState(true);
  const [currencyData, setcurrencyData] = useState([]);
  const [unitData, setUnitData] = useState([]);

  const normalizeOptions = (arr = [], preferLabel = "code") => {
    return (arr || [])
      .map((x) => {
        const value = x?.id ?? x?.value ?? x?.[`${preferLabel}Id`];

        const label =
          x?.[preferLabel] ?? x?.label ?? x?.name ?? x?.code ?? x?.value ?? "";

        return {
          value,
          label: String(label || ""),
        };
      })
      .filter(
        (o) => o.value !== undefined && o.value !== null && o.label !== "",
      );
  };

  useEffect(() => {
    if (!companyId) return;
    GetCurrancyMaster();
    GetUnitMaster();
  }, [companyId]);

  async function GetCurrancyMaster() {
    try {
      const resp = await dynamicDropDownFieldsData({
        onfilterkey: "status",
        onfiltervalue: 1,
        referenceTable: "tblMasterData",
        referenceColumn: "code",
        dropdownFilter: `
        and masterListId in (SELECT id from tblMasterList WHERE name ='tblCurrency')
        and id in (
          select currencyId
          from tblCompanyParameter
          where status=1 and companyId=${companyId}
        )
      `,
        search: "",
        pageNo: 1,
      });
      const list = normalizeOptions(resp?.data || [], "code");

      setcurrencyData(list);
    } catch (e) {
      console.error("GetCurrancyMaster error:", e);
      setcurrencyData([]);
    }
  }

  async function GetUnitMaster() {
    const data = await dynamicDropDownFieldsData({
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblMasterData",
      referenceColumn: "code",
      dropdownFilter:
        "and masterListId in (SELECT id from tblMasterList WHERE name ='tblUnit')",
      search: "",
      pageNo: 1,
    });
    setUnitData(data?.data || []);
  }

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

  useEffect(() => {
    if (!currencyData?.length) return;
    if (typeof setNewState !== "function") return;

    const firstCurrencyId = currencyData[0]?.value;
    if (!firstCurrencyId) return;

    const currencyKeys = [
      "Freight",
      "Insurance",
      "Discount",
      "otherdeduction",
      "Commission",
      "fobvalue",
    ];

    setNewState((prev) => {
      const p = prev || {};
      const patch = {};

      // ✅ Set main invoice currency also (Main Information)
      if (
        p.invoiceCurrency === null ||
        p.invoiceCurrency === undefined ||
        String(p.invoiceCurrency).trim() === ""
      ) {
        patch.invoiceCurrency = firstCurrencyId;
      }

      // ✅ Set charge currencies (Freight/Insurance/etc)
      currencyKeys.forEach((k) => {
        if (p[k] === null || p[k] === undefined || String(p[k]).trim() === "") {
          patch[k] = firstCurrencyId;
        }
      });

      if (!Object.keys(patch).length) return p;
      return { ...p, ...patch };
    });
  }, [currencyData, setNewState]);

  const values = newState ?? localValues;
  const valuesRef = useRef(values);

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  const toNumber = useCallback((val) => {
    const num = parseFloat(val);
    return Number.isFinite(num) ? num : 0;
  }, []);
  const calculateRowAmount = useCallback(
    (row, sourceValues) => {
      if (!row) return "0.00";
      const rate1 = toNumber(sourceValues?.[row.rate1]);
      const rate2 = toNumber(sourceValues?.[row.rate2]);
      const tv = toNumber(sourceValues?.[row.tv]); // ✅ Tariff Value is the base
      const rateType = sourceValues?.[row.rateType] || "%";

      const multiplier =
        rateType === "%" ? rate1 / 100 : rate2 > 0 ? rate1 / rate2 : rate1;

      const total = tv * multiplier; // ✅ removed qty from base

      return Number.isFinite(total) ? total.toFixed(2) : "0.00";
    },
    [toNumber],
  );
  const CustomeTextField = useMemo(
    () =>
      styled(TextField)({
        ...customTextFieldStyles,
      }),
    [],
  );

  const compactFieldSx = useCallback(
    (fieldValue, width) => ({
      ...textInputStyle({ fieldname: fieldValue, isFocused: false }),
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
    }),
    [],
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

  const leftLabelSx = useMemo(
    () => ({
      ...bodyCellSx,
      fontWeight: 600,
      width: 160,
    }),
    [bodyCellSx],
  );

  const tableWrapSx = useMemo(
    () => ({
      border: "1px solid var(--commonBg)",
      borderRadius: "4px",
      overflow: "hidden",
      background: "var(--accordionBodyBg)",
      minWidth: 980,
    }),
    [],
  );

  const dutyRows = useMemo(
    () => [
      {
        label: "Freight",
        keyPrefix: "Freight",
        hasUnit: true,
        dutyOptions: currencyData,
        unitOptions: unitData,
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
        dutyOptions: currencyData,
        unitOptions: unitData,
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
        dutyOptions: currencyData,
        unitOptions: unitData,
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
        dutyOptions: currencyData,
        unitOptions: unitData,
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
        dutyOptions: currencyData,
        unitOptions: unitData,
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
        dutyOptions: currencyData,
        unitOptions: unitData,
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
    ],
    [currencyData, unitData],
  );

  const dutyRowByField = useMemo(() => {
    const map = {};
    dutyRows.forEach((row) => {
      [row.rate1, row.rateType, row.rate2, row.tv, row.qty, row.desc].forEach(
        (key) => {
          map[key] = row;
        },
      );
    });
    return map;
  }, [dutyRows]);

  const setValue = useCallback(
    (key, val) => {
      if (typeof setNewState !== "function") {
        setLocalValues((prev) => {
          const next = { ...(prev || {}), [key]: val };

          const matchedRow = dutyRowByField[key];
          if (matchedRow?.desc) {
            next[matchedRow.desc] = calculateRowAmount(matchedRow, next);
          }
          return next;
        });
        return;
      }

      setNewState((prev) => {
        const p = prev || {};
        if ((p[key] ?? "") === val) return p;

        const matchedRow = dutyRowByField[key];
        let patch = { [key]: val };

        if (matchedRow?.desc) {
          const temp = { ...p, ...patch };
          patch[matchedRow.desc] = calculateRowAmount(matchedRow, temp);
        }

        // default rateType if blank
        if (matchedRow?.rateType) {
          const nextVal = (patch[matchedRow.rateType] ?? p[matchedRow.rateType]);
          if (nextVal === null || nextVal === undefined || String(nextVal).trim() === "") {
            patch[matchedRow.rateType] = "%";
          }
        }

        return { ...p, ...patch };
      });
    },
    [setNewState, dutyRowByField, calculateRowAmount]
  );

  // const setValue = useCallback((key, val) => {
  //   if ((valuesRef.current?.[key] ?? "") === val) return;
  //   const currentValues = extValues || valuesRef.current || {};
  //   const nextValues = { ...currentValues, [key]: val };
  //   const matchedRow = dutyRowByField[key];
  //   if (matchedRow?.desc) {
  //     nextValues[matchedRow.desc] = calculateRowAmount(matchedRow, nextValues);
  //   }
  //   if (typeof onChangeHandler === "function" && extValues) {
  //     onChangeHandler(nextValues);
  //     return;
  //   }
  //   setLocalValues(nextValues);
  // }, [calculateRowAmount, dutyRowByField, extValues, onChangeHandler]);

  const calculatedRowAmounts = useMemo(() => {
    const result = {};
    dutyRows.forEach((row) => {
      result[row.keyPrefix] = calculateRowAmount(row, values);
    });
    return result;
  }, [calculateRowAmount, dutyRows, values]);

  const percentOrRsOptions = useMemo(
    () => [
      { value: "%", label: "%" },
      { value: "Rs", label: "Rs" },
    ],
    [],
  );

  const renderTextField = useCallback(
    ({ k, value, label, width = 120, type = "text", disabled = false }) => (
      <LightTooltip title={label || ""}>
        <CustomeTextField
          autoComplete="off"
          type={type}
          size="small"
          variant="outlined"
          value={value ?? ""}
          onChange={(e) => setValue(k, e.target.value)}
          disabled={disabled}
          sx={{
            ...compactFieldSx(value, width),
            "& input": { padding: "2px 6px" },
          }}
        />
      </LightTooltip>
    ),
    [compactFieldSx, setValue, CustomeTextField],
  );

  const renderSelectField = useCallback(
    ({ k, value, label, options, width = 140, disabled = false }) => (
      <LightTooltip title={label || ""}>
        <CustomeTextField
          select
          size="small"
          variant="outlined"
          value={value ?? ""}
          onChange={(e) => setValue(k, e.target.value)}
          disabled={disabled}
          sx={{
            ...compactFieldSx(value, width),
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
    ),
    [compactFieldSx, setValue, CustomeTextField],
  );

  const DutyRow = useMemo(
    () =>
      React.memo(
        function DutyRowInner({ row, rowValues }) {
          const cellSx = row.isLast
            ? { ...bodyCellSx, borderBottom: "none" }
            : bodyCellSx;
          const leftSx = row.isLast
            ? { ...leftLabelSx, borderBottom: "none" }
            : leftLabelSx;

          return (
            <TableRow
              sx={{
                "&:hover": {
                  backgroundColor: "var(--tableRowBgHover)",
                },
                "&:hover td": {
                  color: "var(--tableRowTextColorHover)",
                },
              }}
            >
              <TableCell sx={leftSx}>{row.label}</TableCell>

              <TableCell sx={cellSx}>
                {renderSelectField({
                  k: row.dutyKey,
                  value: rowValues.dutyValue,
                  label: row.label,
                  width: 180,
                  options: row.dutyOptions,
                })}
              </TableCell>

              <TableCell sx={{ ...cellSx, width: 420 }}>
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
                  {renderTextField({
                    k: row.rate1,
                    value: rowValues.rate1,
                    label: "Rate",
                    width: 110,
                    type: "number",
                  })}
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
                  {renderSelectField({
                    k: row.rateType,
                    value: rowValues.rateType || "%",
                    label: "Type",
                    width: 90,
                    options: percentOrRsOptions,
                  })}
                  {renderTextField({
                    k: row.rate2,
                    value: rowValues.rate2,
                    label: "Alt",
                    width: 110,
                    type: "number",
                  })}
                </Box>
              </TableCell>

              <TableCell sx={cellSx}>
                {renderTextField({
                  k: row.tv,
                  value: rowValues.tv,
                  label: "Tariff Value",
                  width: 140,
                  type: "number",
                })}
              </TableCell>

              <TableCell sx={cellSx}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {renderTextField({
                    k: row.qty,
                    value: rowValues.qty,
                    label: "Qty",
                    width: 120,
                    type: "number",
                  })}
                </Box>
              </TableCell>

              <TableCell sx={cellSx}>
                {renderSelectField({
                  k: row.unit,
                  value: rowValues.unit,
                  label: "Unit",
                  width: 110,
                  options: row.unitOptions || [],
                })}
              </TableCell>

              <TableCell sx={cellSx}>
                {renderTextField({
                  k: row.desc,
                  value: rowValues.desc,
                  label: "Amount",
                  width: 150,
                  disabled: true,
                })}
              </TableCell>
            </TableRow>
          );
        },
        (prev, next) => {
          if (prev.row !== next.row) return false;
          const p = prev.rowValues;
          const n = next.rowValues;
          return (
            p.dutyValue === n.dutyValue &&
            p.rate1 === n.rate1 &&
            p.rateType === n.rateType &&
            p.rate2 === n.rate2 &&
            p.tv === n.tv &&
            p.qty === n.qty &&
            p.unit === n.unit &&
            p.desc === n.desc
          );
        },
      ),
    [
      bodyCellSx,
      leftLabelSx,
      percentOrRsOptions,
      renderSelectField,
      renderTextField,
    ],
  );

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
                    <TableCell sx={{ ...headerCellSx, width: 160 }}>
                      Charges
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 220 }}>
                      Currency
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 420 }}>
                      exchange Rates
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 190 }}>
                      Rates
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 140 }}>
                      Base Value
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 140 }}>
                      Unit
                    </TableCell>
                    <TableCell sx={{ ...headerCellSx, width: 200 }}>
                      Amount
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {dutyRows.map((r) => {
                    return (
                      <DutyRow
                        key={r.keyPrefix}
                        row={r}
                        rowValues={{
                          dutyValue: values?.[r.dutyKey] ?? "",
                          rate1: values?.[r.rate1] ?? "",
                          rateType: values?.[r.rateType] || "%",
                          rate2: values?.[r.rate2] ?? "",
                          tv: values?.[r.tv] ?? "",
                          qty: values?.[r.qty] ?? "",
                          unit: values?.[r.unit] ?? "",
                          desc: calculatedRowAmounts[r.keyPrefix] ?? "0.00",
                        }}
                      />
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
            if (typeof onSubmitValidation[fun] == "function") {
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
      tmpData["tblJobInvoice"].push({
        ...subChild,
        isChecked: true,
        indexValue: tmpData["tblJobInvoice"].length,
      });
      setNewState(tmpData);
      setSubmitNewState(tmpData);
      setOriginalData(tmpData);
      setRenderedData(newState?.tblJobInvoice);
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

  useEffect(() => {
    setRenderedData(newState?.tblJobInvoice?.slice(0, 10));
    calculateTotalForRow(newState?.tblJobInvoice);
    if (newState?.tblJobInvoice && newState?.tblJobInvoice.length > 0) {
      setClickCount(1);
    }
  }, [newState]);

  const renderMoreData = () => {
    const lastIndex = renderedData.length + 10;
    const newData = newState[section.tableName]?.slice(
      renderedData.length,
      lastIndex,
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
          const updatedData = newStateCopy["tblJobInvoice"]?.filter(
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
        const updatedData = newStateCopy["tblJobInvoice"]?.filter(
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

  // eslint-disable-next-line no-unused-vars
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
                    calculateTotalVolumeAndWeight();
                    // calculateTotalGrossWeight();
                    // calculateTotalGrossWeightBl();
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
                          newState["tblJobInvoice"]?.length > 10
                            ? "290px"
                            : "auto",
                        overflowY:
                          newState["tblJobInvoice"]?.length > 10
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
                                          setInputFieldsVisible(
                                            (prev) => !prev,
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
