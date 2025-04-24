import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import "../css/chatRoom.css";
import { over } from 'stompjs';
import SockJS from 'sockjs-client';

let stompClient = null;

const ChatRoom = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("Redirecting to login (no token found)");
      navigate("/login");
    }
  }, [navigate]);

  const [isMenuOpen, setIsMenuOpen]     = useState(false);
  const toggleMenu                      = () => setIsMenuOpen(o => !o);

  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats]   = useState([]);
  const [tab, setTab]                   = useState("CHATROOM");
  const [userData, setUserData]         = useState({
    username: '',
    receivername: '',
    connected: false,
    message: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef                    = useRef(null);

  useEffect(() => {
    console.log("[userData]", userData);
  }, [userData]);

  const connect = () => {
    console.log("[connect] Connecting to WebSocket...");
    const sock = new SockJS('https://localhost:8443/ws');
    stompClient = over(sock);
    stompClient.connect({}, onConnected, onError);
  };
  const onConnected = () => {
    console.log("[onConnected] Connected to WebSocket");
    setUserData(u => ({ ...u, connected: true }));
    stompClient.subscribe('/chatroom/public', onMessageReceived);
    stompClient.subscribe(`/user/${userData.username}/private`, onPrivateMessage);
    userJoin();
  };
  const onError = err => {
    console.error("[onError]", err);
  };

  const userJoin = () => {
    console.log("[userJoin] Sending JOIN message");
    const joinMsg = { senderName: userData.username, status: "JOIN" };
    stompClient.send("/app/message", {}, JSON.stringify(joinMsg));
  };

  const onMessageReceived = ({ body }) => {
    const msg = JSON.parse(body);
    console.log("[onMessageReceived]", msg);

    if (msg.status === "JOIN") {
      setPrivateChats(m => {
        if (!m.has(msg.senderName)) m.set(msg.senderName, []);
        return new Map(m);
      });
    } else if (msg.status === "MESSAGE") {
      if (msg.fileData && msg.fileData.startsWith("data:")) return;

      setPublicChats(prev => {
        let cleaned = prev.filter(
          m => m.fileName !== msg.fileName || !(m.fileData && m.fileData.startsWith("data:"))
        );
        return [...cleaned, msg];
      });
    }
  };

  const onPrivateMessage = ({ body }) => {
    const msg = JSON.parse(body);
    console.log("[onPrivateMessage]", msg);

    if (msg.status === "MESSAGE") {
      if (msg.fileData && msg.fileData.startsWith("data:")) return;

      setPrivateChats(prev => {
        const arr = prev.get(msg.senderName) || [];
        const cleaned = arr.filter(
          m => m.fileName !== msg.fileName || !(m.fileData && m.fileData.startsWith("data:"))
        );
        cleaned.push(msg);
        prev.set(msg.senderName, cleaned);
        return new Map(prev);
      });
    }
  };

  const handleUsername   = e => setUserData(u => ({ ...u, username: e.target.value }));
  const handleMessage    = e => setUserData(u => ({ ...u, message: e.target.value }));
  const handleFileUpload = e => {
    const f = e.target.files?.[0] ?? null;
    setSelectedFile(f && f.size > 0 ? f : null);
  };

  const renderFile = chat => (
    <div className="file-upload">
      <a href={chat.fileData} download={chat.fileName}>
        Download {chat.fileName}
      </a>
    </div>
  );

  const renderBubble = chat => (
    <div className={`message-bubble ${chat.senderName === userData.username ? "sent" : ""}`}>
      {chat.fileName
        ? renderFile(chat)
        : <div>{chat.message}</div>
      }
    </div>
  );

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

  const sendValue = () => {
    if (!stompClient) {
      console.warn("[sendValue] stompClient not connected");
      return;
    }

    let file = selectedFile || (fileInputRef.current && fileInputRef.current.files[0]);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const placeholder = {
          senderName: userData.username,
          receiverName: null,
          message: "",
          fileName: file.name,
          fileData: dataUrl,
          status: "MESSAGE"
        };
        setPublicChats(pc => [...pc, placeholder]);
        stompClient.send("/app/message", {}, JSON.stringify(placeholder));

        setSelectedFile(null);
        setUserData(u => ({ ...u, message: "" }));
        fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    } else {
      const chatMessage = {
        senderName: userData.username,
        receiverName: null,
        message: userData.message,
        status: "MESSAGE"
      };
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData(u => ({ ...u, message: "" }));
    }
  };

  const sendPrivateValue = () => {
    if (!stompClient) {
      console.warn("[sendPrivateValue] stompClient not connected");
      return;
    }

    let file = selectedFile || (fileInputRef.current && fileInputRef.current.files[0]);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const placeholder = {
          senderName: userData.username,
          receiverName: tab,
          message: "",
          fileName: file.name,
          fileData: dataUrl,
          status: "MESSAGE"
        };
        setPrivateChats(pc => {
          const arr = pc.get(tab) || [];
          arr.push(placeholder);
          pc.set(tab, arr);
          return new Map(pc);
        });
        stompClient.send("/app/private-message", {}, JSON.stringify(placeholder));

        setSelectedFile(null);
        setUserData(u => ({ ...u, message: "" }));
        fileInputRef.current.value = "";
      };
      reader.readAsDataURL(file);
    } else {
      const chatMessage = {
        senderName: userData.username,
        receiverName: tab,
        message: userData.message,
        status: "MESSAGE"
      };
      stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
      setUserData(u => ({ ...u, message: "" }));
    }
  };

  const registerUser = () => {
    if (userData.username.trim()) {
      connect();
    }
  };

  return (
    <div className="container">
      <div className="menu-container">
        <button className="menu-toggle" onClick={toggleMenu}>☰</button>
        <nav className={`menu ${isMenuOpen ? "open" : ""}`}>
          <ul>
            <li><Link to="/home" onClick={toggleMenu}>Home</Link></li>
            <li><Link to="/file_storage" onClick={toggleMenu}>File Storage</Link></li>
          </ul>
        </nav>
      </div>

      {userData.connected ? (
        <div className="chat-box">
          <div className="member-list">
            <ul>
              <li onClick={() => setTab("CHATROOM")} className={tab === "CHATROOM" ? "member active" : "member"}>Chatroom</li>
              {[...privateChats.keys()].map((name, idx) => (
                <li key={idx} onClick={() => setTab(name)} className={tab === name ? "member active" : "member"}>
                  {name}
                </li>
              ))}
            </ul>
          </div>

          <div className="chat-content">
            {tab === "CHATROOM" ? (
              <>
                <ul className="chat-messages">
                  {publicChats.map(renderMessage)}
                </ul>
                <div className="send-message">
                  <input
                    type="text"
                    className="input-message"
                    placeholder="Enter message"
                    value={userData.message}
                    onChange={handleMessage}
                    maxLength={500}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="file-upload-input"
                    onChange={handleFileUpload}
                  />
                  <button className="send-button" onClick={sendValue}>Send</button>
                </div>
              </>
            ) : (
              <>
                <ul className="chat-messages">
                  {(privateChats.get(tab) || []).map(renderMessage)}
                </ul>
                <div className="send-message">
                  <input
                    type="text"
                    className="input-message"
                    placeholder="Enter message"
                    value={userData.message}
                    onChange={handleMessage}
                    maxLength={500}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="file-upload-input"
                    onChange={handleFileUpload}
                  />
                  <button className="send-button" onClick={sendPrivateValue}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="register">
          <input
            id="user-name"
            placeholder="Enter your name"
            value={userData.username}
            onChange={handleUsername}
          />
          <button onClick={registerUser}>Connect</button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;