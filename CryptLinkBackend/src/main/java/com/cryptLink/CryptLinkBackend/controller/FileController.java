package com.cryptLink.CryptLinkBackend.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64; // Adjust the package path if necessary
import java.util.List;

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
import org.springframework.web.server.ResponseStatusException;

import com.cryptLink.CryptLinkBackend.model.FileMetadata;
import com.cryptLink.CryptLinkBackend.repository.FileMetadataRepository;
import com.cryptLink.CryptLinkBackend.service.SupabaseService;
import com.cryptLink.CryptLinkBackend.util.EncryptionResult;
import com.cryptLink.CryptLinkBackend.util.EncryptionUtil;

@CrossOrigin(origins = {"http://localhost:3000", "https://localhost:3000"})
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
    public ResponseEntity<String> uploadFile(
            @RequestParam("userId") Integer userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value="forChat", required=false, defaultValue="false") Boolean forChat) {
        try {
            logger.debug("Received upload request for user ID: {}, forChat={}", userId, forChat);
            String originalName = file.getOriginalFilename();
            logger.debug("File name: {}", originalName);
            
            // encode filename safely
            String encodedName = URLEncoder.encode(originalName, StandardCharsets.UTF_8);
            String supabasePath = "user_" + userId + "/" + encodedName;
            
            byte[] uploadBytes;
            String ivBase64 = null;
            
            if (!forChat) {
                // --- ENCRYPTION PATH ---
                byte[] iv = encryptionUtil.generateIV();
                EncryptionResult enc = encryptionUtil.encrypt(file.getBytes(), iv);
                uploadBytes = enc.getEncryptedBytes();
                ivBase64 = Base64.getEncoder().encodeToString(iv);
            } else {
                // --- CHAT PATH (no encryption) ---
                uploadBytes = file.getBytes();
            }
            
            // upload to Supabase
            String publicUrl = supabaseService.uploadFile(supabasePath, uploadBytes);
            if (publicUrl == null) {
                return ResponseEntity.badRequest().body("Upload failed");
            }
            
            // Persist metadata
            FileMetadata meta = new FileMetadata();
            meta.setOwnerId(userId);
            meta.setFileName(originalName);
            meta.setSupabasePath(publicUrl);
            meta.setCompressed(false);
            meta.setEncrypted(!forChat);
            meta.setIv(ivBase64);                // null if forChat=true
            fileRepo.save(meta);
            
            return ResponseEntity.ok(publicUrl);
            
        } catch (Exception e) {
            logger.error("File upload failed", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
    

    @GetMapping("/{fileId}")
public ResponseEntity<?> getFile(@PathVariable Integer fileId) {
    FileMetadata meta = fileRepo.findById(fileId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found"));

    byte[] fileBytes = supabaseService.downloadFile(meta.getSupabasePath());
    if (fileBytes == null) {
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Error retrieving file");
    }

    byte[] outputBytes;
    if (meta.isEncrypted()) {
        // decrypt path
        byte[] iv = Base64.getDecoder().decode(meta.getIv());
        try {
            outputBytes = encryptionUtil.decrypt(fileBytes, iv);
        } catch (Exception e) {
            logger.error("Decryption failed", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error decrypting file");
        }
    } else {
        // chat‑only path
        outputBytes = fileBytes;
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
    headers.setContentLength(outputBytes.length);
    headers.set(
        "Content-Disposition",
        "attachment; filename=\"" + meta.getFileName() + "\""
    );

    return new ResponseEntity<>(outputBytes, headers, HttpStatus.OK);
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

