package it.espressamente.api.contact.entity;

import it.espressamente.api.common.config.EncryptedStringConverter;
import it.espressamente.api.contact.enums.ContactType;
import it.espressamente.api.contact.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;
import it.espressamente.api.common.entity.BaseEntity;
import it.espressamente.api.customer.entity.Customer;

@Entity
@Table(name = "contact_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ContactRequest extends BaseEntity {

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "full_name", nullable = false, columnDefinition = "TEXT")
    private String fullName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String email;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String phone;

    @Column(length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "company_name", length = 150)
    private String companyName;

    @Column(name = "privacy_consent", nullable = false)
    @Builder.Default
    private Boolean privacyConsent = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_type", nullable = false, length = 20)
    @Builder.Default
    private ContactType contactType = ContactType.INFO;

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
