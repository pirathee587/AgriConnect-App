package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Driver;
import com.agriconnect.shared.enums.DriverStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    List<Driver> findAllByAgencyId(Long agencyId);

    List<Driver> findAllByAgencyIdAndStatus(Long agencyId, DriverStatus status);

    Optional<Driver> findByIdAndAgencyId(Long id, Long agencyId);

    /** Admin use — all drivers across all agencies */
    List<Driver> findAll();
}
