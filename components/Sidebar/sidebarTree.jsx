"use client";
/* eslint-disable */
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import styles from "@/components/common.module.css";
import LightTooltip from "@/components/Tooltip/customToolTip";
import { sideBarMenu } from "@/services/auth/Auth.services";
import PropTypes from "prop-types";
import { useRouter } from "next/navigation";
import {
  Card,
  Typography,
  List,
  ListItem,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import {
  gridIcon,
  leavesIcon,
  accusoftIcon,
  powerIcon,
  medalIcon,
  arrowRoundIcon,
  bagIcon,
  chairIcon,
  workerIcon,
} from "@/assets";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon,

  // ✅ logistics/premium icons
  BuildingOffice2Icon,
  UserGroupIcon,
  Cog6ToothIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  TruckIcon,
  CubeIcon,
  RectangleStackIcon,
  ReceiptPercentIcon,
  BanknotesIcon,
  ArrowUpTrayIcon,
  EnvelopeIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import CustomeModal from "@/components/Modal/customModal.jsx";
import { useThemeProvider } from "@/context/themeProviderDataContext";
import { fetchDataApi } from "@/services/auth/FormControl.services";
import { decrypt } from "@/helper/security";
import { updateFlag } from "@/app/counterSlice";
import { useDispatch, useSelector } from "react-redux";
import Backdrop from "@mui/material/Backdrop";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import { encryptUrlFun } from "@/utils";

export default function SideBarMenu() {
  const { themeDetails } = useThemeProvider();

  const [isEnlarge, setIsEnlarge] = useState(true);
  const [menuItem, setMenuItem] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [redirected, setRedirected] = useState(true);

  const [combinedRoleAndMenuIdsArray, setCombinedRoleAndMenuIdsArray] =
    useState([]);
  const [defaultCompanyBranch, setDefaultCompanyBranch] = useState([]);

  // ✅ Mobile/Tablet Drawer UI (GRID)
  const [device, setDevice] = useState("desktop"); // desktop | tablet | mobile
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewStack, setViewStack] = useState([]); // [{title, items, level}]

  const router = useRouter();
  const dispatch = useDispatch();

  const isRedirected = useSelector((state) => state?.counter?.isRedirection);
  const menuIdToRedirect = useSelector(
    (state) => state?.counter?.menuIdToRedirect
  );

  useEffect(() => setRedirected(isRedirected), [isRedirected]);

  const toggleEnlarge = () => setIsEnlarge((p) => !p);

  // ✅ Device detect
  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w <= 640) return "mobile";
      if (w <= 1024) return "tablet";
      return "desktop";
    };
    setDevice(calc());
    const onResize = () => setDevice(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // prevent background scroll when drawer open
  useEffect(() => {
    if (device === "desktop") return;
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [drawerOpen, device]);

  const icons = [
    leavesIcon,
    accusoftIcon,
    powerIcon,
    medalIcon,
    arrowRoundIcon,
    bagIcon,
    chairIcon,
    workerIcon,
  ];
  const getRandomIcon = () => icons[Math.floor(Math.random() * icons.length)];

  // ✅ Tokens (NO gradients) — same vars
  const mTokens = useMemo(() => {
    return {
      sheetBg: "var(--sidebarBg)",
      backdrop: "rgba(2,6,23,0.55)",
      headerBorder: "rgba(15,23,42,0.10)",
      divider: "rgba(255,255,255,0.16)",

      surface: "rgba(255,255,255,0.08)",
      surface2: "rgba(255,255,255,0.11)",
      chipBorder: "rgba(255,255,255,0.16)",

      searchBg: "rgba(255,255,255,0.10)",
      searchBorder: "rgba(255,255,255,0.16)",
      searchText: "rgba(255,255,255,0.92)",

      sheetShadow:
        "0 -22px 70px rgba(2,6,23,0.34), 0 -10px 20px rgba(2,6,23,0.18)",

      fabBg: "var(--sidebarTextColorHover)",
      fabShadow:
        "0 18px 60px rgba(2,6,23,0.30), 0 10px 22px rgba(2,6,23,0.20)",

      // ✅ grid touch surface (still NOT a card)
      tileHoverBg: "rgba(255,255,255,0.06)",
      tileActiveBg: "rgba(255,255,255,0.09)",
      tileRing: "rgba(255,255,255,0.14)",

      labelText: "rgba(255,255,255,0.94)",
      labelSub: "rgba(255,255,255,0.72)",

      // count bubble
      bubbleBg: "rgba(255,255,255,0.94)",
      bubbleBorder: "rgba(15,23,42,0.12)",
      bubbleText: "rgba(15,23,42,0.86)",
      bubbleShadow: "0 8px 14px rgba(2,6,23,0.16)",
    };
  }, []);

  // ✅ If menu icons come as images, make them same as text (white-ish)
  const imageToTextColorFilter =
    "brightness(0) invert(1) saturate(0) contrast(1.05)";

  // ✅ More icons mapping (logistics app feel)
  const pickIconComponent = (name = "") => {
    const n = String(name || "").toLowerCase();

    if (n.includes("admin")) return Cog6ToothIcon;
    if (n.includes("master")) return BuildingOffice2Icon;
    if (n.includes("rate") && n.includes("request")) return ReceiptPercentIcon;
    if (n.includes("rate")) return ReceiptPercentIcon;

    if (n.includes("equipment")) return WrenchScrewdriverIcon;
    if (n.includes("job")) return BriefcaseIcon;
    if (n === "bl" || n.includes("bill of lading") || n.includes("b/l"))
      return DocumentTextIcon;

    if (n.includes("invoice")) return BanknotesIcon;
    if (n.includes("voucher")) return ClipboardDocumentListIcon;
    if (n.includes("report")) return DocumentChartBarIcon;
    if (n.includes("upload")) return ArrowUpTrayIcon;
    if (n.includes("email") || n.includes("mail")) return EnvelopeIcon;

    if (n.includes("container")) return CubeIcon;
    if (n.includes("manifest")) return RectangleStackIcon;
    if (n.includes("shipment") || n.includes("tracking")) return TruckIcon;
    if (n.includes("user")) return UserGroupIcon;

    return DocumentTextIcon;
  };

  // --- fetch user roles/menu ids (unchanged) ---
  useEffect(() => {
    async function fetchUserData() {
      const getUser = localStorage.getItem("userData");
      let userData, userEmail, defaultCompanyBranchId;

      if (getUser) {
        const decryptedData = decrypt(getUser);
        try {
          userData = JSON.parse(decryptedData);
        } catch (e) {
          console.error("Error parsing decrypted data:", e);
          return;
        }
      } else {
        console.error("No user data found in local storage");
        return;
      }

      if (Array.isArray(userData) && userData.length > 0 && userData[0].email) {
        userEmail = userData[0].email;
        defaultCompanyBranchId = userData[0].defaultBranchId;
        setDefaultCompanyBranch(defaultCompanyBranchId);
      } else {
        console.error("Invalid user data structure or email is missing");
        return;
      }

      const userRequestBody = {
        tableName: "tblUser",
        whereCondition: { email: userEmail, status: 1 },
        projection: {},
      };

      try {
        const fetchedUserData = await fetchDataApi(userRequestBody);
        const branchAccess = fetchedUserData.data[0].branchAccess[0];

        const companyBranchId = branchAccess.companyBranchId;
        const roleAccess = branchAccess.roleAccess;
        const menuAccess = branchAccess.menuAccess;

        const roleIdsArray = roleAccess.map((access) => access.roleId);
        const userMenuIdsArray = menuAccess
          .filter((access) => access.isAccess)
          .map((access) => access.menuId);

        const roleDataPromises = roleIdsArray.map(async (roleId) => {
          const roleRequestBody = {
            tableName: "tblRole",
            whereCondition: { _id: roleId, status: 1 },
            projection: {},
          };
          try {
            const fetchedRoleData = await fetchDataApi(roleRequestBody);
            return fetchedRoleData.data[0];
          } catch (error) {
            console.error("Failed to fetch role data", roleId, error);
            return null;
          }
        });

        const allRoleData = await Promise.all(roleDataPromises);

        const roleMenuAccessArray = allRoleData
          .filter((roleData) => roleData !== null)
          .flatMap((roleData) => roleData.menuAccess)
          .filter((access) => access.isAccess);

        const roleMenuIdsArray = roleMenuAccessArray.map(
          (access) => access.menuId
        );

        const combinedMenuIdsArray = [
          ...new Set([...userMenuIdsArray, ...roleMenuIdsArray]),
        ];

        const arr = [...roleIdsArray, ...combinedMenuIdsArray];
        setCombinedRoleAndMenuIdsArray(arr);

        if (defaultCompanyBranchId === companyBranchId) {
          // ok
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchUserData();
  }, []);

  // --- fetch sidebar menu (unchanged) ---
  useEffect(() => {
    const requestBodyMenu = {
      whereCondition: { _id: combinedRoleAndMenuIdsArray },
      projection: {},
    };

    async function fetchData() {
      try {
        const apiResponse = await sideBarMenu(requestBodyMenu);
        setMenuItem(apiResponse || []);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    }

    fetchData();
  }, [combinedRoleAndMenuIdsArray]);

  // ------------------------ navigation helpers (unchanged) ------------------------
  function extractMenuName(items, id, parentPath = []) {
    for (const item of items) {
      const currentPath = [...parentPath, item];
      if (item.id === id) return currentPath;
      if (item.child && item.child.length > 0) {
        const result = extractMenuName(item.child, id, currentPath);
        if (result) return result;
      }
    }
    return null;
  }

  function findItemByIdWithParents(items, id, parentPath = []) {
    for (const item of items) {
      const currentPath = [...parentPath, item.menuName];
      if (item.id === id) return currentPath.join(",");
      if (item.child && item.child.length > 0) {
        const result = findItemByIdWithParents(item.child, id, currentPath);
        if (result) return result;
      }
    }
    return null;
  }

  const navigatedData = (menuValue) => {
    const breadCrumbs = findItemByIdWithParents(menuItem, menuValue.id);
    if (breadCrumbs) {
      localStorage.setItem("breadCrumbs", JSON.stringify(breadCrumbs));
      sessionStorage.setItem("breadCrumbs", JSON.stringify(breadCrumbs));
    }
  };

  const handleClose = () => setOpenAlertModal((prev) => !prev);

  const handleOk = () => {
    setOpenAlertModal((prev) => !prev);
    setRedirected(true);
    toggleAccordionMenus(
      menuIdToRedirect?.index,
      menuIdToRedirect?.parentAccordian,
      menuIdToRedirect?.item,
      menuIdToRedirect?.byIcon,
      true
    );
  };

  const toggleAccordion = (index, parentAccordian, item, byIcon) => {
    dispatch(
      updateFlag({
        flag: "menuIdToRedirect",
        value: { index, parentAccordian, item, byIcon },
      })
    );
    dispatch(updateFlag({ flag: "selectedMenuId", value: item?.id || null }));

    if (!redirected) {
      setOpenAlertModal((pre) => !pre);
      if (!redirected) return;
    }

    setRedirected(true);

    if (byIcon) toggleEnlarge();
    if (parentAccordian) {
      setIsMenuOpen((prevIndex) => (prevIndex === index ? null : index));
    }

    const menuDataRoute = extractMenuName(menuItem, item.id);

    if (
      menuDataRoute?.[menuDataRoute.length - 1]?.menuType == "S" ||
      menuDataRoute?.[menuDataRoute.length - 1]?.menuType == "s"
    ) {
      const pageLink = menuDataRoute[menuDataRoute.length - 1].menuLink;
      router.push(`${pageLink}`);
      return false;
    }

    if (
      menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0 &&
      (menuDataRoute?.[0]?.isFormcontrol == "true" ||
        menuDataRoute?.[0]?.isFormcontrol == true)
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else if (
      menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0 &&
      (menuDataRoute?.[0]?.isFormcontrol == "false" ||
        menuDataRoute?.[0]?.isFormcontrol == false) &&
      menuDataRoute?.[0]?.menuLink === "/default"
    ) {
      router.push(`/dynamicReports?menuName=${item.reportId}`);
    } else if (
      menuDataRoute?.[0]?.menuLink === "/dynamicReports" &&
      menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0 &&
      (menuDataRoute?.[0]?.isFormcontrol == "false" ||
        menuDataRoute?.[0]?.isFormcontrol == false)
    ) {
      router.push(`/dynamicReports?menuName=${item.reportId}`);
    } else if (
      menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0 &&
      (menuDataRoute?.[0]?.isFormcontrol == "false" ||
        menuDataRoute?.[0]?.isFormcontrol == false)
    ) {
      router.push(`${menuDataRoute[0].menuLink}?menuName=${item.id}`);
    } else if (
      (menuDataRoute?.[menuDataRoute.length - 1]?.child == null ||
        menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0) &&
      menuDataRoute?.[0]?.menuLink == "/default"
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else if (
      (menuDataRoute?.[menuDataRoute.length - 1]?.child == null ||
        menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0) &&
      item.menuLink !== null &&
      item.menuLink !== "/default"
    ) {
      if (item.menuLink == "/invoiceControl") {
        router.push(
          `${item.menuLink}?menuName=${encryptUrlFun({
            id: item.id,
            menuName: item.menuName,
            parentMenuId: item.parentMenuId,
          })}`
        );
      } else {
        router.push(`${item.menuLink}?menuName=${item.id}`);
      }
    } else if (
      (menuDataRoute?.[menuDataRoute.length - 1]?.child == null ||
        menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0) &&
      (item.menuLink == null || item.menuLink == "/default")
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else {
      return;
    }

    setTimeout(() => toggleEnlarge(), 500);
  };

  const toggleAccordionMenus = (index, parentAccordian, item, byIcon) => {
    setRedirected(true);
    if (byIcon) toggleEnlarge();
    if (parentAccordian) {
      setIsMenuOpen((prevIndex) => (prevIndex === index ? null : index));
    }

    const menuDataRoute = extractMenuName(menuItem, item.id);

    if (
      menuDataRoute?.[menuDataRoute.length - 1]?.menuType == "S" ||
      menuDataRoute?.[menuDataRoute.length - 1]?.menuType == "s"
    ) {
      const pageLink = menuDataRoute[menuDataRoute.length - 1].menuLink;
      router.push(`${pageLink}`);
      return false;
    }

    if (
      menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0 &&
      (menuDataRoute?.[0]?.isFormcontrol == "true" ||
        menuDataRoute?.[0]?.isFormcontrol == true)
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else if (
      menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0 &&
      (menuDataRoute?.[0]?.isFormcontrol == "false" ||
        menuDataRoute?.[0]?.isFormcontrol == false) &&
      menuDataRoute?.[0]?.menuLink === "/default"
    ) {
      router.push(`/dynamicReports?menuName=${item.reportId}`);
    } else if (
      menuDataRoute?.[0]?.menuLink === "/dynamicReports" &&
      menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0 &&
      (menuDataRoute?.[0]?.isFormcontrol == "false" ||
        menuDataRoute?.[0]?.isFormcontrol == false)
    ) {
      router.push(`/dynamicReports?menuName=${item.reportId}`);
    } else if (
      menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0 &&
      (menuDataRoute?.[0]?.isFormcontrol == "false" ||
        menuDataRoute?.[0]?.isFormcontrol == false)
    ) {
      router.push(`${menuDataRoute[0].menuLink}?menuName=${item.id}`);
    } else if (
      (menuDataRoute?.[menuDataRoute.length - 1]?.child == null ||
        menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0) &&
      menuDataRoute?.[0]?.menuLink == "/default"
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else if (
      (menuDataRoute?.[menuDataRoute.length - 1]?.child == null ||
        menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0) &&
      item.menuLink !== null &&
      item.menuLink !== "/default"
    ) {
      router.push(`${item.menuLink}?menuName=${item.id}`);
    } else if (
      (menuDataRoute?.[menuDataRoute.length - 1]?.child == null ||
        menuDataRoute?.[menuDataRoute.length - 1]?.child?.length === 0) &&
      (item.menuLink == null || item.menuLink == "/default")
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else {
      return;
    }

    setTimeout(() => toggleEnlarge(), 500);
  };

  const onConfirm = async (conformData) => {
    if (conformData.value) {
      router.push("/404");
      setOpenModal((prev) => !prev);
    }
  };

  const itemsWithRandomIcons = useMemo(
    () =>
      (menuItem || []).map((item) => ({
        ...item,
        randomIcon: getRandomIcon(),
      })),
    [menuItem]
  );

  // ======================== MOBILE/TABLET GRID MENU ========================
  const categories = menuItem || [];

  const currentView = viewStack.length
    ? viewStack[viewStack.length - 1]
    : { title: "Menu", items: categories, level: 0 };

  const filteredItems = (currentView.items || []).filter((x) =>
    String(x?.menuName || "")
      .toLowerCase()
      .includes(String(searchText || "").toLowerCase())
  );

  const openDrawer = () => {
    setDrawerOpen(true);
    setViewStack([]);
    setSearchText("");
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setViewStack([]);
    setSearchText("");
  };

  const pushView = (title, items, level) => {
    setViewStack((prev) => [...prev, { title, items, level }]);
    setSearchText("");
  };

  const popView = () => {
    setViewStack((prev) => prev.slice(0, -1));
    setSearchText("");
  };

  const onTilePress = (it, idx) => {
    if (it?.child && it.child.length > 0) {
      pushView(it?.menuName || "Menu", it.child, (currentView.level || 0) + 1);
      return;
    }
    toggleAccordion(idx, true, it, false);
    navigatedData(it);
    closeDrawer();
  };

  // ✅ Premium tile: NO icon background card, icon uses TEXT color
  const PremiumTile = ({ it, idx }) => {
    const count = it?.child?.length || 0;
    const IconComp = pickIconComponent(it?.menuName);
    const hasImageIcon = !!it?.icon;

    return (
      <button
        onClick={() => onTilePress(it, idx)}
        className="w-full active:scale-[0.985] transition"
        style={{
          background: "transparent",
          borderRadius: 18,
          padding: 10,
          minHeight: 140,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          outline: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = mTokens.tileHoverBg;
          e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${mTokens.tileRing}`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.boxShadow = "none";
        }}
        onPointerDown={(e) => {
          e.currentTarget.style.background = mTokens.tileActiveBg;
          e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${mTokens.tileRing}`;
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.background = mTokens.tileHoverBg;
          e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${mTokens.tileRing}`;
        }}
      >
        {/* count bubble */}
        {count > 0 && (
          <div
            style={{
              position: "absolute",
              top: 8,
              right: 10,
              height: 24,
              minWidth: 24,
              padding: "0 8px",
              borderRadius: 999,
              background: mTokens.bubbleBg,
              border: `1px solid ${mTokens.bubbleBorder}`,
              color: mTokens.bubbleText,
              fontSize: 11,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: mTokens.bubbleShadow,
              zIndex: 2,
            }}
          >
            {count}
          </div>
        )}

        {/* ICON (bigger + forced) */}
        <div
          className="premiumTileIcon"
          style={{
            width: 132,
            height: 132,
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: mTokens.labelText,
            textShadow: "0 1px 0 rgba(2,6,23,0.22)",
            lineHeight: 0,
          }}
        >
          {hasImageIcon ? (
            // ✅ Most reliable for next/image sizing:
            // fixed-size wrapper + fill
            <div
              style={{
                width: 92,
                height: 92,
                position: "relative",
                flex: "0 0 auto",
              }}
            >
              <Image
                src={it.icon}
                alt={it?.menuName || "menu"}
                fill
                sizes="92px"
                style={{
                  objectFit: "contain",
                  filter: imageToTextColorFilter,
                  opacity: 0.95,
                  display: "block",
                }}
              />
            </div>
          ) : (
            // ✅ SVG icon (heroicons) - global svg rule is overridden below
            <IconComp strokeWidth={2.2} style={{ display: "block" }} />
          )}
        </div>

        {/* name */}
        <div
          className="mt-1 text-[12.5px] font-semibold leading-[1.1] text-center"
          style={{
            color: mTokens.labelText,
            letterSpacing: "0.2px",
            textShadow: "0 1px 0 rgba(2,6,23,0.20)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 30,
            maxWidth: "100%",
          }}
          title={it?.menuName}
        >
          {it?.menuName}
        </div>

        {/* hint */}

      </button>
    );
  };

  return (
    <>
      {/* ✅ FIX: override your global `svg { width:0.5em !important; ... }` ONLY for tiles */}
      <style jsx global>{`
        .mobileMenuInput::placeholder {
          color: rgba(255, 255, 255, 0.62);
        }

        /* This beats your global svg !important rule */
        .premiumTileIcon svg {
          width: 50px !important;
          height: 90px !important;
        }
      `}</style>

      {/* ✅ MOBILE/TABLET */}
      {device !== "desktop" ? (
        <>
          {/* FAB */}
          <button
            onClick={openDrawer}
            className="fixed z-[99990] right-4 bottom-4 w-[54px] h-[54px] rounded-full flex items-center justify-center active:scale-[0.98] transition"
            style={{
              background: mTokens.fabBg,
              color: "white",
              boxShadow: mTokens.fabShadow,
              border: "1px solid rgba(255,255,255,0.18)",
            }}
            aria-label="Open menu"
          >
            <Bars3Icon className="w-7 h-7" />
          </button>

          {/* overlay */}
          <div
            className={`fixed inset-0 z-[99999] transition ${
              drawerOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            {/* backdrop */}
            <div
              className="absolute inset-0"
              style={{
                background: mTokens.backdrop,
                backdropFilter: "blur(14px)",
              }}
              onClick={closeDrawer}
            />

            {/* sheet */}
            <div
              className={`absolute inset-x-0 bottom-0 transition-transform duration-300 ${
                drawerOpen ? "translate-y-0" : "translate-y-full"
              }`}
              style={{
                background: mTokens.sheetBg,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                border: `1px solid ${mTokens.headerBorder}`,
                boxShadow: mTokens.sheetShadow,
                overflow: "hidden",
              }}
            >
              {/* HEADER */}
              <div
                style={{
                  background: mTokens.sheetBg,
                  borderBottom: `1px solid ${mTokens.divider}`,
                }}
              >
                {/* handle */}
                <div className="pt-3 flex justify-center">
                  <div
                    className="w-12 h-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.28)" }}
                  />
                </div>

                <div className="px-4 pt-2 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {viewStack.length > 0 ? (
                      <button
                        onClick={popView}
                        className="w-10 h-10 rounded-2xl flex items-center justify-center active:scale-[0.98] transition"
                        style={{
                          background: mTokens.surface,
                          border: `1px solid ${mTokens.chipBorder}`,
                          color: "rgba(255,255,255,0.92)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                        }}
                        aria-label="Back"
                      >
                        <ArrowLeftIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center"
                        style={{
                          background: mTokens.surface,
                          border: `1px solid ${mTokens.chipBorder}`,
                          color: "rgba(255,255,255,0.92)",
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                        }}
                      >
                        <Bars3Icon className="w-5 h-5" />
                      </div>
                    )}

                    <div className="leading-tight">
                      <div className="text-[14px] font-semibold tracking-wide text-white">
                        {currentView.title || "Menu"}
                      </div>
                      <div className="text-[11px] text-white/75">
                        {viewStack.length === 0 ? "Categories" : "Options"}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={closeDrawer}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center active:scale-[0.98] transition"
                    style={{
                      background: mTokens.surface,
                      border: `1px solid ${mTokens.chipBorder}`,
                      color: "rgba(255,255,255,0.92)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                    }}
                    aria-label="Close menu"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* search */}
                <div className="px-4 pb-4">
                  <div
                    className="h-[48px] rounded-2xl flex items-center gap-2 px-3"
                    style={{
                      background: mTokens.searchBg,
                      border: `1px solid ${mTokens.searchBorder}`,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
                    }}
                  >
                    <MagnifyingGlassIcon
                      className="w-5 h-5"
                      style={{ color: "rgba(255,255,255,0.86)" }}
                    />
                    <input
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder={
                        viewStack.length === 0
                          ? "Search categories..."
                          : "Search menu..."
                      }
                      className="mobileMenuInput w-full h-full bg-transparent outline-none text-[13px]"
                      style={{ color: mTokens.searchText }}
                    />
                    {searchText ? (
                      <button
                        className="w-9 h-9 rounded-2xl flex items-center justify-center active:scale-[0.98] transition"
                        style={{
                          background: mTokens.surface2,
                          border: `1px solid ${mTokens.chipBorder}`,
                          color: "rgba(255,255,255,0.92)",
                        }}
                        onClick={() => setSearchText("")}
                        aria-label="Clear search"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[11px] text-white/75">
                      {filteredItems?.length || 0} results
                    </div>
                    <div
                      className="text-[11px] px-2 py-1 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        border: `1px solid rgba(255,255,255,0.14)`,
                        color: "rgba(255,255,255,0.86)",
                      }}
                    >
                      Grid menu
                    </div>
                  </div>
                </div>
              </div>

              {/* BODY */}
              <div
                className="px-4 pt-4 pb-6 overflow-y-auto"
                style={{
                  height: device === "tablet" ? "70vh" : "64vh",
                  background: "transparent",
                }}
              >
                <div
                  className={`grid ${
                    device === "tablet" ? "grid-cols-4" : "grid-cols-3"
                  }`}
                  style={{
                    gap: device === "tablet" ? 14 : 12,
                  }}
                >
                  {filteredItems.map((it, idx) => (
                    <PremiumTile key={idx} it={it} idx={idx} />
                  ))}
                </div>

                {filteredItems?.length === 0 && (
                  <div className="py-10 text-center">
                    <div className="text-white/85 text-[13px] font-semibold">
                      No matching menu
                    </div>
                    <div className="text-white/70 text-[12px] mt-1">
                      Try a different keyword.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* ✅ DESKTOP: keep existing sidebar exactly as is */}
      {device === "desktop" ? (
        <Card
          className={` bg-[var(--sidebarBg)] overflow-x-hidden  rounded-none  h-[calc(100vh-0rem)] min-w-fit shadow-xl shadow-blue-gray-900/5 overflow-y-auto transform-distance duration-200
          ${
            isEnlarge
              ? `w-auto sidebar-enlarged  ${styles.thinScrollBar2}`
              : ` w-[60px] overflow-x-hidden ${styles.thinScrollBar2} `
          } `}
        >
          <div className={styles.thinScrollBar2}>
            <div
              className={`  bg-[var(--sidebarBg)] mt-3  flex items-center ${
                isEnlarge ? "" : "justify-center"
              } `}
            >
              <div
                className={` cursor-pointer ${isEnlarge ? " ml-4 " : ""} `}
                onClick={() => toggleEnlarge()}
              >
                <LightTooltip title={`${isEnlarge ? "Collapse" : "Expand"}`}>
                  <Image
                    style={{ color: themeDetails.onPrimary }}
                    src={gridIcon}
                    alt="sysconLogo"
                    className="w-[16px]"
                    priority
                  />
                </LightTooltip>
              </div>
            </div>

            <List
              className={` bg-[var(--sidebarBg)]
              } flex-grow p-0 mt-2 px-2 flex overflow-y-auto overflow-x-hidden ${
                isEnlarge ? "min-w-[0px]" : "min-w-[0px]"
              } `}
            >
              {isEnlarge
                ? menuItem?.map((item, index) => {
                    return (
                      <Accordion
                        open={isMenuOpen === index}
                        key={index}
                        animate={{
                          mount: { scale: 1 },
                          unmount: { scale: 0.9 },
                        }}
                        className={`rounded-none p-0 m-0 `}
                        icon={
                          item.child &&
                          item.child.length > 0 &&
                          item.menuName !== null && (
                            <ChevronDownIcon
                              strokeWidth={2.5}
                              className={` mx-auto mr-2 h-4 w-4 transition-transform ${
                                isMenuOpen === index ? "rotate-180" : ""
                              } text-[var(--sidebarTextColor)] group-hover:text-[--sidebarTextColorHover] font-[var(--sidebarFontWeight)]  `}
                              style={{ fontSize: "var(--sidebarFontSize)" }}
                            />
                          )
                        }
                      >
                        <ListItem
                          className={` p-0 rounded-none border-b-[1px]  border-opacity-50  m-0  h-[28px]  hover:bg-[var(--sidebarBgHover)] `}
                        >
                          <AccordionHeader
                            className={`border-b-0 p-0 group h-full hover:bg-[var(--sidebarBgHover)] `}
                            onClick={() => {
                              toggleAccordion(index, true, item),
                                navigatedData(item);
                            }}
                          >
                            <span>
                              <Typography
                                className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto pl-1  rounded-none `}
                                style={{ fontSize: "var(--sidebarFontSize)" }}
                              >
                                {item?.menuName?.length > 20 ? (
                                  <LightTooltip
                                    key={index}
                                    title={item.menuName}
                                    placement="right-start"
                                  >
                                    {`${item?.menuName}`}
                                  </LightTooltip>
                                ) : (
                                  item?.menuName
                                )}
                              </Typography>
                            </span>
                          </AccordionHeader>
                        </ListItem>

                        {isMenuOpen === index &&
                          item.child &&
                          item.child.length > 0 && (
                            <AccordionBody
                              className={`bg-[var(--sidebarBg)] p-0 m-0 `}
                            >
                              <ChildMenuSection
                                item={item}
                                index={index}
                                navigatedData={navigatedData}
                                toggleAccordion={toggleAccordion}
                              />
                            </AccordionBody>
                          )}
                      </Accordion>
                    );
                  })
                : itemsWithRandomIcons?.map((item, index) => (
                    <LightTooltip
                      key={index}
                      title={item.menuName}
                      placement="right-start"
                    >
                      <div
                        key={index}
                        className={`hover:bg-[var(--sidebarBgHover)] ${styles.icon} ${styles.blueicon} group w-auto cursor-pointer flex justify-center relative py-0 items-center h-[28px] border-b-[1px] border-opacity-50 hover:bg-transparent`}
                      >
                        <Image
                          style={{ color: themeDetails.onPrimary }}
                          src={item.icon ? item.icon : item.randomIcon}
                          priority={false}
                          className="w-[16px] h-[16px] group-hover:filter-custom-blue "
                          onClick={() => toggleAccordion(index, true, item, true)}
                          alt={item.menuName}
                        />
                      </div>
                    </LightTooltip>
                  ))}
            </List>
          </div>

          {openModal && (
            <CustomeModal
              setOpenModal={setOpenModal}
              openModal={openModal}
              onConfirm={onConfirm}
            />
          )}

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
        </Card>
      ) : null}
    </>
  );
}

// =================== Desktop nested sections (UNCHANGED) ===================
function ChildMenuSection(props) {
  const { item, index, navigatedData, toggleAccordion } = props;
  const [openOption, setOpenOption] = useState(null);

  const handleOptionClick = (optionIndex) => {
    setOpenOption((prevIndex) =>
      prevIndex === optionIndex ? null : optionIndex
    );
  };

  return (
    <List className={`p-0 bg-[var(--sidebarBg)] ml-4 min-w-fit w-auto `}>
      {item.child.map((option, optionIndex) => (
        <React.Fragment key={optionIndex}>
          <ListItem
            key={optionIndex}
            className={` group hover:bg-[var(--sidebarBgHover)]  flex justify-between p-0 px-2 ml-1 mr-1 h-[30px] rounded-none border-b-[1px]  border-opacity-50 w-auto ${
              option.child && option.child.length > 0 ? "cursor-pointer" : ""
            } `}
            onClick={() => {
              toggleAccordion(optionIndex, false, option);
              handleOptionClick(optionIndex);
              navigatedData(option);
            }}
          >
            <span>
              <Typography
                className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto pl-0.5 pr-0.5 rounded-none  `}
                style={{ fontSize: "var(--sidebarFontSize)" }}
                onClick={() => navigatedData(option)}
              >
                {option?.menuName?.length > 20 ? (
                  <LightTooltip
                    key={index}
                    title={option?.menuName}
                    placement="right-start"
                  >
                    {`${option?.menuName}`}
                  </LightTooltip>
                ) : (
                  option?.menuName
                )}
              </Typography>
            </span>

            {option.child && option.child.length > 0 && (
              <ChevronDownIcon
                className={` text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]   h-4 w-4 transition-transform  cursor-pointer ${
                  openOption === optionIndex ? "rotate-180" : ""
                }`}
                style={{ fontSize: "var(--sidebarFontSize)" }}
              />
            )}
          </ListItem>

          {openOption === optionIndex && (
            <List className="p-0 ml-4 min-w-fit w-auto ">
              {option?.child?.map((childOption, childOptionIndex) => (
                <React.Fragment key={childOptionIndex}>
                  <SubChildMenuSection
                    childOption={childOption}
                    index={index}
                    childOptionIndex={childOptionIndex}
                    navigatedData={navigatedData}
                    toggleAccordion={toggleAccordion}
                  />
                </React.Fragment>
              ))}
            </List>
          )}
        </React.Fragment>
      ))}
    </List>
  );
}

ChildMenuSection.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  navigatedData: PropTypes.func,
  toggleAccordion: PropTypes.func,
};

function SubChildMenuSection(props) {
  const {
    childOption,
    index,
    childOptionIndex,
    navigatedData,
    toggleAccordion,
  } = props;
  const [openChildOption, setOpenChildOption] = useState(null);

  const handleChildOptionClick = (idx) => {
    setOpenChildOption((prevIndex) => (prevIndex === idx ? null : idx));
  };

  return (
    <>
      <ListItem
        className={`bg-[var(--sidebarBg)] group rounded-none hover:bg-[var(--sidebarBgHover)] p-0 ml-4 px-2 mr-2 h-[30px] border-b-[1px]  border-opacity-50 flex justify-between  items-center w-auto ${
          childOption.child && childOption.child.length > 0
            ? "cursor-pointer"
            : ""
        }`}
        onClick={() => {
          toggleAccordion(childOptionIndex, false, childOption);
          handleChildOptionClick(childOptionIndex);
          navigatedData(childOption);
        }}
      >
        <span>
          <Typography
            className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto pl-0.5 pr-0.5 rounded-none`}
            style={{ fontSize: "var(--sidebarFontSize)" }}
            onClick={() => navigatedData(childOption)}
          >
            {childOption?.menuName?.length > 20 ? (
              <LightTooltip
                key={index}
                title={childOption?.menuName}
                placement="right-start"
              >
                {`${childOption?.menuName}`}
              </LightTooltip>
            ) : (
              childOption?.menuName
            )}
          </Typography>
        </span>

        {childOption.child && childOption.child.length > 0 && (
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]   h-4 w-4 transition-transform ${
              openChildOption === childOptionIndex ? "rotate-180" : ""
            }`}
            style={{ fontSize: "var(--sidebarFontSize)" }}
          />
        )}
      </ListItem>

      {childOption.child && openChildOption === childOptionIndex && (
        <List className={`bg-[var(--sidebarBg)] p-0 ml-6 min-w-fit w-auto `}>
          {childOption.child.map((grandChildOption, grandChildOptionIndex) => (
            <React.Fragment key={grandChildOptionIndex}>
              <ThiredLevelMenuSection
                index={index}
                grandChildOption={grandChildOption}
                grandChildOptionIndex={grandChildOptionIndex}
                childOptionIndex={childOptionIndex}
                openChildOption={openChildOption}
                navigatedData={navigatedData}
                toggleAccordion={toggleAccordion}
              />
            </React.Fragment>
          ))}
        </List>
      )}
    </>
  );
}

SubChildMenuSection.propTypes = {
  childOption: PropTypes.object,
  index: PropTypes.number,
  childOptionIndex: PropTypes.number,
  navigatedData: PropTypes.func,
  toggleAccordion: PropTypes.func,
};

function ThiredLevelMenuSection(props) {
  const {
    grandChildOption,
    grandChildOptionIndex,
    childOptionIndex,
    openChildOption,
    navigatedData,
    toggleAccordion,
    index,
  } = props;

  const [openSubChildOption, setOpenSubChildOption] = useState(null);

  const handleSubChildOptionClick = (idx) => {
    setOpenSubChildOption((prevIndex) => (prevIndex === idx ? null : idx));
  };

  return (
    <>
      <ListItem
        key={grandChildOptionIndex}
        className={` group hover:bg-[var(--sidebarBgHover)] rounded-none p-0 px-2 ml-3 mr-3 h-[30px] border-b-[1px] border-opacity-50 flex justify-between w-auto `}
        onClick={() => {
          toggleAccordion(grandChildOptionIndex, false, grandChildOption);
          handleSubChildOptionClick(grandChildOptionIndex);
          navigatedData(grandChildOption);
        }}
      >
        <span>
          <Typography
            className={` text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto rounded-none `}
            style={{ fontSize: "var(--sidebarFontSize)" }}
            onClick={() => navigatedData(grandChildOption)}
          >
            {grandChildOption?.menuName?.length > 20 ? (
              <LightTooltip
                key={index}
                title={grandChildOption?.menuName}
                placement="right-start"
              >
                {`${grandChildOption?.menuName}`}
              </LightTooltip>
            ) : (
              grandChildOption?.menuName
            )}
          </Typography>
        </span>

        {grandChildOption.child && grandChildOption.child.length > 0 && (
          <ChevronDownIcon
            strokeWidth={2.5}
            className={`text-[var(--sidebarTextColor)] font-[var(--sidebarFontWeight)]  h-4 w-4 transition-transform mr-10  ${
              openSubChildOption === grandChildOptionIndex ? "rotate-180" : ""
            }`}
            style={{ fontSize: "var(--sidebarFontSize)" }}
          />
        )}

        {grandChildOption?.child &&
          openChildOption === grandChildOptionIndex &&
          grandChildOption?.child?.map((great, greatIndex) => (
            <React.Fragment key={greatIndex}>
              <ListItem
                key={grandChildOptionIndex}
                className={` bg-[var(--sidebarBg)] group  rounded-none p-0 m-0 h-[30px] border-b-[1px] hover:bg-[var(--table-hover-bg)]  border-opacity-50 flex justify-between w-full `}
                onClick={() => {
                  toggleAccordion(index, false, great), navigatedData(great);
                }}
              >
                <span>
                  <Typography
                    className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto rounded-none `}
                    style={{ fontSize: "var(--sidebarFontSize)" }}
                    onClick={() => navigatedData(great)}
                  >
                    {great?.menuName?.length > 20 ? (
                      <LightTooltip
                        key={index}
                        title={great?.menuName}
                        placement="right-start"
                      >
                        {`${great?.menuName}`}
                      </LightTooltip>
                    ) : (
                      great?.menuName
                    )}
                  </Typography>
                </span>

                {great.child && great.child.length > 0 && (
                  <ChevronDownIcon
                    strokeWidth={2.5}
                    className={`text-[var(--sidebarTextColor)] font-[var(--sidebarFontWeight)]  h-4 w-4 transition-transform mr-10 ${
                      openChildOption === childOptionIndex ? "rotate-180" : ""
                    } group-hover:text-[var(--sidebarTextColorHover)] `}
                    style={{ fontSize: "var(--sidebarFontSize)" }}
                  />
                )}
              </ListItem>
            </React.Fragment>
          ))}
      </ListItem>
    </>
  );
}

ThiredLevelMenuSection.propTypes = {
  index: PropTypes.any,
  grandChildOption: PropTypes.any,
  grandChildOptionIndex: PropTypes.any,
  childOptionIndex: PropTypes.any,
  openChildOption: PropTypes.any,
  navigatedData: PropTypes.any,
  toggleAccordion: PropTypes.func,
};
