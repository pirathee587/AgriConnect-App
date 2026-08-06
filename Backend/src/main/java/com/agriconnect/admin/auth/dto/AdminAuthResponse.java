package com.agriconnect.admin.auth.dto;

import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AdminAuthResponse {
    private String token;
    private String name;
    private Long   userId;
    private String role;
    private String message;
}
