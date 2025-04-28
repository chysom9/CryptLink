package com.cryptLink.CryptLinkBackend.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cryptLink.CryptLinkBackend.service.OTPLogicService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "https://localhost:3000"}) // Allow frontend requests
public class AuthController {
    @Autowired
    private OTPLogicService otpService;
    
    public AuthController(OTPLogicService otpService) {
        this.otpService = otpService;
    }
    
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOTP(@RequestBody Map<String,String> request) {
        String email = request.get("email");
        otpService.generateAndSendOTP(email);
        return ResponseEntity.ok("OTP sent to " + email);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOTP(@RequestBody Map<String,String> request) {
        String email = request.get("email");
        String otp = request.get("code");
        boolean isValid = otpService.validateOTP(email, otp);
        if (isValid) {
            return ResponseEntity.ok("Authentication successful!");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid OTP");
        }
    }
}