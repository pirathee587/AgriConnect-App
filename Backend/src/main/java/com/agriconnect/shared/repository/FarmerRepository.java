package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Farmer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FarmerRepository extends JpaRepository<Farmer, Long> {
    // With @MapsId, farmer.id == user.id — use findById(userId) directly
}
