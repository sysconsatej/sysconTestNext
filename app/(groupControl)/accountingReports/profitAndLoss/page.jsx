"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useEffect, useState } from 'react';
import { parentAccordionSection, accordianDetailsStyle } from "@/app/globalCss";
import {
    Box, FormControl, InputLabel, OutlinedInput, Radio, RadioGroup, FormControlLabel, FormLabel, MenuItem, Select, TextField, Button,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import styles from "@/app/app.module.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LightTooltip from "@/components/Tooltip/customToolTip";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { BalanceSheetReport } from "@/services/auth/FormControl.services.js";
import ProfitAndLossComponent from '@/components/profitAndLossComponent/page';
import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import "jspdf-autotable";

const ProfitAndLoss = () => {
    const [toggle, setToggle] = useState(false);
    const [year, setYear] = useState('');
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedRadio, setSelectedRadio] = useState('S');
    const [balanceSheetData, setBalanceSheetData] = useState(null);
    const [reportData, setReportData] = useState({
        assetsData: [],
        liabilityData: [],
        totalAssets: 0,
        totalLiabilities: 0,
    });
    const [reportType, setReportType] = useState('S');

    const handleChange = (event) => {
        setYear(event.target.value);
    };

    useEffect(() => {
        setReportType(selectedRadio);
    }, [selectedRadio]);

    useEffect(() => {
        if (!balanceSheetData) return;

        // Process and filter data for Assets and Liabilities
        let assets = [];
        let liabilities = [];

        if (reportType === 'S') {
            assets = groupByTb1GroupNameSummary(balanceSheetData.filter(item => item.BalanceSheetName === 'Expense'));
            liabilities = groupByTb1GroupNameSummary(balanceSheetData.filter(item => item.BalanceSheetName === 'Income'));
        } else if (reportType === 'D') {
            assets = balanceSheetData.filter(item => item.BalanceSheetName === 'Expense')
                .sort((a, b) => a.tb1GroupName.localeCompare(b.tb1GroupName));
            liabilities = balanceSheetData.filter(item => item.BalanceSheetName === 'Income')
                .sort((a, b) => a.tb1GroupName.localeCompare(b.tb1GroupName));
        }

        // Calculate total balances for assets and liabilities
        const totalAssets = assets.reduce((sum, asset) => sum + Math.abs(asset.closingBalance), 0);
        const totalLiabilities = liabilities.reduce((sum, liability) => sum + Math.abs(liability.closingBalance), 0);

        // Set the state with the grouped data and totals
        setReportData({
            assetsData: assets,
            liabilityData: liabilities,
            totalAssets: totalAssets,
            totalLiabilities: totalLiabilities,
        });
    }, [balanceSheetData, reportType]);

    // Grouping logic for summary report
    const groupByTb1GroupNameSummary = (data) => {
        return data.reduce((acc, current) => {
            const groupName = current.tb1GroupName;
            const existingGroup = acc.find(item => item.tb1GroupName === groupName);
            if (existingGroup) {
                existingGroup.closingBalance += Math.abs(current.closingBalance);
            } else {
                acc.push({ ...current, closingBalance: Math.abs(current.closingBalance) });
            }
            return acc;
        }, []).filter(item => item.closingBalance !== 0);
    };

    async function handleExportToExcel(reportType) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Profit And Loss');

        worksheet.addRow([]); // Add some empty rows after the image to position the header
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Load the image
        const imageBuffer = await fetch('http://94.136.187.170:3016/api/images/NCLP/nclpLogo20241111075655020.jpg') // Replace with your image path
            .then((res) => res.arrayBuffer())
            .catch((err) => console.error('Error loading image:', err));

        // Add the image at the top (row 1, column 1)
        const imageId = workbook.addImage({
            buffer: imageBuffer,
            extension: 'jpg', // Assuming it's a PNG image
        });

        // Add the image to the worksheet at row 1, column 1 (top-left corner)
        if (reportType === 'S') {
            worksheet.addImage(imageId, 'A1:D6'); // Adjust the size and position as needed
        } else if (reportType === 'D') {
            worksheet.addImage(imageId, 'A1:F7'); // Adjust the size and position as needed
        }


        // Define the columns, conditionally excluding 2nd and 5th columns if reportType is 'S'
        let columns;
        let headerRow;

        if (reportType === 'S') {
            columns = [
                { key: 'liability', width: 20 },
                { key: 'balanceLiability', width: 15 },
                { key: 'assets', width: 20 },
                { key: 'balanceAsset', width: 15 },
            ];

            headerRow = worksheet.addRow([
                'Income', 'Balance', 'Expense', 'Balance'
            ]);
        } else {
            columns = [
                { key: 'liability', width: 20 },
                { key: 'glNameLiability', width: 25 },
                { key: 'balanceLiability', width: 15 },
                { key: 'assets', width: 20 },
                { key: 'glNameAsset', width: 25 },
                { key: 'balanceAsset', width: 15 },
            ];

            headerRow = worksheet.addRow([
                'Income', 'GL Name', 'Balance', 'Expense', 'GL Name', 'Balance'
            ]);
        }

        // Define columns for the worksheet
        worksheet.columns = columns;

        // Move the header to row 6
        worksheet.spliceRows(6, 0, headerRow); // Insert the header at row 6

        if (reportType === 'S') {
            // Style the header row (row 6)
            worksheet.getRow(9).eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '1E90FF' }, // Blue background
                };
                cell.font = { color: { argb: 'FFFFFF' }, bold: true }; // White text, bold
                cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center alignment
                cell.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } },
                };
            });
        } else if (reportType === 'D') {
            // Style the header row (row 6)
            worksheet.getRow(10).eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: '1E90FF' }, // Blue background
                };
                cell.font = { color: { argb: 'FFFFFF' }, bold: true }; // White text, bold
                cell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center alignment
                cell.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } },
                };
            });
        }


        const rowColors = ['FFFFFF', 'F2F2F2'];
        const maxRows = Math.max(reportData.liabilityData.length, reportData.assetsData.length);
        const merges = [];

        let liabilityStartRow = null;
        let assetStartRow = null;

        for (let i = 0; i < maxRows; i++) {
            const liability = reportData.liabilityData[i] || {};
            const asset = reportData.assetsData[i] || {};

            const row = worksheet.addRow({
                liability: liability.tb1GroupName || null,
                glNameLiability: reportType === 'S' ? null : liability.glName || null,
                balanceLiability: liability.closingBalance !== null ? liability.closingBalance || 0 : null,
                assets: asset.tb1GroupName || null,
                glNameAsset: reportType === 'S' ? null : asset.glName || null,
                balanceAsset: asset.closingBalance !== null ? asset.closingBalance || 0 : null,
            });

            const rowColor = rowColors[i % 2];
            row.eachCell((cell) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: rowColor },
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: '000000' } },
                    bottom: { style: 'thin', color: { argb: '000000' } },
                    left: { style: 'thin', color: { argb: '000000' } },
                    right: { style: 'thin', color: { argb: '000000' } },
                };
            });

            // Format balance cells as currency and set to "₹0.00" if balance is 0
            if (row.getCell('balanceLiability').value === 0) {
                row.getCell('balanceLiability').value = 0.00;
            }
            row.getCell('balanceLiability').numFmt = '"₹"#,##0.00;[Red]"₹"#,##0.00';

            if (row.getCell('balanceAsset').value === 0) {
                row.getCell('balanceAsset').value = 0.00;
            }
            row.getCell('balanceAsset').numFmt = '"₹"#,##0.00;[Red]"₹"#,##0.00';

            // Merge cells for Liability grouping
            if (liability.tb1GroupName) {
                if (liabilityStartRow === null || reportData.liabilityData[i - 1]?.tb1GroupName !== liability.tb1GroupName) {
                    liabilityStartRow = row.number;
                }

                const isEndOfLiabilityGroup = i === reportData.liabilityData.length - 1 || reportData.liabilityData[i + 1]?.tb1GroupName !== liability.tb1GroupName;
                if (isEndOfLiabilityGroup) {
                    merges.push({ startRow: liabilityStartRow, endRow: row.number, column: 1 });
                    liabilityStartRow = null;
                }
            }

            // Merge cells for Asset grouping
            if (asset.tb1GroupName) {
                if (assetStartRow === null || reportData.assetsData[i - 1]?.tb1GroupName !== asset.tb1GroupName) {
                    assetStartRow = row.number;
                }

                const isEndOfAssetGroup = i === reportData.assetsData.length - 1 || reportData.assetsData[i + 1]?.tb1GroupName !== asset.tb1GroupName;
                if (isEndOfAssetGroup) {
                    merges.push({ startRow: assetStartRow, endRow: row.number, column: 4 });
                    assetStartRow = null;
                }
            }
        }

        // Add Total Row with styling
        const totalRow = worksheet.addRow({
            liability: 'Total Income',
            balanceLiability: reportData.totalLiabilities || 0.00,
            assets: 'Total Expense',
            balanceAsset: reportData.totalAssets || 0.00,
        });

        totalRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '1E90FF' },
            };
            cell.font = { color: { argb: 'FFFFFF' }, bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        // Apply currency formatting to the total balance cells
        totalRow.getCell('balanceLiability').numFmt = '#,##0.00';
        totalRow.getCell('balanceAsset').numFmt = '#,##0.00';

        // Apply merges
        merges.forEach(({ startRow, endRow, column }) => {
            worksheet.mergeCells(startRow, column, endRow, column);
        });

        // Generate a Blob and trigger download
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Profit And Loss.xlsx');
    }

    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    // async function handleExportToPDF(reportType) {
    //     const workbook = new ExcelJS.Workbook();
    //     const worksheet = workbook.addWorksheet('Balance Sheet');

    //     // Load and convert the image
    //     const imageBuffer = await fetch('http://94.136.187.170:3016/api/images/NCLP/nclpLogo20241111075655020.jpg')
    //         .then((res) => res.arrayBuffer())
    //         .catch((err) => console.error('Error loading image:', err));

    //     const base64Image = `data:image/jpeg;base64,${arrayBufferToBase64(imageBuffer)}`;

    //     const imageId = workbook.addImage({
    //         buffer: imageBuffer,
    //         extension: 'jpg',
    //     });

    //     // Add image based on report type
    //     if (reportType === 'S') {
    //         worksheet.addImage(imageId, 'A1:D6');
    //     } else {
    //         worksheet.addImage(imageId, 'A1:F7');
    //     }

    //     let columns, headers;

    //     if (reportType === 'S') {
    //         columns = [
    //             { key: 'liability', width: 20 },
    //             { key: 'balanceLiability', width: 15 },
    //             { key: 'assets', width: 20 },
    //             { key: 'balanceAsset', width: 15 },
    //         ];
    //         headers = [['Liability', 'Balance', 'Assets', 'Balance']];
    //     } else {
    //         columns = [
    //             { key: 'liability', width: 20 },
    //             { key: 'glNameLiability', width: 25 },
    //             { key: 'balanceLiability', width: 15 },
    //             { key: 'assets', width: 20 },
    //             { key: 'glNameAsset', width: 25 },
    //             { key: 'balanceAsset', width: 15 },
    //         ];
    //         headers = [['Liability', 'GL Name', 'Balance', 'Assets', 'GL Name', 'Balance']];
    //     }

    //     worksheet.columns = columns;

    //     // Prepare data rows
    //     const rows = [];
    //     const maxRows = Math.max(reportData.liabilityData.length, reportData.assetsData.length);

    //     for (let i = 0; i < maxRows; i++) {
    //         const liability = reportData.liabilityData[i] || {};
    //         const asset = reportData.assetsData[i] || {};

    //         const row = reportType === 'S'
    //             ? [
    //                 liability.tb1GroupName || "",
    //                 liability.closingBalance || "0",
    //                 asset.tb1GroupName || "",
    //                 asset.closingBalance || "0"
    //             ]
    //             : [
    //                 liability.tb1GroupName || "",
    //                 liability.glName || "",
    //                 liability.closingBalance || "0",
    //                 asset.tb1GroupName || "",
    //                 asset.glName || "",
    //                 asset.closingBalance || "0"
    //             ];

    //         rows.push(row);
    //     }

    //     // Add total row
    //     rows.push(reportType === 'S'
    //         ? ["Total Liabilities", reportData.totalLiabilities || "0", "Total Assets", reportData.totalAssets || "0"]
    //         : ["Total Liabilities", "", reportData.totalLiabilities || "0", "Total Assets", "", reportData.totalAssets || "0"]
    //     );

    //     // Generate PDF
    //     const doc = new jsPDF();
    //     const pageWidth = doc.internal.pageSize.getWidth();
    //     const padding = 10;

    //     // Adjusted image dimensions for reduced height
    //     const imageWidth = pageWidth - 2 * padding; // Adjust for padding
    //     const aspectRatio = 30 / 15; // Original aspect ratio
    //     const imageHeight = imageWidth / aspectRatio * 0.3; // 70% of the original height

    //     doc.setFontSize(7);
    //     doc.addImage(base64Image, 'JPEG', padding, 10, imageWidth, imageHeight); // Image with reduced height

    //     doc.autoTable({
    //         head: headers,
    //         body: rows,
    //         startY: imageHeight + 10, // Adjust margin to bring table closer to image
    //         tableWidth: 'auto',
    //         margin: { left: padding, right: padding },
    //         headStyles: { fillColor: [7, 102, 173], textColor: [255, 255, 255], fontSize: 7 },
    //         bodyStyles: { halign: 'left', fontSize: 5 },
    //         columnStyles: reportType === 'S'
    //             ? { 1: { halign: 'right', cellWidth: 20 }, 3: { halign: 'right', cellWidth: 20 } }
    //             : { 2: { halign: 'right', cellWidth: 15 }, 5: { halign: 'right', cellWidth: 15 } },
    //         didDrawPage: function (data) {
    //             doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - padding - 30, doc.internal.pageSize.height - 10);
    //         }
    //     });

    //     doc.save('Balance_Sheet.pdf');
    // }
    // Utility function to convert ArrayBuffer to Base64
    function arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    const handleExportToPDF = () => {
        const htmlContent = ReactDOMServer.renderToStaticMarkup(
            <ProfitAndLossComponent
                balanceSheetData={balanceSheetData}
                reportTypeData={reportType}
            />
        );
    }


    const fetchBalanceSheetData = async () => {
        const requestBody = {
            fromDate: "01/04/2024",
            toDate: "30/09/2024",
            branchId: 27183
        };

        const data = await BalanceSheetReport(requestBody);
        if (data && data.length > 0) {
            setBalanceSheetData(data);
        } else {
            setBalanceSheetData(null);
        }
    };

    return (
        <>
            <Accordion
                expanded={toggle}
                sx={{ ...parentAccordionSection }}
                key={1}
            >
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
                        Profit And Loss
                    </Typography>
                </AccordionSummary>
                <AccordionDetails
                    className={`!pb-0 overflow-hidden ${styles.thinScrollBar} mb-2`}
                    sx={{ ...accordianDetailsStyle }}
                >
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" className="text-xs">
                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiInputBase-input": { fontSize: "0.7rem" }, }}>
                            <InputLabel className='bg-white p-1' sx={{ fontSize: "0.8rem" }} shrink>From Date</InputLabel>
                            <TextField type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} sx={{ fontSize: "0.7rem" }} InputLabelProps={{ shrink: true }} variant="outlined" />
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiInputBase-input": { fontSize: "0.7rem" }, }}>
                            <InputLabel className='bg-white p-1' sx={{ fontSize: "0.8rem" }} shrink>To Date</InputLabel>
                            <TextField type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} sx={{ fontSize: "0.7rem" }} InputLabelProps={{ shrink: true }} variant="outlined" />
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center", paddingRight: "32px" }, "& .MuiSelect-select": { fontSize: "0.7rem", paddingTop: "8px", paddingBottom: "8px" }, "& .MuiSvgIcon-root": { right: "8px", top: "50%", transform: "translateY(-50%)" }, }}>
                            <InputLabel sx={{ fontSize: "0.8rem" }} shrink>Branch</InputLabel>
                            <Select value={year || ""} onChange={(e) => setYear(e.target.value)} label="Branch" sx={{ fontSize: "0.7rem" }} displayEmpty renderValue={(selected) => selected || <em>Select Branch</em>}>
                                <MenuItem value={38333} sx={{ fontSize: "0.7rem" }}>COIMBATORE</MenuItem>
                                <MenuItem value={38385} sx={{ fontSize: "0.7rem" }}>DELHI</MenuItem>
                                <MenuItem value={8331} sx={{ fontSize: "0.7rem" }}>PUNE</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl component="fieldset" variant="outlined" size="small" className="ms-2" sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { height: "30px", display: "flex", alignItems: "center" }, "& .MuiFormControlLabel-root": { fontSize: "0.7rem" }, }}>
                            <FormLabel sx={{ fontSize: "0.6rem" }} component="legend">Report Type</FormLabel>
                            <RadioGroup row value={selectedRadio} onChange={(e) => setSelectedRadio(e.target.value)} sx={{ gap: 2 }}>
                                <FormControlLabel value="S" control={<Radio size="small" sx={{ fontSize: '0.6rem' }} />} label="S" />
                                <FormControlLabel value="D" control={<Radio size="small" sx={{ fontSize: '0.6rem' }} />} label="D" />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    <div className='flex mt-2'>
                        <button onClick={async () => { await fetchBalanceSheetData(); }} className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs">Go</button>
                        <button onClick={async () => { await handleExportToExcel(reportType); }} className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs ms-2">Export to Excel</button>
                        <button onClick={async () => { await handleExportToPDF(); }} className="bg-blue-700 hover:bg-blue-800 text-white font-bold pt-1 pb-1 px-4 rounded text-xs ms-2">Export to Pdf</button>
                    </div>
                </AccordionDetails>
            </Accordion>
            {balanceSheetData && balanceSheetData.length > 0 && (
                <ProfitAndLossComponent
                    balanceSheetData={balanceSheetData}
                    reportTypeData={reportType}
                />
            )}
        </>
    );
};

export default ProfitAndLoss;
