package com.cryptLink.CryptLinkBackend.model;

public class ChatMessage {
    private String senderName;
    private String receiverName;
    private String message;
    private String fileName;  // Optional: file name if a file is attached
    private String fileData;  // Optional: base64-encoded file data
    private String status;    // e.g., "MESSAGE" or "JOIN"

    public ChatMessage() {
    }

    // Getters and Setters

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileData() {
        return fileData;
    }

    public void setFileData(String fileData) {
        this.fileData = fileData;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
