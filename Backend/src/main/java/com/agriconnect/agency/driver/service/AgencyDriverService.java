package com.agriconnect.agency.driver.service;

import com.agriconnect.agency.driver.dto.AddDriverRequest;
import com.agriconnect.agency.driver.dto.DriverResponse;
import com.agriconnect.agency.driver.dto.UpdateDriverRequest;
import com.agriconnect.shared.entity.Agency;
import com.agriconnect.shared.entity.Driver;
import com.agriconnect.shared.entity.User;
import com.agriconnect.shared.enums.AgencyStatus;
import com.agriconnect.shared.enums.DriverStatus;
import com.agriconnect.shared.enums.NicStatus;
import com.agriconnect.shared.exception.ResourceNotFoundException;
import com.agriconnect.shared.repository.AgencyRepository;
import com.agriconnect.shared.repository.DriverRepository;
import com.agriconnect.shared.repository.UserRepository;
import com.agriconnect.shared.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgencyDriverService {

    private final DriverRepository     driverRepository;
    private final AgencyRepository     agencyRepository;
    private final UserRepository       userRepository;
    private final NotificationService  notificationService;

    // ─────────────────────────────────────────────
    // Register new driver
    // ─────────────────────────────────────────────

    @Transactional
    public DriverResponse registerDriver(String agencyPhone, AddDriverRequest req) {
        Agency agency = getAgency(agencyPhone);

        if (agency.getStatus() != AgencyStatus.ACTIVE)
            throw new IllegalArgumentException(
                    "Only ACTIVE agencies can register drivers. Your status: " + agency.getStatus());

        Driver driver = Driver.builder()
                .agency(agency)
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .licenceNumber(req.getLicenceNumber())
                .licenceClass(req.getLicenceClass())
                .nicStatus(req.getNicStatus() != null ? req.getNicStatus() : NicStatus.NIC_NOT_PROVIDED)
                .status(DriverStatus.ACTIVE)
                .build();

        driver = driverRepository.save(driver);

        // Fire Driver Approved notification immediately after save
        notificationService.sendDriverApproved(driver, agency);

        return toResponse(driver);
    }

    // ─────────────────────────────────────────────
    // List all drivers for this agency
    // ─────────────────────────────────────────────

    public List<DriverResponse> listDrivers(String agencyPhone) {
        Agency agency = getAgency(agencyPhone);
        return driverRepository.findAllByAgencyId(agency.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────
    // Get single driver
    // ─────────────────────────────────────────────

    public DriverResponse getDriver(String agencyPhone, Long driverId) {
        Agency agency = getAgency(agencyPhone);
        Driver driver = driverRepository.findByIdAndAgencyId(driverId, agency.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Driver not found or does not belong to your agency."));
        return toResponse(driver);
    }

    // ─────────────────────────────────────────────
    // Update driver info / NIC status
    // ─────────────────────────────────────────────

    @Transactional
    public DriverResponse updateDriver(String agencyPhone, Long driverId, UpdateDriverRequest req) {
        Agency agency = getAgency(agencyPhone);
        Driver driver = driverRepository.findByIdAndAgencyId(driverId, agency.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Driver not found or does not belong to your agency."));

        // Apply non-null updates
        if (req.getFullName()      != null) driver.setFullName(req.getFullName());
        if (req.getPhone()         != null) driver.setPhone(req.getPhone());
        if (req.getEmail()         != null) driver.setEmail(req.getEmail());
        if (req.getLicenceNumber() != null) driver.setLicenceNumber(req.getLicenceNumber());
        if (req.getLicenceClass()  != null) driver.setLicenceClass(req.getLicenceClass());
        if (req.getStatus()        != null) driver.setStatus(req.getStatus());

        // NIC status change — fire reminder if changed to NOT_PROVIDED
        if (req.getNicStatus() != null) {
            driver.setNicStatus(req.getNicStatus());
            if (req.getNicStatus() == NicStatus.NIC_NOT_PROVIDED) {
                notificationService.sendNicReminder(driver, agency);
            }
        }

        driver = driverRepository.save(driver);
        return toResponse(driver);
    }

    // ─────────────────────────────────────────────
    // Deactivate (soft-delete)
    // ─────────────────────────────────────────────

    @Transactional
    public String deactivateDriver(String agencyPhone, Long driverId) {
        Agency agency = getAgency(agencyPhone);
        Driver driver = driverRepository.findByIdAndAgencyId(driverId, agency.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Driver not found or does not belong to your agency."));

        driver.setStatus(DriverStatus.INACTIVE);
        driverRepository.save(driver);
        return "Driver " + driver.getFullName() + " has been deactivated.";
    }

    // ─────────────────────────────────────────────
    // Manual NIC reminder
    // ─────────────────────────────────────────────

    public String sendNicReminder(String agencyPhone, Long driverId) {
        Agency agency = getAgency(agencyPhone);
        Driver driver = driverRepository.findByIdAndAgencyId(driverId, agency.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Driver not found or does not belong to your agency."));

        notificationService.sendNicReminder(driver, agency);
        return "NIC reminder sent to " + driver.getFullName() + " (" + driver.getPhone() + ").";
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

    public DriverResponse toResponse(Driver driver) {
        String nicLabel = switch (driver.getNicStatus()) {
            case NIC_PROVIDED     -> "NIC Provided";
            case NIC_NOT_PROVIDED -> "NIC Not Yet Provided";
        };
        return DriverResponse.builder()
                .driverId(driver.getId())
                .agencyId(driver.getAgency().getId())
                .agencyName(driver.getAgency().getUser().getName())
                .fullName(driver.getFullName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .licenceNumber(driver.getLicenceNumber())
                .licenceClass(driver.getLicenceClass())
                .nicStatus(driver.getNicStatus())
                .nicStatusLabel(nicLabel)
                .status(driver.getStatus())
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();
    }
}
