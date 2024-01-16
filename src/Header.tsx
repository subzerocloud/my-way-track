import React from 'react';
import { Tabs, Tab, Toolbar, AppBar, Box, Typography } from '@mui/material';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { LoadingIndicator, InspectorButton } from 'react-admin';

const Header = () => {
    const location = useLocation();

    let currentPath = '/';
    if (!!matchPath('/opportunities/*', location.pathname)) {
        currentPath = '/opportunities';
    } else if (!!matchPath('/stages/*', location.pathname)) {
        currentPath = '/stages';
    }

    return (
        <Box component="nav" sx={{ flexGrow: 1 }}>
            <AppBar position="static" color="primary">
                <Toolbar variant="dense">
                    <Box flex={1} display="flex" justifyContent="space-between">
                        <Box display="flex" alignItems="center">
                            <Typography component="span" variant="h5">
                                MyWayTrack
                            </Typography>
                        </Box>
                        <Box>
                            <Tabs
                                value={currentPath}
                                aria-label="Navigation Tabs"
                                indicatorColor="secondary"
                                textColor="inherit"
                            >
                                <Tab
                                    label={'Dashboard'}
                                    component={Link}
                                    to="/"
                                    value="/"
                                />
                                <Tab
                                    label={'Opportunities'}
                                    component={Link}
                                    to="/opportunities"
                                    value="/opportunities"
                                />
                                <Tab
                                    label={'Stages'}
                                    component={Link}
                                    to="/stages"
                                    value="/stages"
                                />
                            </Tabs>
                        </Box>
                        <Box display="flex">
                            <Box><InspectorButton/></Box>
                            <LoadingIndicator
                                sx={{
                                    '& .RaLoadingIndicator-loader': {
                                        marginTop: 2,
                                    },
                                }}
                            />

                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Header;
