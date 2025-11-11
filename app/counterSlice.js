// src/store/appSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isRedirection: true,
  reportTypeForPrint: "separate",
  childRecord: null,
  selectedMenuId: null,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // payload should be: { flag: 'isRedirection', value: true|false }
    updateFlag(state, action) {
      const { flag, value } = action.payload;
      switch (flag) {
        case "isRedirection":
          state.isRedirection = value;
          break;
        case "menuIdToRedirect":
          state.menuIdToRedirect = value;
          break;
        case "selectedIndex":
          state.selectedIndex = value;
          break;
        case "reportTypeForPrint":
          state.reportTypeForPrint = value;
          break;
        case "childRecord":
          state.childRecord = value;
          break;
        case "selectedMenuId":
          state.selectedMenuId = value;
          break;
        default:
          // unknown flag—noop (or throw an error if you prefer)
          break;
      }
    },
  },
});

export const { updateFlag } = appSlice.actions;
export default appSlice.reducer;
