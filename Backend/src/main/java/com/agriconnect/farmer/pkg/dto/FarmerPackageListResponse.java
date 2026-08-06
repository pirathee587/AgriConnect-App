package com.agriconnect.farmer.pkg.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class FarmerPackageListResponse {
    private Long   packageId;
    private String marketDestination;
    private LocalDateTime travelDateTime;
    private LocalDateTime pickupWindowStart;
    private Double remainingCapacityKg;
    private String status;
    private String agentName;
    private String agentPhone;
    private Double agentRating;
    private Integer agentTotalRatings;
    private List<VegSummary> vegetables;

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class VegSummary {
        private String vegetableName;
        private Double pricePerKg;
        private Double remainingKg;
    }
}
