package com.cryptLink.CryptLinkBackend.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "files")
public class FileMetadata {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Integer fileId; //primary key
    private String fileName; 
    private Integer ownerId; // foreign key
    private String supaBasePath; //file path in supabase
    final private LocalDateTime uploadTime;
    private boolean compressed;
    private boolean encrypted;

    public FileMetadata() {
        this.uploadTime = LocalDateTime.now(); // Optional: Set upload time here if you want
    }

    
    public FileMetadata(String fileName, Integer ownerId, String supaBasePath, boolean compressed, boolean encrypted) {
        this.uploadTime = LocalDateTime.now();
        this.fileName = fileName;
        this.ownerId = ownerId;
        this.supaBasePath = supaBasePath;
        this.compressed = compressed;
        this.encrypted = encrypted;
    }
    
    public Integer getFileId() {
        return fileId;
    }

    public void setFileId(Integer fileId) {
        this.fileId = fileId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Integer getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Integer ownerId) {
        this.ownerId = ownerId;
    }

    public String getSupabasePath() {
        return supaBasePath;
    }

    public void setSupabasePath(String supaBasePath) {
        this.supaBasePath = supaBasePath;
    }

    public LocalDateTime getUploadTime() {
        return uploadTime;
    }   

    public boolean isCompressed() {
        return compressed;
    }

    public void setCompressed(boolean compressed) {
        this.compressed = compressed;
    }

    public boolean isEncrypted() {
        return encrypted;
    }

    public void setEncrypted(boolean encrypted) {
        this.encrypted = encrypted;
    }



}
