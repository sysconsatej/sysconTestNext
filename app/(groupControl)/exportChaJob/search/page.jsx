"use client";
/* eslint-disable */

import React, { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

import styles from "@/app/app.module.css";
import { fontFamilyStyles } from "@/app/globalCss";

import CustomeInputFields from "@/components/Inputs/customeInputFields";
import { getContainerData } from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";
import GeneralSheet from "@/components/sheets/GeneralSheet";
import EntitySheet from "@/components/sheets/EntitySheet";
import "./exportChaJob.css";
import JobSheet from "@/components/sheets/GeneralSheet";
import ShipmentSheet from "@/components/sheets/ShipmentSheet";
import InvoiceSheet from "@/components/sheets/InvoiceSheet";
import ItemSheet from "@/components/sheets/ProductSheet";
import ContainerSheet from "@/components/sheets/ContainerSheet";

const TABS = ["Job", "Entity", "Shipment", "Invoice", "Item", "Container"];

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

const DEFAULT_STATE = {
    routeName: "mastervalue",
    businessSegmentId: null,
    jobNo: "",
    jobDate: "2026-01-05",
    createdBy: null,
    tblContainerMovement: [],
};

const initialJobState = {
    exporterName: null,
    exporterAddress: null,
    branchSNo: null,
    exporterStateId: null,
    ieCodeNo: null,
    registrationNo: null,
    dbkBankName: null,
    dbkAccountNo: null,
    dbkEdiAccountNo: null,

    consigneeName: null,
    consigneeAddress: null,
    consigneeCountryName: null,

    isBuyerDifferent: false,
    isHandCarry: false,

    exporterRefNo: null,
    exporterRefDate: null,
    exporterTypeId: null,

    sbNumber: null,
    sbDate: null,

    rbiApprovalNo: null,
    rbiApprovalDate: null,

    isGrWaived: false,
    grNo: null,
    grDate: null,

    rbiWaiverNo: null,
    rbiWaiverDate: null,

    bankDealerName: null,
    bankAccountNo: null,
    adCode: null,
    epzCode: null,

    notifyName: null,
    notifyAddress: null,

    docUserId: null,
    quotationNo: null,
};

const initialEntityDetailsState = {
    exporterStateId: null,
    exporterTypeId: null,
    consigneeCountryName: null,
    branchSNo: null,
    ieCodeNo: null,
    exporterAddress: null,
    dbkBankName: null,
    dbkAccountNo: null,
    dbkEdiAccountNo: null,
    consigneeName: null,
    consigneeAddress: null,
};

const shipment = {
    // ===== Main =====
    dischargePortId: null,
    dischargeCountryId: null,
    destinationPortId: null,
    destinationCountryId: null,
    airlineId: null,
    flightNoDate: null,
    egmNoDate: null,
    mawbNoDate: null,
    hawbNoDate: null,
    preCarriageBy: null,
    placeOfReceipt: null,
    transhipperCode: null,
    gatewayPortId: null,
    stateOfOriginId: null,
    isAnnexureCFiledWithAnnexureA: false,
    natureOfCargoId: null,
    totalNoOfPkgs: null,
    loosePkgs: null,
    pktsInMawb: null,
    grossWeight: null,
    netWeight: null,
    volume: null,
    chargeableWeight: null,
    marksAndNos: null,

    // ===== Stuffing Details =====
    goodsStuffedAtId: null,
    isSampleAccompanied: false,
    cfsId: null,
    factoryAddress: null,
    warehouseCode: null,
    sealTypeId: null,
    sealNo: null,
    agencyName: null,

    // ===== Invoice Printing =====
    buyersOrderNo: null,
    otherReferences: null,
    termsOfDeliveryAndPayment: null,
    originCountryId: null,
    invoiceHeader: null,

    // ===== Shipping Bill Printing =====
    qCertNoDate: null,
    exportTradeControl: null,
    typeOfShipmentId: null,
    shipmentTypeOther: null,
    permissionNoDate: null,
    exportUnderId: null,
    sbHeading: null,
    sbBottomText: null,

    // ===== Ex-Bond Details =====
    voyage: null,
    igmNo: null,
    igmDate: null,
    noOfPkg: null,
    bondNo: null,
    bondDate: null,
    warehouse: null,

    // ===== Annex C1 Details =====
    ieCodeOfEou: null,
    branchSlNo: null,
    examinationDate: null,
    examiningOfficer: null,
    examiningOfficerDesignation: null,
    supervisingOfficer: null,
    supervisingOfficerDesignation: null,
    commissionerate: null,
    division: null,
    range: null,
    verifiedByExaminingOfficer: false,
    sampleForwarded: false,
    sealNumber: null,
};

const invoice = {
    // ===== Buyer / Third Party Information =====
    exporterNameOne: null,
    exporterAddressOne: null,
    consigneeCountryNameOne: null,
    ieCodeNo: null,
    consigneeCountryName: null,
    exporterStateIdOne: null,

    exporterName: null,
    exporterAddress: null,
    exporterStateId: null,

    // ===== Other Info =====
    exportContractNoDate: null,
    natureOfPaymentId: null,
    paymentPeriodDays: null,
    aeoCode: null,
    aeoCountryId: null,
    aeoRole: null,
};

const container = {
    containerNo: null,
    type: null,
    pkgsStuffed: null,
    grossWeight: null,
    sealNo: null,
    sealDate: null,
    sealType: null,
    location: null,
};

const item = {
    // ========= Main (Item) =========
    itemDescription: null,
    ritcHsnCode: null,
    quantity: null,
    sqcQuantity: null,
    unitPrice: null,
    pricePer: null,
    amount: null,

    // ========= General =========
    // NOTE: in your formdata one field has fieldname: "" (Exim Code) -> can't map.
    // If you want, rename that fieldname in formdata to "eximCodeId" and then keep below:
    eximCodeId: null,

    endUse: null,
    ptaFtaInfoId: null,
    medicinalPlantId: null,
    labGrownDiamondId: null,
    nfeiCategoryId: null,
    originDistrictId: null,

    alternateQty: null,
    alternateQtyUnit: null, // you had duplicate alternateQty in formdata, keep separate key here

    formulation: null,
    rewardItem: null,
    isStrCode: false,
    originStateId: null,
    materialCode: null,
    surfaceMaterialInContact: null,

    // ========= PMV =========
    pmvCurrencyId: null,
    pmvCalcMethod: "Manual",
    pmvPerUnit: null,
    pmvCurrency: null, // your formdata duplicated fieldname pmvPerUnit for "Pmv Currency" -> keep separate key here
    totalPmv: null,
    totalPmvCurrency: "INR",

    // ========= GST =========
    gstPaymentStatus: null,
    gstTaxableValue: null,
    gstRate: null,
    igstAmount: null,
    compCessRate: null,
    compCessAmount: null,

    // ========= RODTEP =========
    rodtepClaim: null,
    rodtepQuantity: null,
    rodtepRate: null,
    rodtepCapValue: null,
    rodtepCapValuePerUnit: null,
    rodtepAmount: null,

    // ========= TABLE SECTIONS (SearchEditGrid) =========
    tblDucInfo: [],
    tblDocInfo: [],
    tblAreDetails: [],

    // ========= CESS / CENVAT accordion =========
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
};


export default function JobDetailsSectionPage() {
    const { clientId, userId } = getUserDetails();
    const [activeTab, setActiveTab] = useState("Job");
    const [newState, setNewState] = useState(DEFAULT_STATE);
    const [clearFlag, setClearFlag] = useState({ isClear: false, fieldName: "" });
    const [jobState, setJobState] = useState(initialJobState)
    const [entityState, setEntityState] = useState(initialEntityDetailsState)
    const [shipmentState, setShipmentState] = useState(shipment);
    const [invoiceState, setInvoiceState] = useState(invoice);
    const [containerState, setContainerState] = useState(container);
    const [itemState, setItemState] = useState(item);
    const [finalState, setFinalState] = useState(null);

    useEffect(() => {
        setFinalState({
            ...jobState,
            tblJobEntity: entityState,
            tblJobShipment: shipmentState,
            tblJobInvoice: invoiceState,
            tblJobContainer: containerState,
            tblJobItem: itemState,
        });
    }, [jobState, entityState, shipmentState, invoiceState, containerState, itemState]);

    console.log('finalState=>', finalState)

    const handleFieldValuesChange = useCallback(
        (updatedValues) => {
            setNewState((prev) => ({ ...prev, ...updatedValues }));
            if (clearFlag.isClear) setClearFlag({ isClear: false, fieldName: "" });
        },
        [clearFlag.isClear],
    );
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

            setKeysTovalidate(finalIndexdata.keyToValidate.fieldsMaping);
        } catch (error) {
            console.error("Fetch Error :", error);
        }
    };
    const handleClose = useCallback(() => {
        setNewState(DEFAULT_STATE);
        setClearFlag({ isClear: true, fieldName: "" });
    }, []);
    const handleSubmit = useCallback(async () => {
        try {
            const payload = { ...newState, clientId, userId };
            const result = await getContainerData(payload);

            if (result?.success) toast.success("Saved successfully.");
            else toast.error(result?.message || "Save failed.");
        } catch (err) {
            console.error(err);
            toast.error("Error submitting form.");
        }
    }, [newState, clientId, userId]);
    return (
        <>
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
                    handleFieldValuesChange2={handleFieldValuesChange2}
                />
            </div>

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

            {activeTab === "Job" ? (
                <JobSheet
                    value={jobState}
                    onChange={setJobState}
                />
            ) : null}
            {activeTab === "Entity" ? (
                <EntitySheet
                    value={entityState}
                    onChange={setEntityState}
                />
            ) : null}
            {activeTab === "Shipment" ? (
                <ShipmentSheet
                    value={shipmentState}
                    onChange={setShipmentState}
                />
            ) : null}
            {activeTab === "Invoice" ? (
                <InvoiceSheet
                    value={invoiceState}
                    onChange={setInvoiceState}
                />
            ) : null}
            {activeTab === "Item" ? (
                <ItemSheet
                    value={itemState}
                    onChange={setItemState}
                />
            ) : null}
            {activeTab === "Container" ? (
                <ContainerSheet
                    value={containerState}
                    onChange={setContainerState}
                />
            ) : null}
        </>
    );
}
