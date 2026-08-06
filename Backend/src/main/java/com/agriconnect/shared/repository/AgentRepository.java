package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Agent;
import com.agriconnect.shared.enums.AgentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AgentRepository extends JpaRepository<Agent, Long> {
    // With @MapsId, agent.id == user.id — use findById(userId) directly
    Boolean existsByNicNumber(String nicNumber);
    List<Agent> findByStatus(AgentStatus status);

    @Query("SELECT a FROM Agent a ORDER BY a.averageRating DESC")
    List<Agent> findTopRated();
}
