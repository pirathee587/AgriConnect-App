package com.agriconnect.admin.usermanagement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AdminUserResponse {
    private Long    userId;
    private String  name;
    private String  phone;
    private String  role;
    private Boolean isVerified;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // farmer-specific
    private String  district;
    private String  address;
    // agent-specific
    private String  agentStatus;
    private Double  averageRating;
}
