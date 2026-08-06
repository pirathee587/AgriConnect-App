package com.agriconnect.admin.revenue.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class RevenueOverviewResponse {
    // Summary
    private Double totalRevenue;
    private Double pendingRevenue;
    private Long   totalPayments;
    private Long   successPayments;
    private Long   failedPayments;
    private Long   pendingPayments;
    private Long   cancelledPayments;

    // Agent stats
    private Long   totalAgents;
    private Long   activeAgents;
    private Long   pendingApprovalAgents;
    private Long   pendingPaymentAgents;
    private Long   suspendedAgents;

    // Booking stats
    private Long   totalBookings;
    private Long   completedBookings;
    private Double totalBookingValue;
    private Double completedBookingValue;

    // Monthly breakdown
    private List<MonthlyRevenueEntry> monthlyRevenue;

    // Per-agent breakdown
    private List<AgentRevenueEntry> agentRevenue;

    @Data @Builder @AllArgsConstructor @NoArgsConstructor
    public static class AgentRevenueEntry {
        private Long   agentId;
        private String agentName;
        private String agentPhone;
        private String agentStatus;
        private Double amountPaid;
        private Long   totalBookings;
        private Long   completedBookings;
        private Double totalBookingValue;
        private LocalDateTime activatedAt;
    }
}
