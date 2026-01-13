"use client";
/* eslint-disable */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import styles from "@/app/app.module.css";
import { fontFamilyStyles } from "@/app/globalCss";

import CustomeInputFields from "@/components/Inputs/customeInputFields";
import { getContainerData } from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";

import "./exportChaJob.css";

import GeneralSheet from "@/components/sheets/GeneralSheet";
import EntitySheet from "@/components/sheets/EntitySheet";
import ShipmentSheet from "@/components/sheets/ShipmentSheet";
import InvoiceSheet from "@/components/sheets/InvoiceSheet";
import ProductSheet from "@/components/sheets/ProductSheet";
import ContainerSheet from "@/components/sheets/ContainerSheet";

/** ✅ Tabs list */
const TABS = ["Job", "Entity", "Shipment", "Invoice", "Item", "Container"];

/** ✅ Top form fields (Job Details) */
const PARENT_FIELDS = [
  {
    "Job Details": [
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
        columnsToBeVisible: true,
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
        columnsToBeVisible: true,
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
        controlDefaultValue: "2026-01-05",
        sectionHeader: "Job Details",
        sectionOrder: 1,
        isCopy: false,
        isCopyEditable: false,
        isHideGrid: false,
        isHideGridHeader: false,
        isGridExpandOnLoad: false,
        clientId: 1,
        columnsToBeVisible: true,
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
        columnsToBeVisible: true,
      },
    ],
  },
];

/** ✅ Default form values */
const DEFAULT_STATE = {
  routeName: "mastervalue",
  businessSegmentId: null,
  jobNo: "",
  jobDate: "2026-01-05",
  createdBy: null,
  tblContainerMovement: [],
};

export default function JobDetailsSectionPage() {
  const { clientId, userId } = getUserDetails();

  const [activeTab, setActiveTab] = useState("Job");
  const [newState, setNewState] = useState(DEFAULT_STATE);
  const [clearFlag, setClearFlag] = useState({ isClear: false, fieldName: "" });

  /** ✅ Called when any field changes */
  const handleFieldValuesChange = (updatedValues) => {
    setNewState((prev) => ({ ...prev, ...updatedValues }));

    // once cleared, stop clearing
    if (clearFlag.isClear) setClearFlag({ isClear: false, fieldName: "" });
  };

  /** ✅ Close = reset form */
  const handleClose = () => {
    setNewState(DEFAULT_STATE);
    setClearFlag({ isClear: true, fieldName: "" });
  };

  /** ✅ Submit = call API */
  const handleSubmit = async () => {
    try {
      const payload = { ...newState, clientId, userId };
      const result = await getContainerData(payload);

      if (result?.success) toast.success("Saved successfully.");
      else toast.error(result?.message || "Save failed.");
    } catch (err) {
      console.error(err);
      toast.error("Error submitting form.");
    }
  };

  /** ✅ Map tab name -> component */
  const TAB_COMPONENTS = {
    Job: GeneralSheet,
    Entity: EntitySheet,
    Shipment: ShipmentSheet,
    Invoice: InvoiceSheet,
    Item: ProductSheet,
    Container: ContainerSheet,
  };

  /** ✅ Render current tab component */
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <>
      {/* ✅ Top buttons */}
      <div className="flex space-x-4 p-2 mb-5">
        <button
          className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
          type="button"
          onClick={handleSubmit}
        >
          Submit
        </button>

        <button
          className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
          type="button"
          onClick={handleClose}
        >
          Close
        </button>
      </div>

      {/* ✅ Top "Job Details" form */}
      <div
        className={`p-0 ${styles.thinScrollBar}`}
        style={{ "--inputFontSize": "12px", "--labelFontSize": "12px" }}
      >
        <CustomeInputFields
          inputFieldData={PARENT_FIELDS[0]["Job Details"]}
          values={newState}
          onValuesChange={handleFieldValuesChange}
          inEditMode={{ isEditMode: false, isCopy: false }}
          clearFlag={clearFlag}
          newState={newState}
          setStateVariable={setNewState}
        />
      </div>

      {/* ✅ Tabs */}
      <div className="tabsBar">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`tabBtn ${activeTab === t ? "tabBtnActive" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ✅ Tab body */}
      <div className={`tabBody ${styles.thinScrollBar}`}>
        {ActiveComponent ? (
          <ActiveComponent
            values={newState}
            onValuesChange={handleFieldValuesChange}
            clearFlag={clearFlag}
            inEditMode={{ isEditMode: false, isCopy: false }}
            newState={newState}
            setStateVariable={setNewState}
          />
        ) : (
          <div style={{ padding: 8, fontSize: 13 }}>{activeTab} Sheet</div>
        )}
      </div>
    </>
  );
}

JobDetailsSectionPage.propTypes = {
  section: PropTypes.any,
};
