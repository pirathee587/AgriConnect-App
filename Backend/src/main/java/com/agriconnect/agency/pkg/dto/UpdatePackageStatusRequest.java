package com.agriconnect.agency.pkg.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdatePackageStatusRequest {

    @NotBlank(message = "Status is required")
    private String status; // IN_TRANSIT, DELIVERED, CANCELLED
}
