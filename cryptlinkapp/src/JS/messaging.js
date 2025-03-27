
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/messaging.css";
import axios from "axios";

function Messaging() {
  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Conversation state (dummy conversations)
  const [selectedConversationId, setSelectedConversationId] = useState(null);
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

  // Chat input state
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState(null); // Will store Base64 string
  const [status, setStatus] = useState("");

  // Friend search state
  const [searchQuery, setSearchQuery] = useState("");
  const [friendResults, setFriendResults] = useState([]);

  // Dummy registered users (simulate backend data)
  const dummyRegisteredUsers = [
    { id: 4, name: "Diana" },
    { id: 5, name: "Eve" },
    { id: 6, name: "Frank" },
    { id: 7, name: "Grace" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    setStatus("");
  };

  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  // Simulate encryption using base64 for text messages
  const encryptMessage = (msg) => btoa(msg);

  // Handle file attachment change
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // For demo, we simulate encryption by using the Base64 data URL
        setAttachment(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle sending a new message with optional attachment
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) {
      setStatus("Please enter a message or attach a file.");
      return;
    }
    if (!selectedConversation) {
      setStatus("No conversation selected.");
      return;
    }
    const encryptedText = newMessage.trim() ? encryptMessage(newMessage) : "";
    const payload = {
      recipient: selectedConversation.name,
      message: encryptedText,
      attachment: attachment, // May be null if no file attached
    };

    try {
      await axios.post("https://localhost:8443/api/messages/send", payload);
      // Update local conversation data
      const updatedConversations = conversations.map((conv) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              { sender: "You", text: newMessage || (attachment ? "[File Attached]" : "") },
            ],
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      setNewMessage("");
      setAttachment(null);
      setStatus("Message sent!");
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("Failed to send message.");
    }
  };

  // Friend search handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFriendSearch = () => {
    const results = dummyRegisteredUsers.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFriendResults(results);
  };

  const handleAddFriend = (friend) => {
    alert(`${friend.name} added as a friend!`);
    // Add friend to conversation list if not already present
    if (!conversations.find((conv) => conv.name === friend.name)) {
      const newConv = { id: Date.now(), name: friend.name, messages: [] };
      setConversations([...conversations, newConv]);
    }
    setSearchQuery("");
    setFriendResults([]);
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
              <Link to="/file_storage" onClick={() => setIsMenuOpen(false)}>
                File Storage
              </Link>
            </li>
            {/* Additional links can be added here */}
          </ul>
        </nav>
      </div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="messaging-wrapper">
        {/* LEFT COLUMN: Conversations Panel and Add Friends Section */}
        <div className="conversations-panel">
          <div className="conversations-header">
            <h3>Chats</h3>
            <button className="new-call-btn">New Group Call</button>
          </div>
          <div className="conversations-list">
            {conversations.map((conv) => {
              const lastMsg = conv.messages[conv.messages.length - 1]?.text || "";
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
          {/* Add Friends Section */}
          <div className="add-friends-section">
            <h4>Add Friends</h4>
            <div className="friend-search">
              <input
                type="text"
                placeholder="Search for users..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button className="search-btn" onClick={handleFriendSearch}>
                Search
              </button>
            </div>
            <div className="friend-results">
              {friendResults.map((friend) => (
                <div key={friend.id} className="friend-item">
                  <span>{friend.name}</span>
                  <button className="add-btn" onClick={() => handleAddFriend(friend)}>
                    Add
                  </button>
                </div>
              ))}
            </div>
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
                    className={`message-bubble ${msg.sender === "You" ? "sent" : "received"}`}
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
                <input
                  type="file"
                  id="attachment"
                  onChange={handleAttachmentChange}
                  className="attachment-input"
                />
                <button type="submit">Send</button>
              </form>
              {attachment && (
                <p className="attachment-preview">
                  Attached file: {attachment.substring(0, 30)}...
                </p>
              )}
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
