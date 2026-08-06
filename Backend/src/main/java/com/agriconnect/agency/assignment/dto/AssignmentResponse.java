package com.agriconnect.agency.assignment.dto;

import com.agriconnect.shared.enums.NicStatus;
import com.agriconnect.shared.enums.VehicleStatus;
import com.agriconnect.shared.enums.VehicleType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AssignmentResponse {

    private Long packageId;

    // Vehicle info
    private Long vehicleId;
    private VehicleType vehicleType;
    private String vehicleTypeLabel;
    private String plateNumber;
    private Double capacityKg;
    private VehicleStatus vehicleStatus;

    // Driver info (nullable — driver is optional)
    private Long driverId;
    private String driverName;
    private String driverPhone;
    private String driverLicenceClass;
    private NicStatus nicStatus;
    private String nicStatusLabel;

    private LocalDateTime assignedAt;
}
