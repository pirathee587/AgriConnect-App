package com.agriconnect.admin.revenue.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class PaymentEntryResponse {
    private Long   paymentId;
    private Long   agentId;
    private String agentName;
    private String agentPhone;
    private Double amount;
    private String currency;
    private String paymentReference;
    private String paymentMethod;
    private String status;
    private String failureReason;
    private LocalDateTime createdAt;
}
