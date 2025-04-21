import React from "react";
import { Link } from "react-router-dom";
import "../css/landing.css";  

import { ReactComponent as HomeLogo } from "../SVG/home_logo.svg";

function Home() {
  return (
    <div className="home-container">
      <HomeLogo className="home-logo" />
      <h1>Welcome to CryptLink</h1>
      <p>Securely connect and authenticate with ease.</p>
      
      <div className="button-group">
        <Link to="/login" className="home-button">Login</Link>
        <Link to="/register" className="home-button">Register</Link>
        <Link to="/about" className="home-button">About Us</Link> 
      </div>
    </div>
  );
}

export default Home;
