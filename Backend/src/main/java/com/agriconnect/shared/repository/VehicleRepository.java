package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Vehicle;
import com.agriconnect.shared.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findAllByAgencyId(Long agencyId);

    List<Vehicle> findAllByAgencyIdAndAvailabilityStatus(Long agencyId, VehicleStatus status);

    Optional<Vehicle> findByIdAndAgencyId(Long id, Long agencyId);

    /** System-wide uniqueness check for plate number */
    Optional<Vehicle> findByPlateNumber(String plateNumber);

    boolean existsByPlateNumber(String plateNumber);

    /** Admin use — all vehicles across all agencies */
    List<Vehicle> findAll();
}
