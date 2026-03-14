package it.espressamente.api.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminUserRequest {

    @NotBlank(message = "Username obbligatorio")
    @Size(min = 3, max = 50)
    private String username;

    @Size(min = 6, message = "La password deve avere almeno 6 caratteri")
    private String password; // nullable on update

    @NotBlank(message = "Nome completo obbligatorio")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "Email obbligatoria")
    @Email
    private String email;

    @NotNull(message = "Ruolo obbligatorio")
    private String role; // SUPER_ADMIN, STORE_MANAGER, EMPLOYEE

    private Long storeId; // nullable per SUPER_ADMIN
}
