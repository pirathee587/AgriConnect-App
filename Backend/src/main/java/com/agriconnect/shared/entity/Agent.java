package com.agriconnect.shared.entity;

import com.agriconnect.shared.enums.AgentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "agents")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Agent {

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
    private AgentStatus status = AgentStatus.PENDING_APPROVAL;

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
}
