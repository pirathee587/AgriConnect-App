package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Package;
import com.agriconnect.shared.enums.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findByAgencyId(Long agencyId);
    List<Package> findByStatus(PackageStatus status);

    @Query("SELECT p FROM Package p WHERE p.status = 'OPEN' AND p.travelDateTime > :now ORDER BY p.travelDateTime ASC")
    List<Package> findAllAvailable(@Param("now") LocalDateTime now);

    @Query("SELECT p FROM Package p WHERE p.status = 'OPEN' AND p.marketDestination = :market AND p.travelDateTime > :now")
    List<Package> findAvailableByMarket(@Param("market") String market, @Param("now") LocalDateTime now);

    /**
     * Checks if a driver is currently active on any package.
     * Used in AgencyAssignmentService to prevent double-assignment.
     *
     * Typical call: existsByDriverIdAndStatusIn(driverId, List.of(OPEN, FULL, IN_TRANSIT))
     * If true → reject with 400: "Driver is already assigned to an active package."
     *
     * Optionally pass excludePackageId to allow the current package to be excluded
     * (used during driver swap — current package should not count as a conflict).
     */
    boolean existsByDriverIdAndStatusIn(Long driverId, List<PackageStatus> statuses);

    /**
     * Same check but excludes a specific packageId.
     * Used during driver swap: we don't want the package being swapped to block the operation.
     */
    boolean existsByDriverIdAndStatusInAndIdNot(Long driverId, List<PackageStatus> statuses, Long excludePackageId);

    /**
     * Checks if a vehicle is currently assigned to any active package.
     * Used in AgencyVehicleService.removeVehicle() to block deletion.
     * If true → 409: "Vehicle is currently assigned to an active package."
     */
    boolean existsByVehicleIdAndStatusIn(Long vehicleId, List<PackageStatus> statuses);
}
