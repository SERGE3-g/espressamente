package it.espressamente.api.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String metaTitle;
    private String metaDescription;
}
