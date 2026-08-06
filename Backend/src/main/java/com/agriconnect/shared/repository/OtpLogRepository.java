package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.OtpLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Optional;

public interface OtpLogRepository extends JpaRepository<OtpLog, Long> {

    @Query("SELECT o FROM OtpLog o WHERE o.phone = :phone AND o.purpose = :purpose " +
            "AND o.isUsed = false AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    Optional<OtpLog> findActiveOtp(@Param("phone") String phone,
                                   @Param("purpose") String purpose,
                                   @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(o) FROM OtpLog o WHERE o.phone = :phone AND o.createdAt > :since")
    Long countRecentOtps(@Param("phone") String phone, @Param("since") LocalDateTime since);

    // Used during re-registration to clear old OTP records and reset rate-limit counter
    void deleteByPhone(String phone);
}