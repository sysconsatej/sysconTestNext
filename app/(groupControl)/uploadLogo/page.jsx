"use client";
import React, { useEffect, useState } from "react";
import CustomizedButtons from "@/components/Buttons/customeButton";
import { Avatar, Box, Grid, Typography } from "@mui/material";
import CustomeBreadCrumb from "@/components/BreadCrumbs/breadCrumb";
import { decrypt } from "@/helper/security";
import { companyLogoChange } from "@/services/auth/FormControl.services";
import { toast } from "react-toastify";
import { updateUserDetails } from "@/helper/userDetails";
const backendUrl = process.env.NEXT_PUBLIC_BASE_URL;

const uploadLogo = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [userData, setUserData] = useState("");
  const [uploadImage, setUploadImage] = useState("");
  const [oldAvatar, setOldAvatar] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handleProfilePictureChange = (event) => {
    const file = event?.target?.files?.[0];
    setUploadImage(file);
    if (file) {
      setProfilePicture(URL.createObjectURL(file));
    }
  };

  const handleUploadChange = () => {
    document.getElementById("profilePictureInput").click();
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append("avatar", uploadImage);
    formData.append("oldAvatar", oldAvatar);
    formData.append("clientId", userData.clientId);
    formData.append("companyId", userData.companyId);
    formData.append("userId", userData.userId);
    
    const { success, data, message } = await companyLogoChange(formData);

    if (success) {
      toast.success(message);
      updateUserDetails({companyLogo:data});
    } else {
      toast.error(message);
    }
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const decryptedData = decrypt(storedUserData);
    const { id, clientId, companyLogo, companyName, defaultCompanyId } = JSON.parse(decryptedData)[0];
    setOldAvatar(companyLogo);
    setProfilePicture(backendUrl + companyLogo);
    setCompanyName(companyName);
    setUserData({ clientId, companyId: defaultCompanyId, userId: id});
  }, []);

  return (
    <Box>
      <CustomeBreadCrumb />
      <Grid
        item
        xs={12}
        sm={4}
        className="mt-4 flex  items-center justify-center !flex-col "
      >
        <Typography
          variant="body1"
          style={{ color: "var(--inputTextColor)", fontSize: "1rem" }}
        >
          {companyName || "Company Name"}
        </Typography>
        <Avatar
          src={profilePicture}
          sx={{
            width: 100,
            height: 100,
            mt: 2,
            mb: 2,
            borderRadius: "15%",
          }}
        />
        <input
          id="profilePictureInput"
          type="file"
          accept="image/png, image/jpeg"
          style={{ display: "none" }}
          onChange={handleProfilePictureChange}
        />
        <Box className="flex gap-2">
          <CustomizedButtons
            button={{ buttonName: "Upload/Change Logo" }}
            onClickFunc={handleUploadChange}
          />
          <CustomizedButtons
            button={{ buttonName: "Submit" }}
            onClickFunc={handleSubmit}
          />
        </Box>
      </Grid>
    </Box>
  );
};

export default uploadLogo;
