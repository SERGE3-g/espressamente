package it.espressamente.api.auth.entity;

import it.espressamente.api.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stores")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Store extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 30)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
