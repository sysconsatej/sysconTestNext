import React, { useState } from "react";
import Image from "next/image";
import { pdfType, uploadFileIcon, excelType, imageType } from "@/assets";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { DeleteIcon2, DeleteHover } from "@/assets";
import HoverIcon from "../HoveredIcons/HoverIcon";
import {
  uploadFIleContainer,
  fileImageStyles,
  mainContainer,
  filePaperStyles,
  fileContainer,
} from "@/app/globalCss";

const Attachments = () => {
  const [files, setFiles] = useState([]);
  const [checkedFiles, setCheckedFiles] = useState({});
  const [selectAll, setSelectAll] = useState(false);

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files).map((file) => ({
      name: file.name,
      type: file.type,
    }));

    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
  };

  // console.log("files", files);

  const handleSelectAll = () => {
    const newCheckedFiles = {};
    if (!selectAll) {
      files.forEach((file) => {
        newCheckedFiles[file.name] = true;
      });
    }
    setCheckedFiles(newCheckedFiles);
    setSelectAll(!selectAll);
  };

  const handleCheckChange = (event, fileName) => {
    setCheckedFiles({ ...checkedFiles, [fileName]: event.target.checked });
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) {
      return <Image src={imageType} alt="Upload" className={fileImageStyles} />;
    } else if (fileType === "application/pdf") {
      return <Image src={pdfType} alt="Upload" className={fileImageStyles} />;
    } else if (
      [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ].includes(fileType)
    ) {
      return <Image src={excelType} alt="Upload" className={fileImageStyles} />;
    } else {
      return <span>📁</span>;
    }
  };

  return (
    <>
      <div className={mainContainer}>
        <p
          onClick={handleSelectAll}
          className="text-[12px] text-[#0660FF] cursor-pointer"
        >
          Select All
        </p>
        <HoverIcon
          defaultIcon={DeleteIcon2}
          hoverIcon={DeleteHover}
          altText={"Delete"}
          title={"Delete"}
          onClick={() => setFiles([])}
        />
      </div>
      <div className="mt-4 text-black flex gap-10">
        <div>
          <div
            className={uploadFIleContainer}
            style={{
              position: "relative",
              width: "170px",
              height: "170px",
              background: "white",
            }}
          >
            <Image
              alt="Upload"
              src={uploadFileIcon}
              className="object-cover"
              style={{ cursor: "pointer", width: "37px", height: "37px" }}
            />
            <p className="text-[12px]">Drag & Upload document</p>
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
        <div className={fileContainer}>
          {files.map((file, index) => (
            <div key={index} className="relative ">
              <FormGroup className="absolute top-[-11px] left-[-11px] z-50 ">
                <Checkbox
                  checked={!!checkedFiles[file.name]}
                  onChange={(event) => handleCheckChange(event, file.name)}
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
              <div className={filePaperStyles}>{getFileIcon(file.type)}</div>
              <p className="truncate w-[150px] text-[12px] mt-[10px]">
                {" "}
                {file.name}{" "}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Attachments