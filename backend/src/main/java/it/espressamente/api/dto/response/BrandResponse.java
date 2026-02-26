package it.espressamente.api.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BrandResponse {
    private Long id;
    private String name;
    private String slug;
    private String logo;
    private String description;
    private String website;
}
