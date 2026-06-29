import React from "react";
import { Backdrop, Box, Fab, Modal } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import PropTypes from "prop-types";
import ChatApp from "../ChatAppComponents/ChatApp";
import io from "socket.io-client";
import { destroySocket, getSocket } from "@/helper/socket";


const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1400,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 12,
  p: 4,
};

export default function FloatingActionButtons() {
  return <FloatButtonType type={"chat"} />;
}

const FloatButtonType = ({ type }) => {
  const [openWindow, setOpenWindow] = React.useState(false);

  const openCloseChatWindow = () => {
    setOpenWindow((prev) => !prev);
  };

  return (
    <>
      {type === "chat" ? (
        <Box
          sx={{ "& > :not(style)": { m: 1 } }}
          className="  flex flex-row md:justify-start md:mb-3  lg:justify-end  cursor-pointer"
        >
          <Fab
            color="primary"
            aria-label="add"
            onClick={() => openCloseChatWindow()}
          >
            <ChatIcon />
          </Fab>
        </Box>
      ) : (
        <></>
      )}

      <Modal
        open={openWindow}
        onClose={() => openCloseChatWindow()}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        slotProps={{ backdrop: Backdrop }}
        sx={{ cursor: "pointer" }}
      >
        <Box style={modalStyle}>
          <ChatApp
            socketUrl={process.env.NEXT_PUBLIC_CHAT_SERVER_URL}
            apiBase={process.env.NEXT_PUBLIC_CHAT_SERVER_URL + "/chat-app/"}
            ioFactory={io}
            destroySocket={destroySocket}
            socketFactory={getSocket}
            closeWindow={openCloseChatWindow}
          />
        </Box>
      </Modal>
    </>
  );
};

FloatButtonType.propTypes = {
  type: PropTypes.string,
};
