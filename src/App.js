import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import './responsive.css';
import Sidebar from './componnets/Sidebar';
import { GlobalStateProvider } from './contexts/GlobalStateContext';



function App() {
  return (
    <GlobalStateProvider> 
      <BrowserRouter>
        <div>
          <Sidebar />
        </div>
      </BrowserRouter>
      </GlobalStateProvider>
  );
}

export default App;
