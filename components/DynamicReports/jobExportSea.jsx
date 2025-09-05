import React, { useEffect, useState } from 'react';
import { rptJobExportSea, rptSearchCreatia } from "@/services/auth/FormControl.services.js";
import styles from "@/components/common.module.css";
import PaginationButtons from '@/components/Pagination';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import JsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material';
import { get } from 'lodash';

function JobExportSea() {
    const [tableData, setTableData] = useState([]);
    const [grid, setGrid] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [itemsPerPage, setItemsPerPage] = useState(100);
    const isLastPage = currentPage === Math.ceil(tableData.length / itemsPerPage);


    useEffect(() => {
        rptSearchCreatia({
            "tableName": "tblReportSearchCriteria"
        }).then((data) => {
            setGrid(data.data[0].grid);
        });

    }, []);

    function isValidDate(value) {
        return moment(value, moment.ISO_8601, true).isValid();
    }

    const calculateGrandTotals = () => {
        const totals = {};
        tableData.forEach((job) => {
            grid.forEach(({ fieldname }) => {
                const value = get(job, fieldname);
                if (typeof value === 'number') {
                    if (!Object.prototype.hasOwnProperty.call(totals, fieldname)) {
                        totals[fieldname] = 0;
                    }
                    totals[fieldname] += value;
                }
            });
        });
        return totals;
    };

    const grandTotals = calculateGrandTotals();

    const handleGoClick = async () => {
        const requestData = {
            "projection": {

            }
        };
        const responseData = await rptJobExportSea(requestData);
        console.log(responseData)
        if (responseData && responseData.success) {
            setTableData(responseData.data);
        } else {
            console.error('No data received or error occurred');
        }
    };

    const handleExportToExcel = () => {
        // Extract headers labels from the grid
        const headerLabels = grid.map(g => g.label);

        // Convert tableData to worksheet format with the headers
        const dataToExport = tableData.map(row => {
            return grid.reduce((acc, { fieldname, label }) => {
                let value = row[fieldname];
                if (typeof value === 'string' && isValidDate(value)) {
                    value = moment(value).format('DD-MM-YYYY');
                }
                acc[label] = value;
                return acc;
            }, {});
        });

        // Create a new workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(dataToExport, { header: headerLabels, skipHeader: true });
        const wb = XLSX.utils.book_new();

        // Add header labels with yellow background
        const header = headerLabels.map((label) => ({
            v: label,
            s: {
                fill: {
                    fgColor: { rgb: 'FFFF00' },
                },
                font: {
                    bold: true,
                },
                alignment: {
                    horizontal: 'center',
                    vertical: 'center',
                },
            },
        }));

        // Append the header with style to the first row in the worksheet
        XLSX.utils.sheet_add_json(ws, [header], { skipHeader: true, origin: 'A1' });

        // Append worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        // Write workbook and export
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

        saveAs(blob, 'export.xlsx');
    };

    const handleExportToPDF = () => {
        const unit = 'pt';
        const size = 'A4';
        const orientation = 'landscape';

        const doc = new JsPDF(orientation, unit, size);

        // Assuming you have an image URL or a base64 string
        const imageUrl = './NCLP.jpg'; // Adjust as necessary

        // Get page width and calculate new image dimensions for margins
        const pageWidth = doc.internal.pageSize.getWidth();
        const leftRightMargin = 40; // Margin on each side
        const newImageWidth = pageWidth - (leftRightMargin * 2); // Image width after considering margins
        const xPosition = leftRightMargin; // Starting x position for the image
        const imageHeight = 90; // Adjust as needed

        // Load the image into the PDF with adjusted width and position
        doc.addImage(imageUrl, 'PNG', xPosition, 10, newImageWidth, imageHeight);

        // Adjust the startY position of the autoTable to be below your image
        const headers = [grid.map(g => g.label)]; // Headers from grid labels

        // Mapping the data to match the headers
        const data = tableData.map(row =>
            grid.map(g => {
                let value = row[g.fieldname];
                if (typeof value === 'string' && isValidDate(value)) {
                    value = moment(value).format('DD-MM-YYYY');
                }
                return value;
            })
        );

        let content = {
            startY: 100, // Adjust based on the height of your image + some padding
            head: headers,
            body: data,
            theme: 'grid',
            styles: {
                fontSize: 6, // Smaller font size for the table data
            },
            headStyles: {
                fontSize: 8, // Slightly larger font size for headers, adjust as needed
            }
        };

        doc.autoTable(content);
        doc.save('report.pdf');
    };

    const lastItemIndex = currentPage * itemsPerPage;
    const firstItemIndex = lastItemIndex - itemsPerPage;
    const currentItems = tableData.slice(firstItemIndex, lastItemIndex);

    // const handlePageChange = (page) => {
    //     setCurrentPage(page);
    // };

    const renderTableData = (job) => {
        return grid.map((item) => {
            // Access the value, supporting nested paths
            let value = get(job, item.fieldname);
            // Format date if applicable
            if (typeof value === 'string' && isValidDate(value)) {
                value = moment(value).format('DD-MM-YYYY');
            }
            return (
                <TableCell key={item.fieldname} className={`${styles.tableCell} whitespace-nowrap text-gray-900 text-xs`}>
                    {value}
                </TableCell>
            );
        });
    };

    const renderGrandTotalRow = () => {
        return (
            <TableRow>
                {grid.map(({ fieldname }, index) => {
                    let displayValue = "";
                    if (index === 0) {
                        // Set the label for the first cell
                        displayValue = "Grand Total";
                    } else if (Object.prototype.hasOwnProperty.call(grandTotals, fieldname)) {
                        // Format number to two decimal places if it's a decimal number
                        const value = grandTotals[fieldname];
                        displayValue = typeof value === 'number' ? 
                            Number.isInteger(value) ? value.toString() : value.toFixed(2) : 
                            '';
                    }
                    
                    return (
                        <TableCell key={fieldname} className={`${styles.tableCell} whitespace-nowrap text-gray-900 text-xs`}>
                            {displayValue}
                        </TableCell>
                    );
                })}
            </TableRow>
        );
    };    

    return (
        <>
            <div className="my-2 mt-4">
                <button onClick={handleGoClick} className="bg-blue-800 text-white rounded p-2 w-auto text-xs hover:bg-blue-600" style={{ opacity: 1, cursor: 'pointer' }}>
                    Go
                </button>
                <button onClick={handleExportToExcel} className="bg-blue-800 text-white rounded ml-2 p-2 w-auto text-xs hover:bg-blue-600" style={{ opacity: 1, cursor: 'pointer' }}>
                    Export to Excel
                </button>
                <button onClick={handleExportToPDF} className="bg-blue-800 text-white rounded ml-2 p-2 w-auto text-xs hover:bg-blue-600" style={{ opacity: 1, cursor: 'pointer' }}>
                    Export to PDF
                </button>
            </div>
            <div className={`${styles.scroll} overflow-x-auto border border-gray-200 rounded-lg`} style={{ maxHeight: '450px', overflowY: 'auto' }}>
                <Table className="min-w-full text-sm">
                    <TableHead className="text-white">
                        <TableRow className={`${styles.tblHead}`}>
                            {grid.map((item) => (
                                <TableCell key={item.fieldname}
                                    className={`${styles.tableCell} whitespace-nowrap text-xs`}
                                    style={{
                                        position: 'sticky',
                                        top: 0,
                                        color: '#fff',
                                        backgroundColor: '#1565C0',
                                        zIndex: 999,
                                    }}>
                                    {item.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentItems.map((job) => (
                            <TableRow key={job._id} className="hover:bg-gray-100">
                                {renderTableData(job)}
                            </TableRow>
                        ))}
                        {isLastPage && renderGrandTotalRow()}
                    </TableBody>
                </Table>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <PaginationButtons
                    totalPages={Math.ceil(tableData.length / itemsPerPage)}
                    currentPage={currentPage}
                    pageSelected={setCurrentPage}
                />
            </div>
        </>
    );
}

export default JobExportSea;