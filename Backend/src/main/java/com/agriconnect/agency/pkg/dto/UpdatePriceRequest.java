package com.agriconnect.agency.pkg.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdatePriceRequest {

    @NotNull(message = "Package vegetable ID is required")
    private Long packageVegetableId;

    @NotNull(message = "New price is required")
    @Positive(message = "Price must be positive")
    private Double newPricePerKg;
}
