import React, {} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './css/App.css';
import Home from "./JS/Home";
import Registration from './JS/registration';
import Login from './JS/login';


function App() {
  

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/Home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="*" element={<Home />} /> 
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;



