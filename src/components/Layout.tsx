import React, { Suspense, HtmlHTMLAttributes } from 'react';
import { CssBaseline, Container } from '@mui/material';
import { CoreLayoutProps, CheckForApplicationUpdate, Inspector } from 'react-admin';
import { ErrorBoundary } from 'react-error-boundary';
import { Error, Loading } from 'react-admin';
import { Tabs, Tab, Toolbar, AppBar, Box, Typography } from '@mui/material';
import { Link, matchPath, useLocation } from 'react-router-dom';
import { UserMenu, Logout, LoadingIndicator, InspectorButton } from 'react-admin';

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
                            <Box><InspectorButton placeholder={''}/></Box>
                            <LoadingIndicator
                                sx={{
                                    '& .RaLoadingIndicator-loader': {
                                        marginTop: 2,
                                    },
                                }}
                            />
                            <UserMenu>
                                <Logout />
                            </UserMenu>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
};


const Layout = ({ children }: LayoutProps) => (
    <>
        <CssBaseline />
        <Header />
        <Container
            sx={{ maxWidth: { xl: '100%' } }}
        >
            <main
                id="main-content"
            >
                {/* @ts-ignore */}
                <ErrorBoundary FallbackComponent={Error}>
                    <Suspense fallback={<Loading />}>{children}</Suspense>
                </ErrorBoundary>
            </main>
            <Inspector />
        </Container>
        <CheckForApplicationUpdate interval={30 * 1000} />
    </>
);

export interface LayoutProps
    extends CoreLayoutProps,
        Omit<HtmlHTMLAttributes<HTMLDivElement>, 'title'> {}

export default Layout;
