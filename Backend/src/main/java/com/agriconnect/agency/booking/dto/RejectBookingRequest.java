package com.agriconnect.agency.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectBookingRequest {

    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
