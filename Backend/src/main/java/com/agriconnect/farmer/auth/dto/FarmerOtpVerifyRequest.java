package com.agriconnect.farmer.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FarmerOtpVerifyRequest {
    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "Purpose is required")
    private String purpose;
}