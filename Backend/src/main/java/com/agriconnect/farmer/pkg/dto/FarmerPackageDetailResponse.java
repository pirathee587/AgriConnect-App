package com.agriconnect.farmer.pkg.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class FarmerPackageDetailResponse {
    private Long   packageId;
    private String marketDestination;
    private LocalDateTime travelDateTime;
    private LocalDateTime pickupWindowStart;
    private LocalDateTime pickupWindowEnd;
    private String vehicleType;
    private String vehicleNumber;
    private Double totalCapacityKg;
    private Double remainingCapacityKg;
    private String status;
    private String agentName;
    private String agentPhone;
    private Double agentRating;
    private Integer agentTotalRatings;
    private List<VegDetail> vegetables;

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class VegDetail {
        private Long   vegetableId;
        private String vegetableName;
        private Double pricePerKg;
        private Double maxKg;
        private Double remainingKg;
        private LocalDateTime priceUpdatedAt;
    }
}
