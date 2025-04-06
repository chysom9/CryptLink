import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/file_storage.css";
import axios from "axios";

function EncryptedFiles() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");
  const [storedFiles, setStoredFiles] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Simulated file encryption (for demonstration only)
  const encryptFile = (file) => file;

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatus("Please select a file to upload.");
      return;
    }
    const encryptedFile = encryptFile(selectedFile);
    const formData = new FormData();
    formData.append("file", encryptedFile);
    try {
      await axios.post("https://localhost:8443/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("File uploaded successfully!");
      setStoredFiles([...storedFiles, selectedFile.name]);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatus("File upload failed.");
    }
  };

  return (
    <div className="files-container">
      {/* Menu Container: Revealed on hover or when toggled open */}
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
              <Link to="/chatroom" onClick={() => setIsMenuOpen(false)}>
                Chat Room
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <h2>File Storage</h2>
      <form className="files-form" onSubmit={handleUpload}>
        <div className="form-group">
          <label htmlFor="file">Select File</label>
          <input type="file" id="file" onChange={handleFileChange} />
        </div>
        <button type="submit">Upload File</button>
      </form>
      {status && <p className="status">{status}</p>}
      {storedFiles.length > 0 && (
        <div className="stored-files">
          <h3>Stored Files:</h3>
          <ul>
            {storedFiles.map((fileName, index) => (
              <li key={index}>{fileName}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default EncryptedFiles;
