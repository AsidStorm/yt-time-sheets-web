import React from "react";
import {
    Snackbar,
    Alert
} from "@mui/material";
import {useMessage} from "../hooks";

function Message() {
    const { isOpen, message, type, close } = useMessage();

    return <Snackbar
        open={isOpen}
        autoHideDuration={4000}
        onClose={close}
        anchorOrigin={{vertical: "top", horizontal: "center"}}
    >
        <Alert onClose={close} severity={type} sx={{width: '100%'}}>
            {message}
        </Alert>
    </Snackbar>
}

export default Message;