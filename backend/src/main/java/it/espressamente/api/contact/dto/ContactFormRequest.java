package it.espressamente.api.contact.dto;

import it.espressamente.api.contact.enums.ContactType;
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

    @Size(max = 150)
    private String companyName;

    @AssertTrue(message = "Devi accettare il trattamento dei dati personali")
    private Boolean privacyConsent;

    @Size(max = 200)
    private String subject;

    @NotBlank(message = "Il messaggio è obbligatorio")
    @Size(max = 5000)
    private String message;

    private ContactType contactType;
}
