// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import "../css/messaging.css";
// import axios from "axios";

// function Messaging() {
//   const [recipients, setRecipients] = useState("");
//   const [message, setMessage] = useState("");
//   const [status, setStatus] = useState("");
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   // Simulated encryption function (for demo purposes only)
//   const encryptMessage = (msg) => btoa(msg);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!recipients || !message) {
//       setStatus("Please provide both recipients and a message.");
//       return;
//     }
//     const encryptedMessage = encryptMessage(message);
//     try {
//       await axios.post("https://localhost:8443/api/messages/send", {
//         recipients: recipients.split(",").map((r) => r.trim()),
//         message: encryptedMessage,
//       });
//       setStatus("Message sent successfully!");
//       setRecipients("");
//       setMessage("");
//     } catch (error) {
//       console.error("Error sending message:", error);
//       setStatus("Failed to send message.");
//     }
//   };

//   return (
//     <div className="messages-container">
//       {/* Menu Container: Revealed on hover or when toggled open */}
//       <div className="menu-container">
//         <button className="menu-toggle" onClick={toggleMenu} aria-label="Menu">
//           ☰
//         </button>
//         <nav className={`menu ${isMenuOpen ? "open" : ""}`}>
//           <ul>
//             <li>
//               <Link to="/home" onClick={() => setIsMenuOpen(false)}>
//                 Home
//               </Link>
//             </li>
//             <li>
//               <Link to="/file_storage" onClick={() => setIsMenuOpen(false)}>
//                 File Storage
//               </Link>
//             </li>
//           </ul>
//         </nav>
//       </div>

//       <h2>Messages</h2>
//       <form className="messages-form" onSubmit={handleSubmit}>
//         <div className="form-group">
//           <label htmlFor="recipients">Recipients (comma separated)</label>
//           <input
//             type="text"
//             id="recipients"
//             value={recipients}
//             onChange={(e) => setRecipients(e.target.value)}
//             placeholder="Enter recipient emails"
//           />
//         </div>
//         <div className="form-group">
//           <label htmlFor="message">Message</label>
//           <textarea
//             id="message"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Enter your message"
//           ></textarea>
//         </div>
//         <button type="submit">Send Message</button>
//       </form>
//       {status && <p className="status">{status}</p>}
//     </div>
//   );
// }

// export default Messaging;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/messaging.css";
import axios from "axios";

function Messaging() {
  // State for top-right menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Track which conversation is selected
  const [selectedConversationId, setSelectedConversationId] = useState(null);

  // Input state for the new message
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState("");

  // Dummy conversation data
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Alice",
      messages: [
        { sender: "Alice", text: "Hey! How are you?" },
        { sender: "You", text: "I'm good, thanks!" },
      ],
    },
    {
      id: 2,
      name: "Bob",
      messages: [
        { sender: "Bob", text: "Got a minute to chat?" },
        { sender: "You", text: "Sure thing, what's up?" },
      ],
    },
    {
      id: 3,
      name: "Charlie",
      messages: [
        { sender: "Charlie", text: "Don't forget the meeting later." },
      ],
    },
  ]);

  // Toggle the top-right menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Select a conversation by ID
  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    setStatus("");
  };

  // Find the currently selected conversation
  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  // Simulate encryption using base64
  const encryptMessage = (msg) => btoa(msg);

  // Handle sending a new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setStatus("Please enter a message.");
      return;
    }
    if (!selectedConversation) {
      setStatus("No conversation selected.");
      return;
    }

    const encrypted = encryptMessage(newMessage);

    try {
      // Simulate sending message to backend
      await axios.post("https://localhost:8443/api/messages/send", {
        recipient: selectedConversation.name, // or an email
        message: encrypted,
      });

      // Update local conversation data
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, { sender: "You", text: newMessage }],
          };
        }
        return conv;
      });

      setConversations(updatedConversations);
      setNewMessage("");
      setStatus("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("Failed to send message.");
    }
  };

  return (
    <div className="messages-container">
      {/* TOP-RIGHT MENU */}
      <div className="menu-container">
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Menu">
          ☰
        </button>
        <nav className={`menu ${isMenuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link to="/home" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/messaging" onClick={() => setIsMenuOpen(false)}>
                Messaging
              </Link>
            </li>
            <li>
              <Link to="/file_storage" onClick={() => setIsMenuOpen(false)}>
                File Storage
              </Link>
            </li>
            {/* Add additional links as needed (View Messages, etc.) */}
          </ul>
        </nav>
      </div>

      {/* TWO-COLUMN LAYOUT FOR WEB APP */}
      <div className="messaging-wrapper">
        {/* LEFT COLUMN: Conversations Panel */}
        <div className="conversations-panel">
          <div className="conversations-header">
            <h3>Chats</h3>
            <button className="new-call-btn">New Group Call</button>
          </div>
          <div className="conversations-list">
            {conversations.map((conv) => {
              const lastMsg =
                conv.messages[conv.messages.length - 1]?.text || "";
              return (
                <div
                  key={conv.id}
                  className={`conversation-item ${
                    selectedConversationId === conv.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <p className="conversation-name">{conv.name}</p>
                  <p className="conversation-last">{lastMsg}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Panel */}
        <div className="chat-panel">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <h3>Chat with {selectedConversation.name}</h3>
              </div>
              <div className="chat-messages">
                {selectedConversation.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`message-bubble ${
                      msg.sender === "You" ? "sent" : "received"
                    }`}
                  >
                    <p className="message-sender">{msg.sender}</p>
                    <p className="message-text">{msg.text}</p>
                  </div>
                ))}
              </div>
              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit">Send</button>
              </form>
              {status && <p className="status">{status}</p>}
            </>
          ) : (
            <div className="no-conversation">
              <h3>Select a conversation to start chatting</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messaging;
