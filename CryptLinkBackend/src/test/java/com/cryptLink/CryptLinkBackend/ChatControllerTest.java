package com.cryptLink.CryptLinkBackend;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

import java.util.Base64;

import com.cryptLink.CryptLinkBackend.controller.ChatController;
import com.cryptLink.CryptLinkBackend.model.ChatMessage;
import com.cryptLink.CryptLinkBackend.model.FileMetadata;
import com.cryptLink.CryptLinkBackend.repository.FileMetadataRepository;
import com.cryptLink.CryptLinkBackend.service.SupabaseService;
import com.cryptLink.CryptLinkBackend.util.EncryptionResult;
import com.cryptLink.CryptLinkBackend.util.EncryptionUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.messaging.simp.SimpMessagingTemplate;

class ChatControllerTest {

    @Mock
    private SimpMessagingTemplate broker;

    @Mock
    private SupabaseService supabaseService;

    @Mock
    private EncryptionUtil encryptionUtil;

    @Mock
    private FileMetadataRepository fileRepo;

    @InjectMocks
    private ChatController chatController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testHandlePublic_FileChunk_LastChunk() throws Exception {
        ChatMessage msg = new ChatMessage();
        msg.setStatus("FILE_CHUNK");
        msg.setFileId("file123");
        msg.setUserId(1);
        msg.setSenderName("user1");
        msg.setFileName("testfile.txt");
        msg.setFileData(Base64.getEncoder().encodeToString("test data".getBytes()));
        msg.setChunkIndex(0);
        msg.setChunkTotal(1);

        byte[] encryptedData = "encrypted".getBytes();
        when(encryptionUtil.generateIV()).thenReturn(new byte[16]);
        when(encryptionUtil.encrypt(any(), any())).thenReturn(new EncryptionResult(encryptedData, new byte[16]));
        when(supabaseService.uploadFile(any(), eq(encryptedData))).thenReturn("https://fake.url/testfile.txt");

        chatController.handlePublic(msg);

        verify(broker).convertAndSend(eq("/chatroom/public"), any(ChatMessage.class));
        verify(fileRepo).save(any(FileMetadata.class));
    }

    @Test
    void testHandlePublic_RegularMessage() throws Exception {
        ChatMessage msg = new ChatMessage();
        msg.setStatus("MESSAGE");
        msg.setSenderName("user1");
        msg.setUserId(1);

        chatController.handlePublic(msg);

        verify(broker).convertAndSend("/chatroom/public", msg);
    }

    @Test
    void testHandlePrivate_RegularMessage() throws Exception {
        ChatMessage msg = new ChatMessage();
        msg.setStatus("MESSAGE");
        msg.setSenderName("user1");
        msg.setUserId(1);
        msg.setReceiverName("user2");

        chatController.handlePrivate(msg);

        verify(broker).convertAndSendToUser(eq("user2"), eq("/private"), eq(msg));
    }
}
