package it.espressamente.api.warehouse.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WarehouseStockResponse {
    private Long id;
    private Long productId;
    private String productSku;
    private String productName;
    private String productType;
    private Long storeId;
    private String storeName;
    private Integer quantity;
    private Integer reorderPoint;
    private Boolean lowStock;
}
