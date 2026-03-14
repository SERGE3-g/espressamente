package it.espressamente.api.customer.entity;

import it.espressamente.api.common.config.EncryptedStringConverter;
import it.espressamente.api.contact.enums.ClientType;
import jakarta.persistence.*;
import lombok.*;
import it.espressamente.api.common.entity.BaseEntity;

@Entity
@Table(name = "customers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "full_name", nullable = false, columnDefinition = "TEXT")
    private String fullName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String email;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String phone;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "company_name", columnDefinition = "TEXT")
    private String companyName;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "vat_number", columnDefinition = "TEXT")
    private String vatNumber;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(name = "fiscal_code", columnDefinition = "TEXT")
    private String fiscalCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "client_type", nullable = false, length = 10)
    @Builder.Default
    private ClientType clientType = ClientType.PRIVATO;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String address;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String city;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String province;

    @Convert(converter = EncryptedStringConverter.class)
    @Column(columnDefinition = "TEXT")
    private String cap;

    @Column(length = 50)
    @Builder.Default
    private String country = "Italia";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
