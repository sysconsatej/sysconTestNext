'use client';
/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import 'tailwindcss/tailwind.css';


export const CompanyImgModule = () => {
  return (
    <img
      src='/nclpLogo.jpg'
      alt='Company'
    />
  );
};

export const HeaderModule = ({ jobData }) => {

  return (
    <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td align="right" valign="top" style={{ maxWidth: '50%' }}>
          <table className="tblhead" border="0" cellSpacing="0" cellPadding="0">
            <tr>
              <th align="left" className="responsiveTh">Date :</th>
              <td ></td>
            </tr>
            <tr>
              <th align="left" className="responsiveTh">Our Reference :</th>
              <td >{jobData && jobData.length > 0 ? jobData[0].jobNo : ''}</td>
            </tr>
            <tr>
              <th align="left" className="responsiveTh">From :</th>
              <td ></td>
            </tr>
            <tr>
              <th align="left" className="responsiveTh">Email :</th>
              <td ></td>
            </tr>
            <tr>
              <th align="left" className="responsiveTh">Telephone :</th>
              <td ></td>
            </tr>
            <tr>
              <th align="left" className="responsiveTh">Page :</th>
              <td >1 of 1</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
// HeaderModule.propTypes = {
//   jobData: PropTypes.arrayOf(PropTypes.object)
// };

export const HeaderShipperDataModule = ({ jobData }) => {

  const fallbackText = '';

  const jobDataContent = (data, field) => {
    return data && data.length > 0 ? data[0][field] : fallbackText;
  };

  return (
    <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td valign="top" style={{ maxWidth: '40%' }}>
          {jobDataContent(jobData, 'shipperName')}<br />
          {jobDataContent(jobData, 'shipperAddress')}
        </td>
        <td className="tblhead" align="right" valign="top" style={{ maxWidth: '50%' }}>
          <table className="tblhead" border="0" cellSpacing="0" cellPadding="0"  >
            <tr>
              <th align="left" className="responsiveTh">Date :</th>
              <td >{fallbackText}</td>
            </tr>
            <tr>
              <th align="left">Our Reference :</th>
              <td >{jobDataContent(jobData, 'jobNo')}</td>
            </tr>
            <tr>
              <th align="left">From :</th>
              <td >{fallbackText}</td>
            </tr>
            <tr>
              <th align="left">Email :</th>
              <td >{fallbackText}</td>
            </tr>
            <tr>
              <th align="left">Telephone :</th>
              <td >{fallbackText}</td>
            </tr>
            <tr>
              <th align="left">Page :</th>
              <td >1 of 1</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
HeaderShipperDataModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const ShipperConsigneeTableModule = ({ jobData }) => {
  // Inline styles for table cells
  const tdStyle = {
    paddingLeft: '5px', // Adjust padding as needed
  };

  // Inline styles for table headers
  const thStyle = {
    fontWeight: 'bold', // Assuming you want your headers to be bold
    textAlign: 'left',
  };

  // Helper function to get the job data content
  const getContent = (data, field) => data && data.length > 0 ? data[0][field] : '';

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px', width: '100%' }}>
      <tbody>
        <tr>
          <th style={thStyle}>Shipper</th>
          <td style={tdStyle}>
            {getContent(jobData, 'shipperName')}<br />
            {getContent(jobData, 'shipperAddress')}
          </td>
          <th style={thStyle}>Consignee</th>
          <td style={tdStyle}>
            {getContent(jobData, 'consigneeName')}<br />
            {getContent(jobData, 'consigneeAddress')}
          </td>
        </tr>
      </tbody>
    </table>
  );
};
ShipperConsigneeTableModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const ShipperConsigneeTableAirModule = ({ jobData }) => {
  // Inline styles for table cells
  const tdStyle = {
    paddingLeft: '5px', // Adjust padding as needed
  };

  // Inline styles for table headers
  const thStyle = {
    fontWeight: 'bold', // Assuming you want your headers to be bold
    textAlign: 'left',
  };

  // Helper function to get the job data content
  const getContent = (data, field) => data && data.length > 0 ? data[0][field] : '';

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px', width: '100%' }}>
      <tbody>
        <tr>
          <th style={thStyle}>Customer</th>
          <td style={tdStyle}>
            {getContent(jobData, 'consigneeAddress')}
          </td>
          <th style={thStyle}>Cust. Ref. No.</th>
          <td style={tdStyle}>
            {getContent(jobData, 'consigneeAddress')}
          </td>
        </tr>
      </tbody>
    </table>
  );
};
ShipperConsigneeTableAirModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const PackagesGrossWeightModule = ({ jobData }) => {

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };


  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>No.Of Packages </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].noOfPackages : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Gross Weight</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].cargoWt : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Volume </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? `${jobData[0].volume} ${jobData[0].volumeUnitName}` : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Container Nos.</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Cargo Type :</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].cargoTypeName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Commodity :</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].commodityTypeName : ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
PackagesGrossWeightModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const VesselModule = ({ jobData }) => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Vessel/Voyage</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Place of Receipt </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Port of Loading </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Port of Discharge</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Final Destination </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>ETS</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>ETA </th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
VesselModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const PackagesGrossWeightSeaModule = ({ jobData }) => {

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <td width="49%" valign="top">
        <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
          <tr>
            <th align="left" style={thStyle}>No of Packages</th>
            <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].noOfPackages : ''}</td>
          </tr>
          <tr>
            <th align="left" style={thStyle}>Gross Weight</th>
            <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].cargoWt : ''}</td>
          </tr>
          <tr>
            <th align="left" style={thStyle}>Volume</th>
            <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? `${jobData[0].volume} ${jobData[0].volumeUnitName}` : ''}</td>
          </tr>
          <tr>
            <th align="left" style={thStyle}>Container Nos</th>
            <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
          </tr>
        </table>
      </td>
    </table>
  );
};
PackagesGrossWeightSeaModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const VesselEts = ({ jobData }) => {

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  const getData = (data, field) => data && data.length > 0 ? data[0][field] : '';

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Vessel/Voyage:</th>
              <td align="left" style={tdStyle}>{getData(jobData, 'vesselVoyage')}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>PLR:</th>
              <td align="left" style={tdStyle}>{getData(jobData, 'plrName')}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>POL:</th>
              <td align="left" style={tdStyle}>{getData(jobData, 'polName')}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>POD:</th>
              <td align="left" style={tdStyle}>{getData(jobData, 'podName')}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>ETS:</th>
              <td align="left" style={tdStyle}>{getData(jobData, 'ets')}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>ETA:</th>
              <td align="left" style={tdStyle}>{getData(jobData, 'eta')}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope:</th>
              <td align="left" style={tdStyle}>{getData(jobData, 'movementScope')}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
VesselEts.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const ContainerTableModule = ({ jobData }) => {
  // Define inline styles
  const tableStyle = {
    width: '100%',
    marginTop: '3rem',
    textAlign: 'left',
  };
  const thTdStyle = {
    textAlign: 'left',
  };



  return (
    <table className='tblhead' style={tableStyle}>
      <thead>
        <tr>
          <th style={thTdStyle}>Container No</th>
          <th style={thTdStyle}>Size/Type</th>
          <th style={thTdStyle}>Status</th>
          <th style={thTdStyle}>Gross WT</th>
          <th style={thTdStyle}>No of Packages</th>
        </tr>
      </thead>
      <tbody>
        {jobData && jobData.map((job, index) => (
          job.tblJobContainer && job.tblJobContainer.length > 0 &&
          job.tblJobContainer.map((container, containerIndex) => (
            <tr key={`job-${index}-container-${containerIndex}`}>
              <td>{container.containerNo}</td>
              <td style={thTdStyle}>
                {`${container.sizeName}/${container.typeName}`}
              </td>
              <td style={thTdStyle}>{container.containerStatusName}</td>
              <td style={thTdStyle}>{container.grossWt}</td>
              <td style={thTdStyle}>{container.noOfPackages}</td>
            </tr>
          ))
        ))}
      </tbody>
    </table>
  );
};
ContainerTableModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const PlrCarrierModule = ({ jobData }) => {

  const mblDate = jobData && jobData.length > 0 ? new Date(jobData[0].mblDate) : null;
  const MblDatesFormat = mblDate ? `${mblDate.getDate()}/${mblDate.getMonth() + 1}/${mblDate.getFullYear()}` : '';

  const hblDate = jobData && jobData.length > 0 ? new Date(jobData[0].hblDate) : null;
  const hblDatesFormat = hblDate ? `${hblDate.getDate()}/${hblDate.getMonth() + 1}/${hblDate.getFullYear()}` : '';

  const sailData = jobData && jobData.length > 0 ? new Date(jobData[0].salingDate) : null;
  const sailDataFormat = sailData ? `${sailData.getDate()}/${sailData.getMonth() + 1}/${sailData.getFullYear()}` : '';

  const arrivalData = jobData && jobData.length > 0 ? new Date(jobData[0].arrivalDate) : null;
  const arrivalDataFormat = arrivalData ? `${arrivalData.getDate()}/${arrivalData.getMonth() + 1}/${arrivalData.getFullYear()}` : '';

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };


  return (
    <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Vessel/Voyage:</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>PLR:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>POL:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>POD:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>FPD:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MBL No:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].mblNo : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HBL No:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].hblNo : ''}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0">
            <tr>
              <th align="left" style={thStyle}>Carrier:</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Sailing Date:</th>
              <td align="left" style={tdStyle}>{sailDataFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Arrival Date:</th>
              <td align="left" style={tdStyle}>{arrivalDataFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope	:</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MBL Date:</th>
              <td align="left" style={tdStyle}>{MblDatesFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HBL Date:</th>
              <td align="left" style={tdStyle}>{hblDatesFormat}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
PlrCarrierModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const PlrCarrierSeaModule = ({ jobData }) => {

  const sailData = jobData && jobData.length > 0 ? new Date(jobData[0].salingDate) : null;
  const sailDataFormat = sailData ? `${sailData.getDate()}/${sailData.getMonth() + 1}/${sailData.getFullYear()}` : '';

  const arrivalData = jobData && jobData.length > 0 ? new Date(jobData[0].arrivalDate) : null;
  const arrivalDataFormat = arrivalData ? `${arrivalData.getDate()}/${arrivalData.getMonth() + 1}/${arrivalData.getFullYear()}` : '';

  const mblDate = jobData && jobData.length > 0 ? new Date(jobData[0].mblDate) : null;
  const MblDatesFormat = mblDate ? `${mblDate.getDate()}/${mblDate.getMonth() + 1}/${mblDate.getFullYear()}` : '';

  const hblDate = jobData && jobData.length > 0 ? new Date(jobData[0].hblDate) : null;
  const hblDatesFormat = hblDate ? `${hblDate.getDate()}/${hblDate.getMonth() + 1}/${hblDate.getFullYear()}` : '';

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };


  return (
    <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Vessel/Voyage:</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>PLR:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>POL:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>POD:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>FPD:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MBL No:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].mblNo : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HBL No:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].hblNo : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>IGM No:</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].hblNo : ''}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0">
            <tr>
              <th align="left" style={thStyle}>Carrier:</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Sailing Date:</th>
              <td align="left" style={tdStyle}>{sailDataFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Arrival Date:</th>
              <td align="left" style={tdStyle}>{arrivalDataFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope	:</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MBL Date:</th>
              <td align="left" style={tdStyle}>{MblDatesFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HBL Date:</th>
              <td align="left" style={tdStyle}>{hblDatesFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>IGM Date:</th>
              <td align="left" style={tdStyle}>{hblDatesFormat}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
PlrCarrierSeaModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const CartingDetailsModule = ({ jobData }) => {

  const sailData = jobData && jobData.length > 0 ? new Date(jobData[0].salingDate) : null;
  const sailDataFormat = sailData ? `${sailData.getDate()}/${sailData.getMonth() + 1}/${sailData.getFullYear()}` : '';

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Vessel/Voyage</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>PLR </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>POL </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>POD</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>FPD</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Carrier</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Sailing Date </th>
              <td align="left" style={tdStyle}>{sailDataFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>ETA</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
CartingDetailsModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const DeliveryConfirmationModule = ({ jobData }) => {

  const mblDate = jobData && jobData.length > 0 ? new Date(jobData[0].mblDate) : null;
  const MblDatesFormat = mblDate ? `${mblDate.getDate()}/${mblDate.getMonth() + 1}/${mblDate.getFullYear()}` : '';

  const hblDate = jobData && jobData.length > 0 ? new Date(jobData[0].hblDate) : null;
  const hblDatesFormat = hblDate ? `${hblDate.getDate()}/${hblDate.getMonth() + 1}/${hblDate.getFullYear()}` : '';

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Vessel/Voyage</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Place of Receipt </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Port of Loading </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Port of Discharge	</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Final Destination</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MAWB No</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HAWB No</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Carrier</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Depature Data</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Arrival Data</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MAWB Date</th>
              <td align="left" style={tdStyle}>{MblDatesFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HAWD Date</th>
              <td align="left" style={tdStyle}>{hblDatesFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Delivery Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
DeliveryConfirmationModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const RequestforPaymentModule = ({ jobData }) => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Customer</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].customerAddress : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Shipper</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? (
                <>
                  {jobData[0].shipperName}<br />
                  {jobData[0].shipperAddress}
                </>
              ) : ''}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Cust Ref No</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Consignee </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? (
                <>
                  {jobData[0].consigneeName}
                  <br />
                  {jobData[0].consigneeAddress}
                </>
              ) : ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
RequestforPaymentModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const TransportInstructionsModule = ({ jobData }) => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <div>
      <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
        <tr>
          <td valign="top">
            <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
              <tr>
                <th align="left" style={thStyle}>Carrier</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Carrier D.O. No</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Carrier Ref. Date</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Pickup Details</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Delivery Details</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Empty Return Place	</th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <hr className='hrRow' ></hr>
      <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
        <tr>
          <td width="49%" valign="top">
            <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
              <tr>
                <th align="left" style={thStyle}>Cargo Type</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Commodity</th>
                <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].commodityTypeName : ''}</td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Container Nos.</th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <p className='tblhead mt-2 text-xs'>We trust we have served you with this information and kindly confirm the booking.</p>
      <p className='tblhead mt-2 text-xs'>Best Regards,</p>
    </div>
  );
};
TransportInstructionsModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const FreightCertificateModule = ({ jobData }) => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>No of Packages</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].packageName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Cargo Type</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].cargoTypeName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Commodity</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].commodityTypeName : ''}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Gross Weight</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].cargoWt : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Volume</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? `${jobData[0].volume} ${jobData[0].volumeUnitName}` : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Container Nos</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
FreightCertificateModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const FreightCertificateFutterModule = () => {
  return (
    <table className='text-xs text-left' style={{ width: '100%', marginTop: '3rem' }}>
      <tr>
        <th>Charge Description</th>
        <th style={{ paddingLeft: '1.25rem' }}>Quantity</th>
        <th style={{ paddingLeft: '1.25rem' }}>Rate</th>
        <th style={{ paddingLeft: '1.25rem' }}>Curent Ex. </th>
        <th style={{ paddingLeft: '1.25rem' }}>Rate</th>
        <th style={{ paddingLeft: '1.25rem' }}>Amount in Fc</th>
        <th style={{ paddingLeft: '1.25rem' }}>Total Amount</th>
      </tr>
      <tbody>
        <tr></tr>
        <tr></tr>
        <tr></tr>
        <tr></tr>
        <tr></tr>
        <tr></tr>
        <tr></tr>
      </tbody>
    </table>

  );
};
FreightCertificateFutterModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};
// import FF AIR
export const FreightCertificateAirModule = ({ jobData }) => {

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  const DepatureData = jobData && jobData.length > 0 ? new Date(jobData[0].salingDate) : null;
  const DepatureDataFormat = DepatureData ? `${DepatureData.getDate()}/${DepatureData.getMonth() + 1}/${DepatureData.getFullYear()}` : '';

  const arrivalData = jobData && jobData.length > 0 ? new Date(jobData[0].arrivalDate) : null;
  const arrivalDataFormat = arrivalData ? `${arrivalData.getDate()}/${arrivalData.getMonth() + 1}/${arrivalData.getFullYear()}` : '';

  const mblDate = jobData && jobData.length > 0 ? new Date(jobData[0].mblDate) : null;
  const MblDatesFormat = mblDate ? `${mblDate.getDate()}/${mblDate.getMonth() + 1}/${mblDate.getFullYear()}` : '';

  const hblDate = jobData && jobData.length > 0 ? new Date(jobData[0].hblDate) : null;
  const hblDatesFormat = hblDate ? `${hblDate.getDate()}/${hblDate.getMonth() + 1}/${hblDate.getFullYear()}` : '';


  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Flght No</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Place of Origin</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Origin Airpot</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Destination Airpot</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Final destination</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MAWB No</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].mblNo : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HAWB No</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].hblNo : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>IGM No</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].hblNo : ''}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Airlines Name</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Depature Date</th>
              <td align="left" style={tdStyle}>{DepatureDataFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Arrival Date</th>
              <td align="left" style={tdStyle}>{arrivalDataFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MAWB Date</th>
              <td align="left" style={tdStyle}>{MblDatesFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HAWB Date</th>
              <td align="left" style={tdStyle}>{hblDatesFormat}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>IGM Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
FreightCertificateAirModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const FreightCargoAirModule = ({ jobData }) => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Cargo Type</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Commodity</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].commodityTypeName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Gross Weight</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].cargoWt : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Volumetric Weight</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Chargeable Weight</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
FreightCargoAirModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const DeliveryOrderAirModule = ({ jobData }) => {

  return (
    <div>
      <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
        <tr>
          <td align="right" valign="top" style={{ maxWidth: '50%' }}>
            <table className="tblhead" border="0" cellSpacing="0" cellPadding="0">
              <tr>
                <th align="left" className="responsiveTh">DO NO  :</th>
                <td></td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">DATE  :</th>
                <td></td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">IGM NO  :</th>
                <td>{jobData && jobData.length > 0 ? jobData[0].mblNo : '/'}</td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">DATE  : </th>
                <td></td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">Telephone :</th>
                <td></td>
              </tr>
              <tr>
                <th align="left" className="responsiveTh">ITEM No  :</th>
                <td></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <table>
        <tr>
          <th className='tblhead'>DearSir,</th>
          <td className="ps-5"></td>
        </tr>
      </table>
      <p>Please Deliver to ,the following packages which arrived Ex-Flight No.: - </p>
      <table className='mt-5 text-center text-xs' id='DeliveryOrderTable' style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tr>
          <th style={{ border: '2px solid black' }}>MAWB NO.</th>
          <th style={{ border: '2px solid black' }}>HAWB NO.:</th>
          <th style={{ border: '2px solid black' }}>NO OF PKG.</th>
          <th style={{ border: '2px solid black' }}>WEIGHT .</th>
          <th style={{ border: '2px solid black' }}>DESCRIPTION</th>
        </tr>
        <tr>
          <td style={{ border: '2px solid black' }} className='ps-5'>{jobData && jobData.length > 0 ? jobData[0].mblNo : '/'}</td>
          <td style={{ border: '2px solid black' }} className='ps-5'>{jobData && jobData.length > 0 ? jobData[0].hblNo : ''}</td>
          <td style={{ border: '2px solid black' }} className='ps-5'>{jobData && jobData.length > 0 ? jobData[0].noOfPackages : ''}</td>
          <td style={{ border: '2px solid black' }} className='ps-5'>{jobData && jobData.length > 0 ? jobData[0].volumeWt : ''}</td>
          <td style={{ border: '2px solid black' }} className='ps-5'></td>
        </tr>

      </table>
    </div>
  );
};
DeliveryOrderAirModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

//import FF sea
export const BookingConfirmationCustomerBothModule = ({ jobData }) => {
  return (
    <div>
      <HeaderShipperDataModule jobData={jobData} />
      <table className='tblhead text-xs text-left'>
        <tr>
          <th className='tblhead' style={{ textAlign: 'left' }}>Your Reference   :</th>
          <td className="ps-5"></td>
        </tr>
      </table>
      <hr className='hrRow'></hr>
      <p className='tblhead mt-5 text-xs'>We herewith confirm to have booked below mentioned shipment(s) as listed below.</p>
      <VesselEts jobData={jobData} />
      <hr className='hrRow'></hr>
      <div>
        <ShipperConsigneeTableModule jobData={jobData} />
      </div>
      <hr className='hrRow'></hr>
      <div>
        <PackagesGrossWeightModule jobData={jobData} />
      </div>
      <hr className='hrRow'></hr>
      <div>
        <ContainerTableModule jobData={jobData} />
      </div>
      <p className='tblhead mt-2 text-xs'>We trust we have served you with this information and kindly confirm the booking.</p>
      <p className='tblhead mt-2 text-xs'>Best Regards,</p>
    </div>

  );
};
BookingConfirmationCustomerBothModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const DeliveryOrdeModule = () => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  return (
    <div>
      <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
        <tr>
          <td width="49%" valign="top">
            <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" >
              <tr>
                <th align="left" style={thStyle}>DO Date:</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>To :-</th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
        <tr>
          <td width="49%" valign="top">
            <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" >
              <tr>
                <th align="left" style={thStyle}>Dear Sir,</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Subject:</th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
        <tr>
          <td width="49%" valign="top">
            <table className="tblhead" width="100%" border="0" cellSpacing="0" cellPadding="0" >
              <tr>
                <th align="left" style={thStyle}>Master B/L No.:</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>House B/L No.:</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>IGM / Item No.:</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>IGM Date :</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Vessel/Voyage:</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>Consignee Name.:</th>
                <td align="left" style={tdStyle}></td>
              </tr>
              <tr>
                <th align="left" style={thStyle}>CHA Name.:</th>
                <td align="left" style={tdStyle}></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <div>
        <p className='mt-3'>Ref subject shipment, we have recieved the original house B /L and all our charges from the consignee.
          By all respects the above House B/L has been checked & found in order.The original master B/L is
          surrendered at port of loading and the shipment is checked and found in order.
        </p>
        <p className='mt-3'>
          Please find enclosed herewith the copy of the MB/L and HB/L along with necessary endorsements, Kindly
          issue the delivery order to above mentioned consignee or his clearing agent.
        </p>
        <p className='mt-3'>
          We indemnify the Shipping Line and their Agents against any Liability, Loss & penalty that may be imposed
          on you or your Principals. We agree to bear all Cost,Penalty, Fine & Claims that may occur for releasing this
          shipment to the concern as per our instruction
        </p>
        <p className='mt-3'>
          Thanking you,
        </p>
        <p className='mt-3'>Yours faithfully,</p>
        <p>For </p>
        <p className='mt-3'>Authorised Signatory</p>
      </div>
    </div>
  );
};
DeliveryOrdeModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

// Export FF Air
export const BookingConfirmationCarrierModule = ({ jobData }) => {

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };


  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Flight No.</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Place of Origin </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Origin Airport </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Destination Airport </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Final Destination</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>ETS</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>ETA</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  )
};

BookingConfirmationCarrierModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const CustomerConsigneeModule = ({ jobData }) => {
  // Inline styles for table cells
  const tdStyle = {
    paddingLeft: '5px', // Adjust padding as needed
  };

  // Inline styles for table headers
  const thStyle = {
    fontWeight: 'bold', // Assuming you want your headers to be bold
    textAlign: 'left',
  };

  // Helper function to get the job data content
  const getContent = (data, field) => data && data.length > 0 ? data[0][field] : '';

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px', width: '100%' }}>
      <tbody>
        <tr>
          <th style={thStyle}>Customer</th>
          <td style={tdStyle}>
            {getContent(jobData, 'customerAddress')}
          </td>
          <th style={thStyle}>Consignee</th>
          <td style={tdStyle}>
            {getContent(jobData, 'consigneeName')}<br />
            {getContent(jobData, 'consigneeAddress')}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
CustomerConsigneeModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const cargoTypeModule = ({ jobData }) => {
  return (
    <div>
      <div style={{ display: 'inline-block' }}>
        <table className='mt-5 text-left text-xs text-left' >
          <tr>
            <th>Cargo Type </th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>Commodity </th>
            <td className="ps-5">{jobData && jobData.length > 0 ? jobData[0].commodityTypeName : ''}</td>
          </tr>
          <tr>
            <th>Port of Loading</th>
            <td className="ps-5">{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
          </tr>
          <tr>
            <th>Port of Discharge</th>
            <td className="ps-5">{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
          </tr>
          <tr>
            <th>Final Destination</th>
            <td className="ps-5">{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
          </tr>
          <tr>
            <th>MAWB No</th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>HAWB No</th>
            <td className="ps-5"></td>
          </tr>
        </table>
      </div>
      <div style={{ display: 'inline-block', marginLeft: '31%' }}>
        <table className='text-xs text-left'>
          <tr>
            <th>Carrier</th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>Depature Data</th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>Arrival Data</th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>Movement Scope</th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>MAWB Date</th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>HAWD Date</th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>Delivery Date</th>
            <td className="ps-5"></td>
          </tr>
        </table>
      </div>
    </div>
  );
}
cargoTypeModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const GrossModule = ({ jobData }) => {
  return (
    <div>
      <div style={{ display: 'inline-block' }}>
        <table className='mt-5 text-left text-xs text-left' >
          <tr>
            <th>Cargo Type </th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>Commodity </th>
            <td className="ps-5">{jobData && jobData.length > 0 ? jobData[0].commodityTypeName : ''}</td>
          </tr>
          <tr>
            <th>Gross Weight</th>
            <td className="ps-5">{jobData && jobData.length > 0 ? jobData[0].cargoWt : ''}</td>
          </tr>
          <tr>
            <th>Volumetric Weight </th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>Chargeable Weight</th>
            <td className="ps-5"></td>
          </tr>
        </table>
      </div>
      <div style={{ display: 'inline-block', marginLeft: '32%' }}>
        <table className='text-xs text-left'>
          <tr>
            <th>Cargo Type</th>
            <td className="ps-5"></td>
          </tr>
          <tr>
            <th>Commodity</th>
            <td className="ps-5">{jobData && jobData.length > 0 ? jobData[0].commodityTypeName : ''}</td>
          </tr>
        </table>
      </div>
    </div>
  );
};
GrossModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const GrossModuleAir = ({ jobData }) => {

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <div>
      <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Cargo Type </th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Commodity </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].commodityTypeName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Gross Weight</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].cargoWt : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Volumetric Weight </th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Chargeable Weight</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </table>
    </div>
  );
};
GrossModuleAir.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const BookingConfirmationCustomerModule = ({ jobData }) => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };


  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Flight No.</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Place of Origin </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Origin Airport </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Destination Airport </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Final Destination</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Airline Name</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Departure Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Arrival Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
BookingConfirmationCustomerModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const DeliveryConfirmationAirModule = ({ jobData }) => {

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };


  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Flight No.</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Place of Origin </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Origin Airport </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Destination Airport </th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Final Destination</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MAWB No.</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HAWB No</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Airline Name</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Departure Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Arrival Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope	</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MAWB Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HAWB Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Delivery Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
}
DeliveryConfirmationAirModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const PackageModule = ({ jobData }) => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>No.Of Packages</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Gross Weight</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].cargoWt : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Volume</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
}
PackageModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const FreightCertificateEAirModule = ({ jobData }) => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };


  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Flight No.</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Place of Origin</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Origin Airport</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Destination Airport</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Final Destination</th>
              <td align="left" style={tdStyle}>{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MAWB No.</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HAWB No</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>IGM No.</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Airline Name</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Departure Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Arrival Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Movement Scope</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>MAWB Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>HAWB Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>IGM Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
FreightCertificateEAirModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const TransportInstructionsAirModule = () => {

  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };

  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Carrier .</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Carrier Ref. No	</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Pickup Details</th>
              <td align="left" style={tdStyle}></td>
            </tr>
            <tr>
              <th align="left" style={thStyle}>Factory Details	</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
TransportInstructionsAirModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const TransporAirModule = () => {
  const thStyle = { width: '10%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };
  const tdStyle = { width: '30%', textAlign: 'left', padding: '5px', verticalAlign: 'top' };


  return (
    <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" style={{ marginTop: '20px' }}>
      <tr>
        <td width="49%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>Origin Airport</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
        <td width="51%" valign="top">
          <table className='tblhead' width="100%" border="0" cellSpacing="0" cellPadding="0" >
            <tr>
              <th align="left" style={thStyle}>	Departure Date</th>
              <td align="left" style={tdStyle}></td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  );
};
TransporAirModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const InstructionsAirModule = () => {
  return (
    <div>
      <table className="table-fixed text-xs  text-left custom-table" style={{ width: '100%' }}>
        <tbody>
          <tr>
            <th className="header">Flight No.</th>
            <td>

            </td>
            <th className="header">Airline Name </th>
            <td>

            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
InstructionsAirModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

// Job Sheet
// Job Sheet
export const JobContainerModule = ({ jobData }) => {
  const thStyle = {
    width: '15%',
    padding: '5px',
    verticalAlign: 'top',
    backgroundColor: '#e0e0e0',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '2px solid #A9A9A9',
    textAlign: 'center'
  };

  const tdStyle = {
    width: '15%',
    textAlign: 'left',
    padding: '5px',
    verticalAlign: 'top',
    border: '2px solid #A9A9A9',
    backgroundColor: '#ffffff'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const hoverHighlightStyle = {
    ':hover': {
      backgroundColor: '#f2f2f2'
    }
  };
  return (
    <>
      <div>
        <table style={tableStyle} className="text-xs tblhead">
          <thead>
            <tr>
              <th style={thStyle}>Container No</th>
              <th style={thStyle}>Size</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Gross Weight</th>
              <th style={thStyle}>Net Weight</th>
              <th style={thStyle}>Total No of Packages</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(jobData) ? jobData.map((job, jobIndex) =>
              Array.isArray(job.tblJobContainer) ? job.tblJobContainer.map((container, containerIndex) => (
                <tr
                  key={`${jobIndex}-${containerIndex}`}
                  style={hoverHighlightStyle}
                >
                  <td style={tdStyle}>{container.containerNo || ''}</td>
                  <td style={tdStyle}>{container.sizeName || ''}</td>
                  <td style={tdStyle}>{container.typeName || ''}</td>
                  <td style={tdStyle}>{container.grossWt ? container.grossWt : ''}</td>
                  <td style={tdStyle}>{container.netWt ? container.netWt : ''}</td>
                  <td style={tdStyle}>{container.noOfPackages || ''}</td>
                </tr>
              )) : null
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
};
JobContainerModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const JobDetailsModule = ({ jobData }) => {

  const thStyle = {
    textAlign: 'left',
    padding: '8px 16px',
    verticalAlign: 'top',
    backgroundColor: '#e0e0e0',
    fontSize: '0.75rem',
    fontWeight: '600',
    border: '2px solid #A9A9A9',
  };

  const tdStyle = {
    textAlign: 'left',
    padding: '8px 16px',
    verticalAlign: 'top',
    border: '2px solid #A9A9A9',
  };

  const tableStyle = {
    minWidth: '100%',
    borderCollapse: 'collapse',
  };
  return (
    <>
      <div>
        <table style={tableStyle} className="table-fixed text-xs tblhead">
          <tbody>
            <tr>
              <th style={thStyle}>Job no:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].jobNo : ''}</td>
              <th style={thStyle}>Job Date:</th>
              <td style={{ ...tdStyle }} colSpan="3">
                {jobData && jobData.length > 0 ? new Date(jobData[0].jobDate).toLocaleDateString('en-GB') : ''}
              </td>
              <th style={thStyle}>Commodity:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].commodityTypeName : ''}</td>
            </tr>
            {/* Customer, Shipper, Consignee */}
            <tr>
              <th style={thStyle}>Customer:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].customerAddress : ''}</td>
              <th style={thStyle}>Shipper:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].shipperAddress : ''}</td>
              <th style={thStyle}>Consignee:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].consigneeAddress : ''}</td>
            </tr>
            {/* PLR, POL, POD */}
            <tr>
              <th style={thStyle}>PLR:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].plrName : ''}</td>
              <th style={thStyle}>POL:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].polName : ''}</td>
              <th style={thStyle}>POD:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].podName : ''}</td>
            </tr>
            {/* FPO, Departure Vessel, Arrival Vessel */}
            <tr>
              <th style={thStyle}>FPO:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].fpdName : ''}</td>
              <th style={thStyle}>Departure Vessel:</th>
              <td style={{ ...tdStyle }} colSpan="3">/</td>
              <th style={thStyle}>Arrival Vessel:</th>
              <td style={{ ...tdStyle }} colSpan="3">/</td>
            </tr>
            {/* No of Packages, Gross weight, Volume */}
            <tr>
              <th style={thStyle}>No of Packages:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].noOfPackages : ''}</td>
              <th style={thStyle}>Gross weight:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].cargoWt : ''}</td>
              <th style={thStyle}>Volume:</th>
              <td style={{ ...tdStyle }} colSpan="3">
                {jobData && jobData.length > 0 ? `${jobData[0].volume} ${jobData[0].volumeUnitName}` : ''}
              </td>
            </tr>
            {/* Sales Person */}
            <tr>
              <th style={thStyle}>Sales Person:</th>
              <td style={{ ...tdStyle }} colSpan="3">{jobData && jobData.length > 0 ? jobData[0].salesPersonName : ''}</td>
              {/* Placeholder for potentially additional data */}
              <th style={thStyle}></th>
              <td style={{ ...tdStyle }} colSpan="3"></td>
              <th style={thStyle}></th>
              <td style={{ ...tdStyle }} colSpan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};
JobDetailsModule.propTypes = {
  jobData: PropTypes.arrayOf(PropTypes.object)
};

export const JobChargeModule = ({ jobData, voucherData }) => {
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  };

  const headerStyle = {
    backgroundColor: '#e0e0e0',
    color: '#000',
    border: '2px solid #707070',
    padding: '8px',
    textAlign: 'center'
  };

  const cellStyle = {
    border: '2px solid #707070',
    padding: '8px',
    textAlign: 'center'
  };

  //console.log("Voucher", voucherData)
  let totalRevenueProvisional = 0;
  let totalCostProvisional = 0;
  let totalRevenueActual = 0;
  let totalCostActual = 0;

  let allVoucherDetails = [];

  // Flatten the array of arrays into a single array of voucher details
  voucherData?.forEach(voucher => {
    voucher.tblVoucherLedger?.forEach(ledger => {
      allVoucherDetails.push(...ledger.tblVoucherLedgerDetails);
    });
  });

  // Assuming jobData and voucherData are arrays of job charges.
  // If the structures are different, you will need to adjust the mapping logic accordingly.
  return (
    <>
      <style>{`
      .table-fixed tbody tr:hover {
        background-color: #f2f2f2;
      }
    `}</style>
      <div>
        <table style={tableStyle} className="table-fixed text-xs">
          <thead>
            <tr>
              <th rowSpan="2" style={headerStyle}>Charge Name</th>
              <th colSpan="4" style={headerStyle}>Provisional</th>
              <th colSpan="4" style={headerStyle}>Actual</th>
            </tr>
            <tr>
              <th style={headerStyle}>Revenue</th>
              <th style={headerStyle}>Cost</th>
              <th style={headerStyle}>Profit</th>
              <th style={headerStyle}>Neutral</th>
              <th style={headerStyle}>Revenue</th>
              <th style={headerStyle}>Cost</th>
              <th style={headerStyle}>Profit</th>
              <th style={headerStyle}>Neutral</th>
            </tr>
          </thead>
          <tbody>
            {jobData && jobData.map((job, jobIndex) => (
              job.tblJobCharge && job.tblJobCharge.map((charge, chargeIndex) => {
                const profitProvisional = (charge.sellAmount || 0) - (charge.buyAmount || 0);
                totalRevenueProvisional += charge.sellAmount || 0;
                totalCostProvisional += charge.buyAmount || 0;

                // For actual amounts, use similar logic as above.
                // totalRevenueActual += charge.actualSellAmount || 0;
                // totalCostActual += charge.actualBuyAmount || 0;

                // Get corresponding voucher details
                const voucherDetail = allVoucherDetails[chargeIndex] || {};
                const revenueActual = voucherDetail.creditAmount || 0;
                const costActual = voucherDetail.debitAmount || 0;
                const profitActual = revenueActual - costActual;

                // Sum up actual totals
                totalRevenueActual += revenueActual;
                totalCostActual += costActual;

                return (
                  <tr key={`job-${jobIndex}-charge-${chargeIndex}`}>
                    <td style={cellStyle}>{charge.chargeName || '/'}</td>
                    <td style={cellStyle}>{charge.sellAmount || '/'}</td>
                    <td style={cellStyle}>{charge.buyAmount || '/'}</td>
                    <td style={cellStyle}>{profitProvisional || '/'}</td>
                    <td style={cellStyle}></td>
                    {/* Actual columns can be filled in when you have the data */}
                    <td style={cellStyle}>{revenueActual}</td>
                    <td style={cellStyle}>{costActual}</td>
                    <td style={cellStyle}>{profitActual}</td>
                    <td style={cellStyle}></td> {/* Neutral - placeholder */} {/* This is for 'Neutral' which you haven't defined */}
                    {/* < {totalRevenueActual} , {totalCostActual} , {totalProfitActual}  > */}
                  </tr>
                );
              })
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th style={cellStyle}>Grand Total:</th>
              <td style={cellStyle}>{totalRevenueProvisional}</td>
              <td style={cellStyle}>{totalCostProvisional}</td>
              <td style={cellStyle}>{totalRevenueProvisional - totalCostProvisional}</td>
              {/* Actual totals can be added when you have the data */}
              <td style={cellStyle}>/</td>
              <td style={cellStyle}>{totalRevenueActual}</td>
              <td style={cellStyle}>{totalCostActual}</td>
              <td style={cellStyle}>{totalRevenueActual - totalCostActual}</td>
              <td style={cellStyle}>/</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};
JobChargeModule.propTypes = {
  jobData: PropTypes.object.isRequired,
  voucherData: PropTypes.object.isRequired
};

const JobReports = () => {
  return (
    <main>
      <VesselModule />
      <CompanyImgModule />
      <HeaderModule />
      <HeaderShipperDataModule />
      <ShipperConsigneeTableModule />
      <PackagesGrossWeightModule />
      <ContainerTableModule />
      <PlrCarrierModule />
      <CartingDetailsModule />
      <DeliveryConfirmationModule />
      <RequestforPaymentModule />
      <TransportInstructionsModule />
      <FreightCertificateModule />
      <FreightCertificateFutterModule />

      {/* import FF air */}
      <FreightCertificateAirModule />
      <FreightCargoAirModule />
      <DeliveryOrderAirModule />
      {/* import FF sea */}
      <BookingConfirmationCustomerBothModule />
      <PackagesGrossWeightSeaModule />
      <PlrCarrierSeaModule />
      <DeliveryOrdeModule />
      {/* export FF air */}
      <BookingConfirmationCarrierModule />
      <CustomerConsigneeModule />
      <GrossModule />
      <BookingConfirmationCustomerModule />
      <DeliveryConfirmationAirModule />
      <PackageModule />
      <FreightCertificateEAirModule />
      <GrossModuleAir />
      <ShipperConsigneeTableAirModule />
      <TransportInstructionsAirModule />
      <TransporAirModule />
      <InstructionsAirModule />
      <JobContainerModule />
      <JobDetailsModule />
      <JobChargeModule />
    </main>
  );
};

export default JobReports;
