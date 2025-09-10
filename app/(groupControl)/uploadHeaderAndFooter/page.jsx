"use client";
import React, { useEffect, useState } from "react";
import CustomizedButtons from "@/components/Buttons/customeButton";
import { Avatar, Box, Grid, Typography } from "@mui/material";
import CustomeBreadCrumb from "@/components/BreadCrumbs/breadCrumb";
import { decrypt } from "@/helper/security";
import { companyHeaderAndFooterLogoChange } from "@/services/auth/FormControl.services";
import { toast } from "react-toastify";
import { updateUserDetails } from "@/helper/userDetails";
const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

const uploadHeaderAndFooter = () => {
  const [profilePicture, setProfilePicture] = useState({});
  const [userData, setUserData] = useState("");
  const [uploadImage, setUploadImage] = useState({});
  const [oldAvatar, setOldAvatar] = useState({});
  const [toggleLogo, setToggleLogo] = useState("");

  const handleProfilePictureChange = (event) => {
    const file = event?.target?.files?.[0];
    setUploadImage((prev) => ({
      ...prev,
      [toggleLogo]: file,
    }));
    if (file) {
      setProfilePicture((prev) => ({
        ...prev,
        [toggleLogo]: URL.createObjectURL(file),
      }));
    }
  };

  const handleUploadChange = (logo) => {
    setToggleLogo(logo);
    const input = document.getElementById(`profilePictureInput-${logo}`);
    if (input) {
      input.click();
    } else {
      console.error(`Element with id "profilePictureInput-${logo}" not found`);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("headerLogo", uploadImage["header"]);
    formData.append("footerLogo", uploadImage["footer"]);
    formData.append("oldHeader", oldAvatar.oldHeader);
    formData.append("oldFooter", oldAvatar.oldFooter);
    formData.append("clientId", userData.clientId);
    formData.append("branchId", userData.defaultBranchId);
    formData.append("userId", userData.userId);

    const { success, data, message } = await companyHeaderAndFooterLogoChange(
      formData
    );

    if (success) {
      toast.success(message);
      updateUserDetails({
        headerLogoPath: data.header,
        footerLogoPath: data.footer,
      });
    } else {
      toast.error(message);
    }
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const { clientId, defaultBranchId, id, headerLogoPath, footerLogoPath } =
      JSON.parse(decryptedData)[0];
    setOldAvatar({ oldFooter: footerLogoPath, oldHeader: headerLogoPath });
    setProfilePicture({
      header: backendUrl + headerLogoPath,
      footer: backendUrl + footerLogoPath,
    });
    setUserData({ clientId, defaultBranchId, userId: id });
  }, []);

  return (
    <Box>
      <CustomeBreadCrumb />
      <Box className="flex items-center justify-center w-full ">
        <Box className="max-w-[400px] w-full">
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sm={6}
              className="mt-4 flex items-center justify-center !flex-col "
            >
              <Typography
                variant="body1"
                style={{ color: "var(--inputTextColor)", fontSize: "1rem" }}
              >
                Header Logo
              </Typography>
              <Avatar
                src={profilePicture["header"]}
                sx={{
                  width: 100,
                  height: 100,
                  mt: 2,
                  mb: 2,
                  borderRadius: "15%",
                }}
              />
              <input
                id="profilePictureInput-header"
                type="file"
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                onChange={handleProfilePictureChange}
              />
              <Box className="flex gap-2">
                <CustomizedButtons
                  button={{ buttonName: "Upload/Change Logo" }}
                  onClickFunc={() => handleUploadChange("header")}
                />
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sm={6}
              className="mt-4 flex  items-center justify-center !flex-col "
            >
              <Typography
                variant="body1"
                style={{ color: "var(--inputTextColor)", fontSize: "1rem" }}
              >
                Footer Logo
              </Typography>
              <Avatar
                src={profilePicture["footer"]}
                sx={{
                  width: 100,
                  height: 100,
                  mt: 2,
                  mb: 2,
                  borderRadius: "15%",
                }}
              />
              <input
                id="profilePictureInput-footer"
                type="file"
                accept="image/png, image/jpeg"
                style={{ display: "none" }}
                onChange={handleProfilePictureChange}
              />
              <Box className="flex gap-2">
                <CustomizedButtons
                  button={{ buttonName: "Upload/Change Logo" }}
                  onClickFunc={() => handleUploadChange("footer")}
                />
              </Box>
            </Grid>
          </Grid>
          <Box className="flex items-center justify-center ">
            <CustomizedButtons
              button={{ buttonName: "Submit" }}
              onClickFunc={handleSubmit}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default uploadHeaderAndFooter;
