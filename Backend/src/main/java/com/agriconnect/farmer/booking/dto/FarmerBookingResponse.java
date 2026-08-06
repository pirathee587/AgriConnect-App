package com.agriconnect.farmer.booking.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class FarmerBookingResponse {
    private Long   bookingId;
    private Long   packageId;
    private String marketDestination;
    private LocalDateTime travelDateTime;
    private LocalDateTime pickupWindowStart;
    private String vegetableName;
    private Double weightKg;
    private Double priceAtBooking;
    private Double totalValue;
    private String pickupAddress;
    private String status;
    private String agentName;
    private String agentPhone;
    private Boolean isRated;
    private LocalDateTime createdAt;
}