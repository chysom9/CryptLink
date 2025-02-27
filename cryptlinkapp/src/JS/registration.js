import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/registration.css";  
import { ReactComponent as CryptLogo } from "../SVG/crpyt_logo.svg";
import axios from "axios";

function Registration() {

  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Input validation
    let tempErrors = {};
    if (!firstname.trim()) tempErrors.firstname = "First name is required";
    if (!lastname.trim()) tempErrors.lastname = "Last name is required";
    if (!email.trim()) {
      tempErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = "Email is invalid";
    }
    if (!password) {
      tempErrors.password = "Password is required";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
    }
    setErrors(tempErrors);

    // If there are errors, stop execution
    if (Object.keys(tempErrors).length > 0) return;

    try {
      const response = await axios.post("https://localhost:8443/api/users/register", {
        firstname,
        lastname,
        email,
        password,
      });

      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword("");
      navigate("/login"); // Redirect to login page after successful registration

    } catch (error) {
      alert(error.response?.data || "Error registering user");
    }
  };

  return (
    <div className="registration-container">
      <form className="registration-form" onSubmit={handleSubmit}>
        
        <Link to="/" className="home-button-top">Home</Link>

        
        <Link to="/Home" className="logo">
          <CryptLogo className="svg-logo" />
        </Link>

        <h2>Create an Account</h2>

        
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={firstname}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}
        </div>

        
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}
        </div>

        
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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <button type="submit">Sign Up</button>

        
        <button
          type="button"
          className="switch-button"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </button>
      </form>
    </div>
  );
}

export default Registration;