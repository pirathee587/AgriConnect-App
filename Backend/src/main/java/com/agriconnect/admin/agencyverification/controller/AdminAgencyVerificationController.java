package com.agriconnect.admin.agencyverification.controller;

import com.agriconnect.admin.agencyverification.dto.*;
import com.agriconnect.admin.agencyverification.service.AdminAgencyVerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/agencies")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAgencyVerificationController {

    private final AdminAgencyVerificationService adminAgencyVerificationService;

    @GetMapping
    public ResponseEntity<List<AgencyVerificationResponse>> getAll() {
        return ResponseEntity.ok(adminAgencyVerificationService.getAllAgencies());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AgencyVerificationResponse>> getByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(adminAgencyVerificationService.getAgenciesByStatus(status));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<AgencyVerificationResponse>> getPending() {
        return ResponseEntity.ok(adminAgencyVerificationService.getPendingAgencies());
    }

    @GetMapping("/{agencyId}")
    public ResponseEntity<AgencyVerificationResponse> getById(@PathVariable Long agencyId) {
        return ResponseEntity.ok(adminAgencyVerificationService.getAgencyById(agencyId));
    }

    @PostMapping("/{agencyId}/approve")
    public ResponseEntity<AgencyVerificationResponse> approve(@PathVariable Long agencyId) {
        return ResponseEntity.ok(adminAgencyVerificationService.approve(agencyId));
    }

    @PostMapping("/{agencyId}/reject")
    public ResponseEntity<AgencyVerificationResponse> reject(
            @PathVariable Long agencyId,
            @Valid @RequestBody RejectAgencyRequest req) {
        return ResponseEntity.ok(adminAgencyVerificationService.reject(agencyId, req.getReason()));
    }

    @PostMapping("/{agencyId}/suspend")
    public ResponseEntity<AgencyVerificationResponse> suspend(@PathVariable Long agencyId) {
        return ResponseEntity.ok(adminAgencyVerificationService.suspend(agencyId));
    }

    @PostMapping("/{agencyId}/reactivate")
    public ResponseEntity<AgencyVerificationResponse> reactivate(@PathVariable Long agencyId) {
        return ResponseEntity.ok(adminAgencyVerificationService.reactivate(agencyId));
    }

    @PostMapping("/{agencyId}/activate-after-payment")
    public ResponseEntity<AgencyVerificationResponse> activateAfterPayment(
            @PathVariable Long agencyId) {
        return ResponseEntity.ok(adminAgencyVerificationService.activateAfterPayment(agencyId));
    }
}
