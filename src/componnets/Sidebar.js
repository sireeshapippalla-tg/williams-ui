import * as React from "react";
import { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import { Divider } from "@mui/material";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import MainRoutes from "../Routes/MainRoutes";
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import Header from "./Header";
import './Sidebar.css';
import HomeIcon from '@mui/icons-material/Home';

import Home from '../assets/images/HomeIcon.png';
import Incident from '../assets/images/Incident.png';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import FolderOpenIcon from "@mui/icons-material/FolderOpen";





const drawerWidth = 260;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(5)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(7)} + 1px)`,
    },
});

const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
    }),
}));

export default function Sidebar() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const location = useLocation();
    const { pathname } = location;

    const shouldHideDrawer = pathname === "/" || pathname === "/forgotPassword";

    const userID = localStorage.getItem('userTypeId')
    console.log(userID)

    const SidebarItems = [
        {
            label: "Dashboard",
            path: "/incident/dashboard",
            icon: <HomeIcon />

        },
        {
            label: "Incident",
            path: "/incident",
            icon: <ReportProblemIcon />
        },
        // {
        //     label: "Users",
        //     path: "/admin/pannel",
        //     icon: <PersonAddAltIcon />
        // },
        ...(userID == 1 ? [{
            label: "Users",
            path: "/admin/pannel",
            icon: <PersonAddAltIcon />
        }] : []),
        //  {
        //      label: "Document Repository",
        //      path: "/document/repository",
        //      icon: <FolderOpenIcon />
        //  }
    ];


    const handleDrawerOpen = () => {
        setOpen(!open);
    };
    const handleToggleDrawer = () => {
        setOpen(!open);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };




    const handleSidebarToggle = () => {
        console.log("handleSidebarToggle clicked");
        setSidebarOpen(!sidebarOpen);
    };

    return !shouldHideDrawer ? (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <Header onMenuClick={handleSidebarToggle} />
            <div className="sidebar_collapse" >

                <Drawer variant="permanent" open={open} className="">
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        // onClick={handleDrawerOpen}
                        onClick={() => setOpen(!open)}
                        className='sidebar-arrow'
                        edge="end"
                    >
                        {open ? <ChevronLeftIcon style={{ color: "#533529" }} /> : <ChevronRightIcon style={{ color: "#533529" }} />}
                    </IconButton>
                    <DrawerHeader />
                    <Divider />
                    <List sx={{ height: "100vh", backgroundColor: "#533529" }}>

                        {SidebarItems.map((item, index) => (
                            <div key={index}>
                                <Link
                                    to={item.path}
                                    style={{
                                        textDecoration: "none"
                                    }}
                                >
                                    <ListItemButton
                                        className={`side-menubar-text ${pathname === item.path ? "active" : ""}`}
                                        sx={{
                                            minHeight: 48,
                                            justifyContent: open ? "initial" : "center",
                                            px: 2.5,
                                            bgcolor: pathname === item.path ? "#A9ECFF" : "transparent",
                                        }}
                                        selected={pathname === item.path}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 0,
                                                mr: open ? 3 : "auto",
                                                justifyContent: "center",
                                                color: pathname === item.path ? "#533529" : "white",
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            sx={{
                                                opacity: open ? 10 : 0,
                                                color: pathname === item.path ? "#533529" : "white",
                                            }}
                                        />
                                    </ListItemButton>
                                </Link>
                            </div>
                        ))}
                    </List>
                    <Divider />
                </Drawer>
            </div>

            <Box component="main" sx={{ flexGrow: 1, p: 3, }}>
                <DrawerHeader />
                <MainRoutes />
            </Box>
        </Box>
    ) : (
        <MainRoutes />
    );
}
