package com.agriconnect.agency.vehicle.controller;

import com.agriconnect.agency.vehicle.dto.AddVehicleRequest;
import com.agriconnect.agency.vehicle.dto.UpdateVehicleRequest;
import com.agriconnect.agency.vehicle.dto.VehicleResponse;
import com.agriconnect.agency.vehicle.service.AgencyVehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agency/vehicles")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENCY')")
public class AgencyVehicleController {

    private final AgencyVehicleService agencyVehicleService;

    /** POST /api/agency/vehicles — add vehicle to fleet */
    @PostMapping
    public ResponseEntity<VehicleResponse> add(
            Authentication auth, @Valid @RequestBody AddVehicleRequest req) {
        return ResponseEntity.ok(agencyVehicleService.addVehicle(auth.getName(), req));
    }

    /** GET /api/agency/vehicles — list agency fleet */
    @GetMapping
    public ResponseEntity<List<VehicleResponse>> list(Authentication auth) {
        return ResponseEntity.ok(agencyVehicleService.listVehicles(auth.getName()));
    }

    /** PUT /api/agency/vehicles/{id} — update vehicle or set maintenance */
    @PutMapping("/{vehicleId}")
    public ResponseEntity<VehicleResponse> update(
            Authentication auth, @PathVariable Long vehicleId,
            @RequestBody UpdateVehicleRequest req) {
        return ResponseEntity.ok(agencyVehicleService.updateVehicle(auth.getName(), vehicleId, req));
    }

    /** DELETE /api/agency/vehicles/{id} — remove vehicle (blocked if ASSIGNED to active package) */
    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<String> remove(
            Authentication auth, @PathVariable Long vehicleId) {
        return ResponseEntity.ok(agencyVehicleService.removeVehicle(auth.getName(), vehicleId));
    }
}
