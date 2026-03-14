package it.espressamente.api.contact.entity;

import it.espressamente.api.common.config.EncryptedStringConverter;
import it.espressamente.api.contact.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import it.espressamente.api.common.entity.BaseEntity;
import it.espressamente.api.customer.entity.Customer;

@Entity
@Table(name = "service_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ServiceRequest extends BaseEntity {

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "full_name", nullable = false, columnDefinition = "TEXT")
    private String fullName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String email;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String phone;

    @Column(name = "machine_type", length = 100)
    private String machineType;

    @Column(name = "machine_brand", length = 100)
    private String machineBrand;

    @Column(name = "machine_model", length = 100)
    private String machineModel;

    @Column(name = "issue_description", nullable = false, columnDefinition = "TEXT")
    private String issueDescription;

    @Column(name = "preferred_date")
    private LocalDate preferredDate;

    @Column(name = "privacy_consent")
    @Builder.Default
    private Boolean privacyConsent = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.NUOVO;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // ── CRM ─────────────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;
}
