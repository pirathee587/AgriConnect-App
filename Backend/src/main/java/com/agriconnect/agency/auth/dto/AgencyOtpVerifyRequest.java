package com.agriconnect.agency.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AgencyOtpVerifyRequest {

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "OTP is required")
    private String otp;

    @NotBlank(message = "Purpose is required")
    private String purpose;
}
