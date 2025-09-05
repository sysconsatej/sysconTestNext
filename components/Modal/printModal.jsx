"use client";
/* eslint-disable */
import React, { useEffect, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import PropTypes from "prop-types";
import styles from "@/components/common.module.css";
import { useSearchParams } from "next/navigation";
import { useParams } from "next/navigation";
import { decrypt } from "@/helper/security";
import {
  fetchReportData,
  insertReportData,
} from "@/services/auth/FormControl.services";
import { toast } from "react-toastify";
import { getUserDetails } from "@/helper/userDetails";
import { useDispatch, useSelector } from "react-redux";
import { updateFlag } from "@/app/counterSlice";

export default function PrintModal({
  setOpenPrintModal,
  openPrintModal,
  submittedRecordId,
  submittedMenuId,
  pageType,
}) {
  const dispatch = useDispatch();
  const [formTableName, setFormTableName] = useState(null);
  const [reportType, setReportType] = useState("combined");
  const [reportNames, setReportNames] = useState([]);
  const [selectedReportNames, setSelectedReportNames] = useState([]);
  const [templateId, setTemplateId] = useState([]);
  const searchParams = useParams();
  const [redirectedPageType, setRedirectedPageType] = useState(null);
  const id = searchParams.id;

  useEffect(() => {
    setRedirectedPageType(pageType);
  }, [pageType]);

  const handleClose = () => {
    try {
      setOpenPrintModal((prev) => !prev);
    } catch (err) {
      console.error("Error in handleClose:", err);
    }
  };

  const handlePrint = async (reportData) => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientId = userData[0]?.clientId;
      const userId = userData[0]?.id;

      // const { clientId, userId } = getUserDetails();
      if (!reportData || reportData.length === 0) {
        toast.error("Please select a report First.");
        return;
      }
      let selectedHtmlReportData = [];
      // let selectedRedirectionReportData = [];
      let selectedRedirectionHtmlReportData = [];

      if (reportType) {
        dispatch(
          updateFlag({
            flag: "reportTypeForPrint",
            value: reportType,
          })
        );
      }

      // const selectedHtmlReportData = reportData.filter(
      //   (report) => report.menuType === "O" || report.menuType === "o"
      // );

      const selectedTemplateReportData = reportData.filter(
        (report) => report?.menuType === "T" || report?.menuType === "t"
      );

      if (redirectedPageType === "Forms") {
        selectedHtmlReportData = reportData.filter(
          (report) => report?.menuType === "O" || report?.menuType === "o"
        );
      } else if (redirectedPageType === "searchPage") {
        selectedRedirectionHtmlReportData = reportData.filter(
          (report) =>
            (report?.menuType === "O" || report?.menuType === "o") &&
            report?.redirectionPath != null
        );

        selectedHtmlReportData = reportData.filter(
          (report) =>
            (report?.menuType === "O" || report?.menuType === "o") &&
            report?.redirectionPath == null
        );
      }

      if (selectedHtmlReportData.length > 0) {
        if (reportType === "separate") {
          for (let index = 0; index < selectedHtmlReportData.length; index++) {
            const report = selectedHtmlReportData[index];
            const selectedReportIds = [report?.ReportName?.toString()];
            console.log("ReportName", selectedReportIds);
            sessionStorage.setItem(
              "selectedReportIds",
              JSON.stringify(selectedReportIds)
            );

            const url = `${report?.ReportMenuLink}?recordId=${submittedRecordId}&reportId=${report?.reportMenuId}`;
            if (url && report?.ReportMenuLink && report?.reportMenuId) {
              window.open(url, "_blank");
            } else {
              console.error(
                "Unable to open the report: URL or ID is not defined.",
                report
              );
            }
          }
        } else if (reportType === "combined") {
          const groupedData = selectedHtmlReportData.reduce((acc, curr) => {
            const existing = acc.find(
              (item) => item.ReportMenuLink === curr.ReportMenuLink
            );
            if (existing) {
              if (!existing.ReportName.includes(curr.ReportName)) {
                existing.ReportName.push(curr.ReportName);
              }
            } else {
              acc.push({
                ReportMenuLink: curr.ReportMenuLink,
                reportMenuId: curr.reportMenuId,
                ReportName: [curr.ReportName],
              });
            }
            return acc;
          }, []);

          for (let index = 0; index < groupedData.length; index++) {
            const report = groupedData[index];
            sessionStorage.setItem(
              "selectedReportIds",
              JSON.stringify(report?.ReportName)
            );

            const url = `${report?.ReportMenuLink}?recordId=${submittedRecordId}&reportId=${report?.reportMenuId}`;
            if (url && report?.ReportMenuLink && report?.reportMenuId) {
              window.open(url, "_blank");
            } else {
              console.error(
                "Unable to open the report: URL or ID is not defined.",
                report
              );
            }
          }
        }
      }
      if (selectedTemplateReportData.length > 0) {
        if (reportType === "separate") {
          selectedTemplateReportData.forEach((report) => {
            const templateId = report?.reportTemplateId;
            const url = `/reportTemplateCreator/viewEditer?templateId=${templateId}&reportId=${submittedRecordId}&menuName=${submittedMenuId}`;

            if (url && report?.reportMenuId) {
              window.open(url, "_blank");
            } else {
              console.error(
                "Unable to open the report: URL or ID is not defined.",
                report
              );
            }
          });
        } else if (reportType === "combined") {
          const allTemplateIds = selectedTemplateReportData
            .map((report) => report?.reportTemplateId)
            .filter(Boolean); // filter out any undefined/null values

          const templateId = allTemplateIds.join("!"); // use "!" as delimiter

          const url = `/reportTemplateCreator/viewEditer?templateId=${templateId}&reportId=${submittedRecordId}&menuName=${submittedMenuId}`;
          console.log("url", url);

          if (url) {
            window.open(url, "_blank");
          } else {
            console.error(
              "Unable to open the combined report: URL not defined."
            );
          }
        }
      }
      if (selectedRedirectionHtmlReportData.length > 0) {
        selectedRedirectionHtmlReportData.forEach((report) => {
          const rawPath = decodeURIComponent(report?.redirectionPath || "");
          const replacedPath = rawPath.replace(
            "{selectedReportId}",
            submittedRecordId
          );
          const match = replacedPath.match(/formControl\/addEdit\/(.+)$/);
          let finalUrl = null;
          if (match && match[1]) {
            try {
              const jsonString = match[1];
              const parsedData = JSON.parse(jsonString);
              finalUrl = `/formControl/addEdit/${encodeURIComponent(
                JSON.stringify({
                  id: parsedData?.id,
                  menuName: parsedData?.menuName,
                  isCopy: parsedData?.isCopy,
                  isView: parsedData?.isView,
                })
              )}`;
            } catch (err) {
              console.error("Error parsing JSON from replacedPath:", err);
            }
          } else {
            console.error("Invalid replacedPath format:", replacedPath);
          }
          if (finalUrl) {
            window.open(finalUrl, "_blank");
          } else {
            console.error(
              "Unable to open the report: URL or ID is not defined.",
              report
            );
          }
        });
      }
      for (const data of reportData) {
        const insertPayload = {
          TableName: "tblReportPrintLog",
          Record: {
            menuId: submittedMenuId,
            tablename: formTableName,
            pkeyId: data?.reportMenuId || null,
            printedById: userId,
            printedDate: getFormattedDateTime(),
            clientId: clientId,
            createdBy: userId,
          },
          WhereCondition: null,
        };

        try {
          let insertResponse = await insertReportData(insertPayload);
          console.log("insertResponse", insertResponse);
        } catch (err) {
          console.error("Error inserting report data:", err);
        }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        const clientId = userData[0]?.clientId;
        const menuName = id;
        if (menuName !== null) {
          const requestBody = {
            columns:
              "mrm.reportMenuId,mrm.reportTemplateId,tm.menuName,tm.menuLink,tm.menuType,tm.clientId,mrm.redirectionPath,tm.displayName",
            tableName:
              "tblMenuReportMapping mrm Inner Join tblMenu tm on mrm.reportMenuId = tm.id",
            whereCondition: `mrm.menuId = ${submittedMenuId} and tm.status = 1 and mrm.clientId in (${clientId} ,(select id from tblClient where clientCode = 'SYSCON'))`,
            clientIdCondition: `mrm.status = 1 and tm.menuType in ('O','T') FOR JSON PATH, INCLUDE_NULL_VALUES`,
          };

          try {
            const response = await fetchReportData(requestBody);
            console.log("Response Test:", response);
            const data = response.data || response;
            if (Array.isArray(data) && data.length > 0) {
              const fetchedMenuNames = data.map((item) => ({
                ReportId: item.reportTemplateId,
                ReportName: item.menuName,
                ReportMenuLink: item.menuLink,
                menuType: item.menuType,
                reportMenuId: item.reportMenuId,
                reportTemplateId: item?.reportTemplateId,
                redirectionPath: item?.redirectionPath,
                displayName: item?.displayName,
                //reportType: "T", // Assuming "T" as a static value for `reportType`
              }));
              setReportNames(fetchedMenuNames);
            } else {
              setReportNames([]);
            }
          } catch (error) {
            console.error("Error fetching initial data:", error);
          }
        }
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchMenuTableNames = async () => {
      if (submittedMenuId) {
        const { clientId } = getUserDetails();
        const requestBody = {
          columns: "tableName",
          tableName: "tblForm",
          whereCondition: `id in (select formId from tblMenuFormMapping where menuId=${submittedMenuId} and level=1 and status=1 and srNO=1 and clientId in (${clientId},(select id from tblClient where clientCode = 'SYSCON')))`,

          clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
        };
        const tableName = await fetchReportData(requestBody);
        if (tableName?.success && tableName?.data?.length > 0) {
          setFormTableName(tableName?.data[0]?.tableName);
        }
      }
    };

    fetchMenuTableNames();
  }, [submittedMenuId]);

  const getFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.000`;
  };

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openPrintModal}
        onClose={handleClose}
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openPrintModal}>
          <div
            className={`relative inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center px-4 `}
          >
            <div
              className={`bg-[var(--commonBg)] 
              } p-[30px] rounded-lg shadow-xl  w-full sm:w-[460px] h-auto flex flex-col justify-between mx-auto max-w-full sm:max-w-[520px]`}
            >
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <p className="text-[var(--commonTextColor)] text-[14px] font-bold">
                    Reports
                  </p>
                  <div className="flex gap-2">
                    <label className="flex items-center space-x-1 text-[12px] text-[var(--commonTextColor)]">
                      <input
                        type="radio"
                        name="reportType"
                        value="combined"
                        className="mr-1"
                        checked={reportType === "combined"}
                        onChange={(e) => setReportType(e.target.value)}
                      />
                      <span>Combined</span>
                    </label>
                    <label className="flex items-center space-x-1 text-[12px] text-[var(--commonTextColor)]">
                      <input
                        type="radio"
                        name="reportType"
                        value="separate"
                        className="mr-1"
                        checked={reportType === "separate"}
                        onChange={(e) => setReportType(e.target.value)}
                      />
                      <span>Separate</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex flex-col mt-6 mb-6">
                <div className="flex items-center space-x-2 text-[12px] text-[var(--commonTextColor)] mb-4">
                  <input
                    type="checkbox"
                    name="selectAll"
                    className="mr-1"
                    checked={
                      reportNames.length > 0 &&
                      selectedReportNames.length === reportNames.length
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedReportNames(reportNames);
                      } else {
                        setSelectedReportNames([]);
                      }
                    }}
                  />
                  <span>Select All</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4">
                  {reportNames.map((reportName, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-[12px] text-[var(--commonTextColor)] mb-2"
                    >
                      <input
                        type="checkbox"
                        name="reportName"
                        value={reportName.ReportId}
                        className="mr-1"
                        checked={
                          !!selectedReportNames.find(
                            (item) =>
                              item?.ReportName === reportName?.ReportName
                          )
                        }
                        onChange={(e) => {
                          const value = reportName;
                          if (e.target.checked) {
                            setSelectedReportNames((prev) => [...prev, value]);
                          } else {
                            setSelectedReportNames((selectedReportNames) =>
                              selectedReportNames.filter(
                                (item) => item?.ReportName !== value?.ReportName
                              )
                            );
                          }
                        }}
                      />
                      <span>
                        {reportName?.displayName ?? reportName?.ReportName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 ">
                <button
                  onClick={() => handlePrint(selectedReportNames)}
                  className={`px-4 text-[12px] py-2 ${styles.bgPrimaryColorBtn} flex items-center justify-center  rounded-[5px] shadow-custom  w-24 h-[27px]`}
                >
                  Print
                </button>
                <button
                  onClick={handleClose}
                  className={`px-4 py-2 text-[12px] ${styles.bgPrimaryColorBtn}  flex items-center justify-center rounded-[5px] shadow-custom w-24 h-[27px] border-[0.1px]`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
    </div>
  );
}

PrintModal.propTypes = {
  openPrintModal: PropTypes.bool,
  setOpenPrintModal: PropTypes.func,
  submittedRecordId: PropTypes.number,
  submittedMenuId: PropTypes.number,
  pageType: PropTypes.string,
};
