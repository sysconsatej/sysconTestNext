/* eslint-disable no-unused-vars */
"use client";
import { toast } from "react-toastify";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";
import md5 from "md5";

export const onSubmitChildFunction = ({
  args,
  newState,
  formControlData,
  values,
  setStateVariable,
}) => {
  console.log("onSubmitChildFunction", {
    args,
    newState,
    formControlData,
    values,
    setStateVariable,
  });
  values.boardNo1 = "1";
  // setStateVariable((prev) => ({...prev, boardNo1: "1"}));
  return {
    isCheck: true,
    type: "error",
    message: "Exchange rates updated successfully",
    alertShow: true,
    // fieldName: fieldName,
    newState: newState,
    values: values,
    formControlData: formControlData,
  };
};

export const setCalculateVolume = ({
  args,
  newState,
  formControlData,
  values,
  setStateVariable,
}) => {
  console.log("onSubmitChildFunction", {
    args,
    newState,
    formControlData,
    values,
    setStateVariable,
  });
  const argNames = args?.split(",").map((arg) => arg.trim());
  const cargoWtField = argNames[0];
  let volumeTotal = 0;
  let volumeWtTotal = 0;
  if (Array.isArray(newState.tblRateRequestQty)) {
    newState.tblRateRequestQty.forEach((row) => {
      const volume = parseFloat(row.volume) || 0;
      const volumeWt = parseFloat(row.volumeWt) || 0;
      volumeTotal += volume;
      volumeWtTotal += volumeWt;
    });
  }

  let vol = parseFloat(values.volume);
  let volWt = parseFloat(values.volumeWt);
  if (isNaN(vol) || vol === undefined || vol === null || vol === "") {
    vol = 0;
  }
  if (isNaN(volWt) || volWt === undefined || volWt === null || volWt === "") {
    volWt = 0;
  }

  const volumeTotalGrid = volumeTotal + vol;
  const volumeWtTotalGrid = volumeWtTotal + volWt;
  newState.volume = volumeTotalGrid;
  newState.volumeWt = volumeWtTotalGrid;
  return {
    isCheck: true,
    type: "success",
    message: "Volume calculated and updated successfully",
    alertShow: false,
    newState,
    values,
    formControlData,
  };
};

export const setSameDDValuesBasedOnSecondRow = ({
  args,
  newState,
  formControlData,
  values,
}) => {
  // throw new Error(`Error Can't delete this record IRAN is generated`);
  if (newState.tblVoucherLedger.length === 1) {
    newState.paymentByParty = values?.glId;
    newState.paymentByPartydropdown = values?.glIddropdown;
  } else if (newState.tblVoucherLedger.length >= 1) {
    newState.paymentByParty = newState?.tblVoucherLedger[1]?.glId;
    newState.paymentByPartydropdown =
      newState?.tblVoucherLedger[1]?.glIddropdown;
  } else {
    newState;
  }

  if (newState)
    return {
      isCheck: false,
      type: "success",
      message: "Data set based on second row",
      alertShow: false,
      newState: newState,
      values: values,
      formControlData: formControlData,
    };
};

export const updateBalance = async ({
  args,
  newState,
  formControlData,
  values,
  setStateVariable,
}) => {
  const jobId = newState.tblVehicleRouteDetails[0].jobId;
  //const commodity = values.commodity
  // const request = {
  //   tableName: "tblJob",
  //   whereCondition: {
  //     _id: orderId,
  //     "tblVehicleOrderDetails._id": commodity,
  //     status: 1,
  //     clientCode: clientCode,
  //   },
  //   projection: {},
  // };
  const request = {
    columns: "*",
    tableName: "tblJobQty",
    whereCondition: `jobId = ${jobId} and status = 1`,
    clientIdCondition: `status=1 FOR JSON PATH ,INCLUDE_NULL_VALUES`,
  };
  const response = await fetchReportData(request);
  const responseData = response.data[0];

  if (responseData) {
    const initialNoOfPackages = responseData.noOfpackages;
    const usedNoOfPackages = values.noOfPackages || 0;
    const balNoOfPackages = Math.max(0, initialNoOfPackages - usedNoOfPackages);
    //newState.tblVehicleRouteDetails[0].balNoOfPackages = balNoOfPackages;
    //values.balNoOfPackages = balNoOfPackages;
    values.balNoOfPackages = balNoOfPackages;
    return {
      isCheck: true,
      type: "success",
      message: "Updated successfully",
      alertShow: false,
      newState,
      values,
      formControlData,
    };
  }
  return {
    isCheck: true,
    type: "success",
    message: "Updated successfully",
    alertShow: false,
    newState,
    values,
    formControlData,
  };
};

// export const mainSubmitBalance = async ({
//   args,
//   newState,
//   formControlData,
//   values,
//   setStateVariable,
// }) => {
//   const { clientCode } = getUserDetails();
//   const vehicleRouteDetails = newState.tblVehicleRouteDetails;
//   const request = vehicleRouteDetails.map(detail => ({
//     tableName: "tblVehicleOrder",
//     uniqueColumn: {
//       "tblVehicleOrderDetails._id": detail.commodity,
//     },
//     whereCondition: {
//       balNoOfPackages: detail.balNoOfPackages,
//     },
//   }));
//   const response = await updateDataAPI(request);
//   if (response) {
//     alert(response.message);
//     return {
//       isCheck: true,
//       type: "success",
//       message: "Updated successfully",
//       alertShow: false,
//       newState,
//       values,
//       formControlData,
//     };
//   }
//   return {
//     isCheck: true,
//     type: "success",
//     message: "Updated successfully",
//     alertShow: false,
//     newState,
//     values,
//     formControlData,
//   };
// };

export const userPassword = async (obj) => {
  const { newState, values, submitNewState } = obj;

  const updatedValues = {
    ...values,
    password: md5(values.password),
  };

  return {
    type: "success",
    result: true,
    newState: newState,
    values: updatedValues,
    submitNewState: submitNewState,
    message: "Passowrd updated SuccessFully!",
  };
};

export const checkContainer = async ({
  args,
  newState,
  formControlData,
  values,
  setStateVariable,
}) => {
  try {
    const jobQtyList = newState.tblJobQty || [];
    const containerList = newState.tblJobContainer || [];
    const totalQty = jobQtyList.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
    const validContainerCount = containerList.filter(
      (container) => container.containerNo && container.containerNo.trim() !== ""
    ).length;

    if (validContainerCount !== totalQty) {
      // return {
      //   type: "error",
      //   result: true,
      //   newState: newState,
      //   values: updatedValues,
      //   submitNewState: submitNewState,
      //   message: `Number of Container Nos (${validContainerCount}) does not match the quantity (${totalQty}) specified in Job Qty.`,

      // };
      // alert(`Number of Container Nos (${validContainerCount}) does not match the quantity (${totalQty}) specified in Job Qty.`)
      throw new Error(`Number of Container Nos (${validContainerCount}) does not match the quantity (${totalQty}) specified in Job Qty.`);
      // return false;

    }

    return {
      isCheck: true,
      type: "success",
      message: "Container numbers match the quantity.",
      alertShow: false,
      newState,
      values,
      formControlData,
    };
  } catch (error) {
    throw new Error(error.message)
    // return false;

    // return {
    //   isCheck: false,
    //   type: "error",
    //   message: `Error while validating containers: ${error.message}`,
    //   alertShow: true,
    //   newState,
    //   values,
    //   formControlData,
    // };
  }
};


export const setRateToParent = (obj) => {
  const { args, newState, formControlData, values, setStateVariable, childName, childIndex, valuesIndex } = obj;
  const argNames = args?.split(",").map((arg) => arg.trim());
  console.log("setRateToParent", obj);
  console.log("argNames", newState[childName][childIndex][argNames[0]]);

  if (typeof valuesIndex === "number") {
    newState[childName][childIndex][argNames[0]][valuesIndex] = values;
  } else {
    newState[childName][childIndex][argNames[0]].push(values);
  }

  // ✅ Ensure numeric sum
  newState[childName][childIndex][argNames[2]] =
    newState[childName][childIndex][argNames[0]].reduce(
      (acc, item) => acc + (Number(item[argNames[1]]) || 0),
      0
    );

  console.log("finalData", newState);

  if (typeof valuesIndex !== "number") {
    newState[childName][childIndex][argNames[0]].pop(); // ✅ call pop()
  }

  return {
    type: "success",
    result: true,
    newState: newState,
    values: {},
    submitNewState: newState,
    message: "Password updated successfully!",
  };
};

export const setRateToParent1 = (obj) => {
  const { args, newState, formControlData, values, setStateVariable, childName, childIndex, valuesIndex } = obj;
  const argNames = args?.split(",").map((arg) => arg.trim());
  console.log("setRateToParent", obj);
  console.log("argNames", newState[childName][childIndex][argNames[0]]);

  if (typeof valuesIndex === "number") {
    newState[childName][childIndex][argNames[0]][valuesIndex] = values;
  } else {
    newState[childName][childIndex][argNames[0]].push(values);
  }

  // ✅ Ensure numeric sum
  newState[childName][childIndex][argNames[2]] =
    newState[childName][childIndex][argNames[0]].reduce(
      (acc, item) => acc + (Number(item[argNames[1]]) || 0),
      0
    );
  newState[childName][childIndex][argNames[4]] =
    (
      newState[childName][childIndex][argNames[0]].reduce(
        (acc, item) => acc + (Number(item[argNames[3]]) || 0),
        0
      )
    ).toFixed(2);



  console.log("finalData", newState);

  if (typeof valuesIndex !== "number") {
    newState[childName][childIndex][argNames[0]].pop(); // ✅ call pop()
  }

  return {
    type: "success",
    result: true,
    newState: newState,
    values: {},
    submitNewState: newState,
    message: "Password updated successfully!",
  };
};

export const setRateToParentPurchase = (obj) => {
  const { args, newState, formControlData, values, setStateVariable, childName, childIndex, valuesIndex } = obj;
  const argNames = args?.split(",").map((arg) => arg.trim());
  console.log("setRateToParent", obj);
  console.log("argNames", newState[childName][childIndex][argNames[0]]);

  if (typeof valuesIndex === "number") {
    newState[childName][childIndex][argNames[0]][valuesIndex] = values;
  } else {
    newState[childName][childIndex][argNames[0]].push(values);
  }

  // ✅ Ensure numeric sum
  newState[childName][childIndex][argNames[2]] =
    newState[childName][childIndex][argNames[0]].reduce(
      (acc, item) => acc + (Number(item[argNames[1]]) || 0) /
        (newState[childName][childIndex][argNames[0]].length || 1),
      0
    ).toFixed(2);
  newState[childName][childIndex][argNames[4]] =
    (
      newState[childName][childIndex][argNames[0]].reduce(
        (acc, item) => acc + (Number(item[argNames[3]]) || 0),
        0
      )
    ).toFixed(2);

  console.log("finalData", newState);

  if (typeof valuesIndex !== "number") {
    newState[childName][childIndex][argNames[0]].pop(); // ✅ call pop()
  }

  return {
    type: "success",
    result: true,
    newState: newState,
    values: {},
    submitNewState: newState,
    message: "Password updated successfully!",
  };
};

export const AmountHc = (obj) => {
  const { newState } = obj;

  // Ensure tblInvoiceCharge exists and has at least one item
  if (!newState?.tblInvoiceCharge?.length) {
    return {
      type: "error",
      result: false,
      message: "No invoice charges found",
    };
  }

  // Loop through each tblInvoiceCharge item
  const updatedInvoiceCharge = newState.tblInvoiceCharge.map((invoice) => {
    const details = invoice.tblInvoiceChargeDetails || [];

    if (details.length > 0) {
      // Filter only items with a valid amountHc
      const validAmounts = details
        .map((item) => item.amountHc)
        .filter((amt) => amt != null && amt !== 0);

      // Calculate average only if there are valid amounts
      const avgAmountHc =
        validAmounts.length > 0
          ? validAmounts.reduce((sum, amt) => sum + amt, 0) / validAmounts.length
          : 0;

      // Set the rate field to avgAmountHc
      return {
        ...invoice,
        rate: avgAmountHc,
      };
    }

    return invoice;
  });

  // Return updated newState
  return {
    type: "success",
    result: true,
    newState: {
      ...newState,
      tblInvoiceCharge: updatedInvoiceCharge,
    },
    values: {},
    submitNewState: {
      ...newState,
      tblInvoiceCharge: updatedInvoiceCharge,
    },
    message: "Rate updated with average amountHc successfully!",
  };
};

// export const copyContainerData = (obj) => {
//   const {
//     args = "",            
//     newState = {},
//     values = {},
//   } = obj;

//   try {
//     const rows = Array.isArray(newState?.tblContainerMovement)
//       ? [...newState.tblContainerMovement]
//       : [];

//     if (rows.length === 0) {
//       return { type: "info", result: false, message: "No rows to update", newState };
//     }

//     const fieldsToCopy = args
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean);

//     const srcIndex = Number(values?.indexValue ?? 0);
//     const srcRow = rows[srcIndex] ?? rows[0] ?? {};

//     const getSourceVal = (field) =>
//       Object.prototype.hasOwnProperty.call(values, field) ? values[field] : srcRow[field];

//     const patch = {};
//     for (const f of fieldsToCopy) {
//       patch[f] = getSourceVal(f);
//       const dd = `${f}dropdown`;
//       if (Object.prototype.hasOwnProperty.call(values, dd)) {
//         patch[dd] = values[dd];
//       } else if (Object.prototype.hasOwnProperty.call(srcRow, dd)) {
//         patch[dd] = srcRow[dd];
//       }
//     }

//     const hasSelection = rows.some((r) => r?.isChecked === true);

//     const updatedRows = rows.map((r) => {
//       const shouldUpdate = hasSelection ? r?.isChecked === true : true;
//       return shouldUpdate ? { ...r, ...patch } : r;
//     });
//     const updatedState = { ...newState, tblContainerMovement: updatedRows };
//     return {
//       type: "success",
//       result: true,
//       message: `Set ${fieldsToCopy.join(", ")} on ${hasSelection ? "selected" : "all"} rows.`,
//       newState: updatedState,
//       values: {},              // clear transient form values if your pipeline expects it
//       submitNewState: updatedState,
//     };
//   } catch (error) {
//     console.error("Error in copyContainerData:", error);
//     return {
//       type: "error",
//       result: false,
//       message: "Error copying container data. Please try again.",
//     };
//   }
// };


export const copyContainerData = (obj) => {
  const {
    args = "",
    newState = {},
    values = {},
  } = obj;

  try {
    const rows = Array.isArray(newState?.tblContainerMovement)
      ? [...newState.tblContainerMovement]
      : [];

    if (rows.length === 0) {
      return { type: "info", result: false, message: "No rows to update", newState };
    }

    const fieldsToCopy = args
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const srcIndex = Number(values?.indexValue ?? 0);
    const srcRow = rows[srcIndex] ?? rows[0] ?? {};

    const getSourceVal = (field) =>
      Object.prototype.hasOwnProperty.call(values, field) ? values[field] : srcRow[field];

    const patch = {};
    for (const f of fieldsToCopy) {
      patch[f] = getSourceVal(f);
      const dd = `${f}dropdown`;
      if (Object.prototype.hasOwnProperty.call(values, dd)) {
        patch[dd] = values[dd];
      } else if (Object.prototype.hasOwnProperty.call(srcRow, dd)) {
        patch[dd] = srcRow[dd];
      }
    }

    const isFirstRow = srcIndex === 0; // <-- only first row may broadcast to others
    const hasSelection = rows.some((r) => r?.isChecked === true);

    const updatedRows = rows.map((r, i) => {
      if (!isFirstRow) {
        return i === srcIndex ? { ...r, ...patch } : r;
      }
      const shouldUpdate = hasSelection ? r?.isChecked === true : true;
      return shouldUpdate ? { ...r, ...patch } : r;
    });

    const updatedState = { ...newState, tblContainerMovement: updatedRows };

    return {
      type: "success",
      result: true,
      message: isFirstRow
        ? `Set ${fieldsToCopy.join(", ")} on ${hasSelection ? "selected" : "all"} rows.`
        : `Updated ${fieldsToCopy.join(", ")} on row ${srcIndex + 1} only.`,
      newState: updatedState,
      values: {},              
      submitNewState: updatedState,
    };
  } catch (error) {
    console.error("Error in copyContainerData:", error);
    return {
      type: "error",
      result: false,
      message: "Error copying container data. Please try again.",
    };
  }
};

// export const setToDate = (obj) => {
//   const { newState = {}, values = {} } = obj || {};

//   try {
//     const charges = Array.isArray(newState?.tblInvoiceCharge)
//       ? newState.tblInvoiceCharge
//       : [];

//     if (charges.length === 0) {
//       return { type: "info", result: false, message: "No charges found.", newState };
//     }

//     const isEmpty = (v) => v == null || String(v).trim() === "" || String(v).startsWith("0000-00-00");

//     const findSourceToDate = () => {
//       if (!isEmpty(values?.toDate)) return values.toDate;

//       for (const ch of charges) {
//         const details = Array.isArray(ch?.tblInvoiceChargeDetails) ? ch.tblInvoiceChargeDetails : [];
//         for (const d of details) {
//           if (!isEmpty(d?.toDate)) return d.toDate;
//         }
//       }
//       for (const ch of charges) {
//         if (!isEmpty(ch?.toDate)) return ch.toDate;
//       }
//       return null;
//     };

//     const srcToDate = findSourceToDate();

//     if (isEmpty(srcToDate)) {
//       return {
//         type: "warning",
//         result: false,
//         message: "No source toDate found to fill.",
//         newState,
//       };
//     }
//     let changed = 0;

//     const updatedCharges = charges.map((ch) => {
//       let rowChanged = false;
//       let next = ch;
//       if (isEmpty(next?.toDate)) {
//         next = { ...next, toDate: srcToDate };
//         rowChanged = true;
//       }

//       const details = Array.isArray(ch?.tblInvoiceChargeDetails) ? ch.tblInvoiceChargeDetails : null;

//       if (details && details.length > 0) {
//         let detailChanged = false;
//         const updatedDetails = details.map((d) => {
//           if (isEmpty(d?.toDate)) {
//             detailChanged = true;
//             return { ...d, toDate: srcToDate };
//           }
//           return d;
//         });

//         if (detailChanged) {
//           next = { ...next, tblInvoiceChargeDetails: updatedDetails };
//           rowChanged = true;
//         }
//       }

//       if (rowChanged) changed++;
//       return next;
//     });

//     if (changed === 0) {
//       return { type: "info", result: false, message: "All toDate values were already set.", newState };
//     }

//     const updatedState = { ...newState, tblInvoiceCharge: updatedCharges };

//     return {
//       type: "success",
//       result: true,
//       message: `Filled toDate on ${changed} charge row(s) (including their details where needed).`,
//       newState: updatedState,
//       submitNewState: updatedState,
//       values: {},
//     };
//   } catch (err) {
//     console.error("fillToDateFromFirstRow error:", err);
//     return {
//       type: "error",
//       result: false,
//       message: "Failed to fill toDate. Please try again.",
//       newState,
//     };
//   }
// };


// export const rollupNoOfPackages = (obj) => {
//   const { newState = {}, values = {} } = obj ?? {};

//   try {
//     const rows = Array.isArray(newState?.tblJobContainer)
//       ? newState.tblJobContainer
//       : [];

//     if (rows.length === 0) {
//       return { type: "info", result: false, message: "No container rows.", newState };
//     }

//     const toNum = (v) =>
//       v == null || v === "" ? 0 : Number(String(v).replace(/,/g, "")) || 0;

//     const selectedOnly = !!values?.selectedOnly;
//     const rowsToSum = selectedOnly ? rows.filter((r) => !!r?.isChecked) : rows;

//     const sum = rowsToSum.reduce((acc, r) => acc + toNum(r?.noOfPackages), 0);

//     const targetKey = Object.prototype.hasOwnProperty.call(newState, "noOfpackages")
//       ? "noOfpackages"
//       : "noOfPackages";

//     if (toNum(newState?.[targetKey]) === sum) {
//       return {
//         type: "info",
//         result: false,
//         message: "noOfPackages already up to date.",
//         newState,
//       };
//     }

//     const updatedState = { ...newState, [targetKey]: sum };

//     return {
//       type: "success",
//       result: true,
//       message: `${targetKey} set to ${sum}${selectedOnly ? " (selected rows only)" : ""}.`,
//       newState: updatedState,
//       submitNewState: updatedState,
//       values: {}, // clear transient values if your pipeline expects it
//     };
//   } catch (e) {
//     console.error("rollupNoOfPackages error:", e);
//     return {
//       type: "error",
//       result: false,
//       message: "Failed to roll up noOfPackages.",
//       newState,
//     };
//   }
// };


// export const setToDate = (obj) => {
//   const { newState = {}, values = {} } = obj || {};

//   try {
//     const charges = Array.isArray(newState?.tblInvoiceCharge)
//       ? newState.tblInvoiceCharge
//       : [];

//     if (charges.length === 0) {
//       return {
//         type: "info",
//         result: false,
//         message: "No charges found.",
//         newState,
//       };
//     }

//     const isEmptyDate = (v) =>
//       v == null ||
//       v === "" ||
//       String(v).startsWith("0000-00-00");

//     const isEmptyNumber = (v) =>
//       v == null || v === "" || Number(v) === 0 || Number.isNaN(Number(v));

//     // --------------------------------------------------------
//     // ✅ FIND FIRST SOURCE VALUES (values → child → parent)
//     // --------------------------------------------------------

//     const getSource = (field) => {
//       // 1) If value passed in `values[field]`
//       if (!isEmptyDate(values[field]) && field === "toDate") return values[field];
//       if (!isEmptyNumber(values[field]) && field !== "toDate") return values[field];

//       // 2) Search children first
//       for (const ch of charges) {
//         const details = Array.isArray(ch.tblInvoiceChargeDetails)
//           ? ch.tblInvoiceChargeDetails
//           : [];
//         for (const d of details) {
//           if (field === "toDate" && !isEmptyDate(d.toDate)) return d.toDate;
//           if (field !== "toDate" && !isEmptyNumber(d[field])) return d[field];
//         }
//       }

//       // 3) Search parent rows
//       for (const ch of charges) {
//         if (field === "toDate" && !isEmptyDate(ch.toDate)) return ch.toDate;
//         if (field !== "toDate" && !isEmptyNumber(ch[field])) return ch[field];
//       }

//       return null;
//     };

//     const srcToDate = getSource("toDate");
//     const srcNoOfDays = getSource("noOfDays");
//     const srcRate = getSource("rate");

//     if (isEmptyDate(srcToDate) && srcNoOfDays == null && srcRate == null) {
//       return {
//         type: "warning",
//         result: false,
//         message: "No source values found for toDate, noOfDays, or rate.",
//         newState,
//       };
//     }

//     // --------------------------------------------------------
//     // ✅ UPDATE ALL PARENT + CHILD ROWS
//     // --------------------------------------------------------

//     let changed = 0;

//     const updatedCharges = charges.map((ch) => {
//       let updated = { ...ch };
//       let rowChanged = false;

//       // parent fills
//       if (!isEmptyDate(srcToDate) && isEmptyDate(updated.toDate)) {
//         updated.toDate = srcToDate;
//         rowChanged = true;
//       }
//       if (srcNoOfDays != null && isEmptyNumber(updated.noOfDays)) {
//         updated.noOfDays = srcNoOfDays;
//         rowChanged = true;
//       }
//       if (srcRate != null && isEmptyNumber(updated.rate)) {
//         updated.rate = srcRate;
//         rowChanged = true;
//       }

//       // child fills
//       const details = Array.isArray(ch.tblInvoiceChargeDetails)
//         ? ch.tblInvoiceChargeDetails
//         : [];

//       if (details.length > 0) {
//         let detailsChanged = false;

//         const updatedDetails = details.map((d) => {
//           let dd = { ...d };
//           let dChanged = false;

//           if (!isEmptyDate(srcToDate) && isEmptyDate(dd.toDate)) {
//             dd.toDate = srcToDate;
//             dChanged = true;
//           }
//           if (srcNoOfDays != null && isEmptyNumber(dd.noOfDays)) {
//             dd.noOfDays = srcNoOfDays;
//             dChanged = true;
//           }
//           if (srcRate != null && isEmptyNumber(dd.rate)) {
//             dd.rate = srcRate;
//             dChanged = true;
//           }

//           if (dChanged) detailsChanged = true;
//           return dd;
//         });

//         if (detailsChanged) {
//           updated.tblInvoiceChargeDetails = updatedDetails;
//           rowChanged = true;
//         }
//       }

//       if (rowChanged) changed++;
//       return updated;
//     });

//     if (changed === 0) {
//       return {
//         type: "info",
//         result: false,
//         message: "All values were already filled.",
//         newState,
//       };
//     }

//     const updatedState = { ...newState, tblInvoiceCharge: updatedCharges };

//     return {
//       type: "success",
//       result: true,
//       message: `Filled toDate/noOfDays/rate in ${changed} row(s).`,
//       newState: updatedState,
//       submitNewState: updatedState,
//       values: {},
//     };
//   } catch (err) {
//     console.error("ERROR:", err);
//     return {
//       type: "error",
//       result: false,
//       message: "Failed to update toDate, noOfDays and rate.",
//       newState,
//     };
//   }
// };


export const setToDate = (obj) => {
  const { newState = {}, values = {} } = obj || {};

  try {
    const charges = Array.isArray(newState?.tblInvoiceCharge)
      ? newState.tblInvoiceCharge
      : [];

    if (charges.length === 0) {
      return {
        type: "info",
        result: false,
        message: "No charges found.",
        newState,
      };
    }

    const isEmptyDate = (v) =>
      v == null ||
      v === "" ||
      String(v).startsWith("0000-00-00");

    const isEmptyNumber = (v) =>
      v == null || v === "" || Number.isNaN(Number(v));

    // --------------------------------------------------------
    // ✅ FIND FIRST SOURCE VALUES (values → child → parent)
    // --------------------------------------------------------

    const getSource = (field) => {
      // 1) Check values[field]
      if (!isEmptyDate(values[field]) && field === "toDate") return values[field];
      if (!isEmptyNumber(values[field]) && field !== "toDate") return values[field];

      // 2) CHILD rows
      for (const ch of charges) {
        const details = Array.isArray(ch.tblInvoiceChargeDetails)
          ? ch.tblInvoiceChargeDetails
          : [];

        for (const d of details) {
          if (field === "toDate" && !isEmptyDate(d.toDate)) return d.toDate;
          if (field !== "toDate" && !isEmptyNumber(d[field])) return d[field];
        }
      }

      // 3) PARENT rows
      for (const ch of charges) {
        if (field === "toDate" && !isEmptyDate(ch.toDate)) return ch.toDate;
        if (field !== "toDate" && !isEmptyNumber(ch[field])) return ch[field];
      }

      return null;
    };

    const srcToDate = getSource("toDate");
    const srcNoOfDays = getSource("noOfDays");
    const srcAmountHc = getSource("amountHc"); // ✅ replaced rate → amountHc

    if (isEmptyDate(srcToDate) && srcNoOfDays == null && srcAmountHc == null) {
      return {
        type: "warning",
        result: false,
        message: "No source values found for toDate, noOfDays, or amountHc.",
        newState,
      };
    }

    // --------------------------------------------------------
    // ✅ UPDATE ALL PARENT + CHILD ROWS
    // --------------------------------------------------------

    let changed = 0;

    const updatedCharges = charges.map((ch) => {
      let updated = { ...ch };
      let rowChanged = false;

      // ✅ Fill parent fields
      if (!isEmptyDate(srcToDate) && isEmptyDate(updated.toDate)) {
        updated.toDate = srcToDate;
        rowChanged = true;
      }
      if (srcNoOfDays != null && isEmptyNumber(updated.noOfDays)) {
        updated.noOfDays = srcNoOfDays;
        rowChanged = true;
      }
      if (srcAmountHc != null && isEmptyNumber(updated.amountHc)) {
        updated.amountHc = srcAmountHc;
        rowChanged = true;
      }

      // ✅ Fill child fields
      const details = Array.isArray(ch.tblInvoiceChargeDetails)
        ? ch.tblInvoiceChargeDetails
        : [];

      if (details.length > 0) {
        let detailsChanged = false;

        const updatedDetails = details.map((d) => {
          let dd = { ...d };
          let dChanged = false;

          if (!isEmptyDate(srcToDate) && isEmptyDate(dd.toDate)) {
            dd.toDate = srcToDate;
            dChanged = true;
          }
          if (srcNoOfDays != null && isEmptyNumber(dd.noOfDays)) {
            dd.noOfDays = srcNoOfDays;
            dChanged = true;
          }
          if (srcAmountHc != null && isEmptyNumber(dd.amountHc)) {
            dd.amountHc = srcAmountHc;
            dChanged = true;
          }

          if (dChanged) detailsChanged = true;
          return dd;
        });

        if (detailsChanged) {
          updated.tblInvoiceChargeDetails = updatedDetails;
          rowChanged = true;
        }
      }

      if (rowChanged) changed++;
      return updated;
    });

    if (changed === 0) {
      return {
        type: "info",
        result: false,
        message: "All values were already filled.",
        newState,
      };
    }

    const updatedState = { ...newState, tblInvoiceCharge: updatedCharges };

    return {
      type: "success",
      result: true,
      message: `Filled toDate/noOfDays/amountHc in ${changed} row(s).`,
      newState: updatedState,
      submitNewState: updatedState,
      values: {},
    };
  } catch (err) {
    console.error("ERROR:", err);
    return {
      type: "error",
      result: false,
      message: "Failed to update toDate, noOfDays and amountHc.",
      newState,
    };
  }
};


