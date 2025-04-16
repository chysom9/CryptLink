package com.cryptLink.CryptLinkBackend.controller;


import java.io.IOException;
import java.util.Base64;
import java.util.List; // Adjust the package path if necessary
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cryptLink.CryptLinkBackend.model.FileMetadata;
import com.cryptLink.CryptLinkBackend.repository.FileMetadataRepository;
import com.cryptLink.CryptLinkBackend.service.SupabaseService;
import com.cryptLink.CryptLinkBackend.util.EncryptionResult;
import com.cryptLink.CryptLinkBackend.util.EncryptionUtil;


@CrossOrigin(origins = {"http://localhost:3000", "https://localhost:3000"}) // Allow frontend requests
@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Autowired
    private SupabaseService supabaseService;

    @Autowired
    private FileMetadataRepository fileRepo;

    @Autowired
    private EncryptionUtil encryptionUtil;


    @PostMapping("/upload")
public ResponseEntity<String> uploadFile(@RequestParam("userId") Integer userId,
                                           @RequestParam("file") MultipartFile file) {
    try {
        logger.debug("Received upload request for user ID: {}", userId);
        logger.debug("File name: {}", file.getOriginalFilename());
        logger.debug("File size: {} bytes", file.getSize());
        
        String fileName = file.getOriginalFilename();
        String supabasePath = "user_" + userId + "/" + fileName;
        
        // Generate a new IV for this encryption session.
        byte[] iv = encryptionUtil.generateIV();
        
        // Encrypt the file bytes with the fixed key and generated IV.
        EncryptionResult encResult = encryptionUtil.encrypt(file.getBytes(), iv);
        byte[] encryptedBytes = encResult.getEncryptedBytes();
        
        // Upload the encrypted bytes to Supabase
        String publicUrl = supabaseService.uploadFile(supabasePath, encryptedBytes);
        if (publicUrl == null) {
            return ResponseEntity.badRequest().body("Upload failed");
        }
        
        // Base64-encode the IV for storage
        String ivBase64 = Base64.getEncoder().encodeToString(iv);
        
        // Save file metadata including public URL and IV.
        FileMetadata meta = new FileMetadata();
        meta.setOwnerId(userId);
        meta.setFileName(fileName);
        meta.setSupabasePath(publicUrl);
        meta.setCompressed(false);
        meta.setEncrypted(true); // (Use true if you want to mark it as encrypted.)
        meta.setIv(ivBase64);
        
        fileRepo.save(meta);
        return ResponseEntity.ok("File uploaded successfully!");
    } catch (IllegalStateException e) {
        logger.error("File upload failed: {}", e.getMessage());
        return ResponseEntity.badRequest().body("Error: " + e.getMessage());
    } catch (IOException e) {
        logger.error("File upload failed: {}", e.getMessage());
        return ResponseEntity.badRequest().body("Error: " + e.getMessage());
    } catch (Exception e) {
        logger.error("An error occurred during file upload", e);
        e.printStackTrace();
        return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
    }
}

@GetMapping("/{fileId}")
public ResponseEntity<?> getFile(@PathVariable("fileId") Integer fileId) {
    // Retrieve metadata from the database
    Optional<FileMetadata> metadataOpt = fileRepo.findById(fileId);
    if (!metadataOpt.isPresent()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
    }
    FileMetadata meta = metadataOpt.get();

    // Download file using the public URL stored in metadata.
    String publicUrl = meta.getSupabasePath();  
    byte[] encryptedBytes = supabaseService.downloadFile(publicUrl);
    if (encryptedBytes == null) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving file");
    }

    try {
        // Decode the IV from Base64
        byte[] iv = Base64.getDecoder().decode(meta.getIv());
        
       
        
        // Decrypt the file using the fixed key and IV
        byte[] decryptedBytes = encryptionUtil.decrypt(encryptedBytes, iv);
        
        // Prepare headers for file download
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentLength(decryptedBytes.length);
        headers.set("Content-Disposition", "attachment; filename=\"" + meta.getFileName() + "\"");
        
        // Return the decrypted file bytes in the response.
        return new ResponseEntity<>(decryptedBytes, headers, HttpStatus.OK);
    } catch (Exception e) {
        logger.error("Error during decryption", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error decrypting file");
    }
}

        

    @GetMapping("/user/{userId}")
public ResponseEntity<List<FileMetadata>> getFilesByUser(@PathVariable("userId") Integer userId) {
    logger.debug("Fetching files for user with ID: {}", userId);
    List<FileMetadata> files = fileRepo.findByOwnerId(userId);
    
    if (files.isEmpty()) {
        logger.debug("No files found for user with ID: {}", userId);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(files);
    }
    
    logger.debug("Found {} files for user with ID: {}", files.size(), userId);
    return ResponseEntity.ok(files);
}


}