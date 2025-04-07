package com.cryptLink.CryptLinkBackend.controller;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
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

@CrossOrigin(origins = {"http://localhost:3000", "https://localhost:3000"})
@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Autowired
    private SupabaseService supabaseService;

    @Autowired
    private FileMetadataRepository fileRepo;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("userId") Integer userId,
                                               @RequestParam("file") MultipartFile file,
                                               @RequestParam(value="forChat", required=false, defaultValue="false") Boolean forChat) {
        try {
            logger.debug("Received upload request for user ID: {}", userId);
            String originalFileName = file.getOriginalFilename();
            logger.debug("Original file name: {}", originalFileName);
            logger.debug("File size: {} bytes", file.getSize());

            // Encode file name to handle spaces and special characters.
            String encodedFileName = URLEncoder.encode(originalFileName, StandardCharsets.UTF_8.toString());
            String supabasePath = "user_" + userId + "/" + encodedFileName;

            String publicUrl = supabaseService.uploadFile(supabasePath, file.getBytes());
            if (publicUrl == null) {
                logger.error("supabaseService.uploadFile returned null. Using dummy URL for testing.");
                publicUrl = "https://example.com/dummy.txt";
            }

            // Only save file metadata if this is not a chat upload.
            if (!forChat) {
                FileMetadata meta = new FileMetadata();
                meta.setOwnerId(userId);
                meta.setFileName(originalFileName);
                meta.setSupabasePath(publicUrl);
                meta.setCompressed(false);
                meta.setEncrypted(false);
                fileRepo.save(meta);
            }
            // Return the public URL so that the chat room can display a clickable link.
            return ResponseEntity.ok(publicUrl);
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
        Optional<FileMetadata> metadataOpt = fileRepo.findById(fileId);
        if (!metadataOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
        }
        FileMetadata meta = metadataOpt.get();

        String publicUrl = meta.getSupabasePath();
        byte[] fileBytes = supabaseService.downloadFile(publicUrl);
        if (fileBytes == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving file");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentLength(fileBytes.length);
        headers.set("Content-Disposition", "attachment; filename=\"" + meta.getFileName() + "\"");

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
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
