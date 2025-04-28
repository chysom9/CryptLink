package com.cryptLink.CryptLinkBackend;

import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

import java.util.HashMap;
import java.util.Map;

import com.cryptLink.CryptLinkBackend.service.OTPLogicService;
import com.cryptLink.CryptLinkBackend.controller.AuthController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

class AuthControllerTest {

    private AuthController authController;
    private OTPLogicService otpService;

    @BeforeEach
    void setUp() {
        otpService = mock(OTPLogicService.class);
        authController = new AuthController(otpService);
    }

    @Test
    void testSendOTP() {
        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");

        ResponseEntity<String> response = authController.sendOTP(request);

        verify(otpService).generateAndSendOTP("test@example.com");
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("OTP sent to test@example.com");
    }

    @Test
    void testVerifyOTP_Success() {
        when(otpService.validateOTP("test@example.com", "123456")).thenReturn(true);

        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("code", "123456");

        ResponseEntity<String> response = authController.verifyOTP(request);

        verify(otpService).validateOTP("test@example.com", "123456");
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isEqualTo("Authentication successful!");
    }

    @Test
    void testVerifyOTP_Failure() {
        when(otpService.validateOTP("test@example.com", "wrongcode")).thenReturn(false);

        Map<String, String> request = new HashMap<>();
        request.put("email", "test@example.com");
        request.put("code", "wrongcode");

        ResponseEntity<String> response = authController.verifyOTP(request);

        verify(otpService).validateOTP("test@example.com", "wrongcode");
        assertThat(response.getStatusCodeValue()).isEqualTo(401);
        assertThat(response.getBody()).isEqualTo("Invalid OTP");
    }
}
