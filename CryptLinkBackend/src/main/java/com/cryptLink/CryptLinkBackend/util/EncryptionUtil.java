package com.cryptLink.CryptLinkBackend.util;

import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EncryptionUtil {

    // Load the fixed key from the application.properties file.
    @Value("${encryption.fixedKey}")
    private String fixedKeyBase64;

    public SecretKey getFixedKey() {
        byte[] decodedKey = Base64.getDecoder().decode(fixedKeyBase64);
        return new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");
    }

    // Existing encryption and decryption methods, updated to use getFixedKey() for development:
    public EncryptionResult encrypt(byte[] data, byte[] iv) throws Exception {
        SecretKey key = getFixedKey();
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.ENCRYPT_MODE, key, spec);
        byte[] encryptedBytes = cipher.doFinal(data);
        return new EncryptionResult(encryptedBytes, iv);
    }

    public byte[] decrypt(byte[] encryptedData, byte[] iv) throws Exception {
        SecretKey key = getFixedKey();
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        GCMParameterSpec spec = new GCMParameterSpec(128, iv);
        cipher.init(Cipher.DECRYPT_MODE, key, spec);
        return cipher.doFinal(encryptedData);
    }

    // Method to generate a new IV, if needed.
    public byte[] generateIV() {
        byte[] iv = new byte[12]; // 12 bytes for GCM recommended
        SecureRandom secureRandom = new SecureRandom();
        secureRandom.nextBytes(iv);
        return iv;
    }
}
