"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
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
import ProfitAndLossComponent from "@/components/profitAndLossComponent/page";
import BalanceSheetComponent from "@/components/balanceSheetComponent/page";
import { accountData } from "@/constant/data";
import "jspdf-autotable";
import { getUserDetails } from "@/helper/userDetails";
import { toast } from "react-toastify";
import { exportLocalPDFReports } from "@/services/auth/FormControl.services";
import CustomeInputFields from "@/components/Inputs/customeInputFields";
import { fontFamilyStyles } from "@/app/globalCss";

const BalanceSheetPNL = () => {
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
  const { branchId } = getUserDetails();
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const { financialYear } = getUserDetails();
  const { emailId } = getUserDetails();
  const { userId } = getUserDetails();
  // --
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [menuName, setMenuName] = useState(
    "Balance Sheet And Profit And Loss Report"
  );
  const [newState, setNewState] = useState({
    companybranchIddropdown: [],
    companybranchId: null,
    reportType: "S",
    reportControl: "B",
    fromDate: null,
    toDate: null,
  });
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
  ]);
  const [clearFlag, setClearFlag] = useState({
    isClear: false,
    fieldName: "",
  });
  const [formControlData, setFormControlData] = useState([]);
  const [formDataChange, SetFormDataChange] = useState({});
  const [filterCondition, setFilterCondition] = useState({});

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
    if (newState?.reportType && newState?.reportType !== selectedRadio) {
      setSelectedRadio(newState?.reportType);
    }

    if (
      newState?.reportControl &&
      newState?.reportControl !== selectedBalanceAndProfitAndLossRadio
    ) {
      setSelectedBalanceAndProfitAndLossRadio(newState?.reportControl);
    }
  }, [
    newState?.reportType,
    newState?.reportControl,
    selectedRadio,
    selectedBalanceAndProfitAndLossRadio,
  ]);

  const handleExportToPDF = async () => {
    const htmlContentElement = document.getElementById("htmlContent");
    let htmlContent = htmlContentElement.innerHTML;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    const replaceDiv = tempDiv.querySelector("#replaceDiv");
    if (replaceDiv) {
      const newDiv = document.createElement("div");
      newDiv.setAttribute("id", "replaceDiv");
      newDiv.innerHTML = replaceDiv.innerHTML;
      replaceDiv.replaceWith(newDiv);
    }
    htmlContent = tempDiv.innerHTML;
    const initialHtml = `
        <!DOCTYPE html>
<html lang="en">
   <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
         .scroll-container {
         max-height: 80vh;
         overflow-y: auto;
         overflow-x: auto; /* Enable horizontal scrolling */
         display: flex;
         border: 1px solid #ddd;
         width: 100%;
         }
         .flex {
         display: flex;
         }
         .flex-row {
         flex-direction: row;
         flex-wrap: wrap; /* Allow wrapping on smaller screens */
         }
         .flex-1 {
         flex: 1;
         width: 100%;
         max-width: 50%; /* Ensure tables don't stretch too wide */
         }
         /* Sticky header styling */
         .sticky-header {
         position: sticky;
         top: 0;
         background-color: #f9f9f9;
         z-index: 1;
         padding: 8px;
         border-bottom: 2px solid #ddd;
         }
         .table {
         width: 100%;
         border-collapse: collapse;
         position: relative; /* Ensure sticky headers work */
         }
         .table thead {
         border: none;
         }
         .table th {
         text-align: left;
         border-bottom: 1px solid grey;
         background-color: #0766ad;
         color: white;
         padding: 5px;
         font-size: 10px;
         }
         .table td {
         border: 1px solid grey;
         padding: 5px;
         font-size: 7px;
         }
         .table tbody tr:hover {
         background-color: #d9dff1;
         }
         /* Optional: Remove margin on the last table */
         .flex-1:last-child {
         margin-right: 0;
         }
         .hideScrollbar::-webkit-scrollbar {
         width: 0.5em;
         }
         .hideScrollbar::-webkit-scrollbar-track {
         background-color: transparent;
         }
         .hideScrollbar::-webkit-scrollbar-thumb {
         background-color: transparent;
         }
         .thinScrollBar::-webkit-scrollbar {
         width: 0.5em;
         height: 0.5rem;
         }
         .thinScrollBar::-webkit-scrollbar-track {
         background-color: var(--accordionBodyBg);
         }
         .thinScrollBar::-webkit-scrollbar-thumb {
         background-color: var(--tableHeaderBg);
         border-radius: 10px;
         }
         .subtotal-row {
         background-color: #f2f2f2; /* Light gray */
         font-weight: bold; /* Optional: Make subtotal rows bold */
         }
         .table-wrapper {
         max-height: 400px; /* Set a max-height for the scrolling area */
         overflow-y: auto; /* Enable vertical scrolling */
         position: relative;
         }
         .sticky-header {
         position: sticky !important;
         top: 0;
         background-color: white;
         }
         .sticky-footer {
         position: sticky;
         bottom: 0;
         background-color: white;
         }
         .logo {
         max-width: 100%; /* Adjust as per design */
         height: auto;
         display: block;
         margin-bottom: 10px;
         }
      </style>
   </head>
   <body>
      <img 
         src="http://94.136.187.170:3016/api/images/NCLP/nclpLogo20241111075655020.jpg" 
         alt="NCLP Logo" 
         class="logo">
      `;
    const finalHtml = "</body></html>";
    const html = initialHtml + htmlContent + finalHtml;
    const pdfName =
      selectedBalanceAndProfitAndLossRadio === "B"
        ? "BalanceSheet"
        : "ProfitAndLoss";

    const requestBody = {
      orientation: "portrait",
      pdfFilename: pdfName,
      htmlContent: html,
    };

    try {
      const blob = await exportLocalPDFReports(requestBody);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", pdfName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF generated successfully.");
    } catch (error) {
      console.error("Error while generating PDF:", error);
    }
  };

  console.log("newState", newState);

  const formatDate = (date) => {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
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
    setLoader(true);
    const requestBody = {
      companyId: parseInt(companyId, 10),
      fromDate: formatDate(newState?.fromDate),
      toDate: formatDate(newState.toDate),
      branchId: newState?.companybranchId || null,
      finYearId: parseInt(financialYear, 10),
      pb: newState?.reportControl || null, // P or B
      sd: newState?.reportType || null, // S or D
      clientId: parseInt(clientId, 10),
    };
    //  pb: selectedBalanceAndProfitAndLossRadio,
    //   sd: selectedRadio,
    const data = await AccountingReport(requestBody);
    if (data) {
      setReportType(selectedRadio);
      setSelectedBalanceAndProfitAndLossRadio(
        selectedBalanceAndProfitAndLossRadio
      );
      setData1(data.data.array1);
      setData2(data.data.array2);
      toast.success("Data fetch successfully.");
    } else {
      setData1(null);
      setData2(null);
      toast.error("Fail To fetch The Data");
    }
  };

  return (
    <>
      {/* <Accordion expanded={toggle} sx={{ ...parentAccordionSection }} key={1}>
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
            Balance Sheet And Profit And Loss Report
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          className={`!pb-0 overflow-hidden ${styles.thinScrollBar} mb-2`}
          sx={{ ...accordianDetailsStyle }}
        >
          <Box
            display="flex"
            gap={2}
            alignItems="center"
            flexWrap="wrap"
            className="text-xs"
          >
            <FormControl
              variant="outlined"
              size="small"
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiInputBase-input": { fontSize: "0.7rem" },
              }}
            >
              <InputLabel
                className="bg-white p-1"
                sx={{ fontSize: "0.8rem" }}
                shrink
              >
                From Date
              </InputLabel>
              <TextField
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                sx={{ fontSize: "0.7rem" }}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </FormControl>

            <FormControl
              variant="outlined"
              size="small"
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiInputBase-input": { fontSize: "0.7rem" },
              }}
            >
              <InputLabel
                className="bg-white p-1"
                sx={{ fontSize: "0.8rem" }}
                shrink
              >
                To Date
              </InputLabel>
              <TextField
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                sx={{ fontSize: "0.7rem" }}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </FormControl>

            <FormControl
              // variant="outlined"
              size="small"
              className={`w-[12rem] ${styles.inputField} `}
              menuPlacement="auto"
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: "32px",
                },
                "& .MuiSelect-select": {
                  fontSize: "0.7rem",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                },
                "& .MuiSvgIcon-root": {
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                },
              }}
            >
              <InputLabel id="branch-label" sx={{ fontSize: "0.8rem" }} shrink>
                Branch
              </InputLabel>

              <Select
                labelId="branch-label"
                // Use "" when null so MUI shows the placeholder
                value={selectedBranchId ?? ""}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedBranchId(v === "" ? null : Number(v));
                }}
                label="Branch"
                sx={{ fontSize: "0.7rem" }}
                displayEmpty
                renderValue={(selected) => {
                  if (
                    selected === "" ||
                    selected === null ||
                    selected === undefined
                  ) {
                    return <em>Select Branch</em>;
                  }
                  const item = (companyBranch || []).find(
                    (b) => b.id === selected
                  );
                  return item?.name ?? "";
                }}
              >
                <MenuItem value="" sx={{ fontSize: "0.7rem" }}>
                  <em>Select Branch</em>
                </MenuItem>

                {(companyBranch || []).map((b) => (
                  <MenuItem key={b.id} value={b.id} sx={{ fontSize: "0.7rem" }}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl
              component="fieldset"
              variant="outlined"
              size="small"
              className="ms-2"
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiFormControlLabel-root": { fontSize: "0.7rem" },
              }}
            >
              <FormLabel sx={{ fontSize: "0.6rem" }} component="legend">
                Report Type
              </FormLabel>
              <RadioGroup
                row
                value={selectedRadio}
                onChange={(e) => setSelectedRadio(e.target.value)}
                sx={{ gap: 2 }}
              >
                <FormControlLabel
                  value="S"
                  control={<Radio size="small" sx={{ fontSize: "0.6rem" }} />}
                  label="S"
                />
                <FormControlLabel
                  value="D"
                  control={<Radio size="small" sx={{ fontSize: "0.6rem" }} />}
                  label="D"
                />
              </RadioGroup>
            </FormControl>

            <FormControl
              component="fieldset"
              variant="outlined"
              size="small"
              className="ms-2"
              sx={{
                minWidth: 150,
                "& .MuiOutlinedInput-root": {
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiFormControlLabel-root": { fontSize: "0.7rem" },
              }}
            >
              <FormLabel sx={{ fontSize: "0.6rem" }} component="legend">
                BS/P&L
              </FormLabel>
              <RadioGroup
                row
                value={selectedBalanceAndProfitAndLossRadio}
                onChange={(e) =>
                  setSelectedBalanceAndProfitAndLossRadio(e.target.value)
                }
                sx={{ gap: 2 }}
              >
                <FormControlLabel
                  value="B"
                  control={<Radio size="small" sx={{ fontSize: "0.6rem" }} />}
                  label="BalanceSheet"
                />
                <FormControlLabel
                  value="P"
                  control={<Radio size="small" sx={{ fontSize: "0.6rem" }} />}
                  label="P&L"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <div className="flex mt-2">
            <button
              onClick={async () => {
                await fetchBalanceSheetData();
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs"
            >
              Go
            </button>
            <button
              onClick={async () => {
                await handleExportToExcel();
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs ms-2"
            >
              Export to Excel
            </button>
            <button
              onClick={async () => {
                await handleExportToPDF(selectedBalanceAndProfitAndLossRadio);
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs ms-2"
            >
              Export to Pdf
            </button>
          </div>
        </AccordionDetails>
      </Accordion> */}

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

            {/* Button Grid
            <ButtonPanel
              buttonsData={buttonsData}
              handleButtonClick={handleButtonClick}
              isReport={true}
            /> */}
            <div className="flex mt-2">
              <button
                onClick={async () => {
                  await fetchBalanceSheetData();
                }}
                className={`${styles.commonBtn} font-[${fontFamilyStyles}]`}
              >
                Go
              </button>
              <button
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
              </button>
            </div>
          </AccordionDetails>
        </Accordion>
      </React.Fragment>

      {selectedBalanceAndProfitAndLossRadio === "B" &&
        data1 &&
        data1.length > 0 && (
          <BalanceSheetComponent
            data1={data1}
            data2={data2}
            reportTypeData={reportType}
            excelTest={pageData}
          />
        )}

      {selectedBalanceAndProfitAndLossRadio === "P" &&
        data1 &&
        data1.length > 0 && (
          <ProfitAndLossComponent
            data1={data1}
            data2={data2}
            reportTypeData={reportType}
            setLoader={loader}
          />
        )}
    </>
  );
};

export default BalanceSheetPNL;
