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
import { AccountingReport } from "@/services/auth/FormControl.services.js";
import { fetchReportData } from "@/services/auth/FormControl.services.js";
import { accountData } from "@/constant/data";
import "jspdf-autotable";
import { getUserDetails } from "@/helper/userDetails";
import { toast } from "react-toastify";
import { exportLocalPDFReports } from "@/services/auth/FormControl.services";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import { fontFamilyStyles } from "@/app/globalCss";
import PNLGrid from "@/components/Accounting/PNLGrid";
import { useSearchParams } from "next/navigation";
import { balanceSheetReportData } from "@/services/auth/FormControl.services.js";

const BalanceSheetPNL = () => {
  const searchParams = useSearchParams();
  const [toggle, setToggle] = useState(false);
  const [year, setYear] = useState("");
  const [companyBranch, setCompanyBranch] = useState(null);
  const [pageData, setPageData] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedRadio, setSelectedRadio] = useState("S");
  const [
    selectedBalanceAndProfitAndLossRadio,
    setSelectedBalanceAndProfitAndLossRadio,
  ] = useState("B");
  const [data, setData] = useState(accountData);
  const [data1, setData1] = useState(null);
  const [data2, setData2] = useState(null);
  const [loader, setLoader] = useState(null);
  const [reportType, setReportType] = useState("S");
  const { clientId } = getUserDetails();
  const { companyId } = getUserDetails();
  const { defaultFinYearId } = getUserDetails();
  const { defaultCompanyId } = getUserDetails();
  const { branchId } = getUserDetails();
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const { financialYear } = getUserDetails();
  const { emailId } = getUserDetails();
  const { userId } = getUserDetails();
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [reportOrientation, setReportOrientation] = useState("H");
  const [menuName, setMenuName] = useState(
    "Balance Sheet And Profit And Loss Report"
  );
  const initialFilterState = [
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
      isRequired: false,
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
      isRequired: false,
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
      dropdownFilter: `and companyId=${companyId}`,
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
      fieldname: "reportControl",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "B.BalanceSheet,P.P&L",
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
      yourlabel: "BS/P&L",
      ordering: 5,
    },
    {
      id: 133,
      fieldname: "reportOrientation",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "H.Horizontal,V.Vertical",
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditableMode: "b",
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "Orientation",
      type: "string",
      yourlabel: "Orientation",
      ordering: 6,
    },
    {
      id: 133,
      fieldname: "suppressZero",
      controlname: "checkbox",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "Suppress Zero",
      type: "boolean",
      yourlabel: "Suppress Zero",
      ordering: 7,
    },
  ];
  const gridRef = useRef();
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [newState, setNewState] = useState({
    companybranchIddropdown: [],
    companybranchId: null,
    reportType: "S",
    reportControl: "B",
    reportOrientation: "H",
    suppressZero: null,
    fromDate: null,
    toDate: null,
  });
  const [parentsFields, setParentsFields] = useState(initialFilterState);
  const [clearFlag, setClearFlag] = useState({
    isClear: false,
    fieldName: "",
  });
  const [formControlData, setFormControlData] = useState([]);
  const [formDataChange, SetFormDataChange] = useState({});
  const [filterCondition, setFilterCondition] = useState({});
  const [selectedRadioType, setSelectedRadioType] = useState("B");
  const [eliminateZero, setEliminateZero] = useState(false);
  const didRun = useRef(false); // guards dev double-invoke

  const fieldNewState = [
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
      isRequired: false,
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
      isRequired: false,
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
      dropdownFilter: `and companyId=${companyId}`,
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
      fieldname: "reportControl",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "B.BalanceSheet,P.P&L",
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
      yourlabel: "BS/P&L",
      ordering: 5,
    },
    {
      id: 133,
      fieldname: "reportOrientation",
      controlname: "radio",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: "H.Horizontal,V.Vertical",
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditableMode: "b",
      isEditable: false,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "Orientation",
      type: "string",
      yourlabel: "Orientation",
      ordering: 6,
    },
    {
      id: 133,
      fieldname: "suppressZero",
      controlname: "checkbox",
      controlDefaultValue: null,
      dropdownFilter: null,
      dropDownValues: null,
      functionOnBlur: null,
      functionOnChange: null,
      functionOnKeyPress: null,
      isControlShow: true,
      isEditable: true,
      isRequired: false,
      referenceColumn: null,
      referenceTable: null,
      toolTipMessage: "suppress Zero",
      type: "boolean",
      yourlabel: "suppress Zero",
      ordering: 7,
    },
  ];

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

  const toIntOrNull = (v) => {
    if (v === null || v === undefined) return null; // null/undefined → null
    const s = typeof v === "string" ? v.trim() : v; // trim strings
    if (s === "") return null; // empty string → null
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : null; // NaN → null
  };

  useEffect(() => {
    // guard: don't run until we have a valid companyId
    if (!companyId) {
      setCompanyBranch([]);
      return;
    }

    let isCancelled = false; // prevents setState after unmount
    const controller = new AbortController(); // optional: cancel fetch if unmounted

    (async () => {
      try {
        const requestBody = {
          columns: "id,name",
          tableName: "tblCompanyBranch",
          whereCondition: `companyId = ${companyId} `,
          clientIdCondition: `status = 1 FOR JSON PATH,INCLUDE_NULL_VALUES`,
        };
        // if your fetchReportData accepts an options object, pass the signal
        const reportData = await fetchReportData(requestBody, {
          signal: controller.signal,
        });

        if (!isCancelled) {
          // normalize: some APIs return { data }, some return the array directly
          setCompanyBranch(reportData?.data ?? reportData ?? []);
        }
      } catch (err) {
        // ignore abort errors; log real ones
        if (err?.name !== "AbortError") {
          console.error("fetch company branches failed:", err);
        }
      }
    })();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [companyId]);

  useEffect(() => {
    if (newState?.reportType && newState?.reportType === "D") {
      setParentsFields(fieldNewState);
      setNewState((pre) => {
        return {
          ...pre,
          reportOrientation: "H",
        };
      });
    }
    if (newState?.reportType && newState?.reportType === "S") {
      setParentsFields(initialFilterState);
    }
  }, [newState?.reportType]);

  // useEffect(() => {
  //   if (newState?.reportType && newState?.reportType !== selectedRadio) {
  //     setSelectedRadio(newState?.reportType);
  //   }

  //   if (
  //     newState?.reportOrientation &&
  //     newState?.reportOrientation !== reportOrientation
  //   ) {
  //     setReportOrientation(newState?.reportOrientation);
  //   }

  //   if (newState?.eliminateZero && newState?.eliminateZero !== eliminateZero) {
  //     setEliminateZero(newState?.eliminateZero);
  //   }

  //   if (
  //     newState?.reportControl &&
  //     newState?.reportControl !== selectedBalanceAndProfitAndLossRadio
  //   ) {
  //     setSelectedBalanceAndProfitAndLossRadio(newState?.reportControl);
  //   }
  // }, [
  //   newState?.reportType,
  //   newState?.reportControl,
  //   selectedRadio,
  //   selectedBalanceAndProfitAndLossRadio,
  // ]);

  console.log("newState", newState);

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getLabelValue = (labelValue) => {
    setLabelName(labelValue);
  };

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

  const fetchBalanceSheetData = async () => {
    const { clientId } = getUserDetails();
    const { defaultFinYearId } = getUserDetails();
    const { defaultBranchId } = getUserDetails();
    setLoader(true);
    // if (!newState?.fromDate || !newState?.toDate) {
    //   toast.error("Please select From Date and To Date.");
    //   return;
    // }
    const requestBody = {
      fromDate: formatDate(newState?.fromDate), //"01/04/2025",
      toDate: formatDate(newState?.toDate), //"31/10/2025",
      branchId: toIntOrNull(defaultBranchId),
      clientId: toIntOrNull(clientId),
      finYearId: toIntOrNull(defaultFinYearId),
      tbGroupId: null,
      suppressZero:
        newState?.suppressZero == true
          ? 1
          : newState?.suppressZero == false
          ? 0
          : null,
    };

    const data = await balanceSheetReportData(requestBody);
    if (data?.success == true && data?.data.length > 0) {
      setBalanceSheetData(data?.data?.length > 0 ? data?.data : null);
      if (newState?.reportType && newState?.reportType !== selectedRadio) {
        setSelectedRadio(newState?.reportType);
      }
      if (
        newState?.reportControl &&
        newState?.reportControl !== selectedRadioType
      ) {
        console.log("newState?.reportControl", newState?.reportControl);
        setSelectedRadioType(newState?.reportControl);
      }
      if (
        newState?.reportOrientation &&
        newState?.reportOrientation !== reportOrientation
      ) {
        setReportOrientation(newState?.reportOrientation);
      }
    } else {
      toast.error(data?.message || data?.error);
      setBalanceSheetData([]);
      return;
    }
  };

  console.log("balanceSheetData", balanceSheetData);

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
              {menuName}
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
                type="button"
                onClick={async () => {
                  await fetchBalanceSheetData();
                }}
                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              >
                Go
              </button>

              <button
                type="button"
                onClick={() => {
                  gridRef.current?.exportToExcel();
                }}
                style={{ marginLeft: "8px" }}
                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              >
                Export to Excel
              </button>

              <button
                type="button"
                onClick={() => {
                  gridRef.current?.exportToPDF();
                }}
                style={{ marginLeft: "8px" }}
                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              >
                Export to PDF
              </button>
            </div>
          </AccordionDetails>
        </Accordion>
      </React.Fragment>

      <div className="mt-2">
        <PNLGrid
          ref={gridRef}
          balanceSheetData={balanceSheetData}
          selectedRadio={selectedRadio}
          reportOrientation={reportOrientation}
          eliminateZero={eliminateZero}
          selectedRadioType={selectedRadioType}
        />
      </div>
    </>
  );
};

export default BalanceSheetPNL;
//code complete
