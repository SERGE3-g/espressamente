package it.espressamente.api.common.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import it.espressamente.api.product.entity.Product;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.List;

/**
 * JPA AttributeConverters for JSONB columns (non più usati — sostituiti da @JdbcTypeCode(SqlTypes.JSON)).
 * Mantenuti per retrocompatibilità.
 */
public class JsonbConverter {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Converter
    public static class StringListConverter implements AttributeConverter<List<String>, String> {

        @Override
        public String convertToDatabaseColumn(List<String> attribute) {
            try {
                return attribute != null ? MAPPER.writeValueAsString(attribute) : "[]";
            } catch (Exception e) {
                return "[]";
            }
        }

        @Override
        public List<String> convertToEntityAttribute(String dbData) {
            try {
                return dbData != null ? MAPPER.readValue(dbData, new TypeReference<>() {}) : new ArrayList<>();
            } catch (Exception e) {
                return new ArrayList<>();
            }
        }
    }

    @Converter
    public static class ProductFeatureListConverter implements AttributeConverter<List<Product.ProductFeature>, String> {

        @Override
        public String convertToDatabaseColumn(List<Product.ProductFeature> attribute) {
            try {
                return attribute != null ? MAPPER.writeValueAsString(attribute) : "[]";
            } catch (Exception e) {
                return "[]";
            }
        }

        @Override
        public List<Product.ProductFeature> convertToEntityAttribute(String dbData) {
            try {
                return dbData != null ? MAPPER.readValue(dbData, new TypeReference<>() {}) : new ArrayList<>();
            } catch (Exception e) {
                return new ArrayList<>();
            }
        }
    }
}
