package it.espressamente.api.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerRequest {

    @NotBlank(message = "Il nome è obbligatorio")
    @Size(max = 100)
    private String fullName;

    @NotBlank(message = "L'email è obbligatoria")
    @Email(message = "Email non valida")
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String phone;

    @Size(max = 150)
    private String companyName;

    @Size(max = 20)
    private String vatNumber;

    @Size(max = 16)
    private String fiscalCode;

    @Builder.Default
    private String clientType = "PRIVATO";

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 5)
    private String province;

    @Size(max = 5)
    private String cap;

    @Size(max = 50)
    private String country;

    private String notes;
}
