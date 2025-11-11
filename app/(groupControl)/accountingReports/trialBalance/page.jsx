"use client";
/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import { parentAccordionSection, accordianDetailsStyle } from "@/app/globalCss";
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import styles from "@/app/app.module.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightTooltip from "@/components/Tooltip/customToolTip";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { trialBalanceReportData } from "@/services/auth/FormControl.services.js";
import TrialBalanceComponent from "@/components/TrialBalanceComponent/page";
import { toast } from "react-toastify";
import { exportLocalPDFReports } from "@/services/auth/FormControl.services";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import { getUserDetails } from "@/helper/userDetails";
import { fontFamilyStyles } from "@/app/globalCss";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { useSearchParams } from "next/navigation";

const TrialBalance = () => {
  const searchParams = useSearchParams();
  const searchParamsReportType = searchParams.get("reportType") ?? null;
  const searchParamsBalanceType = searchParams.get("balanceType") ?? null;
  const searchParamsTbGroupId = searchParams.get("tbGroupId") ?? null;
  const [toggle, setToggle] = useState(false);
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [selectedRadio, setSelectedRadio] = useState("S");
  const [selectedRadioType, setSelectedRadioType] = useState("O");
  const { clientId } = getUserDetails();
  const { companyId } = getUserDetails();
  const { branchId } = getUserDetails();
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const { financialYear } = getUserDetails();
  const { emailId } = getUserDetails();
  const { userId } = getUserDetails();
  const { defaultFinYearId } = getUserDetails();
  const { defaultCompanyId } = getUserDetails();
  const { defaultBranchId } = getUserDetails();
  const [parentsFields, setParentsFields] = useState([
    {
      id: 1,
      fieldname: "fromDate",
      controlname: "date",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: true,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "From Date",
      type: "date",
      yourlabel: "From Date",
      ordering: 1,
    },
    {
      id: 2,
      fieldname: "toDate",
      controlname: "date",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: true,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "To Date",
      type: "date",
      yourlabel: "To Date",
      ordering: 2,
    },
    {
      id: 152,
      fieldname: "companybranchId",
      controlname: "dropdown",
      controlDefaultValue: null,
      dropdownFilter: `and companyId=${defaultCompanyId}`,
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: "name",
      referenceTable: "tblCompanyBranch",
      toolTipMessage: "Company Branch",
      type: "number",
      yourlabel: "Company Branch",
      ordering: 3,
    },
    {
      id: 133,
      fieldname: "reportType",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "S.Summary,D.Detailed",
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: null,
      type: "string",
      yourlabel: "Report Type",
      ordering: 4,
    },
    {
      id: 133,
      fieldname: "balanceType",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "O.Opening,E.Extended,C.Closing",
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: null,
      type: "string",
      yourlabel: "Balance Type",
      ordering: 5,
    },
  ]);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [newState, setNewState] = useState({
    companybranchIddropdown: [],
    companybranchId: null,
    reportType: "S",
    balanceType: "E",
    fromDate: null,
    toDate: null,
  });
  const [clearFlag, setClearFlag] = useState({
    isClear: false,
    fieldName: "",
  });
  const [formControlData, setFormControlData] = useState([]);
  const [formDataChange, SetFormDataChange] = useState({});
  const [filterCondition, setFilterCondition] = useState({});
  const [loader, setLoader] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [menuId, setMenuId] = useState(null);
  const didRun = useRef(false); // guards dev double-invoke

  console.log("newState", newState);

  useEffect(() => {
    if (didRun.current) return; // avoid dev double-run
    didRun.current = true;

    let active = true; // avoid setState after unmount

    const run = async () => {
      // 1) Set today's midnight as "YYYY-MM-DD 00:00:00"
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const toDateStr = `${yyyy}-${mm}-${dd} 00:00:00`;

      setNewState((prev) => ({ ...prev, toDate: toDateStr }));

      // 2) Fetch startDate and set fromDate
      const requestBody = {
        columns: "id,startDate",
        tableName: "tblFinancialYear",
        whereCondition: `clientId = ${clientId} and id = ${defaultFinYearId} and companyId = ${defaultCompanyId}`,
        clientIdCondition: `status = 1 FOR JSON PATH,INCLUDE_NULL_VALUES`,
      };

      try {
        const reportData = await fetchReportData(requestBody);
        if (!active) return;
        if (reportData?.success === true && Array.isArray(reportData.data)) {
          const startDate = reportData.data[0]?.startDate; // e.g. "2025-10-16 00:00:00"
          if (startDate) {
            setNewState((prev) => ({ ...prev, fromDate: startDate }));
          }
        }
      } catch (e) {
        console.error("fetchReportData failed:", e);
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []); // keep empty to run once on mount

  useEffect(() => {
    const rt = searchParamsReportType ?? "";
    const bt = searchParamsBalanceType ?? "";

    // only update if both exist (non-empty) and actually changed
    if (rt && bt) {
      setNewState((prev) => {
        const next = {
          ...prev,
          reportType: String(rt),
          balanceType: String(bt),
        };
        return prev.reportType === next.reportType &&
          prev.balanceType === next.balanceType
          ? prev
          : next;
      });
      fetchTrialBalanceData();
    }
  }, [searchParamsReportType, searchParamsBalanceType]);

  const getLabelValue = (labelValue) => {
    setLabelName(labelValue);
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const requestBody = {
          columns: "id",
          tableName: "tblMenu",
          whereCondition: "menuName='Ledger' AND menuType='D'",
          clientIdCondition: "status=1 FOR JSON PATH, INCLUDE_NULL_VALUES",
        };

        const res = await fetchReportData(requestBody);
        const id = res?.data?.[0]?.id;
        if (!cancelled && id) setMenuId(id);
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // useEffect(() => {
  //   if (newState?.reportType && newState?.reportType !== selectedRadio) {
  //     setSelectedRadio(newState?.reportType);
  //   }

  //   if (newState?.balanceType && newState?.balanceType !== selectedRadioType) {
  //     setSelectedRadioType(newState?.balanceType);
  //   }
  // }, [
  //   newState?.reportType,
  //   newState?.balanceType,
  //   selectedRadio,
  //   selectedRadioType,
  // ]);

  const handleFieldValuesChange = (updatedValues) => {
    const entries = Object.entries(updatedValues);
    const hasFile = entries.some(([, value]) => value instanceof File);

    if (hasFile) {
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          handleFileAndUpdateState(value, (jsonData) => {
            setNewState((prevState) => {
              const newState = { ...prevState, [key]: jsonData };
              return newState;
            });
            setFilterCondition((prevState) => {
              const newFilterCondition = { ...prevState, [key]: jsonData };
              return newFilterCondition;
            });
          });
        } else {
          setNewState((prevState) => {
            const newState = { ...prevState, [key]: value };
            return newState;
          });
          setFilterCondition((prevState) => {
            const newFilterCondition = { ...prevState, [key]: value };
            return newFilterCondition;
          });
          SetFormDataChange((prevState) => {
            const newState = { ...prevState, ...updatedValues };
            return newState;
          });
        }
      });
    } else {
      setNewState((prevState) => {
        const newState = { ...prevState, ...updatedValues };
        return newState;
      });
      SetFormDataChange((prevState) => {
        const newState = { ...prevState, ...updatedValues };
        return newState;
      });
      setFilterCondition((prevState) => {
        const newFilterCondition = { ...prevState, ...updatedValues };
        return newFilterCondition;
      });
    }
  };

  const formatDate = (date) => {
    // no selection / empty -> null
    if (date == null || date === "") return null;

    // accept Date, string, or timestamp
    const d = date instanceof Date ? date : new Date(date);

    // invalid date -> null
    if (Number.isNaN(d.getTime())) return null;

    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toIntOrNull = (v) => {
    if (v === null || v === undefined) return null; // null/undefined → null
    const s = typeof v === "string" ? v.trim() : v; // trim strings
    if (s === "") return null; // empty string → null
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null; // NaN → null
  };

  // const requestBody = {
  //     fromDate: "01/04/2024",
  //     toDate: "08/11/2024",
  //     branchId: "5818",
  //     clientId: "13",
  //     finYearId: "16",
  //   };

  const fetchTrialBalanceData = async () => {
    const { clientId } = getUserDetails();
    const { defaultFinYearId } = getUserDetails();
    const { defaultBranchId } = getUserDetails();
    setLoader(true);
    if (!newState?.fromDate || !newState?.toDate) {
      toast.error("Please select From Date and To Date.");
      return;
    }
    const requestBody = {
      fromDate: formatDate(newState?.fromDate),
      toDate: formatDate(newState?.toDate),
      branchId: toIntOrNull(defaultBranchId),
      clientId: toIntOrNull(clientId),
      finYearId: toIntOrNull(defaultFinYearId),
      tbGroupId: toIntOrNull(searchParamsTbGroupId),
    };

    const data = await trialBalanceReportData(requestBody);
    if (data?.success == true && data?.data.length > 0) {
      toast.success(data?.message);
      setBalanceSheetData(data?.data?.length > 0 ? data?.data : null);
      if (newState?.reportType && newState?.reportType !== selectedRadio) {
        setSelectedRadio(newState?.reportType);
      }
      if (
        newState?.balanceType &&
        newState?.balanceType !== selectedRadioType
      ) {
        setSelectedRadioType(newState?.balanceType);
      }
    } else {
      toast.error(data?.message || data?.error);
      setBalanceSheetData([]);
      return;
    }
  };

  return (
    <>
      <React.Fragment>
        <Accordion
          expanded={toggle}
          sx={{ ...parentAccordionSection }}
          key={1}
          setTypeofModal={setTypeofModal}
          getLabelValue={getLabelValue}
        >
          {/* Accordion Summary */}
          <AccordionSummary
            className="relative left-[11px]"
            expandIcon={
              <LightTooltip title={toggle ? "Collapse" : "Expand"}>
                <ExpandMoreIcon sx={{ color: "black" }} />
              </LightTooltip>
            }
            aria-controls={`panel${1 + 1}-content`}
            id={`panel${1 + 1}-header`}
            onClick={() => setToggle((prev) => !prev)}
          >
            <Typography className="relative right-[11px]">
              {"Trial Balance"}
            </Typography>
          </AccordionSummary>
          {/* Accordion Details */}
          <AccordionDetails
            className={`!pb-0 overflow-hidden ${styles.thinScrollBar}`}
            sx={{ ...accordianDetailsStyle }}
          >
            {/* Custom Input Fields */}

            <CustomeInputFields
              inputFieldData={parentsFields}
              values={newState}
              onValuesChange={handleFieldValuesChange}
              onChangeHandler={(result) => {
                handleChangeFunction(result);
              }}
              onBlurHandler={(result) => {
                handleBlurFunction(result);
              }}
              clearFlag={clearFlag}
              formControlData={formControlData}
              formDataChange={formDataChange}
              setFormControlData={setFormControlData}
              setStateVariable={setNewState}
              getLabelValue={() => {
                console.log("sample");
              }}
            />

            <div className="flex mt-2">
              <button
                onClick={async () => {
                  await fetchTrialBalanceData();
                }}
                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              >
                Go
              </button>
              {/* <button
                // onClick={async () => {
                //   await handleExportToExcel();
                // }}
                style={{ marginLeft: "8px" }}
                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              >
                Export to Excel
              </button>
              <button
                // onClick={async () => {
                //   await handleExportToPDF(selectedBalanceAndProfitAndLossRadio);
                // }}
                style={{ marginLeft: "8px" }}
                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              >
                Export to Pdf
              </button> */}
            </div>
          </AccordionDetails>
        </Accordion>
      </React.Fragment>
      <TrialBalanceComponent
        balanceSheetData={balanceSheetData}
        reportTypeData={selectedRadio}
        reportBalanceType={selectedRadioType}
        menuId={menuId}
        tableToggle={toggle}
      />
    </>
  );
};

export default TrialBalance;



    // {
    //   id: 79325,
    //   fieldname: "scopeOfWork",
    //   yourlabel: "Scope Of Work",
    //   controlname: "multiselect",
    //   isControlShow: true,
    //   isGridView: false,
    //   isDataFlow: false,
    //   copyMappingName: null,
    //   hyperlinkValue: null,
    //   isCommaSeparatedOrCount: null,
    //   isAuditLog: null,
    //   keyToShowOnGrid: null,
    //   isDummy: false,
    //   dropDownValues: null,
    //   referenceTable: "tblMasterData",
    //   referenceColumn: "name",
    //   type: 6653,
    //   typeValue: "number",
    //   size: "100",
    //   ordering: 13.1,
    //   gridTotal: false,
    //   gridTypeTotal: null,
    //   toolTipMessage: null,
    //   isRequired: false,
    //   isEditable: true,
    //   isSwitchToText: false,
    //   isBreak: false,
    //   dropdownFilter:
    //     "and masterListId in (Select id from tblMasterList where name = 'tblChargeGroup') and groupId in (Select id from tblMasterData where name = 'Sea')",
    //   controlDefaultValue: null,
    //   functionOnChange: "",
    //   functionOnBlur: null,
    //   functionOnKeyPress: null,
    //   sectionHeader: "Quotation Details",
    //   sectionOrder: 1,
    //   isCopy: false,
    //   isCopyEditable: false,
    //   isEditableMode: "e",
    //   position: "top",
    //   isHideGrid: false,
    //   isHideGridHeader: false,
    //   isGridExpandOnLoad: false,
    //   clientId: 1,
    //   isColumnVisible: false,
    //   isColumnDisabled: null,
    //   columnsToDisabled: null,
    //   columnsToHide: null,
    //   columnsToBeVisible: true,
    // },