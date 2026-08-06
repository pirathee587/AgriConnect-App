package com.agriconnect.admin.revenue.controller;

import com.agriconnect.admin.revenue.dto.*;
import com.agriconnect.admin.revenue.service.AdminRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/revenue")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRevenueController {

    private final AdminRevenueService adminRevenueService;

    @GetMapping("/overview")
    public ResponseEntity<RevenueOverviewResponse> overview() {
        return ResponseEntity.ok(adminRevenueService.getOverview());
    }

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentEntryResponse>> allPayments() {
        return ResponseEntity.ok(adminRevenueService.getAllPayments());
    }

    @GetMapping("/payments/status/{status}")
    public ResponseEntity<List<PaymentEntryResponse>> paymentsByStatus(
            @PathVariable String status) {
        return ResponseEntity.ok(
                adminRevenueService.getPaymentsByStatus(status));
    }

    @GetMapping("/payments/agent/{agentId}")
    public ResponseEntity<List<PaymentEntryResponse>> paymentsByAgent(
            @PathVariable Long agentId) {
        return ResponseEntity.ok(
                adminRevenueService.getPaymentsByAgent(agentId));
    }
}
