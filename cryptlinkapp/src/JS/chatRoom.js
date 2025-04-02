import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import "../css/chatRoom.css";  
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

var stompClient = null;
const ChatRoom = () => {
  // Menu state added
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Existing state and logic
  const [privateChats, setPrivateChats] = useState(new Map());     
  const [publicChats, setPublicChats] = useState([]); 
  const [tab, setTab] = useState("CHATROOM");
  const [userData, setUserData] = useState({
    username: '/',
    receivername: '',
    connected: false,
    message: ''
  });

  // NEW: File hyperlink state for sharing file URLs
  const [fileLink, setFileLink] = useState("");

  useEffect(() => {
    console.log(userData);
  }, [userData]);

  const connect = () => {
    let Sock = new SockJS('https://localhost:8443/ws');
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    setUserData({ ...userData, "connected": true });
    stompClient.subscribe('/chatroom/public', onMessageReceived);
    stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
    userJoin();
  };

  const userJoin = () => {
    var chatMessage = {
      senderName: userData.username,
      status: "JOIN"
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const onMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    switch (payloadData.status) {
      case "JOIN":
        if (!privateChats.get(payloadData.senderName)) {
          privateChats.set(payloadData.senderName, []);
          setPrivateChats(new Map(privateChats));
        }
        break;
      case "MESSAGE":
        publicChats.push(payloadData);
        setPublicChats([...publicChats]);
        break;
    }
  };

  const onPrivateMessage = (payload) => {
    console.log(payload);
    var payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      let list = [];
      list.push(payloadData);
      privateChats.set(payloadData.senderName, list);
      setPrivateChats(new Map(privateChats));
    }
  };

  const onError = (err) => {
    console.log(err);
  };

  const handleMessage = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, "message": value });
  };

  // NEW: Handle changes for file hyperlink input
  const handleFileLinkChange = (event) => {
    setFileLink(event.target.value);
  };

  const sendValue = () => {
    if (stompClient) {
      var chatMessage = {
        senderName: userData.username,
        message: userData.message,
        fileLink: fileLink, // Include file hyperlink if provided
        status: "MESSAGE"
      };
      console.log(chatMessage);
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, "message": "" });
      setFileLink("");
    }
  };

  const sendPrivateValue = () => {
    if (stompClient) {
      var chatMessage = {
        senderName: userData.username,
        receiverName: tab,
        message: userData.message,
        fileLink: fileLink, // Include file hyperlink if provided
        status: "MESSAGE"
      };
      if (userData.username !== tab) {
        privateChats.get(tab).push(chatMessage);
        setPrivateChats(new Map(privateChats));
      }
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, "message": "" });
      setFileLink("");
    }
  };

  const handleUsername = (event) => {
    const { value } = event.target;
    setUserData({ ...userData, "username": value });
  };

  const registerUser = () => {
    connect();
  };

  return (
    <div className="container">
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
          </ul>
        </nav>
      </div>
      {userData.connected ? (
        <div className="chat-box">
          <div className="member-list">
            <ul>
              <li onClick={() => { setTab("CHATROOM") }} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
              {[...privateChats.keys()].map((name, index) => (
                <li onClick={() => { setTab(name) }} className={`member ${tab===name && "active"}`} key={index}>{name}</li>
              ))}
            </ul>
          </div>
          {tab==="CHATROOM" ? (
            <div className="chat-content">
              <ul className="chat-messages">
                {publicChats.map((chat, index) => (
                  <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                    <div className="message-data">
                      {chat.message}
                      {chat.fileLink && (
                        <div className="file-link">
                          <a href={chat.fileLink} target="_blank" rel="noopener noreferrer">View File</a>
                        </div>
                      )}
                    </div>
                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                  </li>
                ))}
              </ul>
              <div className="send-message">
                <input type="text" className="input-message" placeholder="Enter the message" value={userData.message} onChange={handleMessage} />
                <input
                  type="text"
                  className="file-link-input"
                  placeholder="Enter file hyperlink (optional)"
                  value={fileLink}
                  onChange={handleFileLinkChange}
                />
                <button type="button" className="send-button" onClick={sendValue}>Send</button>
              </div>
            </div>
          ) : (
            <div className="chat-content">
              <ul className="chat-messages">
                {[...privateChats.get(tab)].map((chat, index) => (
                  <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
                    {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
                    <div className="message-data">
                      {chat.message}
                      {chat.fileLink && (
                        <div className="file-link">
                          <a href={chat.fileLink} target="_blank" rel="noopener noreferrer">View File</a>
                        </div>
                      )}
                    </div>
                    {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
                  </li>
                ))}
              </ul>
              <div className="send-message">
                <input type="text" className="input-message" placeholder="Enter the message" value={userData.message} onChange={handleMessage} />
                <input
                  type="text"
                  className="file-link-input"
                  placeholder="Enter file hyperlink (optional)"
                  value={fileLink}
                  onChange={handleFileLinkChange}
                />
                <button type="button" className="send-button" onClick={sendPrivateValue}>Send</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="register">
          <input
            id="user-name"
            placeholder="Enter your name"
            name="userName"
            value={userData.username}
            onChange={handleUsername}
          />
          <button type="button" onClick={registerUser}>
            Connect
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
