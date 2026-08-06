package com.agriconnect.agency.vehicle.dto;

import com.agriconnect.shared.enums.VehicleStatus;
import com.agriconnect.shared.enums.VehicleType;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UpdateVehicleRequest {

    /** All fields optional — only non-null fields applied */
    private VehicleType vehicleType;

    @Positive(message = "Capacity must be positive")
    private Double capacityKg;

    /**
     * To set a vehicle under maintenance: pass UNDER_MAINTENANCE.
     * To re-enable: pass AVAILABLE.
     * Cannot be manually set to ASSIGNED — that is managed by the assignment service.
     */
    private VehicleStatus availabilityStatus;
}
