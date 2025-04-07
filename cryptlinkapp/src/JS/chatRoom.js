// import React, { useEffect, useState } from 'react';
// import { Link } from "react-router-dom";
// import "../css/chatRoom.css";  
// import { over } from 'stompjs';
// import SockJS from 'sockjs-client';

// var stompClient = null;
// const ChatRoom = () => {
//   // TOP-RIGHT MENU STATE
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   // CHAT STATE
//   const [privateChats, setPrivateChats] = useState(new Map());     
//   const [publicChats, setPublicChats] = useState([]); 
//   const [tab, setTab] = useState("CHATROOM");
//   const [userData, setUserData] = useState({
//     username: '',
//     receivername: '',
//     connected: false,
//     message: ''
//   });

//   // NEW: File upload state for storing the selected file
//   const [selectedFile, setSelectedFile] = useState(null);

//   useEffect(() => {
//     console.log(userData);
//   }, [userData]);

//   const connect = () => {
//     let Sock = new SockJS('https://localhost:8443/ws');
//     stompClient = over(Sock);
//     stompClient.connect({}, onConnected, onError);
//   };

//   const onConnected = () => {
//     setUserData({ ...userData, "connected": true });
//     stompClient.subscribe('/chatroom/public', onMessageReceived);
//     stompClient.subscribe('/user/' + userData.username + '/private', onPrivateMessage);
//     userJoin();
//   };

//   const userJoin = () => {
//     var chatMessage = {
//       senderName: userData.username,
//       status: "JOIN"
//     };
//     stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
//   };

//   const onMessageReceived = (payload) => {
//     var payloadData = JSON.parse(payload.body);
//     switch (payloadData.status) {
//       case "JOIN":
//         if (!privateChats.get(payloadData.senderName)) {
//           privateChats.set(payloadData.senderName, []);
//           setPrivateChats(new Map(privateChats));
//         }
//         break;
//       case "MESSAGE":
//         publicChats.push(payloadData);
//         setPublicChats([...publicChats]);
//         break;
//     }
//   };

//   const onPrivateMessage = (payload) => {
//     console.log(payload);
//     var payloadData = JSON.parse(payload.body);
//     if (privateChats.get(payloadData.senderName)) {
//       privateChats.get(payloadData.senderName).push(payloadData);
//       setPrivateChats(new Map(privateChats));
//     } else {
//       let list = [];
//       list.push(payloadData);
//       privateChats.set(payloadData.senderName, list);
//       setPrivateChats(new Map(privateChats));
//     }
//   };

//   const onError = (err) => {
//     console.log(err);
//   };

//   const handleMessage = (event) => {
//     const { value } = event.target;
//     setUserData({ ...userData, "message": value });
//   };

//   // NEW: File upload handler
//   const handleFileUpload = (event) => {
//     if (event.target.files && event.target.files[0]) {
//       setSelectedFile(event.target.files[0]);
//     }
//   };

//   const sendValue = () => {
//     if (stompClient) {
//       if (selectedFile) {
//         // If a file is selected, read it as base64 and include in the message
//         const reader = new FileReader();
//         reader.onload = () => {
//           var chatMessage = {
//             senderName: userData.username,
//             message: userData.message,
//             fileName: selectedFile.name,
//             fileData: reader.result, // base64 encoded file data
//             status: "MESSAGE"
//           };
//           console.log(chatMessage);
//           stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
//           setUserData({ ...userData, "message": "" });
//           setSelectedFile(null);
//         };
//         reader.readAsDataURL(selectedFile);
//       } else {
//         var chatMessage = {
//           senderName: userData.username,
//           message: userData.message,
//           status: "MESSAGE"
//         };
//         console.log(chatMessage);
//         stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
//         setUserData({ ...userData, "message": "" });
//       }
//     }
//   };

//   const sendPrivateValue = () => {
//     if (stompClient) {
//       if (selectedFile) {
//         const reader = new FileReader();
//         reader.onload = () => {
//           var chatMessage = {
//             senderName: userData.username,
//             receiverName: tab,
//             message: userData.message,
//             fileName: selectedFile.name,
//             fileData: reader.result,
//             status: "MESSAGE"
//           };
//           if (userData.username !== tab) {
//             privateChats.get(tab).push(chatMessage);
//             setPrivateChats(new Map(privateChats));
//           }
//           stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
//           setUserData({ ...userData, "message": "" });
//           setSelectedFile(null);
//         };
//         reader.readAsDataURL(selectedFile);
//       } else {
//         var chatMessage = {
//           senderName: userData.username,
//           receiverName: tab,
//           message: userData.message,
//           status: "MESSAGE"
//         };
//         if (userData.username !== tab) {
//           privateChats.get(tab).push(chatMessage);
//           setPrivateChats(new Map(privateChats));
//         }
//         stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
//         setUserData({ ...userData, "message": "" });
//       }
//     }
//   };

//   const handleUsername = (event) => {
//     const { value } = event.target;
//     setUserData({ ...userData, "username": value });
//   };

//   const registerUser = () => {
//     connect();
//   };

//   return (
//     <div className="container">
//       {/* TOP-RIGHT MENU */}
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
//       {userData.connected ? (
//         <div className="chat-box">
//           <div className="member-list">
//             <ul>
//               <li onClick={() => { setTab("CHATROOM") }} className={`member ${tab==="CHATROOM" && "active"}`}>Chatroom</li>
//               {[...privateChats.keys()].map((name, index) => (
//                 <li onClick={() => { setTab(name) }} className={`member ${tab===name && "active"}`} key={index}>
//                   {name}
//                 </li>
//               ))}
//             </ul>
//           </div>
//           {tab==="CHATROOM" ? (
//             <div className="chat-content">
//               <ul className="chat-messages">
//                 {publicChats.map((chat, index) => (
//                   <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
//                     {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
//                     <div className="message-data">
//                       {chat.message}
//                       {chat.fileData && (
//                         <div className="file-upload">
//                           <a href={chat.fileData} download={chat.fileName}>Download File</a>
//                         </div>
//                       )}
//                     </div>
//                     {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
//                   </li>
//                 ))}
//               </ul>
//               <div className="send-message">
//                 <input
//                   type="text"
//                   className="input-message"
//                   placeholder="Enter the message"
//                   value={userData.message}
//                   onChange={handleMessage}
//                   maxLength="500"
//                 />
//                 {/* File upload input */}
//                 <input
//                   type="file"
//                   className="file-upload-input"
//                   onChange={handleFileUpload}
//                 />
//                 <button type="button" className="send-button" onClick={sendValue}>Send</button>
//               </div>
//             </div>
//           ) : (
//             <div className="chat-content">
//               <ul className="chat-messages">
//                 {[...privateChats.get(tab)].map((chat, index) => (
//                   <li className={`message ${chat.senderName === userData.username && "self"}`} key={index}>
//                     {chat.senderName !== userData.username && <div className="avatar">{chat.senderName}</div>}
//                     <div className="message-data">
//                       {chat.message}
//                       {chat.fileData && (
//                         <div className="file-upload">
//                           <a href={chat.fileData} download={chat.fileName}>Download File</a>
//                         </div>
//                       )}
//                     </div>
//                     {chat.senderName === userData.username && <div className="avatar self">{chat.senderName}</div>}
//                   </li>
//                 ))}
//               </ul>
//               <div className="send-message">
//                 <input
//                   type="text"
//                   className="input-message"
//                   placeholder="Enter the message"
//                   value={userData.message}
//                   onChange={handleMessage}
//                   maxLength="500"
//                 />
//                 {/* File upload input */}
//                 <input
//                   type="file"
//                   className="file-upload-input"
//                   onChange={handleFileUpload}
//                 />
//                 <button type="button" className="send-button" onClick={sendPrivateValue}>Send</button>
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="register">
//           <input
//             id="user-name"
//             placeholder="Enter your name"
//             name="userName"
//             value={userData.username}
//             onChange={handleUsername}
//           />
//           <button type="button" onClick={registerUser}>
//             Connect
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatRoom;
import React, { useEffect, useRef, useState } from 'react';
import { Link } from "react-router-dom";
import "../css/chatRoom.css";  
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

var stompClient = null;
const ChatRoom = () => {
  // TOP-RIGHT MENU STATE
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // CHAT STATE
  const [privateChats, setPrivateChats] = useState(new Map());
  const [publicChats, setPublicChats] = useState([]);
  const [tab, setTab] = useState("CHATROOM");
  const [userData, setUserData] = useState({
    username: '',
    receivername: '',
    connected: false,
    message: ''
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("[useEffect] userData:", userData);
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

  const userJoin = () => {
    console.log("[userJoin] Sending JOIN message");
    const chatMessage = {
      senderName: userData.username,
      status: "JOIN"
    };
    stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
  };

  const onMessageReceived = (payload) => {
    const payloadData = JSON.parse(payload.body);
    console.log("[onMessageReceived] Payload:", payloadData);
    if (payloadData.status === "JOIN") {
      if (!privateChats.get(payloadData.senderName)) {
        privateChats.set(payloadData.senderName, []);
        setPrivateChats(new Map(privateChats));
      }
    } else if (payloadData.status === "MESSAGE") {
      publicChats.push(payloadData);
      setPublicChats([...publicChats]);
    }
  };

  const onPrivateMessage = (payload) => {
    console.log("[onPrivateMessage] Payload:", payload);
    const payloadData = JSON.parse(payload.body);
    if (privateChats.get(payloadData.senderName)) {
      privateChats.get(payloadData.senderName).push(payloadData);
      setPrivateChats(new Map(privateChats));
    } else {
      privateChats.set(payloadData.senderName, [payloadData]);
      setPrivateChats(new Map(privateChats));
    }
  };

  const onError = (err) => {
    console.error("[onError] Error:", err);
  };

  const handleMessage = (event) => {
    setUserData({ ...userData, message: event.target.value });
  };

  // File upload handler with logging
  const handleFileUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      console.log("[handleFileUpload] Selected file:", file.name, "size:", file.size);
      if (file.size > 0) {
        setSelectedFile(file);
      } else {
        console.error("[handleFileUpload] File is empty.");
        setSelectedFile(null);
      }
    } else {
      console.log("[handleFileUpload] No file selected.");
      setSelectedFile(null);
    }
  };

  // Render a clickable download link.
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

  // Render chat bubble:
  // If fileData exists, ignore the message text and show only the download link.
  // Otherwise, display the text message.
  const renderBubble = (chat) => {
    return (
      <div className={`message-bubble ${chat.senderName === userData.username ? "sent" : ""}`}>
        {chat.fileData ? renderFile(chat) : <div>{chat.message}</div>}
      </div>
    );
  };

  // Render each message with proper alignment.
  const renderMessage = (chat, index) => {
    const isSelf = chat.senderName === userData.username;
    return (
      <li key={index} style={{
          display: 'flex',
          justifyContent: isSelf ? 'flex-end' : 'flex-start',
          alignItems: 'center',
          marginBottom: '0.5rem'
        }}>
        {!isSelf && <div className="avatar">{chat.senderName}</div>}
        {renderBubble(chat)}
        {isSelf && <div className="avatar self">{chat.senderName}</div>}
      </li>
    );
  };

  // Upload the file and send a chat message with the public URL.
  const sendValue = () => {
    console.log("[sendValue] Send clicked. Selected file:", selectedFile);
    if (!stompClient) {
      console.warn("[sendValue] Not connected.");
      return;
    }
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", 1);
      
      axios.post("https://localhost:8443/api/files/upload", formData)
      .then((response) => {
        const publicUrl = response.data; // Expect public URL string
        console.log("[sendValue] File uploaded. Public URL:", publicUrl);
        const msgText = userData.message.trim() === "" ? "File Sent" : userData.message;
        const chatMessage = {
          senderName: userData.username,
          message: msgText,
          fileName: selectedFile.name,
          fileData: publicUrl,
          status: "MESSAGE"
        };
        console.log("[sendValue] Sending payload:", chatMessage);
        stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
        setUserData({ ...userData, message: "" });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      })
      .catch((err) => {
        console.error("[sendValue] Error uploading file:", err);
      });
    } else {
      const chatMessage = {
        senderName: userData.username,
        message: userData.message,
        status: "MESSAGE"
      };
      console.log("[sendValue] Sending text payload:", chatMessage);
      stompClient.send("/app/message", {}, JSON.stringify(chatMessage));
      setUserData({ ...userData, message: "" });
    }
  };

  const sendPrivateValue = () => {
    console.log("[sendPrivateValue] Send private clicked. Selected file:", selectedFile);
    if (!stompClient) {
      console.warn("[sendPrivateValue] Not connected.");
      return;
    }
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("userId", 1);
      axios.post("https://localhost:8443/api/files/upload", formData)
      .then((response) => {
        const publicUrl = response.data;
        console.log("[sendPrivateValue] File uploaded. Public URL:", publicUrl);
        const msgText = userData.message.trim() === "" ? "File Sent" : userData.message;
        const chatMessage = {
          senderName: userData.username,
          receiverName: tab,
          message: msgText,
          fileName: selectedFile.name,
          fileData: publicUrl,
          status: "MESSAGE"
        };
        if (userData.username !== tab) {
          privateChats.get(tab).push(chatMessage);
          setPrivateChats(new Map(privateChats));
        }
        console.log("[sendPrivateValue] Sending payload:", chatMessage);
        stompClient.send("/app/private-message", {}, JSON.stringify(chatMessage));
        setUserData({ ...userData, message: "" });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      })
      .catch((err) => {
        console.error("[sendPrivateValue] Error uploading file:", err);
      });
    } else {
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
      console.log("[sendPrivateValue] Sending private text payload:", chatMessage);
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
      {/* TOP-RIGHT MENU */}
      <div className="menu-container">
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Menu">
          ☰
        </button>
        <nav className={`menu ${isMenuOpen ? "open" : ""}`}>
          <ul>
            <li>
              <Link to="/home" onClick={() => setIsMenuOpen(false)}>Home</Link>
            </li>
            <li>
              <Link to="/file_storage" onClick={() => setIsMenuOpen(false)}>File Storage</Link>
            </li>
          </ul>
        </nav>
      </div>
      {userData.connected ? (
        <div className="chat-box">
          <div className="member-list">
            <ul>
              <li onClick={() => setTab("CHATROOM")} className={`member ${tab === "CHATROOM" && "active"}`}>
                Chatroom
              </li>
              {[...privateChats.keys()].map((name, index) => (
                <li key={index} onClick={() => setTab(name)} className={`member ${tab === name && "active"}`}>
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
                <input
                  type="text"
                  className="input-message"
                  placeholder="Enter the message"
                  value={userData.message}
                  onChange={handleMessage}
                  maxLength="500"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-upload-input"
                  onChange={handleFileUpload}
                />
                <button type="button" className="send-button" onClick={sendValue}>
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="chat-content">
              <ul className="chat-messages">
                {[...privateChats.get(tab)].map((chat, index) => renderMessage(chat, index))}
              </ul>
              <div className="send-message">
                <input
                  type="text"
                  className="input-message"
                  placeholder="Enter the message"
                  value={userData.message}
                  onChange={handleMessage}
                  maxLength="500"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-upload-input"
                  onChange={handleFileUpload}
                />
                <button type="button" className="send-button" onClick={sendPrivateValue}>
                  Send
                </button>
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
          <button type="button" onClick={registerUser}>Connect</button>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
