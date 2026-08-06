package com.agriconnect.shared.entity;

import com.agriconnect.shared.enums.PackageStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "packages")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Package {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @Column(nullable = false)
    private String marketDestination;

    @Column(nullable = false)
    private LocalDateTime travelDateTime;

    private LocalDateTime pickupWindowStart;
    private LocalDateTime pickupWindowEnd;

    /**
     * Legacy free-text fields — kept nullable as migration fallback.
     * New packages use the vehicle FK below instead.
     */
    private String vehicleType;
    private String vehicleNumber;

    /**
     * FK to fleet-registered vehicle. Preferred over legacy vehicleType/vehicleNumber.
     * Nullable — old packages may not have a fleet vehicle linked.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    /**
     * FK to assigned driver. Nullable — a package can exist without a driver.
     * IMPORTANT: This FK is NEVER set to NULL on package completion (DELIVERED/COMPLETED).
     * It is preserved permanently as the audit record of who drove the trip.
     * It is only NULLed on an explicit "Remove Driver" action (DELETE /assign/driver).
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Column(nullable = false)
    private Double totalCapacityKg;

    @Column(nullable = false)
    private Double remainingCapacityKg;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PackageStatus status = PackageStatus.OPEN;

    @OneToMany(mappedBy = "pkg", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PackageVegetable> vegetables;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;
}
