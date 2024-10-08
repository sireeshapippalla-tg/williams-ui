import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Incident from '../pages/incidents/Incident';
import CreateIncident from '../pages/incidents/CreateIncident';
import IncidentDetails from '../pages/incidents/IncidentDetails';
import User from '../pages/users/User';
import AddUser from '../pages/users/AddUser';
import Login from '../pages/auth/Login';
import Forgot from '../pages/auth/Forgot';





const MainRoutes = () => {
  return (
    <div>
        <Routes>
          {/* <Route path="/" element={<IncidentDashboard />} /> */}
          <Route path='/incident' element={<Incident/>}/>
          <Route path='/incident/create' element={<CreateIncident/>}/>
          <Route  path='/incident/details/:id' element={<IncidentDetails/>}/>
          <Route  path='/users' element={<User/>}/>
          <Route  path='/users/adduser' element={<AddUser/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/forgot/password' element={<Forgot/>}/>
        </Routes>
    </div>
  )
}

export default MainRoutes