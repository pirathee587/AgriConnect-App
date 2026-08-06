package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Payment;
import com.agriconnect.shared.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByAgencyId(Long agencyId);
    List<Payment> findByAgencyIdOrderByCreatedAtDesc(Long agencyId);
    Optional<Payment> findByPaymentReference(String ref);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.agency.id = :agencyId AND p.status = 'SUCCESS'")
    Double getTotalPaidByAgency(@Param("agencyId") Long agencyId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'SUCCESS'")
    Double getTotalRevenue();
}