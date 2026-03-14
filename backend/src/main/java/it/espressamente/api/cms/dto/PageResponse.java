package it.espressamente.api.cms.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PageResponse {
    private Long id;
    private String title;
    private String slug;
    private String content;
    private String metaTitle;
    private String metaDescription;
    private Boolean isPublished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
