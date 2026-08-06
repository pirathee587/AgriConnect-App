package com.agriconnect.farmer.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FarmerLoginRequest {
    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Password is required")
    private String password;
}
