package com.agriconnect.agency.vehicle.dto;

import com.agriconnect.shared.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class AddVehicleRequest {

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    @NotBlank(message = "Plate number is required")
    private String plateNumber;

    @NotNull(message = "Capacity (kg) is required")
    @Positive(message = "Capacity must be positive")
    private Double capacityKg;
}
