package com.agriconnect.agency.payment.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AgencyPaymentHistoryResponse {
    private Long   paymentId;
    private Double amount;
    private String currency;
    private String paymentReference;
    private String paymentMethod;
    private String status;
    private String failureReason;
    private LocalDateTime createdAt;
}
