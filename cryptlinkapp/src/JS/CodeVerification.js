import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/codeVerification.css";
import axios from "axios";

function CodeVerification() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("email"); // Retrieve the email from local storage
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate that code is 6 digits
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      setError("Please enter a valid 6-digit code.");
      return;
    }
    try {
      // Send the code to your backend for verification.
      // Adjust the endpoint and response handling as needed.

      const response = await axios.post(
        "https://localhost:8443/api/auth/verify-otp",
        {email, code},
        { headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
         } }
      );
      console.log("Verification response:", response.data);
      if (response.data == "Authentication successful!") {
        // If the code is correct, navigate to Home
        navigate("/home");
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("Error verifying code. Please try again.");
    }
  };

  return (
    <div className="code-container">
      <h2>Enter Verification Code</h2>
      <p>Please enter the 6-digit code sent to your email.</p>
      <form className="code-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength="6"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Verify</button>
      </form>
      <Link to="/login" className="back-link">
        Back to Login
      </Link>
    </div>
  );
}

export default CodeVerification;
