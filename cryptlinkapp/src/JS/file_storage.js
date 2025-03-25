import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/file_storage.css";
import axios from "axios";

function EncryptedFiles() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");
  const [storedFiles, setStoredFiles] = useState([]);

  // Simulated file encryption (for demonstration only)
  const encryptFile = (file) => {
    // In a real-world scenario, use an encryption library to encrypt the file.
    return file;
  };

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
      // Simulated API call for file upload
      await axios.post("https://localhost:8443/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setStatus("File uploaded successfully!");
      // Update stored files list (for demo, we simply store the file name)
      setStoredFiles([...storedFiles, selectedFile.name]);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      setStatus("File upload failed.");
    }
  };

  return (
    <div className="files-container">
      <Link to="/home" className="home-button-top">Home</Link>
      <h2>Secure Encrypted File Storage</h2>
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
