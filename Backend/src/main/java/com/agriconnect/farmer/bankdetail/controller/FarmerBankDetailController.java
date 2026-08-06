package com.agriconnect.farmer.bankdetail.controller;

import com.agriconnect.farmer.bankdetail.dto.*;
import com.agriconnect.farmer.bankdetail.service.FarmerBankDetailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/bank-details")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerBankDetailController {

    private final FarmerBankDetailService farmerBankDetailService;

    @GetMapping
    public ResponseEntity<BankDetailResponse> get(Authentication auth) {
        return ResponseEntity.ok(farmerBankDetailService.get(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<BankDetailResponse> saveOrUpdate(
            Authentication auth,
            @Valid @RequestBody BankDetailRequest req) {
        return ResponseEntity.ok(farmerBankDetailService.saveOrUpdate(auth.getName(), req));
    }

    @DeleteMapping
    public ResponseEntity<String> delete(Authentication auth) {
        return ResponseEntity.ok(farmerBankDetailService.delete(auth.getName()));
    }
}