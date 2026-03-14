package it.espressamente.api.customer.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerInteractionResponse {
    private Long id;
    private String type;
    private String subject;
    private String description;
    private LocalDateTime date;
    private String adminUsername;
    private String adminFullName;
    private LocalDateTime createdAt;
}
