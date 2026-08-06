package com.agriconnect.shared.entity;

import com.agriconnect.shared.enums.DriverStatus;
import com.agriconnect.shared.enums.NicStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "drivers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    /**
     * Optional — if null, only SMS notifications are sent.
     * Agency staff may not always collect driver email.
     */
    private String email;

    @Column(nullable = false)
    private String licenceNumber;

    @Column(nullable = false)
    private String licenceClass;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private NicStatus nicStatus = NicStatus.NIC_NOT_PROVIDED;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DriverStatus status = DriverStatus.ACTIVE;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;
}
