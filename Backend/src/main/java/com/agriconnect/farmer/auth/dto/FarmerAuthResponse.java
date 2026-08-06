package com.agriconnect.farmer.auth.dto;

import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class FarmerAuthResponse {
    private String token;
    private String name;
    private Long   userId;
    private Long   farmerId;
    private String role;
    private String message;
}
