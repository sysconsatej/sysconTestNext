import React, { useState, useEffect } from 'react';
import {
  Backdrop,
  Box,
  Button,
  Fade,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { decrypt } from "@/helper/security";
import { fetchDataAPI } from "@/services/auth/FormControl.services";
import PropTypes from "prop-types";

const CreateBatchModal = ({ openModal, setOpenModal, save, newState, isAdd }) => {
  const handleClose = () => setOpenModal(false);

  // Function to process data for editing (when isAdd is false)
  const processEditData = (newState) => {
    // Modify this function to handle the different structure of newState for editing
    const processedRows = newState.tblWhTransactionDetails.map((item) => ({
      ...item,
      section: item.sectionId,
      subsection: item.subSectionId,
      // Other necessary mappings or transformations
    }));
    return processedRows;
  };

  const [rows, setRows] = useState(isAdd ? (newState.tblWhTransactionDetails || []) : processEditData(newState));
  const [productOptions, setProductOptions] = useState([]);
  const [sectionOptions, setSectionOptions] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [subsectionOptions, setSubsectionOptions] = useState([]);

  useEffect(() => {
    if (isAdd) {
      if (newState.tblWhTransactionDetails) {
        setRows(newState.tblWhTransactionDetails);
      }
    } else {
      // For editing, use the processed edit data
      setRows(processEditData(newState));
    }
  }, [newState.tblWhTransactionDetails, newState.tblWhTransactionDetailsEdit, isAdd]);

  useEffect(() => {
    const fetchData = async () => {
      const storedUserData = localStorage.getItem("userData");
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientCodeData = userData[0].clientCode;
      try {
        const productDataBody = {
          tableName: "tblItem",
          whereCondition: {
            status: 1,
            clientCode: clientCodeData,
          },
          subchildCondition: {},
          projection: {
            ItemName: 1,
          },
        };
        const productData = await fetchDataAPI(productDataBody);
        setProductOptions(productData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      const storedUserData = localStorage.getItem("userData");
      const decryptedData = decrypt(storedUserData);
      const userData = JSON.parse(decryptedData);
      const clientCodeData = userData[0].clientCode;
      try {
        const sectionDataBody = {
          tableName: "tblWarehouse",
          whereCondition: {
            status: 1,
            clientCode: clientCodeData,
          },
          subchildCondition: {},
          projection: {},
        };
        const sectionData = await fetchDataAPI(sectionDataBody);
        const sections = sectionData.data[0]?.tblWarehouseSection.map(section => ({
          id: section._id,
          name: section.name,
          subsections: section.tblWarehouseSubSection,
        }));
        setSectionOptions(sections);
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };
    fetchSections();
  }, []);

  const handleSectionChange = (index, selectedSectionId) => {
    const selectedSection = sectionOptions.find(sec => sec.id === selectedSectionId);
    const newSubsectionOptions = selectedSection ? selectedSection.subsections || [] : [];
  
    let updatedRows = rows.map((row, i) => {
      if (i === index) {
        return {
          ...row,
          section: selectedSectionId,
          subsection: newSubsectionOptions.length > 0 ? newSubsectionOptions[0]._id : "",
          subsectionOptions: newSubsectionOptions
        };
      } else if (index === 0) {
        // Apply to all rows when the first row is changed (optional behavior)
        return {
          ...row,
          section: selectedSectionId,
          subsection: newSubsectionOptions.length > 0 ? newSubsectionOptions[0]._id : "",
          subsectionOptions: newSubsectionOptions
        };
      }
      return row;
    });
  
    setRows(updatedRows);
  };
  

  const handleSubsectionChange = (index, selectedSubsectionId) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, subsection: selectedSubsectionId } : row
    );
  
    setRows(updatedRows);
  };
  

  const handleRowChange = (index, field, value) => {
    let updatedRows = [...rows];
  
    if (field === 'allocatedQty' || field === 'qty') {
      let currentRow = updatedRows[index];
      currentRow = { ...currentRow, [field]: parseInt(value, 10) };
  
      // Validate allocatedQty against qty
      if (currentRow.allocatedQty > currentRow.qty) {
        alert(`Allocated Qty cannot be greater than Qty (${currentRow.qty})`);
        return;
      }
  
      // Update the current row
      updatedRows[index] = currentRow;
  
      // Calculate the remaining quantity
      let remainingQty = currentRow.qty - currentRow.allocatedQty;
  
      // Remove all dependent rows if balance is achieved
      if (remainingQty === 0) {
        updatedRows = updatedRows.filter(
          (row, i) => i === index || row.originalIndex !== index
        );
      } else {
        // Handle updating or removing dependent rows
        for (let i = index + 1; i < updatedRows.length; i++) {
          let dependentRow = updatedRows[i];
  
          if (dependentRow.originalIndex === index) {
            if (remainingQty > 0) {
              dependentRow.qty = remainingQty;
              updatedRows[i] = dependentRow;
              remainingQty = 0; // Stop further updates after the first one
            } else {
              updatedRows.splice(i, 1); // Remove extra rows if balance is achieved
              i--; // Adjust index after removal
            }
          }
        }
  
        // If no dependent row exists and there's a remaining quantity, create a new one
        if (remainingQty > 0) {
          let existingRowIndex = updatedRows.findIndex(
            (row, i) =>
              i > index &&
              row.itemId === currentRow.itemId &&
              row.customerbatchNo === currentRow.customerbatchNo &&
              row.originalIndex === index
          );
  
          if (existingRowIndex >= 0) {
            updatedRows[existingRowIndex].qty = remainingQty;
          } else {
            const newRow = {
              ...currentRow,
              qty: remainingQty,
              allocatedQty: '', // Clear allocatedQty for the new row
              sectionId: '',
              subSectionId: '',
              originalIndex: index, // Store original index of this row
            };
            updatedRows.push(newRow);
          }
        }
      }
    } else {
      // Update other fields normally
      updatedRows[index] = { ...updatedRows[index], [field]: value };
    }
  
    setRows(updatedRows); // Update state with the new rows
  };
  

  const handleSave = () => {
    const updatedRows = rows.map(row => {
      if (row.allocatedQty) {
        return { ...row, qty: row.allocatedQty };
      }
      return row;
    });

    console.log("Saving rows: ", updatedRows);
    save(updatedRows);
    handleClose();
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={openModal}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={openModal}>
        <Box
          className="relative inset-0 bg-opacity-50 h-full w-full flex justify-center items-center px-4"
        >
          <Box
            className="bg-[var(--page-bg-color)] w-full max-w-5xl p-4 rounded shadow-lg"
            sx={{
              maxHeight: "80vh",  
              overflowY: "auto",  
              "&::-webkit-scrollbar": {
                width: "6px", 
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#888", 
                borderRadius: "10px",  
              },
              "&::-webkit-scrollbar-thumb:hover": {
                backgroundColor: "#555", 
              },
            }}
          >
            <Box className="flex flex-col gap-2">
              <Typography
                variant="h6"
                className="text-[var(--table-text-color)]"
                sx={{ fontSize: "14px" }}
              >
                {isAdd ? "Create Batch" : "Edit Batch"}
              </Typography>

              {rows.map((row, index) => (
                <Box key={index} className="flex flex-row flex-wrap gap-2 mb-2">
                  <FormControl
                    sx={{ flex: "1" }}
                    className="border border-solid border-[#E0E3E7] rounded-[4px] mb-[6px]"
                  >
                    <InputLabel
                      id={`product-select-label-${index}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "var(--table-text-color)",
                        background: "var(--page-bg-color)",
                        "&.Mui-focused": {
                          color: "var(--table-text-color) !important",
                          background: "var(--page-bg-color)",
                        },
                      }}
                    >
                      Product
                    </InputLabel>
                    <Select
                      labelId={`product-select-label-${index}`}
                      id={`product-select-${index}`}
                      value={row.itemId || ''}
                      onChange={(e) => handleRowChange(index, 'itemId', e.target.value)}
                      sx={{
                        fontSize: "12px",
                        "& .MuiSvgIcon-root": {
                          color: "var(--table-text-color)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "transparent !important",
                        },
                        "& .MuiSelect-select": {
                          color: "var(--table-text-color)",
                          padding: "6px",
                        },
                      }}
                    >
                      {productOptions.map((item, idx) => (
                        <MenuItem key={idx} value={item._id}>
                          {item.ItemName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Customer Batch"
                    value={row.customerbatchNo || ''}
                    onChange={(e) => handleRowChange(index, 'customerbatchNo', e.target.value)}
                    sx={{
                      flex: "1",
                      "& .MuiInputBase-input": {
                        color: "var(--table-text-color)",
                        fontSize: "12px",
                        padding: "6px",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "transparent",
                        },
                      },
                    }}
                    InputLabelProps={{
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      },
                    }}
                    className="border border-solid border-[#E0E3E7] rounded-[4px]"
                  />

                  <TextField
                    label="Qty"
                    type="number"
                    value={row.qty || ''}
                    onChange={(e) => handleRowChange(index, 'qty', parseInt(e.target.value, 10))}
                    sx={{
                      flex: "1",
                      "& .MuiInputBase-input": {
                        color: "var(--table-text-color)",
                        fontSize: "12px",
                        padding: "6px",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "transparent",
                        },
                      },
                    }}
                    InputLabelProps={{
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      },
                    }}
                    className="border border-solid border-[#E0E3E7] rounded-[4px]"
                  />

                  <TextField
                    label="Allocated Qty"
                    type="number"
                    value={row.allocatedQty || ''}
                    onChange={(e) => handleRowChange(index, 'allocatedQty', parseInt(e.target.value, 10))}
                    onBlur={(e) => handleRowChange(index, 'allocatedQty', e.target.value)}

                    sx={{
                      flex: "1",
                      "& .MuiInputBase-input": {
                        color: "var(--table-text-color)",
                        fontSize: "12px",
                        padding: "6px",
                      },
                      "& .MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor: "transparent",
                        },
                      },
                    }}
                    InputLabelProps={{
                      style: {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                      },
                    }}
                    className="border border-solid border-[#E0E3E7] rounded-[4px]"
                  />

                  <FormControl
                    sx={{ flex: "1" }}
                    className="border border-solid border-[#E0E3E7] rounded-[4px]"
                  >
                    <InputLabel
                      id={`section-select-label-${index}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "var(--table-text-color)",
                        background: "var(--page-bg-color)",
                        "&.Mui-focused": {
                          color: "var(--table-text-color) !important",
                          background: "var(--page-bg-color)",
                        },
                      }}
                    >
                      Section
                    </InputLabel>
                    <Select
                      labelId={`section-select-label-${index}`}
                      id={`section-select-${index}`}
                      value={row.section || ''}
                      onChange={(e) => handleSectionChange(index, e.target.value)}
                      sx={{
                        fontSize: "12px",
                        "& .MuiSvgIcon-root": {
                          color: "var(--table-text-color)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "transparent !important",
                        },
                        "& .MuiSelect-select": {
                          color: "var(--table-text-color)",
                          padding: "6px",
                        },
                      }}
                    >
                      {sectionOptions.map((section) => (
                        <MenuItem key={section.id} value={section.id} sx={{ fontSize: "12px" }}>
                          {section.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl
                    sx={{ flex: "1" }}
                    className="border border-solid border-[#E0E3E7] rounded-[4px]"
                  >
                    <InputLabel
                      id={`subsection-select-label-${index}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        color: "var(--table-text-color)",
                        background: "var(--page-bg-color)",
                        "&.Mui-focused": {
                          color: "var(--table-text-color) !important",
                          background: "var(--page-bg-color)",
                        },
                      }}
                    >
                      Subsection
                    </InputLabel>
                    <Select
                      labelId={`subsection-select-label-${index}`}
                      id={`subsection-select-${index}`}
                      value={row.subsection || ''}
                      onChange={(e) => handleSubsectionChange(index, e.target.value)}
                      sx={{
                        fontSize: "12px",
                        "& .MuiSvgIcon-root": {
                          color: "var(--table-text-color)",
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "transparent !important",
                        },
                        "& .MuiSelect-select": {
                          color: "var(--table-text-color)",
                          padding: "6px",
                        },
                      }}
                    >
                      {(row.subsectionOptions || []).map((subsection) => (
                        <MenuItem key={subsection._id} value={subsection._id} sx={{ fontSize: "12px" }}>
                          {subsection.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              ))}

              <Box className="flex justify-between mt-4">
                <Button
                  variant="contained"
                  className="capitalize"
                  sx={{ fontSize: "12px" }}
                  onClick={handleClose}
                >
                  Close
                </Button>
                <Button
                  variant="contained"
                  className="capitalize"
                  sx={{ fontSize: "12px" }}
                  onClick={handleSave}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

CreateBatchModal.propTypes = {
  openModal: PropTypes.bool,
  setOpenModal: PropTypes.func,
  save: PropTypes.func,
  newState: PropTypes.object,
  isAdd: PropTypes.bool,
};

export default CreateBatchModal;
