package com.agriconnect.admin.driverregistry.service;

import com.agriconnect.agency.driver.dto.DriverResponse;
import com.agriconnect.agency.driver.service.AgencyDriverService;
import com.agriconnect.agency.vehicle.dto.VehicleResponse;
import com.agriconnect.agency.vehicle.service.AgencyVehicleService;
import com.agriconnect.shared.entity.Driver;
import com.agriconnect.shared.entity.Vehicle;
import com.agriconnect.shared.enums.DriverStatus;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.DriverRepository;
import com.agriconnect.shared.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDriverService {

    private final DriverRepository    driverRepository;
    private final VehicleRepository   vehicleRepository;
    private final AgencyDriverService agencyDriverService;   // reuses toResponse()
    private final AgencyVehicleService agencyVehicleService; // reuses toResponse()

    /** GET /api/admin/drivers — all drivers system-wide */
    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll()
                .stream()
                .map(agencyDriverService::toResponse)
                .collect(Collectors.toList());
    }

    /** GET /api/admin/vehicles — all vehicles system-wide */
    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(agencyVehicleService::toResponse)
                .collect(Collectors.toList());
    }

    /** PATCH /api/admin/drivers/{id}/suspend — suspend a specific driver */
    @Transactional
    public DriverResponse suspendDriver(Long driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));
        driver.setStatus(DriverStatus.SUSPENDED);
        driver = driverRepository.save(driver);
        return agencyDriverService.toResponse(driver);
    }

    /** Count helpers for AdminDashboard stats cards */
    public long countDrivers()  { return driverRepository.count(); }
    public long countVehicles() { return vehicleRepository.count(); }
}
