package it.espressamente.api.customer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomerInteractionRequest {

    @NotBlank(message = "Il tipo è obbligatorio")
    private String type;

    @Size(max = 200)
    private String subject;

    private String description;

    private String date;
}
