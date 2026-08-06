package com.agriconnect.agency.payment.controller;

import com.agriconnect.agency.payment.dto.*;
import com.agriconnect.agency.payment.service.AgencyPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agency/payment")
@RequiredArgsConstructor
public class AgencyPaymentController {

    private final AgencyPaymentService agencyPaymentService;

    @PostMapping("/initiate")
    @PreAuthorize("hasRole('AGENCY')")
    public ResponseEntity<AgencyPaymentInitiateResponse> initiate(Authentication auth) {
        return ResponseEntity.ok(agencyPaymentService.initiateActivationPayment(auth.getName()));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestParam Map<String, String> payload) {
        agencyPaymentService.handleWebhook(payload);
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('AGENCY')")
    public ResponseEntity<List<AgencyPaymentHistoryResponse>> history(Authentication auth) {
        return ResponseEntity.ok(agencyPaymentService.getMyPayments(auth.getName()));
    }
}
