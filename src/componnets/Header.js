import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HomeIcon from '@mui/icons-material/Home';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import axios from 'axios';
import { getNotifications } from '../api';
import williamslogo from '../assets/images/williamslogo.jpeg';
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

import { useGlobalState } from '../contexts/GlobalStateContext';

function Header() {
  const { notifications } = useGlobalState();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null); // New state for notifications
  const [open, setOpen] = useState(false);
  const [notifiationData, setNotificationData] = useState([])


  const { pathname } = useLocation();
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear specific items from local storage
    localStorage.removeItem('keepLoggedIn');
    localStorage.removeItem('userDetails');

    handleProfileMenuClose();
    navigate('/');

  }


  const renderProfileMenu = (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleProfileMenuClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 4 }}
    >
      {/* <MenuItem onClick={handleProfileMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleProfileMenuClose}>My Account</MenuItem> */}
      <MenuItem onClick={() => {
        handleLogout();
        // Add logout functionality if needed
      }}>Logout</MenuItem>
    </Menu>
  );

  const userID = localStorage.getItem('userTypeId')
  console.log(userID)

  const SidebarItems = [
    { label: "Dashboard", path: "/incident/dashboard", icon: <HomeIcon /> },
    { label: "Incident", path: "/incident", icon: <ReportProblemIcon /> },
    // { label: "Users", path: "/admin/pannel", icon: <PersonAddAltIcon /> }
    ...(userID == 1 ? [{
      label: "Users",
      path: "/admin/pannel",
      icon: <PersonAddAltIcon />
    }] : []),
     {
       label: "Document Repository",
       path: "/document/repository",
       icon: <FolderOpenIcon />
     }
  ];

  useEffect(() => {
    // fetchNotifications();
  }, []);



  // const fetchNotifications = async () => {
  //   try {
  //     const response = await axios.post(getNotifications);
  //     const data = response.data.notificationsList;
  //     const formattedNotifications = data.map((notification) => ({
  //       id: notification.incidentHistoryId,
  //       incidentId: notification.incidentId,
  //       message: notification.comments,
  //       createdAt: notification.createdAt,
  //       incidentRecord: notification.incidentRecord,
  //       createdBy: notification.createdBy
  //     }));
  //     setNotificationData(formattedNotifications);
  //   } catch (error) {
  //     console.log('Error in fetching notifications:', error);
  //   }
  // };

  // const handleProfileMenuOpen = (event) => {
  //   setNotificationsAnchorEl(event.currentTarget);
  // };

  // const handleNotificationsMenuOpen = (event) => {
  //   setNotificationsAnchorEl(event.currentTarget);
  // };

  // const handleNotificationsMenuClose = () => {
  //   setNotificationsAnchorEl(null);
  // };

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleNotificationClick = (incidentId) => {
    handleNotificationsMenuClose();
    navigate(`/incident/details/${incidentId}`);
  };

  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      open={Boolean(notificationsAnchorEl)}
      onClose={handleNotificationsMenuClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 2, maxHeight: 500 }}
    >
      <Box sx={{ padding: 2, width: 350 }}>
        <Typography variant="h6" sx={{ paddingBottom: 1, fontWeight: 'bold' }}>
          Notifications
        </Typography>
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification.incidentId)}
              sx={{ padding: 0, marginBottom: 1 }}
            >
              <Card sx={{ width: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" color="textSecondary" fontWeight="bold">
                    {notification.incidentRecord}
                  </Typography>

                  <Tooltip title={notification.message} placement="top" arrow>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        marginBottom: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%',
                      }}
                    >
                      {notification.message}
                    </Typography>
                  </Tooltip>

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="textSecondary">
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {notification.createdBy || 'Unknown'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleNotificationsMenuClose}>No new notifications</MenuItem>
        )}
      </Box>
    </Menu>
  );

  const DrawerList = (
    <Box sx={{ width: 200, height: "100vh", backgroundColor: "#533529" }} role="presentation" onClick={() => setOpen(false)}>
      <List>
        {SidebarItems.map((item, index) => (
          <Link key={index} to={item.path} style={{ textDecoration: "none" }}>
            <ListItemButton
              className={`side-menubar-text ${pathname === item.path ? "active" : ""}`}
              sx={{ minHeight: 48, justifyContent: "center", px: 2.5, bgcolor: pathname === item.path ? "#A9ECFF" : "transparent" }}
              selected={pathname === item.path}
            >
              <ListItemIcon sx={{ minWidth: 0, justifyContent: "center", color: pathname === item.path ? "#533529" : "white" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} sx={{ color: pathname === item.path ? "#533529" : "white" }} />
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Box>
  );

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsMenuOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };


  return (
    <header className='shadow-sm'>
      <div className='col-md-12 d-flex justify-content-between'>
        <IconButton color="inherit" onClick={() => setOpen(true)} className='sidebar-arrow-mbl'>
          <MenuIcon />
        </IconButton>

        <div className='col-md-6 d-flex header-mobi'>
          <img src={williamslogo} style={{ height: "45px" }} className='william_logo_responsive' alt="Logo" />
        </div>

        <Box className='head_right_icons' sx={{ display: { xs: 'none', md: 'flex' } }}>
          {/* <IconButton size="large" aria-label="show 4 new mails" color="inherit">
            <Badge badgeContent={4} color="error">
              <MailIcon />
            </Badge>
          </IconButton> */}

          <IconButton size="large" aria-label="show new notifications" color="inherit" onClick={handleNotificationsMenuOpen}>
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton size="large" edge="end" aria-label="account of current user" onClick={handleProfileMenuOpen} color="inherit">
            <AccountCircle />
          </IconButton>
        </Box>

        {renderNotificationsMenu}
        {renderProfileMenu}
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} className='mblDrawer' style={{ position: "relative", top: "40px" }}>
        {DrawerList}
      </Drawer>
    </header>
  );
}

export default Header;
