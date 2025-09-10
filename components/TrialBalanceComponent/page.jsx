/* eslint-disable */
import React, { useEffect, useState } from 'react';
import './trialBalance.css';

function TrialBalanceComponent({ balanceSheetData, reportTypeData, reportBalanceType }) {
    const [reportData, setReportData] = useState([]);
    const [reportType, setReportType] = useState(reportTypeData);
    const [balanceType, setBalanceType] = useState(reportBalanceType);
    const [reportTitle, setReportTitle] = useState('');

    // Update reportType and balanceType when props change
    useEffect(() => {
        setReportType(reportTypeData);
        setBalanceType(reportBalanceType);
    }, [reportTypeData, reportBalanceType]);

    // Recalculate report data when balanceSheetData, reportType, or balanceType changes
    useEffect(() => {
        if (!balanceSheetData) return;

        let title = '';
        let aggregatedData = {};

        if (reportType === 'S') {
            if (balanceType === 'O') {
                title = 'Opening Balance';
                aggregatedData = balanceSheetData.reduce((acc, item) => {
                    const key = `${item.BalanceSheetName}-${item.tb1GroupName}`;
                    if (!acc[key]) {
                        acc[key] = {
                            BalanceSheetName: item.BalanceSheetName,
                            tb1GroupName: item.tb1GroupName,
                            drBalance: item.openingBalance > 0 ? item.openingBalance : 0,
                            crBalance: item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0,
                        };
                    } else {
                        acc[key].drBalance += item.openingBalance > 0 ? item.openingBalance : 0;
                        acc[key].crBalance += item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0;
                    }
                    return acc;
                }, {});
            } else if (balanceType === 'C') {
                title = 'Closing Balance';
                aggregatedData = balanceSheetData.reduce((acc, item) => {
                    const key = `${item.BalanceSheetName}-${item.tb1GroupName}`;
                    if (!acc[key]) {
                        acc[key] = {
                            BalanceSheetName: item.BalanceSheetName,
                            tb1GroupName: item.tb1GroupName,
                            drBalance: item.closingBalance > 0 ? item.closingBalance : 0,
                            crBalance: item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
                        };
                    } else {
                        acc[key].drBalance += item.closingBalance > 0 ? item.closingBalance : 0;
                        acc[key].crBalance += item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
                    }
                    return acc;
                }, {});
            } else if (balanceType === 'E') {
                title = 'Extended Balance';
                aggregatedData = balanceSheetData.reduce((acc, item) => {
                    const key = `${item.BalanceSheetName}-${item.tb1GroupName}`;
                    if (!acc[key]) {
                        acc[key] = {
                            BalanceSheetName: item.BalanceSheetName,
                            tb1GroupName: item.tb1GroupName,
                            drBalanceOpeningBalance: item.openingBalance > 0 ? item.openingBalance : 0,
                            crBalanceOpeningBalance: item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0,
                            drBalanceTransactionBalance: item.transactionBalance > 0 ? item.transactionBalance : 0,
                            crBalanceTransactionBalance: item.transactionBalance < 0 ? Math.abs(item.transactionBalance) : 0,
                            drBalanceClosingBalance: item.closingBalance > 0 ? item.closingBalance : 0,
                            crBalanceClosingBalance: item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
                        };
                    } else {
                        acc[key].drBalanceOpeningBalance += item.openingBalance > 0 ? item.openingBalance : 0;
                        acc[key].crBalanceOpeningBalance += item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0;
                        acc[key].drBalanceTransactionBalance += item.transactionBalance > 0 ? item.transactionBalance : 0;
                        acc[key].crBalanceTransactionBalance += item.transactionBalance < 0 ? Math.abs(item.transactionBalance) : 0;
                        acc[key].drBalanceClosingBalance += item.closingBalance > 0 ? item.closingBalance : 0;
                        acc[key].crBalanceClosingBalance += item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
                    }
                    return acc;
                }, {});
            }
        }

        if (reportType === 'D') {
            if (balanceType === 'O') {
                title = 'Opening Balance';
                aggregatedData = balanceSheetData.reduce((acc, item) => {
                    const key = `${item.BalanceSheetName}-${item.tb1GroupName}-${item.glName}`;

                    // Initialize if the key doesn't exist
                    if (!acc[key]) {
                        acc[key] = {
                            BalanceSheetName: item.BalanceSheetName,
                            tb1GroupName: item.tb1GroupName,
                            glName: item.glName,  // Ensure glName is added
                            drBalanceOpeningBalance: item.openingBalance > 0 ? item.openingBalance : 0,
                            crBalanceOpeningBalance: item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0,
                            drBalanceTransactionBalance: item.transactionBalance > 0 ? item.transactionBalance : 0,
                            crBalanceTransactionBalance: item.transactionBalance < 0 ? Math.abs(item.transactionBalance) : 0,
                            drBalanceClosingBalance: item.closingBalance > 0 ? item.closingBalance : 0,
                            crBalanceClosingBalance: item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
                        };
                    } else {
                        // Aggregate balance values for each glName
                        acc[key].drBalanceOpeningBalance += item.openingBalance > 0 ? item.openingBalance : 0;
                        acc[key].crBalanceOpeningBalance += item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0;
                        acc[key].drBalanceTransactionBalance += item.transactionBalance > 0 ? item.transactionBalance : 0;
                        acc[key].crBalanceTransactionBalance += item.transactionBalance < 0 ? Math.abs(item.transactionBalance) : 0;
                        acc[key].drBalanceClosingBalance += item.closingBalance > 0 ? item.closingBalance : 0;
                        acc[key].crBalanceClosingBalance += item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
                    }

                    return acc;
                }, {});
            } else if (balanceType === 'C') {
                title = 'Closing Balance';
                aggregatedData = balanceSheetData.reduce((acc, item) => {
                    const key = `${item.BalanceSheetName}-${item.tb1GroupName}-${item.glName}`;

                    // Initialize if the key doesn't exist
                    if (!acc[key]) {
                        acc[key] = {
                            BalanceSheetName: item.BalanceSheetName,
                            tb1GroupName: item.tb1GroupName,
                            glName: item.glName,  // Ensure glName is added
                            drBalanceClosingBalance: item.closingBalance > 0 ? item.closingBalance : 0,
                            crBalanceClosingBalance: item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
                        };
                    } else {
                        // Aggregate balance values for each glName
                        acc[key].drBalanceClosingBalance += item.closingBalance > 0 ? item.closingBalance : 0;
                        acc[key].crBalanceClosingBalance += item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
                    }

                    return acc;
                }, {});
            } else if (balanceType === 'E') {
                title = 'Extended Balance';
                aggregatedData = balanceSheetData.reduce((acc, item) => {
                    const key = `${item.BalanceSheetName}-${item.tb1GroupName}-${item.glName}`;

                    // Initialize if the key doesn't exist
                    if (!acc[key]) {
                        acc[key] = {
                            BalanceSheetName: item.BalanceSheetName,
                            tb1GroupName: item.tb1GroupName,
                            glName: item.glName,  // Ensure glName is added
                            drBalanceOpeningBalance: item.openingBalance > 0 ? item.openingBalance : 0,
                            crBalanceOpeningBalance: item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0,
                            drBalanceTransactionBalance: item.transactionBalance > 0 ? item.transactionBalance : 0,
                            crBalanceTransactionBalance: item.transactionBalance < 0 ? Math.abs(item.transactionBalance) : 0,
                            drBalanceClosingBalance: item.closingBalance > 0 ? item.closingBalance : 0,
                            crBalanceClosingBalance: item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0,
                        };
                    } else {
                        // Aggregate balance values for each glName
                        acc[key].drBalanceOpeningBalance += item.openingBalance > 0 ? item.openingBalance : 0;
                        acc[key].crBalanceOpeningBalance += item.openingBalance < 0 ? Math.abs(item.openingBalance) : 0;
                        acc[key].drBalanceTransactionBalance += item.transactionBalance > 0 ? item.transactionBalance : 0;
                        acc[key].crBalanceTransactionBalance += item.transactionBalance < 0 ? Math.abs(item.transactionBalance) : 0;
                        acc[key].drBalanceClosingBalance += item.closingBalance > 0 ? item.closingBalance : 0;
                        acc[key].crBalanceClosingBalance += item.closingBalance < 0 ? Math.abs(item.closingBalance) : 0;
                    }

                    return acc;
                }, {});
            }

        }

        setReportTitle(title);
        setReportData(Object.values(aggregatedData).sort((a, b) =>
            a.BalanceSheetName.localeCompare(b.BalanceSheetName) ||
            a.tb1GroupName.localeCompare(b.tb1GroupName)
        ));
    }, [balanceSheetData, reportType, balanceType]);

    if (!balanceSheetData) return <div>No data available</div>;

    function renderGroupedRows(data) {
        let groupedRows = [];
        let lastBalanceSheetName = '';
        let rowSpanCount = 0;

        // Initialize grand total accumulators
        let drBalanceGrandTotal = 0;
        let crBalanceGrandTotal = 0;

        data.forEach((item, index) => {
            const isNewGroup = item.BalanceSheetName !== lastBalanceSheetName;
            if (isNewGroup) {
                // Calculate row span for the current BalanceSheetName
                rowSpanCount = data.filter(d => d.BalanceSheetName === item.BalanceSheetName).length;
                lastBalanceSheetName = item.BalanceSheetName;
            }

            // Accumulate totals for grand total row
            drBalanceGrandTotal += item.drBalance ?? 0;
            crBalanceGrandTotal += item.crBalance ?? 0;

            groupedRows.push(
                <tr key={index}>
                    {isNewGroup ? <td className='text-black' rowSpan={rowSpanCount}>{item.BalanceSheetName}</td> : null}
                    <td className='text-black'>{item.tb1GroupName}</td>
                    <td className="text-right text-black">{item.drBalance?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || '0.00'}</td>
                    <td className="text-right text-black">{item.crBalance?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) || '0.00'}</td>
                </tr>
            );
        });

        // Add the grand total row at the end
        groupedRows.push(
            <tr key="grand-total" className="grand-total-row bg-gray-300">
                <td colSpan={2} className="text-black text-right font-bold">Grand Total</td>
                <td className="text-right text-black font-bold">
                    {drBalanceGrandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black font-bold">
                    {crBalanceGrandTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                </td>
            </tr>
        );

        return groupedRows;
    }


    function renderGroupedRowsOpeningDetailed(data) {
        let groupedRows = [];
        let lastBalanceSheetName = '';
        let lastTb1GroupName = '';
        let balanceSheetRowSpanCount = 0;
        let tb1GroupRowSpanCount = 0;

        // Initialize variables to keep track of subtotal and grand total balances
        let drOpeningSubtotal = 0;
        let crOpeningSubtotal = 0;

        let drOpeningGrandTotal = 0;
        let crOpeningGrandTotal = 0;

        data.forEach((item, index) => {
            const isNewBalanceSheetGroup = item.BalanceSheetName !== lastBalanceSheetName;
            const isNewTb1Group = item.tb1GroupName !== lastTb1GroupName;

            // Update rowSpanCount for new groups, including subtotal rows
            if (isNewBalanceSheetGroup) {
                balanceSheetRowSpanCount = data.filter(d => d.BalanceSheetName === item.BalanceSheetName).length;

                // Calculate the number of subtotals for this BalanceSheetName
                const tb1GroupNames = new Set(data.filter(d => d.BalanceSheetName === item.BalanceSheetName).map(d => d.tb1GroupName));
                balanceSheetRowSpanCount += tb1GroupNames.size; // Include subtotal rows

                lastBalanceSheetName = item.BalanceSheetName;
            }
            if (isNewTb1Group) {
                tb1GroupRowSpanCount = data.filter(d => d.tb1GroupName === item.tb1GroupName).length;
                lastTb1GroupName = item.tb1GroupName;

                // Reset subtotals for a new group
                drOpeningSubtotal = 0;
                crOpeningSubtotal = 0;
            }

            // Accumulate totals for each group
            drOpeningSubtotal += item.drBalanceOpeningBalance ?? 0;
            crOpeningSubtotal += item.crBalanceOpeningBalance ?? 0;

            // Render each row of data
            groupedRows.push(
                <tr key={index}>
                    {isNewBalanceSheetGroup ? (
                        <td className='text-black' rowSpan={balanceSheetRowSpanCount}>{item.BalanceSheetName}</td>
                    ) : null}
                    {isNewTb1Group ? (
                        <td className='text-black' rowSpan={tb1GroupRowSpanCount}>{item.tb1GroupName}</td>
                    ) : null}
                    {reportType === 'D' && balanceType === 'O' ? <td className='text-black'>{item.glName}</td> : null}
                    <td className="text-right text-black">
                        {(item.drBalanceOpeningBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.crBalanceOpeningBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                </tr>
            );

            // Add a subtotal row after the last item of each tb1GroupName
            const isLastItemInGroup = index === data.length - 1 || data[index + 1].tb1GroupName !== item.tb1GroupName;
            if (isLastItemInGroup) {
                groupedRows.push(
                    <tr key={`subtotal-${index}`} className="subtotal-row">
                        <td colSpan={reportType === 'D' && balanceType === 'O' ? 2 : 1} className="text-black text-right uppercase"><strong>Subtotal</strong></td>
                        <td className="text-right text-black">
                            {drOpeningSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                        <td className="text-right text-black">
                            {crOpeningSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                    </tr>
                );

                // Accumulate subtotals into grand totals
                drOpeningGrandTotal += drOpeningSubtotal;
                crOpeningGrandTotal += crOpeningSubtotal;
            }
        });

        // Add the grand total row at the end
        groupedRows.push(
            <tr key="grand-total" className="grand-total-row">
                <td colSpan={reportType === 'D' && balanceType === 'O' ? 3 : 1} className="text-black font-bold text-right bg-gray-300 uppercase"><strong>Grand Total</strong></td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {drOpeningGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {crOpeningGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
            </tr>
        );

        return groupedRows;
    }

    function renderGroupedRowsClosingDetailed(data) {
        let groupedRows = [];
        let lastBalanceSheetName = '';
        let lastTb1GroupName = '';
        let balanceSheetRowSpanCount = 0;
        let tb1GroupRowSpanCount = 0;

        // Initialize variables to keep track of subtotal and grand total balances
        let drClosingSubtotal = 0;
        let crClosingSubtotal = 0;

        let drClosingGrandTotal = 0;
        let crClosingGrandTotal = 0;

        data.forEach((item, index) => {
            const isNewBalanceSheetGroup = item.BalanceSheetName !== lastBalanceSheetName;
            const isNewTb1Group = item.tb1GroupName !== lastTb1GroupName;

            // Update rowSpanCount for new groups, including subtotal rows
            if (isNewBalanceSheetGroup) {
                balanceSheetRowSpanCount = data.filter(d => d.BalanceSheetName === item.BalanceSheetName).length;

                // Calculate the number of subtotals for this BalanceSheetName
                const tb1GroupNames = new Set(data.filter(d => d.BalanceSheetName === item.BalanceSheetName).map(d => d.tb1GroupName));
                balanceSheetRowSpanCount += tb1GroupNames.size; // Include subtotal rows

                lastBalanceSheetName = item.BalanceSheetName;
            }
            if (isNewTb1Group) {
                tb1GroupRowSpanCount = data.filter(d => d.tb1GroupName === item.tb1GroupName).length;
                lastTb1GroupName = item.tb1GroupName;

                // Reset subtotals for a new group
                drClosingSubtotal = 0;
                crClosingSubtotal = 0;
            }

            // Accumulate totals for each group
            drClosingSubtotal += item.drBalanceClosingBalance ?? 0;
            crClosingSubtotal += item.crBalanceClosingBalance ?? 0;

            // Render each row of data
            groupedRows.push(
                <tr key={index}>
                    {isNewBalanceSheetGroup ? (
                        <td className='text-black' rowSpan={balanceSheetRowSpanCount}>{item.BalanceSheetName}</td>
                    ) : null}
                    {isNewTb1Group ? (
                        <td className='text-black' rowSpan={tb1GroupRowSpanCount}>{item.tb1GroupName}</td>
                    ) : null}
                    {reportType === 'D' && balanceType === 'C' ? <td className='text-black'>{item.glName}</td> : null}
                    <td className="text-right text-black">
                        {(item.drBalanceClosingBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.crBalanceClosingBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                </tr>
            );

            // Add a subtotal row after the last item of each tb1GroupName
            const isLastItemInGroup = index === data.length - 1 || data[index + 1].tb1GroupName !== item.tb1GroupName;
            if (isLastItemInGroup) {
                groupedRows.push(
                    <tr key={`subtotal-${index}`} className="subtotal-row">
                        <td colSpan={reportType === 'D' && balanceType === 'C' ? 2 : 1} className="text-black text-right uppercase"><strong>Subtotal</strong></td>
                        <td className="text-right text-black">
                            {drClosingSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                        <td className="text-right text-black">
                            {crClosingSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                    </tr>
                );

                // Accumulate subtotals into grand totals
                drClosingGrandTotal += drClosingSubtotal;
                crClosingGrandTotal += crClosingSubtotal;
            }
        });

        // Add the grand total row at the end
        groupedRows.push(
            <tr key="grand-total" className="grand-total-row">
                <td colSpan={reportType === 'D' && balanceType === 'C' ? 3 : 1} className="text-black font-bold text-right bg-gray-300 uppercase"><strong>Grand Total</strong></td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {drClosingGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {crClosingGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
            </tr>
        );

        return groupedRows;
    }

    function renderGroupedRowsTransaction(data) {
        let groupedRows = [];
        let lastBalanceSheetName = '';
        let lastTb1GroupName = '';
        let balanceSheetRowSpanCount = 0;
        let tb1GroupRowSpanCount = 0;

        // Initialize variables to keep track of subtotal and grand total balances
        let drOpeningSubtotal = 0;
        let crOpeningSubtotal = 0;
        let drTransactionSubtotal = 0;
        let crTransactionSubtotal = 0;
        let drClosingSubtotal = 0;
        let crClosingSubtotal = 0;

        let drOpeningGrandTotal = 0;
        let crOpeningGrandTotal = 0;
        let drTransactionGrandTotal = 0;
        let crTransactionGrandTotal = 0;
        let drClosingGrandTotal = 0;
        let crClosingGrandTotal = 0;

        data.forEach((item, index) => {
            const isNewBalanceSheetGroup = item.BalanceSheetName !== lastBalanceSheetName;
            const isNewTb1Group = item.tb1GroupName !== lastTb1GroupName;

            // Update rowSpanCount for new groups, including subtotal rows
            if (isNewBalanceSheetGroup) {
                balanceSheetRowSpanCount = data.filter(d => d.BalanceSheetName === item.BalanceSheetName).length;

                // Calculate the number of subtotals for this BalanceSheetName
                const tb1GroupNames = new Set(data.filter(d => d.BalanceSheetName === item.BalanceSheetName).map(d => d.tb1GroupName));
                balanceSheetRowSpanCount += tb1GroupNames.size; // Include subtotal rows

                lastBalanceSheetName = item.BalanceSheetName;
            }
            if (isNewTb1Group) {
                tb1GroupRowSpanCount = data.filter(d => d.tb1GroupName === item.tb1GroupName).length;
                lastTb1GroupName = item.tb1GroupName;

                // Reset subtotals for a new group
                drOpeningSubtotal = 0;
                crOpeningSubtotal = 0;
                drTransactionSubtotal = 0;
                crTransactionSubtotal = 0;
                drClosingSubtotal = 0;
                crClosingSubtotal = 0;
            }

            // Accumulate totals for each group
            drOpeningSubtotal += item.drBalanceOpeningBalance ?? 0;
            crOpeningSubtotal += item.crBalanceOpeningBalance ?? 0;
            drTransactionSubtotal += item.drBalanceTransactionBalance ?? 0;
            crTransactionSubtotal += item.crBalanceTransactionBalance ?? 0;
            drClosingSubtotal += item.drBalanceClosingBalance ?? 0;
            crClosingSubtotal += item.crBalanceClosingBalance ?? 0;

            // Render each row of data
            groupedRows.push(
                <tr key={index}>
                    {isNewBalanceSheetGroup ? (
                        <td className='text-black' rowSpan={balanceSheetRowSpanCount}>{item.BalanceSheetName}</td>
                    ) : null}
                    {isNewTb1Group ? (
                        <td className='text-black' rowSpan={tb1GroupRowSpanCount}>{item.tb1GroupName}</td>
                    ) : null}
                    {reportType === 'D' && balanceType === 'E' ? <td className='text-black'>{item.glName}</td> : null}
                    <td className="text-right text-black">
                        {(item.drBalanceOpeningBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.crBalanceOpeningBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.drBalanceTransactionBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.crBalanceTransactionBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.drBalanceClosingBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.crBalanceClosingBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                </tr>
            );

            // Add a subtotal row after the last item of each tb1GroupName
            const isLastItemInGroup = index === data.length - 1 || data[index + 1].tb1GroupName !== item.tb1GroupName;
            if (isLastItemInGroup) {
                groupedRows.push(
                    <tr key={`subtotal-${index}`} className="subtotal-row">
                        <td colSpan={reportType === 'D' && balanceType === 'E' ? 2 : 1} className="text-black text-right uppercase"><strong>Subtotal</strong></td>
                        <td className="text-right text-black">
                            {drOpeningSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                        <td className="text-right text-black">
                            {crOpeningSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                        <td className="text-right text-black">
                            {drTransactionSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                        <td className="text-right text-black">
                            {crTransactionSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                        <td className="text-right text-black">
                            {drClosingSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                        <td className="text-right text-black">
                            {crClosingSubtotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                        </td>
                    </tr>
                );

                // Accumulate subtotals into grand totals
                drOpeningGrandTotal += drOpeningSubtotal;
                crOpeningGrandTotal += crOpeningSubtotal;
                drTransactionGrandTotal += drTransactionSubtotal;
                crTransactionGrandTotal += crTransactionSubtotal;
                drClosingGrandTotal += drClosingSubtotal;
                crClosingGrandTotal += crClosingSubtotal;
            }
        });

        // Add the grand total row at the end
        groupedRows.push(
            <tr key="grand-total" className="grand-total-row">
                <td colSpan={reportType === 'D' && balanceType === 'E' ? 3 : 1} className="text-black font-bold text-right bg-gray-300 uppercase"><strong>Grand Total</strong></td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {drOpeningGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {crOpeningGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {drTransactionGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {crTransactionGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {drClosingGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black bg-gray-300 font-bold">
                    {crClosingGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
            </tr>
        );

        return groupedRows;
    }

    function renderGroupedRowsTransactionSummary(data) {
        let groupedRows = [];
        let lastBalanceSheetName = '';
        let lastTb1GroupName = '';
        let balanceSheetRowSpanCount = 0;
        let tb1GroupRowSpanCount = 0;

        // Initialize variables to keep track of grand total balances
        let drOpeningGrandTotal = 0;
        let crOpeningGrandTotal = 0;
        let drTransactionGrandTotal = 0;
        let crTransactionGrandTotal = 0;
        let drClosingGrandTotal = 0;
        let crClosingGrandTotal = 0;

        data.forEach((item, index) => {
            const isNewBalanceSheetGroup = item.BalanceSheetName !== lastBalanceSheetName;
            const isNewTb1Group = item.tb1GroupName !== lastTb1GroupName;

            // Update rowSpanCount for new groups
            if (isNewBalanceSheetGroup) {
                balanceSheetRowSpanCount = data.filter(d => d.BalanceSheetName === item.BalanceSheetName).length;
                lastBalanceSheetName = item.BalanceSheetName;
            }
            if (isNewTb1Group) {
                tb1GroupRowSpanCount = data.filter(d => d.tb1GroupName === item.tb1GroupName).length;
                lastTb1GroupName = item.tb1GroupName;
            }

            // Accumulate totals for the grand total row
            drOpeningGrandTotal += item.drBalanceOpeningBalance ?? 0;
            crOpeningGrandTotal += item.crBalanceOpeningBalance ?? 0;
            drTransactionGrandTotal += item.drBalanceTransactionBalance ?? 0;
            crTransactionGrandTotal += item.crBalanceTransactionBalance ?? 0;
            drClosingGrandTotal += item.drBalanceClosingBalance ?? 0;
            crClosingGrandTotal += item.crBalanceClosingBalance ?? 0;

            groupedRows.push(
                <tr key={index}>
                    {isNewBalanceSheetGroup ? (
                        <td className='text-black' rowSpan={balanceSheetRowSpanCount}>{item.BalanceSheetName}</td>
                    ) : null}
                    {isNewTb1Group ? (
                        <td className='text-black' rowSpan={tb1GroupRowSpanCount}>{item.tb1GroupName}</td>
                    ) : null}
                    {reportType === 'D' && balanceType === 'E' ? <td className='text-black'>{item.glName}</td> : null}
                    <td className="text-right text-black ">
                        {(item.drBalanceOpeningBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right  text-black">
                        {(item.crBalanceOpeningBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.drBalanceTransactionBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.crBalanceTransactionBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.drBalanceClosingBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                    <td className="text-right text-black">
                        {(item.crBalanceClosingBalance ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                    </td>
                </tr>
            );
        });

        // Add the grand total row at the end
        groupedRows.push(
            <tr key="grand-total" className="grand-total-row bg-gray-300">
                <td colSpan={reportType === 'D' && balanceType === 'E' ? 2 : 1} className="text-black text-left"><strong>Grand Total:</strong></td>
                <td></td>
                <td className="text-right text-black">
                    {drOpeningGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black">
                    {crOpeningGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black">
                    {drTransactionGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black">
                    {crTransactionGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black">
                    {drClosingGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
                <td className="text-right text-black">
                    {crClosingGrandTotal.toLocaleString(undefined, { style: 'currency', currency: 'INR' })}
                </td>
            </tr>
        );

        return groupedRows;
    }

    return (
        <div id='htmlContent'>
            <div id='replaceDiv' className="scroll-container thinScrollBar">
                {reportType === 'S' && (balanceType === 'O' || balanceType === 'C') ? (
                    <table className="table">
                        <thead>
                            <tr><th colSpan="2" className="text-center">Group</th><th colSpan="2" className="text-center">{reportTitle}</th></tr>
                            <tr><th className='text-center'>Balance Sheet</th><th className='text-center'>Trial Balance</th><th className='text-center'>Dr</th><th className='text-center'>Cr</th></tr>
                        </thead>
                        <tbody>{renderGroupedRows(reportData)}</tbody>
                    </table>
                ) : reportType === 'S' && balanceType === 'E' ? (
                    <table className="table">
                        <thead>
                            <tr><th colSpan="2" className="text-center">Group</th><th colSpan="2" className="text-center">Opening</th><th colSpan="2" className="text-center">Transaction</th><th colSpan="2" className="text-center">Closing</th></tr>
                            <tr><th className='text-center'>Balance Sheet</th><th className='text-center'>Trial Balance</th><th className='text-center'>Dr</th><th className='text-center'>Cr</th><th className='text-center'>Dr</th><th className='text-center'>Cr</th><th className='text-center'>Dr</th><th className='text-center'>Cr</th></tr>
                        </thead>
                        <tbody>{renderGroupedRowsTransactionSummary(reportData)}</tbody>
                    </table>
                ) : reportType === 'D' && (balanceType === 'O') ? (
                    <table className="table">
                        <thead>
                            <tr><th colSpan="3" className="text-center">Group</th><th colSpan="2" className="text-center">{reportTitle}</th></tr>
                            <tr><th className='text-center'>Balance Sheet</th><th className='text-center'>Trial Balance</th><th className='text-center'>Gl Name</th><th className='text-center'>Dr</th><th className='text-center'>Cr</th></tr>
                        </thead>
                        <tbody>{renderGroupedRowsOpeningDetailed(reportData)}</tbody>
                    </table>
                ) : reportType === 'D' && (balanceType === 'C') ? (
                    <table className="table">
                        <thead>
                            <tr><th colSpan="3" className="text-center">Group</th><th colSpan="2" className="text-center">{reportTitle}</th></tr>
                            <tr><th className='text-center'>Balance Sheet</th><th className='text-center'>Trial Balance</th><th className='text-center'>Gl Name</th><th className='text-center'>Dr</th><th className='text-center'>Cr</th></tr>
                        </thead>
                        <tbody>{renderGroupedRowsClosingDetailed(reportData)}</tbody>
                    </table>
                ) : reportType === 'D' && balanceType === 'E' ? (
                    <table className="table">
                        <thead>
                            <tr><th colSpan="3" className="text-center">Group</th><th colSpan="2" className="text-center">Opening</th><th colSpan="2" className="text-center">Transaction</th><th colSpan="2" className="text-center">Closing</th></tr>
                            <tr><th className='text-center'>Balance Sheet</th><th className='text-center'>Trial Balance</th><th className='text-center'>Gl Name</th><th className='text-center'>Dr</th><th className='text-center'>Cr</th><th className='text-center'>Dr</th><th className='text-center'>Cr</th><th className='text-center'>Dr</th><th className='text-center'>Cr</th></tr>
                        </thead>
                        <tbody>{renderGroupedRowsTransaction(reportData)}</tbody>
                    </table>
                ) : null}
            </div>
        </div>
    );

}

export default TrialBalanceComponent;
