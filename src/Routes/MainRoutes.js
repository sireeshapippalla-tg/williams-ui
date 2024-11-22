import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Incident from '../pages/incidents/Incident';
import CreateIncident from '../pages/incidents/CreateIncident';
import IncidentDetails from '../pages/incidents/IncidentDetails';
import User from '../pages/users/User';
import AddUser from '../pages/users/AddUser';
import Login from '../pages/auth/Login';
import Forgot from '../pages/auth/Forgot';
import ProtectedRoute from './ProtectedRoute ';
import IncidentDashboard from '../pages/IncidentDashboard';
import DocumentRepository from '../pages/incidents/DocumentRepository';
import AISearchDashboard from '../componnets/incidents/AISearch';
import Dashboard from '../pages/incidents/Dashboard';


const MainRoutes = () => {
  return (
    <div>
      <Routes>
        {/* Protected Routes */}
        <Route path='/incident/dashboard'
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path='/incident/dashboard1'
          element={
            <ProtectedRoute>

              <IncidentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/incident'
          element={
            <ProtectedRoute>
              <Incident />
            </ProtectedRoute>
          }
        />
        <Route
          path='/incident/create'
          element={
            <ProtectedRoute>
              <CreateIncident />
            </ProtectedRoute>
          }
        />
        <Route
          path='/incident/details/:id'
          element={
            <ProtectedRoute>
              <IncidentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/pannel'
          element={
            <ProtectedRoute>
              <User />
            </ProtectedRoute>
          }
        />
        <Route
          path='/admin/pannel/adduser'
          element={
            <ProtectedRoute>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path='/document/repository'
          element={
            <ProtectedRoute>
              <DocumentRepository />
            </ProtectedRoute>
          }
        />
        <Route
          path='/document/aiSearch'
          element={
            <ProtectedRoute>
              <AISearchDashboard />
            </ProtectedRoute>
          }
        />,


        {/* Public Routes */}
        <Route path='/' element={<Login />} />
        <Route path='/forgotPassword' element={<Forgot />} />
      </Routes>
    </div>
  )
}


export default MainRoutes