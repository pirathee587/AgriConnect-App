package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.AgentDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AgentDocumentRepository extends JpaRepository<AgentDocument, Long> {
    Optional<AgentDocument> findByAgentId(Long agentId);
}
