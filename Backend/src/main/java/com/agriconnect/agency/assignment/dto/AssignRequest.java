package com.agriconnect.agency.assignment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignRequest {

    @NotNull(message = "vehicleId is required")
    private Long vehicleId;

    /** Optional — package can proceed without a driver assigned at creation time */
    private Long driverId;
}
