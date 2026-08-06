package com.agriconnect.shared.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "farmers")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Farmer {

    @Id
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    private String district;
    private String address;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
