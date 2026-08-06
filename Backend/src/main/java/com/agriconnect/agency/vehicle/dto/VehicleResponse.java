package com.agriconnect.agency.vehicle.dto;

import com.agriconnect.shared.enums.VehicleStatus;
import com.agriconnect.shared.enums.VehicleType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VehicleResponse {

    private Long vehicleId;
    private Long agencyId;
    private String agencyName;

    private VehicleType vehicleType;
    private String vehicleTypeLabel;  // Human-readable: "Mini Truck", "Lorry", etc.

    private String plateNumber;
    private Double capacityKg;

    private VehicleStatus availabilityStatus;
    private String availabilityLabel; // "Available", "Assigned", "Under Maintenance"

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
