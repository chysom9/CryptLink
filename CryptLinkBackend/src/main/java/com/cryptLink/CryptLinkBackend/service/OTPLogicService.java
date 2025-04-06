package com.cryptLink.CryptLinkBackend.service;

import java.time.LocalDateTime;
import java.util.Random;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.cryptLink.CryptLinkBackend.model.OTP;
import com.cryptLink.CryptLinkBackend.repository.OTPRepository;

import jakarta.transaction.Transactional;

@Service
public class OTPLogicService {
    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    // Generate and send OTP
    public void generateAndSendOTP(String email) {
        // Create a random 6-digit OTP
        String otp = String.valueOf(new Random().nextInt(900000) + 100000);
    
        // Set creation and expiration times
        LocalDateTime createdTime = LocalDateTime.now();
        LocalDateTime expirationTime = createdTime.plusMinutes(5);
    
        // Save OTP to the database
        OTP otpEntity = new OTP();
        otpEntity.setEmail(email);
        otpEntity.setOtp(otp);
        otpEntity.setCreatedTime(createdTime);  // Save timestamp
        otpEntity.setExpiryDate(expirationTime);
    
        otpRepository.save(otpEntity);
    
        // Send OTP via email
        emailService.sendOTP(email, otp);
    }
    // Validate OTP
    @Transactional
    public boolean validateOTP(String email, String otp) {
        Optional<OTP> otpOptional = otpRepository.findByOtp(otp);
    
        if (otpOptional.isPresent()) {
            OTP otpEntity = otpOptional.get();
            LocalDateTime sentTime = otpEntity.getCreatedTime(); 
            LocalDateTime now = LocalDateTime.now();
            
            if (otpEntity.getOtp().equals(otp) &&
            sentTime.isBefore(now) &&  // Check if OTP is created before the current time
            otpEntity.getExpiryDate().isAfter(now)
            && otpEntity.getEmail().equals(email)) {  // Check if OTP is not expired

            // OTP is valid, delete it
                System.out.println("OTP is valid and not expired.");
                otpRepository.deleteByOtp(otp);
                return true;
            }
        }
        return false;
    }
    @Transactional
    @Scheduled(fixedRate = 300000) // Runs every 1 minute
    public void cleanExpiredOtps() {
        System.out.println("Cleaning expired OTPs...");
        otpRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        System.out.println("Expired OTPs deleted.");
    }
    
}
