import React, { useState } from "react";
import "./login.css";

function Login() {
  // State variables for the email and password fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State to store error messages
  const [errors, setErrors] = useState({});

  // Form submission handler
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate fields
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

    // If there are no errors, proceed with login logic (e.g., API call)
    if (Object.keys(tempErrors).length === 0) {
      console.log("Login successful:", { email, password });
      alert("Login successful!");

      // Clear the form
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {/* Logo */}
        <div className="logo">CRYPTLINK</div>

        <h2>Login</h2>

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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="error">{errors.password}</p>}
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
