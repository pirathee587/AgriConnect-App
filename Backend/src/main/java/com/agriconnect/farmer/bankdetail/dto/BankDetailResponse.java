package com.agriconnect.farmer.bankdetail.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @AllArgsConstructor @NoArgsConstructor
public class BankDetailResponse {
    private Long   bankDetailId;
    private String bankName;
    private String maskedAccountNumber;
    private String accountHolderName;
    private LocalDateTime updatedAt;
}
