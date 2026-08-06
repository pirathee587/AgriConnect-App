package com.agriconnect.agency.payment.dto;

import lombok.*;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class AgencyPaymentInitiateResponse {
    private String merchantId;
    private String orderId;
    private Double amount;
    private String currency;
    private String description;
    private String agencyName;
    private String agencyPhone;
    private String paymentUrl;
}
