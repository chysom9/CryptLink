package com.cryptLink.CryptLinkBackend.util;

public class EncryptionResult {
    private final byte[] encryptedBytes;
    private final byte[] iv;

    public EncryptionResult(byte[] encryptedBytes, byte[] iv) {
        this.encryptedBytes = encryptedBytes;
        this.iv = iv;
    }

    public byte[] getEncryptedBytes() {
        return encryptedBytes;
    }

    public byte[] getIv() {
        return iv;
    }
}
