package com.agriconnect.agency.booking.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AgencyBookingResponse {
    private Long   bookingId;
    private Long   packageId;
    private String marketDestination;
    private LocalDateTime travelDateTime;
    private LocalDateTime pickupWindowStart;
    private String farmerName;
    private String farmerPhone;
    private String vegetableName;
    private Double weightKg;
    private Double priceAtBooking;
    private Double totalValue;
    private String pickupAddress;
    private String status;
    private String cancelReason;
    private LocalDateTime createdAt;
}
