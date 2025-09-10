/* eslint-disable */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Backdrop from "@mui/material/Backdrop";
import styles from "@/components/common.module.css";
import {
  customTextFieldStyles,
  displaytableRowStyles_two,
} from "@/app/globalCss.js";
import LightTooltip from "@/components/Tooltip/customToolTip";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import {
  fetchSubJobData,
  insertReportData,
  insertReportRecordData,
} from "@/services/auth/FormControl.services";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  displaytableHeadStyles,
  displaytableRowStyles,
  displayTableContainerStyles,
  displayTablePaperStyles,
} from "@/app/globalCss";
import { toast } from "react-toastify";

export default function Allocation({
  setOpenAllocationModal,
  openAllocationModal,
  newState,
  getCalculatedTotal,
}) {
  const [allocationData, setAllocationData] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [allAllocationIds, SetAllAllocationIds] = useState([]);

  useEffect(() => {
    if (allocationData?.length > 0) {
      let allocationIds = allocationData.map((item) => ({
        id: item.id,
      }));
      SetAllAllocationIds(allocationIds);
    }
  }, [allocationData]);

  useEffect(() => {
    const fetchSubJobAllocation = async () => {
      try {
        const requestBody = {
          clientId: newState?.clientId || null,
          companyId: newState?.companyId || null,
          companyBranchId: newState?.companyBranchId || null,
          businessSegmentId: newState?.businessSegmentId || null,
          plrId: newState?.plrId || null,
          polId: newState?.polId || null,
          podId: newState?.podId || null,
          fpdId: newState?.fpdId || null,
          trport1Id: null,
          masterJobId: newState?.id || null,
        };
        const SubJobData = await fetchSubJobData(requestBody);
        if (SubJobData?.success === true && SubJobData?.data?.length > 0) {
          setAllocationData(SubJobData?.data);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchSubJobAllocation();
  }, [newState]);

  useEffect(() => {
    if (allocationData.length > 0) {
      const initialCheckedItems = {};
      const preSelectedRows = [];

      allocationData.forEach((row, index) => {
        if (row.masterJobId != null) {
          initialCheckedItems[index] = true;
          preSelectedRows.push(row);
        }
      });

      setCheckedItems(initialCheckedItems);
      setSelectedRows(preSelectedRows);
      setSelectedIds(preSelectedRows.map((r) => r.masterJobId));
      setSelectedRowCount(preSelectedRows.length);
    }
  }, [allocationData]);

  useEffect(() => {
    const initialChecked = {};
    allocationData.forEach((row, index) => {
      if (row.masterJobId != null) {
        initialChecked[index] = true;
      }
    });
    setCheckedItems(initialChecked);

    // Optional: Set selected rows and IDs initially
    const initiallySelectedRows = allocationData.filter(
      (row) => row.masterJobId != null
    );
    setSelectedRows(initiallySelectedRows);
    setSelectedIds(initiallySelectedRows.map((r) => r.id)); // or r.id
  }, [allocationData]);

  const handleClose = () => setOpenAllocationModal(false);

  const handleSubmit = async () => {
    try {
      if (newState?.id) {
        if (selectedIds.length > 0) {
          let ids = selectedIds.join(",");
          const payload = {
            TableName: "tblJob",
            Record: {
              masterJobId: newState?.id,
            },
            WhereCondition: `id in (${ids})`,
          };
          const response = await insertReportData(payload);
          if (response?.success) {
          }
        }
        if (allAllocationIds.length > 0) {
          const unmatchedRows = allAllocationIds.filter(
            (item) => !selectedIds.includes(item.id)
          );
          if (unmatchedRows.length) {
            const idList = unmatchedRows.map((item) => item.id).join(",");
            const payload = {
              TableName: "tblJob",
              Record: {
                masterJobId: null,
              },
              WhereCondition: `id in (${idList})`,
            };
            const response = await insertReportRecordData(payload);
            if (response?.success) {
            }
          }
        }
        toast.success("Record Saved successfully!");
        const totalWeight = selectedRows.reduce(
          (sum, row) => sum + (row.cargoWeight || 0),
          0
        );
        const totalVolume = selectedRows.reduce(
          (sum, row) => sum + (row.cargoVolume || 0),
          0
        );
        getCalculatedTotal(totalWeight, totalVolume);
        setOpenAllocationModal(false);
      }
    } catch (error) {
      toast.error("Failed Update the Record!");
      console.error(`Error While Inserting Data${error}`);
    }
  };

  const CustomeTextField = styled(TextField)({
    ...customTextFieldStyles,
  });

  const handleCheckBoxClick = (index, row) => {
    setCheckedItems((prev) => {
      const isChecked = !prev[index];
      const newChecked = { ...prev, [index]: isChecked };

      // Update selected rows list
      const newSelectedRows = isChecked
        ? [...selectedRows, row]
        : selectedRows.filter((r) => r.jobNo !== row.jobNo);

      setSelectedRows(newSelectedRows);

      // ✅ Update selectedIds
      setSelectedIds((prevIds) => {
        if (isChecked) {
          return [...prevIds, row.id]; // or row.id
        } else {
          return prevIds.filter((id) => id !== row.id); // or row.id
        }
      });

      // Optional: count
      const selectedCount = Object.values(newChecked).filter(Boolean).length;
      setSelectedRowCount(selectedCount);

      return newChecked;
    });
  };

  const totalWeight = selectedRows.reduce(
    (sum, row) => sum + (row.cargoWeight || 0),
    0
  );
  const totalVolume = selectedRows.reduce(
    (sum, row) => sum + (row.cargoVolume || 0),
    0
  );

  return (
    <Modal
      aria-labelledby="allocation-modal-title"
      aria-describedby="allocation-modal-description"
      open={openAllocationModal}
      onClose={handleClose}
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={openAllocationModal}>
        <div className="relative inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center px-4">
          <div
            className={`bg-[var(--commonBg)] p-[30px] rounded-lg shadow-xl w-[90vw] h-[80vh] flex flex-col justify-between`}
          >
            <div className="flex-grow flex flex-col overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="text-[var(--commonTextColor)] text-[14px] font-bold">
                  Allocation
                </p>
              </div>

              <Paper
                sx={{
                  ...displayTablePaperStyles,
                  maxHeight: "75%",
                  overflowY: "auto",
                  background: "none",
                }}
                className="mt-4 flex-grow overflow-hidden"
              >
                <TableContainer
                  className={`${styles.thinScrollBar} flex-grow overflow-hidden`}
                  sx={{
                    ...displayTableContainerStyles,
                    maxHeight: "75%",
                    overflowY: "auto",
                  }}
                >
                  <Table
                    stickyHeader
                    className={`overflow-auto ${styles.hideScrollbar} ${styles.thinScrollBar}`}
                  >
                    <TableHead sx={{ ...displaytableHeadStyles }}>
                      <TableRow>
                        <TableCell className={styles.cellHeading}>
                          Select
                        </TableCell>
                        <TableCell className={styles.cellHeading}>
                          Job No
                        </TableCell>
                        <TableCell className={styles.cellHeading}>
                          Customer
                        </TableCell>
                        <TableCell className={styles.cellHeading}>
                          Cargo Weight
                        </TableCell>
                        <TableCell className={styles.cellHeading}>
                          Cargo Volume
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allocationData.length > 0 ? (
                        allocationData.map((row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              ...displaytableRowStyles,
                              ...displaytableRowStyles_two(row > 0),
                            }}
                          >
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={!!checkedItems[index]}
                                onChange={() => handleCheckBoxClick(index, row)}
                              />
                            </TableCell>
                            <TableCell>{row.jobNo}</TableCell>
                            <TableCell>{row.customer}</TableCell>
                            <TableCell>{row.cargoWeight}</TableCell>
                            <TableCell>{row.cargoVolume}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">
                            No Records Found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
              <div className="flex mt-4">
                <div className="flex justify-start items-start me-4">
                  <LightTooltip className="justify-start" title="Total">
                    <CustomeTextField
                      autoComplete="off"
                      id="totalTxt"
                      type="number"
                      label={
                        <span className={`${styles.inputTextColor} `}>
                          {"Shipment Count"}
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      className={`${styles.inputField}`}
                      value={selectedRowCount}
                      disabled
                    />
                  </LightTooltip>
                </div>
                <div className="flex w-full lg:space-x-24 md:space-x-10 space-x-4 justify-end items-end lg:me-[8%] sm:me-0">
                  <LightTooltip title="Weight">
                    <CustomeTextField
                      autoComplete="off"
                      id="totalTxt"
                      type="number"
                      label={
                        <span className={`${styles.inputTextColor} `}>
                          {"Weight"}
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      className={`${styles.inputField}`}
                      value={totalWeight}
                      disabled
                    />
                  </LightTooltip>
                  <LightTooltip title="Volume">
                    <CustomeTextField
                      autoComplete="off"
                      id="totalTxt"
                      type="number"
                      label={
                        <span className={`${styles.inputTextColor} `}>
                          {"Volume"}
                        </span>
                      }
                      variant="outlined"
                      size="small"
                      className={`${styles.inputField}`}
                      value={totalVolume}
                      disabled
                    />
                  </LightTooltip>
                </div>
              </div>
            </div>

            <div style={{ width: "100%" }} className="flex space-x-4 mt-6">
              <div className="flex flex-grow justify-end">
                <button
                  onClick={handleSubmit}
                  className={`px-4 py-2 mr-4 text-[12px] ${styles.bgPrimaryColorBtn} flex items-center justify-center rounded-[5px] shadow-custom w-24 h-[27px]`}
                >
                  OK
                </button>
                <button
                  onClick={handleClose}
                  className={`px-4 py-2 text-[12px] ${styles.bgPrimaryColorBtn} flex items-center justify-center rounded-[5px] shadow-custom w-24 h-[27px]`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </Fade>
    </Modal>
  );
}

Allocation.propTypes = {
  setOpenAllocationModal: PropTypes.func,
  openAllocationModal: PropTypes.bool,
  newState: PropTypes.any,
  getCalculatedTotal: PropTypes.func,
};
