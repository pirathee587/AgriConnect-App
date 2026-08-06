package com.agriconnect.agency.pkg.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreatePackageRequest {

    @NotBlank(message = "Market destination is required")
    private String marketDestination;

    @NotNull(message = "Travel date/time is required")
    @Future(message = "Travel date must be in the future")
    private LocalDateTime travelDateTime;

    private LocalDateTime pickupWindowStart;
    private LocalDateTime pickupWindowEnd;

    private String vehicleType;
    private String vehicleNumber;

    private Long vehicleId;
    private Long driverId;

    @NotNull(message = "Total capacity is required")
    @Positive(message = "Total capacity must be positive")
    private Double totalCapacityKg;

    @NotEmpty(message = "At least one vegetable is required")
    private List<VegetableItem> vegetables;

    @Data
    public static class VegetableItem {

        @NotBlank(message = "Vegetable name is required")
        private String vegetableName;

        @NotNull(message = "Price per kg is required")
        @Positive(message = "Price must be positive")
        private Double pricePerKg;

        @NotNull(message = "Max kg is required")
        @Positive(message = "Max kg must be positive")
        private Double maxKg;
    }
}
