package com.cryptLink.CryptLinkBackend.controller;

import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.cryptLink.CryptLinkBackend.model.ChatMessage;
import com.cryptLink.CryptLinkBackend.model.FileMetadata;
import com.cryptLink.CryptLinkBackend.repository.FileMetadataRepository;
import com.cryptLink.CryptLinkBackend.service.SupabaseService;
import com.cryptLink.CryptLinkBackend.util.EncryptionResult;
import com.cryptLink.CryptLinkBackend.util.EncryptionUtil;

@Controller
public class ChatController {

    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @Autowired private SimpMessagingTemplate broker;
    @Autowired private SupabaseService       supabaseService;
    @Autowired private EncryptionUtil        encryptionUtil;
    @Autowired private FileMetadataRepository fileRepo;

    // In-memory buffer map: fileId → assembled bytes
    private ConcurrentMap<String, ByteArrayOutputStream> buffers = new ConcurrentHashMap<>();

    public ChatController(
        SimpMessagingTemplate broker,
        SupabaseService supabaseService,
        EncryptionUtil encryptionUtil,
        FileMetadataRepository fileRepo
    ) {
        this.broker = broker;
        this.supabaseService = supabaseService;
        this.encryptionUtil = encryptionUtil;
        this.fileRepo = fileRepo;
    }

    @MessageMapping("/message")
    public void handlePublic(@Payload ChatMessage msg) throws Exception {
        if ("FILE_CHUNK".equals(msg.getStatus())) {
            String fileId = msg.getFileId();
            buffers.putIfAbsent(fileId, new ByteArrayOutputStream());
            ByteArrayOutputStream out = buffers.get(fileId);
            out.write(Base64.getDecoder().decode(msg.getFileData()));

            // last chunk?
            if (msg.getChunkIndex().equals(msg.getChunkTotal() - 1)) {
                byte[] fileBytes = out.toByteArray();
                buffers.remove(fileId);

                // encrypt
                byte[] iv = encryptionUtil.generateIV();
                EncryptionResult enc = encryptionUtil.encrypt(fileBytes, iv);

                // upload to Supabase
                String encodedName = URLEncoder.encode(msg.getFileName(), StandardCharsets.UTF_8);
                String path = "chat_" + msg.getUserId() + "/" + encodedName;
                String publicUrl = supabaseService.uploadFile(path, enc.getEncryptedBytes());
                if (publicUrl == null) {
                    logger.error("Supabase upload failed for {}", msg.getFileName());
                    return;
                }

                // save metadata
                FileMetadata meta = new FileMetadata();
                meta.setOwnerId(msg.getUserId());
                meta.setFileName(msg.getFileName());
                meta.setSupabasePath(publicUrl);
                meta.setEncrypted(true);
                meta.setIv(Base64.getEncoder().encodeToString(iv));
                fileRepo.save(meta);

                // broadcast final URL as a single MESSAGE
                ChatMessage outMsg = new ChatMessage();
                outMsg.setSenderName(msg.getSenderName());
                outMsg.setUserId(msg.getUserId());
                outMsg.setReceiverName(null);
                outMsg.setFileName(msg.getFileName());
                outMsg.setFileData(publicUrl);
                outMsg.setStatus("MESSAGE");
                broker.convertAndSend("/chatroom/public", outMsg);
            }
        } else {
            // JOIN or plain MESSAGE
            broker.convertAndSend("/chatroom/public", msg);
        }
    }

    @MessageMapping("/private-message")
    public void handlePrivate(@Payload ChatMessage msg) throws Exception {
        if ("FILE_CHUNK".equals(msg.getStatus())) {
            String fileId = msg.getFileId();
            buffers.putIfAbsent(fileId, new ByteArrayOutputStream());
            ByteArrayOutputStream out = buffers.get(fileId);
            out.write(Base64.getDecoder().decode(msg.getFileData()));

            if (msg.getChunkIndex().equals(msg.getChunkTotal() - 1)) {
                byte[] fileBytes = out.toByteArray();
                buffers.remove(fileId);

                byte[] iv = encryptionUtil.generateIV();
                EncryptionResult enc = encryptionUtil.encrypt(fileBytes, iv);

                String encodedName = URLEncoder.encode(msg.getFileName(), StandardCharsets.UTF_8);
                String path = "chat_" + msg.getUserId() + "/" + encodedName;
                String publicUrl = supabaseService.uploadFile(path, enc.getEncryptedBytes());
                if (publicUrl == null) {
                    logger.error("Supabase upload failed for {}", msg.getFileName());
                    return;
                }

                FileMetadata meta = new FileMetadata();
                meta.setOwnerId(msg.getUserId());
                meta.setFileName(msg.getFileName());
                meta.setSupabasePath(publicUrl);
                meta.setEncrypted(true);
                meta.setIv(Base64.getEncoder().encodeToString(iv));
                fileRepo.save(meta);

                ChatMessage outMsg = new ChatMessage();
                outMsg.setSenderName(msg.getSenderName());
                outMsg.setUserId(msg.getUserId());
                outMsg.setReceiverName(msg.getReceiverName());
                outMsg.setFileName(msg.getFileName());
                outMsg.setFileData(publicUrl);
                outMsg.setStatus("MESSAGE");
                broker.convertAndSendToUser(msg.getReceiverName(), "/private", outMsg);
            }
        } else {
            broker.convertAndSendToUser(msg.getReceiverName(), "/private", msg);
        }
    }

    public ConcurrentMap<String, ByteArrayOutputStream> getBuffers() {
        return buffers;
    }

    public void setBuffers(ConcurrentMap<String, ByteArrayOutputStream> buffers) {
        this.buffers = buffers;
    }
}
