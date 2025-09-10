"use client";
/* eslint-disable */
import React, { useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import styles from "@/components/common.module.css";
// import CustomeInputFields from '@/components/Inputs/customeInputFields'/
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Button,
} from "@mui/material";
import { useState } from "react";
import {
  dynamicDropDownFieldsData,
  FormControlOfToClinetCode,
  clientCodeDropDown,
  copyFormControl,
} from "@/services/auth/FormControl.services.js";
import { customTextFieldStyles } from "@/app/globalCss";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
const CustomeTextField = styled(TextField)({
  ...customTextFieldStyles,
});
function CopyFormControl() {
  const [value, setValue] = useState({});
  const [formControlOtions, setformControlOtions] = useState([]);
  const [ToCilentformControl, setToCilentFormControl] = useState([]);
  const [clientCode, setclientCode] = useState([]);
  useEffect(() => {
    fetchDropDown();
  }, []);
  useEffect(() => {
    fetchToCilentFormControl();
  }, [value.toClientCode]);

  async function fetchDropDown() {
    let dataa = await dynamicDropDownFieldsData({
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblFormcontrol",
      referenceColumn: "menuID",
      dropdownFilter: ``,
      search: "",
      pageNo: 1,
      value: "66adc521e1ce56bc29af1f12",
    });
    if (dataa) {
      console.log("formControlOtions", dataa);
      setformControlOtions(dataa.data);
    }
    let clientCode = await clientCodeDropDown();
    if (clientCode) {
      setclientCode(clientCode.data);
    }
  }
  async function fetchToCilentFormControl() {
    let dataa = await FormControlOfToClinetCode({
      clientCode: value?.toClientCode,
    });
    if (dataa) {
      console.log("ToCilentformControl", dataa);
      setToCilentFormControl(dataa.data);
    }
  }

  const handleChange = (event) => {
    setValue((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };
  const handleSubmit = async () => {
    let submit = await copyFormControl(value);
    if (submit.success == true) {
      setValue({
        toClientCode: "",
        formControlId: "",
        toFormControlId: "",
        toFormControlName: "",
      });
      toast.success(submit.message);
      window.location.reload();

      // setcopyModalShow(false)
    } else {
      toast.error(submit.message);
    }
  };
  return (
    <div className={`h-screen relative text-black py-4 gap-4`}>
      <form
        className={`flex flex-row w-full h-fit gap-4`}
        onSubmit={handleSubmit}
      >
        <Tooltip title="To Client Code">
          <FormControl variant="outlined" className="w-[12rem] h-4">
            <InputLabel id="demo-simple-select-label">
              To Client Code
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
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
              label="Vendor"
              placeholder="Form Control"
              value={value?.toClientCode}
              name="toClientCode"
              onChange={handleChange}
            >
              {clientCode.map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
        <Tooltip title="Form Control">
          <FormControl variant="outlined" className="w-[12rem] h-4">
            <InputLabel id="demo-simple-select-label-1">
              Form Control
            </InputLabel>
            <Select
              labelId="demo-simple-select-label-1"
              id="demo-simple-select-1"
              label="Vendor"
              placeholder="Form Control"
              value={value.formControlId}
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
              name="formControlId"
              onChange={handleChange}
            >
              {formControlOtions.map((item) => (
                <MenuItem key={item.value} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
        <Tooltip title="To Form Control">
          <FormControl variant="outlined" className="w-[12rem] h-4">
            <InputLabel id="demo-simple-select-label-2">
              To Form Control
            </InputLabel>
            <Select
              labelId="demo-simple-select-label-2"
              id="demo-simple-select-2"
              label="Vendor"
              placeholder="Form Control"
              value={value.toFormControlId}
              name="toFormControlId"
              onChange={handleChange}
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
              {ToCilentformControl.map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Tooltip>
        <Tooltip title="New Name">
          <FormControl variant="outlined" className="w-[12rem] h-4">
            {/* <InputLabel id="demo-simple-select-label-2">Vendor</InputLabel> */}
            <CustomeTextField
              autoComplete="off"
              variant="outlined"
              size="small"
              name="toFormControlName"
              label="New Name"
              value={value?.toFormControlName}
              onChange={handleChange}
              className={` w-[12rem]  ${styles.inputField} h-9`}
              InputLabelProps={{
                classes: {
                  asterisk: "required-asterisk",
                },
              }}
            />
          </FormControl>
        </Tooltip>
      </form>
      <div className="flex flex-row justify-end items-end w-full">
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={() => {
            handleSubmit();
          }}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}

export default CopyFormControl;
