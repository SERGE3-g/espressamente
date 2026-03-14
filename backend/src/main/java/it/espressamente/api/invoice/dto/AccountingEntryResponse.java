package it.espressamente.api.invoice.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AccountingEntryResponse {
    private Long id;
    private String type;
    private String category;
    private BigDecimal amount;
    private String description;
    private LocalDate date;
    private Long invoiceId;
    private String invoiceNumber;
    private Long customerId;
    private String customerName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
