import React from "react";
import {Snackbar, Alert} from "@mui/material";

function Message({state, handleClose, message, type}) {
    return <Snackbar
        open={state}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{vertical: "top", horizontal: "center"}}
    >
        <Alert onClose={handleClose} severity={type} sx={{width: '100%'}}>
            {message}
        </Alert>
    </Snackbar>
}

export default Message;