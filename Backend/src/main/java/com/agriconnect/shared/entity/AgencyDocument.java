package com.agriconnect.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "agency_documents")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AgencyDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "agency_id", nullable = false, unique = true)
    private Agency agency;

    private String nicFrontUrl;
    private String nicBackUrl;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;
}
