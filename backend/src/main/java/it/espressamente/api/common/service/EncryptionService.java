package it.espressamente.api.common.service;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
@Slf4j
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_BITS  = 128;

    private final String keyBase64;
    private SecretKeySpec secretKey;
    private boolean enabled;

    public EncryptionService(@Value("${app.encryption.key:}") String keyBase64) {
        this.keyBase64 = keyBase64;
    }

    @PostConstruct
    public void init() {
        if (keyBase64 == null || keyBase64.isBlank()) {
            this.enabled = false;
            log.warn("DB encryption DISABLED — imposta app.encryption.key per abilitarla");
        } else {
            try {
                byte[] keyBytes = Base64.getDecoder().decode(keyBase64);
                if (keyBytes.length != 32) {
                    throw new IllegalArgumentException(
                        "La chiave di cifratura deve essere 32 byte (256 bit), trovati: " + keyBytes.length);
                }
                this.secretKey = new SecretKeySpec(keyBytes, "AES");
                this.enabled = true;
                log.info("DB encryption abilitata (AES-256-GCM)");
            } catch (Exception e) {
                throw new IllegalStateException("Impossibile inizializzare la chiave di cifratura", e);
            }
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    public String encrypt(String plaintext) {
        if (!enabled || plaintext == null) return plaintext;
        try {
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(TAG_BITS, iv));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(iv) + ":" + Base64.getEncoder().encodeToString(ciphertext);
        } catch (Exception e) {
            throw new RuntimeException("Cifratura fallita", e);
        }
    }

    public String decrypt(String ciphertext) {
        if (!enabled || ciphertext == null) return ciphertext;
        try {
            int sep = ciphertext.indexOf(':');
            if (sep < 0) return ciphertext; // dati legacy non cifrati
            byte[] iv         = Base64.getDecoder().decode(ciphertext.substring(0, sep));
            byte[] encrypted  = Base64.getDecoder().decode(ciphertext.substring(sep + 1));
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(TAG_BITS, iv));
            return new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.warn("Decifratura fallita, restituisco il valore raw: {}", e.getMessage());
            return ciphertext;
        }
    }
}
