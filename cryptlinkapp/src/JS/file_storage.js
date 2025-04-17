
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/file_storage.css";
import axios from "axios";

function EncryptedFiles() {
  // For demonstration, we use a hard-coded userId.
  const userId = localStorage.getItem("userId"); // Replace with actual userId retrieval logic
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");
  // storedFiles holds an array of file metadata objects retrieved from the backend.
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

  // Upload file with userId (as required by the backend)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatus("Please select a file to upload.");
      return;
    }
    const encryptedFile = encryptFile(selectedFile);
    const formData = new FormData();
    formData.append("file", encryptedFile);
    // Append userId so the backend can store the metadata for the correct user.
    formData.append("userId", userId);

    try {
      await axios.post("https://localhost:8443/api/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus("File uploaded successfully!");
      fetchFiles(); // Refresh the list after a successful upload.
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatus("File upload failed.");
    }
  };

  // Fetch stored files for the user.
  // This calls the GET endpoint /api/files/user/{userId} on your backend.
  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `https://localhost:8443/api/files/user/${userId}`
      );
      setStoredFiles(response.data);
    } catch (error) {
      // Log detailed error info
      if (error.response) {
        // The request was made and the server responded with a status code outside 2xx
        console.error("Error response:", error.response.data, error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
      }
      setStatus("Error fetching stored files.");
    }
  };

  // Fetch stored files when the component mounts.
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="files-container">
      {/* Menu Container */}
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
            {storedFiles.map((fileMeta) => (
              <li key={fileMeta.fileId}>
                {fileMeta.fileName}{" "}
                <a
                  href={fileMeta.supabasePath}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default EncryptedFiles;
