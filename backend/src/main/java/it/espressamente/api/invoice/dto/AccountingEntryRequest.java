package it.espressamente.api.invoice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AccountingEntryRequest {

    @NotBlank(message = "Il tipo è obbligatorio")
    private String type;

    @NotBlank(message = "La categoria è obbligatoria")
    private String category;

    @NotNull(message = "L'importo è obbligatorio")
    private BigDecimal amount;

    @NotBlank(message = "La descrizione è obbligatoria")
    private String description;

    private String date;

    private Long invoiceId;

    private Long customerId;

    private String notes;
}
