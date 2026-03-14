package it.espressamente.api.product.dto;

import it.espressamente.api.contact.enums.ContactType;
import it.espressamente.api.product.enums.ProductType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// ─── Prodotti ───

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductRequest {

    @Size(max = 50)
    private String sku;

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 200)
    private String name;

    @Size(max = 500)
    private String shortDescription;

    private String description;

    @NotNull(message = "Il tipo prodotto è obbligatorio")
    private ProductType productType;

    @DecimalMin(value = "0.0")
    private BigDecimal price;

    @Size(max = 50)
    private String priceLabel;

    private Long categoryId;
    private Long brandId;

    private List<String> images;
    private List<FeatureRequest> features;

    private Boolean isFeatured;
    private Boolean isActive;
    private Integer sortOrder;

    private String metaTitle;
    private String metaDescription;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class FeatureRequest {
        private String label;
        private String value;
    }
}
