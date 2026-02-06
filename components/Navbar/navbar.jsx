"use client";
/* eslint-disable */
import React, { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Navbar, Typography } from "@material-tailwind/react";
import Cookies from "js-cookie";
import Select, { components } from "react-select";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";

import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Tooltip from "@mui/material/Tooltip";
import { Avatar } from "@mui/material";

import { logoutBtn, homeLogo, homeHoverLogo } from "@/assets/index.jsx";
import {
  calendarIcon,
  officeIcon,
  calendarIconHover,
  officeIconHover,
  logoutBtnHover,
} from "@/assets";
import { loginIcon } from "@/assets";

import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import UseSwitchesCustom from "@/components/ThemeToggle/toggleSwitch";

import {
  navbarStyles,
  CompanyLogostyles1,
  middleDataStyles,
  menuListStyles,
  menuStyles,
} from "@/app/globalCss.js";

import styles from "@/components/common.module.css";
import { decrypt, encrypt } from "@/helper/security";
import { debounce } from "@/helper/debounceFile";

import {
  dynamicDropDownFieldsData,
  fetchReportData,
} from "@/services/auth/FormControl.services";
import { userLogout } from "@/services/auth/Auth.services";

const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

const customStyles = {
  menu: (base) => ({
    ...base,
    ...menuStyles,
    width: "10rem",
  }),
  menuPortal: (provided) => ({
    ...provided,
    backgroundColor: "var(--page-bg-color)",
    zIndex: 9999,
  }),
  option: (provided) => ({
    ...provided,
    backgroundColor: "var(--accordian-summary-bg)",
    color: "var(--table-text-color)",
    ":hover": {
      ...provided[":hover"],
      backgroundColor: "var(--accordion-summary-bg)",
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
    backgroundColor: "var(--navbarBg)",
    boxShadow: "none",
    color: "#00000099",
    cursor: "text !important",
    width: "fit-content",
    height: "27px ",
    zIndex: 999,
    fontSize: "10px",
    position: "relative",
  }),
  indicatorSeparator: (base) => ({ ...base, display: "none" }),
  placeholder: (base) => ({
    ...base,
    color: "#00000099",
    margin: 0,
    padding: 0,
    fontSize: "10px",
    position: "relative",
    bottom: "2px",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    "& svg": {
      width: "12px !important",
      height: "12px !important",
    },
    cursor: "pointer !important",
    paddingLeft: "0px",
  }),
  clearIndicator: (base) => ({
    ...base,
    "& svg": {
      width: "12px !important",
      height: "12px !important",
      cursor: "pointer !important",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--navbarTextColor)",
    fontSize: "var(--navbarFontSize)",
    fontWeight: "var(--navbarFontWeight)",
    fontFamily: "var(--commonFontFamily)",
    overflow: "visible",
    whiteSpace: "wrap",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "2px 2px",
  }),
  input: (base) => ({
    ...base,
    color: "var(--navbarTextColor)",
    fontFamily: "var(--commonFontFamily)",
  }),
};

NavbarPage.propTypes = {};

export default function NavbarPage() {
  const { push } = useRouter();
  const router = useRouter();
  const dispatch = useDispatch();

  const [companyData, setCompanyData] = useState([]);
  const [branchData, setBranchData] = useState([]);
  const [financialYearData, setFinancialYearData] = useState([]);
  const [userDetails, setUserDetails] = useState({});

  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [pageNo, setPageNo] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [companyImageUrl, setCompanyImageUrl] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [openSwitchModal, setOpenSwitchModal] = useState(false);

  const yearDropdownRef = useRef(null);
  const companyDropdownRef = useRef(null);
  const branchDropdownRef = useRef(null);

  const prevPageNo = useRef();
  const callInputChangeFuncRef = useRef(true);

  const isRedirected = useSelector((state) => state?.counter?.isRedirection);
  const [redirected, setRedirected] = useState(true);

  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    const calc = () => setIsCompact(window.innerWidth < 1280);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  useEffect(() => {
    setRedirected(isRedirected);
  }, [isRedirected]);

  const companyCtrlRef = useRef(null);
  const branchCtrlRef = useRef(null);
  const yearCtrlRef = useRef(null);

  const getUserDataSafe = () => {
    try {
      const storedUserData = localStorage.getItem("userData");
      if (!storedUserData) return null;
      return JSON.parse(decrypt(storedUserData));
    } catch (e) {
      console.error("Failed to read userData:", e);
      return null;
    }
  };

  const setUserDataSafe = (patch) => {
    const ud = getUserDataSafe();
    if (!ud?.[0]) return;
    const next = { ...ud[0], ...patch };
    localStorage.setItem("userData", encrypt(JSON.stringify([next])));
  };

  useEffect(() => {
    const ud = getUserDataSafe();
    if (ud) {
      setUserDetails(ud);
      setSelectedCompany(ud?.[0]?.defaultCompanyId ?? "");
      setSelectedBranch(ud?.[0]?.defaultBranchId ?? "");
      setSelectedFinancialYear(ud?.[0]?.defaultFinYearId ?? "");
      setProfileImage(
        ud?.[0]?.profilePhoto ? backendUrl + ud[0].profilePhoto : "",
      );
      setCompanyImageUrl(
        ud?.[0]?.companyLogo ? backendUrl + ud[0].companyLogo : "",
      );
    }

    function getAllSessionStorage() {
      const items = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        const value = sessionStorage.getItem(key);
        items.push({ key, value });
      }
      return items;
    }

    const sessionStorageItems = getAllSessionStorage();
    let filterObject = null;

    if (sessionStorageItems.length > 0) {
      filterObject = sessionStorageItems.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
      }, {});
      if (filterObject?.companyId) setSelectedCompany(filterObject.companyId);
      if (filterObject?.branchId) setSelectedBranch(filterObject.branchId);
      if (filterObject?.financialYear)
        setSelectedFinancialYear(filterObject.financialYear);
    }

    const initialCompanyId =
      filterObject?.companyId ?? ud?.[0]?.defaultCompanyId ?? "";

    Promise.all([
      fetchCompanyData(1, "", filterObject?.companyId),
      fetchBranchData(1, "", filterObject?.branchId, initialCompanyId),
      // ✅ company-aware FY
      fetchFinancialYearData(1, "", filterObject?.financialYear, initialCompanyId),
    ])
      .then(([cd, bd, fd]) => {
        setCompanyData(cd || []);
        setBranchData(bd || []);
        setFinancialYearData(fd || []);
      })
      .catch((error) => {
        console.error("Failed to fetch data:", error);
      });

    return () => {
      companyCtrlRef.current?.abort();
      branchCtrlRef.current?.abort();
      yearCtrlRef.current?.abort();
    };
  }, []);

  async function fetchCompanyData(pageNo, inputValueForDataFetch, valueSearch) {
    companyCtrlRef.current?.abort();
    companyCtrlRef.current = new AbortController();

    const ud = getUserDataSafe();
    if (!ud) return null;

    const clientId = ud?.[0]?.clientId;

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblCompany",
      referenceColumn: "name",
      dropdownFilter: " and ownCompany='y' and clientId = " + clientId,
      search: inputValueForDataFetch,
      pageNo: inputValueForDataFetch.length > 0 ? 1 : pageNo,
      value: valueSearch,
    };

    try {
      const apiResponse = await dynamicDropDownFieldsData(
        requestData,
        companyCtrlRef.current,
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
      console.error("Error fetching company:", error);
      return null;
    }
  }

  async function fetchBranchData(
    pageNo,
    inputValueForDataFetch,
    valueSearch,
    companyIdForBranches,
  ) {
    branchCtrlRef.current?.abort();
    branchCtrlRef.current = new AbortController();

    const ud = getUserDataSafe();
    if (!ud) return null;

    const clientId = ud?.[0]?.clientId;

    const companyId =
      companyIdForBranches ??
      parseInt(sessionStorage.getItem("companyId")) ??
      ud?.[0]?.defaultCompanyId;

    if (!companyId) {
      setBranchData([]);
      return [];
    }

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblCompanyBranch",
      referenceColumn: "name",
      dropdownFilter: ` and clientId = ${clientId} and companyId = ${companyId}`,
      search: inputValueForDataFetch,
      pageNo: inputValueForDataFetch.length > 0 ? 1 : pageNo,
      value: valueSearch ?? null,
    };

    try {
      const apiResponse = await dynamicDropDownFieldsData(
        requestData,
        branchCtrlRef.current,
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
      console.error("Error fetching branch:", error);
      return null;
    }
  }

  // ✅ company-aware Financial Year
  async function fetchFinancialYearData(
    pageNo,
    inputValueForDataFetch,
    valueSearch,
    companyIdForYear,
  ) {
    yearCtrlRef.current?.abort();
    yearCtrlRef.current = new AbortController();

    const ud = getUserDataSafe();
    if (!ud) return null;

    const clientId = ud?.[0]?.clientId;

    const companyId =
      companyIdForYear ??
      parseInt(sessionStorage.getItem("companyId")) ??
      ud?.[0]?.defaultCompanyId;

    // ✅ If FY is company-based, keep this. If not, remove the company filter.
    const companyFilter = companyId ? ` and companyId = ${companyId}` : "";

    const requestData = {
      onfilterkey: "status",
      onfiltervalue: 1,
      referenceTable: "tblFinancialYear",
      referenceColumn: "financialYear",
      dropdownFilter: ` and clientId = ${clientId}${companyFilter}`,
      search: inputValueForDataFetch,
      pageNo: inputValueForDataFetch.length > 0 ? 1 : pageNo,
      value: valueSearch ?? null,
    };

    try {
      const apiResponse = await dynamicDropDownFieldsData(
        requestData,
        yearCtrlRef.current,
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
      console.error("Error fetching fin year:", error);
      return null;
    }
  }

  const updateBranchHeaderFooter = async (branchId) => {
    try {
      const requestData = {
        columns: "cbd.header,cbd.footer",
        tableName: `tblCompanyBranchParameterDetails cbd 
          join tblCompanyBranchParameter cb 
            on cb.id = cbd.companyBranchParameterId 
           and cb.companyBranchId = ${branchId}`,
        whereCondition: `1=1`,
        clientIdCondition: `cbd.status=1 FOR JSON PATH , INCLUDE_NULL_VALUES `,
      };
      const { data } = await fetchReportData(requestData);
      setUserDataSafe({
        defaultBranchId: branchId,
        footerLogoPath: data?.[0]?.footer,
        headerLogoPath: data?.[0]?.header,
      });
    } catch (e) {
      console.error("header/footer fetch failed:", e);
      // still set branch id, don't block UI
      setUserDataSafe({ defaultBranchId: branchId });
    }
  };

  const handleSelect = async (selectedValue, setState, selectedBy, updateColumn) => {
    const ud = getUserDataSafe();
    if (!ud) return;

    // persist default id changes to userData
    if (updateColumn === "defaultBranchId") {
      // handled below (includes header/footer)
      if (selectedValue?.value != null) {
        await updateBranchHeaderFooter(selectedValue.value);
      }
    } else if (selectedValue?.value != null) {
      setUserDataSafe({ [updateColumn]: selectedValue.value });
    }

    if (selectedValue && selectedValue.value !== undefined) {
      setState(selectedValue.value);
      sessionStorage.setItem(selectedBy, selectedValue.value);

      // ✅ COMPANY CHANGE -> reset + refetch + auto set Branch + Financial Year
      if (selectedBy === "companyId") {
        const newCompanyId = selectedValue.value;

        // clear branch + FY
        setSelectedBranch(null);
        sessionStorage.removeItem("branchId");
        setSelectedFinancialYear(null);
        sessionStorage.removeItem("financialYear");

        // reset paging/scroll shared list states
        setPageNo(1);
        setScrollPosition(0);

        // load branches for company + auto pick first
        const bd = await fetchBranchData(1, "", null, newCompanyId);
        const firstBranch = Array.isArray(bd) && bd.length > 0 ? bd[0] : null;
        if (firstBranch?.value != null) {
          setSelectedBranch(firstBranch.value);
          sessionStorage.setItem("branchId", firstBranch.value);
          await updateBranchHeaderFooter(firstBranch.value);
        }

        // load FY for company + auto pick first
        const fd = await fetchFinancialYearData(1, "", null, newCompanyId);
        const firstFY = Array.isArray(fd) && fd.length > 0 ? fd[0] : null;
        if (firstFY?.value != null) {
          setSelectedFinancialYear(firstFY.value);
          sessionStorage.setItem("financialYear", firstFY.value);
          setUserDataSafe({ defaultFinYearId: firstFY.value });
        }
      }
      window.location.reload();
    } else if (selectedValue?.length === 0) {
      setState(null);
    }
  };

  const handleChangeValue = (value, selectedBy) => {
    const dropValue = value ? value[0] : [];
    switch (selectedBy) {
      case "companyId":
        handleSelect(dropValue, setSelectedCompany, selectedBy, "defaultCompanyId");
        break;
      case "financialYear":
        handleSelect(dropValue, setSelectedFinancialYear, selectedBy, "defaultFinYearId");
        break;
      case "branchId":
        handleSelect(dropValue, setSelectedBranch, selectedBy, "defaultBranchId");
        break;
      default:
        break;
    }
  };

  async function handleLogout() {
    const storedUserData = localStorage.getItem("loginCredentials");
    const tokenVal = Cookies.get("token");
    const response = await userLogout(tokenVal);
    if (response.success === true) {
      localStorage.clear();
      Cookies.remove("token");
      if (storedUserData) {
        const loginCredentials = JSON.parse(decrypt(storedUserData));
        localStorage.setItem(
          "loginCredentials",
          encrypt(JSON.stringify(loginCredentials)),
        );
      }
      push("/login");
    }
  }

  async function handleDashboard() {
    push("/dashboard");
  }

  const debouncedCompanyFetch = useCallback(
    debounce((searchValue) => {
      fetchCompanyData(1, searchValue);
    }, 150),
    [],
  );

  const debouncedBranchFetch = useCallback(
    debounce((searchValue, companyId) => {
      fetchBranchData(1, searchValue, null, companyId);
    }, 150),
    [],
  );

  const debouncedYearFetch = useCallback(
    debounce((searchValue, companyId) => {
      fetchFinancialYearData(1, searchValue, null, companyId);
    }, 150),
    [],
  );

  useEffect(() => {
    if (pageNo > 1) {
      if (prevPageNo.current !== pageNo) {
        fetchCompanyData(pageNo, "");
        fetchBranchData(pageNo, "", null, selectedCompany || null);
        fetchFinancialYearData(pageNo, "", null, selectedCompany || null);
      }
      prevPageNo.current = pageNo;
    }
  }, [pageNo]);

  function setRedirectedFn() {
    setOpenAlertModal((pre) => !pre);
    if (redirected == true) router.push("/UserProfile");
  }

  const handleClose = () => setOpenAlertModal((prev) => !prev);
  const handleOk = () => {
    setOpenAlertModal((prev) => !prev);
    setRedirected(true);
    router.push("/UserProfile");
  };

  const CustomMenuList = (props) => {
    const { pageNo, setPageNo, setScrollPosition, scrollPosition } = props;
    const menuListRef = useRef(null);
    const localScrollPosition = useRef(scrollPosition);

    useEffect(() => {
      const menuList = menuListRef.current;
      if (menuList) {
        const onScroll = () => {
          const { scrollHeight, scrollTop, clientHeight } = menuList;
          localScrollPosition.current = scrollTop;

          const threshold = 10;
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
    }, []);

    useEffect(() => {
      const menuList = menuListRef.current;
      if (menuList && pageNo > 1) {
        requestAnimationFrame(() => {
          menuList.scrollTop = localScrollPosition.current;
        });
      }
    }, [pageNo]);

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

  const modalSelectStyles = {
    ...customStyles,
    control: (base, st) => ({
      ...customStyles.control(base, st),
      width: "100%",
    }),
    menu: (base) => ({
      ...base,
      ...menuStyles,
      width: "100%",
    }),
  };

  return (
    <Navbar className={`${navbarStyles} shadow-none rounded-sm bg-[var(--navbarBg)]`}>
      <div className={CompanyLogostyles1} style={{ width: "100%" }}>
        <div className="flex items-center justify-start">
          <Image
            src={loginIcon}
            alt="sysconLogo"
            className="w-auto h-[32px] lg:h-[40px] object-contain"
            priority
          />
        </div>

        <div className={middleDataStyles} style={{ width: "100%" }}>
          <ul className="flex flex-row flex-nowrap items-center justify-between mb-0 w-full">
            {/* user */}
            <div className="inline-flex items-center relative left-2">
              <Typography
                as="li"
                variant="small"
                color="blue-gray"
                className="flex items-center gap-x-1 p-1 font-medium"
              >
                <a
                  onClick={() => setRedirectedFn()}
                  className="flex items-center"
                  style={{ cursor: "pointer" }}
                >
                  <Avatar
                    src={profileImage || ""}
                    sx={{ width: 25, height: 25, borderRadius: "40%" }}
                  />
                </a>
                <a
                  onClick={() => setRedirectedFn()}
                  className={` text-[var(--navbarTextColor)] font-[var(--navbarFontWeight)] flex items-center pl-0 mt-1`}
                  style={{
                    cursor: "pointer",
                    fontSize: "var(--navbarFontSize)",
                    fontFamily: "var(--commonFontFamily)",
                    maxWidth: isCompact ? 120 : 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={userDetails?.[0]?.name || ""}
                >
                  {userDetails && userDetails?.[0]?.name}
                </a>
              </Typography>
            </div>

            {!isCompact ? (
              <>
                {/* Company */}
                <div className="flex items-center">
                  <div ref={companyDropdownRef} className="relative inline-block text-left">
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
                            (item) => item.value === parseInt(selectedCompany),
                          ) || null
                        }
                        isClearable={false}
                        backspaceRemovesValue={false}
                        onChange={(newValue) => {
                          callInputChangeFuncRef.current = false;
                          handleChangeValue(newValue ? [newValue] : null, "companyId");
                          callInputChangeFuncRef.current = true;
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
                        onMenuOpen={() => setPageNo(1)}
                        onInputChange={(value, e) => {
                          if (
                            callInputChangeFuncRef.current &&
                            e.action === "input-change"
                          ) {
                            debouncedCompanyFetch(value);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Branch */}
                <div className="flex items-center">
                  <div ref={branchDropdownRef} className="relative inline-block text-left">
                    <div className="inline-flex items-center relative">
                      <HoverIcon
                        defaultIcon={officeIcon}
                        hoverIcon={officeIconHover}
                        altText={"officeIcon"}
                        className={"relative left-2 "}
                      />
                      <Select
                        id={11}
                        styles={customStyles}
                        value={
                          branchData?.find(
                            (item) => item.value === parseInt(selectedBranch),
                          ) || null
                        }
                        isClearable={false}
                        backspaceRemovesValue={false}
                        onChange={(newValue) => {
                          callInputChangeFuncRef.current = false;
                          handleChangeValue(newValue ? [newValue] : null, "branchId");
                          callInputChangeFuncRef.current = true;
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
                          fetchBranchData(1, "", null, selectedCompany || null);
                        }}
                        onInputChange={(value, e) => {
                          if (
                            callInputChangeFuncRef.current &&
                            e.action === "input-change"
                          ) {
                            debouncedBranchFetch(value, selectedCompany || null);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Year */}
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
                            (item) => item.value === parseInt(selectedFinancialYear),
                          ) || null
                        }
                        onChange={(newValue) => {
                          handleChangeValue(
                            newValue ? [newValue] : null,
                            "financialYear",
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
                          fetchFinancialYearData(1, "", null, selectedCompany || null);
                        }}
                        onInputChange={(value, e) => {
                          if (
                            callInputChangeFuncRef.current &&
                            e.action === "input-change"
                          ) {
                            debouncedYearFetch(value, selectedCompany || null);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1" />
            )}

            {/* Right actions (Apartment icon on compact) */}
            <div className="flex items-center ml-2 gap-2">
              {isCompact && (
                <Tooltip
                  title="Company Details"
                  placement="bottom"
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "#ffffff",
                        color: "#111827",
                        fontSize: "11px",
                        fontWeight: 600,
                        borderRadius: "6px",
                        px: 1,
                        py: 0.6,
                        boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                        border: "1px solid rgba(0,0,0,0.08)",
                      },
                    },
                  }}
                >
                  <button
                    type="button"
                    aria-label="Company Details"
                    onClick={() => setOpenSwitchModal(true)}
                    className="flex items-center justify-center"
                    style={{
                      width: 30,
                      height: 35,
                      borderRadius: 18,
                      background: "transparent",
                      padding: 0,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{ width: 30, height: 35 }}
                    >
                      <HoverIcon
                        defaultIcon={officeIcon}
                        hoverIcon={officeIconHover}
                        altText={"Company Details"}
                        className=""
                        style={{
                          width: 20,
                          height: 20,
                          display: "block",
                        }}
                      />
                    </div>
                  </button>
                </Tooltip>
              )}

              <div
                className={`flex items-center gap-1 relative cursor-pointer text-[12px] ${styles.txtColorDark}`}
                onClick={() => handleDashboard()}
              >
                <HoverIcon
                  style={{ margin: "0px", padding: "0px" }}
                  defaultIcon={homeLogo}
                  hoverIcon={homeHoverLogo}
                  altText={"Home"}
                  title={"Home"}
                />
              </div>

              <div
                className={`flex items-center gap-1 relative gridIcons2 cursor-pointer text-[12px] ${styles.txtColorDark}`}
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

        {/* ✅ Right company logo */}
        <div className="flex items-center justify-end relative">
          <img
            src={companyImageUrl}
            alt="Selected Logo"
            className="w-auto h-[26px] sm:h-[32px] lg:h-[40px] object-contain"
            style={{ maxWidth: 120 }}
          />
        </div>
      </div>

      {/* -------------------- Alert Modal -------------------- */}
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={openAlertModal}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 500 } }}
      >
        <Fade in={openAlertModal}>
          <div className="relative inset-0 bg-opacity-50 overflow-y-auto h-full w-full flex px-4">
            <div
              className={`text-black bg-white p-[30px] rounded-lg shadow-xl w-full sm:w-[460px] h-auto sm:h-[175px] flex flex-col justify-between mx-auto max-w-full sm:max-w-[520px]`}
            >
              <div className="flex-grow py-[10px]">
                <h3 className={`${styles.modalTextColor} text-[12px]`}>
                  www.sysconinfotech.com says
                </h3>
                <p className={`${styles.modalTextColor} text-black text-[12px] mt-4`}>
                  Do you want to close this form, all changes will be lost?
                </p>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleOk}
                  className={`px-4 text-[12px] py-2 ${styles.bgPrimaryColorBtn} flex items-center justify-center rounded-[5px] shadow-custom w-24 h-[27px]`}
                >
                  Ok
                </button>
                <button
                  onClick={handleClose}
                  className={`px-4 py-2 text-[12px] ${styles.bgPrimaryColorBtn} flex items-center justify-center rounded-[5px] shadow-custom w-24 h-[27px] border-[0.1px]`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </Fade>
      </Modal>

      {/* -------------------- Compact Switch Modal -------------------- */}
      <Modal
        open={openSwitchModal}
        onClose={() => setOpenSwitchModal(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 200 } }}
      >
        <Fade in={openSwitchModal}>
          <div
            className="relative inset-0 h-full w-full flex items-start justify-center px-4"
            style={{ paddingTop: 60 }}
          >
            <div
              className="bg-white rounded-lg shadow-xl"
              style={{
                width: "92vw",
                maxWidth: 360,
                padding: 14,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-[12px] font-semibold text-black"></div>
                <button
                  onClick={() => setOpenSwitchModal(false)}
                  className={`px-3 py-1 text-[11px] ${styles.bgPrimaryColorBtn} rounded-[5px]`}
                >
                  Close
                </button>
              </div>

              <div className="flex flex-col gap-10" style={{ gap: 10 }}>
                {/* Company */}
                <div>
                  <div
                    className="text-[11px] mb-1"
                    style={{ color: "rgba(0,0,0,0.70)", fontWeight: 600 }}
                  >
                    Company
                  </div>
                  <div className="flex items-center gap-2">
                    <HoverIcon
                      defaultIcon={officeIcon}
                      hoverIcon={officeIconHover}
                      altText={"officeIcon"}
                      className={""}
                    />
                    <div style={{ width: "100%" }}>
                      <Select
                        styles={modalSelectStyles}
                        value={
                          companyData?.find(
                            (item) => item.value === parseInt(selectedCompany),
                          ) || null
                        }
                        isClearable={false}
                        backspaceRemovesValue={false}
                        onChange={(newValue) => {
                          handleChangeValue(newValue ? [newValue] : null, "companyId");
                        }}
                        options={companyData}
                        menuPortalTarget={
                          typeof document !== "undefined" ? document.body : null
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Branch */}
                <div>
                  <div
                    className="text-[11px] mb-1"
                    style={{ color: "rgba(0,0,0,0.70)", fontWeight: 600 }}
                  >
                    Company Branch
                  </div>
                  <div className="flex items-center gap-2">
                    <HoverIcon
                      defaultIcon={officeIcon}
                      hoverIcon={officeIconHover}
                      altText={"officeIcon"}
                      className={""}
                    />
                    <div style={{ width: "100%" }}>
                      <Select
                        styles={modalSelectStyles}
                        value={
                          branchData?.find(
                            (item) => item.value === parseInt(selectedBranch),
                          ) || null
                        }
                        isClearable={false}
                        backspaceRemovesValue={false}
                        onChange={(newValue) => {
                          handleChangeValue(newValue ? [newValue] : null, "branchId");
                        }}
                        options={branchData}
                        menuPortalTarget={
                          typeof document !== "undefined" ? document.body : null
                        }
                        onMenuOpen={() => {
                          fetchBranchData(1, "", null, selectedCompany || null);
                        }}
                        onInputChange={(value, e) => {
                          if (e.action === "input-change") {
                            debouncedBranchFetch(value, selectedCompany || null);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Year */}
                <div>
                  <div
                    className="text-[11px] mb-1"
                    style={{ color: "rgba(0,0,0,0.70)", fontWeight: 600 }}
                  >
                    Financial Year
                  </div>
                  <div className="flex items-center gap-2">
                    <HoverIcon
                      defaultIcon={calendarIcon}
                      hoverIcon={calendarIconHover}
                      altText={"calendarIcon"}
                      className={""}
                    />
                    <div style={{ width: "100%" }}>
                      <Select
                        styles={modalSelectStyles}
                        value={
                          financialYearData?.find(
                            (item) => item.value === parseInt(selectedFinancialYear),
                          ) || null
                        }
                        isClearable={false}
                        backspaceRemovesValue={false}
                        onChange={(newValue) => {
                          handleChangeValue(
                            newValue ? [newValue] : null,
                            "financialYear",
                          );
                        }}
                        options={financialYearData}
                        menuPortalTarget={
                          typeof document !== "undefined" ? document.body : null
                        }
                        onMenuOpen={() => {
                          fetchFinancialYearData(
                            1,
                            "",
                            null,
                            selectedCompany || null,
                          );
                        }}
                        onInputChange={(value, e) => {
                          if (e.action === "input-change") {
                            debouncedYearFetch(value, selectedCompany || null);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Fade>
      </Modal>
    </Navbar>
  );
}
