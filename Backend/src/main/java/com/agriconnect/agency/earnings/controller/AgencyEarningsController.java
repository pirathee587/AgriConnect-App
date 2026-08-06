package com.agriconnect.agency.earnings.controller;

import com.agriconnect.agency.earnings.dto.AgencyEarningsResponse;
import com.agriconnect.agency.earnings.service.AgencyEarningsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agency/earnings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENCY')")
public class AgencyEarningsController {

    private final AgencyEarningsService agencyEarningsService;

    @GetMapping
    public ResponseEntity<AgencyEarningsResponse> getEarnings(Authentication auth) {
        return ResponseEntity.ok(agencyEarningsService.getEarnings(auth.getName()));
    }
}
