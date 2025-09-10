"use client";
import React from "react";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import PropTyes from "prop-types";
import styles from "@/components/common.module.css";


export default function CustomeModal({
  setOpenModal,
  openModal,
  onConfirm,
  isError,
  paraText,
  typeEvent,
  labelValue
}) {
  const handleClose = () => setOpenModal((prev) => !prev);

  //  code to remove the fieldName and add LabelName
  const arrStr = paraText.split(' ');
  const newArr = arrStr.reduce((acc, current, index) => {
    if (index !== 0) {
      acc.push(current);
    }
    return acc;
  }, []);

  const modalText = newArr.join(' ');

  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openModal}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={openModal}>
          <div
            className={`relative inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center px-4 `}
          >
            <div
              className={`${styles.modalTextColor}  ${styles.modalBg} p-[30px] rounded-lg shadow-xl  w-full sm:w-[460px] h-auto sm:h-[175px]  flex flex-col justify-between mx-auto max-w-full sm:max-w-[520px] ${isError ? "top-0 absolute" : ""
                }`}
            >
              <div className="">
                <h3 className={`${styles.modalTextColor} text-[12px] `}>
                  www.sysconinfotec.com says
                </h3>
              </div>
              <div className="flex-grow py-[10px]">
                {/* prevCode  */}
                {/* <p className={`${styles.modalTextColor} text-[12px]`}>
                  {paraText}
                </p> */}
                {/* prevCode ends here  */}
                <p className={`${styles.modalTextColor} text-[12px]`}>
                  {labelValue ? labelValue + " " + modalText : paraText}
                </p>
              </div>
              <div className="flex justify-end space-x-4 ">
                <button
                  onClick={() =>
                    onConfirm({
                      value: true,
                      isError: isError,
                      type: typeEvent,
                    })
                  }
                  className={`px-4 text-[12px] py-2 ${styles.bgPrimaryColorBtn} flex items-center justify-center  rounded-[5px] shadow-custom  w-24 h-[27px]`}
                >
                  Ok
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


CustomeModal.propTypes = {
  openModal: PropTyes.bool,
  setOpenModal: PropTyes.func,
  onConfirm: PropTyes.func,
  isError: PropTyes.bool,
  paraText: PropTyes.string,
  typeEvent: PropTyes.string,
  labelValue: PropTyes.string
};