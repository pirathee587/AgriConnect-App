package com.agriconnect.agency.booking.controller;

import com.agriconnect.agency.booking.dto.*;
import com.agriconnect.agency.booking.service.AgencyBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agency/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENCY')")
public class AgencyBookingController {

    private final AgencyBookingService agencyBookingService;

    @GetMapping
    public ResponseEntity<List<AgencyBookingResponse>> getAll(Authentication auth) {
        return ResponseEntity.ok(agencyBookingService.getAllBookings(auth.getName()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AgencyBookingResponse>> getPending(Authentication auth) {
        return ResponseEntity.ok(agencyBookingService.getPendingBookings(auth.getName()));
    }

    @GetMapping("/package/{packageId}")
    public ResponseEntity<List<AgencyBookingResponse>> getByPackage(
            Authentication auth, @PathVariable Long packageId) {
        return ResponseEntity.ok(
                agencyBookingService.getBookingsByPackage(auth.getName(), packageId));
    }

    @PostMapping("/{bookingId}/approve")
    public ResponseEntity<AgencyBookingResponse> approve(
            Authentication auth, @PathVariable Long bookingId) {
        return ResponseEntity.ok(agencyBookingService.approveBooking(auth.getName(), bookingId));
    }

    @PostMapping("/{bookingId}/reject")
    public ResponseEntity<AgencyBookingResponse> reject(
            Authentication auth, @PathVariable Long bookingId,
            @Valid @RequestBody RejectBookingRequest req) {
        return ResponseEntity.ok(
                agencyBookingService.rejectBooking(auth.getName(), bookingId, req.getReason()));
    }

    @PostMapping("/{bookingId}/pickup")
    public ResponseEntity<AgencyBookingResponse> markPickup(
            Authentication auth, @PathVariable Long bookingId) {
        return ResponseEntity.ok(agencyBookingService.markPickedUp(auth.getName(), bookingId));
    }

    @PostMapping("/{bookingId}/delivered")
    public ResponseEntity<AgencyBookingResponse> markDelivered(
            Authentication auth, @PathVariable Long bookingId) {
        return ResponseEntity.ok(agencyBookingService.markDelivered(auth.getName(), bookingId));
    }

    @PostMapping("/{bookingId}/complete")
    public ResponseEntity<AgencyBookingResponse> markCompleted(
            Authentication auth, @PathVariable Long bookingId) {
        return ResponseEntity.ok(agencyBookingService.markCompleted(auth.getName(), bookingId));
    }
}
