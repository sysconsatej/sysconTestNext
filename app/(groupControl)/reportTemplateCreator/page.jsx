"use client";
/* eslint-disable */
import React, { useRef, useState, useEffect } from "react";
import { DndProvider, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { fetchDataAPI } from "@/services/auth/FormControl.services";
import {
  TextField,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import Sidebar from "@/components/EditerSidebar/Sidebar";
import SunEditorComponent from "@/components/EditerSidebar/Editor";
import styles from "@/app/app.module.css";
import "./reportTemplateCreator.css";
import { decrypt } from "@/helper/security";
import { toast } from "react-toastify";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { insertReportData } from "@/services/auth/FormControl.services";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const ReportTemplateCreator = () => {
  const [templateName, setTemplateName] = useState("");
  const [editorPosition, setEditorPosition] = useState({ x: 0, y: 0 });
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [TemplateId, setTemplateId] = useState(null);
  const [templateContent, setTemplateContent] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const editorRef = useRef();

  useEffect(() => {
    fetchReportTypes();
  }, []);

  const fetchReportTypes = async () => {
    const storedUserData = localStorage.getItem("userData");

    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientId = userData[0].clientId;

      const requestBody = {
        columns: "RT.id,RT.reportTemplateName",
        tableName: "tblReportTemplate RT",
        whereCondition: "RT.status = 1",
        clientIdCondition: `RT.clientId = ${clientId} FOR JSON PATH, INCLUDE_NULL_VALUES`,
      };

      try {
        const data = await fetchReportData(requestBody);
        if (data) {
          setReportTypes(data.data);
        } else {
          toast.error("Failed to fetch report types");
        }
      } catch (error) {
        console.error("Error fetching report types:", error);
      }
    }
  };

  const getCompanyLogo = async (clientCode, BranchId) => {
    if (clientCode != null && BranchId != null) {
      const branchRequest = {
        tableName: "tblCompanyBranchParameter",
        whereCondition: {
          status: 1,
          companyBranchId: BranchId,
          clientCode: clientCode,
        },
        projection: {
          tblCompanyBranchParameterDetails: 1,
        },
      };

      try {
        const dataURl = await fetchDataAPI(branchRequest);
        const response = dataURl.data;
        if (
          response &&
          response.length > 0 &&
          response[0].tblCompanyBranchParameterDetails.length > 0
        ) {
          const headerUrl =
            response[0].tblCompanyBranchParameterDetails[0].header;
          setImageUrl(headerUrl);
          return headerUrl;
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;
    const BranchId = userData[0].defaultBranchId;
    const createdBy = userData[0].id;

    // const imageHeader = await getCompanyLogo(clientId, BranchId);

    try {
      const token = localStorage.getItem("token");
      if (TemplateId == null) {
        // Creating a new template
        if (editorRef.current) {
          // let content = editorRef.current.getContent();
          // console.log(
          //   "Content before table and header image replacement:",
          //   content
          // );
          let content = document
            .querySelector(".sun-editor-editable")
            ?.innerHTML?.trim();

          if (!content) {
            content = editorRef.current?.getContents();
          }

          // Initial replacement to add custom styles and remove old <td> styling
          let modifiedContent = content.replace(
            /<table>/g,
            '<table class="custom-table" style="border: 1px solid black; border-collapse: collapse; width: 100%;">'
          );

          // Calculate the width for each <td> based on the number of columns
          const modifiedWithWidth = modifiedContent.replace(
            /<tr>.*?<\/tr>/gs,
            (row) => {
              const columnCount = (row.match(/<td/g) || []).length;
              const columnWidth = 100 / columnCount;
              const modifiedRow = row.replace(
                /<td>/g,
                `<td isTableDataRow="true" style="width: ${columnWidth}%; border: 1px solid black; padding: 5px;">`
              );
              console.log(`Row after modification: ${modifiedRow}`);
              return modifiedRow;
            }
          );

          // Construct the final HTML template
          const htmlTemplate = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width" />
            <link rel="stylesheet" href="style.css" />
            <title>Browser</title>
            <style> 
            .prose {
                width: 100% !important;        
            }
            table, th, td {
                border: 1px solid black; 
                padding: 5px; 
                border-collapse: collapse; 
            } 
                table {
                    width: 100% !important;
                }
            tr:hover { 
                background-color: #f0f0f0; 
            }
            hr {
                border: none;
                border-top: 2px solid black;
                margin: 10px 0;
            }
        </style>
        </head>
        <body>
        <div style="color: black;">
            ${modifiedWithWidth}
            </div>
        </body>
        </html>`;

          // const payload = {
          //   menuId: null,
          //   clientCode: clientCode,
          //   reportTemplate: htmlTemplate,
          //   reportTemplateName: templateName,
          //   apiEndPoint: selectedReportType.apiPath,
          //   tableName: "tblReportTemplate",
          // };

          const payload = {
            TableName: "tblReportTemplate",
            Record: {
              clientId: clientId,
              reportTemplateName: templateName,
              reportTemplate: htmlTemplate,
              apiEndPoint: `Sql/api/Reports/${selectedReportType.apiPath}`,
              createdBy: createdBy,
            },
            WhereCondition: null,
          };
          const response = await insertReportData(payload);
          if (response.success === false) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          toast.success("Template Saved successfully!");
          setTemplateContent(null);
          setTemplateName(null);
        }
      } else {
        // Updating an existing template
        // let currentTemplateContent = editorRef.current.getContent();

        // const htmlContent = document.querySelector(
        //   ".sun-editor-editable"
        // )?.innerHTML;

        // console.log("htmlContent =>>", htmlContent);

        let currentTemplateContent = document
          .querySelector(".sun-editor-editable")
          ?.innerHTML?.trim();

        if (!currentTemplateContent) {
          currentTemplateContent = editorRef.current?.getContents();
        }

        // Initial replacement to add custom styles and remove old <td> styling
        let modifiedContent = currentTemplateContent.replace(
          /<table>/g,
          '<table class="custom-table" style="border: 1px solid black; padding: 8px; border-collapse: collapse; width: 100%;">'
        );

        // Calculate the width for each <td> based on the number of columns
        const modifiedWithWidth = modifiedContent.replace(
          /<tr>.*?<\/tr>/gs,
          (row) => {
            const columnCount = (row.match(/<td/g) || []).length;
            const columnWidth = 100 / columnCount;
            const modifiedRow = row.replace(
              /<td>/g,
              `<td isTableDataRow="true" style="width: ${columnWidth}%; border: 1px solid black; padding: 5px;">`
            );
            return modifiedRow;
          }
        );

        // Construct the final HTML template
        const htmlTemplate = `<!DOCTYPE html>
        <html lang="en">
        <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width" />
        <link rel="stylesheet" href="style.css" />
        <title>Browser</title>
        <style> 
         .prose {
                width: 100% !important;        
            }
            table, th, td {
                border: 1px solid black; 
                padding: 5px; 
                border-collapse: collapse; 
            } 
                table {
                    width: 100% !important;
                }
            tr:hover { 
                background-color: #f0f0f0; 
            }
            hr {
                border: none;
                border-top: 2px solid black;
                margin: 10px 0;
            }
        </style>
        </head>
        <body>
        <div style="color: black;">
        ${modifiedWithWidth}
        </div>
        </body>
        </html>`;

        const currentTemplateName = templateName;
        // const payload = [
        //   {
        //     tableName: "tblReportTemplate",
        //     uniqueColumn: { _id: TemplateId },
        //     whereCondition: {
        //       reportTemplateName: currentTemplateName,
        //       reportTemplate: htmlTemplate,
        //     },
        //   },
        // ];

        const payload = {
          TableName: "tblReportTemplate",
          Record: {
            clientId: clientId,
            reportTemplateName: templateName,
            reportTemplate: htmlTemplate,
            apiEndPoint: `Sql/api/Reports/${selectedReportType.apiPath}`,
          },
          WhereCondition: `id = ${TemplateId}`,
        };
        const response = await insertReportData(payload);

        if (response.success === false) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        toast.success("Template Updated successfully!");
        setTemplateContent(null);
        setTemplateName(null);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const handleGoClick = async () => {
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;
    try {
      const selectedTemplateId = TemplateId;
      const requestBody = {
        tableName: "tblReportTemplate RT",
        whereCondition: `id =  ${parseInt(selectedTemplateId)}`,
        columns: "RT.reportTemplate, RT.reportTemplateName",
        clientIdCondition: `RT.clientId = ${clientId} FOR JSON PATH`,
      };

      const data = await fetchReportData(requestBody);
      if (data) {
        const fetchedTemplate = data.data[0];
        if (fetchedTemplate) {
          setTemplateContent(fetchedTemplate.reportTemplate);
          setTemplateName(fetchedTemplate.reportTemplateName);
          toast.success("View Template!");
        } else {
          toast.error("No template data found for the selected template ID.");
        }
      } else {
        toast.error("Failed to fetch report types");
      }
    } catch (error) {
      toast.error(`Error fetching template data: ${error.message}`);
    }
  };

  const handleTemplateNameChange = (event) => {
    setTemplateName(event.target.value);
  };

  const handleSelectChange = (selectedValue) => {
    setSelectedReportType(selectedValue);
  };

  const handleSelectChangeDDl = (event) => {
    const selectedValue = event.target.value;
    setTemplateId(selectedValue);
  };

  const DragItem = ({ children }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: "DRAG_ITEM",
      item: { name: "draggable" },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }));

    return (
      <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
        {children}
      </div>
    );
  };

  const handleEditorDrag = (e) => {
    setEditorPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        className={`${styles.container} min-w-full text-sm overflow-auto ${styles.thinScrollBar}`}
      >
        <Sidebar onSelectChange={handleSelectChange}>
          <DragItem>
            {/* Place the content you want to make draggable here */}
          </DragItem>
        </Sidebar>
        <div className="content" onMouseMove={handleEditorDrag}>
          <form onSubmit={handleSubmit}>
            <div className="flex items-center mt-2 mb-4 space-x-4">
              <TextField
                label="Template Name"
                type="text"
                id="outlined-size-small"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-input": {
                    padding: "0px 14px !important",
                    height: "20px !important",
                    fontSize: "12px !important",
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "12px !important",
                    top: "-6px",
                    backgroundColor: "#fff",
                    padding: "0 4px",
                  },
                  "& .MuiOutlinedInput-root": {
                    height: "32px",
                    alignItems: "center",
                  },
                }}
                required
                value={templateName}
                onChange={handleTemplateNameChange}
              />
              <button
                type="submit"
                className="inline-flex items-center px-5 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
              >
                Submit
              </button>

              <FormControl
                size="small"
                variant="outlined"
                sx={{ minWidth: "200px", height: "32px" }}
              >
                <InputLabel
                  id="report-type-select-label"
                  sx={{
                    fontSize: "12px !important",
                    backgroundColor: "#fff",
                    padding: "0 4px",
                  }}
                >
                  Select Template
                </InputLabel>
                <Select
                  labelId="report-type-select-label"
                  id="report-type-select"
                  value={TemplateId}
                  onChange={handleSelectChangeDDl}
                  label="Template Name"
                  sx={{
                    "& .MuiOutlinedInput-input": {
                      padding: "0px 14px !important",
                      height: "30px !important",
                      fontSize: "12px !important",
                    },
                    "& .MuiOutlinedInput-root": {
                      height: "32px",
                      alignItems: "center",
                    },
                  }}
                >
                  {reportTypes.map((report, index) => (
                    <MenuItem
                      key={index}
                      value={report.id}
                      sx={{
                        fontSize: "12px", // Reduces the font size of the menu items
                        minHeight: "none", // Optional: removes the minimum height of menu items
                        padding: "4px 10px", // Adjust padding to reduce the overall height per item
                      }}
                    >
                      {report.reportTemplateName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <button
                type="button"
                onClick={handleGoClick}
                className="inline-flex items-center px-5 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
              >
                Go
              </button>
            </div>
            <SunEditorComponent
              ref={editorRef}
              initialContent={templateContent}
            />
          </form>
        </div>
      </div>
    </DndProvider>
  );
};
//Akash Code __11-09-2022__
export default ReportTemplateCreator;
