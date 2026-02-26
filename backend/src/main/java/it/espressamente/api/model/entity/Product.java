package it.espressamente.api.model.entity;

import it.espressamente.api.config.JsonbConverter;
import it.espressamente.api.model.enums.ProductType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(name = "short_description", length = 500)
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 20)
    private ProductType productType;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "price_label", length = 50)
    private String priceLabel; // es. "A partire da", "Su richiesta"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Convert(converter = JsonbConverter.StringListConverter.class)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<String> images = new ArrayList<>();

    @Convert(converter = JsonbConverter.ProductFeatureListConverter.class)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<ProductFeature> features = new ArrayList<>();

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    // SEO
    @Column(name = "meta_title", length = 160)
    private String metaTitle;

    @Column(name = "meta_description", length = 320)
    private String metaDescription;

    /**
     * Rappresenta una caratteristica del prodotto (es. "Origine: Brasile")
     */
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class ProductFeature {
        private String label;
        private String value;
    }
}
