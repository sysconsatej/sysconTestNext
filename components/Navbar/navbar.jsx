"use client";
/* eslint-disable */
import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar, Typography } from "@material-tailwind/react";
import { fetchDataAPI } from "@/services/auth/FormControl.services";
import { logoutBtn } from "@/assets/index.jsx";
import { homeLogo } from "@/assets/index.jsx";
import { homeHoverLogo } from "@/assets/index.jsx";
import {
  sysconLogo,
  calendarIcon,
  officeIcon,
  userIcon,
  userIconHover,
  calendarIconHover,
  officeIconHover,
  // solLogo,
  // winLogo,
  ndlLogo,
  logoutBtnHover,
} from "@/assets";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import Cookies from "js-cookie";
import {
  navbarStyles,
  CompanyLogostyles1,
  middleDataStyles,
  menuListStyles,
  menuStyles,
} from "@/app/globalCss.js";
import { decrypt, encrypt } from "@/helper/security";
import styles from "@/components/common.module.css";
// import { useThemeProvider } from "@/context/themeProviderDataContext";
import UseSwitchesCustom from "@/components/ThemeToggle/toggleSwitch";
import Select, { components } from "react-select";
import { dynamicDropDownFieldsData } from "@/services/auth/FormControl.services";
import PropTypes from "prop-types";
import { debounce } from "@/helper/debounceFile";
import { userLogout } from "@/services/auth/Auth.services";
import Link from "next/link";
import { LegendToggleRounded } from "@mui/icons-material";
import { set } from "lodash";
import { fetchReportData } from "@/services/auth/FormControl.services";
import { Avatar } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;
import { loginIcon } from "@/assets";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import Tooltip from "@mui/material/Tooltip";

// let sysconImg =
//   "https://expresswayshipping.com/sql-api/Sql/api/images/CML/syscon_logo20241022091527030.png";

const customStyles = {
  menu: (base) => ({
    ...base,
    ...menuStyles,
    width: "10rem",
  }),
  menuPortal: (provided) => ({
    ...provided,
    backgroundColor: "var(--page-bg-color)",
    zIndex: 9999, // Set zIndex to a very high value
  }),
  option: (provided) => ({
    ...provided,
    backgroundColor: "var(--accordian-summary-bg)",
    color: "var(--table-text-color)", // Normal text color
    ":hover": {
      ...provided[":hover"],
      backgroundColor: "var(--accordion-summary-bg)", // Background color on hover
    },
  }),
  menuList: () => ({
    ...menuListStyles,
  }),

  control: (base, { isDisabled }) => ({
    ...base,
    minHeight: "27px",
    borderWidth: 0,
    borderColor: isDisabled ? "#B2BAC2" : "#E0E3E7",
    // backgroundColor: isDisabled ? "white" : "white",
    backgroundColor: "var(--navbarBg)",
    boxShadow: "none",
    // borderRadius: "4px",
    // "&:hover": { borderColor: "#B2BAC2" },
    color: "#00000099",
    cursor: "text !important",
    // width: "12rem",
    width: "fit-content",
    height: "27px ",
    zindex: 999,
    fontSize: "10px",
    position: "relative",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    display: "none",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#00000099",
    margin: 0,
    padding: 0,
    fontSize: "10px",
    position: "relative",
    bottom: "2px",
    // display: !showLabel ? "inline" : "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    "& svg": {
      width: "12px !important", // Adjust the size of the arrow icon
      height: "12px !important", // Adjust the size of the arrow icon
    },
    cursor: "pointer !important",
    paddingLeft: "0px",
  }),

  clearIndicator: (base) => ({
    ...base,
    "& svg": {
      width: "12px !important", // Adjust the size of the clear icon
      height: "12px !important", // Adjust the size of the clear icon
      cursor: "pointer !important",
    },
  }),

  singleValue: (base) => ({
    ...base,
    // color: "#FFFFFF",
    color: "var(--navbarTextColor)",
    fontSize: "var(--navbarFontSize)",
    fontWeight: "var(--navbarFontWeight)",
    fontFamily: "var(--commonFontFamily)",
    overflow: "visible",
    whiteSpace: "wrap",
  }),
  // Other custom styles can go here
  valueContainer: (provided) => ({
    ...provided,
    padding: "2px 2px",
  }),
  input: (base) => ({
    ...base,
    color: "var(--navbarTextColor)", // Set color of typed text to "var(--table-text-color)"
    fontFamily: "var(--commonFontFamily)",
  }),
};

NavbarPage.propTypes = {};

export default function NavbarPage() {
  const { push } = useRouter();
  // const { companyId, financialYear } = useThemeProvider();
  const [companyData, setCompanyData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [financialYearData, setFinancialYearData] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [Controller, setController] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [companyImageUrl, setCompanyImageUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [openAlertModal, setOpenAlertModal] = useState(false);
  // const [selectedLogo, setSelectedLogo] = useState("");
  const yearDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const prevPageNo = useRef();
  let callInputChangeFunc = true;
  const router = useRouter();
  const dispatch = useDispatch();
  const isRedirected = useSelector((state) => state?.counter?.isRedirection);
  const [redirected, setRedirected] = useState(true);

  useEffect(() => {
    console.log("isRedirected is now", isRedirected);
    setRedirected(isRedirected);
  }, [isRedirected]);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const userDetails = JSON.parse(decrypt(storedUserData));
      setUserDetails(userDetails);
      setSelectedCompany(userDetails[0].defaultCompanyId);
      setSelectedBranch(userDetails[0].defaultBranchId);
      setSelectedFinancialYear(userDetails[0].defaultFinYearId);
      setProfileImage(backendUrl + userDetails[0].profilePhoto);
      setCompanyImageUrl(backendUrl + userDetails[0].companyLogo);
    }
    // Function to log all keys and their values from session storage
    function getAllSessionStorage() {
      let items = []; // Array to store key-value pairs
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        items.push({ key, value });
      }
      return items;
    }

    // Retrieve all session storage items
    const sessionStorageItems = getAllSessionStorage();
    let filterObject = null;
    if (sessionStorageItems.length > 0) {
      // Convert array of key-value pairs to an object
      filterObject = sessionStorageItems.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
      }, {});

      // same as switch case
      setSelectedCompany(filterObject?.companyId);
      setSelectedBranch(filterObject?.branchId);
      setSelectedFinancialYear(filterObject?.financialYear);
    }

    Promise.all([
      fetchCompanyData(pageNo, "", filterObject?.companyId),
      fetchBranchData(pageNo, "", filterObject?.branchId),
      fetchFinancialYearData(pageNo, "", filterObject?.financialYear),
    ])
      .then(([companyData, branchData, financialYeardData]) => {
        setCompanyData(companyData);
        setBranchData(branchData);
        setFinancialYearData(financialYeardData);
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
      });

    return () => {
      Controller?.abort();
    }; // Cleanup function to abort ongoing requests when component unmounts
  }, []);

  async function fetchCompanyData(pageNo, inputValueForDataFetch, valueSearch) {
    if (Controller) {
      Controller.abort();
    }
    const abortController = new AbortController();
    setController(abortController);

    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblCompany", // name  field.referenceTable
      referenceColumn: "name", // tblCompany  field.referenceColumn
      dropdownFilter: " and ownCompany='y' and clientId = " + clientId, // field.dropdownFilter,
      search: inputValueForDataFetch,
      pageNo: inputValueForDataFetch.length > 0 ? 1 : pageNo,
      value: valueSearch,
    };
    try {
      const apiResponse = await dynamicDropDownFieldsData(
        requestData,
        Controller
      );
      if (pageNo == 1 || inputValueForDataFetch.length > 0) {
        setCompanyData(apiResponse.data);
      } else {
        setCompanyData((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          ...apiResponse.data,
        ]);
      }
      return apiResponse.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }
  async function fetchBranchData(pageNo, inputValueForDataFetch, valueSearch) {
    if (Controller) {
      Controller.abort();
    }
    const abortController = new AbortController();
    setController(abortController);

    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;
    const companyId = userData[0].defaultCompanyId;

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblCompanyBranch", // name  field.referenceTable
      referenceColumn: "name", // tblCompany  field.referenceColumn
      dropdownFilter:
        " and clientId = " + clientId + " and companyId =" + companyId, // field.dropdownFilter,
      search: inputValueForDataFetch,
      pageNo: inputValueForDataFetch.length > 0 ? 1 : pageNo,
      value: null, //valueSearch,
    };

    try {
      const apiResponse = await dynamicDropDownFieldsData(
        requestData,
        Controller
      );
      if (pageNo == 1 || inputValueForDataFetch.length > 0) {
        setBranchData(apiResponse.data);
      } else {
        setBranchData((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          ...apiResponse.data,
        ]);
      }
      return apiResponse.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  async function fetchFinancialYearData(
    pageNo,
    inputValueForDataFetch,
    valueSearch
  ) {
    if (Controller) {
      Controller.abort();
    }
    const abortController = new AbortController();
    setController(abortController);

    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const userData = JSON.parse(decryptedData);
    const clientId = userData[0].clientId;

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblFinancialYear", // financialYear  field.referenceTable
      referenceColumn: "financialYear", // tblFinancialYear  field.referenceColumn
      dropdownFilter: " and clientId = " + clientId, // field.dropdownFilter,
      search: inputValueForDataFetch,
      pageNo: inputValueForDataFetch.length > 0 ? 1 : pageNo,
      value: null, // valueSearch,
    };

    try {
      const apiResponse = await dynamicDropDownFieldsData(
        requestData,
        Controller
      );

      if (pageNo == 1 || inputValueForDataFetch.length > 0) {
        setFinancialYearData(apiResponse.data);
      } else {
        setFinancialYearData((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          ...apiResponse.data,
        ]);
      }

      return apiResponse.data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return null;
    }
  }

  // Generic handler for select values
  const handleSelect = (selectedValue, setState, selectedBy) => {
    if (selectedValue && selectedValue.value !== undefined) {
      setState(selectedValue.value);
      // Storing data in session storage
      sessionStorage.setItem(selectedBy, selectedValue.value);
      // window.location.reload();
    } else if (selectedValue.length === 0) {
      setState(null);
    } else {
      console.log("Invalid selection or value undefined");
    }
  };

  const handleChangeValue = (value, selectedBy) => {
    const dropValue = value ? value[0] : [];
    switch (selectedBy) {
      case "companyId":
        handleSelect(dropValue, setSelectedCompany, selectedBy);
        break;
      case "financialYear":
        handleSelect(dropValue, setSelectedFinancialYear, selectedBy);
        break;
      case "branchId":
        handleSelect(dropValue, setSelectedBranch, selectedBy);
        break;
      default:
        console.log("Unhandled select type:", selectedBy);
        break;
    }
  };

  async function handleLogout() {
    const storedUserData = localStorage.getItem("loginCredentials");
    let tokenVal = Cookies.get("token");
    const response = await userLogout(tokenVal);
    if (response.success === true) {
      localStorage.clear();
      Cookies.remove("token");
      if (storedUserData) {
        const loginCredentials = JSON.parse(decrypt(storedUserData));
        localStorage.setItem(
          "loginCredentials",
          encrypt(JSON.stringify(loginCredentials))
        );
      }
      push("/login");
    }
  }

  async function handleDashboard() {
    push("/dashboard");
  }

  // Debounced fetch call
  const debouncedFetch = useCallback(
    debounce((searchValue) => {
      // Your fetch logic here
      // console.log("Fetching data for:", searchValue);

      fetchCompanyData(pageNo, searchValue);
    }, 50),
    []
  ); // 50ms debounce time

  useEffect(() => {
    if (pageNo > 1) {
      // Check if the parameters have changed in a meaningful way
      if (prevPageNo.current !== pageNo) {
        fetchCompanyData(pageNo, "");
        fetchBranchData(pageNo, "");
        fetchFinancialYearData(pageNo, "");
      }
      // Update refs after fetch
      prevPageNo.current = pageNo;
    }
  }, [pageNo]);

  const handleInputChange = (newInputValue) => {
    // console.log("newInputValue ", newInputValue);
    debouncedFetch(newInputValue);
  };

  function setRedirectedFn() {
    setOpenAlertModal((pre) => !pre);
    if (redirected == true) {
      router.push("/UserProfile");
    }
  }

  function setRedirectedFnLogOut() {
    setOpenAlertModal((pre) => !pre);
    if (redirected == true) {
      router.push("/UserProfile");
    }
  }

  const handleClose = () => setOpenAlertModal((prev) => !prev);

  const handleOk = () => {
    setOpenAlertModal((prev) => !prev);
    setRedirected(true);
    router.push("/UserProfile");
  };

  const CustomMenuList = (props) => {
    const { pageNo, setPageNo, setScrollPosition, scrollPosition } = props; // Assuming these are passed as props now
    const menuListRef = useRef(null);
    // Adding a flag to control when to adjust scroll
    const localScrollPosition = useRef(scrollPosition); // To track scroll position locally

    useEffect(() => {
      const menuList = menuListRef.current;
      if (menuList) {
        const onScroll = () => {
          const { scrollHeight, scrollTop, clientHeight } = menuList;
          localScrollPosition.current = scrollTop;
          // const isBottom = scrollHeight - scrollTop === clientHeight;
          // if (isBottom && scrollPosition !== scrollTop) {
          //   setScrollPosition(scrollTop);
          //   setPageNo((prevPageNo) => prevPageNo + 1);
          // }
          const threshold = 10; // You can adjust the threshold value as needed
          const isNearBottom =
            scrollHeight - scrollTop <= clientHeight + threshold;

          if (isNearBottom && scrollPosition !== scrollTop) {
            setScrollPosition(scrollTop);
            setPageNo((prevPageNo) => prevPageNo + 1);
          }
        };

        menuList.addEventListener("scroll", onScroll);
        return () => {
          menuList.removeEventListener("scroll", onScroll);
        };
      }
    }, []); // Updated the dependencies

    useEffect(() => {
      const menuList = menuListRef.current;

      if (menuList && pageNo > 1) {
        // Use requestAnimationFrame to ensure the DOM updates are complete
        requestAnimationFrame(() => {
          // menuList.scrollTop = scrollPosition;
          menuList.scrollTop = localScrollPosition.current;
        });
      }
    }, [pageNo]); // Added adjustScrollNeeded as a dependency

    return (
      <components.MenuList {...props} innerRef={menuListRef}>
        {props.children}
      </components.MenuList>
    );
  };

  CustomMenuList.propTypes = {
    props: PropTypes.any,
    selectProps: PropTypes.any,
    children: PropTypes.any,
    pageNo: PropTypes.any,
    setPageNo: PropTypes.any,
    setScrollPosition: PropTypes.any,
    scrollPosition: PropTypes.any,
  };

  return (
    // Navbar Container
    <Navbar
      className={`${navbarStyles} shadow-none rounded-sm bg-[var(--navbarBg)]`}
    >
      <div className={CompanyLogostyles1}>
        {/* Left Icon */}
        <div className="hidden lg:flex items-center justify-start ">
          <Image
            src={loginIcon}
            alt="sysconLogo"
            className="w-auto h-[40px] object-contain"
            priority
          />
        </div>

        {/* Middle Data */}
        <div className={middleDataStyles}>
          <ul className="flex flex-row flex-nowrap items-center justify-between mb-4 lg:mb-0 w-full ">
            <div className="inline-flex items-center relative left-4">
              <Typography
                as="li"
                variant="small"
                color="blue-gray"
                className="flex items-center gap-x-1 p-1 font-medium"
              >
                <a
                  onClick={() => {
                    setRedirectedFn();
                  }}
                  className="flex items-center"
                  style={{ cursor: "pointer" }} // Add cursor style to indicate it's clickable
                >
                  <Avatar
                    src={profileImage || ""}
                    sx={{
                      width: 25,
                      height: 25,
                      borderRadius: "40%",
                    }}
                  />
                </a>
                <a
                  onClick={() => {
                    setRedirectedFn();
                  }}
                  className={` text-[var(--navbarTextColor)] font-[var(--navbarFontWeight)]  flex items-center pl-0 mt-1 `}
                  style={{
                    cursor: "pointer",
                    fontSize: "var(--navbarFontSize)",
                    fontFamily: "var(--commonFontFamily)",
                  }} // Add cursor style to indicate it's clickable
                >
                  {userDetails && userDetails?.[0]?.name}
                </a>
              </Typography>
            </div>

            <div className="flex items-center">
              <div
                ref={cityDropdownRef}
                className="relative inline-block text-left"
              >
                <div className="inline-flex items-center relative">
                  <HoverIcon
                    defaultIcon={officeIcon}
                    hoverIcon={officeIconHover}
                    altText={"officeIcon"}
                    className={"relative left-2 "}
                  />
                  <Select
                    id={1}
                    styles={customStyles}
                    value={
                      companyData?.find(
                        (item) => item.value === parseInt(selectedCompany)
                      ) || null
                    }
                    isClearable={false}
                    backspaceRemovesValue={false}
                    onChange={(newValue) => {
                      callInputChangeFunc = false;
                      handleChangeValue(
                        newValue ? [newValue] : null,
                        "companyId"
                      );
                      callInputChangeFunc = true;
                    }}
                    options={companyData}
                    components={{
                      MenuList: (props) => (
                        <CustomMenuList
                          {...props}
                          pageNo={pageNo}
                          setPageNo={setPageNo}
                          setScrollPosition={setScrollPosition}
                          scrollPosition={scrollPosition}
                        />
                      ),
                    }}
                    noOptionsMessage={() =>
                      companyData?.length === 0
                        ? "No records found"
                        : "Loading..."
                    }
                    onMenuOpen={() => {
                      setPageNo(1);
                    }}
                    onInputChange={(value, e) => {
                      if (callInputChangeFunc && e.action === "input-change") {
                        handleInputChange(value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Branch Dropdown Menu */}
            <div className="flex items-center ">
              <div
                ref={cityDropdownRef}
                className="relative inline-block text-left"
              >
                <div className="inline-flex items-center relative">
                  <HoverIcon
                    defaultIcon={officeIcon}
                    hoverIcon={officeIconHover}
                    altText={"officeIcon"}
                    className={"relative left-2 "}
                  />
                  <Select
                    id={1}
                    styles={customStyles}
                    value={
                      branchData?.find(
                        (item) => item.value === parseInt(selectedBranch)
                      ) || null
                    }
                    isClearable={false}
                    backspaceRemovesValue={false}
                    onChange={(newValue) => {
                      callInputChangeFunc = false;
                      handleChangeValue(
                        newValue ? [newValue] : null,
                        "branchId"
                      );
                      callInputChangeFunc = true;
                    }}
                    options={branchData}
                    components={{
                      MenuList: (props) => (
                        <CustomMenuList
                          {...props}
                          pageNo={pageNo}
                          setPageNo={setPageNo}
                          setScrollPosition={setScrollPosition}
                          scrollPosition={scrollPosition}
                        />
                      ),
                    }}
                    noOptionsMessage={() =>
                      branchData?.length === 0
                        ? "No records found"
                        : "Loading..."
                    }
                    onMenuOpen={() => {
                      setPageNo(1);
                    }}
                    onInputChange={(value, e) => {
                      if (callInputChangeFunc && e.action === "input-change") {
                        handleInputChange(value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Year Dropdown Menu */}
            <div ref={yearDropdownRef} className="flex items-center ml-2">
              <div className="relative inline-block text-left">
                <div className="inline-flex items-center">
                  <HoverIcon
                    defaultIcon={calendarIcon}
                    hoverIcon={calendarIconHover}
                    altText={"calendarIcon"}
                    className={"relative left-2 pl-0"}
                  />
                  <Select
                    id={2}
                    styles={customStyles}
                    isClearable={false}
                    backspaceRemovesValue={false}
                    value={
                      financialYearData?.find(
                        (item) => item.value === parseInt(selectedFinancialYear)
                      ) || null
                    }
                    onChange={(newValue) => {
                      handleChangeValue(
                        newValue ? [newValue] : null,
                        "financialYear"
                      );
                    }}
                    options={financialYearData}
                    components={{
                      MenuList: (props) => (
                        <CustomMenuList
                          {...props}
                          pageNo={pageNo}
                          setPageNo={setPageNo}
                          setScrollPosition={setScrollPosition}
                          scrollPosition={scrollPosition}
                        />
                      ),
                    }}
                    noOptionsMessage={() =>
                      financialYearData?.length === 0
                        ? "No records found"
                        : "Loading..."
                    }
                    onMenuOpen={() => {
                      setPageNo(1);
                    }}
                    onInputChange={(value, e) => {
                      if (callInputChangeFunc && e.action === "input-change") {
                        handleInputChange(value);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center ml-4">
              <div
                className={`flex items-center gap-1 relative cursor-pointer text-[12px] ${styles.txtColorDark}`}
                onClick={() => handleDashboard()}
              >
                <HoverIcon style={{ margin: "0px", padding: "0px",  }}
                  defaultIcon={homeLogo}
                  hoverIcon={homeHoverLogo}
                  altText={"Home"}
                  title={"Home"}
                />
              </div>
              <div
                className={`flex items-center  gap-1 relative  gridIcons2 cursor-pointer text-[12px] ${styles.txtColorDark}`}
                onClick={() => handleLogout()}
              >
                <HoverIcon
                  defaultIcon={logoutBtn}
                  hoverIcon={logoutBtnHover}
                  altText={"Logout"}
                  title={"Logout"}
                />
              </div>
              <UseSwitchesCustom />
            </div>
          </ul>
        </div>

        {/* right Icon */}
        <div className="hidden lg:flex  items-center justify-end  relative ">
          <img
            src={companyImageUrl}
            alt="Selected Logo"
            className="w-auto h-[40px] object-contain"
            priority
          />
        </div>
      </div>
      <>
        <div>
          <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={openAlertModal}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
              backdrop: {
                timeout: 500,
              },
            }}
          >
            <Fade in={openAlertModal}>
              <div
                className={`relative inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex  px-4 `}
              >
                <div
                  className={`text-black  bg-white
              } p-[30px] rounded-lg shadow-xl  w-full sm:w-[460px] h-auto sm:h-[175px]  flex flex-col justify-between mx-auto max-w-full sm:max-w-[520px]`}
                >
                  <div className="flex-grow py-[10px]">
                    <h3 className={`${styles.modalTextColor} text-[12px] `}>
                      www.sysconinfotech.com says
                    </h3>
                    <p
                      className={`${styles.modalTextColor} text-black text-[12px] mt-4`}
                    >
                      Do you want to close this form, all changes will be lost?
                    </p>
                  </div>
                  <div className="flex justify-end space-x-4 ">
                    <button
                      onClick={handleOk}
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
      </>
    </Navbar>
  );
}
