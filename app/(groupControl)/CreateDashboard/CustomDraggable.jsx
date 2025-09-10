"use client";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import CustomizedButtons from "@/components/Buttons/customeButton";
import Box from "@mui/material/Box";
import "../../globalCss";
import { Typography } from "@mui/material";
import styles from "@/app/app.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { userDashboardDataSubmit } from "@/services/auth/FormControl.services";
import { useRouter } from "next/navigation";

const onDragEnd = (result, columns, setColumns) => {
  if (!result.destination) return;
  const { source, destination } = result;
  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    });
  }
};

function Column({ allMenus, userData, userMenus, selectedUserName }) {
  const [columns, setColumns] = useState(() => ({
    requested: { name: "All Menu's", items: [] },
    toDo: { name: "User Dashboard", items: [] },
  }));
  const { push } = useRouter();

  useEffect(() => {
    const loadMenu = () => {
      const otherMenus = allMenus.filter(
        (item) => !userMenus?.includes(item.id)
      );
      const userSelectedMenus = allMenus.filter((item) =>
        userMenus?.includes(item.id)
      );

      const formattedAllMenuItems = otherMenus.map((item) => ({
        id: String(item.id),
        content: item.menuName,
      }));

      const formattedUserMenuItems = userSelectedMenus.map((item) => ({
        id: String(item.id),
        content: item.menuName,
      }));

      setColumns({
        requested: { name: "All Menu's", items: formattedAllMenuItems },
        toDo: { name: "User Dashboard", items: formattedUserMenuItems },
      });
    };
    loadMenu();
  }, [selectedUserName]);

  async function updateMenuId() {
    const itemsInToDoColumn = columns.toDo.items.map((item) => item.id);
    const dashboardData = {
      userId: selectedUserName,
      clientId: userData.clientId,
      companyId: Number(userData.companyId),
      branchId: Number(userData.branchId),
      menuId: `${itemsInToDoColumn.join(",")}`,
    };
    if (itemsInToDoColumn.length <= 0) {
      toast.warning(`Please Select Reports!`);
    } else {
      try {
        const response = await userDashboardDataSubmit(dashboardData);
        if (response) {
          toast.success("Data saved successfully");
          push("/dashboard");
        } else {
          toast.error("Failed to update the database");
        }
      } catch (error) {
        toast.error(`Error updating the database: ${error.message}`);
      }
    }
  }

  const buttonsData = [
    { buttonName: "Submit", functionOnClick: "handleSubmit" },
  ];
  const handleButtonClick = {
    handleSubmit: async () => {
      console.log("Submit button clicked");
      await updateMenuId();
    },
    handleEdit: () => {
      console.log("Edit button clicked");
    },
  };

  const columnIds = Object.keys(columns);

  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "center", height: "100%" }}
      >
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
          {columnIds.map((columnId) => {
            const column = columns[columnId];
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                key={columnId}
              >
                <Typography
                  sx={{ fontSize: "12px", color: "var(--commonTextColor)" }}
                >
                  {column.name}
                </Typography>
                <div style={{ margin: 8 }}>
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided) => (
                      <div
                        className={`${styles.tableBgAndHead} ${styles.thinScrollBar}`}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={{
                          border: "1px solid #b2bac2",
                          padding: 4,
                          borderRadius: 4,
                          width: 250,
                          height: "12.5rem",
                          overflowY: "auto",
                        }}
                      >
                        {column.items &&
                          column.items.length > 0 &&
                          column.items.map((item, index) => (
                            <Draggable
                              className="outlined-text"
                              key={item.id}
                              draggableId={item.id}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  <Typography
                                    variant="body1"
                                    sx={{ fontSize: "0.75rem", mb: 2 }}
                                    className={`${styles.inputTextColor}`}
                                  >
                                    {item.content}
                                  </Typography>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </DragDropContext>
      </div>
      <div>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
          {buttonsData.map((button, index) => (
            <CustomizedButtons
              key={index}
              button={button}
              onClickFunc={handleButtonClick[button.functionOnClick]}
            />
          ))}
        </Box>
      </div>
    </div>
  );
}

Column.propTypes = {
  allMenus: PropTypes.array.isRequired,
  userMenus: PropTypes.array.isRequired,
  userData: PropTypes.object.isRequired,
  selectedUserName: PropTypes.number.isRequired,
};

export default Column;
