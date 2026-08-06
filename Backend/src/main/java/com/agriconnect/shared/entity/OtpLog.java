package com.agriconnect.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_logs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OtpLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private String purpose;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Builder.Default
    private Integer attempts = 0;

    @Builder.Default
    private Boolean isUsed = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
