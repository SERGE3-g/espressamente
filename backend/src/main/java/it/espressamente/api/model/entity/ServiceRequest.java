package it.espressamente.api.model.entity;

import it.espressamente.api.model.enums.RequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "service_requests")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ServiceRequest extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(name = "machine_type", length = 100)
    private String machineType; // es. "Macchina espresso automatica"

    @Column(name = "machine_brand", length = 100)
    private String machineBrand; // es. "De'Longhi"

    @Column(name = "machine_model", length = 100)
    private String machineModel;

    @Column(name = "issue_description", nullable = false, columnDefinition = "TEXT")
    private String issueDescription;

    @Column(name = "preferred_date")
    private LocalDate preferredDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RequestStatus status = RequestStatus.NUOVO;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
