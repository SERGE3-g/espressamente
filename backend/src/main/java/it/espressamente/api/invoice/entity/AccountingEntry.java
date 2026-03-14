package it.espressamente.api.invoice.entity;

import it.espressamente.api.invoice.enums.AccountingCategory;
import it.espressamente.api.invoice.enums.AccountingType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import it.espressamente.api.common.entity.BaseEntity;
import it.espressamente.api.customer.entity.Customer;

@Entity
@Table(name = "accounting_entries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AccountingEntry extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AccountingType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AccountingCategory category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private LocalDate date = LocalDate.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
