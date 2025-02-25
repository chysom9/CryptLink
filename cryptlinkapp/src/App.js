import React, {} from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './css/App.css';
import Home from "./JS/Home";
import Registration from './JS/registration';
import Login from './JS/login';
/*import { ReactComponent as CryptLogo } from "./SVG/crpyt_logo.svg";*/

function App() {
  // Toggle state to switch between Login and Registration views (unused with Router)
  /*const [showLogin, setShowLogin] = useState(true);*/

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/Home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="*" element={<Home />} /> {/* Default route to home */}
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;



