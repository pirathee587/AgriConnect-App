package com.agriconnect.agency.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateAgencyProfileRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String address;
    private String bankName;
    private String accountNumber;
    private String accountHolderName;
}
