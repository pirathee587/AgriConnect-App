package com.agriconnect.farmer.rating.controller;

import com.agriconnect.farmer.rating.dto.*;
import com.agriconnect.farmer.rating.service.FarmerRatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer/ratings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerRatingController {

    private final FarmerRatingService farmerRatingService;

    @PostMapping
    public ResponseEntity<RatingResponse> submit(
            Authentication auth,
            @Valid @RequestBody RatingRequest req) {
        return ResponseEntity.ok(farmerRatingService.submit(auth.getName(), req));
    }

    @GetMapping
    public ResponseEntity<List<RatingResponse>> myRatings(Authentication auth) {
        return ResponseEntity.ok(farmerRatingService.getMyRatings(auth.getName()));
    }
}
