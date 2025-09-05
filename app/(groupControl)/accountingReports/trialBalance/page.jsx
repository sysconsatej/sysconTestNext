"use client";
/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { parentAccordionSection, accordianDetailsStyle } from "@/app/globalCss";
import {
    Box, FormControl, InputLabel, OutlinedInput, Radio, RadioGroup, FormControlLabel, FormLabel, MenuItem, Select, TextField, Button,
    Typography, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import styles from "@/app/app.module.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightTooltip from "@/components/Tooltip/customToolTip";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { BalanceSheetReport } from "@/services/auth/FormControl.services.js";
import TrialBalanceComponent from '@/components/TrialBalanceComponent/page';
import { toast } from "react-toastify";
import { exportLocalPDFReports } from "@/services/auth/FormControl.services";

const TrialBalance = () => {
    const [toggle, setToggle] = useState(false);
    const [year, setYear] = useState('');
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedRadio, setSelectedRadio] = useState('S');
    const [selectedRadioType, setSelectedRadioType] = useState('O');
    const [balanceSheetData, setBalanceSheetData] = useState(null);

    const handleExportToPDF = async () => {
        const htmlContentElement = document.getElementById('htmlContent');
        let htmlContent = htmlContentElement.innerHTML;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;

        const replaceDiv = tempDiv.querySelector('#replaceDiv');
        if (replaceDiv) {
            const newDiv = document.createElement('div');
            newDiv.setAttribute('id', 'replaceDiv');
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
  font-size: 11px;
}

.table td {
  border: 1px solid grey;
  padding: 5px;
  font-size: 10px;
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

.sticky-header {
  text-align: center;
  font-weight: bold;
  background-color: #005b96; /* Customize as needed */
  color: white;
  padding: 8px;
  border: 1px solid gray;
}

.text-right {
  text-align: right !important;
}

.text-center {
  text-align: center !important;
}

.subtotal-row {
  font-weight: bold;
  background-color: #f0f0f0;
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
        const pdfName = "TrialBalance";

        const requestBody = {
            orientation: "portrait",
            pdfFilename: pdfName,
            htmlContent: html
        };

        try {
            const blob = await exportLocalPDFReports(requestBody);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', pdfName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("PDF generated successfully.");
        } catch (error) {
            console.error("Error while generating PDF:", error);
        }
    };

    const handleChange = (event) => {
        setYear(event.target.value);
        fetchBalanceSheetData();
    };

    const fetchBalanceSheetData = async () => {
        const requestBody = {
            fromDate: "01/04/2024",
            toDate: "08/11/2024",
            branchId: 27183
        };

        const data = await BalanceSheetReport(requestBody);
        if (data) {
            toast.success("Data fetch successfully.");
            setBalanceSheetData(data?.length > 0 ? data : null);
        }
    };

    return (
        <>
            <Accordion expanded={toggle} sx={{ ...parentAccordionSection }} key={1}>
                <AccordionSummary
                    className="relative left-[11px]"
                    expandIcon={
                        <LightTooltip title={toggle ? "Collapse" : "Expand"}>
                            <ExpandMoreIcon sx={{ color: "black" }} />
                        </LightTooltip>
                    }
                    aria-controls="panel-content"
                    id="panel-header"
                    onClick={() => setToggle((prev) => !prev)}
                >
                    <Typography className="relative right-[11px]">Trial Balance</Typography>
                </AccordionSummary>
                <AccordionDetails
                    className={`!pb-0 overflow-hidden ${styles.thinScrollBar} mb-2`}
                    sx={{ ...accordianDetailsStyle }}
                >
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" className="text-xs">
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiInputBase-input": { fontSize: "0.7rem" } }}>
                            <InputLabel className='bg-white p-1' sx={{ fontSize: "0.8rem" }} shrink>From Date</InputLabel>
                            <TextField type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} sx={{ fontSize: "0.7rem" }} InputLabelProps={{ shrink: true }} variant="outlined" />
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiInputBase-input": { fontSize: "0.7rem" } }}>
                            <InputLabel className='bg-white p-1' sx={{ fontSize: "0.8rem" }} shrink>To Date</InputLabel>
                            <TextField type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} sx={{ fontSize: "0.7rem" }} InputLabelProps={{ shrink: true }} variant="outlined" />
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center", paddingRight: "32px" }, "& .MuiSelect-select": { fontSize: "0.7rem", paddingTop: "8px", paddingBottom: "8px" }, "& .MuiSvgIcon-root": { right: "8px", top: "50%", transform: "translateY(-50%)" } }}>
                            <InputLabel sx={{ fontSize: "0.8rem" }} shrink>Branch</InputLabel>
                            <Select value={year || ""} onChange={handleChange} label="Branch" sx={{ fontSize: "0.7rem" }} displayEmpty renderValue={(selected) => selected || <em>Select Branch</em>}>
                                <MenuItem value={38333} sx={{ fontSize: "0.7rem" }}>COIMBATORE</MenuItem>
                                <MenuItem value={38385} sx={{ fontSize: "0.7rem" }}>DELHI</MenuItem>
                                <MenuItem value={8331} sx={{ fontSize: "0.7rem" }}>PUNE</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl component="fieldset" variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <FormLabel sx={{ fontSize: "0.6rem" }} component="legend">Balance Type</FormLabel>
                            <RadioGroup row value={selectedRadioType} onChange={(e) => setSelectedRadioType(e.target.value)} sx={{ gap: 2 }}>
                                <FormControlLabel value="O" control={<Radio size="small" />} label="Opening" />
                                <FormControlLabel value="E" control={<Radio size="small" />} label="Extended" />
                                <FormControlLabel value="C" control={<Radio size="small" />} label="Closing" />
                            </RadioGroup>
                        </FormControl>

                        <FormControl component="fieldset" variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <FormLabel sx={{ fontSize: "0.6rem" }} component="legend">Report Type</FormLabel>
                            <RadioGroup row value={selectedRadio} onChange={(e) => setSelectedRadio(e.target.value)} sx={{ gap: 2 }}>
                                <FormControlLabel value="S" control={<Radio size="small" />} label="S" />
                                <FormControlLabel value="D" control={<Radio size="small" />} label="D" />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    <div className='flex mt-2'>
                        <button onClick={fetchBalanceSheetData} className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs">Go</button>
                        <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs ms-2">Export to Excel</button>
                        <button onClick={async () => { await handleExportToPDF(); }} className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs ms-2">Export to Pdf</button>
                    </div>
                    <br />
                </AccordionDetails>
            </Accordion>
            <TrialBalanceComponent
                balanceSheetData={balanceSheetData}
                reportTypeData={selectedRadio}
                reportBalanceType={selectedRadioType}
            />
        </>
    );
};

export default TrialBalance;
