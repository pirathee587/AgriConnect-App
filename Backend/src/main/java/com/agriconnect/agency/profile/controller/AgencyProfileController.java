package com.agriconnect.agency.profile.controller;

import com.agriconnect.agency.profile.dto.*;
import com.agriconnect.agency.profile.service.AgencyProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/agency/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENCY')")
public class AgencyProfileController {

    private final AgencyProfileService agencyProfileService;

    @GetMapping
    public ResponseEntity<AgencyProfileResponse> getProfile(Authentication auth) {
        return ResponseEntity.ok(agencyProfileService.getProfile(auth.getName()));
    }

    @PutMapping
    public ResponseEntity<AgencyProfileResponse> updateProfile(
            Authentication auth, @Valid @RequestBody UpdateAgencyProfileRequest req) {
        return ResponseEntity.ok(agencyProfileService.updateProfile(auth.getName(), req));
    }

    @PostMapping("/upload-nic")
    public ResponseEntity<NicUploadResponse> uploadNic(
            Authentication auth,
            @RequestParam("nicFront") MultipartFile nicFront,
            @RequestParam("nicBack")  MultipartFile nicBack) throws IOException {
        return ResponseEntity.ok(agencyProfileService.uploadNic(auth.getName(), nicFront, nicBack));
    }
}
