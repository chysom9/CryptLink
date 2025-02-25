import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Registration from './registration';
import Login from './login';
import { ReactComponent as CryptLogo } from "./crpyt_logo.svg";


function App() {
  // Toggle state to switch between Login and Registration views
  const [showLogin, setShowLogin] = useState(true);

  return (

    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="*" element={<Login />} /> {/* Default route to login */}
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;

