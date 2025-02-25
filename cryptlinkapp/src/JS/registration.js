import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/registration.css";  // Updated path to CSS folder
import { ReactComponent as CryptLogo } from "../SVG/crpyt_logo.svg";

function Registration() {
  // State variables for each field
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Error handling states
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate fields
    let tempErrors = {};
    if (!firstName.trim()) {
      tempErrors.firstName = "First name is required";
    }
    if (!lastName.trim()) {
      tempErrors.lastName = "Last name is required";
    }
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

    // If no errors, proceed with registration logic (e.g., API call)
    if (Object.keys(tempErrors).length === 0) {
      console.log("Registration successful:", { firstName, lastName, email, password });
      alert("Registration successful!");
      // Clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="registration-container">
      <form className="registration-form" onSubmit={handleSubmit}>
        {/* Home button inside the white div */}
        <Link to="/" className="home-button-top">Home</Link>

        {/* Clickable SVG Logo */}
        <Link to="/Home" className="logo">
          <CryptLogo className="svg-logo" />
        </Link>

        <h2>Create an Account</h2>

        {/* First Name Field */}
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}
        </div>

        {/* Last Name Field */}
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
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

        {/* Button to navigate to login */}
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
