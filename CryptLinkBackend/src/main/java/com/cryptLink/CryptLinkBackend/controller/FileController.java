package com.cryptLink.CryptLinkBackend.controller;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Base64; 
import java.util.Arrays;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;

import com.cryptLink.CryptLinkBackend.model.FileMetadata;
import com.cryptLink.CryptLinkBackend.repository.FileMetadataRepository;
import com.cryptLink.CryptLinkBackend.service.SupabaseService;
import com.cryptLink.CryptLinkBackend.util.EncryptionResult;
import com.cryptLink.CryptLinkBackend.util.EncryptionUtil;

import lombok.val;

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

    @Value("${supabase.bucket}")
    private String bucketName;

    @Value("${supabase.url}")
    private String supabaseUrl;


    @PostMapping("/upload")
public ResponseEntity<String> uploadFile(
        @RequestParam("userId") Integer userId,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "forChat", required = false, defaultValue = "false") Boolean forChat) {
    try {
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isEmpty()) {
            return ResponseEntity.badRequest().body("File name is empty");
        }
        if (file.getSize() > 10 * 1024 * 1024) { // 10 MB limit
            return ResponseEntity.badRequest().body("File size exceeds limit of 10 MB");
        }

        logger.debug("Received upload request for userId={}, fileName={}, forChat={}", userId, originalName, forChat);

        
        String supabasePath = "user_" + userId + "/" + originalName;


        byte[] plainBytes = file.getBytes();
        byte[] uploadBytes;
        String ivBase64 = null;

        if (!forChat) {
            byte[] iv = encryptionUtil.generateIV();
            EncryptionResult enc = encryptionUtil.encrypt(plainBytes, iv);
            uploadBytes = enc.getEncryptedBytes();
            ivBase64 = Base64.getEncoder().encodeToString(iv);
            logger.debug("Encrypted file bytes length: {}", uploadBytes.length);
            logger.debug("IV (base64): {}", ivBase64);
        } else {
            uploadBytes = plainBytes;
            logger.debug("Plain file bytes length: {}", uploadBytes.length);
        }

        //  FIX: Just pass "path" not full URL
        String publicUrl = supabaseService.uploadFile(supabasePath, uploadBytes);
        if (publicUrl == null) {
            logger.error("Supabase upload failed.");
            return ResponseEntity.badRequest().body("Upload failed");
        }

        logger.debug("Public URL from Supabase: {}", publicUrl);

        FileMetadata meta = new FileMetadata();
        meta.setOwnerId(userId);
        meta.setFileName(originalName);
        meta.setSupabasePath(publicUrl);
        meta.setCompressed(false);
        meta.setEncrypted(!forChat);
        meta.setIv(ivBase64);
        fileRepo.save(meta);

        logger.debug("File metadata saved to database");

        return ResponseEntity.ok(publicUrl);

    } catch (Exception e) {
        logger.error("File upload failed", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
    }
}

    
    

    @GetMapping("/{fileId}")
public ResponseEntity<StreamingResponseBody> getFile(@PathVariable Integer fileId) {
    logger.debug("Received download request for file ID: {}", fileId);

    FileMetadata meta = fileRepo.findById(fileId)
        .orElseThrow(() -> {
            logger.warn("File with ID {} not found in database", fileId);
            return new ResponseStatusException(HttpStatus.NOT_FOUND, "File metadata not found");
        });

    logger.debug("Found metadata: fileName={}, encrypted={}", meta.getFileName(), meta.isEncrypted());

    byte[] fileBytes = supabaseService.downloadFile(meta.getSupabasePath());
    if (fileBytes == null) {
        logger.error("Failed to download file from Supabase, path={}", meta.getSupabasePath());
        throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to download file from storage");
    }

    logger.debug("Downloaded {} bytes from storage", fileBytes.length);

    StreamingResponseBody stream = outputStream -> {
        try (InputStream in = new ByteArrayInputStream(fileBytes)) {
            InputStream processedStream = in;

            if (meta.isEncrypted()) {
                if (meta.getIv() == null || meta.getIv().isEmpty()) {
                    logger.error("Missing IV for encrypted file ID {}", fileId);
                    throw new IllegalStateException("Missing IV for decryption");
                }

                byte[] iv = Base64.getDecoder().decode(meta.getIv());
                logger.debug("Decoded IV for file ID {}: {}", fileId, Base64.getEncoder().encodeToString(iv));

                byte[] decrypted = encryptionUtil.decrypt(fileBytes, iv);
                processedStream = new ByteArrayInputStream(decrypted);

                logger.debug("Successfully decrypted file ID {}", fileId);
            }

            byte[] buffer = new byte[8192]; // 8 KB chunks
            int bytesRead;
            while ((bytesRead = processedStream.read(buffer)) != -1) {
                outputStream.write(buffer, 0, bytesRead);
            }
            outputStream.flush();
        } catch (Exception e) {
            logger.error("Error streaming file ID {}: {}", fileId, e.getMessage(), e);
            throw new RuntimeException("Error streaming file", e);
        }
    };

    // Detect content type smartly
    String contentType = detectContentType(meta.getFileName());

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.parseMediaType(contentType));
    headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + meta.getFileName() + "\"");

    return new ResponseEntity<>(stream, headers, HttpStatus.OK);
}

// helper function to guess MIME type
private String detectContentType(String fileName) {
    if (fileName == null) {
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }
    try {
        Path path = Paths.get(fileName);
        String contentType = Files.probeContentType(path);
        if (contentType != null) {
            return contentType;
        }
    } catch (Exception e) {
        logger.warn("Could not determine content type for file: {}", fileName, e);
    }
    return MediaType.APPLICATION_OCTET_STREAM_VALUE; // fallback
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

