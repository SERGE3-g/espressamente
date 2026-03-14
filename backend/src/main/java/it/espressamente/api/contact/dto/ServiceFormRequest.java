package it.espressamente.api.contact.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceFormRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Email non valida")
    private String email;

    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String machineType;

    @Size(max = 100)
    private String machineBrand;

    @Size(max = 100)
    private String machineModel;

    @NotBlank(message = "La descrizione del problema è obbligatoria")
    @Size(max = 5000)
    private String issueDescription;

    private LocalDate preferredDate;

    @AssertTrue(message = "Devi accettare il trattamento dei dati personali")
    private Boolean privacyConsent;
}
