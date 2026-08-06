package com.agriconnect.admin.packagemanagement.controller;

import com.agriconnect.admin.packagemanagement.dto.*;
import com.agriconnect.admin.packagemanagement.service.AdminPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/packages")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPackageController {

    private final AdminPackageService adminPackageService;

    @GetMapping
    public ResponseEntity<AdminPackageListResponse> getAll() {
        return ResponseEntity.ok(adminPackageService.getAllPackages());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AdminPackageResponse>> getByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(adminPackageService.getByStatus(status));
    }

    @GetMapping("/market/{market}")
    public ResponseEntity<List<AdminPackageResponse>> getByMarket(
            @PathVariable String market) {
        return ResponseEntity.ok(adminPackageService.getByMarket(market));
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<List<AdminPackageResponse>> getByAgent(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(adminPackageService.getByAgent(agentId));
    }

    @GetMapping("/{packageId}")
    public ResponseEntity<AdminPackageResponse> getById(
            @PathVariable Long packageId) {
        return ResponseEntity.ok(adminPackageService.getById(packageId));
    }

    @PostMapping("/{packageId}/cancel")
    public ResponseEntity<AdminPackageResponse> cancel(
            @PathVariable Long packageId) {
        return ResponseEntity.ok(adminPackageService.cancelPackage(packageId));
    }
}
