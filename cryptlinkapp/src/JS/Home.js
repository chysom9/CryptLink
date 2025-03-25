import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/Home.css";

import { ReactComponent as HomeLogo } from "../SVG/home_logo.svg";


function Home() {
  const navigate = useNavigate();

  // ✅ Redirect to login if user is not authenticated
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    console.log("Token in Home:", token);
    
    if (!token) {
      console.log("Redirecting to login (no token found)");
      navigate("/login");
    }
  }, [navigate]);
  

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <HomeLogo className="home-logo" />
      <h1>Welcome to CryptLink</h1>

      {/* Navigation buttons for additional features */}
      <button className="home-button" onClick={() => navigate("/messaging")}>
        Messaging
      </button>
      <button className="home-button" onClick={() => navigate("/file_storage")}>
        File Storage
      </button>

      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Home;
