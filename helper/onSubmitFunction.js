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