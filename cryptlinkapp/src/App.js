import React, {} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './css/App.css';
import Landing from "./JS/Landing";
import Registration from './JS/registration';
import Login from './JS/login';
import Home from './JS/Home';
import FileStorage from './JS/file_storage';
import ChatRoom from './JS/chatRoom';
import CodeVerification from "./JS/CodeVerification";
import AboutUs from './JS/aboutUs';



function App() {
  

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/home" element={<Home />} />
            <Route path="/chatRoom" element={<ChatRoom />} />
            <Route path="/codeVerification" element={<CodeVerification />} />
            <Route path="/file_storage" element={<FileStorage />} />
            <Route path="/about" element={<AboutUs />} /> 
            <Route path="*" element={<Landing />} /> 
          
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;



