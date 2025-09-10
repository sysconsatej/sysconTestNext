"use client";
import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Column from "./CustomDraggable";
import { getUserDetails } from "@/helper/userDetails";
import { getUserDashboardData } from "@/services/auth/FormControl.services";

const Page = () => {
  const [selectedUserName, setSelectedUserName] = useState("");
  const [userData, setUserData] = useState([]);
  const [allUserMenu, setAllUserMenu] = useState([]);
  const [allMenus, setAllMenu] = useState([]);
  const [userMenus, setUserMenu] = useState([]);
  const { clientId, companyId, branchId } = getUserDetails();

  useEffect(async () => {
    try {
      const { data } = await getUserDashboardData({ clientId: clientId });
      if (data) {
        setUserData({
          userNames: data.userDetails,
          clientId,
          companyId,
          branchId,
        });
        setAllMenu(data.dynamicMenu);
        setAllUserMenu(data.userDashboard);
      }
    } catch (error) {
      console.log("create dashboard error", error);
    }
  }, []);

  const handleChange = (event) => {
    const selectedName = event.target.value;
    setSelectedUserName(selectedName);
    const selectedUserMenu = allUserMenu.find(
      (user) => user.userId === selectedName
    );
    if (selectedUserName || selectedName) {
      setUserMenu(selectedUserMenu?.menuID_temp.split(",").map(Number));
    }
  };

  return (
    <div className="m-8 flex flex-col items-center justify-center">
      <div className="mt-[6px] gap-10 my-3 flex items-center">
        <Box
          sx={{
            minWidth: 120,
            border: "0px solid var(--inputBorderColor)",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--inputBorderColor)",
            },
          }}
        >
          <FormControl fullWidth>
            <InputLabel
              sx={{
                color: "var(--inputTextColor)",
              }}
              id="demo-simple-select-label"
            >
              Name
            </InputLabel>
            <Select
              value={selectedUserName}
              sx={{
                color: "var(--inputTextColor)",
              }}
              label="Name"
              onChange={handleChange}
              className={`w-[12rem] h-[4rem]`}
            >
              {userData?.userNames?.map((item) => (
                <MenuItem
                  sx={{
                    color: "var(--inputTextColor)",
                    backgroundColor: "var(--inputBg)",
                  }}
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </div>
      <div className="h-auto w-[500px] pb-6">
        <div className="p-4">
          <Column
            userMenus={userMenus}
            allMenus={allMenus}
            userData={userData}
            selectedUserName={selectedUserName}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
