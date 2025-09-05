"use client";
/* eslint-disable */

import moment from "moment";
import { getUserDetails } from "./userDetails";

export const isDateFormat = (dateString) => {
  const { dateFormat } = getUserDetails();

  const DateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (DateOnlyRegex.test(dateString)) {
    if (!dateFormat || dateFormat === "") {
      return moment(dateString).format("DD-MM-YYYY");
    } else {
      return moment(dateString).format(dateFormat).toUpperCase();
    }
  }
  return dateString ? dateString.toString() : "";
};
