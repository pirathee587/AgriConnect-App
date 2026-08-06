package com.agriconnect.agency.auth.controller;

import com.agriconnect.agency.auth.dto.*;
import com.agriconnect.agency.auth.service.AgencyAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/agency/auth")
@RequiredArgsConstructor
public class AgencyAuthController {

    private final AgencyAuthService agencyAuthService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> register(
            @RequestParam String name,
            @RequestParam String phone,
            @RequestParam String password,
            @RequestParam(required = false) String email,
            @RequestParam String nicNumber,
            @RequestParam String address,
            @RequestParam(required = false) String bankName,
            @RequestParam(required = false) String accountNumber,
            @RequestParam(required = false) String accountHolderName,
            @RequestParam(required = false) MultipartFile nicFront,
            @RequestParam(required = false) MultipartFile nicBack) throws java.io.IOException {
        return ResponseEntity.ok(agencyAuthService.registerWithNic(
                name, phone, password, email, nicNumber, address,
                bankName, accountNumber, accountHolderName, nicFront, nicBack));
    }

    @PostMapping("/login")
    public ResponseEntity<AgencyAuthResponse> login(
            @Valid @RequestBody AgencyLoginRequest req) {
        return ResponseEntity.ok(agencyAuthService.login(req));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @Valid @RequestBody AgencyOtpVerifyRequest req) {
        return ResponseEntity.ok(agencyAuthService.verifyOtp(req));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@RequestParam String phone) {
        return ResponseEntity.ok(agencyAuthService.resendOtp(phone));
    }
}
