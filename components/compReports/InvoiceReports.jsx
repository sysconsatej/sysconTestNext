'use client';
/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
// import { toWords } from 'number-to-words';

export const HeadingDetailsModule = ({ invoiceData }) => {
    const data = invoiceData?.data?.length > 0 ? invoiceData.data[0] : {};

    return (
        <div>
            <table className="tblhead" width="100%" style={{ borderCollapse: 'collapse', width: '100%', textAlign: 'left' }}>
                <tbody>
                    <tr>
                        <th className="txtLft tblhead" >CIN No.</th>
                        <td className="txtLft tblhead" >U63090MH2000PTC128187</td>
                        <th className="txtLft tblhead" >State</th>
                        <td className="txtLft tblhead" >MAHARASHTRA</td>
                        <th className="txtLft tblhead" >State Code</th>
                        <td className="txtLft tblhead" >27</td>
                        <th className="txtLft tblhead" >GSTIN</th>
                        <td className="txtLft tblhead" >27AAACF5231D1Z4</td>
                        <th className="txtLft tblhead" >PAN No.</th>
                        <td className="txtLft tblhead" >{data.panNo || ''}</td>
                    </tr>
                </tbody>
            </table>
            <hr className='hrRow' />
            <table className="tblhead mt-3" width="100%" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                    <tr>
                        <th className="txtLft tblhead">IRN</th>
                        <td className="txtLft">{data.irn || ''}</td>
                    </tr>
                </tbody>
            </table>
            <hr className='hrRow' />
        </div>
    );
};
HeadingDetailsModule.propTypes = {
    invoiceData: PropTypes.arrayOf(PropTypes.object)
};

export const CompanyBranchDetailsModule = ({ invoiceData }) => {
    const data = invoiceData?.data?.length > 0 ? invoiceData.data[0] : {};

    const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
    const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

    const invoiceDateString = data.invoiceDate;
    const dueDateString = data.dueDate;

    const invoiceDate = invoiceDateString ? new Date(invoiceDateString) : null;
    const dueDate = dueDateString ? new Date(dueDateString) : null;

    const InvoiceDatesFormat = invoiceDate ? `${invoiceDate.getDate()}/${invoiceDate.getMonth() + 1}/${invoiceDate.getFullYear()}` : '';
    const DueDatesFormat = dueDate ? `${dueDate.getDate()}/${dueDate.getMonth() + 1}/${dueDate.getFullYear()}` : '';

    return (
        <div>
            <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ width: '100%', maxWidth: '33.33%', padding: '0 10px' }}>
                    <table className='tblhead' style={{ marginTop: '15px', textAlign: 'left', width: '100%' }}>
                        <tbody>
                            <tr>
                                <th style={thStyle}>Billing Party Name :</th>
                                <td style={tdStyle}>{data.customerName || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Address:</th>
                                <td style={tdStyle}>{data.address || ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ width: '100%', maxWidth: '33.33%', padding: '0 10px' }}>
                    <table className='tblhead' style={{ marginTop: '15px', textAlign: 'left', width: '100%' }}>
                        <tbody>
                            <tr>
                                <th style={thStyle}>PAN No.:</th>
                                <td style={tdStyle}>{data.panNo || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>State:</th>
                                <td style={tdStyle}>{data.BillingState || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>State Code:</th>
                                <td style={tdStyle}>{data.BillingStateCode || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>GSTIN:</th>
                                <td style={tdStyle}>{data.gstinNo || ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ width: '100%', maxWidth: '33.33%', padding: '0 10px' }}>
                    <table className='tblhead' style={{ marginTop: '15px', textAlign: 'left', width: '100%' }}>
                        <tbody>
                            <tr>
                                <th style={thStyle}>Invoice No:</th>
                                <td style={tdStyle}>{data.invoiceNo || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Invoice Date:</th>
                                <td style={tdStyle}>{InvoiceDatesFormat || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Credit Period:</th>
                                <td style={tdStyle}>{data.creditPeriod || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Due Date:</th>
                                <td style={tdStyle}>{DueDatesFormat || ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <hr className='hrRow' style={{ borderTop: '1px solid #000', margin: '15px 0' }} />
        </div>
    );
};
CompanyBranchDetailsModule.propTypes = {
    invoiceData: PropTypes.arrayOf(PropTypes.object)
};


export const InvoiceJobDetailsModule = ({ invoiceData }) => {
    const data = invoiceData?.data?.length > 0 ? invoiceData.data[0] : {};

    const thStyle = { width: '20%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
    const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

    return (
        <div>
            <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ width: '100%', maxWidth: '33.33%', padding: '0 10px' }}>
                    <table className='tblhead' style={{ marginTop: '15px', textAlign: 'left', width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <th style={thStyle}>Job No.:</th>
                                <td style={tdStyle}>{data.Job || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>MB/L No.:</th>
                                <td style={tdStyle}>{data.MBLNo || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>HB/L No.:</th>
                                <td style={tdStyle}>{data.HBLNo || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>POL:</th>
                                <td style={tdStyle}>{data.POL || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>POD:</th>
                                <td style={tdStyle}>{data.POD || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Shipment Terms:</th>
                                <td style={tdStyle}>{data.ShipmentTerms || ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ width: '100%', maxWidth: '33.33%', padding: '0 10px', borderRight: '1px solid black' }}>
                    <table className='tblhead' style={{ marginTop: '15px', textAlign: 'left', width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <th style={thStyle}>Date:</th>
                                <td style={tdStyle}>{data.Date || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>PLR:</th>
                                <td style={tdStyle}>{data.PLR || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>FPD:</th>
                                <td style={tdStyle}>{data.FPD || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Size Type:</th>
                                <td style={tdStyle}>{data.SizeType || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>No of Pkg:</th>
                                <td style={tdStyle}>{data.NoOfPkg || ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style={{ width: '100%', maxWidth: '33.33%', padding: '0 10px' }}>
                    <table className='tblhead' style={{ marginTop: '15px', textAlign: 'left', width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <th style={thStyle}>Shipper:</th>
                                <td style={tdStyle}>{data.Shipper || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Consignee:</th>
                                <td style={tdStyle}>{data.Consignee || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Cargo Type:</th>
                                <td style={tdStyle}>{data.CargoType || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Shipper Ref.No.:</th>
                                <td style={tdStyle}>{data.ShipperRefNo || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Commodity:</th>
                                <td style={tdStyle}>{data.Commodity || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Cargo Weight:</th>
                                <td style={tdStyle}>{data.CargoWeight || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Ex. Rate:</th>
                                <td style={tdStyle}>{data.ExRate || ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <hr className='hrRow' style={{ borderTop: '1px solid #000', margin: '15px 0' }} />
        </div>
    );
};
InvoiceJobDetailsModule.propTypes = {
    invoiceData: PropTypes.arrayOf(PropTypes.object)
};


export const InvoiceContainerDetailsModule = ({ invoiceData }) => {

    const data = invoiceData?.data?.length > 0 ? invoiceData.data[0] : {};

    const thStyle = { width: '20%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
    const tdStyle = { width: '80%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

    return (
        <div>
            <div style={{ marginTop: '15px', display: 'flex', flexWrap: 'wrap' }}>
                <div style={{ width: '100%', padding: '0 10px' }}>
                    <table className='tblhead' style={{ marginTop: '15px', textAlign: 'left', width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <th style={thStyle}>Remarks:</th>
                                <td style={tdStyle}>{data.remarks || ''}</td>
                            </tr>
                            <tr>
                                <th style={thStyle}>Container No(s):</th>
                                <td style={tdStyle}>{data.containerNumbers || ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <hr className='hrRow' style={{ borderTop: '1px solid #000', margin: '15px 0' }} />
        </div>
    );
};
InvoiceContainerDetailsModule.propTypes = {
    invoiceData: PropTypes.arrayOf(PropTypes.object)
};

export const InvoiceGstModule = () => {
    // Assuming Data is structured correctly and contains an array of charge objects
    // const rateRequestCharge = Data && Array.isArray(Data) && Data.length > 0 ? Data[0].tblRateRequestCharge : [];

    // const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
    //     // Ensure that 'Not found' entries are sorted last
    //     if (a.sellCurrencyName === 'Not found') return 1;
    //     if (b.sellCurrencyName === 'Not found') return -1;
    //     // Sort based on the currency name
    //     return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
    // });

    // Calculate subtotals by currency
    // const subtotals = rateRequestCharge.reduce((acc, curr) => {
    //     const currency = curr.sellCurrencyName || 'Not found';
    //     if (!acc[currency]) {
    //         acc[currency] = { amount: 0, taxAmount: 0, totalAmount: 0 };
    //     }
    //     acc[currency].amount += curr.sellAmount || 0;
    //     acc[currency].taxAmount += curr.sellTaxAmount || 0;
    //     acc[currency].totalAmount += curr.sellTotalAmount || 0;
    //     return acc;
    // }, {});

    // const grandTotal = rateRequestCharge.reduce((acc, charge) => acc + (charge.sellTotalAmount || 0), 0);

    // const grandTotalInWords = toWords(grandTotal);

    return (
        <div>
            <div className="mt-3 flex flex-wrap">
                <div className="w-full md:w-1/2 px-2">
                    <div className="mt-3 flex flex-wrap">
                        <table className='tblhead mt-2 text-left text-xs' style={{ borderTop: '1px solid black', borderLeft: '1px solid black', borderBottom: '1px solid black', width: '100%' }}>
                            <thead>
                                <tr>
                                    <th className='text-center border-black border-b border-r pt-2'>HSN / SAC</th>
                                    <th className='text-center border-black border-b border-r pt-2'>INR Taxable Value</th>
                                    <th className='text-center border-black border-b border-r pt-2'>Rate</th>
                                    <th className='text-center border-black border-b border-r pt-2'>INR IGST</th>
                                    <th className='text-center border-black border-b border-r pt-2'>CGST</th>
                                    <th className='text-center border-black border-b border-r pt-2'>SGST</th>
                                    <th className='text-center border-black border-b border-r pt-2'>UGST</th>
                                </tr>
                            </thead>
                        </table>

                    </div>

                </div>
                <div className="w-full md:w-1/2 px-2">
                    <table className='mt-5 md:mt-0 ml-0 md:ml-20 text-left text-xs'>
                        <tr>
                            <p className='mt-3'>In case of discrepancy in the invoice amount, please notify within 2 days.
                            </p>
                        </tr>
                        <tr>
                            <p className='mt-3'>All payment to be issued in favour of
                            </p>
                        </tr>
                        <tr>
                        </tr>
                        <p className='mt-3'>For RTGS / NEFT Payment:
                        </p>
                        <tr>
                            <th className="pr-3">BANK NAME:</th>
                            <td className="pl-5"></td>
                        </tr>
                        <tr>
                            <th className="pr-3">BANK ADDRESS:</th>
                            <td className="pl-5"></td>
                        </tr>
                        <tr>
                            <th className="pr-3">CURRENT A/C NO.:</th>
                            <td className="pl-5"></td>
                        </tr>
                        <tr>
                            <th className="pr-3">SWIFT CODE:</th>
                            <td className="pl-5"></td>
                        </tr>
                        <tr>
                            <th className="pr-3">IFSC CODE:</th>
                            <td className="pl-5"></td>
                        </tr>
                    </table>
                </div>
            </div>
            <hr className='hrRow'></hr>
        </div>
    );
};
InvoiceGstModule.propTypes = {
    Data: PropTypes.arrayOf(PropTypes.object)
};

export const InvoiceTermsConditionModule = () => {
    return (
        <div>
            <div className="mt-3 flex flex-wrap ">

                <div className="w-full md:w-1/2 px-2">
                    <table className='mt-5 md:mt-0 ml-0  text-left text-xs'>
                        <tr>
                            <th className="pr-3">Terms And Condition:</th>
                            <td className="pl-5"></td>
                        </tr>
                    </table>
                </div>
                <div className="w-full md:w-1/2 px-2">
                    <table className='mt-5 md:mt-0 ml-0 md:ml-20 text-left text-xs'>
                        <tr>
                            <th className="pr-3">For</th>
                            <td className="pl-5"></td>
                        </tr>
                    </table>
                </div>
                <div className="w-full md:w-1/2 px-2">
                    <table className='mt-5 md:mt-0 ml-0  text-left text-xs'>
                        <tr>
                            <th className="pr-3"></th>
                            <td className="pl-5"></td>
                        </tr>
                    </table>
                </div>
                <div className="w-full md:w-1/2 px-2">
                    <table className='mt-5 md:mt-0 ml-0 md:ml-20 text-left text-xs'>
                        <tr>
                            <th className="pr-3">As Agents</th>
                            <td className="pl-5"></td>
                        </tr>
                    </table>
                </div>
            </div>
            <hr className='hrRow'></hr>
            <p className='mt-3'>This is a computer generated invoice no stamp and signature is required.
            </p>
            <hr className='hrRow'></hr>
        </div>
    );
};
// export const ExportChargeModule = ({ Data }) => {
//     // Assuming Data is structured correctly and contains an array of charge objects
//     const rateRequestCharge = Data && Array.isArray(Data) && Data.length > 0 ? Data[0].tblRateRequestCharge : [];

//     const sortedRateRequestCharge = rateRequestCharge.sort((a, b) => {
//         // Ensure that 'Not found' entries are sorted last
//         if (a.sellCurrencyName === 'Not found') return 1;
//         if (b.sellCurrencyName === 'Not found') return -1;
//         // Sort based on the currency name
//         return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
//     });

//     // Calculate subtotals by currency
//     const subtotals = rateRequestCharge.reduce((acc, curr) => {
//         const currency = curr.sellCurrencyName || 'Not found';
//         if (!acc[currency]) {
//             acc[currency] = { amount: 0, taxAmount: 0, totalAmount: 0 };
//         }
//         acc[currency].amount += curr.sellAmount || 0;
//         acc[currency].taxAmount += curr.sellTaxAmount || 0;
//         acc[currency].totalAmount += curr.sellTotalAmount || 0;
//         return acc;
//     }, {});

//     const grandTotal = rateRequestCharge.reduce((acc, charge) => acc + (charge.sellTotalAmount || 0), 0);

//     const grandTotalInWords = toWords(grandTotal);

//     return (
//         <div className="mt-3 flex flex-wrap">
//             <table className='tblhead mt-2 text-left text-xs' style={{ borderTop: '1px solid black', borderLeft: '1px solid black', borderBottom: '1px solid black', width: '100%' }}>
//                 <thead>
//                     <tr>
//                         <th className='text-center border-black border-b border-r pt-2'>DESCRIPTION</th>
//                         <th className='text-center border-black border-b border-r pt-2'>HSN/SAC Code</th>
//                         <th className='text-center border-black border-b border-r pt-2'>Qty</th>
//                         <th className='text-center border-black border-b border-r pt-2'>Rate</th>
//                         <th className='text-center border-black border-b border-r pt-2'>Curr</th>
//                         <th className='text-center border-black border-b border-r pt-2'>Ex. Rate</th>
//                         <th className='text-center border-black border-b border-r pt-2'>Taxable Amount</th>
//                         <th className='text-center border-black border-b border-r pt-2'>Tax Rat</th>
//                         <th className='text-center border-black border-b border-r pt-2'>IGST</th>
//                         <th className='text-center border-black border-b border-r pt-2'>CGST</th>
//                         <th className='text-center border-black border-b border-r pt-2'>SGST</th>
//                         <th className='text-center border-black border-b border-r pt-2'>UGST</th>
//                         <th className='text-center border-black border-b border-r pt-2'>Amount in INR</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {rateRequestCharge.map((item, index, array) => {
//                         // Render charge row
//                         const rows = [
//                             <tr key={`item-${index}`}>
//                                 <td className="text-center border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>
//                                     {`${item.chargeName || 'Not found'}${item.remarks ? ` (${item.remarks})` : ''}`}
//                                 </td>
//                                 <td className="text-center border-black border-b border-r py-px">{item.sizeName || 'Not found'} / {item.typeCode || 'Not found'}</td>
//                                 <td className="text-center border-black border-b border-r py-px">{typeof item.qty === 'number' ? item.qty.toFixed(2) : '0.00'}</td>
//                                 <td className="text-center border-black border-b border-r py-px">{item.sellCurrencyName || 'Not found'}</td>
//                                 <td className="text-center border-black border-b border-r py-px">{typeof item.sellExchangeRate === 'number' ? item.sellExchangeRate.toFixed(2) : '0.00'}</td>
//                                 <td className="text-center border-black border-b border-r py-px">{typeof item.sellRate === 'number' ? item.sellRate.toFixed(2) : '0.00'}</td>
//                                 <td className="text-center border-black border-b border-r py-px">{typeof item.sellAmount === 'number' ? item.sellAmount.toFixed(2) : '0.00'}</td>
//                                 <td className="text-center border-black border-b border-r py-px">{typeof item.sellTaxAmount === 'number' ? item.sellTaxAmount.toFixed(2) : '0.00'}</td>
//                                 <td className="text-center border-black border-b border-r pt-1">{typeof item.sellTotalAmount === 'number' ? item.sellTotalAmount.toFixed(2) : '0.00'}</td>
//                             </tr>
//                         ];

//                         // Check if this is the last item or the next item has a different currency
//                         const lastOfCurrency = index === array.length - 1 || array[index + 1].sellCurrencyName !== item.sellCurrencyName;
//                         if (lastOfCurrency) {
//                             // Add subtotal row
//                             const subtotal = subtotals[item.sellCurrencyName];
//                             rows.push(
//                                 <tr key={`subtotal-${item.sellCurrencyName}`}>
//                                     <td className=" border-black border-b border-r font-bold py-px " >Total ({item.sellCurrencyName}):</td>
//                                     <td className="text-center border-black border-b border-r"></td>
//                                     <td className="text-center border-black border-b border-r"></td>
//                                     <td className="text-center border-black border-b border-r"></td>
//                                     <td className="text-center border-black border-b border-r"></td>
//                                     <td className="text-center border-black border-b border-r"></td>
//                                     <td className="text-center border-black border-b border-r font-bold py-px">{subtotal.amount.toFixed(2)} INR</td>
//                                     <td className="text-center border-black border-b border-r font-bold py-px">{subtotal.taxAmount.toFixed(2)} INR</td>
//                                     <td className="text-center border-black border-b border-r font-bold py-px">{subtotal.totalAmount.toFixed(2)} INR</td>
//                                     <td className="text-center border-black border-b border-r"></td>
//                                 </tr>
//                             );
//                         }
//                         return rows;

//                     })}
//                 </tbody>
//             </table>
//             <div className="mt-2 flex flex-wrap" style={{ width: '100%' }}>
//                 <div className="text-xs w-full flex justify-between" style={{ borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}>
//                     <div className='mt-2 font-bold py-px '>Grand Total:</div>
//                     <div className='mt-2 mr-10 font-bold py-px '>{grandTotal.toFixed(2)} INR</div>
//                 </div>
//                 <div className="text-xs w-full flex justify-between" style={{ border: '1px solid black' }}>
//                     <div className='mt-2 font-bold py-px'>Amount in Words: </div>
//                     <div className='mt-2 font-bold py-px' style={{ marginRight: '55%' }}>{grandTotalInWords} ONLY</div>
//                 </div>
//             </div>
//         </div>
//     );
// };


const InvoiceReports = () => {
    return (
        <main>
            <HeadingDetailsModule />
            <CompanyBranchDetailsModule />
            <InvoiceJobDetailsModule />
            <InvoiceContainerDetailsModule />
            {/* <ExportChargeModule /> */}
            <InvoiceGstModule />
            <InvoiceTermsConditionModule />
        </main>
    );
};

export default InvoiceReports;