import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import "../css/chatRoom.css";
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient = null;

const ChatRoom = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState([]);
  const [tab, setTab] = useState("CHATROOM");
  const [userData, setUserData] = useState({
    username: '',
    receivername: '',
    connected: false,
    message: ''
  });

  // File state for base64 conversion (client-only, not saved on backend)
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("[useEffect] userData changed:", userData);
  }, [userData]);

  const connect = () => {
    console.log("[connect] Connecting to WebSocket...");
    let Sock = new SockJS('https://localhost:8443/ws');
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    console.log("[onConnected] Connected to WebSocket");
    setUserData({ ...userData, connected: true });
    stompClient.subscribe('/chatroom/public', onMessageReceived);
    stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
    userJoin();
  };

  const onError = (err) => {
    console.error("[onError] Error:", err);
  };

  const userJoin = () => {
    console.log("[userJoin] Sending JOIN message");
    const chatMessage = {
      senderName: userData.username,
      status: "JOIN"
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const onMessageReceived = (payload) => {
    console.log("[onMessageReceived] raw payload.body =", payload.body);
    const payloadData = JSON.parse(payload.body);
    console.log("[onMessageReceived] parsed payloadData =", payloadData);
    if (payloadData.status === "JOIN") {
      if (!privateChats.get(payloadData.senderName)) {
        privateChats.set(payloadData.senderName, []);
        setPrivateChats(new Map(privateChats));
      }
    } else if (payloadData.status === "MESSAGE") {
      console.log("[onMessageReceived] Received message with fileData =", payloadData.fileData);
      publicChats.push(payloadData);
      setPublicChats([...publicChats]);
    }
  };

  const onPrivateMessage = (payload) => {
    console.log("[onPrivateMessage] raw payload.body =", payload.body);
    const payloadData = JSON.parse(payload.body);
    console.log("[onPrivateMessage] parsed payloadData =", payloadData);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      privateChats.set(payloadData.senderName, [payloadData]);
      setPrivateChats(new Map(privateChats));
    }
  };

  const handleMessage = (event) => {
    setUserData({ ...userData, message: event.target.value });
  };

  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log("[handleFileUpload] Selected file:", file.name, "size:", file.size, "type:", file.type);
      if (file.size > 0) {
        setSelectedFile(file);
      } else {
        console.warn("[handleFileUpload] File is empty.");
        setSelectedFile(null);
      }
    } else {
      console.log("[handleFileUpload] No file selected.");
      setSelectedFile(null);
    }
  };

  // Render a clickable download link using the fileData (base64 URL)
  const renderFile = (chat) => {
    if (!chat.fileData) return null;
    return (
      <div className="file-upload">
        <a href={chat.fileData} download={chat.fileName}>
          Download {chat.fileName}
        </a>
      </div>
    );
  };

  // Render the chat bubble using CSS classes from chatRoom.css
  const renderBubble = (chat) => {
    return (
      <div className={`message-bubble ${chat.senderName === userData.username ? "sent" : ""}`}>
        {chat.fileData ? renderFile(chat) : <div>{chat.message}</div>}
      </div>
    );
  };

  // Render each message as a list item with proper class names for styling
  const renderMessage = (chat, index) => {
    const isSelf = chat.senderName === userData.username;
    return (
      <li key={index} className={`chat-message ${isSelf ? "self" : "other"}`}>
        {!isSelf && <div className="avatar">{chat.senderName}</div>}
        {renderBubble(chat)}
        {isSelf && <div className="avatar self">{chat.senderName}</div>}
      </li>
    );
  };

  // Convert the selected file to a base64 data URL and attach it to the chat message.
  const sendValue = () => {
    if (!stompClient) {
      console.warn("[sendValue] stompClient is not connected.");
      return;
    }
    console.log("[sendValue] Attempting to send a message...");
    let file = selectedFile || (fileInputRef.current && fileInputRef.current.files[0]);
    if (file) {
      console.log("[sendValue] Found a file to send:", file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          console.log("[sendValue] FileReader onload triggered. Data URL length:", reader.result.length);
        } else {
          console.warn("[sendValue] FileReader onload triggered but reader.result is undefined.");
        }
        // Build the ChatMessage payload matching your ChatMessage model
        const chatMessage = {
          senderName: userData.username,
          receiverName: null, // For public messages, leave null
          message: userData.message.trim() === "" ? "File Sent" : userData.message,
          fileName: file.name,
          fileData: reader.result || "",
          status: "MESSAGE"
        };
        console.log("[sendValue] Final chatMessage to send:", chatMessage);
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
        setUserData({ ...userData, message: "" });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.onerror = (err) => {
        console.error("[sendValue] FileReader error:", err);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("[sendValue] No file found, sending text only.");
      const chatMessage = {
        senderName: userData.username,
        receiverName: null,
        message: userData.message,
        status: "MESSAGE"
      };
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const sendPrivateValue = () => {
    if (!stompClient) {
      console.warn("[sendPrivateValue] stompClient is not connected.");
      return;
    }
    console.log("[sendPrivateValue] Attempting to send a private message to:", tab);
    let file = selectedFile || (fileInputRef.current && fileInputRef.current.files[0]);
    if (file) {
      console.log("[sendPrivateValue] Found a file to send:", file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          console.log("[sendPrivateValue] FileReader onload triggered. Data URL length:", reader.result.length);
        } else {
          console.warn("[sendPrivateValue] FileReader onload triggered but reader.result is undefined.");
        }
        const chatMessage = {
          senderName: userData.username,
          receiverName: tab,
          message: userData.message.trim() === "" ? "File Sent" : userData.message,
          fileName: file.name,
          fileData: reader.result || "",
          status: "MESSAGE"
        };
        if (userData.username !== tab) {
          privateChats.get(tab).push(chatMessage);
          setPrivateChats(new Map(privateChats));
        }
        console.log("[sendPrivateValue] Final chatMessage to send (private):", chatMessage);
        stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
        setUserData({ ...userData, message: "" });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.onerror = (err) => {
        console.error("[sendPrivateValue] FileReader error:", err);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("[sendPrivateValue] No file found, sending text only.");
      const chatMessage = {
        senderName: userData.username,
        receiverName: tab,
        message: userData.message,
        status: "MESSAGE"
      };
      if (userData.username !== tab) {
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const handleUsername = (event) => {
    setUserData({ ...userData, username: event.target.value });
  };

  const registerUser = () => {
    console.log("[registerUser] Connecting with username:", userData.username);
    connect();
  };

  return (
    <div className="container">
      <div className="menu-container">
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Menu">☰</button>
        <nav className={`menu ${isMenuOpen ? "open" : ""}`}>
          <ul>
            <li><Link to="/home" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
            <li><Link to="/file_storage" onClick={() => setIsMenuOpen(false)}>File Storage</Link></li>
          </ul>
        </nav>
      </div>
      {userData.connected ? (
        <div className="chat-box">
          <div className="member-list">
            <ul>
              <li onClick={() => setTab("CHATROOM")} className={tab === "CHATROOM" ? "member active" : "member"}>Chatroom</li>
              {[...privateChats.keys()].map((name, index) => (
                <li key={index} onClick={() => setTab(name)} className={tab === name ? "member active" : "member"}>
                  {name}
                </li>
              ))}
            </ul>
          </div>
          {tab === "CHATROOM" ? (
            <div className="chat-content">
              <ul className="chat-messages">
                {publicChats.map((chat, index) => renderMessage(chat, index))}
              </ul>
              <div className="send-message">
                <input type="text" className="input-message" placeholder="Enter the message" value={userData.message} onChange={handleMessage} maxLength="500" />
                <input ref={fileInputRef} type="file" className="file-upload-input" onChange={handleFileUpload} />
                <button type="button" className="send-button" onClick={sendValue}>Send</button>
              </div>
            </div>
          ) : (
            <div className="chat-content">
              <ul className="chat-messages">
                {[...privateChats.get(tab)].map((chat, index) => renderMessage(chat, index))}
              </ul>
              <div className="send-message">
                <input type="text" className="input-message" placeholder="Enter the message" value={userData.message} onChange={handleMessage} maxLength="500" />
                <input ref={fileInputRef} type="file" className="file-upload-input" onChange={handleFileUpload} />
                <button type="button" className="send-button" onClick={sendPrivateValue}>Send</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="register">
          <input id="user-name" placeholder="Enter your name" name="userName" value={userData.username} onChange={handleUsername} />
          <button type="button" onClick={registerUser}>Connect</button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;

