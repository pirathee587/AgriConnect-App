package com.agriconnect.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "agent_documents")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AgentDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "agent_id", nullable = false, unique = true)
    private Agent agent;

    @Column(nullable = false)
    private String nicFrontUrl;

    @Column(nullable = false)
    private String nicBackUrl;

    @CreationTimestamp
    private LocalDateTime uploadedAt;
}
