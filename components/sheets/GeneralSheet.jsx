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
  accordianDetailsStyleForm,
  expandIconStyle,
} from "@/app/globalCss";

const formdata = {
  "Job Details": [
    {
      id: 1001,
      fieldname: "exporterName",
      yourlabel: "Exporter",
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
    },
    {
      id: 1003,
      fieldname: "branchSNo",
      yourlabel: "Branch SNo",
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
      id: 1004,
      fieldname: "exporterStateId",
      yourlabel: "State",
      controlname: "dropdown",
      referenceTable: "tblState",
      referenceColumn: "name",
      type: 6653,
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
      id: 1005,
      fieldname: "ieCodeNo",
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
      controlname: "dropdown",
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
      id: 1007,
      fieldname: "dbkBankName",
      yourlabel: "DBK Bank",
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
      id: 1008,
      fieldname: "dbkAccountNo",
      yourlabel: "DBK A/c.",
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
    {
      id: 1009,
      fieldname: "dbkEdiAccountNo",
      yourlabel: "DBK EDI A/c.",
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
      id: 1010,
      fieldname: "consigneeName",
      yourlabel: "Consignee",
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
      id: 1011,
      fieldname: "consigneeAddress",
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
      id: 1012,
      fieldname: "consigneeCountryName",
      yourlabel: "Cons Country",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 12,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 1,
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
      id: 1014,
      fieldname: "isHandCarry",
      yourlabel: "Hand Carry",
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
      id: 1015,
      fieldname: "exporterRefNo",
      yourlabel: "Exporter Ref No",
      controlname: "text",
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
      id: 1016,
      fieldname: "exporterRefDate",
      yourlabel: "Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 16,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1017,
      fieldname: "exporterTypeId",
      yourlabel: "Exporter Type",
      controlname: "dropdown",
      type: 6653,
      typeValue: "number",
      ordering: 17,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1018,
      fieldname: "sbNumber",
      yourlabel: "SB Number",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 18,
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
      yourlabel: "Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 19,
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
      ordering: 20,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1021,
      fieldname: "rbiApprovalDate",
      yourlabel: "Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 21,
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
      ordering: 22,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
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
      ordering: 23,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1024,
      fieldname: "grDate",
      yourlabel: "Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 24,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
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
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1026,
      fieldname: "rbiWaiverDate",
      yourlabel: "Date",
      controlname: "date",
      type: 6783,
      typeValue: "date",
      ordering: 26,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1027,
      fieldname: "bankDealerName",
      yourlabel: "Bank / Dealer",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 27,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1028,
      fieldname: "bankAccountNo",
      yourlabel: "A/C Number",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 28,
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
      ordering: 29,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1030,
      fieldname: "epzCode",
      yourlabel: "EPZ Code",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 30,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1031,
      fieldname: "notifyName",
      yourlabel: "Notify",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 31,
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
      yourlabel: "Address",
      controlname: "textarea",
      type: 6902,
      typeValue: "string",
      ordering: 32,
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
      ordering: 33,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
    {
      id: 1034,
      fieldname: "quotationNo",
      yourlabel: "Quotation",
      controlname: "text",
      type: 6902,
      typeValue: "string",
      ordering: 34,
      isControlShow: true,
      isGridView: false,
      isEditable: true,
      isRequired: false,
      sectionHeader: "General",
      sectionOrder: 2,
    },
  ],
};

export default function JobSheet({ value, onChange }) {
  const [parentsFields, setParentsFields] = useState(formdata);
  const [expandAll, setExpandAll] = useState(true);
  const [expandedAccordion, setExpandedAccordion] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [paraText, setParaText] = useState("");
  const [isError, setIsError] = useState(false);
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [clearFlag, setClearFlag] = useState({ isClear: false, fieldName: "" });
  const [submitNewState, setSubmitNewState] = useState({
    routeName: "mastervalue",
  });
  const [tableName, setTableName] = useState(false);
  const [formControlData, setFormControlData] = useState([]);
  const [hideFieldName, setHideFieldName] = useState([]);
  const [labelName, setLabelName] = useState("");
  const getLabelValue = (labelValue) => setLabelName(labelValue);
  const newState = value;
  const setNewState = onChange;

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
            />
          </React.Fragment>
        ))}
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
          className={`overflow-hidden p-0 ${styles.thinScrollBar}`}
          sx={{ ...accordianDetailsStyleForm }}
        >
          <div>
            <CustomeInputFields
              inputFieldData={parentsFields?.[section] || []}
              values={newState || {}}
              onValuesChange={handleFieldValuesChange}
              handleFieldValuesChange2={handleFieldValuesChange2}
              inEditMode={{ isEditMode: false, isCopy: true }}
              onChangeHandler={(result) => handleChangeFunction(result)}
              onBlurHandler={(result) => handleBlurFunction(result)}
              clearFlag={clearFlag}
              newState={newState || {}}
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
