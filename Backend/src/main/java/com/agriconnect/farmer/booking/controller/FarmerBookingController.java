package com.agriconnect.farmer.booking.controller;

import com.agriconnect.farmer.booking.dto.*;
import com.agriconnect.farmer.booking.service.FarmerBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerBookingController {

    private final FarmerBookingService farmerBookingService;

    @PostMapping("/initiate")
    public ResponseEntity<String> initiate(
            Authentication auth,
            @Valid @RequestBody BookingInitiateRequest req) {
        return ResponseEntity.ok(farmerBookingService.initiateBooking(auth.getName(), req));
    }

    @PostMapping("/confirm")
    public ResponseEntity<FarmerBookingResponse> confirm(
            Authentication auth,
            @Valid @RequestBody BookingConfirmRequest req) {
        return ResponseEntity.ok(farmerBookingService.confirmBooking(auth.getName(), req));
    }

    @GetMapping
    public ResponseEntity<List<FarmerBookingResponse>> myBookings(Authentication auth) {
        return ResponseEntity.ok(farmerBookingService.getMyBookings(auth.getName()));
    }

    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<FarmerBookingResponse> cancel(
            Authentication auth,
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(farmerBookingService.cancelBooking(auth.getName(), bookingId));
    }
}
