package com.agriconnect.agency.profile.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AgencyProfileResponse {
    private Long    agencyId;
    private String  name;
    private String  phone;
    private String  nicNumber;
    private String  address;
    private String  agencyStatus;
    private Double  averageRating;
    private Integer totalRatings;
    private String  bankName;
    private String  maskedAccountNumber;
    private String  accountHolderName;
    private String  nicFrontUrl;
    private String  nicBackUrl;
    private LocalDateTime createdAt;
    private LocalDateTime activatedAt;
}
