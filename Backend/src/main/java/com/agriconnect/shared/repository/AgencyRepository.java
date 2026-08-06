package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Agency;
import com.agriconnect.shared.enums.AgencyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AgencyRepository extends JpaRepository<Agency, Long> {
    boolean existsByNicNumber(String nicNumber);
    List<Agency> findByStatus(AgencyStatus status);
}
