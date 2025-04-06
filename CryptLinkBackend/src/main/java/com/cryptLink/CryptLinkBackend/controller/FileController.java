package com.cryptLink.CryptLinkBackend.controller;


import java.io.IOException;
import java.util.List;
import java.util.Optional; // Adjust the package path if necessary

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger logger = LoggerFactory.getLogger(FileController.class);

    @Autowired
    private SupabaseService supabaseService;

    @Autowired
    private FileMetadataRepository fileRepo;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("userId") Integer userId, @RequestParam("file") MultipartFile file
    ) {
        try {
            logger.debug("Received upload request for user ID: {}", userId);
            logger.debug("File name: {}", file.getOriginalFilename());
            logger.debug("File size: {} bytes", file.getSize());

            String fileName = file.getOriginalFilename();
            String supabasePath = "user_" + userId + "/" + fileName;

            String publicUrl = supabaseService.uploadFile(supabasePath, file.getBytes());
            if (publicUrl == null) {
                return ResponseEntity.badRequest().body("Upload failed");
            }

            // Save metadata, including publicUrl (instead of supabasePath)
            FileMetadata meta = new FileMetadata();
            meta.setOwnerId(userId);
            meta.setFileName(fileName);
            meta.setSupabasePath(publicUrl); // store the public URL
            meta.setCompressed(false);
            meta.setEncrypted(false);

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

        // (Optional) Validate that the currently authenticated user is allowed to access this file.
        // For example:
        // String username = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        // if (!meta.getOwnerId().equals(...)) { return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied"); }

        // Download file using the public URL stored in metadata.
        String publicUrl = meta.getSupabasePath(); // We stored the public URL here during upload.
        byte[] fileBytes = supabaseService.downloadFile(publicUrl);
        if (fileBytes == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error retrieving file");
        }

        // Prepare headers for file download (adjust the content type if necessary)
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentLength(fileBytes.length);
        headers.set("Content-Disposition", "attachment; filename=\"" + meta.getFileName() + "\"");

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
public ResponseEntity<List<FileMetadata>> getFilesByUser(@PathVariable("userId") Integer userId) {
    List<FileMetadata> files = fileRepo.findByOwnerId(userId);
    if (files.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(files);
    }
    return ResponseEntity.ok(files);
}

}