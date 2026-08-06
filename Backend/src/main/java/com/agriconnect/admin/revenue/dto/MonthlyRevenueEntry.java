package com.agriconnect.admin.revenue.dto;

import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class MonthlyRevenueEntry {
    private String yearMonth;
    private Double revenue;
    private Long   paymentCount;
}