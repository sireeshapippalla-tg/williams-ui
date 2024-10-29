import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { getNotifications } from '../api';

const GlobalStateContext = createContext();

export const useGlobalState = () => useContext(GlobalStateContext);

export const GlobalStateProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
          const response = await axios.post(getNotifications);
          const data = response.data.notificationsList;
          const formattedNotifications = data.map((notification) => ({
            id: notification.incidentHistoryId,
            incidentId: notification.incidentId,
            message: notification.comments,
            createdAt: notification.createdAt,
            incidentRecord: notification.incidentRecord,
            createdBy: notification.createdBy
          }));
          setNotifications(formattedNotifications);
        } catch (error) {
          console.log('Error in fetching notifications:', error);
        }
      };

    // const markAsRead = async (notificationId) => {
    //     try {
    //         await axios.post(`/your-notification-endpoint/${notificationId}/read`);
    //         setNotifications(prevNotifications =>
    //             prevNotifications.map(notification =>
    //                 notification.id === notificationId ? { ...notification, read: true } : notification
    //             )
    //         );
    //     } catch (error) {
    //         console.error('Error marking notification as read:', error);
    //     }
    // };

    // const deleteNotification = async (notificationId) => {
    //     try {
    //         await axios.delete(`/your-notification-endpoint/${notificationId}`);
    //         setNotifications(prevNotifications =>
    //             prevNotifications.filter(notification => notification.id !== notificationId)
    //         );
    //     } catch (error) {
    //         console.error('Error deleting notification:', error);
    //     }
    // };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <GlobalStateContext.Provider
            value={{
                notifications,
                fetchNotifications
                // markAsRead,
                // deleteNotification
            }}
        >
            {children}
        </GlobalStateContext.Provider>
    );
};
