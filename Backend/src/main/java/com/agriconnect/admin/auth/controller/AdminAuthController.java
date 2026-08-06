package com.agriconnect.admin.auth.controller;

import com.agriconnect.admin.auth.dto.*;
import com.agriconnect.admin.auth.service.AdminAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    @PostMapping("/login")
    public ResponseEntity<AdminAuthResponse> login(
            @Valid @RequestBody AdminLoginRequest req) {
        return ResponseEntity.ok(adminAuthService.login(req));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody AdminRegisterRequest req) {
        return ResponseEntity.ok(adminAuthService.createAdmin(
                req.getName(), req.getPhone(), req.getPassword(), req.getEmail()));
    }
}