"use client";
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { pdfType, uploadFileIcon, excelType, wordType } from "@/assets";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { DeleteIcon2, DeleteHover, ShareIconHover, shareIcon } from "@/assets";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import CustomeModal from "@/components/Modal/customModal";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import {
  uploadFIleContainer,
  fileImageStyles,
  mainContainer,
  filePaperStyles,
  fileContainer,
  SummaryStyles,
  accordianDetailsStyle,
  childAccordionSection,
  uploadContainerStyle,
} from "@/app/globalCss";
import LightTooltip from "@/components/Tooltip/customToolTip";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import styles from "@/app/app.module.css";
import Proptypes from "prop-types";
import {
  uploadFormDocument,
  ShareDocAPI,
} from "@/services/auth/FormControl.services";
import { ToastContainer } from "react-toastify";
import ShareDocument from "@/components/Modal/shareDocument";

const Attachments = ({
  expandAll,
  isView,
  attachmentsData,
  setNewState,
  isCopy,
  setSubmitNewState,
}) => {
  const [files, setFiles] = useState([]);
  const [checkedFiles, setCheckedFiles] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [isParentAccordionOpen, setIsParentAccordionOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [modalAction, setModalAction] = useState("");
  const [duplicates, setDuplicates] = useState([]);
  const [MailData, setMailData] = useState({});
  const [shareDocumentModal, setshareDocumentModal] = useState(false);

  const handleUploadFiles = async (filesToUpload) => {
    for (const file of filesToUpload) {
      const formData = new FormData();
      formData.append("documents", file);
      try {
        const response = await uploadFormDocument(formData);
        if (response.success === false) {
          setOpenModal(true);
          setParaText(response.message);
          setIsError(true);
          throw new Error(`Error: ${response.statusText}`);
        }
        setNewState((prev) => {
          const attachment = prev.attachment
            ? [...prev.attachment, response.data]
            : [response.data];
          return {
            ...prev,
            attachment: attachment,
          };
        });
        setSubmitNewState((prev) => {
          const attachment = prev.attachment
            ? [...prev.attachment, response.data]
            : [response.data];
          return {
            ...prev,
            attachment: attachment,
          };
        });
      } catch (error) {
        console.error("error", error);
      }
    }
  };

  //test
  // console.log("attachmentsData", attachmentsData)

  const [stateAttachments, setStateAttachments] = useState([]);

  useEffect(() => {
    setStateAttachments(attachmentsData);
  }, [attachmentsData]);

  const getFileNameWitoutDateAndExt = (filePath) => {
    const fileName = filePath.split("/").pop();
    const extensionIndex = fileName.lastIndexOf(".");
    const fileNameWithoutExt =
      extensionIndex === -1 ? fileName : fileName.slice(0, extensionIndex);

    // Regular expression to match the date format
    const datePattern = /\d{17}$/;
    return fileNameWithoutExt.replace(datePattern, "");
  };

  const handleOverrideDuplicates = async () => {
    const updatedAttachmentsData = attachmentsData
      .map((file) => {
        const isDuplicate = duplicates.some(
          (dup) =>
            getFileNameWitoutDateAndExt(dup.name) ===
            getFileNameWitoutDateAndExt(file.path)
        );
        return isDuplicate ? { ...file, status: 2 } : file;
      })
      .filter((file) => file.status !== 2);

    setFiles(updatedAttachmentsData);

    setNewState((prevState) => ({
      ...prevState,
      attachment: updatedAttachmentsData,
    }));
    setSubmitNewState((prevState) => ({
      ...prevState,
      attachment: updatedAttachmentsData,
    }));

    for (const file of duplicates) {
      await handleUploadFiles([file]);
    }

    setDuplicates([]); // Clear duplicates from state
    setOpenModal(false); // Close modal
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const existingFileNames = new Set(
      stateAttachments.map((file) => getFileNameWitoutDateAndExt(file.path))
    );
    const newFiles = [];
    const duplicateFiles = [];

    selectedFiles.forEach((file) => {
      const fileNameWitoutDateAndExt = getFileNameWitoutDateAndExt(file.name);
      if (existingFileNames.has(fileNameWitoutDateAndExt)) {
        console.log("Duplicate file detected: ", fileNameWitoutDateAndExt);
        duplicateFiles.push(file);
      } else {
        newFiles.push(file);
      }
    });

    if (newFiles.length > 0) {
      handleUploadFiles(newFiles);
    }

    if (duplicateFiles.length > 0) {
      setDuplicates(duplicateFiles); // Set duplicates to state
      setOpenModal(true);
      setParaText("Duplicate file(s) detected. Do you want to override them?");
      setModalAction("override"); // Set the modal action to override
    }

    event.target.value = "";
  };

  //test

  const getFileIcon = (filePath) => {
    const extension = filePath?.split(".").pop().toLowerCase();
    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <img
            src={`${baseUrl}/${filePath}`}
            alt="Image"
            className={fileImageStyles}
          />
        );
      case "pdf":
        return <Image src={pdfType} alt="Upload" className={fileImageStyles} />;
      case "xls":
      case "xlsx":
        return (
          <Image src={excelType} alt="Excel" className={fileImageStyles} />
        );
      case "doc":
      case "docx":
        return <Image src={wordType} alt="Word" className={fileImageStyles} />;
      case "mp4":
      case "avi":
      case "webm":
      case "mkv":
        return (
          <iframe
            src={`${baseUrl}/${filePath}`}
            width={"100px"}
            height={"100px"}
            style={{ overflow: "hidden !important", display: "block" }}
          />
        );
      default:
        return <span>📁</span>;
    }
  };

  const formatFileName = (filePath) => {
    const fileNameWithExtension = filePath?.split("/").pop();
    const lastDotIndex = fileNameWithExtension?.lastIndexOf(".");

    const fileName =
      lastDotIndex > 0
        ? fileNameWithExtension.substring(0, lastDotIndex)
        : fileNameWithExtension;

    const matches = fileName?.match(/[A-Za-z_]+/);

    const formattedFileName =
      matches && matches.length > 0 ? matches[0] : fileName;

    return formattedFileName?.length > 0
      ? `${formattedFileName.substring(0, 15)}...`
      : formattedFileName;
  };

  useEffect(() => {
    setIsParentAccordionOpen(expandAll);
  }, [expandAll]);

  const handleCheckChange = (event, id, index) => {
    const updatedCheckedFiles = {
      ...checkedFiles,
      [id]: event.target.checked,
      idValue: id,
      indexValue: index,
    };

    setCheckedFiles(updatedCheckedFiles);
    const allSelected = attachmentsData.every((file) =>
      file.status === 1 ? updatedCheckedFiles[file.path] === true : true
    );

    setSelectAll(allSelected);
  };

  const handleDeleteSelected = () => {
    const isSelected = Object.values(checkedFiles).some(
      (value) => value === true
    );

    if (isSelected) {
      setOpenModal(true);
      setParaText("Are you sure you want to delete the selected files?");
      setModalAction("delete"); // Set the modal action to delete
    } else {
      setOpenModal(true);
      setParaText("Please select at least one file to delete.");
    }
  };

  const handleShareSelectedFiles = () => {
    const selectedFiles = attachmentsData.filter(
      (file) => checkedFiles[file.path]
    );
    setMailData({});
    if (selectedFiles.length === 0) {
      setOpenModal(true);
      setParaText("Please select at least one file to share.");
      setIsError(true);
      return;
    }
    setshareDocumentModal((prev) => !prev);
    return;
    // Disable no-unreachable for the next line
    // eslint-disable-next-line no-unreachable
    const emailBody = selectedFiles
      .map((file) => `Download file: ${baseUrl}/${file.path}`)
      .join("%0A");

    const mailtoLink = `mailto:?subject=Files%20to%20Share&body=${emailBody}`;

    window.location.href = mailtoLink;
  };
  const handleMailSennd = async () => {
    const selectedFiles = attachmentsData.filter(
      (file) => checkedFiles[file.path]
    );

    let Body = { attachments: selectedFiles, ...MailData };
    console.log("Body", Body);
    let response = await ShareDocAPI(Body);
    if (response.success == true) {
      setshareDocumentModal((prev) => !prev);
      alert("Mail send successfully");
    }
  };

  const confirmDeletion = async () => {
    const updatedAttachmentsData = attachmentsData
      ?.map((file) => {
        if (checkedFiles[file?.path] && file?.status !== 2) {
          return { ...file, status: 2 }; // Mark as deleted
        }
        return file;
      })
      .filter((file) => file?.status !== 2); // Filter out the deleted files

    console.log(attachmentsData);

    setFiles(updatedAttachmentsData);

    setNewState((prevState) => ({
      ...prevState,
      attachment: updatedAttachmentsData,
    }));
    setSubmitNewState((prevState) => ({
      ...prevState,
      attachment: updatedAttachmentsData,
    }));

    // Immediately update the files state to remove deleted files
    setFiles((prevFiles) =>
      prevFiles.filter(
        (file) => !checkedFiles[file.name] // Only keep files that are not checked for deletion
      )
    );

    for (const filePath in checkedFiles) {
      if (checkedFiles[filePath]) {
        try {
          const response = await fetch(
            `${baseUrl}/api/master/DeleteDocuments`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ relativeFilePath: filePath }),
            }
          );

          if (response.ok) {
            console.log(`File ${filePath} deleted successfully`);
          } else {
            console.error(`Failed to delete file ${filePath}`);
          }
        } catch (error) {
          console.error(`Error deleting file ${filePath}:`, error);
        }
      }
    }

    setCheckedFiles({});

    // Force modal to close if necessary
    setOpenModal(false);
  };

  const downloadSelectedFiles = async () => {
    const selectedFiles = attachmentsData.filter(
      (file) => checkedFiles[file.path]
    );

    for (const file of selectedFiles) {
      try {
        const response = await fetch(`${baseUrl}/${file.path}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.blob();
        const downloadUrl = window.URL.createObjectURL(data);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = file.path.split("/").pop();
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(downloadUrl);
      } catch (error) {
        console.error("Error downloading file:", error);
      }
    }

    if (selectedFiles.length === 0) {
      setOpenModal(true);
      setParaText("Please select at least one file to download.");
      setIsError(true);
    }
  };

  const handleSelectAll = () => {
    const newCheckedFiles = {};
    if (!selectAll) {
      attachmentsData?.forEach((file) => {
        if (file?.status === 1) {
          newCheckedFiles[file.path] = true;
        }
      });
    }
    setCheckedFiles(newCheckedFiles);
    setSelectAll(!selectAll);
  };
  const onHandleChage = (event) => {
    console.log("event", event.target.name, event.target.value);

    // Find the corresponding file object
    setMailData((pre) => {
      return {
        ...pre,
        [event.target.name]: event.target.value,
      };
    });
  };

  useEffect(() => {
    const allSelected = attachmentsData?.every((file) =>
      file?.status === 1 ? checkedFiles[file.path] === true : true
    );
    setSelectAll(allSelected);
  }, [files, checkedFiles, attachmentsData]);

  const allFilesHaveStatus2 = attachmentsData?.every(
    (file) => file?.status === 2
  );
  if (isView && allFilesHaveStatus2) {
    return (
      <Accordion
        expanded={isParentAccordionOpen}
        sx={{
          ...childAccordionSection,
        }}
      >
        <AccordionSummary
          className="relative left-[11px]"
          sx={{ ...SummaryStyles }}
          expandIcon={
            <LightTooltip title={isParentAccordionOpen ? "Collapse" : "Expand"}>
              <ExpandMoreIcon
                sx={{ color: "white" }}
                onClick={() => setIsParentAccordionOpen((prev) => !prev)}
              />
            </LightTooltip>
          }
          aria-controls={`-content`}
          id={`panel header`}
        >
          <Typography className={`relative right-[11px]  ${styles.txtColor}`}>
            Document
          </Typography>
        </AccordionSummary>
        <AccordionDetails
          className={`${styles.txtColor} ${styles.pageBackground} overflow-auto ${styles.thinScrollBar}`}
        >
          <p className="text-[12px]">No documents found </p>
        </AccordionDetails>
      </Accordion>
    );
  }
  return (
    <>
      {!isCopy && (
        <Accordion
          expanded={isParentAccordionOpen}
          sx={{
            ...childAccordionSection,
          }}
        >
          <AccordionSummary
            className="relative left-[11px]"
            sx={{ ...SummaryStyles }}
            expandIcon={
              <LightTooltip
                title={isParentAccordionOpen ? "Collapse" : "Expand"}
              >
                <ExpandMoreIcon
                  sx={{ color: "white" }}
                  onClick={() => setIsParentAccordionOpen((prev) => !prev)}
                />
              </LightTooltip>
            }
            aria-controls={`-content`}
            id={`panel header`}
          >
            <Typography className={`relative right-[11px]  ${styles.txtColor}`}>
              Document
            </Typography>
          </AccordionSummary>

          <AccordionDetails
            className={`${styles.txtColor}  overflow-auto ${styles.thinScrollBar}`}
            sx={{
              ...accordianDetailsStyle,
            }}
          >
            <div className="">
              {!isView &&
                !allFilesHaveStatus2 &&
                attachmentsData?.length > 0 && (
                  <div className={mainContainer}>
                    <p
                      onClick={handleSelectAll}
                      className="text-[12px] text-[#0660FF] cursor-pointer w-[70px] "
                    >
                      {selectAll ? "Unselect All" : "Select All"}
                    </p>
                    <HoverIcon
                      defaultIcon={DeleteIcon2}
                      hoverIcon={DeleteHover}
                      altText={"Delete"}
                      title={"Delete"}
                      onClick={handleDeleteSelected}
                    />

                    <LightTooltip title="Download">
                      <DownloadRoundedIcon
                        onClick={downloadSelectedFiles}
                        sx={{
                          color: "#7F7F7F",
                          cursor: "pointer",
                          height: "20px!important",
                          width: "20px!important",
                        }}
                      />
                    </LightTooltip>
                    <HoverIcon
                      defaultIcon={shareIcon}
                      hoverIcon={ShareIconHover}
                      altText={"share"}
                      title={"Share"}
                      onClick={handleShareSelectedFiles}
                    />
                  </div>
                )}

              <div
                className={`text-black flex  gap-10 ${
                  isView ? "mt-2" : "mt-0"
                } `}
              >
                {!isView && (
                  <div>
                    <div
                      className={uploadFIleContainer}
                      style={{
                        ...uploadContainerStyle,
                      }}
                    >
                      <Image
                        alt="Upload"
                        src={uploadFileIcon}
                        className="object-cover"
                        style={{
                          cursor: "pointer",
                          width: "37px",
                          height: "37px",
                        }}
                        priority={true}
                      />
                      <p
                        className={`text-[10px] text-center ${styles.inputTextColor}`}
                      >
                        Drag & Upload document
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        multiple
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className={fileContainer}>
                  {attachmentsData
                    ?.filter((file) => file?.status === 1)
                    ?.map((file, index) => (
                      <div key={index} className="relative ">
                        {!isView && (
                          <FormGroup className="absolute top-[-11px] left-[-11px] z-50 ">
                            <Checkbox
                              onChange={(event) => {
                                handleCheckChange(event, file.path, index);
                              }}
                              checked={!!checkedFiles[file.path]}
                              icon={
                                <RadioButtonUncheckedIcon
                                  sx={{
                                    height: "20px !important",
                                    width: "20px !important",
                                  }}
                                  className="text-gray-300 rounded-full "
                                />
                              }
                              checkedIcon={
                                <CheckCircleOutlineIcon
                                  sx={{
                                    height: "20px !important",
                                    width: "20px !important",
                                  }}
                                />
                              }
                            />
                          </FormGroup>
                        )}

                        <a
                          href={`${baseUrl}/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <div className={filePaperStyles}>
                            {getFileIcon(file.path)}
                          </div>
                          <p className="truncate w-[150px] text-[12px] mt-[10px]">
                            {formatFileName(file.path)}
                          </p>
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      )}

      <CustomeModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        onConfirm={
          modalAction === "delete" ? confirmDeletion : handleOverrideDuplicates
        } // Conditional onConfirm        isError={error}
        paraText={paraText}
      />
      <ShareDocument
        onchange={onHandleChage}
        showModal={shareDocumentModal}
        handleSend={handleMailSennd}
        handleClose={handleShareSelectedFiles}
      />
    </>
  );
};

Attachments.propTypes = {
  expandAll: Proptypes.bool,
  attachmentsArray: Proptypes.array,
  isView: Proptypes.bool,
  setAttachmentsArray: Proptypes.func,
  attachmentsData: Proptypes.array,
  setNewState: Proptypes.func,
  newState: Proptypes.object,
  isCopy: Proptypes.bool,
  setSubmitNewState: Proptypes.func,
};

export default Attachments;
