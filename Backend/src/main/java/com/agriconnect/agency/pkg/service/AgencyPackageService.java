package com.agriconnect.agency.pkg.service;

import com.agriconnect.agency.pkg.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.*;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgencyPackageService {

    private final PackageRepository          packageRepository;
    private final PackageVegetableRepository pvRepository;
    private final AgencyRepository           agencyRepository;
    private final BookingRepository          bookingRepository;
    private final UserRepository             userRepository;
    private final VehicleRepository          vehicleRepository;
    private final DriverRepository           driverRepository;
    private final com.agriconnect.shared.service.NotificationService notificationService;
    private final SimpMessagingTemplate      ws;

    @Transactional
    public AgencyPackageResponse createPackage(String phone, CreatePackageRequest req) {
        Agency agency = getAgency(phone);

        if (agency.getStatus() != AgencyStatus.ACTIVE)
            throw new IllegalArgumentException(
                    "Only active agencies can create packages. Your status: " + agency.getStatus());

        Vehicle vehicle = null;
        if (req.getVehicleId() != null) {
            vehicle = vehicleRepository.findByIdAndAgencyId(req.getVehicleId(), agency.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found."));
            if (vehicle.getAvailabilityStatus() != VehicleStatus.AVAILABLE) {
                throw new IllegalArgumentException("Selected vehicle is not available.");
            }
            vehicle.setAvailabilityStatus(VehicleStatus.ASSIGNED);
            vehicleRepository.save(vehicle);
        }

        Driver driver = null;
        if (req.getDriverId() != null) {
            driver = driverRepository.findByIdAndAgencyId(req.getDriverId(), agency.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found."));
            if (driver.getStatus() != DriverStatus.ACTIVE) {
                throw new IllegalArgumentException("Selected driver is not active.");
            }
            // Check driver not on another active package
            boolean activelyAssigned = packageRepository.existsByDriverIdAndStatusIn(
                    driver.getId(), List.of(PackageStatus.OPEN, PackageStatus.FULL, PackageStatus.IN_TRANSIT));
            if (activelyAssigned) {
                throw new IllegalArgumentException("Selected driver is already assigned to an active package.");
            }
        }

        com.agriconnect.shared.entity.Package pkg =
                packageRepository.save(com.agriconnect.shared.entity.Package.builder()
                        .agency(agency)
                        .marketDestination(req.getMarketDestination())
                        .travelDateTime(req.getTravelDateTime())
                        .pickupWindowStart(req.getPickupWindowStart())
                        .pickupWindowEnd(req.getPickupWindowEnd())
                        .vehicleType(req.getVehicleType())
                        .vehicleNumber(req.getVehicleNumber())
                        .vehicle(vehicle)
                        .driver(driver)
                        .totalCapacityKg(req.getTotalCapacityKg())
                        .remainingCapacityKg(req.getTotalCapacityKg())
                        .status(PackageStatus.OPEN)
                        .build());

        List<PackageVegetable> vegs = req.getVegetables().stream().map(v ->
                PackageVegetable.builder()
                        .pkg(pkg)
                        .vegetableName(v.getVegetableName())
                        .pricePerKg(v.getPricePerKg())
                        .maxKg(v.getMaxKg())
                        .remainingKg(v.getMaxKg())
                        .build()
        ).collect(Collectors.toList());

        pvRepository.saveAll(vegs);

        // Fire notifications if driver is assigned
        if (driver != null && vehicle != null) {
            notificationService.sendDriverAssigned(driver, vehicle, pkg, agency);
            if (driver.getNicStatus() == NicStatus.NIC_NOT_PROVIDED) {
                notificationService.sendNicReminder(driver, agency);
            }
        }

        return toResponse(pkg, vegs);
    }

    public List<AgencyPackageResponse> getMyPackages(String phone) {
        Agency agency = getAgency(phone);
        return packageRepository.findByAgencyId(agency.getId())
                .stream()
                .map(p -> toResponse(p, pvRepository.findByPkgId(p.getId())))
                .collect(Collectors.toList());
    }

    public AgencyPackageResponse getPackageById(String phone, Long packageId) {
        Agency agency = getAgency(phone);
        com.agriconnect.shared.entity.Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));

        if (!pkg.getAgency().getId().equals(agency.getId()))
            throw new IllegalArgumentException("This package does not belong to you.");

        return toResponse(pkg, pvRepository.findByPkgId(pkg.getId()));
    }

    @Transactional
    public String updatePrice(String phone, UpdatePriceRequest req) {
        Agency agency = getAgency(phone);

        PackageVegetable pv = pvRepository.findById(req.getPackageVegetableId())
                .orElseThrow(() -> new ResourceNotFoundException("Vegetable entry not found"));

        if (!pv.getPkg().getAgency().getId().equals(agency.getId()))
            throw new IllegalArgumentException(
                    "This vegetable entry does not belong to your package.");

        Double oldPrice = pv.getPricePerKg();
        pv.setPricePerKg(req.getNewPricePerKg());
        pvRepository.save(pv);

        ws.convertAndSend("/topic/price-update/" + pv.getPkg().getId(),
                Map.of(
                        "packageId",     pv.getPkg().getId(),
                        "vegetableId",   pv.getId(),
                        "vegetableName", pv.getVegetableName(),
                        "oldPrice",      oldPrice,
                        "newPrice",      req.getNewPricePerKg(),
                        "updatedAt",     LocalDateTime.now().toString()
                ));

        return "Price updated from LKR " + oldPrice + " to LKR " + req.getNewPricePerKg() + " per kg.";
    }

    @Transactional
    public AgencyPackageResponse updateStatus(String phone, Long packageId,
                                              UpdatePackageStatusRequest req) {
        Agency agency = getAgency(phone);
        com.agriconnect.shared.entity.Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));

        if (!pkg.getAgency().getId().equals(agency.getId()))
            throw new IllegalArgumentException("This package does not belong to you.");

        try {
            PackageStatus newStatus = PackageStatus.valueOf(req.getStatus().toUpperCase());
            pkg.setStatus(newStatus);

            // Release vehicle back to AVAILABLE when trip is complete
            // Note: driver FK is intentionally NOT nulled here — preserved for audit trail
            if (newStatus == PackageStatus.DELIVERED
                    && pkg.getVehicle() != null) {
                pkg.getVehicle().setAvailabilityStatus(VehicleStatus.AVAILABLE);
                vehicleRepository.save(pkg.getVehicle());
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid status: " + req.getStatus() + ". Valid values: IN_TRANSIT, DELIVERED, CANCELLED");
        }

        packageRepository.save(pkg);
        return toResponse(pkg, pvRepository.findByPkgId(pkg.getId()));
    }

    @Transactional
    public String cancelPackage(String phone, Long packageId) {
        Agency agency = getAgency(phone);
        com.agriconnect.shared.entity.Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException("Package not found"));

        if (!pkg.getAgency().getId().equals(agency.getId()))
            throw new IllegalArgumentException("This package does not belong to you.");

        if (pkg.getStatus() == PackageStatus.IN_TRANSIT || pkg.getStatus() == PackageStatus.DELIVERED)
            throw new IllegalArgumentException("Cannot cancel a package that is " + pkg.getStatus());

        pkg.setStatus(PackageStatus.CANCELLED);
        packageRepository.save(pkg);
        return "Package cancelled successfully.";
    }

    private Agency getAgency(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return agencyRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Agency profile not found"));
    }

    private AgencyPackageResponse toResponse(com.agriconnect.shared.entity.Package pkg,
                                             List<PackageVegetable> vegs) {
        List<Booking> bookings = bookingRepository.findByPkgId(pkg.getId());
        long confirmed = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED ||
                        b.getStatus() == BookingStatus.AGENT_APPROVED)
                .count();

        return AgencyPackageResponse.builder()
                .packageId(pkg.getId())
                .marketDestination(pkg.getMarketDestination())
                .travelDateTime(pkg.getTravelDateTime())
                .pickupWindowStart(pkg.getPickupWindowStart())
                .pickupWindowEnd(pkg.getPickupWindowEnd())
                // Legacy free-text fields
                .vehicleType(pkg.getVehicleType())
                .vehicleNumber(pkg.getVehicleNumber())
                // Fleet vehicle fields
                .vehicleId(pkg.getVehicle() != null ? pkg.getVehicle().getId() : null)
                .vehicleTypeEnum(pkg.getVehicle() != null ? pkg.getVehicle().getVehicleType() : null)
                .vehicleTypeLabel(pkg.getVehicle() != null ? pkg.getVehicle().getVehicleType().name() : null)
                .plateNumber(pkg.getVehicle() != null ? pkg.getVehicle().getPlateNumber() : null)
                .capacityKg(pkg.getVehicle() != null ? pkg.getVehicle().getCapacityKg() : null)
                .vehicleStatus(pkg.getVehicle() != null ? pkg.getVehicle().getAvailabilityStatus() : null)
                // Driver fields (preserved even on DELIVERED/COMPLETED for audit)
                .driverId(pkg.getDriver() != null ? pkg.getDriver().getId() : null)
                .driverName(pkg.getDriver() != null ? pkg.getDriver().getFullName() : null)
                .driverPhone(pkg.getDriver() != null ? pkg.getDriver().getPhone() : null)
                .nicStatus(pkg.getDriver() != null ? pkg.getDriver().getNicStatus() : null)
                .nicStatusLabel(pkg.getDriver() != null
                        ? (pkg.getDriver().getNicStatus() == NicStatus.NIC_PROVIDED
                            ? "NIC Provided" : "NIC Not Yet Provided")
                        : null)
                .totalCapacityKg(pkg.getTotalCapacityKg())
                .remainingCapacityKg(pkg.getRemainingCapacityKg())
                .status(pkg.getStatus().name())
                .totalBookings(bookings.size())
                .confirmedBookings((int) confirmed)
                .vegetables(vegs.stream().map(v ->
                                AgencyPackageResponse.VegetableInfo.builder()
                                        .id(v.getId())
                                        .vegetableName(v.getVegetableName())
                                        .pricePerKg(v.getPricePerKg())
                                        .maxKg(v.getMaxKg())
                                        .remainingKg(v.getRemainingKg())
                                        .priceUpdatedAt(v.getPriceUpdatedAt())
                                        .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
