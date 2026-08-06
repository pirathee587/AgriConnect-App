package com.agriconnect.agency.auth.dto;

import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AgencyAuthResponse {
    private String token;
    private String name;
    private Long   userId;
    private Long   agencyId;
    private String role;
    private String agencyStatus;
    private String message;
}
