package it.espressamente.api.invoice.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private String status;
    private String paymentMethod;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate paidDate;
    private BigDecimal subtotal;
    private BigDecimal taxRate;
    private BigDecimal taxAmount;
    private BigDecimal total;
    private String notes;
    private CustomerSummary customer;
    private List<InvoiceItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CustomerSummary {
        private Long id;
        private String fullName;
        private String email;
        private String companyName;
        private String vatNumber;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InvoiceItemResponse {
        private Long id;
        private String description;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal total;
        private Long productId;
    }
}
