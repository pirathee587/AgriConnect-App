package com.agriconnect.agency.pkg.controller;

import com.agriconnect.agency.pkg.dto.*;
import com.agriconnect.agency.pkg.service.AgencyPackageService;
import com.agriconnect.agency.assignment.dto.AssignRequest;
import com.agriconnect.agency.assignment.dto.AssignmentResponse;
import com.agriconnect.agency.assignment.dto.SwapDriverRequest;
import com.agriconnect.agency.assignment.service.AgencyAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agency/packages")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENCY')")
public class AgencyPackageController {

    private final AgencyPackageService    agencyPackageService;
    private final AgencyAssignmentService agencyAssignmentService;

    @PostMapping
    public ResponseEntity<AgencyPackageResponse> create(
            Authentication auth, @Valid @RequestBody CreatePackageRequest req) {
        return ResponseEntity.ok(agencyPackageService.createPackage(auth.getName(), req));
    }

    @GetMapping
    public ResponseEntity<List<AgencyPackageResponse>> getMyPackages(Authentication auth) {
        return ResponseEntity.ok(agencyPackageService.getMyPackages(auth.getName()));
    }

    @GetMapping("/{packageId}")
    public ResponseEntity<AgencyPackageResponse> getById(
            Authentication auth, @PathVariable Long packageId) {
        return ResponseEntity.ok(agencyPackageService.getPackageById(auth.getName(), packageId));
    }

    @PatchMapping("/price")
    public ResponseEntity<String> updatePrice(
            Authentication auth, @Valid @RequestBody UpdatePriceRequest req) {
        return ResponseEntity.ok(agencyPackageService.updatePrice(auth.getName(), req));
    }

    @PatchMapping("/{packageId}/status")
    public ResponseEntity<AgencyPackageResponse> updateStatus(
            Authentication auth, @PathVariable Long packageId,
            @Valid @RequestBody UpdatePackageStatusRequest req) {
        return ResponseEntity.ok(agencyPackageService.updateStatus(auth.getName(), packageId, req));
    }

    @DeleteMapping("/{packageId}")
    public ResponseEntity<String> cancel(
            Authentication auth, @PathVariable Long packageId) {
        return ResponseEntity.ok(agencyPackageService.cancelPackage(auth.getName(), packageId));
    }

    // ─────────────────────────────────────────────────────────────
    // Assignment endpoints
    // ─────────────────────────────────────────────────────────────

    /** POST /api/agency/packages/{id}/assign — assign vehicle + optional driver */
    @PostMapping("/{packageId}/assign")
    public ResponseEntity<AssignmentResponse> assign(
            Authentication auth, @PathVariable Long packageId,
            @Valid @RequestBody AssignRequest req) {
        return ResponseEntity.ok(agencyAssignmentService.assignToPackage(auth.getName(), packageId, req));
    }

    /** PUT /api/agency/packages/{id}/assign — swap to a different driver */
    @PutMapping("/{packageId}/assign")
    public ResponseEntity<AssignmentResponse> swapDriver(
            Authentication auth, @PathVariable Long packageId,
            @Valid @RequestBody SwapDriverRequest req) {
        return ResponseEntity.ok(agencyAssignmentService.swapDriver(auth.getName(), packageId, req));
    }

    /** GET /api/agency/packages/{id}/assign — get current assignment info */
    @GetMapping("/{packageId}/assign")
    public ResponseEntity<AssignmentResponse> getAssignment(
            Authentication auth, @PathVariable Long packageId) {
        return ResponseEntity.ok(agencyAssignmentService.getAssignment(auth.getName(), packageId));
    }

    /**
     * DELETE /api/agency/packages/{id}/assign/driver — remove driver from package.
     * force=true is required if the package is IN_TRANSIT.
     * Blocked entirely if DELIVERED or COMPLETED (audit lock).
     */
    @DeleteMapping("/{packageId}/assign/driver")
    public ResponseEntity<AssignmentResponse> removeDriver(
            Authentication auth, @PathVariable Long packageId,
            @RequestParam(defaultValue = "false") boolean force) {
        return ResponseEntity.ok(agencyAssignmentService.removeDriver(auth.getName(), packageId, force));
    }
}
