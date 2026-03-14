package it.espressamente.api.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 100)
    private String name;

    private String slug;

    private String description;

    @Builder.Default
    private Integer sortOrder = 0;
}
