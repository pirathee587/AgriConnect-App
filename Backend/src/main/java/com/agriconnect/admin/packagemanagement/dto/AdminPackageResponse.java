package com.agriconnect.admin.packagemanagement.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AdminPackageResponse {
    private Long    packageId;
    private String  agentName;
    private String  agentPhone;
    private Long    agentId;
    private String  marketDestination;
    private LocalDateTime travelDateTime;
    private LocalDateTime pickupWindowStart;
    private LocalDateTime pickupWindowEnd;
    private String  vehicleType;
    private String  vehicleNumber;
    private Double  totalCapacityKg;
    private Double  remainingCapacityKg;
    private Double  bookedPercentage;
    private String  status;
    private Integer totalBookings;
    private Integer completedBookings;
    private List<VegInfo> vegetables;
    private LocalDateTime createdAt;

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class VegInfo {
        private Long   id;
        private String vegetableName;
        private Double pricePerKg;
        private Double maxKg;
        private Double remainingKg;
    }
}
