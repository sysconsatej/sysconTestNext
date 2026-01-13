"use client";
import React, { useEffect, useState } from "react";
import "./CardGrid.css";
import AddEditFormControll from "../dynamicReports/page";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import { getUserDashboard } from "@/services/auth/FormControl.services";
import { getUserDetails } from "@/helper/userDetails";

const CardGrid = () => {
  const [dashboardReports, setDashboardReports] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [num, setNum] = useState(null);
  const { userId } = getUserDetails();

  const changeHandler = (value) => {
    if (num === value + 1) {
      setToggle(false);
      setNum(null);
    } else {
      setToggle(true);
      setNum(value + 1);
    }
  };

  async function fetchUserDashboardFunc() {
    const { data } = await getUserDashboard({ userId: userId });
    const splitReportIds = data.data?.split(",").map(String);
    if (data) {
      setDashboardReports(splitReportIds);
    }
  }

  useEffect(() => {
    fetchUserDashboardFunc();
  }, []);

  // ✅ KEY FIX: force charts to recalc size after grid/layout animation changes
  useEffect(() => {
    const t = setTimeout(() => {
      // 1) normal resize event (many chart libs listen to it)
      window.dispatchEvent(new Event("resize"));

      // 2) extra: sometimes needs 1 more frame after resize
      requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
    }, 80); // small delay so grid animation/layout settles

    return () => clearTimeout(t);
  }, [toggle, num, dashboardReports?.length]);

  return (
    <div
      className={`card_grid grid_format_${dashboardReports?.length} ${
        toggle ? `animation_${num} active_bg` : ""
      } `}
    >
      {dashboardReports?.map((value, index) => {
        const isUnset = index + 1 === num;

        const icon = isUnset ? (
          <CloseFullscreenIcon style={{ color: "#7e9bcf" }} />
        ) : (
          <AspectRatioIcon style={{ color: "#7e9bcf" }} />
        );

        return (
          <div
            className="card"
            key={index}
            onDoubleClick={() => changeHandler(index)}
          >
            <div className="icon" onClick={() => changeHandler(index)}>
              {icon}
            </div>
            <div className="content">
              <AddEditFormControll reportData={value} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardGrid;
