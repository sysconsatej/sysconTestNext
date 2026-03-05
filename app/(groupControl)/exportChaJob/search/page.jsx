"use client";
/* eslint-disable */
import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import styles from "@/app/app.module.css";
import { fontFamilyStyles } from "@/app/globalCss";
import { useSearchParams, useRouter } from "next/navigation";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import {
  fetchSearchPageData,
  // insertExportChaJob,
  commanPostService,
} from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";
import "./exportChaJob.css";
import JobSheet, { parentsFieldsData } from "@/components/sheets/GeneralSheet";
import InvoiceSheet from "@/components/sheets/InvoiceSheet";
import ItemSheet from "@/components/sheets/ProductSheet";

const TABS = ["Job", "Invoice", "Item"];

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
        dropdownFilter: "and jobTypeId= 840",
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
        controlDefaultValue: null,
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
        isGridView: true,
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

/* =========================================================
   ✅ DEFAULT STATE (NEW RECORD)
   - jobDate: defaults to today (new Date())
   - createdBy: defaults to logged-in userId
========================================================= */

const makeDefaultState = (userId) => ({
  routeName: "mastervalue",
  businessSegmentId: null,
  jobNo: "",
  jobDate: new Date(),
  createdBy: userId ?? null,
  tblContainerMovement: [],
});

export const invoice = {
  buyerId: null,
  buyerBranchId: null,
  buyerAddress: null,
  buyerStateId: null,
  buyerCityId: null,
  buyerpin: null,
  buyerOrderNo: null,

  exporterContractNo: null,
  exporterContractDate: null,
  natureOfTransaction: null,
  periodOfPayment: null,
  aeoCode: null,
  aeoCountry: null,
  aeoRole: null,
  invoiceNo: null,
  invoiceDate: null,
  invoiceCurrency: null,
  invoiceAmount: null,
  currencyId: null,
  exchangeRate: null,
  invoiceValue: null,
  fobValue: null,
  remarks: null,
  tblJobInvoice: [],
};

const item = {
  itemDescription: null,
  ritcHsnCode: null,
  quantity: null,
  sqcQuantity: null,
  unitPrice: null,
  pricePer: null,
  amount: null,
  eximCodeId: null,
  endUse: null,
  ptaFtaInfoId: null,
  medicinalPlantId: null,
  labGrownDiamondId: null,
  nfeiCategoryId: null,
  originDistrictId: null,
  alternateQty: null,
  alternateQtyUnit: null,
  formulation: null,
  rewardItem: null,
  isStrCode: false,
  originStateId: null,
  materialCode: null,
  surfaceMaterialInContact: null,

  pmvCurrencyId: null,
  pmvCalcMethod: "Manual",
  pmvPerUnit: null,
  pmvCurrency: null,
  totalPmv: null,
  totalPmvCurrency: "INR",

  gstPaymentStatus: null,
  gstTaxableValue: null,
  gstRate: null,
  igstAmount: null,
  compCessRate: null,
  compCessAmount: null,

  rodtepClaim: null,
  rodtepQuantity: null,
  rodtepRate: null,
  rodtepCapValue: null,
  rodtepCapValuePerUnit: null,
  rodtepAmount: null,

  tblDucInfo: [],
  tblDocInfo: [],
  tblAreDetails: [],

  beNumber: null,
  beDate: null,
  invoiceSNo: null,
  itemSNo: null,
  importPortCodeId: null,
  isManualBe: false,
  beItemDesc: null,
  qtyImported: null,
  assessableValue: null,
  totalDutyPaid: null,
  totalDutyPaidDate: null,

  qtyExported: null,
  technicalDetails: null,
  isInputCreditAvailed: false,
  isPersonalUseItem: false,
  otherIdentifyingParameters: null,

  isAgainstExportObligation: false,
  obligationNo: null,
  drawbackAmtClaimed: null,
  isItemUnUsed: false,
  isCommissionerPermission: false,
  boardNumber: null,
  boardDate: null,
  isModvatAvailed: false,
  isModvatReversed: false,

  accessoriesId: null,
  accessoriesRemarks: null,

  isThirdPartyExport: false,
  thirdPartyName: null,
  thirdPartyIeCode: null,
  thirdPartyBranchSNo: null,
  thirdPartyRegnNo: null,
  thirdPartyAddress: null,

  mpgName: null,
  mpgCode: null,
  mpgAddress: null,
  mpgCountryId: null,
  mpgStateProvince: null,
  mpgPostalCode: null,
  mpgSourceStateId: null,
  mpgTransitCountryId: null,

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

const jobFields = {
  shipperId: null,
  shipperBranchId: null,
  shipperAddress: null,
  branchSrNo: null,
  exporterStateId: null,
  shipperType: null,
  shipperReferenceNo: null,
  shipperReferenceDate: null,
  rateRequestId: null,
  sbNo: null,
  sbDate: null,
  rbiApprovalNo: null,
  rbiApprovalDate: null,
  isGrWaived: null,
  grNo: null,
  grDate: null,
  iecCode: null,
  registrationNo: null,
  rbiWaiverNo: null,
  rbiWaiverDate: null,
  dbkBank: null,
  dbkAccountNo: null,
  dbkEdiAccountNo: null,
  bankDealerName: null,
  accountNo: null,
  adCode: null,
  consigneeId: null,
  consigneeBranchId: null,
  consigneeAddress: null,
  consigneeCountry: null,
  plrId: null,
  polId: null,
  podId: null,
  fpdId: null,
  epzCode: null,
  notifyPartyId: null,
  notifyAddress: null,
  docUserId: null,
  isBuyerDifferent: null,
  businessSegmentId: null,
  jobNo: null,
  jobDate: null,
  createdBy: null,

  dischargeCountryId: null,
  dischargePortId: null,
  destinationCountryId: null,
  destinationPortId: null,
  natureOfCargoId: null,
  totalNoOfPkgs: null,
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
  isAnnexureCFiledWithAnnexureA: null,
  loosePkgs: null,
  pktsInMawb: null,
  grossWeight: null,
  netWeight: null,
  volume: null,
  chargeableWeight: null,
  marksAndNos: null,

  goodsStuffedAtId: null,
  isSampleAccompanied: null,
  cfsId: null,
  factoryAddress: null,
  warehouseCode: null,
  sealTypeId: null,
  sealNo: null,
  agencyName: null,

  buyersOrderNo: null,
  otherReferences: null,
  termsOfDeliveryAndPayment: null,
  originCountryId: null,
  invoiceHeader: null,

  qCertNoDate: null,
  exportTradeControl: null,
  typeOfShipmentId: null,
  shipmentTypeOther: null,
  permissionNoDate: null,
  exportUnderId: null,
  sbHeading: null,
  sbBottomText: null,

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
  verifiedByExaminingOfficer: null,
  sampleForwarded: null,
  sealNumber: null,

  containerNo: null,
  type: null,
  pkgsStuffed: null,
  sealDate: null,
  sealType: null,
  location: null,
  tblJobContainer: [],
};

export default function JobDetailsSectionPage() {
  const {
    clientId,
    userId,
    defaultCompanyId,
    defaultBranchId,
    defaultFinYearId,
  } = getUserDetails();

  const [activeTab, setActiveTab] = useState("Job");

  // ✅ NEW RECORD defaults
  const [newState, setNewState] = useState(() => makeDefaultState(userId));

  const [clearFlag, setClearFlag] = useState({ isClear: false, fieldName: "" });
  const [jobState, setJobState] = useState(jobFields);
  const [invoiceState, setInvoiceState] = useState(invoice);
  const [itemState, setItemState] = useState(item);
  const [finalState, setFinalState] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const isView =
    searchParams.get("view") === "1" ||
    searchParams.get("isView") === "true" ||
    searchParams.get("isView") === "1";

  // ✅ Any time id exists (EDIT or VIEW), you want these fields NULL
  const hasId = !!id;

  const fetchBranchCityPin = useCallback(
    async (branchId) => {
      if (!branchId) return null;

      try {
        const requestData = {
          tableName: "tblCompanyBranch",
          fieldName: [
            { fieldname: "id", yourlabel: "id" },
            { fieldname: "cityId", yourlabel: "cityId" },
            { fieldname: "pinCode", yourlabel: "pinCode" },
            { fieldname: "address", yourlabel: "address" },
            { fieldname: "stateId", yourlabel: "stateId" },
          ],
          clientId,
          filterCondition: `id=${Number(branchId)} and status=1`,
          pageNo: 1,
          pageSize: 1,
          keyName: "",
          keyValue: "",
        };

        const resp = await fetchSearchPageData(requestData);
        if (resp?.success) return resp?.data?.[0] || null;
        return null;
      } catch (e) {
        console.error("fetchBranchCityPin error:", e);
        return null;
      }
    },
    [clientId]
  );

  const mapExporterToBuyer = useCallback(async () => {
    const exporterId = jobState?.shipperId ?? null;
    const exporterBranchId = jobState?.shipperBranchId ?? null;
    const exporterAddress = jobState?.shipperAddress ?? null;
    const exporterStateId = jobState?.exporterStateId ?? null;

    if (!exporterId) return;

    setInvoiceState((prev) => ({
      ...(prev || {}),
      buyerId: exporterId,
      buyerBranchId: exporterBranchId,
      buyerAddress: exporterAddress,
      buyerStateId: exporterStateId,
    }));
    const branchRow = await fetchBranchCityPin(exporterBranchId);

    if (branchRow) {
      const cityResp = await fetchSearchPageData({
        tableName: "tblCity",
        fieldName: [
          { fieldname: "id", yourlabel: "id" },
          { fieldname: "name", yourlabel: "name" },
        ],
        clientId,
        filterCondition: `id=${Number(branchRow?.cityId)} and status=1`,
        pageNo: 1,
        pageSize: 1,
        keyName: "",
        keyValue: "",
      });

      const cityRow = cityResp?.success ? cityResp?.data?.[0] : null;
      const cityOpt = cityRow ? { value: cityRow.id, label: cityRow.name } : null;

      setInvoiceState((prev) => ({
        ...(prev || {}),
        buyerCityId: branchRow?.cityId ?? null,
        ...(cityOpt
          ? { buyerCityIddropdown: [cityOpt], buyerCityIdText: [cityOpt] }
          : {}),
        buyerpin: branchRow?.pinCode ?? null,
      }));
    }
  }, [jobState, fetchBranchCityPin]);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (hasId) return;

    setJobState((prev) => ({
      ...prev,
      createdBy: prev?.createdBy ?? userId ?? null,
      jobDate: prev?.jobDate ?? new Date(),
    }));

    setNewState((prev) => ({
      ...prev,
      createdBy: prev?.createdBy ?? userId ?? null,
      jobDate: prev?.jobDate ?? new Date(),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasId, userId]);

  useEffect(() => {
    if (!hasId) return;

    setJobState((prev) => ({
      ...prev,
      createdBy: null,
      jobDate: null,
    }));

    setNewState((prev) => ({
      ...prev,
      createdBy: null,
      jobDate: null,
    }));
  }, [hasId]);

  const buildFilterCondition = () => {
    const parts = [];
    if (clientId) parts.push(`clientId=${clientId}`);
    if (defaultCompanyId) parts.push(`companyId=${defaultCompanyId}`);
    if (defaultBranchId) parts.push(`companyBranchId=${defaultBranchId}`);
    if (defaultFinYearId) parts.push(`financialYearId=${defaultFinYearId}`);
    if (id) parts.push(`id=${id}`);
    parts.push(`status = 1`);
    return parts.join(" and ");
  };

  async function fetchData() {
    try {
      const filterCondition = buildFilterCondition();
      const requestData = {
        tableName: "tblJob",
        fieldName: Object.values(parentsFieldsData)
          .flat()
          .map((e) => ({
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
        const row = apiResponse.data?.[0] || {};

        // ✅ Load DB row; since you want NULL in EDIT+VIEW, override when hasId
        setJobState(() => ({
          id,
          ...row,
          ...(hasId ? { createdBy: null, jobDate: null } : {}),
        }));

        setNewState((prev) => ({
          ...prev,
          ...row,
          ...(hasId ? { createdBy: null, jobDate: null } : {}),
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    const header = {
      businessSegmentId: newState?.businessSegmentId ?? null,
      jobNo: newState?.jobNo ?? "",
      jobDate: newState?.jobDate ?? null, // ✅ null in edit/view
      createdBy: newState?.createdBy ?? null, // ✅ null in edit/view
    };

    const invoiceArr = Array.isArray(invoiceState) ? invoiceState : [invoiceState];
    const itemArr = Array.isArray(itemState) ? itemState : [itemState];

    setFinalState({
      tblJob: {
        ...jobState,
        ...header,
        tblJobInvoice: invoiceArr.map((inv) => ({
          ...inv,
          tblJobItem: Array.isArray(inv?.tblJobItem) ? inv.tblJobItem : itemArr,
        })),
      },
    });
  }, [newState, jobState, invoiceState, itemState]);

  const handleFieldValuesChange = useCallback(
    (updatedValues) => {
      if (isView) return;
      setJobState((prev) => ({ ...prev, ...updatedValues }));
      setNewState((prev) => ({ ...prev, ...updatedValues }));
      if (clearFlag.isClear) setClearFlag({ isClear: false, fieldName: "" });
    },
    [clearFlag.isClear, isView]
  );

  const handleFieldValuesChange2 = async () => {
    if (isView) return;
  };

  const handleClose = useCallback(() => {
    setNewState(makeDefaultState(userId));
    setClearFlag({ isClear: true, fieldName: "" });
    router.push("/exportChaJob");
  }, [router, userId]);

  // const handleSubmit = async () => {
  //   if (isView) return;
  //   try {
  //     if (!finalState?.tblJob) {
  //       toast.error("Final payload not ready.");
  //       return;
  //     }
  //     const payload = {
  //       ...finalState,
  //       clientId,
  //       userId,
  //     };

  //     const res = await insertExportChaJob(payload);

  //     if (res?.success) {
  //       toast.success(res?.message || "Saved successfully.");
  //       setClearFlag({ isClear: true, fieldName: "" });
  //       setNewState(makeDefaultState(userId));
  //       return;
  //     }

  //     if (
  //       res?.rowsAffected?.success === false &&
  //       Array.isArray(res?.rowsAffected?.errors)
  //     ) {
  //       toast.error(res?.rowsAffected?.message || "Error Found !");
  //       console.log("Row Errors =>", res.rowsAffected.errors);
  //       return;
  //     }

  //     toast.error(res?.message || "Something went wrong.");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error(err?.message || "Failed to save.");
  //   }
  // };

  const handleSubmit = async () => {
    if (isView) return;

    try {
      if (!finalState?.tblJob) {
        toast.error("Final payload not ready.");
        return;
      }

      const requestBody = {
        jsonData: finalState.tblJob,
        tableName: "tblJob",
        formId: newState?.id || null,
        parentColumnName: "jobId",
      };

      const res = await commanPostService({
        url: "/api/master/saveJsonToDB",
        data: requestBody,
      });

      if (res?.success) {
        toast.success(res?.message || "Saved successfully.");
        return;
      }

      toast.error(res?.message || "Failed to save.");
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Submit error");
    }
  };

  const viewWrapperStyle = isView ? { opacity: 0.95 } : undefined;

  return (
    <>
      <div className="flex space-x-4 p-2 mb-5">
        {!isView && (
          <button
            className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
            type="button"
            onClick={handleSubmit}
          >
            Submit
          </button>
        )}

        <button
          className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
          type="button"
          onClick={handleClose}
        >
          Close
        </button>

        {/* {isView && (
          <span className="text-[12px] px-2 py-1 rounded bg-gray-100 border border-gray-300">
            View Mode
          </span>
        )} */}
      </div>

      <div
        className={`p-0 ${styles.thinScrollBar}`}
        style={{ "--inputFontSize": "12px", "--labelFontSize": "12px" }}
      >
        <CustomeInputFields
          inputFieldData={PARENT_FIELDS[0]["Job Details"]}
          values={newState}
          onValuesChange={handleFieldValuesChange}
          inEditMode={{ isEditMode: !!id && !isView, isCopy: false }}
          clearFlag={clearFlag}
          newState={newState}
          setStateVariable={isView ? () => { } : setNewState}
          handleFieldValuesChange2={handleFieldValuesChange2}
          isView={isView}
        />
      </div>

      <div className="tabsBar">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={async () => {
              if (t === "Invoice") {
                await mapExporterToBuyer();
              }
              setActiveTab(t);
            }}
            className={`tabBtn ${activeTab === t ? "tabBtnActive" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={viewWrapperStyle}>
        {activeTab === "Job" ? (
          <JobSheet
            value={jobState}
            onChange={isView ? () => { } : setJobState}
            jobId={id}
            isView={isView}
          />
        ) : null}

        {activeTab === "Invoice" ? (
          <InvoiceSheet
            value={invoiceState}
            onChange={isView ? () => { } : setInvoiceState}
            isView={isView}
            jobId={id || 0}
            setStateVariable={isView ? () => { } : setInvoiceState}
          />
        ) : null}

        {activeTab === "Item" ? (
          <ItemSheet
            value={itemState}
            onChange={isView ? () => { } : setItemState}
            isView={isView}
          />
        ) : null}
      </div>
    </>
  );
}