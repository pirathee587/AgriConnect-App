package com.agriconnect.admin.bookingmanagement.controller;

import com.agriconnect.admin.bookingmanagement.dto.*;
import com.agriconnect.admin.bookingmanagement.service.AdminBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final AdminBookingService adminBookingService;

    @GetMapping
    public ResponseEntity<AdminBookingListResponse> getAll() {
        return ResponseEntity.ok(adminBookingService.getAllBookings());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AdminBookingResponse>> getByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(adminBookingService.getByStatus(status));
    }

    @GetMapping("/farmer/{farmerId}")
    public ResponseEntity<List<AdminBookingResponse>> getByFarmer(
            @PathVariable Long farmerId) {
        return ResponseEntity.ok(adminBookingService.getByFarmer(farmerId));
    }

    @GetMapping("/package/{packageId}")
    public ResponseEntity<List<AdminBookingResponse>> getByPackage(
            @PathVariable Long packageId) {
        return ResponseEntity.ok(adminBookingService.getByPackage(packageId));
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<AdminBookingResponse>> getByAgent(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(adminBookingService.getByAgent(agentId));
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<AdminBookingResponse> getById(
            @PathVariable Long bookingId) {
        return ResponseEntity.ok(adminBookingService.getById(bookingId));
    }
}
