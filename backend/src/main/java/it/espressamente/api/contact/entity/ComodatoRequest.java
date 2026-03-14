package it.espressamente.api.contact.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import it.espressamente.api.common.config.EncryptedStringConverter;
import it.espressamente.api.contact.enums.DeliveryType;
import it.espressamente.api.contact.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import it.espressamente.api.common.entity.BaseEntity;
import it.espressamente.api.customer.entity.Customer;
import it.espressamente.api.product.entity.Product;

@Entity
@Table(name = "comodato_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ComodatoRequest extends BaseEntity {

    // ── Tipo cliente ─────────────────────────────────────────────────────────
    @Column(name = "client_type", nullable = false, length = 10)
    @Builder.Default
    private String clientType = "PRIVATO";

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "vat_number", columnDefinition = "TEXT")
    private String vatNumber;

    // ── Dati richiedente ──────────────────────────────────────────────────────
    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "full_name", nullable = false, columnDefinition = "TEXT")
    private String fullName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String email;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String phone;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "company_name", columnDefinition = "TEXT")
    private String companyName;

    // ── Indirizzo ─────────────────────────────────────────────────────────────
    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(length = 5)
    private String province;

    // ── Preferenze macchina ───────────────────────────────────────────────────
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private Product machine;

    @Column(name = "machine_name", length = 200)
    private String machineName;

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_type", nullable = false, length = 20)
    @Builder.Default
    private DeliveryType deliveryType = DeliveryType.CONSEGNA;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // ── Gestione admin ────────────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.NUOVO;

    @Column(name = "internal_notes", columnDefinition = "TEXT")
    private String internalNotes;

    // ── CRM ─────────────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
