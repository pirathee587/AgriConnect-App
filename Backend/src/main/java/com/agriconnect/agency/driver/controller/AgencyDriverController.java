package com.agriconnect.agency.driver.controller;

import com.agriconnect.agency.driver.dto.AddDriverRequest;
import com.agriconnect.agency.driver.dto.DriverResponse;
import com.agriconnect.agency.driver.dto.UpdateDriverRequest;
import com.agriconnect.agency.driver.service.AgencyDriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agency/drivers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('AGENCY')")
public class AgencyDriverController {

    private final AgencyDriverService agencyDriverService;

    /** POST /api/agency/drivers — register new driver (agency auto-bound from JWT) */
    @PostMapping
    public ResponseEntity<DriverResponse> register(
            Authentication auth, @Valid @RequestBody AddDriverRequest req) {
        return ResponseEntity.ok(agencyDriverService.registerDriver(auth.getName(), req));
    }

    /** GET /api/agency/drivers — list all drivers for this agency */
    @GetMapping
    public ResponseEntity<List<DriverResponse>> list(Authentication auth) {
        return ResponseEntity.ok(agencyDriverService.listDrivers(auth.getName()));
    }

    /** GET /api/agency/drivers/{id} — get driver detail */
    @GetMapping("/{driverId}")
    public ResponseEntity<DriverResponse> get(
            Authentication auth, @PathVariable Long driverId) {
        return ResponseEntity.ok(agencyDriverService.getDriver(auth.getName(), driverId));
    }

    /** PUT /api/agency/drivers/{id} — update driver info or NIC status */
    @PutMapping("/{driverId}")
    public ResponseEntity<DriverResponse> update(
            Authentication auth, @PathVariable Long driverId,
            @RequestBody UpdateDriverRequest req) {
        return ResponseEntity.ok(agencyDriverService.updateDriver(auth.getName(), driverId, req));
    }

    /** DELETE /api/agency/drivers/{id} — deactivate driver (soft-delete) */
    @DeleteMapping("/{driverId}")
    public ResponseEntity<String> deactivate(
            Authentication auth, @PathVariable Long driverId) {
        return ResponseEntity.ok(agencyDriverService.deactivateDriver(auth.getName(), driverId));
    }

    /** POST /api/agency/drivers/{id}/notify-nic — manually trigger NIC reminder */
    @PostMapping("/{driverId}/notify-nic")
    public ResponseEntity<String> notifyNic(
            Authentication auth, @PathVariable Long driverId) {
        return ResponseEntity.ok(agencyDriverService.sendNicReminder(auth.getName(), driverId));
    }
}
