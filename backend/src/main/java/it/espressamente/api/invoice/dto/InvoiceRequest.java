package it.espressamente.api.invoice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceRequest {

    private Long customerId;

    private String paymentMethod;

    private String issueDate;

    private String dueDate;

    @Builder.Default
    private BigDecimal taxRate = new BigDecimal("22.00");

    private String notes;

    @NotNull(message = "Le righe fattura sono obbligatorie")
    @Valid
    private List<InvoiceItemRequest> items;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InvoiceItemRequest {
        private Long productId;
        private String description;
        @Builder.Default
        private Integer quantity = 1;
        @Builder.Default
        private BigDecimal unitPrice = BigDecimal.ZERO;
    }
}
