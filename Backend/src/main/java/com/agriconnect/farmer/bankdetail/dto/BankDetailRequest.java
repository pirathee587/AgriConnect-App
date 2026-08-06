package com.agriconnect.farmer.bankdetail.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BankDetailRequest {

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "Account holder name is required")
    private String accountHolderName;
}
