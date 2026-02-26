package it.espressamente.api.dto.response;

import it.espressamente.api.model.enums.ProductType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String slug;
    private String shortDescription;
    private String description;
    private ProductType productType;
    private BigDecimal price;
    private String priceLabel;
    private CategoryResponse category;
    private BrandResponse brand;
    private List<String> images;
    private List<FeatureResponse> features;
    private Boolean isFeatured;
    private String metaTitle;
    private String metaDescription;
    private LocalDateTime createdAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class FeatureResponse {
        private String label;
        private String value;
    }
}
