package com.agriconnect.farmer.profile.controller;

import com.agriconnect.farmer.profile.dto.*;
import com.agriconnect.farmer.profile.service.FarmerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerProfileController {

    private final FarmerProfileService farmerProfileService;

    @GetMapping
    public ResponseEntity<FarmerProfileResponse> getProfile(Authentication auth) {
        return ResponseEntity.ok(farmerProfileService.getProfile(auth.getName()));
    }

    @PutMapping
    public ResponseEntity<FarmerProfileResponse> updateProfile(
            Authentication auth,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(farmerProfileService.updateProfile(auth.getName(), req));
    }

    @PostMapping("/picture")
    public ResponseEntity<FarmerProfileResponse> uploadPicture(
            Authentication auth,
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        return ResponseEntity.ok(farmerProfileService.uploadProfilePicture(auth.getName(), file));
    }

    @PostMapping("/password")
    public ResponseEntity<String> changePassword(
            Authentication auth,
            @Valid @RequestBody ChangePasswordRequest req) {
        farmerProfileService.changePassword(auth.getName(), req);
        return ResponseEntity.ok("Password updated successfully");
    }
}