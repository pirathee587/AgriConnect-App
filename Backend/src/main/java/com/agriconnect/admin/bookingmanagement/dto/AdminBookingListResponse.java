package com.agriconnect.admin.bookingmanagement.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AdminBookingListResponse {
    private Long totalBookings;
    private Long confirmedBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    private Long pendingOtpBookings;
    private Long agentApprovedBookings;
    private Long pickedUpBookings;
    private Long deliveredBookings;
    private Double totalValueAllBookings;
    private Double totalValueCompleted;
    private Map<String, Long> bookingsByMarket;
    private List<AdminBookingResponse> bookings;
}
