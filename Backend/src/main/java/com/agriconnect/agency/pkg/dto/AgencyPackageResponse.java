package com.agriconnect.agency.pkg.dto;

import com.agriconnect.shared.enums.NicStatus;
import com.agriconnect.shared.enums.VehicleStatus;
import com.agriconnect.shared.enums.VehicleType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AgencyPackageResponse {
    private Long   packageId;
    private String marketDestination;
    private LocalDateTime travelDateTime;
    private LocalDateTime pickupWindowStart;
    private LocalDateTime pickupWindowEnd;

    // Legacy free-text fields (kept for backward compatibility with old packages)
    private String vehicleType;
    private String vehicleNumber;

    // Fleet vehicle fields (populated when vehicle assigned from registered fleet)
    private Long        vehicleId;
    private VehicleType vehicleTypeEnum;
    private String      vehicleTypeLabel;
    private String      plateNumber;
    private Double      capacityKg;
    private VehicleStatus vehicleStatus;

    // Assigned driver fields (nullable — driver is optional per package)
    private Long      driverId;
    private String    driverName;
    private String    driverPhone;
    private NicStatus nicStatus;
    private String    nicStatusLabel;

    private Double totalCapacityKg;
    private Double remainingCapacityKg;
    private String status;
    private Integer totalBookings;
    private Integer confirmedBookings;
    private List<VegetableInfo> vegetables;

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class VegetableInfo {
        private Long   id;
        private String vegetableName;
        private Double pricePerKg;
        private Double maxKg;
        private Double remainingKg;
        private LocalDateTime priceUpdatedAt;
    }
}
