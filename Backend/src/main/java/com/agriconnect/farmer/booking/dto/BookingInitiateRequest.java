package com.agriconnect.farmer.booking.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class BookingInitiateRequest {

    @NotNull(message = "Package ID is required")
    private Long packageId;

    @NotBlank(message = "Vegetable name is required")
    private String vegetableName;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weightKg;

    @NotBlank(message = "Pickup address is required")
    private String pickupAddress;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "Account number is required")
    private String accountNumber;

    @NotBlank(message = "Account holder name is required")
    private String accountHolderName;
}