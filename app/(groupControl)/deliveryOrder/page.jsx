'use client';
/* eslint-disable */
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import styles from "@/components/common.module.css";
import Button from "@mui/material/Button";
import Select from "react-select";
import { toast } from "react-toastify";
import MenuItem from "@mui/material/MenuItem"; // ✅ REQUIRED for dropdown options
import {
    customTextFieldStyles,
    textInputStyle,
} from "@/app/globalCss.js";
import LightTooltip from "@/components/Tooltip/customToolTip";
import { styled } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import {
    fetchReportData
} from "@/services/auth/FormControl.services.js";
import { getUserDetails } from "@/helper/userDetails";

export default function DeliveryOrder() {
    // const router = useRouter();
    const [selectedOption, setSelectedOption] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const [blNo, setBlNo] = useState(null);
    const [blOptions, setBlOptions] = useState([]); // Dynamically set options
    const customStyles = (placeholderText) => ({
        control: (provided, state) => ({
            ...provided,
            minHeight: '28px', // Reduce height here
            height: '28px',
            padding: '0 2px',
            fontSize: '12px',
            borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#3b82f6',
            },
        }),
        valueContainer: (provided) => ({
            ...provided,
            padding: '0 6px',
        }),
        input: (provided) => ({
            ...provided,
            margin: 0,
            padding: 0,
        }),
        indicatorsContainer: (provided) => ({
            ...provided,
            height: '28px',
        }),
        dropdownIndicator: (provided) => ({
            ...provided,
            padding: '2px',
        }),
        clearIndicator: (provided) => ({
            ...provided,
            padding: '2px',
        }),
        placeholder: (provided) => ({
            ...provided,
            fontSize: '9px',
        }),
    });


    const CustomeTextField = styled(TextField)({
        ...customTextFieldStyles,
    });

    const buttonStyle = {
        fontSize: "12px",
        backgroundColor: "#0766AD",
        color: "white",
        padding: "2px 12px",
        textTransform: "none",
        "&:hover": {
            backgroundColor: "#2B84D2",
        },
        marginBottom: "10px",
    };

    const handleChange = (selectedOption) => {
        setBlNo(selectedOption);
        console.log("Selected BL No:", selectedOption.value);
    };

    const handleGoClick = () => {
        if (blNo) {
            toast.success(`GO clicked with: ${blNo.value}`);
        } else {
            toast.warning("Please select a BL No first.");
        }
    };
  const { companyId, clientId, branchId } = getUserDetails();

    const blNoFetch = async () => {
        const request = {
            columns: "id,mblNo,hblNo",
            tableName: "tblBl",
            whereCondition: `status=1 AND clientId =${clientId}`,
            clientIdCondition: `status = 1 FOR JSON PATH`,
        };

        const response = await fetchReportData(request);
        const data = response.data;
        if (data.length > 0) {
            const mappedOptions = data
                .filter((item) => item?.mblNo)
                .map((item) => ({
                    label: item.mblNo,
                    value: item.id,
                }));
            setBlOptions(mappedOptions);
        }
    };

    useEffect(() => {
        blNoFetch();
    }, []);

    const handleRedirection = () => {
        if (!selectedOption) {
            toast.error('Please Select the Bl Record First');
            return
        }

        console.log('selectedOption =>', selectedOption?.value)
        if (typeof window !== 'undefined') {
            window.location.href = `/formControl/addEdit/%7B"id"%3A${selectedOption?.value}%2C"menuName"%3A1335%2C"isCopy"%3Afalse%2C"isView"%3Afalse%7D`;
        }
    };
    return (
        <div className="p-4 relative" >
            <h1 className="text-xl font-bold mb-4">Delivery Order</h1>
            <div className="relative w-48 h-20">
                <label
                    className={`absolute left-2 px-1 transition-all bg-white duration-200 text-sm ${isFocused || selectedOption ? "-top-2 text-xs text-blue-600" : "top-2.5 text-gray-500"
                        }`}
                    style={{ pointerEvents: "none", backgroundColor: "white" }}
                >
                    {/* BL NO */}
                </label>
                <Select
                    placeholder="BL NO"
                    options={blOptions}
                    value={selectedOption}
                    onChange={(option) => setSelectedOption(option)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    isClearable
                    className={`w-[12rem] ${styles.inputField}`}
                    styles={customStyles()}
                />
            </div>


            {/* GO Button */}
            <button
                onClick={handleRedirection}
                className={`px-4 text-[12px] py-2 ${styles.bgPrimaryColorBtn} flex items-center justify-center rounded-[5px] shadow-custom w-24 h-[27px] pb-20px mb-3`}
            >
                Go
            </button>



        </div>
    );
}
