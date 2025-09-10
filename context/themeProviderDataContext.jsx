// @ primary: Primary Color.
// @ onPrimary: Text Color.
// @ onPrimaryDark: Primary Dark.
// @ primaryBorder: Primary Border.
// @ primaryHover: Primary color on hover.
// @ scrollBar: Scrollbar color.
// @ tableHeading: Table Heading Color.
// @ tableHover: Table Hover Color.
// @ tableBackground: Table Background Color.
// @ tableTextColor: Table Text Color.
// @ pageBackground: Page Background Color.
// @ accordionSummaryBackground: Accordion Background Color.

"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import PropTypes from "prop-types";
import { decrypt } from "@/helper/security";

const ThemeContext = createContext();
const darkDefaultThemeDetails = {
  // Dark Mode Theme Details
  primary: "#0766AD",
  onPrimary: "#EFEFEF",
  onPrimaryDark: "#0766AD",
  primaryBorder: "#333333",
  primaryHover: "#444444",
  scrollBar: "#7e9bcf",
  tableHeading: "#0766AD",
  tableHover: "#272a2c",
  tableBackground: "#333333",
  tableTextColor: "#EFEFEF",
  pageBackground: "#000000",
  paginationBackground: "#0766AD", // not used
  accordionSummaryBackground: "#1B1E1F",

  // primary: "#1B4242",
  // onPrimary: "#EFEFEF",
  // onPrimaryDark: "#C40C0C",
  // primaryBorder: "#333333",
  // primaryHover: "#9EC8B9",
  // scrollBar: "#9EC8B9",
  // tableHeading: "#1B4242",
  // tableHover: "#272a2c",
  // tableBackground: "#333333",
  // tableTextColor: "#EFEFEF",
  // pageBackground: "#000000",
  // paginationBackground: "#0766AD", // not used
  // accordionSummaryBackground: "#1B1E1F",
};

const lightDefaultThemeDetails = {
  // Default Theme Details
  primary: "#0766AD",
  onPrimary: "#EFEFEF",
  onPrimaryDark: "#0766AD",
  primaryBorder: "#EFEFEF",
  primaryHover: "#0987e5",
  scrollBar: "#7e9bcf",
  tableHeading: "#0766AD",
  tableHover: "#d9dff1",
  tableBackground: "#EFEFEF",
  tableTextColor: "#656565",
  pageBackground: "#FFFFFF",
  paginationBackground: "#0766AD", // not used
  accordionSummaryBackground: "#F9F9F9",
};

const applyTheme = (theme, root) => {
  const properties = {
    "--bg-color": theme.primary,
    "--text-color-500": theme.onPrimary,
    "--text-color-dark": theme.onPrimaryDark,
    "--border-color": theme.primaryBorder,
    "--bg-color-hover": theme.primaryHover,
    "--scroll-bar-bg": theme.scrollBar,
    "--table-head-bg": theme.tableHeading,
    "--table-hover-bg": theme.tableHover,
    "--table-bg": theme.primaryBorder,
    "--table-text-color": theme.tableTextColor,
    "--page-bg-color": theme.pageBackground,
    "--pagination-bg": theme.primary,
    "--accordion-summary-bg": theme.accordionSummaryBackground,
    "--accordion-summary-text-color": theme.tableTextColor,
    "--grid-bg-color": theme.tableTextColor,



    "--commonBg":theme.commonBg,
    "--commonFontFamily":theme.commonFontFamily,
    "--commonTextColor":theme.commonTextColor,
    "--commonFontSize":theme.commonFontSize,
    "--commonFontWeight":theme.commonFontWeight,
    "--navbarBg":theme.navbarBg,
    "--navbarTextColor":theme.navbarTextColor,
    "--navbarFontSize":theme.navbarFontSize,
    "--navbarFontWeight":theme.navbarFontWeight,
    "--sidebarBg":theme.sidebarBg,
    "--sidebarTextColor":theme.sidebarTextColor,
    "--sidebarFontSize":theme.sidebarFontSize,
    "--sidebarFontWeight":theme.sidebarFontWeight,
    "--sidebarBgHover":theme.sidebarBgHover,
    "--sidebarTextColorHover":theme.sidebarTextColorHover,
    "--tableHeaderBg":theme.tableHeaderBg,
    "--tableHeaderTextColor":theme.tableHeaderTextColor,
    "--tableHeaderFontSize":theme.tableHeaderFontSize,
    "--tableHeaderFontWeight":theme.tableHeaderFontWeight,
    "--tableRowBg":theme.tableRowBg,
    "--tableRowTextColor":theme.tableRowTextColor,
    "--tableRowFontSize":theme.tableRowFontSize,
    "--tableRowFontWeight":theme.tableRowFontWeight,
    "--tableRowBgHover":theme.tableRowBgHover,
    "--tableRowTextColorHover":theme.tableRowTextColorHover,
    "--tableChildHeaderBg":theme.tableChildHeaderBg,
    "--tableChildHeaderTextColor":theme.tableChildHeaderTextColor,
    "--tableSubChildHeaderBg":theme.tableSubChildHeaderBg,
    "--tableSubChildHeaderTextColor":theme.tableSubChildHeaderTextColor,
    "--accordionParentHeaderBg":theme.accordionParentHeaderBg,
    "--accordionParentHeaderTextColor":theme.accordionParentHeaderTextColor,
    "--accordionParentHeaderFontSize":theme.accordionParentHeaderFontSize,
    "--accordionParentHeaderFontWeight":theme.accordionParentHeaderFontWeight,
    "--accordionChildHeaderBg":theme.accordionChildHeaderBg,
    "--accordionChildHeaderTextColor":theme.accordionChildHeaderTextColor,
    "--accordionChildHeaderFontSize":theme.accordionChildHeaderFontSize,
    "--accordionChildHeaderFontWeight":theme.accordionChildHeaderFontWeight,
    "--accordionBodyBg":theme.accordionBodyBg,
    "--inputBg":theme.inputBg,
    "--inputLabelTextColor":theme.inputLabelTextColor,
    "--inputTextColor":theme.inputTextColor,
    "--inputBorderColor":theme.inputBorderColor,
    "--inputFontSize":theme.inputFontSize,
    "--inputFontWeight":theme.inputFontWeight,
    "--inputBorderHoverColor":theme.inputBorderHoverColor,
    "--buttonBg":theme.buttonBg,
    "--buttonTextColor":theme.buttonTextColor,
    "--buttonFontSize":theme.buttonFontSize,
    "--buttonFontWeight":theme.buttonFontWeight,
    "--buttonHoverBg":theme.buttonHoverBg,
    "--buttonTextHoverColor":theme.buttonTextHoverColor,
  };

  Object.keys(properties).forEach((key) => {
    root.style.setProperty(key, properties[key]);
  });
};

export const ThemeProviderData = ({ children }) => {
  const [themeDetails, setThemeDetails] = useState(lightDefaultThemeDetails);
  const [userDetails, setUserDetails] = useState(null);
  const [dropFilterVariable, setDropFilterVariable] = useState({});
  const [toggledThemeValue, setToggledThemeValue] = useState();
  const [companyId, setCompanyId] = useState(null);
  const [financialYear, setFinancialYear] = useState(null);
  const [branchId, setBranchId] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [userId, setUserId] = useState(null);

  const initializeTheme = useCallback(() => {
    try {
      const themeMode = localStorage.getItem("darkMode");
      const themeData = localStorage.getItem("ThemeData");
      const isDarkMode = JSON.parse(themeMode);
      // Check for null, undefined, or empty string in ThemeData
      if (
        themeData &&
        themeData !== "null" &&
        themeData !== "undefined" &&
        themeData.trim() !== ""
      ) {
        const decryptedThemeData = JSON.parse(decrypt(themeData));
        const theme = isDarkMode
          ? decryptedThemeData.darkTheme
          : decryptedThemeData.lightTheme;

        setThemeDetails(theme);
        setToggledThemeValue(isDarkMode);
        applyTheme(theme, document.documentElement);
      } else {
        // Apply the default theme if no valid theme is stored
        if (isDarkMode) {
          applyTheme(darkDefaultThemeDetails, document.documentElement);
        } else {
          applyTheme(lightDefaultThemeDetails, document.documentElement);
        }
      }
    } catch (error) {
      console.error("Error initializing theme:", error);
      applyTheme(lightDefaultThemeDetails, document.documentElement);
    }
  }, []);

  const updateUserDetails = () => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const getUserData = JSON.parse(decrypt(storedUserData));
      setUserDetails(getUserData);
      setUserId(getUserData.id);
    }
    const storedCompanyId = sessionStorage.getItem("companyId");
    const storedFinancialYear = sessionStorage.getItem("financialYear");
    const storedBranchId = sessionStorage.getItem("branchId");
    if (storedCompanyId && storedFinancialYear) {
      setCompanyId(storedCompanyId);
      setFinancialYear(storedFinancialYear);
      setBranchId(storedBranchId);
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
    if (sessionStorageItems.length > 0) {
      // Convert array of key-value pairs to an object
      const filterObject = sessionStorageItems.reduce((obj, item) => {
        obj[item.key] = item.value;
        return obj;
      }, {});

      setDropFilterVariable(filterObject);
    }
  };

  useEffect(() => {
    initializeTheme();
    updateUserDetails();
  }, [initializeTheme]);

  const values = {
    themeDetails,
    setThemeDetails,
    userDetails,
    initializeTheme,
    dropFilterVariable,
    toggledThemeValue,
    companyId,
    financialYear,
    branchId,
  };

  return (
    <ThemeContext.Provider value={values}>{children}</ThemeContext.Provider>
  );
};

ThemeProviderData.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useThemeProvider = () => useContext(ThemeContext);
