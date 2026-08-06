package com.agriconnect.shared.repository;

import com.agriconnect.shared.entity.Booking;
import com.agriconnect.shared.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<Booking> findByPkgId(Long packageId);
    List<Booking> findByPkgAgencyId(Long agencyId);
    List<Booking> findByStatus(BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE b.pkg.agency.id = :agencyId AND b.status = :status")
    List<Booking> findByAgencyAndStatus(@Param("agencyId") Long agencyId,
                                        @Param("status") BookingStatus status);
    boolean existsByFarmerIdAndPkgIdAndStatusNot(Long farmerId, Long pkgId, BookingStatus status);
}
