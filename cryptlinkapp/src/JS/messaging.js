import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/messaging.css";
import axios from "axios";

function Messaging() {
  const [recipients, setRecipients] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  // Simulated encryption function (for demo purposes only)
  const encryptMessage = (msg) => {
    // For instance, using base64 encoding as a stand-in for encryption
    return btoa(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!recipients || !message) {
      setStatus("Please provide both recipients and a message.");
      return;
    }

    const encryptedMessage = encryptMessage(message);

    try {
      // Simulated API call for sending the encrypted message
      await axios.post("https://localhost:8443/api/messages/send", {
        // Convert comma separated string into an array of trimmed emails
        recipients: recipients.split(",").map((r) => r.trim()),
        message: encryptedMessage,
      });
      setStatus("Message sent successfully!");
      setRecipients("");
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("Failed to send message.");
    }
  };

  return (
    <div className="messages-container">
      <Link to="/home" className="home-button-top">Home</Link>
      <h2>Send Encrypted Message</h2>
      <form className="messages-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="recipients">Recipients (comma separated)</label>
          <input
            type="text"
            id="recipients"
            value={recipients}
            onChange={(e) => setRecipients(e.target.value)}
            placeholder="Enter recipient emails"
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
          ></textarea>
        </div>
        <button type="submit">Send Message</button>
      </form>
      {status && <p className="status">{status}</p>}
    </div>
  );
}

export default Messaging;
