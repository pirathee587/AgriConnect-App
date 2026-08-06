package com.agriconnect.shared.entity;

import com.agriconnect.shared.enums.VehicleStatus;
import com.agriconnect.shared.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    /**
     * Unique system-wide — enforced by DB constraint.
     * No two agencies can register the same plate number.
     */
    @Column(nullable = false, unique = true)
    private String plateNumber;

    @Column(nullable = false)
    private Double capacityKg;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VehicleStatus availabilityStatus = VehicleStatus.AVAILABLE;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;
}
