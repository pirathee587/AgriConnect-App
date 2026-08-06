package com.agriconnect.farmer.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FarmerRegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^\\+94[0-9]{9}$",
            message = "Phone must be Sri Lankan format: +94XXXXXXXXX")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String email;

    private String district;
    private String address;
}
