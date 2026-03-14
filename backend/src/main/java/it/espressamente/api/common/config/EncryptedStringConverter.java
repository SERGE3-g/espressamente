package it.espressamente.api.common.config;

import it.espressamente.api.common.service.EncryptionService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * JPA converter che cifra/decifra automaticamente i campi String sensibili nel DB.
 * Usa AES-256-GCM tramite {@link EncryptionService}.
 *
 * Quando la chiave non è configurata (dev), i dati vengono salvati in chiaro.
 */
@Converter
@Component
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    // Static holder per garantire che l'istanza creata da Hibernate abbia il service disponibile
    private static EncryptionService SERVICE;

    @Autowired
    public EncryptedStringConverter(EncryptionService service) {
        SERVICE = service;
    }

    /** No-arg constructor richiesto da Hibernate */
    public EncryptedStringConverter() {}

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (SERVICE == null || attribute == null) return attribute;
        return SERVICE.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (SERVICE == null || dbData == null) return dbData;
        return SERVICE.decrypt(dbData);
    }
}
