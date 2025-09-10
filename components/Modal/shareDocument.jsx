/* eslint-disable no-unused-vars */
"use client";
import React from "react";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import PropTyes from "prop-types";
import styles from "@/components/common.module.css";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import { customTextFieldStyles } from "@/app/globalCss";
import LightTooltip from "../Tooltip/customToolTip";
import { Button } from "@mui/material";
import { data } from "autoprefixer";
const CustomeTextField = styled(TextField)({
    ...customTextFieldStyles,
});


function ShareDocument({ onchange, showModal, handleClose, data, handleSend }) {

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
                        <h1 className="text-black font-bolds">Share Document</h1>
                        <div className="flex gap-4 p-5">
                            <LightTooltip title={"To"}>
                                <CustomeTextField
                                    autoComplete="off"
                                    variant="outlined"
                                    size="small"
                                    name="to"
                                    label="To"
                                    className={` w-[12rem]  ${styles.inputField}`}
                                    onChange={onchange}
                                    value={data?.to}
                                    InputLabelProps={{
                                        classes: {
                                            asterisk: "required-asterisk",
                                        },
                                    }}
                                />
                            </LightTooltip>
                            <LightTooltip title={"Subject"}>
                                <CustomeTextField
                                    autoComplete="off"
                                    variant="outlined"
                                    size="small"
                                    name="subject"
                                    label="Subject"
                                    value={data?.subject}
                                    onChange={onchange}
                                    className={` w-[12rem]  ${styles.inputField} h-9`}
                                    InputLabelProps={{
                                        classes: {
                                            asterisk: "required-asterisk",
                                        },
                                    }}
                                />
                            </LightTooltip>
                            <LightTooltip title={"Message"}>
                                <CustomeTextField
                                    autoComplete="off"
                                    variant="outlined"
                                    size="small"
                                    name="text"
                                    label="Message"
                                    value={data?.text}
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
                                Send Mail
                            </Button>
                        </div>
                    </div>
                </div>
            </Fade>
        </Modal >
    )
}

ShareDocument.propTypes = {
    onchange: PropTyes.func,
    showModal: PropTyes.bool,
    handleClose: PropTyes.func,
    data: PropTyes.object,
    handleSend: PropTyes.func
}

export default ShareDocument