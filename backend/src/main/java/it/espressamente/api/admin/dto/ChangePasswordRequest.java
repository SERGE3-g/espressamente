package it.espressamente.api.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChangePasswordRequest {

    @NotBlank(message = "La password attuale è obbligatoria")
    private String oldPassword;

    @NotBlank(message = "La nuova password è obbligatoria")
    @Size(min = 6, message = "La nuova password deve avere almeno 6 caratteri")
    private String newPassword;
}
