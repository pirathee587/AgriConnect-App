package com.agriconnect.shared.entity;

import com.agriconnect.shared.enums.AgencyStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

import org.springframework.data.domain.Persistable;

@Entity
@Table(name = "agencies")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Agency implements Persistable<Long> {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, unique = true)
    private String nicNumber;

    private String address;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AgencyStatus status = AgencyStatus.PENDING_APPROVAL;

    @Builder.Default
    private Double averageRating = 0.0;

    @Builder.Default
    private Integer totalRatings = 0;

    private String bankName;
    private String accountNumber;
    private String accountHolderName;

    private LocalDateTime approvedAt;
    private LocalDateTime activatedAt;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostPersist
    @PostLoad
    void markNotNew() {
        this.isNew = false;
    }
}
