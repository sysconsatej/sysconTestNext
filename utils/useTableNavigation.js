import { getUserDetails } from "@/helper/userDetails";
import { reportTheme } from "@/services/auth/FormControl.services";
import { useEffect, useRef, useState } from "react";

export const useTableNavigation = (tableRef, gridData) => {
  const [moveToRow, setMoveToRow] = useState(0);
  const rowRefs = useRef([]);

  useEffect(() => {
    if (!tableRef.current) return;

    const handleKeyDown = (event) => {
      if (event.key === "ArrowDown") {
        if (gridData?.length - 1 >= moveToRow) {
          setMoveToRow((prev) => prev + 1);
        }
      }
    };

    const handleKeyUp = (event) => {
      if (event.key === "ArrowUp") {
        if (moveToRow >= 0) {
          setMoveToRow((prev) => prev - 1);
        }
      }
    };

    const rows = tableRef.current.querySelectorAll("tr");
    rowRefs.current = Array.from(rows);

    rowRefs.current.forEach((row, index) => {
      row.style.backgroundColor =
        index === moveToRow ? "var(--table-hover-bg)" : "";
    });

    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [moveToRow, gridData]);

  return { moveToRow, setMoveToRow };
};

export const applyTheme = (reports) => {
  const {clientId} = getUserDetails();
  const selectedReportsMenuId = sessionStorage.getItem("selectedReportsMenuId");

  const addThemeProperties = (theme, root) => {
    const properties = {};

    for (const key in theme) {
      properties[`--rp-${key}`] = theme[key];
    }

    Object.keys(properties).forEach((key) => {
      root?.style.setProperty(key, properties[key]);
    });
  };

  if (selectedReportsMenuId) {
    let MenuIdsConvertJson = JSON.parse(selectedReportsMenuId);
    const menuIdsArr = Array.isArray(MenuIdsConvertJson)
      ? MenuIdsConvertJson
      : [MenuIdsConvertJson];
    if (menuIdsArr) {
      menuIdsArr.forEach(async (item, index) => {
        const themeRequest = {
          clientId: clientId,
          reportId: Number(item),
        };

        const themeData = await reportTheme(themeRequest);

        if (reports) {
          addThemeProperties(
            themeData.data,
            reports[index]?.querySelector(".bgTheme")
          );
        }
      });
    }
  }
};

export const encryptUrlFun = (obj) => {
  return encodeURIComponent(JSON.stringify(obj));
}