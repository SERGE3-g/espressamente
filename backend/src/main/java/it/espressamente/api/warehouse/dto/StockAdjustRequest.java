package it.espressamente.api.warehouse.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class StockAdjustRequest {

    @NotNull(message = "ID prodotto obbligatorio")
    private Long productId;

    private Long storeId;

    @NotNull(message = "Tipo movimento obbligatorio")
    private String movementType;

    @NotNull(message = "Quantità obbligatoria")
    @Min(value = 1, message = "Quantità minima: 1")
    private Integer quantity;

    private Integer reorderPoint;

    private String notes;
}
