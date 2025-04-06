package com.cryptLink.CryptLinkBackend.repository;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cryptLink.CryptLinkBackend.model.OTP;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByEmail(String email);
    void deleteByOtp(String otp);
    Optional<OTP> findByOtp(String otp);
    void deleteByExpiryDateBefore(LocalDateTime expiryDate);
}