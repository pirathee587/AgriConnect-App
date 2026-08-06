package com.agriconnect.farmer.profile.dto;

import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class FarmerProfileResponse {
    private Long   farmerId;
    private String name;
    private String phone;
    private String district;
    private String address;
    private String bankName;
    private String maskedAccountNumber;
    private String accountHolderName;
    private Boolean isVerified;
    private String profilePicture;
}