import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/login.css";  
import { ReactComponent as CryptLogo } from "../SVG/crpyt_logo.svg";

function Login() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  
  const handleSubmit = (e) => {
    e.preventDefault();

   
    let tempErrors = {};
    if (!email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Email is invalid";
    }
    if (!password) {
      tempErrors.password = "Password is required";
    }
    setErrors(tempErrors);

    
    if (Object.keys(tempErrors).length === 0) {
      console.log("Login successful:", { email, password });
      alert("Login successful!");
   
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
      
        <Link to="/" className="home-button-top">Home</Link>

        <Link to="/Home" className="logo">
          <CryptLogo className="svg-logo" />
        </Link>

        <h2>Login</h2>

     
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="error">{errors.email}</p>}
        </div>

       
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <button type="submit">Login</button>

        
        <button
          type="button"
          className="switch-button"
          onClick={() => navigate("/register")}
        >
          Create an Account
        </button>
      </form>
    </div>
  );
}

export default Login;
