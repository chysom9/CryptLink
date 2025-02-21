import React, { useState } from "react";
import "./Registration.css";

function Registration() {
  // State variables for each field
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Error handling states
  const [errors, setErrors] = useState({});

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate fields
    let tempErrors = {};
    if (!name.trim()) {
      tempErrors.name = "Name is required";
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
      // Replace with your registration logic
      console.log("Registration successful:", { name, email, password });
      alert("Registration successful!");

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="registration-container">
      <form className="registration-form" onSubmit={handleSubmit}>
        <h2>Create an Account</h2>

        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="error">{errors.name}</p>}
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
      </form>
    </div>
  );
}

export default Registration;
