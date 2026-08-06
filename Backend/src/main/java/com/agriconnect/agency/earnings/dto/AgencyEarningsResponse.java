package com.agriconnect.agency.earnings.dto;

import lombok.*;
import java.util.List;
import java.util.Map;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AgencyEarningsResponse {
    private Double totalExpectedEarnings;
    private Double confirmedEarnings;
    private Long   totalBookings;
    private Long   completedBookings;
    private Long   pendingBookings;
    private Long   cancelledBookings;
    private Long   totalPackages;
    private Long   activePackages;
    private Map<String, Double> earningsByMarket;
    private Map<String, Double> earningsByMonth;
    private List<EarningEntryResponse> recentCompletedBookings;
}
