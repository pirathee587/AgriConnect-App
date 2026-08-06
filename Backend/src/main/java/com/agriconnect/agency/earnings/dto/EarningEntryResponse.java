package com.agriconnect.agency.earnings.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class EarningEntryResponse {
    private Long   bookingId;
    private String farmerName;
    private String vegetableName;
    private Double weightKg;
    private Double pricePerKg;
    private Double totalValue;
    private String marketDestination;
    private LocalDateTime completedAt;
}
