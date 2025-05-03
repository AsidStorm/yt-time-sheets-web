import React from "react";
import {Backdrop, Box, Typography, CircularProgress} from '@mui/material';
import {useLoader} from "../hooks";

function CircularProgressWithLabel(
    props,
) {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress variant="determinate" {...props} />
            <Box
                sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    component="div"
                    color="text.secondary"
                >{`${Math.round(props.value)}%`}</Typography>
            </Box>
        </Box>
    );
}

function Loader() {
    const { state, value } = useLoader();

    return <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1500 }}
        open={state}
    >
        { value >= 0 ? <CircularProgressWithLabel color="success" value={value} /> : <CircularProgress color="success" /> }
    </Backdrop>
}

export default Loader;