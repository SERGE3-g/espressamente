package it.espressamente.api.customer.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String companyName;
    private String vatNumber;
    private String fiscalCode;
    private String clientType;
    private String address;
    private String city;
    private String province;
    private String cap;
    private String country;
    private String notes;
    private Boolean isActive;
    private long totalComodato;
    private long totalContatti;
    private long totalAssistenza;
    private long totalInteractions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
