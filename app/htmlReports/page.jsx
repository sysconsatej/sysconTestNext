'use client'
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useEffect, useState } from 'react';
import './htmlReports.css';

const HtmlReports = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [selectedReports, setSelectedReports] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const modalButton = document.querySelector('[data-modal-toggle="default-modal"]');
    const modalCloseButton = document.querySelector('[data-modal-hide="default-modal"]');

    const toggleModal = () => {
      setModalVisible(!isModalVisible);
    };

    if (modalButton) {
      modalButton.addEventListener('click', toggleModal);
    }

    if (modalCloseButton) {
      modalCloseButton.addEventListener('click', toggleModal);
    }

    return () => {
      if (modalButton) {
        modalButton.removeEventListener('click', toggleModal);
      }

      if (modalCloseButton) {
        modalCloseButton.removeEventListener('click', toggleModal);
      }
    };
  }, [isModalVisible]);

  useEffect(() => {
    const fetchData = async (sysconName = "Job") => {
      try {
        const response = await fetch(`${baseUrl}/api/reports/htmlReportList`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        //console.log("Fetched data:", data.data); // Debug log

        let reports = data.data;

        if (sysconName) {
          reports = reports.filter(report => report.sysconName === sysconName);
          //console.log("Filtered reports:", reports); // Debug log
        }

        setReportData(reports);
      } catch (error) {
        //console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleCheckboxChange = (reportId) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
    } else {
      setSelectedReports([...selectedReports, reportId]);
    }
    // Deselect "Select All" if any item is manually deselected
    setSelectAll(false);
  };

  const handleSelectAllChange = () => {
    if (!selectAll) {
      setSelectedReports(reportData.map((report) => report._id));
    } else {
      setSelectedReports([]);
    }
    setSelectAll(!selectAll);
  };

  // On the current page where reports are selected
  const handleOpenReports = () => {
    const selectedReportDetails = selectedReports.map((reportId) => {
      const report = reportData.find((report) => report._id === reportId);
      return report ? { _id: report._id, ReportName: report.ReportName, ReportId: report.ReportId } : null;
    }).filter(report => report !== null);

    if (selectedReportDetails.length === 0) {
      alert('No reports selected. Please select at least one report.');
      return;
    }

    const selectedReportIds = selectedReportDetails.map(report => report.ReportId);
    sessionStorage.setItem('selectedReportIds', JSON.stringify(selectedReportIds));
    //console.log(selectedReportIds)

    // Determine the sysconName
    const sysconName = reportData.length > 0 ? reportData[0].sysconName : '';

    // Redirect based on sysconName
    switch (sysconName) {
      case 'Quotation':
        window.location.href = `/htmlReports/rptQuotation`;
        break;
      case 'Job':
        window.location.href = `/htmlReports/rptJobs`;
        break;
      case 'Invoice':
        window.location.href = `/htmlReports/rptInvoice`;
        break;
      default:
        // Redirect to a default page if sysconName is not handled
        window.location.href = `/htmlReports/defaultPage`;
    }
  };

  const handleEmailReport = () => {
    const selectedEmailsDetails = selectedReports.map((reportId) => {
      const report = reportData.find((report) => report._id === reportId);
      return report ? { _id: report._id, ReportName: report.ReportName, ReportId: report.ReportId } : null;
    }).filter(report => report !== null);

    if (selectedEmailsDetails.length === 0) {
      alert('No reports selected. Please select at least one report.');
      return; // Exit the function if no reports are selected
    }

    const selectedEmailIds = selectedEmailsDetails.map(report => report.ReportId);
    sessionStorage.setItem('emailReportIds', JSON.stringify(selectedEmailIds));
    //console.log(selectedEmailIds)
    window.location.href = `/htmlReports/rptJobs`;

    //   //Determine the sysconName ----------
    //   const sysconName = reportData.length > 0 ? reportData[0].sysconName : '';

    //  // Redirect based on sysconName -----------
    //   switch (sysconName) {
    //     case 'Quotation':
    //       window.location.href = `/htmlReports/rptQuotation`;
    //       break;
    //     case 'Job':
          window.location.href = `/htmlReports/rptJobs`;
    //       break;
    //     default:
    //       // Redirect to a default page if sysconName is not handled
    //       window.location.href = `/htmlReports/defaultPage`;
    // }
  };

  const handlePDFReport = () => {
    const selectedPDFDetails = selectedReports.map((reportId) => {
      const report = reportData.find((report) => report._id === reportId);
      return report ? { _id: report._id, ReportName: report.ReportName, ReportId: report.ReportId } : null;
    }).filter(report => report !== null);

    if (selectedPDFDetails.length === 0) {
      alert('No reports selected. Please select at least one report.');
      return; // Exit the function if no reports are selected
    }

    const selectedPDFIds = selectedPDFDetails.map(report => report.ReportId);
    sessionStorage.setItem('pdfReportIds', JSON.stringify(selectedPDFIds));
    //console.log(selectedEmailIds)
    window.location.href = `/htmlReports/rptJobs`;

    //   //Determine the sysconName ----------
    //   const sysconName = reportData.length > 0 ? reportData[0].sysconName : '';

    //  // Redirect based on sysconName -----------
    //   switch (sysconName) {
    //     case 'Quotation':
    //       window.location.href = `/htmlReports/rptQuotation`;
    //       break;
    //     case 'Job':
          window.location.href = `/htmlReports/rptJobs`;
    //       break;
    //     default:
    //       // Redirect to a default page if sysconName is not handled
    //       window.location.href = `/htmlReports/defaultPage`;
    // }
  };


  const splitIntoColumns = (data) => {
    const midIndex = Math.ceil(data.length / 2);
    return [data.slice(0, midIndex), data.slice(midIndex)];
  };

  const [column1, column2] = splitIntoColumns(reportData);

  return (
    <div>
      <div className="table-container">
        <button
          data-modal-toggle="default-modal"
          className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-5 mb-5"
          type="button"
          onClick={() => setModalVisible(true)}
        >
          Click
        </button>
      </div>
      {isModalVisible && (
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center">
          <div
            className="overflow-y-auto overflow-x-hidden relative bg-white rounded-lg shadow max-w-2xl w-full p-4 md:p-5"
            aria-hidden="true"
          >
            <div className="relative">
              <div className="flex items-center justify-between border-b rounded-t ">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Reports</h3>
                <button
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                  data-modal-hide="default-modal"
                  onClick={() => setModalVisible(false)}
                >
                  <span className="sr-only">Close modal</span>
                  {/* Close icon */}
                </button>
              </div>
              <div className="p-4 md:p-5 space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      className="mr-2"
                      onChange={handleSelectAllChange}
                      checked={selectAll}
                    />
                    <p>Select All</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="w-1/2 ">
                    {column1.map((report) => (
                      <div key={report._id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          className="mr-2"
                          onChange={() => handleCheckboxChange(report._id)}
                          checked={selectedReports.includes(report._id)}
                        />
                        <p>{report.ReportName}</p>
                      </div>
                    ))}
                  </div>
                  <div className="w-1/2 mt-4">
                    {column2.map((report) => (
                      <div key={report._id} className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          className="mr-2"
                          onChange={() => handleCheckboxChange(report._id)}
                          checked={selectedReports.includes(report._id)}
                        />
                        <p>{report.ReportName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end p-4 md:p-5 border-t border-gray-200 rounded-b">
                <button
                  onClick={handleOpenReports}
                  className="text-white ms-3 bg-blue-700 ms-3 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Open
                </button>
                <button
                  onClick={handleEmailReport}
                  className="text-white ms-3 bg-blue-300 ms-3 hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Email
                </button>
                <button
                  onClick={handlePDFReport}
                  className="text-white ms-3 bg-blue-300 ms-3 hover:bg-blue-400 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  PDF
                </button>
                <button
                  onClick={() => setModalVisible(false)}
                  className="ms-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlReports;
