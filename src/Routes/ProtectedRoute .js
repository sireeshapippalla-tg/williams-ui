import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('userDetails'); // Check if user details are stored

    return isAuthenticated ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
