'use client';

import React, { useEffect, useState } from 'react';
import 'tailwindcss/tailwind.css';
import './rptQuotation.css';
import { toWords } from 'number-to-words';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import PropTypes from 'prop-types';

export const CompanyImgModule = () => {
  return (
    <img
      src='https://github-production-user-asset-6210df.s3.amazonaws.com/152374724/307294071-c3b26872-e4dc-4f50-95e3-349872189951.jpg'
      alt='Company'
    />
  );
};



const ExportSeaQuotationModule = ({ Data }) => {
  const RequestDate = Data && Data.length > 0 ? new Date(Data[0].rateRequestDate) : null;
  const DatesFormat = RequestDate ? `${RequestDate.getDate()}/${RequestDate.getMonth() + 1}/${RequestDate.getFullYear()}` : '';

  return (
    <div className="flex flex-wrap">
      <div className="w-1/2 px-2">
        <table className='mt-1 text-left text-xs'>
          <tbody>
            <tr>
              <th>Customer: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].customerName !== 'Not found' ? Data[0].customerName : ''}</td>
            </tr>
            <tr className='mt-2'>
              <th>ATTN:</th>
              <td className="pl-5"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="w-1/2 px-2">
        <table className='mt-1 ml-20 text-left text-xs'>
          <tbody>
            <tr>
              <th>Quotation No:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].rateRequestNo !== 'Not found' ? Data[0].rateRequestNo : ''}</td>
            </tr>
            <tr>
              <th>Dated:</th>
              <td className="pl-5">{DatesFormat}</td>
            </tr>
            <tr>
              <th>Handled By:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].customerPerson !== 'Not found' ? Data[0].customerPerson : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="w-full px-2">
        <hr className='hrRow'></hr>
      </div>
    </div>
  );
};
ExportSeaQuotationModule.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    rateRequestDate: PropTypes.string,
    customerName: PropTypes.string,
    rateRequestNo: PropTypes.string,
    customerPerson: PropTypes.string,
  })).isRequired,
  jobData: PropTypes.arrayOf(PropTypes.object)
};



const ExportShipperModule = ({ Data }) => {
  return (
    <div className="mt-1 flex flex-wrap">
      <div className="w-1/2 px-2">
        <table className='mt-1 text-left text-xs'>
          <tbody>
            <tr>
              <th>Shipper:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].businessSegmentName !== 'Not found' ? Data[0].businessSegmentName : ''}</td>
            </tr>
            <tr>
              <th>Pickup Address:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].pickupAddress !== 'Not found' ? Data[0].pickupAddress : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="w-1/2 px-2">
        <table className='mt-1 ml-20 text-left text-xs'>
          <tbody>
            <tr>
              <th>Consignee:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].vendorId !== 'Not found' ? Data[0].vendorId : ''}</td>
            </tr>
            <tr>
              <th>Delivery Address:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].deliveryAddress !== 'Not found' ? Data[0].deliveryAddress : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

ExportShipperModule.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    businessSegmentName: PropTypes.string,
    pickupAddress: PropTypes.string,
    vendorId: PropTypes.string,
    deliveryAddress: PropTypes.string,
  })).isRequired,
  jobData: PropTypes.arrayOf(PropTypes.object)
};


const ExportShipperDetailsModule = ({ Data }) => {

  const FromDate = Data && Data.length > 0 ? new Date(Data[0].validityFrom) : null;
  const FromDates = FromDate ? `${FromDate.getDate()}/${FromDate.getMonth() + 1}/${FromDate.getFullYear()}` : '';

  const ToDate = Data && Data.length > 0 ? new Date(Data[0].validityTo) : null;
  const ToDates = ToDate ? `${ToDate.getDate()}/${ToDate.getMonth() + 1}/${ToDate.getFullYear()}` : '';

  return (
    <div>
      <div className="flex flex-wrap  justify-center items-center mt-5 text-xs w-full" style={{ borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}
      >
        <th className='mt-1'>Shipment Details</th>
      </div>
      <div className=" flex flex-wrap " style={{ borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}
      >
        <div className="w-1/3 px-2 border-r border-black">
          <table className=' mt-1 text-left text-xs'>
            <tr>
              <th>FPD: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].fpdName !== 'Not found' ? Data[0].fpdName : ''}</td>
            </tr>
            <tr>
              <th>Gross Weight:</th>
              <td className="pl-5"></td>
            </tr>
            <tr>
              <th>Cargo Type: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].cargoTypeName !== 'Not found' ? Data[0].cargoTypeName : ''}</td>
            </tr>
            <tr>
              <th>Shipment Type: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].containerStatusName !== 'Not found' ? Data[0].containerStatusName : ''}</td>
            </tr>
          </table>
        </div>
        <div className="w-1/3 px-2 border-r border-black">
          <table className='mt-1 text-left text-xs'>
            <tr>
              <th>POL:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].polName !== 'Not found' ? Data[0].polName : ''}</td>
            </tr>
            <tr>
              <th>Routing:</th>
              <td className="pl-5"></td>
            </tr>
            <tr>
              <th>Commodity:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].commodity !== 'Not found' ? Data[0].commodity : ''}</td>
            </tr>
            <tr>
              <th>EST Date:</th>
              <td className="pl-5"></td>
            </tr>
          </table>
        </div>
        <div className="w-1/3 px-2">
          <table className='mt-1 text-left text-xs'>
            <tr>
              <th>POD: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].podName !== 'Not found' ? Data[0].podName : ''}</td>
            </tr>
            <tr>
              <th>Transit Time: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].transitTime !== 'Not found' ? Data[0].transitTime : ''}</td>
            </tr>
            <tr>
              <th>Validity From:</th>
              <td className="pl-5">{FromDates}</td>
            </tr>
            <tr>
              <th>Validity To:</th>
              <td className="pl-5">{ToDates}</td>
            </tr>
          </table>
        </div>
      </div>
      <div className="text-xs w-full" style={{ border: '1px solid black' }}>
        <th className='pt-2'>Remarks: </th>
      </div>
    </div>
  );
};
ExportShipperDetailsModule.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    validityFrom: PropTypes.string,
    validityTo: PropTypes.string,
    fpdName: PropTypes.string,
    cargoTypeName: PropTypes.string,
    containerStatusName: PropTypes.string,
    polName: PropTypes.string,
    commodity: PropTypes.string,
    podName: PropTypes.string,
    transitTime: PropTypes.string,
  })).isRequired,
  jobData: PropTypes.arrayOf(PropTypes.object)
};


const ExportShipperDetailsModuleAir = ({ Data }) => {

  const FromDate = Data && Data.length > 0 ? new Date(Data[0].validityFrom) : null;
  const FromDates = FromDate ? `${FromDate.getDate()}/${FromDate.getMonth() + 1}/${FromDate.getFullYear()}` : '';

  // const ToDate = Data && Data.length > 0 ? new Date(Data[0].validityTo) : null;
  // const ToDates = ToDate ? `${ToDate.getDate()}/${ToDate.getMonth() + 1}/${ToDate.getFullYear()}` : '';

  return (
    <div>
      <div className="flex flex-wrap  justify-center items-center mt-5 text-xs w-full" style={{ borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}
      >
        <th className='mt-1'>Shipment Details</th>
      </div>
      <div className=" flex flex-wrap " style={{ borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}
      >
        <div className="w-1/3 px-2 border-r border-black">
          <table className=' mt-1 text-left text-xs'>
            <tr>
              <th>Orgin Airport:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].polName !== 'Not found' ? Data[0].polName : ''}</td>

            </tr>
            <tr>
              <th>Transit Time: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].transitTime !== 'Not found' ? Data[0].transitTime : ''}</td>
            </tr>

            <tr>
              <th>Cargo Type:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].cargoTypeName !== 'Not found' ? Data[0].cargoTypeName : ''}</td>
            </tr>
            <tr>
              <th>Volume: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].volumeUnitNameCode !== 'Not found' ? Data[0].volumeUnitNameCode : ''}</td>
            </tr>
            <tr>
              <th>Validity From: </th>
              <td className="pl-5">{FromDates}</td>
            </tr>
            <tr>
              <th>Airline Line: </th>
              <td className="pl-5"></td>
            </tr>
          </table>
        </div>
        <div className="w-1/3 px-2 border-r border-black">
          <table className='mt-1 text-left text-xs'>
            <tr>
              <th>Dest Airport:</th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].podName !== 'Not found' ? Data[0].podName : ''}</td>
            </tr>
            <tr>
              <th>Commodity Type: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].commodityTypeName !== 'Not found' ? Data[0].commodityTypeName : ''}</td>
            </tr>
            <tr>
              <th>Gross Wt:</th>
              <td className="pl-5"></td>
            </tr>
            <tr>
              <th>Volumetric Wt:</th>
              <td className="pl-5"></td>
            </tr>
          </table>
        </div>
        <div className="w-1/3 px-2 ">
          <table className='mt-1 text-left text-xs'>
            <tr>
              <th>Routing: </th>
              <td className="pl-5"></td>
            </tr>
            <tr>
              <th>Commodity: </th>
              <td className="pl-5">{Data && Data.length > 0 && Data[0].commodity !== 'Not found' ? Data[0].commodity : ''}</td>
            </tr>
            <tr>
              <th>Chargeable Wt: </th>
              <td className="pl-5"> </td>
            </tr>
            <tr>
              <th>Trade Terms: </th>
              <td className="pl-5"></td>
            </tr>
          </table>
        </div>
      </div>

      <div className="text-xs w-full" style={{ border: '1px solid black' }}>
        <th className='pt-2'>Remarks: </th>
      </div>
    </div>
  );
};
ExportShipperDetailsModuleAir.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    validityFrom: PropTypes.string,
    validityTo: PropTypes.string,
    polName: PropTypes.string,
    transitTime: PropTypes.string,
    cargoTypeName: PropTypes.string,
    volumeUnitNameCode: PropTypes.string,
    podName: PropTypes.string,
    commodityTypeName: PropTypes.string,
    commodity: PropTypes.string
  })).isRequired,
  jobData: PropTypes.arrayOf(PropTypes.object)
};

const ExportSizeTypeModule = ({ Data }) => {

  const rateRequestQty = Data && Data.length > 0 ? Data[0].tblRateRequestQty : [];


  //console.log(rateRequestQty)
  return (
    <div className="mt-1 flex flex-wrap">
      <table className='mt-0.5 text-left text-xs' style={{ border: '1px solid black', width: '50%' }}>
        <thead>
          <tr>
            <th className='text-center border-black border-b border-r '>Size / Type</th>
            <th className='text-center border-black border-b border-r pt-2'>Qty</th>
            <th className='text-center border-black border-b border-r pt-2'>Gross Weight</th>
          </tr>
        </thead>
        <tbody>
          {rateRequestQty.map((item, index) => (
            <tr key={`item-${index}`}>
              <td className="text-left border-black border-b border-r pt-2">
                {/* {`${item.sizeName || ''} / ${item.typeName || ''}`} */}
                {`${item.sizeName !== 'Not found' ? item.sizeName : ''} / ${item.typeName !== 'Not found' ? item.typeName : ''}`}
              </td>
              <td className="text-right border-black border-b border-r pt-2">
                {item.qty && item.qty !== 'Not found' ? parseFloat(item.qty).toFixed(2) : ''}
              </td>
              <td className="text-left border-black border-b border-r pt-2">

                {item.qty && item.wtUnitName !== 'Not found' ? item.wtUnitName : ''}


              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>

        </tfoot>
      </table>
    </div>
  );
};
ExportSizeTypeModule.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    tblRateRequestQty: PropTypes.arrayOf(PropTypes.shape({
      sizeName: PropTypes.string,
      typeName: PropTypes.string,
      qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      wtUnitName: PropTypes.string
    }))
  })).isRequired,
  jobData: PropTypes.arrayOf(PropTypes.object)
};

const ExportSizeTypeModuleAir = ({ Data }) => {

  const rateRequestQty = Data && Data.length > 0 ? Data[0].tblRateRequestQty : [];

  //console.log(rateRequestQty)
  return (
    <div className="mt-1 flex flex-wrap">

      <table className='mt-0.5 text-left text-xs' style={{ border: '1px solid black', width: '100%' }}>
        <thead>
          <tr>
            <th className='text-center border-black border-b border-r '>No Of Packages </th>
            <th className='text-center border-black border-b border-r pt-2'>Gross Weight</th>
            <th className='text-center border-black border-b border-r pt-2'>L x W x H</th>
            <th className='text-center border-black border-b border-r pt-2'>Volume </th>
            <th className='text-center border-black border-b border-r pt-2'>Volumetric Weight</th>
          </tr>
        </thead>
        <tbody>
          {rateRequestQty.map((item, index) => (
            <tr key={`item-${index}`}>
              <td className="text-right border-black border-b border-r pt-2">
                {/* {item.qty !== null ? item.noOfPackages : ''} */}
                {item.qty && item.noOfPackages !== 'Not found' ? item.noOfPackages : ''}

              </td>
              <td className="text-right border-black border-b border-r pt-2">
                {item.qty !== null ? item.wtUnitName : ''}
              </td>
              <td className="text-right border-black border-b border-r pt-2">
              </td>
              <td className="text-right border-black border-b border-r pt-2">
                {/* {item.qty !== null ? item.volume : ''} */}
                {item.qty !== null ? item.volume + ' ' + Data[0].volumeUnitNameCode : ''}
              </td>
              <td className="text-right border-black border-b border-r pt-2">
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>

        </tfoot>
      </table>
    </div>
  );
};
ExportSizeTypeModuleAir.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    tblRateRequestQty: PropTypes.arrayOf(PropTypes.shape({
      noOfPackages: PropTypes.string,
      qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      wtUnitName: PropTypes.string,
      volume: PropTypes.string,
      volumeUnitNameCode: PropTypes.string // Add this line for volumeUnitNameCode
    })),
    volumeUnitNameCode: PropTypes.string // Define volumeUnitNameCode at the top level of Data
  })).isRequired
};


const ExportChargeModuleAirLine = ({ Data }) => {
  const rateRequestCharge = Data && Array.isArray(Data) && Data.length > 0 ? Data[0].tblRateRequestCharge : [];

  // Filter out records where vendorName is 'Not found'
  const filteredRateRequestCharge = rateRequestCharge.filter(charge => charge.vendorName !== 'Not found');

  const sortedRateRequestCharge = filteredRateRequestCharge.sort((a, b) => {
    // Sort based on sellCurrencyName, excluding records with 'Not found'
    if (a.sellCurrencyName === 'Not found') return 1;
    if (b.sellCurrencyName === 'Not found') return -1;
    return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
  });

  const groupedCharges = sortedRateRequestCharge.reduce((acc, curr) => {
    const vendorName = curr.vendorName; // Use the actual vendorName, not 'Not found'
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(curr);
    return acc;
  }, {});

  const subtotals = {};
  Object.keys(groupedCharges).forEach(vendorName => {
    groupedCharges[vendorName].forEach(charge => {
      // const currency = charge.sellCurrencyName || 'Not found';
      if (!subtotals[vendorName]) {
        subtotals[vendorName] = { amount: 0, totalAmount: 0 };
      }
      subtotals[vendorName].amount += charge.sellAmount || 0;

      subtotals[vendorName].totalAmount += charge.sellTotalAmount || 0;
    });
  });

  // const grandTotal = rateRequestCharge.reduce((acc, charge) => acc + (charge.sellTotalAmount || 0), 0);
  // const grandTotalInWords = toWords(grandTotal);

  return (
    <div className="mt-1 flex flex-wrap">
      <table className="mt-0 text-left text-xs" style={{ borderTop: '1px solid black', borderLeft: '1px solid black', borderBottom: '1px solid black', width: '100%' }}>
        <thead>
          <tr>
            <th className="text-center border-black border-b border-r pt-2">CHARGE DESCRIPTION</th>
            <th className="text-center border-black border-b border-r pt-2">Size/Type</th>
            <th className="text-center border-black border-b border-r pt-2">Qty</th>
            <th className="text-center border-black border-b border-r pt-2">Curr</th>
            <th className="text-center border-black border-b border-r pt-2">Ex. Rate</th>
            <th className="text-center border-black border-b border-r pt-2">Rate</th>
            <th className="text-center border-black border-b border-r pt-2">Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Total Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Remarks:</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedCharges).map(([vendorName, charges]) => (
            <React.Fragment key={vendorName}>
              <tr>
                <td className="text-left border-black border-b border-r py-px font-bold" colSpan={10}>
                  {vendorName}
                </td>
              </tr>
              {charges.map((item, index, array) => (
                <React.Fragment key={`item-${index}`}>
                  <tr>
                    <td className="px-3 border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>
                      {item.chargeName || 'Not found'}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">{item.sizeName && item.sizeName !== 'Not found' ? item.sizeName : ''} / {item.typeCode && item.typeCode !== 'Not found' && item.typeCode !== 'null' ? item.typeCode : ''}</td>
                    <td className="text-right border-black border-b border-r py-px">{typeof item.qty === 'number' && item.qty !== null && item.qty !== 'Not found' ? item.qty.toFixed(2) : '0.00'}</td>
                    <td className="text-left border-black border-b border-r py-px">
                      {item.sellCurrencyName && item.sellCurrencyName !== 'Not found' && item.sellCurrencyName !== 'null' ? item.sellCurrencyName : ''}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellExchangeRate === 'number' && item.sellExchangeRate !== null && item.sellExchangeRate !== 'Not found' ? item.sellExchangeRate.toFixed(2) : ''}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellRate === 'number' && item.sellRate !== null && item.sellRate !== 'Not found' ? item.sellRate.toFixed(2) : ''}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellAmount === 'number' && item.sellAmount !== null && item.sellAmount !== 'Not found' ? item.sellAmount.toFixed(2) : ''}
                    </td>
                    {/* <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellTaxAmount === 'number' && item.sellTaxAmount !== null && item.sellTaxAmount !== 'Not found' ? item.sellTaxAmount.toFixed(2) : ''}
                    </td> */}
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellTotalAmount === 'number' && item.sellTotalAmount !== null && item.sellTotalAmount !== 'Not found' ? item.sellTotalAmount.toFixed(2) : ''}
                    </td>
                    <td className="text-left border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>
                      {item.remarks && item.remarks !== 'Not found' && item.remarks !== 'null' ? item.remarks : ''}
                    </td>
                  </tr>
                  {index === array.length - 1 && (
                    <tr>
                      <td className="border-black border-b border-r font-bold py-px" colSpan={6}>Total {item.sellCurrencyName}:</td>
                      <td className="text-right border-black border-b border-r py-px" colSpan={1}>{subtotals[vendorName].amount.toFixed(2)}</td>
                      {/* <td className="text-right border-black border-b border-r py-px" colSpan={1}>{subtotals[vendorName].taxAmount.toFixed(2)}</td> */}
                      <td className="text-right border-black border-b border-r py-px" colSpan={1}>{subtotals[vendorName].totalAmount.toFixed(2)}</td>
                      <td className="text-right border-black border-b border-r py-px" colSpan={1}></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}

        </tbody>
      </table>
    </div>
  );
};
ExportChargeModuleAirLine.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    tblRateRequestCharge: PropTypes.arrayOf(PropTypes.shape({
      chargeName: PropTypes.string,
      sizeName: PropTypes.string,
      typeCode: PropTypes.string,
      qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sellCurrencyName: PropTypes.string,
      sellExchangeRate: PropTypes.number,
      sellRate: PropTypes.number,
      sellAmount: PropTypes.number,
      sellTotalAmount: PropTypes.number,
      remarks: PropTypes.string
    }))
  })).isRequired
};


const ExportChargeModuleAirLineWithTax = ({ Data }) => {
  const rateRequestCharge = Data && Array.isArray(Data) && Data.length > 0 ? Data[0].tblRateRequestCharge : [];

  // Filter out records where vendorName is 'Not found'
  const filteredRateRequestCharge = rateRequestCharge.filter(charge => charge.vendorName !== 'Not found');

  const sortedRateRequestCharge = filteredRateRequestCharge.sort((a, b) => {
    // Sort based on sellCurrencyName, excluding records with 'Not found'
    if (a.sellCurrencyName === 'Not found') return 1;
    if (b.sellCurrencyName === 'Not found') return -1;
    return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
  });

  const groupedCharges = sortedRateRequestCharge.reduce((acc, curr) => {
    const vendorName = curr.vendorName; // Use the actual vendorName, not 'Not found'
    if (!acc[vendorName]) {
      acc[vendorName] = [];
    }
    acc[vendorName].push(curr);
    return acc;
  }, {});

  const subtotals = {};
  Object.keys(groupedCharges).forEach(vendorName => {
    groupedCharges[vendorName].forEach(charge => {
      // const currency = charge.sellCurrencyName || 'Not found';
      if (!subtotals[vendorName]) {
        subtotals[vendorName] = { amount: 0, taxAmount: 0, totalAmount: 0 };
      }
      subtotals[vendorName].amount += charge.sellAmount || 0;
      subtotals[vendorName].taxAmount += charge.sellTaxAmount || 0;
      subtotals[vendorName].totalAmount += charge.sellTotalAmount || 0;
    });
  });

  // const grandTotal = rateRequestCharge.reduce((acc, charge) => acc + (charge.sellTotalAmount || 0), 0);
  // const grandTotalInWords = toWords(grandTotal);

  return (
    <div className="mt-1 flex flex-wrap">
      <table className="mt-0 text-left text-xs" style={{ borderTop: '1px solid black', borderLeft: '1px solid black', borderBottom: '1px solid black', width: '100%' }}>
        <thead>
          <tr>
            <th className="text-center border-black border-b border-r pt-2">CHARGE DESCRIPTION</th>
            <th className="text-center border-black border-b border-r pt-2">Size/Type</th>
            <th className="text-center border-black border-b border-r pt-2">Qty</th>
            <th className="text-center border-black border-b border-r pt-2">Curr</th>
            <th className="text-center border-black border-b border-r pt-2">Ex. Rate</th>
            <th className="text-center border-black border-b border-r pt-2">Rate</th>
            <th className="text-center border-black border-b border-r pt-2">Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Tax Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Total Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Remarks:</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedCharges).map(([vendorName, charges]) => (
            <React.Fragment key={vendorName}>
              <tr>
                <td className="text-left border-black border-b border-r py-px font-bold" colSpan={10}>
                  {vendorName}
                </td>
              </tr>
              {charges.map((item, index, array) => (
                <React.Fragment key={`item-${index}`}>
                  <tr>
                    <td className="px-3 border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>
                      {item.chargeName || 'Not found'}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">{item.sizeName && item.sizeName !== 'Not found' ? item.sizeName : ''} / {item.typeCode && item.typeCode !== 'Not found' && item.typeCode !== 'null' ? item.typeCode : ''}</td>
                    <td className="text-right border-black border-b border-r py-px">{typeof item.qty === 'number' && item.qty !== null && item.qty !== 'Not found' ? item.qty.toFixed(2) : '0.00'}</td>
                    <td className="text-left border-black border-b border-r py-px">
                      {item.sellCurrencyName && item.sellCurrencyName !== 'Not found' && item.sellCurrencyName !== 'null' ? item.sellCurrencyName : ''}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellExchangeRate === 'number' && item.sellExchangeRate !== null && item.sellExchangeRate !== 'Not found' ? item.sellExchangeRate.toFixed(2) : ''}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellRate === 'number' && item.sellRate !== null && item.sellRate !== 'Not found' ? item.sellRate.toFixed(2) : ''}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellAmount === 'number' && item.sellAmount !== null && item.sellAmount !== 'Not found' ? item.sellAmount.toFixed(2) : ''}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellTaxAmount === 'number' && item.sellTaxAmount !== null && item.sellTaxAmount !== 'Not found' ? item.sellTaxAmount.toFixed(2) : ''}
                    </td>
                    <td className="text-right border-black border-b border-r py-px">
                      {typeof item.sellTotalAmount === 'number' && item.sellTotalAmount !== null && item.sellTotalAmount !== 'Not found' ? item.sellTotalAmount.toFixed(2) : ''}
                    </td>
                    <td className="text-left border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>
                      {item.remarks && item.remarks !== 'Not found' && item.remarks !== 'null' ? item.remarks : ''}
                    </td>
                  </tr>
                  {index === array.length - 1 && (
                    <tr>
                      <td className="border-black border-b border-r font-bold py-px" colSpan={6}>Total {item.sellCurrencyName}:</td>
                      <td className="text-right border-black border-b border-r py-px" colSpan={1}>{subtotals[vendorName].amount.toFixed(2)}</td>
                      <td className="text-right border-black border-b border-r py-px" colSpan={1}>{subtotals[vendorName].taxAmount.toFixed(2)}</td>
                      <td className="text-right border-black border-b border-r py-px" colSpan={1}>{subtotals[vendorName].totalAmount.toFixed(2)}</td>
                      <td className="text-right border-black border-b border-r py-px" colSpan={1}></td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
          <tr>
            {/* <td className="border-black border-b border-r font-bold py-px" colSpan={8}>Grand Total:</td>
                      <td className="text-right border-black border-b border-r py-px" colSpan={1}>{grandTotal.toFixed(2)}</td>
                      <td className="text-right border-black border-b border-r py-px" colSpan={1}></td> */}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
ExportChargeModuleAirLineWithTax.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    tblRateRequestCharge: PropTypes.arrayOf(PropTypes.shape({
      chargeName: PropTypes.string,
      sizeName: PropTypes.string,
      typeCode: PropTypes.string,
      qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sellCurrencyName: PropTypes.string,
      sellExchangeRate: PropTypes.number,
      sellRate: PropTypes.number,
      sellAmount: PropTypes.number,
      sellTaxAmount: PropTypes.number, // New prop type for sellTaxAmount
      sellTotalAmount: PropTypes.number,
      remarks: PropTypes.string
    }))
  })).isRequired
};

const ExportChargeModule = ({ Data }) => {
  // Assuming Data is structured correctly and contains an array of charge objects
  const rateRequestCharge = Data && Array.isArray(Data) && Data.length > 0 ? Data[0].tblRateRequestCharge : [];

  // Filter out charges where the vendorName IS NOT present in the Data array
  const filteredRateRequestCharge = rateRequestCharge.filter(charge => {
    return !Data.some(dataItem => dataItem.vendorName !== charge.vendorName); // Invert the comparison
  });

  const sortedRateRequestCharge = filteredRateRequestCharge.sort((a, b) => {
    // Ensure that 'Not found' entries are sorted last
    if (a.sellCurrencyName === 'Not found') return 1;
    if (b.sellCurrencyName === 'Not found') return -1;
    // Sort based on the currency name
    return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
  });

  // Calculate subtotals by currency
  const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
    const currency = curr.sellCurrencyName || 'Not found';
    if (!acc[currency]) {
      acc[currency] = { amount: 0, totalAmount: 0 }; // Removed taxAmount from subtotal calculation
    }
    acc[currency].amount += curr.sellAmount || 0;
    acc[currency].totalAmount += curr.sellTotalAmount || 0;
    return acc;
  }, {});

  const grandTotal = sortedRateRequestCharge.reduce((acc, charge) => acc + (charge.sellTotalAmount || 0), 0);

  const grandTotalInWords = toWords(grandTotal);


  return (
    <div className="mt-1 flex flex-wrap">
      <table className='mt-0 text-left text-xs' style={{ borderTop: '1px solid black', borderLeft: '1px solid black', borderBottom: '1px solid black', width: '100%' }}>
        <thead>
          <tr>
            <th className="text-center border-black border-b border-r pt-2">CHARGE DESCRIPTION</th>
            <th className="text-center border-black border-b border-r pt-2">Size/Type</th>
            <th className="text-center border-black border-b border-r pt-2">Qty</th>
            <th className="text-center border-black border-b border-r pt-2">Curr</th>
            <th className="text-center border-black border-b border-r pt-2">Ex. Rate</th>
            <th className="text-center border-black border-b border-r pt-2">Rate</th>
            <th className="text-center border-black border-b border-r pt-2">Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Total Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Remarks:</th>
          </tr>
        </thead>
        <tbody>
          {sortedRateRequestCharge.map((item, index, array) => {
            // Render charge row
            const rows = [
              <tr key={`item-${index}`}>
                <td className="px-3 border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>
                  {`${item.chargeName || 'Not found'}`}
                </td>
                {/* <td className="text-left border-black border-b border-r py-px">{item.sizeName || 'Not found'} / {item.typeCode || 'Not found'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.qty === 'number' ? item.qty.toFixed(2) : '0.00'}</td>
                <td className="text-left border-black border-b border-r py-px">{item.sellCurrencyName || 'Not found'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.sellExchangeRate === 'number' ? item.sellExchangeRate.toFixed(2) : '0.00'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.sellRate === 'number' ? item.sellRate.toFixed(2) : '0.00'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.sellAmount === 'number' ? item.sellAmount.toFixed(2) : '0.00'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.sellTotalAmount === 'number' ? item.sellTotalAmount.toFixed(2) : '0.00'}</td>
                <td className="text-left border-black border-b border-r py-px " style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>{item.remarks || ''}</td> */}

                <td className="text-left border-black border-b border-r py-px">
                  {item.sizeName && item.sizeName !== 'Not found' && item.sizeName !== 'null' ? item.sizeName : ''} / {item.typeCode && item.typeCode !== 'Not found' && item.typeCode !== 'null' ? item.typeCode : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.qty === 'number' && item.qty !== null && item.qty !== 'Not found' ? item.qty.toFixed(2) : ''}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {item.sellCurrencyName && item.sellCurrencyName !== 'Not found' && item.sellCurrencyName !== 'null' ? item.sellCurrencyName : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.sellExchangeRate === 'number' && item.sellExchangeRate !== null && item.sellExchangeRate !== 'Not found' ? item.sellExchangeRate.toFixed(2) : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.sellRate === 'number' && item.sellRate !== null && item.sellRate !== 'Not found' ? item.sellRate.toFixed(2) : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.sellAmount === 'number' && item.sellAmount !== null && item.sellAmount !== 'Not found' ? item.sellAmount.toFixed(2) : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.sellTotalAmount === 'number' && item.sellTotalAmount !== null && item.sellTotalAmount !== 'Not found' ? item.sellTotalAmount.toFixed(2) : ''}
                </td>
                <td className="text-left border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>
                  {item.remarks && item.remarks !== 'Not found' && item.remarks !== 'null' ? item.remarks : ''}
                </td>


              </tr>
            ];

            // Check if this is the last item or the next item has a different currency
            const lastOfCurrency = index === array.length - 1 || array[index + 1].sellCurrencyName !== item.sellCurrencyName;
            if (lastOfCurrency) {
              // Add subtotal row
              const subtotal = subtotals[item.sellCurrencyName];
              rows.push(
                <tr key={`subtotal-${item.sellCurrencyName}`}>
                  <td className="border-black border-b border-r font-bold py-px">Total ({item.sellCurrencyName}):</td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-center border-black border-b border-r font-bold py-px">{subtotal.amount.toFixed(2)}({item.sellCurrencyName}) </td>
                  <td className="text-center border-black border-b border-r font-bold py-px">{subtotal.totalAmount.toFixed(2)} ({item.sellCurrencyName})</td>
                  <td className="text-center border-black border-b border-r"></td>
                </tr>
              );
            }
            return rows;
          })}
        </tbody>
      </table>
      <div className="mt-2 flex flex-wrap" style={{ width: '100%', marginTop: "5px" }}>
        <div className="text-xs w-full flex justify-between" style={{ borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}>
          <div className='mt-2 font-bold py-px'>Grand Total:</div>
          <div className='mt-2 mr-10 font-bold py-px'>{grandTotal.toFixed(2)}</div>
        </div>
        <div className="text-xs w-full flex justify-between" style={{ border: '1px solid black' }}>
          <div className='mt-2 font-bold py-px'>Amount in Words:</div>
          <div className='mt-2 font-bold py-px' style={{ marginRight: '85%' }}>{capitalizeFirstLetters(grandTotalInWords)} ONLY</div>
        </div>
      </div>
    </div>
  );
};
ExportChargeModule.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    tblRateRequestCharge: PropTypes.arrayOf(PropTypes.shape({
      chargeName: PropTypes.string,
      sizeName: PropTypes.string,
      typeCode: PropTypes.string,
      qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      sellCurrencyName: PropTypes.string,
      sellExchangeRate: PropTypes.number,
      sellRate: PropTypes.number,
      sellAmount: PropTypes.number,
      sellTotalAmount: PropTypes.number,
      remarks: PropTypes.string
    }))
  })).isRequired
};
const ExportChargeModuleWithTax = ({ Data }) => {
  // Assuming Data is structured correctly and contains an array of charge objects
  const rateRequestCharge = Data && Array.isArray(Data) && Data.length > 0 ? Data[0].tblRateRequestCharge : [];

  // Filter out charges where the vendorName IS NOT present in the Data array
  const filteredRateRequestCharge = rateRequestCharge.filter(charge => {
    return !Data.some(dataItem => dataItem.vendorName !== charge.vendorName); // Invert the comparison
  });

  const sortedRateRequestCharge = filteredRateRequestCharge.sort((a, b) => {
    // Ensure that 'Not found' entries are sorted last
    if (a.sellCurrencyName === 'Not found') return 1;
    if (b.sellCurrencyName === 'Not found') return -1;
    // Sort based on the currency name
    return a.sellCurrencyName.localeCompare(b.sellCurrencyName);
  });


  // Calculate subtotals by currency
  const subtotals = sortedRateRequestCharge.reduce((acc, curr) => {
    const currency = curr.sellCurrencyName || 'Not found';
    if (!acc[currency]) {
      acc[currency] = { amount: 0, taxAmount: 0, totalAmount: 0 };
    }
    acc[currency].amount += curr.sellAmount || 0;
    acc[currency].taxAmount += curr.sellTaxAmount || 0;
    acc[currency].totalAmount += curr.sellTotalAmount || 0;
    return acc;
  }, {});

  const grandTotal = sortedRateRequestCharge.reduce((acc, charge) => acc + (charge.sellTotalAmount || 0), 0);

  const grandTotalInWords = toWords(grandTotal);
  // const calculateTax = Data;

  return (
    <div className="mt-1 flex flex-wrap">
      <table className='mt-0 text-left text-xs' style={{ borderTop: '1px solid black', borderLeft: '1px solid black', borderBottom: '1px solid black', width: '100%' }}>
        <thead>
          <tr>
            <th className="text-center border-black border-b border-r pt-2">CHARGE DESCRIPTION</th>
            <th className="text-center border-black border-b border-r pt-2">Size/Type</th>
            <th className="text-center border-black border-b border-r pt-2">Qty</th>
            <th className="text-center border-black border-b border-r pt-2">Curr</th>
            <th className="text-center border-black border-b border-r pt-2">Ex. Rate</th>
            <th className="text-center border-black border-b border-r pt-2">Rate</th>
            <th className="text-center border-black border-b border-r pt-2">Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Tax Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Total Amount</th>
            <th className="text-center border-black border-b border-r pt-2">Remarks:</th>
          </tr>
        </thead>
        <tbody>
          {sortedRateRequestCharge.map((item, index, array) => {
            // Render charge row
            const rows = [
              <tr key={`item-${index}`}>
                {/* <td className="mt-3 text-center border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}> */}
                <td className="px-3 border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>
                  {`${item.chargeName || 'Not found'}`}
                </td>

                {/* <td className="text-left border-black border-b border-r py-px">{item.sizeName || 'Not found'} / {item.typeCode || 'Not found'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.qty === 'number' ? item.qty.toFixed(2) : '0.00'}</td>
                <td className="text-right border-black border-b border-r py-px">{item.sellCurrencyName || 'Not found'}</td>
                <td className="text-left border-black border-b border-r py-px">{typeof item.sellExchangeRate === 'number' ? item.sellExchangeRate.toFixed(2) : '0.00'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.sellRate === 'number' ? item.sellRate.toFixed(2) : '0.00'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.sellAmount === 'number' ? item.sellAmount.toFixed(2) : '0.00'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.sellTaxAmount === 'number' ? item.sellTaxAmount.toFixed(2) : '0.00'}</td>
                <td className="text-right border-black border-b border-r py-px">{typeof item.sellTotalAmount === 'number' ? item.sellTotalAmount.toFixed(2) : '0.00'}</td>
                <td className="text-left border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>{item.remarks || ''}</td> */}

                <td className="text-left border-black border-b border-r py-px">
                  {item.sizeName && item.sizeName !== 'Not found' && item.sizeName !== 'null' ? item.sizeName : ''} / {item.typeCode && item.typeCode !== 'Not found' && item.typeCode !== 'null' ? item.typeCode : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.qty === 'number' && item.qty !== null && item.qty !== 'Not found' ? item.qty.toFixed(2) : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {item.sellCurrencyName && item.sellCurrencyName !== 'Not found' && item.sellCurrencyName !== 'null' ? item.sellCurrencyName : ''}
                </td>
                <td className="text-left border-black border-b border-r py-px">
                  {typeof item.sellExchangeRate === 'number' && item.sellExchangeRate !== null && item.sellExchangeRate !== 'Not found' ? item.sellExchangeRate.toFixed(2) : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.sellRate === 'number' && item.sellRate !== null && item.sellRate !== 'Not found' ? item.sellRate.toFixed(2) : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.sellAmount === 'number' && item.sellAmount !== null && item.sellAmount !== 'Not found' ? item.sellAmount.toFixed(2) : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.sellTaxAmount === 'number' && item.sellTaxAmount !== null && item.sellTaxAmount !== 'Not found' ? item.sellTaxAmount.toFixed(2) : ''}
                </td>
                <td className="text-right border-black border-b border-r py-px">
                  {typeof item.sellTotalAmount === 'number' && item.sellTotalAmount !== null && item.sellTotalAmount !== 'Not found' ? item.sellTotalAmount.toFixed(2) : ''}
                </td>
                <td className="text-left border-black border-b border-r py-px" style={{ maxWidth: '150px', overflowWrap: 'break-word' }}>
                  {item.remarks && item.remarks !== 'Not found' && item.remarks !== 'null' ? item.remarks : ''}
                </td>

              </tr>
            ];

            // Check if this is the last item or the next item has a different currency
            const lastOfCurrency = index === array.length - 1 || array[index + 1].sellCurrencyName !== item.sellCurrencyName;
            if (lastOfCurrency) {
              // Add subtotal row
              const subtotal = subtotals[item.sellCurrencyName];
              rows.push(
                <tr key={`subtotal-${item.sellCurrencyName}`}>
                  <td className="border-black border-b border-r font-bold py-px">Total ({item.sellCurrencyName}):</td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-center border-black border-b border-r"></td>
                  <td className="text-right border-black border-b border-r font-bold py-px">{subtotal.amount.toFixed(2)} ({item.sellCurrencyName})</td>
                  <td className="text-right border-black border-b border-r font-bold py-px">{subtotal.taxAmount.toFixed(2)}({item.sellCurrencyName})</td>
                  <td className="text-right border-black border-b border-r font-bold py-px">{subtotal.totalAmount.toFixed(2)}({item.sellCurrencyName}) </td>
                  <td className="text-center border-black border-b border-r"></td>
                </tr>
              );
            }
            return rows;
          })}
        </tbody>
      </table>
      <div className="mt-2 flex flex-wrap" style={{ width: '100%', marginTop: "5px" }}>
        <div className="text-xs w-full flex justify-between" style={{ borderTop: '1px solid black', borderRight: '1px solid black', borderLeft: '1px solid black' }}>
          <div className='mt-2 font-bold py-px'>Grand Total:</div>
          <div className='mt-2 mr-10 font-bold py-px'>{grandTotal.toFixed(2)}</div>
        </div>
        <div className="text-xs w-full flex justify-between" style={{ border: '1px solid black' }}>
          <div className='mt-2 font-bold py-px'>Amount in Words:</div>
          <div className='mt-2 font-bold py-px' style={{ marginRight: '85%' }}>{capitalizeFirstLetters(grandTotalInWords)} ONLY</div>
        </div>
      </div>


    </div>

  );
};
ExportChargeModuleWithTax.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    tblRateRequestCharge: PropTypes.arrayOf(PropTypes.shape({
      chargeName: PropTypes.string,
      sizeName: PropTypes.string,
      typeCode: PropTypes.string,
      qty: PropTypes.number,
      sellCurrencyName: PropTypes.string,
      sellExchangeRate: PropTypes.number,
      sellRate: PropTypes.number,
      sellAmount: PropTypes.number,
      sellTaxAmount: PropTypes.number,
      sellTotalAmount: PropTypes.number,
      remarks: PropTypes.string
      // Add any other fields as necessary based on your data structure
    }))
    // Add other fields from Data if needed
  })).isRequired
};
function capitalizeFirstLetters(words) {
  return words.replace(/\b\w/g, function (char) {
    return char.toUpperCase();
  });
}

// const ExportParagrafModule = ({ Data }) => {
//     const [termsAndConditions, setTermsAndConditions] = useState("");

//     useEffect(() => {
//         const getData = async () => {
//             const data = await fetchTermsAndConditions();
//             if (data && data.length > 0) {
//                 setTermsAndConditions(data[0].termsCondition);
//             }
//         };

//         getData();
//     }, []);

//     // Split the terms and conditions by line break ("\n") and map each line with its line number
//     const termsArray = termsAndConditions.split("\n").map((line, index) => {
//         // Trim whitespace and check if the line is not empty
//         if (line.trim().length > 0) {
//             // Display the line number followed by the line content
//             return ` ${line}`;
//         }
//         return null;
//     }).filter(line => line !== null); // Remove any null entries resulting from empty lines

//     console.log("K", Data)
//     return (
//         <div className="mt-1 flex flex-wrap">
//             <div className="text-xs w-full">
//                 <h3 className="mt-0 font-bold">Terms & Conditions:</h3>
//                 {termsArray.map((term, index) => (
//                     <p key={index} className="mt-2 font-bold">{term}</p>
//                 ))}
//             </div>

//             <div className="mt-5 text-xs w-full">
//                 <h3 className="mt-5">Thanking You,</h3>
//             </div>
//             <div className="mt-5 text-xs w-full">
//                 <p className="font-bold">For:</p>
//                 <span className="pl-5 font-bold">{Data && Data.length > 0 ? Data[0].companyName : ''}</span>
//             </div>
//         </div>
//     );
// };

// ExportParagrafModule.propTypes = {
//     Data: PropTypes.arrayOf(PropTypes.shape({
//         companyName: PropTypes.string.isRequired,
//         // Add any other expected properties from Data here
//     })).isRequired
// };

const ExportParagrafModule = ({ Data }) => {
  const [termsAndConditions, setTermsAndConditions] = useState("");

  useEffect(() => {
    const getData = async () => {
      const data = await fetchTermsAndConditions();
      if (data && data.length > 0) {
        setTermsAndConditions(data[0].termsCondition || "");
      }
    };

    getData();
  }, []);

  // Split the terms and conditions by line break ("\n") and map each line with its line number
  const termsArray = termsAndConditions.split("\n").map((line) => {
    // Trim whitespace and check if the line is not empty
    if (line.trim().length > 0) {
      // Display the line content
      return ` ${line}`;
    }
    return null;
  }).filter(line => line !== null); // Remove any null entries resulting from empty lines

  // Check if Data is valid and has a companyName property
  // const isValidCompanyName = Data && Data.length > 0 && Data[0].hasOwnProperty('companyName');

  // Display company name if available, otherwise show blank
  const companyName = Data[0]?.companyName === "Not found" ? '' : Data[0]?.companyName;

  return (
    <div className="mt-1 flex flex-wrap">
      <div className="text-xs w-full">
        <h3 className="mt-0 font-bold">Terms & Conditions:</h3>
        {termsArray.map((term, index) => (
          <p key={index} className="mt-2 font-bold">{term}</p>
        ))}
      </div>

      <div className="mt-5 text-xs w-full">
        <h3 className="mt-5">Thanking You,</h3>
      </div>
      <div className="mt-5 text-xs flex ">
        <p className="font-bold">For:</p>
        <span className="pl-2 font-bold">{companyName}</span>
      </div>

    </div>
  );
};

ExportParagrafModule.propTypes = {
  Data: PropTypes.arrayOf(PropTypes.shape({
    companyName: PropTypes.string,
    // Add any other expected properties from Data here
  })).isRequired
};

async function fetchTermsAndConditions() {
  const url = `${baseUrl}/api/validations/formControlValidation/fetchData`;
  const requestBody = {
    tableName: "tblTermsCondition",
    whereCondition: {
      "_id": "65cb645121bfb4c481c1d850",
      "companyId": "865",
      "companyBranchId": "8331",
      "businessSegmentId": "5"
    }
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}, StatusText: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      console.warn("Server returned success as false:", data.message);
      return data.message;
    }
  } catch (error) {
    console.error("Error fetching terms and conditions:", error);
    return false;
  }
}
const QuotationReports = () => {
  return (
    <main>
      <CompanyImgModule />
      
      {/* Quotation */}
      <ExportSeaQuotationModule />
      <ExportShipperModule />
      <ExportShipperDetailsModule />
      <ExportSizeTypeModule />
      <ExportChargeModule />
      {/* <ExportGrandTotalModule /> */}
      <ExportParagrafModule />
    
      <ExportShipperDetailsModuleAir />
      <ExportSizeTypeModuleAir />
      <ExportChargeModuleAirLine />
      <ExportChargeModuleAirLineWithTax />
      <ExportChargeModuleWithTax />

    

    </main>
  );
};


export default QuotationReports;
