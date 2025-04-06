package com.cryptLink.CryptLinkBackend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailParseException;
//import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    @Autowired
    private JavaMailSender mailSender;

    public void sendOTP(String email, String otp) {
       try {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom("cryptlink123@gmail.com");
        helper.setTo(email);
        helper.setSubject("Your OTP Code");
        helper.setText("Your OTP code is: " + otp, true); // true for HTML content

        mailSender.send(message);
        System.out.println("OTP email sent successfully!");

    } catch (MessagingException e) {
        throw new MailParseException("Error parsing email content", e);
    }
    }
}