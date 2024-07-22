import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Incident from '../pages/incidents/Incident';
import CreateIncident from '../pages/incidents/CreateIncident';
import IncidentDetails from '../pages/incidents/IncidentDetails';





const MainRoutes = () => {
  return (
    <div>
        <Routes>
          {/* <Route path="/" element={<IncidentDashboard />} /> */}
          <Route path='/incident' element={<Incident/>}/>
          <Route path='/incident/create' element={<CreateIncident/>}/>
          <Route  path='/incident/details/:id' element={<IncidentDetails/>}/>
          
        </Routes>
    </div>
  )
}

export default MainRoutes