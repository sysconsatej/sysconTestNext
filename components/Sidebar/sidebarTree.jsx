"use client";
/* eslint-disable */
import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "@/components/common.module.css";
import LightTooltip from "@/components/Tooltip/customToolTip";
// import AlertModal from "../Modal/alertModal";
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
import { ChevronDownIcon } from "@heroicons/react/24/outline";
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
  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  // const [flattenedOptions, setFlattenedOptions] = useState([]);
  const [menuItem, setMenuItem] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const [redirected, setRedirected] = useState(true);
  const [combinedRoleAndMenuIdsArray, setCombinedRoleAndMenuIdsArray] =
    useState([]);
  const [defaultCompanyBranch, setDefaultCompanyBranch] = useState([]);
  // const [branch, setBranch] = useState(defaultCompanyBranch);
  const router = useRouter();
  // Toggle sidebar
  const toggleEnlarge = () => {
    setIsEnlarge(!isEnlarge);
  };
  const [isError, setIsError] = useState(false);
  const [paraText, setParaText] = useState("");
  const [typeofModal, setTypeofModal] = useState("onClose");
  const [labelName, setLabelName] = useState("");
  const [IndexType, setIndexType] = useState(null);
  const [ParentAccordian, setParentAccordian] = useState(false);
  const [ItemType, setItem] = useState(false);
  const [ByIcon, setByIcon] = useState(false);
  const dispatch = useDispatch();
  const isRedirected = useSelector((state) => state?.counter?.isRedirection);
  const menuIdToRedirect = useSelector(
    (state) => state?.counter?.menuIdToRedirect
  );
  useEffect(() => {
    console.log("isRedirected is now", isRedirected);
    setRedirected(isRedirected);
  }, [isRedirected]);

  // useEffect(() => {
  //   console.log("Default branch - ",branch);
  // },[branch])

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
  const getRandomIcon = () => {
    const randomIndex = Math.floor(Math.random() * icons.length);
    return icons[randomIndex];
  };

  useEffect(() => {
    async function fetchUserData() {
      const getUser = localStorage.getItem("userData");
      let userData, userEmail, defaultCompanyBranch;

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
        setDefaultCompanyBranch(userData[0].defaultBranchId); // Assuming defaultCompanyBranch is a property in userData
      } else {
        console.error("Invalid user data structure or email is missing");
        return;
      }

      const userRequestBody = {
        tableName: "tblUser",
        whereCondition: {
          email: userEmail,
          status: 1,
        },
        projection: {},
      };

      // console.log("Request", userRequestBody);

      try {
        const fetchedUserData = await fetchDataApi(userRequestBody);
        //console.log("Fetched User Data", fetchedUserData.data[0]);

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
            whereCondition: {
              _id: roleId,
              status: 1,
            },
            projection: {},
          };

          try {
            const fetchedRoleData = await fetchDataApi(roleRequestBody);
            //  console.log("Fetched Role Data for Role ID", roleId, fetchedRoleData.data[0]);
            return fetchedRoleData.data[0];
          } catch (error) {
            console.error(
              "Failed to fetch role data for Role ID",
              roleId,
              error
            );
            return null;
          }
        });

        const allRoleData = await Promise.all(roleDataPromises);
        //console.log("All Fetched Role Data", allRoleData);

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
        //console.log("Combined Menu IDs Array:", combinedMenuIdsArray);

        const arr = [...roleIdsArray, ...combinedMenuIdsArray];
        setCombinedRoleAndMenuIdsArray(arr);

        //onsole.log("Combined Role and Menu IDs Array:", arr);

        // Additional logic based on your application's requirements
        if (defaultCompanyBranch === companyBranchId) {
          // Handle logic when company branch matches
        } else {
          // Handle logic when company branch doesn't match
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }

    fetchUserData();
  }, []); // Empty dependency array to run only once on component mount

  useEffect(() => {
    // if (combinedRoleAndMenuIdsArray.length === 0) {
    //   // Handle case where combinedRoleAndMenuIdsArray is empty
    //   //console.log("Combined Role and Menu IDs Array is empty");
    //   return;
    // }

    const requestBodyMenu = {
      whereCondition: {
        _id: combinedRoleAndMenuIdsArray,
      },
      projection: {},
    };

    async function fetchData() {
      try {
        const apiResponse = await sideBarMenu(requestBodyMenu);
        setMenuItem(apiResponse);
        //console.log("apiResponse - ", apiResponse);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    }

    fetchData();
  }, [combinedRoleAndMenuIdsArray]); // Dependency on combinedRoleAndMenuIdsArray

  function extractMenuName(items, id, parentPath = []) {
    for (const item of items) {
      // Construct the current path including this item's menuName
      const currentPath = [...parentPath, item];

      // Check the current item
      if (item.id === id) {
        return currentPath;
      }

      // Search in options if they exist
      // if (item.options && item.options.length > 0) {
      //   const result = extractMenuName(item.options, id, currentPath);
      //   if (result) return result;
      // }

      // Search in child if they exist
      if (item.child && item.child.length > 0) {
        const result = extractMenuName(item.child, id, currentPath);
        if (result) return result;
      }
    }

    // Item not found in this branch of the hierarchy
    return null;
  }

  console.log("jdbvdn --- sample test99");

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

  // Function to toggle the open/close state of an accordion item
  const toggleAccordion = (index, parentAccordian, item, byIcon) => {
    dispatch(
      updateFlag({
        flag: "menuIdToRedirect",
        value: {
          index,
          parentAccordian,
          item,
          byIcon,
        },
      })
    );
    dispatch(
      updateFlag({
        flag: "selectedMenuId",
        value: item?.id || null,
      })
    );
    if (!redirected) {
      setOpenAlertModal((pre) => !pre);
      if (!redirected) return;
    }
    setRedirected(true);
    if (byIcon) {
      toggleEnlarge();
    }
    if (parentAccordian) {
      setIsMenuOpen((prevIndex) => {
        return prevIndex === index ? null : index;
      });
    }

    const menuDataRoute = extractMenuName(menuItem, item.id);
    console.log("items", item);

    if (
      menuDataRoute[menuDataRoute.length - 1].menuType == "S" ||
      menuDataRoute[menuDataRoute.length - 1].menuType == "s"
    ) {
      const pageLink = menuDataRoute[menuDataRoute.length - 1].menuLink;
      router.push(`${pageLink}`);
      return false;
    }
    if (
      menuDataRoute[menuDataRoute.length - 1].child?.length === 0 &&
      (menuDataRoute[0].isFormcontrol == "true" ||
        menuDataRoute[0].isFormcontrol == true)
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else if (
      menuDataRoute[menuDataRoute.length - 1].child?.length === 0 &&
      (menuDataRoute[0].isFormcontrol == "false" ||
        menuDataRoute[0].isFormcontrol == false) &&
      menuDataRoute[0].menuLink === "/default"
    ) {
      router.push(`/dynamicReports?menuName=${item.reportId}`);
    } else if (
      menuDataRoute[0].menuLink === "/dynamicReports" &&
      menuDataRoute[menuDataRoute.length - 1].child?.length === 0 &&
      (menuDataRoute[0].isFormcontrol == "false" ||
        menuDataRoute[0].isFormcontrol == false)
    ) {
      router.push(`/dynamicReports?menuName=${item.reportId}`);
    } else if (
      menuDataRoute[menuDataRoute.length - 1].child?.length === 0 &&
      (menuDataRoute[0].isFormcontrol == "false" ||
        menuDataRoute[0].isFormcontrol == false)
    ) {
      router.push(`${menuDataRoute[0].menuLink}?menuName=${item.id}`);
    } else if (
      (menuDataRoute[menuDataRoute.length - 1].child == null ||
        menuDataRoute[menuDataRoute.length - 1].child?.length === 0) &&
      menuDataRoute[0].menuLink == "/default"
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else if (
      (menuDataRoute[menuDataRoute.length - 1].child == null ||
        menuDataRoute[menuDataRoute.length - 1].child?.length === 0) &&
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
      (menuDataRoute[menuDataRoute.length - 1].child == null ||
        menuDataRoute[menuDataRoute.length - 1].child?.length === 0) &&
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
    setTimeout(() => {
      toggleEnlarge();
    }, 500);
  };

  const toggleAccordionMenus = (index, parentAccordian, item, byIcon) => {
    setRedirected(true);
    if (byIcon) {
      toggleEnlarge();
    }
    if (parentAccordian) {
      setIsMenuOpen((prevIndex) => {
        return prevIndex === index ? null : index;
      });
    }

    const menuDataRoute = extractMenuName(menuItem, item.id);
    console.log("items", item);

    if (
      menuDataRoute[menuDataRoute.length - 1].menuType == "S" ||
      menuDataRoute[menuDataRoute.length - 1].menuType == "s"
    ) {
      const pageLink = menuDataRoute[menuDataRoute.length - 1].menuLink;
      router.push(`${pageLink}`);
      return false;
    }
    if (
      menuDataRoute[menuDataRoute.length - 1].child?.length === 0 &&
      (menuDataRoute[0].isFormcontrol == "true" ||
        menuDataRoute[0].isFormcontrol == true)
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else if (
      menuDataRoute[menuDataRoute.length - 1].child?.length === 0 &&
      (menuDataRoute[0].isFormcontrol == "false" ||
        menuDataRoute[0].isFormcontrol == false) &&
      menuDataRoute[0].menuLink === "/default"
    ) {
      router.push(`/dynamicReports?menuName=${item.reportId}`);
    } else if (
      menuDataRoute[0].menuLink === "/dynamicReports" &&
      menuDataRoute[menuDataRoute.length - 1].child?.length === 0 &&
      (menuDataRoute[0].isFormcontrol == "false" ||
        menuDataRoute[0].isFormcontrol == false)
    ) {
      router.push(`/dynamicReports?menuName=${item.reportId}`);
    } else if (
      menuDataRoute[menuDataRoute.length - 1].child?.length === 0 &&
      (menuDataRoute[0].isFormcontrol == "false" ||
        menuDataRoute[0].isFormcontrol == false)
    ) {
      router.push(`${menuDataRoute[0].menuLink}?menuName=${item.id}`);
    } else if (
      (menuDataRoute[menuDataRoute.length - 1].child == null ||
        menuDataRoute[menuDataRoute.length - 1].child?.length === 0) &&
      menuDataRoute[0].menuLink == "/default"
    ) {
      router.push(
        `/formControl?menuName=${encryptUrlFun({
          id: item.id,
          menuName: item.menuName,
          parentMenuId: item.parentMenuId,
        })}`
      );
    } else if (
      (menuDataRoute[menuDataRoute.length - 1].child == null ||
        menuDataRoute[menuDataRoute.length - 1].child?.length === 0) &&
      item.menuLink !== null &&
      item.menuLink !== "/default"
    ) {
      router.push(`${item.menuLink}?menuName=${item.id}`);
    } else if (
      (menuDataRoute[menuDataRoute.length - 1].child == null ||
        menuDataRoute[menuDataRoute.length - 1].child?.length === 0) &&
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
    setTimeout(() => {
      toggleEnlarge();
    }, 500);
  };

  const onConfirm = async (conformData) => {
    if (conformData.value) {
      router.push("/404");
      setOpenModal((prev) => !prev);
    }
  };

  function findItemByIdWithParents(items, id, parentPath = []) {
    for (const item of items) {
      // Construct the current path including this item's menuName
      const currentPath = [...parentPath, item.menuName];

      // Check the current item
      if (item.id === id) {
        // Return the breadcrumb path including the matched item's menuName
        return currentPath.join(",");
      }

      // Search in options if they exist
      // if (item.options && item.options.length > 0) {
      //   const result = findItemByIdWithParents(item.options, id, currentPath);
      //   if (result) return result;
      // }

      // Search in child if they exist
      if (item.child && item.child.length > 0) {
        const result = findItemByIdWithParents(item.child, id, currentPath);
        if (result) return result;
      }
    }

    // Item not found in this branch of the hierarchy
    return null;
  }
  const navigatedData = (menuValue) => {
    const breadCrumbs = findItemByIdWithParents(menuItem, menuValue.id);

    // Assuming you want to update breadcrumbs and localStorage only if breadData is found
    if (breadCrumbs) {
      // Assuming updatedOpenItems is correctly updated with the new open menu item state
      localStorage.setItem("breadCrumbs", JSON.stringify(breadCrumbs));
      sessionStorage.setItem("breadCrumbs", JSON.stringify(breadCrumbs));
    }
  };
  const itemsWithRandomIcons = menuItem.map((item) => ({
    ...item,
    randomIcon: getRandomIcon(),
  }));

  return (
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
                style={{
                  color: themeDetails.onPrimary,
                }}
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
            } flex-grow p-0 mt-2 px-2 flex overflow-y-auto overflow-x-hidden  ${
              // isEnlarge ? "min-w-[220px]" : "min-w-[0px]"
              isEnlarge ? "min-w-[0px]" : "min-w-[0px]"
            } `}
        >
          {isEnlarge
            ? menuItem?.map((item, index) => {
                return (
                  <Accordion
                    open={isMenuOpen === index}
                    key={index}
                    animate={{ mount: { scale: 1 }, unmount: { scale: 0.9 } }}
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
                        {item.child && item.child.length === 0 ? (
                          <span>
                            <Typography
                              className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto pl-1  rounded-none `}
                              style={{ fontSize: "var(--sidebarFontSize)" }}
                            >
                              {item?.menuName.length > 20 ? (
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
                        ) : (
                          <span>
                            <Typography
                              className={` text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto pl-1  rounded-none `}
                              style={{ fontSize: "var(--sidebarFontSize)" }}
                            >
                              {item?.menuName.length > 20 ? (
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
                        )}
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
                            isMenuOpen={isMenuOpen}
                            setIsMenuOpen={setIsMenuOpen}
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
                      style={{
                        color: themeDetails.onPrimary,
                      }}
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
      {/* <CustomeModal /> */}
      {openModal && (
        <CustomeModal
          setOpenModal={setOpenModal}
          openModal={openModal}
          onConfirm={onConfirm}
        />
      )}
      {/* {openAlertModal && (
        <AlertModal
          setOpenAlertModal={setOpenAlertModal}
          openAlertModal={openAlertModal}
        />
      )} */}
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
    </Card>
  );
}

ChildMenuSection.propTypes = {
  item: PropTypes.object,
  index: PropTypes.number,
  navigatedData: PropTypes.func,
  toggleAccordion: PropTypes.func,
  isMenuOpen: PropTypes.number,
};
function ChildMenuSection(props) {
  const { item, index, navigatedData, toggleAccordion, isMenuOpen } = props;
  const [openOption, setOpenOption] = useState(null);

  const handleOptionClick = (optionIndex) => {
    setOpenOption((prevIndex) =>
      prevIndex === optionIndex ? null : optionIndex
    );
  };

  return (
    <>
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
              {item.isFormcontrol ? (
                <span>
                  <Typography
                    className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto pl-0.5 pr-0.5 rounded-none  `}
                    style={{ fontSize: "var(--sidebarFontSize)" }}
                    onClick={() => navigatedData(option)}
                  >
                    {/* option menuName corrected */}
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
              ) : (
                <span>
                  <Typography
                    className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto pl-0.5 pr-0.5  rounded-none `}
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
              )}

              {option.child && option.child.length > 0 && (
                <>
                  <ChevronDownIcon
                    className={` text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]   h-4 w-4 transition-transform  cursor-pointer ${
                      openOption === optionIndex ? "rotate-180" : ""
                    }`}
                    style={{ fontSize: "var(--sidebarFontSize)" }}
                  />
                </>
              )}
            </ListItem>
            {openOption === optionIndex && (
              <List className="p-0 ml-4 min-w-fit w-auto ">
                {option?.child?.map((childOption, childOptionIndex) => (
                  <React.Fragment key={childOptionIndex}>
                    <SubChildMenuSection
                      item={item}
                      childOption={childOption}
                      index={index}
                      option={option}
                      optionIndex={optionIndex}
                      childOptionIndex={childOptionIndex}
                      navigatedData={navigatedData}
                      isMenuOpen={isMenuOpen}
                      toggleAccordion={toggleAccordion}
                    />
                  </React.Fragment>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
      </List>
    </>
  );
}
SubChildMenuSection.propTypes = {
  item: PropTypes.object,
  childOption: PropTypes.object,
  index: PropTypes.number,
  childOptionIndex: PropTypes.number,
  option: PropTypes.any,
  navigatedData: PropTypes.func,
  toggleAccordion: PropTypes.func,
};
function SubChildMenuSection(props) {
  const {
    item,
    childOption,
    index,
    childOptionIndex,
    navigatedData,
    toggleAccordion,
  } = props;
  const [openChildOption, setOpenChildOption] = useState(null);

  const handleChildOptionClick = (childOptionIndex) => {
    setOpenChildOption((prevIndex) =>
      prevIndex === childOptionIndex ? null : childOptionIndex
    );
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
        {/* {childOption.menuName} */}
        {item.isFormcontrol ? (
          <span>
            <Typography
              className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto pl-0.5 pr-0.5 rounded-none`}
              style={{ fontSize: "var(--sidebarFontSize)" }}
              onClick={() => navigatedData(childOption)}
            >
              {childOption?.menuName.length > 20 ? (
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
        ) : (
          <span>
            <Typography
              className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto pl-0.5 pr-0.5 rounded-none `}
              style={{ fontSize: "var(--sidebarFontSize)" }}
              onClick={() => navigatedData(childOption)}
            >
              {childOption?.menuName.length > 20 ? (
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
        )}

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
                item={item}
                index={index}
                grandChildOption={grandChildOption}
                grandChildOptionIndex={grandChildOptionIndex}
                childOption={childOption}
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
ThiredLevelMenuSection.propTypes = {
  item: PropTypes.any,
  index: PropTypes.any,
  grandChildOption: PropTypes.any,
  grandChildOptionIndex: PropTypes.any,
  childOption: PropTypes.any,
  childOptionIndex: PropTypes.any,
  openChildOption: PropTypes.any,
  navigatedData: PropTypes.any,
  toggleAccordion: PropTypes.func,
};
function ThiredLevelMenuSection(props) {
  const {
    item,
    grandChildOption,
    grandChildOptionIndex,
    childOptionIndex,
    openChildOption,
    navigatedData,
    toggleAccordion,
    index,
  } = props;

  const [openSubChildOption, setOpenSubChildOption] = useState(null);

  const handleSubChildOptionClick = (grandChildOptionIndex) => {
    setOpenSubChildOption((prevIndex) =>
      prevIndex === grandChildOptionIndex ? null : grandChildOptionIndex
    );
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
        {item.isFormcontrol ? (
          <span>
            <Typography
              className={` text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto rounded-none `}
              style={{ fontSize: "var(--sidebarFontSize)" }}
              onClick={() => navigatedData(grandChildOption)}
            >
              {grandChildOption?.menuName.length > 20 ? (
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
        ) : (
          <span>
            <Typography
              className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)]  font-[var(--sidebarFontWeight)] mr-auto rounded-none `}
              style={{ fontSize: "var(--sidebarFontSize)" }}
              onClick={() => navigatedData(grandChildOption)}
            >
              {grandChildOption?.menuName.length > 20 ? (
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
        )}
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
          grandChildOption?.child?.map(
            (
              great,
              greatIndex // Added parentheses for arrow function
            ) => (
              <React.Fragment key={greatIndex}>
                <ListItem
                  key={grandChildOptionIndex}
                  className={` bg-[var(--sidebarBg)] group  rounded-none p-0 m-0 h-[30px] border-b-[1px] hover:bg-[var(--table-hover-bg)]  border-opacity-50 flex justify-between w-full `}
                  onClick={() => {
                    toggleAccordion(index, false, great), navigatedData(great);
                  }}
                >
                  {item.isFormcontrol ? (
                    <span>
                      <Typography
                        className={`text-[var(--sidebarTextColor)] group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)]  mr-auto rounded-none `}
                        style={{ fontSize: "var(--sidebarFontSize)" }}
                        onClick={() => navigatedData(great)}
                      >
                        {grandChildOption?.menuName.length > 20 ? (
                          <LightTooltip
                            key={index}
                            title={item.menuName}
                            placement="right-start"
                          >
                            {`${great?.menuName}`}
                          </LightTooltip>
                        ) : (
                          great?.menuName
                        )}
                      </Typography>
                    </span>
                  ) : (
                    <span>
                      <Typography
                        className={`text-[var(--sidebarTextColor)] mr-auto group-hover:text-[var(--sidebarTextColorHover)] font-[var(--sidebarFontWeight)] rounded-none`}
                        style={{ fontSize: "var(--sidebarFontSize)" }}
                        onClick={() => navigatedData(great)}
                      >
                        {grandChildOption?.menuName.length > 20 ? (
                          <LightTooltip
                            key={index}
                            title={item.menuName}
                            placement="right-start"
                          >
                            {`${great?.menuName}`}
                          </LightTooltip>
                        ) : (
                          great?.menuName
                        )}
                      </Typography>
                    </span>
                  )}
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
            )
          )}
      </ListItem>
    </>
  );
}
