package com.cryptLink.CryptLinkBackend.repository;

import com.cryptLink.CryptLinkBackend.model.FileMetadata;

import org.springframework.data.jpa.repository.JpaRepository;
public interface  FileMetadataRepository extends JpaRepository<FileMetadata, Integer> {
    
}
