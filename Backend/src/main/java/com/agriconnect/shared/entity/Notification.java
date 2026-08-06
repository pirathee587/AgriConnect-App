package com.agriconnect.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Event type constants — matches notification spec:
     * DRIVER_APPROVED | TRIP_ASSIGNED | TRIP_REMOVED | NIC_REMINDER
     */
    @Column(nullable = false)
    private String eventType;

    /** SMS or EMAIL */
    @Column(nullable = false)
    private String channel;

    @Column(nullable = false)
    private String recipientPhone;

    /** Nullable — driver may not have email */
    private String recipientEmail;

    /**
     * Full rendered message body after template variable substitution.
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String messageBody;

    /**
     * STUB = logged to console only (Phase 1).
     * SENT = real provider confirmed delivery.
     * FAILED = provider returned error.
     */
    @Builder.Default
    private String status = "STUB";

    @CreationTimestamp private LocalDateTime createdAt;
}
