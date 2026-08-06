package com.agriconnect.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "package_vegetables")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class PackageVegetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "package_id", nullable = false)
    private Package pkg;

    @Column(nullable = false)
    private String vegetableName;

    @Column(nullable = false)
    private Double pricePerKg;

    @Column(nullable = false)
    private Double maxKg;

    @Column(nullable = false)
    private Double remainingKg;

    @UpdateTimestamp
    private LocalDateTime priceUpdatedAt;
}
