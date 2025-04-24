package com.cryptLink.CryptLinkBackend.model;

public class ChatMessage {
    private String  senderName;
    private Integer userId;
    private String  receiverName;
    private String  message;
    private String  fileName;    // if sending a file
    private String  fileData;    // either the public URL or a Base64 chunk
    private String  fileId;      // chunk grouping ID
    private Integer chunkIndex;  // current chunk number
    private Integer chunkTotal;  // total chunks for this file
    private String  status;      // "JOIN", "MESSAGE", or "FILE_CHUNK"

    public ChatMessage() {}

    // getters & setters for all fields...

    public String getSenderName()            { return senderName; }
    public void setSenderName(String s)      { this.senderName = s; }

    public Integer getUserId()               { return userId; }
    public void setUserId(Integer id)        { this.userId = id; }

    public String getReceiverName()          { return receiverName; }
    public void setReceiverName(String r)    { this.receiverName = r; }

    public String getMessage()               { return message; }
    public void setMessage(String m)         { this.message = m; }

    public String getFileName()              { return fileName; }
    public void setFileName(String f)        { this.fileName = f; }

    public String getFileData()              { return fileData; }
    public void setFileData(String d)        { this.fileData = d; }

    public String getFileId()                { return fileId; }
    public void setFileId(String id)         { this.fileId = id; }

    public Integer getChunkIndex()           { return chunkIndex; }
    public void setChunkIndex(Integer idx)   { this.chunkIndex = idx; }

    public Integer getChunkTotal()           { return chunkTotal; }
    public void setChunkTotal(Integer tot)   { this.chunkTotal = tot; }

    public String getStatus()                { return status; }
    public void setStatus(String s)          { this.status = s; }
}
