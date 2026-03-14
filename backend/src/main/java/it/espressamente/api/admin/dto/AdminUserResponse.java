package it.espressamente.api.admin.dto;

import it.espressamente.api.auth.entity.AdminUser;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminUserResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String role;
    private Long storeId;
    private String storeName;
    private Boolean isActive;
    private String createdAt;

    public static AdminUserResponse from(AdminUser user) {
        AdminUserResponseBuilder builder = AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);

        if (user.getStore() != null) {
            builder.storeId(user.getStore().getId())
                   .storeName(user.getStore().getName());
        }

        return builder.build();
    }
}
