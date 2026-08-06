package com.agriconnect.admin.bookingmanagement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AdminBookingResponse {
    private Long    bookingId;
    private Long    packageId;
    private Long    farmerId;
    private Long    agentId;
    private String  farmerName;
    private String  farmerPhone;
    private String  agentName;
    private String  agentPhone;
    private String  marketDestination;
    private LocalDateTime travelDateTime;
    private String  vegetableName;
    private Double  weightKg;
    private Double  priceAtBooking;
    private Double  totalValue;
    private String  pickupAddress;
    private String  status;
    private String  cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
