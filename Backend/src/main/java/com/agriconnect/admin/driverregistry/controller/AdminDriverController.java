package com.agriconnect.admin.driverregistry.controller;

import com.agriconnect.admin.driverregistry.service.AdminDriverService;
import com.agriconnect.agency.driver.dto.DriverResponse;
import com.agriconnect.agency.vehicle.dto.VehicleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDriverController {

    private final AdminDriverService adminDriverService;

    /** GET /api/admin/drivers — all drivers system-wide */
    @GetMapping("/api/admin/drivers")
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        return ResponseEntity.ok(adminDriverService.getAllDrivers());
    }

    /** PATCH /api/admin/drivers/{id}/suspend — suspend specific driver */
    @PatchMapping("/api/admin/drivers/{driverId}/suspend")
    public ResponseEntity<DriverResponse> suspendDriver(@PathVariable Long driverId) {
        return ResponseEntity.ok(adminDriverService.suspendDriver(driverId));
    }

    /** GET /api/admin/vehicles — all vehicles system-wide */
    @GetMapping("/api/admin/vehicles")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        return ResponseEntity.ok(adminDriverService.getAllVehicles());
    }

    /** GET /api/admin/driver-stats — driver and vehicle counts for dashboard */
    @GetMapping("/api/admin/driver-stats")
    public ResponseEntity<Map<String, Long>> getDriverStats() {
        return ResponseEntity.ok(Map.of(
                "totalDrivers",  adminDriverService.countDrivers(),
                "totalVehicles", adminDriverService.countVehicles()
        ));
    }
}
