import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import williamslogo from '../assets/images/williamslogo.jpeg';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { Typography } from '@mui/material';
import axios from 'axios';
import { getNotifications } from '../api';

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null); // New state for notifications
  const [open, setOpen] = useState(false);
  const [notifiationData, setNotificationData] = useState([])


  const { pathname } = useLocation();

  const SidebarItems = [
    { label: "Dashboard", path: "/dashboard", icon: <HomeIcon /> },
    { label: "Incident", path: "/incident", icon: <ReportProblemIcon /> },
    { label: "Users", path: "/users", icon: <PersonAddAltIcon /> }
  ];


  useEffect(() => {
    fetchNotifications();
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await axios.post(getNotifications)
      console.log('notifications', response);
      const data = response.data.notificationsList
      console.log('notificationsdata', data);
      const formattedNotifications = data.map((notification) => ({
        id: notification.incidentHistoryId,
        message: notification.comments,
        createdAt: notification.createdAt,
        incidentRecord: notification.incidentRecord,
        createdBy: notification.createdBy
      }))
      setNotificationData(formattedNotifications)
    } catch (error) {
      console.log('error in fecthing notifications, error:', error)
    }
  }

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

  const handleNotificationsMenuClose = () => {
    setNotificationsAnchorEl(null);
  };

  const renderNotificationsMenu = (
    <Menu
      anchorEl={notificationsAnchorEl}
      open={Boolean(notificationsAnchorEl)}
      onClose={handleNotificationsMenuClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{
        mt: 4,
        // maxWidth: 300,
        maxHeight: 400, // Set maximum height for the menu
      }}
    >
      <div className='notifications'>
        <h6 className='ps-2 pt-2'>Notfications</h6>
        <hr />
        {notifiationData && notifiationData.length > 0 ? (
          notifiationData.map((notification) => (
            <MenuItem>
              <div className='row'>
                <div className='col-md-2'>
                  <div>
                    {notification.incidentRecord}
                  </div>
                  <span className="history_bg">
                    { notification.createdBy? notification.createdBy.charAt(0).toUpperCase() : "?"}
                  </span>
                </div>
                <div className='col-md-10'>
                  <div>
                    {notification.message}
                  </div>
                  <div>
                    <span style={{fontWeight:"600"}}>
                    {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  
                  </div>

                </div>

              </div>
              {/* <Typography variant="body2" color="textSecondary">
                {notification.message}
              </Typography>
              <Typography>{notification.createdBy}</Typography>
              <Typography variant="caption" color="textSecondary">
                {new Date(notification.createdAt).toLocaleString()}
              </Typography> */}
            </MenuItem>
          ))
        ) : (
          <MenuItem onClick={handleNotificationsMenuClose}>No new notifications</MenuItem>
        )}
      </div>
    </Menu>
  );

  return (
    <header className='shadow-sm'>
      <div className='col-md-12 d-flex justify-content-between'>
        <IconButton color="inherit" onClick={() => setOpen(true)} className='sidebar-arrow-mbl'>
          <MenuIcon />
        </IconButton>

        <div className='col-md-6 d-flex header-mobi'>
          <img src={williamslogo} style={{ height: "45px" }} alt="Logo" />
        </div>

        <Box className='head_right_icons' sx={{ display: { xs: 'none', md: 'flex' } }}>
          <IconButton size="large" aria-label="show 4 new mails" color="inherit">
            <Badge badgeContent={4} color="error">
              <MailIcon />
            </Badge>
          </IconButton>

          {/* Notifications Icon with Menu */}
          <IconButton size="large" aria-label="show 17 new notifications" color="inherit" onClick={handleNotificationsMenuOpen}>
            <Badge badgeContent={notifiationData.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton size="large" edge="end" aria-label="account of current user" onClick={handleProfileMenuOpen} color="inherit">
            <AccountCircle />
          </IconButton>
        </Box>

        {/* Render Menus */}
        {renderNotificationsMenu}
      </div>

      <Drawer open={open} onClose={() => setOpen(false)} className='mblDrawer' style={{ position: "relative", top: "40px" }}>
        {DrawerList}
      </Drawer>
    </header>
  );
}

export default Header;

