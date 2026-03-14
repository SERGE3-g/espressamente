package it.espressamente.api.warehouse.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WarehouseMovementResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String movementType;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private String referenceType;
    private Long referenceId;
    private String notes;
    private String adminUsername;
    private LocalDateTime createdAt;
}
