package com.agriconnect.admin.agencyverification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectAgencyRequest {

    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
