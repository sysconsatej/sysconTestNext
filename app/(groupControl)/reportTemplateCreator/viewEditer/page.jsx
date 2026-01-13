"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import SunEditorComponent from "@/components/EditerSidebar/Editor";
import NavBarButton from "@/components/NavBarButton/NavBarButton";
import "./viewEditer.css";
import styles from "@/app/app.module.css";
import { decrypt } from "@/helper/security";
import {
  fetchReportData,
  dynamicReportFilter,
  fetchReportAPIData,
} from "@/services/auth/FormControl.services";
import { parseInt } from "lodash";

export default function ViewEditer() {
  const baseUrlNext = process.env.NEXT_PUBLIC_BASE_URL_SQL_Reports;
  const searchParams = useSearchParams();
  const [TemplateNameAfterSelect, setTemplateNameAfterSelect] = useState([]);
  const [reportId, setReportId] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [TemplateName, setTemplateName] = useState(null);
  const [companyName, setCompanyName] = useState(null);
  const [apiEndPoint, setApiEndPoint] = useState("");
  const [isAdmin, setIsAdmin] = useState(false); // State to check if user is Admin
  const editorRef = useRef(null);
  const [search, setSearch] = useState(null);

  useEffect(() => {
    const templateName = searchParams.get("templateId").split("!");
    const reportId = searchParams.get("reportId");
    setSearch(searchParams.get("menuName"));
    if (templateName) {
      setTemplateNameAfterSelect(templateName);
    }
    if (reportId) {
      setReportId(reportId);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCompanyName = async () => {
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const decryptedData = decrypt(storedUserData);
        const userData = JSON.parse(decryptedData);
        console.log("userData", userData);
        const clientCode = userData[0]?.clientId;
        const companyId = userData[0]?.defaultCompanyId;

        const companyRequest = {
          columns: "name",
          tableName: "tblCompany",
          whereCondition: `id='${companyId}' and status = 1`,
          clientIdCondition: `clientId = ${clientCode} FOR JSON PATH`,
        };

        try {
          const response = await fetchReportData(companyRequest);
          if (response && response.data && response.data.length > 0) {
            const companyName = response?.data[0]?.name;
            setCompanyName(companyName); // Log the company name
          } else {
            console.error(
              "Error: No data found or invalid response structure",
              response
            );
          }
        } catch (error) {
          console.error("Error fetching company name:", error);
        }
      }
    };
    fetchCompanyName();
  }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   const storedUserData = localStorage.getItem("userData");
  //   const templateName = searchParams.get("templateId").split("!");
  //   const SelectedReportId = searchParams.get("reportId");
  //   if (storedUserData) {
  //     const decryptedData = decrypt(storedUserData);
  //     const userData = JSON.parse(decryptedData);
  //     const clientId = userData[0]?.clientId;
  //     if (templateName.length > 0) {
  //       const fetchData = async () => {
  //         const requestBody = {
  //           columns:
  //             "rt.id,rt.reportTemplate,rt.reportTemplateName,rt.apiEndPoint",
  //           tableName: "tblReportTemplate rt",
  //           whereCondition: `id in (${SelectedReportId})`,
  //           clientIdCondition: `rt.clientId = ${clientId} FOR JSON PATH`,
  //         };
  //         try {
  //           const data = await fetchReportData(requestBody);
  //           if (data.data && data.data.length > 0) {
  //             const firstItem = data.data[0] || {};
  //             setEditorContent(firstItem.reportTemplate || "");
  //             setApiEndPoint(firstItem.apiEndPoint || "");
  //             setTemplateName(firstItem.reportTemplateName || "");
  //             if (firstItem.apiEndPoint) {
  //               const apiURL = `${baseUrl}/${firstItem.apiEndPoint}`;
  //               const apiResponse = await fetch(apiURL, {
  //                 method: "POST",
  //                 headers: {
  //                   "Content-Type": "application/json",
  //                   "x-access-token": JSON.parse(token),
  //                 },
  //                 body: JSON.stringify({
  //                   id: parseInt(`${SelectedReportId}`),
  //                   clientId: `${clientId}`,
  //                 }),
  //               });

  //               const apiData = await apiResponse.json();
  //               const flatData = flattenData(apiData.data[0] || {});

  //               // Handle dynamic content replacement
  //               let modifiedContent = handleDynamicContentReplacement(
  //                 firstItem.reportTemplate || "",
  //                 flatData
  //               );

  //               setEditorContent(modifiedContent);

  //               if (editorRef.current) {
  //                 editorRef.current.setTableColumnWidths([
  //                   "50px",
  //                   "200px",
  //                   "100px",
  //                 ]);
  //               }
  //             }
  //           } else {
  //             console.log("No data available");
  //           }
  //         } catch (error) {
  //           console.error("Error fetching data:", error);
  //         }
  //       };
  //       fetchData();
  //     }
  //   }
  // }, [TemplateNameAfterSelect]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserData = localStorage.getItem("userData");
    const templateIds = searchParams.get("templateId")?.split("!") || [];
    const SelectedReportId = searchParams.get("reportId");

    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientId = userData[0]?.clientId;

      const fetchData = async () => {
        try {
          let allCleanedContent = [];
          const search = searchParams.get("menuName");
          for (let i = 0; i < templateIds.length; i++) {
            const templateId = templateIds[i];

            const requestBody = {
              columns: "id,reportTemplate,reportTemplateName,apiEndPoint",
              tableName: "tblReportTemplate",
              whereCondition: `id=${templateId}`,
              clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
            };

            const menuReportRequestBody = {
              columns: "spName,reportTemplateCondition",
              tableName: "tblMenuReportMapping",
              whereCondition: `menuId = ${search} and reportTemplateId = ${templateId}`,
              clientIdCondition: `status = 1 FOR JSON PATH, INCLUDE_NULL_VALUES`,
            };

            const rptTemplateData = await fetchReportData(requestBody);
            const data = await fetchReportData(menuReportRequestBody);

            if (rptTemplateData.data && rptTemplateData.data.length > 0) {
              const firstItem = rptTemplateData.data[0] || {};
              if (i === 0) {
                setApiEndPoint(firstItem.apiEndPoint || "");
                setTemplateName(firstItem.reportTemplateName || "");
              }

              let spName = null;
              let filterCondition = null;

              if (data.data && data.data.length > 0) {
                spName = data.data[0].spName;
                filterCondition = data.data[0].reportTemplateCondition;
              }

              const updatedConditionWithFieldNames = `${SelectedReportId}`;

              const responseData = await fetchReportAPIData(
                updatedConditionWithFieldNames,
                clientId,
                spName
              );

              const flatData = flattenData(responseData.data[0] || {});
              const modifiedContent = handleDynamicContentReplacement(
                firstItem?.reportTemplate || "",
                flatData
              );
              const cleaned = cleanHtmlContent(modifiedContent);
              console.log("cleaned", cleaned);
              const updatedContent = replaceHeaderImage(cleaned);
              allCleanedContent.push(updatedContent);
            }
          }

          // ✅ Final Step: Combine and set editor content
          const finalContent = allCleanedContent
            .map((content, index) => {
              const isLast = index === allCleanedContent.length - 1;
              return isLast
                ? content
                : `${content}<div style='page-break-after: always'></div>`;
            })
            .join("");

          setEditorContent(finalContent);

          if (editorRef.current) {
            editorRef.current.setTableColumnWidths(["50px", "200px", "100px"]);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [TemplateNameAfterSelect]);

  function replaceHeaderImage(htmlContent) {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      let imageHeader = userData[0]?.headerLogoPath;

      if (!htmlContent || typeof htmlContent !== "string") return htmlContent;

      const headerTagPattern = /{headerImage}/g;

      if (htmlContent.includes("{headerImage}")) {
        if (imageHeader && imageHeader.trim() !== "") {
          return htmlContent.replace(
            headerTagPattern,
            `<div class="se-component se-image-container __se__float-none" style="width: 100%;">
          <figure style="width: 100%;">
            <img src="${
              imageHeader ? baseUrlNext + imageHeader : ""
            }" id="imageHeader" alt="" data-rotate="" data-proportion="true" data-size="100%," 
                 data-align="none" data-percentage="100," data-file-name="cmlImg.jpg" 
                 data-file-size="41845" data-origin="," style="width: 100%;" data-index="1" 
                 origin-size="1182,269" data-rotatex="" data-rotatey="" width="100%" height="">
          </figure>
        </div>`
          );
        } else {
          // If imageHeader is null/empty, just remove the tag
          return htmlContent.replace(headerTagPattern, "");
        }
      }

      return htmlContent;
    }
  }

  const flattenData = (obj, parentKey = "", result = {}) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (Array.isArray(obj[key])) {
          obj[key].forEach((item, index) => {
            flattenData(item, `${newKey}[${index}]`, result);
          });
          result[newKey] = obj[key].length;
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          flattenData(obj[key], newKey, result);
        } else {
          result[newKey] =
            obj[key] !== null && obj[key] !== undefined ? obj[key] : "";
        }
      }
    }
    return result;
  };

  const handleDynamicContentReplacement = (content, flatData) => {
    const dynamicParentKeys = new Set();
    const dynamicChildKeys = new Set();
    const sumKeys = new Set();
    const regexForParentKey = /{([^}]+)}/g;
    const regexForChildKey = /{([^}]+)\[(\d+)\]\.([^}]+)}/g;
    const regexForSum = /{([^}]+)\.sum}/g;

    const storedUserData = localStorage.getItem("userData");
    let PrintedBy = "";
    let companyId = "";

    if (storedUserData) {
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      PrintedBy = userData[0]?.name || "";
      companyId = userData[0]?.defaultCompanyId;
    }

    if (PrintedBy) {
      content = content.replace(/{PrintedBy}/g, PrintedBy);
    }

    // Match parent keys
    let match;
    while ((match = regexForParentKey.exec(content)) !== null) {
      dynamicParentKeys.add(match[1]);
    }

    // Match child keys
    while ((match = regexForChildKey.exec(content)) !== null) {
      const arrayKey = match[1];
      const elementKey = match[3];
      dynamicChildKeys.add(`${arrayKey}.${elementKey}`);
    }

    // Match keys for sum calculation
    while ((match = regexForSum.exec(content)) !== null) {
      sumKeys.add(match[1]);
    }

    // Replace parent keys
    dynamicParentKeys.forEach((parentKey) => {
      if (flatData[parentKey] !== undefined) {
        const regex = new RegExp(`{${parentKey}}`, "g");
        content = content.replace(regex, formatData(flatData[parentKey]));
      }
    });

    // 🔍 Store all style info
    const styleInfoList = [];

    // Process dynamic rows for child keys
    let count = 0;
    dynamicChildKeys.forEach((dynamicKey) => {
      count++;
      let rowWidth = dynamicChildKeys.size;
      const [arrayKey, elementKey] = dynamicKey.split(".");
      const arrayLength = flatData[arrayKey];

      if (!arrayLength) {
        console.log(
          `Array Key: ${arrayKey} is missing or not an array in flatData.`
        );
        return;
      }

      // 🔍 Extract styles for index 0 only
      if (count === 1) {
        dynamicChildKeys.forEach((innerDynamicKey) => {
          const [innerArrayKey, innerElementKey] = innerDynamicKey.split(".");
          const dynamicIndexKey = `${innerArrayKey}[0].${innerElementKey}`;

          const styleBlockRegex = new RegExp(
            `((<[^>]+style="[^"]*"[^>]*>\\s*)*){${escapeRegex(
              dynamicIndexKey
            )}}((\\s*<\\/[^>]+>)*)`,
            "i"
          );

          const match = content.match(styleBlockRegex);

          if (match) {
            const fullMatch = match[0];
            const styleMatches = [
              ...fullMatch.matchAll(/style="([^"]*)"/g),
            ].map((m) => m[1]);

            styleInfoList.push({
              key: dynamicIndexKey,
              styles: styleMatches,
            });
            styleMatches.forEach((style, idx) => {
              console.log(` → Level ${idx + 1} style:`, style);
            });
          } else {
            console.log(`⚠️ No styled tag found for key: ${dynamicIndexKey}`);
          }
        });
      }

      let combinedContent = "";

      if (count === 1) {
        for (let i = 0; i < arrayLength; i++) {
          let rowContent = `<tr delete="${
            i === 0 ? "above" : i === arrayLength - 1 ? "below" : ""
          }" arrayLength="${arrayLength}">`;
          dynamicChildKeys.forEach((innerDynamicKey) => {
            const [innerArrayKey, innerElementKey] = innerDynamicKey.split(".");
            const dynamicIndexKey = `${innerArrayKey}[${i}].${innerElementKey}`;
            console.log(`Processing column for: ${dynamicIndexKey}`);

            if (flatData[dynamicIndexKey] !== undefined) {
              const baseStyleKey = `${innerArrayKey}[0].${innerElementKey}`;
              const styleEntry = styleInfoList.find(
                (item) => item.key === baseStyleKey
              );
              let styledValue =
                formatData(flatData[dynamicIndexKey]) || "&nbsp;";

              // Build combined inline style from the extracted styles
              let extraStyle = "";
              if (styleEntry && styleEntry.styles.length > 0) {
                extraStyle = styleEntry.styles.join("; ");
              }

              rowContent += `
    <td isTableDataRow=${i} style="border: 1px solid black; padding: 5px; width: ${
                100 / rowWidth
              }%;${extraStyle ? ` ${extraStyle};` : ""}">
      ${styledValue}
    </td>`;
              console.log(
                "Added styled cell content:",
                flatData[dynamicIndexKey]
              );
            } else {
              rowContent += `
    <td isTableDataRow=${i} style="border: 1px solid black; padding: 5px;">&nbsp;</td>`;
              console.log("Added empty cell for key:", dynamicIndexKey);
            }
          });

          rowContent += "</tr>";
          combinedContent += rowContent;
        }
      }
      const arrayPlaceholderRegex = new RegExp(
        `{${arrayKey}\\[\\d+\\]\\.${elementKey}}`,
        "g"
      );
      content = content.replace(
        arrayPlaceholderRegex,
        combinedContent.trim() || ""
      );
      console.log("Final content after replacing placeholders:", content);
    });

    // Replace sums
    sumKeys.forEach((baseKey) => {
      const sum = calculateSumForArray(flatData, baseKey);
      const sumPlaceholderRegex = new RegExp(`{${baseKey}\\.sum}`, "g");
      content = content.replace(sumPlaceholderRegex, sum);
    });
    return content;
  };

  // Escape utility
  const escapeRegex = (str) => str.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

  const calculateSumForArray = (flatData, baseKey) => {
    let sum = 0;
    const regex = new RegExp(`^${baseKey}\\[\\d+\\]`);

    for (let key in flatData) {
      if (regex.test(key)) {
        sum += parseFloat(flatData[key]) || 0;
      }
    }

    return sum;
  };

  const cleanHtmlContent = (html) => {
    const sandbox = document.createElement("div");
    sandbox.innerHTML = html;

    const allTrs = Array.from(sandbox.querySelectorAll("tr"));

    allTrs.forEach((tr, index) => {
      const deleteType = tr.getAttribute("delete");
      const arrayLengthType = tr.getAttribute("arrayLength");

      // ✅ Remove row BELOW this one
      if (deleteType === "below") {
        const nextTr = tr.nextElementSibling;
        if (nextTr && nextTr.tagName === "TR") {
          console.log("🗑️ Removing row BELOW:", nextTr.outerHTML);
          nextTr.parentNode.removeChild(nextTr);
        }
      }

      if (deleteType === "above" && arrayLengthType === "1") {
        const nextTr = tr.nextElementSibling;
        if (nextTr && nextTr.tagName === "TR") {
          console.log("🗑️ Removing row BELOW:", nextTr.outerHTML);
          nextTr.parentNode.removeChild(nextTr);
        }
      }

      // ✅ Remove row ABOVE this one
      if (deleteType === "above") {
        const prevTr = tr.previousElementSibling;
        if (prevTr && prevTr.tagName === "TR") {
          console.log("🗑️ Removing row ABOVE:", prevTr.outerHTML);
          prevTr.parentNode.removeChild(prevTr);
        }
      }
    });

    return sandbox.innerHTML;
  };

  const formatData = (data) => {
    if (typeof data !== "string") return data;

    const fullDateTimeRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z)?$/;
    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let date;

    if (fullDateTimeRegex.test(data)) {
      date = new Date(data);
      if (isNaN(date)) return data; // handle invalid date
      const day = date.getDate().toString().padStart(2, "0");
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } else if (dateOnlyRegex.test(data)) {
      const [year, monthNum, day] = data.split("-");
      const month = monthNames[parseInt(monthNum, 10) - 1];
      return `${day}-${month}-${year}`;
    }

    return data;
  };

  // const formatData = (data) => {
  //   if (typeof data !== "string") return data;
  //   const fullDateTimeRegex =
  //     /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z)?$/;
  //   const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  //   let date;
  //   if (fullDateTimeRegex.test(data)) {
  //     date = new Date(data);
  //     if (isNaN(date)) return data; // handle invalid
  //     const day = date.getDate().toString().padStart(2, "0");
  //     const month = (date.getMonth() + 1).toString().padStart(2, "0");
  //     const year = date.getFullYear();
  //     const hours = date.getHours().toString().padStart(2, "0");
  //     const minutes = date.getMinutes().toString().padStart(2, "0");
  //     return `${day}/${month}/${year} ${hours}:${minutes}`;
  //   } else if (dateOnlyRegex.test(data)) {
  //     const [year, month, day] = data.split("-");
  //     return `${day}/${month}/${year}`;
  //   }

  //   // If no format matches, return as-is
  //   return data;
  // };

  return (
    <div>
      <form>
        {isAdmin ? (
          <SunEditorComponent ref={editorRef} initialContent={editorContent} />
        ) : (
          <div>
            <NavBarButton templateName={TemplateName} />
            <div
              className={`p-6 p-6 h-screen overflow-auto ${styles.thinScrollBar}`}
            >
              <div
                className={`container mx-auto p-8 pt-1 bg-white shadow-lg shadow-black/50 ${styles.thinScrollBar}`}
                style={{ width: "100%", height: "80%", overflow: "auto" }}
              >
                <div
                  className="prose" style={{color:'black'}}
                  dangerouslySetInnerHTML={{ __html: editorContent }}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
