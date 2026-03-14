package it.espressamente.api.auth.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String accessToken;
    private String tokenType;
    private Long expiresIn;   // secondi
    private String username;
    private String fullName;
    private String email;
    private String role;
    private Long storeId;
    private String storeName;
}
