package com.cryptLink.CryptLinkBackend.util;


import static org.junit.jupiter.api.Assertions.assertArrayEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Base64;

public class EncryptionUtilTest {

    private EncryptionUtil util;

    @BeforeEach
    void setUp() {
        util = new EncryptionUtil();
        // if your fixedKeyBase64 is injected via @Value, you can set it reflectively:
        TestUtils.setField(util, "fixedKeyBase64", "w7m+EY8Z4Shn8N2HXOGyM9L4IpWhE3MTZfnLgiJ/5RE=");
    }

    @Test
void encryptThenDecrypt_roundTrips() throws Exception {
    byte[] plaintext = "hello world".getBytes();
    byte[] iv        = util.generateIV();
    System.out.println("▶▶ Generated IV: " + Base64.getEncoder().encodeToString(iv));

    EncryptionResult enc = util.encrypt(plaintext, iv);
    System.out.println("▶▶ Encrypted bytes: " + enc.getEncryptedBytes().length + " bytes");

    // sanity check: IV round-trips
    assertArrayEquals(iv, enc.getIv());

    byte[] decrypted = util.decrypt(enc.getEncryptedBytes(), iv);
    System.out.println("▶▶ Decrypted text: " + new String(decrypted));

    assertArrayEquals(plaintext, decrypted, "round-trip should match");
}
}
