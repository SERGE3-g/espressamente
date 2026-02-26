package it.espressamente.api.dto.request;

import it.espressamente.api.model.enums.ContactType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContactFormRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Email non valida")
    private String email;

    @Size(max = 20)
    private String phone;

    @Size(max = 200)
    private String subject;

    @NotBlank(message = "Il messaggio è obbligatorio")
    @Size(max = 5000)
    private String message;

    private ContactType contactType;
}
