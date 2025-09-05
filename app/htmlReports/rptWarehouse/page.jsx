'use client';
/* eslint-disable */
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { toWords } from 'number-to-words';
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import { useSearchParams } from 'next/navigation';
import './rptWarehouse.css';
import PropTypes from 'prop-types';
import { fetchDataAPI } from "@/services/auth/FormControl.services"
import { decrypt } from "@/helper/security";
import jsPDF from 'jspdf';  // Import jsPDF
import 'jspdf-autotable';   // Import AutoTable plugin
import html2canvas from 'html2canvas';
import { printPDF } from '@/services/auth/FormControl.services'


function rptWarehouse() {
    const searchParams = useSearchParams();
    const [reportIds, setReportIds] = useState([]);
    const [data, setData] = useState([]);
    const [CompanyHeader, setCompanyHeader] = useState('');
    const [ImageUrl, setImageUrl] = useState('');
    const enquiryModuleRef = useRef();

    const [html2pdf, setHtml2pdf] = useState(null);

    useEffect(() => {
        const loadHtml2pdf = async () => {
            const module = await import('html2pdf.js');
            setHtml2pdf(() => module.default);
        };

        loadHtml2pdf();
    }, []);

    useEffect(() => {
        const storedReportIds = sessionStorage.getItem('selectedReportIds');
        if (storedReportIds) {
            let reportIds = JSON.parse(storedReportIds);
            reportIds = Array.isArray(reportIds) ? reportIds : [reportIds];
            console.log("Retrieved Report IDs:", reportIds);
            setReportIds(reportIds);
        } else {
            console.log("No Report IDs found in sessionStorage");
        }
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const _id = searchParams.get('reportId');
            console.log(_id);
            if (_id != null) {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) throw new Error("No token found");
                    const response = await fetch(`${baseUrl}/api/Reports/tblWhTransaction`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            "x-access-token": JSON.parse(token)
                        },
                        body: JSON.stringify({
                            "projection": {

                            },
                            _id: _id
                        }),
                    });
                    if (!response.ok) throw new Error('Failed to fetch job data');
                    const data = await response.json();
                    //console.log('Fetched data: NEWWWWW', data.data[0].brachId);
                    setData(data.data);
                    setCompanyHeader(data.data[0].brachId)

                } catch (error) {
                    console.error('Error fetching job data:', error);
                }
            }
        };
        if (reportIds.length > 0) {
            fetchData();
        }
    }, [reportIds]);

    useEffect(() => {
        const fetchHeader = async () => {
            const storedUserData = localStorage.getItem("userData");
            if (storedUserData) {
                const decryptedData = decrypt(storedUserData);
                const userData = JSON.parse(decryptedData);
                const BranchId = userData[0].defaultBranchId
                const clientCode = userData[0].clientCode;
                const requestBody = {
                    tableName: "tblCompanyBranchParameter",
                    whereCondition: {
                        status: 1,
                        companyBranchId: BranchId,
                        clientCode: clientCode
                    },
                    projection: {
                        tblCompanyBranchParameterDetails: 1
                    }
                }
                try {
                    const dataURl = await fetchDataAPI(requestBody);
                    const response = dataURl.data
                    if (response && response.length > 0 && response[0].tblCompanyBranchParameterDetails.length > 0) {
                        const headerUrl = response[0].tblCompanyBranchParameterDetails[0].header;
                        setImageUrl(headerUrl);
                    } else {
                        console.error("No valid data received");
                    }
                } catch (error) {
                    console.error("Error fetching initial data:", error);
                }
            }
        }
        fetchHeader();
    }, [CompanyHeader]);

    const CompanyImgModule = () => {
        return (
            <img src={ImageUrl} alt='LOGO' style={{ marginTop: '-35px' }}></img>
        );
    };

    const handlePrint = async () => {
        const element = enquiryModuleRef.current;
        const initialHtml = "<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'></head><body>";
        const finalHtml = "</body></html>";
        const html = initialHtml + element.innerHTML + finalHtml;
        const pdfName = reportIds;

        const requestBody = {
            orientation: "landscape",
            pdfFilename: pdfName,
            htmlContent: html
        };

        try {
            const blob = await printPDF(requestBody);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', pdfName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            console.log("PDF generated and downloaded successfully.");
        } catch (error) {
            console.error("Error while generating PDF:", error);
        }
    };

    const FulfillmentRatesModule = () => (
        <div >
            <div id="150" className='container mx-auto p-14 bodyColour text-black'>
                <CompanyImgModule />
                <h1 className='' style={{ textAlign: "center", color: "black", fontWeight: "bold" }}>
                    Fulfillment Rates For Aquarelle Home
                </h1>

            </div>
        </div>
    );

    return (
        <main>
            <div className="flex space-x-4 p-2">
                <button
                    className="ms-2 inline-flex items-center px-5 py-2.5 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                    onClick={handlePrint}
                >
                    Print
                </button>
            </div>
            <div className='mt-5'>
                {reportIds.map((reportId, index) => {
                    switch (reportId) {
                        case 'Fullfillment Rates':
                            return <div key={index} ref={enquiryModuleRef} className={index < reportIds.length - 1 ? "report-spacing" : ""}>
                                {FulfillmentRatesModule()}
                            </div>;
                        case 'Quotation Cost Sheet':
                            return (
                                <div
                                    key={index}
                                    ref={enquiryModuleRef}
                                    className={index < reportIds.length - 1 ? "report-spacing" : ""}
                                >
                                    {QuotationEnquiryModule()}
                                </div>
                            );
                        default:
                            return null;
                    }
                })}
            </div>
        </main>
    );

}
//AKASH
export default rptWarehouse;