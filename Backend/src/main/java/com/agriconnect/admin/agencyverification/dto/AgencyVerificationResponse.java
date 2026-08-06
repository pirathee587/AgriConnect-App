package com.agriconnect.admin.agencyverification.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AgencyVerificationResponse {
    private Long    agencyId;
    private Long    userId;
    private String  name;
    private String  phone;
    private String  nicNumber;
    private String  address;
    private String  agencyStatus;
    private String  nicFrontUrl;
    private String  nicBackUrl;
    private Double  averageRating;
    private Integer totalRatings;
    private String  bankName;
    private String  maskedAccountNumber;
    private String  accountHolderName;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime activatedAt;
}
