package com.agriconnect.agency.vehicle.service;

import com.agriconnect.agency.vehicle.dto.AddVehicleRequest;
import com.agriconnect.agency.vehicle.dto.UpdateVehicleRequest;
import com.agriconnect.agency.vehicle.dto.VehicleResponse;
import com.agriconnect.shared.entity.Agency;
import com.agriconnect.shared.entity.User;
import com.agriconnect.shared.entity.Vehicle;
import com.agriconnect.shared.enums.AgencyStatus;
import com.agriconnect.shared.enums.PackageStatus;
import com.agriconnect.shared.enums.VehicleStatus;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.AgencyRepository;
import com.agriconnect.shared.repository.PackageRepository;
import com.agriconnect.shared.repository.UserRepository;
import com.agriconnect.shared.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgencyVehicleService {

    private final VehicleRepository vehicleRepository;
    private final AgencyRepository  agencyRepository;
    private final UserRepository    userRepository;
    private final PackageRepository packageRepository;

    // ─────────────────────────────────────────────
    // Add vehicle to fleet
    // ─────────────────────────────────────────────

    @Transactional
    public VehicleResponse addVehicle(String agencyPhone, AddVehicleRequest req) {
        Agency agency = getAgency(agencyPhone);

        if (agency.getStatus() != AgencyStatus.ACTIVE)
            throw new IllegalArgumentException(
                    "Only ACTIVE agencies can register vehicles. Your status: " + agency.getStatus());

        // System-wide plate uniqueness check
        if (vehicleRepository.existsByPlateNumber(req.getPlateNumber()))
            throw new IllegalArgumentException(
                    "Plate number '" + req.getPlateNumber() + "' is already registered in the system.");

        Vehicle vehicle = Vehicle.builder()
                .agency(agency)
                .vehicleType(req.getVehicleType())
                .plateNumber(req.getPlateNumber().toUpperCase().trim())
                .capacityKg(req.getCapacityKg())
                .availabilityStatus(VehicleStatus.AVAILABLE)
                .build();

        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    // ─────────────────────────────────────────────
    // List agency fleet
    // ─────────────────────────────────────────────

    public List<VehicleResponse> listVehicles(String agencyPhone) {
        Agency agency = getAgency(agencyPhone);
        return vehicleRepository.findAllByAgencyId(agency.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // Update vehicle
    // ─────────────────────────────────────────────

    @Transactional
    public VehicleResponse updateVehicle(String agencyPhone, Long vehicleId, UpdateVehicleRequest req) {
        Agency agency = getAgency(agencyPhone);
        Vehicle vehicle = vehicleRepository.findByIdAndAgencyId(vehicleId, agency.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found or does not belong to your agency."));

        if (req.getVehicleType() != null) vehicle.setVehicleType(req.getVehicleType());
        if (req.getCapacityKg()  != null) vehicle.setCapacityKg(req.getCapacityKg());

        if (req.getAvailabilityStatus() != null) {
            // Guard: agency cannot manually set ASSIGNED — only the assignment service does that
            if (req.getAvailabilityStatus() == VehicleStatus.ASSIGNED)
                throw new IllegalArgumentException(
                        "Cannot manually set vehicle status to ASSIGNED. Use the package assignment flow.");
            vehicle.setAvailabilityStatus(req.getAvailabilityStatus());
        }

        vehicle = vehicleRepository.save(vehicle);
        return toResponse(vehicle);
    }

    // ─────────────────────────────────────────────
    // Remove vehicle from fleet
    // ─────────────────────────────────────────────

    @Transactional
    public String removeVehicle(String agencyPhone, Long vehicleId) {
        Agency agency = getAgency(agencyPhone);
        Vehicle vehicle = vehicleRepository.findByIdAndAgencyId(vehicleId, agency.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found or does not belong to your agency."));

        // Block removal if vehicle is assigned to any OPEN or IN_TRANSIT package
        boolean activelyAssigned = packageRepository.existsByVehicleIdAndStatusIn(
                vehicleId, List.of(PackageStatus.OPEN, PackageStatus.FULL, PackageStatus.IN_TRANSIT));

        if (activelyAssigned)
            throw new IllegalStateException(
                    "Vehicle is currently assigned to an active package and cannot be removed.");

        vehicleRepository.delete(vehicle);
        return "Vehicle " + vehicle.getPlateNumber() + " removed from your fleet.";
    }

    // ─────────────────────────────────────────────
    // Internal helpers
    // ─────────────────────────────────────────────

    private Agency getAgency(String phone) {
        User user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return agencyRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Agency profile not found"));
    }

    public VehicleResponse toResponse(Vehicle v) {
        String typeLabel = switch (v.getVehicleType()) {
            case LORRY      -> "Lorry";
            case TRUCK      -> "Truck";
            case MINI_TRUCK -> "Mini Truck";
            case VAN        -> "Van";
            case PICKUP     -> "Pickup";
        };
        String availLabel = switch (v.getAvailabilityStatus()) {
            case AVAILABLE         -> "Available";
            case ASSIGNED          -> "Assigned";
            case UNDER_MAINTENANCE -> "Under Maintenance";
        };
        return VehicleResponse.builder()
                .vehicleId(v.getId())
                .agencyId(v.getAgency().getId())
                .agencyName(v.getAgency().getUser().getName())
                .vehicleType(v.getVehicleType())
                .vehicleTypeLabel(typeLabel)
                .plateNumber(v.getPlateNumber())
                .capacityKg(v.getCapacityKg())
                .availabilityStatus(v.getAvailabilityStatus())
                .availabilityLabel(availLabel)
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }
}
