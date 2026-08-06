package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.AgencyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AgencyDocumentRepository extends JpaRepository<AgencyDocument, Long> {
    Optional<AgencyDocument> findByAgencyId(Long agencyId);
}
