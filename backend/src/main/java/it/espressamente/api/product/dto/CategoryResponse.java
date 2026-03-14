package it.espressamente.api.product.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String image;
    private Long parentId;
    private Integer sortOrder;
}
