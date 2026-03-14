package it.espressamente.api.customer.entity;

import it.espressamente.api.customer.enums.InteractionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import it.espressamente.api.auth.entity.AdminUser;
import it.espressamente.api.common.entity.BaseEntity;

@Entity
@Table(name = "customer_interactions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CustomerInteraction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InteractionType type;

    @Column(length = 200)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_user_id")
    private AdminUser adminUser;
}
