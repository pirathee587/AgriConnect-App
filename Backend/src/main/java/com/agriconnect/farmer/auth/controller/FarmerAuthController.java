package com.agriconnect.farmer.auth.controller;

import com.agriconnect.farmer.auth.dto.*;
import com.agriconnect.farmer.auth.service.FarmerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/auth")
@RequiredArgsConstructor
public class FarmerAuthController {

    private final FarmerAuthService farmerAuthService;

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody FarmerRegisterRequest req) {
        return ResponseEntity.ok(farmerAuthService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<FarmerAuthResponse> login(
            @Valid @RequestBody FarmerLoginRequest req) {
        return ResponseEntity.ok(farmerAuthService.login(req));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @Valid @RequestBody FarmerOtpVerifyRequest req) {
        return ResponseEntity.ok(farmerAuthService.verifyOtp(req));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestParam String phone) {
        return ResponseEntity.ok(farmerAuthService.resendOtp(phone));
    }
}