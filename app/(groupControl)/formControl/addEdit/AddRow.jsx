import React, { Fragment } from "react";
import { bool, func, any, array } from "prop-types";
import { TableRow, TableCell, Box } from "@mui/material";
import GridInputFields from "@/components/Inputs/gridInputFields";
import HoverIcon from "@/components/HoveredIcons/HoverIcon";
import { refreshIcon, revertHover, saveIconHover, saveIcon } from "@/assets";

export const AddRow = ({
  inputFieldsVisible,
  isGridEdit,
  childFieldsData,
  revert,
  handleFieldChildrenValuesChange,
  childObject,
  handleChangeFunction,
  handleBlurFunction,
  isCopy,
  onSave,
  indexValue,
}) => {
  return (
    <Fragment key={indexValue}>
      {/* {Add row } */}

      {inputFieldsVisible && isGridEdit ? (
        <>
          <TableRow>
            {childFieldsData?.map((info, _idx) => (
              <TableCell
                key={_idx}
                align="left"
                sx={{
                  padding: "0 ",
                  lineHeight: "0",
                  fontSize: "12px",
                  position: "relative",
                }}
              >
                <Box className="flex gap-1">
                  {_idx === 0 ? (
                    <>
                      <div className="flex">
                        <HoverIcon
                          defaultIcon={refreshIcon}
                          hoverIcon={revertHover}
                          altText={"Revert"}
                          title={"Revert"}
                          onClick={revert}
                        />

                        <HoverIcon
                          defaultIcon={saveIcon}
                          hoverIcon={saveIconHover}
                          altText={"Save"}
                          title={"Save"}
                          onClick={onSave}
                        />
                      </div>
                    </>
                  ) : (
                    <></>
                  )}

                  <GridInputFields
                    fieldData={info}
                    indexValue={_idx}
                    onValuesChange={handleFieldChildrenValuesChange}
                    values={childObject}
                    inEditMode={{ isEditMode: true, isCopy: isCopy }}
                    onChangeHandler={(result) => {
                      handleChangeFunction(result);
                    }}
                    onBlurHandler={(result) => {
                      handleBlurFunction(result);
                    }}
                  />
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </>
      ) : (
        <></>
      )}
    </Fragment>
  );
};
{
  /* Add row ends here */
}

AddRow.propTypes = {
  inputFieldsVisible: bool,
  isGridEdit: bool,
  revert: func,
  handleFieldChildrenValuesChange: func,
  childObject: any,
  childFieldsData: array,
  handleChangeFunction: func,
  handleBlurFunction: func,
  onSave: func,
  isCopy: bool,
  indexValue: any,
};
