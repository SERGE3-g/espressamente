package it.espressamente.api.model.entity;

import it.espressamente.api.model.enums.ContactType;
import it.espressamente.api.model.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contact_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ContactRequest extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 200)
    private String subject;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_type", nullable = false, length = 20)
    @Builder.Default
    private ContactType contactType = ContactType.INFO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.NUOVO;

    @Column(columnDefinition = "TEXT")
    private String notes; // Note interne dell'admin
}
