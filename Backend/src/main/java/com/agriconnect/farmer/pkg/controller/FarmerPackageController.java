package com.agriconnect.farmer.pkg.controller;

import com.agriconnect.farmer.pkg.dto.*;
import com.agriconnect.farmer.pkg.service.FarmerPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/packages")
@RequiredArgsConstructor
public class FarmerPackageController {

    private final FarmerPackageService farmerPackageService;

    @GetMapping("/available")
    public ResponseEntity<List<FarmerPackageListResponse>> getAvailable() {
        return ResponseEntity.ok(farmerPackageService.getAllAvailable());
    }

    @GetMapping("/market/{market}")
    public ResponseEntity<List<FarmerPackageListResponse>> getByMarket(
            @PathVariable String market) {
        return ResponseEntity.ok(farmerPackageService.getByMarket(market));
    }

    @GetMapping("/{packageId}")
    public ResponseEntity<FarmerPackageDetailResponse> getDetail(
            @PathVariable Long packageId) {
        return ResponseEntity.ok(farmerPackageService.getById(packageId));
    }
}
