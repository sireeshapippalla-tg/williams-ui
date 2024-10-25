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


const MainRoutes = () => {
  return (
    <div>
        <Routes>
          {/* Protected Routes */}
          <Route 
            path='/incident' 
            element={
              <ProtectedRoute>
                <Incident/>
              </ProtectedRoute>
            }
          />
          <Route 
            path='/incident/create' 
            element={
              <ProtectedRoute>
                <CreateIncident/>
              </ProtectedRoute>
            }
          />
          <Route 
            path='/incident/details/:id' 
            element={
              <ProtectedRoute>
                <IncidentDetails/>
              </ProtectedRoute>
            }
          />
          <Route 
            path='/users' 
            element={
              <ProtectedRoute>
                <User/>
              </ProtectedRoute>
            }
          />
          <Route 
            path='/users/adduser' 
            element={
              <ProtectedRoute>
                <AddUser/>
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path='/login' element={<Login/>}/>
          <Route path='/forgot/password' element={<Forgot/>}/>
        </Routes>
    </div>
  )
}


export default MainRoutes