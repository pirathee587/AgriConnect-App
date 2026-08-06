package com.agriconnect.agency.assignment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SwapDriverRequest {

    @NotNull(message = "driverId is required for driver swap")
    private Long driverId;
}
