/* eslint-disable no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import PropTyes from "prop-types";
import styles from "@/components/common.module.css";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import { customTextFieldStyles } from "@/app/globalCss";
import LightTooltip from "../Tooltip/customToolTip";
import { Button, InputLabel, MenuItem, Select, } from "@mui/material";
import {
    dynamicDropDownFieldsData, FormControlOfToClinetCode, clientCodeDropDown
} from "@/services/auth/FormControl.services.js";
import { data } from "autoprefixer";
import { set } from "lodash";
const CustomeTextField = styled(TextField)({
    ...customTextFieldStyles,
});



function CopyFormControl({ onchange, showModal, handleClose, data, handleSend }) {
    const [formControlOtions, setformControlOtions] = useState([])
    const [ToCilentformControl, setToCilentFormControl] = useState([])
    const [clientCode, setclientCode] = useState([])
    useEffect(() => {
        fetchDropDown()
    }, [])
    useEffect(() => {
        fetchToCilentFormControl()
    }, [data.toClientCode])

    async function fetchDropDown() {
        let dataa = await dynamicDropDownFieldsData({ "onfilterkey": "status", "onfiltervalue": 1, "referenceTable": "tblFormcontrol", "referenceColumn": "menuID", "dropdownFilter": ``, "search": "", "pageNo": 1, "value": "66adc521e1ce56bc29af1f12" })
        if (dataa) {
            console.log("formControlOtions", dataa);
            setformControlOtions(dataa.data)

        }
        let clientCode = await clientCodeDropDown()
        if (clientCode) {
            setclientCode(clientCode.data)
        }
    }
    async function fetchToCilentFormControl() {
        let dataa = await FormControlOfToClinetCode({ "clientCode": data?.toClientCode })
        if (dataa) {
            console.log("ToCilentformControl", dataa);
            setToCilentFormControl(dataa.data)

        }
    }

    return (
        <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={showModal || false}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
                backdrop: {
                    timeout: 500,
                },
            }}
        >
            <Fade in={showModal || false}>
                <div
                    className={`relative inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center px-4 `}
                >

                    <div
                        className={`gap-10 w-[40rem] h-[15rem] justify-evenly bg-white rounded-lg p-4`}

                    >
                        <h1 className="text-black font-bolds">Copy Form Control</h1>
                        <div className="flex gap-4 p-5">
                            <LightTooltip title={"To Client Code"}>
                                {/* <CustomeTextField
                                    autoComplete="off"
                                    variant="outlined"
                                    size="small"
                                    name="toClientCode"
                                    label="To Client Code"
                                    value={data?.toClientCode}
                                    onChange={onchange}
                                    className={` w-[12rem]  ${styles.inputField} h-9`}
                                    InputLabelProps={{
                                        classes: {
                                            asterisk: "required-asterisk",
                                        },
                                    }}
                                /> */}
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    className="w-[12rem] h-9"
                                    placeholder="Form Control"
                                    // value={ }
                                    label="Vendor"
                                    name="toClientCode"
                                    onChange={onchange}
                                    sx={{
                                        "& .MuiSvgIcon-root": {
                                            color: "var(--inputTextColor)",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "transparent !important", // Ensure border stays transparent on focus
                                        },
                                        "& .MuiSelect-select": {
                                            color: "var(--inputTextColor)",
                                        },
                                    }}
                                >
                                    {clientCode.map((item, index) => {
                                        return (
                                            <MenuItem key={index} value={item?.value}>
                                                {item.label}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </LightTooltip>
                            <LightTooltip title={"Form Control"}>
                                {/* <InputLabel
                                    id="demo-simple-select-label"
                                    className="w-[12rem] h-9"
                                    sx={{
                                        color: "var(--inputTextColor)", // Default color
                                        background: "var(--commonBg)",
                                        "&.Mui-focused": {
                                            color: "var(--inputTextColor) !important", // Color on focus with !important
                                            background: "var(--commonBg)",
                                        },
                                    }}
                                >
                                    Form Control
                                </InputLabel> */}
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    className="w-[12rem] h-9"
                                    placeholder="Form Control"
                                    // value={ }
                                    label="Vendor"
                                    name="formControlId"
                                    onChange={onchange}
                                    sx={{
                                        "& .MuiSvgIcon-root": {
                                            color: "var(--inputTextColor)",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "transparent !important", // Ensure border stays transparent on focus
                                        },
                                        "& .MuiSelect-select": {
                                            color: "var(--inputTextColor)",
                                        },
                                    }}
                                >
                                    {formControlOtions.map((item, index) => {
                                        return (
                                            <MenuItem key={index} value={item?.value}>
                                                {item.label}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </LightTooltip>
                            <LightTooltip title={"To Form Control"}>
                                {/* <InputLabel
                                    id="demo-simple-select-label"
                                    className="w-[12rem] h-9"
                                    sx={{
                                        color: "var(--inputTextColor)", // Default color
                                        background: "var(--commonBg)",
                                        "&.Mui-focused": {
                                            color: "var(--inputTextColor) !important", // Color on focus with !important
                                            background: "var(--commonBg)",
                                        },
                                    }}
                                >
                                    Form Control
                                </InputLabel> */}
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    className="w-[12rem] h-9"
                                    placeholder="To Form Control"
                                    // value={ }
                                    label="Vendor"
                                    name="toFormControlId"
                                    onChange={onchange}
                                    sx={{
                                        "& .MuiSvgIcon-root": {
                                            color: "var(--inputTextColor)",
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "transparent !important", // Ensure border stays transparent on focus
                                        },
                                        "& .MuiSelect-select": {
                                            color: "var(--inputTextColor)",
                                        },
                                    }}
                                >
                                    {ToCilentformControl.map((item, index) => {
                                        return (
                                            <MenuItem key={index} value={item?.value}>
                                                {item.label}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </LightTooltip>
                            <LightTooltip title={"New Name"}>
                                <CustomeTextField
                                    autoComplete="off"
                                    variant="outlined"
                                    size="small"
                                    name="toFormControlName"
                                    label="New Name"
                                    value={data?.toFormControlName}
                                    onChange={onchange}
                                    className={` w-[12rem]  ${styles.inputField} h-9`}
                                    InputLabelProps={{
                                        classes: {
                                            asterisk: "required-asterisk",
                                        },
                                    }}
                                />
                            </LightTooltip>
                        </div>
                        <div className="position-relative right-0 flex gap-4 p-5">
                            <Button
                                variant="contained"
                                className="capitalize"
                                onClick={handleClose}
                            >
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                className="capitalize"
                                onClick={handleSend}
                            >
                                Copy Form Control
                            </Button>
                        </div>
                    </div>
                </div>
            </Fade>
        </Modal >
    )
}

CopyFormControl.propTypes = {
    onchange: PropTyes.func,
    showModal: PropTyes.bool,
    handleClose: PropTyes.func,
    data: PropTyes.object,
    handleSend: PropTyes.func
}

export default CopyFormControl