package com.agriconnect.admin.packagemanagement.service;

import com.agriconnect.admin.packagemanagement.dto.*;
import com.agriconnect.shared.entity.*;
import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.BookingStatus;
import com.agriconnect.shared.enums.PackageStatus;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPackageService {

    private final PackageRepository          packageRepository;
    private final PackageVegetableRepository pvRepository;
    private final BookingRepository          bookingRepository;

    // ── GET ALL PACKAGES ──────────────────────────────────
    public AdminPackageListResponse getAllPackages() {
        List<com.agriconnect.shared.entity.Package> all = packageRepository.findAll();

        Map<String, Long> byMarket = all.stream()
                .collect(Collectors.groupingBy(
                        com.agriconnect.shared.entity.Package::getMarketDestination,
                        Collectors.counting()));

        return AdminPackageListResponse.builder()
                .totalPackages((long) all.size())
                .openPackages(countByStatus(all, PackageStatus.OPEN))
                .fullPackages(countByStatus(all, PackageStatus.FULL))
                .inTransitPackages(countByStatus(all, PackageStatus.IN_TRANSIT))
                .deliveredPackages(countByStatus(all, PackageStatus.DELIVERED))
                .cancelledPackages(countByStatus(all, PackageStatus.CANCELLED))
                .packagesByMarket(byMarket)
                .packages(all.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    // ── GET PACKAGES BY STATUS ────────────────────────────
    public List<AdminPackageResponse> getByStatus(String status) {
        try {
            PackageStatus ps = PackageStatus.valueOf(status.toUpperCase());
            return packageRepository.findByStatus(ps)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid status: " + status +
                            ". Valid: OPEN, FULL, IN_TRANSIT, DELIVERED, CANCELLED");
        }
    }

    // ── GET PACKAGES BY MARKET ────────────────────────────
    public List<AdminPackageResponse> getByMarket(String market) {
        return packageRepository.findAll().stream()
                .filter(p -> p.getMarketDestination().equalsIgnoreCase(market))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET PACKAGES BY AGENCY ─────────────────────────────
    public List<AdminPackageResponse> getByAgent(Long agencyId) {
        return packageRepository.findByAgencyId(agencyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── GET SINGLE PACKAGE ────────────────────────────────
    public AdminPackageResponse getById(Long packageId) {
        com.agriconnect.shared.entity.Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Package not found with ID: " + packageId));
        return toResponse(pkg);
    }

    // ── FORCE CANCEL PACKAGE ──────────────────────────────
    @Transactional
    public AdminPackageResponse cancelPackage(Long packageId) {
        com.agriconnect.shared.entity.Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Package not found with ID: " + packageId));

        if (pkg.getStatus() == PackageStatus.CANCELLED)
            throw new IllegalArgumentException("Package is already cancelled.");

        pkg.setStatus(PackageStatus.CANCELLED);
        packageRepository.save(pkg);

        System.out.println(">>> Admin cancelled package: " + packageId);
        return toResponse(pkg);
    }

    // ── HELPERS ───────────────────────────────────────────
    private long countByStatus(List<com.agriconnect.shared.entity.Package> all, PackageStatus status) {
        return all.stream()
                .filter(p -> p.getStatus() == status)
                .count();
    }

    private AdminPackageResponse toResponse(com.agriconnect.shared.entity.Package pkg) {
        List<PackageVegetable> vegs = pvRepository.findByPkgId(pkg.getId());
        List<Booking> bookings      = bookingRepository.findByPkgId(pkg.getId());

        long completed = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();

        Double booked = pkg.getTotalCapacityKg() - pkg.getRemainingCapacityKg();
        Double pct    = pkg.getTotalCapacityKg() > 0
                ? (booked / pkg.getTotalCapacityKg()) * 100 : 0.0;

        return AdminPackageResponse.builder()
                .packageId(pkg.getId())
                .agentId(pkg.getAgency().getId())
                .agentName(pkg.getAgency().getUser().getName())
                .agentPhone(pkg.getAgency().getUser().getPhone())
                .marketDestination(pkg.getMarketDestination())
                .travelDateTime(pkg.getTravelDateTime())
                .pickupWindowStart(pkg.getPickupWindowStart())
                .pickupWindowEnd(pkg.getPickupWindowEnd())
                .vehicleType(pkg.getVehicleType())
                .vehicleNumber(pkg.getVehicleNumber())
                .totalCapacityKg(pkg.getTotalCapacityKg())
                .remainingCapacityKg(pkg.getRemainingCapacityKg())
                .bookedPercentage(Math.round(pct * 10.0) / 10.0)
                .status(pkg.getStatus().name())
                .totalBookings(bookings.size())
                .completedBookings((int) completed)
                .createdAt(pkg.getCreatedAt())
                .vegetables(vegs.stream().map(v ->
                                AdminPackageResponse.VegInfo.builder()
                                        .id(v.getId())
                                        .vegetableName(v.getVegetableName())
                                        .pricePerKg(v.getPricePerKg())
                                        .maxKg(v.getMaxKg())
                                        .remainingKg(v.getRemainingKg())
                                        .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
