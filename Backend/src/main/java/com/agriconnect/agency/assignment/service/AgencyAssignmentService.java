package com.agriconnect.agency.assignment.service;

import com.agriconnect.agency.assignment.dto.AssignRequest;
import com.agriconnect.agency.assignment.dto.AssignmentResponse;
import com.agriconnect.agency.assignment.dto.SwapDriverRequest;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.*;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import com.agriconnect.shared.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgencyAssignmentService {

    private final PackageRepository   packageRepository;
    private final VehicleRepository   vehicleRepository;
    private final DriverRepository    driverRepository;
    private final AgencyRepository    agencyRepository;
    private final UserRepository      userRepository;
    private final NotificationService notificationService;

    private static final List<PackageStatus> ACTIVE_STATUSES =
            List.of(PackageStatus.OPEN, PackageStatus.FULL, PackageStatus.IN_TRANSIT);

    // ─────────────────────────────────────────────────────────────
    // Assign vehicle + optional driver to package
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public AssignmentResponse assignToPackage(String agencyPhone, Long packageId, AssignRequest req) {
        Agency agency = getAgency(agencyPhone);
        Package pkg   = getOwnedPackage(packageId, agency);

        // Validate & fetch vehicle
        Vehicle vehicle = vehicleRepository.findByIdAndAgencyId(req.getVehicleId(), agency.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found or does not belong to your agency."));

        if (vehicle.getAvailabilityStatus() != VehicleStatus.AVAILABLE)
            throw new IllegalArgumentException(
                    "Vehicle is not available. Current status: " + vehicle.getAvailabilityStatus());

        // Validate & fetch driver (optional)
        Driver driver = null;
        if (req.getDriverId() != null) {
            driver = driverRepository.findByIdAndAgencyId(req.getDriverId(), agency.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Driver not found or does not belong to your agency."));

            if (driver.getStatus() != DriverStatus.ACTIVE)
                throw new IllegalArgumentException(
                        "Driver is not active. Current status: " + driver.getStatus());

            // Check driver is not already on another active package
            if (packageRepository.existsByDriverIdAndStatusIn(driver.getId(), ACTIVE_STATUSES))
                throw new IllegalArgumentException(
                        "Driver is already assigned to an active package.");
        }

        // Apply assignment
        vehicle.setAvailabilityStatus(VehicleStatus.ASSIGNED);
        vehicleRepository.save(vehicle);

        pkg.setVehicle(vehicle);
        pkg.setDriver(driver);
        packageRepository.save(pkg);

        // Fire notifications
        if (driver != null) {
            notificationService.sendDriverAssigned(driver, vehicle, pkg, agency);
            if (driver.getNicStatus() == NicStatus.NIC_NOT_PROVIDED)
                notificationService.sendNicReminder(driver, agency);
        }

        return toResponse(pkg, vehicle, driver);
    }

    // ─────────────────────────────────────────────────────────────
    // Swap driver on existing assignment (PUT)
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public AssignmentResponse swapDriver(String agencyPhone, Long packageId, SwapDriverRequest req) {
        Agency agency = getAgency(agencyPhone);
        Package pkg   = getOwnedPackage(packageId, agency);

        if (pkg.getVehicle() == null)
            throw new IllegalArgumentException(
                    "No vehicle is assigned to this package yet. Use POST /assign first.");

        // Notify old driver before swap
        Driver oldDriver = pkg.getDriver();
        if (oldDriver != null)
            notificationService.sendDriverRemoved(oldDriver, pkg.getVehicle(), pkg, agency);

        // Validate new driver
        Driver newDriver = driverRepository.findByIdAndAgencyId(req.getDriverId(), agency.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "New driver not found or does not belong to your agency."));

        if (newDriver.getStatus() != DriverStatus.ACTIVE)
            throw new IllegalArgumentException(
                    "New driver is not active. Status: " + newDriver.getStatus());

        // Exclude current package from the active-package check (swap scenario)
        if (packageRepository.existsByDriverIdAndStatusInAndIdNot(
                newDriver.getId(), ACTIVE_STATUSES, packageId))
            throw new IllegalArgumentException(
                    "New driver is already assigned to another active package.");

        pkg.setDriver(newDriver);
        packageRepository.save(pkg);

        // Notify new driver
        notificationService.sendDriverAssigned(newDriver, pkg.getVehicle(), pkg, agency);
        if (newDriver.getNicStatus() == NicStatus.NIC_NOT_PROVIDED)
            notificationService.sendNicReminder(newDriver, agency);

        return toResponse(pkg, pkg.getVehicle(), newDriver);
    }

    // ─────────────────────────────────────────────────────────────
    // Get current assignment for a package
    // ─────────────────────────────────────────────────────────────

    public AssignmentResponse getAssignment(String agencyPhone, Long packageId) {
        Agency agency = getAgency(agencyPhone);
        Package pkg   = getOwnedPackage(packageId, agency);
        return toResponse(pkg, pkg.getVehicle(), pkg.getDriver());
    }

    // ─────────────────────────────────────────────────────────────
    // Remove driver from package (DELETE /assign/driver)
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public AssignmentResponse removeDriver(String agencyPhone, Long packageId, boolean force) {
        Agency agency = getAgency(agencyPhone);
        Package pkg   = getOwnedPackage(packageId, agency);

        // Audit-lock check — cannot remove from completed packages
        if (pkg.getStatus() == PackageStatus.DELIVERED)
            throw new IllegalArgumentException(
                    "Cannot remove driver from a completed package. Assignment is locked for audit.");

        // IN_TRANSIT requires explicit force=true from the frontend warning confirmation
        if (pkg.getStatus() == PackageStatus.IN_TRANSIT && !force)
            throw new IllegalArgumentException(
                    "Trip is in progress. Pass force=true to confirm driver removal.");

        Driver removedDriver = pkg.getDriver();
        Vehicle vehicle      = pkg.getVehicle();

        if (removedDriver == null)
            throw new IllegalArgumentException("No driver is currently assigned to this package.");

        // NULL the driver FK — this is the ONLY place driver is set to null (explicit remove only)
        pkg.setDriver(null);
        packageRepository.save(pkg);

        // Notify removed driver
        notificationService.sendDriverRemoved(removedDriver, vehicle, pkg, agency);

        return toResponse(pkg, vehicle, null);
    }

    // ─────────────────────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────────────────────

    private Agency getAgency(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return agencyRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Agency profile not found"));
    }

    private Package getOwnedPackage(Long packageId, Agency agency) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));
        if (!pkg.getAgency().getId().equals(agency.getId()))
            throw new IllegalArgumentException("This package does not belong to your agency.");
        return pkg;
    }

    private AssignmentResponse toResponse(Package pkg, Vehicle vehicle, Driver driver) {
        AssignmentResponse.AssignmentResponseBuilder b = AssignmentResponse.builder()
                .packageId(pkg.getId())
                .assignedAt(LocalDateTime.now());

        if (vehicle != null) {
            String typeLabel = switch (vehicle.getVehicleType()) {
                case LORRY      -> "Lorry";
                case TRUCK      -> "Truck";
                case MINI_TRUCK -> "Mini Truck";
                case VAN        -> "Van";
                case PICKUP     -> "Pickup";
            };
            b.vehicleId(vehicle.getId())
             .vehicleType(vehicle.getVehicleType())
             .vehicleTypeLabel(typeLabel)
             .plateNumber(vehicle.getPlateNumber())
             .capacityKg(vehicle.getCapacityKg())
             .vehicleStatus(vehicle.getAvailabilityStatus());
        }

        if (driver != null) {
            String nicLabel = switch (driver.getNicStatus()) {
                case NIC_PROVIDED     -> "NIC Provided";
                case NIC_NOT_PROVIDED -> "NIC Not Yet Provided";
            };
            b.driverId(driver.getId())
             .driverName(driver.getFullName())
             .driverPhone(driver.getPhone())
             .driverLicenceClass(driver.getLicenceClass())
             .nicStatus(driver.getNicStatus())
             .nicStatusLabel(nicLabel);
        }

        return b.build();
    }
}
