package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.BankDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BankDetailRepository extends JpaRepository<BankDetail, Long> {
    Optional<BankDetail> findByFarmerId(Long farmerId);
}