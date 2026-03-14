package it.espressamente.api.contact.dto;

import it.espressamente.api.contact.enums.DeliveryType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ComodatoFormRequest {

    @NotBlank(message = "Seleziona il tipo di cliente")
    private String clientType; // PRIVATO | AZIENDA

    @Size(max = 20)
    private String vatNumber;

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Email non valida")
    @Size(max = 150)
    private String email;

    @NotBlank(message = "Il telefono è obbligatorio")
    @Size(max = 20)
    private String phone;

    @Size(max = 150)
    private String companyName;

    @Size(max = 255)
    private String address;

    @NotBlank(message = "La città è obbligatoria")
    @Size(max = 100)
    private String city;

    @Size(max = 5)
    private String province;

    private Long machineId;

    @Size(max = 200)
    private String machineName;

    @NotNull(message = "Seleziona la modalità di consegna")
    private DeliveryType deliveryType;

    @Size(max = 2000)
    private String notes;

    @AssertTrue(message = "Devi accettare il trattamento dei dati personali")
    private Boolean privacyConsent;
}
