package it.espressamente.api.cms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageRequest {

    @NotBlank(message = "Il titolo è obbligatorio")
    @Size(max = 200)
    private String title;

    private String slug;

    @NotBlank(message = "Il contenuto è obbligatorio")
    private String content;

    private String metaTitle;

    private String metaDescription;

    @Builder.Default
    private Boolean isPublished = false;

    @Builder.Default
    private Integer sortOrder = 0;
}
