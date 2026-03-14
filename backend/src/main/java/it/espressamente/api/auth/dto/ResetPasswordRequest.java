package it.espressamente.api.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "Token obbligatorio")
    private String token;

    @NotBlank(message = "Nuova password obbligatoria")
    @Size(min = 8, message = "La password deve avere almeno 8 caratteri")
    private String newPassword;
}
